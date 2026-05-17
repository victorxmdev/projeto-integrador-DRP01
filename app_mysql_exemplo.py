'''
# Olá! Pesquisei no GitHub e em tutoriais de canais estrangeiros no YouTube sobre como conectar um banco de dados MySQL a um projeto Flask, e aqui está um exemplo básico de como você pode fazer isso usando a extensão Flask-SQLAlchemy:

# 1. Você precisaria instalar as bibliotecas: 
# pip install Flask-SQLAlchemy PyMySQL

# 2. Em seguida, no seu arquivo __init__.py ou main.py, você faria a configuração:
# from flask import Flask
# from flask_sqlalchemy import SQLAlchemy

# db = SQLAlchemy()

# def create_app():
#     app = Flask(__name__)
#     app.config['SECRET_KEY'] = 'paralelo'
#     
#     # Aqui é onde a mágica acontece. Você coloca o usuário, senha, host e nome do banco MySQL:
#     # Exemplo: mysql+pymysql://usuario:senha@localhost/nome_do_banco
#     app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:root@localhost/fotecta_db'
#     app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
#     
#     db.init_app(app)
#
#     # Aqui criamos a Tabela de Usuários no Banco de Dados
#     class Usuario(db.Model):
#         id = db.Column(db.Integer, primary_key=True)
#         nome = db.Column(db.String(150), nullable=False)
#         email = db.Column(db.String(150), unique=True, nullable=False)
#         senha = db.Column(db.String(150), nullable=False)
#         tipo = db.Column(db.String(50), nullable=False) # cliente, fotografo ou admin
#         localizacao = db.Column(db.String(150))
#         # Outros campos entrariam aqui...
#
#     with app.app_context():
#         db.create_all() # Cria as tabelas automaticamente se não existirem
#
#     return app
'''