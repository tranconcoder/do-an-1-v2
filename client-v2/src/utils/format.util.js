export const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
};

export const convertToVND = (usdAmount) => {
    // Giả sử tỷ giá 1 USD = 24,500 VND
    return Math.round(usdAmount * 24500);
};