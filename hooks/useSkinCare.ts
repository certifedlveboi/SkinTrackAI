import { useState, useEffect, useCallback } from 'react';
import { skinCareService, SkinLog, Product } from '@/services/skinCareService';

export function useSkinCare() {
  const [logs, setLogs] = useState<SkinLog[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [logsData, productsData] = await Promise.all([
        skinCareService.getSkinLogs(),
        skinCareService.getProducts(),
      ]);
      setLogs(logsData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addLog = useCallback(async (log: Omit<SkinLog, 'id'>) => {
    const newLog = await skinCareService.addSkinLog(log);
    setLogs(prev => [newLog, ...prev]);
    return newLog;
  }, []);

  const updateLog = useCallback(async (id: string, updates: Partial<SkinLog>) => {
    await skinCareService.updateSkinLog(id, updates);
    setLogs(prev => prev.map(log => log.id === id ? { ...log, ...updates } : log));
  }, []);

  const deleteLog = useCallback(async (id: string) => {
    await skinCareService.deleteSkinLog(id);
    setLogs(prev => prev.filter(log => log.id !== id));
  }, []);

  const addProduct = useCallback(async (product: Omit<Product, 'id'>) => {
    const newProduct = await skinCareService.addProduct(product);
    setProducts(prev => [newProduct, ...prev]);
    return newProduct;
  }, []);

  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    await skinCareService.updateProduct(id, updates);
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    await skinCareService.deleteProduct(id);
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  return {
    logs,
    products,
    loading,
    addLog,
    updateLog,
    deleteLog,
    addProduct,
    updateProduct,
    deleteProduct,
    refresh: loadData,
  };
}
