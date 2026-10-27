import { Client } from '@stomp/stompjs';

class WebSocketService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.subscriptions = new Map();
    this.pendingSubscriptions = [];
  }

  connect(token, guestId, onConnectedCallback, onErrorCallback) {
    if (this.client && this.client.active) {
      if (this.isConnected && onConnectedCallback) {
        onConnectedCallback();
      }
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const brokerURL = `${protocol}//${window.location.host}/ws`;

    const connectHeaders = {};
    if (token) {
      connectHeaders['Authorization'] = `Bearer ${token}`;
    }
    if (guestId) {
      connectHeaders['guestId'] = guestId;
    }

    this.client = new Client({
      brokerURL,
      connectHeaders,
      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
    });

    this.client.onConnect = (frame) => {
      this.isConnected = true;

      // Flush any queued subscriptions
      const queued = [...this.pendingSubscriptions];
      this.pendingSubscriptions = [];
      queued.forEach(({ topic, callback }) => {
        this.subscribe(topic, callback);
      });

      if (onConnectedCallback) onConnectedCallback(frame);
    };

    this.client.onStompError = (frame) => {
      console.error('[STOMP Error]', frame.headers['message'], frame.body);
      if (onErrorCallback) onErrorCallback(frame);
    };

    this.client.onWebSocketClose = () => {
      this.isConnected = false;
    };

    this.client.activate();
  }

  subscribe(topic, callback) {
    if (!this.client || !this.client.connected) {
      // Queue subscription until connected
      this.pendingSubscriptions.push({ topic, callback });
      return {
        unsubscribe: () => {
          this.pendingSubscriptions = this.pendingSubscriptions.filter(
            (s) => s.topic !== topic || s.callback !== callback
          );
        },
      };
    }

    if (this.subscriptions.has(topic)) {
      this.subscriptions.get(topic).unsubscribe();
    }

    const sub = this.client.subscribe(topic, (message) => {
      try {
        const payload = JSON.parse(message.body);
        callback(payload);
      } catch (e) {
        callback(message.body);
      }
    });

    this.subscriptions.set(topic, sub);
    return sub;
  }

  unsubscribe(topic) {
    if (this.subscriptions.has(topic)) {
      this.subscriptions.get(topic).unsubscribe();
      this.subscriptions.delete(topic);
    }
    this.pendingSubscriptions = this.pendingSubscriptions.filter((s) => s.topic !== topic);
  }

  send(destination, body = {}) {
    if (!this.client || !this.client.connected) {
      console.warn('STOMP client not connected, message not sent:', destination);
      return;
    }
    this.client.publish({
      destination,
      body: JSON.stringify(body),
    });
  }

  disconnect() {
    this.pendingSubscriptions = [];
    for (const [_, sub] of this.subscriptions.entries()) {
      try {
        sub.unsubscribe();
      } catch (e) {}
    }
    this.subscriptions.clear();

    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.isConnected = false;
    }
  }
}

export const wsService = new WebSocketService();
export default wsService;
