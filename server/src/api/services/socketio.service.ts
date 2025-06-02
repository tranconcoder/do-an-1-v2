import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { Server as HTTPSServer } from 'https';
import JwtService from './jwt.service.js';
import KeyTokenService from './keyToken.service.js';
import LoggerService from './logger.service.js';
import { ForbiddenErrorResponse, NotFoundErrorResponse } from '@/response/error.response.js';

// Chat related imports
import { createMessage } from '@/models/repository/message/index.js';
import {
    findOrCreateDirectConversation,
    updateConversationLastMessage,
    incrementUnreadCount
} from '@/models/repository/conversation/index.js';
import { findUserById } from '@/models/repository/user/index.js';

export default class SocketIOService {
    private static instance: SocketIOService;
    private io: SocketIOServer | null = null;
    private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

    private constructor() { }

    public static getInstance(): SocketIOService {
        if (!SocketIOService.instance) {
            SocketIOService.instance = new SocketIOService();
        }
        return SocketIOService.instance;
    }

    public initialize(server: HTTPServer | HTTPSServer): void {
        this.io = new SocketIOServer(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"],
                credentials: true
            },
            transports: ['websocket', 'polling']
        });

        // Authentication middleware
        this.io.use(async (socket, next) => {
            try {
                await this.authenticateSocket(socket);
                next();
            } catch (error) {
                LoggerService.getInstance().error(`Socket authentication failed: ${error}`);
                next(new Error('Authentication failed'));
            }
        });

        // Connection handling
        this.io.on('connection', (socket) => {
            this.handleConnection(socket);
        });

        LoggerService.getInstance().info('Socket.IO service initialized');
    }

    private async authenticateSocket(socket: any): Promise<void> {
        const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

        if (!token) {
            throw new ForbiddenErrorResponse({ message: 'Token not found!' });
        }

        /* --------------- Parse token payload -------------- */
        const payloadParsed = JwtService.parseJwtPayload(token);
        if (!payloadParsed) {
            throw new ForbiddenErrorResponse({ message: 'Invalid token payload!' });
        }

        /* ------------ Check key token is valid ------------- */
        const keyToken = await KeyTokenService.findTokenByUserId(payloadParsed.id);
        if (!keyToken) {
            throw new ForbiddenErrorResponse({ message: 'Invalid token!' });
        }

        /* -------------------- Verify token ------------------- */
        const payload = await JwtService.verifyJwt({
            token,
            publicKey: keyToken.public_key
        });
        if (!payload) {
            throw new ForbiddenErrorResponse({ message: 'Token is expired or invalid!' });
        }

        /* ----------- Check if user exists ----------- */
        const user = await findUserById({
            id: payload.id,
            options: { lean: true },
            only: ['_id', 'user_fullName', 'user_email', 'user_avatar']
        });
        if (!user) {
            throw new NotFoundErrorResponse({ message: 'User not found!' });
        }

        /* --------------- Attach user to socket ------------ */
        socket.userId = payload.id;
        socket.user = user;
        socket.role = payload.role;
    }

    private handleConnection(socket: any): void {
        const userId = socket.userId;
        const user = socket.user;

        LoggerService.getInstance().info(`User connected: ${user.user_fullName} (${userId})`);

        // Store connection
        this.connectedUsers.set(userId, socket.id);

        // Join user to their personal room
        socket.join(`user_${userId}`);

        // Handle events
        this.handleChatEvents(socket);
        this.handleDisconnection(socket);

        // Send connection confirmation
        socket.emit('authenticated', {
            user: {
                id: user._id,
                fullName: user.user_fullName,
                email: user.user_email,
                avatar: user.user_avatar
            },
            message: 'Successfully connected to chat'
        });
    }

    private handleChatEvents(socket: any): void {
        const userId = socket.userId;

        /* -------------------- Send Message -------------------- */
        socket.on('send_message', async (data: {
            receiverId: string;
            content: string;
            type?: 'text' | 'image' | 'file';
        }) => {
            try {
                const { receiverId, content, type = 'text' } = data;

                // Validate input
                if (!receiverId || !content.trim()) {
                    socket.emit('error', { message: 'Receiver ID and content are required' });
                    return;
                }

                // Check if receiver exists
                const receiver = await findUserById({
                    id: receiverId,
                    options: { lean: true },
                    only: ['_id', 'user_fullName', 'user_email', 'user_avatar']
                });
                if (!receiver) {
                    socket.emit('error', { message: 'Receiver not found' });
                    return;
                }

                // Find or create conversation
                const conversation = await findOrCreateDirectConversation(userId, receiverId);

                // Create message
                const message = await createMessage({
                    message_content: content,
                    message_type: type,
                    message_sender: userId,
                    message_receiver: receiverId,
                    message_conversation: conversation._id
                });

                // Update conversation last message
                await updateConversationLastMessage(
                    conversation._id.toString(),
                    message._id.toString(),
                    content,
                    userId,
                    type
                );

                // Increment unread count for receiver
                await incrementUnreadCount(conversation._id.toString(), receiverId);

                // Prepare message data to send
                const messageData = {
                    _id: message._id,
                    content: message.message_content,
                    type: message.message_type,
                    sender: {
                        id: socket.user._id,
                        fullName: socket.user.user_fullName,
                        avatar: socket.user.user_avatar
                    },
                    receiver: {
                        id: receiver._id,
                        fullName: receiver.user_fullName,
                        avatar: receiver.user_avatar
                    },
                    conversationId: conversation._id,
                    timestamp: message.created_at,
                    status: 'sent'
                };

                // Send to sender (confirmation)
                socket.emit('message_sent', messageData);

                // Send to receiver if online
                const receiverSocketId = this.connectedUsers.get(receiverId);
                if (receiverSocketId) {
                    this.io?.to(receiverSocketId).emit('new_message', messageData);

                    // Mark as delivered
                    message.message_status = 'delivered';
                    await message.save();

                    // Update status for both users
                    const deliveredData = { ...messageData, status: 'delivered' };
                    socket.emit('message_delivered', deliveredData);
                    this.io?.to(receiverSocketId).emit('message_delivered', deliveredData);
                }

                LoggerService.getInstance().info(`Message sent from ${userId} to ${receiverId}`);

            } catch (error) {
                LoggerService.getInstance().error(`Send message error: ${error}`);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        /* -------------------- Mark as Read -------------------- */
        socket.on('mark_as_read', async (data: {
            conversationId: string;
            messageIds?: string[];
        }) => {
            try {
                const { conversationId, messageIds } = data;

                if (!conversationId) {
                    socket.emit('error', { message: 'Conversation ID is required' });
                    return;
                }

                // Update conversation participant last read
                const { updateParticipantLastRead } = await import('@/models/repository/conversation/index.js');
                await updateParticipantLastRead(conversationId, userId);

                // Mark messages as read
                const { markMessagesAsRead } = await import('@/models/repository/message/index.js');
                await markMessagesAsRead(conversationId, userId);

                // Notify other participants
                socket.to(`conversation_${conversationId}`).emit('messages_read', {
                    conversationId,
                    readBy: userId,
                    timestamp: new Date()
                });

                LoggerService.getInstance().info(`Messages marked as read by ${userId} in conversation ${conversationId}`);

            } catch (error) {
                LoggerService.getInstance().error(`Mark as read error: ${error}`);
                socket.emit('error', { message: 'Failed to mark messages as read' });
            }
        });

        /* -------------------- Join Conversation -------------------- */
        socket.on('join_conversation', (data: { conversationId: string }) => {
            const { conversationId } = data;
            if (conversationId) {
                socket.join(`conversation_${conversationId}`);
                socket.emit('joined_conversation', { conversationId });
                LoggerService.getInstance().info(`User ${userId} joined conversation ${conversationId}`);
            }
        });

        /* -------------------- Leave Conversation -------------------- */
        socket.on('leave_conversation', (data: { conversationId: string }) => {
            const { conversationId } = data;
            if (conversationId) {
                socket.leave(`conversation_${conversationId}`);
                socket.emit('left_conversation', { conversationId });
                LoggerService.getInstance().info(`User ${userId} left conversation ${conversationId}`);
            }
        });

        /* -------------------- Typing Indicators -------------------- */
        socket.on('typing_start', (data: { conversationId: string, receiverId?: string }) => {
            const { conversationId, receiverId } = data;

            if (receiverId) {
                // Direct message typing
                const receiverSocketId = this.connectedUsers.get(receiverId);
                if (receiverSocketId) {
                    this.io?.to(receiverSocketId).emit('user_typing', {
                        userId,
                        conversationId,
                        user: {
                            id: socket.user._id,
                            fullName: socket.user.user_fullName
                        }
                    });
                }
            } else if (conversationId) {
                // Group conversation typing
                socket.to(`conversation_${conversationId}`).emit('user_typing', {
                    userId,
                    conversationId,
                    user: {
                        id: socket.user._id,
                        fullName: socket.user.user_fullName
                    }
                });
            }
        });

        socket.on('typing_stop', (data: { conversationId: string, receiverId?: string }) => {
            const { conversationId, receiverId } = data;

            if (receiverId) {
                // Direct message stop typing
                const receiverSocketId = this.connectedUsers.get(receiverId);
                if (receiverSocketId) {
                    this.io?.to(receiverSocketId).emit('user_stop_typing', {
                        userId,
                        conversationId
                    });
                }
            } else if (conversationId) {
                // Group conversation stop typing
                socket.to(`conversation_${conversationId}`).emit('user_stop_typing', {
                    userId,
                    conversationId
                });
            }
        });
    }

    private handleDisconnection(socket: any): void {
        socket.on('disconnect', () => {
            const userId = socket.userId;
            const user = socket.user;

            // Remove from connected users
            this.connectedUsers.delete(userId);

            LoggerService.getInstance().info(`User disconnected: ${user?.user_fullName} (${userId})`);
        });
    }

    /* -------------------- Public Methods -------------------- */
    public sendToUser(userId: string, event: string, data: any): boolean {
        const socketId = this.connectedUsers.get(userId);
        if (socketId && this.io) {
            this.io.to(socketId).emit(event, data);
            return true;
        }
        return false;
    }

    public sendToConversation(conversationId: string, event: string, data: any): boolean {
        if (this.io) {
            this.io.to(`conversation_${conversationId}`).emit(event, data);
            return true;
        }
        return false;
    }

    public getConnectedUsers(): string[] {
        return Array.from(this.connectedUsers.keys());
    }

    public isUserOnline(userId: string): boolean {
        return this.connectedUsers.has(userId);
    }

    public getSocketIO(): SocketIOServer | null {
        return this.io;
    }
} 