import { useMemo, useState } from 'react'

export default function YearPicker({ years, value, onChange }) {
    const sorted = useMemo(
        () => Array.from(new Set([...(years||[]), value].filter(Boolean))).sort((a,b)=>a-b),
        [years, value]
    )
    const [custom, setCustom] = useState('')

    const addYear = () => {
        const y = parseInt(custom, 10)
        if (!Number.isFinite(y)) return
        onChange?.(y)
        setCustom('')
    }

    return (
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
            <select className="select" value={value} onChange={e=>onChange?.(parseInt(e.target.value,10))}>
                {sorted.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <input className="input" style={{width:110}} placeholder="Добавить год"
                   value={custom} onChange={e=>setCustom(e.target.value)} />
            <button className="btn" onClick={addYear}>+</button>
        </div>
    )
}
