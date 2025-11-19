import React, { useState } from 'react';
import { Api } from '../api';

/**
 * rows: массив BCalcDto:
 *   { year, iteration, b11, b12, b13, b21, sumB, codeB11, codeB12, codeB13, codeB21, calcResultId }
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
        onMetricNamesChange(patch); // только сообщаем

        setEditingKey(null);
        setEditValue('');
    };

    const renderHeaderCell = (key, label) => (
        <th>
            {editingKey === key ? (
                <input
                    className="metric-edit-input"
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') commitEdit();
                        if (e.key === 'Escape') cancelEdit();
                    }}
                />
            ) : (
                <button
                    type="button"
                    className="metric-header-btn"
                    onClick={() => startEdit(key, label)}
                    title="Изменить название метрики"
                >
                    {label}
                </button>
            )}
        </th>
    );

    return (
        <div className="results-table-wrapper">
            <table className="results-table">
                <thead>
                <tr>
                    <th>Год</th>
                    {renderHeaderCell('codeB11', metricNames.codeB11 || 'B11')}
                    {renderHeaderCell('codeB12', metricNames.codeB12 || 'B12')}
                    {renderHeaderCell('codeB13', metricNames.codeB13 || 'B13')}
                    {renderHeaderCell('codeB21', metricNames.codeB21 || 'B21')}
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
