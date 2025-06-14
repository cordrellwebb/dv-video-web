import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn } from './AuthService';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signIn(email, password);
      navigate('/waiting');
    } catch (e) {
      setError(e.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const goToRegister = () => {
    navigate('/register');
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleLogin} style={styles.form}>
        <h2>Login</h2>
        {error && <div style={styles.error}>{error}</div>}

        <input
          type="email"
          placeholder="Email"
          autoFocus
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Password"
          required
          minLength={6}
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={styles.input}
        />

        <button type="submit" style={styles.button} disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>

        <button
          type="button"
          onClick={goToRegister}
          style={{ ...styles.button, ...styles.secondaryButton }}
        >
          Create an account
        </button>
      </form>
    </div>
  );
}

// Simple inline styles for a clean look
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f5f6fa'
  },
  form: {
    background: '#fff',
    padding: 32,
    borderRadius: 8,
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    minWidth: 320,
    maxWidth: 360,
  },
  input: {
    marginBottom: 16,
    padding: 10,
    fontSize: 16,
    borderRadius: 4,
    border: '1px solid #ccc'
  },
  button: {
    padding: '10px 0',
    fontSize: 16,
    borderRadius: 4,
    border: 'none',
    marginBottom: 12,
    background: '#1976d2',
    color: '#fff',
    cursor: 'pointer'
  },
  secondaryButton: {
    background: '#e3eafc',
    color: '#1976d2'
  },
  error: {
    color: 'red',
    marginBottom: 12,
    fontWeight: 500,
  }
};