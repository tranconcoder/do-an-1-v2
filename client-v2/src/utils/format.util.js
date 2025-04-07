export const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
};

const UNITS = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];
const DIGITS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

function readGroup(group) {
    let result = '';
    let hundreds = Math.floor(group / 100);
    let tens = Math.floor((group % 100) / 10);
    let ones = group % 10;

    if (hundreds > 0) {
        result += DIGITS[hundreds] + ' trăm ';
    }

    if (tens > 0) {
        if (tens === 1) {
            result += 'mười ';
        } else {
            result += DIGITS[tens] + ' mươi ';
        }
    }

    if (ones > 0) {
        if (tens === 0 && hundreds > 0) {
            result += 'lẻ ';
        }
        if (ones === 1 && tens > 1) {
            result += 'mốt ';
        } else if (ones === 5 && tens > 0) {
            result += 'lăm ';
        } else {
            result += DIGITS[ones] + ' ';
        }
    }

    return result;
}

export const numberToVietnameseWords = (number) => {
    if (number === 0) return 'không đồng';
    if (!Number.isInteger(number) || number < 0) return 'số không hợp lệ';

    let result = '';
    let groupIndex = 0;

    do {
        let group = number % 1000;
        if (group > 0) {
            result = readGroup(group) + UNITS[groupIndex] + ' ' + result;
        }
        number = Math.floor(number / 1000);
        groupIndex++;
    } while (number > 0);

    return result.trim() + ' đồng';
};

export const convertToVND = (usdAmount) => {
    // Giả sử tỷ giá 1 USD = 24,500 VND
    return Math.round(usdAmount * 24500);
};