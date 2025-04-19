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
        console.log("Chat Box Removed");
      }
    } else if (document.visibilityState === "visible") {
      initializeWebSocket(localStorage.getItem("xyz"));
      console.log("WebSocket connection opened");
    }
  }, 300); // debounce visiblity
});

document.addEventListener("DOMContentLoaded", async () => {
  const errorContainer = document.getElementById("error-container");
    if (errorContainer) {
      console.log("On error page, skipping normal initialization")  
      return;
    }
    const isLoggedIn = await SessionCheck();
    if (isLoggedIn) {
        console.log("Not Here");
        Home();
    } else {
        console.log("Here");
        openAuthModal();
    }
});
