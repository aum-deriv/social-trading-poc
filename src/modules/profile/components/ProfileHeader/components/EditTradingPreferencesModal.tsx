import React from 'react';
import type { TradingPreferences } from '@/types/trading';
import { PreferencesStep } from '@/pages/welcome/components/steps/PreferencesStep';
import { RiskStep } from '@/pages/welcome/components/steps/RiskStep';
import FullscreenModal from '@/components/modal/FullscreenModal';
import { useAuth } from '@/context/AuthContext';

const useUpdateTradingPreferences = () => {
  const { user, updateUser } = useAuth();

  const updateTradingPreferences = async (preferences: TradingPreferences) => {
    if (!user?.id) {
      throw new Error('User ID is required to update trading preferences');
    }

    try {
      // Save preferences to backend
      await fetch(`${import.meta.env.VITE_JSON_SERVER_URL}/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tradingPreferences: preferences }),
      });

      // Update local storage and auth context
      const authData = localStorage.getItem('auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        parsed.user.tradingPreferences = preferences;
        localStorage.setItem('auth', JSON.stringify(parsed));
      }

      // Update auth context if updateUser is available
      if (updateUser) {
        updateUser({
          ...user,
          tradingPreferences: preferences,
        });
      }
    } catch (error) {
      console.error('Error updating trading preferences:', error);
      throw error;
    }
  };

  return { updateTradingPreferences };
};

interface EditTradingPreferencesModalProps {
  preferences: TradingPreferences;
  onSave: (preferences: TradingPreferences) => void;
  onClose: () => void;
}

const EditTradingPreferencesModal: React.FC<EditTradingPreferencesModalProps> = ({
  preferences,
  onSave,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = React.useState<'preferences' | 'risk'>('preferences');
  const [updatedPreferences, setUpdatedPreferences] = React.useState(preferences);
  const { updateTradingPreferences } = useUpdateTradingPreferences();

  const handlePreferenceChange = (
    field: keyof TradingPreferences,
    value: TradingPreferences[keyof TradingPreferences]
  ) => {
    setUpdatedPreferences(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSavePreferences = async () => {
    try {
      await updateTradingPreferences(updatedPreferences);
      onSave(updatedPreferences);
      onClose();
    } catch (error) {
      console.error('Error saving preferences:', error);
      // Here you might want to show an error message to the user
    }
  };

  const handleNext = async () => {
    if (currentStep === 'preferences') {
      setCurrentStep('risk');
    } else {
      await handleSavePreferences();
    }
  };

  return (
    <FullscreenModal
      isOpen={true}
      onClose={onClose}
      title={`Edit ${currentStep === 'preferences' ? 'Trading Preferences' : 'Risk Settings'}`}
    >
      {currentStep === 'preferences' ? (
        <PreferencesStep
          preferences={updatedPreferences}
          handlePreferenceChange={handlePreferenceChange}
          onNext={handleNext}
        />
      ) : (
        <RiskStep
          preferences={updatedPreferences}
          handlePreferenceChange={handlePreferenceChange}
          onNext={handleNext}
          buttonText="Save"
        />
      )}
    </FullscreenModal>
  );
};

export default EditTradingPreferencesModal;
