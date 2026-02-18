import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RegionBarChartProps {
  data: { name: string; value: number }[];
  color?: string;
  label?: string;
  height?: number;
  formatValue?: (v: number) => string;
}

export function RegionBarChart({ data, color = '#3b82f6', label = 'Value', height = 250, formatValue }: RegionBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(42,48,80,0.5)" />
        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#2a3050' }} />
        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#2a3050' }} tickFormatter={formatValue} />
        <Tooltip
          contentStyle={{ background: '#1a1f35', border: '1px solid #2a3050', borderRadius: 8, color: '#e2e8f0', fontSize: 12 }}
          labelStyle={{ color: '#94a3b8' }}
          formatter={(value: number) => [formatValue ? formatValue(value) : value.toLocaleString(), label]}
        />
        <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
