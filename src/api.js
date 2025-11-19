const API_BASE = import.meta.env.VITE_API_BASE || '';

async function request(path, options = {}) {
    const resp = await fetch(API_BASE + path, {
        credentials: 'include', // важное: куки-сессия
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
        ...options,
    });

    if (resp.status === 204) return null;

    const isJson = resp.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await resp.json().catch(() => null) : null;

    if (!resp.ok) {
        const message = data?.message || data?.error || resp.statusText;
        throw new Error(message || `HTTP ${resp.status}`);
    }
    return data;
}

export const Api = {
    // ---------- AUTH ----------
    async register({ name, email, password }) {
        return request('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password }),
        });
    },

    async login({ email, password }) {
        return request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    },

    async logout() {
        return request('/api/auth/logout', { method: 'POST' });
    },

    async me() {
        return request('/api/auth/me', { method: 'GET' });
    },

    // ---------- RATING / PARAMS / CALC ----------

    /**
     * Сохранить параметры по всем классам и пересчитать.
     * Сейчас реально используется только класс B.
     *
     * payload: {
     *   classes: [
     *     { classType: "B", data: [ {year, ENa, ENb, ...}, ... ] }
     *   ]
     * }
     */
    async calcMulti(payload) {
        return request('/api/rating/calc-multi', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    },

    /** Экспорт последних параметров по всем классам (MultiClassParamsRequestDto). */
    async exportParams() {
        return request('/api/rating/export', { method: 'GET' });
    },

    /** Сбросить текущую итерацию пользователя (очистка текущих данных, но не истории). */
    async clearCurrent() {
        return request('/api/rating/clear-current', { method: 'POST' });
    },

    /** Последние введённые параметры по классу B. */
    async getLastParamsB() {
        return request('/api/b/params/last', { method: 'GET' });
    },

    /** Последние расчёты по B. */
    async getLastCalcB() {
        return request('/api/b/calc/last', { method: 'GET' });
    },

    /** История по всем классам (когда реализуешь на бэке). Пока можем не вызывать. */
    async getHistoryAll() {
        return request('/api/rating/history', { method: 'GET' });
    },

    async clearHistory() {
        return request('/api/rating/history', {method: 'DELETE'});
    },

    /** История только по B (текущий эндпоинт). */
    async getHistoryB() {
        return request('/api/b/history', { method: 'GET' });
    },

    /** Обновить названия метрик для конкретного результата. */
    async updateMetricNames(dto) {
        // dto: { calcResultId, codeB11, codeB12, codeB13, codeB21 }
        return request('/api/b/metric-names', {
            method: 'PUT',
            body: JSON.stringify(dto),
        });
    },

    /** Параметры класса B для конкретной итерации */
    async getParamsBByIter(iter) {
        return request(`/api/b/params/iter/${iter}`, { method: 'GET' });
    }
};
