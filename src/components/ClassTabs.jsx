import React from 'react';

export default function ClassTabs({ value, onChange }) {
    const tabs = [
        { id: 'A', label: 'Класс А' },
        { id: 'B', label: 'Класс Б' },
        { id: 'V', label: 'Класс В' },
    ];

    return (
        <div className="tabs-vertical">
            {tabs.map((t) => (
                <button
                    key={t.id}
                    type="button"
                    className={
                        'tab-btn ' + (value === t.id ? 'tab-btn-active' : '')
                    }
                    onClick={() => onChange && onChange(t.id)}
                >
                    {t.label}
                </button>
            ))}
        </div>
    );
}
