import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function TotalLineBlock({ series }) {
    const data = (series||[]).map(it => ({ year: it.year, total: +it.totalB || 0 }))
    return (
        <div className="card">
            <h3 style={{marginTop:0}}>Динамика оценки по годам</h3>
            <div style={{height:320}}>
                <ResponsiveContainer>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis domain={[0, 'auto']} />
                        <Tooltip formatter={(v)=>v.toFixed ? v.toFixed(2) : v}/>
                        <Line type="monotone" dataKey="total" dot />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
