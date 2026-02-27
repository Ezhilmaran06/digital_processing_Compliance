import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import requestService from '../services/requestService';
import KPICard from '../components/KPICard';
import StatusChart from '../components/StatusChart';
import TrendChart from '../components/TrendChart';

const EmployeeDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [stats, setStats] = useState({ summary: { total: 0, pending: 0, approved: 0, rejected: 0 } });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            const [requestsResponse, statsResponse] = await Promise.all([
                requestService.getAll(),
                requestService.getStats()
            ]);

            const requestsData = requestsResponse.data || [];
            setRequests(requestsData);

            if (statsResponse.success && statsResponse.data) {
                setStats(statsResponse.data);
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    // ... existing getGreeting ...

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const trendData = stats?.trends?.map(t => ({ name: new Date(t.name).toLocaleDateString('en-US', { weekday: 'short' }), value: t.value })) || [];

    const statusData = [
        { name: 'Approved', value: stats.summary?.approved || 0 },
        { name: 'Pending', value: stats.summary?.pending || 0 },
        { name: 'Rejected', value: stats.summary?.rejected || 0 },
    ];

    return (
        <div className="max-w-[1700px] mx-auto px-4 py-4">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-2 mb-2 animate-fade-in">
                <div>
                    <h1 className="text-5xl font-display font-black text-slate-900 dark:text-white tracking-tight">
                        {getGreeting()}, <span className="text-indigo-600 dark:text-indigo-400">{user?.name?.split(' ')[0]}</span>
                    </h1>
                    <p className="text-xl text-slate-500 dark:text-slate-400 mt-3 font-medium max-w-2xl">
                        Welcome to your workspace. Here's a snapshot of your current change requests.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => alert('Exporting Report...')}
                        className="btn btn-secondary border-slate-200/60 shadow-sm"
                    >
                        <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        Export Data
                    </button>
                    <button
                        onClick={() => navigate('/requests/create')}
                        className="btn btn-primary shadow-2xl shadow-indigo-600/30"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                        New Request
                    </button>
                </div>
            </header>

            <main className="animate-slide-up delay-200">
                <div className="space-y-3">
                    {/* KPI Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <KPICard
                            title="Total Requests"
                            value={stats.summary?.total || 0}
                            trend="up"
                            trendValue="12%"
                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                            color="primary"
                            subtext="from last month"
                        />
                        <KPICard
                            title="Pending"
                            value={stats.summary?.pending || 0}
                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                            color="warning"
                            subtext="Requires attention"
                        />
                        <KPICard
                            title="Approved"
                            value={stats.summary?.approved || 0}
                            trend="up"
                            trendValue="8.5%"
                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                            color="success"
                            subtext="Overall approval"
                        />
                        <KPICard
                            title="Rejected"
                            value={stats.summary?.rejected || 0}
                            trend="down"
                            trendValue="2.1%"
                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                            color="danger"
                            subtext="Rejection rate"
                        />
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                        <div className="section-card lg:col-span-2 p-4 bg-white dark:bg-slate-900/50 border-2 border-slate-300 dark:border-indigo-500/40 shadow-premium overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h18v4H3zM3 10h6v4H3zM3 17h6v4H3zM12 10h9v11h-9z" /></svg>
                            </div>
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Request Trends</h2>
                                    <p className="text-[9px] font-black text-slate-500/70 uppercase tracking-widest mt-1">Weekly activity overview</p>
                                </div>
                                <div className="flex bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                                    <button className="px-4 py-1.5 text-[9px] font-black bg-white dark:bg-indigo-600 text-slate-900 dark:text-white rounded-lg shadow-sm transition-all uppercase tracking-widest">7 Days</button>
                                    <button className="px-4 py-1.5 text-[9px] font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all uppercase tracking-widest">30 Days</button>
                                </div>
                            </div>
                            <div className="h-[260px]">
                                <TrendChart data={trendData} />
                            </div>
                        </div>

                        <div className="section-card p-4 bg-white dark:bg-slate-900/50 border-2 border-slate-300 dark:border-indigo-500/40 shadow-premium flex flex-col">
                            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Distribution</h2>
                            <p className="text-[9px] font-black text-slate-500/70 uppercase tracking-widest mb-4">Real-time breakdown</p>
                            <div className="flex-1 flex items-center justify-center">
                                <StatusChart data={statusData} />
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity Table */}
                    <div className="section-card animate-fade-in overflow-hidden p-0">
                        <div className="p-4 border-b-2 border-slate-200 dark:border-indigo-500/40 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Activity Stream</h2>
                                <p className="text-[9px] font-black text-slate-500/70 uppercase tracking-widest mt-1">Real-time request tracking</p>
                            </div>
                            <button
                                onClick={() => navigate('/requests')}
                                className="btn btn-secondary border-slate-200/60 shadow-sm text-[9px] font-black uppercase tracking-widest"
                            >
                                View Archive
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-100/50 dark:bg-slate-950/50 border-b-2 border-slate-300 dark:border-indigo-500/40">
                                    <tr>
                                        <th className="py-4 px-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                                        <th className="py-4 px-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Title &amp; Description</th>
                                        <th className="py-4 px-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                        <th className="py-4 px-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Risk</th>
                                        <th className="py-4 px-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Age</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y-2 divide-slate-200 dark:divide-slate-800">
                                    {loading ? (
                                        Array(5).fill(0).map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td colSpan="5" className="py-8 px-6">
                                                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-full opacity-50"></div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : requests.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="py-24 text-center">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] flex items-center justify-center text-slate-300 mb-6 text-3xl">
                                                        ∅
                                                    </div>
                                                    <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No Active Streams</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        requests.slice(0, 6).map((request) => (
                                            <tr key={request._id} className="hover:bg-slate-100/50 dark:hover:bg-indigo-500/10 transition-all group">
                                                <td className="py-5 px-6">
                                                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-xl uppercase tracking-wider border border-indigo-200/50 dark:border-indigo-700/50">
                                                        CR-{request._id.slice(-4).toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="py-5 px-6">
                                                    <p className="text-base font-black text-slate-900 dark:text-white leading-none mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                        {request.title}
                                                    </p>
                                                </td>
                                                <td className="py-5 px-6">
                                                    <span className={`text-[10px] font-black px-3.5 py-1.5 rounded-xl uppercase tracking-widest border transition-all ${['Approved', 'Completed', 'Sent to Audit'].includes(request.status) ? 'bg-emerald-50 text-emerald-600 border-emerald-500/80 dark:bg-emerald-900/40 dark:border-emerald-500/80 shadow-sm' :
                                                        request.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-500/80 dark:bg-rose-900/40 dark:border-rose-500/80 shadow-sm' :
                                                            'bg-amber-50 text-amber-600 border-amber-500/80 dark:bg-amber-900/40 dark:border-amber-500/80 shadow-sm'
                                                        }`}>
                                                        {request.status}
                                                    </span>
                                                </td>
                                                <td className="py-5 px-6">
                                                    <span className={`text-[10px] font-black px-3.5 py-1.5 rounded-xl uppercase tracking-widest border transition-all ${request.riskLevel === 'Critical' ? 'bg-rose-50 text-rose-600 border-rose-500/80 dark:bg-rose-900/40 dark:border-rose-500/80 shadow-sm' :
                                                        request.riskLevel === 'High' ? 'bg-amber-50 text-amber-600 border-amber-500/80 dark:bg-amber-900/40 dark:border-amber-500/80 shadow-sm' :
                                                            'bg-sky-50 text-sky-600 border-sky-500/80 dark:bg-sky-900/40 dark:border-sky-500/80 shadow-sm'
                                                        }`}>
                                                        {request.riskLevel}
                                                    </span>
                                                </td>
                                                <td className="py-5 px-6 text-[10px] font-black text-slate-400 dark:text-slate-500 text-right uppercase tracking-tighter">
                                                    {new Date(request.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default EmployeeDashboard;
