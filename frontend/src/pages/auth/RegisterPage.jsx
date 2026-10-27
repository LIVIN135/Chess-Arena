import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../store/useAuthStore';

export const RegisterPage = ({ onSwitchToLogin, onSuccess }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');

  const { register, isLoading, error, clearError } = useAuthStore();

  const handleSuccess = () => {
    if (onSuccess) onSuccess();
    else navigate('/');
  };

  const handleSwitch = () => {
    if (onSwitchToLogin) onSwitchToLogin();
    else navigate('/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    clearError();

    if (!username.trim() || username.trim().length < 3) {
      setFormError('Username must be at least 3 characters long');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      setFormError('Username can only contain letters, numbers, and underscores');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setFormError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    try {
      await register({
        username: username.trim(),
        email: email.trim(),
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
        <h1 className="text-2xl font-bold tracking-tight text-white">Join Chess Arena</h1>
        <p className="text-xs text-gray-400">
          Create an account to build your rating and track your match history
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
            label="Username"
            type="text"
            placeholder="e.g. magnus_c"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
            autoComplete="username"
            helperText="3 to 30 characters (letters, numbers, underscores)"
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="player@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            autoComplete="new-password"
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Repeat password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            autoComplete="new-password"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            isLoading={isLoading}
          >
            Create Account
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-[#262c3b] text-xs text-gray-400">
          Already have an account?{' '}
          <button
            type="button"
            onClick={handleSwitch}
            className="font-semibold text-[#7FB069] hover:underline"
          >
            Sign In Instead
          </button>
        </div>
      </Card>
    </div>
  );
};
