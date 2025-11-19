import React, { useEffect, useState, createContext, useContext } from 'react';
import { Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import { Api } from './api';
import InputPage from './pages/InputPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

function AppShell({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="app-root">
            <header className="top-bar">
                <div className="top-bar-left">
                    <span className="logo-text">Рейтинг</span>
                    {user && (
                        <nav className="top-nav">
                            <Link to="/input" className="top-nav-link">
                                Ввод параметров
                            </Link>
                            <Link to="/analytics" className="top-nav-link">
                                Анализ и визуализация
                            </Link>
                            <Link to="/history" className="top-nav-link">
                                История
                            </Link>
                        </nav>
                    )}
                </div>
                {user && (
                    <div className="top-bar-right">
                        <span className="user-name">{user.name}</span>
                        <button className="icon-btn" onClick={handleLogout} title="Выйти">
                            ⎋
                        </button>
                    </div>
                )}
            </header>
            <main className="page-body">{children}</main>
        </div>
    );
}

function PrivateRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (!user) return <Navigate to="/login" replace />;
    return children;
}

export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // при загрузке проверяем /me (есть ли активная сессия)
    useEffect(() => {
        (async () => {
            try {
                const me = await Api.me();
                setUser(me);
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const login = (u) => setUser(u);
    const logout = async () => {
        await Api.logout();
        setUser(null);
    };

    const authValue = { user, loading, login, logout };

    return (
        <AuthContext.Provider value={authValue}>
            <AppShell>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <PrivateRoute>
                                <Navigate to="/input" replace />
                            </PrivateRoute>
                        }
                    />

                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    <Route
                        path="/input"
                        element={
                            <PrivateRoute>
                                <InputPage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/analytics"
                        element={
                            <PrivateRoute>
                                <AnalyticsPage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/history"
                        element={
                            <PrivateRoute>
                                <HistoryPage />
                            </PrivateRoute>
                        }
                    />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AppShell>
        </AuthContext.Provider>
    );
}
