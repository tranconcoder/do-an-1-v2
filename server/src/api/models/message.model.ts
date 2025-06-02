import mongoose, { Schema } from 'mongoose';
import { USER_MODEL_NAME } from './user.model.js';
import { MEDIA_MODEL_NAME } from './media.model.js';
import { CONVERSATION_MODEL_NAME } from './conversation.model.js';

export const MESSAGE_MODEL_NAME = 'messages';
export const MESSAGE_COLLECTION_NAME = 'messages';

const messageSchema = new Schema(
    {
        // Message content
        message_content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000
        },

        // Message type (text, image, file, etc.)
        message_type: {
            type: String,
            enum: ['text', 'image', 'file', 'system'],
            default: 'text'
        },

        // Sender information
        message_sender: {
            type: Schema.Types.ObjectId,
            ref: USER_MODEL_NAME,
            required: true
        },

        // Receiver information  
        message_receiver: {
            type: Schema.Types.ObjectId,
            ref: USER_MODEL_NAME,
            required: true
        },

        // Conversation reference
        message_conversation: {
            type: Schema.Types.ObjectId,
            ref: CONVERSATION_MODEL_NAME,
            required: true
        },

        // Message status
        message_status: {
            type: String,
            enum: ['sent', 'delivered', 'read'],
            default: 'sent'
        },

        // Read timestamp
        message_read_at: {
            type: Date,
            default: null
        },

        // File/media information (if applicable)
        message_media: {
            type: Schema.Types.ObjectId,
            ref: MEDIA_MODEL_NAME,
            default: null
        },

        // Message metadata
        message_metadata: {
            type: Schema.Types.Mixed,
            default: {}
        },

        // Soft delete
        is_deleted: {
            type: Boolean,
            default: false
        },

        deleted_at: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        },
        collection: MESSAGE_COLLECTION_NAME
    }
);

// Indexes for performance
messageSchema.index({ message_conversation: 1, created_at: -1 });
messageSchema.index({ message_sender: 1, message_receiver: 1 });
messageSchema.index({ message_conversation: 1, message_status: 1 });
messageSchema.index({ created_at: -1 });

const messageModel = mongoose.model<model.message.MessageSchema>(MESSAGE_MODEL_NAME, messageSchema);

export default messageModel;

// Types
declare global {
    namespace model {
        namespace message {
            interface MessageSchema {
                _id: moduleTypes.mongoose.ObjectId;
                message_content: string;
                message_type: 'text' | 'image' | 'file' | 'system';
                message_sender: moduleTypes.mongoose.ObjectId;
                message_receiver: moduleTypes.mongoose.ObjectId;
                message_conversation: moduleTypes.mongoose.ObjectId;
                message_status: 'sent' | 'delivered' | 'read';
                message_read_at?: Date;
                message_media?: moduleTypes.mongoose.ObjectId;
                message_metadata: Record<string, any>;
                is_deleted: boolean;
                deleted_at?: Date;
                created_at: Date;
                updated_at: Date;
            }
        }
    }
} 