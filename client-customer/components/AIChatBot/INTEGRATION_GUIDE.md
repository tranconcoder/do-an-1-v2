# AIChatBot Integration Guide - Auto Profile Initialization

Hướng dẫn tích hợp AIChatBot với tính năng tự động khởi tạo profile người dùng và lời chào cá nhân hóa.

## 🚀 Tính năng mới - Auto Profile Init

✅ **Tự động gửi Access Token**

-   Tự động tìm access token từ localStorage, Redux store, hoặc cookies
-   Gửi token khi WebSocket connect để xác thực người dùng

✅ **Profile Initialization**

-   Gửi `init_profile` message ngay khi kết nối thành công
-   Nhận thông tin profile từ server qua API `/user/profile`
-   Lưu profile vào Redis memory store

✅ **Personalized Welcome Message**

-   AI tạo lời chào cá nhân hóa dựa trên thông tin profile
-   Hiển thị tên người dùng, vai trò, thời gian trong ngày
-   Context-aware (trang hiện tại, thông tin shopping)

## 🔧 Cách hoạt động

### 1. WebSocket Connection Flow

```
1. User mở chat → WebSocket connects
2. Auto tìm access token → localStorage/Redux/cookies
3. Gửi init_profile message → {accessToken, context}
4. Server call API /user/profile → Lấy thông tin user
5. Server tạo welcome message → Cá nhân hóa theo profile
6. Client nhận profile + welcome → Hiển thị lời chào
```

### 2. Message Protocol

#### Client → Server (Auto gửi khi connect)

```javascript
{
    type: 'init_profile',
    accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', // hoặc null
    context: {
        currentPage: '/products/iphone-15',
        currentUrl: 'https://aliconcon.com/products/iphone-15',
        userAgent: 'Mozilla/5.0...',
        timestamp: '2025-01-15T10:30:00.000Z',
        language: 'vi-VN',
        searchQuery: 'iPhone 15'
    }
}
```

#### Server → Client Response

```javascript
// Thành công
{
    type: 'profile_initialized',
    profile: {
        _id: "user123",
        user_fullName: "Nguyễn Văn A",
        user_email: "nguyenvana@email.com",
        phoneNumber: "0901234567",
        user_role: "USER",
        role_name: "USER",
        isGuest: false,
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    welcomeMessage: "Chào buổi chiều Nguyễn Văn A!\n\nChào mừng bạn đến với Aliconcon!...",
    timestamp: '2025-01-15T10:30:01.000Z'
}

// Lỗi hoặc guest user
{
    type: 'profile_initialized',
    profile: {
        _id: "guest",
        user_fullName: "Khách",
        user_email: null,
        isGuest: true
    },
    welcomeMessage: "Chào buổi chiều! Xin chào bạn\n\nBạn đang truy cập với tư cách khách...",
    timestamp: '2025-01-15T10:30:01.000Z'
}
```

## 🔑 Access Token Detection

Component tự động tìm access token theo thứ tự ưu tiên:

### 1. localStorage (Ưu tiên cao nhất)

```javascript
localStorage.getItem('accessToken'); // Chuẩn
localStorage.getItem('authToken'); // Phổ biến
localStorage.getItem('jwt_token'); // Alternative
```

### 2. Redux Store (Nếu có)

```javascript
window.__REDUX_STORE__.getState().auth.token;
window.__REDUX_STORE__.getState().user.accessToken;
window.__REDUX_STORE__.getState().auth.accessToken;
```

### 3. Cookies (Fallback)

```javascript
document.cookie → accessToken=xyz
document.cookie → authToken=xyz
```

### 4. No Token = Guest User

Nếu không tìm thấy token, user được coi là guest và nhận thông tin profile mặc định.

## 🎯 Cá nhân hóa Welcome Message

### Logged-in User

```
Chào buổi chiều Nguyễn Văn A!

Chào mừng bạn đến với Aliconcon!

Tôi là AI Assistant của Aliconcon, sẵn sàng hỗ trợ bạn:

🔍 Tìm kiếm và khám phá sản phẩm
💰 So sánh giá từ nhiều cửa hàng
⭐ Xem đánh giá sản phẩm
🛒 Tư vấn mua sắm thông minh
💳 Hướng dẫn thanh toán
📞 Hỗ trợ khách hàng 24/7

Hãy hỏi tôi bất cứ điều gì về sản phẩm, dịch vụ, hoặc cách sử dụng website! 😊

📍 Bạn đang ở trang: /products/iphone-15
```

### Guest User

