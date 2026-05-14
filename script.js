/** Maximo de parcelas que podem ser selecionadas ao mesmo tempo. */
const MAX_PARCELAS_SELECAO = 10;

/** So mostra a lista depois que o usuario foca/clica no campo (dentro deste painel). */
let listaPainelAberta = false;

let idTimeoutFecharPainel = null;

let idDebounceViewport = null;

function dispositivoComToqueGrosso() {
    return (
        typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches
    );
}

function atrasoFecharPainelAoSairDoFoco() {
    return dispositivoComToqueGrosso() ? 220 : 40;
}

function sincronizaClassePainelExpandido() {
    const painel = document.querySelector('.painel-busca-lista');
    if (painel) {
        painel.classList.toggle('painel-busca-expandido', listaPainelAberta);
    }
}

/** Ajusta a altura rolavel da lista ao teclado / barra segura em celular. */
function atualizarAlturaListaPeloViewport() {
    const pesquisa = document.getElementById('pesquisa');
    const vv = window.visualViewport;

    if (!pesquisa || !vv || !listaPainelAberta) {
        document.documentElement.style.removeProperty('--lista-busca-max-px');
        return;
    }

    const entrada = pesquisa.getBoundingClientRect();
    /** Espaco sob o campo ate o fundo da area visual (melhora quando o teclado encolhe a tela). */
    let espacoAbaixo = vv.height + vv.offsetTop - entrada.bottom - 32;
    espacoAbaixo = Math.max(120, Math.min(vv.height * 0.75, espacoAbaixo));

    document.documentElement.style.setProperty('--lista-busca-max-px', `${Math.round(espacoAbaixo)}px`);
}

function agendarViewportLista() {
    window.clearTimeout(idDebounceViewport);
    idDebounceViewport = window.setTimeout(() => {
        atualizarAlturaListaPeloViewport();
    }, 70);
}

function rolarPainelBuscaAoAbrirMobile() {
    if (typeof window.matchMedia !== 'function' || !window.matchMedia('(max-width: 520px)').matches) {
        return;
    }
    const painel = document.querySelector('.painel-busca-lista');
    if (!painel) return;
    window.requestAnimationFrame(() => {
        painel.scrollIntoView({ block: 'nearest', behavior: 'smooth', inline: 'nearest' });
    });
}

function ligarAjustesViewportLista() {
    const vv = window.visualViewport;
    if (!vv) return;

    const acionar = () => {
        agendarViewportLista();
    };

    vv.addEventListener('resize', acionar);
    vv.addEventListener('scroll', acionar);

    window.addEventListener('orientationchange', () => {
        window.setTimeout(acionar, 300);
    });
}

function campo(valor) {
    return String(valor || '').toLowerCase();
}

/** Lista + aviso ficam ocultos ate abrir pelo campo; texto filtra como antes. */
function atualizarPainelLista() {
    const termo = document.getElementById('pesquisa').value.trim().toLowerCase();
    const grupo = document.getElementById('lista-checkboxes');
    const aviso = document.getElementById('lista-aviso-busca');

    if (!listaPainelAberta) {
        aviso.hidden = true;
        grupo.hidden = true;
        window.clearTimeout(idTimeoutFecharPainel);
        document.documentElement.style.removeProperty('--lista-busca-max-px');
        sincronizaClassePainelExpandido();
        return;
    }

    sincronizaClassePainelExpandido();
    atualizarAlturaListaPeloViewport();
    agendarViewportLista();

    if (!termo) {
        aviso.hidden = true;
        grupo.hidden = false;
        grupo.querySelectorAll('.parcela-checkbox').forEach((linha) => {
            linha.style.display = '';
        });
        agendarViewportLista();
        return;
    }

    let encontradas = 0;

    document.querySelectorAll('#lista-checkboxes .parcela-checkbox').forEach((linha) => {
        const entrada = linha.querySelector('input[type="checkbox"]');
        if (!entrada) return;

        const indice = Number.parseInt(entrada.value, 10);
        const item = window.PARCELAS[indice];
        if (!item) {
            linha.style.display = 'none';
            return;
        }

        const mostra =
            campo(item.parcelas).includes(termo)
            || campo(item.ano).includes(termo)
            || campo(item.linhas).includes(termo);

        if (mostra) {
            linha.style.display = '';
            encontradas += 1;
        } else {
            linha.style.display = 'none';
        }
    });

    if (encontradas === 0) {
        grupo.hidden = true;
        aviso.hidden = false;
        aviso.textContent = 'Nenhuma parcela encontrada para esse texto.';
    } else {
        grupo.hidden = false;
        aviso.hidden = true;
    }

    agendarViewportLista();
}

/** Clica em qualquer ponto da linha alterna a selecao (nao precisa acertar o quadrado). */
function ligarCliqueLinhaParcela(grupo) {
    grupo.addEventListener('click', (evento) => {
        const linha = evento.target.closest('.parcela-checkbox');
        if (!linha || !grupo.contains(linha)) return;

        const entrada = linha.querySelector('input[type="checkbox"]');
        if (!entrada || entrada === evento.target) return;

        entrada.checked = !entrada.checked;
        entrada.dispatchEvent(new Event('change', { bubbles: true }));
    });

    grupo.addEventListener('keydown', (evento) => {
        if (evento.target.tagName === 'INPUT') return;
        const linha = evento.target.closest('.parcela-checkbox');
        if (!linha || !grupo.contains(linha)) return;
        if (evento.key !== 'Enter' && evento.key !== ' ') return;

        evento.preventDefault();
        const entrada = linha.querySelector('input[type="checkbox"]');
        if (!entrada) return;

        entrada.checked = !entrada.checked;
        entrada.dispatchEvent(new Event('change', { bubbles: true }));
    });
}

