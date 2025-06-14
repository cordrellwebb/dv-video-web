import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './auth/LoginPage';
import RegisterPage from './auth/RegisterPage';
import WaitingRoomPage from './waitingroom/WaitingRoomPage';
import VideoCallPage from './videocall/VideoCallPage';
import { subscribeToAuthChanges } from './auth/AuthService';

export default function App() {
  const [user, setUser] = useState(undefined); // undefined = loading, null = not signed in, else user object

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = subscribeToAuthChanges((firebaseUser) => {
      setUser(firebaseUser || null);
    });
    return () => unsubscribe();
  }, []);

  if (user === undefined) {
    // Still checking auth
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          fontSize: 22,
          color: '#1976d2'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/waiting" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/waiting" replace /> : <RegisterPage />}
        />
        <Route
          path="/waiting"
          element={user ? <WaitingRoomPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/video-call/:roomId"
          element={user ? <VideoCallPage /> : <Navigate to="/login" replace />}
        />
        {/* Default route */}
        <Route
          path="*"
          element={<Navigate to={user ? "/waiting" : "/login"} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}