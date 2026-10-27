'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const porId = (id) => document.getElementById(id);
  const form = porId('financeiroForm');
  const lista = porId('listaFinanceira');
  const dialog = porId('dialogFinanceiro');
  const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  let indiceExclusao = null;
  let toastTimer;
  let financeiro;
  try { const dados = JSON.parse(localStorage.getItem('financeiro')); financeiro = Array.isArray(dados) ? dados : []; } catch { financeiro = []; }

  const salvar = () => localStorage.setItem('financeiro', JSON.stringify(financeiro));
  const formatarData = (valor) => {
    if (!valor) return 'Sem data';
    const partes = valor.slice(0, 10).split('-');
    return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : valor;
  };
  const hoje = () => new Date().toISOString().slice(0, 10);

  function resumo() {
    const entradas = financeiro.filter((item) => item.tipo === 'entrada');
    const saidas = financeiro.filter((item) => item.tipo === 'saida');
    const totalEntradas = entradas.reduce((soma, item) => soma + (Number(item.valor) || 0), 0);
    const totalSaidas = saidas.reduce((soma, item) => soma + (Number(item.valor) || 0), 0);
    const saldo = totalEntradas - totalSaidas;
    porId('faturamento').textContent = moeda.format(totalEntradas);
    porId('despesas').textContent = moeda.format(totalSaidas);
    porId('lucro').textContent = moeda.format(saldo);
    porId('lucro').style.color = saldo < 0 ? '#d44150' : '';
    porId('totalMovimentacoes').textContent = financeiro.length;
    porId('entradasDetail').textContent = `${entradas.length} ${entradas.length === 1 ? 'entrada registrada' : 'entradas registradas'}`;
    porId('saidasDetail').textContent = `${saidas.length} ${saidas.length === 1 ? 'despesa registrada' : 'despesas registradas'}`;
    porId('saldoDetail').textContent = saldo >= 0 ? 'Resultado positivo no período' : 'Despesas acima das entradas';
    const total = totalEntradas + totalSaidas;
    const percentEntrada = total ? Math.round(totalEntradas / total * 100) : 0;
    const percentSaida = total ? 100 - percentEntrada : 0;
    porId('entradaPercent').textContent = `${percentEntrada}%`;
    porId('saidaPercent').textContent = `${percentSaida}%`;
    porId('entradaBar').style.width = `${percentEntrada}%`;
    porId('saidaBar').style.width = `${percentSaida}%`;
    const insight = porId('financeInsight');
    if (financeiro.length) {
      insight.querySelector('strong').textContent = saldo >= 0 ? 'Seu resultado está positivo' : 'Atenção ao fluxo de caixa';
      insight.querySelector('small').textContent = saldo >= 0 ? `O saldo atual é de ${moeda.format(saldo)}.` : `As despesas superam as entradas em ${moeda.format(Math.abs(saldo))}.`;
      insight.classList.toggle('negative', saldo < 0);
    }
  }

  function renderizar() {
    lista.innerHTML = '';
    const termo = porId('buscaFinanceira').value.trim().toLocaleLowerCase('pt-BR');
    const filtro = porId('filtroTipo').value;
    const itens = financeiro.map((item, index) => ({ item, index })).filter(({ item }) => {
      const texto = `${item.descricao || ''} ${item.categoria || ''}`.toLocaleLowerCase('pt-BR');
      return (!termo || texto.includes(termo)) && (filtro === 'todos' || item.tipo === filtro);
    }).reverse();
    porId('transactionCount').textContent = `${itens.length} ${itens.length === 1 ? 'registro encontrado' : 'registros encontrados'}`;
    if (!itens.length) {
      lista.innerHTML = financeiro.length ? '<div class="empty-state"><div class="empty-state-icon">⌕</div><strong>Nenhuma movimentação encontrada</strong><p>Altere os filtros para encontrar outro registro.</p></div>' : '<div class="empty-state"><div class="empty-state-icon">R$</div><strong>Nenhuma movimentação registrada</strong><p>Adicione sua primeira entrada ou despesa para acompanhar o resultado.</p></div>';
      return;
    }
    const head = document.createElement('div'); head.className = 'transaction-head'; head.innerHTML = '<span>Movimentação</span><span>Data</span><span>Tipo</span><span>Valor</span><span>Ação</span>'; lista.appendChild(head);
    itens.forEach(({ item, index }) => {
      const row = document.createElement('article'); row.className = 'transaction-item';
      const info = document.createElement('div'); info.className = 'transaction-main';
      const icon = document.createElement('span'); icon.className = `transaction-icon ${item.tipo}`; icon.textContent = item.tipo === 'entrada' ? '↗' : '↘';
      const text = document.createElement('p'); const title = document.createElement('strong'); title.textContent = item.descricao || 'Sem descrição'; const category = document.createElement('small'); category.textContent = item.categoria || 'Sem categoria'; text.append(title, category); info.append(icon, text);
      const date = document.createElement('span'); date.textContent = formatarData(item.data || item.criadoEm);
      const type = document.createElement('span'); type.className = `status-pill ${item.tipo === 'entrada' ? 'normal' : 'esgotado'}`; type.textContent = item.tipo === 'entrada' ? 'Entrada' : 'Despesa';
      const value = document.createElement('strong'); value.className = `transaction-value ${item.tipo}`; value.textContent = `${item.tipo === 'entrada' ? '+' : '-'} ${moeda.format(Number(item.valor) || 0)}`;
      const del = document.createElement('button'); del.type = 'button'; del.className = 'icon-button delete'; del.title = 'Excluir movimentação'; del.setAttribute('aria-label', `Excluir ${item.descricao}`); del.textContent = '×'; del.addEventListener('click', () => abrirExclusao(index));
      row.append(info, date, type, value, del); lista.appendChild(row);
    });
  }

  function mostrarToast(titulo, texto) { const toast = porId('toastFinanceiro'); toast.querySelector('strong').textContent = titulo; toast.querySelector('small').textContent = texto; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 3000); }
  function abrirExclusao(index) { indiceExclusao = index; porId('textoDialogFinanceiro').textContent = `A movimentação “${financeiro[index].descricao}” será removida do histórico.`; if (dialog.showModal) dialog.showModal(); }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const descricao = porId('descricaoFinanceira'); const valor = porId('valor'); const tipo = porId('tipo');
    const validacoes = [[descricao, descricao.value.trim().length > 1], [valor, Number(valor.value) > 0], [tipo, Boolean(tipo.value)]];
    validacoes.forEach(([input, valido]) => input.closest('.field').classList.toggle('invalid', !valido));
    const invalido = validacoes.find(([, valido]) => !valido); if (invalido) { invalido[0].focus(); return; }
    financeiro.push({ descricao: descricao.value.trim(), valor: Number(valor.value), tipo: tipo.value, categoria: porId('categoriaFinanceira').value, data: porId('dataMovimentacao').value || hoje(), criadoEm: new Date().toISOString() });
    salvar(); form.reset(); porId('dataMovimentacao').value = hoje(); resumo(); renderizar(); mostrarToast('Movimentação salva', 'O resumo financeiro foi atualizado.');
  });
  form.querySelectorAll('input,select').forEach((input) => input.addEventListener('input', () => input.closest('.field')?.classList.remove('invalid')));
  porId('buscaFinanceira').addEventListener('input', renderizar); porId('filtroTipo').addEventListener('change', renderizar);
  porId('novaMovimentacao').addEventListener('click', () => { porId('formMovimentacao').scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => porId('descricaoFinanceira').focus(), 350); });
  porId('cancelarFinanceiro').addEventListener('click', () => dialog.close());
  porId('confirmarFinanceiro').addEventListener('click', () => { if (indiceExclusao === null) return; financeiro.splice(indiceExclusao, 1); indiceExclusao = null; salvar(); dialog.close(); resumo(); renderizar(); mostrarToast('Movimentação excluída', 'O resumo financeiro foi recalculado.'); });
  porId('dataMovimentacao').value = hoje(); resumo(); renderizar();
});
