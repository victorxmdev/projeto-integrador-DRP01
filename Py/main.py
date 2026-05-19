from flask import Flask, render_template

from Py.local_store import ensure_seed_data

# App Flask principal.
app = Flask(__name__)

# Carrega configurações didáticas (ver `Py/config.py`). Em produção, use
# uma variável de ambiente `SECRET_KEY` segura.
app.config.from_object('Py.config.Config')
import Py.routes  # noqa: F401


def ensure_demo_users():
    """Garante as contas fixas usadas nas telas de demonstração."""
    ensure_seed_data()


ensure_demo_users()


@app.errorhandler(404)
def page_not_found(error):
    """Renderiza uma página 404 amigável em vez da mensagem padrão.

    Isso ajuda a depurar rotas faltantes de maneira didática.
    """
    return render_template('errors/404.html'), 404


@app.errorhandler(500)
def internal_error(error):
    """Handler simples para 500 que imprime traceback em HTML para fins didáticos.

    Observação: exibir traceback em produção é inseguro; isto é apenas
    para execução local e entendimento de estudantes.
    """
    # Em modo debug mostramos o traceback completo (didático).
    if app.debug:
        import traceback
        tb = traceback.format_exc()
        return f"<h1>Internal Server Error</h1><pre>{tb}</pre>", 500

    # Em modo não-debug, renderiza uma página 500 amigável e simples.
    try:
        return render_template('errors/500.html'), 500
    except Exception:
        return "Internal Server Error", 500


if __name__ == "__main__":
    # Inicializa o armazenamento JSON local de forma didática.
    ensure_demo_users()

    # Habilita debug para facilitar aprendizado e mostrar tracebacks locais.
    # NÃO deixar `debug=True` em produção.
    app.run(debug=True, use_reloader=True)