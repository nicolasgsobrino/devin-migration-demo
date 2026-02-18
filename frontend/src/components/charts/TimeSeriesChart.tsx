import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { TimeSeriesPoint } from '../../types/api';

interface TimeSeriesChartProps {
  data: TimeSeriesPoint[];
  color?: string;
  label?: string;
  height?: number;
  formatValue?: (v: number) => string;
}

function formatTimestamp(ts: string, isDaily: boolean): string {
  const d = new Date(ts);
  if (isDaily) {
    return `${d.getMonth() + 1}/${d.getDate()}`;
  }
  return `${d.getHours().toString().padStart(2, '0')}:00`;
}

export function TimeSeriesChart({ data, color = '#3b82f6', label = 'Value', height = 250, formatValue }: TimeSeriesChartProps) {
  const isDaily = data.length > 24;
  const chartData = data.map((p) => ({
    time: formatTimestamp(p.timestamp, isDaily),
    value: p.value,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(42,48,80,0.5)" />
        <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#2a3050' }} />
        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#2a3050' }} tickFormatter={formatValue} />
        <Tooltip
          contentStyle={{ background: '#1a1f35', border: '1px solid #2a3050', borderRadius: 8, color: '#e2e8f0', fontSize: 12 }}
          labelStyle={{ color: '#94a3b8' }}
          formatter={(value: number) => [formatValue ? formatValue(value) : value.toFixed(2), label]}
        />
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} activeDot={{ r: 4, fill: color }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
