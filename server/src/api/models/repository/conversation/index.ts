import conversationModel from '@/models/conversation.model.js';
import mongoose from 'mongoose';
import {
    generateFindById,
    generateFindOne,
    generateFindOneAndUpdate,
    generateFindAll
} from '@/utils/mongoose.util.js';

/* ---------------------------------------------------------- */
/*                           Create                           */
/* ---------------------------------------------------------- */
export const createConversation = async (payload: {
    conversation_participants: Array<{
        user: string | mongoose.Types.ObjectId;
        joined_at?: Date;
        last_read_at?: Date;
        unread_count?: number;
    }>;
    conversation_type?: 'direct' | 'group' | 'support';
    conversation_name?: string;
    conversation_metadata?: Record<string, any>;
}) => {
    return await conversationModel.create(payload);
};

export const findOrCreateDirectConversation = async (userId1: string, userId2: string) => {
    // Find existing conversation between two users
    const existingConversation = await conversationModel.findOne({
        conversation_type: 'direct',
        'conversation_participants.user': {
            $all: [
                new mongoose.Types.ObjectId(userId1),
                new mongoose.Types.ObjectId(userId2)
            ]
        },
        is_deleted: false
    });

    if (existingConversation) {
        return existingConversation;
    }

    // Create new conversation
    return await createConversation({
        conversation_participants: [
            {
                user: new mongoose.Types.ObjectId(userId1),
                joined_at: new Date(),
                last_read_at: new Date(),
                unread_count: 0
            },
            {
                user: new mongoose.Types.ObjectId(userId2),
                joined_at: new Date(),
                last_read_at: new Date(),
                unread_count: 0
            }
        ],
        conversation_type: 'direct'
    });
};

/* ---------------------------------------------------------- */
/*                             Read                           */
/* ---------------------------------------------------------- */
export const findConversationById = generateFindById<model.conversation.ConversationSchema>(conversationModel);

export const findConversations = generateFindAll<model.conversation.ConversationSchema>(conversationModel);

export const findOneConversation = generateFindOne<model.conversation.ConversationSchema>(conversationModel);

export const findUserConversations = ({
    userId,
    limit = 50,
    page = 1,
    options
}: {
    userId: string;
    limit?: number;
    page?: number;
    options?: {
        populate?: any;
        lean?: boolean;
        sort?: any;
    };
}) => {
    const skip = (page - 1) * limit;
    const query = conversationModel.find({
        'conversation_participants.user': new mongoose.Types.ObjectId(userId),
        conversation_status: 'active',
        is_deleted: false
    });

    query.sort({ 'conversation_last_message.timestamp': -1 });
    query.limit(limit);
    query.skip(skip);

    if (options?.populate) query.populate(options.populate);
    if (options?.lean) query.lean();
    if (options?.sort) query.sort(options.sort);

    return query;
};

export const getConversationCountByUser = (userId: string) => {
    return conversationModel.countDocuments({
        'conversation_participants.user': new mongoose.Types.ObjectId(userId),
        conversation_status: 'active',
        is_deleted: false
    });
};

/* ---------------------------------------------------------- */
/*                           Update                           */
/* ---------------------------------------------------------- */
export const findOneAndUpdateConversation = generateFindOneAndUpdate<model.conversation.ConversationSchema>(conversationModel);

export const updateConversationLastMessage = async (
    conversationId: string,
    messageId: string,
    content: string,
    senderId: string,
    messageType: 'text' | 'image' | 'file' | 'system' = 'text'
) => {
    return await conversationModel.findByIdAndUpdate(
        conversationId,
        {
            $set: {
                'conversation_last_message.message': new mongoose.Types.ObjectId(messageId),
                'conversation_last_message.content': content,
                'conversation_last_message.sender': new mongoose.Types.ObjectId(senderId),
                'conversation_last_message.timestamp': new Date(),
                'conversation_last_message.type': messageType
            },
            $inc: {
                conversation_message_count: 1
            }
        },
        { new: true }
    );
};

export const updateParticipantLastRead = async (conversationId: string, userId: string) => {
    return await conversationModel.findOneAndUpdate(
        {
            _id: new mongoose.Types.ObjectId(conversationId),
            'conversation_participants.user': new mongoose.Types.ObjectId(userId)
        },
        {
            $set: {
                'conversation_participants.$.last_read_at': new Date(),
                'conversation_participants.$.unread_count': 0
            }
        },
        { new: true }
    );
};

export const incrementUnreadCount = async (conversationId: string, userId: string) => {
    return await conversationModel.findOneAndUpdate(
        {
            _id: new mongoose.Types.ObjectId(conversationId),
            'conversation_participants.user': new mongoose.Types.ObjectId(userId)
        },
        {
            $inc: {
                'conversation_participants.$.unread_count': 1
            }
        },
        { new: true }
    );
};

/* ---------------------------------------------------------- */
/*                           Delete                           */
/* ---------------------------------------------------------- */
export const deleteConversation = async (conversationId: string) => {
    return await conversationModel.findByIdAndUpdate(
        conversationId,
        {
            is_deleted: true,
            deleted_at: new Date()
        },
        { new: true }
    );
};

export const hardDeleteConversation = async (conversationId: string) => {
    return await conversationModel.findByIdAndDelete(conversationId);
}; 