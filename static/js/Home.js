import { showNotification } from "./components/notifications.js";
import { filterCat } from "./filter.js";
import { createPostElement } from "./posts.js";
import { logout } from "./auth.js";
import { checkPost } from "./addposts.js";
import { createList } from "./users.js";
import { Chat } from "./chat.js";

export const Home = async () => {
    try {
        if (document.getElementById("users-list")) {
            createList()
        }
        Chat();
        const loadMoreButton = document.getElementById('load-more');
        if (loadMoreButton) {
            loadMoreButton.style.display = 'none';
        }
        logout();
        checkPost();
        const postsElement = document.getElementById("posts-container");
        if (!postsElement) {
            console.warn("Posts container not found. Might be on an error page.");
            return;
        }
        try {
            const resp = await fetch("/api/posts");

            if (!resp.ok) {
                const res = await resp.json()
                console.error("Failed to fetch posts, response not ok.");
                showNotification(res.message, "error");
                return;
            }

            const posts = await resp.json();

            if (!posts || posts.length === 0) {
                loadMoreButton.style.display = 'none';
                console.warn("No posts available.");
                showNotification("No posts found", "error");
                return;
            }
            if (loadMoreButton) {
                if (posts.length < 10) {
                    loadMoreButton.style.display = 'none';
                } else {
                    loadMoreButton.style.display = 'block';
                }
            }
            postsElement.replaceChildren();
            posts.forEach((post) => {
                const postElement = createPostElement(post);
                postsElement.appendChild(postElement);
            });

            filterCat();

        } catch (error) {
            console.error("Error: ", error);

        }
    } catch (error) {
        console.error("Error in Home initialization:", error);
    }
};
