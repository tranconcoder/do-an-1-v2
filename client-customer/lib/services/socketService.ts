import { io, Socket } from 'socket.io-client';
import { ChatMessage } from './api/chatService';

export interface SocketUser {
    id: string;
    fullName: string;
    email: string;
    avatar?: string;
}

export interface TypingData {
    userId: string;
    conversationId: string;
    user: SocketUser;
}

export interface MessageStatusData {
    conversationId: string;
    messageId?: string;
    _id?: string;
    status: 'sent' | 'delivered' | 'read';
}

export interface UserStatusData {
    userId: string;
    isOnline: boolean;
}

class SocketService {
    private socket: Socket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000;
    private isConnecting = false;

    // Event callbacks
    private eventCallbacks: { [key: string]: Function[] } = {};

    constructor() {
        this.resetCallbacks();
    }

    private resetCallbacks() {
        this.eventCallbacks = {
            connect: [],
            disconnect: [],
            authenticated: [],
            new_message: [],
            message_sent: [],
            message_delivered: [],
            messages_read: [],
            user_typing: [],
            user_stop_typing: [],
            user_online: [],
            user_offline: [],
            error: [],
            connect_error: []
        };
    }

    /**
     * Connect to Socket.IO server
     */
    connect(token: string, serverUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.socket?.connected) {
                console.log('Socket already connected');
                resolve();
                return;
            }

            if (this.isConnecting) {
                console.log('Connection already in progress');
                return;
            }

            this.isConnecting = true;

            try {
                this.socket = io(serverUrl, {
                    auth: { token },
                    transports: ['websocket', 'polling'],
                    timeout: 20000,
                    forceNew: true
                });

                this.setupEventListeners();

                // Handle connection success
                this.socket.on('connect', () => {
                    console.log('Connected to chat server');
                    this.reconnectAttempts = 0;
                    this.isConnecting = false;
                    this.triggerCallbacks('connect');
                    resolve();
                });

                // Handle connection error
                this.socket.on('connect_error', (error) => {
                    console.error('Connection error:', error);
                    this.isConnecting = false;
                    this.triggerCallbacks('connect_error', error);
                    this.handleReconnect();
                    reject(error);
                });

            } catch (error) {
                this.isConnecting = false;
                console.error('Socket connection failed:', error);
                reject(error);
            }
        });
    }

    private setupEventListeners() {
        if (!this.socket) return;

        // Connection events
        this.socket.on('disconnect', (reason) => {
            console.log('Disconnected from chat server:', reason);
            this.triggerCallbacks('disconnect', reason);

            if (reason === 'io server disconnect') {
                this.handleReconnect();
            }
        });

        // Authentication events
        this.socket.on('authenticated', (data) => {
            console.log('Socket authenticated:', data);
            this.triggerCallbacks('authenticated', data);
        });

        // Message events
        this.socket.on('new_message', (message: ChatMessage) => {
            console.log('New message received:', message);
            this.triggerCallbacks('new_message', message);
        });

        this.socket.on('message_sent', (message: ChatMessage) => {
            console.log('Message sent confirmation:', message);
            this.triggerCallbacks('message_sent', message);
        });

        this.socket.on('message_delivered', (data: MessageStatusData) => {
            console.log('Message delivered:', data);
            this.triggerCallbacks('message_delivered', data);
        });

        this.socket.on('messages_read', (data: MessageStatusData) => {
            console.log('Messages read:', data);
            this.triggerCallbacks('messages_read', data);
        });

        // Typing events
        this.socket.on('user_typing', (data: TypingData) => {
            console.log('User typing:', data);
            this.triggerCallbacks('user_typing', data);
        });

        this.socket.on('user_stop_typing', (data: { userId: string; conversationId: string }) => {
            console.log('User stop typing:', data);
            this.triggerCallbacks('user_stop_typing', data);
        });

        // User status events
        this.socket.on('user_online', (data: UserStatusData) => {
            this.triggerCallbacks('user_online', data);
        });

        this.socket.on('user_offline', (data: UserStatusData) => {
            this.triggerCallbacks('user_offline', data);
        });

        // Error events
        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
            this.triggerCallbacks('error', error);
        });
    }

    private handleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('Max reconnection attempts reached');
            this.triggerCallbacks('error', new Error('Unable to connect to chat server'));
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

    /**
     * Send a message
     */
    sendMessage(receiverId: string, content: string, type: 'text' | 'image' | 'file' = 'text'): boolean {
        if (!this.socket?.connected) {
            console.error('Socket not connected');
            return false;
        }

        console.log('Sending message:', { receiverId, content, type });
        this.socket.emit('send_message', { receiverId, content, type });
        return true;
    }

    /**
     * Mark messages as read
     */
    markAsRead(conversationId: string, messageIds: string[] = []): boolean {
        if (!this.socket?.connected) {
            console.error('Socket not connected');
            return false;
        }

        this.socket.emit('mark_as_read', { conversationId, messageIds });
        return true;
    }

    /**
     * Join a conversation room
     */
    joinConversation(conversationId: string): boolean {
        if (!this.socket?.connected) {
            console.error('Socket not connected');
            return false;
        }

        this.socket.emit('join_conversation', { conversationId });
        return true;
    }

    /**
     * Leave a conversation room
     */
    leaveConversation(conversationId: string): boolean {
        if (!this.socket?.connected) {
            console.error('Socket not connected');
            return false;
        }

        this.socket.emit('leave_conversation', { conversationId });
        return true;
    }

    /**
     * Start typing indicator
     */
    startTyping(conversationId: string, receiverId?: string): boolean {
        if (!this.socket?.connected) {
            console.error('Socket not connected');
            return false;
        }

        this.socket.emit('typing_start', { conversationId, receiverId });
        return true;
    }

    /**
     * Stop typing indicator
     */
    stopTyping(conversationId: string, receiverId?: string): boolean {
        if (!this.socket?.connected) {
            console.error('Socket not connected');
            return false;
        }

        this.socket.emit('typing_stop', { conversationId, receiverId });
        return true;
    }

    /**
     * Disconnect from server
     */
    disconnect(): void {
        if (this.socket) {
            console.log('Disconnecting socket...');
            this.socket.disconnect();
            this.socket = null;
            this.resetCallbacks();
        }
    }

    /**
     * Check if connected
     */
    isConnected(): boolean {
        return this.socket?.connected || false;
    }

    /**
     * Add event listener
     */
    on(event: string, callback: Function): void {
        if (!this.eventCallbacks[event]) {
            this.eventCallbacks[event] = [];
        }
        this.eventCallbacks[event].push(callback);
    }

    /**
     * Remove event listener
     */
    off(event: string, callback?: Function): void {
        if (!this.eventCallbacks[event]) return;

        if (callback) {
            this.eventCallbacks[event] = this.eventCallbacks[event].filter(cb => cb !== callback);
        } else {
            this.eventCallbacks[event] = [];
        }
    }

    /**
     * Trigger callbacks for an event
     */
    private triggerCallbacks(event: string, data?: any): void {
        if (this.eventCallbacks[event]) {
            this.eventCallbacks[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in ${event} callback:`, error);
                }
            });
        }
    }

    /**
     * Get socket instance (for debugging)
     */
    getSocket(): Socket | null {
        return this.socket;
    }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService; 