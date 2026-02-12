import { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import KPICard from '../components/KPICard';
import StatusChart from '../components/StatusChart';

const AdminDashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [analyticsResponse, logsResponse] = await Promise.all([
                adminService.getAnalytics(),
                adminService.getAuditLogs({ limit: 10 }),
            ]);
            setAnalytics(analyticsResponse.data);
            setAuditLogs(logsResponse.data || []);
        } catch (error) {
            console.error('Failed to load admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportLogs = async () => {
        try {
            await adminService.exportAuditLogs();
        } catch (error) {
            alert('Failed to export audit logs: ' + error.message);
        }
    };

    const statusData = [
        { name: 'Approved', value: analytics?.requests?.approved || 0 },
        { name: 'Pending', value: analytics?.requests?.pending || 0 },
        { name: 'Rejected', value: analytics?.requests?.rejected || 0 },
    ];

    return (
        <>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 animate-fade-in">
                <div>
                    <h1 className="text-5xl font-display font-black text-slate-900 dark:text-white tracking-tight">Admin <span className="text-indigo-600 dark:text-indigo-400">Console</span></h1>
                    <p className="text-xl text-slate-500 dark:text-slate-400 mt-3 font-medium max-w-2xl">Global monitoring, security audits, and system management</p>
                </div>
                <button
                    onClick={handleExportLogs}
                    className="btn btn-primary shadow-2xl shadow-indigo-600/30"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Export System Audit
                </button>
            </header>

            {/* System Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                <div className="animate-slide-up delay-100">
                    <KPICard
                        title="Total Requests"
                        value={analytics?.requests?.total || 0}
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                        color="primary"
                        subtext={`+${analytics?.requests?.recentCount || 0} this month`}
                    />
                </div>
                <div className="animate-slide-up delay-200">
                    <KPICard
                        title="Active Users"
                        value={analytics?.users?.active || 0}
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                        color="info"
                        subtext={`${analytics?.users?.total || 0} total users`}
                    />
                </div>
                <div className="animate-slide-up delay-300">
                    <KPICard
                        title="Approval Rate"
                        value={`${analytics?.metrics?.approvalRate || 0}%`}
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04M12 2.944a11.955 11.955 0 018.618 3.04M12 2.944V21m0-18.056L3.382 6m17.236 0L12 21" /></svg>}
                        color="success"
                        subtext="System lifetime"
                    />
                </div>
                <div className="animate-slide-up delay-400">
                    <KPICard
                        title="Pending Review"
                        value={analytics?.requests?.pending || 0}
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                        color="warning"
                        subtext="Requires attention"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Audit Logs */}
                <div className="lg:col-span-2 animate-slide-up delay-500">
                    <section className="card">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Audit Stream</h2>
                                <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1 opacity-70">Security & system events</p>
                            </div>
                            <div className="flex gap-2">
                                <span className="badge bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/30">Live Monitoring</span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50 dark:bg-slate-900/30">
                                        <th className="py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timestamp</th>
                                        <th className="py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">User</th>
                                        <th className="py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Action</th>
                                        <th className="py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Node</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                    {loading ? (
                                        Array(6).fill(0).map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td colSpan="4" className="py-6 px-6">
                                                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-full opacity-50"></div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : auditLogs.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="py-24 text-center">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] flex items-center justify-center text-slate-300 mb-6 text-3xl">
                                                        ∅
                                                    </div>
                                                    <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No Events Recorded</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        auditLogs.map((log) => (
                                            <tr key={log._id} className="group hover:bg-white/50 dark:hover:bg-white/5 transition-all">
                                                <td className="py-5 px-6 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
                                                    {new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="py-5 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-[12px] font-black text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-800/30">
                                                            {log.userId?.name?.slice(0, 1).toUpperCase() || 'S'}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{log.userId?.name || 'System Network'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-5 px-6">
                                                    <span className={`text-[11px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider ${log.action.includes('CREATE') ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400' :
                                                        log.action.includes('LOGIN') ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' :
                                                            'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                                        }`}>
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="py-5 px-6 text-[11px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase">
                                                    {log.ipAddress || 'Internal'}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-8 animate-slide-up delay-700">
                    <section className="card">
                        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-8">System Distribution</h2>
                        <StatusChart data={statusData} />
                    </section>

                    <section className="card p-8">
                        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-8">User Segments</h2>
                        <div className="space-y-4">
                            {analytics?.users?.byRole?.map((role) => (
                                <div key={role._id} className="flex justify-between items-center p-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-slate-100/50 dark:border-slate-800/30 group hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-all">
                                    <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{role._id} Accounts</span>
                                    <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 tabular-nums">{role.count}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
};

export default AdminDashboard;
