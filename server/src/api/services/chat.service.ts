import { NotFoundErrorResponse, BadRequestErrorResponse } from '@/response/error.response.js';
import { findUserById } from '@/models/repository/user/index.js';
import {
    findUserConversations,
    findConversationById,
    findOrCreateDirectConversation,
    updateParticipantLastRead
} from '@/models/repository/conversation/index.js';
import {
    findMessagesByConversation,
    getMessageCountByConversation,
    markMessagesAsRead
} from '@/models/repository/message/index.js';
import SocketIOService from './socketio.service.js';
// Import models to ensure they're registered for population
import '@/models/user.model.js';
import '@/models/media.model.js';

export default new (class ChatService {
    /* ---------------------------------------------------------- */
    /*                     Get Conversations                     */
    /* ---------------------------------------------------------- */
    public async getUserConversations({
        userId,
        limit = 20,
        page = 1
    }: {
        userId: string;
        limit?: number;
        page?: number;
    }) {
        // Check if user exists
        const user = await findUserById({
            id: userId,
            options: { lean: true },
            only: ['_id']
        });
        if (!user) {
            throw new NotFoundErrorResponse({ message: 'User not found!' });
        }

        // Get conversations with populated data
        const conversations = await findUserConversations({
            userId,
            limit,
            page,
            options: {
                lean: true,
                populate: [
                    {
                        path: 'conversation_participants.user',
                        select: '_id user_fullName user_email user_avatar phoneNumber'
                    },
                    {
                        path: 'conversation_last_message.sender',
                        select: '_id user_fullName user_avatar'
                    }
                ]
            }
        });

        // Format conversations for response
        const formattedConversations = conversations.map((conversation: any) => {
            // Get the other participant (for direct conversations)
            const otherParticipant = conversation.conversation_participants.find(
                (participant: any) => participant.user._id.toString() !== userId
            );

            // Get current user's conversation data
            const userParticipant = conversation.conversation_participants.find(
                (participant: any) => participant.user._id.toString() === userId
            );

            return {
                _id: conversation._id,
                type: conversation.conversation_type,
                name: conversation.conversation_name || otherParticipant?.user?.user_fullName || 'Unknown',
                participants: conversation.conversation_participants.map((p: any) => ({
                    user: {
                        id: p.user._id,
                        fullName: p.user.user_fullName,
                        email: p.user.user_email,
                        avatar: p.user.user_avatar,
                        phoneNumber: p.user.phoneNumber
                    },
                    joined_at: p.joined_at,
                    last_read_at: p.last_read_at,
                    unread_count: p.unread_count
                })),
                lastMessage: conversation.conversation_last_message?.content ? {
                    content: conversation.conversation_last_message.content,
                    type: conversation.conversation_last_message.type,
                    timestamp: conversation.conversation_last_message.timestamp,
                    sender: conversation.conversation_last_message.sender ? {
                        id: conversation.conversation_last_message.sender._id,
                        fullName: conversation.conversation_last_message.sender.user_fullName,
                        avatar: conversation.conversation_last_message.sender.user_avatar
                    } : null
                } : null,
                messageCount: conversation.conversation_message_count,
                unreadCount: userParticipant?.unread_count || 0,
                status: conversation.conversation_status,
                updated_at: conversation.updated_at,
                isOnline: otherParticipant ? SocketIOService.getInstance().isUserOnline(otherParticipant.user._id.toString()) : false
            };
        });

        return {
            conversations: formattedConversations,
            pagination: {
                page,
                limit,
                hasMore: formattedConversations.length === limit
            }
        };
    }

    /* ---------------------------------------------------------- */
    /*                    Get Conversation Messages              */
    /* ---------------------------------------------------------- */
    public async getConversationMessages({
        userId,
        conversationId,
        limit = 100,
        page = 1
    }: {
        userId: string;
        conversationId: string;
        limit?: number;
        page?: number;
    }) {
        // Check if user exists
        const user = await findUserById({
            id: userId,
            options: { lean: true },
            only: ['_id']
        });
        if (!user) {
            throw new NotFoundErrorResponse({ message: 'User not found!' });
        }

        // Check if conversation exists and user is participant
        const conversation = await findConversationById({
            id: conversationId,
            options: { lean: true }
        });
        if (!conversation) {
            throw new NotFoundErrorResponse({ message: 'Conversation not found!' });
        }

        // Check if user is a participant in this conversation
        const isParticipant = conversation.conversation_participants.some(
            (participant: any) => participant.user.toString() === userId
        );
        if (!isParticipant) {
            throw new BadRequestErrorResponse({ message: 'You are not a participant in this conversation!' });
        }

        // Get messages with populated data
        const messages = await findMessagesByConversation({
            conversationId,
            limit,
            page,
            options: {
                lean: true,
                populate: [
                    {
                        path: 'message_sender',
                        select: '_id user_fullName user_email user_avatar'
                    },
                    {
                        path: 'message_receiver',
                        select: '_id user_fullName user_email user_avatar'
                    },
                    {
                        path: 'message_media',
                        select: '_id media_fileName media_filePath media_mimeType'
                    }
                ],
                sort: { created_at: -1 } // Get most recent messages first
            }
        });

        // Get total message count
        const totalCount = await getMessageCountByConversation(conversationId);

        // Format messages for response and reverse to show chronological order
        const formattedMessages = messages.map((message: any) => ({
            _id: message._id,
            content: message.message_content,
            type: message.message_type,
            sender: {
                id: message.message_sender._id,
                fullName: message.message_sender.user_fullName,
                email: message.message_sender.user_email,
                avatar: message.message_sender.user_avatar
            },
            receiver: {
                id: message.message_receiver._id,
                fullName: message.message_receiver.user_fullName,
                email: message.message_receiver.user_email,
                avatar: message.message_receiver.user_avatar
            },
            status: message.message_status,
            media: message.message_media ? {
                id: message.message_media._id,
                fileName: message.message_media.media_fileName,
                filePath: message.message_media.media_filePath,
                mimeType: message.message_media.media_mimeType
            } : null,
            metadata: message.message_metadata,
            timestamp: message.created_at,
            read_at: message.message_read_at
        })).reverse(); // Reverse to maintain chronological order for display

        // Mark messages as read (if they're received by current user)
        await markMessagesAsRead(conversationId, userId);
        await updateParticipantLastRead(conversationId, userId);

        return {
            messages: formattedMessages,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                hasMore: page * limit < totalCount
            },
            conversationInfo: {
                _id: conversation._id,
                type: conversation.conversation_type,
                name: conversation.conversation_name,
                messageCount: conversation.conversation_message_count,
                status: conversation.conversation_status
            }
        };
    }

    /* ---------------------------------------------------------- */
    /*                   Start Direct Conversation               */
    /* ---------------------------------------------------------- */
    public async startDirectConversation({
        userId,
        targetUserId
    }: {
        userId: string;
        targetUserId: string;
    }) {
        if (userId === targetUserId) {
            throw new BadRequestErrorResponse({ message: 'Cannot start conversation with yourself!' });
        }

        // Check if both users exist
        const [user, targetUser] = await Promise.all([
            findUserById({
                id: userId,
                options: { lean: true },
                only: ['_id', 'user_fullName', 'user_email', 'user_avatar']
            }),
            findUserById({
                id: targetUserId,
                options: { lean: true },
                only: ['_id', 'user_fullName', 'user_email', 'user_avatar']
            })
        ]);

        if (!user) {
            throw new NotFoundErrorResponse({ message: 'User not found!' });
        }
        if (!targetUser) {
            throw new NotFoundErrorResponse({ message: 'Target user not found!' });
        }

        // Find or create conversation
        const conversation = await findOrCreateDirectConversation(userId, targetUserId);

        // Format response
        return {
            conversation: {
                _id: conversation._id,
                type: conversation.conversation_type,
                participants: [
                    {
                        id: user._id,
                        fullName: user.user_fullName,
                        email: user.user_email,
                        avatar: user.user_avatar
                    },
                    {
                        id: targetUser._id,
                        fullName: targetUser.user_fullName,
                        email: targetUser.user_email,
                        avatar: targetUser.user_avatar
                    }
                ],
                messageCount: conversation.conversation_message_count,
                status: conversation.conversation_status,
                created_at: conversation.created_at,
                isOnline: SocketIOService.getInstance().isUserOnline(targetUserId)
            }
        };
    }

    /* ---------------------------------------------------------- */
    /*                      Search Users                         */
    /* ---------------------------------------------------------- */
    public async searchUsers({
        userId,
        query,
        limit = 10
    }: {
        userId: string;
        query: string;
        limit?: number;
    }) {
        if (!query.trim()) {
            throw new BadRequestErrorResponse({ message: 'Search query is required!' });
        }

        // Create search regex
        const searchRegex = new RegExp(query.trim(), 'i');

        // Import user model to search
        const { userModel } = await import('@/models/user.model.js');

        // Search users (exclude current user)
        const users = await userModel.find({
            _id: { $ne: userId },
            $or: [
                { user_fullName: searchRegex },
                { user_email: searchRegex },
                { phoneNumber: searchRegex }
            ]
        })
            .select('_id user_fullName user_email user_avatar phoneNumber')
            .limit(limit)
            .lean();

        // Format response
        const formattedUsers = users.map((user: any) => ({
            id: user._id,
            fullName: user.user_fullName,
            email: user.user_email,
            avatar: user.user_avatar,
            phoneNumber: user.phoneNumber,
            isOnline: SocketIOService.getInstance().isUserOnline(user._id.toString())
        }));

        return {
            users: formattedUsers,
            query: query.trim()
        };
    }

    /* ---------------------------------------------------------- */
    /*                   Get Online Users                        */
    /* ---------------------------------------------------------- */
    public async getOnlineUsers() {
        const onlineUserIds = SocketIOService.getInstance().getConnectedUsers();

        if (onlineUserIds.length === 0) {
            return { users: [] };
        }

        // Import user model
        const { userModel } = await import('@/models/user.model.js');

        // Get user details
        const users = await userModel.find({
            _id: { $in: onlineUserIds }
        })
            .select('_id user_fullName user_email user_avatar')
            .lean();

        // Format response
        const formattedUsers = users.map((user: any) => ({
            id: user._id,
            fullName: user.user_fullName,
            email: user.user_email,
            avatar: user.user_avatar,
            isOnline: true
        }));

        return {
            users: formattedUsers,
            count: formattedUsers.length
        };
    }
})(); 