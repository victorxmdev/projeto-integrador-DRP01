from main import app
from flask import render_template


def render_page(template_name):
    """Atalho para renderizar templates."""
    return render_template(template_name)

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