import { useState, useEffect } from 'react';
import requestService from '../services/requestService';
import statsService from '../services/statsService';

import KPICard from '../components/KPICard';
import { Shield, Clock, FileCheck, ExternalLink, Info, Activity } from 'lucide-react';
import Modal from '../components/Modal';

const ClientDashboard = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [stats, setStats] = useState(null);


    useEffect(() => {
        loadRequests();
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const response = await statsService.getRequestStats();
            setStats(response.data);
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };


    const loadRequests = async () => {
        try {
            // Client only sees approved requests (filtered on backend)
            const response = await requestService.getAll();
            setRequests(response.data || []);
        } catch (error) {
            console.error('Failed to load requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const openViewModal = (request) => {
        setSelectedRequest(request);
        setViewModalOpen(true);
    };

    const approvedCount = stats?.summary?.approved || requests.length;
    const velocity = stats?.summary?.approved || 0;

    const getStatusConfig = (status) => {
        switch (status) {
            case 'Approved':
                return { label: 'Verified', color: 'emerald' };
            case 'Completed':
                return { label: 'Implemented', color: 'indigo' };
            case 'Sent to Audit':
                return { label: 'Audit Ready', color: 'amber' };
            default:
                return { label: status, color: 'slate' };
        }
    };


    return (
        <div className="max-w-[1700px] mx-auto px-4 py-4">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-2 mb-2 animate-fade-in text-tight">
                <div>
                    <h1 className="text-5xl font-display font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                        External <span className="text-indigo-600 dark:text-indigo-400">Portal</span>
                    </h1>
                    <p className="text-xl text-slate-500 dark:text-slate-400 mt-3 font-medium max-w-2xl leading-relaxed">
                        Verified compliance record and approved system changelog
                    </p>
                </div>
            </header>

            <main className="animate-slide-up delay-200">
                <div className="space-y-3">
                    {/* Stats Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <KPICard
                            title="Approved Changes"
                            value={approvedCount}
                            icon={<FileCheck className="w-5 h-5" />}
                            color="success"
                            subtext="Total system-wide"
                        />
                        <KPICard
                            title="Cycle Velocity"
                            value={velocity}
                            trend="up"
                            trendValue="Live"
                            icon={<Activity className="w-5 h-5" />}
                            color="primary"
                            subtext="Approved compliance records"
                        />
                        <KPICard
                            title="System Integrity"
                            value="100%"
                            icon={<Shield className="w-5 h-5" />}
                            color="info"
                            subtext="Compliance validated"
                        />
                    </div>

                    {/* Approved Requests Section */}
                    <div className="section-card p-4 bg-white dark:bg-slate-900/50 border-2 border-slate-300 dark:border-indigo-500/40 shadow-premium">
                        <div className="p-0 pb-4 border-b-2 border-slate-200 dark:border-indigo-500/40 mb-4">
                            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Verified Changelog</h2>
                            <p className="text-[9px] font-black text-slate-500/70 uppercase tracking-widest mt-1">
                                Authenticated compliance records
                            </p>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {Array(4).fill(0).map((_, i) => (
                                    <div key={i} className="h-48 rounded-[1.5rem] animate-pulse bg-slate-50/50 dark:bg-slate-800/30 border-2 border-slate-200 dark:border-slate-800"></div>
                                ))}
                            </div>
                        ) : requests.length === 0 ? (
                            <div className="py-24 text-center">
                                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] flex items-center justify-center text-slate-300 mx-auto mb-6 text-3xl">
                                    ∅
                                </div>
                                <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No Compliance Records Found</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {requests.map((request) => (
                                    <div
                                        key={request._id}
                                        onClick={() => openViewModal(request)}
                                        className="p-5 rounded-[1.5rem] border border-slate-100 dark:border-slate-800/50 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl bg-white dark:bg-white/5 group cursor-pointer relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ExternalLink className="w-4 h-4 text-indigo-500" />
                                        </div>

                                        <div className="flex items-center gap-3 mb-4">
                                            {(() => {
                                                const config = getStatusConfig(request.status);
                                                const colorMap = {
                                                    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-500/80 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-500/80',
                                                    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-500/80 dark:bg-indigo-900/40 dark:text-indigo-400 dark:border-indigo-500/80',
                                                    amber: 'bg-amber-50 text-amber-600 border-amber-500/80 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-500/80',
                                                    slate: 'bg-slate-50 text-slate-600 border-slate-400 dark:bg-slate-800 dark:border-slate-700'
                                                };
                                                return (
                                                    <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest border shadow-sm ${colorMap[config.color]}`}>
                                                        {config.label}
                                                    </span>
                                                );
                                            })()}
                                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                                                {request.changeType}
                                            </span>
                                        </div>

                                        <h3 className="text-base font-black text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            {request.title}
                                        </h3>

                                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium mb-5">
                                            {request.description}
                                        </p>

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/50">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/40 dark:to-slate-900 flex items-center justify-center text-[10px] font-black text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-800/50">
                                                    {request.approvedBy?.name?.slice(0, 1).toUpperCase() || 'L'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-0.5">Lead Reviewer</span>
                                                    <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-tight">
                                                        {request.approvedBy?.name || 'Authorized Official'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-0.5">Approval Date</span>
                                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
                                                    {request.approvalDate ? new Date(request.approvalDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pending'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* View Request Modal */}
            <Modal
                isOpen={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                title="Verified Change Details"
                maxWidth="2xl"
            >
                {selectedRequest && (
                    <div className="space-y-8 py-4">
                        <div className="flex flex-wrap gap-3">
                            {(() => {
                                const config = getStatusConfig(selectedRequest.status);
                                const colorMap = {
                                    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
                                    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
                                    amber: 'bg-amber-50 text-amber-600 border-amber-100',
                                    slate: 'bg-slate-50 text-slate-600 border-slate-100'
                                };
                                return (
                                    <span className={`badge ${colorMap[config.color]}`}>
                                        Status: {selectedRequest.status}
                                    </span>
                                );
                            })()}
                            <span className="badge bg-slate-50 text-slate-600 border border-slate-100">
                                {selectedRequest.riskLevel} Risk
                            </span>
                        </div>


                        <div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                                {selectedRequest.title}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                                {selectedRequest.description}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem]">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Technician</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedRequest.createdBy?.name || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Lead Reviewer</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedRequest.approvedBy?.name || 'Authorized Official'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Initiated On</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">
                                    {new Date(selectedRequest.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Final Approval</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">
                                    {selectedRequest.approvalDate ? new Date(selectedRequest.approvalDate).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {selectedRequest.justification && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] border-l-4 border-indigo-500 pl-4 mb-3">Business Justification</h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50/50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                                        {selectedRequest.justification}
                                    </p>
                                </div>
                            )}

                            {selectedRequest.implementationPlan && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] border-l-4 border-indigo-500 pl-4 mb-3">Implementation Blueprint</h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line bg-slate-50/50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                                        {selectedRequest.implementationPlan}
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {selectedRequest.rollbackPlan && (
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] border-l-4 border-rose-500 pl-4 mb-3">Rollback Protocol</h4>
                                        <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-rose-50/10 dark:bg-rose-900/10 p-5 rounded-2xl border border-rose-100/50 dark:border-rose-900/30">
                                            {selectedRequest.rollbackPlan}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {selectedRequest.impactAssessment && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] border-l-4 border-amber-500 pl-4 mb-3">Compliance Impact Analysis</h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-amber-50/10 dark:bg-amber-900/10 p-5 rounded-2xl border border-amber-100/50 dark:border-amber-900/30">
                                        {selectedRequest.impactAssessment}
                                    </p>
                                </div>
                            )}

                            {selectedRequest.affectedDepartments && selectedRequest.affectedDepartments.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] border-l-4 border-slate-400 pl-4 mb-3">Affected Stakeholders</h4>
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {selectedRequest.affectedDepartments.map((dept, idx) => (
                                            <span key={idx} className="text-[10px] font-black px-3 py-1.5 bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 rounded-lg uppercase tracking-wider border border-slate-200/50 dark:border-slate-700/50">
                                                {dept}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="pt-6 border-t border-slate-50 dark:border-slate-800/50">
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 italic font-medium leading-relaxed">
                                    * This document is a protected compliance record. All implementation details have been verified by the authorized lead reviewer and passed final validation protocols.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                onClick={() => setViewModalOpen(false)}
                                className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-[11px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
                            >
                                Close Records
                            </button>
                        </div>
                    </div>
                )
                }
            </Modal >
        </div >
    );
};

export default ClientDashboard;
