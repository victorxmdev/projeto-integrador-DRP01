from flask import Flask

# App Flask principal.
app = Flask(__name__)

# Importa as rotas após criar o app (evita import circular).
import routes  # noqa: F401

if __name__ == "__main__":
    app.run()