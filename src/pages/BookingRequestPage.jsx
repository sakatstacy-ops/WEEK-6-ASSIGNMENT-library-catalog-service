import { useEffect, useState } from 'react';
import { api } from '../api';

function today() {
  const date = new Date();
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
  return localDate.toISOString().slice(0, 10);
}

export default function BookingRequestPage() {
  const [spaces, setSpaces] = useState([]);
  const [form, setForm] = useState({ space: '', date: today(), startTime: '09:00', endTime: '10:00' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    api('/spaces')
      .then(({ spaces: availableSpaces }) => {
        setSpaces(availableSpaces);
        setForm((current) => ({ ...current, space: availableSpaces[0]?._id || '' }));
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    setSaving(true);
    try {
      const { booking } = await api('/bookings', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setNotice(`Booking confirmed for ${booking.space.name} on ${form.date}.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="state-message" role="status">Loading bookable spaces…</p>;
  }

  return (
    <section className="form-card">
      <p className="eyebrow">Reserve a library space</p>
      <h1>Book a room</h1>
      <p className="muted">Bookings are checked against existing reservations on the server.</p>
      {error && <p className="notice error" role="alert">{error}</p>}
      {notice && <p className="notice success" role="status">{notice}</p>}
      {!error && spaces.length === 0 ? (
        <p className="empty-state">No bookable spaces are currently available.</p>
      ) : !error && (
        <form className="stack" onSubmit={submit}>
          <label>
            Space
            <select name="space" onChange={updateField} required value={form.space}>
              {spaces.map((space) => <option key={space._id} value={space._id}>{space.name}</option>)}
            </select>
          </label>
          <label>
            Date
            <input min={today()} name="date" onChange={updateField} required type="date" value={form.date} />
          </label>
          <div className="form-grid">
            <label>
              Start time
              <input name="startTime" onChange={updateField} required type="time" value={form.startTime} />
            </label>
            <label>
              End time
              <input name="endTime" onChange={updateField} required type="time" value={form.endTime} />
            </label>
          </div>
          <button className="primary-button" disabled={saving} type="submit">
            {saving ? 'Checking availability…' : 'Reserve space'}
          </button>
        </form>
      )}
    </section>
  );
}
