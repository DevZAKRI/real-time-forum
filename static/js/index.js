import { openAuthModal } from "./auth.js";
import { SessionCheck } from "./components/sessionChecker.js";
import { setBody } from "./body.js";

document.addEventListener("DOMContentLoaded", async () => {
    const isLoggedIn = await SessionCheck();
    if (isLoggedIn) {
        console.log("Not Here");
        setBody();
    } else {
        console.log("Here");
        openAuthModal();
    }
});