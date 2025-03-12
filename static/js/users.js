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


export async function createList() {
    const usersList = document.getElementById('users-list');
    const users = await GetUsers();
    console.log(users);
    users.forEach((user) => {
        let statusDot = user.isOnline
        ? '🟢'
        : '🔴';
        
        const userElement = document.createElement('li');
        userElement.classList.add('user-item');
        userElement.innerHTML = `
            <span class="user-name">${user.username}</span>
            <span id="Status-${user.username}">${statusDot}</span>
        `;
        usersList.appendChild(userElement);
    });
}