export default function ClassTabs({ value='B', onChange }) {
    const items = [
        { id:'A', label:'Класс А', disabled:true },
        { id:'B', label:'Класс Б', disabled:false },
        { id:'V', label:'Класс В', disabled:true },
    ]
    return (
        <div className="list-vertical">
            {items.map(it => (
                <div
                    key={it.id}
                    className={`item ${value===it.id ? 'active' : ''}`}
                    onClick={() => !it.disabled && onChange?.(it.id)}
                    style={it.disabled ? {opacity:.6, cursor:'not-allowed'} : {}}
                >
                    {it.label}
                </div>
            ))}
        </div>
    )
}
