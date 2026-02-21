import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Label } from 'recharts';

const StatusChart = ({ data, label = 'Requests' }) => {
    const COLORS = [
        '#6366f1', // Indigo Vibrant
        '#10b981', // Emerald Solid
        '#f59e0b', // Amber Vivid
        '#f43f5e', // Rose Bright
        '#8b5cf6', // Violet Deep
        '#0ea5e9', // Sky Clear
    ];
    const total = data.reduce((acc, curr) => acc + curr.value, 0);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-4 rounded-2xl shadow-premium border-2 border-indigo-500/20 animate-in fade-in zoom-in duration-300">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{payload[0].name}</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">
                        {payload[0].value.toLocaleString()} <span className="text-sm font-bold text-slate-500 tracking-tight">{label}</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="h-72 w-full relative group">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={85}
                        outerRadius={110}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                        animationBegin={0}
                        animationDuration={1500}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                                stroke={COLORS[index % COLORS.length]}
                                strokeWidth={0}
                                className="transition-all duration-500 cursor-pointer focus:outline-none hover:opacity-80"
                            />
                        ))}
                        <Label
                            value={total.toLocaleString()}
                            position="center"
                            content={({ viewBox }) => {
                                const { cx, cy } = viewBox;
                                return (
                                    <g className="animate-fade-in">
                                        <text
                                            x={cx}
                                            y={cy - 4}
                                            textAnchor="middle"
                                            dominantBaseline="central"
                                            className="fill-slate-900 dark:fill-white font-black text-4xl tracking-tighter"
                                        >
                                            {total.toLocaleString()}
                                        </text>
                                        <text
                                            x={cx}
                                            y={cy + 22}
                                            textAnchor="middle"
                                            dominantBaseline="central"
                                            className="fill-slate-400 dark:fill-slate-500 font-black text-[10px] uppercase tracking-[0.4em]"
                                        >
                                            Volume
                                        </text>
                                    </g>
                                );
                            }}
                        />
                    </Pie>
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                    <Legend
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        iconType="circle"
                        iconSize={10}
                        formatter={(value, entry) => {
                            const item = data.find(d => d.name === value);
                            const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
                            return (
                                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-3 hover:text-slate-900 dark:hover:text-white transition-colors">
                                    {value} <span className="text-slate-300 dark:text-slate-600 ml-4 border-l-2 border-slate-200 dark:border-slate-800 pl-4">{percentage}%</span>
                                </span>
                            );
                        }}
                        wrapperStyle={{
                            paddingLeft: '30px'
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default StatusChart;
