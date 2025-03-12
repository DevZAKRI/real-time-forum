import { showNotification } from './notifications.js';
import { logout, openAuthModal } from '../auth.js';
import { Home } from '../Home.js';

export async function SessionCheck() {
    console.log("test");
        const response = await CheckAuth('/api/auth/session');
        if (!response) {
            clearCookies();
            return false;
        } else {
            return true;
        }
}

async function CheckAuth(url, options = {}) {
    try {
        const response = await fetch(url, options);

        if (response.status === 401) {
            console.log("test2");
            logout();
            Home();
            return null;
        }
        console.log(response);
        
        return response;
    } catch (error) {
        console.error("Request failed:", error);
    }
}

function clearCookies() {
    document.cookie = "";
}
