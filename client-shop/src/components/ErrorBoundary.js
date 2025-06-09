import React from 'react';
import { Result, Button } from 'antd';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log the error
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // Check if it's a WebSocket-related error
        const isWebSocketError =
            error.message &&
            (error.message.includes('#state') ||
                error.message.includes('WebSocket') ||
                error.message.includes('ws:') ||
                error.message.includes('Socket.IO'));

        // Check if it's a keyboard/shortcuts error
        const isKeyboardError =
            error.message &&
            (error.message.includes('toLocaleLowerCase') ||
                error.message.includes('shortcutsHandle') ||
                error.message.includes('onKeyDown') ||
                error.message.includes('keyboard'));

        if (isWebSocketError || isKeyboardError) {
            console.warn(
                `${
                    isWebSocketError ? 'WebSocket' : 'Keyboard'
                } error caught by ErrorBoundary - preventing React crash`
            );
            // For WebSocket/keyboard errors, try to recover gracefully
            setTimeout(() => {
                this.setState({ hasError: false, error: null, errorInfo: null });
            }, 3000);
        }

        this.setState({
            error: error,
            errorInfo: errorInfo
        });
    }

    handleReload = () => {
        window.location.reload();
    };

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            const isWebSocketError =
                this.state.error?.message &&
                (this.state.error.message.includes('#state') ||
                    this.state.error.message.includes('WebSocket') ||
                    this.state.error.message.includes('ws:') ||
                    this.state.error.message.includes('Socket.IO'));

            const isKeyboardError =
                this.state.error?.message &&
                (this.state.error.message.includes('toLocaleLowerCase') ||
                    this.state.error.message.includes('shortcutsHandle') ||
                    this.state.error.message.includes('onKeyDown') ||
                    this.state.error.message.includes('keyboard'));

            if (isWebSocketError) {
                // For WebSocket errors, show a less intrusive message
                return (
                    <div
                        style={{
                            padding: '20px',
                            backgroundColor: '#fff2e8',
                            border: '1px solid #ffbb96',
                            borderRadius: '6px',
                            margin: '20px'
                        }}
                    >
                        <h4 style={{ color: '#d46b08', marginBottom: '8px' }}>
                            🔄 Kết nối WebSocket đang được khôi phục
                        </h4>
                        <p style={{ color: '#ad6800', marginBottom: '12px' }}>
                            Đang sử dụng chế độ polling để đảm bảo kết nối ổn định...
                        </p>
                        <Button type="primary" size="small" onClick={this.handleReset}>
                            Tiếp tục
                        </Button>
                    </div>
                );
            }

            if (isKeyboardError) {
                // For keyboard errors, show a minimal message and auto-recover
                return (
                    <div
                        style={{
                            padding: '15px',
                            backgroundColor: '#f6ffed',
                            border: '1px solid #b7eb8f',
                            borderRadius: '6px',
                            margin: '20px'
                        }}
                    >
                        <h4 style={{ color: '#52c41a', marginBottom: '8px' }}>
                            ⌨️ Lỗi bàn phím đã được khôi phục
                        </h4>
                        <p style={{ color: '#389e0d', marginBottom: '12px' }}>
                            Đã khắc phục lỗi keyboard shortcut, ứng dụng sẽ tiếp tục hoạt động bình
                            thường...
                        </p>
                        <Button type="primary" size="small" onClick={this.handleReset}>
                            Tiếp tục
                        </Button>
                    </div>
                );
            }

            // For other errors, show full error page
            return (
                <Result
                    status="error"
                    title="Đã xảy ra lỗi"
                    subTitle="Ứng dụng gặp sự cố không mong muốn. Vui lòng thử lại."
                    extra={[
                        <Button type="primary" key="reload" onClick={this.handleReload}>
                            Tải lại trang
                        </Button>,
                        <Button key="reset" onClick={this.handleReset}>
                            Thử lại
                        </Button>
                    ]}
                >
                    {process.env.NODE_ENV === 'development' && (
                        <div
                            style={{
                                textAlign: 'left',
                                backgroundColor: '#f5f5f5',
                                padding: '16px',
                                borderRadius: '4px',
                                marginTop: '16px'
                            }}
                        >
                            <h4>Chi tiết lỗi (Development):</h4>
                            <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                                {this.state.error && this.state.error.toString()}
                                <br />
                                {this.state.errorInfo.componentStack}
                            </pre>
                        </div>
                    )}
                </Result>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
