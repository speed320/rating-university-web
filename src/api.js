const BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '')

function ensureBase() {
    if (!BASE) {
        throw new Error('VITE_API_BASE не задан. Укажи адрес бэкенда в .env.development/.env.production')
    }
}

async function request(path, opts = {}) {
    ensureBase()
    let res
    try {
        res = await fetch(BASE + path, {
            headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
            ...opts
        })
    } catch (e) {
        throw new Error('Сеть недоступна или CORS: ' + e.message)
    }
    if (!res.ok) {
        const text = await res.text().catch(()=>'')
        throw new Error(`${res.status} ${res.statusText}${text ? ' — '+text : ''}`)
    }
    const ct = res.headers.get('content-type') || ''
    return ct.includes('application/json') ? res.json() : res.text()
}

export const Api = {
    // параметры
    getParamsAll: () => request('/api/b/params'),
    importParams: (bundle) => request('/api/b/import', { method: 'POST', body: JSON.stringify(bundle) }),

    // расчёт
    computeAll: () => request('/api/b/calc', { method: 'POST' }),

    // экспорт потоком
    async exportParamsRaw() {
        ensureBase()
        const res = await fetch(BASE + '/api/b/export')
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
        return res
    },

    // результаты
    getCalcAll: () => request('/api/b/calc'),
    getCalcByYear: (year) => request(`/api/b/calc/${year}`),

    //чистка
    clearAll: () => fetch(`/api/b/clear`, { method: 'DELETE' })
}
