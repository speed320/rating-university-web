import React, { useEffect, useState } from 'react';
import { Api } from '../api';
import { useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'unirating_b_params_v2';
const SELECTED_ITER_KEY = 'rating_selected_iter';

export default function HistoryPage() {
    const [items, setItems] = useState([]);   // список итераций для B
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            try {
                const resp = await Api.getHistoryAll(); // /api/rating/history

                // Ищем блок класса B
                const bClass = resp?.classes?.find((c) => c.classType === 'B');
                const list = bClass?.items || [];

                if (!cancelled) {
                    setItems(list);
                }
            } catch (e) {
                if (!cancelled) {
                    console.warn('Ошибка загрузки истории', e);
                    setItems([]);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();

        return () => {
            cancelled = true;
        };
    }, []);

    // Удаление всей истории (как ты уже делал через Api.clearHistory)
    const handleClearHistory = async () => {
        if (!window.confirm('Точно удалить всю историю расчётов?')) return;
        try {
            await Api.clearHistory();
            setItems([]);
            localStorage.removeItem(SELECTED_ITER_KEY);
        } catch (e) {
            alert('Ошибка при очистке истории: ' + (e?.message || e));
        }
    };

    // Открыть конкретную итерацию:
    //  - загрузить параметры этой итерации
    //  - сохранить их в localStorage в формате формы
    //  - записать выбранную итерацию
    //  - перейти на аналитику
    const handleOpenIteration = (iter) => async () => {
        try {
            // 1) тянем параметры B для этой итерации
            const block = await Api.getParamsBByIter(iter);
            const rows = block?.data || [];

            if (!rows.length) {
                alert('Для этой итерации нет параметров класса B');
                return;
            }

            // 2) готовим структуру для InputPage
            const map = {};
            const years = [];

            for (const row of rows) {
                if (!row.year) continue;
                years.push(row.year);
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

            const uniqueYears = [...new Set(years)].sort((a, b) => a - b);
            if (!uniqueYears.length) {
                alert('Пустые данные параметров для этой итерации');
                return;
            }

            const payload = {
                years: uniqueYears,
                currentYear: uniqueYears[0],
                paramsB: map,
            };

            // 3) сохраняем параметры в localStorage
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

            // 4) помечаем выбранную итерацию для аналитики
            localStorage.setItem(SELECTED_ITER_KEY, String(iter));

            // 5) переходим на аналитику
            navigate('/analytics');
        } catch (e) {
            alert('Ошибка при загрузке параметров итерации: ' + (e?.message || e));
        }
    };

    if (loading) return <div className="card">Загрузка...</div>;

    if (!items.length) {
        return (
            <div className="card">
                <h2>Сохранённые сессии</h2>
                <p>История пока пуста.</p>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="history-header">
                <h2>Сохранённые сессии</h2>
                <button className="secondary-btn" type="button" onClick={handleClearHistory}>
                    Очистить историю
                </button>
            </div>

            <div className="history-list">
                {items.map((it) => (
                    <div key={it.iter} className="history-item" onClick={handleOpenIteration(it.iter)}>
                        <div className="history-main">
                            <span className="history-title">Расчёт #{it.iter}</span>
                            <span className="history-classes">Класс B</span>
                        </div>
                        <div className="history-summary">
                            {it.results?.map((row) => (
                                <span key={row.year} className="history-chip">
                                    {row.year}: {row.sumB.toFixed(2)}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
