// src/index.js

const API_BASE_URL = 'http://localhost:3000'; // Base URL for your API

/**
 * Helper function to safely get a DOM element by its ID.
 * Logs an error if the element is not found.
 * @param {string} id The ID of the element to retrieve.
 * @returns {HTMLElement|null} The DOM element or null if not found.
 */
function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.error(`Error: DOM element with ID '${id}' not found.`);
    }
    return element;
}

/**
 * Fetches all blog posts from the API and displays their titles in the #post-list div.
 */
function displayPosts() {
    fetch(`${API_BASE_URL}/posts`) // GET request to retrieve all blog posts.
        .then(response => {
            if (!response.ok) { // Check if HTTP status is 2xx
                // If not OK, read the response as text to get the error message
                return response.text().then(text => {
                    throw new Error(`HTTP error! Status: ${response.status}, Message: ${text}`);
                });
            }
            return response.json(); // Only proceed to parse as JSON if response is OK
        })
        .then(posts => {
            const postListDiv = getElement('post-list');
            if (postListDiv) {
                postListDiv.innerHTML = ''; // Clear existing list
                const ul = document.createElement('ul');
                posts.forEach(post => {
                    const li = document.createElement('li');
                    li.textContent = post.title; // Display post title.
                    li.dataset.postId = post.id; // Store post ID for later use
                    li.addEventListener('click', handlePostClick); // Attach click listener.
                    ul.appendChild(li);
                });
                postListDiv.appendChild(ul);
            }
        })
        .catch(error => {
            console.error('Error fetching posts:', error);
            const postListDiv = getElement('post-list');
            if (postListDiv) {
                postListDiv.innerHTML = '<p style="color: red;">Failed to load posts. Please ensure the server is running and accessible.</p>';
            }
        });
}
/**
 * Fetches and displays the details of a specific blog post in the #post-detail div.
 * @param {Event} event The click event object.
 */
function handlePostClick(event) {
    const postId = event.target.dataset.postId;
    fetch(`${API_BASE_URL}/posts/${postId}`) // GET request to retrieve a single blog post by its ID.
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`HTTP error! Status: ${response.status}, Message: ${text}`);
                });
            }
            return response.json();
        })
        .then(post => {
            const postDetailDiv = getElement('post-detail');
            if (postDetailDiv) {
                postDetailDiv.innerHTML = `
                    <h2>${post.title}</h2>
                    <p>By ${post.author} - ${post.date}</p>
                    <img src="${post.image}" alt="${post.title}" />
                    <p>${post.content}</p>
                    <button id="edit-post-btn">Edit</button>
                    <button id="delete-post-btn">Delete</button>
                `;
                // Store current post data for edit/delete operations
                postDetailDiv.dataset.currentPostId = post.id;

                // Attach event listeners for edit and delete buttons
                const editBtn = getElement('edit-post-btn');
                const deleteBtn = getElement('delete-post-btn');

                if (editBtn) editBtn.addEventListener('click', () => showEditForm(post));
                if (deleteBtn) deleteBtn.addEventListener('click', () => deletePost(post.id));
            }
        })
        .catch(error => {
            console.error('Error fetching post details:', error);
            const postDetailDiv = getElement('post-detail');
            if (postDetailDiv) {
                postDetailDiv.innerHTML = '<p style="color: red;">Failed to load post details.</p>';
            }
        });
}

/**
 * Sets up the event listener for the new post form and handles its submission,
 * including persisting the new post to the API.
 */
