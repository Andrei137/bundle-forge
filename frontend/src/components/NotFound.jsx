import { ErrorPage } from './ErrorPage';

export const NotFound = () => (
  <ErrorPage
    code="404"
    title="Page not found"
    message="The page you’re looking for doesn’t exist or has been moved. Check the URL or head back to the homepage to keep browsing."
    primaryAction={{ label: 'Back to homepage', to: '/' }}
  />
);
