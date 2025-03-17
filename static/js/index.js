import { openAuthModal } from "./auth.js";
import { Home } from "./Home.js";
import { SessionCheck } from "./components/sessionChecker.js";

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


// No refresh
// document.addEventListener("DOMContentLoaded", async () => {
//     const isLoggedIn = await SessionCheck();
//     if (isLoggedIn) {
//         console.log("Not Here");
//         setBody();
//     } else {
//         console.log("Here");
//         openAuthModal();
//     }
// });