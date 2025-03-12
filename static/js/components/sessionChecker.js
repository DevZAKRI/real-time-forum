import { initializeWebSocket } from '../ws.js';


// Description: This file contains the code to check if the user is logged in or not.
export async function SessionCheck() {
    console.log("test");
        const response = await CheckAuth('/api/auth/session');
        if (!response) {
            clearCookies();
            return false;
        } else {
            console.log("OOOH");
            initializeWebSocket(localStorage.getItem('xyz'));
            return true;
        }
}

async function CheckAuth(url, options = {}) {
    try {
        const response = await fetch(url, options);

        if (response.status === 401) {
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
