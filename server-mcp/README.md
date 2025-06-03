# Aliconcon MCP Server

A Model Context Protocol (MCP) server for the Aliconcon e-commerce platform, providing tools and resources for AI assistants to interact with the platform.

## 📁 Project Structure

```
server-mcp/
├── server.ts              # Main MCP server entry point
├── tools/                 # MCP Tools directory
│   ├── index.ts           # Tools export index
│   ├── introduce-aliconcon.ts    # Company introduction tool
│   └── get-popular-products.ts  # Popular products tool
├── resources/             # MCP Resources directory
│   ├── index.ts           # Resources export index
│   └── company-introduction.ts  # Company info resource
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript configuration
└── README.md              # This file
```

## 🚀 Installation

```bash
bun install
```

## 🏃‍♂️ Running the Server

```bash
bun run server.ts
```

## 🛠️ Available Tools

### 1. `introduce-aliconcon`

**Description**: Giới thiệu về nền tảng thương mại điện tử Aliconcon

**Parameters**:

-   `section` (optional): Phần thông tin muốn xem
    -   `"overview"` - Tổng quan về công ty
    -   `"customer"` - Dành cho khách hàng
    -   `"seller"` - Dành cho người bán
    -   `"features"` - Tính năng nổi bật
    -   `"all"` - Tất cả thông tin (mặc định)

**Example Usage**:

```javascript
// Get all information
introduce - aliconcon();

// Get specific section
introduce - aliconcon({ section: 'customer' });
```

### 2. `get-popular-products`

**Description**: Lấy danh sách sản phẩm phổ biến dựa trên số lượng đã bán

**Parameters**:

-   `page` (optional): Số trang (mặc định: 1)
-   `limit` (optional): Số sản phẩm trên mỗi trang (mặc định: 50, tối đa: 100)

**Example Usage**:

```javascript
// Get first page with default limit
get - popular - products();

// Get specific page and limit
get - popular - products({ page: 2, limit: 20 });
```

## 📚 Available Resources

### 1. `company://about`

**Name**: Giới thiệu về Aliconcon  
**Description**: Thông tin về công ty và các tính năng dành cho người dùng  
**MIME Type**: text/markdown

## 🔧 Configuration

The server connects to the API at `http://localhost:4000` by default. You can modify this in the tool files if needed.

## 📝 Adding New Tools

1. Create a new file in the `tools/` directory
2. Export a tool object with the following structure:

```typescript
export const myNewTool = {
    name: 'tool-name',
    description: 'Tool description',
    inputSchema: {
        // Zod schema for parameters
    },
    handler: async (params) => {
        // Tool implementation
        return {
            content: [
                {
                    type: 'text' as const,
                    text: 'Response text'
                }
            ]
        };
    }
};
```

3. Add the export to `tools/index.ts`
4. Register the tool in `server.ts`

## 📝 Adding New Resources

1. Create a new file in the `resources/` directory
2. Export a resource object with the following structure:

```typescript
export const myNewResource = {
    uri: 'scheme://path',
    name: 'Resource Name',
    description: 'Resource description',
    mimeType: 'text/markdown',
    handler: async () => {
        return {
            contents: [
                {
                    uri: 'scheme://path',
                    text: 'Resource content',
                    mimeType: 'text/markdown'
                }
            ]
        };
    }
};
```

3. Add the export to `resources/index.ts`
4. Register the resource in `server.ts`

## 🔗 API Integration

The tools make direct HTTP requests to the Aliconcon API endpoints:

-   Popular products: `GET /sku/popular`

Make sure the API server is running on the configured port before using the tools.

## 🛡️ Error Handling

All tools include comprehensive error handling with user-friendly error messages in Vietnamese, providing troubleshooting steps for common issues.

---

**Aliconcon MCP Server** - Connecting AI assistants with the Aliconcon e-commerce platform! 🛍️
