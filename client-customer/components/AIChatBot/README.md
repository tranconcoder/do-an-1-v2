# AI ChatBot Component - Customer App

Bong bóng chat AI toàn cục cho ứng dụng client-customer (Next.js) với **WebSocket real-time** và **markdown rendering**. Component này kết nối trực tiếp với MCP server qua WebSocket để cung cấp trải nghiệm chat AI thông minh.

## 🚀 Tính năng mới

✅ **WebSocket Real-time Communication**

-   Kết nối WebSocket tự động với MCP server
-   Auto-reconnect khi mất kết nối
-   Typing indicators thời gian thực
-   Connection status hiển thị trực quan

✅ **Markdown Rendering**

-   AI responses được render dưới dạng markdown
-   Hỗ trợ headers, bold, italic, lists, links, code blocks
-   Styling đẹp mắt cho nội dung phong phú

✅ **Context-Aware AI**

-   Gửi context từ trang hiện tại (URL, user agent, etc.)
-   Tích hợp với shopping cart và recently viewed (TODO)
-   AI hiểu được ngữ cảnh mua sắm

✅ **Error Handling & Fallbacks**

-   Graceful error handling khi WebSocket fails
-   Visual error messages với styling riêng
-   Fallback responses khi không kết nối được

## 🔧 Cài đặt và Tích hợp

### 1. Khởi động MCP System

```bash
# Từ root directory
./run_aliconcon_mcp.sh
```

Hệ thống sẽ khởi động:

-   **MCP Server**: `http://localhost:8000`
-   **WebSocket Server**: `ws://localhost:8001/chat` (HTTP)
-   **Secure WebSocket**: `wss://localhost:8001/chat` (HTTPS)
-   **Console Chat**: Terminal interface

### 1.1. Enable WSS (Secure WebSocket)

Để sử dụng WSS thay vì WS:

```bash
# Set environment variable for HTTPS
export USE_HTTPS=true

# Run the system
./run_aliconcon_mcp.sh
```

**SSL Certificates**:

-   Hệ thống tự động tạo self-signed certificates cho development
-   Đặt certificates tùy chỉnh trong `./certificates/` directory:
    -   `./certificates/key.pem` (private key)
    -   `./certificates/cert.pem` (certificate)

**Production Setup**:

```bash
# Use real SSL certificates for production
mkdir -p certificates
cp your-ssl-key.pem certificates/key.pem
cp your-ssl-cert.pem certificates/cert.pem
export USE_HTTPS=true
```

### 2. Cấu hình Environment Variables

Tạo file `.env.local` trong `client-customer`:

```env
# WebSocket URL for AI ChatBot (Secure - Recommended)
NEXT_PUBLIC_WS_URL=wss://localhost:8001/chat

# Or for development (Non-secure)
# NEXT_PUBLIC_WS_URL=ws://localhost:8001/chat

# Optional: Custom configuration
NEXT_PUBLIC_AI_ASSISTANT_NAME="Aliconcon AI Assistant"
```

**🔒 Security Note**:

-   Use `wss://` (WebSocket Secure) for production
-   Use `ws://` only for local development
-   Set `USE_HTTPS=true` on server to enable WSS

### 3. Thêm Component vào Next.js App

#### Option A: Global (Recommended)

Chỉnh sửa `client-customer/app/layout.js`:

```javascript
import AIChatBot from '../components/AIChatBot';

export default function RootLayout({ children }) {
    return (
        <html lang="vi">
            <body>
                {children}
                {/* AI ChatBot - Global floating chat bubble */}
                <AIChatBot />
            </body>
        </html>
    );
}
```

#### Option B: Specific Pages

```javascript
import AIChatBot from '../../components/AIChatBot';

export default function ProductPage() {
    return (
        <div>
            {/* Page content */}
            <AIChatBot />
        </div>
    );
}
```

## 📡 WebSocket Protocol

### Message Types

#### Client → Server

```javascript
// Chat message
{
    type: 'chat',
    content: 'Tôi muốn tìm iPhone 15',
    context: {
        currentPage: '/products',
        userAgent: '...',
        cartItems: [],
        recentlyViewed: []
    }
}

// Ping
{
    type: 'ping'
}
```

#### Server → Client

```javascript
// Welcome message
{
    type: 'welcome',
    message: 'Chào mừng đến với Aliconcon AI Assistant!',
    timestamp: '2025-01-15T10:30:00.000Z',
    clientId: '1642248600000'
}

// AI response
{
    type: 'message',
    content: '# Sản phẩm iPhone 15\n\n**Giá**: 29.990.000đ...',
    sender: 'ai',
    timestamp: '2025-01-15T10:30:05.000Z',
    markdown: true
}

// Typing indicator
{
    type: 'typing',
    isTyping: true,
    timestamp: '2025-01-15T10:30:02.000Z'
}

// Error
{
    type: 'error',
    message: 'Message content is required',
    timestamp: '2025-01-15T10:30:00.000Z'
}
```

