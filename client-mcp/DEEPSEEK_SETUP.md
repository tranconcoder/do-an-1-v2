# DeepSeek R1 Setup Guide (Miễn Phí qua OpenRouter + MCP)

## Overview

This client has been updated to use **DeepSeek R1 MIỄN PHÍ** thông qua OpenRouter API, kết hợp với MCP (Model Context Protocol) để cung cấp tool calling capabilities, theo hướng dẫn từ [OpenRouter MCP documentation](https://openrouter.ai/docs/use-cases/mcp-servers).

## Architecture

```
User Query → OpenRouter (DeepSeek Free) → Tool Selection → MCP Server → Tool Execution → Final Response
```

-   **OpenRouter**: Cung cấp DeepSeek models miễn phí
-   **MCP Server**: Cung cấp Aliconcon tools (introduce, popular-products)
-   **Tool Calling**: Tự động chọn và gọi tools phù hợp

## Configuration

### Environment Variables

Set these environment variables before running the client:

```bash
# OpenRouter API Configuration (MIỄN PHÍ)
export OPENROUTER_API_KEY="your_openrouter_api_key_here"

# Model Configuration
export LLM_MODEL="deepseek/deepseek-chat:free"
export LLM_TEMPERATURE="0.7"

# MCP Server Configuration
export MCP_URL="http://localhost:8000"

# Thinking Traces Configuration
export DISABLE_THINKING="true"  # Set to "false" to show thinking traces
```

### Getting OpenRouter API Key (MIỄN PHÍ)

1. Visit [OpenRouter](https://openrouter.ai)
2. Sign up for a **FREE** account
3. Navigate to the API section in dashboard
4. Generate a new API key
5. Copy the API key and set it as `OPENROUTER_API_KEY`

**🎉 Lưu ý: OpenRouter cung cấp DeepSeek hoàn toàn MIỄN PHÍ!**

## Features

### Intelligent Tool Selection

-   Model tự động phân tích câu hỏi và chọn tools phù hợp
-   Sử dụng OpenAI-compatible tool calling format
-   Kết hợp kết quả từ nhiều tools

### Thinking Traces Control

-   **DISABLE_THINKING=true** (default): Only shows the final answer, hides reasoning traces
-   **DISABLE_THINKING=false**: Shows both thinking process and final answer

### Model Options (Tất cả MIỄN PHÍ)

-   `deepseek/deepseek-chat:free`: DeepSeek chat model (MIỄN PHÍ)
-   `deepseek/deepseek-r1:free`: DeepSeek R1 reasoning model (MIỄN PHÍ)
-   `deepseek/deepseek-coder:free`: DeepSeek coder model (MIỄN PHÍ)

## Usage

### 1. Start MCP Server

```bash
cd server-mcp
bun run server.ts
```

### 2. Start Client

```bash
# Set your OpenRouter API key
export OPENROUTER_API_KEY="sk-or-your-key-here"

# Run the client
cd client-mcp
bun run index.ts
```

### 3. Or use the automated script

```bash
# From project root
./run_aliconcon_mcp.sh
```

## Benefits of DeepSeek via OpenRouter + MCP

-   **Hoàn toàn MIỄN PHÍ**: Không cần trả phí như DeepSeek API trực tiếp
-   **Advanced Tool Calling**: Tự động chọn và gọi tools
-   **MCP Protocol**: Chuẩn protocol cho tool integration
-   **Easy Setup**: Chỉ cần đăng ký OpenRouter
-   **High Performance**: Competitive with GPT-4 and Claude on reasoning tasks
-   **No Rate Limits**: Sử dụng thoải mái

## Technical Implementation

### Tool Format Conversion

Client tự động convert MCP tool definitions sang OpenAI format:

```typescript
// MCP Tool → OpenAI Tool
{
  "type": "function",
  "function": {
    "name": tool.name,
    "description": tool.description,
    "parameters": tool.inputSchema
  }
}
```

### HTTP-based MCP Communication

Thay vì sử dụng MCP SDK phức tạp, client sử dụng HTTP calls:

-   `GET /health` - Health check
-   `GET /tools` - List available tools
-   `POST /tools/call` - Execute tool

## Troubleshooting

### API Key Issues

-   Ensure your OpenRouter API key is valid
-   Check that the key is properly exported as environment variable
-   Verify you're registered at https://openrouter.ai

### MCP Server Issues

-   Ensure MCP server is running on port 8000
-   Check server logs for errors
-   Verify tools are properly registered

### Connection Issues

-   Verify internet connection
-   Check if OpenRouter API is accessible from your network
-   Ensure MCP server is reachable

### Model Issues

-   Ensure you're using a valid free model name (e.g., `deepseek/deepseek-chat:free`)
-   Check OpenRouter documentation for latest free model names

## So sánh với các approach khác

| Feature           | OpenRouter + MCP (Current) | DeepSeek API Direct | Ollama Local       |
| ----------------- | -------------------------- | ------------------- | ------------------ |
| Cost              | **MIỄN PHÍ**               | $0.55/1M tokens     | Miễn phí           |
| Setup             | Trung bình                 | Phức tạp            | Đơn giản           |
| Tool Calling      | ✅ Automatic               | ✅ Manual           | ❌ Limited         |
| Performance       | Cao                        | Cao                 | Phụ thuộc hardware |
| Internet Required | ✅                         | ✅                  | ❌                 |
| Rate Limits       | Rộng rãi                   | Hạn chế             | Không              |
