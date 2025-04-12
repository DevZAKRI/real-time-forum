import { openAuthModal } from "./auth.js";
import { Home } from "./Home.js";
import { SessionCheck } from "./components/sessionChecker.js";
import { initializeWebSocket, closedWs } from "./ws.js";


document.addEventListener("visibilitychange", function() {
    if (document.visibilityState === "hidden") {
      const chatBox = document.querySelector('.chat-box')
      if (chatBox) {
        chatBox.remove();
        console.log("WebSocket connection closed");
        console.log("Chat Box Removed");
      }
      // closedWs();
    } else if (document.visibilityState === "visible") {
        initializeWebSocket(localStorage.getItem("xyz"));
        console.log("WebSocket connection opened");
    }
  });

document.addEventListener("DOMContentLoaded", async () => {
    const isLoggedIn = await SessionCheck();
    if (isLoggedIn) {
        console.log("Not Here");
        Home();
    } else {
        console.log("Here");
        openAuthModal();
    }
});
// =======

// document.addEventListener("DOMContentLoaded", () => {
//     SessionCheck()
//     const usersBtn = document.getElementById("users-btn");

//     if (usersBtn) {
//         usersBtn.addEventListener('click', () => {
//             let usersContainer = document.querySelector('.users-container');

//             if (!usersContainer) {
//                 usersContainer = document.createElement('div');
//                 usersContainer.classList.add("users-container");

//                 const users = ["Alice", "Bob", "Charlie", "David"];

//                 users.forEach(user => {
//                     const userBtn = document.createElement('button');
//                     userBtn.textContent = user;
//                     userBtn.classList.add("user-btn");
//                     userBtn.addEventListener('click', () => openChat(user));
//                     usersContainer.appendChild(userBtn);
//                 });
//                 document.body.append(usersContainer);
//             } else {
//                 usersContainer.remove();
//             }
//         });
//     } else {
//         openAuthModal();
//     }
// });

// function openChat(user) {
//     const usersContainer = document.querySelector('.users-container');
//     usersContainer.remove()
//     if (document.getElementById(`chat-${user}`)) return;

//     const chatBox = document.createElement('div');
//     chatBox.classList.add("chat-box");
//     chatBox.id = `chat-${user}`;

//     const chatHeader = document.createElement('div');
//     chatHeader.classList.add("chat-box-header");
//     chatHeader.innerHTML = `<span>${user}</span>`;

//     const closeButton = document.createElement('button');
//     closeButton.innerHTML = "✖";
//     closeButton.addEventListener('click', () => chatBox.remove());
//     chatHeader.appendChild(closeButton);

//     const chatMessages = document.createElement('div');
//     chatMessages.classList.add("chat-box-messages");

//     const chatInput = document.createElement('textarea');
//     chatInput.classList.add("chat-box-input");
//     chatInput.setAttribute("placeholder", "Type a message...");

//     const sendBtn = document.createElement('button')
//     sendBtn.textContent = 'Send'

//     chatBox.appendChild(chatHeader);
//     chatBox.appendChild(chatMessages);
//     chatBox.appendChild(chatInput);
//     chatBox.appendChild(sendBtn);

//     document.body.appendChild(chatBox);
// }

// Session();
// logout();
// SessionCheck();
