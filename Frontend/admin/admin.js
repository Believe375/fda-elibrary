document.addEventListener('DOMContentLoaded', () => {
  const dashboardStats = {
    totalBooks: document.getElementById('totalBooks'),
    categories: document.getElementById('totalCategories'),
    users: document.getElementById('totalUsers')
  };

  const bookTableBody = document.getElementById('bookTableBody');

  // Check Netlify Identity for admin
  const user = netlifyIdentity.currentUser();
  if (!user || !user.app_metadata || user.app_metadata.role !== 'admin') {
    alert('Access denied. Admins only.');
    window.location.href = '/';
    return;
  }

  // Fetch all books from backend
  async function fetchBooks() {
    try {
      const res = await fetch('/api/books');
      const books = await res.json();
      renderBookTable(books);
      updateStats(books);
    } catch (err) {
      console.error('Error loading books:', err);
    }
  }

  // Render books in the table
  function renderBookTable(books) {
    bookTableBody.innerHTML = '';

    books.forEach((book, index) => {
      const row = document.createElement('tr');

      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${book.title}</td>
        <td>${book.author || 'N/A'}</td>
        <td>${book.category}</td>
        <td>${book.year}</td>
        <td>
          <a href="${book.fileUrl}" target="_blank">View</a> |
          <button class="delete-btn" data-id="${book._id}">Delete</button>
        </td>
      `;

      bookTableBody.appendChild(row);
    });

    // Attach delete events
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        if (confirm('Are you sure you want to delete this book?')) {
          await deleteBook(id);
        }
      });
    });
  }

  // Update dashboard stats
  function updateStats(books) {
    dashboardStats.totalBooks.textContent = books.length;
    const uniqueCategories = [...new Set(books.map(book => book.category))];
    dashboardStats.categories.textContent = uniqueCategories.length;
    dashboardStats.users.textContent = 'Admin Only';
  }

  // Delete book
  async function deleteBook(id) {
    try {
      const token = await netlifyIdentity.currentUser().jwt();
      const res = await fetch(`/api/books/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        fetchBooks();
      } else {
        alert('Failed to delete book.');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  }

  // Initial load
  fetchBooks();
});