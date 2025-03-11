import { showNotification } from './notifications.js';
import { logout, openAuthModal } from '../auth.js';
import { Home } from '../Home.js';

export async function SessionCheck() {
    console.log("test");
        const response = await CheckAuth('/api/auth/session');
        if (!response) {
            // showNotification("Your session has expired.", "error");
            clearCookies();
            openAuthModal();
        } else {
            return true;
        }
}

async function CheckAuth(url, options = {}) {
    try {
        const response = await fetch(url, options);

        if (response.status === 401) {
            console.log("test2");
            // showNotification("Session expired. Please log in again.");
            logout();
            Home();
            return null;
        }
        console.log(response);
        
        return response;
    } catch (error) {
        console.error("Request failed:", error);
        // showNotification("Something went wrong. Please try again.");
    }
}

function clearCookies() {
    document.cookie = "";
}
