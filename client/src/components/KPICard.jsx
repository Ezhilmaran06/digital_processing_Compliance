const KPICard = ({ title, value, subtext, icon, trend, trendValue, color }) => {
    const colorClasses = {
        primary: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
        success: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
        warning: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
        danger: 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
        info: 'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400',
    };

    return (
        <div className="glass-card rounded-3xl p-7 group hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 cursor-default">
            <div className="flex flex-col">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-inner ${colorClasses[color || 'primary']} group-hover:rotate-6 transition-transform duration-500`}>
                    <div className="group-hover:scale-110 transition-transform duration-500">
                        {icon}
                    </div>
                </div>

                <h3 className="text-gray-400 dark:text-gray-500 text-xs font-bold tracking-[0.1em] uppercase mb-1">{title}</h3>

                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-display font-black text-gray-900 dark:text-white tracking-tight">
                        {value?.toLocaleString() || value}
                    </span>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100/50 dark:border-white/5">
                    {trendValue && (
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold ${trend === 'up' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-rose-50 text-rose-600 dark:bg-rose-900/20'}`}>
                            {trend === 'up' ? '↑' : '↓'} {trendValue}
                        </div>
                    )}
                    {subtext && (
                        <p className={`text-xs font-bold tracking-tight ${subtext.includes('Requires') || subtext.includes('Needs') ? 'text-amber-500' : 'text-gray-400 dark:text-gray-500'}`}>
                            {subtext}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KPICard;
