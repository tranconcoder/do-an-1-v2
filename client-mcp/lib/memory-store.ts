import { createClient } from 'redis';
import type { RedisClientType } from 'redis';

export interface ConversationMessage {
    id: string;
    content: string;
    role: 'user' | 'assistant' | 'system';
    timestamp: Date;
    socketId: string;
    toolCalls?: any[];
    context?: any;
}

export interface ConversationSession {
    socketId: string;
    messages: ConversationMessage[];
    context: {
        userId?: string;
        currentPage?: string;
        userAgent?: string;
        cartItems?: any[];
        recentlyViewed?: any[];
        preferences?: any;
        userProfile?: UserProfile;
    };
    metadata: {
        createdAt: Date;
        lastActivity: Date;
        messageCount: number;
    };
}

export interface UserProfile {
    _id: string;
    user_fullName: string;
    user_email: string | null;
    phoneNumber: string | null;
    user_role: string;
    user_avatar: string | null;
    user_sex: boolean | null;
    user_status: string;
    user_dayOfBirth: string | null;
    role_name?: string;
    isGuest: boolean;
    accessToken?: string;
}

export class ConversationMemoryStore {
    private redis: RedisClientType;
    private readonly keyPrefix = 'mcp:conversation:';
    private readonly contextKeyPrefix = 'mcp:context:';
    private readonly statsKeyPrefix = 'mcp:stats:';
    private readonly profileKeyPrefix = 'mcp:profile:';
    private readonly maxMessagesPerConversation = 100;
    private readonly sessionTimeout = 24 * 60 * 60; // 24 hours in seconds
    private isConnected = false;

