(function () {
    // Chaves de armazenamento no navegador (localStorage).
    const USERS_KEY = 'fototecta_users_v1';
    const SESSION_KEY = 'fototecta_session_v1';
    const REQUESTS_KEY = 'fototecta_pwd_requests_v1';
    const FIXED_USER_IDS = ['u-admin', 'u-cliente', 'u-fotografo'];

    const ROLE_ROUTES = {
        admin: '/admin',
        fotografo: '/fotografologado',
        cliente: '/clientelogado'
    };

    const MSG = {
        REQUIRED_CREATE: 'Nome, e-mail e senha sao obrigatorios.',
        EMAIL_EXISTS: 'E-mail ja cadastrado.',
        ADMIN_CREATE_RESTRICTED: 'O painel admin só pode criar contas de cliente ou fotógrafo.',
        USER_NOT_FOUND: 'Usuário não encontrado.',
        INVALID_EMAIL: 'E-mail invalido.',
        INVALID_PASSWORD: 'Senha invalida.',
        EMAIL_NOT_FOUND: 'E-mail não encontrado.',
        LOGIN_NOT_FOUND: 'E-mail/usuário não existe.',
        LOGIN_WRONG_PASSWORD: 'Senha incorreta.',
        SELF_DELETE: 'Não é permitido remover o usuário logado.',
        RESET_SENT: 'Solicitação enviada! Aguarde a validação pelo suporte.'
    };

    // Usuários padrão para ambiente didático.
    const seedUsers = [
        {
            id: 'u-admin',
            tipo: 'admin',
            nome: 'Administrador',
            email: 'admin@fotecta.com',
            senha: 'admin123'
        },
        {
            id: 'u-cliente',
            tipo: 'cliente',
            nome: 'Cliente',
            email: 'cliente@fotecta.com',
            senha: 'cliente123'
        },
        {
            id: 'u-fotografo',
            tipo: 'fotografo',
            nome: 'Fotografo',
            email: 'fotografo@fotecta.com',
            senha: 'foto123',
            especialidades: ['Casamentos', 'Ensaios']
        }
    ];

    // Deep copy simples para objetos JSON.
    function clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    function readJson(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return fallback;
            return JSON.parse(raw);
        } catch {
            return fallback;
        }
    }

    function writeJson(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function init() {
        const existing = readJson(USERS_KEY, null);
        if (!Array.isArray(existing) || existing.length === 0) {
            writeJson(USERS_KEY, clone(seedUsers));
        }
    }

    function getUsers() {
        init();
        return readJson(USERS_KEY, []).sort((a, b) => a.nome.localeCompare(b.nome));
    }

    function saveUsers(users) {
        writeJson(USERS_KEY, users);
    }

    function getSession() {
        return readJson(SESSION_KEY, null);
    }

    function saveSession(session) {
        writeJson(SESSION_KEY, session);
    }

    function clearSession() {
        localStorage.removeItem(SESSION_KEY);
    }

    function currentUser() {
        const session = getSession();
        if (!session || !session.userId) return null;

        return getUsers().find((u) => u.id === session.userId) || null;
    }

    function redirectForRole(role) {
        return ROLE_ROUTES[role] || ROLE_ROUTES.cliente;
    }

    function login(email, senha) {
        const e = String(email || '').trim().toLowerCase();
        const s = String(senha || '');

        const users = getUsers();
        const userByEmail = users.find((u) => u.email.toLowerCase() === e);

        if (!userByEmail) {
            return { ok: false, message: MSG.LOGIN_NOT_FOUND, reason: 'not_found' };
        }

        if (userByEmail.senha !== s) {
            return { ok: false, message: MSG.LOGIN_WRONG_PASSWORD, reason: 'wrong_password' };
        }

        saveSession({ userId: userByEmail.id, tipo: userByEmail.tipo });
        return { ok: true, user: userByEmail, redirect: redirectForRole(userByEmail.tipo) };
    }

    function logout() {
        clearSession();
    }

    function normalizeRole(role) {
        const valid = ['admin', 'cliente', 'fotografo'];
        return valid.includes(role) ? role : 'cliente';
    }

    function isFixedUserId(userId) {
        return FIXED_USER_IDS.includes(String(userId || ''));
    }

    // Protege páginas por perfil de usuário.
    function requireRole(roles, redirectUrl) {
        const user = currentUser();
        if (!user) {
            window.location.href = redirectUrl || '/login';
            return null;
        }

        const accepted = Array.isArray(roles) ? roles : [roles];
        if (!accepted.includes(user.tipo)) {
            window.location.href = redirectForRole(user.tipo);
            return null;
        }

        return user;
    }

    function createUser(payload, options) {
        const users = getUsers();
        const email = String(payload.email || '').trim().toLowerCase();
        const allowAdminRole = Boolean(options && options.allowAdminRole);

        if (!payload.nome || !email || !payload.senha) {
            return { ok: false, message: MSG.REQUIRED_CREATE };
        }

        if (users.some((u) => u.email.toLowerCase() === email)) {
            return { ok: false, message: MSG.EMAIL_EXISTS };
        }

        const role = normalizeRole(payload.tipo);
        if (role === 'admin' && !allowAdminRole) {
            return { ok: false, message: MSG.ADMIN_CREATE_RESTRICTED };
        }

        const user = {
            id: 'u-' + Date.now(),
            tipo: role,
            nome: String(payload.nome).trim(),
            email: email,
            senha: String(payload.senha),
            foto: payload.foto || null
        };

        users.push(user);
        saveUsers(users);
        return { ok: true, user: user };
    }

    function updateUser(id, payload) {
        const users = getUsers();
        const idx = users.findIndex((u) => u.id === id);
        if (idx === -1) return { ok: false, message: MSG.USER_NOT_FOUND };

        const next = { ...users[idx] };

        // Atualiza somente campos presentes no payload.
        if (payload.nome !== undefined) next.nome = String(payload.nome).trim();
        if (payload.senha !== undefined && payload.senha !== '') next.senha = String(payload.senha);
        if (payload.tipo !== undefined) next.tipo = normalizeRole(payload.tipo);
        if (payload.foto !== undefined) next.foto = payload.foto;
        if (payload.portfolio !== undefined) next.portfolio = payload.portfolio;
        if (payload.favoritos !== undefined) next.favoritos = payload.favoritos;
        if (payload.especialidades !== undefined) next.especialidades = payload.especialidades;
        if (payload.localizacao !== undefined) next.localizacao = payload.localizacao;
        if (payload.interesses !== undefined) next.interesses = payload.interesses;
        if (payload.preco !== undefined) next.preco = payload.preco;
        if (payload.avaliacoes !== undefined) next.avaliacoes = payload.avaliacoes;
        if (payload.bio !== undefined) next.bio = payload.bio;
        if (payload.instagram !== undefined) next.instagram = payload.instagram;
        if (payload.facebook !== undefined) next.facebook = payload.facebook;

        if (payload.email !== undefined) {
            const email = String(payload.email).trim().toLowerCase();
            if (!email) return { ok: false, message: MSG.INVALID_EMAIL };
            const conflict = users.some((u) => u.id !== id && u.email.toLowerCase() === email);
            if (conflict) return { ok: false, message: MSG.EMAIL_EXISTS };
            next.email = email;
        }

        users[idx] = next;
        saveUsers(users);
        return { ok: true, user: next };
    }

    function deleteUser(id) {
        const user = currentUser();
        if (user && user.id === id) {
            return { ok: false, message: MSG.SELF_DELETE };
        }

        if (isFixedUserId(id)) {
            return { ok: false, message: 'Usuários fixos de demonstração não podem ser removidos.' };
        }

        const users = getUsers();
        const next = users.filter((u) => u.id !== id);
        if (next.length === users.length) {
            return { ok: false, message: MSG.USER_NOT_FOUND };
        }

        saveUsers(next);
        return { ok: true };
    }

    function changePassword(id, senha) {
        if (!senha) return { ok: false, message: MSG.INVALID_PASSWORD };
        return updateUser(id, { senha: senha });
    }

    function verifyAdminPassword(password) {
        const user = currentUser();
        const pass = String(password || '');
        if (!user || user.tipo !== 'admin') {
            return { ok: false, message: 'Apenas admin pode validar esta ação.' };
        }
        if (!pass) {
            return { ok: false, message: 'Digite a senha do admin.' };
        }
        if (user.senha !== pass) {
            return { ok: false, message: 'Senha do admin incorreta.' };
        }
        return { ok: true };
    }

    function passwordStrength(rawPassword) {
        const value = String(rawPassword || '');
        const checks = [
            value.length >= 8,
            /[A-Z]/.test(value),
            /[a-z]/.test(value),
            /[0-9]/.test(value),
            /[^A-Za-z0-9]/.test(value)
        ];
        const score = Math.round((checks.filter(Boolean).length / checks.length) * 100);

        let level = 'muito fraca';
        let color = 'bg-danger';
        if (score > 20) {
            level = 'fraca';
            color = 'bg-warning';
        }
        if (score > 45) {
            level = 'media';
            color = 'bg-info';
        }
        if (score > 70) {
            level = 'forte';
            color = 'bg-success';
        }

        return { score, level, color };
    }

    function resetSeed() {
        writeJson(USERS_KEY, clone(seedUsers));
        clearSession();
    }

    function seedCredentialsText() {
        return [
            'Admin: admin@fotecta.com / admin123',
            'Cliente: cliente@fotecta.com / cliente123',
            'Fotografo: fotografo@fotecta.com / foto123'
        ];
    }

    function getResetRequests() {
        return readJson(REQUESTS_KEY, []);
    }

    function requestPasswordReset(email, nascimento) {
        const e = String(email || '').trim().toLowerCase();
        if (!e) return { ok: false, message: 'Digite um e-mail valido.' };

        const users = getUsers();
        const user = users.find((u) => u.email.toLowerCase() === e);
        if (!user) return { ok: false, message: MSG.EMAIL_NOT_FOUND };

        const reqs = getResetRequests();
        if (!reqs.some((r) => r.email === e)) {
            reqs.push({ email: e, nome: user.nome, nascimento: nascimento || 'Não informada' });
            writeJson(REQUESTS_KEY, reqs);
        }
        return { ok: true, message: MSG.RESET_SENT };
    }

    function approveReset(email) {
        const users = getUsers();
        const idx = users.findIndex((u) => u.email === email);
        if (idx !== -1) {
            users[idx].senha = 'fotecta123';
            saveUsers(users);
        }
        rejectReset(email);
        return { ok: true };
    }

    function rejectReset(email) {
        let reqs = getResetRequests();
        reqs = reqs.filter((r) => r.email !== email);
        writeJson(REQUESTS_KEY, reqs);
    }

    init();

    // API pública usada pelas páginas.
    window.Auth = {
        getUsers,
        currentUser,
        login,
        logout,
        requireRole,
        createUser,
        updateUser,
        deleteUser,
        changePassword,
        resetSeed,
        redirectForRole,
        seedCredentialsText,
        getResetRequests,
        requestPasswordReset,
        approveReset,
        rejectReset,
        passwordStrength,
        verifyAdminPassword,
        isFixedUserId
    };
})();
