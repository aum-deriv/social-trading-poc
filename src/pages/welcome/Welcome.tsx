import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { UserType } from "../../types/user";
import {
  TradingPreferences,
  WelcomeStep,
  WELCOME_STEPS,
} from "../../types/trading";
import StepContent from "./components/StepContent";
import "./Welcome.css";

const STEPS = [
  {
    key: WELCOME_STEPS.WELCOME,
    title: "Welcome to Champion Social Trade",
    description: "Learn about our copy trading platform",
  },
  {
    key: WELCOME_STEPS.PREFERENCES,
    title: "Trading Preferences",
    description: "Help us personalize your trading experience",
  },
  {
    key: WELCOME_STEPS.RISK,
    title: "Risk Management",
    description: "Set your trading limits",
  },
] as const;

const Welcome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<WelcomeStep>(
    WELCOME_STEPS.WELCOME
  );
  const [preferences, setPreferences] = useState<TradingPreferences>({
    riskTolerance: "medium",
    investmentStyle: "moderate",
    preferredMarkets: [],
    preferredTradeTypes: [],
    tradingFrequency: "weekly",
    maxDrawdown: 20,
    targetReturn: 15,
    minStake: 10,
    maxStake: 100,
  });

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    if (user.userType !== UserType.COPIER || user.isFirstLogin !== true) {
      navigate("/feed", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePreferenceChange = (
    field: keyof TradingPreferences,
    value: TradingPreferences[keyof TradingPreferences]
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleGetStarted = async () => {
    try {
      // Here you would typically make an API call to update user's isFirstLogin status
      await fetch(`http://localhost:3001/users/${user?.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isFirstLogin: false,
          tradingPreferences: preferences,
        }),
      });

      // Update local storage to reflect the change
      const authData = localStorage.getItem("auth");
      if (authData) {
        const parsed = JSON.parse(authData);
        parsed.user.isFirstLogin = false;
        parsed.user.tradingPreferences = preferences;
        localStorage.setItem("auth", JSON.stringify(parsed));
      }
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  const handleNext = () => {
    switch (currentStep) {
      case WELCOME_STEPS.WELCOME:
        setCurrentStep(WELCOME_STEPS.PREFERENCES);
        break;
      case WELCOME_STEPS.PREFERENCES:
        setCurrentStep(WELCOME_STEPS.RISK);
        break;
      case WELCOME_STEPS.RISK:
      default:
        handleGetStarted();
        navigate("/feed", { replace: true });
        break;
    }
  };

  const isStepCompleted = (stepKey: WelcomeStep) => {
    const currentStepIndex = STEPS.findIndex(
      (step) => step.key === currentStep
    );
    const stepIndex = STEPS.findIndex((step) => step.key === stepKey);
    return stepIndex < currentStepIndex;
  };

  const getStepClassName = (stepKey: WelcomeStep) => {
    if (stepKey === currentStep) return "active";
    if (isStepCompleted(stepKey)) return "completed";
    return "";
  };

  if (!user) return null;

  return (
    <div className="welcome-page">
      <div className={`progress-bar step-${currentStep}`}>
        {STEPS.map((step, index) => (
          <div
            key={step.key}
            className={`progress-step ${getStepClassName(step.key)}`}
          >
            <div className="step-indicator">
              {isStepCompleted(step.key) ? "✓" : index + 1}
            </div>
            <div className="step-details">
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="welcome-content">
        <StepContent
          currentStep={currentStep}
          preferences={preferences}
          handlePreferenceChange={handlePreferenceChange}
          onNext={handleNext}
        />
      </div>
    </div>
  );
};

export default Welcome;
