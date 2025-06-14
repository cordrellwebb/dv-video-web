// generateToken.js

const { RtcTokenBuilder, RtcRole } = require('agora-token');

// ==== CHANGE THESE VALUES ====
const appID = 'cc6cf7886b574bc491efbf4371d79717'; // <-- your App ID
const appCertificate = 'f47a8dd49e49483ebf43851e1fcfff56'; // <-- your Primary Certificate
const channelName = 'DV Video'; // Must match your channel exactly
const uid = 0; // 0 means dynamic, or use a number for fixed UID
const role = RtcRole.PUBLISHER; // or RtcRole.SUBSCRIBER
const expireTimeInSeconds = 3600 * 24 * 7; // 1 week

// ==== GENERATE TOKEN ====
const currentTimestamp = Math.floor(Date.now() / 1000);
const privilegeExpireTimestamp = currentTimestamp + expireTimeInSeconds;

const token = RtcTokenBuilder.buildTokenWithUid(
  appID,
  appCertificate,
  channelName,
  uid,
  role,
  privilegeExpireTimestamp
);

console.log('Generated Agora RTC token:');
console.log(token);