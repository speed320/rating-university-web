import React from 'react';

export default function GroupTabs({ value, onChange, onDoubleClick, names }) {
    const labels = {
        1: names?.[1] || names?.['1'] || 'Группа 1',
        2: names?.[2] || names?.['2'] || 'Группа 2',
        3: names?.[3] || names?.['3'] || 'Группа 3',
        4: names?.[4] || names?.['4'] || 'Группа 4',
    };

    const groups = [
        { id: 1, label: labels[1] },
        { id: 2, label: labels[2] },
        { id: 3, label: labels[3] },
        { id: 4, label: labels[4] },
    ];

    return (
        <div className="tabs-vertical">
            {groups.map((g) => (
                <button
                    key={g.id}
                    type="button"
                    className={'tab-btn ' + (value === g.id ? 'tab-btn-active' : '')}
                    onClick={() => onChange && onChange(g.id)}
                    onDoubleClick={() => onDoubleClick && onDoubleClick(g.id)}
                    title={g.label}
                >
                    {g.label}
                </button>
            ))}
        </div>
    );
}
