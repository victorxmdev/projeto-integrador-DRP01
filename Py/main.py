#Este arquivo importa o Flask e cria as bases do site, banco de dados...

from flask import Flask

app = Flask(__name__)

from routes import *

if __name__ == "__main__":
    app.run()