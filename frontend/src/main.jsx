import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import store from './redux/store'
import { logout } from './redux/slices/authSlice'
import './index.css'
import App from './App.jsx'

// Global 401 handler: if the backend rejects an authenticated request, the
// JWT has expired or been revoked — clear local auth state so the user is
// routed back through the sign-in flow instead of seeing a half-broken UI.
const originalFetch = window.fetch.bind(window);
window.fetch = async (input, init) => {
  const response = await originalFetch(input, init);
  if (response.status === 401) {
    const headers = init?.headers;
    const hadAuth = !!headers && (
      (headers instanceof Headers && headers.has('Authorization')) ||
      (typeof headers === 'object' && 'Authorization' in headers)
    );
    if (hadAuth && store.getState().auth.isAuthenticated) {
      store.dispatch(logout());
    }
  }
  return response;
};

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </Provider>
  </StrictMode>,
)
