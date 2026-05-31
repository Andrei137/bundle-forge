import { Component } from 'react';
import { useLocation } from 'react-router-dom';
import { ServerError } from './ServerError';

class ErrorBoundaryInner extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Surface to the console so it's discoverable in dev tools and any
    // browser-side error reporter (Sentry, etc.) that wraps console.error.
    console.error('Unhandled UI error:', error, info?.componentStack);
  }

  componentDidUpdate(prevProps) {
    if (this.state.error && prevProps.locationKey !== this.props.locationKey) {
      this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error) {
      const details = import.meta.env.DEV
        ? `${this.state.error.message}\n\n${this.state.error.stack ?? ''}`
        : null;
      return <ServerError details={details} />;
    }
    return this.props.children;
  }
}

export const ErrorBoundary = ({ children }) => {
  const location = useLocation();
  return <ErrorBoundaryInner locationKey={location.key}>{children}</ErrorBoundaryInner>;
};
