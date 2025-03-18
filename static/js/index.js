import { openAuthModal } from "./auth.js";
import { SessionCheck } from "./components/sessionChecker.js";
import { setBody } from "./body.js";
import { initializeWebSocket } from "./ws.js";

document.addEventListener("DOMContentLoaded", async () => {
    handleRouteChange();
});


window.addEventListener("popstate", () => {
    handleRouteChange();
});

function handleRouteChange() {
    const path = window.location.pathname;
    console.log("Current Path:", path);

    if (path === "/") {
        setDisplay();
    } else {
        console.log("Loading Error Page");
        setErrorPage();
    }
}



async function setDisplay() {

    const errorBody = document.querySelector(".ErrorBody");
    if (errorBody) {
        errorBody.remove();
    }


    const isLoggedIn = await SessionCheck();
    if (isLoggedIn) {
        console.log("User is logged in: Loading home page.");
        setBody();
        const userID = localStorage.getItem("xyz");
        initializeWebSocket(userID);
    } else {
        console.log("User is not logged in: Opening auth modal.");
        openAuthModal();
    }
}

function updateURL(newPath) {
    window.history.pushState({}, "", newPath);
}

function setErrorPage() {
    let body = document.querySelector(".DynamicBody");
    if (!body) {
        body = document.createElement('div');
        body.classList.add("ErrorBody")
        document.body.appendChild(body);
    }

    console.log("ITS HERE OLAAAA");

    body.innerHTML = `
        <div class="ErrorContainer">
            <h1>404</h1>
            <p>Page not found.</p>
            <a class="button" id="HomeBtn">Go Back</a>
        </div>
    `;

    const homeBtn = document.getElementById("HomeBtn");
    if (homeBtn) {
        homeBtn.addEventListener("click", () => {
            updateURL("/");
            setDisplay();
        });
    } else {
        console.error("HomeBtn not found!");
    }
}

