# Cart Tools - MCP Server

Bộ công cụ MCP để quản lý giỏ hàng (cart) trong hệ thống Aliconcon.

## 🛒 Available Tools

### 1. `get-cart` - Lấy giỏ hàng

**Description**: Lấy thông tin giỏ hàng của người dùng hiện tại

**Input**:

```typescript
{
    accessToken: string; // Required - JWT token để xác thực
}
```

**Output**:

```json
{
    "success": true,
    "message": "Lấy giỏ hàng thành công",
    "data": [
        {
            "cart_shop": {
                "shop": {
                    "info": {
                        "_id": "shop_id",
                        "shop_name": "Tên cửa hàng",
                        "shop_avatar": "avatar_url"
                    }
                },
                "products": [
                    {
                        "_id": "item_id",
                        "sku": "sku_id",
                        "product_name": "Tên sản phẩm",
                        "product_thumb": "thumbnail_url",
                        "cart_quantity": 2,
                        "product_price": 199000,
                        "product_status": "active"
                    }
                ]
            }
        }
    ],
    "cartItemCount": 1
}
```

### 2. `add-to-cart` - Thêm sản phẩm vào giỏ hàng

**Description**: Thêm sản phẩm vào giỏ hàng của người dùng

**Input**:

```typescript
{
    accessToken: string,  // Required - JWT token để xác thực
    skuId: string,       // Required - ID của SKU sản phẩm
    quantity?: number    // Optional - Số lượng (default: 1)
}
```

**Output**:

```json
{
    "success": true,
    "message": "Đã thêm sản phẩm vào giỏ hàng thành công",
    "data": {
        // Updated cart data
    },
    "productInfo": {
        "skuId": "sku_id",
        "quantity": 1
    }
}
```

## 🔄 Integration Flow

### 1. Profile Initialization với Cart Info

Khi user kết nối WebSocket:

```
1. Client send init_profile với accessToken
2. Server call get-user-profile tool
3. Server call get-cart tool (nếu có token)
4. Server tạo welcome message với cart info
5. Client hiển thị thông tin cart trong welcome
```

### 2. Welcome Message với Cart

**User có sản phẩm trong cart**:

```
Chào buổi chiều Nguyễn Văn A!

Chào mừng bạn đến với Aliconcon!

🛒 **Giỏ hàng của bạn**: 3 sản phẩm
- iPhone 15 Pro Max: 1x
- ...và còn nhiều sản phẩm khác

💡 Hỏi tôi về "giỏ hàng" để xem chi tiết hoặc "thanh toán" để hoàn tất đơn hàng!
```

**User chưa có sản phẩm**:

```
🛒 **Giỏ hàng trống** - Tìm sản phẩm yêu thích và thêm vào giỏ hàng nhé!
```

## 🎯 AI Assistant Features

### Cart Management Commands

**Xem giỏ hàng**:

-   "Xem giỏ hàng"
-   "Cart của tôi có gì?"
-   "Kiểm tra đơn hàng"

**Thêm sản phẩm**:

-   "Thêm iPhone vào giỏ hàng"
-   "Add product SKU123 to cart"
-   "Mua sản phẩm này" (với context từ trang sản phẩm)

### Contextual Responses

AI có thể:

-   Tự động gọi `get-cart` khi user hỏi về giỏ hàng
-   Gọi `add-to-cart` khi user muốn mua sản phẩm
-   Đưa ra gợi ý dựa trên sản phẩm trong cart
-   Hướng dẫn checkout process

## 🛡️ Error Handling

### Common Errors

**Token không hợp lệ**:

```json
{
    "error": true,
    "message": "Access token is required to get cart",
    "data": null
}
```

**Sản phẩm không tồn tại**:

```json
{
    "error": true,
    "message": "Product not found!",
    "type": "NotFoundError"
}
```

**Hết stock**:

```json
{
    "error": true,
    "message": "Product is out of stock!",
    "type": "OutOfStockError"
}
```

## 🔧 API Endpoints Used

### Backend Endpoints

-   `GET /api/cart` - Lấy giỏ hàng
-   `POST /api/cart/add/:skuId/:quantity?` - Thêm vào giỏ hàng

### Authentication

Tất cả endpoints yêu cầu:

```
Authorization: Bearer <access_token>
```

## 📊 Cart Data Structure

### Cart Model (MongoDB)

```typescript
interface Cart {
    user: ObjectId; // User ID
    cart_shop: [
        {
            shop: ObjectId; // Shop ID
            products: [
                {
                    sku: ObjectId; // SKU ID
                    product_name: string; // Tên sản phẩm
                    product_thumb: string; // Thumbnail
                    cart_quantity: number; // Số lượng
                    product_price: number; // Giá
                    product_status: 'active' | 'inactive';
                }
            ];
        }
    ];
}
```

### Cart Response (Aggregated)

```typescript
interface CartResponse {
    _id: string;
    user: string;
    cart_shop: {
        shop: {
            info: ShopInfo; // Thông tin shop
        };
        products: CartItem[]; // Danh sách sản phẩm
    };
}
```

## 🚀 Usage Examples

### JavaScript/TypeScript

```typescript
// Get cart
const cartData = await mcpClient.callTool('get-cart', {
    accessToken: userToken
});

// Add to cart
const addResult = await mcpClient.callTool('add-to-cart', {
    accessToken: userToken,
    skuId: 'sku123',
    quantity: 2
});
```

### AI Chat Examples

```
User: "Giỏ hàng của tôi có gì?"
AI: [Calls get-cart tool and displays formatted cart items]

User: "Thêm iPhone 15 vào cart"
AI: [Searches for iPhone 15, gets SKU, calls add-to-cart]

User: "Xóa sản phẩm này khỏi giỏ hàng"
AI: [Guides user through cart management]
```

## 🔗 Related Tools

-   `get-user-profile` - Lấy thông tin user (để xác thực)
-   `get-popular-products` - Tìm sản phẩm phổ biến để add
-   `payment-methods` - Hướng dẫn thanh toán cart

---

**💡 Tips**:

-   Luôn check authentication trước khi gọi cart tools
-   Handle gracefully khi cart trống hoặc API errors
-   Sử dụng cart context để cá nhân hóa AI responses
