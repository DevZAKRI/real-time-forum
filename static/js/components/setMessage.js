


export function setMessage(chatContainer, msg, receiver) {
    const messageElement = document.createElement('p');
    const time = document.createElement('sub')
    const date = new Date(msg.timestamp);
    const formattedTime = date.toLocaleString();
    time.textContent = formattedTime
    messageElement.textContent = `${msg.sender}: ${msg.content}.`;
    console.log(receiver, msg.sender);
    
    if (receiver === msg.sender) {
        messageElement.classList.add("received-message")
        time.classList.add("received-time")
    } else {
        messageElement.classList.add('sent-message')
        time.classList.add('sent-time')
    }
    chatContainer.appendChild(messageElement)
    chatContainer.appendChild(time)
}