function addNewPostListener() {
    const newPostForm = getElement('new-post-form');
    if (!newPostForm) return; // Exit if form not found

    newPostForm.addEventListener('submit', (event) => { // Attach submit event listener.
        event.preventDefault(); // Prevent default form submission

        const titleInput = getElement('new-post-title');
        const authorInput = getElement('new-post-author');
        const imageInput = getElement('new-post-image');
        const contentInput = getElement('new-post-content');

        if (!titleInput || !authorInput || !imageInput || !contentInput) {
            console.error('Missing one or more new post form fields.');
            return;
        }

        const newPost = {
            title: titleInput.value,
            author: authorInput.value,
            image: imageInput.value,
            content: contentInput.value,
            date: new Date().toISOString().split('T')[0] // Add a current date
        };

        // Persist new post to the API using POST request.
        fetch(`${API_BASE_URL}/posts`, { // POST request to create a new blog post.
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newPost),
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`HTTP error! Status: ${response.status}, Message: ${text}`);
                });
            }
            return response.json();
        })
        .then(post => {
            // Add the newly created post to the DOM (now it has a real ID from the server)
            const postListDiv = getElement('post-list');
            const ul = postListDiv ? postListDiv.querySelector('ul') : null;

            if (ul) {
                const li = document.createElement('li');
                li.textContent = post.title;
                li.dataset.postId = post.id;
                li.addEventListener('click', handlePostClick);
                ul.appendChild(li);
            } else {
                // If <ul> doesn't exist, recreate it (or handle gracefully)
                console.warn('Post list <ul> not found, recreating.');
                displayPosts(); // Re-fetch and display all posts to rebuild list
            }

            newPostForm.reset(); // Clear the form
            alert('New post added and persisted!');
        })
        .catch(error => console.error('Error adding new post:', error));
    });
}

/**
 * Displays the edit form, pre-populating it with the current post's data.
 * @param {object} post The post object to be edited.
 */
function showEditForm(post) {
    const postDetailDiv = getElement('post-detail');
    const editPostForm = getElement('edit-post-form');

    if (!postDetailDiv || !editPostForm) return;

    // Hide post details and show edit form
    postDetailDiv.classList.add('hidden');
    editPostForm.classList.remove('hidden');

    // Populate the form with current post data
    const editTitleInput = getElement('edit-title');
    const editContentTextarea = getElement('edit-content');

    if (editTitleInput) editTitleInput.value = post.title;
    if (editContentTextarea) editContentTextarea.value = post.content;

    editPostForm.dataset.editingPostId = post.id; // Store the ID of the post being edited

    // Ensure only one submit listener is active
    editPostForm.removeEventListener('submit', handleEditFormSubmit);
    editPostForm.addEventListener('submit', handleEditFormSubmit);

    const cancelEditBtn = getElement('cancel-edit');
    if (cancelEditBtn) {
        cancelEditBtn.removeEventListener('click', cancelEdit);
        cancelEditBtn.addEventListener('click', cancelEdit);
    }
}

/**
 * Handles the submission of the edit form, sending a PATCH request to update the post.
 */
function handleEditFormSubmit(event) {
    event.preventDefault();

    const editPostForm = getElement('edit-post-form');
    if (!editPostForm) return;

    const postId = editPostForm.dataset.editingPostId;
    const newTitle = getElement('edit-title')?.value;
    const newContent = getElement('edit-content')?.value;

    if (!postId || !newTitle || !newContent) {
        console.error('Missing post ID or new title/content for edit.');
        return;
    }

    const updatedData = {
        title: newTitle,
        content: newContent
    };

    // Persist updates to a post's title and content by making a PATCH request to the API.
    fetch(`${API_BASE_URL}/posts/${postId}`, { // PATCH request to update an existing blog post.
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(`HTTP error! Status: ${response.status}, Message: ${text}`);
            });
        }
        return response.json();
    })
    .then(updatedPost => {
        // Update the DOM for #post-detail
        const postDetailDiv = getElement('post-detail');
        if (postDetailDiv) {
            const h2 = postDetailDiv.querySelector('h2');
            const contentParagraph = postDetailDiv.querySelector('p:last-of-type'); // Assuming content is the last paragraph

            if (h2) h2.textContent = updatedPost.title;
            if (contentParagraph) contentParagraph.textContent = updatedPost.content;
        }

        // Update the DOM for #post-list
        const postListItems = document.querySelectorAll('#post-list li');
        postListItems.forEach(item => {
            if (item.dataset.postId == updatedPost.id) {
                item.textContent = updatedPost.title;
            }
        });

        // Hide edit form and show post details
        editPostForm.classList.add('hidden');
        if (postDetailDiv) postDetailDiv.classList.remove('hidden');
        alert('Post updated and persisted!');
    })
    .catch(error => console.error('Error updating post:', error));
}

