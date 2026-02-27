import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import requestService from '../services/requestService';
import { toast } from 'sonner';

const CreateRequestPage = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Get request ID from URL for edit mode
    const isEditMode = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [loadingRequest, setLoadingRequest] = useState(isEditMode);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        changeType: '',
        riskLevel: '',
        justification: '',
        startDate: '',
        endDate: '',
        affectedUsers: '',
        impactAssessment: '',
        implementationPlan: '',
        rollbackPlan: '',
    });

    // Load existing request data in edit mode
    useEffect(() => {
        if (isEditMode) {
            loadRequestData();
        }
    }, [id]);

    const loadRequestData = async () => {
        try {
            const response = await requestService.getById(id);
            const request = response.data;

            // Parse dates
            const startDate = new Date(request.plannedStartDate);
            const endDate = new Date(request.plannedEndDate);

            setFormData({
                title: request.title || '',
                description: request.description || '',
                changeType: request.changeType || '',
                riskLevel: request.riskLevel || '',
                justification: request.justification || '',
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0],
                affectedUsers: request.affectedDepartments?.[0] || '',
                impactAssessment: request.impactAssessment || '',
                implementationPlan: request.implementationPlan || '',
                rollbackPlan: request.rollbackPlan || '',
            });
        } catch (error) {
            console.error('Failed to load request:', error);
            toast.error('Failed to load request data');
            navigate('/requests');
        } finally {
            setLoadingRequest(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Construct clean payload for Joi validation
            const payload = {
                title: formData.title,
                description: formData.description,
                changeType: formData.changeType,
                riskLevel: formData.riskLevel,
                justification: formData.justification,
                plannedStartDate: `${formData.startDate}T00:00:00.000Z`,
                plannedEndDate: `${formData.endDate}T23:59:59.000Z`,
                implementationPlan: formData.implementationPlan,
                rollbackPlan: formData.rollbackPlan,
                impactAssessment: formData.impactAssessment,
                affectedDepartments: formData.affectedUsers ? [formData.affectedUsers] : [],
            };

            if (isEditMode) {
                await requestService.update(id, payload);
                toast.success('Request updated successfully!');
            } else {
                await requestService.create(payload);
                toast.success('Request created successfully!');
            }
            navigate('/requests');
        } catch (error) {
            console.error(`Failed to ${isEditMode ? 'update' : 'create'} request:`, error);
            toast.error(`Error ${isEditMode ? 'updating' : 'creating'} request: ${error.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="content-container animate-fade-in pb-20">
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <span>Change Management</span>
                <span className="text-gray-300">/</span>
                <span className="text-gray-900 dark:text-gray-300 font-bold">{isEditMode ? 'Edit' : 'Create'} Request</span>
            </nav>

            <header className="mb-10">
                <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-white tracking-tight">
                    {isEditMode ? 'Edit' : 'Create'} Change Request
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg font-medium">
                    {isEditMode ? 'Update your change request with core details' : 'Submit a new change request with core information'}
                </p>
            </header>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* SECTION 1 – Basic Information */}
                    <section className="card space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">1</div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Basic Information</h2>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Request Title *</label>
                                <input
                                    name="title"
                                    value={formData.title}
                                    required
                                    placeholder="Brief summary of the change request"
                                    className="input-field"
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Description *</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    required
                                    rows="4"
                                    placeholder="Provide detailed description of the proposed change"
                                    className="input-field"
                                    onChange={handleChange}
                                ></textarea>
                                <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-wider">Minimum 10 characters required</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Change Type *</label>
                                    <select name="changeType" value={formData.changeType} required className="input-field" onChange={handleChange}>
                                        <option value="">Select type</option>
                                        <option value="Application">Application</option>
                                        <option value="Infrastructure">Infrastructure</option>
                                        <option value="Database">Database</option>
                                        <option value="Network">Network</option>
                                        <option value="Security">Security</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Risk Level *</label>
                                    <select name="riskLevel" value={formData.riskLevel} required className="input-field" onChange={handleChange}>
                                        <option value="">Select risk</option>
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Critical">Critical</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Business Justification *</label>
                                <textarea
                                    name="justification"
                                    value={formData.justification}
                                    required
                                    rows="3"
                                    placeholder="Explain the business need and benefits"
                                    className="input-field"
                                    onChange={handleChange}
                                ></textarea>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 2 – Schedule */}
                    <section className="card space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">2</div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Schedule</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Planned Start Date *</label>
                                <input type="date" name="startDate" value={formData.startDate} required className="input-field" onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Planned End Date *</label>
                                <input type="date" name="endDate" value={formData.endDate} required className="input-field" onChange={handleChange} />
                            </div>
                        </div>
                    </section>

                    {/* SECTION 3 – Impact & Execution */}
                    <section className="card space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">3</div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Impact & Execution</h2>
                        </div>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Affected Users/Departments *</label>
                                <input
                                    name="affectedUsers"
                                    value={formData.affectedUsers}
                                    required
                                    placeholder="e.g., Finance Dept, All Users"
                                    className="input-field"
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Impact Assessment *</label>
                                <textarea
                                    name="impactAssessment"
                                    value={formData.impactAssessment}
                                    required
                                    rows="3"
                                    placeholder="Describe the potential impact"
                                    className="input-field"
                                    onChange={handleChange}
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Implementation Plan *</label>
                                <textarea
                                    name="implementationPlan"
                                    value={formData.implementationPlan}
                                    required
                                    rows="4"
                                    placeholder="Step-by-step implementation steps"
                                    className="input-field"
                                    onChange={handleChange}
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Rollback Plan *</label>
                                <textarea
                                    name="rollbackPlan"
                                    value={formData.rollbackPlan}
                                    required
                                    rows="3"
                                    placeholder="Describe procedure to revert change"
                                    className="input-field"
                                    onChange={handleChange}
                                ></textarea>
                            </div>
                        </div>
                    </section>

                    <div className="flex justify-end items-center bg-white dark:bg-gray-950 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl mt-8 gap-4">
                        <button type="button" onClick={() => navigate('/requests')} className="btn btn-secondary px-8">Cancel</button>
                        <button type="submit" disabled={loading} className="btn btn-primary px-10 shadow-lg shadow-indigo-500/20">
                            {loading ? (isEditMode ? 'Updating...' : 'Submitting...') : (isEditMode ? 'Update Request' : 'Submit Request')}
                        </button>
                    </div>
                </div>

                <aside className="space-y-6">
                    <div className="card shadow-sm border border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Submission Rules</h3>
                        <ul className="space-y-4">
                            {[
                                { title: 'Mandatory Fields', desc: 'All fields marked with * must be completed.' },
                                { title: 'Description Detail', desc: 'Minimum 10 characters required for description.' },
                                { title: 'Impact Clarity', desc: 'Clearly define who and what will be affected.' },
                                { title: 'Rollback Strategy', desc: 'A valid rollback plan is required for all changes.' }
                            ].map((item, i) => (
                                <li key={i} className="flex gap-3">
                                    <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 shrink-0">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">{item.title}</p>
                                        <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-2xl border border-amber-100 dark:border-amber-900/20">
                        <div className="flex gap-3 mb-3">
                            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            <p className="text-sm font-bold text-amber-900 dark:text-amber-400 font-display uppercase tracking-wider">Note</p>
                        </div>
                        <p className="text-xs text-amber-800/70 dark:text-amber-400/60 leading-relaxed font-medium">Changes once submitted will undergo manager review. Detailed information helps in faster approval.</p>
                    </div>
                </aside>
            </form>
        </main>
    );
};

export default CreateRequestPage;
