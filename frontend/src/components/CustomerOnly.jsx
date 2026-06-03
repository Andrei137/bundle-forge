import { useSelector } from 'react-redux';
import { ErrorPage } from './ErrorPage';

/**
 * Restricts a route to non-developer accounts. Developers don't have a cart or
 * a checkout flow, so they get redirected to a 403 error page instead.
 */
export const CustomerOnly = ({ children }) => {
  const userType = useSelector(state => state.auth.userType);

  if (userType === 'DEVELOPER') {
    return (
      <ErrorPage
        code="403"
        title="Not available for developers"
        message="Developer accounts can’t use the shopping cart or checkout. Switch to a customer account to buy games."
        primaryAction={{ label: 'Go to your games', to: '/dev/games' }}
      />
    );
  }

  return children;
};
