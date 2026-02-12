import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2, Check, X, Search, Filter, AlertTriangle, Calendar, FileText } from 'lucide-react';
import requestService from '../services/requestService';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import { toast } from 'sonner';

const RequestsPage = () => {
    const navigate = useNavigate();
    const { user, hasAnyRole } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');

    // Modal States
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [editFormData, setEditFormData] = useState({});
    const [editLoading, setEditLoading] = useState(false);

    useEffect(() => {
        const loadRequests = async () => {
            try {
                const response = await requestService.getAll();
                setRequests(response.data || []);
            } catch (error) {
                console.error('Failed to load requests:', error);
            } finally {
                setLoading(false);
            }
        };
        loadRequests();
    }, []);

    const filteredRequests = requests.filter(request => {
        const matchesSearch = request.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.description?.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesStatus = true;
        if (statusFilter === 'Needs Approval') {
            // Check for both _id and id to be safe
            const userId = user._id || user.id;
            const requestUserId = request.createdBy?._id || request.createdBy;
            matchesStatus = request.status === 'Pending' && requestUserId !== userId;
        } else if (statusFilter !== 'All') {
            matchesStatus = request.status === statusFilter;
        }

        const matchesType = typeFilter === 'All' || request.changeType === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    });

    const stats = {
        inProgress: requests.filter(r => r.status === 'In Progress').length || 0,
        pending: requests.filter(r => r.status === 'Pending').length || 0,
        completed: requests.filter(r => r.status === 'Approved').length || 0,
        rejected: requests.filter(r => r.status === 'Rejected').length || 0,
        // Calculate needs approval count
        needsApproval: requests.filter(r => {
            const userId = user._id || user.id;
            const requestUserId = r.createdBy?._id || r.createdBy;
            return r.status === 'Pending' && requestUserId !== userId;
        }).length || 0
    };

    const handleApprove = async (id) => {
        try {
            await requestService.approve(id);
            setRequests(requests.map(r => r._id === id ? { ...r, status: 'Approved' } : r));
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
            setRequests(requests.map(r => r._id === selectedRequest._id ? { ...r, status: 'Rejected' } : r));
            toast.success('Request rejected successfully');
            setRejectModalOpen(false);
            setSelectedRequest(null);
        } catch (error) {
            console.error('Reject failed:', error);
            toast.error('Failed to reject request');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this request?')) {
            try {
                await requestService.delete(id);
                setRequests(requests.filter(r => r._id !== id));
                toast.success('Request deleted');
            } catch (error) {
                console.error('Delete failed:', error);
                toast.error('Failed to delete request');
            }
        }
    };

    const openViewModal = (request) => {
        setSelectedRequest(request);
        setViewModalOpen(true);
    };

    const openEditModal = (request) => {
        setSelectedRequest(request);
        // Parse dates for input fields
        const startDate = new Date(request.plannedStartDate);
        const endDate = new Date(request.plannedEndDate);

        setEditFormData({
            title: request.title || '',
            description: request.description || '',
            changeType: request.changeType || '',
            riskLevel: request.riskLevel || '',
            environment: request.environment || '',
            justification: request.justification || '',
            plannedStartDate: startDate.toISOString().split('T')[0],
            plannedEndDate: endDate.toISOString().split('T')[0],
            affectedDepartments: request.affectedDepartments?.join(', ') || '',
            impactAssessment: request.impactAssessment || '',
            implementationPlan: request.implementationPlan || '',
            rollbackPlan: request.rollbackPlan || '',
            testingPlan: request.testingPlan || '',
        });
        setEditModalOpen(true);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEditSubmit = async () => {
        if (!selectedRequest) return;

        // Basic validation
        if (!editFormData.title?.trim()) {
            toast.error('Title is required');
            return;
        }
        if (!editFormData.description?.trim()) {
            toast.error('Description is required');
            return;
        }

        setEditLoading(true);
        try {
            const payload = {
                title: editFormData.title,
                description: editFormData.description,
                changeType: editFormData.changeType,
                riskLevel: editFormData.riskLevel,
                environment: editFormData.environment,
                justification: editFormData.justification,
                plannedStartDate: new Date(editFormData.plannedStartDate).toISOString(),
                plannedEndDate: new Date(editFormData.plannedEndDate).toISOString(),
                implementationPlan: editFormData.implementationPlan,
                rollbackPlan: editFormData.rollbackPlan,
                testingPlan: editFormData.testingPlan,
                impactAssessment: editFormData.impactAssessment,
                affectedDepartments: editFormData.affectedDepartments ? editFormData.affectedDepartments.split(',').map(d => d.trim()) : [],
            };

            await requestService.update(selectedRequest._id, payload);

            // Update local state
            setRequests(requests.map(r =>
                r._id === selectedRequest._id ? { ...r, ...payload } : r
            ));

            toast.success('Request updated successfully');
            setEditModalOpen(false);
            setSelectedRequest(null);
        } catch (error) {
            console.error('Failed to update request:', error);
            toast.error('Failed to update request');
        } finally {
            setEditLoading(false);
        }
    };

    const types = [...new Set(requests.map(r => r.changeType).filter(Boolean))];

    // Helper to check if current user is the creator
    const isCreator = (request) => {
        const userId = user._id || user.id;
        const requestUserId = request.createdBy?._id || request.createdBy;
        return userId && requestUserId && userId === requestUserId;
    };

    return (
        <main className="content-container animate-fade-in">
            <header className="mb-10">
                {hasAnyRole(['Manager', 'Admin']) ? (
                    <>
                        <h1 className="text-4xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Pending Requests</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-medium">Overview of team requests awaiting your approval</p>
                    </>
                ) : (
                    <>
                        <h1 className="text-4xl font-display font-bold text-slate-900 dark:text-white tracking-tight">My Requests</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-medium">Manage and track all your submitted change requests</p>
                    </>
                )}
            </header>

            {/* Filters and Search Bar */}
            <div className="card mb-8">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
                    <div className="relative w-full md:w-1/3 group">
                        <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                            <Search className="h-5 w-5" />
                        </span>
                        <input
                            type="text"
                            placeholder="Search requests by title or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field pl-12"
                        />
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <select
                            className="input-field md:w-40 font-bold text-sm"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All">All Status</option>
                            <option value="Needs Approval">Needs My Approval</option>
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Sent to Audit">Sent to Audit</option>
                        </select>
                        <select
                            className="input-field md:w-32 font-bold text-sm"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="All">All Types</option>
                            {types.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        {!hasAnyRole(['Manager', 'Admin']) && (
                            <button
                                onClick={() => navigate('/requests/create')}
                                className="btn btn-primary px-6 whitespace-nowrap"
                            >
                                + New Request
                            </button>
                        )}
                    </div>
                </div>

                {/* Status Tabs */}
                <div className="flex flex-wrap gap-4">
                    {/* New 'Needs Approval' Tab for Managers */}
                    {hasAnyRole(['Manager', 'Admin']) && (
                        <button
                            onClick={() => setStatusFilter(statusFilter === 'Needs Approval' ? 'All' : 'Needs Approval')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${statusFilter === 'Needs Approval' ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' : 'border-gray-100 hover:bg-gray-50 text-gray-500'}`}
                        >
                            <Check className="w-4 h-4" />
                            {stats.needsApproval} Needs Approval
                        </button>
                    )}

                    <button
                        onClick={() => setStatusFilter(statusFilter === 'In Progress' ? 'All' : 'In Progress')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${statusFilter === 'In Progress' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'border-gray-100 hover:bg-gray-50 text-gray-500'}`}
                    >
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                        {stats.inProgress} In Progress
                    </button>
                    <button
                        onClick={() => setStatusFilter(statusFilter === 'Pending' ? 'All' : 'Pending')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${statusFilter === 'Pending' ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-sm' : 'border-gray-100 hover:bg-gray-50 text-gray-500'}`}
                    >
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                        {stats.pending} Pending
                    </button>
                    <button
                        onClick={() => setStatusFilter(statusFilter === 'Approved' ? 'All' : 'Approved')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${statusFilter === 'Approved' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm' : 'border-gray-100 hover:bg-gray-50 text-gray-500'}`}
                    >
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        {stats.completed} Completed
                    </button>
                    <button
                        onClick={() => setStatusFilter(statusFilter === 'Rejected' ? 'All' : 'Rejected')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${statusFilter === 'Rejected' ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm' : 'border-gray-100 hover:bg-gray-50 text-gray-500'}`}
                    >
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                        {stats.rejected} Rejected
                    </button>
                    <button
                        onClick={() => setStatusFilter(statusFilter === 'Sent to Audit' ? 'All' : 'Sent to Audit')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${statusFilter === 'Sent to Audit' ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' : 'border-gray-100 hover:bg-gray-50 text-gray-500'}`}
                    >
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                        Sent to Audit
                    </button>
                    <button
                        onClick={() => { setStatusFilter('All'); setTypeFilter('All'); setSearchTerm(''); }}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border border-transparent text-gray-400 hover:text-gray-600`}
                    >
                        Reset All
                    </button>
                </div>
            </div>

            <div className="card overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-gray-800/20">
                                <th className="py-5 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Request ID</th>
                                <th className="py-5 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Title</th>
                                <th className="py-5 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Type</th>
                                <th className="py-5 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Date Submitted</th>
                                <th className="py-5 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="py-5 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Priority</th>
                                <th className="py-5 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="7" className="py-6 px-6">
                                            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredRequests.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-3xl flex items-center justify-center text-gray-300 mb-4 text-3xl font-light">
                                                ?
                                            </div>
                                            <p className="text-gray-500 font-bold text-lg">No matching requests found</p>
                                            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or search term</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredRequests.map((request) => (
                                    <tr key={request._id} className="table-row group">
                                        <td className="py-5 px-6">
                                            <span className="text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-lg">
                                                CHG-{request._id.slice(-4).toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="py-5 px-6">
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                                                    {request.title}
                                                </p>
                                                {request.description && <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">{request.description}</p>}
                                                {/* Show 'My Request' tag if user is creator with more subtle styling */}
                                                {isCreator(request) && (
                                                    <span className="inline-block mt-1 text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded">
                                                        MY REQUEST
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-5 px-6">
                                            <span className={`badge ${request.changeType === 'Database' ? 'bg-indigo-50 text-indigo-600' :
                                                request.changeType === 'Infrastructure' ? 'bg-rose-50 text-rose-600' : 'bg-sky-50 text-sky-600'}`}>
                                                {request.changeType || 'Type'}
                                            </span>
                                        </td>
                                        <td className="py-5 px-6">
                                            <div className="text-xs font-bold text-gray-600 dark:text-gray-400">
                                                {new Date(request.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                <p className="text-[10px] text-gray-400 mt-0.5">{new Date(request.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </td>
                                        <td className="py-5 px-6">
                                            <span className={`badge ${request.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                request.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                                    request.status === 'Sent to Audit' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                                        'bg-amber-50 text-amber-600 border border-amber-100'
                                                }`}>
                                                {request.status}
                                            </span>
                                        </td>
                                        <td className="py-5 px-6 text-sm">
                                            <span className={`badge ${request.riskLevel === 'Critical' ? 'bg-rose-100 text-rose-700' :
                                                request.riskLevel === 'High' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-blue-100 text-blue-700'
                                                }`}>
                                                {request.riskLevel}
                                            </span>
                                        </td>
                                        <td className="py-5 px-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                {/* Manager/Admin Approval Actions */}
                                                {request.status === 'Pending' && hasAnyRole(['Manager', 'Admin']) && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(request._id)}
                                                            className="p-2 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all active:scale-90"
                                                            title="Approve Request"
                                                        >
                                                            <Check className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => openRejectModal(request)}
                                                            className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all active:scale-90"
                                                            title="Reject Request"
                                                        >
                                                            <X className="w-5 h-5" />
                                                        </button>
                                                        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1 self-center"></div>
                                                    </>
                                                )}

                                                <button
                                                    onClick={() => openViewModal(request)}
                                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all active:scale-90"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(request)}
                                                    className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all active:scale-90"
                                                    title="Edit Request"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
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
                    <div className="space-y-6 max-h-[70vh] overflow-y-auto">
                        {/* Header Section */}
                        <div className="sticky top-0 bg-white dark:bg-gray-900 pb-4 border-b border-gray-100 dark:border-gray-800">
                            <span className="inline-block px-2 py-1 text-xs font-bold rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 mb-2">
                                CHG-{selectedRequest._id.slice(-4).toUpperCase()}
                            </span>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedRequest.title}</h2>
                        </div>

                        {/* Status Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                                <span className={`badge ${selectedRequest.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                    selectedRequest.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                        selectedRequest.status === 'Sent to Audit' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                            'bg-amber-50 text-amber-600 border border-amber-100'
                                    }`}>
                                    {selectedRequest.status}
                                </span>
                            </div>
                            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Priority</p>
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className={`w-4 h-4 ${selectedRequest.priority === 'High' ? 'text-orange-500' : 'text-blue-500'}`} />
                                    <span className="font-bold text-gray-900 dark:text-white">{selectedRequest.priority}</span>
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Risk Level</p>
                                <span className={`badge ${selectedRequest.riskLevel === 'Critical' ? 'bg-rose-100 text-rose-700' :
                                    selectedRequest.riskLevel === 'High' ? 'bg-orange-100 text-orange-700' :
                                        'bg-blue-100 text-blue-700'
                                    }`}>
                                    {selectedRequest.riskLevel}
                                </span>
                            </div>
                            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Change Type</p>
                                <span className={`badge ${selectedRequest.changeType === 'Database' ? 'bg-indigo-50 text-indigo-600' :
                                    selectedRequest.changeType === 'Infrastructure' ? 'bg-rose-50 text-rose-600' : 'bg-sky-50 text-sky-600'}`}>
                                    {selectedRequest.changeType || 'N/A'}
                                </span>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">Description</p>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-white/5 p-4 rounded-2xl text-sm">
                                {selectedRequest.description}
                            </p>
                        </div>

                        {/* Justification */}
                        {selectedRequest.justification && (
                            <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">Justification</p>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-white/5 p-4 rounded-2xl text-sm">
                                    {selectedRequest.justification}
                                </p>
                            </div>
                        )}

                        {/* Environment & Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Environment</p>
                                <p className="font-bold text-gray-900 dark:text-white">{selectedRequest.environment || 'N/A'}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Planned Start</p>
                                <p className="font-bold text-gray-900 dark:text-white">
                                    {selectedRequest.plannedStartDate ? new Date(selectedRequest.plannedStartDate).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Planned End</p>
                                <p className="font-bold text-gray-900 dark:text-white">
                                    {selectedRequest.plannedEndDate ? new Date(selectedRequest.plannedEndDate).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                        </div>

                        {/* Implementation Plan */}
                        {selectedRequest.implementationPlan && (
                            <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Implementation Plan
                                </p>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-white/5 p-4 rounded-2xl text-sm whitespace-pre-wrap">
                                    {selectedRequest.implementationPlan}
                                </p>
                            </div>
                        )}

                        {/* Rollback Plan */}
                        {selectedRequest.rollbackPlan && (
                            <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Rollback Plan
                                </p>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-white/5 p-4 rounded-2xl text-sm whitespace-pre-wrap">
                                    {selectedRequest.rollbackPlan}
                                </p>
                            </div>
                        )}

                        {/* Testing Plan */}
                        {selectedRequest.testingPlan && (
                            <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Testing Plan
                                </p>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-white/5 p-4 rounded-2xl text-sm whitespace-pre-wrap">
                                    {selectedRequest.testingPlan}
                                </p>
                            </div>
                        )}

                        {/* Impact Assessment */}
                        {selectedRequest.impactAssessment && (
                            <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">Impact Assessment</p>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-white/5 p-4 rounded-2xl text-sm">
                                    {selectedRequest.impactAssessment}
                                </p>
                            </div>
                        )}

                        {/* Affected Departments */}
                        {selectedRequest.affectedDepartments && selectedRequest.affectedDepartments.length > 0 && (
                            <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">Affected Departments</p>
                                <div className="flex flex-wrap gap-2">
                                    {selectedRequest.affectedDepartments.map((dept, idx) => (
                                        <span key={idx} className="badge bg-indigo-50 text-indigo-600 border border-indigo-100">
                                            {dept}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Attachments */}
                        {selectedRequest.attachments && selectedRequest.attachments.length > 0 && (
                            <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">Attachments</p>
                                <div className="space-y-2">
                                    {selectedRequest.attachments.map((file, idx) => (
                                        <div key={idx} className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800">
                                            <FileText className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">{file.originalName || file.filename}</span>
                                            <span className="text-xs text-gray-400 ml-auto">
                                                {file.size ? `${(file.size / 1024).toFixed(2)} KB` : ''}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Rejection Reason */}
                        {selectedRequest.status === 'Rejected' && selectedRequest.rejectionReason && (
                            <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/40">
                                <p className="text-sm font-bold text-rose-700 dark:text-rose-300 mb-2">Rejection Reason</p>
                                <p className="text-sm text-rose-600 dark:text-rose-200">{selectedRequest.rejectionReason}</p>
                            </div>
                        )}

                        {/* Approval Info */}
                        {selectedRequest.status === 'Approved' && selectedRequest.approvedBy && (
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
                                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mb-2">Approved By</p>
                                <p className="text-sm text-emerald-600 dark:text-emerald-200">
                                    {selectedRequest.approvedBy?.name || 'Administrator'}
                                    {selectedRequest.approvalDate && ` on ${new Date(selectedRequest.approvalDate).toLocaleDateString()}`}
                                </p>
                            </div>
                        )}

                        {/* Metadata */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Submitted By</p>
                                <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">
                                        {selectedRequest.createdBy?.name?.charAt(0)}
                                    </span>
                                    {selectedRequest.createdBy?.name || 'Unknown User'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Date Submitted</p>
                                <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    {new Date(selectedRequest.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Reject Modal */}
            <Modal
                isOpen={rejectModalOpen}
                onClose={() => setRejectModalOpen(false)}
                title="Reject Request"
            >
                <div>
                    <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-2xl mb-6 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-rose-700 dark:text-rose-200">
                            You are about to reject this request. Please provide a clear reason for the requester.
                        </p>
                    </div>

                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Reason for Rejection <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                        className="input-field min-h-[120px] resize-none"
                        placeholder="e.g., Missing required risk assessment documentation..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        autoFocus
                    />

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            onClick={() => setRejectModalOpen(false)}
                            className="btn btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleRejectSubmit}
                            className="btn bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-200 dark:shadow-none"
                        >
                            Reject Request
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                title="Edit Request"
                size="lg"
            >
                <div className="space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Request Information */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Request Title <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={editFormData.title || ''}
                            onChange={handleEditChange}
                            className="input-field"
                            placeholder="Brief summary of the change request"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Description <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                            name="description"
                            value={editFormData.description || ''}
                            onChange={handleEditChange}
                            rows="4"
                            className="input-field"
                            placeholder="Provide detailed description of the proposed change"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Change Type <span className="text-rose-500">*</span>
                            </label>
                            <select
                                name="changeType"
                                value={editFormData.changeType || ''}
                                onChange={handleEditChange}
                                className="input-field"
                            >
                                <option value="">Select change type</option>
                                <option value="Application">Application</option>
                                <option value="Infrastructure">Infrastructure</option>
                                <option value="Database">Database</option>
                                <option value="Network">Network</option>
                                <option value="Security">Security</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Risk Level <span className="text-rose-500">*</span>
                            </label>
                            <select
                                name="riskLevel"
                                value={editFormData.riskLevel || ''}
                                onChange={handleEditChange}
                                className="input-field"
                            >
                                <option value="">Select risk level</option>
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Critical">Critical</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Environment <span className="text-rose-500">*</span>
                        </label>
                        <select
                            name="environment"
                            value={editFormData.environment || ''}
                            onChange={handleEditChange}
                            className="input-field"
                        >
                            <option value="">Select environment</option>
                            <option value="Production">Production</option>
                            <option value="Staging">Staging</option>
                            <option value="Development">Development</option>
                            <option value="All">All Environment</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Business Justification
                        </label>
                        <textarea
                            name="justification"
                            value={editFormData.justification || ''}
                            onChange={handleEditChange}
                            rows="3"
                            className="input-field"
                            placeholder="Explain the business need and benefits of this change"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Planned Start Date <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="plannedStartDate"
                                value={editFormData.plannedStartDate || ''}
                                onChange={handleEditChange}
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Planned End Date <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="plannedEndDate"
                                value={editFormData.plannedEndDate || ''}
                                onChange={handleEditChange}
                                className="input-field"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Affected Departments
                        </label>
                        <input
                            type="text"
                            name="affectedDepartments"
                            value={editFormData.affectedDepartments || ''}
                            onChange={handleEditChange}
                            className="input-field"
                            placeholder="e.g., Finance, IT, Operations (comma-separated)"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Impact Assessment
                        </label>
                        <textarea
                            name="impactAssessment"
                            value={editFormData.impactAssessment || ''}
                            onChange={handleEditChange}
                            rows="3"
                            className="input-field"
                            placeholder="Describe the potential impact on business operations"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Implementation Plan
                        </label>
                        <textarea
                            name="implementationPlan"
                            value={editFormData.implementationPlan || ''}
                            onChange={handleEditChange}
                            rows="4"
                            className="input-field"
                            placeholder="Step-by-step implementation plan"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Rollback Plan
                        </label>
                        <textarea
                            name="rollbackPlan"
                            value={editFormData.rollbackPlan || ''}
                            onChange={handleEditChange}
                            rows="3"
                            className="input-field"
                            placeholder="Describe the rollback procedure"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Testing Plan
                        </label>
                        <textarea
                            name="testingPlan"
                            value={editFormData.testingPlan || ''}
                            onChange={handleEditChange}
                            rows="3"
                            className="input-field"
                            placeholder="Describe testing procedures and validation criteria"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800 sticky bottom-0 bg-white dark:bg-gray-900">
                        <button
                            onClick={() => setEditModalOpen(false)}
                            className="btn btn-secondary"
                            disabled={editLoading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleEditSubmit}
                            className="btn btn-primary shadow-lg shadow-indigo-200 dark:shadow-none"
                            disabled={editLoading}
                        >
                            {editLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </Modal>
        </main>
    );
};

export default RequestsPage;
