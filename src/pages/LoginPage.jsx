import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Api } from '../api.js';
import { useAuth } from '../App.jsx';

export default function LoginPage() {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    if (user) {
        navigate('/input');
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setBusy(true);
        try {
            const resp = await Api.login({ email, password });
            login(resp);
            navigate('/input');
        } catch (err) {
            setError(err.message || 'Ошибка входа');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1 className="auth-title">Вход</h1>
                <form onSubmit={handleSubmit} className="auth-form">
                    <input
                        className="auth-input"
                        type="email"
                        placeholder="Логин (email)"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        className="auth-input"
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {error && <div className="auth-error">{error}</div>}
                    <button
                        className="primary-btn spinner-btn"
                        type="submit"
                        disabled={busy}
                    >
                        {busy ? (
                            <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                <span>Вход...</span>
                            </>
                        ) : (
                            'Войти'
                        )}
                    </button>

                </form>
                <div className="auth-sub">
                    Нет аккаунта? <Link to="/register">Регистрация</Link>
                </div>
            </div>
        </div>
    );
}
