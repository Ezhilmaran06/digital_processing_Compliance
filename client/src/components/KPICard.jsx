const KPICard = ({ title, value, subtext, icon, trend, trendValue, color }) => {
    const config = {
        primary: {
            bg: 'bg-indigo-50/50 dark:bg-indigo-500/5',
            text: 'text-indigo-600 dark:text-indigo-400',
            border: 'border-indigo-200 dark:border-indigo-500/40',
            glow: 'shadow-[0_0_15px_rgba(99,102,241,0.1)] dark:shadow-[0_0_20px_rgba(99,102,241,0.2)]',
            icon: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400'
        },
        success: {
            bg: 'bg-emerald-50/50 dark:bg-emerald-500/5',
            text: 'text-emerald-600 dark:text-emerald-400',
            border: 'border-emerald-200 dark:border-emerald-500/40',
            glow: 'shadow-[0_0_15px_rgba(16,185,129,0.1)] dark:shadow-[0_0_20px_rgba(16,185,129,0.2)]',
            icon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400'
        },
        warning: {
            bg: 'bg-amber-50/50 dark:bg-amber-500/5',
            text: 'text-amber-600 dark:text-amber-400',
            border: 'border-amber-200 dark:border-amber-500/40',
            glow: 'shadow-[0_0_15px_rgba(245,158,11,0.1)] dark:shadow-[0_0_20px_rgba(245,158,11,0.2)]',
            icon: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400'
        },
        danger: {
            bg: 'bg-rose-50/50 dark:bg-rose-500/5',
            text: 'text-rose-600 dark:text-rose-400',
            border: 'border-rose-200 dark:border-rose-500/40',
            glow: 'shadow-[0_0_15px_rgba(244,63,94,0.1)] dark:shadow-[0_0_20px_rgba(244,63,94,0.2)]',
            icon: 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400'
        },
        info: {
            bg: 'bg-sky-50/50 dark:bg-sky-500/5',
            text: 'text-sky-600 dark:text-sky-400',
            border: 'border-sky-200 dark:border-sky-500/40',
            glow: 'shadow-[0_0_15px_rgba(14,165,233,0.1)] dark:shadow-[0_0_20px_rgba(14,165,233,0.2)]',
            icon: 'bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400'
        }
    };

    const style = config[color] || config.primary;

    return (
        <div className={`glass-card rounded-2xl p-4 group transition-all duration-300 hover:shadow-2xl border-2 ${style.border} ${style.glow}`}>
            <div className="flex flex-col">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-inner ${style.icon} group-hover:scale-110 transition-transform duration-500`}>
                    {icon}
                </div>

                <h3 className="text-slate-400 dark:text-slate-500 text-[9px] font-black tracking-[0.2em] uppercase mb-1">{title}</h3>

                <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-display font-black text-slate-900 dark:text-white tracking-tighter group-hover:text-indigo-500 transition-colors">
                        {value?.toLocaleString() || value}
                    </span>
                </div>

                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-white/5">
                    {trendValue && (
                        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[9px] font-black ${trend === 'up' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'}`}>
                            {trend === 'up' ? '↑' : '↓'} {trendValue}
                        </div>
                    )}
                    {subtext && (
                        <p className={`text-[9px] font-bold tracking-tight uppercase ${subtext.includes('Requires') || subtext.includes('Needs') ? 'text-amber-500' : 'text-slate-400'}`}>
                            {subtext}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KPICard;
