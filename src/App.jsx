import { NavLink, Route, Routes, Navigate } from 'react-router-dom'
import InputPage from './pages/InputPage.jsx'
import AnalyticsPage from './pages/AnalyticsPage.jsx'

export default function App() {
    return (
        <>
            <div className="nav">
                <div className="nav-inner container">
                    <div className="brand">УниРейтинг</div>
                    <NavLink to="/" end>Ввод параметров</NavLink>
                    <NavLink to="/analytics">Анализ и визуализация</NavLink>
                    {/* История оставлена как пункт меню на будущее */}
                    {/* <NavLink to="/history">История</NavLink> */}
                </div>
            </div>

            <main className="container" style={{marginTop:16}}>
                <Routes>
                    <Route path="/" element={<InputPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
        </>
    )
}
