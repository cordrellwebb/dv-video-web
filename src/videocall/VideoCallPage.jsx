import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AgoraService from '../agora/AgoraService';

// Paste your real App ID and the temp token here!
const AGORA_APP_ID = 'cc6cf7886b574bc491efbf4371d79717';
const AGORA_TOKEN = '007eJxTYDA4veH0htj1t9I0d//um3HI6n2fX0135/9iueMG7nOjCn0VGJKTzZLTzC0szJJMzU2Skk0sDVPTktJMjM0NU8wtzQ3NpzD4ZYhYh2cw+a9kZmRgZGBhYGQAASYwyQwmWcAkB4NLmEJYZkpqPgMDAG10IIw=';
// This is the only channel name valid for this token!
const AGORA_CHANNEL = 'DV Video';

export default function VideoCallPage() {
  // Ignore the :roomId param; always use the fixed channel for this token!
  const navigate = useNavigate();

  const [remoteUsers, setRemoteUsers] = useState([]);
  const localContainerRef = useRef(null);

  const [remoteRefs, setRemoteRefs] = useState({});

  useEffect(() => {
    let isMounted = true;

    const setupAgora = async () => {
      await AgoraService.initialize({
        appId: AGORA_APP_ID,
        channel: AGORA_CHANNEL, // Always use this fixed name for your temp token
        token: AGORA_TOKEN,
        onUserPublished: (user, mediaType) => {
          setRemoteUsers((prev) => {
            if (prev.find((u) => u.uid === user.uid)) return prev;
            return [...prev, user];
          });
        },
        onUserUnpublished: (user, mediaType) => {
          setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
        }
      });

      // Play local video
      if (isMounted && localContainerRef.current) {
        AgoraService.playLocalVideo(localContainerRef.current);
      }
    };

    setupAgora();

    // Clean up on unmount
    return () => {
      isMounted = false;
      AgoraService.leaveChannel();
    };
  }, []); // No dependency on roomId; use fixed channel for this test

  // Play remote video when remoteUsers or their refs change
  useEffect(() => {
    remoteUsers.forEach((user) => {
      setRemoteRefs((prevRefs) => {
        if (prevRefs[user.uid]) return prevRefs;
        return { ...prevRefs, [user.uid]: React.createRef() };
      });
    });
  }, [remoteUsers]);

  useEffect(() => {
    remoteUsers.forEach((user) => {
      const ref = remoteRefs[user.uid];
      // ---- STEP A: Log info about the ref before playing video ----
      console.log('Will play video for', user.uid, 'on ref', ref, 'DOM node', ref ? ref.current : undefined);
      if (ref && ref.current) {
        AgoraService.playRemoteVideo(user, ref.current);
      }
    });
  }, [remoteUsers, remoteRefs]);

  const leaveCall = () => {
    AgoraService.leaveChannel();
    navigate('/waiting');
  };

  // --- CHANGED: removed .slice(0, 3) ---
  const allVideoBoxes = [
    {
      label: 'You (Seat 1)',
      ref: localContainerRef,
      key: 'local',
    },
    ...remoteUsers.map((user) => ({
      label: `User ${user.uid}`,
      ref: remoteRefs[user.uid] || React.createRef(),
      key: `remote-${user.uid}`,
    }))
  ];

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2>DV Video Call — Channel: DV Video</h2>
        <button onClick={leaveCall} style={styles.leaveBtn}>Leave</button>
      </header>
      <div style={styles.grid}>
        {allVideoBoxes.map(({ label, ref, key }) => (
          <div key={key} style={styles.videoBox}>
            <div
              ref={ref}
              style={styles.video}
              id={key}
            />
            <div style={styles.label}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Styles as before
const styles = {
  container: {
    minHeight: '100vh',
    background: '#101522',
    color: '#fff',
    padding: 0,
    margin: 0
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px 32px 8px 32px',
    borderBottom: '1px solid #23294d'
  },
  leaveBtn: {
    background: '#e53935',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: 6,
    fontWeight: 600,
    cursor: 'pointer'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 24,
    padding: 32
  },
  videoBox: {
    background: '#222a42',
    borderRadius: 8,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: 300,
    position: 'relative'
  },
  video: {
    width: '100%',
    height: 220,
    background: '#111',
  },
  label: {
    marginTop: 8,
    fontSize: 16,
    background: '#181c30',
    padding: '4px 12px',
    borderRadius: 4,
    alignSelf: 'flex-start'
  }
};