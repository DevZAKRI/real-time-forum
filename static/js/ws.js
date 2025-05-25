export let ws = null;
import { showNotification } from "./components/notifications.js";
import { setMessage } from "./components/setMessage.js";
import { createList, usersSet } from "./users.js"
import { MessagesSet } from "./chat.js";
export function initializeWebSocket(userID) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        closedWs();
        ws = null;
        console.log("WebSocket connection closed");
    }

    ws = new WebSocket(`ws://localhost:8080/ws?userID=${userID}`);

    ws.onopen = () => {
        console.log("WebSocket connection opened");
    };

    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log("Received message:", message);
        switch (message.type) {
            case 'message':
                if (!message.own) {
                    var chatBox = document.getElementById(`chat-${message.sender}`);
                } else {
                    var chatBox = document.getElementById(`chat-${message.receiver}`);
                }
                MessagesSet.add(message.id)
                createList();
                const chatMessages = chatBox ? chatBox.querySelector('.chat-box-messages') : null;
                if (chatMessages) {
                    if (message.sender !== message.receiver && !message.own) {
                        setMessage(chatMessages, message, message.sender)
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                    } else if (message.own) {
                        console.log("Message is own, setting in receiver's chat box");
                        
                        setMessage(chatMessages, message, message.receiver)
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                    }
                } else {
                    if (!message.own) {
                        showNotification('New Message Recieved From ' + message.sender, "success");
                    }
                }
                break;

            case 'status':
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

}

export function closedWs() {
    if (ws) {
        ws.close();
    }
}
