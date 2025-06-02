import messageModel from '@/models/message.model.js';
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
export const createMessage = async (payload: {
    message_content: string;
    message_type?: 'text' | 'image' | 'file' | 'system';
    message_sender: string | mongoose.Types.ObjectId;
    message_receiver: string | mongoose.Types.ObjectId;
    message_conversation: string | mongoose.Types.ObjectId;
    message_media?: string | mongoose.Types.ObjectId;
    message_metadata?: Record<string, any>;
}) => {
    return await messageModel.create(payload);
};

/* ---------------------------------------------------------- */
/*                             Read                           */
/* ---------------------------------------------------------- */
export const findMessageById = generateFindById<model.message.MessageSchema>(messageModel);

export const findMessages = generateFindAll<model.message.MessageSchema>(messageModel);

export const findOneMessage = generateFindOne<model.message.MessageSchema>(messageModel);

export const findMessagesByConversation = ({
    conversationId,
    limit = 100,
    page = 1,
    options
}: {
    conversationId: string;
    limit?: number;
    page?: number;
    options?: {
        populate?: any;
        lean?: boolean;
        sort?: any;
    };
}) => {
    const skip = (page - 1) * limit;
    const query = messageModel.find({
        message_conversation: new mongoose.Types.ObjectId(conversationId),
        is_deleted: false
    });

    query.sort({ created_at: -1 });
    query.limit(limit);
    query.skip(skip);

    if (options?.populate) query.populate(options.populate);
    if (options?.lean) query.lean();
    if (options?.sort) query.sort(options.sort);

    return query;
};

export const getMessageCountByConversation = (conversationId: string) => {
    return messageModel.countDocuments({
        message_conversation: new mongoose.Types.ObjectId(conversationId),
        is_deleted: false
    });
};

/* ---------------------------------------------------------- */
/*                           Update                           */
/* ---------------------------------------------------------- */
export const findOneAndUpdateMessage = generateFindOneAndUpdate<model.message.MessageSchema>(messageModel);

export const updateMessageStatus = async (messageId: string, status: 'sent' | 'delivered' | 'read') => {
    const updateData: any = { message_status: status };

    if (status === 'read') {
        updateData.message_read_at = new Date();
    }

    return await messageModel.findByIdAndUpdate(
        messageId,
        updateData,
        { new: true }
    );
};

export const markMessagesAsRead = async (conversationId: string, userId: string) => {
    return await messageModel.updateMany(
        {
            message_conversation: new mongoose.Types.ObjectId(conversationId),
            message_receiver: new mongoose.Types.ObjectId(userId),
            message_status: { $ne: 'read' }
        },
        {
            message_status: 'read',
            message_read_at: new Date()
        }
    );
};

/* ---------------------------------------------------------- */
/*                           Delete                           */
/* ---------------------------------------------------------- */
export const deleteMessage = async (messageId: string) => {
    return await messageModel.findByIdAndUpdate(
        messageId,
        {
            is_deleted: true,
            deleted_at: new Date()
        },
        { new: true }
    );
};

export const hardDeleteMessage = async (messageId: string) => {
    return await messageModel.findByIdAndDelete(messageId);
}; 