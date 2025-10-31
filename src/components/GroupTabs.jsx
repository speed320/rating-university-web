export default function GroupTabs({ value, onChange }) {
    const items = [
        { id: 1, title:'Группа 1', desc:'ENa, ENb, ENc, Eb, Ec' },
        { id: 2, title:'Группа 2', desc:'β121, β122' },
        { id: 3, title:'Группа 3', desc:'β131, β132' },
        { id: 4, title:'Группа 4', desc:'β211, β212' },
    ]
    return (
        <div className="group-tabs">
            {items.map(it =>
                <button
                    key={it.id}
                    className={value===it.id ? 'active' : ''}
                    onClick={()=>onChange(it.id)}
                    title={it.desc}
                >
                    {it.title}
                </button>
            )}
        </div>
    )
}
