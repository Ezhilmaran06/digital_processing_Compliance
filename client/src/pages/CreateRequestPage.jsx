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
        environment: '',
        justification: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        downtime: '0',
        downtimeUnit: 'No downtime',
        affectedUsers: '',
        impactAssessment: '',
        implementationPlan: '',
        rollbackPlan: '',
        testingPlan: '',
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
                environment: request.environment || '',
                justification: request.justification || '',
                startDate: startDate.toISOString().split('T')[0],
                startTime: startDate.toTimeString().slice(0, 5),
                endDate: endDate.toISOString().split('T')[0],
                endTime: endDate.toTimeString().slice(0, 5),
                affectedUsers: request.affectedDepartments?.[0] || '',
                impactAssessment: request.impactAssessment || '',
                implementationPlan: request.implementationPlan || '',
                rollbackPlan: request.rollbackPlan || '',
                testingPlan: request.testingPlan || '',
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

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(prev => [...prev, ...files]);
    };

    const handleFileDrop = (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        setSelectedFiles(prev => [...prev, ...files]);
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setUploading(true);
        try {
            // Upload files first
            const uploadedAttachments = [];
            for (const file of selectedFiles) {
                const response = await requestService.uploadFile(file);
                if (response.success && response.data) {
                    uploadedAttachments.push(response.data);
                }
            }

            // Construct clean payload for Joi validation
            const payload = {
                title: formData.title,
                description: formData.description,
                changeType: formData.changeType,
                riskLevel: formData.riskLevel,
                environment: formData.environment,
                justification: formData.justification,
                plannedStartDate: `${formData.startDate}T${formData.startTime}:00.000Z`,
                plannedEndDate: `${formData.endDate}T${formData.endTime}:00.000Z`,
                implementationPlan: formData.implementationPlan,
                rollbackPlan: formData.rollbackPlan,
                testingPlan: formData.testingPlan,
                impactAssessment: formData.impactAssessment,
                affectedDepartments: formData.affectedUsers ? [formData.affectedUsers] : [],
                attachments: uploadedAttachments
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
            setUploading(false);
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
                    {isEditMode ? 'Update your change request with complete details and documentation' : 'Submit a new IT change request with complete details and documentation'}
                </p>
            </header>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Request Information */}
                    <section className="card space-y-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Request Information</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Request Title *</label>
                                <input
                                    name="title"
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
                                    required
                                    rows="4"
                                    placeholder="Provide detailed description of the proposed change, including objectives and expected outcomes"
                                    className="input-field"
                                    onChange={handleChange}
                                ></textarea>
                                <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-wider">Minimum 10 characters required</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Change Type *</label>
                                    <select name="changeType" required className="input-field" onChange={handleChange}>
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
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Risk Level *</label>
                                    <select name="riskLevel" required className="input-field" onChange={handleChange}>
                                        <option value="">Select risk level</option>
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Critical">Critical</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Environment *</label>
                                <select name="environment" required className="input-field" onChange={handleChange}>
                                    <option value="">Select environment</option>
                                    <option value="Production">Production</option>
                                    <option value="Staging">Staging</option>
                                    <option value="Development">Development</option>
                                    <option value="All">All Environment</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Business Justification *</label>
                                <textarea
                                    name="justification"
                                    required
                                    rows="3"
                                    placeholder="Explain the business need and benefits of this change"
                                    className="input-field"
                                    onChange={handleChange}
                                ></textarea>
                            </div>
                        </div>
                    </section>

                    {/* Schedule & Impact */}
                    <section className="card space-y-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Schedule & Impact</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Planned Start Date *</label>
                                    <input type="date" name="startDate" required className="input-field" onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Planned Start Time *</label>
                                    <input type="time" name="startTime" required className="input-field" onChange={handleChange} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Planned End Date *</label>
                                    <input type="date" name="endDate" required className="input-field" onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Planned End Time *</label>
                                    <input type="time" name="endTime" required className="input-field" onChange={handleChange} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Expected Downtime</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <input type="number" name="downtimeHours" placeholder="Hours" className="input-field" onChange={handleChange} />
                                    <input type="number" name="downtimeMins" placeholder="Mins" className="input-field" onChange={handleChange} />
                                    <select name="downtimeUnit" className="input-field" onChange={handleChange}>
                                        <option>No downtime</option>
                                        <option>Partial outage</option>
                                        <option>Full outage</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Affected Users/Departments *</label>
                                <input
                                    name="affectedUsers"
                                    required
                                    placeholder="e.g., Finance Department, All Users, Regional offices"
                                    className="input-field"
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Impact Assessment *</label>
                                <textarea
                                    name="impactAssessment"
                                    required
                                    rows="3"
                                    placeholder="Describe the potential impact on business operations, users, and systems"
                                    className="input-field"
                                    onChange={handleChange}
                                ></textarea>
                            </div>
                        </div>
                    </section>

                    {/* Implementation Details */}
                    <section className="card space-y-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Implementation Details</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Implementation Plan *</label>
                                <textarea
                                    name="implementationPlan"
                                    required
                                    rows="4"
                                    placeholder="Provide step-by-step implementation plan including pre-change tasks, implementation steps, and post-change validation"
                                    className="input-field"
                                    onChange={handleChange}
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Rollback Plan *</label>
                                <textarea
                                    name="rollbackPlan"
                                    required
                                    rows="3"
                                    placeholder="Describe the rollback procedure in case the change needs to be reverted"
                                    className="input-field"
                                    onChange={handleChange}
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Testing Plan</label>
                                <textarea
                                    name="testingPlan"
                                    rows="3"
                                    placeholder="Describe testing procedures and validation criteria"
                                    className="input-field"
                                    onChange={handleChange}
                                ></textarea>
                            </div>
                        </div>
                    </section>

                    {/* Attachments */}
                    <section className="card space-y-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Attachments</h2>
                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleFileDrop}
                            onClick={() => document.getElementById('file-upload').click()}
                            className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-10 flex flex-col items-center justify-center gap-4 bg-gray-50/50 dark:bg-gray-900/20 hover:border-indigo-500 transition-colors cursor-pointer group"
                        >
                            <input
                                id="file-upload"
                                type="file"
                                multiple
                                hidden
                                onChange={handleFileSelect}
                            />
                            <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-premium text-gray-400 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-gray-900 dark:text-white">Click to upload or drag and drop</p>
                                <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-widest">PDF, DOC, DOCX, XLS, XLSX up to 10MB each</p>
                            </div>
                        </div>

                        {selectedFiles.length > 0 && (
                            <div className="space-y-3">
                                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Selected Files ({selectedFiles.length})</p>
                                <div className="grid grid-cols-1 gap-2">
                                    {selectedFiles.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-800 animate-slide-in">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-xs">{file.name}</p>
                                                    <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                                                className="p-2 text-gray-400 hover:text-rose-600 transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <p className="text-xs text-gray-400 font-medium">Include technical diagrams, approval documents, or related specifications.</p>
                    </section>

                    <div className="flex justify-between items-center bg-white dark:bg-gray-950 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl mt-8">
                        <button type="button" onClick={() => alert('Saved as Draft')} className="text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors">Save as Draft</button>
                        <div className="flex gap-4">
                            <button type="button" onClick={() => navigate('/requests')} className="btn btn-secondary px-8">Cancel</button>
                            <button type="submit" disabled={loading} className="btn btn-primary px-10 shadow-lg shadow-indigo-500/20">
                                {loading ? (uploading ? 'Uploading...' : (isEditMode ? 'Updating...' : 'Submitting...')) : (isEditMode ? 'Update Request' : 'Submit Request')}
                            </button>
                        </div>
                    </div>
                </div>

                <aside className="space-y-8">
                    <div className="card shadow-sm border border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Guidelines</h3>
                        <ul className="space-y-4">
                            {[
                                { title: 'Complete Information', desc: 'Fill all required fields with accurate and detailed information.' },
                                { title: 'Risk Assessment', desc: 'Properly evaluate and document potential risks and impacts.' },
                                { title: 'Implementation Plan', desc: 'Include detailed steps and rollback procedures.' },
                                { title: 'Supporting Documents', desc: 'Attach relevant technical diagrams and approvals.' }
                            ].map((item, i) => (
                                <li key={i} className="flex gap-3">
                                    <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 shrink-0">
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
                            <p className="text-sm font-bold text-amber-900 dark:text-amber-400 font-display uppercase tracking-wider">Important Notice</p>
                        </div>
                        <p className="text-xs text-amber-800/70 dark:text-amber-400/60 leading-relaxed font-medium">High and critical risk changes require CAB approval. Emergency changes need immediate manager authorization.</p>
                    </div>

                    <div className="card shadow-sm border border-gray-100 dark:border-gray-800">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Approval Process</h3>
                        <div className="space-y-6">
                            {[
                                { step: 1, label: 'Manager Review', desc: 'Initial approval from direct manager' },
                                { step: 2, label: 'CAB Assessment', desc: 'Change Advisory Board evaluation' },
                                { step: 3, label: 'Final Approval', desc: 'Change manager authorization' }
                            ].map((s, i) => (
                                <div key={i} className="flex gap-4 relative">
                                    {i !== 2 && <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-gray-100 dark:bg-gray-800"></div>}
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${i === 0 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                                        {s.step}
                                    </div>
                                    <div>
                                        <p className={`text-sm font-bold ${i === 0 ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{s.label}</p>
                                        <p className="text-[11px] text-gray-500 mt-1">{s.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </form>
        </main>
    );
};

export default CreateRequestPage;
