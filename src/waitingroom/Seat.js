// src/agora/AgoraService.js

import AgoraRTC from "agora-rtc-sdk-ng";

class AgoraService {
  constructor() {
    this.client = null;
    this.localAudioTrack = null;
    this.localVideoTrack = null;
    this.remoteUsers = {};
  }

  // Initialize the Agora client
  async initialize({ appId, channel, token = null, onUserPublished, onUserUnpublished }) {
    this.client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

    // Register event listeners
    this.client.on("user-published", async (user, mediaType) => {
      await this.client.subscribe(user, mediaType);
      if (onUserPublished) onUserPublished(user, mediaType);
    });

    this.client.on("user-unpublished", (user, mediaType) => {
      if (onUserUnpublished) onUserUnpublished(user, mediaType);
    });

    // Join the channel
    const uid = await this.client.join(appId, channel, token || null, null);

    // Create local tracks (audio & video)
    [this.localAudioTrack, this.localVideoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();

    // Publish local tracks to the channel
    await this.client.publish([this.localAudioTrack, this.localVideoTrack]);

    return uid;
  }

  // Play local video to a container (e.g., <div id="local-player"></div>)
  playLocalVideo(containerId) {
    if (this.localVideoTrack) {
      this.localVideoTrack.play(containerId);
    }
  }

  // Play remote video to a container
  playRemoteVideo(user, containerId) {
    if (user.videoTrack) {
      user.videoTrack.play(containerId);
    }
  }

  // Leave the channel and clean up
  async leaveChannel() {
    if (this.localAudioTrack) {
      this.localAudioTrack.stop();
      this.localAudioTrack.close();
    }
    if (this.localVideoTrack) {
      this.localVideoTrack.stop();
      this.localVideoTrack.close();
    }
    if (this.client) {
      await this.client.leave();
      this.client = null;
    }
  }
}

export default new AgoraService();