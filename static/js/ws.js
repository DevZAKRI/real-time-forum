export let ws = null;
import { showNotification } from "./components/notifications.js";

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
                const chatBox = document.getElementById(`chat-${message.sender}`);
                const chatMessages = chatBox ? chatBox.querySelector('.chat-box-messages') : null;

                if (chatMessages) {
                    if (message.sender !== message.receiver) {
                        const messageElement = document.createElement('p');
                        messageElement.textContent = `${message.sender}: ${message.content}`;
                        messageElement.classList.add("received-message")
                        chatMessages.appendChild(messageElement);
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                    } 
                } else {
                    console.log('New Message Recieved From ' + message.sender);
                    showNotification('New Message Recieved From ' + message.sender, "success");
                }
                break;

            case 'status':
                const statusElement = document.getElementById(`Status-${message.user}`);
                if (statusElement) {
                    statusElement.textContent = message.status === 'online' ? '🟢' : '🔴';
                }
                break;

            default:
                console.error("Unknown message type:", message.type);
        }
    };

    ws.onerror = (error) => {
        console.error("WebSocket error:", error);
    };

    // Optional: Uncomment if you want to handle WebSocket closure
    // ws.onclose = () => {
    //     console.log("WebSocket connection closed");
    // };
}

export function closedWs() {
    if (ws) {
        ws.close();
    }
}
