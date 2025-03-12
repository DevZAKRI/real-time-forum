import { openAuthModal } from "./auth.js";
import { logout } from "./auth.js";
import { showLoginForm } from "./auth.js";
import { Home } from "./Home.js";
import { SessionCheck } from "./components/sessionChecker.js";
import { createAuthModal } from "./auth.js";

document.addEventListener("DOMContentLoaded", async () => {
    const isLoggedIn = await SessionCheck();
    if (isLoggedIn) {
        Home();
    } else {
        openAuthModal();
    }
});