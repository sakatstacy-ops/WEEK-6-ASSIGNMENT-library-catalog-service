import { useEffect, useState } from 'react';
import { api } from '../../api';

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString(undefined, { timeZone: 'UTC' }) : '—';
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/bookings')
      .then(({ bookings: currentBookings }) => setBookings(currentBookings))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="state-message" role="status">Loading space bookings…</p>;
  }

  return (
    <section className="table-card">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Librarian tools</p>
          <h1>Space bookings</h1>
        </div>
      </div>
      {error && <p className="notice error" role="alert">{error}</p>}
      {!error && bookings.length === 0 ? (
        <p className="empty-state">There are no space bookings yet.</p>
      ) : !error && (
        <div className="table-scroll">
          <table>
            <thead>
              <tr><th>Space</th><th>Patron</th><th>Date</th><th>Start</th><th>End</th></tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id}>
                  <td><strong>{booking.space?.name || 'Space unavailable'}</strong></td>
                  <td>{booking.user?.username || 'Account unavailable'}</td>
                  <td>{formatDate(booking.date)}</td>
                  <td>{booking.startTime}</td>
                  <td>{booking.endTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
