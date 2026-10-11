import { useEffect, useState } from 'react';
import { api } from './api';

const Leaf = () => (
  <svg className="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15" /><path d="M5 19c3-5 6-8 10-10" /></svg>
);
const Drop = () => (
  <svg className="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11z" /></svg>
);

function Auth({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const submit = async e => {
    e.preventDefault();
    try {
      const d = await api(`/auth/${mode}`, 'POST', f);
      localStorage.setItem('token', d.token); localStorage.setItem('name', d.user.name); onAuth();
    } catch (e) { setErr(e.message); }
  };
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const login = mode === 'login';
  return (
    <div className="auth-page">
      <aside className="auth-aside">
        <div className="brand"><Leaf /> PlantNest</div>
        <div>
          <h2>Know which plant is thirsty before it tells you.</h2>
          <p>Add your plants, set how often they drink, and PlantNest keeps count. You also get an email at 8 AM on watering days.</p>
        </div>
        <svg className="bigleaf" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15" /><path d="M5 19c3-5 6-8 10-10M9 15c1-3 3-5 6-6M7 17c0-1 1-3 2-4" /></svg>
      </aside>
      <main className="auth-main">
        <form className="auth" onSubmit={submit}>
          <h1>{login ? 'Welcome back' : 'Create your account'}</h1>
          {!login && <label>Name<input autoComplete="name" required onChange={set('name')} /></label>}
          <label>Email<input type="email" autoComplete="email" required onChange={set('email')} /></label>
          <label>Password<input type="password" autoComplete={login ? 'current-password' : 'new-password'} required onChange={set('password')} /></label>
          {err && <p className="err" role="alert">{err}</p>}
          <button type="submit">{login ? 'Log in' : 'Create account'}</button>
          <span className="switch">
            {login ? 'New here? ' : 'Already have an account? '}
            <button type="button" className="link" onClick={() => { setErr(''); setMode(login ? 'register' : 'login'); }}>
              {login ? 'Create an account' : 'Log in'}
            </button>
          </span>
        </form>
      </main>
    </div>
  );
}

const daysLeft = d => Math.ceil((new Date(d) - Date.now()) / 86400000);
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;

function Dashboard({ onLogout }) {
  const [plants, setPlants] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [f, setF] = useState({ name: '', species: '', location: '', wateringEveryDays: 7 });
  const load = () => api('/plants').then(d => { setPlants(d); setLoaded(true); });
  useEffect(() => { load(); }, []);
  const add = async e => { e.preventDefault(); if (!f.name) return; await api('/plants', 'POST', f); setF({ ...f, name: '', species: '', location: '' }); load(); };
  const water = async id => { await api(`/plants/${id}/water`, 'POST'); load(); };
  const del = async id => { await api(`/plants/${id}`, 'DELETE'); load(); };
  const sorted = [...plants].sort((a, b) => new Date(a.nextWatering) - new Date(b.nextWatering));
  const due = sorted.filter(p => daysLeft(p.nextWatering) <= 0);
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
  const field = k => ({ value: f[k], onChange: e => setF({ ...f, [k]: e.target.value }) });

  return (
    <div className="wrap">
      <section className="hero">
        <header>
          <div className="brand"><Leaf /> PlantNest</div>
          <button className="on-dark" onClick={onLogout}>Log out</button>
        </header>
        <p className="date">{today}</p>
        <h1>Hi {localStorage.getItem('name')}</h1>
        <p className="summary" role="status">
          {!loaded ? 'Checking on your plants…'
            : !plants.length ? 'Add your first plant to start tracking.'
            : due.length ? `${plural(plants.length, 'plant')}, ${due.length} thirsty today.`
            : `${plural(plants.length, 'plant')}, all watered. Nothing needs you today.`}
        </p>
        {due.length > 0 && <div className="chips">{due.map(p => <span className="chip" key={p._id}><Drop /> {p.name}</span>)}</div>}
      </section>

      <form className="card form" onSubmit={add}>
        <h2>Add a plant</h2>
        <label>Plant name<input required {...field('name')} /></label>
        <label>Species<input {...field('species')} /></label>
        <label>Location<input {...field('location')} /></label>
        <label>Water every (days)<input type="number" min="1" value={f.wateringEveryDays} onChange={e => setF({ ...f, wateringEveryDays: +e.target.value })} /></label>
        <button type="submit">Add plant</button>
      </form>

      <div className="grid">
        {loaded && !plants.length && <div className="empty"><strong>No plants yet</strong>Fill in the form above and your first plant will show up here.</div>}
        {sorted.map((p, i) => {
          const d = daysLeft(p.nextWatering);
          const level = Math.max(0, Math.min(1, d / (p.wateringEveryDays || 1)));
          return (
            <article key={p._id} className={'card plant' + (d <= 0 ? ' due' : '')} style={{ '--level': level, '--i': i }}>
              {d > 0 && <div className="fill" aria-hidden="true" />}
              <div className="body">
                <h3>{p.name}</h3>
                {(p.species || p.location) && <p className="meta">{[p.species, p.location].filter(Boolean).join(', ')}</p>}
                <p className="status">{d <= 0 ? <><Drop /> Water now</> : `Water in ${plural(d, 'day')}`}</p>
                <p className="cycle">Every {plural(p.wateringEveryDays, 'day')}</p>
                <div className="row">
                  <button onClick={() => water(p._id)}><Drop /> Watered</button>
                  <button className="ghost" onClick={() => del(p._id)}>Delete</button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  const [authed, setAuthed] = useState(!!localStorage.getItem('token'));
  return authed ? <Dashboard onLogout={() => { localStorage.clear(); setAuthed(false); }} /> : <Auth onAuth={() => setAuthed(true)} />;
}
