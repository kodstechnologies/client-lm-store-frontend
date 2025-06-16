import React from 'react';
import { useLocation } from 'react-router-dom';
import MerchantProtected from '../components/Protected/MerchantProtected';
import EligibilityCheckPage from '../components/Merchant/EligibilityCheckPage';

const CreateOrderFormWrapper: React.FC = () => {
  const location = useLocation();
  return (
    <MerchantProtected>
      <EligibilityCheckPage key={location.key} />
    </MerchantProtected>
  );
};

export default CreateOrderFormWrapper;
