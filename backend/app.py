from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import mysql.connector
from config import DB_CONFIG

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


def conectar():
    return mysql.connector.connect(**DB_CONFIG)


@app.get('/consultar/{nome}')
def consultar(nome: str):

    conexao = conectar()

    cursor = conexao.cursor(dictionary=True)

    sql = """
    SELECT * FROM parcelas
    WHERE parcelas LIKE %s
    """

    cursor.execute(sql, (f'%{nome}%',))

    resultado = cursor.fetchall()

    cursor.close()
    conexao.close()

    return resultado