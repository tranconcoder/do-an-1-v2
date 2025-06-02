import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../configs/axios';

// Async thunks for API calls
export const fetchConversations = createAsyncThunk(
    'chat/fetchConversations',
    async ({ limit = 20, page = 1 }, { rejectWithValue }) => {
        try {
            const response = await axiosClient.get('/chat/conversations', {
                params: { limit, page }
            });
            return response.data.metadata;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch conversations'
            );
        }
    }
);

export const fetchMessages = createAsyncThunk(
    'chat/fetchMessages',
    async ({ conversationId, limit = 100, page = 1 }, { rejectWithValue }) => {
        try {
            const response = await axiosClient.get(
                `/chat/conversations/${conversationId}/messages`,
                {
                    params: { limit, page }
                }
            );
            return { conversationId, ...response.data.metadata };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages');
        }
    }
);

export const startConversation = createAsyncThunk(
    'chat/startConversation',
    async ({ targetUserId }, { rejectWithValue }) => {
        try {
            const response = await axiosClient.post('/chat/conversations', {
                targetUserId
            });
            return response.data.metadata;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to start conversation');
        }
    }
);

export const searchUsers = createAsyncThunk(
    'chat/searchUsers',
    async ({ query, limit = 10 }, { rejectWithValue }) => {
        try {
            const response = await axiosClient.get('/chat/users/search', {
                params: { q: query, limit }
            });
            return response.data.metadata;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to search users');
        }
    }
);

export const fetchOnlineUsers = createAsyncThunk(
    'chat/fetchOnlineUsers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosClient.get('/chat/users/online');
            return response.data.metadata;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch online users');
        }
    }
);

