import { useEffect, useState } from 'react';
import { api } from '../../api';

const statuses = ['pending', 'approved', 'late', 'returned'];

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : '—';
}

export default function AdminBorrowRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function loadRequests() {
    setError('');
    const result = await api('/borrow-requests');
    setRequests(result.borrowRequests);
  }

  useEffect(() => {
    loadRequests()
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  async function updateStatus(request, status) {
    setError('');
    setNotice('');
    setUpdatingId(request._id);
    try {
      const result = await api(`/borrow-requests/${request._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setRequests((current) => current.map((item) => (
        item._id === request._id ? result.borrowRequest : item
      )));
      setNotice(`Status updated for “${request.book?.title || 'book'}”.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setUpdatingId('');
    }
  }

  if (loading) {
    return <p className="state-message" role="status">Loading borrow requests…</p>;
  }

  return (
    <section className="table-card">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Librarian tools</p>
          <h1>Borrow requests</h1>
        </div>
      </div>
      {error && <p className="notice error" role="alert">{error}</p>}
      {notice && <p className="notice success" role="status">{notice}</p>}
      {!error && requests.length === 0 ? (
        <p className="empty-state">There are no borrow requests yet.</p>
      ) : !error && (
        <div className="table-scroll">
          <table>
            <thead>
              <tr><th>Book</th><th>Patron</th><th>Requested</th><th>Due</th><th>Status</th><th>Returned</th><th>Fine</th></tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request._id}>
                  <td><strong>{request.book?.title || 'Book removed'}</strong><span className="table-subtext">{request.book?.author}</span></td>
                  <td>{request.user?.username || 'Account unavailable'}</td>
                  <td>{formatDate(request.requestedAt)}</td>
                  <td>{formatDate(request.dueAt)}</td>
                  <td>
                    <select
                      aria-label={`Status for ${request.book?.title || 'borrow request'}`}
                      disabled={updatingId === request._id}
                      onChange={(event) => updateStatus(request, event.target.value)}
                      value={request.status}
                    >
                      {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </td>
                  <td>{formatDate(request.returnedAt)}</td>
                  <td>${Number(request.fine).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
