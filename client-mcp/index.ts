import { stdin as input, stdout as output } from "node:process";
import * as readline from "node:readline/promises";
import OpenAI from "openai";
import { config } from "dotenv";
import pino from "pino";
import pretty from "pino-pretty";
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createHttpsServer } from 'https';
import { createServer as createHttpServer } from 'http';
import { IncomingMessage } from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { conversationMemory, ConversationMemoryStore } from './lib/memory-store.js';
import type { ConversationMessage, ConversationSession, UserProfile } from './lib/memory-store.js';

// Load environment variables
config();

// Configure logger
const logger = pino(pretty({ colorize: true }));

// Configuration
const OPENROUTER_API_KEY = "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";
// const MODEL_NAME = process.env.LLM_MODEL || "meta-llama/llama-3-70b-instruct";
const MODEL_NAME = process.env.LLM_MODEL || "deepseek/deepseek-chat-v3-0324:free";
const DISABLE_THINKING = process.env.DISABLE_THINKING === "true" || true;
const MCP_SERVER_URL = process.env.MCP_URL || "http://localhost:8000";
const WEBSOCKET_PORT = process.env.WEBSOCKET_PORT || 8001;
const USE_WSS = process.env.USE_WSS === "true" || true; // Enable WSS by default
const USE_HTTPS = process.env.USE_HTTPS === "true" || false;

