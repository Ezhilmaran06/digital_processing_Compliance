import { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import { toast } from 'sonner';
import { Users, UserX, UserCheck, Trash2, Search, Filter } from 'lucide-react';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

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

    return (
        <div className="max-w-[1700px] mx-auto space-y-3 animate-fade-in text-tight">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-2">
                <div>
                    <h1 className="text-5xl font-display font-black text-slate-900 dark:text-white tracking-tight">User <span className="text-indigo-600 dark:text-indigo-400">Management</span></h1>
                    <p className="text-xl text-slate-500 dark:text-slate-400 mt-3 font-medium">Control system access and identity governance</p>
                </div>
            </header>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between p-3 bg-white dark:bg-slate-900/50 rounded-[1.5rem] border-2 border-slate-300 dark:border-indigo-500/40 shadow-premium backdrop-blur-md">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && loadUsers()}
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700/50 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-[11px] font-black uppercase tracking-tight transition-all"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-48 group">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700/50 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-[10px] font-black uppercase tracking-widest appearance-none cursor-pointer transition-all"
                        >
                            <option value="">All Roles</option>
                            <option value="Employee">Employee</option>
                            <option value="Manager">Manager</option>
                            <option value="Admin">Admin</option>
                            <option value="Client">Client</option>
                            <option value="Auditor">Auditor</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>

                    <button onClick={loadUsers} className="p-2.5 bg-indigo-600 text-white rounded-xl border-2 border-indigo-500 shadow-premium transition-all hover:scale-105 active:scale-95">
                        <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.586M20 20v-5h-.586m-1.547-3.536L18 12M6 12l1.953-1.953m10.094 4.144L18 15" /></svg>
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
                                    <tr key={user._id} className="hover:bg-slate-100/50 dark:hover:bg-indigo-500/10 transition-all group">
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
                                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] border-2 transition-all ${user.role === 'Admin' ? 'bg-indigo-50 text-indigo-600 border-indigo-500/70 dark:bg-indigo-900/40 dark:border-indigo-500/70 shadow-sm' :
                                                user.role === 'Manager' ? 'bg-emerald-50 text-emerald-600 border-emerald-500/70 dark:bg-emerald-900/40 dark:border-emerald-500/70 shadow-sm' :
                                                    'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:border-slate-700 shadow-sm'
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
                                                    onClick={() => handleToggleStatus(user)}
                                                    className={`p-2 rounded-xl transition-all shadow-sm border-2 ${user.isActive
                                                        ? 'bg-amber-50 text-amber-600 border-amber-500/50 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-500/30'
                                                        : 'bg-emerald-50 text-emerald-600 border-emerald-500/50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-500/30'}`}
                                                    title={user.isActive ? 'Suspend access' : 'Restore access'}
                                                >
                                                    {user.isActive ? <UserX size={16} strokeWidth={2.5} /> : <UserCheck size={16} strokeWidth={2.5} />}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user._id)}
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
        </div>
    );
};

export default UserManagement;
