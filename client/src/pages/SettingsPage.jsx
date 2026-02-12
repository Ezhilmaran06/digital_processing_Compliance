import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import authService from '../services/authService';

const SettingsPage = () => {
    const { user, updateUser } = useAuth();
    const { isDark, toggleTheme } = useTheme();

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

    const handleProfileChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
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

    return (
        <main className="content-container animate-fade-in pb-20">
            <header className="mb-10">
                <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-white tracking-tight">Settings</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg font-medium">Manage your account preferences and configuration</p>
            </header>

            <div className="max-w-4xl space-y-8">
                {/* Profile Information */}
                <section className="card">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">Profile Information</h2>
                    <form onSubmit={handleProfileUpdate} className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-24 h-24 rounded-3xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-3xl shadow-inner border-2 border-indigo-50 dark:border-indigo-900/50">
                                {user?.name?.charAt(0)}
                            </div>
                            <button type="button" className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Change Photo</button>
                        </div>
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">First Name</label>
                                <input
                                    name="firstName"
                                    className="input-field"
                                    value={profileData.firstName}
                                    onChange={handleProfileChange}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
                                <input
                                    name="lastName"
                                    className="input-field"
                                    value={profileData.lastName}
                                    onChange={handleProfileChange}
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                                <input
                                    name="email"
                                    type="email"
                                    className="input-field"
                                    value={profileData.email}
                                    onChange={handleProfileChange}
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Job Title / Role</label>
                                <input
                                    className="input-field opacity-60 cursor-not-allowed"
                                    value={user?.role}
                                    disabled
                                />
                                <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">Role management is handled by administrators</p>
                            </div>
                            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                                <button type="button" className="btn btn-secondary px-6" onClick={() => {
                                    setProfileData({
                                        firstName: user?.name?.split(' ')[0] || '',
                                        lastName: user?.name?.split(' ')[1] || '',
                                        email: user?.email || '',
                                    });
                                }}>Cancel</button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn btn-primary px-8"
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </form>
                </section>

                {/* Security */}
                <section className="card">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">Security</h2>
                    <form onSubmit={handlePasswordUpdate} className="space-y-6 max-w-2xl">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
                            <input
                                name="currentPassword"
                                className="input-field"
                                type="password"
                                placeholder="••••••••"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                                <input
                                    name="newPassword"
                                    className="input-field"
                                    type="password"
                                    placeholder="Enter new password"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                                <input
                                    name="confirmPassword"
                                    className="input-field"
                                    type="password"
                                    placeholder="Confirm new password"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={passwordLoading}
                                className="btn btn-primary px-8"
                            >
                                {passwordLoading ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <div>
                            <p className="font-bold text-gray-900 dark:text-white">Two-Factor Authentication</p>
                            <p className="text-sm text-gray-500 mt-1">Add an extra layer of security to your account</p>
                        </div>
                        <button onClick={() => alert('Two-factor authentication setup coming soon.')} className="btn btn-secondary px-6">Setup</button>
                    </div>
                </section>

                {/* Notifications */}
                <section className="card">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">Notifications</h2>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">Email Notifications</p>
                                <p className="text-sm text-gray-500 mt-1">Receive updates and alerts via email</p>
                            </div>
                            <div className="w-12 h-6 bg-indigo-600 rounded-full relative cursor-pointer shadow-inner">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                            </div>
                        </div>
                        <div className="space-y-3 pl-4">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" defaultChecked className="w-5 h-5 rounded-lg border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Project updates and mentions</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" defaultChecked className="w-5 h-5 rounded-lg border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Task assignments and deadlines</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" className="w-5 h-5 rounded-lg border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Weekly summary reports</span>
                            </label>
                        </div>
                    </div>
                </section>

                {/* Appearance */}
                <section className="card">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">Appearance</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <button
                            onClick={() => isDark && toggleTheme()}
                            className={`p-4 rounded-2xl border-2 transition-all text-left ${!isDark ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-100 dark:border-gray-800'}`}
                        >
                            <div className="w-full h-20 bg-white shadow-sm rounded-xl mb-4 border border-gray-200"></div>
                            <p className="font-bold text-gray-900 dark:text-white">Light</p>
                        </button>
                        <button
                            onClick={() => !isDark && toggleTheme()}
                            className={`p-4 rounded-2xl border-2 transition-all text-left ${isDark ? 'border-indigo-600 bg-indigo-900/10' : 'border-gray-100 dark:border-gray-800'}`}
                        >
                            <div className="w-full h-20 bg-gray-900 rounded-xl mb-4 border border-gray-700"></div>
                            <p className="font-bold text-gray-900 dark:text-white">Dark</p>
                        </button>
                        <button className="p-4 rounded-2xl border-2 border-gray-100 dark:border-gray-800 text-left opacity-50 cursor-not-allowed">
                            <div className="w-full h-20 bg-gradient-to-r from-gray-100 to-gray-900 rounded-xl mb-4 border border-gray-400"></div>
                            <p className="font-bold text-gray-900 dark:text-white">Auto</p>
                        </button>
                    </div>
                </section>

                {/* Danger Zone */}
                <section className="card border-rose-100 dark:border-rose-900/30">
                    <h2 className="text-xl font-bold text-rose-600 mb-6 border-b border-rose-50 dark:border-rose-900/10 pb-4">Danger Zone</h2>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">Deactivate Account</p>
                                <p className="text-sm text-gray-500 mt-1">Temporarily disable your account</p>
                            </div>
                            <button onClick={() => alert('Account deactivated successfully.')} className="btn border border-gray-200 dark:border-gray-800 px-6 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-rose-600">Deactivate</button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-rose-50 dark:bg-rose-900/10 rounded-2xl">
                            <div>
                                <p className="font-bold text-rose-700 dark:text-rose-400">Delete Account</p>
                                <p className="text-sm text-rose-600 dark:text-rose-400/80 mt-1 font-medium">Permanently delete your account and all data</p>
                            </div>
                            <button onClick={() => window.confirm('Are you sure you want to delete your account permanently?') && alert('Account deleted.')} className="btn bg-rose-600 text-white px-8 font-black shadow-lg shadow-rose-600/20 active:scale-95 transition-all">Delete</button>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default SettingsPage;
