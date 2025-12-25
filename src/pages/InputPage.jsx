import React, { useEffect, useRef, useState } from 'react';
import { Api } from '../api';
import { useNavigate } from "react-router-dom";
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
    codeClassB: 'Класс Б',
    codeClassV: 'Класс В',
    codeB11: 'Группа 1',
    codeB12: 'Группа 2',
    codeB13: 'Группа 3',
    codeB21: 'Группа 4',
};

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
                    codeClassA: names.codeClassA || 'Класс A',
                    codeClassB: names.codeClassB || 'Класс Б',
                    codeClassV: names.codeClassV || 'Класс В',
                    codeB11: names.codeB11 || 'Группа 1',
                    codeB12: names.codeB12 || 'Группа 2',
                    codeB13: names.codeB13 || 'Группа 3',
                    codeB21: names.codeB21 || 'Группа 4',
                },
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

    const [editTarget, setEditTarget] = useState(null); // { type: 'class'|'group', key: string, value: string }
    const [namesEditorOpen, setNamesEditorOpen] = useState(false);

    const fileRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        let hydratedFromStorage = false;
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const saved = JSON.parse(raw);
                if (
                    saved &&
                    Array.isArray(saved.years) &&
                    typeof saved.currentYear === 'number' &&
                    typeof saved.paramsB === 'object' &&
                    typeof saved.names === 'object'
                ) {
                    setYears(saved.years);
                    setCurrentYear(saved.currentYear);
                    setParamsB(saved.paramsB);
                    setNames({ ...DEFAULT_NAMES, ...saved.names });
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

            if (bBlock.names && typeof bBlock.names === 'object') {
                setNames({ ...DEFAULT_NAMES, ...bBlock.names });
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

    const openNameEditorForClass = () => {
        const key = classType === 'A' ? 'codeClassA' : classType === 'B' ? 'codeClassB' : 'codeClassV';
        setEditTarget({ type: 'class', key, value: names[key] || '' });
        setNamesEditorOpen(true);
    };

    const openNameEditorForGroup = () => {
        const map = { 1: 'codeB11', 2: 'codeB12', 3: 'codeB13', 4: 'codeB21' };
        const key = map[group];
        setEditTarget({ type: 'group', key, value: names[key] || '' });
        setNamesEditorOpen(true);
    };

    const closeNamesEditor = () => {
        setNamesEditorOpen(false);
        setEditTarget(null);
    };

    const renameActiveClassByDblClick = () => openNameEditorForClass();
    const renameActiveGroupByDblClick = () => openNameEditorForGroup();

    const handleCompute = async () => {
        setBusy(true);
        try {
            const delay = 1500;
            const payload = buildExportPayload(years, paramsB, names);
            await Api.calcMulti(payload);
            toast.success('Расчёт выполнен', {
                autoClose: delay,
                onClose: () => {
                    navigate('/analytics');
                },
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
                                    <button type="button" onClick={handleImportClick}>Импорт JSON</button>
                                    <button type="button" onClick={handleExport}>Экспорт JSON</button>
                                    <button type="button" onClick={handleDeleteCurrentYear}>Удалить текущий год</button>
                                    <button type="button" onClick={clearAll}>Очистить всё</button>
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
                            key={`class-tabs-${names.codeClassA}-${names.codeClassB}-${names.codeClassV}`}
                            value={classType}
                            onChange={setClassType}
                            onDoubleClick={renameActiveClassByDblClick}
                            names={{
                                A: names.codeClassA,
                                B: names.codeClassB,
                                C: names.codeClassV,
                            }}
                        />
                        <button
                            type="button"
                            className="icon-btn edit-mini-btn"
                            aria-label="Редактировать название класса"
                            onClick={openNameEditorForClass}
                            title="Изменить название"
                            style={{ marginLeft: 8 }}
                        >
                            ✎
                        </button>
                    </div>

                    <h2 style={{ marginTop: 24 }}>Выбор группы</h2>
                    <div className="tabs-with-edit">
                        <GroupTabs
                            key={`group-tabs-${names.codeB11}-${names.codeB12}-${names.codeB13}-${names.codeB21}`}
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
                            onClick={openNameEditorForGroup}
                            title="Изменить название"
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
                    {busy ? (
                        <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            <span>Считаем =)</span>
                        </>
                    ) : ('Рассчитать')}
                </button>
            </div>

            <ToastContainer position="bottom-right" />

            {namesEditorOpen && editTarget && (
                <div
                    className="modal-backdrop"
                    onClick={closeNamesEditor}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                    }}
                >
                    <div
                        className="modal"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: '#fff',
                            borderRadius: 12,
                            width: 'min(420px, 90vw)',
                            padding: 20,
                            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                        }}
                    >
                        <h3 style={{ marginTop: 0 }}>
                            {editTarget.type === 'class' ? 'Изменение названия класса' : 'Изменение названия группы'}
                        </h3>
                        <div className="form-grid" style={{ display: 'grid', gap: 12 }}>
                            <label style={{ fontSize: 12, color: '#666' }}>{editTarget.key}</label>
                            <input
                                type="text"
                                value={editTarget.value}
                                onChange={(e) => {
                                    const newValue = e.target.value;
                                    setEditTarget((t) => ({ ...t, value: newValue }));
                                    setNames((n) => ({ ...n, [editTarget.key]: newValue }));
                                }}
                                style={{
                                    padding: '10px 12px',
                                    border: '1px solid #ccc',
                                    borderRadius: 8,
                                    fontSize: 14,
                                }}
                                placeholder="Введите новое название"
                            />
                        </div>
                        <div
                            className="modal-actions"
                            style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}
                        >
                            <button type="button" onClick={closeNamesEditor}>Отмена</button>
                            <button
                                type="button"
                                className="primary-btn"
                                onClick={closeNamesEditor}
                                disabled={!editTarget.value.trim()}
                            >
                                Сохранить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
