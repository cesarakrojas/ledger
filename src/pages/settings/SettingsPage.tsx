/**
 * SettingsPage.tsx - Main settings page
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SettingsView } from '../../SettingsDomain';
import { useConfigStore } from '../../stores';
import { paths } from '../../routes';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Get data from stores with selectors for performance
  const isDarkMode = useConfigStore(state => state.isDarkMode);
  const toggleTheme = useConfigStore(state => state.toggleTheme);
  const countryIso = useConfigStore(state => state.countryIso);
  const paymentMethods = useConfigStore(state => state.paymentMethods);
  
  return (
    <SettingsView
      isDarkMode={isDarkMode}
      onToggleTheme={toggleTheme}
      countryIso={countryIso}
      onEditCurrency={() => navigate(paths.settingsCurrency())}
      onEditCategories={() => navigate(paths.settingsCategories())}
      onEditPaymentMethods={() => navigate(paths.settingsPaymentMethods())}
      paymentMethods={paymentMethods}
    />
  );
};

export default SettingsPage;
