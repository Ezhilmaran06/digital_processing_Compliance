import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import requestService from '../services/requestService';
import statsService from '../services/statsService';
import KPICard from '../components/KPICard';
import StatusChart from '../components/StatusChart';
import { Clock, CheckCircle, XCircle, AlertTriangle, ArrowRight, Activity, Calendar } from 'lucide-react';
import Modal from '../components/Modal';
import { toast } from 'sonner';

const ManagerDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user]);

    const loadData = async () => {
        try {
            const [requestsRes, statsRes] = await Promise.all([
                requestService.getAll({ status: 'Pending,Approved,Completed,Sent to Audit', limit: 100 }),
                statsService.getRequestStats()
            ]);

            const requestsData = requestsRes.data || [];
            setRequests(requestsData);
            setPendingRequests(requestsData.filter(r => r.status === 'Pending'));
            setStats(statsRes.data);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            toast.error('Error loading dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await requestService.approve(id);
            setRequests(prev => prev.map(r => r._id === id ? { ...r, status: 'Approved' } : r));
            setPendingRequests(prev => prev.filter(r => r._id !== id));
            toast.success('Request approved successfully');
        } catch (error) {
            console.error('Approve failed:', error);
            toast.error('Failed to approve request');
        }
    };

    const openRejectModal = (request) => {
        setSelectedRequest(request);
        setRejectionReason('');
        setRejectModalOpen(true);
    };

    const handleRejectSubmit = async () => {
        if (!selectedRequest) return;
        if (!rejectionReason.trim()) {
            toast.error('Please provide a rejection reason');
            return;
        }

        try {
            await requestService.reject(selectedRequest._id, rejectionReason);
            setRequests(prev => prev.map(r => r._id === selectedRequest._id ? { ...r, status: 'Rejected' } : r));
            setPendingRequests(prev => prev.filter(r => r._id !== selectedRequest._id));
            toast.success('Request rejected successfully');
            setRejectModalOpen(false);
            setSelectedRequest(null);
        } catch (error) {
            console.error('Reject failed:', error);
            toast.error('Failed to reject request');
        }
    };

    const statusData = [
        { name: 'Pending', value: requests.filter(r => r.status === 'Pending').length },
        { name: 'Approved', value: requests.filter(r => ['Approved', 'Completed', 'Sent to Audit'].includes(r.status)).length },
        { name: 'Rejected', value: requests.filter(r => r.status === 'Rejected').length },
    ];

    // Helper to check if current user is the creator
    const isCreator = (request) => {
        const userId = user?._id || user?.id;
        const requestUserId = request.createdBy?._id || request.createdBy;
        return userId && requestUserId && userId === requestUserId;
    };

    return (
        <>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 animate-fade-in">
                {/* ... existing header code ... */}
                <div>
                    <h1 className="text-5xl font-display font-black text-slate-900 dark:text-white tracking-tight">Manager <span className="text-indigo-600 dark:text-indigo-400">Board</span></h1>
                    <p className="text-xl text-slate-500 dark:text-slate-400 mt-3 font-medium max-w-2xl">Team orchestration, approval queues, and compliance monitoring</p>
                </div>
                <div className="flex gap-4">
                    <button className="btn btn-secondary border-slate-200/60 shadow-sm font-black text-[11px] uppercase tracking-widest px-6 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Export Reports</button>
                </div>
            </header>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                <div className="animate-slide-up delay-100">
                    <KPICard
                        title="Awaiting Approval"
                        value={stats?.summary?.pending ?? pendingRequests.length}
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        color="warning"
                        subtext="Action Required"
                    />
                </div>
                <div className="animate-slide-up delay-200">
                    <KPICard
                        title="Monthly Thruput"
                        value={stats?.summary?.approved ?? requests.filter(r => ['Approved', 'Completed', 'Sent to Audit'].includes(r.status)).length}
                        trend="up"
                        trendValue="12%"
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        color="success"
                        subtext="+8% from last cycle"
                    />
                </div>
                <div className="animate-slide-up delay-300">
                    <KPICard
                        title="Active Changes"
                        value={stats?.activeChanges ?? requests.filter(r => r.status === 'In Progress').length}
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                        color="info"
                        subtext="Executing phase"
                    />
                </div>
                <div className="animate-slide-up delay-400">
                    <KPICard
                        title="Total Workforce"
                        value={stats?.totalWorkforce ?? "..."}
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                        color="primary"
                        subtext="Authorized personnel"
                    />
                </div>
            </div>

            {/* Priority Requests & Queue */}
            <div className="lg:col-span-2 space-y-8 animate-slide-up delay-500">
                <section className="card">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Priority Queue</h2>
                            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1 opacity-70">Critical pending reviews</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="px-4 py-1.5 text-[10px] font-black bg-indigo-600 text-white rounded-lg shadow-lg shadow-indigo-200 dark:shadow-none uppercase tracking-widest">Active queue</button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-20 flex justify-center">
                            <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                        </div>
                    ) : pendingRequests.length === 0 ? (
                        <div className="py-24 text-center">
                            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] flex items-center justify-center text-slate-300 mx-auto mb-6 text-3xl">
                                ∅
                            </div>
                            <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Clear Queue</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {pendingRequests.map(request => (
                                <div key={request._id} className={`p-8 rounded-[2rem] border transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl bg-white dark:bg-white/5 shadow-sm group relative overflow-hidden ${request.riskLevel === 'Critical' ? 'border-rose-100 dark:border-rose-900/30 hover:border-rose-200 dark:hover:border-rose-800' :
                                    request.riskLevel === 'High' ? 'border-amber-100 dark:border-amber-900/30 hover:border-amber-200 dark:hover:border-amber-800' :
                                        'border-slate-100 dark:border-slate-800/50 hover:border-indigo-100 dark:hover:border-indigo-900/50'
                                    }`}>
                                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br ${request.riskLevel === 'Critical' ? 'from-rose-500/10 via-transparent to-transparent' :
                                        request.riskLevel === 'High' ? 'from-amber-500/10 via-transparent to-transparent' :
                                            'from-indigo-500/10 via-transparent to-transparent'
                                        }`} />
                                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider border ${request.riskLevel === 'Critical' ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/40' :
                                                    request.riskLevel === 'High' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40' :
                                                        'bg-sky-500/20 text-sky-600 dark:text-sky-400 border-sky-500/40'
                                                    }`}>{request.riskLevel} Risk</span>
                                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{request.changeType}</span>
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{request.title}</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium">{request.description}</p>

                                            <div className="flex items-center gap-6 mt-6 pt-6 border-t border-slate-50 dark:border-slate-800/50">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-600 dark:text-slate-400">
                                                        {request.createdBy?.name?.slice(0, 1).toUpperCase()}
                                                    </div>
                                                    <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-tight">{request.createdBy?.name || 'Requester'}</span>
                                                </div>
                                                <div className="h-4 w-px bg-slate-200 dark:bg-slate-700"></div>
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Initiated: {new Date(request.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 w-full md:w-auto">
                                            <button
                                                onClick={() => handleApprove(request._id)}
                                                className="flex-1 md:flex-none px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 transition-all"
                                            >
                                                Approve
                                            </button>
                                            <button onClick={() => openRejectModal(request)} className="flex-1 md:flex-none px-6 py-2.5 bg-white dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all">Reject</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-8 animate-slide-up delay-700">
                <section className="card p-8">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-8">Status Pulse</h2>
                    <StatusChart data={statusData} />
                </section>

                <section className="card p-10">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-10">Compliance Health</h2>
                    <div className="space-y-8">
                        {[
                            { label: 'Change Documentation', value: 100, color: 'bg-emerald-500' },
                            { label: 'Approval Latency', value: 88, color: 'bg-indigo-500' },
                            { label: 'Audit Readiness', value: 95, color: 'bg-emerald-500' },
                            { label: 'Risk Mitigation', value: 67, color: 'bg-amber-500 shadow-lg shadow-amber-200 dark:shadow-none' },
                        ].map((item, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between items-end mb-3">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{item.label}</span>
                                    <span className="text-sm font-black text-slate-900 dark:text-white leading-none">{item.value}%</span>
                                </div>
                                <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                    <div className={`h-full ${item.color} rounded-full transition-all duration-[1.5s] ease-out shadow-[0_0_12px_rgba(0,0,0,0.2)]`} style={{ width: `${item.value}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Rejection Modal */}
            <Modal
                isOpen={rejectModalOpen}
                onClose={() => setRejectModalOpen(false)}
                title="Reject Request"
            >
                <div className="space-y-4">
                    {selectedRequest && (
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedRequest.title}</p>
                            <p className="text-xs text-slate-500 mt-1">{selectedRequest.changeType} - {selectedRequest.riskLevel} Risk</p>
                        </div>
                    )}

                    <div>
                        <label htmlFor="rejectionReason" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            Rejection Reason *
                        </label>
                        <textarea
                            id="rejectionReason"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white resize-none"
                            rows="4"
                            placeholder="Please provide a detailed reason for rejection..."
                            required
                        />
                    </div>

                    <div className="flex gap-3 justify-end pt-4">
                        <button
                            onClick={() => setRejectModalOpen(false)}
                            className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleRejectSubmit}
                            className="px-6 py-2.5 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 transition-colors"
                        >
                            Confirm Rejection
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default ManagerDashboard;
