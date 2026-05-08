// MÓDULO DE AUTENTICAÇÃO
// Este arquivo gerencia todo o sistema de login do site.
// Usa localStorage (memória do navegador) para guardar usuários e sessões.
// A função () => {} cria um "espaço fechado" onde as variáveis ficam protegidas.
(function () {
    // Nomes das chaves usadas para guardar dados no navegador
    const USERS_KEY = 'fototecta_users_v1';
    const SESSION_KEY = 'fototecta_session_v1';

    // Usuários padrão do sistema (seed = dados iniciais)
    // Estes aparecem automaticamente na primeira vez que alguém acessa o site
    const seedUsers = [
        {
            id: 'u-admin',
            tipo: 'admin',
            nome: 'Administrador',
            email: 'admin@fototecta.com',
            senha: 'admin123'
        },
        {
            id: 'u-cliente',
            tipo: 'cliente',
            nome: 'Cliente Demo',
            email: 'cliente@fototecta.com',
            senha: 'cliente123'
        },
        {
            id: 'u-fotografo',
            tipo: 'fotografo',
            nome: 'Fotografo Demo',
            email: 'fotografo@fototecta.com',
            senha: 'foto123'
        }
    ];

    // Copia um objeto para não modificar o original
    // É como fotografar um documento em vez de ter o original
    function clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    // Lê dados do localStorage (armazenamento do navegador)
    // Se não encontrar ou houver erro, retorna um valor padrão (fallback)
    // try/catch = tenta fazer algo e, se der erro, não quebra tudo
    function readJson(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return fallback;
            return JSON.parse(raw);
        } catch (e) {
            return fallback;
        }
    }

    // Guarda dados no localStorage (tipo um banco de dados simples no navegador)
    // JSON.stringify transforma objetos em texto para poder guardar
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

        const user = getUsers().find((u) => u.id === session.userId);
        return user || null;
    }

    function redirectForRole(role) {
        if (role === 'admin') return '/admin';
        if (role === 'fotografo') return '/fotografologado';
        return '/clientelogado';
    }

    // Função de login: valida email e senha
    // .find() = procura na lista de usuários até achar alguém com esse email e senha
    // Se não encontrar, retorna erro
    // Se encontrar, guarda a sessão (estado de "logado") no navegador
    function login(email, senha) {
        const e = String(email || '').trim().toLowerCase();
        const s = String(senha || '');

        // Procura um usuário com email e senha iguais aos digitados
        const user = getUsers().find(
            (u) => u.email.toLowerCase() === e && u.senha === s
        );

        if (!user) {
            return { ok: false, message: 'Login invalido.' };
        }

        // Guarda que o usuário está logado
        saveSession({ userId: user.id, tipo: user.tipo });
        return { ok: true, user: user, redirect: redirectForRole(user.tipo) };
    }

    function logout() {
        clearSession();
    }

    function normalizeRole(role) {
        const valid = ['admin', 'cliente', 'fotografo'];
        return valid.includes(role) ? role : 'cliente';
    }

    // Protege uma página: só deixa entrar se estiver logado com o tipo certo
    // Se não estiver logado, redireciona para login
    // Se estiver com role errado (ex: admin em página de cliente), redireciona para a página certa
    function requireRole(roles, redirectUrl) {
        const user = currentUser();
        if (!user) {
            // Não está logado, vai para login
            window.location.href = redirectUrl || '/login';
            return null;
        }

        // Verifica se o tipo de usuário (role) é permitido nessa página
        const accepted = Array.isArray(roles) ? roles : [roles];
        if (!accepted.includes(user.tipo)) {
            // Tipo de usuário não é permitido, redireciona para a página certa
            window.location.href = redirectForRole(user.tipo);
            return null;
        }

        // Tudo certo, retorna os dados do usuário
        return user;
    }

    // Cria um novo usuário
    // Valida se tem nome, email e senha
    // Verifica se o email já existe (some = testa se ALGUM elemento atende a condição)
    function createUser(payload) {
        const users = getUsers();
        const email = String(payload.email || '').trim().toLowerCase();

        // Validação: não pode deixar campos vazios
        if (!payload.nome || !email || !payload.senha) {
            return { ok: false, message: 'Nome, email e senha sao obrigatorios.' };
        }

        // Verifica se já existe usuário com esse email
        if (users.some((u) => u.email.toLowerCase() === email)) {
            return { ok: false, message: 'Email ja cadastrado.' };
        }

        const user = {
            id: 'u-' + Date.now(),
            tipo: normalizeRole(payload.tipo),
            nome: String(payload.nome).trim(),
            email: email,
            senha: String(payload.senha)
        };

        users.push(user);
        saveUsers(users);
        return { ok: true, user: user };
    }

    // Edita dados de um usuário (nome, email, senha, tipo)
    // findIndex = encontra a POSIÇÃO do usuário na lista
    // { ...users[idx] } = copia o usuário (spread operator)
    // Só atualiza os campos que foram passados (if !== undefined)
    function updateUser(id, payload) {
        const users = getUsers();
        const idx = users.findIndex((u) => u.id === id);
        if (idx === -1) return { ok: false, message: 'Usuario nao encontrado.' };

        // Cria uma cópia do usuário para não modificar o original
        const next = { ...users[idx] };

        // Atualiza apenas os campos que foram fornecidos
        if (payload.nome !== undefined) next.nome = String(payload.nome).trim();
        if (payload.senha !== undefined && payload.senha !== '') next.senha = String(payload.senha);
        if (payload.tipo !== undefined) next.tipo = normalizeRole(payload.tipo);

        if (payload.email !== undefined) {
            const email = String(payload.email).trim().toLowerCase();
            if (!email) return { ok: false, message: 'Email invalido.' };
            const conflict = users.some((u) => u.id !== id && u.email.toLowerCase() === email);
            if (conflict) return { ok: false, message: 'Email ja cadastrado.' };
            next.email = email;
        }

        users[idx] = next;
        saveUsers(users);
        return { ok: true, user: next };
    }

    function deleteUser(id) {
        const user = currentUser();
        if (user && user.id === id) {
            return { ok: false, message: 'Nao e permitido remover o usuario logado.' };
        }

        const users = getUsers();
        const next = users.filter((u) => u.id !== id);
        if (next.length === users.length) {
            return { ok: false, message: 'Usuario nao encontrado.' };
        }

        saveUsers(next);
        return { ok: true };
    }

    function changePassword(id, senha) {
        if (!senha) return { ok: false, message: 'Senha invalida.' };
        return updateUser(id, { senha: senha });
    }

    function resetSeed() {
        writeJson(USERS_KEY, clone(seedUsers));
        clearSession();
    }

    function seedCredentialsText() {
        return [
            'Admin: admin@fototecta.com / admin123',
            'Cliente: cliente@fototecta.com / cliente123',
            'Fotografo: fotografo@fototecta.com / foto123'
        ];
    }

    init();

    // Expõe as funções para o resto do site usar
    // window.Auth = torna essas funções acessíveis globalmente (de qualquer página)
    // É como um "cardápio" de operações que o site pode fazer
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
        seedCredentialsText
    };
})();
