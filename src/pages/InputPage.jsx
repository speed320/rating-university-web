import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Api } from '../api.js'
import ClassTabs from '../components/ClassTabs.jsx'
import YearPicker from '../components/YearPicker.jsx'
import NumericField, { parseLocaleFloat } from '../components/NumericField.jsx'

const template = (year) => ({
    year,
    eNa: 0, eNb: 0, eNc: 0,
    eb: 0, ec: 0,
    beta121: 0, beta122: 0,
    beta131: 0, beta132: 0,
    beta211: 0, beta212: 0
})

const pick = (obj, ...keys) => {
    for (const k of keys) if (obj?.[k] !== undefined) return obj[k];
    return 0;
};
const normalize = (r) => {
    const y = Number.isFinite(+r?.year) ? +r.year : new Date().getFullYear();
    return {
        year: y,
        // поддерживаем eNa ИЛИ ENa (и так далее)
        eNa: +pick(r, 'eNa', 'ENa') || 0,
        eNb: +pick(r, 'eNb', 'ENb') || 0,
        eNc: +pick(r, 'eNc', 'ENc') || 0,
        eb:  +pick(r, 'eb',  'Eb')  || 0,
        ec:  +pick(r, 'ec',  'Ec')  || 0,

        beta121: +pick(r, 'beta121', 'B121','b121') || 0,
        beta122: +pick(r, 'beta122', 'B122','b122') || 0,
        beta131: +pick(r, 'beta131', 'B131','b131') || 0,
        beta132: +pick(r, 'beta132', 'B132','b132') || 0,
        beta211: +pick(r, 'beta211', 'B211','b211') || 0,
        beta212: +pick(r, 'beta212', 'B212','b212') || 0,
    };
};

export default function InputPage() {
    const [busy, setBusy] = useState(false)
    const [klass, setKlass] = useState('B')
    const [group, setGroup] = useState(1)

    const initialYear = new Date().getFullYear()
    const [year, setYear] = useState(initialYear)
    const [years, setYears] = useState([initialYear])

    // формы всех лет: {2024: {...}, 2025: {...}}
    const [forms, setForms] = useState(() => ({ [initialYear]: template(initialYear) }))

    const fileRef = useRef()

    // первичная загрузка всех параметров с бэка
    useEffect(() => {
        Api.getParamsAll()
            .then(list => {
                if (!Array.isArray(list) || list.length === 0) return
                const byYear = {}
                for (const it of list) {
                    byYear[it.year] = normalize(it)
                }
                setForms(prev => ({ ...prev, ...byYear }))
                setYears(Object.keys(byYear).map(Number).sort((a,b)=>a-b))
            })
            .catch(() => {})
    }, [])

    // если переключили год — гарантируем, что форма для него существует
    useEffect(() => {
        setForms(prev => {
            if (prev[year]) return prev
            return { ...prev, [year]: template(year) }
        })
        setYears(prev => Array.from(new Set([...prev, year])).sort((a,b)=>a-b))
    }, [year])

    const current = forms[year] || template(year)

    const setField = (key, valNum) => {
        setForms(prev => ({ ...prev, [year]: { ...(prev[year] || template(year)), [key]: valNum } }))
    }

    const fields = useMemo(() => {
        switch (group) {
            case 1: return [
                ['eNa','ENa'], ['eNb','ENb'], ['eNc','ENc'],
                ['eb','Eb'], ['ec','Ec'],
            ]
            case 2: return [['beta121','β121'], ['beta122','β122']]
            case 3: return [['beta131','β131'], ['beta132','β132']]
            case 4: return [['beta211','β211'], ['beta212','β212']]
            default: return []
        }
    }, [group])

    const onImportClick = () => fileRef.current?.click()

    const onFileSelected = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        try {
            const text = await file.text()
            const json = JSON.parse(text)
            if (!json || json.class !== 'B' || !Array.isArray(json.data)) {
                alert('Неверный JSON')
                return
            }
            setBusy(true)
            await Api.importParams(json)
            // перезагрузим все параметры
            const list = await Api.getParamsAll()
            const byYear = {}
            for (const it of (list || [])) byYear[it.year] = normalize(it)
            setForms(byYear)
            setYears(Object.keys(byYear).map(Number).sort((a,b)=>a-b))
            if (list?.length) setYear(list[list.length - 1].year)
            alert('Импорт выполнен')
        } catch (err) {
            alert('Ошибка импорта: ' + err.message)
        } finally {
            setBusy(false)
            e.target.value = ''
        }
    }

    const onExport = async () => {
        try {
            const res = await Api.exportParamsRaw()
            const blob = await res.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'b-params-export.json'
            document.body.appendChild(a)
            a.click()
            a.remove()
            URL.revokeObjectURL(url)
        } catch (err) {
            alert('Ошибка экспорта: ' + err.message)
        }
    }

    // подготовка полезной нагрузки: все годы из forms
    const payloadAllYears = () => {
        const data = Object.values(forms).map(f => ({
            year: f.year,
            eNa: parseLocaleFloat(f.eNa),
            eNb: parseLocaleFloat(f.eNb),
            eNc: parseLocaleFloat(f.eNc),
            eb:  parseLocaleFloat(f.eb),
            ec:  parseLocaleFloat(f.ec),
            beta121: parseLocaleFloat(f.beta121),
            beta122: parseLocaleFloat(f.beta122),
            beta131: parseLocaleFloat(f.beta131),
            beta132: parseLocaleFloat(f.beta132),
            beta211: parseLocaleFloat(f.beta211),
            beta212: parseLocaleFloat(f.beta212),
        }))
        return { class: 'B', data }
    }

    const computeAll = async () => {
        setBusy(true)
        try {
            await Api.importParams(payloadAllYears())
            await Api.computeAll()
            alert('Расчёт выполнен')
        } catch (err) {
            alert('Ошибка расчёта: ' + err.message)
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="grid two">
            {/* Левая колонка */}
            <div className="card">
                <div className="list-vertical" style={{gap:16}}>
                    <div>
                        <div className="text-muted" style={{marginBottom:6}}>Год</div>
                        <YearPicker years={years} value={year} onChange={setYear} />
                    </div>

                    <div>
                        <div className="text-muted" style={{marginBottom:6}}>Выбор класса</div>
                        <ClassTabs value={klass} onChange={setKlass} />
                    </div>

                    <div>
                        <div className="text-muted" style={{marginBottom:6}}>Выбор группы</div>
                        <div className="group-tabs">
                            {[1,2,3,4].map(id => (
                                <div key={id}
                                     className={`item ${group===id ? 'active' : ''}`}
                                     onClick={()=>setGroup(id)}>
                                    Группа {id}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="toolbar">
                        <button className="btn" onClick={onImportClick} disabled={busy}>Импорт JSON</button>
                        <button className="btn" onClick={onExport} disabled={busy}>Экспорт JSON</button>
                        <button className="btn primary" onClick={computeAll} disabled={busy}>Рассчитать</button>
                        <input ref={fileRef} type="file" accept="application/json" style={{display:'none'}} onChange={onFileSelected}/>
                    </div>
                </div>
            </div>

            {/* Правая колонка: поля текущей группы */}
            <div className="card">
                <h3 style={{marginTop:0}}>Параметры</h3>
                <div style={{display:'grid', gap:12, gridTemplateColumns:'repeat(2, minmax(160px, 1fr))'}}>
                    {fields.map(([k, label]) => (
                        <NumericField
                            key={k}
                            label={label}
                            value={current[k]}
                            onChange={(n)=>setField(k, n)}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
