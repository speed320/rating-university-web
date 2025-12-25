import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Api } from '../api.js';
import { useAuth } from '../App.jsx';

export default function RegisterPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [pwd1, setPwd1] = useState('');
    const [pwd2, setPwd2] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [passError, setPassError] = useState('');

    const handlePasswordChange = (evt) => {
        const password = evt.target.value;
        setPwd1(password);
        if (password.length < 6) {
            setPassError('Пароль должен быть не менее 6 символов')
        } else{
            setPassError('');
        }

    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (pwd1 !== pwd2) {
            setError('Пароли не совпадают');
            return;
        }
        setBusy(true);
        try {
            const resp = await Api.register({ name, email, password: pwd1 });
            // бэк автоматически логинит, но на всякий случай логиним контекстом
            login(resp);
            navigate('/input');
        } catch (err) {
            setError(err.message || 'Ошибка регистрации');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1 className="auth-title">Регистрация</h1>
                <form onSubmit={handleSubmit} className="auth-form">
                    <input
                        className="auth-input"
                        placeholder="Имя"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <input
                        className="auth-input"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        className="auth-input"
                        type="password"
                        placeholder="Пароль"
                        value={pwd1}
                        onChange={handlePasswordChange}
                        required
                    />
                    {passError && <div className="auth-error"> {passError}</div>}
                    <input
                        className="auth-input"
                        type="password"
                        placeholder="Повтор пароля"
                        value={pwd2}
                        onChange={(e) => setPwd2(e.target.value)}
                        required
                    />
                    {error && <div className="auth-error">{error}</div>}
                    <button className="primary-btn spinner-btn" type="submit" disabled={busy || passError}>
                        {busy ? (
                            <>
                                <span className='spinner-border spinner-border-sm mr-2' role="status" aria-hidden="true"> </span>
                                Регистрация...
                            </>
                        ) : (
                            'Регистрация'
                        )}

                    </button>

                </form>
                <div className="auth-sub">
                    Уже есть аккаунт? <Link to="/login">Войти</Link>
                </div>
            </div>
        </div>
    );
}
