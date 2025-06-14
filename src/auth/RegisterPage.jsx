import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from './AuthService';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register(email, password);
      navigate('/waiting');
    } catch (e) {
      setError(e.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const goToLogin = () => {
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleRegister} style={styles.form}>
        <h2>Register</h2>
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
          placeholder="Password (min 6 characters)"
          required
          minLength={6}
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={styles.input}
        />

        <button type="submit" style={styles.button} disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Register'}
        </button>

        <button
          type="button"
          onClick={goToLogin}
          style={{ ...styles.button, ...styles.secondaryButton }}
        >
          Already have an account? Login
        </button>
      </form>
    </div>
  );
}

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