import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Loader2, Clock, Sliders, User, Key, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ── Threshold editor ──────────────────────────────────────────────────────────
const ThresholdInput = ({ label, field, value, onChange, unit, icon }) => (
  <div className="grid grid-cols-3 gap-2 items-center">
    <label className="text-xs text-gray-400 font-medium col-span-1">{icon} {label}</label>
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-gray-500 w-6">Min</span>
      <input type="number" step="0.1" value={value.min ?? ''}
        onChange={(e) => onChange(field, 'min', parseFloat(e.target.value))}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-100 font-mono focus:outline-none focus:border-aqua-500/60 transition-all" />
      <span className="text-[10px] text-gray-500">{unit}</span>
    </div>
    {value.max !== undefined ? (
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-gray-500 w-6">Max</span>
        <input type="number" step="0.1" value={value.max ?? ''}
          onChange={(e) => onChange(field, 'max', parseFloat(e.target.value))}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-100 font-mono focus:outline-none focus:border-aqua-500/60 transition-all" />
        <span className="text-[10px] text-gray-500">{unit}</span>
      </div>
    ) : <div />}
  </div>
);

const ThresholdsSection = ({ isAdmin }) => {
  const [thresholds, setThresholds] = useState({ waterTemperature: { min: 18, max: 28 }, roomTemperature: { min: 15, max: 35 }, humidity: { min: 40, max: 80 }, waterLevel: { min: 20 }, gasSensor: { max: 1000 } });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    axios.get(`${API_BASE}/settings/thresholds`).then((r) => setThresholds(r.data.data)).catch(() => {});
  }, []);

  const handleChange = (field, key, val) => {
    setThresholds((prev) => ({ ...prev, [field]: { ...prev[field], [key]: val } }));
  };

  const handleSave = async () => {
    if (!isAdmin) return;
    setSaving(true);
    try {
      await axios.put(`${API_BASE}/settings/thresholds`, thresholds);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) { alert(e.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const fields = [
    { label: 'Water Temp', field: 'waterTemperature', unit: '°C', icon: '💧' },
    { label: 'Room Temp', field: 'roomTemperature', unit: '°C', icon: '🌡️' },
    { label: 'Humidity', field: 'humidity', unit: '%', icon: '💦' },
    { label: 'Water Level', field: 'waterLevel', unit: '%', icon: '🪣' },
    { label: 'Gas Sensor', field: 'gasSensor', unit: 'ppm', icon: '💨' },
  ];

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-aqua-400" />
          <h3 className="text-sm font-semibold text-gray-200">Alert Thresholds</h3>
        </div>
        {!isAdmin && <span className="badge bg-gray-800 text-gray-500 text-xs">View only</span>}
      </div>
      <div className="space-y-3">
        {fields.map((f) => (
          <ThresholdInput key={f.field} {...f} value={thresholds[f.field] || {}} onChange={handleChange} />
        ))}
      </div>
      {isAdmin && (
        <button onClick={handleSave} disabled={saving}
          className={`btn mt-5 w-full justify-center ${saved ? 'bg-aqua-800 text-aqua-300' : 'btn-primary'} disabled:opacity-50`}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Saved!' : 'Save Thresholds'}
        </button>
      )}
    </div>
  );
};

// ── Schedule editor ───────────────────────────────────────────────────────────
const DEVICE_KEYS = ['led', 'waterPump', 'aerator', 'feeder', 'buzzer'];
const CRON_PRESETS = [
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Every 6h', value: '0 */6 * * *' },
  { label: 'Daily 8am', value: '0 8 * * *' },
  { label: 'Daily 8pm', value: '0 20 * * *' },
  { label: 'Every 30m', value: '*/30 * * * *' },
];

const SchedulesSection = ({ isAdmin }) => {
  const [schedules, setSchedules] = useState([]);
  const [form, setForm] = useState({ deviceKey: 'led', label: '', cronExpr: '0 8 * * *', action: 'on', enabled: true });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchSchedules = () => axios.get(`${API_BASE}/settings/schedules`).then((r) => setSchedules(r.data.data)).catch(() => {});
  useEffect(() => { fetchSchedules(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/settings/schedules`, form);
      await fetchSchedules();
      setForm({ deviceKey: 'led', label: '', cronExpr: '0 8 * * *', action: 'on', enabled: true });
      setShowForm(false);
    } catch (e) { alert(e.response?.data?.message || 'Create failed'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this schedule?')) return;
    await axios.delete(`${API_BASE}/settings/schedules/${id}`);
    fetchSchedules();
  };

  const handleToggle = async (s) => {
    await axios.put(`${API_BASE}/settings/schedules/${s._id}`, { enabled: !s.enabled });
    fetchSchedules();
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-aqua-400" />
          <h3 className="text-sm font-semibold text-gray-200">Device Schedules</h3>
        </div>
        {isAdmin && (
          <button onClick={() => setShowForm((v) => !v)} className="btn-secondary text-xs gap-1">
            <Plus className="w-3.5 h-3.5" /> New
          </button>
        )}
      </div>

      {showForm && isAdmin && (
        <form onSubmit={handleCreate} className="mb-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700 space-y-3 animate-slide-up">
          <h4 className="text-xs font-semibold text-aqua-400">New Schedule</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-gray-400 block mb-1">Label</label>
              <input type="text" required value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} placeholder="Morning lights on"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-100 focus:outline-none focus:border-aqua-500/60" />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 block mb-1">Device</label>
              <select value={form.deviceKey} onChange={(e) => setForm((f) => ({ ...f, deviceKey: e.target.value }))}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-100 focus:outline-none focus:border-aqua-500/60">
                {DEVICE_KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-400 block mb-1">Cron Expression</label>
              <input type="text" required value={form.cronExpr} onChange={(e) => setForm((f) => ({ ...f, cronExpr: e.target.value }))}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-xs font-mono text-gray-100 focus:outline-none focus:border-aqua-500/60" />
              <div className="flex gap-1 flex-wrap mt-1">
                {CRON_PRESETS.map((p) => (
                  <button type="button" key={p.value} onClick={() => setForm((f) => ({ ...f, cronExpr: p.value }))}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-gray-700 text-gray-400 hover:text-aqua-400 hover:bg-gray-600 transition-all">
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] text-gray-400 block mb-1">Action</label>
              <select value={form.action} onChange={(e) => setForm((f) => ({ ...f, action: e.target.value }))}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-100 focus:outline-none focus:border-aqua-500/60">
                <option value="on">Turn ON</option>
                <option value="off">Turn OFF</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-xs">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary text-xs disabled:opacity-50">
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />} Create
            </button>
          </div>
        </form>
      )}

      {schedules.length === 0 ? (
        <p className="text-xs text-gray-500 text-center py-6">No schedules yet. {isAdmin ? 'Create one above.' : ''}</p>
      ) : (
        <div className="space-y-2">
          {schedules.map((s) => (
            <div key={s._id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${s.enabled ? 'bg-gray-800/40 border-gray-700' : 'bg-gray-900/40 border-gray-800 opacity-60'}`}>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">{s.label}</p>
                <p className="text-[10px] text-gray-500 font-mono mt-0.5">{s.cronExpr} · {s.deviceKey} → {s.action.toUpperCase()}</p>
                {s.lastRun && <p className="text-[10px] text-gray-600 mt-0.5">Last run: {new Date(s.lastRun).toLocaleString()}</p>}
              </div>
              {isAdmin && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => handleToggle(s)}
                    className={`w-8 h-4.5 rounded-full transition-all text-[10px] px-1.5 py-0.5 border ${s.enabled ? 'bg-aqua-500/10 border-aqua-500/30 text-aqua-400' : 'bg-gray-700 border-gray-600 text-gray-400'}`}>
                    {s.enabled ? 'ON' : 'OFF'}
                  </button>
                  <button onClick={() => handleDelete(s._id)} className="text-gray-600 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-500/10">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Profile section ───────────────────────────────────────────────────────────
const ProfileSection = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savedProfile, setSavedProfile] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', next: '' });
  const [savingPw, setSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState('');

  const handleProfileSave = async () => {
    setSavingProfile(true);
    try { await updateProfile({ name }); setSavedProfile(true); setTimeout(() => setSavedProfile(false), 2000); }
    catch (e) { alert(e.response?.data?.message || 'Update failed'); }
    finally { setSavingProfile(false); }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setSavingPw(true); setPwMsg('');
    try { await changePassword(pwForm.current, pwForm.next); setPwMsg('Password changed!'); setPwForm({ current: '', next: '' }); }
    catch (e) { setPwMsg(e.response?.data?.message || 'Failed'); }
    finally { setSavingPw(false); }
  };

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-4 h-4 text-aqua-400" />
          <h3 className="text-sm font-semibold text-gray-200">Profile</h3>
          <span className="badge bg-gray-800 text-gray-400 ml-auto capitalize">{user?.role}</span>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-gray-400 block mb-1">Display Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-aqua-500/60" />
          </div>
          <div>
            <label className="text-[10px] text-gray-400 block mb-1">Email</label>
            <input type="email" value={user?.email || ''} disabled
              className="w-full bg-gray-800/50 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-500 cursor-not-allowed" />
          </div>
          <button onClick={handleProfileSave} disabled={savingProfile}
            className={`btn text-xs w-full justify-center ${savedProfile ? 'bg-aqua-800 text-aqua-300' : 'btn-primary'} disabled:opacity-50`}>
            {savingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : savedProfile ? <CheckCircle className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {savedProfile ? 'Saved!' : 'Save Profile'}
          </button>
        </div>
      </div>
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-4 h-4 text-aqua-400" />
          <h3 className="text-sm font-semibold text-gray-200">Change Password</h3>
        </div>
        <form onSubmit={handlePasswordSave} className="space-y-3">
          <input type="password" placeholder="Current password" value={pwForm.current} required minLength={6}
            onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-aqua-500/60" />
          <input type="password" placeholder="New password (min 6 chars)" value={pwForm.next} required minLength={6}
            onChange={(e) => setPwForm((f) => ({ ...f, next: e.target.value }))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-aqua-500/60" />
          {pwMsg && <p className={`text-xs ${pwMsg.includes('!') ? 'text-aqua-400' : 'text-red-400'}`}>{pwMsg}</p>}
          <button type="submit" disabled={savingPw} className="btn-primary text-xs w-full justify-center disabled:opacity-50">
            {savingPw ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

// ── Main page ──────────────────────────────────────────────────────────────────
const SettingsPage = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState('thresholds');
  const isAdmin = user?.role === 'admin';

  const TABS = [
    { id: 'thresholds', label: 'Thresholds', icon: Sliders },
    { id: 'schedules', label: 'Schedules', icon: Clock },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h2 className="text-lg font-bold text-white">Settings</h2>
        <p className="text-sm text-gray-400">Configure thresholds, schedules and account</p>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${tab === id ? 'bg-aqua-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}>
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {tab === 'thresholds' && <ThresholdsSection isAdmin={isAdmin} />}
      {tab === 'schedules' && <SchedulesSection isAdmin={isAdmin} />}
      {tab === 'profile' && <ProfileSection />}
    </div>
  );
};

export default SettingsPage;