## 🎨 Markdown Support

AI có thể trả lời với markdown formatting:

```markdown
# Sản phẩm iPhone 15 Pro Max

**Giá**: _29.990.000đ_

## Đặc điểm nổi bật:

-   Camera 48MP Pro
-   Chip A17 Pro
-   Titanium design

> **Khuyến mãi**: Trả góp 0% trong 12 tháng

[Xem chi tiết](https://aliconcon.com/iphone-15)
```

Sẽ được render thành HTML với styling đẹp mắt.

## 🔄 Connection Management

### Auto-Reconnect

Component tự động reconnect khi:

-   WebSocket connection bị đứt
-   Server restart
-   Network issues

### Connection States

-   **Đang kết nối...**: Initial connection
-   **Đã kết nối**: Connected and ready
-   **Mất kết nối**: Disconnected, attempting reconnect
-   **Lỗi kết nối**: Connection error
-   **Đã ngắt kết nối**: Manually disconnected

## 🛍️ Shopping Context Integration

### Current Implementation

```javascript
const context = {
    currentPage: window.location.pathname,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    cartItems: [], // TODO: Get from Redux/Context
    recentlyViewed: [] // TODO: Get from localStorage
};
```

### TODO: Full Integration

```javascript
// With Redux
import { useSelector } from 'react-redux';

const cartItems = useSelector((state) => state.cart.items);
const user = useSelector((state) => state.auth.user);
const recentlyViewed = useSelector((state) => state.products.recentlyViewed);

const context = {
    userId: user?.id,
    currentPage: window.location.pathname,
    cartItems,
    recentlyViewed,
    searchHistory: [], // From search state
    wishlist: [], // From wishlist state
    orderHistory: [] // From order state
};
```

## 🎯 AI Capabilities

### Current Tools Available

1. **introduce**: Company information about Aliconcon
2. **popular-products**: Get popular/trending products

### AI Features

-   **Tool Calling**: AI can call MCP tools for real data
-   **Fallback Mode**: Context-aware responses when tools fail
-   **Markdown Responses**: Rich formatting for better UX
-   **Shopping Context**: Understands e-commerce context

### Example Interactions

**User**: "Giới thiệu về Aliconcon" **AI**: Returns formatted company information with markdown

**User**: "Sản phẩm nào đang bán chạy?" **AI**: Calls `popular-products` tool and formats results

**User**: "Tôi muốn mua iPhone" **AI**: Provides product recommendations with pricing and links

## 🔧 Customization

### Styling

```css
/* Custom error message styling */
.messageBubble.errorMessage {
    background: #your-error-color;
    border-left: 3px solid #your-border-color;
}

/* Custom markdown styling */
.messageBubble h1 {
    color: #your-brand-color;
}
```

### Configuration

```javascript
// Custom WebSocket URL
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://your-server:port/chat';

// Custom reconnect interval
const RECONNECT_INTERVAL = 5000; // 5 seconds
```

## 📱 Responsive Design

-   ✅ Desktop: 380px width floating window
-   ✅ Mobile: Full width with margins
-   ✅ Tablet: Responsive sizing
-   ✅ Touch-friendly controls

## 🚀 Performance

-   **Lazy Loading**: Component only loads when needed
-   **Memory Efficient**: Proper cleanup on unmount
-   **Optimized Rendering**: Efficient markdown parsing
-   **Connection Pooling**: Single WebSocket per session

## 🔒 Security

-   **Input Sanitization**: Safe markdown rendering
-   **XSS Protection**: `dangerouslySetInnerHTML` with safe content
-   **CORS Handling**: Proper WebSocket CORS configuration
-   **Error Boundaries**: Graceful error handling

## 🐛 Troubleshooting

### WebSocket Connection Issues

1. **Check MCP server**: `curl http://localhost:8000/health`
2. **Check WebSocket**: Browser dev tools → Network → WS
3. **Firewall**: Ensure ports 8000, 8001 are open
4. **Environment**: Verify `NEXT_PUBLIC_WS_URL`

### Markdown Not Rendering

1. **Check message.markdown flag**: Should be `true`
2. **Inspect HTML**: Check if markdown is converted
3. **CSS Issues**: Verify markdown styles are loaded

### AI Not Responding

1. **Check OpenRouter API key**: `echo $OPENROUTER_API_KEY`
2. **Check MCP tools**: Visit `http://localhost:8000/tools`
3. **Check logs**: MCP client console output

---

**🎉 Ready to use!** The AI ChatBot now provides real-time, intelligent shopping assistance with beautiful markdown responses and robust WebSocket connectivity.
