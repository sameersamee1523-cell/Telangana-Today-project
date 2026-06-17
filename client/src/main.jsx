import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '40px', fontFamily: 'monospace', background: '#0f172a', color: '#f1f5f9', minHeight: '100vh' }}>
          <h1 style={{ color: '#ef4444', fontSize: '20px', marginBottom: '16px' }}>⚠️ App Crashed</h1>
          <pre style={{ background: '#1e293b', padding: '20px', borderRadius: '8px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#fca5a5', fontSize: '13px' }}>
            {this.state.error.toString()}
            {'\n\n'}
            {this.state.error.stack}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
