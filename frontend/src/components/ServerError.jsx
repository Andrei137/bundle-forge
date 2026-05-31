import { ErrorPage } from './ErrorPage';

export const ServerError = ({ details = null }) => (
  <ErrorPage
    code="500"
    title="Internal server error"
    message="Something went wrong on our end. Our team has been notified — please try again in a moment."
    details={details}
    primaryAction={{ label: 'Back to homepage', to: '/' }}
  />
);
