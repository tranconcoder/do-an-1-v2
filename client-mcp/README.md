# Aliconcon MCP Client - OpenRouter + AI Models

Trợ lý AI thông minh cho nền tảng thương mại điện tử Aliconcon, sử dụng các AI models MIỄN PHÍ qua OpenRouter với MCP (Model Context Protocol).

## 🚀 Tính năng

-   **MIỄN PHÍ**: Sử dụng Qwen3 30B và các models khác hoàn toàn miễn phí qua OpenRouter
-   **MCP Integration**: Kết nối với MCP server để truy cập tools và resources
-   **Tool Calling**: AI có thể gọi các tools để lấy thông tin thực tế (với models hỗ trợ)
-   **Fallback System**: Tự động chuyển sang chế độ fallback nếu model không hỗ trợ tools
-   **Multi-Model Support**: Hỗ trợ hơn 300 AI models qua OpenRouter

## 🔧 Cài đặt

### 1. Lấy API Key MIỄN PHÍ từ OpenRouter

1. Truy cập [https://openrouter.ai](https://openrouter.ai)
2. Đăng ký tài khoản MIỄN PHÍ
3. Vào Dashboard → Keys → Create Key
4. Copy API key

### 2. Cấu hình Environment

```bash
# Đặt API key (REQUIRED)
export OPENROUTER_API_KEY='your_api_key_here'

# Cấu hình tùy chọn
export LLM_MODEL='qwen/qwen3-30b-a3b:free'  # Model mặc định (MIỄN PHÍ)
export LLM_TEMPERATURE='0.7'
export DISABLE_THINKING='true'
export MCP_PORT='8000'
export MCP_URL='http://localhost:8000'
```

### 3. Cài đặt dependencies

```bash
cd client-mcp
bun install
```

## 🎯 Sử dụng

### Chạy từ script tự động (Khuyến nghị)

```bash
# Từ thư mục gốc dự án
./run_aliconcon_mcp.sh
```

### Chạy thủ công

```bash
# Terminal 1: Start MCP server
cd server-mcp
bun run server.ts

# Terminal 2: Start client
cd client-mcp
export OPENROUTER_API_KEY='your_api_key_here'
bun run index.ts
```

## 🤖 Models được khuyến nghị

### Models MIỄN PHÍ hỗ trợ Tool Calling:

```bash
export LLM_MODEL='qwen/qwen3-30b-a3b:free'        # Qwen3 30B (Khuyến nghị)
export LLM_MODEL='meta-llama/llama-4-maverick:free' # Llama 4 Maverick
export LLM_MODEL='google/gemini-2.5-pro:free'     # Gemini 2.5 Pro
```

### Models MIỄN PHÍ không hỗ trợ Tool Calling (sử dụng fallback):

```bash
export LLM_MODEL='deepseek/deepseek-r1:free'      # DeepSeek R1
export LLM_MODEL='mistral/mistral-small-3.1:free' # Mistral Small 3.1
```

### Models CÓ PHÍ với Tool Calling mạnh:

```bash
export LLM_MODEL='openai/gpt-4o'                  # GPT-4o
export LLM_MODEL='anthropic/claude-3.5-sonnet'    # Claude 3.5 Sonnet
export LLM_MODEL='google/gemini-2.5-pro'          # Gemini 2.5 Pro (paid)
```

## ⚠️ Xử lý lỗi thường gặp

### Lỗi 401 - No auth credentials found

```
❌ Error: 401 No auth credentials found
```

**Nguyên nhân**: API key không được đặt hoặc không hợp lệ

**Giải pháp**:

1. Kiểm tra API key đã được đặt: `echo $OPENROUTER_API_KEY`
2. Nếu chưa có, đặt API key: `export OPENROUTER_API_KEY='your_key'`
3. Nếu đã có, kiểm tra key có đúng không tại [https://openrouter.ai/keys](https://openrouter.ai/keys)
4. Tạo key mới nếu cần thiết

### Lỗi 404 - No endpoints found that support tool use

```
❌ Error: 404 No endpoints found that support tool use
```

**Nguyên nhân**: Model hiện tại không hỗ trợ tool calling

**Giải pháp**: Hệ thống sẽ tự động chuyển sang chế độ fallback, hoặc bạn có thể thay đổi model:

```bash
export LLM_MODEL='qwen/qwen3-30b-a3b:free'  # Model miễn phí hỗ trợ tools
```

### Lỗi "No endpoints found for model"

**Nguyên nhân**: Model không tồn tại hoặc không khả dụng

**Giải pháp**: Kiểm tra danh sách models khả dụng tại [https://openrouter.ai/models](https://openrouter.ai/models)

## 🛠️ Available Tools

-   `introduce`: Giới thiệu về nền tảng Aliconcon
-   `popular-products`: Lấy danh sách sản phẩm phổ biến

## 🔄 Chế độ Fallback

Khi model không hỗ trợ tool calling, hệ thống tự động chuyển sang chế độ fallback với:

-   Context-aware prompting với thông tin về Aliconcon
-   Static responses cho các câu hỏi phổ biến
-   Vẫn cung cấp trải nghiệm người dùng tốt

## 📖 Tham khảo

-   [OpenRouter Documentation](https://openrouter.ai/docs)
-   [OpenRouter Models](https://openrouter.ai/models)
-   [OpenRouter Tool Calling Guide](https://openrouter.ai/docs/features/tool-calling)

## 🔄 Cấu hình nâng cao

### Bật Thinking Traces (cho models hỗ trợ)

```bash
export DISABLE_THINKING='false'
```

### Sử dụng Model Routing

```bash
# Ưu tiên tốc độ
export LLM_MODEL='qwen/qwen3-30b-a3b:nitro'

# Ưu tiên giá rẻ
export LLM_MODEL='qwen/qwen3-30b-a3b:floor'
```

### Thay đổi Temperature

```bash
export LLM_TEMPERATURE='0.3'  # Conservative
export LLM_TEMPERATURE='0.9'  # Creative
```

## 📁 Cấu trúc dự án

```
client-mcp/
├── index.ts           # Main client application
├── package.json       # Dependencies và scripts
├── tsconfig.json      # TypeScript configuration
├── README.md          # Documentation
└── .gitignore         # Git ignore rules
```

## 🔗 Liên quan

-   [Aliconcon MCP Server](../server-mcp/README.md)
-   [Ollama Documentation](https://ollama.ai/docs)
-   [Model Context Protocol](https://modelcontextprotocol.io/)

---

**Aliconcon MCP Client** - Trải nghiệm AI shopping thông minh! 🛍️🤖
