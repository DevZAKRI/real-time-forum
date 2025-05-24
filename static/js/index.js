import { openAuthModal } from "./auth.js";
import { Home } from "./Home.js";
import { SessionCheck } from "./components/sessionChecker.js";
import { initializeWebSocket, closedWs } from "./ws.js";

let debounceTimeout;

document.addEventListener("visibilitychange", function () {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    if (document.visibilityState === "hidden") {
      const chatBox = document.querySelector('.chat-box')
      if (chatBox) {
        chatBox.remove();
        console.log("WebSocket connection closed");
      }
    } else if (document.visibilityState === "visible") {
      initializeWebSocket(localStorage.getItem("xyz"));
      console.log("WebSocket connection opened");
    }
  }, 300); // debounce visiblity
});

document.addEventListener("DOMContentLoaded", async () => {
    if (window.location.pathname !== "/") {
document.body.innerHTML = `
      <div class="error-container">
        <h1>404</h1>
        <p>Something went wrong.</p>
        <p>Sorry, Page Not Found</p>
      </div>
    `;
    return;  
  }

  const errorContainer = document.getElementById("error-container");
    if (errorContainer) {
      console.log("On error page, skipping normal initialization")  
      return;
    }
    const isLoggedIn = await SessionCheck();
    if (isLoggedIn) {
        Home();
    } else {
        openAuthModal();
    }
});

