import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createRoomIfNotExists,
  seatsStream,
  takeSeat,
  releaseSeat,
} from '../firestore/FirestoreService';
import { getCurrentUser, getCurrentUserId } from '../auth/AuthService';

// Minimal Seat UI component
function Seat({ label, occupiedBy, isCurrentUser, onTakeOrRelease }) {
  let seatColor, statusText;
  if (isCurrentUser) {
    seatColor = '#43a047'; // green
    statusText = "You";
  } else if (occupiedBy) {
    seatColor = '#e53935'; // red
    statusText = "Taken";
  } else {
    seatColor = '#ddd';
    statusText = "Available";
  }

  return (
    <div
      style={{
        background: seatColor,
        borderRadius: 16,
        boxShadow: '0 2px 8px #0001',
        padding: 24,
        cursor: (!occupiedBy || isCurrentUser) ? 'pointer' : 'not-allowed',
        textAlign: 'center',
        minHeight: 120,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={(!occupiedBy || isCurrentUser) ? onTakeOrRelease : undefined}
    >
      <div style={{ fontSize: 32, marginBottom: 8 }}>💺</div>
      <div style={{ fontWeight: 'bold', fontSize: 18 }}>{label}</div>
      <div style={{ color: '#222', fontSize: 13 }}>{statusText}</div>
    </div>
  );
}

export default function WaitingRoomPage() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const userId = getCurrentUserId();

  const [roomInput, setRoomInput] = useState('DV_VidRoom');
  const [roomId, setRoomId] = useState(null);
  const [seats, setSeats] = useState({
    seat_1: null,
    seat_2: null,
    seat_3: null,
    seat_4: null
  });
  const [isLoading, setIsLoading] = useState(false);

  // Set up seat listeners when room is set
  useEffect(() => {
    if (!roomId) return;
    let unsubscribe;
    setIsLoading(true);

    // Make sure room exists
    createRoomIfNotExists(roomId).then(() => {
      // Listen to seats
      unsubscribe = seatsStream(roomId, (querySnapshot) => {
        const newSeats = {
          seat_1: null,
          seat_2: null,
          seat_3: null,
          seat_4: null,
        };
        querySnapshot.forEach(doc => {
          const data = doc.data();
          if (data && doc.id.startsWith('seat_')) {
            newSeats[doc.id] = data.userId;
          }
        });
        setSeats(newSeats);

        // If all 4 seats are filled, navigate to video call
        const takenSeats = Object.values(newSeats).filter(Boolean).length;
        if (takenSeats === 4) {
          navigate(`/video-call/${roomId}`);
        }
      });
      setIsLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [roomId, navigate]);

  // Helper: user display name fallback
  const userName = user && (user.displayName || user.email || user.uid);

  // Handle seat click (take or release)
  const handleSeatClick = async (seatKey) => {
    const seatOccupiedBy = seats[seatKey];
    if (!seatOccupiedBy) {
      setIsLoading(true);
      await takeSeat({
        roomId,
        seatNumber: parseInt(seatKey.replace('seat_', '')),
        userId,
        userName,
      });
      setIsLoading(false);
    } else if (seatOccupiedBy === userId) {
      setIsLoading(true);
      await releaseSeat({
        roomId,
        seatNumber: parseInt(seatKey.replace('seat_', ''))
      });
      setIsLoading(false);
    }
  };

  // Leave room and release any held seat
  const handleLeaveRoom = async () => {
    // Release any seat occupied by current user
    Object.entries(seats).forEach(([seatKey, seatUserId]) => {
      if (seatUserId === userId) {
        releaseSeat({
          roomId,
          seatNumber: parseInt(seatKey.replace('seat_', ''))
        });
      }
    });
    setRoomId(null);
  };

  // Log out
  const handleLogout = async () => {
    // Optional: release seat on logout
    handleLeaveRoom();
    // Remove Firebase session (redirects to login)
    await import('../auth/AuthService').then(({ signOutUser }) => signOutUser());
    navigate('/login');
  };

  // Room entry page
  if (!roomId) {
    return (
      <div style={styles.centeredContainer}>
        <div style={styles.roomBox}>
          <h2>DV Video — Join or Create Room</h2>
          <input
            style={styles.input}
            type="text"
            value={roomInput}
            onChange={e => setRoomInput(e.target.value)}
            placeholder="Room name"
          />
          <button
            style={styles.button}
            disabled={!roomInput.trim()}
            onClick={() => setRoomId(roomInput.trim())}
          >
            Join Room
          </button>
          <button
            style={styles.linkBtn}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  // Main waiting room UI (seat selection grid)
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2>Room: {roomId}</h2>
        <div>
          <button style={styles.button} onClick={handleLeaveRoom}>Change Room</button>
          <button style={styles.linkBtn} onClick={handleLogout}>Logout</button>
        </div>
      </header>
      {isLoading && <div style={styles.loading}>Loading...</div>}
      <div style={styles.grid}>
        {['seat_1', 'seat_2', 'seat_3', 'seat_4'].map((seatKey, idx) => (
          <Seat
            key={seatKey}
            label={`Seat ${idx + 1}`}
            occupiedBy={seats[seatKey]}
            isCurrentUser={seats[seatKey] === userId}
            onTakeOrRelease={() => handleSeatClick(seatKey)}
          />
        ))}
      </div>
      <div style={{ marginTop: 16, color: '#999', fontSize: 14 }}>
        {Object.values(seats).filter(Boolean).length}/4 seats taken.
        {Object.entries(seats).map(([seatKey, seatUserId]) =>
          seatUserId === userId ? (
            <span key={seatKey} style={{ color: '#43a047', marginLeft: 12 }}>
              You have a seat!
            </span>
          ) : null
        )}
      </div>
    </div>
  );
}

const styles = {
  centeredContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f5f6fa'
  },
  roomBox: {
    background: '#fff',
    padding: 32,
    borderRadius: 8,
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: 320,
    maxWidth: 360
  },
  input: {
    margin: '20px 0',
    padding: 10,
    fontSize: 16,
    borderRadius: 4,
    border: '1px solid #ccc',
    width: '100%'
  },
  button: {
    padding: '10px 0',
    fontSize: 16,
    borderRadius: 4,
    border: 'none',
    margin: '0 8px 8px 0',
    background: '#1976d2',
    color: '#fff',
    cursor: 'pointer'
  },
  linkBtn: {
    background: 'none',
    border: 'none',
    color: '#1976d2',
    cursor: 'pointer',
    textDecoration: 'underline',
    padding: 0,
    marginLeft: 8
  },
  container: {
    minHeight: '100vh',
    background: '#f5f6fa',
    padding: 0,
    margin: 0
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px 32px 8px 32px',
    borderBottom: '1px solid #ddd'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 28,
    padding: 32
  },
  loading: {
    textAlign: 'center',
    fontSize: 18,
    color: '#1976d2',
    margin: '24px 0'
  }
};