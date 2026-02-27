import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import profileService from '../services/profileService';
import { toast } from 'sonner';
import {
    User, Mail, Building2, ShieldCheck, Clock, Calendar,
    Edit3, Lock, Award, TrendingUp, FileText, CheckCircle2,
    AlertTriangle, X, Eye, EyeOff, Loader2, BadgeCheck,
    Fingerprint, ChevronRight, BarChart3, Zap
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Modal Base
───────────────────────────────────────────── */
const Modal = ({ title, subtitle, icon: Icon, accentColor = 'indigo', onClose, children }) => {
    const colors = {
        indigo: 'from-indigo-500 to-violet-600',
        rose: 'from-rose-500 to-pink-600',
    };
    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={onClose} />
            <div className="relative bg-white dark:bg-slate-900 rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl w-full sm:max-w-md border-t sm:border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
                {/* Gradient top bar */}
                <div className={`h-1.5 bg-gradient-to-r ${colors[accentColor]}`} />
                <div className="p-6 sm:p-7">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${colors[accentColor]} flex items-center justify-center shadow-lg`}>
                                <Icon size={18} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">{title}</h3>
                                {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all">
                            <X size={16} />
                        </button>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────
   Form Field
───────────────────────────────────────────── */
const Field = ({ label, children }) => (
    <div className="space-y-1.5">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
        {children}
    </div>
);

const Input = ({ type = 'text', value, onChange, placeholder, required, suffix }) => (
    <div className="relative">
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />
        {suffix && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{suffix}</div>
        )}
    </div>
);

/* ─────────────────────────────────────────────
   Edit Profile Modal
───────────────────────────────────────────── */
const EditProfileModal = ({ profile, onClose, onSuccess }) => {
    const [form, setForm] = useState({ name: profile.name || '', department: profile.department || '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await profileService.updateProfile(form);
            toast.success('Profile updated successfully!');
            onSuccess(form);
            onClose();
        } catch (err) {
            toast.error(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal title="Edit Profile" subtitle="Update your name and department" icon={Edit3} accentColor="indigo" onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Field label="Full Name">
                    <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your full name" required />
                </Field>
                <Field label="Department">
                    <Input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} placeholder="e.g. Engineering, Finance, HR…" />
                </Field>
                <div className="flex gap-3 pt-1">
                    <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Cancel</button>
                    <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-sm font-bold transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-60 flex items-center justify-center gap-2">
                        {loading && <Loader2 size={14} className="animate-spin" />}
                        Save Changes
                    </button>
                </div>
            </form>
        </Modal>
    );
};

/* ─────────────────────────────────────────────
   Change Password Modal
───────────────────────────────────────────── */
const ChangePasswordModal = ({ onClose }) => {
    const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [show, setShow] = useState({ curr: false, new: false });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.newPassword !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
        setLoading(true);
        try {
            await profileService.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
            toast.success('Password changed successfully!');
            onClose();
        } catch (err) {
            toast.error(err.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal title="Change Password" subtitle="Keep your account secure" icon={Lock} accentColor="rose" onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Field label="Current Password">
                    <Input type={show.curr ? 'text' : 'password'} value={form.currentPassword} onChange={e => setForm(f => ({ ...f, currentPassword: e.target.value }))} required
                        suffix={<button type="button" onClick={() => setShow(s => ({ ...s, curr: !s.curr }))} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">{show.curr ? <EyeOff size={15} /> : <Eye size={15} />}</button>} />
                </Field>
                <Field label="New Password">
                    <Input type={show.new ? 'text' : 'password'} value={form.newPassword} onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))} required
                        suffix={<button type="button" onClick={() => setShow(s => ({ ...s, new: !s.new }))} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">{show.new ? <EyeOff size={15} /> : <Eye size={15} />}</button>} />
                </Field>
                <Field label="Confirm New Password">
                    <Input type="password" value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} required />
                </Field>
                <p className="text-[10px] text-slate-400">Minimum 8 characters required.</p>
                <div className="flex gap-3 pt-1">
                    <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Cancel</button>
                    <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white text-sm font-bold transition-all shadow-lg shadow-rose-500/25 disabled:opacity-60 flex items-center justify-center gap-2">
                        {loading && <Loader2 size={14} className="animate-spin" />}
                        Update Password
                    </button>
                </div>
            </form>
        </Modal>
    );
};

/* ─────────────────────────────────────────────
   Main Profile Page
───────────────────────────────────────────── */
const ProfilePage = () => {
    const { user: authUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modal, setModal] = useState(null);
    const [toggling2FA, setToggling2FA] = useState(false);

    useEffect(() => { fetchProfile(); }, []);

    const fetchProfile = async () => {
        setLoading(true); setError(null);
        try {
            const res = await profileService.getProfile();
            setProfile(res.data);
        } catch (err) {
            setError(err.message || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handle2FAToggle = async () => {
        setToggling2FA(true);
        try {
            const res = await profileService.toggle2FA();
            setProfile(p => ({ ...p, twoFactorEnabled: res.data.twoFactorEnabled }));
            toast.success(`2FA ${res.data.twoFactorEnabled ? 'enabled' : 'disabled'} successfully`);
        } catch (err) {
            toast.error(err.message || 'Failed to toggle 2FA');
        } finally {
            setToggling2FA(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return 'Never';
        return new Date(date).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const getAvatarUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        const base = import.meta.env.VITE_API_URL?.replace('/api', '').replace(/\/$/, '') || '';
        return `${base}${path.startsWith('/') ? path : '/' + path}`;
    };

    const roleGradient = {
        Employee: ['from-indigo-500', 'to-violet-600'],
        Manager: ['from-blue-500', 'to-cyan-500'],
        Admin: ['from-rose-500', 'to-pink-600'],
        Auditor: ['from-emerald-500', 'to-teal-500'],
    };
    const grad = roleGradient[profile?.role] || ['from-slate-500', 'to-slate-700'];

    const complianceLevel = (s) => {
        if (s >= 85) return { label: 'Excellent', tw: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400', bar: 'from-emerald-400 to-teal-500' };
        if (s >= 70) return { label: 'Good', tw: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400', bar: 'from-blue-400 to-indigo-500' };
        if (s >= 50) return { label: 'Fair', tw: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400', bar: 'from-amber-400 to-orange-500' };
        return { label: 'Needs Work', tw: 'text-rose-600 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400', bar: 'from-rose-400 to-pink-500' };
    };

    /* ── Loading ── */
    if (loading) return (
        <div className="flex items-center justify-center min-h-[70vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full bg-indigo-100 dark:bg-indigo-900/30 animate-pulse" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 size={28} className="text-indigo-500 animate-spin" />
                    </div>
                </div>
                <p className="text-sm font-semibold text-slate-400">Loading profile…</p>
            </div>
        </div>
    );

    /* ── Error ── */
    if (error) return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
            <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                <AlertTriangle size={28} className="text-rose-500" />
            </div>
            <p className="text-sm font-semibold text-slate-500">{error}</p>
            <button onClick={fetchProfile} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all">Try Again</button>
        </div>
    );

    const cl = complianceLevel(profile?.stats?.complianceScore ?? 0);
    const approvalRate = profile?.stats?.approvalRate ?? 0;
    const compScore = profile?.stats?.complianceScore ?? 0;
    const totalSubs = profile?.stats?.totalSubmissions ?? 0;
    const highRisk = profile?.stats?.highRiskCount ?? 0;

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/30 py-8 px-4 md:px-8">
            <div className="max-w-5xl mx-auto space-y-5">

                {/* ═══════════════════════════════════════════════
                    HERO CARD
                ═══════════════════════════════════════════════ */}
                <div className="relative rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700/50 shadow-2xl shadow-slate-200/50 dark:shadow-black/30">

                    {/* Gradient Banner */}
                    <div className={`relative h-28 bg-gradient-to-br ${grad[0]} ${grad[1]} overflow-hidden`}>
                        {/* Decorative circles */}
                        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-white/10" />
                        <div className="absolute top-4 right-24 w-20 h-20 rounded-full bg-white/10" />
                        <div className="absolute -bottom-10 left-1/4 w-40 h-40 rounded-full bg-black/5" />
                        {/* Grid pattern overlay */}
                        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'repeating-linear-gradient(0deg,white,white 1px,transparent 1px,transparent 32px),repeating-linear-gradient(90deg,white,white 1px,transparent 1px,transparent 32px)' }} />
                    </div>

                    {/* Content below banner */}
                    <div className="px-6 md:px-8 pb-6">

                        {/* Avatar — straddles banner bottom edge */}
                        <div className="relative -mt-10 mb-3">
                            <div className="relative inline-block">
                                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${grad[0]} ${grad[1]} ring-4 ring-white dark:ring-slate-900 shadow-xl overflow-hidden flex items-center justify-center`}>
                                    {profile?.avatar
                                        ? <img src={getAvatarUrl(profile.avatar)} alt={profile.name} className="w-full h-full object-cover" />
                                        : <span className="text-white text-3xl font-black select-none">{profile?.name?.charAt(0)}</span>
                                    }
                                </div>
                                {/* Online dot */}
                                <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-400 border-2 border-white dark:border-slate-900 rounded-full shadow-sm" />
                            </div>
                        </div>

                        {/* Name + info + action buttons — fully in white area */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

                            {/* Left: name / role / meta */}
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                                        {profile?.name}
                                    </h1>
                                    <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-xl flex-shrink-0 ${cl.tw}`}>
                                        <BadgeCheck size={11} strokeWidth={3} />
                                        {cl.label}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-semibold">
                                    <span className={`inline-flex items-center gap-1 font-black text-xs px-2.5 py-1 rounded-xl bg-gradient-to-br ${grad[0]} ${grad[1]} text-white shadow`}>
                                        {profile?.role}
                                    </span>
                                    <span className="text-slate-300 dark:text-slate-600">·</span>
                                    <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg text-slate-500 dark:text-slate-400">
                                        {profile?.employeeId || 'N/A'}
                                    </span>
                                    {profile?.department && (
                                        <>
                                            <span className="text-slate-300 dark:text-slate-600">·</span>
                                            <span className="flex items-center gap-1 text-xs"><Building2 size={11} />{profile.department}</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Right: action buttons */}
                            <div className="flex items-center gap-2.5 flex-shrink-0 flex-wrap">
                                <button onClick={() => setModal('edit')}
                                    className={`flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r ${grad[0]} ${grad[1]} text-white rounded-xl text-sm font-bold transition-all shadow-lg hover:scale-105 hover:shadow-xl active:scale-95`}>
                                    <Edit3 size={15} strokeWidth={2.5} />
                                    Edit Profile
                                </button>
                                <button onClick={() => setModal('password')}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:scale-105 active:scale-95 shadow-sm">
                                    <Lock size={15} strokeWidth={2.5} />
                                    Password
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════
                    STATS STRIP
                ═══════════════════════════════════════════════ */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        {
                            icon: FileText, label: 'Total Submissions', value: totalSubs, suffix: '',
                            gradient: 'from-indigo-500 to-violet-600',
                            bg: 'bg-indigo-50/70 dark:bg-indigo-900/10',
                            border: 'border-indigo-100/80 dark:border-indigo-800/20',
                            iconBg: 'bg-indigo-500',
                            bar: false,
                        },
                        {
                            icon: CheckCircle2, label: 'Approval Rate', value: approvalRate, suffix: '%',
                            gradient: 'from-emerald-500 to-teal-500',
                            bg: 'bg-emerald-50/70 dark:bg-emerald-900/10',
                            border: 'border-emerald-100/80 dark:border-emerald-800/20',
                            iconBg: 'bg-emerald-500',
                            bar: approvalRate,
                            barColor: 'from-emerald-400 to-teal-500',
                        },
                        {
                            icon: Award, label: 'Compliance Score', value: compScore, suffix: '%',
                            gradient: `${grad[0]} ${grad[1]}`,
                            bg: 'bg-slate-50/70 dark:bg-slate-800/20',
                            border: 'border-slate-100/80 dark:border-slate-700/20',
                            iconBg: 'bg-violet-500',
                            bar: compScore,
                            barColor: cl.bar,
                        },
                        {
                            icon: AlertTriangle, label: 'High Risk Items', value: highRisk, suffix: '',
                            gradient: 'from-rose-500 to-pink-600',
                            bg: 'bg-rose-50/70 dark:bg-rose-900/10',
                            border: 'border-rose-100/80 dark:border-rose-800/20',
                            iconBg: 'bg-rose-500',
                            bar: false,
                        },
                    ].map(({ icon: Icon, label, value, suffix, gradient, bg, border, iconBg, bar, barColor }) => (
                        <div key={label} className={`relative rounded-2xl p-5 border ${bg} ${border} group hover:scale-[1.02] hover:shadow-lg transition-all duration-200 overflow-hidden`}>
                            <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-[0.06] bg-gradient-to-br from-current to-transparent" />
                            <div className={`inline-flex w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} items-center justify-center mb-4 shadow-lg`}>
                                <Icon size={18} className="text-white" strokeWidth={2} />
                            </div>
                            <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">
                                {value}<span className="text-xl">{suffix}</span>
                            </p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{label}</p>
                            {bar !== false && (
                                <div className="mt-3 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-700`} style={{ width: `${Math.min(bar, 100)}%` }} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* ═══════════════════════════════════════════════
                    BOTTOM GRID: Account Details + Security
                ═══════════════════════════════════════════════ */}
                <div className="grid md:grid-cols-2 gap-5">

                    {/* ── Account Details ── */}
                    <div className="bg-white dark:bg-slate-900 rounded-[1.75rem] border border-slate-200/70 dark:border-slate-700/50 shadow-lg overflow-hidden">
                        {/* Card header */}
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                                <User size={14} className="text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="text-sm font-black text-slate-900 dark:text-white">Account Details</h2>
                                <p className="text-[10px] text-slate-400">Your personal information</p>
                            </div>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {[
                                { icon: Fingerprint, label: 'Employee ID', value: profile?.employeeId || 'N/A', mono: true },
                                { icon: User, label: 'Full Name', value: profile?.name },
                                { icon: Mail, label: 'Email', value: profile?.email },
                                { icon: Building2, label: 'Department', value: profile?.department || 'Not Set' },
                                { icon: ShieldCheck, label: 'Role', value: profile?.role },
                                { icon: Calendar, label: 'Joined', value: formatDate(profile?.createdAt) },
                                { icon: Clock, label: 'Last Login', value: formatDate(profile?.lastLogin) },
                            ].map(({ icon: Icon, label, value, mono }) => (
                                <div key={label} className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-colors">
                                        <Icon size={13} className="text-slate-500 dark:text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                                        <p className={`text-sm font-semibold text-slate-800 dark:text-white truncate mt-0.5 ${mono ? 'font-mono text-xs' : ''}`}>{value}</p>
                                    </div>
                                    <ChevronRight size={14} className="text-slate-300 dark:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Security ── */}
                    <div className="space-y-5">

                        {/* 2FA Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-[1.75rem] border border-slate-200/70 dark:border-slate-700/50 shadow-lg overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center">
                                    <ShieldCheck size={14} className="text-rose-600 dark:text-rose-400" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black text-slate-900 dark:text-white">Security Settings</h2>
                                    <p className="text-[10px] text-slate-400">Secure your account</p>
                                </div>
                            </div>
                            <div className="p-5 space-y-3">
                                {/* 2FA Toggle */}
                                <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${profile?.twoFactorEnabled ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/40' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${profile?.twoFactorEnabled ? 'bg-indigo-100 dark:bg-indigo-900/40' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                            <Fingerprint size={18} className={profile?.twoFactorEnabled ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">Two-Factor Auth</p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">{profile?.twoFactorEnabled ? 'Active protection' : 'Disabled — enable for safety'}</p>
                                        </div>
                                    </div>
                                    {/* Custom toggle switch */}
                                    <button
                                        onClick={handle2FAToggle}
                                        disabled={toggling2FA}
                                        className={`relative w-14 h-7 rounded-full transition-all duration-300 flex items-center ${profile?.twoFactorEnabled ? 'bg-indigo-600 shadow-lg shadow-indigo-600/30' : 'bg-slate-300 dark:bg-slate-600'} disabled:opacity-50`}
                                    >
                                        <div className={`absolute w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${profile?.twoFactorEnabled ? 'translate-x-8' : 'translate-x-1'}`}>
                                            {toggling2FA && <Loader2 size={12} className="text-indigo-400 animate-spin absolute inset-0.5" />}
                                        </div>
                                    </button>
                                </div>

                                {/* Password Card */}
                                <button onClick={() => setModal('password')} className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group text-left">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center group-hover:bg-rose-100 dark:group-hover:bg-rose-900/30 transition-colors">
                                            <Lock size={16} className="text-slate-500 dark:text-slate-400 group-hover:text-rose-500 transition-colors" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">Password</p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">Update your login password</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all" />
                                </button>
                            </div>
                        </div>

                        {/* Compliance Score Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-[1.75rem] border border-slate-200/70 dark:border-slate-700/50 shadow-lg p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${grad[0]} ${grad[1]} bg-opacity-20 flex items-center justify-center`}>
                                        <BarChart3 size={14} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-slate-900 dark:text-white">Compliance Overview</h3>
                                        <p className="text-[10px] text-slate-400">Based on your submissions</p>
                                    </div>
                                </div>
                                <span className={`text-xs font-black px-2.5 py-1 rounded-xl ${cl.tw}`}>{cl.label}</span>
                            </div>

                            {/* Score ring-style display */}
                            <div className="flex items-center gap-5">
                                <div className="relative w-20 h-20 flex-shrink-0">
                                    <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                                        <circle cx="40" cy="40" r="32" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-800" />
                                        <circle cx="40" cy="40" r="32" fill="none" strokeWidth="8"
                                            strokeLinecap="round"
                                            stroke="url(#cGrad)"
                                            strokeDasharray={`${2 * Math.PI * 32}`}
                                            strokeDashoffset={`${2 * Math.PI * 32 * (1 - Math.min(compScore, 100) / 100)}`}
                                            style={{ transition: 'stroke-dashoffset 1s ease' }}
                                        />
                                        <defs>
                                            <linearGradient id="cGrad" x1="0" y1="0" x2="1" y2="0">
                                                <stop offset="0%" stopColor={grad[0].replace('from-', '').replace('indigo-500', '#6366f1').replace('blue-500', '#3b82f6').replace('rose-500', '#ef4444').replace('amber-500', '#f59e0b').replace('emerald-500', '#10b981').replace('slate-500', '#64748b')} />
                                                <stop offset="100%" stopColor={grad[1].replace('to-', '').replace('violet-600', '#7c3aed').replace('cyan-500', '#06b6d4').replace('pink-600', '#db2777').replace('orange-500', '#f97316').replace('teal-500', '#14b8a6').replace('slate-700', '#334155')} />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-lg font-black text-slate-900 dark:text-white">{compScore}</span>
                                    </div>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex justify-between text-xs"><span className="text-slate-500 font-semibold">Approved</span><span className="font-black text-slate-900 dark:text-white">{profile?.stats?.approvedCount ?? 0}</span></div>
                                    <div className="flex justify-between text-xs"><span className="text-slate-500 font-semibold">Total</span><span className="font-black text-slate-900 dark:text-white">{totalSubs}</span></div>
                                    <div className="flex justify-between text-xs"><span className="text-slate-500 font-semibold">High Risk</span><span className="font-black text-rose-500">−{highRisk * 2} pts</span></div>
                                    <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                                        <p className="text-[9px] text-slate-400 font-medium flex items-center gap-1">
                                            <Zap size={9} className="text-violet-400" />
                                            (Approved ÷ Total) × 100 − (High Risk × 2)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {modal === 'edit' && <EditProfileModal profile={profile} onClose={() => setModal(null)} onSuccess={u => setProfile(p => ({ ...p, ...u }))} />}
            {modal === 'password' && <ChangePasswordModal onClose={() => setModal(null)} />}
        </div>
    );
};

export default ProfilePage;
