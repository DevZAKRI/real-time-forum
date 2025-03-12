import { openAuthModal } from "./auth.js";
import { Home } from "./Home.js";
import { SessionCheck } from "./components/sessionChecker.js";


export const Session = () => {
    const authbtn = document.getElementById("login-register");
    if (authbtn) {
        authbtn.addEventListener("click", (e) => {
            openAuthModal();
        });
    }
};
Home();
document.addEventListener("DOMContentLoaded", () => {
    SessionCheck()
    const usersBtn = document.getElementById("users-btn");

    if (usersBtn) {
        usersBtn.addEventListener('click', () => {
            let usersContainer = document.querySelector('.users-container');

            if (!usersContainer) {
                usersContainer = document.createElement('div');
                usersContainer.classList.add("users-container");

                const users = ["Alice", "Bob", "Charlie", "David"];

                users.forEach(user => {
                    const userBtn = document.createElement('button');
                    userBtn.textContent = user;
                    userBtn.classList.add("user-btn");
                    userBtn.addEventListener('click', () => openChat(user));
                    usersContainer.appendChild(userBtn);
                });
                document.body.append(usersContainer);
            } else {
                usersContainer.remove();
            }
        });
    } else {
        console.error("users-btn not found in the DOM.");
    }
});

function openChat(user) {
    const usersContainer = document.querySelector('.users-container');
    usersContainer.remove()
    if (document.getElementById(`chat-${user}`)) return;

    const chatBox = document.createElement('div');
    chatBox.classList.add("chat-box");
    chatBox.id = `chat-${user}`;

    const chatHeader = document.createElement('div');
    chatHeader.classList.add("chat-box-header");
    chatHeader.innerHTML = `<span>${user}</span>`;

    const closeButton = document.createElement('button');
    closeButton.innerHTML = "✖";
    closeButton.addEventListener('click', () => chatBox.remove());
    chatHeader.appendChild(closeButton);

    const chatMessages = document.createElement('div');
    chatMessages.classList.add("chat-box-messages");

    const chatInput = document.createElement('textarea');
    chatInput.classList.add("chat-box-input");
    chatInput.setAttribute("placeholder", "Type a message...");

    const sendBtn = document.createElement('button')
    sendBtn.textContent = 'Send'

    chatBox.appendChild(chatHeader);
    chatBox.appendChild(chatMessages);
    chatBox.appendChild(chatInput);
    chatBox.appendChild(sendBtn);

    document.body.appendChild(chatBox);
}

// Session();
// logout();
// SessionCheck();
