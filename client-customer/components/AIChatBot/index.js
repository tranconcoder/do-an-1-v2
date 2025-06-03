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

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

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
        setIsTyping(true);

        // TODO: Integrate with MCP/AI service here
        // For now, simulate AI response
        setTimeout(() => {
            const aiResponse = {
                id: Date.now() + 1,
                content: getSimulatedResponse(userMessage.content),
                sender: 'ai',
                timestamp: new Date()
            };

            setMessages((prev) => [...prev, aiResponse]);
            setIsTyping(false);
        }, 1000 + Math.random() * 2000);
    };

    // Temporary simulation - replace with real AI integration
    const getSimulatedResponse = (userInput) => {
        const responses = [
            'Xin chào! Tôi là AI Assistant. Tôi có thể giúp bạn tìm sản phẩm, hỗ trợ mua sắm hoặc trả lời các câu hỏi về cửa hàng.',
            'Đây là câu trả lời mẫu từ AI. Chức năng này sẽ được tích hợp với MCP để cung cấp hỗ trợ thông minh cho việc mua sắm.',
            'Tôi hiểu bạn đang hỏi về: ' +
                userInput +
                '. Tôi sẽ giúp bạn tìm kiếm thông tin về sản phẩm và cửa hàng.',
            'Cảm ơn bạn đã sử dụng AI Assistant! Tôi có thể giúp bạn so sánh sản phẩm, tìm ưu đãi tốt nhất, hoặc hướng dẫn thanh toán.',
            'Đây là giao diện demo. AI thực tế sẽ được tích hợp để hỗ trợ tối ưu trải nghiệm mua sắm của bạn.'
        ];
        return responses[Math.floor(Math.random() * responses.length)];
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

    const renderWelcomeMessage = () => (
        <div className={styles.welcomeMessage}>
            <div className={styles.welcomeIcon}>
                <MdPsychology />
            </div>
            <h3>AI Shopping Assistant</h3>
            <p>
                Xin chào! Tôi là trợ lý mua sắm thông minh. Hãy hỏi tôi về sản phẩm, cửa hàng, hoặc
                bất kỳ thông tin gì bạn cần!
            </p>
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
                              <div className={styles.messageBubble}>{message.content}</div>
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
                            <div className={styles.onlineDot}></div>
                            Sẵn sàng hỗ trợ
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
                        placeholder="Hỏi về sản phẩm hoặc cần hỗ trợ..."
                        rows="1"
                    />
                    <button
                        className={styles.sendButton}
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isTyping}
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
