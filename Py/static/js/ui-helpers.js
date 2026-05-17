(function () {
    // Escapa texto para evitar injeção de HTML em templates dinâmicos.
    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Evita chamadas em excesso (ex.: campo de busca digitando rápido).
    function debounce(fn, wait) {
        let timer = null;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), wait || 250);
        };
    }

    function formatDateBR(dateValue) {
        const raw = String(dateValue || '');
        if (!raw.includes('-')) return raw || '-';
        const [year, month, day] = raw.split('-');
        if (!year || !month || !day) return raw;
        return `${day}/${month}/${year}`;
    }

    function maskPassword(password) {
        const len = String(password || '').length;
        if (len <= 0) return '••••••';
        return '•'.repeat(Math.min(Math.max(len, 6), 12));
    }

    function renderStars(score) {
        const note = Number.isFinite(Number(score)) ? Number(score) : 5;
        const count = Math.min(Math.max(Math.round(note), 1), 5);
        return '⭐'.repeat(count);
    }

    function isFixedUserId(userId) {
        return ['u-admin', 'u-cliente', 'u-fotografo'].includes(String(userId || ''));
    }

    window.UIHelpers = {
        escapeHtml,
        debounce,
        formatDateBR,
        maskPassword,
        renderStars,
        isFixedUserId
    };
})();
