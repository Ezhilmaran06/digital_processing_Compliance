import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const StatusChart = ({ data }) => {
    const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];
    const total = data.reduce((acc, curr) => acc + curr.value, 0);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="glass-card p-3 rounded-xl shadow-premium outline-none border-none">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{payload[0].name}</p>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">{payload[0].value} Requests</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
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
                                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 ml-2">
                                    {value} <span className="text-gray-400 dark:text-gray-500 ml-4">{percentage}%</span>
                                </span>
                            );
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>

            {/* Center Text */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none" style={{ left: '50%', transform: 'translate(-50%, -50%)', width: '100px' }}>
                <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{total.toLocaleString()}</p>
                <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mt-1">Total</p>
            </div>
        </div>
    );
};

export default StatusChart;
