import React from 'react';

export default function ClassTabs({ value, onChange, onDoubleClick, names }) {
    const labels = {
        A: names?.A || 'Класс А',
        B: names?.B || 'Класс Б',
        V: names?.V || 'Класс В',
    };

    const tabs = [
        { id: 'A', label: labels.A },
        { id: 'B', label: labels.B },
        { id: 'V', label: labels.V },
    ];

    return (
        <div className="tabs-vertical">
            {tabs.map((t) => (
                <button
                    key={t.id}
                    type="button"
                    className={'tab-btn ' + (value === t.id ? 'tab-btn-active' : '')}
                    onClick={() => onChange && onChange(t.id)}
                    onDoubleClick={() => onDoubleClick && onDoubleClick(t.id)}
                    title={t.label}
                >
                    {t.label}
                </button>
            ))}
        </div>
    );
}
