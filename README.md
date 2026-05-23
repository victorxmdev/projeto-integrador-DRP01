# FOTECTA

Guia rápido para rodar o site localmente e entender a estrutura do projeto.

## O que é

O FOTECTA é um site em Flask para conectar clientes e fotógrafos. O fluxo principal é simples:

1. O cliente entra, pesquisa fotógrafos e marca favoritos.
2. O fotógrafo entra, vê o painel e acompanha o que foi salvo.
3. O admin gerencia usuários e solicitações de recuperação de senha.

## Tecnologias

- Python
- Flask
- Bootstrap
- JavaScript puro
- Banco SQL local em SQLite

## Pré-requisitos

- Python 3.10 ou superior
- `pip`
- VS Code ou outro editor de sua preferência

Não é preciso instalar MySQL nem outro servidor externo. Os dados ficam em um banco SQLite local gerado automaticamente.

## Como rodar

### 1. Baixe o projeto

```bash
git clone https://github.com/gabrielasams/projeto-integrador-DRP01.git
cd projeto-integrador-DRP01
```

### 2. Crie e ative o ambiente virtual

```bash
python3 -m venv venv
source venv/bin/activate
```

No Windows PowerShell:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### 3. Instale as dependências

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Execute o site

```bash
python -m Py.main
```

O site abre em `http://127.0.0.1:5000`.

## Contas de demonstração

Use estes acessos para testar as telas:

- Admin: `admin@fotecta.com` / `admin123`
- Cliente: `cliente@fotecta.com` / `cliente123`
- Fotógrafo: `fotografo@fotecta.com` / `foto123`

## Onde os dados ficam salvos

O projeto grava os dados em um banco SQLite local, gerado automaticamente em tempo de execução.

- Nome do arquivo: `instance/fotecta.sqlite3`
- Schema SQL: `Banco de Dados/fotecta_schema.sql`

Isso significa que:

- os dados continuam enquanto o banco existir;
- não é preciso configurar MySQL ou outro servidor;
- se o arquivo SQLite for apagado, o sistema recria os dados de demo.

## Como resetar os dados

Se quiser voltar ao estado inicial, use uma destas opções:

1. Entre como admin e use a ação de restaurar usuários de teste.
2. Apague o arquivo temporário `fotecta_store.json`.
3. Reinicie a aplicação para recriar os dados básicos.

## Estrutura principal

- `Py/main.py`: inicializa o Flask e os dados de demo.
- `Py/routes.py`: rotas da aplicação e APIs.
- `Py/sql_store.py`: armazenamento SQL local em SQLite.
- `Py/static/`: arquivos CSS e JavaScript.
- `Py/templates/`: páginas HTML.

## Funcionalidades principais

- Login com contas de demo
- Busca de fotógrafos
- Favoritar e desfavoritar profissionais
- Painel do cliente
- Painel do fotógrafo
- Painel do admin
- Recuperação de senha simulada

## Problemas comuns

Se o site não abrir, verifique estes pontos:

- O ambiente virtual está ativado.
- As dependências foram instaladas com `pip install -r requirements.txt`.
- A porta `5000` não está ocupada por outro processo.

Se quiser limpar tudo e começar de novo, apague o arquivo temporário do app e rode novamente.

## Observação

O projeto foi simplificado para uso local e didático. Ele não depende mais de MySQL nem de arquivo SQL exportado.