function ligarAbrirFecharPainelLista() {
    const painel = document.querySelector('.painel-busca-lista');
    const entrada = painel.querySelector('#pesquisa');

    painel.addEventListener('focusin', () => {
        window.clearTimeout(idTimeoutFecharPainel);
        listaPainelAberta = true;
        atualizarPainelLista();
        rolarPainelBuscaAoAbrirMobile();
    });

    painel.addEventListener('focusout', () => {
        const espere = atrasoFecharPainelAoSairDoFoco();
        window.clearTimeout(idTimeoutFecharPainel);
        idTimeoutFecharPainel = window.setTimeout(() => {
            if (!painel.matches(':focus-within')) {
                listaPainelAberta = false;
                atualizarPainelLista();
            }
        }, espere);
    });

    entrada.addEventListener('pointerdown', () => {
        window.clearTimeout(idTimeoutFecharPainel);
        listaPainelAberta = true;
        atualizarPainelLista();
        rolarPainelBuscaAoAbrirMobile();
    });
}

// Monta lista de checkbox com todas as parcelas de dados.js.
function popularListaCheckboxes() {
    const grupo = document.getElementById('lista-checkboxes');
    window.PARCELAS.forEach((item, indice) => {
        const linha = document.createElement('div');
        linha.className = 'parcela-checkbox';
        linha.tabIndex = 0;

        const entrada = document.createElement('input');
        entrada.type = 'checkbox';
        entrada.value = String(indice);

        const nome = item.parcelas ? String(item.parcelas).trim() : '';
        const ano = item.ano ? String(item.ano).trim() : '';
        const texto = [nome, ano].filter(Boolean).join(' — ') || `Item ${indice + 1}`;
        entrada.setAttribute('aria-label', texto);

        const textoEl = document.createElement('span');
        textoEl.className = 'parcela-checkbox-texto';
        textoEl.textContent = texto;

        linha.appendChild(entrada);
        linha.appendChild(textoEl);
        grupo.appendChild(linha);
    });
}

function contarSelecoes() {
    const grupo = document.getElementById('lista-checkboxes');
    return grupo.querySelectorAll('input[type="checkbox"]:checked').length;
}

/** Atualiza os cards assim que marca ou desmarca (sem contador tipo 0 de 10). */
function consultar() {
    const resultado = document.getElementById('resultado');
    const grupo = document.getElementById('lista-checkboxes');
    const entradas = [...grupo.querySelectorAll('input[type="checkbox"]:checked')];

    document.getElementById('contador').textContent = '';

    const indicesOrdenados = entradas
        .map((ent) => Number.parseInt(ent.value, 10))
        .filter((i) => Number.isFinite(i) && i >= 0 && i < window.PARCELAS.length)
        .sort((a, b) => a - b);

    if (indicesOrdenados.length === 0) {
        resultado.innerHTML = '';
        return;
    }

    const dados = indicesOrdenados.map((i) => window.PARCELAS[i]);
    mostrarResultado(dados);
}

/** Impede ultrapassar o limite de selecao. */
function aoMudarCheckbox(evento) {
    const entrada = evento.target;
    if (!entrada || entrada.type !== 'checkbox') {
        return;
    }

    if (entrada.checked && contarSelecoes() > MAX_PARCELAS_SELECAO) {
        entrada.checked = false;
        document.getElementById('contador').textContent = `Maximo ${MAX_PARCELAS_SELECAO} parcelas`;
        return;
    }

    consultar();
}

// Cria os cards de resultado na tela.
function mostrarResultado(dados) {
    const resultado = document.getElementById('resultado');
    resultado.innerHTML = '';

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

// Desmarca tudo, limpa a busca e apaga os cards.
function limparPesquisa() {
    const grupo = document.getElementById('lista-checkboxes');
    grupo.querySelectorAll('input[type="checkbox"]').forEach((entrada) => {
        entrada.checked = false;
    });

    const pesquisa = document.getElementById('pesquisa');
    pesquisa.value = '';
    listaPainelAberta = false;
    atualizarPainelLista();

    document.getElementById('resultado').innerHTML = '';
    document.getElementById('contador').textContent = '';

    pesquisa.blur();
}

window.consultar = consultar;

document.addEventListener('DOMContentLoaded', () => {
    popularListaCheckboxes();

    const listaParcelasEl = document.getElementById('lista-checkboxes');
    ligarCliqueLinhaParcela(listaParcelasEl);

    ligarAbrirFecharPainelLista();
    ligarAjustesViewportLista();
    atualizarPainelLista();
    document.getElementById('contador').textContent = '';

    const pesquisa = document.getElementById('pesquisa');
    pesquisa.addEventListener('input', atualizarPainelLista);

    document.getElementById('lista-checkboxes').addEventListener('change', aoMudarCheckbox);
    document.getElementById('botao-limpar').addEventListener('click', limparPesquisa);
});

// Registra o service worker, responsavel pelo cache para funcionamento offline.
if ('serviceWorker' in navigator) {
    const scriptUrl = document.querySelector('script[src$="script.js"]').src;
    const appUrl = new URL('.', scriptUrl);

    navigator.serviceWorker.register(new URL('sw.js', appUrl)).catch((erro) => {
        console.log('Service worker nao registrado', erro);
    });

    /*tela de abertura: mostra o logo ate o service worker carregar e controlar a pagina, evitando piscadas. */
    window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("splash").style.display = "none";
  }, 2500);
});
}
