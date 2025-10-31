import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, Tooltip, ResponsiveContainer } from 'recharts'

// dataYears: [{year, B11,B12,B13,B21}, ...]
// colors: функция (index)=>цвет
export default function RadarBlock({ dataYears }) {
    const metrics = ['B11','B12','B13','B21']
    const base = metrics.map(m => ({ metric: m }))

    const datasets = (dataYears||[]).map((y) => ({
        year: y.year,
        data: metrics.map(m => ({ metric: m, value: +y[m] || 0 }))
    }))

    return (
        <div className="card">
            <h3 style={{marginTop:0}}>Паучья диаграмма (B11, B12, B13, B21)</h3>
            <div style={{height:360}}>
                <ResponsiveContainer>
                    <RadarChart outerRadius="75%" data={base}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="metric" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        <Tooltip formatter={(v)=>v.toFixed ? v.toFixed(2) : v}/>
                        <Legend />
                        {datasets.map((ds, idx) => (
                            <Radar
                                key={ds.year}
                                name={String(ds.year)}
                                dataKey="value"
                                data={ds.data}
                                strokeOpacity={0.8}
                                fillOpacity={0.25}
                                stroke={undefined} fill={undefined} /* пусть Recharts назначит цвета */
                            />
                        ))}
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
