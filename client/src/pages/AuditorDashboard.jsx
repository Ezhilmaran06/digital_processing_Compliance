import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import requestService from '../services/requestService';
import KPICard from '../components/KPICard';
import StatusChart from '../components/StatusChart';
import { ShieldCheck, FileSearch, AlertCircle, CheckCircle2, ArrowRight, History, Search } from 'lucide-react';
import { toast } from 'sonner';

const AuditorDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [auditQueue, setAuditQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadAuditData();
    }, []);

    const loadAuditData = async () => {
        try {
            const response = await requestService.getAll();
            const requestsData = response.data || [];
            setRequests(requestsData);
            // In a real app, this might be filtered specifically for 'Sent to Audit'
            // For now, let's show requests that need compliance oversight
            setAuditQueue(requestsData.filter(r => r.status === 'Sent to Audit' || r.status === 'Approved'));
        } catch (error) {
            console.error('Failed to load audit data:', error);
            toast.error('Failed to load compliance data');
        } finally {
            setLoading(false);
        }
    };

    const stats = {
        pendingAudit: requests.filter(r => r.status === 'Sent to Audit').length,
        approved: requests.filter(r => ['Approved', 'Completed', 'Sent to Audit'].includes(r.status)).length,
        criticalRisk: requests.filter(r => r.riskLevel === 'Critical').length,
        totalReviewed: requests.filter(r => ['Approved', 'Completed', 'Rejected'].includes(r.status)).length
    };

    const statusData = [
        { name: 'Sent to Audit', value: stats.pendingAudit },
        { name: 'Approved', value: stats.approved },
        { name: 'Other', value: requests.length - stats.pendingAudit - stats.approved },
    ];

    const filteredQueue = auditQueue.filter(r =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r._id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-fade-in">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                <div>
                    <h1 className="text-5xl font-display font-black text-slate-900 dark:text-white tracking-tight">
                        Compliance <span className="text-indigo-600 dark:text-indigo-400">Hub</span>
                    </h1>
                    <p className="text-xl text-slate-500 dark:text-slate-400 mt-3 font-medium max-w-2xl">
                        Audit oversight, compliance monitoring, and risk assessment queue
                    </p>
                </div>
                <div className="flex gap-4">
                    <button className="btn btn-secondary border-slate-200/60 shadow-sm font-black text-[11px] uppercase tracking-widest px-6">
                        Audit Report
                    </button>
                    <button className="btn btn-primary shadow-indigo-200 shadow-lg px-6 font-black text-[11px] uppercase tracking-widest">
                        Export Logs
                    </button>
                </div>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                <KPICard
                    title="Awaiting Audit"
                    value={stats.pendingAudit}
                    icon={<FileSearch className="w-6 h-6" />}
                    color="warning"
                    subtext="Action required"
                />
                <KPICard
                    title="Approved Changes"
                    value={stats.approved}
                    icon={<CheckCircle2 className="w-6 h-6" />}
                    color="success"
                    subtext="Compliance verified"
                />
                <KPICard
                    title="Critical Risks"
                    value={stats.criticalRisk}
                    icon={<AlertCircle className="w-6 h-6" />}
                    color="danger"
                    subtext="High priority review"
                />
                <KPICard
                    title="Audit Readiness"
                    value="98%"
                    icon={<ShieldCheck className="w-6 h-6" />}
                    color="primary"
                    subtext="System health"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Audit Queue */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="card p-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Audit Queue</h2>
                                <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1 opacity-70">
                                    Requests requiring compliance validation
                                </p>
                            </div>
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search queue..."
                                    className="input-field pl-10 h-10 text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {loading ? (
                            <div className="py-20 flex justify-center">
                                <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                            </div>
                        ) : filteredQueue.length === 0 ? (
                            <div className="py-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem]">
                                <History className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Queue Empty</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredQueue.map(request => (
                                    <div key={request._id} className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 transition-all flex flex-col md:flex-row justify-between items-center gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider border ${['Approved', 'Completed', 'Sent to Audit'].includes(request.status) ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/40' :
                                                    request.status === 'Pending' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/40' :
                                                        'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-700/50'
                                                    }`}>
                                                    {request.status}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">
                                                    CHG-{request._id.slice(-4).toUpperCase()}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                                                {request.title}
                                            </h3>
                                            <div className="flex items-center gap-4 mt-3">
                                                <div className="flex items-center gap-1.5 grayscale opacity-70">
                                                    <div className="w-5 h-5 rounded-full bg-slate-200 text-[8px] flex items-center justify-center font-black">
                                                        {request.createdBy?.name?.charAt(0)}
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                                                        {request.createdBy?.name}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-300 uppercase">
                                                    {new Date(request.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/requests`)}
                                            className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-white/5 rounded-xl transition-all"
                                        >
                                            <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-8">
                    <section className="card p-8">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-8">Role Distribution</h2>
                        <StatusChart data={statusData} />
                    </section>

                    <section className="card p-8 bg-gradient-to-br from-indigo-600 to-violet-700 dark:from-indigo-600 dark:to-violet-700 border-none relative overflow-hidden group/alert">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/alert:scale-125 transition-transform duration-500">
                            <ShieldCheck className="w-24 h-24 text-white" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-white font-black text-xl mb-2">Compliance Alert</h3>
                            <p className="text-indigo-100 text-sm font-medium mb-6">
                                System audit logs indicate 100% policy adherence for the current cycle.
                            </p>
                            <button className="w-full py-3 bg-white text-indigo-700 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-900/30 hover:scale-[1.02] active:scale-95 transition-all">
                                Run Diagnostics
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default AuditorDashboard;
