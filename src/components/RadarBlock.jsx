import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, Tooltip, ResponsiveContainer } from 'recharts'

const PALETTE = [
    '#2563eb', '#10b981', '#f59e0b', '#ef4444',
    '#8b5cf6', '#14b8a6', '#f97316', '#22c55e'
]

export default function RadarBlock({ dataYears }) {
    // dataYears: [{year, B11,B12,B13,B21}, ...]
    const metrics = ['B11','B12','B13','B21']

    // строим общую таблицу для всех лет сразу
    const years = (dataYears || [])
        .map(x => x.year)
        .filter((v, i, a) => a.indexOf(v) === i)
        .sort((a,b)=>a-b)

    const base = metrics.map(m => {
        const row = { metric: m }
        for (const y of years) {
            const rec = (dataYears || []).find(r => r.year === y)
            row[String(y)] = rec ? (+rec[m] || 0) : 0
        }
        return row
    })

    return (
        <div className="card">
            <h3 style={{marginTop:0}}>Паучья диаграмма (B11, B12, B13, B21)</h3>
            <div style={{height:360}}>
                <ResponsiveContainer>
                    <RadarChart outerRadius="75%" data={base}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="metric" />
                        <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
                        <Tooltip formatter={(v)=> (typeof v === 'number' ? v.toFixed(2) : v)} />
                        <Legend />
                        {years.map((y, idx) => (
                            <Radar
                                key={y}
                                name={String(y)}
                                dataKey={String(y)}
                                stroke={PALETTE[idx % PALETTE.length]}
                                fill={PALETTE[idx % PALETTE.length]}
                                strokeOpacity={0.9}
                                fillOpacity={0.25}
                            />
                        ))}
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
