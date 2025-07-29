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
    const [userProfile, setUserProfile] = useState(null);
    const [isProfileInitialized, setIsProfileInitialized] = useState(false);

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

    // Helper function to get access token
    const getAccessToken = () => {
        try {
            // Try to get from localStorage first (common pattern)
            const token = localStorage.getItem('accessToken');

            if (token) {
                console.log('🔐 Found access token in localStorage');
                return token;
            }

            // Try to get from Redux store if available
            if (typeof window !== 'undefined' && window.__REDUX_STORE__) {
                const state = window.__REDUX_STORE__.getState();
                const reduxToken =
                    state?.auth?.token || state?.user?.accessToken || state?.auth?.accessToken;

                if (reduxToken) {
                    console.log('🔐 Found access token in Redux store');
                    return reduxToken;
                }
            }

            // Try to get from cookies
            const cookies = document.cookie.split(';');
            for (let cookie of cookies) {
                const [name, value] = cookie.trim().split('=');
                if (name === 'accessToken' || name === 'authToken') {
                    console.log('🔐 Found access token in cookies');
                    return decodeURIComponent(value);
                }
            }

            console.log('🔓 No access token found - user is guest');
            return null;
        } catch (error) {
            console.error('❌ Error getting access token:', error);
            return null;
        }
    };

    // Helper function to get current context
    const getCurrentContext = () => {
        return {
            currentPage: window.location.pathname,
            currentUrl: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            language: navigator.language || 'vi-VN',
            // Add more context as needed
            cartItems: [], // TODO: Get from Redux/Context
            recentlyViewed: [], // TODO: Get from localStorage
            searchQuery: new URLSearchParams(window.location.search).get('q') || null
        };
    };

    // Initialize profile when WebSocket connects
    const initializeProfile = () => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            console.warn('⚠️ Cannot init profile - WebSocket not connected');
            return;
        }

        const accessToken = getAccessToken();
        const context = getCurrentContext();

        console.log('🔄 Initializing user profile...', {
            hasToken: !!accessToken,
            context: context.currentPage
        });

        const initMessage = {
            type: 'init_profile',
            accessToken: accessToken,
            context: context
        };

        wsRef.current.send(JSON.stringify(initMessage));
        setIsProfileInitialized(true);
    };

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
            setIsProfileInitialized(false);
            console.log('🔌 Attempting to connect to WebSocket:', WS_URL);
            wsRef.current = new WebSocket("wss://localhost:8001/chat");

            wsRef.current.onopen = () => {
                console.log('🔌 Connected to AI Assistant WebSocket');
                setIsConnected(true);
                setConnectionStatus('Đã kết nối');

                setTimeout(() => {
                    initializeProfile();
                }, 500);

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
                setIsProfileInitialized(false);

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
                setIsProfileInitialized(false);
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
        setIsProfileInitialized(false);
        setUserProfile(null);
    };

    const handleWebSocketMessage = (data) => {
        console.log('📨 Received WebSocket message:', data);

        switch (data.type) {
            case 'welcome':
                console.log('👋 Welcome message received');
                break;

            case 'profile_initialized':
                console.log('✅ Profile initialized successfully');
                setUserProfile(data.profile);

                if (data.welcomeMessage) {
                    const welcomeMessage = {
                        id: `welcome_${Date.now()}`,
                        content: data.welcomeMessage,
                        sender: 'ai',
                        timestamp: new Date(data.timestamp),
                        markdown: true,
                        isWelcome: true
                    };
                    setMessages([welcomeMessage]);
                }
                break;

            case 'profile_error':
                console.error('❌ Profile initialization error:', data.message);
                const errorMessage = {
                    id: Date.now(),
                    content: `Lỗi khởi tạo profile: ${data.message}`,
                    sender: 'ai',
                    timestamp: new Date(),
                    error: true
                };
                setMessages((prev) => [...prev, errorMessage]);
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
                const errorMsg = {
                    id: Date.now(),
                    content: `Lỗi: ${data.message}`,
                    sender: 'ai',
                    timestamp: new Date(),
                    error: true
                };
                setMessages((prev) => [...prev, errorMsg]);
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

        const context = getCurrentContext();

        const sent = sendWebSocketMessage({
            type: 'chat',
            content: userMessage.content,
            context: context
        });

        if (!sent) {
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
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
    };

    const formatTimestamp = (timestamp) => {
        return timestamp.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderMarkdown = (content) => {
        if (!content) return '';

        let html = content
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            // Handle images before links to avoid conflicts
            .replace(
                /!\[([^\]]*)\]\(([^)]+)\)/g,
                '<img src="$2" alt="$1" class="messageImage" onerror="this.style.display=\'none\'" />'
            )
            .replace(
                /\[([^\]]+)\]\(([^)]+)\)/g,
                '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
            )
            .replace(/^- (.*$)/gim, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
            .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
            .replace(/\n/g, '<br>');

        // Handle markdown tables
        html = renderMarkdownTables(html);

        return html;
    };

    const renderMarkdownTables = (html) => {
        // Split by <br> to process line by line
        const lines = html.split('<br>');
        let inTable = false;
        let tableLines = [];
        let result = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // Check if line looks like a table row (contains |)
            if (line.includes('|') && line.split('|').length >= 3) {
                if (!inTable) {
                    inTable = true;
                    tableLines = [];
                }
                tableLines.push(line);
            } else {
                // If we were in a table, process it
                if (inTable && tableLines.length > 0) {
                    result.push(processMarkdownTable(tableLines));
                    tableLines = [];
                    inTable = false;
                }

                // Add the current line
                if (line) {
                    result.push(line);
                }
            }
        }

        // Handle table at the end
        if (inTable && tableLines.length > 0) {
            result.push(processMarkdownTable(tableLines));
        }

        return result.join('<br>');
    };

    const processMarkdownTable = (tableLines) => {
        if (tableLines.length < 2) return tableLines.join('<br>');

        let html = '<div class="tableWrapper"><table class="markdownTable">';
        let isHeaderProcessed = false;

        for (let i = 0; i < tableLines.length; i++) {
            const line = tableLines[i].trim();

            // Skip separator line (contains only |, -, and spaces)
            if (line.match(/^[\|\-\s:]+$/)) {
                continue;
            }

            // Split by | and clean up
            const cells = line
                .split('|')
                .map((cell) => cell.trim())
                .filter((cell) => cell !== ''); // Remove empty cells from start/end

            if (cells.length === 0) continue;

            // First data row becomes header
            if (!isHeaderProcessed) {
                html += '<thead><tr>';
                cells.forEach((cell) => {
                    html += `<th>${cell}</th>`;
                });
                html += '</tr></thead><tbody>';
                isHeaderProcessed = true;
            } else {
                // Data rows
                html += '<tr>';
                cells.forEach((cell) => {
                    html += `<td>${cell}</td>`;
                });
                html += '</tr>';
            }
        }

        html += '</tbody></table></div>';
        return html;
    };

    const renderWelcomeMessage = () => {
        const profileDisplay = userProfile
            ? `${userProfile.isGuest ? 'Khách' : userProfile.user_fullName || 'bạn'}`
            : 'bạn';

        return (
            <div className={styles.welcomeMessage}>
                <div className={styles.welcomeIcon}>
                    <MdPsychology />
                </div>
                <h3>AI Shopping Assistant</h3>
                <p>
                    Xin chào {profileDisplay}! Tôi là trợ lý mua sắm thông minh của Aliconcon.{' '}
                    {isProfileInitialized
                        ? 'Hãy hỏi tôi về sản phẩm, cửa hàng, hoặc bất kỳ thông tin gì bạn cần!'
                        : 'Đang khởi tạo profile của bạn...'}
                </p>
                {!isConnected && (
                    <p style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '8px' }}>
                        ⚠️ {connectionStatus}
                    </p>
                )}
                {isConnected && !isProfileInitialized && (
                    <p style={{ color: '#ffa500', fontSize: '12px', marginTop: '8px' }}>
                        🔄 Đang khởi tạo profile...
                    </p>
                )}
            </div>
        );
    };

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

    const renderChatWindow = () => {
        const profileDisplay = userProfile
            ? `${userProfile.isGuest ? 'Khách' : userProfile.user_fullName || 'User'}`
            : 'User';

        return (
            <div className={`${styles.chatWindow} ${isOpen ? styles.open : ''}`}>
                <div className={styles.chatHeader}>
                    <div className={styles.headerInfo}>
                        <div className={styles.avatar}>
                            <MdSmartToy />
                        </div>
                        <div className={styles.info}>
                            <div className={styles.name}>
                                AI Assistant{' '}
                                {userProfile && !userProfile.isGuest && `- ${profileDisplay}`}
                            </div>
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
                                isConnected && isProfileInitialized
                                    ? 'Hỏi về sản phẩm hoặc cần hỗ trợ...'
                                    : isConnected
                                    ? 'Đang khởi tạo...'
                                    : 'Đang kết nối...'
                            }
                            rows="1"
                            disabled={!isConnected || !isProfileInitialized}
                        />
                        <button
                            className={styles.sendButton}
                            onClick={handleSendMessage}
                            disabled={
                                !inputValue.trim() ||
                                isTyping ||
                                !isConnected ||
                                !isProfileInitialized
                            }
                        >
                            <MdSend />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

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
