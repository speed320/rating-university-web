export default function NumberRow({ label, value, onChange, placeholder }) {
    const set = (v) => {
        const f = parseFloat(v)
        onChange(Number.isFinite(f) ? f : 0)
    }
    return (
        <div>
            <div style={{fontSize:12, opacity:.7, marginBottom:6}}>{label}</div>
            <input className="input" value={value ?? ''} onChange={e=>set(e.target.value)} placeholder={placeholder||''}/>
        </div>
    )
}
