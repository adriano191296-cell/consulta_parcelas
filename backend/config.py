import os
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[1]


def carregar_env(caminho: Path):
    if not caminho.exists():
        return

    for linha in caminho.read_text(encoding='utf-8').splitlines():
        linha = linha.strip()

        if not linha or linha.startswith('#') or '=' not in linha:
            continue

        chave, valor = linha.split('=', 1)
        chave = chave.strip()
        valor = valor.strip().strip('"').strip("'")

        os.environ.setdefault(chave, valor)


carregar_env(ROOT_DIR / '.env')

DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'sococo'),
}
