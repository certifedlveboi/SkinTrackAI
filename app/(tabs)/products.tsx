import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { theme } from '@/constants/theme';
import { useSkinCare } from '@/hooks/useSkinCare';
import ProductCard from '@/components/ProductCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Product } from '@/services/skinCareService';

const PRODUCT_CATEGORIES = [
  { value: 'cleanser', label: 'Cleanser' },
  { value: 'toner', label: 'Toner' },
  { value: 'serum', label: 'Serum' },
  { value: 'moisturizer', label: 'Moisturizer' },
  { value: 'sunscreen', label: 'Sunscreen' },
  { value: 'treatment', label: 'Treatment' },
  { value: 'other', label: 'Other' },
] as const;

export default function ProductsScreen() {
  const insets = useSafeAreaInsets();
  const { products, addProduct, updateProduct, loading } = useSkinCare();
  const [modalVisible, setModalVisible] = useState(false);
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState<Product['category']>('moisturizer');
  const [notes, setNotes] = useState('');

  const productsByCategory = React.useMemo(() => {
    const active = products.filter(p => p.isActive);
    const grouped: Record<string, typeof products> = {};
    active.forEach(product => {
      if (!grouped[product.category]) {
        grouped[product.category] = [];
      }
      grouped[product.category].push(product);
    });
    return grouped;
  }, [products]);

  const activeProducts = products.filter(p => p.isActive);
  const inactiveProducts = products.filter(p => !p.isActive);

  const handleAddProduct = async () => {
    if (!productName.trim() || !brand.trim()) return;

    try {
      await addProduct({
        name: productName.trim(),
        brand: brand.trim(),
        category,
        startDate: new Date().toISOString(),
        isActive: true,
        notes: notes.trim(),
      });
      setModalVisible(false);
      setProductName('');
      setBrand('');
      setCategory('moisturizer');
      setNotes('');
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleToggleActive = async (product: Product) => {
    await updateProduct(product.id, { isActive: !product.isActive });
  };

  return (
    <LinearGradient
      colors={[theme.colors.backgroundGradientStart, theme.colors.backgroundGradientEnd]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <MaterialIcons name="inventory-2" size={32} color={theme.colors.tertiary} />
          <View style={styles.headerText}>
            <Text style={styles.title}>My Products</Text>
            <Text style={styles.subtitle}>
              {activeProducts.length} active • {inactiveProducts.length} archived
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.addButtonGradient}
          >
            <MaterialIcons name="add" size={24} color={theme.colors.text} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {activeProducts.length > 0 ? (
          <>
            {/* Active Products by Category */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Active Routine</Text>
                <BlurView intensity={20} style={styles.countBadge}>
                  <Text style={styles.countText}>{activeProducts.length}</Text>
                </BlurView>
              </View>
              {Object.entries(productsByCategory).map(([category, categoryProducts]) => (
                <View key={category} style={styles.categoryGroup}>
                  <View style={styles.categoryHeader}>
                    <MaterialIcons 
                      name="label" 
                      size={16} 
                      color={theme.colors.primary} 
                    />
                    <Text style={styles.categoryTitle}>{category.toUpperCase()}</Text>
                    <View style={styles.categoryLine} />
                  </View>
                  {categoryProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onToggleActive={() => handleToggleActive(product)}
                    />
                  ))}
                </View>
              ))}
            </View>
          </>
        ) : (
          <BlurView intensity={20} style={styles.emptyCard}>
            <View style={styles.emptyIconContainer}>
              <MaterialIcons name="inventory-2" size={48} color={theme.colors.tertiary} />
            </View>
            <Text style={styles.emptyTitle}>No Products Added</Text>
            <Text style={styles.emptySubtitle}>
              Start building your skincare routine by adding the products you use daily.
            </Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => setModalVisible(true)}
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.emptyButtonGradient}
              >
                <MaterialIcons name="add" size={20} color={theme.colors.text} />
                <Text style={styles.emptyButtonText}>Add First Product</Text>
              </LinearGradient>
            </TouchableOpacity>
          </BlurView>
        )}

        {inactiveProducts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Archived</Text>
              <BlurView intensity={20} style={styles.countBadge}>
                <Text style={styles.countText}>{inactiveProducts.length}</Text>
              </BlurView>
            </View>
            {inactiveProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onToggleActive={() => handleToggleActive(product)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Product</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Product Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., CeraVe Hydrating Cleanser"
                placeholderTextColor={theme.colors.textLight}
                value={productName}
                onChangeText={setProductName}
              />

              <Text style={styles.label}>Brand *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., CeraVe"
                placeholderTextColor={theme.colors.textLight}
                value={brand}
                onChangeText={setBrand}
              />

              <Text style={styles.label}>Category</Text>
              <View style={styles.categoriesGrid}>
                {PRODUCT_CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat.value}
                    style={[
                      styles.categoryChip,
                      category === cat.value && styles.categoryChipSelected,
                    ]}
                    onPress={() => setCategory(cat.value)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        category === cat.value && styles.categoryChipTextSelected,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Notes (Optional)</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Any notes about this product..."
                placeholderTextColor={theme.colors.textLight}
                multiline
                numberOfLines={3}
                value={notes}
                onChangeText={setNotes}
                textAlignVertical="top"
              />

              <TouchableOpacity 
                style={[
                  styles.saveButton,
                  (!productName.trim() || !brand.trim()) && styles.saveButtonDisabled
                ]}
                onPress={handleAddProduct}
                disabled={!productName.trim() || !brand.trim()}
              >
                <Text style={styles.saveButtonText}>Add Product</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    flex: 1,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  addButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  countBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    backgroundColor: theme.colors.glass,
    borderRadius: theme.borderRadius.round,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    minWidth: 36,
    alignItems: 'center',
    overflow: 'hidden',
  },
  countText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  categoryGroup: {
    marginBottom: theme.spacing.lg,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  categoryTitle: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    letterSpacing: 1,
  },
  categoryLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.divider,
  },
  emptyCard: {
    backgroundColor: theme.colors.glass,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    overflow: 'hidden',
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.tertiary + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
  emptyButton: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  emptyButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: theme.colors.overlay,
  },
  modalContent: {
    backgroundColor: theme.colors.backgroundGradientStart,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    maxHeight: '90%',
    borderTopWidth: 1,
    borderColor: theme.colors.glassBorder,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  label: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  input: {
    backgroundColor: theme.colors.glass,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
  },
  categoryChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryChipText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.medium,
  },
  categoryChipTextSelected: {
    color: theme.colors.surface,
  },
  notesInput: {
    backgroundColor: theme.colors.glass,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    minHeight: 80,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.surface,
  },
});
