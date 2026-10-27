import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../store/useAuthStore';

export const LoginPage = ({ onSwitchToRegister, onSuccess }) => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  const { login, isLoading, error, clearError } = useAuthStore();

  const handleSuccess = () => {
    if (onSuccess) onSuccess();
    else navigate('/');
  };

  const handleSwitch = () => {
    if (onSwitchToRegister) onSwitchToRegister();
    else navigate('/register');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    clearError();

    if (!identifier.trim()) {
      setFormError('Please enter your username or email');
      return;
    }

    if (!password) {
      setFormError('Please enter your password');
      return;
    }

    try {
      await login({
        usernameOrEmail: identifier.trim(),
        password,
      });
      handleSuccess();
    } catch {
      // error handled in authStore
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6 pt-4">
      <div className="text-center space-y-2">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#69923e] text-2xl text-white font-bold shadow-lg">
          ♞
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Sign In to Chess Arena</h1>
        <p className="text-xs text-gray-400">
          Enter your credentials to access your profile and games
        </p>
      </div>

      <Card elevated className="space-y-5">
        {(formError || error) && (
          <div className="rounded-lg border border-red-800/80 bg-red-950/40 p-3 text-xs text-red-300">
            ⚠️ {formError || error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Username or Email"
            type="text"
            placeholder="e.g. grandmaster_alex or user@domain.com"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            disabled={isLoading}
            autoComplete="username"
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            autoComplete="current-password"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            isLoading={isLoading}
          >
            Sign In
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-[#262c3b] text-xs text-gray-400">
          Don't have an account yet?{' '}
          <button
            type="button"
            onClick={handleSwitch}
            className="font-semibold text-[#7FB069] hover:underline"
          >
            Create an Account
          </button>
        </div>
      </Card>
    </div>
  );
};
