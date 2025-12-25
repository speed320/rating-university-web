import React, { useEffect, useRef, useState } from 'react';
import { Api } from '../api';
import {useNavigate} from "react-router-dom";
import YearPicker from '../components/YearPicker.jsx';
import ClassTabs from '../components/ClassTabs.jsx';
import GroupTabs from '../components/GroupTabs.jsx';
import NumericField from '../components/NumericField.jsx';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const YEAR_NOW = new Date().getFullYear();
const STORAGE_KEY = 'unirating_b_params_v2';

const DEFAULT_B_PARAMS = {
    ENa: '',
    ENb: '',
    ENc: '',
    Eb: '',
    Ec: '',
    beta121: '',
    beta122: '',
    beta131: '',
    beta132: '',
    beta211: '',
    beta212: '',
};

const DEFAULT_NAMES = {
    codeClassA: 'Класс A',
    codeClassB: 'Класс B',
    codeClassC: 'Класс C',
    codeB11: 'Группа 1',
    codeB12: 'Группа 2',
    codeB13: 'Группа 3',
    codeB21: 'Группа 4',
}

function normalizeNumber(v) {
    if (v === '' || v == null) return null;
    const n = Number(String(v).replace(',', '.'));
    return Number.isNaN(n) ? null : n;
}

function buildExportPayload(years, paramsB, names) {
    const bData = years
        .map((year) => {
            const p = paramsB[year] || DEFAULT_B_PARAMS;
            return {
                year,
                ENa: normalizeNumber(p.ENa),
                ENb: normalizeNumber(p.ENb),
                ENc: normalizeNumber(p.ENc),
                Eb: normalizeNumber(p.Eb),
                Ec: normalizeNumber(p.Ec),
                beta121: normalizeNumber(p.beta121),
                beta122: normalizeNumber(p.beta122),
                beta131: normalizeNumber(p.beta131),
                beta132: normalizeNumber(p.beta132),
                beta211: normalizeNumber(p.beta211),
                beta212: normalizeNumber(p.beta212),
            };
        })
        .filter((row) => row.year);

    return {
        classes: [
            {
                classType: 'B',
                data: bData,
                names: {
                    codeClassA: names.code.codeClassA || '',
                    codeClassB: names.code.codeClassB || '',
                    codeClassC: names.code.codeClassC || '',
                    codeB11: names.code.codeB11 || '',
                    codeB12: names.code.codeB12 || '',
                    codeB13: names.code.codeB13 || '',
                    codeB21: names.code.codeB21 || '',
                }
            },
        ],
    };
}

