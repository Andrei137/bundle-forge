import { Link, useNavigate } from 'react-router-dom';
import './ErrorPage.css';

export const ErrorPage = ({
  code = '500',
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again later.',
  details = null,
  primaryAction = { label: 'Go to homepage', to: '/' },
  showBack = true,
}) => {
  const navigate = useNavigate();

  return (
    <div className="error-page">
      <div className="error-page__card" role="alert">
        <div className="error-page__code">{code}</div>
        <h1 className="error-page__title">{title}</h1>
        <p className="error-page__message">{message}</p>

        {details && (
          <details className="error-page__details">
            <summary>Technical details</summary>
            <pre>{details}</pre>
          </details>
        )}

        <div className="error-page__actions">
          {primaryAction?.to && (
            <Link to={primaryAction.to} className="error-page__btn error-page__btn--primary">
              {primaryAction.label}
            </Link>
          )}
          {showBack && (
            <button
              type="button"
              className="error-page__btn error-page__btn--secondary"
              onClick={() => navigate(-1)}
            >
              Go back
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
