const usersList = document.getElementById('users-list');
const postsList = document.getElementById('posts-list');
const commentsList = document.getElementById('comments-list');
const commentForm = document.getElementById('comment-form');
const commentName = document.getElementById('comment-name');
const commentBody = document.getElementById('comment-body');

let users = [];
let currentUserId = null;
let posts = [];
let currentPostId = null;
let comments = [];

function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function renderUsers() {
    usersList.innerHTML = '';
    if (!users.length) {
        usersList.innerHTML = '<li class="loader">Загрузка авторов...</li>';
        return;
    }
    users.forEach(user => {
        const li = document.createElement('li');
        li.className = 'user-item';
        if (currentUserId === user.id) li.classList.add('active');
        li.textContent = user.name;
        li.dataset.userId = user.id;
        usersList.appendChild(li);
    });
}

function renderPosts() {
    postsList.innerHTML = '';
    if (!currentUserId) {
        postsList.innerHTML = '<li class="loader">Выберите автора</li>';
        return;
    }
    if (!posts.length) {
        postsList.innerHTML = '<li class="loader">Нет постов у этого автора</li>';
        return;
    }
    posts.forEach(post => {
        const li = document.createElement('li');
        li.className = 'post-item';
        if (currentPostId === post.id) li.classList.add('active');
        li.textContent = post.title;
        li.dataset.postId = post.id;
        postsList.appendChild(li);
    });
}

function renderComments() {
    commentsList.innerHTML = '';
    if (!currentPostId) {
        commentsList.innerHTML = '<li class="loader">Выберите пост</li>';
        return;
    }
    if (!comments.length) {
        commentsList.innerHTML = '<li class="loader">Нет комментариев</li>';
        return;
    }
    comments.forEach(comment => {
        const li = document.createElement('li');
        li.className = 'comment-item';
        li.innerHTML = `<strong>${escapeHtml(comment.name)}</strong>: ${escapeHtml(comment.body)}`;
        commentsList.appendChild(li);
    });
}

async function fetchUsers() {
    try {
        const res = await fetch('https://jsonplaceholder.typicode.com/users');
        if (!res.ok) throw new Error('Ошибка загрузки пользователей');
        users = await res.json();
        renderUsers();
        if (users.length) {
            currentUserId = users[0].id;
            renderUsers();
            await loadPosts(currentUserId);
        }
    } catch (err) {
        usersList.innerHTML = `<li class="error">${err.message}</li>`;
    }
}

async function loadPosts(userId) {
    try {
        postsList.innerHTML = '<li class="loader">Загрузка постов...</li>';
        const res = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`);
        if (!res.ok) throw new Error('Ошибка загрузки постов');
        posts = await res.json();
        renderPosts();
        if (posts.length) {
            currentPostId = posts[0].id;
            renderPosts();
            await loadComments(currentPostId);
        } else {
            commentsList.innerHTML = '<li class="loader">Нет комментариев</li>';
        }
    } catch (err) {
        postsList.innerHTML = `<li class="error">${err.message}</li>`;
    }
}

async function loadComments(postId) {
    try {
        commentsList.innerHTML = '<li class="loader">Загрузка комментариев...</li>';
        const res = await fetch(`https://jsonplaceholder.typicode.com/comments?postId=${postId}`);
        if (!res.ok) throw new Error('Ошибка загрузки комментариев');
        comments = await res.json();
        renderComments();
    } catch (err) {
        commentsList.innerHTML = `<li class="error">${err.message}</li>`;
    }
}

async function addComment(name, body) {
    try {
        const res = await fetch('https://jsonplaceholder.typicode.com/comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, body, postId: currentPostId })
        });
        if (!res.ok) throw new Error('Ошибка при добавлении комментария');
        const newComment = await res.json();
        comments.push(newComment);
        renderComments();
    } catch (err) {
        alert('Не удалось добавить комментарий');
    }
}

usersList.addEventListener('click', async (e) => {
    const li = e.target.closest('.user-item');
    if (!li) return;
    const userId = Number(li.dataset.userId);
    if (userId === currentUserId) return;
    currentUserId = userId;
    renderUsers();
    await loadPosts(userId);
});

postsList.addEventListener('click', async (e) => {
    const li = e.target.closest('.post-item');
    if (!li) return;
    const postId = Number(li.dataset.postId);
    if (postId === currentPostId) return;
    currentPostId = postId;
    renderPosts();
    await loadComments(postId);
});

commentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = commentName.value.trim();
    const body = commentBody.value.trim();
    if (!name || !body) return;
    await addComment(name, body);
    commentName.value = '';
    commentBody.value = '';
});

fetchUsers();
