/**
 * CurrencyEditorPage.tsx - Page for editing currency settings
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CurrencyEditorView } from '../../SettingsDomain';
import { FormViewWrapper } from '../../UIComponents';
import { useConfigStore } from '../../stores';
import { paths } from '../../routes';

const CurrencyEditorPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Get data from stores with selectors for performance
  const countryIso = useConfigStore(state => state.countryIso);
  const setCountryIso = useConfigStore(state => state.setCountryIso);
  
  const handleClose = () => {
    navigate(paths.settings());
  };
  
  const handleSave = (newCountryIso: string) => {
    setCountryIso(newCountryIso);
    navigate(paths.settings());
  };
  
  return (
    <FormViewWrapper title="Seleccionar Moneda" onClose={handleClose}>
      <CurrencyEditorView
        currentCountryIso={countryIso}
        onSave={handleSave}
        onCancel={handleClose}
      />
    </FormViewWrapper>
  );
};

export default CurrencyEditorPage;
