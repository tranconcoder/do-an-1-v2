# Aliconcon MCP Client - OpenRouter + AI Models + WSS + Redis Memory

Trợ lý AI thông minh cho nền tảng thương mại điện tử Aliconcon, sử dụng các AI models MIỄN PHÍ qua OpenRouter với MCP (Model Context Protocol), WebSocket Secure (WSS) và Redis memory system.

## 🚀 Tính năng

-   **MIỄN PHÍ**: Sử dụng Qwen3 30B và các models khác hoàn toàn miễn phí qua OpenRouter
-   **MCP Integration**: Kết nối với MCP server để truy cập tools và resources
-   **Tool Calling**: AI có thể gọi các tools để lấy thông tin thực tế (với models hỗ trợ)
-   **WSS (WebSocket Secure)**: Kết nối WebSocket an toàn với SSL/TLS encryption
-   **Redis Memory**: Hệ thống ghi nhớ conversation theo socket ID với Redis
-   **Fallback System**: Tự động chuyển sang chế độ fallback nếu model không hỗ trợ tools
-   **Multi-Model Support**: Hỗ trợ hơn 300 AI models qua OpenRouter

## 🔧 Cài đặt

### 1. Lấy API Key MIỄN PHÍ từ OpenRouter

1. Truy cập [https://openrouter.ai](https://openrouter.ai)
2. Đăng ký tài khoản MIỄN PHÍ
3. Vào Dashboard → Keys → Create Key
4. Copy API key

### 2. Cài đặt Redis (cho Memory System)

```bash
# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis-server

# macOS
brew install redis
brew services start redis

# Docker
docker run -d -p 6379:6379 redis:alpine
```

### 3. Cấu hình Environment

```bash
# Đặt API key (REQUIRED)
export OPENROUTER_API_KEY='your_api_key_here'

# Cấu hình tùy chọn
export LLM_MODEL='qwen/qwen3-30b-a3b:free'  # Model mặc định (MIỄN PHÍ)
export LLM_TEMPERATURE='0.7'
export DISABLE_THINKING='true'
export MCP_PORT='8000'
export MCP_URL='http://localhost:8000'

# WebSocket Security Configuration
export USE_WSS='true'                       # Enable WSS (default: true)
export WEBSOCKET_PORT='8001'

# Redis Configuration
export REDIS_URL='redis://localhost:6379'   # Redis connection URL
```

### 4. Cài đặt dependencies

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
# Terminal 1: Start Redis (if not running)
redis-server

# Terminal 2: Start MCP server
cd server-mcp
bun run server.ts

# Terminal 3: Start client
cd client-mcp
export OPENROUTER_API_KEY='your_api_key_here'
bun run index.ts
```

## 🔒 WebSocket Security (WSS)

### Tự động tạo SSL Certificates

Client sẽ tự động tạo self-signed SSL certificates nếu chưa có:

```bash
# Certificates sẽ được tạo tại:
client-mcp/certificates/
├── key.pem    # Private key
└── cert.pem   # Certificate
```

### Kết nối WSS từ Client

```javascript
// Kết nối WSS an toàn
const ws = new WebSocket('wss://localhost:8001/chat');

// Hoặc từ Tailscale domain
const ws = new WebSocket('wss://aliconcon.tail61bbbd.ts.net:8001/chat');
```

### Tắt WSS (sử dụng WS thường)

```bash
export USE_WSS='false'
```

## 📊 Redis Memory System

### Tính năng Memory

-   **Conversation History**: Lưu trữ lịch sử chat theo socket ID
-   **Context Awareness**: Ghi nhớ ngữ cảnh người dùng (trang hiện tại, giỏ hàng, etc.)
-   **Session Management**: Quản lý sessions với TTL (24 giờ)
-   **Cross-Session**: Dữ liệu được lưu trữ persistent qua Redis

### Memory Commands

```bash
# Xem thống kê session
stats

# Trong console sẽ hiển thị:
📊 Session Stats: { messageCount: 5, createdAt: ..., hasContext: true }
🔗 Active Sessions: 3
🔒 WSS Status: Enabled
📊 Redis Status: Connected
```

### Redis Keys Structure

```
mcp:conversation:{socketId}:messages  # Conversation messages
mcp:context:{socketId}                # User context data
mcp:stats:{socketId}                  # Session statistics
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

### Lỗi Redis Connection

```
❌ Redis Client Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Giải pháp**:

```bash
# Khởi động Redis
sudo systemctl start redis-server

# Hoặc với Docker
docker run -d -p 6379:6379 redis:alpine

# Kiểm tra Redis đang chạy
redis-cli ping
# Phải trả về: PONG
```

### Lỗi SSL Certificate

```
❌ Failed to setup HTTPS for WSS: ENOENT: no such file or directory
```

**Giải pháp**: Client sẽ tự động tạo certificates, hoặc tạo thủ công:

```bash
cd client-mcp
mkdir -p certificates
openssl req -x509 -newkey rsa:4096 -keyout certificates/key.pem -out certificates/cert.pem -days 365 -nodes -subj "/C=VN/ST=HCM/L=HoChiMinh/O=Aliconcon/CN=localhost"
```

### Lỗi 404 - No endpoints found that support tool use

```
❌ Error: 404 No endpoints found that support tool use
```

**Nguyên nhân**: Model hiện tại không hỗ trợ tool calling

**Giải pháp**: Hệ thống sẽ tự động chuyển sang chế độ fallback, hoặc bạn có thể thay đổi model:

```bash
export LLM_MODEL='qwen/qwen3-30b-a3b:free'  # Model miễn phí hỗ trợ tools
```

## 🛠️ Available Tools

-   `introduce`: Giới thiệu về nền tảng Aliconcon
-   `popular-products`: Lấy danh sách sản phẩm phổ biến
-   `payment-methods`: Thông tin về phương thức thanh toán

## 🔄 Chế độ Fallback

Khi model không hỗ trợ tool calling, hệ thống tự động chuyển sang chế độ fallback với:

-   Context-aware prompting với thông tin về Aliconcon
-   Static responses cho các câu hỏi phổ biến
-   Vẫn sử dụng Redis memory để ghi nhớ conversation
-   Vẫn cung cấp trải nghiệm người dùng tốt

## 📖 Tham khảo

-   [OpenRouter Documentation](https://openrouter.ai/docs)
-   [OpenRouter Models](https://openrouter.ai/models)
-   [OpenRouter Tool Calling Guide](https://openrouter.ai/docs/features/tool-calling)
-   [Redis Documentation](https://redis.io/docs/)
-   [WebSocket Secure (WSS)](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)

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

### Cấu hình Redis Custom

```bash
export REDIS_URL='redis://username:password@hostname:port/database'
```

### Cấu hình SSL Custom

```bash
# Sử dụng certificates có sẵn
export SSL_KEY_PATH='/path/to/your/key.pem'
export SSL_CERT_PATH='/path/to/your/cert.pem'
```

## 📁 Cấu trúc dự án

```
client-mcp/
├── index.ts                    # Main client application
├── lib/
│   └── memory-store.ts        # Redis memory management
├── certificates/              # SSL certificates (auto-generated)
│   ├── key.pem               # Private key
│   └── cert.pem              # Certificate
├── package.json              # Dependencies và scripts
├── tsconfig.json             # TypeScript configuration
├── README.md                 # Documentation
└── .gitignore                # Git ignore rules
```

## 🔗 Liên quan

-   [Aliconcon MCP Server](../server-mcp/README.md)
-   [Model Context Protocol](https://modelcontextprotocol.io/)
-   [Redis Memory Store](https://redis.io/)

---

**Aliconcon MCP Client** - Trải nghiệm AI shopping thông minh với WSS + Redis Memory! 🛍️🤖🔒