const initialState = {
    // Conversations
    conversations: [],
    conversationsLoading: false,
    conversationsError: null,
    conversationsPagination: {
        page: 1,
        limit: 20,
        hasMore: false
    },

    // Messages
    messages: {}, // { conversationId: { messages: [], pagination: {}, loading: false, error: null } }
    activeConversationId: null,

    // Users
    searchResults: [],
    searchLoading: false,
    searchError: null,
    searchQuery: '',

    // Online users
    onlineUsers: [],
    onlineUsersLoading: false,
    onlineUsersError: null,

    // Socket connection
    isConnected: false,
    connectionError: null,

    // Typing indicators
    typingUsers: {}, // { conversationId: [userId, userId] }

    // Unread counts
    totalUnreadCount: 0,

    // Current user typing
    isTyping: false,
    typingConversationId: null
};

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        // Socket connection
        setConnected: (state, action) => {
            state.isConnected = action.payload;
            if (action.payload) {
                state.connectionError = null;
            }
        },
        setConnectionError: (state, action) => {
            state.connectionError = action.payload;
            state.isConnected = false;
        },

        // Active conversation
        setActiveConversation: (state, action) => {
            state.activeConversationId = action.payload;
        },

        // Real-time message updates
        addMessage: (state, action) => {
            const { conversationId, message } = action.payload;

            if (!state.messages[conversationId]) {
                state.messages[conversationId] = {
                    messages: [],
                    pagination: {
                        page: 1,
                        limit: 100,
                        totalCount: 0,
                        totalPages: 0,
                        hasMore: false
                    },
                    loading: false,
                    error: null
                };
            }

            state.messages[conversationId].messages.push(message);
            state.messages[conversationId].pagination.totalCount++;

            // Update conversation last message
            const conversation = state.conversations.find((c) => c._id === conversationId);
            if (conversation) {
                conversation.lastMessage = {
                    content: message.content,
                    type: message.type,
                    timestamp: message.timestamp,
                    sender: message.sender
                };
                conversation.updated_at = message.timestamp;

                // Update unread count if message is not from current user
                if (
                    message.sender.id !== conversation.currentUserId &&
                    conversationId !== state.activeConversationId
                ) {
                    conversation.unreadCount = (conversation.unreadCount || 0) + 1;
                    state.totalUnreadCount++;
                }

                // Move conversation to top
                const index = state.conversations.findIndex((c) => c._id === conversationId);
                if (index > 0) {
                    const [conv] = state.conversations.splice(index, 1);
                    state.conversations.unshift(conv);
                }
            }
        },

        // Update message status
        updateMessageStatus: (state, action) => {
            const { conversationId, messageId, status } = action.payload;

            if (state.messages[conversationId]) {
                const message = state.messages[conversationId].messages.find(
                    (m) => m._id === messageId
                );
                if (message) {
                    message.status = status;
                }
            }
        },

        // Mark conversation as read
        markConversationAsRead: (state, action) => {
            const conversationId = action.payload;
            const conversation = state.conversations.find((c) => c._id === conversationId);

            if (conversation && conversation.unreadCount > 0) {
                state.totalUnreadCount -= conversation.unreadCount;
                conversation.unreadCount = 0;
            }

            // Mark messages as read
            if (state.messages[conversationId]) {
                state.messages[conversationId].messages.forEach((message) => {
                    if (message.status !== 'read') {
                        message.read_at = new Date().toISOString();
                    }
                });
            }
        },

        // Typing indicators
        setUserTyping: (state, action) => {
            const { conversationId, userId, user } = action.payload;

            if (!state.typingUsers[conversationId]) {
                state.typingUsers[conversationId] = [];
            }

            const existingIndex = state.typingUsers[conversationId].findIndex(
                (u) => u.userId === userId
            );
            if (existingIndex === -1) {
                state.typingUsers[conversationId].push({ userId, user });
            }
        },

        setUserStopTyping: (state, action) => {
            const { conversationId, userId } = action.payload;

            if (state.typingUsers[conversationId]) {
                state.typingUsers[conversationId] = state.typingUsers[conversationId].filter(
                    (u) => u.userId !== userId
                );

                if (state.typingUsers[conversationId].length === 0) {
                    delete state.typingUsers[conversationId];
                }
            }
        },

        // Current user typing
        setCurrentUserTyping: (state, action) => {
            const { isTyping, conversationId } = action.payload;
            state.isTyping = isTyping;
            state.typingConversationId = conversationId;
        },

        // Update online status
        updateUserOnlineStatus: (state, action) => {
            const { userId, isOnline } = action.payload;

            // Update in conversations
            state.conversations.forEach((conversation) => {
                const participant = conversation.participants.find((p) => p.user.id === userId);
                if (participant) {
                    conversation.isOnline = isOnline;
                }
            });

            // Update in search results
            state.searchResults.forEach((user) => {
                if (user.id === userId) {
                    user.isOnline = isOnline;
                }
            });

            // Update in online users
            if (isOnline) {
                const existingUser = state.onlineUsers.find((u) => u.id === userId);
                if (!existingUser) {
                    // User came online but we don't have their info, will be updated by next fetch
                }
            } else {
                state.onlineUsers = state.onlineUsers.filter((u) => u.id !== userId);
            }
        },

        // Search
        clearSearchResults: (state) => {
            state.searchResults = [];
            state.searchQuery = '';
            state.searchError = null;
        },

        // Clear messages for conversation
        clearMessages: (state, action) => {
            const conversationId = action.payload;
            if (state.messages[conversationId]) {
                delete state.messages[conversationId];
            }
        },

        // Reset chat state
        resetChatState: (state) => {
            return initialState;
        }
    },
    extraReducers: (builder) => {
        // Fetch conversations
        builder
            .addCase(fetchConversations.pending, (state) => {
                state.conversationsLoading = true;
                state.conversationsError = null;
            })
            .addCase(fetchConversations.fulfilled, (state, action) => {
                state.conversationsLoading = false;
                state.conversations = action.payload.conversations;
                state.conversationsPagination = action.payload.pagination;

                // Calculate total unread count
                state.totalUnreadCount = action.payload.conversations.reduce(
                    (total, conv) => total + (conv.unreadCount || 0),
                    0
                );
            })
            .addCase(fetchConversations.rejected, (state, action) => {
                state.conversationsLoading = false;
                state.conversationsError = action.payload;
            });

        // Fetch messages
        builder
            .addCase(fetchMessages.pending, (state, action) => {
                const conversationId = action.meta.arg.conversationId;
                if (!state.messages[conversationId]) {
                    state.messages[conversationId] = {
                        messages: [],
                        pagination: {},
                        loading: false,
                        error: null
                    };
                }
                state.messages[conversationId].loading = true;
                state.messages[conversationId].error = null;
            })
            .addCase(fetchMessages.fulfilled, (state, action) => {
                const { conversationId, messages, pagination } = action.payload;
                state.messages[conversationId] = {
                    messages,
                    pagination,
                    loading: false,
                    error: null
                };
            })
            .addCase(fetchMessages.rejected, (state, action) => {
                const conversationId = action.meta.arg.conversationId;
                if (state.messages[conversationId]) {
                    state.messages[conversationId].loading = false;
                    state.messages[conversationId].error = action.payload;
                }
            });

        // Start conversation
        builder
            .addCase(startConversation.pending, (state) => {
                state.conversationsLoading = true;
                state.conversationsError = null;
            })
            .addCase(startConversation.fulfilled, (state, action) => {
                state.conversationsLoading = false;
                const newConversation = action.payload.conversation;

                // Check if conversation already exists
                const existingIndex = state.conversations.findIndex(
                    (c) => c._id === newConversation._id
                );
                if (existingIndex === -1) {
                    state.conversations.unshift({
                        ...newConversation,
                        unreadCount: 0,
                        lastMessage: null
                    });
                }

                state.activeConversationId = newConversation._id;
            })
            .addCase(startConversation.rejected, (state, action) => {
                state.conversationsLoading = false;
                state.conversationsError = action.payload;
            });

        // Search users
        builder
            .addCase(searchUsers.pending, (state, action) => {
                state.searchLoading = true;
                state.searchError = null;
                state.searchQuery = action.meta.arg.query;
            })
            .addCase(searchUsers.fulfilled, (state, action) => {
                state.searchLoading = false;
                state.searchResults = action.payload.users;
            })
            .addCase(searchUsers.rejected, (state, action) => {
                state.searchLoading = false;
                state.searchError = action.payload;
                state.searchResults = [];
            });

        // Fetch online users
        builder
            .addCase(fetchOnlineUsers.pending, (state) => {
                state.onlineUsersLoading = true;
                state.onlineUsersError = null;
            })
            .addCase(fetchOnlineUsers.fulfilled, (state, action) => {
                state.onlineUsersLoading = false;
                state.onlineUsers = action.payload.users;
            })
            .addCase(fetchOnlineUsers.rejected, (state, action) => {
                state.onlineUsersLoading = false;
                state.onlineUsersError = action.payload;
            });
    }
});