```
Chào buổi chiều! Xin chào bạn

Bạn đang truy cập với tư cách khách. Hãy đăng nhập để có trải nghiệm tốt hơn!

Tôi là AI Assistant của Aliconcon, sẵn sàng hỗ trợ bạn:
[... same features list ...]

📍 Bạn đang ở trang: /products/iphone-15
```

### Admin/Shop Owner

```
Chào buổi chiều Admin Name!

Bạn đang đăng nhập với quyền Quản trị viên.

[... features list with admin-specific tools ...]
```

## 🔧 Configuration trong Project

### 1. Environment Variables

```env
# .env.local trong client-customer
NEXT_PUBLIC_WS_URL=wss://localhost:8001/chat

# .env trong server-mcp
API_BASE_URL=http://localhost:4000/api
REDIS_URL=redis://localhost:6379
```

### 2. Integration với Redux (Optional)

Để integrate tốt hơn với Redux store:

```javascript
// store/authSlice.js
export const selectAccessToken = (state) => state.auth.token;
export const selectUserProfile = (state) => state.auth.user;

// components/AIChatBot/index.js
import { useSelector } from 'react-redux';
import { selectAccessToken } from '../../store/authSlice';

function AIChatBot() {
    const reduxToken = useSelector(selectAccessToken);

    const getAccessToken = () => {
        // Prioritize Redux token
        if (reduxToken) {
            console.log('🔐 Found access token in Redux');
            return reduxToken;
        }

        // Fallback to localStorage/cookies...
        // ... existing code
    };
}
```

### 3. Integration với localStorage Pattern

```javascript
// utils/auth.js
export const setAuthToken = (token) => {
    localStorage.setItem('accessToken', token);
    // AIChatBot sẽ tự động detect token mới
};

export const clearAuthToken = () => {
    localStorage.removeItem('accessToken');
    // User sẽ tự động được coi là guest
};

// Trong login component
import { setAuthToken } from '../utils/auth';

const handleLogin = async (credentials) => {
    const response = await api.login(credentials);
    setAuthToken(response.accessToken);
    // AIChatBot sẽ auto refresh profile nếu đã mở
};
```

## 🔄 Real-time Profile Updates

### Khi user login/logout

Component tự động detect thay đổi access token và update profile:

```javascript
// Khi user login
localStorage.setItem('accessToken', newToken);
// → Component auto detect và re-init profile

// Khi user logout
localStorage.removeItem('accessToken');
// → Component chuyển về guest mode
```

### Manual Profile Refresh

```javascript
// Có thể thêm function để manually refresh profile
const refreshProfile = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        initializeProfile();
    }
};
```

## 🎨 UI States

### Connection States

-   **Đang kết nối...**: Initial WebSocket connection
-   **Đã kết nối**: Connected, đang init profile
-   **🔄 Đang khởi tạo profile...**: Profile initialization in progress
-   **Ready**: Sẵn sàng chat với profile đã load

### Visual Indicators

-   Header hiển thị tên user: `AI Assistant - Nguyễn Văn A`
-   Input placeholder: `Hỏi về sản phẩm hoặc cần hỗ trợ...`
-   Input disabled until profile initialized
-   Welcome message với tên cá nhân hóa

## 🐛 Error Handling

### Profile Init Errors

```javascript
{
    type: 'profile_error',
    message: 'Token expired hoặc Invalid token',
    timestamp: '...'
}
```

Component sẽ fallback về guest mode và hiển thị lỗi.

### Token Expiry

Nếu token hết hạn, server trả về guest profile. Component vẫn hoạt động bình thường với quyền guest.

### Network Issues

Auto reconnect sẽ re-init profile khi connection phục hồi.

## 🚀 Production Deployment

### 1. Khởi động servers

```bash
# Backend API
cd server && npm start

# MCP System
./run_aliconcon_mcp_secure.sh

# Client
cd client-customer && npm run build && npm start
```

### 2. SSL Certificates

```bash
# Production certificates
mkdir -p client-mcp/certificates
cp your-ssl.key client-mcp/certificates/server.key
cp your-ssl.crt client-mcp/certificates/server.crt
```

### 3. Environment Variables

```env
# Production .env
NEXT_PUBLIC_WS_URL=wss://your-domain.com/chat
API_BASE_URL=https://api.your-domain.com
USE_HTTPS=true
```

---

**🎉 Ready!** AIChatBot giờ đây tự động khởi tạo profile và cung cấp trải nghiệm chat cá nhân hóa cho từng người dùng!
