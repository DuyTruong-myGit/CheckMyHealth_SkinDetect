import './EmptyState.css'

const EmptyState = ({
    title = 'Không có dữ liệu',
    message = 'Chưa có thông tin để hiển thị',
    icon,
    action,
    actionText,
    onAction
}) => {
    return (
        <div className="empty-state">
            {icon && <div className="empty-state__icon">{icon}</div>}
            <h3 className="empty-state__title">{title}</h3>
            <p className="empty-state__message">{message}</p>
            {action && (
                <button
                    className="empty-state__action"
                    onClick={onAction}
                >
                    {actionText || action}
                </button>
            )}
        </div>
    )
}

export default EmptyState
