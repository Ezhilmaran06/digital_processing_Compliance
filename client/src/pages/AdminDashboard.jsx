import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../services/adminService';
import requestService from '../services/requestService';
import KPICard from '../components/KPICard';
import StatusChart from '../components/StatusChart';
import { toast } from 'sonner';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState(null);
    const [auditLogs, setAuditLogs] = useState([]);
    const [users, setUsers] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    const getAvatarUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '').replace(/\/$/, '') || '';
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        const timestamp = new Date().getTime();
        return `${baseUrl}${cleanPath}?t=${timestamp}`;
    };

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        try {
            setLoading(true);
            if (activeTab === 'overview') {
                const [analyticsResponse, logsResponse] = await Promise.all([
                    adminService.getAnalytics(),
                    adminService.getAuditLogs({ limit: 10 }),
                ]);
                setAnalytics(analyticsResponse.data);
                setAuditLogs(logsResponse.data || []);
            } else if (activeTab === 'users') {
                const response = await adminService.getUsers();
                setUsers(response.data || []);
            } else if (activeTab === 'requests') {
                const response = await requestService.getAll();
                setRequests(response.data || []);
            } else if (activeTab === 'audit') {
                const response = await adminService.getAuditLogs({ limit: 50 });
                setAuditLogs(response.data || []);
            }
        } catch (error) {
            console.error('Failed to load admin data:', error);
            toast.error('Failed to sync system data');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleUserStatus = async (user) => {
        try {
            await adminService.updateUser(user._id, { isActive: !user.isActive });
            toast.success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
            loadData();
        } catch (error) {
            toast.error(error.message || 'Action failed');
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure? This action is permanent.')) return;
        try {
            await adminService.deleteUser(id);
            toast.success('User purged from system');
            loadData();
        } catch (error) {
            toast.error(error.message || 'Delete failed');
        }
    };

    const handleDeleteRequest = async (id) => {
        if (!window.confirm('Delete this compliance record?')) return;
        try {
            await requestService.delete(id);
            toast.success('Record deleted');
            loadData();
        } catch (error) {
            toast.error('Failed to delete record');
        }
    };

    const handleExportLogs = async () => {
        try {
            await adminService.exportAuditLogs();
        } catch (error) {
            toast.error('Export failed');
        }
    };

    // User role distribution for the pie chart
    const userRoleData = (analytics?.users?.byRole || []).map(role => ({
        name: role._id,
        value: role.count
    }));

    const tabs = [
        { id: 'overview', label: 'System Overview', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
        { id: 'users', label: 'User Directory', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
        { id: 'requests', label: 'Global Requests', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        { id: 'audit', label: 'Security Audit', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04M12 2.944a11.955 11.955 0 018.618 3.04M12 2.944V21m0-18.056L3.382 6m17.236 0L12 21' },
    ];

    return (
        <div className="max-w-[1700px] mx-auto px-4 py-4">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-2 mb-2 animate-fade-in text-tight">
                <div>
                    <h1 className="text-5xl font-display font-black text-slate-900 dark:text-white tracking-tight">Admin <span className="text-indigo-600 dark:text-indigo-400">Console</span></h1>
                    <p className="text-xl text-slate-500 dark:text-slate-400 mt-3 font-medium max-w-2xl">Global system oversight and compliance governance</p>
                </div>
                {activeTab === 'audit' && (
                    <button onClick={handleExportLogs} className="btn btn-primary shadow-2xl shadow-indigo-600/30">
                        Export System Audit
                    </button>
                )}
            </header>

            {/* Navigation Tabs */}
            <nav className="flex flex-wrap items-center gap-1 mb-2 p-1 bg-slate-100/80 dark:bg-slate-900/40 backdrop-blur-xl rounded-[1rem] border-2 border-slate-300/50 dark:border-indigo-500/40 w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 relative ${activeTab === tab.id
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={tab.icon} />
                        </svg>
                        {tab.label}
                        {activeTab === tab.id && (
                            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-500 dark:bg-indigo-400 rounded-full shadow-lg shadow-indigo-500/50"></span>
                        )}
                    </button>
                ))}
            </nav>

            <main className="animate-slide-up delay-200">
                {activeTab === 'overview' && (
                    <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <KPICard title="Total Requests" value={analytics?.requests?.total || 0} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} color="primary" subtext={`+${analytics?.requests?.recentCount || 0} this month`} />
                            <KPICard title="Active Global Users" value={analytics?.users?.active || 0} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} color="info" subtext={`${analytics?.users?.total || 0} total users`} />
                            <KPICard title="System Approval Rate" value={`${analytics?.metrics?.approvalRate || 0}%`} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04M12 2.944a11.955 11.955 0 018.618 3.04M12 2.944V21m0-18.056L3.382 6m17.236 0L12 21" /></svg>} color="success" subtext="Global performance" />
                            <KPICard title="Awaiting Compliance" value={analytics?.requests?.pending || 0} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} color="warning" subtext="System-wide pending" />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                            <div className="lg:col-span-2 section-card p-4 bg-white dark:bg-slate-900/50 border-2 border-slate-300 dark:border-indigo-500/40 shadow-premium relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                </div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">User Distribution</h3>
                                <StatusChart data={userRoleData} label="Users" />
                            </div>
                            <div className="section-card p-4 bg-white dark:bg-slate-900/50 border-2 border-slate-300 dark:border-indigo-500/40 shadow-premium">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Request Status</h3>
                                <div className="grid grid-cols-1 gap-2">
                                    <div className="flex justify-between items-center p-3 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-[1rem] border-2 border-emerald-500/80 dark:border-emerald-500/80 hover:bg-emerald-500/10 transition-all cursor-pointer group/card">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                            <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Approved</span>
                                        </div>
                                        <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter">{analytics?.requests?.approved || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-amber-500/5 dark:bg-amber-500/10 rounded-[1rem] border-2 border-amber-500/80 dark:border-amber-500/80 hover:bg-amber-500/10 transition-all cursor-pointer group/card">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
                                            <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">Pending</span>
                                        </div>
                                        <span className="text-xl font-black text-amber-600 dark:text-amber-400 tracking-tighter">{analytics?.requests?.pending || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-rose-500/5 dark:bg-rose-500/10 rounded-[1rem] border-2 border-rose-500/80 dark:border-rose-500/80 hover:bg-rose-500/10 transition-all cursor-pointer group/card">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>
                                            <span className="text-[9px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">Rejected</span>
                                        </div>
                                        <span className="text-xl font-black text-rose-600 dark:text-rose-400 tracking-tighter">{analytics?.requests?.rejected || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {(activeTab === 'users') && (
                    <div className="section-card animate-fade-in overflow-hidden p-0">
                        <table className="w-full text-left">
                            <thead className="bg-slate-100/50 dark:bg-slate-950/50 border-b-2 border-slate-300 dark:border-indigo-500/40">
                                <tr>
                                    <th className="py-4 px-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Identity</th>
                                    <th className="py-4 px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                                    <th className="py-4 px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">State</th>
                                    <th className="py-4 px-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-slate-200 dark:divide-slate-800">
                                {users.map(user => (
                                    <tr key={user._id} className="hover:bg-slate-100/50 dark:hover:bg-indigo-500/10 transition-all group">
                                        <td className="py-8 px-10">
                                            <div className="flex items-center gap-5">
                                                <div className="relative">
                                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/40 dark:to-slate-900 flex items-center justify-center text-xl font-black text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-800/50 overflow-hidden shadow-sm shadow-indigo-100 dark:shadow-none transition-transform group-hover:scale-110 duration-300">
                                                        {user.avatar ? (
                                                            <img
                                                                src={getAvatarUrl(user.avatar)}
                                                                alt={user.name}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    e.target.parentElement.textContent = user.name?.[0]?.toUpperCase() || '?';
                                                                }}
                                                            />
                                                        ) : (
                                                            user.name?.[0]?.toUpperCase()
                                                        )}
                                                    </div>
                                                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${user.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                                                </div>
                                                <div>
                                                    <p className="text-base font-black text-slate-900 dark:text-white leading-none mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{user.name}</p>
                                                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tight">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-8 px-8">
                                            <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest border transition-colors ${user.role === 'Admin' ? 'bg-indigo-50 text-indigo-600 border-indigo-500/70 dark:bg-indigo-900/40 dark:border-indigo-500/70 shadow-sm' :
                                                user.role === 'Manager' ? 'bg-emerald-50 text-emerald-600 border-emerald-500/70 dark:bg-emerald-900/40 dark:border-emerald-500/70 shadow-sm' :
                                                    'bg-slate-100 text-slate-600 border-slate-400 dark:bg-slate-800 dark:border-slate-700 shadow-sm'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="py-8 px-8">
                                            <span className={`flex items-center gap-2.5 text-[10px] font-black tracking-widest ${user.isActive ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {user.isActive ? 'OPERATIONAL' : 'DEACTIVATED'}
                                            </span>
                                        </td>
                                        <td className="py-5 px-10 text-right">
                                            <div className="flex items-center justify-end gap-3 transition-all duration-300">
                                                <button
                                                    onClick={() => navigate(`/user-management`)}
                                                    className="p-2 bg-indigo-50 text-indigo-600 border-2 border-indigo-500/50 rounded-xl hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-500/30 transition-all shadow-sm"
                                                    title="Edit Identity"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                </button>
                                                <button
                                                    onClick={() => handleToggleUserStatus(user)}
                                                    className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm border-2 ${user.isActive
                                                        ? 'bg-amber-50 text-amber-600 border-amber-500/50 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-500/30'
                                                        : 'bg-emerald-50 text-emerald-600 border-emerald-500/50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-500/30'}`}
                                                >
                                                    {user.isActive ? 'Deactivate' : 'Activate'}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user._id)}
                                                    className="px-5 py-2 bg-rose-50 text-rose-600 border-2 border-rose-500/50 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 hover:shadow-lg hover:shadow-rose-200/50 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-500/30 transition-all shadow-sm"
                                                >
                                                    Purge
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {(activeTab === 'requests') && (
                    <div className="section-card animate-fade-in overflow-hidden p-0">
                        <table className="w-full text-left">
                            <thead className="bg-slate-100/50 dark:bg-slate-950/50 border-b-2 border-slate-300 dark:border-indigo-500/40">
                                <tr>
                                    <th className="py-4 px-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Record</th>
                                    <th className="py-4 px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Requester</th>
                                    <th className="py-4 px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Node</th>
                                    <th className="py-4 px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">State</th>
                                    <th className="py-4 px-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-slate-200 dark:divide-slate-800">
                                {requests.map(req => (
                                    <tr key={req._id} className="hover:bg-slate-100/50 dark:hover:bg-indigo-500/10 transition-all group">
                                        <td className="py-8 px-10">
                                            <p className="text-base font-black text-slate-900 dark:text-white leading-tight mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{req.title}</p>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter transition-opacity group-hover:opacity-100 opacity-70">NODE ID: {req._id.slice(-6).toUpperCase()}</span>
                                            </div>
                                        </td>
                                        <td className="py-8 px-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px] font-black border border-indigo-100/50 dark:border-indigo-800/50">
                                                    {req.createdBy?.name?.charAt(0) || 'S'}
                                                </div>
                                                <p className="text-[10px] text-slate-700 dark:text-slate-300 font-black uppercase tracking-widest">{req.createdBy?.name || 'SYSTEM CORE'}</p>
                                            </div>
                                        </td>
                                        <td className="py-8 px-8">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-[0.15em]">{req.changeType}</span>
                                            </div>
                                        </td>
                                        <td className="py-8 px-8">
                                            <span className={`text-[10px] font-black px-3.5 py-1.5 rounded-xl uppercase tracking-widest border transition-all ${['Approved', 'Completed', 'Sent to Audit'].includes(req.status) ? 'bg-emerald-50 text-emerald-600 border-emerald-500/80 dark:bg-emerald-900/40 dark:border-emerald-500/80 shadow-sm' :
                                                req.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-500/80 dark:bg-amber-900/40 dark:border-amber-500/80 shadow-sm' :
                                                    'bg-slate-50 text-slate-600 border-slate-400 dark:bg-slate-800 dark:border-slate-700 shadow-sm'
                                                }`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="py-5 px-10 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/requests`)}
                                                    className="p-2 bg-indigo-50 text-indigo-600 border-2 border-indigo-500/50 rounded-xl hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-500/30 transition-all shadow-sm"
                                                    title="Edit Record"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteRequest(req._id)}
                                                    className="p-2 bg-rose-50 text-rose-600 border-2 border-rose-500/50 rounded-xl hover:bg-rose-100 hover:shadow-lg hover:shadow-rose-200/50 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-500/30 transition-all shadow-sm"
                                                    title="Purge Record"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {(activeTab === 'audit' || (activeTab === 'overview' && auditLogs.length > 0)) && (
                    <div className={`animate-fade-in ${activeTab === 'overview' ? 'mt-3' : ''}`}>
                        <section className="section-card p-0 overflow-hidden">
                            <div className="p-4 border-b-2 border-slate-200 dark:border-indigo-500/40">
                                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">System Audit Stream</h2>
                                <p className="text-[9px] font-black text-slate-500/70 uppercase tracking-widest mt-1">High-fidelity log of global operations</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-100/50 dark:bg-slate-950/50 border-b-2 border-slate-200 dark:border-indigo-500/30">
                                            <th className="py-8 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Event Timestamp</th>
                                            <th className="py-8 px-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Origin Identity</th>
                                            <th className="py-8 px-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Operational Action</th>
                                            <th className="py-8 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Network Source</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y-2 divide-slate-100/80 dark:divide-slate-800">
                                        {auditLogs.map((log) => (
                                            <tr key={log._id} className="group hover:bg-slate-100/50 dark:hover:bg-indigo-500/10 transition-all">
                                                <td className="py-5 px-10">
                                                    <div className="flex flex-col">
                                                        <span className="text-[11px] font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tighter">
                                                            {new Date(log.timestamp).toLocaleDateString()}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-5 px-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/40 dark:to-slate-900 flex items-center justify-center text-[11px] font-black text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-800/50 overflow-hidden shadow-sm shadow-indigo-100 dark:shadow-none transition-transform group-hover:scale-110">
                                                            {log.userId?.avatar ? (
                                                                <img
                                                                    src={getAvatarUrl(log.userId.avatar)}
                                                                    alt={log.userId.name}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        e.target.style.display = 'none';
                                                                        e.target.parentElement.textContent = log.userId?.name?.slice(0, 1).toUpperCase() || 'S';
                                                                    }}
                                                                />
                                                            ) : (
                                                                log.userId?.name?.slice(0, 1).toUpperCase() || 'S'
                                                            )}
                                                        </div>
                                                        <p className="text-sm font-black text-slate-900 dark:text-white leading-none">{log.userId?.name || 'SYSTEM ROOT'}</p>
                                                    </div>
                                                </td>
                                                <td className="py-5 px-8">
                                                    <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-[0.15em] border transition-colors ${log.action.includes('CREATE') ? 'bg-indigo-50 text-indigo-600 border-indigo-500/80 dark:bg-indigo-900/40 dark:border-indigo-500/80' :
                                                        log.action.includes('LOGIN') ? 'bg-emerald-50 text-emerald-600 border-emerald-500/80 dark:bg-emerald-900/40 dark:border-emerald-500/80' :
                                                            'bg-slate-100 text-slate-600 border-slate-400 dark:bg-slate-800 dark:border-slate-700'
                                                        }`}>
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="py-5 px-10">
                                                    <span className="text-[11px] font-mono font-black text-slate-400 group-hover:text-indigo-500 transition-colors uppercase">
                                                        {log.ipAddress || 'Internal Loop'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;