export default function InputPage() {
    const [currentYear, setCurrentYear] = useState(YEAR_NOW);
    const [years, setYears] = useState([YEAR_NOW]);
    const [classType, setClassType] = useState('B');
    const [group, setGroup] = useState(1);
    const [paramsB, setParamsB] = useState({ [YEAR_NOW]: { ...DEFAULT_B_PARAMS } });
    const [names, setNames] = useState({ ...DEFAULT_NAMES });
    const [busy, setBusy] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [namesEditorOpen, setNamesEditorOpen] = useState(false);
    const fileRef = useRef(null);
    const navigate = useNavigate();

    // ---------------- 1. Загрузка на старте ----------------
    useEffect(() => {
        let hydratedFromStorage = false;

        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const saved = JSON.parse(raw);
                if (
                    saved &&
                    Array.isArray(saved.years) &&
                    saved.years.length > 0 &&
                    typeof saved.currentYear === 'number' &&
                    typeof saved.paramsB === 'object'
                ) {
                    setYears(saved.years);
                    setCurrentYear(saved.currentYear);
                    setParamsB(saved.paramsB);
                    if (saved.names && typeof saved.names === 'object') {
                        setNames({...DEFAULT_NAMES, ...saved.names});
                    }
                    hydratedFromStorage = true;
                }
            }
        } catch (e) {
            console.warn('Ошибка чтения состояния из localStorage', e);
        }

        if (hydratedFromStorage) return;

        Api.getLastParamsB()
            .then((block) => {
                if (!block || !block.data || !block.data.length) return;
                const map = {};
                const ys = [];
                for (const row of block.data) {
                    ys.push(row.year);
                    map[row.year] = {
                        ENa: row.ENa ?? '',
                        ENb: row.ENb ?? '',
                        ENc: row.ENc ?? '',
                        Eb: row.Eb ?? '',
                        Ec: row.Ec ?? '',
                        beta121: row.beta121 ?? '',
                        beta122: row.beta122 ?? '',
                        beta131: row.beta131 ?? '',
                        beta132: row.beta132 ?? '',
                        beta211: row.beta211 ?? '',
                        beta212: row.beta212 ?? '',
                    };
                }
                const uniqueYears = [...new Set(ys)].sort((a, b) => a - b);
                setYears(uniqueYears);
                setCurrentYear(uniqueYears[0]);
                setParamsB(map);
            })
            .catch(() => {});
    }, []);

    // ---------------- 2. Автосохранение ----------------
    useEffect(() => {
        const payload = { years, currentYear, paramsB, names };
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        } catch (e) {
            console.warn('Ошибка сохранения в localStorage', e);
        }
    }, [years, currentYear, paramsB, names]);

    const ensureYear = (year) => {
        setYears((ys) => (ys.includes(year) ? ys : [...ys, year].sort((a, b) => a - b)));
        setParamsB((state) => ({
            ...state,
            [year]: state[year] || { ...DEFAULT_B_PARAMS },
        }));
    };

    const handleYearChange = (year) => {
        ensureYear(year);
        setCurrentYear(year);
    };

    const handleParamChange = (key, value) => {
        setParamsB((state) => ({
            ...state,
            [currentYear]: {
                ...(state[currentYear] || { ...DEFAULT_B_PARAMS }),
                [key]: value,
            },
        }));
    };

    // ---------------- 3. Очистить всё ----------------
    const clearAll = async () => {
        if (busy) return;
        setBusy(true);
        try {
            setParamsB({ [YEAR_NOW]: { ...DEFAULT_B_PARAMS } });
            setYears([YEAR_NOW]);
            setCurrentYear(YEAR_NOW);
            setNames({ ...DEFAULT_NAMES });
            localStorage.removeItem(STORAGE_KEY);
            await Api.clearCurrent();
        } catch (e) {
            alert('Ошибка очистки: ' + (e?.message || e));
        } finally {
            setBusy(false);
            setMenuOpen(false);
        }
    };

    // Удалить только текущий год
    const handleDeleteCurrentYear = () => {
        setParamsB((prev) => {
            const copy = { ...prev };
            delete copy[currentYear];
            if (!Object.keys(copy).length) {
                copy[YEAR_NOW] = { ...DEFAULT_B_PARAMS };
            }
            return copy;
        });

        setYears((prevYears) => {
            const filtered = prevYears.filter((y) => y !== currentYear);
            const finalYears = filtered.length ? filtered.sort((a, b) => a - b) : [YEAR_NOW];
            setCurrentYear(finalYears[0]);
            return finalYears;
        });

        setMenuOpen(false);
    };

    // ---------------- 4. Экспорт / импорт ----------------
    const handleExport = () => {
        try {
            const payload = buildExportPayload(years, paramsB, names);

            const blob = new Blob([JSON.stringify(payload, null, 2)], {
                type: 'application/json;charset=utf-8',
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');

            a.href = url;
            a.download = `rating-params-${stamp}.json`;

            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (e) {
            alert('Ошибка экспорта: ' + (e?.message || e));
        } finally {
            setMenuOpen(false);
        }
    };

    const handleImportClick = () => {
        if (busy) return;
        fileRef.current?.click();
        setMenuOpen(false);
    };

    const handleFileSelected = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const text = await file.text();
            const json = JSON.parse(text);
            if (!json || !Array.isArray(json.classes)) throw new Error('Неверный формат JSON');

            const bBlock = json.classes.find((c) => c.classType === 'B');
            if (!bBlock || !Array.isArray(bBlock.data)) throw new Error('Нет данных класса B');

            const map = {};
            const ys = [];
            for (const row of bBlock.data) {
                if (!row.year) continue;
                ys.push(row.year);
                map[row.year] = {
                    ENa: row.ENa ?? '',
                    ENb: row.ENb ?? '',
                    ENc: row.ENc ?? '',
                    Eb: row.Eb ?? '',
                    Ec: row.Ec ?? '',
                    beta121: row.beta121 ?? '',
                    beta122: row.beta122 ?? '',
                    beta131: row.beta131 ?? '',
                    beta132: row.beta132 ?? '',
                    beta211: row.beta211 ?? '',
                    beta212: row.beta212 ?? '',
                };
            }
            const uniqueYears = [...new Set(ys)].sort((a, b) => a - b);
            if (!uniqueYears.length) throw new Error('Пустые данные');

            setParamsB(map);
            setYears(uniqueYears);
            setCurrentYear(uniqueYears[0]);

            if(bBlock.names && typeof bBlock.names === 'object'){
                setNames({...DEFAULT_NAMES, ...bBlock.names});
            }

            const payload = {
                years: uniqueYears,
                currentYear: uniqueYears[0],
                paramsB: map,
                names: bBlock.names || names,
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

            alert('Импорт выполнен');
        } catch (err) {
            alert('Ошибка импорта: ' + err.message);
        } finally {
            e.target.value = '';
        }
    };

    const handleAddYear = (year) => {
        setYears((prev) =>
            prev.includes(year) ? prev.slice().sort((a, b) => a - b) : [...prev, year].sort((a, b) => a - b),
        );
        setCurrentYear(year);
        setParamsB((state) => ({
            ...state,
            [year]: state[year] || { ...DEFAULT_B_PARAMS },
        }));
    };

    // ---------------- 5. Редактор названий ----------------
    const openNamesEditor = () => {
        setNamesEditorOpen(true);
        setMenuOpen(false)
    };
    const closeNamesEditor = () => setNamesEditorOpen(false)

    const renameActiveClassByDblClick = () => {
        const key = classType === 'A' ? 'codeClassA' :
            classType === 'B' ? 'codeClassB' : 'codeClassV';
        const next = window.prompt('Новое название класса', names[key]);
        if (next != null) {
            setNames((n) => ({ ...n, [key]: next }));
        }
    };

    const renameActiveGroupByDblClick = () => {
        const map = { 1: 'codeB11', 2: 'codeB12', 3: 'codeB13', 4: 'codeB21' };
        const key = map[group];
        const next = window.prompt('Новое название группы', names[key]);
        if (next != null) {
            setNames((n) => ({ ...n, [key]: next }));
        }
    };


    // ---------------- 6. Расчёт ----------------
    const handleCompute = async () => {
        setBusy(true);
        try {
            const delay = 1500;
            const payload = buildExportPayload(years, paramsB, names);
            await Api.calcMulti(payload);
            toast.success('Расчёт выполнен',
                {autoClose: delay,
                        onClose: () => {
                            navigate('/analytics'); // редирект после закрытия тоста
                        }
                });
        } catch (err) {
            alert('Ошибка расчёта: ' + err.message);
        } finally {
            setBusy(false);
        }
    };

    const params = paramsB[currentYear] || DEFAULT_B_PARAMS;

    const fieldsByGroup = {
        1: [
            ['ENa', 'ENa'],
            ['ENb', 'ENb'],
            ['ENc', 'ENc'],
            ['Eb', 'Eb'],
            ['Ec', 'Ec'],
        ],
        2: [
            ['beta121', 'β121'],
            ['beta122', 'β122'],
        ],
        3: [
            ['beta131', 'β131'],
            ['beta132', 'β132'],
        ],
        4: [
            ['beta211', 'β211'],
            ['beta212', 'β212'],
        ],
    };

    return (
        <div className="card big-card">
            <div className="card-header-row">
                <div className="left-header">
                    <YearPicker
                        years={years}
                        currentYear={currentYear}
                        onYearChange={handleYearChange}
                        onAddYear={handleAddYear}
                    />
                </div>
                <div className="right-header">
                    <div className="menu-wrapper">
                        <div className="menu-dropdown">
                            <button
                                className="icon-btn menu-btn"
                                type="button"
                                disabled={busy}
                                onClick={() => setMenuOpen((v) => !v)}
                            >
                                ⋯
                            </button>
                            {menuOpen && (
                                <div className="menu-dropdown-list">
                                    <button type="button" onClick={handleImportClick}>
                                        Импорт JSON
                                    </button>
                                    <button type="button" onClick={handleExport}>
                                        Экспорт JSON
                                    </button>
                                    <button type="button" onClick={handleDeleteCurrentYear}>
                                        Удалить текущий год
                                    </button>
                                    <button type="button" onClick={clearAll}>
                                        Очистить всё
                                    </button>
                                </div>
                            )}
                        </div>

                        <input
                            ref={fileRef}
                            type="file"
                            accept="application/json"
                            style={{ display: 'none' }}
                            onChange={handleFileSelected}
                        />
                    </div>
                </div>
            </div>

            <div className="card-body input-grid">
                <div className="left-col">
                    <h2>Выбор класса</h2>
                    <div className="tabs-with-edit">
                        <ClassTabs
                            value={classType}
                            onChange={setClassType}
                            onDoubleClick={renameActiveClassByDblClick}
                            // при желании можно пробросить названия во внутренний рендер табов:
                            names={{
                                A: names.codeClassA,
                                B: names.codeClassB,
                                V: names.codeClassV,
                            }}
                        />
                        <button
                            type="button"
                            className="icon-btn edit-mini-btn"
                            aria-label="Редактировать название класса"
                            onClick={openNamesEditor}
                            title="Изменить названия"
                            style={{ marginLeft: 8 }}
                        >
                            ✎
                        </button>
                    </div>

                    <h2 style={{ marginTop: 24 }}>Выбор группы</h2>

                    <div className="tabs-with-edit">
                        <GroupTabs
                            value={group}
                            onChange={setGroup}
                            onDoubleClick={renameActiveGroupByDblClick}
                            names={{
                                1: names.codeB11,
                                2: names.codeB12,
                                3: names.codeB13,
                                4: names.codeB21,
                            }}
                        />
                        <button
                            type="button"
                            className="icon-btn edit-mini-btn"
                            aria-label="Редактировать название группы"
                            onClick={openNamesEditor}
                            title="Изменить названия"
                            style={{ marginLeft: 8 }}
                        >
                            ✎
                        </button>
                    </div>
                </div>

                <div className="right-col">
                    <h2>Параметры</h2>
                    <div className="params-grid">
                        {fieldsByGroup[group].map(([key, label]) => (
                            <NumericField
                                key={key}
                                label={label}
                                value={params[key]}
                                onChange={(v) => handleParamChange(key, v)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="card-footer">
                <button
                    className="primary-btn big-btn spinner-btn"
                    disabled={busy}
                    onClick={handleCompute}
                >
                    {busy?(
                        <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            <span>Считаем =)</span>
                        </>
                    ):('Рассчитать')}

                </button>
            </div>
            <ToastContainer position="bottom-right" />

            {namesEditorOpen && (
                <div className="modal-backdrop" onClick={closeNamesEditor}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Изменение названий</h3>
                        <div className="form-grid">
                            <label>codeClassA</label>
                            <input
                                type="text"
                                value={names.codeClassA}
                                onChange={(e) => setNames((n) => ({ ...n, codeClassA: e.target.value }))}
                            />
                            <label>codeClassB</label>
                            <input
                                type="text"
                                value={names.codeClassB}
                                onChange={(e) => setNames((n) => ({ ...n, codeClassB: e.target.value }))}
                            />
                            <label>codeClassV</label>
                            <input
                                type="text"
                                value={names.codeClassV}
                                onChange={(e) => setNames((n) => ({ ...n, codeClassV: e.target.value }))}
                            />
                            <label>codeB11</label>
                            <input
                                type="text"
                                value={names.codeB11}
                                onChange={(e) => setNames((n) => ({ ...n, codeB11: e.target.value }))}
                            />
                            <label>codeB12</label>
                            <input
                                type="text"
                                value={names.codeB12}
                                onChange={(e) => setNames((n) => ({ ...n, codeB12: e.target.value }))}
                            />
                            <label>codeB13</label>
                            <input
                                type="text"
                                value={names.codeB13}
                                onChange={(e) => setNames((n) => ({ ...n, codeB13: e.target.value }))}
                            />
                            <label>codeB21</label>
                            <input
                                type="text"
                                value={names.codeB21}
                                onChange={(e) => setNames((n) => ({ ...n, codeB21: e.target.value }))}
                            />
                        </div>
                        <div className="modal-actions">
                            <button type="button" onClick={closeNamesEditor}>Закрыть</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
