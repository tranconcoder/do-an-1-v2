import mongoose, { Schema } from 'mongoose';
import { USER_MODEL_NAME } from './user.model.js';

export const CONVERSATION_MODEL_NAME = 'conversations';
export const CONVERSATION_COLLECTION_NAME = 'conversations';

const conversationSchema = new Schema(
    {
        // Participants in the conversation
        conversation_participants: [
            {
                user: {
                    type: Schema.Types.ObjectId,
                    ref: USER_MODEL_NAME,
                    required: true
                },
                // When user joined the conversation
                joined_at: {
                    type: Date,
                    default: Date.now
                },
                // When user last read messages
                last_read_at: {
                    type: Date,
                    default: Date.now
                },
                // Unread message count for this user
                unread_count: {
                    type: Number,
                    default: 0
                }
            }
        ],

        // Conversation type (direct message, group, support, etc.)
        conversation_type: {
            type: String,
            enum: ['direct', 'group', 'support'],
            default: 'direct'
        },

        // Conversation name (optional, for groups)
        conversation_name: {
            type: String,
            trim: true,
            maxlength: 100,
            default: null
        },

        // Last message information
        conversation_last_message: {
            message: {
                type: Schema.Types.ObjectId,
                ref: 'messages',
                default: null
            },
            content: {
                type: String,
                default: ''
            },
            sender: {
                type: Schema.Types.ObjectId,
                ref: USER_MODEL_NAME,
                default: null
            },
            timestamp: {
                type: Date,
                default: null
            },
            type: {
                type: String,
                enum: ['text', 'image', 'file', 'system'],
                default: 'text'
            }
        },

        // Total message count in conversation
        conversation_message_count: {
            type: Number,
            default: 0
        },

        // Conversation status
        conversation_status: {
            type: String,
            enum: ['active', 'archived', 'blocked'],
            default: 'active'
        },

        // Conversation metadata
        conversation_metadata: {
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
        collection: CONVERSATION_COLLECTION_NAME
    }
);

// Indexes for performance
conversationSchema.index({ 'conversation_participants.user': 1 });
conversationSchema.index({ conversation_type: 1 });
conversationSchema.index({ 'conversation_last_message.timestamp': -1 });
conversationSchema.index({ conversation_status: 1 });
conversationSchema.index({ updated_at: -1 });

// Compound index for finding direct conversations between two users
conversationSchema.index({
    'conversation_participants.user': 1,
    conversation_type: 1
});

const conversationModel = mongoose.model<model.conversation.ConversationSchema>(CONVERSATION_MODEL_NAME, conversationSchema);

export default conversationModel;

// Types
declare global {
    namespace model {
        namespace conversation {
            interface ConversationParticipant {
                user: moduleTypes.mongoose.ObjectId;
                joined_at: Date;
                last_read_at: Date;
                unread_count: number;
            }

            interface ConversationLastMessage {
                message?: moduleTypes.mongoose.ObjectId;
                content: string;
                sender?: moduleTypes.mongoose.ObjectId;
                timestamp?: Date;
                type: 'text' | 'image' | 'file' | 'system';
            }

            interface ConversationSchema {
                _id: moduleTypes.mongoose.ObjectId;
                conversation_participants: ConversationParticipant[];
                conversation_type: 'direct' | 'group' | 'support';
                conversation_name?: string;
                conversation_last_message: ConversationLastMessage;
                conversation_message_count: number;
                conversation_status: 'active' | 'archived' | 'blocked';
                conversation_metadata: Record<string, any>;
                is_deleted: boolean;
                deleted_at?: Date;
                created_at: Date;
                updated_at: Date;
            }
        }
    }
} 