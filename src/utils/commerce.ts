import type { Product, Transaction } from '../types';

/**
 * Returns top 3 products by frequency in past transactions or most recent
 * @param allProducts - Array of all available products
 * @param transactions - Array of transactions to analyze (passed from caller)
 * @returns Top 3 products sorted by usage frequency or recency
 */
export const getTopProducts = (allProducts: Product[], transactions: Transaction[] = []): Product[] => {
  try {
    const productFrequency: Record<string, number> = {};
    
    transactions.forEach((t) => {
      if (t.items && Array.isArray(t.items)) {
        t.items.forEach((item) => {
          productFrequency[item.productId] = (productFrequency[item.productId] || 0) + 1;
        });
      }
    });

    if (Object.keys(productFrequency).length > 0) {
      return [...allProducts]
        .sort((a, b) => (productFrequency[b.id] || 0) - (productFrequency[a.id] || 0))
        .slice(0, 3);
    }

    return [...allProducts]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
  } catch (error) {
    return allProducts.slice(0, 3);
  }
};
