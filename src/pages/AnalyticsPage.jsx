import React, { useEffect, useState } from 'react';
import { Api } from '../api';
import ResultsTable from '../components/ResultsTable.jsx';
import RadarBlock from '../components/RadarBlock.jsx';
import TotalLineBlock from '../components/TotalLineBlock.jsx';

export default function AnalyticsPage() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    // названия метрик (общие для всех лет)
    const [metricNames, setMetricNames] = useState({
        codeB11: 'B11',
        codeB12: 'B12',
        codeB13: 'B13',
        codeB21: 'B21',
    });

    // какие годы отображать (true = показываем)
    const [visibleYears, setVisibleYears] = useState({});

    // грузим последний расчёт класса B
    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        Api.getLastCalcB()
            .then((block) => {
                if (cancelled) return;
                const data = block?.data || [];
                setRows(data);

                if (data.length) {
                    const first = data[0];
                    setMetricNames({
                        codeB11: first.codeB11 || 'B11',
                        codeB12: first.codeB12 || 'B12',
                        codeB13: first.codeB13 || 'B13',
                        codeB21: first.codeB21 || 'B21',
                    });
                    const vis = {};
                    for (const r of data) vis[r.year] = true;
                    setVisibleYears(vis);
                }
            })
            .catch(() => {
                if (!cancelled) setRows([]);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    // обработчик изменения названия метрики из таблицы
    const handleMetricNamesChange = (patch) => {
        setMetricNames((prev) => {
            const next = { ...prev, ...patch };

            // пишем в БД – берём любой calcResultId
            const first = rows[0];
            if (first && first.calcResultId) {
                Api.updateMetricNames({
                    calcResultId: first.calcResultId,
                    codeB11: next.codeB11,
                    codeB12: next.codeB12,
                    codeB13: next.codeB13,
                    codeB21: next.codeB21,
                }).catch((e) => console.warn('Ошибка сохранения имён метрик', e));
            }
            return next;
        });
    };

    // включить/выключить год
    const handleToggleYear = (year) => {
        setVisibleYears((prev) => ({
            ...prev,
            [year]: !prev[year],
        }));
    };

    if (loading) {
        return <div className="card big-card">Загрузка...</div>;
    }

    if (!rows.length) {
        return (
            <div className="card big-card">
                <h2>Аналитика</h2>
                <p>Нет данных для отображения. Сначала выполните расчёт.</p>
            </div>
        );
    }

    // строки, которые реально показываем в графиках
    const activeRows = rows.filter((r) => visibleYears[r.year]);

    return (
        <div className="card big-card analytics-layout">
            <div className="analytics-left">
                <ResultsTable
                    rows={rows}
                    metricNames={metricNames}
                    onMetricNamesChange={handleMetricNamesChange}
                    visibleYears={visibleYears}
                    onToggleYear={handleToggleYear}
                />
            </div>
            <div className="analytics-right">
                <RadarBlock rows={activeRows} metricNames={metricNames} />
                <TotalLineBlock rows={activeRows} />
            </div>
        </div>
    );
}
