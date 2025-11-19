import React from 'react';

export default function GroupTabs({ value, onChange }) {
    const groups = [
        { id: 1, label: 'Группа 1' },
        { id: 2, label: 'Группа 2' },
        { id: 3, label: 'Группа 3' },
        { id: 4, label: 'Группа 4' },
    ];

    return (
        <div className="tabs-vertical">
            {groups.map((g) => (
                <button
                    key={g.id}
                    type="button"
                    className={
                        'tab-btn ' + (value === g.id ? 'tab-btn-active' : '')
                    }
                    onClick={() => onChange && onChange(g.id)}
                >
                    {g.label}
                </button>
            ))}
        </div>
    );
}