// OpenAI client configured for OpenRouter
const openai = new OpenAI({
    apiKey: OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

// WebSocket server for real-time chat
let wss: WebSocketServer | null = null;
let httpServer: any = null; // Use any to handle both HTTP and HTTPS server types

// Helper function to convert MCP tool definitions to OpenAI format
function convertToolFormat(tool: any): any {
    return {
        type: "function",
        function: {
            name: tool.name,
            description: tool.description,
            parameters: {
                type: "object",
                properties: tool.inputSchema?.properties || {},
                required: tool.inputSchema?.required || []
            }
        }
    };
}

class AliconconMCPClient {
    private rl: readline.Interface;
    private availableTools: any[] = [];
    private connectedClients: Map<WebSocket, string> = new Map(); // ws -> socketId
    private socketClients: Map<string, WebSocket> = new Map(); // socketId -> ws
    private memoryStore: ConversationMemoryStore; // Thêm property cho memoryStore

    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.memoryStore = conversationMemory; // Khởi tạo memoryStore
    }

    async connectToServer(): Promise<boolean> {
        try {
            logger.info("🔗 Connecting to Aliconcon MCP Server...");

            // Test MCP server connection
            const healthResponse = await fetch(`${MCP_SERVER_URL}/health`);
            if (!healthResponse.ok) {
                throw new Error(`Health check failed: ${healthResponse.status}`);
            }

            // Get available tools
            const toolsResponse = await fetch(`${MCP_SERVER_URL}/tools`);
            if (!toolsResponse.ok) {
                throw new Error(`Tools fetch failed: ${toolsResponse.status}`);
            }

            const toolsData = await toolsResponse.json() as any;
            this.availableTools = toolsData.result?.tools || [];

            logger.info("✅ Connected to MCP server with tools:", this.availableTools.map((tool: any) => tool.name));

            return true;
        } catch (error) {
            logger.error("❌ Failed to connect to MCP server:", error);
            return false;
        }
    }

    async callMCPTool(toolName: string, toolArgs: any): Promise<string> {
        try {
            const response = await fetch(`${MCP_SERVER_URL}/tools/call`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: toolName,
                    arguments: toolArgs
                })
            });

            if (!response.ok) {
                throw new Error(`Tool call failed: ${response.status}`);
            }

            const result = await response.json() as any;

            // Extract content from MCP response
            if (result.result?.content) {
                if (Array.isArray(result.result.content)) {
                    return result.result.content.map((c: any) => c.text || JSON.stringify(c)).join('\n');
                } else {
                    return result.result.content;
                }
            }

            return JSON.stringify(result.result, null, 2);
        } catch (error) {
            logger.error(`❌ Error calling tool ${toolName}:`, error);
            throw error;
        }
    }

    async processQueryWithMemory(socketId: string, query: string, context: any = {}): Promise<string> {
        try {
            // Get conversation history from Redis
            const conversationHistory = await conversationMemory.getConversationHistory(socketId, 10);
            const sessionContext = await conversationMemory.getContext(socketId);

            // Update context with new information
            await conversationMemory.updateContext(socketId, context);

            // Add user message to memory
            await conversationMemory.addMessage(socketId, {
                id: Date.now().toString(),
                content: query,
                role: 'user',
                timestamp: new Date(),
                context
            });

            // Convert conversation history to OpenAI format
            const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
                {
                    role: "system",
                    content: `Bạn là trợ lý AI của Aliconcon - nền tảng thương mại điện tử hàng đầu Việt Nam.

QUAN TRỌNG: Trả lời bằng Markdown format để hiển thị đẹp trên web.

THÔNG TIN VỀ ALICONCON:
- Aliconcon là nền tảng thương mại điện tử đa dạng với hàng triệu sản phẩm
- Chuyên cung cấp các sản phẩm: điện tử, thời trang, gia dụng, sách, đồ chơi
- Có hệ thống giao hàng nhanh toàn quốc
- Hỗ trợ thanh toán đa dạng: COD, chuyển khoản, ví điện tử
- Có chương trình khuyến mãi và tích điểm thường xuyên
- Hỗ trợ khách hàng 24/7

NGỮ CẢNH PHIÊN LÀM VIỆC:
${JSON.stringify(sessionContext, null, 2)}

LỊCH SỬ CUỘC TRÒ CHUYỆN:
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Sử dụng thông tin trên để trả lời một cách cá nhân hóa và chính xác.`
                },
                {
                    role: "user",
                    content: query
                }
            ];

            // Convert tools to OpenAI format
            const availableTools = this.availableTools.map(convertToolFormat);

            logger.info(`🛠️ Processing query for socket ${socketId} with ${conversationHistory.length} previous messages`);

            let useTools = availableTools.length > 0;

            try {
                // Call OpenRouter with tools
                const response = await openai.chat.completions.create({
                    model: MODEL_NAME,
                    messages: messages,
                    tools: useTools ? availableTools : undefined,
                    temperature: 0.7,
                    max_tokens: 2048
                });

                const message = response.choices[0]?.message;
                if (!message) {
                    throw new Error("No message received from OpenRouter");
                }

                let finalText: string[] = [];
                let toolCalls: any[] = [];

                // Handle tool calls if any
                if (message.tool_calls && message.tool_calls.length > 0) {
                    logger.info(`✅ Tool calling supported! Processing ${message.tool_calls.length} tool calls`);

                    for (const toolCall of message.tool_calls) {
                        const toolName = toolCall.function.name;
                        const toolArgs = JSON.parse(toolCall.function.arguments || "{}");

                        logger.info(`🔧 Calling tool: ${toolName} with args:`, toolArgs);

                        try {
                            // Execute tool call via MCP HTTP API
                            const result = await this.callMCPTool(toolName, toolArgs);

                            toolCalls.push({
                                name: toolName,
                                args: toolArgs,
                                result: result
                            });

                            // Add tool result to messages for final response
                            messages.push({
                                role: "assistant",
                                content: message.content || "",
                                tool_calls: message.tool_calls
                            });

                            messages.push({
                                role: "tool",
                                tool_call_id: toolCall.id,
                                content: result
                            });

                            logger.info(`✅ Tool ${toolName} executed successfully`);

                        } catch (error) {
                            logger.error(`❌ Error calling tool ${toolName}:`, error);
                            messages.push({
                                role: "tool",
                                tool_call_id: toolCall.id,
                                content: `Error: ${error}`
                            });
                        }
                    }

                    // Get final response after tool execution
                    const finalResponse = await openai.chat.completions.create({
                        model: MODEL_NAME,
                        messages: messages,
                        max_tokens: 1000,
                        temperature: 0.7
                    });

                    const finalMessage = finalResponse.choices[0]?.message;
                    if (!finalMessage) {
                        throw new Error("No final message received from OpenRouter");
                    }

                    finalText.push(finalMessage.content || "");
                } else {
                    // No tool calls, just return the response
                    logger.info("ℹ️ No tool calls made, returning direct response");
                    finalText.push(message.content || "");
                }

                const aiResponse = finalText.join('\n');

                // Add AI response to memory
                await conversationMemory.addMessage(socketId, {
                    id: (Date.now() + 1).toString(),
                    content: aiResponse,
                    role: 'assistant',
                    timestamp: new Date(),
                    toolCalls: toolCalls.length > 0 ? toolCalls : undefined
                });

                return aiResponse;

            } catch (toolError: any) {
                // If tool calling fails, fall back to context-aware mode
                if (toolError.message?.includes('404') && toolError.message?.includes('tool use')) {
                    logger.warn("🔄 Tool calling not supported by this model, falling back to context-aware mode");
                    return await this.processQueryWithoutTools(socketId, query, context, conversationHistory);
                }

                if (toolError.message?.includes('tool') || toolError.message?.includes('function')) {
                    logger.warn("🔄 Tool-related error detected, falling back to context-aware mode");
                    return await this.processQueryWithoutTools(socketId, query, context, conversationHistory);
                }

                throw toolError;
            }

        } catch (error) {
            console.log({
                error
            })
            logger.error("❌ Error processing query with memory:", error);

            // Fallback processing
            return await this.processQueryWithoutTools(socketId, query, context, []);
        }
    }

    async processQueryWithoutTools(socketId: string, query: string, context: any = {}, conversationHistory: ConversationMessage[] = []): Promise<string> {
        try {
            const sessionContext = await conversationMemory.getContext(socketId);

            const contextPrompt = `Bạn là trợ lý AI của Aliconcon - nền tảng thương mại điện tử hàng đầu Việt Nam.

QUAN TRỌNG: Trả lời bằng Markdown format để hiển thị đẹp trên web.

THÔNG TIN VỀ ALICONCON:
- Aliconcon là nền tảng thương mại điện tử đa dạng với hàng triệu sản phẩm
- Chuyên cung cấp các sản phẩm: điện tử, thời trang, gia dụng, sách, đồ chơi
- Có hệ thống giao hàng nhanh toàn quốc
- Hỗ trợ thanh toán đa dạng: COD, chuyển khoản, ví điện tử
- Có chương trình khuyến mãi và tích điểm thường xuyên
- Hỗ trợ khách hàng 24/7

SẢN PHẨM PHỔ BIẾN:
- iPhone 15 Pro Max - 29.990.000đ
- Samsung Galaxy S24 Ultra - 26.990.000đ  
- MacBook Air M3 - 28.990.000đ
- Áo thun nam basic - 199.000đ
- Giày sneaker nữ - 899.000đ
- Nồi cơm điện Panasonic - 1.290.000đ

NGỮ CẢNH PHIÊN LÀM VIỆC:
${JSON.stringify(sessionContext, null, 2)}

LỊCH SỬ CUỘC TRÒ CHUYỆN:
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Context từ website: ${JSON.stringify(context, null, 2)}

Câu hỏi của khách hàng: ${query}`;

            const response = await openai.chat.completions.create({
                model: MODEL_NAME,
                messages: [{ role: "user", content: contextPrompt }],
                temperature: 0.7,
                max_tokens: 1500
            });

            const message = response.choices[0]?.message;
            if (!message) {
                throw new Error("No message received from OpenRouter");
            }

            const aiResponse = message.content || "Xin lỗi, tôi không thể xử lý câu hỏi này lúc này.";

            // Add to memory
            await conversationMemory.addMessage(socketId, {
                id: (Date.now() + 1).toString(),
                content: aiResponse,
                role: 'assistant',
                timestamp: new Date()
            });

            return aiResponse;

        } catch (error) {
            logger.error("❌ Error in fallback mode:", error);

            // Ultimate fallback with static responses
            return this.getStaticResponse(query);
        }
    }

    getStaticResponse(query: string): string {
        const lowerQuery = query.toLowerCase();

        if (lowerQuery.includes('giới thiệu') || lowerQuery.includes('aliconcon') || lowerQuery.includes('về')) {
            return `# 🛍️ Chào mừng đến với Aliconcon!

**Aliconcon** là nền tảng thương mại điện tử hàng đầu Việt Nam với:

## ✨ Đặc điểm nổi bật:
- Hàng triệu sản phẩm đa dạng
- Giao hàng nhanh toàn quốc
- Thanh toán an toàn, đa dạng
- Hỗ trợ khách hàng 24/7
- Chương trình khuyến mãi hấp dẫn

*Bạn có muốn tìm hiểu về sản phẩm nào cụ thể không?*`;
        }

        // Default response
        return `# 🤖 Trợ lý Aliconcon

**Xin chào!** Tôi có thể giúp bạn:

- 🏪 **Tìm hiểu về nền tảng Aliconcon**
- 🛍️ **Xem sản phẩm bán chạy và khuyến mãi**
- 💡 **Hướng dẫn mua hàng và thanh toán**
- 📞 **Hỗ trợ dịch vụ khách hàng**

*Vui lòng cho tôi biết bạn cần hỗ trợ gì cụ thể!*`;
    }

    // Generate unique socket ID
    generateSocketId(): string {
        return `socket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // WebSocket server setup with memory integration
    async startWebSocketServer(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                // Create HTTPS server for WSS (WebSocket Secure)
                if (USE_WSS) {
                    try {
                        const certPath = path.join(process.cwd(), 'certificates');
                        const keyPath = path.join(certPath, 'key.pem');
                        const certFilePath = path.join(certPath, 'cert.pem');

                        // Check if certificates exist
                        if (!fs.existsSync(keyPath) || !fs.existsSync(certFilePath)) {
                            logger.warn("🔒 SSL certificates not found, generating self-signed certificates...");
                            await this.generateSelfSignedCertificates();
                        }

                        httpServer = createHttpsServer({
                            key: fs.readFileSync(keyPath),
                            cert: fs.readFileSync(certFilePath)
                        });
                        logger.info("🔒 HTTPS server created for WSS (WebSocket Secure)");
                    } catch (error) {
                        logger.error("❌ Failed to setup HTTPS for WSS:", error);
                        logger.info("🔄 Falling back to HTTP/WS...");
                        httpServer = createHttpsServer({
                            key: fs.readFileSync(path.join(process.cwd(), 'certificates', 'key.pem')),
                            cert: fs.readFileSync(path.join(process.cwd(), 'certificates', 'cert.pem'))
                        });
                    }
                } else {
                    // Fallback to HTTP for WS
                    httpServer = createHttpServer();
                    logger.info("🌐 HTTP server created for WS (WebSocket)");
                }

                // Create WebSocket server
                wss = new WebSocketServer({
                    server: httpServer,
                    path: '/chat'
                });

                wss.on('connection', (ws: WebSocket, request: IncomingMessage) => {
                    const socketId = this.generateSocketId();

                    // Store client mapping
                    this.connectedClients.set(ws, socketId);
                    this.socketClients.set(socketId, ws);

                    logger.info(`🔌 New WebSocket client connected: ${socketId}`);

                    // Send welcome message
                    this.sendToClient(ws, {
                        type: 'welcome',
                        message: 'Chào mừng đến với Aliconcon AI Assistant!',
                        timestamp: new Date().toISOString(),
                        socketId,
                        secure: USE_WSS
                    });

                    // Handle incoming messages
                    ws.on('message', async (data: Buffer) => {
                        try {
                            const message = JSON.parse(data.toString());
                            await this.handleWebSocketMessage(ws, message, socketId);
                        } catch (error) {
                            logger.error('❌ Error parsing WebSocket message:', error);
                            this.sendToClient(ws, {
                                type: 'error',
                                message: 'Invalid message format',
                                timestamp: new Date().toISOString()
                            });
                        }
                    });

                    // Handle client disconnect
                    ws.on('close', async () => {
                        logger.info(`🔌 WebSocket client disconnected: ${socketId}`);

                        // Cleanup mappings
                        this.connectedClients.delete(ws);
                        this.socketClients.delete(socketId);

                        // Optional: Keep conversation in Redis or clean it up
                        // await conversationMemory.removeSession(socketId);
                    });

                    // Handle errors
                    ws.on('error', (error: Error) => {
                        logger.error(`❌ WebSocket error for client ${socketId}:`, error);
                        this.connectedClients.delete(ws);
                        this.socketClients.delete(socketId);
                    });
                });

                // Start server
                httpServer.listen(WEBSOCKET_PORT, () => {
                    const protocol = USE_WSS ? 'wss' : 'ws';
                    const serverType = USE_WSS ? 'WSS (Secure WebSocket)' : 'WS (WebSocket)';
                    logger.info(`🚀 ${serverType} server running on ${protocol}://localhost:${WEBSOCKET_PORT}/chat`);
                    logger.info(`📊 Redis Memory: ${conversationMemory.isRedisConnected() ? 'Connected' : 'Disconnected'}`);

                    if (USE_WSS) {
                        logger.info("🔒 SSL/TLS encryption enabled for secure WebSocket connections");
                        logger.info("🌐 Client connection URL: wss://localhost:8001/chat");
                    } else {
                        logger.info("🌐 Client connection URL: ws://localhost:8001/chat");
                    }

                    resolve();
                });

                httpServer.on('error', (error: Error) => {
                    logger.error('❌ Server error:', error);
                    reject(error);
                });

            } catch (error) {
                logger.error('❌ Failed to start WebSocket server:', error);
                reject(error);
            }
        });
    }

    // Generate self-signed certificates for WSS
    async generateSelfSignedCertificates(): Promise<void> {
        const { execSync } = await import('child_process');
        const certDir = path.join(process.cwd(), 'certificates');

        // Create certificates directory if it doesn't exist
        if (!fs.existsSync(certDir)) {
            fs.mkdirSync(certDir, { recursive: true });
        }

        const keyPath = path.join(certDir, 'key.pem');
        const certPath = path.join(certDir, 'cert.pem');

        try {
            // Generate self-signed certificate with SAN for localhost and Tailscale domain
            const subjectAltName = 'DNS:localhost,DNS:aliconcon.tail61bbbd.ts.net,IP:127.0.0.1';

            execSync(`openssl req -x509 -newkey rsa:4096 -keyout "${keyPath}" -out "${certPath}" -days 365 -nodes -subj "/C=VN/ST=HCM/L=HoChiMinh/O=Aliconcon/CN=localhost" -addext "subjectAltName=${subjectAltName}"`, {
                stdio: 'pipe'
            });

            logger.info("🔒 Self-signed SSL certificates generated successfully");
            logger.info(`🔑 Private key: ${keyPath}`);
            logger.info(`📜 Certificate: ${certPath}`);
            logger.info("🌐 Valid for: localhost, aliconcon.tail61bbbd.ts.net, 127.0.0.1");

        } catch (error) {
            logger.error("❌ Failed to generate SSL certificates:", error);
            logger.warn("💡 Make sure OpenSSL is installed: sudo apt-get install openssl");
            throw error;
        }
    }

    // Handle WebSocket messages from clients
    async handleWebSocketMessage(ws: WebSocket, message: any, socketId: string): Promise<void> {
        try {
            console.log(`📨 [${socketId}] Received message:`, message);

            switch (message.type) {
                case 'init_profile':
                    await this.handleInitProfile(ws, message, socketId);
                    break;

                case 'chat':
                    await this.handleChatMessage(ws, message, socketId);
                    break;

                case 'get_conversation_history':
                    await this.handleGetConversationHistory(ws, socketId);
                    break;

                case 'clear_conversation':
                    await this.handleClearConversation(ws, socketId);
                    break;

                case 'ping':
                    this.sendToClient(ws, {
                        type: 'pong',
                        timestamp: new Date().toISOString()
                    });
                    break;

                default:
                    this.sendToClient(ws, {
                        type: 'error',
                        message: `Unknown message type: ${message.type}`,
                        timestamp: new Date().toISOString()
                    });
            }
        } catch (error: any) {
            console.error(`❌ [${socketId}] Error handling message:`, error);
            this.sendToClient(ws, {
                type: 'error',
                message: 'Đã xảy ra lỗi khi xử lý tin nhắn',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    async handleInitProfile(ws: WebSocket, message: any, socketId: string): Promise<void> {
        try {
            const { accessToken, context } = message;

            console.log(`🔐 [${socketId}] Initializing profile...`);

            // Call tool to get user profile
            let profileResponse: string;
            let userProfile: UserProfile;
            let cartInfo: any = null;

            if (accessToken) {
                profileResponse = await this.callMCPTool('get-user-profile', { accessToken });

                // Also get cart information if user is logged in
                try {
                    const cartResponse = await this.callMCPTool('get-cart', { accessToken });
                    cartInfo = JSON.parse(cartResponse);
                    console.log(`🛒 [${socketId}] Cart info loaded:`, cartInfo.cartItemCount || 0, 'items');
                } catch (cartError) {
                    console.log(`⚠️ [${socketId}] Could not load cart:`, cartError);
                }
            } else {
                profileResponse = await this.callMCPTool('get-user-profile', {});
            }

            try {
                const profileData = JSON.parse(profileResponse);
                profileData.user_avatar = 'https://aliconcon.tail61bbbd.ts.net:4000/media/' + profileData.user_avatar;

                userProfile = {
                    ...profileData,
                };
            } catch (parseError) {
                console.error('❌ Error parsing profile response:', parseError);
                // Fallback to guest user
                userProfile = {
                    _id: "guest",
                    user_fullName: "Khách",
                    user_email: null,
                    phoneNumber: null,
                    user_role: "guest",
                    user_avatar: null,
                    user_sex: null,
                    user_status: "active",
                    user_dayOfBirth: null,
                    role_name: "USER",
                    isGuest: true,
                    accessToken: accessToken || undefined
                };
            }

            // Save profile to Redis
            await this.memoryStore.saveUserProfile(socketId, userProfile);

            // Save cart info to context if available
            if (cartInfo) {
                await this.memoryStore.updateContext(socketId, {
                    ...context,
                    cartInfo: cartInfo
                });
            }

            // Generate welcome message based on profile and cart
            const welcomeMessage = this.generateWelcomeMessage(userProfile, context, cartInfo);

            // Send welcome response
            this.sendToClient(ws, {
                type: 'profile_initialized',
                profile: userProfile,
                welcomeMessage: welcomeMessage,
                cartInfo: cartInfo,
                timestamp: new Date().toISOString()
            });

            // Add welcome message to conversation history
            await this.memoryStore.addMessage(socketId, {
                id: `welcome_${Date.now()}`,
                content: welcomeMessage,
                role: 'assistant',
                timestamp: new Date(),
                context: { isWelcomeMessage: true }
            });

            console.log(`✅ [${socketId}] Profile initialized for user: ${userProfile.user_fullName}`);

        } catch (error: any) {
            console.error(`❌ [${socketId}] Error initializing profile:`, error);

            // Send error response
            this.sendToClient(ws, {
                type: 'profile_error',
                message: 'Không thể khởi tạo profile người dùng',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    generateWelcomeMessage(profile: UserProfile, context?: any, cartInfo?: any): string {
        const currentTime = new Date();
        const hour = currentTime.getHours();

        let timeGreeting = '';
        if (hour < 12) {
            timeGreeting = 'Chào buổi sáng';
        } else if (hour < 18) {
            timeGreeting = 'Chào buổi chiều';
        } else {
            timeGreeting = 'Chào buổi tối';
        }

        let personalGreeting = '';
        let roleInfo = '';

        if (profile.isGuest) {
            personalGreeting = `${timeGreeting}! Xin chào bạn`;
            roleInfo = "Bạn đang truy cập với tư cách khách. Hãy đăng nhập để có trải nghiệm tốt hơn!";
        } else {
            const displayName = profile.user_fullName || 'bạn';
            personalGreeting = `${timeGreeting} ${displayName}!`;

            if (profile.role_name === 'ADMIN') {
                roleInfo = "Bạn đang đăng nhập với quyền Quản trị viên.";
            } else if (profile.role_name === 'SHOP_OWNER') {
                roleInfo = "Bạn đang đăng nhập với tư cách chủ cửa hàng.";
            } else {
                roleInfo = "Chào mừng bạn đến với Aliconcon!";
            }
        }

        // Add cart information if available
        let cartMessage = '';
        if (cartInfo && cartInfo.success && cartInfo.cartItemCount > 0) {
            cartMessage = `\n\n🛒 **Giỏ hàng của bạn**: ${cartInfo.cartItemCount} sản phẩm`;

            // Show a few cart items if available
            if (cartInfo.data && Array.isArray(cartInfo.data) && cartInfo.data.length > 0) {
                const firstItem = cartInfo.data[0];
                if (firstItem.cart_shop && firstItem.cart_shop.products && firstItem.cart_shop.products.length > 0) {
                    const product = firstItem.cart_shop.products[0];
                    cartMessage += `\n- ${product.product_name}: ${product.cart_quantity}x`;

                    if (cartInfo.data.length > 1 || firstItem.cart_shop.products.length > 1) {
                        cartMessage += `\n- ...và còn nhiều sản phẩm khác`;
                    }
                }
            }

            cartMessage += `\n\n💡 Hỏi tôi về "giỏ hàng" để xem chi tiết hoặc "thanh toán" để hoàn tất đơn hàng!`;
        } else if (!profile.isGuest) {
            cartMessage = `\n\n🛒 **Giỏ hàng trống** - Tìm sản phẩm yêu thích và thêm vào giỏ hàng nhé!`;
        }

        const features = [
            "🔍 Tìm kiếm và khám phá sản phẩm",
            "💰 So sánh giá từ nhiều cửa hàng",
            "⭐ Xem đánh giá sản phẩm",
            "🛒 Tư vấn mua sắm thông minh",
            "💳 Hướng dẫn thanh toán",
            "📞 Hỗ trợ khách hàng 24/7"
        ];

        const contextInfo = context?.currentPage ? `\n\n📍 Bạn đang ở trang: ${context.currentPage}` : '';

        return `${personalGreeting}

${roleInfo}${cartMessage}

Tôi là AI Assistant của Aliconcon, sẵn sàng hỗ trợ bạn:

${features.join('\n')}

Hãy hỏi tôi bất cứ điều gì về sản phẩm, dịch vụ, hoặc cách sử dụng website! 😊${contextInfo}`;
    }

    // Handle chat messages with memory
    async handleChatMessage(ws: WebSocket, message: any, socketId: string): Promise<void> {
        const { content, context } = message;

        if (!content || !content.trim()) {
            this.sendToClient(ws, {
                type: 'error',
                message: 'Message content is required',
                timestamp: new Date().toISOString()
            });
            return;
        }

        // Send typing indicator
        this.sendToClient(ws, {
            type: 'typing',
            isTyping: true,
            timestamp: new Date().toISOString()
        });

        try {
            // Process the message with memory
            const response = await this.processQueryWithMemory(socketId, content.trim(), context);

            // Send AI response
            this.sendToClient(ws, {
                type: 'message',
                content: response,
                sender: 'ai',
                timestamp: new Date().toISOString(),
                markdown: true
            });

        } catch (error) {
            logger.error(`❌ Error processing chat message for ${socketId}:`, error);

            this.sendToClient(ws, {
                type: 'message',
                content: 'Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau.',
                sender: 'ai',
                timestamp: new Date().toISOString(),
                error: true
            });
        } finally {
            // Stop typing indicator
            this.sendToClient(ws, {
                type: 'typing',
                isTyping: false,
                timestamp: new Date().toISOString()
            });
        }
    }

    // Send message to specific client
    sendToClient(ws: WebSocket, data: any): void {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(data));
        }
    }

    // Broadcast message to all connected clients
    broadcast(data: any): void {
        this.connectedClients.forEach((socketId, client) => {
            this.sendToClient(client, data);
        });
    }

    async startChatLoop() {
        console.log("\n🛍️ Trợ lý AI Aliconcon - Nền tảng Thương mại Điện tử 🛍️");
        console.log("-".repeat(60));
        console.log("Chào mừng bạn đến với Aliconcon! Tôi có thể giúp bạn:");
        console.log("  • Tìm hiểu về nền tảng Aliconcon");
        console.log("  • Xem sản phẩm phổ biến và bán chạy");
        console.log("  • Hỗ trợ thông tin mua sắm");
        console.log("  • Giải đáp các câu hỏi về dịch vụ");
        console.log("\nGõ 'exit' hoặc 'quit' để kết thúc.");
        console.log("Gõ 'models' để xem gợi ý models khác.");
        console.log("-".repeat(60));
        console.log(`🤖 Sử dụng model: ${MODEL_NAME} (qua OpenRouter)`);
        console.log(`🧠 Thinking traces: ${DISABLE_THINKING ? 'DISABLED' : 'ENABLED'}`);
        console.log(`📊 Redis Memory: ${conversationMemory.isRedisConnected() ? 'Connected' : 'Disconnected'}`);
        console.log(`🔒 WebSocket Security: ${USE_WSS ? 'WSS (Secure)' : 'WS (Standard)'}`);
        console.log(`🌐 WebSocket URL: ${USE_WSS ? 'wss' : 'ws'}://localhost:${WEBSOCKET_PORT}/chat`);

        // Check if using free model and warn about limitations
        if (MODEL_NAME.includes(':free')) {
            console.log("💰 Model miễn phí: Tool calling có thể bị hạn chế, sử dụng chế độ fallback");
        }

        console.log("-".repeat(60));

        const consoleSocketId = 'console_session';

        while (true) {
            try {
                const query = await this.rl.question("\n💬 Câu hỏi của bạn: ");

                if (query.toLowerCase().trim() === 'exit' ||
                    query.toLowerCase().trim() === 'quit' ||
                    query.toLowerCase().trim() === 'q') {
                    console.log("\n👋 Cảm ơn bạn đã sử dụng dịch vụ Aliconcon. Hẹn gặp lại!");
                    break;
                }

                if (query.toLowerCase().trim() === 'models') {
                    this.showModelSuggestions();
                    continue;
                }

                if (query.toLowerCase().trim() === 'stats') {
                    const stats = await conversationMemory.getSessionStats(consoleSocketId);
                    const activeCount = await conversationMemory.getActiveSessionsCount();
                    console.log(`\n📊 Session Stats:`, stats);
                    console.log(`🔗 Active Sessions: ${activeCount}`);
                    console.log(`🔒 WSS Status: ${USE_WSS ? 'Enabled' : 'Disabled'}`);
                    console.log(`📊 Redis Status: ${conversationMemory.isRedisConnected() ? 'Connected' : 'Disconnected'}`);
                    continue;
                }

                if (query.trim()) {
                    console.log("🔍 Đang xử lý câu hỏi...");
                    try {
                        const response = await this.processQueryWithMemory(consoleSocketId, query);
                        console.log(`\n🤖 Trợ lý Aliconcon:\n${response}`);
                    } catch (error) {
                        console.log(`❌ Lỗi: ${error}`);
                        console.log("💡 Thử gõ 'models' để xem gợi ý models khác");
                    }
                }
            } catch (error) {
                console.log(`❌ Lỗi: ${error}`);
                break;
            }
        }
    }

    showModelSuggestions() {
        console.log("\n🤖 GỢI Ý MODELS CHO ALICONCON MCP:");
        console.log("-".repeat(50));

        console.log("\n💰 MODELS MIỄN PHÍ HỖ TRỢ TOOL CALLING:");
        console.log("export LLM_MODEL='qwen/qwen3-30b-a3b:free'");
        console.log("export LLM_MODEL='meta-llama/llama-4-maverick:free'");
        console.log("export LLM_MODEL='google/gemini-2.5-pro:free'");

        console.log("\n🆓 MODELS MIỄN PHÍ (FALLBACK MODE):");
        console.log("export LLM_MODEL='deepseek/deepseek-r1:free'");
        console.log("export LLM_MODEL='mistral/mistral-small-3.1:free'");

        console.log("\n💎 MODELS CÓ PHÍ MẠNH:");
        console.log("export LLM_MODEL='openai/gpt-4o'");
        console.log("export LLM_MODEL='anthropic/claude-3.5-sonnet'");
        console.log("export LLM_MODEL='google/gemini-2.5-pro'");

        console.log("\n💡 Để thay đổi model:");
        console.log("1. Thoát chương trình (Ctrl+C)");
        console.log("2. Chạy lệnh export ở trên");
        console.log("3. Khởi động lại: bun run index.ts");
        console.log("-".repeat(50));
    }

    async cleanup() {
        this.rl.close();
        logger.info("🔌 Closing MCP client...");

        // Close WebSocket server
        if (wss) {
            wss.close();
            logger.info("🔌 WebSocket server closed");
        }

        // Close HTTP server
        if (httpServer) {
            httpServer.close();
            logger.info("🔌 HTTP server closed");
        }

        // Close Redis connection
        await conversationMemory.close();
        logger.info("🔌 Redis connection closed");
    }

    async handleGetConversationHistory(ws: WebSocket, socketId: string): Promise<void> {
        try {
            const history = await this.memoryStore.getConversationHistory(socketId, 20);

            this.sendToClient(ws, {
                type: 'conversation_history',
                history: history,
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            console.error(`❌ [${socketId}] Error getting conversation history:`, error);
            this.sendToClient(ws, {
                type: 'error',
                message: 'Không thể lấy lịch sử hội thoại',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    async handleClearConversation(ws: WebSocket, socketId: string): Promise<void> {
        try {
            await this.memoryStore.removeSession(socketId);

            this.sendToClient(ws, {
                type: 'conversation_cleared',
                message: 'Đã xóa lịch sử hội thoại',
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            console.error(`❌ [${socketId}] Error clearing conversation:`, error);
            this.sendToClient(ws, {
                type: 'error',
                message: 'Không thể xóa lịch sử hội thoại',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }
}

async function main() {
    // Check OpenRouter API key
    if (!OPENROUTER_API_KEY) {
        console.error("❌ OPENROUTER_API_KEY is not set!");
        console.log("💡 Hướng dẫn:");
        console.log("1. Truy cập https://openrouter.ai và đăng ký tài khoản MIỄN PHÍ");
        console.log("2. Lấy API key từ dashboard");
        console.log("3. Đặt biến môi trường: export OPENROUTER_API_KEY=your_api_key");
        process.exit(1);
    }

    const client = new AliconconMCPClient();

    try {
        // Connect to MCP server
        const connected = await client.connectToServer();
        if (!connected) {
            console.error("❌ Không thể kết nối đến MCP server");
            console.log("💡 Đảm bảo MCP server đang chạy:");
            console.log("cd server-mcp && bun run server.ts");
            process.exit(1);
        }

        // Start WebSocket server
        await client.startWebSocketServer();

        // Start console chat loop
        await client.startChatLoop();

    } catch (error) {
        console.error("❌ Lỗi:", error);
    } finally {
        await client.cleanup();
    }
}

// Handle process termination
process.on('SIGINT', async () => {
    console.log("\n👋 Đang thoát...");
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log("\n👋 Đang thoát...");
    process.exit(0);
});

// Run the application
if (import.meta.main) {
    main().catch(console.error);
}