import io from 'socket.io-client';
import { API_BASE_URL } from '../config/api';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket?.connected) {
      return;
    }

    const baseUrl = API_BASE_URL.replace('/api', '');

    this.socket = io(baseUrl, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Setup listeners for events
    this.listeners.forEach((callback, event) => {
      this.socket.on(event, callback);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event, callback) {
    this.listeners.set(event, callback);
    if (this.socket?.connected) {
      this.socket.on(event, callback);
    }
  }

  off(event) {
    this.listeners.delete(event);
    if (this.socket) {
      this.socket.off(event);
    }
  }

  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  joinGameThread(gameThreadId) {
    this.emit('join_game_thread', gameThreadId);
  }

  leaveGameThread(gameThreadId) {
    this.emit('leave_game_thread', gameThreadId);
  }

  sendGameThreadMessage(gameThreadId, content, postPhase = 'live') {
    this.emit('game_thread_message', { gameThreadId, content, postPhase });
  }

  sendTyping(gameThreadId) {
    this.emit('typing', { gameThreadId });
  }
}

export default new WebSocketService();
