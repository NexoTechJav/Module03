import React from 'react';

type NotificationKind = 'success' | 'error';

export default function Notification(props: {
  kind: NotificationKind;
  title?: string;
  message: string;
  onClose?: () => void;
}) {
  const { kind, title, message, onClose } = props;

  return (
    <div className={`notification ${kind}`} role="status" aria-live="polite">
      <div className="notification-header">
        <strong>{title ?? (kind === 'success' ? 'Exito' : 'Error')}</strong>
        {onClose ? (
          <button type="button" className="notification-close" onClick={onClose}>
            x
          </button>
        ) : null}
      </div>
      <div className="notification-message">{message}</div>
    </div>
  );
}

