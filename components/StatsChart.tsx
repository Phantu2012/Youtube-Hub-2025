
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ViewHistoryData } from '../types';

interface StatsChartProps {
    data: ViewHistoryData[];
}

export const StatsChart: React.FC<StatsChartProps> = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart
                data={data}
                margin={{
                    top: 5, right: 30, left: 20, bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                <XAxis 
                    dataKey="daysAgo" 
                    tickFormatter={(value) => `${value}d ago`} 
                    stroke="rgb(156 163 175)" // gray-400
                    fontSize={12}
                    reversed={true}
                />
                <YAxis 
                    stroke="rgb(156 163 175)" // gray-400
                    fontSize={12}
                    tickFormatter={(value) => typeof value === 'number' ? (value / 1000 >= 1 ? `${value / 1000}k` : `${value}`) : ''}
                />
                <Tooltip 
                    contentStyle={{
                        backgroundColor: '#1F2937', // gray-800
                        border: 'none',
                        borderRadius: '0.5rem',
                    }}
                    labelStyle={{ color: '#F9FAFB' }} // gray-50
                    formatter={(value: number) => [value.toLocaleString(), 'views']}
                    labelFormatter={(label) => `${label} days ago`}
                />
                <Legend formatter={() => <span className="text-light-text dark:text-dark-text">Views</span>} />
                <Line type="monotone" dataKey="views" name="Views" stroke="#FF0000" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
            </LineChart>
        </ResponsiveContainer>
    );
};
