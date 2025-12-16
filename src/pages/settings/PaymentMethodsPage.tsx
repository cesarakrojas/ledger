/**
 * PaymentMethodsPage.tsx - Page for editing payment methods
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PaymentMethodsEditorView } from '../../SettingsDomain';
import { FormViewWrapper } from '../../UIComponents';
import { useConfigStore } from '../../stores';
import { paths } from '../../routes';

const PaymentMethodsPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Get data from stores with selectors for performance
  const paymentMethods = useConfigStore(state => state.paymentMethods);
  const setPaymentMethods = useConfigStore(state => state.setPaymentMethods);
  
  const handleClose = () => {
    navigate(paths.settings());
  };
  
  const handleSave = (methods: string[]) => {
    setPaymentMethods(methods);
    navigate(paths.settings());
  };
  
  return (
    <FormViewWrapper title="Editar Métodos de Pago" onClose={handleClose}>
      <PaymentMethodsEditorView
        paymentMethods={paymentMethods}
        onSave={handleSave}
        onCancel={handleClose}
      />
    </FormViewWrapper>
  );
};

export default PaymentMethodsPage;
