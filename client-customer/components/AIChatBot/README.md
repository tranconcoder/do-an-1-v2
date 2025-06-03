# AI ChatBot Component - Customer App

Bong bóng chat AI toàn cục cho ứng dụng client-customer (Next.js). Component này hiển thị một bubble chat floating ở góc phải màn hình và cung cấp giao diện chat với AI hỗ trợ mua sắm.

## Tính năng hiện tại

✅ **Giao diện hoàn chỉnh**

-   Bubble chat floating với hiệu ứng hover đẹp mắt
-   Cửa sổ chat responsive với animation mượt mà
-   Design hiện đại với gradient và shadow
-   Typing indicator khi AI đang "suy nghĩ"
-   Auto-scroll tin nhắn và auto-resize input
-   Timestamp cho mỗi tin nhắn
-   Avatar khác biệt cho user và AI
-   Tối ưu cho Next.js với 'use client' directive

✅ **Chức năng cơ bản**

-   Toggle mở/đóng chat window
-   Gửi tin nhắn bằng Enter hoặc nút Send
-   Simulation AI response với context mua sắm
-   Notification dot (cho tin nhắn mới)
-   Welcome message phù hợp với shopping experience

## Cấu trúc files

```
client-customer/components/AIChatBot/
├── index.js                    # Component chính
├── AIChatBot.module.css       # CSS Module styling
└── README.md                  # Documentation
```

## Tích hợp với Next.js App

### 1. Thêm vào Root Layout

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

### 2. Hoặc thêm vào component cụ thể

```javascript
import AIChatBot from '../../components/AIChatBot';

export default function HomePage() {
    return (
        <div>
            {/* Page content */}
            <AIChatBot />
        </div>
    );
}
```

## Tích hợp MCP (TODO)

### 1. Cài đặt MCP Client

```bash
cd client-customer
npm install @modelcontextprotocol/sdk
```

### 2. Tạo MCP Service

Tạo file `client-customer/lib/services/mcpService.js`:

```javascript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

class MCPService {
    constructor() {
        this.client = null;
        this.isConnected = false;
    }

    async connect() {
        // Kết nối với MCP server
        const transport = new StdioClientTransport({
            command: 'shopping-ai-server',
            args: []
        });

        this.client = new Client(
            {
                name: 'customer-shopping-assistant',
                version: '1.0.0'
            },
            {
                capabilities: {
                    tools: {
                        product_search: {},
                        shop_info: {},
                        order_tracking: {},
                        recommendations: {}
                    }
                }
            }
        );

        await this.client.connect(transport);
        this.isConnected = true;
    }

    async sendMessage(message, context = {}) {
        if (!this.isConnected || !this.client) {
            throw new Error('MCP client not connected');
        }

        // Gửi tin nhắn với shopping context
        const response = await this.client.request({
            method: 'tools/call',
            params: {
                name: 'shopping_chat',
                arguments: {
                    message,
                    context: {
                        userId: context.userId,
                        currentPage: context.currentPage,
                        cartItems: context.cartItems,
                        recentlyViewed: context.recentlyViewed
                    }
                }
            }
        });

        return response.content;
    }

    async searchProducts(query) {
        return await this.client.request({
            method: 'tools/call',
            params: {
                name: 'product_search',
                arguments: { query }
            }
        });
    }

    async getRecommendations(userId) {
        return await this.client.request({
            method: 'tools/call',
            params: {
                name: 'recommendations',
                arguments: { userId }
            }
        });
    }
}

export default new MCPService();
```

### 3. Cập nhật AIChatBot Component

Thay thế phần AI response trong `components/AIChatBot/index.js`:

```javascript
import mcpService from '../../lib/services/mcpService';
import { useAuth } from '../../hooks/useAuth'; // Giả sử có auth hook

// Trong component:
const { user } = useAuth();

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

    try {
        // Lấy context từ user và page hiện tại
        const context = {
            userId: user?.id,
            currentPage: window.location.pathname,
            cartItems: [], // Get from cart state
            recentlyViewed: [] // Get from localStorage or state
        };

        // Gọi MCP service với context
        const aiResponseContent = await mcpService.sendMessage(userMessage.content, context);

        const aiResponse = {
            id: Date.now() + 1,
            content: aiResponseContent,
            sender: 'ai',
            timestamp: new Date()
        };

        setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
        console.error('MCP Error:', error);

        const errorResponse = {
            id: Date.now() + 1,
            content: 'Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau.',
            sender: 'ai',
            timestamp: new Date()
        };

        setMessages((prev) => [...prev, errorResponse]);
    } finally {
        setIsTyping(false);
    }
};
```

### 4. Khởi tạo MCP trong Root Layout

```javascript
'use client';

import { useEffect } from 'react';
import mcpService from '../lib/services/mcpService';

export default function RootLayout({ children }) {
    useEffect(() => {
        // Khởi tạo MCP connection
        const initializeMCP = async () => {
            try {
                await mcpService.connect();
                console.log('Shopping AI service connected successfully');
            } catch (error) {
                console.error('Failed to connect MCP service:', error);
            }
        };

        initializeMCP();
    }, []);

    // ... rest of layout
}
```

## Tích hợp với Redux Store

```javascript
import { useSelector } from 'react-redux';

// Trong AIChatBot component:
const cartItems = useSelector((state) => state.cart.items);
const user = useSelector((state) => state.auth.user);
const recentlyViewed = useSelector((state) => state.products.recentlyViewed);

// Sử dụng trong context cho MCP
const context = {
    userId: user?.id,
    cartItems,
    recentlyViewed,
    currentPage: window.location.pathname
};
```

## Customization

### Thay đổi theme cho shopping

```css
/* AIChatBot.module.css */
.chatBubble {
    background: linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%); /* Shopping colors */
}

.welcomeMessage h3::after {
    content: ' 🛍️';
}
```

### Thêm shopping features

-   **Product recommendations**: Hiển thị sản phẩm gợi ý trong chat
-   **Cart integration**: Thêm sản phẩm vào giỏ hàng từ chat
-   **Order tracking**: Tra cứu trạng thái đơn hàng
-   **Price alerts**: Thiết lập thông báo giá
-   **Wishlist management**: Quản lý danh sách yêu thích

## Next.js Specific Features

### Server-side Integration

```javascript
// pages/api/ai-chat.js (nếu dùng Pages Router)
export default async function handler(req, res) {
    // Proxy requests to MCP server
    const response = await mcpService.sendMessage(req.body.message);
    res.json({ response });
}
```

### Image Optimization

```javascript
import Image from 'next/image';

// Trong message bubble hiển thị product images
<Image
    src={product.imageUrl}
    alt={product.name}
    width={200}
    height={150}
    className={styles.productImage}
/>;
```

## Responsive Design

-   ✅ Desktop (380px width)
-   ✅ Mobile (full width với margin)
-   ✅ Tablet (responsive)
-   ✅ Next.js SSR compatible

## Performance Optimizations

-   Lazy loading với Next.js dynamic imports
-   CSS Modules cho styling isolation
-   Debounced typing indicators
-   Memory efficient với proper cleanup
-   Image optimization với Next.js Image component

## Browser Support

-   ✅ Chrome 70+
-   ✅ Firefox 65+
-   ✅ Safari 12+
-   ✅ Edge 79+

---

**Lưu ý**: Component hiện tại sử dụng simulation responses với context mua sắm. Cần tích hợp MCP để có AI shopping assistant thực tế.
