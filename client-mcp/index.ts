import { stdin as input, stdout as output } from "node:process";
import * as readline from "node:readline/promises";
import OpenAI from "openai";
import { config } from "dotenv";
import pino from "pino";
import pretty from "pino-pretty";

// Load environment variables
config();

// Configure logger
const logger = pino(pretty({ colorize: true }));

// Configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "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";
const MODEL_NAME = process.env.LLM_MODEL || "anthropic/claude-3-7-sonnet";
const DISABLE_THINKING = process.env.DISABLE_THINKING === "true" || true;
const MCP_SERVER_URL = process.env.MCP_URL || "http://localhost:8000";

// OpenAI client configured for OpenRouter
const openai = new OpenAI({
    apiKey: OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

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
    private messages: any[] = [];
    private rl: readline.Interface;
    private availableTools: any[] = [];

    constructor() {
        this.rl = readline.createInterface({ input, output });
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

    async processQuery(query: string): Promise<string> {
        // Add user message
        this.messages.push({
            role: "user",
            content: query
        });

        try {
            // Convert tools to OpenAI format
            const availableTools = this.availableTools.map(convertToolFormat);

            logger.info(`🛠️ Available tools: ${this.availableTools.map((t: any) => t.name).join(', ')}`);

            // Call OpenRouter with tools
            const response = await openai.chat.completions.create({
                model: MODEL_NAME,
                messages: this.messages,
                tools: availableTools.length > 0 ? availableTools : undefined,
                temperature: 0.7,
                max_tokens: 2048
            });

            const message = response.choices[0]?.message;
            if (!message) {
                throw new Error("No message received from OpenRouter");
            }

            this.messages.push({
                role: message.role,
                content: message.content,
                tool_calls: message.tool_calls
            });

            let finalText: string[] = [];

            // Handle tool calls if any
            if (message.tool_calls && message.tool_calls.length > 0) {
                for (const toolCall of message.tool_calls) {
                    const toolName = toolCall.function.name;
                    const toolArgs = JSON.parse(toolCall.function.arguments || "{}");

                    logger.info(`🔧 Calling tool: ${toolName} with args:`, toolArgs);
                    finalText.push(`[Đang gọi tool ${toolName}...]`);

                    try {
                        // Execute tool call via MCP HTTP API
                        const result = await this.callMCPTool(toolName, toolArgs);

                        // Add tool result to messages
                        this.messages.push({
                            role: "tool",
                            tool_call_id: toolCall.id,
                            name: toolName,
                            content: result
                        });

                        logger.info(`✅ Tool ${toolName} executed successfully`);

                    } catch (error) {
                        logger.error(`❌ Error calling tool ${toolName}:`, error);
                        this.messages.push({
                            role: "tool",
                            tool_call_id: toolCall.id,
                            name: toolName,
                            content: `Error: ${error}`
                        });
                    }
                }

                // Get final response after tool execution
                const finalResponse = await openai.chat.completions.create({
                    model: MODEL_NAME,
                    messages: this.messages,
                    max_tokens: 1000,
                    temperature: 0.7
                });

                const finalMessage = finalResponse.choices[0]?.message;
                if (!finalMessage) {
                    throw new Error("No final message received from OpenRouter");
                }

                this.messages.push({
                    role: finalMessage.role,
                    content: finalMessage.content
                });

                finalText.push(finalMessage.content || "");
            } else {
                // No tool calls, just return the response
                finalText.push(message.content || "");
            }

            return finalText.join('\n');

        } catch (error) {
            logger.error("❌ Error processing query:", error);
            throw error;
        }
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
        console.log("-".repeat(60));
        console.log(`🤖 Sử dụng model: ${MODEL_NAME} (MIỄN PHÍ qua OpenRouter)`);
        console.log(`🧠 Thinking traces: ${DISABLE_THINKING ? 'DISABLED' : 'ENABLED'}`);
        console.log("-".repeat(60));

        while (true) {
            try {
                const query = await this.rl.question("\n💬 Câu hỏi của bạn: ");

                if (query.toLowerCase().trim() === 'exit' ||
                    query.toLowerCase().trim() === 'quit' ||
                    query.toLowerCase().trim() === 'q') {
                    console.log("\n👋 Cảm ơn bạn đã sử dụng dịch vụ Aliconcon. Hẹn gặp lại!");
                    break;
                }

                if (query.trim()) {
                    console.log("🔍 Đang xử lý câu hỏi...");
                    try {
                        const response = await this.processQuery(query);
                        console.log(`\n🤖 Trợ lý Aliconcon:\n${response}`);
                    } catch (error) {
                        console.log(`❌ Lỗi: ${error}`);
                    }
                }
            } catch (error) {
                console.log(`❌ Lỗi: ${error}`);
                break;
            }
        }
    }

    async cleanup() {
        this.rl.close();
        logger.info("🔌 Closing MCP client...");
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

        // Start chat loop
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