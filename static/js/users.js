export async function GetUsers() {
    const url = `/api/users?requester=${localStorage.getItem('xyz')}`;
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: "include",
    };
    return fetch(url, options)
        .then((response) => response.json())
        .then((data) => {
            return data;
        })
        .catch((error) => {
            console.error('Request failed:', error);
        });
}

export const usersSet = new Set()

export async function createList() {
    const usersList = document.getElementById('users-list');
    const users = await GetUsers();

    usersSet.clear()
    if (usersList) {
        usersList.innerHTML = ''
        users.forEach((user) => {
            if (!usersSet.has(user.username)) {
                usersSet.add(user.username)
            }
    
            let statusDot = user.isOnline
                ? '🟢'
                : '🔴';
    
            const userElement = document.createElement('li');
            userElement.classList.add(`user-item-${user.username}`);
            userElement.innerHTML = `
                <span class="user-name">${user.username}</span>
                <span id="Status-${user.username}">${statusDot}</span>
            `;
            usersList.appendChild(userElement);
        });
    }
    let usersContainer = document.querySelector('.users-container');
    if (usersContainer) {
        usersContainer.innerHTML = '';
        const closeButton = document.createElement('button');
        closeButton.innerHTML = "✖";
        closeButton.addEventListener('click', () => usersContainer.remove());
        usersContainer.appendChild(closeButton);
        users.forEach(user => {
            if (!usersSet.has(user.username)) {
                usersSet.add(user.username);
            }
            const userBtn = document.createElement('button');
            userBtn.textContent = user.username;
            userBtn.classList.add("user-btn");
            userBtn.addEventListener('click', () => openChat(user));
            usersContainer.appendChild(userBtn);
        });
    }
}