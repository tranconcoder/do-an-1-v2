'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Send, MessageCircle, Minimize2, Maximize2, Info, Loader2 } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Card, CardContent, CardHeader } from './card';
import { Badge } from './badge';
import { toast } from 'sonner';
import { mediaService } from '@/lib/services/api/mediaService';
import chatService, { ChatMessage, ChatConversation } from '@/lib/services/api/chatService';
import socketService from '@/lib/services/socketService';
import { CustomImage } from './CustomImage';

interface Shop {
    _id: string;
    shop_name: string;
    shop_logo?: string;
    shop_userId?: string;
}

interface FloatingChatProps {
    shop: Shop;
    isOpen: boolean;
    onClose: () => void;
    onToggleMinimize?: () => void;
    isMinimized?: boolean;
    currentUserId?: string;
    userToken?: string;
}

export const FloatingChat: React.FC<FloatingChatProps> = ({
    shop,
    isOpen,
    onClose,
    onToggleMinimize,
    isMinimized = false,
    currentUserId,
    userToken
}) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [conversation, setConversation] = useState<ChatConversation | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [shopOwnerTyping, setShopOwnerTyping] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && !isMinimized && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen, isMinimized]);

    // Cleanup messages when chat closes or conversation changes
    useEffect(() => {
        if (!isOpen) {
            // Clear messages when chat is closed to prevent conflicts
            setMessages([]);
            setConversation(null);
            setIsConnected(false);

            // Disconnect socket when chat is closed
            if (socketService.isConnected()) {
                socketService.disconnect();
            }
        }
    }, [isOpen]);

    // Initialize socket connection and load conversation when chat opens
    useEffect(() => {
        if (isOpen && userToken && currentUserId) {
            initializeChat();
        }
        return () => {
            if (conversation) {
                socketService.leaveConversation(conversation._id);
            }
        };
    }, [isOpen, userToken, currentUserId]);

    // Setup socket event listeners
    useEffect(() => {
        if (!isConnected) return;

        const handleNewMessage = (message: ChatMessage) => {
            if (message.sender.id !== currentUserId) {
                setMessages((prev) => {
                    // Check if message already exists to prevent duplicates
                    const existing = prev.find((m) => m._id === message._id);
                    if (!existing) {
                        return [...prev, message];
                    }
                    return prev;
                });

                // Mark as read if chat is open
                if (conversation && isOpen && !isMinimized) {
                    socketService.markAsRead(conversation._id);
                }
            }
        };

        const handleMessageSent = (message: ChatMessage) => {
            setMessages((prev) => {
                // Check if message already exists to prevent duplicates
                const existing = prev.find((m) => m._id === message._id);
                if (!existing) {
                    return [...prev, message];
                }
                // Update existing message if it already exists (e.g., status update)
                return prev.map((m) => (m._id === message._id ? message : m));
            });
        };

        const handleMessageDelivered = (data: any) => {
            setMessages((prev) =>
                prev.map((msg) => (msg._id === data._id ? { ...msg, status: 'delivered' } : msg))
            );
        };

        const handleUserTyping = (data: any) => {
            if (
                data.userId !== currentUserId &&
                conversation &&
                data.conversationId === conversation._id
            ) {
                setShopOwnerTyping(true);
                // Clear existing timeout
                if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                }
                // Set timeout to hide typing indicator
                typingTimeoutRef.current = setTimeout(() => {
                    setShopOwnerTyping(false);
                }, 3000);
            }
        };

        const handleUserStopTyping = (data: any) => {
            if (
                data.userId !== currentUserId &&
                conversation &&
                data.conversationId === conversation._id
            ) {
                setShopOwnerTyping(false);
            }
        };

        // Add event listeners
        socketService.on('new_message', handleNewMessage);
        socketService.on('message_sent', handleMessageSent);
        socketService.on('message_delivered', handleMessageDelivered);
        socketService.on('user_typing', handleUserTyping);
        socketService.on('user_stop_typing', handleUserStopTyping);

        return () => {
            socketService.off('new_message', handleNewMessage);
            socketService.off('message_sent', handleMessageSent);
            socketService.off('message_delivered', handleMessageDelivered);
            socketService.off('user_typing', handleUserTyping);
            socketService.off('user_stop_typing', handleUserStopTyping);

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [isConnected, conversation, currentUserId, isOpen, isMinimized]);

    const initializeChat = async () => {
        if (!userToken || !currentUserId) {
            toast.error('Vui lòng đăng nhập để chat với shop');
            return;
        }

        setIsLoading(true);
        setIsConnecting(true);

        try {
            // Connect to socket
            if (!socketService.isConnected()) {
                const serverUrl = process.env.NEXT_PUBLIC_API_URL;
                if (!serverUrl) {
                    throw new Error('NEXT_PUBLIC_API_URL is not defined');
                }

                await socketService.connect(userToken, serverUrl);
                setIsConnected(true);
            }

            // Get or create conversation with shop owner
            let existingConversation = null;

            try {
                // Try to find existing conversation
                const conversationsResponse = await chatService.getConversations(50, 1);
                
                existingConversation = conversationsResponse.conversations.find((conv) =>
                    conv.participants.some((p) => p.user.id === (shop.shop_userId || shop._id))
                );
            } catch (error) {
                console.log('No existing conversations found');
            }

            if (!existingConversation) {
                // Create new conversation - use shop owner user ID, not shop ID
                const targetUserId = shop.shop_userId || shop._id;
                const newConvResponse = await chatService.startConversation(targetUserId);
                
                existingConversation = {
                    _id: newConvResponse.conversation._id,
                    type: newConvResponse.conversation.type as 'direct',
                    participants: newConvResponse.conversation.participants.map((p) => ({
                        user: p,
                        joined_at: new Date().toISOString(),
                        last_read_at: new Date().toISOString(),
                        unread_count: 0
                    })),
                    messageCount: newConvResponse.conversation.messageCount,
                    unreadCount: 0,
                    status: newConvResponse.conversation.status as 'active',
                    updated_at: newConvResponse.conversation.created_at,
                    isOnline: newConvResponse.conversation.isOnline
                };
            }

            setConversation(existingConversation);

            // Join conversation room
            socketService.joinConversation(existingConversation._id);

            // Load existing messages
            if (existingConversation.messageCount > 0) {
                const messagesResponse = await chatService.getMessages(existingConversation._id);
                // Clear existing messages and set new ones to prevent duplicates
                setMessages(messagesResponse.messages);

                // Mark messages as read
                socketService.markAsRead(existingConversation._id);
            } else {
                // Add welcome message for new conversation
                const welcomeMessage: ChatMessage = {
                    _id: 'welcome-' + Date.now() + '-' + shop._id, // Make ID more unique
                    content: `Xin chào! Cảm ơn bạn đã quan tâm đến ${shop.shop_name}. Chúng tôi có thể giúp gì cho bạn?`,
                    type: 'text',
                    sender: {
                        id: shop.shop_userId || shop._id,
                        fullName: shop.shop_name,
                        email: '',
                        avatar: shop.shop_logo
                    },
                    receiver: {
                        id: currentUserId,
                        fullName: '',
                        email: ''
                    },
                    status: 'read',
                    timestamp: new Date().toISOString()
                };
                // Clear existing messages and set welcome message
                setMessages([welcomeMessage]);
            }
        } catch (error) {
            console.error('Failed to initialize chat:', error);
            toast.error('Không thể kết nối chat. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
            setIsConnecting(false);
        }
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || !conversation || !isConnected) return;

        const messageContent = inputMessage.trim();
        setInputMessage('');

        try {
            // Send via socket - use shop owner user ID, not shop ID
            const targetUserId = shop.shop_userId || shop._id;
            const success = socketService.sendMessage(targetUserId, messageContent, 'text');

            if (!success) {
                throw new Error('Failed to send message via socket');
            }

            // Stop typing indicator
            if (isTyping) {
                socketService.stopTyping(conversation._id, targetUserId);
                setIsTyping(false);
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            toast.error('Không thể gửi tin nhắn. Vui lòng thử lại.');
            setInputMessage(messageContent); // Restore message
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputMessage(e.target.value);

        if (!conversation || !isConnected) return;

        // Handle typing indicators
        if (e.target.value.trim() && !isTyping) {
            setIsTyping(true);
            const targetUserId = shop.shop_userId || shop._id;
            socketService.startTyping(conversation._id, targetUserId);
        } else if (!e.target.value.trim() && isTyping) {
            setIsTyping(false);
            const targetUserId = shop.shop_userId || shop._id;
            socketService.stopTyping(conversation._id, targetUserId);
        }
    };

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getShopInitials = () => {
        return shop.shop_name
            .split(' ')
            .map((word) => word[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop for mobile */}
            <div
                className="fixed inset-0 bg-black/20 z-40 md:hidden"
                onClick={onClose}
                style={{ backdropFilter: 'blur(2px)' }}
            />

            {/* Chat Window */}
            <div
                className={`
                fixed z-50 bg-white rounded-lg shadow-2xl border transition-all duration-300 ease-in-out flex flex-col
                ${isMinimized ? 'bottom-4 right-4 w-80 h-14' : 'bottom-4 right-4 w-80 md:w-96'}
                max-w-[calc(100vw-2rem)] max-h-[calc(100vh-6rem)]
                md:max-w-96 md:max-h-[calc(100vh-6rem)]
                ${isOpen ? 'animate-in slide-in-from-bottom-8 duration-300' : ''}
                ${!isMinimized ? 'h-[28rem] md:h-[32rem]' : ''}
            `}
            >
                {/* Header */}
                <CardHeader className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8 border-2 border-white/20">
                                <CustomImage
                                    src={
                                        shop.shop_logo
                                            ? mediaService.getMediaUrl(shop.shop_logo)
                                            : ''
                                    }
                                    alt={shop.shop_name}
                                    fill
                                    className="rounded-full"
                                    objectFit="cover"
                                    fallbackSrc="/placeholder.svg"
                                />
                                <AvatarFallback className="bg-blue-500 text-white text-xs font-semibold">
                                    {getShopInitials()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-sm truncate">{shop.shop_name}</h3>
                                <div className="flex items-center space-x-1">
                                    {isConnecting ? (
                                        <>
                                            <Loader2 className="w-2 h-2 animate-spin" />
                                            <span className="text-xs opacity-90">
                                                Đang kết nối...
                                            </span>
                                        </>
                                    ) : isConnected ? (
                                        <>
                                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                            <span className="text-xs opacity-90">
                                                Đang hoạt động
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                            <span className="text-xs opacity-90">Ngoại tuyến</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-1">
                            {onToggleMinimize && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 text-white hover:bg-white/20"
                                    onClick={onToggleMinimize}
                                    title={isMinimized ? 'Mở rộng' : 'Thu nhỏ'}
                                >
                                    {isMinimized ? (
                                        <Maximize2 className="h-3 w-3" />
                                    ) : (
                                        <Minimize2 className="h-3 w-3" />
                                    )}
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-white hover:bg-white/20"
                                onClick={onClose}
                                title="Đóng chat"
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                {!isMinimized && (
                    <>
                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50 min-h-0">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-32">
                                    <div className="flex items-center space-x-2 text-gray-500">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span className="text-sm">Đang tải tin nhắn...</span>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {messages
                                        .filter((message, index, array) => {
                                            // Filter out messages with duplicate IDs
                                            return (
                                                array.findIndex((m) => m._id === message._id) ===
                                                index
                                            );
                                        })
                                        .map((message) => (
                                            <div
                                                key={message._id}
                                                className={`flex ${
                                                    message.sender.id === currentUserId
                                                        ? 'justify-end'
                                                        : 'justify-start'
                                                }`}
                                            >
                                                <div
                                                    className={`
                                                    max-w-[80%] rounded-lg px-3 py-2 text-sm shadow-sm
                                                    ${
                                                        message.sender.id === currentUserId
                                                            ? 'bg-blue-600 text-white rounded-br-sm'
                                                            : 'bg-white text-gray-800 border rounded-bl-sm'
                                                    }
                                                `}
                                                >
                                                    <p className="break-words leading-relaxed">
                                                        {message.content}
                                                    </p>
                                                    <div
                                                        className={`
                                                    text-xs mt-1 flex items-center justify-end space-x-1
                                                    ${
                                                        message.sender.id === currentUserId
                                                            ? 'text-blue-100'
                                                            : 'text-gray-500'
                                                    }
                                                `}
                                                    >
                                                        <span>{formatTime(message.timestamp)}</span>
                                                        {message.sender.id === currentUserId &&
                                                            message.status && (
                                                                <span className="text-xs">
                                                                    {message.status === 'sent' &&
                                                                        '✓'}
                                                                    {message.status ===
                                                                        'delivered' && '✓✓'}
                                                                    {message.status === 'read' && (
                                                                        <span className="text-blue-200">
                                                                            ✓✓
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                    {shopOwnerTyping && (
                                        <div className="flex justify-start">
                                            <div className="bg-white rounded-lg px-3 py-2 max-w-[80%] border shadow-sm">
                                                <div className="flex space-x-1 items-center">
                                                    <span className="text-sm text-gray-600 mr-2">
                                                        {shop.shop_name} đang nhập
                                                    </span>
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                                    <div
                                                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                                        style={{ animationDelay: '0.1s' }}
                                                    ></div>
                                                    <div
                                                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                                        style={{ animationDelay: '0.2s' }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="border-t bg-white p-3 flex-shrink-0 rounded-b-lg">
                            <div className="flex items-center space-x-2">
                                <Input
                                    ref={inputRef}
                                    value={inputMessage}
                                    onChange={handleInputChange}
                                    onKeyPress={handleKeyPress}
                                    placeholder={
                                        isConnected ? 'Nhập tin nhắn...' : 'Đang kết nối...'
                                    }
                                    className="flex-1 text-sm border-gray-200 focus:border-blue-400"
                                    disabled={!isConnected || isLoading}
                                />
                                <Button
                                    onClick={handleSendMessage}
                                    disabled={!inputMessage.trim() || !isConnected || isLoading}
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-3"
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                {isConnected
                                    ? 'Nhấn Enter để gửi tin nhắn'
                                    : 'Đang kết nối đến server...'}
                            </p>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

// Chat Button Component
interface ChatButtonProps {
    onClick: () => void;
    hasUnread?: boolean;
    className?: string;
}

export const ChatButton: React.FC<ChatButtonProps> = ({
    onClick,
    hasUnread = false,
    className = ''
}) => {
    return (
        <Button
            onClick={onClick}
            className={`
                relative bg-blue-600 hover:bg-blue-700 text-white 
                shadow-lg hover:shadow-xl transition-all duration-200
                hover:scale-105 active:scale-95
                ${className}
            `}
        >
            <MessageCircle className="h-4 w-4 mr-2" />
            Chat với Shop
            {hasUnread && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 bg-red-500 text-white text-xs flex items-center justify-center animate-pulse">
                    !
                </Badge>
            )}
        </Button>
    );
};

// Floating Action Button Component
interface FloatingChatButtonProps {
    onClick: () => void;
    hasUnread?: boolean;
    isOpen?: boolean;
}

export const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({
    onClick,
    hasUnread = false,
    isOpen = false
}) => {
    if (isOpen) return null;

    return (
        <Button
            onClick={onClick}
            className={`
                fixed bottom-6 right-6 z-40
                w-14 h-14 rounded-full
                bg-blue-600 hover:bg-blue-700 text-white
                shadow-lg hover:shadow-xl
                transition-all duration-300 ease-in-out
                hover:scale-110 active:scale-95
                border-2 border-white
                animate-in slide-in-from-bottom-8 duration-500
            `}
            title="Chat với shop"
        >
            <MessageCircle className="h-6 w-6" />
            {hasUnread && (
                <Badge className="absolute -top-1 -right-1 h-6 w-6 p-0 bg-red-500 text-white text-xs flex items-center justify-center animate-pulse border-2 border-white">
                    !
                </Badge>
            )}
        </Button>
    );
};
