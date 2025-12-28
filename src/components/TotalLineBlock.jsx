import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function TotalLineBlock({ rows }) {
    if (!rows || !rows.length) return <div>Нет данных для графика</div>;

    const data = rows.map((r) => ({
        year: r.year,
        total: r.sumB,
    }));

    return (
        <div className="card line-wrapper">
            <h3>Диаграмма по годам</h3>
            <LineChart width={700} height={300} data={data} margin={{ top: 20, right: 40, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#82ca9d" dot />
            </LineChart>
        </div>
    );
}
