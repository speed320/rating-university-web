import React from 'react';

export default function NumericField({ label, value, onChange }) {
    const handle = (e) => {
        const v = e.target.value.replace(',', '.');
        if (v === '') onChange('');
        else if (!Number.isNaN(Number(v))) onChange(v);
    };

    return (
        <div className="num-field">
            <div className="num-label">{label}</div>
            <input className="num-input" value={value ?? ''} onChange={handle} />
        </div>
    );
}
