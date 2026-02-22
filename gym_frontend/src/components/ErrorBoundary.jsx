import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '40px',
                    fontFamily: 'Inter, sans-serif',
                    backgroundColor: '#fff',
                    minHeight: '100vh'
                }}>
                    <h1 style={{ color: '#e53e3e', marginBottom: '20px' }}>Something went wrong</h1>
                    <details style={{ whiteSpace: 'pre-wrap', background: '#f7fafc', padding: '20px', borderRadius: '8px' }}>
                        <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px' }}>
                            Click to see error details
                        </summary>
                        <p style={{ color: '#c53030', marginTop: '10px' }}>
                            {this.state.error && this.state.error.toString()}
                        </p>
                        <p style={{ color: '#2d3748', marginTop: '10px', fontSize: '14px' }}>
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </p>
                    </details>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '20px',
                            padding: '10px 20px',
                            backgroundColor: '#4299e1',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
