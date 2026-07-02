/* ============================================================
   financeiro-dashboard.js  –  Music Makers
   ============================================================ */

// --- VERIFICA LOGIN ---
const usuarioLogadoString = localStorage.getItem('usuarioLogado');
const authToken = localStorage.getItem('authToken');

if (!usuarioLogadoString || !authToken) {
    window.location.href = 'login.html';
}

const usuarioLogado = usuarioLogadoString ? JSON.parse(usuarioLogadoString) : null;

// --- SNACKBAR AUTO-CONTIDO ---
function showSnackbar(message, type = 'success') {
    const styleId = 'financeiroDashboardSnackbarStyles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            #snackbar {
                visibility: hidden;
                min-width: 280px;
                max-width: 420px;
                background: #ffffff;
                color: #34495e;
                text-align: left;
                border-radius: 10px;
                padding: 14px 18px;
                position: fixed;
                z-index: 99999;
                left: 50%;
                bottom: 30px;
                transform: translateX(-50%) translateY(20px);
                opacity: 0;
                transition: opacity 0.3s, transform 0.3s;
                box-shadow: 0 8px 30px rgba(0,0,0,.15);
                border-left: 4px solid #28a745;
                font-family: 'Inter', sans-serif;
                font-size: 0.9rem;
            }
            #snackbar.show {
                visibility: visible;
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        `;
        document.head.appendChild(style);
    }

    let snackbar = document.getElementById('snackbar');
    if (!snackbar) {
        snackbar = document.createElement('div');
        snackbar.id = 'snackbar';
        document.body.appendChild(snackbar);
    }

    const isError = type === 'error';
    snackbar.style.borderLeftColor = isError ? '#e74c3c' : '#28a745';
    snackbar.textContent = message;
    snackbar.className = 'show';
    setTimeout(() => { snackbar.className = snackbar.className.replace('show', ''); }, 3000);
}

// --- RESOLVE BANDA ID ---
function resolverBandaId() {
    if (window._bandaId) return window._bandaId;
    if (usuarioLogado && usuarioLogado.bandaId) {
        window._bandaId = usuarioLogado.bandaId;
        return window._bandaId;
    }
    return null;
}

let transacoes = [];

function mostrarEstadoErro(mensagem) {
    const mainContent = document.getElementById('dashboardMainContent');
    const errorState = document.getElementById('dashboardErrorState');
    const errorMsg = document.getElementById('dashboardErrorMessage');
    const badgeLive = document.getElementById('badgeLive');

    if (mainContent) mainContent.style.display = 'none';
    if (errorState) {
        errorState.style.display = 'block';
        if (errorMsg) errorMsg.textContent = mensagem;
    }
    if (badgeLive) {
        badgeLive.classList.add('badge-erro');
        badgeLive.textContent = 'Erro ao carregar';
    }
}

function mostrarEstadoSucesso() {
    const mainContent = document.getElementById('dashboardMainContent');
    const errorState = document.getElementById('dashboardErrorState');
    const badgeLive = document.getElementById('badgeLive');

    if (mainContent) mainContent.style.display = '';
    if (errorState) errorState.style.display = 'none';
    if (badgeLive) {
        badgeLive.classList.remove('badge-erro');
        badgeLive.textContent = 'Dados em tempo real';
    }
}

async function carregarTransacoes() {
    const bandaId = resolverBandaId();

    if (!bandaId) {
        mostrarEstadoErro('Você ainda não está vinculado a uma banda.');
        return;
    }

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(getApiUrl(`/api/financeiro/banda/${bandaId}`), {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 401) {
            localStorage.removeItem('usuarioLogado');
            localStorage.removeItem('authToken');
            window.location.href = 'login.html';
            return;
        }

        if (!response.ok) {
            mostrarEstadoErro('Não foi possível carregar os dados financeiros. Tente novamente.');
            return;
        }

        const data = await response.json();
        transacoes = data.map(t => ({
            id: t.id,
            tipo: t.tipo,
            descricao: t.descricao,
            valor: t.valor,
            data: t.dataTransacao,
            categoria: t.categoria
        }));

        mostrarEstadoSucesso();
        renderizar();
    } catch (error) {
        console.error('Erro ao buscar financeiro:', error);
        mostrarEstadoErro('Erro de conexão. Verifique sua internet e tente novamente.');
    }
}

// ── ESTADO
let periodoAtivo = 'all';
let grafico = null;
const NOMES_MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

// ── HELPERS
function fmt(v) { return 'R$ ' + v.toFixed(2).replace('.', ','); }

function dataCorte(periodo) {
  const hoje = new Date();
  if (periodo === '1m') { const d = new Date(hoje); d.setDate(d.getDate() - 30); return d; }
  if (periodo === '3m') { const d = new Date(hoje); d.setDate(d.getDate() - 90); return d; }
  if (periodo === '6m') { const d = new Date(hoje); d.setDate(d.getDate() - 180); return d; }
  return new Date(0);
}

function agruparMensal(lista) {
  const mapa = {};
  lista.forEach(t => {
    const d = new Date(t.data + 'T12:00:00');
    const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!mapa[chave]) mapa[chave] = { receita: 0, despesa: 0 };
    t.tipo === 'RECEITA' ? (mapa[chave].receita += t.valor) : (mapa[chave].despesa += t.valor);
  });
  return mapa;
}

// ── ATUALIZAR KPIs
function atualizarKPIs(lista) {
  let receita = 0, despesa = 0;
  lista.forEach(t => t.tipo === 'RECEITA' ? (receita += t.valor) : (despesa += t.valor));
  const lucro = receita - despesa;
  const margem = receita > 0 ? ((lucro / receita) * 100).toFixed(1) : 0;

  document.getElementById('kpiFaturamento').textContent = fmt(receita);
  document.getElementById('kpiDespesas').textContent = fmt(despesa);
  document.getElementById('kpiLucro').textContent = fmt(lucro);
  document.getElementById('kpiMargem').textContent = margem + '%';

  const subFat = document.getElementById('kpiFaturamentoSub');
  const subDesp = document.getElementById('kpiDespesasSub');
  const subLucro = document.getElementById('kpiLucroSub');

  subFat.textContent = `Total no período selecionado`;
  subDesp.textContent = `Total no período selecionado`;

  if (lucro >= 0) {
    subLucro.innerHTML = `<span class="up">↑ Superávit</span>`;
    document.querySelector('.kpi-card.blue .kpi-value').style.color = 'var(--primary)';
  } else {
    subLucro.innerHTML = `<span class="down">↓ Déficit</span>`;
    document.querySelector('.kpi-card.blue .kpi-value').style.color = 'var(--primary)';
  }
}

// ── RENDERIZAR EXTRATO
function renderizarExtrato(lista) {
  const el = document.getElementById('listaTransacoes');
  const badge = document.getElementById('badgeTransacoes');
  const recentes = [...lista].sort((a, b) => new Date(b.data) - new Date(a.data)).slice(0, 8);
  badge.textContent = lista.length + ' registros';

  if (!recentes.length) {
    el.innerHTML = '<p style="color:var(--text-muted);font-size:.85rem">Nenhuma transação no período.</p>';
    return;
  }

  el.innerHTML = recentes.map(t => {
    const d = new Date(t.data + 'T12:00:00').toLocaleDateString('pt-BR');
    const isR = t.tipo === 'RECEITA';
    const icon = isR ? '↑' : '↓';
    return `<div class="transacao">
      <div class="transacao-icon ${isR ? 'receita' : 'despesa'}">${icon}</div>
      <div class="transacao-info">
        <div class="transacao-desc">${t.descricao}</div>
        <div class="transacao-meta">${t.categoria} · ${d}</div>
      </div>
      <div class="transacao-valor ${isR ? 'receita' : 'despesa'}">${isR ? '+' : '-'} ${fmt(t.valor)}</div>
    </div>`;
  }).join('');
}

// ── RENDERIZAR CATEGORIAS
const COR_CAT = ['#fa9848', '#e67e22', '#d35400', '#011029', '#032554', '#34495e'];
function renderizarCategorias(lista) {
  const desp = lista.filter(t => t.tipo === 'DESPESA');
  const mapa = {};
  desp.forEach(t => { mapa[t.categoria] = (mapa[t.categoria] || 0) + t.valor; });
  const total = desp.reduce((s, t) => s + t.valor, 0);
  const sorted = Object.entries(mapa).sort((a, b) => b[1] - a[1]);

  document.getElementById('badgeCategorias').textContent = sorted.length + ' categorias';

  const el = document.getElementById('listaCategorias');
  el.innerHTML = sorted.map(([cat, val], i) => {
    const pct = total > 0 ? ((val / total) * 100).toFixed(0) : 0;
    const cor = COR_CAT[i % COR_CAT.length];
    return `<div class="cat-item">
      <div class="cat-name">${cat}</div>
      <div class="cat-bar-wrap"><div class="cat-bar" style="width:${pct}%;background:${cor}"></div></div>
      <div class="cat-pct">${pct}%</div>
    </div>`;
  }).join('');
}

// ── CRIAR / ATUALIZAR GRÁFICO
function renderizarGrafico(lista) {
  const agrupado = agruparMensal(lista);
  const labels = Object.keys(agrupado).sort();

  const receitas = labels.map(k => agrupado[k].receita);
  const despesas = labels.map(k => agrupado[k].despesa);
  const labelsFormatados = labels.map(k => {
    const [ano, mes] = k.split('-');
    return `${NOMES_MESES[parseInt(mes) - 1]} ${ano}`;
  });

  const cfg = {
    type: 'line',
    data: {
      labels: labelsFormatados,
      datasets: [
        {
          label: 'Faturamento',
          data: receitas,
          borderColor: '#fa9848',
          backgroundColor: 'rgba(250,152,72,.08)',
          borderWidth: 2.5,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: '#fa9848',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Despesas',
          data: despesas,
          borderColor: '#011029',
          backgroundColor: 'rgba(1,16,41,.06)',
          borderWidth: 2.5,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: '#011029',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          tension: 0.4,
          fill: true,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 3,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#011029',
          titleColor: '#fff',
          bodyColor: 'rgba(255,255,255,.8)',
          padding: 14,
          cornerRadius: 10,
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: R$ ${ctx.parsed.y.toFixed(2).replace('.', ',')}`
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(0,0,0,.04)', drawBorder: false },
          ticks: { font: { family: 'Inter', size: 11 }, color: '#94a3b8' },
          border: { display: false }
        },
        y: {
          position: 'right',
          grid: { color: 'rgba(0,0,0,.05)', drawBorder: false },
          ticks: {
            font: { family: 'Inter', size: 11 },
            color: '#94a3b8',
            callback: v => 'R$ ' + (v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v.toFixed(0))
          },
          border: { display: false }
        }
      }
    }
  };

  const canvas = document.getElementById('graficoFin');
  if (grafico) { grafico.destroy(); }
  grafico = new Chart(canvas, cfg);
}

// ── FILTRAR E RENDERIZAR TUDO
function renderizar() {
  const corte = dataCorte(periodoAtivo);
  const filtrado = transacoes.filter(t => new Date(t.data + 'T12:00:00') >= corte);

  atualizarKPIs(filtrado);
  renderizarExtrato(filtrado);
  renderizarCategorias(filtrado);
  renderizarGrafico(filtrado);
}

// ── FUNÇÕES GLOBAIS (chamadas pelo HTML)
window.aplicarPeriodo = function (periodo) {
  periodoAtivo = periodo;
  const map = { '1m': 'btn1m', '3m': 'btn3m', '6m': 'btn6m', 'all': 'btnAll' };
  document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(map[periodo])?.classList.add('active');
  renderizar();
};

window.carregarTransacoes = carregarTransacoes;

// ── INIT
document.addEventListener('DOMContentLoaded', () => {
  if (!usuarioLogadoString || !authToken) return; // já redirecionando para login.html
  carregarTransacoes();
});
