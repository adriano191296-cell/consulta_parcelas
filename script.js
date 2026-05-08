// Faz a busca nos dados offline carregados em dados.js.
function consultar() {

    const pesquisa = document.getElementById('pesquisa').value.trim();
    const resultado = document.getElementById('resultado');

    if (!pesquisa) {
        atualizarContador(0, 'Digite uma parcela para consultar');
        resultado.innerHTML = '';
        return;
    }

    const termo = pesquisa.toLowerCase();
    const dados = window.PARCELAS.filter((item) =>
        campo(item.parcelas).includes(termo)
        || campo(item.ano).includes(termo)
        || campo(item.linhas).includes(termo)
    );

    mostrarResultado(dados);
}

// Normaliza qualquer campo para texto minusculo antes de comparar.
function campo(valor) {
    return String(valor || '').toLowerCase();
}

// Cria os cards de resultado na tela.
function mostrarResultado(dados) {
    const resultado = document.getElementById('resultado');
    resultado.innerHTML = '';
    atualizarContador(dados.length);

    if (dados.length === 0) {
        resultado.innerHTML = '<p class="mensagem">Nenhum resultado encontrado</p>';
        return;
    }

    dados.forEach((item) => {
        const card = document.createElement('div');
        card.className = 'card';

        const titulo = document.createElement('h2');
        titulo.textContent = item.parcelas || '-';

        const ano = document.createElement('p');
        ano.innerHTML = `<strong>Ano:</strong> ${item.ano || '-'}`;

        const linhas = document.createElement('p');
        linhas.innerHTML = `<strong>Linhas:</strong> ${item.linhas || '-'}`;

        card.appendChild(titulo);
        card.appendChild(ano);
        card.appendChild(linhas);
        resultado.appendChild(card);
    });
}

// Atualiza o texto que informa total de resultados ou status da busca.
function atualizarContador(total, mensagem = '') {
    const contador = document.getElementById('contador');

    if (mensagem) {
        contador.textContent = mensagem;
        return;
    }

    if (total === 1) {
        contador.textContent = '1 resultado encontrado';
        return;
    }

    contador.textContent = `${total} resultados encontrados`;
}

// Limpa o campo de busca e remove os resultados exibidos.
function limparPesquisa() {
    const pesquisa = document.getElementById('pesquisa');
    pesquisa.value = '';
    document.getElementById('resultado').innerHTML = '';
    atualizarContador(window.PARCELAS.length, `${window.PARCELAS.length} parcelas disponiveis offline`);
    pesquisa.focus();
}

// Mantem a funcao acessivel no navegador, inclusive se algum HTML antigo chamar consultar().
window.consultar = consultar;

// Liga os eventos da tela depois que o HTML terminou de carregar.
document.addEventListener('DOMContentLoaded', () => {
    atualizarContador(window.PARCELAS.length, `${window.PARCELAS.length} parcelas disponiveis offline`);

    document.getElementById('botao-consultar').addEventListener('click', consultar);
    document.getElementById('botao-limpar').addEventListener('click', limparPesquisa);

    document.getElementById('pesquisa').addEventListener('input', consultar);
    document.getElementById('pesquisa').addEventListener('keydown', (evento) => {
        if (evento.key === 'Enter') {
            consultar();
        }
    });
});

// Registra o service worker, responsavel pelo cache para funcionamento offline.
if ('serviceWorker' in navigator) {
    const scriptUrl = document.querySelector('script[src$="script.js"]').src;
    const appUrl = new URL('.', scriptUrl);

    navigator.serviceWorker.register(new URL('sw.js', appUrl)).catch((erro) => {
        console.log('Service worker nao registrado', erro);
    });
}
