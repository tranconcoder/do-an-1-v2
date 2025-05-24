export const generateOTP = () => {
    const OTP = [];
    const charList = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * charList.length);
        OTP.push(charList[randomIndex]);
    }

    return OTP.join('');
};

export const generateOTPHTML = (otp: string) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mã OTP Đặt Lại Mật Khẩu - Aliconcon</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                line-height: 1.6;
                color: #374151; /* Equivalent to text-gray-700 */
                margin: 0;
                padding: 0;
                background-color: #eff6ff; /* Equivalent to from-blue-50 (lightest blue) */
            }
            .container {
                max-width: 560px; /* Slightly smaller for email clients */
                margin: 20px auto;
                padding: 20px;
            }
            .email-wrapper {
                background-color: rgba(255, 255, 255, 0.8); /* bg-white/80 for a slight see-through effect if supported */
                border-radius: 16px; /* rounded-2xl */
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); /* shadow-sm */
                padding: 32px; /* p-8 */
                border: 1px solid #dbeafe; /* border-blue-100 */
            }
            .logo {
                text-align: center;
                margin-bottom: 24px; /* mb-6 */
            }
            .logo-text {
                font-size: 28px; /* text-2xl */
                font-weight: bold;
                /* Attempting gradient text, fallback to solid blue */
                background: linear-gradient(to right, #2563eb, #60a5fa); /* from-blue-600 to-blue-400 */
                -webkit-background-clip: text;
                -moz-background-clip: text;
                background-clip: text;
                color: #2563eb; /* Fallback color */
                -webkit-text-fill-color: transparent;
                -moz-text-fill-color: transparent;
                display: inline-block; /* For gradient to work */
            }
            .header {
                text-align: center;
                margin-bottom: 24px;
            }
            .header h2 {
                font-size: 22px; /* Slightly smaller for email */
                font-weight: bold;
                color: #1e3a8a; /* Darker blue for heading */
                margin: 0;
            }
            .otp-box {
                background-color: #e0f2fe; /* Lighter blue, similar to blue-50/100 */
                border-radius: 8px; /* rounded-lg */
                padding: 20px;
                text-align: center;
                margin: 24px 0;
            }
            .otp-code {
                font-size: 30px;
                font-weight: bold;
                letter-spacing: 3px;
                color: #1d4ed8; /* Blue-700 */
            }
            .instructions p {
                margin: 0 0 10px 0;
                color: #4b5563; /* text-gray-600 */
            }
            .expire-notice {
                font-size: 14px;
                color: #dc2626; /* red-600 */
                text-align: center;
                margin-top: 16px;
            }
            .button-container {
                 text-align: center;
                 margin-top: 24px;
            }
            .button {
                display: inline-block;
                padding: 12px 24px;
                font-size: 16px;
                font-weight: 500;
                color: #ffffff;
                background: linear-gradient(to right, #2563eb, #3b82f6); /* from-blue-600 to-blue-500 */
                border-radius: 8px;
                text-decoration: none;
                border: none;
            }
            .footer {
                margin-top: 32px;
                text-align: center;
                font-size: 12px;
                color: #6b7280; /* text-gray-500 */
            }
            .footer p {
                margin: 5px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="email-wrapper">
                <div class="logo">
                    <span class="logo-text">Aliconcon</span>
                </div>
                
                <div class="header">
                    <h2>Xác Minh Đặt Lại Mật Khẩu</h2>
                </div>
                
                <div class="instructions">
                    <p>Xin chào,</p>
                    <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản Aliconcon của bạn. Vui lòng sử dụng mã xác minh dưới đây để tiếp tục.</p>
                </div>
                
                <div class="otp-box">
                    <div class="otp-code">${otp}</div>
                </div>
                
                <div class="expire-notice">
                    <p>Mã này có hiệu lực trong 5 phút.</p>
                </div>
                
                <div class="instructions">
                    <p>Nếu bạn không yêu cầu thay đổi này, vui lòng bỏ qua email này. Mật khẩu của bạn sẽ không thay đổi.</p>
                    <p>Cảm ơn bạn,<br>Đội ngũ Aliconcon</p>
                </div>
                
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} Aliconcon. Bảo lưu mọi quyền.</p>
                    <p>Đây là email tự động. Vui lòng không trả lời.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `
};