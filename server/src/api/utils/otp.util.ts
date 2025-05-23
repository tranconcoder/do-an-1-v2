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
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Mã OTP khôi phục mật khẩu</title><style>body{margin:0;padding:0;font-family:Arial,sans-serif;background:linear-gradient(135deg,#0f2027,#203a43,#2c5364);color:#fff;text-align:center}.container{max-width:500px;margin:50px auto;background:rgba(0,0,0,.5);border-radius:12px;padding:30px;box-shadow:0 8px 16px rgba(0,0,0,.3)}.otp{font-size:2em;font-weight:700;margin:20px 0;background:#1e3c72;display:inline-block;padding:10px 20px;border-radius:8px}.footer{margin-top:30px;font-size:.9em;opacity:.8}.brand{font-size:1.5em;font-weight:700;margin-bottom:20px;color:#00c6ff}</style></head><body><div class="container"><div class="brand">Aliconcon</div><h2>Mã OTP khôi phục mật khẩu</h2><div class="otp">${otp}</div><p>Mã này có hiệu lực trong<strong> 5 phút</strong>.</p><div class="footer">Nếu bạn không yêu cầu khôi phục, vui lòng bỏ qua email này.</div></div></body></html>`;
};