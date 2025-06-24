import type { Post } from "../types/post";

const CHANNEL_NAME = "post_updates_channel";
let channel: BroadcastChannel | null = null;

type BroadcastMessage =
  | { type: "NEW_POST"; payload: Post }
  | { type: "UPDATED_POST"; payload: Post }
  | { type: "DELETED_POST"; payload: { id: string } };

type MessageListener = (message: BroadcastMessage) => void;
const listeners: MessageListener[] = [];

const connect = () => {
  if (typeof BroadcastChannel !== "undefined") {
    if (!channel) {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channel.onmessage = (event: MessageEvent<BroadcastMessage>) => {
        console.log("[BroadcastChannel] Message received:", event.data);
        listeners.forEach((listener) => listener(event.data));
      };
      console.log("[BroadcastChannel] Connected to channel:", CHANNEL_NAME);
    }
  } else {
    console.warn("[BroadcastChannel] API not supported in this browser.");
  }
};

const postMessage = (message: BroadcastMessage) => {
  if (channel) {
    console.log("[BroadcastChannel] Posting message:", message);
    channel.postMessage(message);
  } else {
    console.warn(
      "[BroadcastChannel] Cannot post message, channel not initialized.",
    );
  }
};

const subscribe = (callback: MessageListener): (() => void) => {
  listeners.push(callback);
  return () => {
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
};

const disconnect = () => {
  if (channel) {
    channel.close();
    channel = null;
    console.log("[BroadcastChannel] Disconnected from channel:", CHANNEL_NAME);
  }
};

connect();

export const broadcastChannelService = {
  postMessage,
  subscribe,
  disconnect,
  connect,
};
