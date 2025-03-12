export function showNotification(message, type = 'error') {
    const notification = document.createElement('div');
    notification.id = 'notification-container';
    notification.classList.add('notification-container');
    notification.textContent = message;
    notification.classList.add('show');

    if (type === 'success') {
        notification.style.backgroundColor = 'rgba(0, 128, 0, 0.8)';
    } else {
        notification.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
    }

    document.body.appendChild(notification);

    setTimeout(() => {
        document.body.removeChild(notification);
    }, 5000);
}