    constructor() {
        this.redis = createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379',
            username: process.env.REDIS_USERNAME || 'default',
            password: process.env.REDIS_PASSWORD || '',
            socket: {
                reconnectStrategy: (retries) => Math.min(retries * 50, 500)
            }
        });

        this.redis.on('error', (err) => console.error('Redis Client Error:', err));
        this.redis.on('connect', () => {
            console.log('🔗 Connected to Redis for conversation memory');
            this.isConnected = true;
        });
        this.redis.on('disconnect', () => {
            console.log('📡 Disconnected from Redis');
            this.isConnected = false;
        });

        this.initialize();
    }

    private async initialize(): Promise<void> {
        try {
            await this.redis.connect();

            // Setup cleanup job for expired sessions
            setInterval(() => {
                this.cleanupExpiredSessions();
            }, 60 * 60 * 1000); // Every hour
        } catch (error) {
            console.error('Failed to connect to Redis:', error);
        }
    }

    /**
     * Get or create conversation session for socket ID
     */
    async getOrCreateSession(socketId: string, initialContext?: any): Promise<ConversationSession> {
        if (!this.isConnected) {
            throw new Error('Redis not connected');
        }

        try {
            // Get existing session
            const messagesKey = `${this.keyPrefix}${socketId}:messages`;
            const contextKey = `${this.contextKeyPrefix}${socketId}`;
            const statsKey = `${this.statsKeyPrefix}${socketId}`;

            const [messagesData, contextData, statsData] = await Promise.all([
                this.redis.lRange(messagesKey, 0, -1),
                this.redis.hGetAll(contextKey),
                this.redis.hGetAll(statsKey)
            ]);

            let session: ConversationSession;

            if (statsData.createdAt) {
                // Existing session
                const messages: ConversationMessage[] = messagesData.map(msg => JSON.parse(msg));

                session = {
                    socketId,
                    messages,
                    context: {
                        ...JSON.parse(contextData.data || '{}'),
                        ...initialContext
                    },
                    metadata: {
                        createdAt: new Date(statsData.createdAt),
                        lastActivity: new Date(),
                        messageCount: parseInt(statsData.messageCount || '0')
                    }
                };

                // Update last activity
                await this.redis.hSet(statsKey, 'lastActivity', new Date().toISOString());

                // Update context if provided
                if (initialContext) {
                    await this.redis.hSet(contextKey, 'data', JSON.stringify(session.context));
                }

                // Set expiration
                await Promise.all([
                    this.redis.expire(messagesKey, this.sessionTimeout),
                    this.redis.expire(contextKey, this.sessionTimeout),
                    this.redis.expire(statsKey, this.sessionTimeout)
                ]);

            } else {
                // New session
                session = {
                    socketId,
                    messages: [],
                    context: initialContext || {},
                    metadata: {
                        createdAt: new Date(),
                        lastActivity: new Date(),
                        messageCount: 0
                    }
                };

                // Save initial session data
                await Promise.all([
                    this.redis.hSet(contextKey, 'data', JSON.stringify(session.context)),
                    this.redis.hSet(statsKey, {
                        createdAt: session.metadata.createdAt.toISOString(),
                        lastActivity: session.metadata.lastActivity.toISOString(),
                        messageCount: '0'
                    }),
                    // Set expiration
                    this.redis.expire(messagesKey, this.sessionTimeout),
                    this.redis.expire(contextKey, this.sessionTimeout),
                    this.redis.expire(statsKey, this.sessionTimeout)
                ]);
            }

            return session;
        } catch (error) {
            console.error('Error getting/creating session:', error);
            // Fallback to empty session
            return {
                socketId,
                messages: [],
                context: initialContext || {},
                metadata: {
                    createdAt: new Date(),
                    lastActivity: new Date(),
                    messageCount: 0
                }
            };
        }
    }

    /**
     * Add message to conversation
     */
    async addMessage(socketId: string, message: Omit<ConversationMessage, 'socketId'>): Promise<void> {
        if (!this.isConnected) {
            console.warn('Redis not connected, skipping message storage');
            return;
        }

        try {
            const fullMessage: ConversationMessage = {
                ...message,
                socketId
            };

            const messagesKey = `${this.keyPrefix}${socketId}:messages`;
            const statsKey = `${this.statsKeyPrefix}${socketId}`;

            // Add message to list
            await this.redis.lPush(messagesKey, JSON.stringify(fullMessage));

            // Trim to max messages
            await this.redis.lTrim(messagesKey, 0, this.maxMessagesPerConversation - 1);

            // Update stats
            const currentCount = await this.redis.lLen(messagesKey);
            await this.redis.hSet(statsKey, {
                messageCount: currentCount.toString(),
                lastActivity: new Date().toISOString()
            });

            // Set expiration
            await Promise.all([
                this.redis.expire(messagesKey, this.sessionTimeout),
                this.redis.expire(statsKey, this.sessionTimeout)
            ]);

        } catch (error) {
            console.error('Error adding message:', error);
        }
    }

    /**
     * Get conversation history for AI context
     */
    async getConversationHistory(socketId: string, limit: number = 20): Promise<ConversationMessage[]> {
        if (!this.isConnected) {
            return [];
        }

        try {
            const messagesKey = `${this.keyPrefix}${socketId}:messages`;
            const messagesData = await this.redis.lRange(messagesKey, 0, limit - 1);

            return messagesData.map(msg => JSON.parse(msg)).reverse(); // Reverse to get chronological order
        } catch (error) {
            console.error('Error getting conversation history:', error);
            return [];
        }
    }

    /**
     * Update conversation context
     */
    async updateContext(socketId: string, context: any): Promise<void> {
        if (!this.isConnected) {
            return;
        }

        try {
            const contextKey = `${this.contextKeyPrefix}${socketId}`;

            // Get existing context
            const existingData = await this.redis.hGet(contextKey, 'data');
            const existingContext = existingData ? JSON.parse(existingData) : {};

            // Merge contexts
            const newContext = { ...existingContext, ...context };

            // Save updated context
            await this.redis.hSet(contextKey, 'data', JSON.stringify(newContext));
            await this.redis.expire(contextKey, this.sessionTimeout);
        } catch (error) {
            console.error('Error updating context:', error);
        }
    }

    /**
     * Get conversation context
     */
    async getContext(socketId: string): Promise<any> {
        if (!this.isConnected) {
            return {};
        }

        try {
            const contextKey = `${this.contextKeyPrefix}${socketId}`;
            const contextData = await this.redis.hGet(contextKey, 'data');

            return contextData ? JSON.parse(contextData) : {};
        } catch (error) {
            console.error('Error getting context:', error);
            return {};
        }
    }

    /**
     * Remove conversation session
     */
    async removeSession(socketId: string): Promise<void> {
        if (!this.isConnected) {
            await this.initialize();
        }

        try {
            const conversationKey = `${this.keyPrefix}${socketId}`;
            const contextKey = `${this.contextKeyPrefix}${socketId}`;
            const statsKey = `${this.statsKeyPrefix}${socketId}`;
            const profileKey = `${this.profileKeyPrefix}${socketId}`;

            await Promise.all([
                this.redis.del(conversationKey),
                this.redis.del(contextKey),
                this.redis.del(statsKey),
                this.redis.del(profileKey)
            ]);

            console.log(`🗑️ Session ${socketId} removed completely from Redis`);
        } catch (error) {
            console.error('❌ Error removing session:', error);
            throw error;
        }
    }

    /**
     * Get session statistics
     */
    async getSessionStats(socketId: string): Promise<any> {
        if (!this.isConnected) {
            return null;
        }

        try {
            const statsKey = `${this.statsKeyPrefix}${socketId}`;
            const contextKey = `${this.contextKeyPrefix}${socketId}`;

            const [statsData, contextData] = await Promise.all([
                this.redis.hGetAll(statsKey),
                this.redis.hGet(contextKey, 'data')
            ]);

            if (!statsData.createdAt) {
                return null;
            }

            const context = contextData ? JSON.parse(contextData) : {};

            return {
                messageCount: parseInt(statsData.messageCount || '0'),
                createdAt: statsData.createdAt ? new Date(statsData.createdAt) : new Date(),
                lastActivity: statsData.lastActivity ? new Date(statsData.lastActivity) : new Date(),
                duration: Date.now() - (statsData.createdAt ? new Date(statsData.createdAt).getTime() : Date.now()),
                hasContext: Object.keys(context).length > 0
            };
        } catch (error) {
            console.error('Error getting session stats:', error);
            return null;
        }
    }

    /**
     * Get all active sessions count
     */
    async getActiveSessionsCount(): Promise<number> {
        if (!this.isConnected) {
            return 0;
        }

        try {
            const keys = await this.redis.keys(`${this.statsKeyPrefix}*`);
            return keys.length;
        } catch (error) {
            console.error('Error getting active sessions count:', error);
            return 0;
        }
    }

    /**
     * Cleanup expired sessions (Redis handles this automatically, but we can do manual cleanup)
     */
    private async cleanupExpiredSessions(): Promise<void> {
        if (!this.isConnected) {
            return;
        }

        try {
            const keys = await this.redis.keys(`${this.statsKeyPrefix}*`);
            let expiredCount = 0;

            for (const key of keys) {
                const ttl = await this.redis.ttl(key);
                if (ttl === -1) { // No expiration set
                    await this.redis.expire(key, this.sessionTimeout);
                }
            }

            if (expiredCount > 0) {
                console.log(`🧹 Redis cleanup: ${expiredCount} expired sessions handled`);
            }
        } catch (error) {
            console.error('Error in cleanup:', error);
        }
    }

    /**
     * Export conversation for debugging
     */
    async exportConversation(socketId: string): Promise<any> {
        if (!this.isConnected) {
            return null;
        }

        try {
            const session = await this.getOrCreateSession(socketId);
            return {
                socketId: session.socketId,
                messages: session.messages,
                context: session.context,
                metadata: session.metadata
            };
        } catch (error) {
            console.error('Error exporting conversation:', error);
            return null;
        }
    }

    /**
     * Get Redis connection status
     */
    isRedisConnected(): boolean {
        return this.isConnected;
    }

    /**
     * Close Redis connection
     */
    async close(): Promise<void> {
        if (this.redis) {
            await this.redis.quit();
        }
    }

    async saveUserProfile(socketId: string, profile: UserProfile): Promise<void> {
        if (!this.isConnected) {
            await this.initialize();
        }

        try {
            const profileKey = `${this.profileKeyPrefix}${socketId}`;
            await this.redis.setEx(profileKey, this.sessionTimeout, JSON.stringify(profile));

            await this.updateContext(socketId, { userProfile: profile });

            console.log(`✅ Profile saved for socket: ${socketId}`);
        } catch (error) {
            console.error('❌ Error saving user profile:', error);
            throw error;
        }
    }

    async getUserProfile(socketId: string): Promise<UserProfile | null> {
        if (!this.isConnected) {
            await this.initialize();
        }

        try {
            const profileKey = `${this.profileKeyPrefix}${socketId}`;
            const profileData = await this.redis.get(profileKey);

            if (profileData) {
                return JSON.parse(profileData) as UserProfile;
            }

            return null;
        } catch (error) {
            console.error('❌ Error getting user profile:', error);
            return null;
        }
    }

    async removeUserProfile(socketId: string): Promise<void> {
        if (!this.isConnected) {
            await this.initialize();
        }

        try {
            const profileKey = `${this.profileKeyPrefix}${socketId}`;
            await this.redis.del(profileKey);
            console.log(`🗑️ Profile removed for socket: ${socketId}`);
        } catch (error) {
            console.error('❌ Error removing user profile:', error);
        }
    }
}

// Singleton instance
export const conversationMemory = new ConversationMemoryStore(); 