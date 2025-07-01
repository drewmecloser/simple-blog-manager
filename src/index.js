const API_BASE_URL = 'https://blog-api-server-awms.onrender.com';


function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.error(`Error: DOM element with ID '${id}' not found.`);
    }
    return element;
}


function displayPosts() {
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
            const postListDiv = getElement('post-list');
            if (postListDiv) {
                postListDiv.innerHTML = ''; 
                const ul = document.createElement('ul');
                posts.forEach(post => {
                    const li = document.createElement('li');
                    li.textContent = post.title;
                    li.dataset.postId = post.id;
                    li.addEventListener('click', handlePostClick);
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


function handlePostClick(event) {
    const postId = event.target.dataset.postId;
    fetch(`${API_BASE_URL}/posts/${postId}`)
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
                
                postDetailDiv.dataset.currentPostId = post.id;

                
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


function addNewPostListener() {
    const newPostForm = getElement('new-post-form');
    if (!newPostForm) return; 
    newPostForm.addEventListener('submit', (event) => {
        event.preventDefault(); 

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
            date: new Date().toISOString().split('T')[0] 
        };

        
        fetch(`${API_BASE_URL}/posts`, {
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
            
            const postListDiv = getElement('post-list');
            const ul = postListDiv ? postListDiv.querySelector('ul') : null;

            if (ul) {
                const li = document.createElement('li');
                li.textContent = post.title;
                li.dataset.postId = post.id;
                li.addEventListener('click', handlePostClick);
                ul.appendChild(li);
            } else {
                
                console.warn('Post list <ul> not found, recreating.');
                displayPosts();
            }

            newPostForm.reset();
            alert('New post added and persisted!');
        })
        .catch(error => console.error('Error adding new post:', error));
    });
}


function showEditForm(post) {
    const postDetailDiv = getElement('post-detail');
    const editPostForm = getElement('edit-post-form');

    if (!postDetailDiv || !editPostForm) return;

    
    postDetailDiv.classList.add('hidden');
    editPostForm.classList.remove('hidden');

    
    const editTitleInput = getElement('edit-title');
    const editContentTextarea = getElement('edit-content');

    if (editTitleInput) editTitleInput.value = post.title;
    if (editContentTextarea) editContentTextarea.value = post.content;

    editPostForm.dataset.editingPostId = post.id; 

    
    editPostForm.removeEventListener('submit', handleEditFormSubmit);
    editPostForm.addEventListener('submit', handleEditFormSubmit);

    const cancelEditBtn = getElement('cancel-edit');
    if (cancelEditBtn) {
        cancelEditBtn.removeEventListener('click', cancelEdit);
        cancelEditBtn.addEventListener('click', cancelEdit);
    }
}


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

    
    fetch(`${API_BASE_URL}/posts/${postId}`, {
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
        
        const postDetailDiv = getElement('post-detail');
        if (postDetailDiv) {
            const h2 = postDetailDiv.querySelector('h2');
            const contentParagraph = postDetailDiv.querySelector('p:last-of-type'); 

            if (h2) h2.textContent = updatedPost.title;
            if (contentParagraph) contentParagraph.textContent = updatedPost.content;
        }

        
        const postListItems = document.querySelectorAll('#post-list li');
        postListItems.forEach(item => {
            if (item.dataset.postId == updatedPost.id) {
                item.textContent = updatedPost.title;
            }
        });

       
        editPostForm.classList.add('hidden');
        if (postDetailDiv) postDetailDiv.classList.remove('hidden');
        alert('Post updated and persisted!');
    })
    .catch(error => console.error('Error updating post:', error));
}


function cancelEdit() {
    const editPostForm = getElement('edit-post-form');
    const postDetailDiv = getElement('post-detail');
    if (editPostForm) editPostForm.classList.add('hidden');
    if (postDetailDiv) postDetailDiv.classList.remove('hidden');
}


function deletePost(postId) {
    
    fetch(`${API_BASE_URL}/posts/${postId}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(`HTTP error! Status: ${response.status}, Message: ${text}`);
            });
        }
        return response;
    })
    .then(() => {
        
        const postListItems = document.querySelectorAll('#post-list li');
        postListItems.forEach(item => {
            if (item.dataset.postId == postId) {
                item.remove();
            }
        });

        
        const postDetailDiv = getElement('post-detail');
        if (postDetailDiv && postDetailDiv.dataset.currentPostId == postId) {
            postDetailDiv.innerHTML = '<p>Post deleted. Nothing selected yet.</p>';
            postDetailDiv.removeAttribute('data-current-post-id');
        }
        alert('Post deleted and persisted!');
    })
    .catch(error => console.error('Error deleting post:', error));
}


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


function main() {
    displayPosts();
    displayFirstPostDetails();
    addNewPostListener();
}


document.addEventListener('DOMContentLoaded', main);