export const {
    setConnected,
    setConnectionError,
    setActiveConversation,
    addMessage,
    updateMessageStatus,
    markConversationAsRead,
    setUserTyping,
    setUserStopTyping,
    setCurrentUserTyping,
    updateUserOnlineStatus,
    clearSearchResults,
    clearMessages,
    resetChatState
} = chatSlice.actions;

// Selectors
export const selectConversations = (state) => state.chat.conversations;
export const selectConversationsLoading = (state) => state.chat.conversationsLoading;
export const selectConversationsError = (state) => state.chat.conversationsError;
export const selectActiveConversationId = (state) => state.chat.activeConversationId;
export const selectActiveConversation = (state) => {
    const activeId = state.chat.activeConversationId;
    return activeId ? state.chat.conversations.find((c) => c._id === activeId) : null;
};
export const selectMessages = (conversationId) => (state) =>
    state.chat.messages[conversationId]?.messages || [];
export const selectMessagesLoading = (conversationId) => (state) =>
    state.chat.messages[conversationId]?.loading || false;
export const selectMessagesError = (conversationId) => (state) =>
    state.chat.messages[conversationId]?.error || null;
export const selectMessagesPagination = (conversationId) => (state) =>
    state.chat.messages[conversationId]?.pagination || {};
export const selectSearchResults = (state) => state.chat.searchResults;
export const selectSearchLoading = (state) => state.chat.searchLoading;
export const selectSearchError = (state) => state.chat.searchError;
export const selectSearchQuery = (state) => state.chat.searchQuery;
export const selectOnlineUsers = (state) => state.chat.onlineUsers;
export const selectIsConnected = (state) => state.chat.isConnected;
export const selectConnectionError = (state) => state.chat.connectionError;
export const selectTotalUnreadCount = (state) => state.chat.totalUnreadCount;
export const selectTypingUsers = (conversationId) => (state) =>
    state.chat.typingUsers[conversationId] || [];
export const selectIsTyping = (state) => state.chat.isTyping;
export const selectTypingConversationId = (state) => state.chat.typingConversationId;

export default chatSlice.reducer;
