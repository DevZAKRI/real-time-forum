export let ws = null;
import { Auth } from "./auth.js";
export function initializeWebSocket(userID) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        console.log("WebSocket is already open");
        return;
    }

    ws = new WebSocket(`ws://localhost:8080/ws?userID=${userID}`);

    ws.onopen = () => {
        console.log("WebSocket connection opened");
    };

    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log("WebSocket message received:", message);
        switch (message.type) {
            case 'message':
                const chatWindow = document.getElementById('chat-window');
                const chatContainer = chatWindow.querySelector('#chat-container');
                const recipient = chatWindow.querySelector('#recipient').textContent;
                console.log(chatContainer);
                if (chatContainer && message.sender.toLowerCase() === recipient.toLowerCase() && message.sender !== message.receiver) {
                    const messageElement = document.createElement('p');
                    messageElement.textContent = `${message.sender}: ${message.content}`;
                    chatContainer.appendChild(messageElement);
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                } else if (message.sender !== message.receiver) {
                    console.log('New Message Recieved From ' + message.sender);
                    Auth.showNotification('New Message Recieved From ' + message.sender, 'success');
                }
                break;
                case 'status':
                    const statusElement = document.getElementById('Status-' + message.user);
                    if (statusElement) {
                        if (message.status === 'online') {
                            statusElement.textContent = '🟢';
                        }
                        else if (message.status === 'offline') {
                            statusElement.textContent = '🔴';
                        }
                    }
                    break;
            default:
                console.error("Unknown message type:", message.type);
        }
    }

    ws.onerror = (error) => {
        console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
        console.log("WebSocket connection closed")
    }
}

export function closedWs() {
    ws.close()
}

export function sendMessage() {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
        console.error("WebSocket is not open");
        return;
    }

    const messageInput = document.getElementById('message-input');
    const message = messageInput.value.trim();
    if (!message) {
        return;
    }

    const recipient = document.getElementById('recipient').textContent;
    const messageData = {
        receiver: recipient,
        content: message,
        timestamp: new Date().toISOString()
    };

    ws.send(JSON.stringify(messageData));
    messageInput.value = '';
}