/**
 * Hides the edit form and shows the post details.
 */
function cancelEdit() {
    const editPostForm = getElement('edit-post-form');
    const postDetailDiv = getElement('post-detail');
    if (editPostForm) editPostForm.classList.add('hidden');
    if (postDetailDiv) postDetailDiv.classList.remove('hidden');
}

/**
 * Deletes a post from the API and updates the DOM.
 * @param {number} postId The ID of the post to be deleted.
 */
function deletePost(postId) {
    // Persist any post deletions by making a DELETE request to the API.
    fetch(`${API_BASE_URL}/posts/${postId}`, { // DELETE request to delete a blog post.
        method: 'DELETE',
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(`HTTP error! Status: ${response.status}, Message: ${text}`);
            });
        }
        return response; // No need to parse JSON for DELETE
    })
    .then(() => {
        // Remove from #post-list
        const postListItems = document.querySelectorAll('#post-list li');
        postListItems.forEach(item => {
            if (item.dataset.postId == postId) {
                item.remove();
            }
        });

        // Clear or display default message in #post-detail
        const postDetailDiv = getElement('post-detail');
        if (postDetailDiv && postDetailDiv.dataset.currentPostId == postId) {
            postDetailDiv.innerHTML = '<p>Post deleted. Nothing selected yet.</p>';
            postDetailDiv.removeAttribute('data-current-post-id');
        }
        alert('Post deleted and persisted!');
    })
    .catch(error => console.error('Error deleting post:', error));
}

/**
 * Fetches and displays the details for the first post as soon as the page loads.
 */
function displayFirstPostDetails() {
    fetch(`${API_BASE_URL}/posts`)
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`HTTP error! Status: ${response.status}, Message: ${text}`);
                });
            }
            return response.json();
        })
        .then(posts => {
            const postDetailDiv = getElement('post-detail');
            if (postDetailDiv) {
                if (posts.length > 0) {
                    const firstPost = posts[0];
                    postDetailDiv.innerHTML = `
                        <h2>${firstPost.title}</h2>
                        <p>By ${firstPost.author} - ${firstPost.date}</p>
                        <img src="${firstPost.image}" alt="${firstPost.title}" />
                        <p>${firstPost.content}</p>
                        <button id="edit-post-btn">Edit</button>
                        <button id="delete-post-btn">Delete</button>
                    `;
                    postDetailDiv.dataset.currentPostId = firstPost.id;

                    const editBtn = getElement('edit-post-btn');
                    const deleteBtn = getElement('delete-post-btn');

                    if (editBtn) editBtn.addEventListener('click', () => showEditForm(firstPost));
                    if (deleteBtn) deleteBtn.addEventListener('click', () => deletePost(firstPost.id));
                } else {
                    postDetailDiv.innerHTML = '<p>No posts available.</p>';
                }
            }
        })
        .catch(error => {
            console.error('Error fetching first post details:', error);
            const postDetailDiv = getElement('post-detail');
            if (postDetailDiv) {
                postDetailDiv.innerHTML = '<p style="color: red;">Failed to load initial post details.</p>';
            }
        });
}

/**
 * Main function to initialize the application logic after the DOM is loaded.
 */
function main() { // Program should have a main() function.
    displayPosts(); // Invoke displayPosts.
    displayFirstPostDetails(); // Display details of the first post on load.
    addNewPostListener(); // Invoke addNewPostListener.
}

// Run the main function once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', main);
