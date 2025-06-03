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
const OPENROUTER_API_KEY = "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";
// const MODEL_NAME = process.env.LLM_MODEL || "meta-llama/llama-3-70b-instruct";
const MODEL_NAME = process.env.LLM_MODEL || "deepseek/deepseek-chat-v3-0324:free";
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

            // First, try with tools if available
            let useTools = availableTools.length > 0;

            try {
                // Call OpenRouter with tools
                const response = await openai.chat.completions.create({
                    model: MODEL_NAME,
                    messages: this.messages,
                    tools: useTools ? availableTools : undefined,
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
                    logger.info(`✅ Tool calling supported! Processing ${message.tool_calls.length} tool calls`);

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
                    logger.info("ℹ️ No tool calls made, returning direct response");
                    finalText.push(message.content || "");
                }

                return finalText.join('\n');

            } catch (toolError: any) {
                // If tool calling fails (404 error), fall back to no-tool mode
                if (toolError.message?.includes('404') && toolError.message?.includes('tool use')) {
                    logger.warn("🔄 Tool calling not supported by this model, falling back to context-aware mode");
                    return await this.processQueryWithoutTools(query);
                }

                // Check for other tool-related errors
                if (toolError.message?.includes('tool') || toolError.message?.includes('function')) {
                    logger.warn("🔄 Tool-related error detected, falling back to context-aware mode");
                    return await this.processQueryWithoutTools(query);
                }

                throw toolError;
            }

        } catch (error) {
            logger.error("❌ Error processing query:", error);
            throw error;
        }
    }

    async processQueryWithoutTools(query: string): Promise<string> {
        try {
            // Create a context-aware prompt that includes information about Aliconcon
            const contextPrompt = `Bạn là trợ lý AI của Aliconcon - nền tảng thương mại điện tử hàng đầu Việt Nam.

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

Hãy trả lời câu hỏi của khách hàng một cách thân thiện và hữu ích. Nếu được hỏi về sản phẩm cụ thể mà không có trong danh sách, hãy gợi ý các sản phẩm tương tự.

Câu hỏi của khách hàng: ${query}`;

            // Remove the user message we added earlier since we're creating a new context
            this.messages.pop();

            // Add the context-aware message
            this.messages.push({
                role: "user",
                content: contextPrompt
            });

            const response = await openai.chat.completions.create({
                model: MODEL_NAME,
                messages: this.messages,
                temperature: 0.7,
                max_tokens: 1500
            });

            const message = response.choices[0]?.message;
            if (!message) {
                throw new Error("No message received from OpenRouter");
            }

            this.messages.push({
                role: message.role,
                content: message.content
            });

            return message.content || "Xin lỗi, tôi không thể xử lý câu hỏi này lúc này.";

        } catch (error) {
            logger.error("❌ Error in fallback mode:", error);

            // Ultimate fallback with static responses
            return this.getStaticResponse(query);
        }
    }

    getStaticResponse(query: string): string {
        const lowerQuery = query.toLowerCase();

        if (lowerQuery.includes('giới thiệu') || lowerQuery.includes('aliconcon') || lowerQuery.includes('về')) {
            return `🛍️ **Chào mừng đến với Aliconcon!**

Aliconcon là nền tảng thương mại điện tử hàng đầu Việt Nam với:

✨ **Đặc điểm nổi bật:**
• Hàng triệu sản phẩm đa dạng
• Giao hàng nhanh toàn quốc
• Thanh toán an toàn, đa dạng
• Hỗ trợ khách hàng 24/7
• Chương trình khuyến mãi hấp dẫn

🛒 **Danh mục sản phẩm:**
• Điện tử - Công nghệ
• Thời trang Nam/Nữ
• Gia dụng - Nội thất
• Sách - Văn phòng phẩm
• Đồ chơi - Mẹ & Bé

💝 **Cam kết:**
• Sản phẩm chính hãng 100%
• Đổi trả trong 30 ngày
• Bảo hành chính hãng
• Giá cả cạnh tranh

Bạn có muốn tìm hiểu về sản phẩm nào cụ thể không?`;
        }

        if (lowerQuery.includes('sản phẩm') || lowerQuery.includes('bán chạy') || lowerQuery.includes('phổ biến')) {
            return `🔥 **Sản phẩm bán chạy tại Aliconcon:**

📱 **Điện tử - Công nghệ:**
• iPhone 15 Pro Max - 29.990.000đ
• Samsung Galaxy S24 Ultra - 26.990.000đ  
• MacBook Air M3 - 28.990.000đ
• AirPods Pro 2 - 5.990.000đ

👕 **Thời trang:**
• Áo thun nam basic - 199.000đ
• Giày sneaker nữ - 899.000đ
• Túi xách nữ da thật - 1.299.000đ

🏠 **Gia dụng:**
• Nồi cơm điện Panasonic - 1.290.000đ
• Máy lọc nước RO - 3.990.000đ
• Robot hút bụi Xiaomi - 4.590.000đ

💡 **Gợi ý:** Tất cả sản phẩm đều có chương trình trả góp 0% và freeship toàn quốc!

Bạn quan tâm đến danh mục nào?`;
        }

        if (lowerQuery.includes('mua') || lowerQuery.includes('đặt hàng') || lowerQuery.includes('thanh toán')) {
            return `💳 **Hướng dẫn mua hàng tại Aliconcon:**

🛒 **Các bước đặt hàng:**
1. Tìm kiếm sản phẩm
2. Chọn sản phẩm và thêm vào giỏ
3. Kiểm tra giỏ hàng
4. Điền thông tin giao hàng
5. Chọn phương thức thanh toán
6. Xác nhận đơn hàng

💰 **Phương thức thanh toán:**
• COD (Thanh toán khi nhận hàng)
• Chuyển khoản ngân hàng
• Ví điện tử (MoMo, ZaloPay)
• Thẻ tín dụng/ghi nợ
• Trả góp 0% (cho đơn từ 3 triệu)

🚚 **Giao hàng:**
• Nội thành: 1-2 ngày
• Ngoại thành: 2-3 ngày
• Freeship cho đơn từ 150k

Bạn cần hỗ trợ gì thêm không?`;
        }

        // Default response
        return `🤖 **Trợ lý Aliconcon**

Xin chào! Tôi có thể giúp bạn:

• 🏪 Tìm hiểu về nền tảng Aliconcon
• 🛍️ Xem sản phẩm bán chạy và khuyến mãi
• 💡 Hướng dẫn mua hàng và thanh toán
• 📞 Hỗ trợ dịch vụ khách hàng

Vui lòng cho tôi biết bạn cần hỗ trợ gì cụ thể!

*Lưu ý: Do sử dụng model miễn phí, một số tính năng nâng cao có thể bị hạn chế.*`;
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

        // Check if using free model and warn about limitations
        if (MODEL_NAME.includes(':free')) {
            console.log("💰 Model miễn phí: Tool calling có thể bị hạn chế, sử dụng chế độ fallback");
        }

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

                if (query.toLowerCase().trim() === 'models') {
                    this.showModelSuggestions();
                    continue;
                }

                if (query.trim()) {
                    console.log("🔍 Đang xử lý câu hỏi...");
                    try {
                        const response = await this.processQuery(query);
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