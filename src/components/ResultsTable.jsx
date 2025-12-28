// src/components/ResultsTable.jsx
import React, { useState } from 'react';

/**
 * rows: массив BCalcDto:
 *   { calcResultId, year, iteration, b11, b12, b13, b21, sumB, codeB11, codeB12, codeB13, codeB21 }
 *
 * metricNames: { codeB11, codeB12, codeB13, codeB21 }
 * onMetricNamesChange(patch): patch = { codeB11?: string, ... }
 *
 * visibleYears: { [year]: boolean }
 * onToggleYear(year): переключить чекбокс
 */
export default function ResultsTable({
                                         rows,
                                         metricNames,
                                         onMetricNamesChange,
                                         visibleYears,
                                         onToggleYear,
                                     }) {
    const [editingKey, setEditingKey] = useState(null);
    const [editValue, setEditValue] = useState('');

    const startEdit = (key, current) => {
        setEditingKey(key);
        setEditValue(current);
    };

    const cancelEdit = () => {
        setEditingKey(null);
        setEditValue('');
    };

    const commitEdit = () => {
        if (!editingKey) return;

        const patch = { [editingKey]: editValue || editingKey.toUpperCase() };
        console.log('commitEdit, patch = ', patch);

        // 👉 только говорим родителю, что поменялось
        onMetricNamesChange(patch);

        setEditingKey(null);
        setEditValue('');
    };



    return (
        <div className="results-table-wrapper">
            <table className="results-table">
                <thead>
                <tr>
                    <th>Год</th>
                    <th>{metricNames.codeB11 || 'B11'}</th>
                    <th>{metricNames.codeB12 || 'B12'}</th>
                    <th>{metricNames.codeB13 || 'B13'}</th>
                    <th>{metricNames.codeB21 || 'B21'}</th>
                    <th>Total B</th>
                    <th>Показать</th>
                </tr>
                </thead>
                <tbody>
                {rows.map((r) => (
                    <tr key={`${r.year}-${r.iteration}`}>
                        <td>{r.year}</td>
                        <td>{r.b11.toFixed(2)}</td>
                        <td>{r.b12.toFixed(2)}</td>
                        <td>{r.b13.toFixed(2)}</td>
                        <td>{r.b21.toFixed(2)}</td>
                        <td>{r.sumB.toFixed(2)}</td>
                        <td style={{ textAlign: 'center' }}>
                            <input
                                type="checkbox"
                                checked={!!visibleYears[r.year]}
                                onChange={() => onToggleYear(r.year)}
                            />
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
