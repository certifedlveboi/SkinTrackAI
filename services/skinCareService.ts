import { getSupabaseClient } from '@/template';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { decode } from 'base64-arraybuffer';

export interface SkinLog {
  id: string;
  date: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  concerns: string[];
  notes: string;
  photoUri: string;
  skinScore: number;
  analysis?: {
    skinType: string;
    detectedFeatures: Record<string, number>;
    recommendations: string[];
  };
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: 'cleanser' | 'toner' | 'serum' | 'moisturizer' | 'sunscreen' | 'treatment' | 'other';
  startDate: string;
  isActive: boolean;
  notes?: string;
}

const supabase = getSupabaseClient();

export const skinCareService = {
  // Helper function to upload photo to storage
  async uploadPhoto(uri: string, userId: string): Promise<string> {
    try {
      const timestamp = Date.now();
      const fileName = `${userId}/${timestamp}.jpg`;

      let photoData: string | ArrayBuffer;

      if (Platform.OS === 'web') {
        // Web: use fetch + blob
        const response = await fetch(uri);
        const blob = await response.blob();
        photoData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(decode(base64));
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        }) as ArrayBuffer;
      } else {
        // Mobile: use base64-arraybuffer conversion
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        photoData = decode(base64);
      }

      const { data, error } = await supabase.storage
        .from('skin-photos')
        .upload(fileName, photoData, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      // Get public URL
      // Return the file path, we'll generate signed URLs when retrieving
      return fileName;
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  },

  // Skin Logs
  async getSkinLogs(): Promise<SkinLog[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No authenticated user');
        return [];
      }

      const { data, error } = await supabase
        .from('skin_analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching skin logs:', error);
        return [];
      }

      // Generate signed URLs for photos (valid for 1 hour)
      const logsWithSignedUrls = await Promise.all(
        (data || []).map(async (item) => {
          let photoUri = item.photo_url;
          
          // If photo_url is a storage path (not a full URL), generate signed URL
          if (photoUri && !photoUri.startsWith('http')) {
            const { data: signedUrlData, error: signedUrlError } = await supabase.storage
              .from('skin-photos')
              .createSignedUrl(photoUri, 3600); // 1 hour expiry
            
            if (signedUrlError) {
              console.error('Error creating signed URL:', signedUrlError);
            } else if (signedUrlData?.signedUrl) {
              photoUri = signedUrlData.signedUrl;
            }
          }
          
          return {
            id: item.id,
            date: item.created_at,
            condition: item.condition,
            concerns: item.concerns || [],
            notes: item.notes || '',
            photoUri,
            skinScore: item.skin_score,
            analysis: item.analysis_data,
          };
        })
      );

      return logsWithSignedUrls;
    } catch (error) {
      console.error('Error loading skin logs:', error);
      return [];
    }
  },

  async addSkinLog(log: Omit<SkinLog, 'id'>): Promise<SkinLog> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Uploading photo...');
      // Upload photo to storage and get the file path
      const photoPath = await this.uploadPhoto(log.photoUri, user.id);
      console.log('Photo uploaded to path:', photoPath);

      const { data, error } = await supabase
        .from('skin_analyses')
        .insert({
          user_id: user.id,
          photo_url: photoPath,
          skin_score: log.skinScore,
          condition: log.condition,
          concerns: log.concerns,
          notes: log.notes,
          analysis_data: log.analysis,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding skin log to database:', error);
        throw error;
      }

      console.log('Skin log saved to database');

      // Generate signed URL for immediate use
      const { data: signedUrlData } = await supabase.storage
        .from('skin-photos')
        .createSignedUrl(photoPath, 3600);

      return {
        id: data.id,
        date: data.created_at,
        condition: data.condition,
        concerns: data.concerns || [],
        notes: data.notes || '',
        photoUri: signedUrlData?.signedUrl || photoPath,
        skinScore: data.skin_score,
        analysis: data.analysis_data,
      };
    } catch (error) {
      console.error('Error adding skin log:', error);
      throw error;
    }
  },

  async updateSkinLog(id: string, updates: Partial<SkinLog>): Promise<void> {
    try {
      const updateData: any = {};
      
      if (updates.condition) updateData.condition = updates.condition;
      if (updates.concerns) updateData.concerns = updates.concerns;
      if (updates.notes !== undefined) updateData.notes = updates.notes;
      if (updates.skinScore) updateData.skin_score = updates.skinScore;
      if (updates.analysis) updateData.analysis_data = updates.analysis;

      const { error } = await supabase
        .from('skin_analyses')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating skin log:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error updating skin log:', error);
      throw error;
    }
  },

  async deleteSkinLog(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('skin_analyses')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting skin log:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error deleting skin log:', error);
      throw error;
    }
  },

  // Products - keeping local storage for now
  async getProducts(): Promise<Product[]> {
    // TODO: Implement products table in backend
    return [];
  },

  async addProduct(product: Omit<Product, 'id'>): Promise<Product> {
    // TODO: Implement products table in backend
    return {
      ...product,
      id: Date.now().toString(),
    };
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    // TODO: Implement products table in backend
  },

  async deleteProduct(id: string): Promise<void> {
    // TODO: Implement products table in backend
  },
};
