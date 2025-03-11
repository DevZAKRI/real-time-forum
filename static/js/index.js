import { openAuthModal } from "./auth.js";
import { logout } from "./auth.js";
import { showLoginForm } from "./auth.js";
import { Home } from "./Home.js";
import { SessionCheck } from "./components/sessionChecker.js";
import { createAuthModal } from "./auth.js";


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
            let chatContainer = document.querySelector('.chat-container');
            if (!chatContainer) {
                chatContainer = document.createElement('div');
                chatContainer.classList.add("chat-container");

                const users = ["Alice", "Bob", "Charlie", "David"];

                users.forEach(user => {
                    const userElement = document.createElement('p');
                    userElement.textContent = user;
                    chatContainer.appendChild(userElement);
                });

                document.body.append(chatContainer);
            } else {
                chatContainer.classList.toggle("hidden");
            }
        });
    } else {
        console.error("users-btn not found in the DOM.");
    }
})

// Session();
// logout();
// SessionCheck();
