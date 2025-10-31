import React, { useEffect, useMemo, useState } from 'react'
import { Api } from '../api.js'
import ResultsTable from '../components/ResultsTable.jsx'
import RadarBlock from '../components/RadarBlock.jsx'
import TotalLineBlock from '../components/TotalLineBlock.jsx'

export default function AnalyticsPage() {
    const [items, setItems] = useState([])
    const [year, setYear] = useState('')

    const load = async (y) => {
        const data = y ? await Api.getCalcByYear(parseInt(y,10)) : await Api.getCalcAll()
        // /api/b/calc/{year} у тебя, вероятно, возвращает один элемент; превратим в массив
        setItems(Array.isArray(data) ? data : (data ? [data] : []))
    }

    useEffect(() => { load() }, [])

    const allYears = useMemo(() =>
            Array.from(new Set(items.map(i => i.year))).sort((a,b)=>a-b)
        , [items])

    const filtered = useMemo(() => {
        if (!year) return items
        return items.filter(i => String(i.year) === String(year))
    }, [items, year])

    // для радара хотим отрисовать сразу все годы (или выбранный)
    const radarData = useMemo(() => {
        const src = year ? items.filter(i => String(i.year)===String(year)) : items
        // если пришло несколько итераций — оставим последнюю для каждого года
        const byYear = new Map()
        for (const it of src) {
            const prev = byYear.get(it.year)
            if (!prev || (it.iteration > prev.iteration)) byYear.set(it.year, it)
        }
        return Array.from(byYear.values()).sort((a,b)=>a.year-b.year)
    }, [items, year])

    // для линии берём по одному значению total на год (последняя итерация)
    const totalSeries = radarData.map(r => ({ year: r.year, totalB: r.totalB }))

    return (
        <div className="grid" style={{gap:16}}>
            <div className="card">
                <div className="toolbar">
                    <h3 style={{margin:0}}>Аналитика и визуализация</h3>
                    <span className="spacer"></span>
                    <select className="input small" value={year} onChange={e=>setYear(e.target.value)}>
                        <option value="">Все годы</option>
                        {allYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <button className="btn" onClick={()=>load(year)}>Обновить</button>
                </div>
            </div>

            <ResultsTable items={filtered} />

            <div className="grid equal">
                <RadarBlock dataYears={radarData} />
                <TotalLineBlock series={totalSeries} />
            </div>
        </div>
    )
}
