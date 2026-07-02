/* ============================================================
   financeiro-dashboard.js  –  Music Makers
   ============================================================ */

// ── EXEMPLOS FIXOS (exibidos quando o backend não está disponível)
const EXEMPLOS_FINANCEIRO = [
  // ── Janeiro 2025
  { tipo: 'RECEITA', descricao: 'Cachê Show Bar do Rock',       valor: 1200.00, data: '2025-01-15', categoria: 'Show' },
  { tipo: 'DESPESA', descricao: 'Aluguel Sala de Ensaio Jan',    valor: 350.00,  data: '2025-01-10', categoria: 'Estúdio' },
  { tipo: 'DESPESA', descricao: 'Cordas de Guitarra',            valor: 89.90,   data: '2025-01-20', categoria: 'Equipamento' },
  // ── Fevereiro 2025
  { tipo: 'RECEITA', descricao: 'Cachê Festa de Carnaval',       valor: 2500.00, data: '2025-02-22', categoria: 'Show' },
  { tipo: 'DESPESA', descricao: 'Aluguel Sala de Ensaio Fev',    valor: 350.00,  data: '2025-02-05', categoria: 'Estúdio' },
  { tipo: 'DESPESA', descricao: 'Transporte Van',                valor: 180.00,  data: '2025-02-22', categoria: 'Transporte' },
  // ── Março 2025
  { tipo: 'RECEITA', descricao: 'Venda Camisetas Banda',         valor: 450.00,  data: '2025-03-10', categoria: 'Merchandising' },
  { tipo: 'RECEITA', descricao: 'Cachê Show Aniversário',        valor: 1800.00, data: '2025-03-28', categoria: 'Show' },
  { tipo: 'DESPESA', descricao: 'Aluguel Sala de Ensaio Mar',    valor: 350.00,  data: '2025-03-08', categoria: 'Estúdio' },
  { tipo: 'DESPESA', descricao: 'Alimentação Pós-Show',          valor: 120.50,  data: '2025-03-28', categoria: 'Alimentação' },
  // ── Abril 2025
  { tipo: 'RECEITA', descricao: 'Cachê Show Pub Central',        valor: 1500.00, data: '2025-04-12', categoria: 'Show' },
  { tipo: 'DESPESA', descricao: 'Aluguel Sala de Ensaio Abr',    valor: 350.00,  data: '2025-04-03', categoria: 'Estúdio' },
  { tipo: 'DESPESA', descricao: 'Manutenção Amplificador',       valor: 250.00,  data: '2025-04-18', categoria: 'Equipamento' },
  // ── Maio 2025
  { tipo: 'RECEITA', descricao: 'Cachê Festival Regional',       valor: 3000.00, data: '2025-05-17', categoria: 'Show' },
  { tipo: 'RECEITA', descricao: 'Venda Adesivos e Bonés',        valor: 320.00,  data: '2025-05-17', categoria: 'Merchandising' },
  { tipo: 'DESPESA', descricao: 'Aluguel Sala de Ensaio Mai',    valor: 350.00,  data: '2025-05-05', categoria: 'Estúdio' },
  { tipo: 'DESPESA', descricao: 'Combustível Viagem Festival',   valor: 290.00,  data: '2025-05-16', categoria: 'Transporte' },
  { tipo: 'DESPESA', descricao: 'Hospedagem Festival',           valor: 400.00,  data: '2025-05-16', categoria: 'Transporte' },
];

let transacoes = [];
const BANDA_ID = 1; // Fixo para teste

async function carregarTransacoes() {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(getApiUrl(`/api/financeiro/banda/${BANDA_ID}`), {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      const data = await response.json();
      transacoes = data.map(t => ({
        tipo: t.tipo,
        descricao: t.descricao,
        valor: t.valor,
        data: t.dataTransacao,
        categoria: t.categoria
      }));
      // Se o banco retornou vazio, usa exemplos
      if (transacoes.length === 0) {
        transacoes = [...EXEMPLOS_FINANCEIRO];
      }
      renderizar();
      return;
    }
  } catch (error) {
    console.error('Erro ao buscar financeiro (usando exemplos):', error);
  }

  // Fallback: se o backend falhou ou não respondeu, exibe os exemplos
  transacoes = [...EXEMPLOS_FINANCEIRO];
  renderizar();
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
  document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('btn' + periodo.replace('m', '') + (periodo === 'all' ? 'All' : 'm'))?.classList.add('active');
  // fallback direto pelo id
  const map = { '1m': 'btn1m', '3m': 'btn3m', '6m': 'btn6m', 'all': 'btnAll' };
  document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(map[periodo])?.classList.add('active');
  renderizar();
};



// ── INIT
document.addEventListener('DOMContentLoaded', () => {
  carregarTransacoes();
});
