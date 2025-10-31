export default function ResultsTable({ items }) {
    return (
        <div className="card">
            <h3 style={{marginTop:0}}>Таблица рассчитанных значений</h3>
            <div style={{overflowX:'auto'}}>
                <table className="table">
                    <thead>
                    <tr>
                        <th>Год</th>
                        <th>B11</th>
                        <th>B12</th>
                        <th>B13</th>
                        <th>B21</th>
                        <th>Total B</th>
                    </tr>
                    </thead>
                    <tbody>
                    {items?.length ? items.map((r,i)=>(
                        <tr key={i}>
                            <td>{r.year}</td>
                            <td>{(+r.B11).toFixed(2)}</td>
                            <td>{(+r.B12).toFixed(2)}</td>
                            <td>{(+r.B13).toFixed(2)}</td>
                            <td>{(+r.B21).toFixed(2)}</td>
                            <td><strong>{(+r.totalB).toFixed(2)}</strong></td>
                        </tr>
                    )) : (
                        <tr><td colSpan="7" style={{textAlign:'center',opacity:.7,padding:16}}>Нет данных</td></tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
