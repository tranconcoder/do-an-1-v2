'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './AIChatBot.module.css';
import { MdSmartToy, MdClose, MdSend, MdPsychology, MdChat } from 'react-icons/md';

function AIChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [hasNotification, setHasNotification] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('Đang kết nối...');

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);

    // WebSocket configuration
    let WS_URL = process.env.NEXT_PUBLIC_WS_URL;

    if (!WS_URL) {
        console.error('❌ NEXT_PUBLIC_WS_URL is not set!');

        return <div>NEXT_PUBLIC_WS_URL is not set</div>;
    }

    WS_URL = WS_URL.replace('ws://', 'wss://');

    const RECONNECT_INTERVAL = 3000; // 3 seconds

    // Auto scroll to bottom when new messages
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => {
                inputRef.current.focus();
            }, 300);
        }
    }, [isOpen]);

    // WebSocket connection management
    useEffect(() => {
        if (isOpen) {
            connectWebSocket();
        } else {
            disconnectWebSocket();
        }

        return () => {
            disconnectWebSocket();
        };
    }, [isOpen]);

    const connectWebSocket = () => {
        try {
            setConnectionStatus('Đang kết nối...');
            wsRef.current = new WebSocket(WS_URL);

            wsRef.current.onopen = () => {
                console.log('🔌 Connected to AI Assistant WebSocket');
                setIsConnected(true);
                setConnectionStatus('Đã kết nối');

                // Clear any reconnection timeout
                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current);
                    reconnectTimeoutRef.current = null;
                }
            };

            wsRef.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    handleWebSocketMessage(data);
                } catch (error) {
                    console.error('❌ Error parsing WebSocket message:', error);
                }
            };

            wsRef.current.onclose = () => {
                console.log('🔌 WebSocket connection closed');
                setIsConnected(false);
                setConnectionStatus('Mất kết nối');

                // Attempt to reconnect if chat is still open
                if (isOpen) {
                    reconnectTimeoutRef.current = setTimeout(() => {
                        console.log('🔄 Attempting to reconnect...');
                        connectWebSocket();
                    }, RECONNECT_INTERVAL);
                }
            };

            wsRef.current.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
                setIsConnected(false);
                setConnectionStatus('Lỗi kết nối');
            };
        } catch (error) {
            console.error('❌ Failed to create WebSocket connection:', error);
            setConnectionStatus('Không thể kết nối');
        }
    };

    const disconnectWebSocket = () => {
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        setIsConnected(false);
        setConnectionStatus('Đã ngắt kết nối');
    };

    const handleWebSocketMessage = (data) => {
        console.log('📨 Received WebSocket message:', data);

        switch (data.type) {
            case 'welcome':
                console.log('👋 Welcome message received');
                break;

            case 'message':
                const aiMessage = {
                    id: Date.now(),
                    content: data.content,
                    sender: 'ai',
                    timestamp: new Date(data.timestamp),
                    markdown: data.markdown || false
                };
                setMessages((prev) => [...prev, aiMessage]);
                setIsTyping(false);
                break;

            case 'typing':
                setIsTyping(data.isTyping);
                break;

            case 'error':
                console.error('❌ WebSocket error:', data.message);
                const errorMessage = {
                    id: Date.now(),
                    content: `Lỗi: ${data.message}`,
                    sender: 'ai',
                    timestamp: new Date(),
                    error: true
                };
                setMessages((prev) => [...prev, errorMessage]);
                setIsTyping(false);
                break;

            case 'pong':
                console.log('🏓 Pong received');
                break;

            default:
                console.warn('⚠️ Unknown message type:', data.type);
        }
    };

    const sendWebSocketMessage = (message) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message));
            return true;
        } else {
            console.error('❌ WebSocket not connected');
            return false;
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleToggleChat = () => {
        setIsOpen(!isOpen);
        if (hasNotification) {
            setHasNotification(false);
        }
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMessage = {
            id: Date.now(),
            content: inputValue.trim(),
            sender: 'user',
            timestamp: new Date()
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');

        // Get context from current page
        const context = {
            currentPage: window.location.pathname,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            // Add more context as needed
            cartItems: [], // TODO: Get from Redux/Context
            recentlyViewed: [] // TODO: Get from localStorage
        };

        // Send message via WebSocket
        const sent = sendWebSocketMessage({
            type: 'chat',
            content: userMessage.content,
            context: context
        });

        if (!sent) {
            // Fallback if WebSocket is not connected
            const errorMessage = {
                id: Date.now() + 1,
                content: 'Không thể kết nối đến AI Assistant. Vui lòng thử lại sau.',
                sender: 'ai',
                timestamp: new Date(),
                error: true
            };
            setMessages((prev) => [...prev, errorMessage]);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
        // Auto-resize textarea
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
    };

    const formatTimestamp = (timestamp) => {
        return timestamp.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Simple markdown renderer for basic formatting
    const renderMarkdown = (content) => {
        if (!content) return '';

        // Convert markdown to HTML (basic implementation)
        let html = content
            // Headers
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            // Bold
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Italic
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Code blocks
            .replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>')
            // Inline code
            .replace(/`(.*?)`/g, '<code>$1</code>')
            // Links
            .replace(
                /\[([^\]]+)\]\(([^)]+)\)/g,
                '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
            )
            // Lists
            .replace(/^- (.*$)/gim, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
            // Quotes
            .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
            // Line breaks
            .replace(/\n/g, '<br>');

        return html;
    };

    const renderWelcomeMessage = () => (
        <div className={styles.welcomeMessage}>
            <div className={styles.welcomeIcon}>
                <MdPsychology />
            </div>
            <h3>AI Shopping Assistant</h3>
            <p>
                Xin chào! Tôi là trợ lý mua sắm thông minh của Aliconcon. Hãy hỏi tôi về sản phẩm,
                cửa hàng, hoặc bất kỳ thông tin gì bạn cần!
            </p>
            {!isConnected && (
                <p style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '8px' }}>
                    ⚠️ {connectionStatus}
                </p>
            )}
        </div>
    );

    const renderMessages = () => (
        <div className={styles.chatMessages}>
            {messages.length === 0
                ? renderWelcomeMessage()
                : messages.map((message) => (
                      <div
                          key={message.id}
                          className={`${styles.message} ${
                              message.sender === 'user' ? styles.own : ''
                          }`}
                      >
                          {message.sender === 'ai' && (
                              <div className={styles.avatar}>
                                  <MdSmartToy />
                              </div>
                          )}
                          <div className={styles.messageContent}>
                              <div
                                  className={`${styles.messageBubble} ${
                                      message.error ? styles.errorMessage : ''
                                  }`}
                              >
                                  {message.markdown ? (
                                      <div
                                          dangerouslySetInnerHTML={{
                                              __html: renderMarkdown(message.content)
                                          }}
                                      />
                                  ) : (
                                      message.content
                                  )}
                              </div>
                              <div className={styles.timestamp}>
                                  {formatTimestamp(message.timestamp)}
                              </div>
                          </div>
                          {message.sender === 'user' && (
                              <div className={styles.avatar}>
                                  <MdChat />
                              </div>
                          )}
                      </div>
                  ))}

            {isTyping && (
                <div className={styles.typingIndicator}>
                    <div className={styles.avatar}>
                        <MdSmartToy />
                    </div>
                    <div className={styles.typingBubble}>
                        <div className={styles.dots}>
                            <div className={styles.dot}></div>
                            <div className={styles.dot}></div>
                            <div className={styles.dot}></div>
                        </div>
                    </div>
                </div>
            )}

            <div ref={messagesEndRef} />
        </div>
    );

    const renderChatWindow = () => (
        <div className={`${styles.chatWindow} ${isOpen ? styles.open : ''}`}>
            <div className={styles.chatHeader}>
                <div className={styles.headerInfo}>
                    <div className={styles.avatar}>
                        <MdSmartToy />
                    </div>
                    <div className={styles.info}>
                        <div className={styles.name}>AI Shopping Assistant</div>
                        <div className={styles.status}>
                            <div
                                className={`${styles.onlineDot} ${
                                    !isConnected ? styles.offline : ''
                                }`}
                            ></div>
                            {connectionStatus}
                        </div>
                    </div>
                </div>
                <button className={styles.closeButton} onClick={handleToggleChat}>
                    <MdClose />
                </button>
            </div>

            {renderMessages()}

            <div className={styles.chatInput}>
                <div className={styles.inputContainer}>
                    <textarea
                        ref={inputRef}
                        className={styles.textInput}
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        placeholder={
                            isConnected ? 'Hỏi về sản phẩm hoặc cần hỗ trợ...' : 'Đang kết nối...'
                        }
                        rows="1"
                        disabled={!isConnected}
                    />
                    <button
                        className={styles.sendButton}
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isTyping || !isConnected}
                    >
                        <MdSend />
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className={styles.aiChatBot}>
            {renderChatWindow()}

            <div
                className={`${styles.chatBubble} ${isOpen ? styles.active : ''}`}
                onClick={handleToggleChat}
            >
                {hasNotification && <div className={styles.notificationDot} />}
                <MdSmartToy />
            </div>
        </div>
    );
}

export default AIChatBot;
