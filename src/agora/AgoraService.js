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
      await this.client.subscribe(user, mediaType);
      if (onUserPublished) onUserPublished(user, mediaType);
    });

    this.client.on("user-unpublished", (user, mediaType) => {
      if (onUserUnpublished) onUserUnpublished(user, mediaType);
    });

    // Join the channel
    const uid = await this.client.join(appId, channel, token || null, null);

    // Create and publish local audio/video tracks
    [this.localAudioTrack, this.localVideoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
    await this.client.publish([this.localAudioTrack, this.localVideoTrack]);

    return uid;
  }

  // Play the local video in a given container (by ref or id)
  playLocalVideo(container) {
    if (this.localVideoTrack) {
      this.localVideoTrack.play(container);
    }
  }

  // Play a remote video track in a given container (by ref or id)
  playRemoteVideo(user, container) {
    if (user.videoTrack) {
      user.videoTrack.play(container);
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
    }
  }
}

export default new AgoraService();