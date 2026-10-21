import { useEffect, useState } from 'react';
import { api } from '../../api';

const emptyForm = {
  title: '',
  author: '',
  isbn: '',
  description: '',
  coverImage: '',
  totalCopies: 1,
  availableCopies: 1,
  genre: '',
};

export default function AdminBooksPage() {
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function loadData() {
    setError('');
    const [bookResult, genreResult] = await Promise.all([
      api('/books'),
      api('/books/genres'),
    ]);
    setBooks(bookResult.books);
    setGenres(genreResult.genres);
  }

  useEffect(() => {
    loadData()
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  function updateField(event) {
    const value = ['totalCopies', 'availableCopies'].includes(event.target.name)
      ? Number(event.target.value)
      : event.target.value;
    setForm((current) => ({ ...current, [event.target.name]: value }));
  }

  function editBook(book) {
    setEditingId(book._id);
    setForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      description: book.description,
      coverImage: book.coverImage,
      totalCopies: book.totalCopies,
      availableCopies: book.availableCopies,
      genre: book.genre?._id || '',
    });
    setError('');
    setNotice('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setEditingId('');
    setForm({ ...emptyForm, genre: genres[0]?._id || '' });
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    setSaving(true);
    try {
      await api(editingId ? `/books/${editingId}` : '/books', {
        method: editingId ? 'PATCH' : 'POST',
        body: JSON.stringify(form),
      });
      setNotice(editingId ? 'Book changes saved.' : 'Book added to the catalog.');
      resetForm();
      await loadData();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteBook(book) {
    if (!window.confirm(`Delete “${book.title}” from the catalog?`)) {
      return;
    }
    setError('');
    setNotice('');
    setPendingDelete(book._id);
    try {
      await api(`/books/${book._id}`, { method: 'DELETE' });
      if (editingId === book._id) {
        resetForm();
      }
      await loadData();
      setNotice('Book deleted from the catalog.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setPendingDelete('');
    }
  }

  if (loading) {
    return <p className="state-message" role="status">Loading books…</p>;
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Librarian tools</p>
          <h1>Manage books</h1>
        </div>
      </div>
      <section className="form-card admin-form">
        <h2>{editingId ? 'Edit book' : 'Add a book'}</h2>
        <form className="stack" onSubmit={submit}>
          <div className="form-grid">
            <label>
              Title
              <input name="title" onChange={updateField} required value={form.title} />
            </label>
            <label>
              Author
              <input name="author" onChange={updateField} required value={form.author} />
            </label>
            <label>
              ISBN
              <input name="isbn" onChange={updateField} required value={form.isbn} />
            </label>
            <label>
              Genre
              <select name="genre" onChange={updateField} required value={form.genre}>
                <option value="">Choose a genre</option>
                {genres.map((genre) => <option key={genre._id} value={genre._id}>{genre.name}</option>)}
              </select>
            </label>
            <label>
              Total copies
              <input min="1" name="totalCopies" onChange={updateField} required type="number" value={form.totalCopies} />
            </label>
            <label>
              Available copies
              <input
                min="0"
                name="availableCopies"
                onChange={updateField}
                required
                type="number"
                value={form.availableCopies}
              />
            </label>
            <label className="wide-field">
              Cover image URL
              <input name="coverImage" onChange={updateField} required type="url" value={form.coverImage} />
            </label>
            <label className="wide-field">
              Description
              <textarea name="description" onChange={updateField} required rows="3" value={form.description} />
            </label>
          </div>
          {error && <p className="notice error" role="alert">{error}</p>}
          {notice && <p className="notice success" role="status">{notice}</p>}
          <div className="button-row">
            <button className="primary-button" disabled={saving || genres.length === 0} type="submit">
              {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add book'}
            </button>
            {editingId && <button className="secondary-button" onClick={resetForm} type="button">Cancel edit</button>}
          </div>
        </form>
      </section>

      <section className="table-card">
        <h2>Catalog</h2>
        {!error && books.length === 0 ? (
          <p className="empty-state">No books have been added yet.</p>
        ) : !error && (
          <div className="table-scroll">
            <table>
              <thead>
                <tr><th>Book</th><th>ISBN</th><th>Genre</th><th>Copies</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book._id}>
                    <td><strong>{book.title}</strong><span className="table-subtext">{book.author}</span></td>
                    <td>{book.isbn}</td>
                    <td>{book.genre?.name || '—'}</td>
                    <td>{book.availableCopies} / {book.totalCopies}</td>
                    <td>
                      <div className="button-row">
                        <button className="text-button" onClick={() => editBook(book)} type="button">Edit</button>
                        <button
                          className="text-button danger-text"
                          disabled={pendingDelete === book._id}
                          onClick={() => deleteBook(book)}
                          type="button"
                        >
                          {pendingDelete === book._id ? 'Deleting…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
