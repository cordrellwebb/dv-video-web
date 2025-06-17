import AgoraRTC from "agora-rtc-sdk-ng";

class AgoraService {
  constructor() {
    this.client = null;
    this.localAudioTrack = null;
    this.localVideoTrack = null;
  }

  // Initialize the Agora client and join the channel
  async initialize({ appId, channel, token = null, onUserPublished, onUserUnpublished }) {
    // If already joined, leave first
    if (this.client) {
      await this.leaveChannel();
    }

    this.client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

    // Subscribe to remote users
    this.client.on("user-published", async (user, mediaType) => {
      try {
        await this.client.subscribe(user, mediaType);
        if (mediaType === 'video' && onUserPublished) {
          console.log(`Subscribed to video for user ${user.uid}`);
          onUserPublished(user, mediaType);
        } else {
          console.log(`Media type "${mediaType}" published by user ${user.uid}, ignoring for now.`);
        }
      } catch (err) {
        console.error(`Failed to subscribe to ${mediaType} for user ${user.uid}`, err);
      }
    });

    this.client.on("user-unpublished", (user, mediaType) => {
      if (onUserUnpublished) {
        console.log(`User ${user.uid} unpublished ${mediaType}`);
        onUserUnpublished(user, mediaType);
      }
    });

    // Join the channel
    const uid = await this.client.join(appId, channel, token || null, null);

    // Create and publish local audio/video tracks
    [this.localAudioTrack, this.localVideoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
    await this.client.publish([this.localAudioTrack, this.localVideoTrack]);

    console.log("Local user published tracks");

    return uid;
  }

  // Play the local video in a given container (by ref or id)
  playLocalVideo(container) {
    if (this.localVideoTrack) {
      console.log("Playing local video");
      this.localVideoTrack.play(container);
    } else {
      console.warn("Local video track not available");
    }
  }

  // Play a remote video track in a given container (by ref or DOM node)
  playRemoteVideo(user, container) {
    if (user.videoTrack) {
      console.log("Playing remote video for", user.uid, "on", container);
      user.videoTrack.play(container);
    } else {
      console.warn("No video track for user", user.uid);
    }
  }

  // Leave the channel and release resources
  async leaveChannel() {
    if (this.localAudioTrack) {
      this.localAudioTrack.stop();
      this.localAudioTrack.close();
      this.localAudioTrack = null;
    }
    if (this.localVideoTrack) {
      this.localVideoTrack.stop();
      this.localVideoTrack.close();
      this.localVideoTrack = null;
    }
    if (this.client) {
      await this.client.leave();
      this.client = null;
      console.log("Left Agora channel");
    }
  }
}

// --- Fix for ESLint: Assign instance to variable before exporting ---
const agoraServiceInstance = new AgoraService();
export default agoraServiceInstance;