import { io } from 'socket.io-client';
import store from '../store';
import { API_URL } from '../configs/env.config';
import {
    setConnected,
    setConnectionError,
    addMessage,
    updateMessageStatus,
    setUserTyping,
    setUserStopTyping,
    updateUserOnlineStatus,
    markConversationAsRead
} from '../store/slices/chatSlice';

class SocketService {
    constructor() {
        this.socket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
    }

    connect(token) {
        if (this.socket?.connected) {
            console.log('Socket already connected');
            return;
        }

        const serverUrl = API_URL;

        this.socket = io(serverUrl, {
            auth: {
                token: token
            },
            transports: ['websocket', 'polling'],
            timeout: 20000,
            forceNew: true
        });

        this.setupEventListeners();
    }

    setupEventListeners() {
        if (!this.socket) return;

        // Connection events
        this.socket.on('connect', () => {
            console.log('Connected to chat server');
            store.dispatch(setConnected(true));
            this.reconnectAttempts = 0;
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Disconnected from chat server:', reason);
            store.dispatch(setConnected(false));

            if (reason === 'io server disconnect') {
                // Server initiated disconnect, try to reconnect
                this.handleReconnect();
            }
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            store.dispatch(setConnectionError(error.message));
            this.handleReconnect();
        });

        // Authentication events
        this.socket.on('authenticated', (data) => {
            console.log('Socket authenticated:', data);
            store.dispatch(setConnected(true));
        });

        // Message events
        this.socket.on('new_message', (message) => {
            console.log('New message received:', message);
            store.dispatch(
                addMessage({
                    conversationId: message.conversationId,
                    message: message
                })
            );
        });

        this.socket.on('message_sent', (message) => {
            console.log('Message sent confirmation:', message);
            store.dispatch(
                addMessage({
                    conversationId: message.conversationId,
                    message: message
                })
            );
        });

        this.socket.on('message_delivered', (data) => {
            console.log('Message delivered:', data);
            store.dispatch(
                updateMessageStatus({
                    conversationId: data.conversationId,
                    messageId: data._id,
                    status: 'delivered'
                })
            );
        });

        this.socket.on('messages_read', (data) => {
            console.log('Messages read:', data);
            store.dispatch(markConversationAsRead(data.conversationId));
        });

        // Typing events
        this.socket.on('user_typing', (data) => {
            console.log('User typing:', data);
            store.dispatch(
                setUserTyping({
                    conversationId: data.conversationId,
                    userId: data.userId,
                    user: data.user
                })
            );
        });

        this.socket.on('user_stop_typing', (data) => {
            console.log('User stop typing:', data);
            store.dispatch(
                setUserStopTyping({
                    conversationId: data.conversationId,
                    userId: data.userId
                })
            );
        });

        // Conversation events
        this.socket.on('joined_conversation', (data) => {
            console.log('Joined conversation:', data);
        });

        this.socket.on('left_conversation', (data) => {
            console.log('Left conversation:', data);
        });

        // Error events
        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
            store.dispatch(setConnectionError(error.message));
        });

        // User status events (if implemented on server)
        this.socket.on('user_online', (data) => {
            store.dispatch(
                updateUserOnlineStatus({
                    userId: data.userId,
                    isOnline: true
                })
            );
        });

        this.socket.on('user_offline', (data) => {
            store.dispatch(
                updateUserOnlineStatus({
                    userId: data.userId,
                    isOnline: false
                })
            );
        });
    }

    handleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('Max reconnection attempts reached');
            store.dispatch(setConnectionError('Unable to connect to chat server'));
            return;
        }

        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

        console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

        setTimeout(() => {
            if (this.socket && !this.socket.connected) {
                this.socket.connect();
            }
        }, delay);
    }

    // Message methods
    sendMessage(receiverId, content, type = 'text') {
        if (!this.socket?.connected) {
            console.error('Socket not connected');
            return false;
        }

        console.log('Sending message:', { receiverId, content, type });
        this.socket.emit('send_message', {
            receiverId,
            content,
            type
        });
        return true;
    }

    markAsRead(conversationId, messageIds = []) {
        if (!this.socket?.connected) {
            console.error('Socket not connected');
            return false;
        }

        this.socket.emit('mark_as_read', {
            conversationId,
            messageIds
        });
        return true;
    }

    joinConversation(conversationId) {
        if (!this.socket?.connected) {
            console.error('Socket not connected');
            return false;
        }

        this.socket.emit('join_conversation', {
            conversationId
        });
        return true;
    }

    leaveConversation(conversationId) {
        if (!this.socket?.connected) {
            console.error('Socket not connected');
            return false;
        }

        this.socket.emit('leave_conversation', {
            conversationId
        });
        return true;
    }

    // Typing methods
    startTyping(conversationId, receiverId = null) {
        if (!this.socket?.connected) {
            console.error('Socket not connected');
            return false;
        }

        this.socket.emit('typing_start', {
            conversationId,
            receiverId
        });
        return true;
    }

    stopTyping(conversationId, receiverId = null) {
        if (!this.socket?.connected) {
            console.error('Socket not connected');
            return false;
        }

        this.socket.emit('typing_stop', {
            conversationId,
            receiverId
        });
        return true;
    }

    // Connection methods
    disconnect() {
        if (this.socket) {
            console.log('Disconnecting socket...');
            this.socket.disconnect();
            this.socket = null;
            store.dispatch(setConnected(false));
        }
    }

    isConnected() {
        return this.socket?.connected || false;
    }

    // Get socket instance (for debugging or advanced usage)
    getSocket() {
        return this.socket;
    }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
