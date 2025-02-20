import { useState, FormEvent } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import TextInput from '@/components/input/TextInput';
import Button from '@/components/input/Button';
import './Login.css';
import { UserType } from '@/types/user';

interface LocationState {
  from: {
    pathname: string;
  };
}

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, error, clearError, isAuthenticated, user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // If user is already authenticated, redirect to home
  if (isAuthenticated) {
    const redirectPath =
      user?.userType === UserType.COPIER && user?.isFirstLogin ? '/welcome' : '/feed';
    return <Navigate to={redirectPath} replace />;
  }

  const from = (location.state as LocationState)?.from?.pathname || '/';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      clearError();
      const user = await login(username, password);
      // Redirect to welcome page if it's a first-time copier user
      if (user?.userType === UserType.COPIER && user?.isFirstLogin) {
        navigate('/welcome', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch {
      // Error is handled by the auth context
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-content">
        <div className="login-branding">
          <div className="branding-content">
            <img
              src={`/champion_logo-${theme === 'dark' ? 'white' : 'blue'}.svg`}
              alt="Logo"
              className="logo"
            />
            <h1>Champion Social Trade</h1>
            <p>Connect with expert traders and copy their strategies</p>
          </div>
        </div>
        <div className="login-form-container">
          <div className="form-wrapper">
            <h2>Log in to your account</h2>
            <form className="login-form" onSubmit={handleSubmit}>
              {error && <div className="login-error">{error}</div>}
              <TextInput
                id="username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                disabled={isSubmitting}
                error={error ? ' ' : undefined}
                className="login-input"
              />
              <TextInput
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={isSubmitting}
                error={error ? ' ' : undefined}
                className="login-input"
              />
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                isLoading={isSubmitting}
                className="login-button"
              >
                Log in
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
