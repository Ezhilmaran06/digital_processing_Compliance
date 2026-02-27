import { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import { toast } from 'sonner';
import { Users, UserX, UserCheck, Trash2, Search, Mail, Shield, BadgeCheck, Clock, ShieldCheck, Fingerprint, Calendar, Building2, Eye, UserPlus, Lock, ShieldAlert } from 'lucide-react';
import Modal from '../components/Modal';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [regLoading, setRegLoading] = useState(false);
    const [regFormData, setRegFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Employee',
        notificationEmail: ''
    });

    const getAvatarUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '').replace(/\/$/, '') || '';
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        const timestamp = new Date().getTime();
        return `${baseUrl}${cleanPath}?t=${timestamp}`;
    };

    useEffect(() => {
        loadUsers();
    }, [roleFilter]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const params = {};
            if (roleFilter) params.role = roleFilter;

            const response = await adminService.getUsers(params);
            let data = response.data || [];

            // Local search filtering if needed, though backend supports it too
            if (searchQuery) {
                data = data.filter(u =>
                    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    u.email.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }

            setUsers(data);
        } catch (error) {
            console.error('Failed to load users:', error);
            toast.error('Failed to sync system users');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (user) => {
        try {
            await adminService.updateUser(user._id, { isActive: !user.isActive });
            toast.success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
            loadUsers();
        } catch (error) {
            toast.error(error.message || 'Action failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure? This action is permanent and will remove all user records.')) return;
        try {
            await adminService.deleteUser(id);
            toast.success('User purged from system');
            loadUsers();
        } catch (error) {
            toast.error(error.message || 'Delete failed');
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setRegLoading(true);
        try {
            await adminService.createUser(regFormData);
            toast.success('Identity provisioned successfully');
            setIsRegisterModalOpen(false);
            setRegFormData({ name: '', email: '', password: '', role: 'Employee', notificationEmail: '' });
            loadUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to provision identity');
        } finally {
            setRegLoading(false);
        }
    };

    const handleViewUser = (user) => {
        setSelectedUser(user);
        setIsDetailsModalOpen(true);
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setRegFormData({
            name: user.name,
            email: user.email,
            password: '', // Don't pre-fill password for security
            role: user.role,
            notificationEmail: ''
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setRegLoading(true);
        try {
            const updateData = { ...regFormData };
            if (!updateData.password) delete updateData.password;

            await adminService.updateUser(selectedUser._id, updateData);
            toast.success('Identity updated successfully');
            setIsEditModalOpen(false);
            setRegFormData({ name: '', email: '', password: '', role: 'Employee', notificationEmail: '' });
            setSelectedUser(null);
            loadUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update identity');
        } finally {
            setRegLoading(false);
        }
    };

    return (
        <div className="max-w-[1700px] mx-auto space-y-3 animate-fade-in text-tight">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-2">
                <div>
                    <h1 className="text-5xl font-display font-black text-slate-900 dark:text-white tracking-tight">User <span className="text-indigo-600 dark:text-indigo-400">Management</span></h1>
                    <p className="text-xl text-slate-500 dark:text-slate-400 mt-3 font-medium">Control system access and identity governance</p>
                </div>
            </header>

            {/* Controls — styled like RequestsPage */}
            <div className="section-card p-3 mb-1">
                {/* Top row: search + dropdowns + button */}
                <div className="flex flex-col md:flex-row gap-2 justify-between items-center mb-3">
                    <div className="relative w-full md:w-1/3 group">
                        <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                            <Search className="h-4 w-4" />
                        </span>
                        <input
                            type="text"
                            placeholder="Find identities..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && loadUsers()}
                            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 text-[11px] font-bold uppercase tracking-tight focus:outline-none"
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest cursor-pointer focus:outline-none focus:border-indigo-500"
                        >
                            <option value="">All Roles</option>
                            <option value="Admin">Admin</option>
                            <option value="Manager">Manager</option>
                            <option value="Employee">Employee</option>
                            <option value="Auditor">Auditor</option>
                        </select>
                        <button
                            onClick={() => setIsRegisterModalOpen(true)}
                            className="btn btn-primary px-5 py-2 text-[10px] uppercase font-black tracking-widest rounded-xl flex items-center gap-1.5"
                        >
                            <UserPlus size={14} />
                            + Provision
                        </button>
                    </div>
                </div>

                {/* Role quick-filter chips */}
                <div className="flex flex-wrap gap-2">
                    {[
                        { label: 'All', value: '', color: 'slate' },
                        { label: 'Admin', value: 'Admin', color: 'indigo' },
                        { label: 'Manager', value: 'Manager', color: 'emerald' },
                        { label: 'Employee', value: 'Employee', color: 'amber' },
                        { label: 'Auditor', value: 'Auditor', color: 'sky' },
                    ].map(({ label, value, color }) => (
                        <button
                            key={label}
                            onClick={() => setRoleFilter(value)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border-2 transition-all ${roleFilter === value
                                ? `bg-${color}-50 border-${color}-200 text-${color}-700 dark:bg-${color}-900/30 dark:border-${color}-500/50 dark:text-${color}-300 shadow-sm`
                                : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            {value && <span className={`w-2 h-2 rounded-full bg-${color}-500`} />}
                            {label}
                        </button>
                    ))}
                    <button
                        onClick={() => { setRoleFilter(''); setSearchQuery(''); }}
                        className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        Clear
                    </button>
                </div>
            </div>

            {/* User Grid/Table */}
            <div className="section-card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-100/50 dark:bg-slate-950/50 border-b-2 border-slate-300 dark:border-indigo-500/40">
                            <tr>
                                <th className="py-4 px-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Identity Node</th>
                                <th className="py-4 px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Permissions</th>
                                <th className="py-4 px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Live Status</th>
                                <th className="py-4 px-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Overrides</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-slate-200 dark:divide-slate-800">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="4" className="py-4 px-6">
                                            <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl w-full opacity-50 border-2 border-slate-200 dark:border-slate-700"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <Users className="w-12 h-12 text-slate-200 dark:text-slate-800" />
                                            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No synchronized identity nodes found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                users.map(user => (
                                    <tr
                                        key={user._id}
                                        className="hover:bg-indigo-50/50 dark:hover:bg-indigo-500/10 transition-all group"
                                    >
                                        <td className="py-4 px-10">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/40 dark:to-slate-900 flex items-center justify-center text-sm font-black text-indigo-600 dark:text-indigo-400 border-2 border-indigo-100/50 dark:border-indigo-800/50 overflow-hidden shadow-sm transition-transform group-hover:scale-110">
                                                    {user.avatar ? (
                                                        <img
                                                            src={getAvatarUrl(user.avatar)}
                                                            alt={user.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                e.target.parentElement.textContent = user.name?.[0]?.toUpperCase() || '?';
                                                            }}
                                                        />
                                                    ) : (
                                                        user.name?.[0]?.toUpperCase()
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 dark:text-white leading-tight mb-0.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{user.name}</p>
                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] border-2 transition-all ${user.role === 'Admin' ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/40 dark:bg-indigo-900/40 dark:border-indigo-500/40 shadow-sm' :
                                                user.role === 'Manager' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/40 dark:bg-emerald-900/40 dark:border-emerald-500/40 shadow-sm' :
                                                    'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 shadow-sm'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className={`flex items-center gap-2 text-[10px] font-black tracking-widest ${user.isActive ? 'text-emerald-500' : 'text-slate-400'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                                                {user.isActive ? 'OPERATIONAL' : 'DEACTIVATED'}
                                            </div>
                                        </td>
                                        <td className="py-4 px-10 text-right">
                                            <div className="flex items-center justify-end gap-2.5 transition-all">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleViewUser(user); }}
                                                    className="p-2 bg-indigo-50 text-indigo-600 border-2 border-indigo-500/50 rounded-xl hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-500/30 transition-all shadow-sm"
                                                    title="View Profile"
                                                >
                                                    <Eye size={16} strokeWidth={2.5} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleEditUser(user); }}
                                                    className="p-2 bg-indigo-50 text-indigo-600 border-2 border-indigo-500/50 rounded-xl hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-500/30 transition-all shadow-sm"
                                                    title="Edit Identity"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleToggleStatus(user); }}
                                                    className={`p-2 rounded-xl transition-all shadow-sm border-2 ${user.isActive
                                                        ? 'bg-amber-50 text-amber-600 border-amber-500/50 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-500/30'
                                                        : 'bg-emerald-50 text-emerald-600 border-emerald-500/50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-500/30'}`}
                                                    title={user.isActive ? 'Suspend access' : 'Restore access'}
                                                >
                                                    {user.isActive ? <UserX size={16} strokeWidth={2.5} /> : <UserCheck size={16} strokeWidth={2.5} />}
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(user._id); }}
                                                    className="p-2 bg-rose-50 text-rose-600 border-2 border-rose-500/50 rounded-xl hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-500/30 transition-all shadow-sm"
                                                    title="Purge identity"
                                                >
                                                    <Trash2 size={16} strokeWidth={2.5} />
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

            {/* Profile Details Modal */}
            <Modal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                title="Identity Node Profile"
                size="lg"
            >
                {selectedUser && (
                    <div className="space-y-8">
                        {/* Header Section */}
                        <div className="sticky top-0 bg-white dark:bg-slate-900 pb-4 border-b border-slate-100 dark:border-slate-800 z-10 flex flex-col md:flex-row items-center gap-6 pt-2">
                            <div className="relative">
                                <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 shadow-xl flex items-center justify-center text-2xl font-black text-indigo-600 dark:text-indigo-400 overflow-hidden group-hover:scale-105 transition-transform">
                                    {selectedUser.avatar ? (
                                        <img
                                            src={getAvatarUrl(selectedUser.avatar)}
                                            alt={selectedUser.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.parentElement.textContent = selectedUser.name?.[0]?.toUpperCase() || '?';
                                            }}
                                        />
                                    ) : (
                                        selectedUser.name?.[0]?.toUpperCase()
                                    )}
                                </div>
                                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-lg border-2 border-white dark:border-slate-900 shadow-lg flex items-center justify-center ${selectedUser.isActive ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-slate-400 shadow-slate-500/20'}`}>
                                    {selectedUser.isActive ? <BadgeCheck className="w-3 h-3 text-white" /> : <Clock className="w-3 h-3 text-white" />}
                                </div>
                            </div>

                            <div className="text-center md:text-left space-y-1 relative z-10">
                                <div className="flex flex-col md:flex-row items-center gap-2">
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">{selectedUser.name}</h2>
                                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${selectedUser.role === 'Admin' ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/40' :
                                        selectedUser.role === 'Manager' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/40' :
                                            'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                                        }`}>
                                        {selectedUser.role}
                                    </span>
                                </div>
                                <div className="flex items-center justify-center md:justify-start gap-3 text-slate-500 dark:text-slate-400">
                                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest">
                                        <Mail className="w-3.5 h-3.5 text-indigo-500" />
                                        {selectedUser.email}
                                    </div>
                                    <div className="h-3 w-px bg-slate-200 dark:bg-slate-700 hidden md:block" />
                                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest">
                                        <Fingerprint className="w-3.5 h-3.5 text-indigo-500" />
                                        {selectedUser.employeeId || 'PENDING_ID'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-900/40 transition-all group">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 group-hover:scale-110 transition-transform">
                                        <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Security Compliance</h4>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                                        <span className="text-slate-400">Two-Factor Auth</span>
                                        <div className={`flex items-center gap-2 ${selectedUser.twoFactorEnabled ? 'text-emerald-500' : 'text-amber-500'}`}>
                                            <ShieldCheck className="w-3.5 h-3.5" />
                                            {selectedUser.twoFactorEnabled ? 'ACTIVE' : 'INACTIVE'}
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                                        <span className="text-slate-400">Access Status</span>
                                        <div className={`flex items-center gap-2 ${selectedUser.isActive ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${selectedUser.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-rose-500'}`} />
                                            {selectedUser.isActive ? 'OPERATIONAL' : 'SUSPENDED'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-900/40 transition-all group">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-900/20 group-hover:scale-110 transition-transform">
                                        <Building2 className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                                    </div>
                                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Organizational Node</h4>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                                        <span className="text-slate-400">Department</span>
                                        <span className="text-slate-900 dark:text-slate-200">{selectedUser.department || 'UNCATEGORIZED'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                                        <span className="text-slate-400">Join Date</span>
                                        <div className="flex items-center gap-2 text-slate-900 dark:text-slate-200">
                                            <Calendar className="w-3.5 h-3.5 text-sky-500" />
                                            {new Date(selectedUser.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity Mini-Section */}
                        <div className="p-6 rounded-[2rem] bg-slate-900 text-white relative overflow-hidden group">
                            <div className="absolute inset-0 bg-indigo-500/10 mix-blend-overlay group-hover:scale-110 transition-transform duration-700" />
                            <div className="relative flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">System Telemetry</p>
                                    <p className="text-lg font-black tracking-tight flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-indigo-500" />
                                        LAST LOGIN DETECTED
                                    </p>
                                </div>
                                <p className="text-2xl font-black text-white tracking-widest opacity-80 flex flex-col items-end">
                                    <span className="text-xs text-indigo-300 font-bold mb-1 uppercase tracking-[0.2em]">
                                        {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                                    </span>
                                    {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'NO_LOGS'}
                                </p>
                            </div>
                        </div>

                        {/* Actions Area */}
                        <div className="flex gap-4 pt-4 border-t-2 border-slate-100 dark:border-slate-800">
                            <button
                                onClick={(e) => { e.stopPropagation(); handleToggleStatus(selectedUser); setIsDetailsModalOpen(false); }}
                                className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] border-2 transition-all ${selectedUser.isActive
                                    ? 'bg-amber-50 text-amber-600 border-amber-500/50 hover:bg-amber-500 hover:text-white'
                                    : 'bg-emerald-50 text-emerald-600 border-emerald-500/50 hover:bg-emerald-500 hover:text-white'
                                    }`}
                            >
                                {selectedUser.isActive ? 'DEACTIVATE ACCESS' : 'RESTORE ACCESS'}
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(selectedUser._id); setIsDetailsModalOpen(false); }}
                                className="flex-1 py-4 rounded-2xl bg-rose-50 text-rose-600 border-2 border-rose-500/50 font-black uppercase tracking-widest text-[11px] hover:bg-rose-500 hover:text-white transition-all"
                            >
                                PURGE IDENTITY
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Provision Identity Modal */}
            <Modal
                isOpen={isRegisterModalOpen}
                onClose={() => setIsRegisterModalOpen(false)}
                title="Provision New Identity"
                size="md"
            >
                <form onSubmit={handleRegisterSubmit} className="space-y-6">
                    <div className="space-y-4">
                        {/* Name Field */}
                        <div className="relative group">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 block">Full Name</label>
                            <div className="relative">
                                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                <input
                                    type="text"
                                    required
                                    value={regFormData.name}
                                    onChange={(e) => setRegFormData({ ...regFormData, name: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700/50 rounded-2xl py-3 pl-12 pr-6 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-sm"
                                    placeholder="Enter full name"
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className="relative group">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 block">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={regFormData.email}
                                    onChange={(e) => setRegFormData({ ...regFormData, email: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700/50 rounded-2xl py-3 pl-12 pr-6 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-sm"
                                    placeholder="email@company.com"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="relative group">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 block">Security Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={regFormData.password}
                                    onChange={(e) => setRegFormData({ ...regFormData, password: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700/50 rounded-2xl py-3 pl-12 pr-6 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-sm"
                                    placeholder="Minimum 8 characters"
                                    minLength={8}
                                />
                            </div>
                        </div>

                        {/* Notification Email Field */}
                        <div className="relative group">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 block">Notification Recipient (Credential Log)</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                <input
                                    type="email"
                                    value={regFormData.notificationEmail}
                                    onChange={(e) => setRegFormData({ ...regFormData, notificationEmail: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700/50 rounded-2xl py-3 pl-12 pr-6 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-sm"
                                    placeholder="manager@company.com (Optional)"
                                />
                            </div>
                            <p className="mt-1.5 text-[9px] text-slate-400 font-bold uppercase tracking-wider">Specify an email to receive a copy of these credentials</p>
                        </div>

                        {/* Role Selection */}
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 block">System Role</label>
                            <div className="grid grid-cols-2 gap-3">
                                {['Admin', 'Manager', 'Employee', 'Auditor'].map((role) => (
                                    <label
                                        key={role}
                                        className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${regFormData.role === role
                                            ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-700 dark:text-indigo-400 shadow-sm'
                                            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-300'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="role"
                                            value={role}
                                            checked={regFormData.role === role}
                                            onChange={(e) => setRegFormData({ ...regFormData, role: e.target.value })}
                                            className="sr-only"
                                        />
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${regFormData.role === role ? 'border-indigo-500' : 'border-slate-300'}`}>
                                            {regFormData.role === role && <div className="w-2 h-2 rounded-full bg-indigo-500 animate-scale-in" />}
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-widest">{role}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-100 dark:border-amber-900/20 flex gap-4 items-start">
                        <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 leading-relaxed uppercase tracking-wider">
                            By provisioning this identity, you grant the user access to the system according to their assigned role. Ensure all details are accurate before proceeding.
                        </p>
                    </div>

                    <div className="flex gap-4 pb-8">
                        <button
                            type="button"
                            onClick={() => setIsRegisterModalOpen(false)}
                            className="flex-1 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 font-black uppercase tracking-widest text-[11px] text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={regLoading}
                            className="flex-1 py-4 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest text-[11px] shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 group"
                        >
                            {regLoading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Provision Identity
                                    <UserPlus className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Identity Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Update Identity Settings"
                size="md"
            >
                <form onSubmit={handleEditSubmit} className="space-y-6">
                    <div className="space-y-4">
                        {/* Name Field */}
                        <div className="relative group">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 block">Full Name</label>
                            <div className="relative">
                                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                <input
                                    type="text"
                                    required
                                    value={regFormData.name}
                                    onChange={(e) => setRegFormData({ ...regFormData, name: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700/50 rounded-2xl py-3 pl-12 pr-6 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-sm"
                                    placeholder="Enter full name"
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className="relative group">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 block">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={regFormData.email}
                                    onChange={(e) => setRegFormData({ ...regFormData, email: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700/50 rounded-2xl py-3 pl-12 pr-6 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-sm"
                                    placeholder="email@company.com"
                                />
                            </div>
                        </div>

                        {/* Password Field (Optional on edit) */}
                        <div className="relative group">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 block">Change Security Password (Leave blank to keep current)</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                <input
                                    type="password"
                                    value={regFormData.password}
                                    onChange={(e) => setRegFormData({ ...regFormData, password: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700/50 rounded-2xl py-3 pl-12 pr-6 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-sm"
                                    placeholder="Minimum 8 characters"
                                    minLength={8}
                                />
                            </div>
                        </div>

                        {/* Role Selection */}
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 block">System Role</label>
                            <div className="grid grid-cols-2 gap-3">
                                {['Admin', 'Manager', 'Employee', 'Auditor'].map((role) => (
                                    <label
                                        key={role}
                                        className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${regFormData.role === role
                                            ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-700 dark:text-indigo-400 shadow-sm'
                                            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-300'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="role"
                                            value={role}
                                            checked={regFormData.role === role}
                                            onChange={(e) => setRegFormData({ ...regFormData, role: e.target.value })}
                                            className="sr-only"
                                        />
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${regFormData.role === role ? 'border-indigo-500' : 'border-slate-300'}`}>
                                            {regFormData.role === role && <div className="w-2 h-2 rounded-full bg-indigo-500 animate-scale-in" />}
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-widest">{role}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/10 border-2 border-indigo-100 dark:border-indigo-900/20 flex gap-4 items-start">
                        <ShieldCheck className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                        <p className="text-[10px] font-bold text-indigo-700 dark:text-amber-400 leading-relaxed uppercase tracking-wider">
                            Applying these changes will immediately update the identity's permissions and access profile.
                        </p>
                    </div>

                    <div className="flex gap-4 pb-8">
                        <button
                            type="button"
                            onClick={() => setIsEditModalOpen(false)}
                            className="flex-1 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 font-black uppercase tracking-widest text-[11px] text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={regLoading}
                            className="flex-1 py-4 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest text-[11px] shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 group"
                        >
                            {regLoading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Update Identity
                                    <ShieldCheck className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default UserManagement;
