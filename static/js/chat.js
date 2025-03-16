import { showNotification } from "./components/notifications.js";
import { setMessage } from "./components/setMessage.js";
import { GetUsers } from "./users.js";
import { ws } from "./ws.js";
export function Chat() {
    const usersBtn = document.getElementById("users-btn");
    if (usersBtn) {
        usersBtn.addEventListener('click', async () => {
            let usersContainer = document.querySelector('.users-container');
            if (!usersContainer) {
                usersContainer = document.createElement('div');
                usersContainer.classList.add("users-container");
                const closeButton = document.createElement('button');
                closeButton.innerHTML = "✖";
                closeButton.addEventListener('click', () => usersContainer.remove());
                usersContainer.appendChild(closeButton);

                const users = await GetUsers();

                users.forEach(user => {
                    const userBtn = document.createElement('button');
                    userBtn.textContent = user.username;
                    userBtn.classList.add("user-btn");
                    userBtn.addEventListener('click', () => openChat(user));
                    usersContainer.appendChild(userBtn);
                });
                document.body.append(usersContainer);
            } else {
                usersContainer.remove();
            }
        });
    }
}

export function openChat(user) {
    const usersContainer = document.querySelector('.users-container');
    usersContainer.remove()
    if (document.getElementById(`chat-${user.username}`)) return;

    const existingChatBox = document.querySelector('.chat-box');
    if (existingChatBox) {
        existingChatBox.remove();
    }

    const chatBox = document.createElement('div');
    chatBox.classList.add("chat-box");
    chatBox.id = `chat-${user.username}`;

    const chatHeader = document.createElement('div');
    chatHeader.classList.add("chat-box-header");
    const nameDiv = document.createElement('div')
    nameDiv.classList.add('name-div')
    nameDiv.innerHTML = `<div><span>${user.username}</span></div>`;

    const buttonDiv = document.createElement('div')
    const closeButton = document.createElement('button');
    closeButton.innerHTML = "✖";
    closeButton.addEventListener('click', () => chatBox.remove());
    buttonDiv.appendChild(closeButton)
    nameDiv.appendChild(buttonDiv);

    const chatMessages = document.createElement('div');
    chatMessages.classList.add("chat-box-messages");

    const typingDiv = document.createElement('div')
    const typingInProgress = document.createElement('sub')
    typingInProgress.classList.add("typing")
    typingInProgress.textContent = `${user.username} is typing...`
    typingInProgress.style.display = "none"

    typingDiv.appendChild(typingInProgress)

    chatHeader.appendChild(nameDiv)
    chatHeader.appendChild(typingDiv)

    const chatInput = document.createElement('textarea');
    chatInput.classList.add("chat-box-input");
    chatInput.setAttribute("placeholder", "Type a message...");
    
    let typingTimeout;
    chatInput.addEventListener('input', () => {
        ws.send(JSON.stringify({
            type: 'typing',
            sender: localStorage.getItem("xyz"),
            receiver: user.username
        }))

        clearTimeout(typingTimeout)
        typingTimeout = setTimeout(() => {
            ws.send(JSON.stringify({
                type: 'stopped_typing',
                sender: localStorage.getItem("xyz"),
                receiver: user.username
            }))
        }, 300)
    })

    chatInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendingMessage(user);
        }
    });

    const sendBtn = document.createElement('button')
    sendBtn.id = `send-btn-chat-${user.username}`
    sendBtn.textContent = 'Send'
    sendBtn.addEventListener('click', () => {
        sendingMessage(user);
    }
    );
    chatBox.appendChild(chatHeader);
    chatBox.appendChild(chatMessages);
    chatBox.appendChild(chatInput);
    chatBox.appendChild(sendBtn);
    GetMessages(user.username, chatMessages)
    document.body.appendChild(chatBox);
}

export function sendingMessage(user) {
    const messageInput = document.querySelector(`#chat-${user.username} .chat-box-input`);
    const message = messageInput.value.trim();
    if (!message) {
        showNotification('Message cannot be empty', 'error');
        return;
    }

    const recipient = user.username;
    const messageData = {
        type: 'message',
        receiver: recipient,
        content: message,
        timestamp: new Date().toISOString()
    };

    ws.send(JSON.stringify(messageData));

    const chatMessages = document.querySelector(`#chat-${user.username} .chat-box-messages`);
    const messageElement = document.createElement('p');
    const time = document.createElement('sub')
    const date = new Date(messageData.timestamp);
    const formattedTime = date.toLocaleString();
    time.textContent = formattedTime
    messageElement.textContent = `${message}`;
    messageElement.classList.add('sent-message')
    time.classList.add('sent-time')
    chatMessages.appendChild(messageElement);
    chatMessages.appendChild(time)
    messageInput.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight
}


export function GetMessages(receiver, chatContainer) {
    const senderID = localStorage.getItem("xyz")
    console.log(senderID);
    fetch(`/api/chat/messages?sender=${senderID}&receiver=${receiver}`, { credentials: "include" })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Problem fetching messages: ' + response.status);
                }
                return response.json();
            })
            .then(messages => {
                console.log('Old messages:', messages);
                if (!messages) {
                    const messageElement = document.createElement('p');
                    messageElement.textContent = `No messages yet!`;
                    chatContainer.appendChild(messageElement);
                    return;
                }
                messages.forEach(msg => {
                    setMessage(chatContainer, msg, receiver)
                });
    
                chatContainer.scrollTop = chatContainer.scrollHeight;
            })
            .catch(error => console.error('Problem fetching messages:', error));
    
}