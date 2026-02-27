import { useState, useEffect } from 'react';
import statsService from '../services/statsService';
import requestService from '../services/requestService';
import managerService from '../services/managerService';
import { useAuth } from '../context/AuthContext';
import StatusChart from '../components/StatusChart';
import TrendChart from '../components/TrendChart';
import KPICard from '../components/KPICard';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { toast } from 'sonner';

const AnalyticsPage = () => {
    const [stats, setStats] = useState(null);
    const [approvedRequests, setApprovedRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingRequests, setLoadingRequests] = useState({});
    const { user } = useAuth();

    const COLORS = ['#8b5cf6', '#d946ef', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];

    const isManagerOrAdmin = ['manager', 'admin'].includes(user?.role?.toLowerCase());

    const fetchData = async () => {
        try {
            const [statsResponse, requestsResponse] = await Promise.all([
                statsService.getRequestStats(),
                isManagerOrAdmin ? requestService.getAll({ status: 'Approved,Completed,Sent to Audit', limit: 100 }) : Promise.resolve({ data: [] })
            ]);

            // Backend returns { success: true, data: { statusDistribution: [], ... } }
            setStats(statsResponse?.data || statsResponse || null);

            // Backend returns { success: true, data: [ ...reqs ], ... }
            const requestsData = requestsResponse?.data || (Array.isArray(requestsResponse) ? requestsResponse : []);
            setApprovedRequests(requestsData);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
            toast.error('Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const handleSendToAudit = async (requestId) => {
        setLoadingRequests(prev => ({ ...prev, [requestId]: true }));

        try {
            await managerService.sendToAudit(requestId);
            toast.success('Request successfully sent to audit');

            // Refresh data without page reload
            await fetchData();
        } catch (error) {
            console.error('Failed to send request to audit:', error);
            toast.error(error.message || 'Failed to send request to audit');
        } finally {
            setLoadingRequests(prev => ({ ...prev, [requestId]: false }));
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <main className="content-container">
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            </main>
        );
    }

    const totalRequests = stats?.statusDistribution?.reduce((acc, curr) => acc + curr.value, 0) || 0;

    return (
        <>
            <header className="mb-2 animate-fade-in">
                <h1 className="text-5xl font-display font-black text-slate-900 dark:text-white tracking-tight">
                    System <span className="text-indigo-600 dark:text-indigo-400">Intelligence</span>
                </h1>
                <p className="text-xl text-slate-500 dark:text-slate-400 mt-3 font-medium max-w-2xl">
                    Deep-tier behavioral metrics and compliance performance analytics.
                </p>
            </header>

            {/* DEBUG BANNER FOR VERIFICATION */}
            <div className="bg-slate-100 dark:bg-slate-900/40 p-2 rounded-xl mb-3 flex gap-4 text-[9px] font-black uppercase tracking-widest text-slate-400 items-center border-2 border-slate-300/30 dark:border-indigo-500/20">
                <span>User: {user?.name} ({user?.role})</span>
                <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-800"></span>
                <span>Stats: {stats ? 'LIVE' : 'OFFLINE'}</span>
                <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-800"></span>
                <span>Approvals: {approvedRequests.length}</span>
                <button
                    onClick={async () => {
                        try {
                            const res = await fetch('/api/debug/force-seed');
                            const data = await res.json();
                            if (data.success) {
                                toast.success(data.message);
                                fetchData();
                            }
                        } catch (err) {
                            toast.error('Seeding failed');
                        }
                    }}
                    className="text-emerald-500 ml-4 border-l-2 pl-4 border-slate-200 dark:border-slate-800"
                >
                    Reinstate Data
                </button>
                <button onClick={fetchData} className="text-indigo-500 ml-auto">Sync</button>
            </div>

            {/* Quick Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
                <div className="animate-slide-up delay-100">
                    <KPICard
                        title="Total Volume"
                        value={totalRequests}
                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                        color="primary"
                    />
                </div>
                <div className="animate-slide-up delay-200">
                    <KPICard
                        title="Verified Approved"
                        value={stats?.summary?.approved || 0}
                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        color="success"
                    />
                </div>
                <div className="animate-slide-up delay-300">
                    <KPICard
                        title="Process Yield"
                        value={totalRequests > 0 ? `${Math.round(((stats?.summary?.approved || 0) / totalRequests) * 100)}%` : '0%'}
                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                        color="info"
                    />
                </div>
                <div className="animate-slide-up delay-400">
                    <KPICard
                        title="Metric Streams"
                        value={stats?.trends?.length || 0}
                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        color="warning"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-3">
                {/* Request Trends */}
                <div className="section-card h-[380px] p-4 animate-slide-up delay-500 overflow-hidden">
                    <div className="mb-4">
                        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Demand Velocity</h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 opacity-70">7-Day request distribution</p>
                    </div>
                    <div className="h-[260px]">
                        <TrendChart data={stats?.trends || []} />
                    </div>
                </div>

                {/* Status Distribution */}
                <div className="section-card h-[380px] p-4 animate-slide-up delay-500 overflow-hidden">
                    <div className="mb-4">
                        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Lifecycle Flow</h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 opacity-70">Current state distribution</p>
                    </div>
                    <div className="h-[260px]">
                        <StatusChart data={stats?.statusDistribution || []} />
                    </div>
                </div>

                {/* Type Distribution */}
                <div className="section-card lg:col-span-2 h-[400px] p-4 animate-slide-up delay-700 overflow-hidden">
                    <div className="mb-4">
                        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Categorical Analysis</h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 opacity-70">Distribution by change typology</p>
                    </div>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.typeDistribution || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'rgba(100,116,139,0.6)', fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'rgba(100,116,139,0.6)', fontSize: 9, fontWeight: 900 }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                    contentStyle={{
                                        borderRadius: '16px',
                                        border: '2px solid rgba(79, 70, 229, 0.2)',
                                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
                                        padding: '12px',
                                        background: 'rgba(255,255,255,0.95)',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                />
                                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={40}>
                                    {(stats?.typeDistribution || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.9} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Approved Requests Table - Only for Managers and Admins */}
            {isManagerOrAdmin && (
                <div className="section-card animate-slide-up delay-900 mb-8 p-0 overflow-hidden">
                    <div className="p-4 border-b-2 border-slate-100 dark:border-slate-800">
                        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Processed Compliance Records</h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 opacity-70">
                            Verified and ready for audit • {approvedRequests.length} records
                        </p>
                    </div>

                    {approvedRequests.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="mt-4 text-slate-400 font-black uppercase tracking-widest text-[10px]">No synchronized records available</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50/50 dark:bg-slate-950/20">
                                    <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                                        <th className="text-left py-3 px-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Title</th>
                                        <th className="text-left py-3 px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                                        <th className="text-left py-3 px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Risk</th>
                                        <th className="text-left py-3 px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {approvedRequests.map((request, index) => (
                                        <tr
                                            key={request._id}
                                            className="border-b-2 border-slate-50 dark:border-slate-900/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-colors group"
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            <td className="py-4 px-6">
                                                <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{request.title}</p>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">{formatDate(request.createdAt)}</p>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border-2 border-indigo-100 bg-indigo-50/50 text-indigo-600 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-400">
                                                    {request.changeType}
                                                </span>
                                            </td>
                                            <td className="py-5 px-4">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border-2 ${request.riskLevel === 'Critical' ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800' :
                                                    request.riskLevel === 'High' ? 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/20 dark:border-orange-810/30' :
                                                        'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800'
                                                    }`}>
                                                    {request.riskLevel}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-2.5">
                                                    {user?.role === 'Admin' ? (
                                                        /* Admin: Read-only status indicator or sent status */
                                                        request.status === 'Sent to Audit' || request.status === 'Completed' ? (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 border-2 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest rounded-lg">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                                                SENT
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-900/30 border-2 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 text-[9px] font-black uppercase tracking-widest rounded-lg">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
                                                                PENDING
                                                            </span>
                                                        )
                                                    ) : (
                                                        /* Manager: Action button or sent status */
                                                        request.status === 'Sent to Audit' || request.status === 'Completed' ? (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 border-2 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest rounded-lg">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                                                SENT
                                                            </span>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleSendToAudit(request._id)}
                                                                disabled={loadingRequests[request._id]}
                                                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-[9px] font-black uppercase tracking-widest rounded-xl border-2 border-indigo-500 shadow-premium transition-all hover:scale-105 active:scale-95"
                                                            >
                                                                {loadingRequests[request._id] ? 'Syncing...' : 'Send to Audit'}
                                                            </button>
                                                        )
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div >
            )}
        </>
    );
};

export default AnalyticsPage;

