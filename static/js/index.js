import { openAuthModal } from "./auth.js";
import { Home } from "./Home.js";
import { SessionCheck } from "./components/sessionChecker.js";

document.addEventListener("DOMContentLoaded", async () => {
    const isLoggedIn = await SessionCheck();
    if (isLoggedIn) {
        Home();
    } else {
        openAuthModal();
    }
});