import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AgoraService from '../agora/AgoraService';

// Paste your real App ID and the temp token here!
const AGORA_APP_ID = 'cc6cf7886b574bc491efbf4371d79717';
const AGORA_TOKEN = '007eJxTYFi05tHvlHWfT9rzhouF5T9zN/2QLXc+4UJvsKp0ZGEbt6ECQ3KyWXKauYWFWZKpuUlSsomlYWpaUpqJsblhirmluaG564qAjKOPIjOELm1gYGRgZGBhYGQAASYwyQwmWcAkB4NLmEJYZkpqPgMDAPmxIIQ=';
const AGORA_CHANNEL = 'DV Video';

export default function VideoCallPage() {
  const navigate = useNavigate();

  const [remoteUsers, setRemoteUsers] = useState([]);
  const [remoteRefs, setRemoteRefs] = useState({});
  const localContainerRef = useRef(null);

  // Initialize and join Agora channel
  useEffect(() => {
    let isMounted = true;

    const setupAgora = async () => {
      await AgoraService.initialize({
        appId: AGORA_APP_ID,
        channel: AGORA_CHANNEL,
        token: AGORA_TOKEN,
        onUserPublished: (user, mediaType) => {
          setRemoteUsers((prev) => {
            if (prev.find((u) => u.uid === user.uid)) return prev;
            return [...prev, user];
          });
        },
        onUserUnpublished: (user) => {
          setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
        }
      });

      if (isMounted && localContainerRef.current) {
        AgoraService.playLocalVideo(localContainerRef.current);
      }
    };

    setupAgora();

    return () => {
      isMounted = false;
      AgoraService.leaveChannel();
    };
  }, []);

  // Create refs for all remote users in a single pass
  useEffect(() => {
    const refsMap = {};
    remoteUsers.forEach((user) => {
      refsMap[user.uid] = React.createRef();
    });
    setRemoteRefs(refsMap);
  }, [remoteUsers]);

  // Play remote video only when all refs are ready
  useEffect(() => {
    if (remoteUsers.length === 0) return;

    const allRefsReady = remoteUsers.every(user => remoteRefs[user.uid]?.current);

    if (allRefsReady) {
      remoteUsers.forEach((user) => {
        const ref = remoteRefs[user.uid];
        if (ref && ref.current) {
          console.log('Will play video for', user.uid, 'on ref', ref, 'DOM node', ref.current);
          AgoraService.playRemoteVideo(user, ref.current);
        }
      });
    }
  }, [remoteUsers, remoteRefs]);

  const leaveCall = () => {
    AgoraService.leaveChannel();
    navigate('/waiting');
  };

  // Prepare video boxes including local and remote users
  const allVideoBoxes = [
    {
      label: 'You (Seat 1)',
      ref: localContainerRef,
      key: 'local',
    },
    ...remoteUsers.map((user) => ({
      label: `User ${user.uid}`,
      ref: remoteRefs[user.uid] || React.createRef(), // fallback in case refs haven't populated
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