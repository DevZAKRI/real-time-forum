export function setMessage(chatContainer, msg, receiver, scroll) {
    const messageElement = document.createElement('p');
    const time = document.createElement('sub')
    const date = new Date(msg.timestamp);
    const formattedTime = date.toLocaleString();
    time.textContent = formattedTime
    messageElement.textContent = `${msg.sender}: ${msg.content}.`;

    if (receiver === msg.sender) {
        messageElement.classList.add("received-message")
        time.classList.add("received-time")
    } else {
        messageElement.classList.add('sent-message')
        time.classList.add('sent-time')
    }
    if (scroll) {
        chatContainer.prepend(time)
        chatContainer.prepend(messageElement)
    } else {
        chatContainer.appendChild(messageElement)
        chatContainer.appendChild(time)
    }
}