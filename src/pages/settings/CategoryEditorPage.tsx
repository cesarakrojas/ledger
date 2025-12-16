/**
 * CategoryEditorPage.tsx - Page for editing category settings
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryEditorView } from '../../SettingsDomain';
import { FormViewWrapper } from '../../UIComponents';
import { useConfigStore, useTransactionStore, useDebtStore, useInventoryStore, useUIStore } from '../../stores';
import { paths } from '../../routes';
import type { CategoryConfig } from '../../SharedDefs';

const CategoryEditorPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Get data from stores with selectors for performance
  const categoryConfig = useConfigStore(state => state.categoryConfig);
  const setCategoryConfig = useConfigStore(state => state.setCategoryConfig);
  
  const loadTransactions = useTransactionStore(state => state.loadTransactions);
  const migrateTransactionCategory = useTransactionStore(state => state.migrateCategoryName);
  
  const loadDebts = useDebtStore(state => state.loadDebts);
  const migrateDebtCategory = useDebtStore(state => state.migrateCategoryName);
  
  const loadProducts = useInventoryStore(state => state.loadProducts);
  const migrateProductCategory = useInventoryStore(state => state.migrateCategoryName);
  
  const showSuccessModal = useUIStore(state => state.showSuccessModal);
  
  const handleClose = () => {
    navigate(paths.settings());
  };
  
  const handleSave = (
    inflowCategories: string[], 
    outflowCategories: string[], 
    renames: Array<{ oldName: string; newName: string }>
  ) => {
    // Perform category migrations if any renames detected
    let totalUpdated = 0;
    
    if (renames.length > 0) {
      renames.forEach(({ oldName, newName }) => {
        const transactionsUpdated = migrateTransactionCategory(oldName, newName);
        const debtsUpdated = migrateDebtCategory(oldName, newName);
        const productsUpdated = migrateProductCategory(oldName, newName);
        
        totalUpdated += transactionsUpdated + debtsUpdated + productsUpdated;
      });
    }
    
    // Save the new category configuration
    const newConfig: CategoryConfig = {
      ...categoryConfig,
      inflowCategories,
      outflowCategories
    };
    setCategoryConfig(newConfig);
    
    // Reload all data to reflect changes
    loadTransactions();
    loadDebts();
    loadProducts();
    
    // Show success message if categories were migrated
    if (totalUpdated > 0) {
      showSuccessModal(
        'Categorías Actualizadas',
        `Categorías guardadas y ${totalUpdated} registro${totalUpdated > 1 ? 's actualizados' : ' actualizado'}`,
        'inflow'
      );
    }
    
    navigate(paths.settings());
  };
  
  return (
    <FormViewWrapper title="Editar Categorías" onClose={handleClose}>
      <CategoryEditorView
        inflowCategories={categoryConfig.inflowCategories}
        outflowCategories={categoryConfig.outflowCategories}
        onSave={handleSave}
        onCancel={handleClose}
      />
    </FormViewWrapper>
  );
};

export default CategoryEditorPage;
