
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { theme } from '@/constants/theme';
import { Product } from '@/services/skinCareService';

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
  onToggleActive?: () => void;
}

const categoryIcons = {
  cleanser: 'cleaning-services',
  toner: 'opacity',
  serum: 'science',
  moisturizer: 'water-drop',
  sunscreen: 'wb-sunny',
  treatment: 'medical-services',
  other: 'category',
};

export default function ProductCard({ product, onPress, onToggleActive }: ProductCardProps) {
  const startDate = new Date(product.startDate);
  const daysUsed = Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <BlurView 
      intensity={20}
      style={[styles.container, !product.isActive && styles.inactive]}
    >
      <TouchableOpacity 
        style={styles.touchable}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <MaterialIcons 
            name={categoryIcons[product.category] as any} 
            size={24} 
            color={product.isActive ? theme.colors.primary : theme.colors.textLight} 
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={1}>
            {product.name}
          </Text>
          <Text style={styles.brand} numberOfLines={1}>
            {product.brand}
          </Text>
          <View style={styles.footer}>
            <Text style={styles.category}>{product.category}</Text>
            <Text style={styles.duration}>
              {daysUsed} {daysUsed === 1 ? 'day' : 'days'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.toggleButton} 
        onPress={(e) => {
          e.stopPropagation();
          onToggleActive?.();
        }}
      >
        <MaterialIcons 
          name={product.isActive ? 'check-circle' : 'radio-button-unchecked'} 
          size={24} 
          color={product.isActive ? theme.colors.success : theme.colors.textLight} 
        />
      </TouchableOpacity>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.glass,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    overflow: 'hidden',
  },
  inactive: {
    opacity: 0.5,
  },
  touchable: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  brand: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  category: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    textTransform: 'capitalize',
    fontWeight: theme.fontWeight.medium,
  },
  duration: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
  },
  toggleButton: {
    padding: theme.spacing.xs,
  },
});
