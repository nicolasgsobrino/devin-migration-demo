interface ErrorBannerProps {
  message: string;
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <div className="error-banner">
      <span>⚠</span>
      <span>{message}</span>
    </div>
  );
}
