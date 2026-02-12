import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const AppNavbar = () => {
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    let navLinks = [
        { name: 'Dashboard', path: `/${user?.role?.toLowerCase() || ''}` },
        { name: 'Requests', path: '/requests' },
        { name: 'Analytics', path: '/analytics' },
        { name: 'Settings', path: '/settings' },
    ];

    // Role-based Nav Filtering
    if (user?.role === 'Client') {
        navLinks = navLinks.filter(link =>
            link.name !== 'Requests' && link.name !== 'Analytics'
        );
    }

    if (user?.role === 'Admin') {
        const dashboardIdx = navLinks.findIndex(l => l.name === 'Dashboard');
        navLinks.splice(dashboardIdx + 1, 0, { name: 'Users', path: '/admin/users' });
    }

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="glass-navbar sticky top-4 mx-4 md:mx-8 px-6 py-4 rounded-[2.5rem] shadow-2xl shadow-indigo-500/10 z-[100] transition-all duration-300">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-10">
                    <Link to="/" className="flex items-center gap-3.5 group">
                        <div className="w-11 h-11 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-indigo-500/25 group-hover:rotate-6 transition-all duration-500">
                            C
                        </div>
                        <span className="text-2xl font-display font-black tracking-tight text-slate-900 dark:text-white">
                            Change<span className="text-indigo-600 dark:text-indigo-400">Flow</span>
                        </span>
                    </Link>

                    <div className="hidden lg:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`px-5 py-2.5 rounded-2xl text-[13px] font-bold tracking-wide transition-all duration-300 relative group ${isActive(link.path)
                                    ? 'text-indigo-600 dark:text-indigo-400 bg-white/50 dark:bg-white/5'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                {link.name}
                                {isActive(link.path) && (
                                    <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-500 dark:bg-indigo-400 rounded-full shadow-lg shadow-indigo-500/50"></span>
                                )}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-5">
                    <button
                        onClick={toggleTheme}
                        className="p-3 text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/5 rounded-2xl transition-all active:scale-90"
                    >
                        {isDark ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 3v1m0 18v1m9-9h1M4 12H3m15.364-6.364l.707-.707M6.343 17.657l-.707.707M16.243 16.243l.707.707M7.757 7.757l.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" /></svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                        )}
                    </button>

                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden md:block"></div>

                    <div className="hidden md:flex items-center gap-4 bg-white/30 dark:bg-white/5 p-1 pr-4 rounded-3xl border border-white/20">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {user?.name?.charAt(0)}
                        </div>
                        <div className="text-left hidden lg:block">
                            <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{user?.name}</p>
                            <p className="text-[9px] uppercase tracking-[0.2em] font-black text-slate-400/80 mt-1">{user?.role}</p>
                        </div>
                        <button onClick={logout} className="ml-2 p-2 text-slate-400 hover:text-rose-500 transition-all hover:scale-110">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>

                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="lg:hidden p-3 rounded-2xl text-slate-500 hover:bg-white/50 dark:hover:bg-white/5 transition-all"
                    >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {isMenuOpen && (
                <div className="lg:hidden absolute top-full inset-x-0 mt-4 mx-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[2rem] border border-white/20 shadow-2xl p-6 animate-slide-up">
                    <div className="space-y-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`block px-5 py-3.5 rounded-2xl text-sm font-bold tracking-wide transition-all ${isActive(link.path)
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between px-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold uppercase">{user?.name?.charAt(0)}</div>
                                <div>
                                    <p className="text-sm font-bold dark:text-white">{user?.name}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{user?.role}</p>
                                </div>
                            </div>
                            <button onClick={logout} className="btn-secondary p-3 rounded-xl text-rose-500">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default AppNavbar;
