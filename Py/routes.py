from flask import jsonify, render_template, request, session

from Py.local_store import (
    add_reset_request,
    approve_reset_request,
    create_user,
    delete_user,
    ensure_seed_data,
    get_user_by_email,
    get_user_by_id,
    list_reset_requests,
    list_users,
    reject_reset_request,
    reset_seed,
    set_user_favorites,
    update_user,
    verify_user_password,
)
from Py.main import app


def render_page(template_name):
    return render_template(template_name)


def public_user(user):
    if not user:
        return None
    data = dict(user)
    data.pop('password_hash', None)
    return data


def current_user():
    user_id = session.get('user_id')
    return get_user_by_id(user_id) if user_id else None


def require_current_user(user_id):
    user = current_user()
    if not user:
        return None, (jsonify(ok=False, message='Não autenticado.'), 401)
    if str(user['id']) != str(user_id) and user.get('tipo') != 'admin':
        return None, (jsonify(ok=False, message='Não autorizado.'), 403)
    return user, None


@app.route('/api/register', methods=['POST'])
def api_register():
    data = request.get_json() or request.form
    ok, result = create_user(data)
    if not ok:
        return jsonify(ok=False, message=result), 400

    session['user_id'] = result['id']
    return jsonify(ok=True, user=public_user(result)), 201


@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json() or request.form
    email = (data.get('email') or '').strip().lower()
    senha = data.get('senha')

    if not email or not senha:
        return jsonify(ok=False, message='E-mail e senha obrigatórios.'), 400

    user = verify_user_password(email, senha)
    if not user:
        return jsonify(ok=False, message='Credenciais inválidas.'), 401

    session['user_id'] = user['id']
    return jsonify(ok=True, user=public_user(user))


@app.route('/api/me')
def api_me():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify(ok=False, user=None)
    user = get_user_by_id(user_id)
    if not user:
        return jsonify(ok=False, user=None)
    return jsonify(ok=True, user=public_user(user))


@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify(ok=True)


@app.route('/api/password-reset', methods=['POST'])
def api_password_reset():
    """Endpoint simples para simular envio de e-mail de recuperação.

    Recebe `email` e `nascimento` (opcional). Para fins didáticos, se o
    e-mail existir retornamos uma resposta de sucesso e simulamos o envio.
    """
    data = request.get_json() or request.form
    email = (data.get('email') or '').strip().lower()
    nascimento = data.get('nascimento')

    if not email:
        return jsonify(ok=False, message='E-mail obrigatório.'), 400

    user = get_user_by_email(email)
    if not user:
        return jsonify(ok=False, message='E-mail não encontrado.'), 404

    add_reset_request(user['nome'], email, nascimento)
    app.logger.info(f"[SIMULADO] Solicitação de recuperação registrada para: {email}")
    return jsonify(ok=True, message='E-mail de recuperação enviado (simulado).')


@app.route('/api/users/<int:user_id>/favoritos', methods=['GET', 'POST'])
def api_user_favoritos(user_id):
    _, error = require_current_user(user_id)
    if error:
        return error

    if request.method == 'GET':
        user = get_user_by_id(user_id)
        return jsonify(ok=True, favoritos=(user or {}).get('favoritos', []))

    data = request.get_json() or request.form
    favs = data.get('favoritos') or []
    ok, result = set_user_favorites(user_id, favs)
    if not ok:
        return jsonify(ok=False, message=result), 400
    return jsonify(ok=True, favoritos=result)


@app.route('/api/users', methods=['GET'])
def api_users():
    return jsonify(ok=True, users=[public_user(user) for user in list_users()])


@app.route('/api/users/<int:user_id>', methods=['GET', 'PUT', 'DELETE'])
def api_user_detail(user_id):
    if request.method == 'GET':
        user = get_user_by_id(user_id)
        if not user:
            return jsonify(ok=False, message='Usuário não encontrado.'), 404
        return jsonify(ok=True, user=public_user(user))

    _, error = require_current_user(user_id)
    if error:
        return error

    if request.method == 'DELETE':
        ok, message = delete_user(user_id)
        if not ok:
            return jsonify(ok=False, message=message), 404
        if str(session.get('user_id')) == str(user_id):
            session.clear()
        return jsonify(ok=True, message=message)

    data = request.get_json() or request.form
    ok, result = update_user(user_id, data)
    if not ok:
        return jsonify(ok=False, message=result), 400
    return jsonify(ok=True, user=public_user(result))


@app.route('/api/reset-requests', methods=['GET'])
def api_reset_requests():
    user = current_user()
    if not user or user.get('tipo') != 'admin':
        return jsonify(ok=False, message='Não autorizado.'), 403
    return jsonify(ok=True, requests=list_reset_requests())


@app.route('/api/reset-requests/<path:email>/approve', methods=['POST'])
def api_reset_request_approve(email):
    user = current_user()
    if not user or user.get('tipo') != 'admin':
        return jsonify(ok=False, message='Não autorizado.'), 403
    ok, message = approve_reset_request(email)
    if not ok:
        return jsonify(ok=False, message=message), 404
    return jsonify(ok=True, message=message)


@app.route('/api/reset-requests/<path:email>/reject', methods=['POST'])
def api_reset_request_reject(email):
    user = current_user()
    if not user or user.get('tipo') != 'admin':
        return jsonify(ok=False, message='Não autorizado.'), 403
    ok, message = reject_reset_request(email)
    if not ok:
        return jsonify(ok=False, message=message), 404
    return jsonify(ok=True, message=message)


@app.route('/api/admin/reset-seed', methods=['POST'])
def api_admin_reset_seed():
    user = current_user()
    if not user or user.get('tipo') != 'admin':
        return jsonify(ok=False, message='Não autorizado.'), 403
    reset_seed()
    ensure_seed_data()
    return jsonify(ok=True)

# Rotas públicas
@app.route("/")
def index():
    return render_page("pages/index.html")


@app.route("/homepage")
def homepage():
    return render_page("pages/index.html")


@app.route("/login")
def login():
    return render_page("pages/login.html")


@app.route("/cadastro")
def cadastro():
    return render_page("pages/cadastro.html")


@app.route("/signup-client")
def signup_client():
    return render_page("pages/signup_client.html")


@app.route("/signup-fotografo")
def signup_fotografo():
    return render_page("pages/signup_fotografo.html")


@app.route("/sobrenos")
def sobrenos():
    return render_page("pages/sobrenos.html")


# Rotas de área logada / painel
@app.route("/admin")
def admin():
    return render_page("pages/admin.html")


@app.route("/clientelogado")
def clientelogado():
    return render_page("pages/clientelogado.html")


@app.route("/fotografologado")
def fotografologado():
    return render_page("pages/fotografologado.html")


@app.route("/busca")
def busca():
    return render_page("pages/busca.html")


@app.route("/perfil-publico")
def perfil_publico():
    return render_page("pages/perfil_publico.html")


@app.route("/perfil-cliente")
def perfil_cliente():
    return render_page("pages/perfil_cliente.html")


@app.route("/perfil-prof")
def perfil_prof():
    return render_page("pages/perfil_prof.html")


@app.route("/editar-perfil")
def editar_perfil():
    return render_page("pages/editar_perfil.html")