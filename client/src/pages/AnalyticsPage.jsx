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

    const isManagerOrAdmin = user?.role === 'Manager' || user?.role === 'Admin';

    const fetchData = async () => {
        try {
            const [statsResponse, requestsResponse] = await Promise.all([
                statsService.getRequestStats(),
                isManagerOrAdmin ? requestService.getAll({ status: 'Approved', limit: 100 }) : Promise.resolve({ data: [] })
            ]);
            setStats(statsResponse);
            setApprovedRequests(requestsResponse.data || []);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
            toast.error('Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

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
            <header className="mb-12 animate-fade-in">
                <h1 className="text-5xl font-display font-black text-slate-900 dark:text-white tracking-tight">
                    System <span className="text-indigo-600 dark:text-indigo-400">Intelligence</span>
                </h1>
                <p className="text-xl text-slate-500 dark:text-slate-400 mt-3 font-medium max-w-2xl">
                    Deep-tier behavioral metrics and compliance performance analytics.
                </p>
            </header>

            {/* Quick Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                <div className="animate-slide-up delay-100">
                    <KPICard
                        title="Total Volume"
                        value={totalRequests}
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                        color="primary"
                    />
                </div>
                <div className="animate-slide-up delay-200">
                    <KPICard
                        title="Verified Approved"
                        value={stats?.statusDistribution?.find(s => s.name === 'Approved')?.value || 0}
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        color="success"
                    />
                </div>
                <div className="animate-slide-up delay-300">
                    <KPICard
                        title="Process Yield"
                        value={totalRequests > 0 ? `${Math.round(((stats?.statusDistribution?.find(s => s.name === 'Approved')?.value || 0) / totalRequests) * 100)}%` : '0%'}
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                        color="info"
                    />
                </div>
                <div className="animate-slide-up delay-400">
                    <KPICard
                        title="Metric Streams"
                        value={stats?.trends?.length || 0}
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        color="warning"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Request Trends */}
                <div className="card h-[420px] animate-slide-up delay-500 overflow-hidden">
                    <div className="mb-10">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Demand Velocity</h2>
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1 opacity-70">7-Day request distribution</p>
                    </div>
                    <div className="h-[280px]">
                        <TrendChart data={stats?.trends || []} />
                    </div>
                </div>

                {/* Status Distribution */}
                <div className="card h-[420px] animate-slide-up delay-500 overflow-hidden">
                    <div className="mb-10">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Lifecycle Flow</h2>
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1 opacity-70">Current state distribution</p>
                    </div>
                    <div className="h-[280px]">
                        <StatusChart data={stats?.statusDistribution || []} />
                    </div>
                </div>

                {/* Type Distribution */}
                <div className="card lg:col-span-2 h-[450px] animate-slide-up delay-700 overflow-hidden">
                    <div className="mb-10">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Categorical Analysis</h2>
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1 opacity-70">Distribution by change typology</p>
                    </div>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.typeDistribution || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'rgba(0,0,0,0.4)', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'rgba(0,0,0,0.4)', fontSize: 10, fontWeight: 900 }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                    contentStyle={{
                                        borderRadius: '24px',
                                        border: 'none',
                                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
                                        padding: '20px',
                                        background: 'rgba(255,255,255,0.9)',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                />
                                <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={50}>
                                    {(stats?.typeDistribution || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Approved Requests Table - Only for Managers and Admins */}
            {isManagerOrAdmin && (
                <div className="card animate-slide-up delay-900 mb-12">
                    <div className="mb-8">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Approved Requests</h2>
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1 opacity-70">
                            Ready for audit submission • {approvedRequests.length} requests
                        </p>
                    </div>

                    {approvedRequests.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="mt-4 text-slate-500 font-medium">No approved requests available</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-700">
                                        <th className="text-left py-4 px-4 text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Title</th>
                                        <th className="text-left py-4 px-4 text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Change Type</th>
                                        <th className="text-left py-4 px-4 text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Risk Level</th>
                                        <th className="text-left py-4 px-4 text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Environment</th>
                                        <th className="text-left py-4 px-4 text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Created</th>
                                        <th className="text-left py-4 px-4 text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {approvedRequests.map((request, index) => (
                                        <tr
                                            key={request._id}
                                            className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            <td className="py-4 px-4">
                                                <p className="font-bold text-slate-900 dark:text-white">{request.title}</p>
                                                <p className="text-sm text-slate-500 mt-1 line-clamp-1">{request.description}</p>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                                                    {request.changeType}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${request.riskLevel === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                    request.riskLevel === 'High' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                                        request.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    }`}>
                                                    {request.riskLevel}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    {request.environment}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                                    {formatDate(request.createdAt)}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <button
                                                    onClick={() => handleSendToAudit(request._id)}
                                                    disabled={loadingRequests[request._id]}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white text-sm font-bold rounded-xl transition-colors disabled:cursor-not-allowed"
                                                >
                                                    {loadingRequests[request._id] ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                            Sending...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            Send to Audit
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default AnalyticsPage;

