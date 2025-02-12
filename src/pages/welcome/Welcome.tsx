import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { UserType } from "../../types/user";
import { TradingPreferences, WelcomeStep, WELCOME_STEPS } from "../../types/trading";
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
  const [currentStep, setCurrentStep] = useState<WelcomeStep>(WELCOME_STEPS.WELCOME);
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
  }, [user, navigate]);

  const handlePreferenceChange = (
    field: keyof TradingPreferences,
    value: TradingPreferences[keyof TradingPreferences]
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [field]: value,
    }));
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
      <div className="progress-bar">
        {STEPS.map((step, index) => (
          <div
            key={step.key}
            className={`progress-step ${getStepClassName(step.key)}`}
          >
            <div className="step-indicator">{index + 1}</div>
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
