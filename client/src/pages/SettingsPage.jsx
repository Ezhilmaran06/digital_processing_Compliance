import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import authService from '../services/authService';

const SettingsPage = () => {
    const { user, updateUser } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const fileInputRef = useRef(null);

    // Profile State
    const [profileData, setProfileData] = useState({
        firstName: user?.name?.split(' ')[0] || '',
        lastName: user?.name?.split(' ')[1] || '',
        email: user?.email || '',
    });

    // Password State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [loading, setLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleProfileChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB');
            return;
        }

        setUploading(true);
        try {
            const updatedUser = await authService.uploadAvatar(file);
            updateUser(updatedUser);
            alert('Profile photo updated!');
        } catch (error) {
            alert(error.message || 'Failed to upload photo');
        } finally {
            setUploading(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const name = `${profileData.firstName} ${profileData.lastName}`.trim();
            const updatedUser = await authService.updateProfile({
                name,
                email: profileData.email
            });
            updateUser(updatedUser);
            alert('Profile updated successfully!');
        } catch (error) {
            alert(error.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return alert('Passwords do not match');
        }

        setPasswordLoading(true);
        try {
            await authService.updatePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
                confirmPassword: passwordData.confirmPassword,
            });
            alert('Password updated successfully!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            alert(error.message || 'Failed to update password');
        } finally {
            setPasswordLoading(false);
        }
    };

    // Helper to get consistent URL for images
    const getAvatarUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;

        // In local development, we sometimes need the absolute URL if proxying fails
        // for direct image tags. We add a timestamp to prevent browser caching.
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '').replace(/\/$/, '') || '';
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        const timestamp = new Date().getTime();
        const fullUrl = `${baseUrl}${cleanPath}?t=${timestamp}`;
        console.log(`[DEBUG_AVATAR] Path: ${path}, BaseUrl: ${baseUrl}, FullUrl: ${fullUrl}`);
        return fullUrl;
    };

    return (
        <main className="max-w-[1200px] mx-auto px-4 py-4 animate-fade-in pb-20 text-tight">
            <header className="mb-2">
                <h1 className="text-5xl font-display font-black text-slate-900 dark:text-white tracking-tight">System <span className="text-indigo-600 dark:text-indigo-400">Settings</span></h1>
                <p className="text-xl text-slate-500 dark:text-slate-400 mt-3 font-medium">Manage your account preferences and configuration</p>
            </header>

            <div className="space-y-4">
                {/* Profile Information */}
                <section className="section-card p-6">
                    <div className="flex items-center gap-2 mb-6 border-b-2 border-slate-100 dark:border-slate-800/50 pb-4">
                        <div className="w-2 h-6 bg-indigo-600 rounded-full"></div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Identity Profile</h2>
                    </div>
                    <form onSubmit={handleProfileUpdate} className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="flex flex-col items-center gap-4 bg-slate-50/50 dark:bg-slate-900/40 p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800/50 shadow-inner">
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            <div className="w-28 h-28 rounded-[2rem] bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-4xl shadow-premium border-2 border-white dark:border-indigo-500/30 overflow-hidden relative group transition-transform hover:scale-105 active:scale-95">
                                {user?.avatar ? (
                                    <img
                                        src={getAvatarUrl(user.avatar)}
                                        alt={user.name}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                    />
                                ) : (
                                    user?.name?.charAt(0)
                                )}

                                {uploading && (
                                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                                        <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/20 transition-colors cursor-pointer flex items-center justify-center" onClick={() => fileInputRef.current?.click()}>
                                    <span className="opacity-0 group-hover:opacity-100 text-white text-[10px] font-black uppercase tracking-widest bg-indigo-600/80 px-2 py-1 rounded-lg backdrop-blur-sm transition-opacity">Swap</span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors disabled:opacity-50"
                            >
                                {uploading ? 'Sycing Node...' : 'Modify Core Avatar'}
                            </button>
                        </div>
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-widest">First Name</label>
                                <input
                                    name="firstName"
                                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 text-[11px] font-bold uppercase tracking-tight"
                                    value={profileData.firstName}
                                    onChange={handleProfileChange}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-widest">Last Name</label>
                                <input
                                    name="lastName"
                                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 text-[11px] font-bold uppercase tracking-tight"
                                    value={profileData.lastName}
                                    onChange={handleProfileChange}
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-widest">Email Identity</label>
                                <input
                                    name="email"
                                    type="email"
                                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 text-[11px] font-bold uppercase tracking-tight"
                                    value={profileData.email}
                                    onChange={handleProfileChange}
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-widest">Governance Permissions</label>
                                <div className="relative group">
                                    <input
                                        className="w-full px-4 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-950/40 border-2 border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase tracking-widest opacity-80 cursor-not-allowed text-slate-500 dark:text-slate-400"
                                        value={user?.role}
                                        disabled
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                    </div>
                                </div>
                                <p className="text-[8px] text-slate-400 mt-1 uppercase font-black tracking-tighter">Permission nodes are immutable by local operators</p>
                            </div>
                            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                                <button type="button" className="px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600" onClick={() => {
                                    setProfileData({
                                        firstName: user?.name?.split(' ')[0] || '',
                                        lastName: user?.name?.split(' ')[1] || '',
                                        email: user?.email || '',
                                    });
                                }}>Revert</button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest border-2 border-indigo-500 shadow-premium active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Propagating...' : 'Commit Changes'}
                                </button>
                            </div>
                        </div>
                    </form>
                </section>

                {/* Security */}
                <section className="section-card p-6">
                    <div className="flex items-center gap-2 mb-6 border-b-2 border-slate-100 dark:border-slate-800/50 pb-4">
                        <div className="w-2 h-6 bg-indigo-600 rounded-full"></div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Security Credentials</h2>
                    </div>
                    <form onSubmit={handlePasswordUpdate} className="space-y-6 max-w-2xl">
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-widest">Current Key</label>
                            <input
                                name="currentPassword"
                                className="w-full px-4 py-2 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 border-2 border-slate-200 dark:border-slate-700/50 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-[11px] font-bold uppercase tracking-tight transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                type="password"
                                placeholder="••••••••"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-widest">New Protocol Key</label>
                                <input
                                    name="newPassword"
                                    className="w-full px-4 py-2 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 border-2 border-slate-200 dark:border-slate-700/50 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-[11px] font-bold uppercase tracking-tight transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                    type="password"
                                    placeholder="••••••••"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-widest">Confirm Key</label>
                                <input
                                    name="confirmPassword"
                                    className="w-full px-4 py-2 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 border-2 border-slate-200 dark:border-slate-700/50 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-[11px] font-bold uppercase tracking-tight transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                    type="password"
                                    placeholder="••••••••"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={passwordLoading}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest border-2 border-indigo-500 shadow-premium active:scale-95 transition-all disabled:opacity-50"
                            >
                                {passwordLoading ? 'Rotating...' : 'Update Credentials'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 pt-6 border-t-2 border-slate-50 dark:border-slate-800 flex items-center justify-between">
                        <div>
                            <p className="font-black text-slate-900 dark:text-white uppercase text-[11px] tracking-widest">Multi-Factor Protocol</p>
                            <p className="text-[10px] text-slate-500 font-bold mt-0.5">Add hardware/biometric security layers</p>
                        </div>
                        <button onClick={() => alert('Two-factor authentication setup coming soon.')} className="px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-indigo-500 border-2 border-indigo-500/20 hover:bg-indigo-500/5 transition-all">Setup</button>
                    </div>
                </section>

                {/* Notifications */}
                <section className="section-card p-6">
                    <div className="flex items-center gap-2 mb-6 border-b-2 border-slate-100 dark:border-slate-800/50 pb-4">
                        <div className="w-2 h-6 bg-indigo-600 rounded-full"></div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Neural Notifications</h2>
                    </div>
                    <div className="space-y-6 max-w-2xl">
                        <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border-2 border-slate-100 dark:border-slate-800/50">
                            <div>
                                <p className="font-black text-slate-900 dark:text-white uppercase text-[11px] tracking-widest">Broadcast Protocol</p>
                                <p className="text-[10px] text-slate-500 font-bold mt-0.5">Receive synchronized alerts and audit updates</p>
                            </div>
                            <div className="w-10 h-5 bg-indigo-600 rounded-full relative cursor-pointer shadow-premium transition-all hover:scale-105">
                                <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-md"></div>
                            </div>
                        </div>
                        <div className="space-y-3 px-2">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input type="checkbox" defaultChecked className="peer appearance-none w-5 h-5 rounded-lg border-2 border-slate-200 dark:border-slate-700 checked:bg-indigo-600 checked:border-indigo-500 transition-all cursor-pointer" />
                                    <svg className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none left-1/2 -translate-x-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <span className="text-[11px] font-black uppercase tracking-tight text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 transition-colors">Compliance updates and mentions</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input type="checkbox" defaultChecked className="peer appearance-none w-5 h-5 rounded-lg border-2 border-slate-200 dark:border-slate-700 checked:bg-indigo-600 checked:border-indigo-500 transition-all cursor-pointer" />
                                    <svg className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none left-1/2 -translate-x-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <span className="text-[11px] font-black uppercase tracking-tight text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 transition-colors">Audit assignments and deadlines</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input type="checkbox" className="peer appearance-none w-5 h-5 rounded-lg border-2 border-slate-200 dark:border-slate-700 checked:bg-indigo-600 checked:border-indigo-500 transition-all cursor-pointer" />
                                    <svg className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none left-1/2 -translate-x-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <span className="text-[11px] font-black uppercase tracking-tight text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 transition-colors">Periodic intelligence reports</span>
                            </label>
                        </div>
                    </div>
                </section>

                {/* Appearance */}
                <section className="section-card p-6">
                    <div className="flex items-center gap-2 mb-6 border-b-2 border-slate-100 dark:border-slate-800/50 pb-4">
                        <div className="w-2 h-6 bg-indigo-600 rounded-full"></div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Console Schema</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <button
                            onClick={() => isDark && toggleTheme()}
                            className={`p-3 rounded-2xl border-2 transition-all text-left group active:scale-95 ${!isDark ? 'border-indigo-600 bg-indigo-50/50 shadow-premium' : 'border-slate-100 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-600'}`}
                        >
                            <div className="w-full h-16 bg-white shadow-inner rounded-xl mb-2 border-2 border-slate-100 group-hover:border-indigo-200 transition-colors"></div>
                            <p className="text-[10px] font-black uppercase text-slate-900 dark:text-white tracking-widest">Operational (Light)</p>
                        </button>
                        <button
                            onClick={() => !isDark && toggleTheme()}
                            className={`p-3 rounded-2xl border-2 transition-all text-left group active:scale-95 ${isDark ? 'border-indigo-600 bg-indigo-900/10 shadow-premium' : 'border-slate-100 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-600'}`}
                        >
                            <div className="w-full h-16 bg-slate-950 shadow-inner rounded-xl mb-2 border-2 border-indigo-500/10 group-hover:border-indigo-500/30 transition-colors"></div>
                            <p className="text-[10px] font-black uppercase text-slate-900 dark:text-white tracking-widest">Stealth (Dark)</p>
                        </button>
                        <button className="p-3 rounded-2xl border-2 border-slate-100 dark:border-slate-800/50 text-left opacity-40 cursor-not-allowed">
                            <div className="w-full h-16 bg-gradient-to-r from-slate-100 to-slate-900 rounded-xl mb-2 border-2 border-slate-200 dark:border-slate-700"></div>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Auto Detect</p>
                        </button>
                    </div>
                </section>

                {/* Danger Zone */}
                <section className="section-card p-6 border-rose-500/30 bg-rose-500/5">
                    <div className="flex items-center gap-2 mb-6 border-b-2 border-rose-500/20 pb-4">
                        <div className="w-2 h-6 bg-rose-600 rounded-full"></div>
                        <h2 className="text-xl font-black text-rose-600 uppercase tracking-tighter">Termination Zone</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-black text-slate-900 dark:text-white uppercase text-[11px] tracking-widest">Deactivate Identity</p>
                                <p className="text-[10px] text-slate-500 font-bold mt-0.5">Suspend active session and access</p>
                            </div>
                            <button onClick={() => alert('Account deactivated successfully.')} className="px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-rose-600 border-2 border-rose-500/20 hover:bg-rose-500/10 transition-all">Deactivate</button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-rose-500/5 dark:bg-rose-500/10 rounded-2xl border-2 border-rose-500/30">
                            <div>
                                <p className="font-black text-rose-600 uppercase text-[11px] tracking-widest">Purge Account</p>
                                <p className="text-[10px] text-rose-500/80 font-bold mt-0.5">Irreversible removal of all identity data</p>
                            </div>
                            <button onClick={() => window.confirm('Are you sure you want to delete your account permanently?') && alert('Account deleted.')} className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-premium active:scale-95 transition-all border-2 border-rose-500/50">Erase Node</button>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default SettingsPage;
