import React from 'react';
import {
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Legend,
    Tooltip,
} from 'recharts';

/**
 * rows: активные строки (учитывая чекбоксы)
 * metricNames: { codeB11, codeB12, codeB13, codeB21 }
 */
export default function RadarBlock({ rows, metricNames }) {
    if (!rows || !rows.length) {
        return (
            <div className="card radar-card">
                <h3>Паучья диаграмма</h3>
                <p>Нет данных для диаграммы</p>
            </div>
        );
    }

    const metrics = [
        { key: 'b11', label: metricNames.codeB11 || 'B11' },
        { key: 'b12', label: metricNames.codeB12 || 'B12' },
        { key: 'b13', label: metricNames.codeB13 || 'B13' },
        { key: 'b21', label: metricNames.codeB21 || 'B21' },
    ];

    // данные вида:
    // [{ metric: 'B11', y_2024: ..., y_2025: ... }, ...]
    const data = metrics.map((m) => {
        const row = { metric: m.label };
        rows.forEach((r) => {
            row[`y_${r.year}`] = r[m.key];
        });
        return row;
    });

    const COLORS = ['#2563EB', '#22C55E', '#F97316', '#E11D48', '#0EA5E9', '#A855F7'];

    return (
        <div className="card radar-card">
            <h3>Паучья диаграмма</h3>
            <RadarChart
                width={400}
                height={300}
                data={data}
                outerRadius="70%"
            >
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis />
                <Tooltip />
                <Legend />
                {rows.map((r, idx) => (
                    <Radar
                        key={r.year}
                        name={String(r.year)}
                        dataKey={`y_${r.year}`}
                        stroke={COLORS[idx % COLORS.length]}
                        fill={COLORS[idx % COLORS.length]}
                        fillOpacity={0.3}
                    />
                ))}
            </RadarChart>
        </div>
    );
}
