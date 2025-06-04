// FDA Admin Dashboard Scripts

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('You must be logged in as an admin to access this page.');
    window.location.href = '../index.html';
    return;
  }

  fetchBooks();
  fetchStats();

  document.getElementById('uploadForm').addEventListener('submit', handleUpload);
});

function fetchBooks() {
  fetch('/api/books')
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById('adminBookList');
      list.innerHTML = '';
      data.forEach(book => {
        const item = document.createElement('div');
        item.className = 'archive-item';
        item.innerHTML = `
          <span>${book.title} (${book.year}) - ${book.category}</span>
          <button onclick="deleteBook('${book._id}')">Delete</button>
        `;
        list.appendChild(item);
      });
    })
    .catch(err => console.error('Fetch books error:', err));
}

function fetchStats() {
  fetch('/api/books')
    .then(res => res.json())
    .then(data => {
      const totalBooks = data.length;
      const categories = [...new Set(data.map(b => b.category))];
      document.getElementById('totalBooks').textContent = totalBooks;
      document.getElementById('totalCategories').textContent = categories.length;
    });
}

function handleUpload(e) {
  e.preventDefault();
  const form = document.getElementById('uploadForm');
  const formData = new FormData();
  formData.append('title', form.title.value);
  formData.append('author', form.author.value);
  formData.append('year', form.year.value);
  formData.append('category', form.category.value);
  formData.append('file', form.file.files[0]);

  fetch('/api/books', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById('uploadStatus').textContent = 'Upload successful!';
      form.reset();
      fetchBooks();
    })
    .catch(err => {
      document.getElementById('uploadStatus').textContent = 'Upload failed.';
      console.error(err);
    });
}

function deleteBook(id) {
  if (!confirm('Are you sure you want to delete this book?')) return;

  fetch(`/api/books/${id}`, {
    method: 'DELETE',
    headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
  })
    .then(res => res.json())
    .then(() => fetchBooks())
    .catch(err => console.error(err));
}

function logout() {
  localStorage.removeItem('token');
  window.location.href = '../index.html';
}