import '';

declare global {
    namespace service {
        namespace chat {
            /* ====================================================== */
            /*                       DEFINITION                       */
            /* ====================================================== */
            namespace definition {
                interface UserInfo {
                    id: string;
                    fullName: string;
                    email: string;
                    avatar?: string;
                    phoneNumber?: string;
                    isOnline?: boolean;
                }

                interface MessageInfo {
                    _id: string;
                    content: string;
                    type: 'text' | 'image' | 'file' | 'system';
                    sender: UserInfo;
                    receiver: UserInfo;
                    status: 'sent' | 'delivered' | 'read';
                    media?: {
                        id: string;
                        fileName: string;
                        filePath: string;
                        mimeType: string;
                    };
                    metadata?: Record<string, any>;
                    timestamp: Date;
                    read_at?: Date;
                }

                interface ConversationInfo {
                    _id: string;
                    type: 'direct' | 'group' | 'support';
                    name: string;
                    participants: Array<{
                        user: UserInfo;
                        joined_at: Date;
                        last_read_at: Date;
                        unread_count: number;
                    }>;
                    lastMessage?: {
                        content: string;
                        type: 'text' | 'image' | 'file' | 'system';
                        timestamp: Date;
                        sender?: UserInfo;
                    };
                    messageCount: number;
                    unreadCount: number;
                    status: 'active' | 'archived' | 'blocked';
                    updated_at: Date;
                    isOnline?: boolean;
                }

                interface ConversationsResponse {
                    conversations: ConversationInfo[];
                    pagination: {
                        page: number;
                        limit: number;
                        hasMore: boolean;
                    };
                }

                interface MessagesResponse {
                    messages: MessageInfo[];
                    pagination: {
                        page: number;
                        limit: number;
                        totalCount: number;
                        totalPages: number;
                        hasMore: boolean;
                    };
                    conversationInfo: {
                        _id: string;
                        type: 'direct' | 'group' | 'support';
                        name?: string;
                        messageCount: number;
                        status: string;
                    };
                }

                interface StartConversationResponse {
                    conversation: {
                        _id: string;
                        type: 'direct' | 'group' | 'support';
                        participants: UserInfo[];
                        messageCount: number;
                        status: string;
                        created_at: Date;
                        isOnline?: boolean;
                    };
                }

                interface SearchUsersResponse {
                    users: UserInfo[];
                    query: string;
                }

                interface OnlineUsersResponse {
                    users: UserInfo[];
                    count: number;
                }
            }

            /* ====================================================== */
            /*                        ARGUMENTS                       */
            /* ====================================================== */
            namespace arguments {
                interface GetConversations {
                    userId: string;
                    limit?: number;
                    page?: number;
                }

                interface GetMessages {
                    userId: string;
                    conversationId: string;
                    limit?: number;
                    page?: number;
                }

                interface StartDirectConversation {
                    userId: string;
                    targetUserId: string;
                }

                interface SearchUsers {
                    userId: string;
                    query: string;
                    limit?: number;
                }

                interface SendMessage {
                    receiverId: string;
                    content: string;
                    type?: 'text' | 'image' | 'file';
                }

                interface MarkAsRead {
                    conversationId: string;
                    messageIds?: string[];
                }

                interface JoinConversation {
                    conversationId: string;
                }

                interface TypingEvent {
                    conversationId: string;
                    receiverId?: string;
                }
            }

            /* ====================================================== */
            /*                       RETURN TYPE                      */
            /* ====================================================== */
            namespace returnType {
                interface GetConversations extends definition.ConversationsResponse { }
                interface GetMessages extends definition.MessagesResponse { }
                interface StartDirectConversation extends definition.StartConversationResponse { }
                interface SearchUsers extends definition.SearchUsersResponse { }
                interface OnlineUsers extends definition.OnlineUsersResponse { }
            }
        }
    }
} 