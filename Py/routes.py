from main import app
from flask import render_template


# rotas
@app.route("/")
def homepage():
    return render_template("homepage.html")


@app.route("/login")
def login():
    return render_template("login.html")


@app.route("/cadastro")
def cadastro():
    return render_template("cadastro.html")


@app.route("/sobrenos")
def sobrenos():
    return render_template("sobrenos.html")


@app.route("/admin")
def admin():
    return render_template("admin.html")


@app.route("/clientelogado")
def clientelogado():
    return render_template("clientelogado.html")


@app.route("/fotografologado")
def fotografologado():
    return render_template("fotografologado.html")