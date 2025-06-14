import React from 'react';

export default function VideoTile({ containerRef, label }) {
  return (
    <div style={styles.wrapper}>
      <div ref={containerRef} style={styles.video} />
      <div style={styles.label}>{label}</div>
    </div>
  );
}

const styles = {
  wrapper: {
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
    background: '#111'
  },
  label: {
    marginTop: 8,
    fontSize: 16,
    background: '#181c30',
    padding: '4px 12px',
    borderRadius: 4,
    alignSelf: 'flex-start',
    color: '#fff'
  }
};