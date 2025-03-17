export let ws = null;
import { showNotification } from "./components/notifications.js";
import { setMessage } from "./components/setMessage.js";
import { createList, usersSet } from "./users.js"
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
            console.log(message)
            console.log(chatMessages)
                if (chatMessages) {
                    if (message.sender !== message.receiver) {
                        setMessage(chatMessages, message, message.sender)
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                    }
                } else {
                    console.log('New Message Recieved From ' + message.sender);
                    showNotification('New Message Recieved From ' + message.sender, "success");
                }
                break;

            case 'status':
                const tabId = sessionStorage.getItem("tabId") || message.tabID;
                sessionStorage.setItem("tabId", tabId);
                const statusElement = document.getElementById(`Status-${message.user}`);
                if (statusElement) {
                    statusElement.textContent = message.status === 'online' ? '🟢' : '🔴';
                } else {
                    // showNotification(`A wild ${message.user} has spawned`, "success");
                    createList();
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
