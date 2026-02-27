import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import requestService from '../services/requestService';
import KPICard from '../components/KPICard';
import StatusChart from '../components/StatusChart';
import Modal from '../components/Modal';
import { ShieldCheck, FileSearch, AlertCircle, CheckCircle2, Eye, History, Search, Calendar, FileText, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const AuditorDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [auditQueue, setAuditQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal States
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    useEffect(() => {
        loadAuditData();
    }, []);

    const loadAuditData = async () => {
        try {
            const response = await requestService.getAll();
            const requestsData = response.data || [];
            setRequests(requestsData);
            // Show all requests the auditor has access to (Approved, Sent to Audit, Completed)
            setAuditQueue(requestsData.filter(r => ['Approved', 'Sent to Audit', 'Completed'].includes(r.status)));
        } catch (error) {
            console.error('Failed to load audit data:', error);
            toast.error('Failed to load compliance data');
        } finally {
            setLoading(false);
        }
    };

    const stats = {
        pendingAudit: requests.filter(r => r.status === 'Sent to Audit').length,
        approved: requests.filter(r => r.status === 'Approved').length,
        criticalRisk: auditQueue.filter(r => r.riskLevel === 'Critical').length,
        totalReviewed: requests.filter(r => ['Approved', 'Completed', 'Rejected'].includes(r.status)).length
    };

    const statusData = [
        { name: 'Sent to Audit', value: stats.pendingAudit },
        { name: 'Approved', value: stats.approved },
        { name: 'Completed', value: requests.filter(r => r.status === 'Completed').length },
    ];

    const filteredQueue = auditQueue.filter(r =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r._id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openViewModal = (request) => {
        setSelectedRequest(request);
        setViewModalOpen(true);
    };

    const handleComplete = async (id) => {
        try {
            await requestService.update(id, { status: 'Completed' });
            setAuditQueue(prev => prev.filter(r => r._id !== id));
            setRequests(prev => prev.map(r => r._id === id ? { ...r, status: 'Completed' } : r));
            toast.success('Audit finalized as completed');
        } catch (error) {
            console.error('Finalize audit failed:', error);
            toast.error('Failed to complete audit');
        }
    };

    return (
        <div className="max-w-[1700px] mx-auto px-4 py-4 animate-fade-in">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-2 mb-6 text-tight">
                <div>
                    <h1 className="text-5xl font-display font-black text-slate-900 dark:text-white tracking-tight">
                        Compliance <span className="text-indigo-600 dark:text-indigo-400">Hub</span>
                    </h1>
                    <p className="text-xl text-slate-500 dark:text-slate-400 mt-3 font-medium max-w-2xl">
                        Audit oversight, compliance monitoring, and risk assessment queue
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="btn btn-secondary border-slate-200/60 shadow-sm font-black text-[11px] uppercase tracking-widest px-6 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        Audit Report
                    </button>
                    <button className="btn btn-primary shadow-indigo-200 shadow-lg px-6 font-black text-[11px] uppercase tracking-widest">
                        Export Logs
                    </button>
                </div>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Audit Queue */}
                <div className="lg:col-span-2 space-y-3">
                    <section className="section-card p-4 bg-white dark:bg-slate-900/50 border-2 border-slate-300 dark:border-indigo-500/40 shadow-premium relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <FileSearch className="w-20 h-20" />
                        </div>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Audit Queue</h2>
                                <p className="text-[9px] font-black text-slate-500/70 uppercase tracking-widest mt-1">
                                    Requests dispatched for compliance validation
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
                            <div className="p-10 flex justify-center">
                                <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                            </div>
                        ) : filteredQueue.length === 0 ? (
                            <div className="py-16 text-center">
                                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] flex items-center justify-center text-slate-300 mx-auto mb-4 text-3xl">∅</div>
                                <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Queue Empty</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredQueue.map(request => (
                                    <div key={request._id} className="p-5 rounded-[1.5rem] border border-slate-100 dark:border-slate-800/50 hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl bg-white dark:bg-white/5 shadow-sm group/card relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-4">
                                        <div className={`absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent`} />
                                        <div className="relative z-10 flex-1 w-full">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider border ${['Approved', 'Completed', 'Sent to Audit'].includes(request.status) ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40' :
                                                    request.status === 'Pending' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40' :
                                                        'bg-sky-500/20 text-sky-600 dark:text-sky-400 border-sky-500/40'
                                                    }`}>
                                                    {request.status}
                                                </span>
                                                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                                                    CHG-{request._id.slice(-4).toUpperCase()}
                                                </span>
                                            </div>
                                            <h3 className="text-base font-black text-slate-900 dark:text-white mb-1 leading-tight group-hover/card:text-indigo-600 dark:group-hover/card:text-indigo-400 transition-colors">
                                                {request.title}
                                            </h3>
                                            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-50 dark:border-slate-800/50">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[9px] font-black text-slate-600 dark:text-slate-400">
                                                        {request.createdBy?.name?.charAt(0)}
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                                                        {request.createdBy?.name}
                                                    </span>
                                                </div>
                                                <div className="h-3 w-px bg-slate-200 dark:bg-slate-700"></div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                    Initiated: {new Date(request.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 relative z-10 w-full md:w-auto">
                                            <button
                                                onClick={() => openViewModal(request)}
                                                className="px-5 py-2.5 bg-indigo-50 text-indigo-600 border-2 border-indigo-500/50 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-500/30 transition-all shadow-sm flex items-center gap-2"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                                Details
                                            </button>
                                            <div
                                                onClick={() => request.status === 'Sent to Audit' && handleComplete(request._id)}
                                                className={`px-5 py-2.5 border-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center gap-2 ${request.status === 'Completed'
                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-500/50 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-500/30'
                                                    : request.status === 'Sent to Audit'
                                                        ? 'bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-700 cursor-pointer'
                                                        : 'bg-indigo-50 text-indigo-600 border-indigo-500/50 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-500/30 opacity-50 cursor-not-allowed'
                                                    }`}
                                                title={request.status === 'Sent to Audit' ? "Finalize Completion" : "Completion Status"}
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                                {request.status === 'Completed' ? 'Completed' : 'Complete'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-3">
                    <section className="section-card p-4 bg-white dark:bg-slate-900/50 border-2 border-slate-300 dark:border-indigo-500/40 shadow-premium">
                        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Audit Status Pulse</h2>
                        <StatusChart data={statusData} />
                    </section>

                    <section className="section-card p-6 bg-gradient-to-br from-indigo-600 to-violet-700 dark:from-indigo-600 dark:to-violet-700 border-none relative overflow-hidden group/alert shadow-premium">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/alert:scale-125 transition-transform duration-500">
                            <ShieldCheck className="w-24 h-24 text-white" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-white font-black text-xl mb-2">Compliance Alert</h3>
                            <p className="text-indigo-100 text-[11px] font-medium mb-6 leading-relaxed">
                                System audit logs indicate 100% policy adherence for the current cycle.
                            </p>
                            <button className="w-full py-3 bg-white text-indigo-700 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-900/30 hover:scale-[1.02] active:scale-95 transition-all">
                                Run Diagnostics
                            </button>
                        </div>
                    </section>
                </div>
            </div>

            {/* View Details Modal */}
            <Modal
                isOpen={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                title="Request Details"
                size="lg"
            >
                {selectedRequest && (
                    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                        {/* Header Section */}
                        <div className="sticky top-0 bg-white dark:bg-slate-900 pb-4 border-b border-slate-100 dark:border-slate-800 z-10">
                            <span className="inline-block px-2 py-1 text-[10px] font-black rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 mb-2 uppercase tracking-widest border border-slate-200 dark:border-slate-700">
                                CHG-{selectedRequest._id.slice(-4).toUpperCase()}
                            </span>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{selectedRequest.title}</h2>
                        </div>

                        {/* Status Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-slate-800">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Status</p>
                                <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider border ${['Approved', 'Completed', 'Sent to Audit'].includes(selectedRequest.status) ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/40' :
                                    selectedRequest.status === 'Pending' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/40' :
                                        'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                                    }`}>
                                    {selectedRequest.status}
                                </span>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-slate-800">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Priority</p>
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className={`w-4 h-4 ${selectedRequest.priority === 'High' ? 'text-amber-500' : 'text-sky-500'}`} />
                                    <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{selectedRequest.priority || 'Medium'}</span>
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-slate-800">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Risk Level</p>
                                <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider border ${selectedRequest.riskLevel === 'Critical' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/40' :
                                    selectedRequest.riskLevel === 'High' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/40' :
                                        'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/40'
                                    }`}>
                                    {selectedRequest.riskLevel}
                                </span>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-slate-800">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Change Type</p>
                                <span className="text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider border bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/40">
                                    {selectedRequest.changeType || 'N/A'}
                                </span>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-3">Description</p>
                            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                {selectedRequest.description}
                            </div>
                        </div>

                        {/* Implementation Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {selectedRequest.implementationPlan && (
                                <div>
                                    <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-indigo-500" />
                                        Implementation Plan
                                    </p>
                                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed whitespace-pre-wrap">
                                        {selectedRequest.implementationPlan}
                                    </div>
                                </div>
                            )}
                            {selectedRequest.rollbackPlan && (
                                <div>
                                    <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <History className="w-4 h-4 text-rose-500" />
                                        Rollback Plan
                                    </p>
                                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed whitespace-pre-wrap">
                                        {selectedRequest.rollbackPlan}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Dates & Roles */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Initiated By</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] flex items-center justify-center font-black">
                                        {selectedRequest.createdBy?.name?.charAt(0)}
                                    </div>
                                    <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase">{selectedRequest.createdBy?.name}</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Planned Start</p>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    <span className="text-[11px] font-black text-slate-900 dark:text-white">
                                        {selectedRequest.plannedStartDate ? new Date(selectedRequest.plannedStartDate).toLocaleDateString() : 'TBD'}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Planned End</p>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    <span className="text-[11px] font-black text-slate-900 dark:text-white">
                                        {selectedRequest.plannedEndDate ? new Date(selectedRequest.plannedEndDate).toLocaleDateString() : 'TBD'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AuditorDashboard;
