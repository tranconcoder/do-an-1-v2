# Aliconcon MCP Client

Ứng dụng client để kết nối với Aliconcon MCP Server sử dụng Llama 3.2 thông qua Ollama.

## 🚀 Cài đặt

### 1. Cài đặt dependencies

```bash
bun install
```

### 2. Cài đặt Ollama

```bash
# Trên macOS
brew install ollama

# Trên Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Trên Windows
# Tải từ https://ollama.ai/download
```

### 3. Tải model Llama 3.2

```bash
ollama pull llama3.2:1b
# hoặc cho model lớn hơn:
# ollama pull llama3.2:3b
```

### 4. Khởi động Ollama server

```bash
ollama serve
```

## 🏃‍♂️ Chạy ứng dụng

### Bước 1: Khởi động MCP Server

```bash
cd ../server-mcp
bun run server.ts
```

### Bước 2: Khởi động Client

```bash
# Terminal mới
cd client-mcp
bun start
```

## 🔧 Cấu hình

Bạn có thể tùy chỉnh cấu hình thông qua biến môi trường:

```bash
# URL của MCP server
export MCP_URL="http://localhost:8000/sse"

# URL của Ollama
export OLLAMA_URL="http://localhost:11434"

# Model Llama sử dụng
export LLM_MODEL="llama3.2:1b"

# Nhiệt độ cho model (0.0 - 1.0)
export LLM_TEMPERATURE="0.7"
```

## 💬 Sử dụng

Sau khi khởi động, bạn có thể hỏi các câu hỏi như:

-   **Giới thiệu về Aliconcon**: "Giới thiệu về nền tảng Aliconcon"
-   **Sản phẩm phổ biến**: "Cho tôi xem sản phẩm bán chạy nhất"
-   **Thông tin dịch vụ**: "Aliconcon có những tính năng gì?"
-   **Hỗ trợ khách hàng**: "Làm sao để mua hàng trên Aliconcon?"

## 🛠️ Tính năng

-   ✅ Kết nối với Aliconcon MCP Server
-   ✅ Sử dụng Llama 3.2 thông qua Ollama
-   ✅ Hỗ trợ tiếng Việt
-   ✅ Tích hợp công cụ MCP:
    -   `introduce`: Giới thiệu về Aliconcon
    -   `popular-products`: Sản phẩm phổ biến
-   ✅ Giao diện console thân thiện
-   ✅ Logging chi tiết
-   ✅ Xử lý lỗi robust

## 🔍 Troubleshooting

### Lỗi kết nối Ollama

```bash
# Kiểm tra Ollama đang chạy
curl http://localhost:11434/api/tags

# Khởi động lại Ollama
ollama serve
```

### Lỗi kết nối MCP Server

```bash
# Kiểm tra MCP server
curl http://localhost:8000

# Khởi động lại MCP server
cd ../server-mcp && bun run server.ts
```

### Model không tồn tại

```bash
# Liệt kê models có sẵn
ollama list

# Tải model cần thiết
ollama pull llama3.2:1b
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
