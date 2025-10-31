import { useEffect, useState } from 'react'

// "1,23" -> 1.23 ; пустое -> 0
export function parseLocaleFloat(v) {
    if (v === null || v === undefined) return 0
    const s = String(v).trim().replace(',', '.')
    if (s === '' || s === '-' || s === '.' || s === '-.') return 0
    const f = Number.parseFloat(s)
    return Number.isFinite(f) ? f : 0
}

export default function NumericField({ label, value, onChange, placeholder }) {
    const [text, setText] = useState(value ?? '')

    useEffect(() => { setText(value ?? '') }, [value])

    const onInput = (v) => setText(v)
    const onBlur = () => {
        const n = parseLocaleFloat(text)
        setText(String(n))
        onChange?.(n)
    }

    return (
        <div>
            <div style={{ fontSize: 14, marginBottom: 6 }}>{label}</div>
            <input
                className="input"
                value={text}
                onChange={e => onInput(e.target.value)}
                onBlur={onBlur}
                inputMode="decimal"
                placeholder={placeholder || ''}
            />
        </div>
    )
}
