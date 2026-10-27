'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const porId = (id) => document.getElementById(id);
  const lista = porId('estoqueLista');
  let toastTimer;
  let produtos;
  try { const dados = JSON.parse(localStorage.getItem('produtos')); produtos = Array.isArray(dados) ? dados : []; } catch { produtos = []; }
  const salvar = () => localStorage.setItem('produtos', JSON.stringify(produtos));
  const minimo = (produto) => produto.estoqueMinimo === 0 || produto.estoqueMinimo ? Math.max(0, Number(produto.estoqueMinimo) || 0) : 3;
  const status = (produto) => { const qtd = Number(produto.quantidade) || 0; if (qtd <= 0) return { classe: 'esgotado', texto: 'Esgotado' }; if (qtd <= minimo(produto)) return { classe: 'baixo', texto: 'Estoque baixo' }; return { classe: 'normal', texto: 'Saudável' }; };
  const imagemSegura = (valor) => { try { const url = new URL(valor); return ['http:', 'https:'].includes(url.protocol) ? url.href : ''; } catch { return ''; } };
  function atualizarResumo() {
    const total = produtos.reduce((soma, produto) => soma + Math.max(0, Number(produto.quantidade) || 0), 0);
    const estados = produtos.map(status);
    porId('estoqueTotal').textContent = total; porId('estoqueRegular').textContent = estados.filter((item) => item.classe === 'normal').length; porId('estoqueAlerta').textContent = estados.filter((item) => item.classe === 'baixo').length; porId('estoqueZerado').textContent = estados.filter((item) => item.classe === 'esgotado').length; porId('estoqueCount').textContent = produtos.length;
  }
  function mostrarToast(titulo, texto, alerta = false) { const toast = porId('toastEstoque'); toast.querySelector('strong').textContent = titulo; toast.querySelector('small').textContent = texto; toast.querySelector('span').textContent = alerta ? '!' : '✓'; toast.querySelector('span').style.background = alerta ? '#e05260' : ''; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 2800); }
  function movimentar(index, tipo, input) {
    const quantidade = Math.max(1, Math.floor(Number(input.value) || 1)); const atual = Math.max(0, Number(produtos[index].quantidade) || 0);
    if (tipo === 'saida' && quantidade > atual) { mostrarToast('Quantidade indisponível', `Existem apenas ${atual} unidades em estoque.`, true); input.focus(); return; }
    produtos[index].quantidade = tipo === 'entrada' ? atual + quantidade : atual - quantidade; produtos[index].atualizadoEm = new Date().toISOString(); salvar(); renderizar(); mostrarToast(tipo === 'entrada' ? 'Entrada registrada' : 'Saída registrada', `${quantidade} ${quantidade === 1 ? 'unidade movimentada' : 'unidades movimentadas'} em ${produtos[index].nome}.`);
  }
  function renderizar() {
    lista.innerHTML = ''; atualizarResumo();
    const termo = porId('buscaEstoque').value.trim().toLocaleLowerCase('pt-BR'); const filtro = porId('filtroStatus').value;
    const itens = produtos.map((produto, index) => ({ produto, index })).filter(({ produto }) => { const busca = `${produto.nome || ''} ${produto.sku || ''} ${produto.categoria || ''}`.toLocaleLowerCase('pt-BR'); return (!termo || busca.includes(termo)) && (filtro === 'todos' || status(produto).classe === filtro); });
    if (!itens.length) { lista.innerHTML = produtos.length ? '<div class="empty-state inventory-empty"><div class="empty-state-icon">⌕</div><strong>Nenhum produto encontrado</strong><p>Altere os filtros para visualizar outros produtos.</p></div>' : '<div class="empty-state inventory-empty"><div class="empty-state-icon">◫</div><strong>Nenhum produto no estoque</strong><p>Cadastre um produto para começar a controlar seu inventário.</p><a class="primary-button" href="produtos.html#novo-produto">Cadastrar produto</a></div>'; return; }
    itens.forEach(({ produto, index }) => {
      const estado = status(produto); const qtd = Math.max(0, Number(produto.quantidade) || 0); const limite = minimo(produto); const base = Math.max(qtd, limite * 2, 1); const percentual = Math.min(100, Math.round(qtd / base * 100));
      const card = document.createElement('article'); card.className = 'inventory-card';
      const top = document.createElement('div'); top.className = 'inventory-card-top'; const thumb = document.createElement('div'); thumb.className = 'inventory-thumb'; const imagem = imagemSegura(produto.imagem); if (imagem) { thumb.classList.add('has-image'); thumb.style.backgroundImage = `url("${imagem.replaceAll('"', '%22')}")`; } thumb.innerHTML = '<span>▣</span>';
      const info = document.createElement('div'); const nome = document.createElement('h3'); nome.textContent = produto.nome || 'Produto sem nome'; const meta = document.createElement('p'); meta.textContent = [produto.sku, produto.categoria].filter(Boolean).join(' • ') || 'Sem código ou categoria'; info.append(nome, meta); const pill = document.createElement('span'); pill.className = `status-pill ${estado.classe}`; pill.textContent = estado.texto; top.append(thumb, info, pill);
      const numbers = document.createElement('div'); numbers.className = 'inventory-numbers'; numbers.innerHTML = `<div><small>Disponível</small><strong>${qtd}</strong><span>unidades</span></div><div><small>Estoque mínimo</small><strong>${limite}</strong><span>unidades</span></div>`;
      const health = document.createElement('div'); health.className = `inventory-health ${estado.classe}`; health.innerHTML = `<div><span>Nível do estoque</span><b>${estado.texto}</b></div><div class="health-track"><span style="width:${percentual}%"></span></div>`;
      const controls = document.createElement('div'); controls.className = 'stock-controls'; const amount = document.createElement('input'); amount.type = 'number'; amount.min = '1'; amount.step = '1'; amount.value = '1'; amount.setAttribute('aria-label', `Quantidade para movimentar ${produto.nome}`); const entrada = document.createElement('button'); entrada.type = 'button'; entrada.className = 'stock-action entry'; entrada.textContent = '+ Entrada'; entrada.addEventListener('click', () => movimentar(index, 'entrada', amount)); const saida = document.createElement('button'); saida.type = 'button'; saida.className = 'stock-action exit'; saida.textContent = '− Saída'; saida.disabled = qtd <= 0; saida.addEventListener('click', () => movimentar(index, 'saida', amount)); controls.append(amount, entrada, saida);
      card.append(top, numbers, health, controls); lista.appendChild(card);
    });
  }
  porId('buscaEstoque').addEventListener('input', renderizar); porId('filtroStatus').addEventListener('change', renderizar); renderizar();
});
