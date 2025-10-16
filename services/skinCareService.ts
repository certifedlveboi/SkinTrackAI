import AsyncStorage from '@react-native-async-storage/async-storage';

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

const SKIN_LOGS_KEY = '@skincare_logs';
const PRODUCTS_KEY = '@skincare_products';

export const skinCareService = {
  // Skin Logs
  async getSkinLogs(): Promise<SkinLog[]> {
    try {
      const data = await AsyncStorage.getItem(SKIN_LOGS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading skin logs:', error);
      return [];
    }
  },

  async addSkinLog(log: Omit<SkinLog, 'id'>): Promise<SkinLog> {
    try {
      const logs = await this.getSkinLogs();
      const newLog: SkinLog = {
        ...log,
        id: Date.now().toString(),
      };
      logs.unshift(newLog);
      await AsyncStorage.setItem(SKIN_LOGS_KEY, JSON.stringify(logs));
      return newLog;
    } catch (error) {
      console.error('Error adding skin log:', error);
      throw error;
    }
  },

  async updateSkinLog(id: string, updates: Partial<SkinLog>): Promise<void> {
    try {
      const logs = await this.getSkinLogs();
      const index = logs.findIndex(log => log.id === id);
      if (index !== -1) {
        logs[index] = { ...logs[index], ...updates };
        await AsyncStorage.setItem(SKIN_LOGS_KEY, JSON.stringify(logs));
      }
    } catch (error) {
      console.error('Error updating skin log:', error);
      throw error;
    }
  },

  async deleteSkinLog(id: string): Promise<void> {
    try {
      const logs = await this.getSkinLogs();
      const filtered = logs.filter(log => log.id !== id);
      await AsyncStorage.setItem(SKIN_LOGS_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting skin log:', error);
      throw error;
    }
  },

  // Products
  async getProducts(): Promise<Product[]> {
    try {
      const data = await AsyncStorage.getItem(PRODUCTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading products:', error);
      return [];
    }
  },

  async addProduct(product: Omit<Product, 'id'>): Promise<Product> {
    try {
      const products = await this.getProducts();
      const newProduct: Product = {
        ...product,
        id: Date.now().toString(),
      };
      products.unshift(newProduct);
      await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
      return newProduct;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    try {
      const products = await this.getProducts();
      const index = products.findIndex(p => p.id === id);
      if (index !== -1) {
        products[index] = { ...products[index], ...updates };
        await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
      }
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  async deleteProduct(id: string): Promise<void> {
    try {
      const products = await this.getProducts();
      const filtered = products.filter(p => p.id !== id);
      await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },
};
