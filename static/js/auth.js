import { showNotification } from "./components/notifications.js";
import { initializeWebSocket } from "./ws.js";
import { Home } from "./Home.js";

export function createAuthModal() {
  const authModalHTML = `
    <div class="auth-modal-overlay" id="authModalOverlay">
      <div class="auth-modal" id="authModal">
        <div class="auth-card" id="authCard">
          <div class="auth-content" id="authContent"></div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", authModalHTML);
  showLoginForm();
}

export function createLoginForm() {
  const loginFormHTML = `
    <h2>Welcome Back</h2>
    <p>Please log in to continue.</p>
    <form name="auth-form">
        <div class="input-group">
            <input type="text" name="username-email" placeholder="Email or Username" required>
        </div>
        <div class="input-group">
            <input type="password" name="password" placeholder="Password" required>
        </div>
        <button type="submit" class="btn" name="login-btn">Log In</button>
        <p class="redirect">Don't have an account? <a href="#" name="showSignUpLink">Sign Up</a></p>
    </form>
  `;
  document.querySelector('[id="authContent"]').innerHTML = loginFormHTML;

  document
    .querySelector('[name="showSignUpLink"]')
    .addEventListener("click", (e) => {
      e.preventDefault();
      showSignUpForm();
    });

  auth();
}

export function createSignUpForm() {
  const signUpFormHTML = `
    <h2>Create an Account</h2>
    <p>Join us and enjoy all features.</p>
    <form name="auth-form">
        <div class="input-group">
          <input type="text" name="firstname" placeholder="First Name" required>
        </div>
        <div class="input-group">
          <input type="text" name="lastname" placeholder="Last Name" required>
        </div>
        <div class="input-group">
            <input type="text" name="username" placeholder="Nickname" required>
        </div>
        <div class="input-group">
            <input type="email" name="email" placeholder="Email" required>
        </div>
        <div class="input-group">
            <input type="password" name="password" placeholder="Password" required>
        </div>
        <div class="input-group">
            <select name="gender" id="signup-gender">
              <option value="" disabled selected>Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
        </div>
        <div class="input-group">
            <input type="number" name="age" placeholder="Age"  required>
        </div>
        <button type="submit" class="btn" name="signup-btn">Sign Up</button>
        <p class="redirect">Already have an account? <a href="#" name="showLoginLink">Log In</a></p>
    </form>
  `;
  document.querySelector('[id="authContent"]').innerHTML = signUpFormHTML;

  document
    .querySelector('[name="showLoginLink"]')
    .addEventListener("click", (e) => {
      e.preventDefault();
      showLoginForm();
    });

  auth();
}

export function showLoginForm() {
  createLoginForm();
}

export function showSignUpForm() {
  createSignUpForm();
}

export function openAuthModal() {
  if (!document.querySelector('[id="authModalOverlay"]')) {
    createAuthModal();
  }
  document.querySelector('[id="authModalOverlay"]').style.display = "flex";
}

export function closeAuthModal() {
  const modal = document.querySelector('[id="authModalOverlay"]');
  if (modal) {
    modal.style.display = "none";
  }
}

async function updateUIForLoggedInUser(username) {
  // Create a temporary container for the new content
  const tempContainer = document.createElement('div');
  tempContainer.innerHTML = `
    <noscript>
      <h1>Activate JavaScript or Nothing Will Work.</h1>
    </noscript>
    <a onclick="window.scrollTo({top: 0});" class="back-to-top">
      <i class="fa-solid fa-arrow-up"></i>
    </a>
    <header>
      <div class="header-container">
        <div>
          <nav>
            <div>
              <a href="/" class="header-logo">
                <i class="fas fa-comments"></i>
                Forum
              </a>
            </div>
        </div>
        <div class="header-nav">
          <ul class="header-list">
            <li>
              <p id="header-logout">Welcome ${username}</p>
              <button type="button" id="users-btn">Users</button>
              <a id="logout-btn">Logout</a>
            </li>
          </ul>
        </div>
      </div>
    </header>
    <div class="container">
      <div class="left-sidebar">
        <div class="logo">
          <i class="fas fa-comments"></i> Forum
        </div>
        <ul class="categories">
          <li><i class="fas fa-home"></i>General</li>
          <li><i class="fas fa-microchip"></i>Tech</li>
          <li><i class="fas fa-gamepad"></i>Sports</li>
          <li><i class="fa-solid fa-heart-pulse"></i>Health</li>
          <li><i class="fa-solid fa-book-open"></i>Education</li>
        </ul>
        <div class="filters">
          <div class="post-filters">
            <button id="my-posts-filter" class="filter-button">My Posts</button>
          </div>
          <div class="like-filters">
            <button id="my-likes-filter" class="filter-button">My 👍</button>
          </div>
        </div>
      </div>
      <main class="main-content">
        <div class="add-post">
          <div class="create-post-form">
            <div class="publisher-info">
              <img src="https://www.w3schools.com/w3images/avatar2.png" alt="Profile Picture" class="profile-pic">
              <span class="publisher-name">Want to share Something? </span>
            </div>
            <input type="text" name="title" placeholder="Enter post title" required>
            <textarea name="content" placeholder="Write a new post..." required></textarea>
            <label>Select Categories:</label>
            <div class="checkbox-group">
              <div>
                <input type="checkbox" id="general" name="category" value="general">
                <label for="general">General</label>
              </div>
              <div>
                <input type="checkbox" id="tech" name="category" value="tech">
                <label for="tech">Tech</label>
              </div>
              <div>
                <input type="checkbox" id="health" name="category" value="health">
                <label for="health">Health</label>
              </div>
              <div>
                <input type="checkbox" id="sports" name="category" value="sports">
                <label for="sports">Sports</label>
              </div>
              <div>
                <input type="checkbox" id="education" name="category" value="education">
                <label for="education">Education</label>
              </div>
            </div>
            <button type="submit" id="create-post-button" class="submitButton">Add Post</button>
          </div>
        </div>
        <div id="posts-container"></div>
        <button id="load-more" style="display: none;">Load More Posts</button>
      </main>
      <div class="right-sidebar">
        <div class="chat-users">
          <h2>Users</h2>
          <ul id="users-list"></ul>
        </div>
      </div>
    </div>
  `;

  // Save any existing notifications
  const notifications = document.querySelectorAll('.notification-container');
  const notificationsArray = Array.from(notifications);

  // Update the body content while preserving notifications
  const existingContent = Array.from(document.body.children).filter(
    child => !child.classList.contains('notification-container') && 
            !child.classList.contains('auth-modal-overlay')
  );
  existingContent.forEach(element => element.remove());
  
  // Add the new content
  while (tempContainer.firstChild) {
    document.body.insertBefore(tempContainer.firstChild, document.body.firstChild);
  }

  // Restore notifications if any
  notificationsArray.forEach(notification => {
    document.body.appendChild(notification);
  });

  // Close the auth modal
  closeAuthModal();
  
  // Initialize the home page
  Home();
}

export function auth() {
  document
    .querySelector('[name="auth-form"]')
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const isLogin = document.querySelector('[name="login-btn"]') !== null;
      const data = {
        password: document.querySelector('[name="password"]').value,
      };

      if (isLogin) {
        const inputValue = document
          .querySelector('[name="username-email"]')
          .value.trim();
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputValue)) {
          data.email = inputValue;
        } else {
          data.username = inputValue;
        }
      } else {
        data.firstname = document.querySelector('[name="firstname"]').value
        data.lastname = document.querySelector('[name="lastname"]').value
        data.username = document.querySelector('[name="username"]').value;
        data.email = document.querySelector('[name="email"]').value;
        data.age = Number(document.querySelector('[name="age"]').value);
        data.gender = document.querySelector('[name="gender"]').value;

        const age = Number(data.age);
        if (isNaN(age) || age < 13 || age > 120) {
          showNotification('Age must be between 13 and 120', 'error');
          return;
        }
      }

      try {
        const response = await fetch(
          isLogin ? "/api/auth/login" : "/api/auth/register",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
            credentials: "include",
          }
        );

        if (response.ok) {
          const Msg = await response.json();
          localStorage.setItem('xyz', Msg.xyz)
          initializeWebSocket(localStorage.getItem('xyz'))
          const message = isLogin ? "Login successful" : "Registration successful";
          showNotification(message, "success");
          await updateUIForLoggedInUser(isLogin ? data.username || data.email : data.username);
        } else {
          const error = await response.json();
          showNotification(
            `${isLogin ? "Login" : "Registration"} failed: ${error.message}`,
            "error"
          );
        }
      } catch (error) {
        showNotification("An error occurred", "error");
      }
    });
}

export function logout() {
  const logoutBtn = document.getElementById("logout-btn")
  logoutBtn?.addEventListener("click", async (e) => {
    try {
      const response = await fetch("/api/auth/logout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        localStorage.removeItem('xyz');
        showNotification("Logout successful", "success");
        
        // Save any existing notifications
        const notifications = document.querySelectorAll('.notification-container');
        const notificationsArray = Array.from(notifications);
        
        // Clear the page content while preserving notifications
        const existingContent = Array.from(document.body.children).filter(
          child => !child.classList.contains('notification-container')
        );
        existingContent.forEach(element => element.remove());
        
        // Add back the basic structure
        document.body.insertAdjacentHTML('afterbegin', `
          <noscript>
            <h1>Activate JavaScript or Nothing Will Work.</h1>
          </noscript>
        `);
        
        // Restore notifications
        notificationsArray.forEach(notification => {
          document.body.appendChild(notification);
        });
        
        // Show the auth modal
        openAuthModal();
      }
    } catch (error) {
      showNotification("An error occurred", "error");
    }
  })
}

