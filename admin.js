'use strict';

const lerDados = (chave) => {
  try {
    const dados = JSON.parse(localStorage.getItem(chave));
    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
};

const produtos = lerDados('produtos');
const financeiro = lerDados('financeiro');
const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const plural = (valor, singular, pluralText) => `${valor} ${valor === 1 ? singular : pluralText}`;

const dataAtual = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
}).format(new Date());
document.getElementById('dataAtual').textContent = dataAtual.charAt(0).toUpperCase() + dataAtual.slice(1);

const totalEstoque = produtos.reduce((total, produto) => total + Math.max(0, Number(produto.quantidade) || 0), 0);
const valorEstoque = produtos.reduce((total, produto) => {
  return total + (Math.max(0, Number(produto.quantidade) || 0) * Math.max(0, Number(produto.preco) || 0));
}, 0);
const saldo = financeiro.reduce((total, item) => {
  const valor = Number(item.valor) || 0;
  return item.tipo === 'entrada' ? total + valor : total - valor;
}, 0);

const estoqueMinimo = (produto) => produto.estoqueMinimo === 0 || produto.estoqueMinimo
  ? Math.max(0, Number(produto.estoqueMinimo) || 0)
  : 3;
const saudaveis = produtos.filter((produto) => Number(produto.quantidade) > estoqueMinimo(produto)).length;
const baixos = produtos.filter((produto) => Number(produto.quantidade) > 0 && Number(produto.quantidade) <= estoqueMinimo(produto)).length;
const esgotados = produtos.filter((produto) => Number(produto.quantidade) <= 0).length;
const percentualSaudavel = produtos.length ? Math.round((saudaveis / produtos.length) * 100) : 0;
const percentualBaixo = produtos.length ? Math.round((baixos / produtos.length) * 100) : 0;

document.getElementById('totalProdutos').textContent = produtos.length;
document.getElementById('totalEstoque').textContent = totalEstoque;
document.getElementById('valorEstoque').textContent = moeda.format(valorEstoque);
document.getElementById('totalFinanceiro').textContent = moeda.format(saldo);
document.getElementById('produtosDetail').textContent = produtos.length
  ? `${plural(produtos.length, 'item ativo', 'itens ativos')} no catálogo`
  : 'Comece adicionando seu primeiro item';
document.getElementById('estoqueDetail').textContent = totalEstoque
  ? `${plural(esgotados + baixos, 'produto precisa', 'produtos precisam')} de atenção`
  : 'Nenhum item monitorado';
document.getElementById('financeiroDetail').textContent = financeiro.length
  ? plural(financeiro.length, 'movimentação registrada', 'movimentações registradas')
  : 'Sem movimentações registradas';

document.getElementById('estoqueSaudavel').textContent = plural(saudaveis, 'produto', 'produtos');
document.getElementById('estoqueBaixo').textContent = plural(baixos, 'produto', 'produtos');
document.getElementById('estoqueEsgotado').textContent = plural(esgotados, 'produto', 'produtos');
document.getElementById('percentualSaudavel').textContent = `${percentualSaudavel}%`;
const donut = document.getElementById('stockDonut');
donut.style.setProperty('--available', percentualSaudavel);
donut.style.setProperty('--low', percentualBaixo);
donut.classList.toggle('empty', produtos.length === 0);
donut.setAttribute('aria-label', `${percentualSaudavel}% do catálogo com estoque saudável`);

const alerta = document.getElementById('stockAlert');
if (baixos + esgotados > 0) {
  alerta.classList.add('warning');
  alerta.querySelector('span').textContent = '!';
  alerta.querySelector('strong').textContent = 'Existem produtos que precisam de atenção';
  alerta.querySelector('small').textContent = `${plural(baixos + esgotados, 'item está', 'itens estão')} com estoque baixo ou esgotado.`;
}

const statusProduto = (produto) => {
  const quantidade = Number(produto.quantidade) || 0;
  const minimo = estoqueMinimo(produto);
  if (quantidade <= 0) return { classe: 'esgotado', texto: 'Esgotado' };
  if (quantidade <= minimo) return { classe: 'baixo', texto: 'Estoque baixo' };
  return { classe: 'normal', texto: 'Em estoque' };
};

const urlImagemSegura = (valor) => {
  try {
    const url = new URL(valor);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
};

const listaRecentes = document.getElementById('produtosRecentes');
if (!produtos.length) {
  listaRecentes.innerHTML = '<div class="empty-state"><div class="empty-state-icon">▣</div><strong>Seu catálogo ainda está vazio</strong><p>Cadastre o primeiro produto para acompanhar tudo por aqui.</p><a class="primary-button" href="produtos.html#novo-produto">Cadastrar produto</a></div>';
} else {
  const cabecalho = document.createElement('div');
  cabecalho.className = 'recent-row header';
  cabecalho.innerHTML = '<span>Produto</span><span>Preço</span><span>Quantidade</span><span>Status</span>';
  listaRecentes.appendChild(cabecalho);

  produtos.slice(-5).reverse().forEach((produto) => {
    const linha = document.createElement('div');
    linha.className = 'recent-row';

    const info = document.createElement('div');
    info.className = 'recent-product-info';
    const imagem = urlImagemSegura(produto.imagem);
    const thumb = imagem ? document.createElement('img') : document.createElement('span');
    thumb.className = 'recent-thumb';
    if (imagem) {
      thumb.src = imagem;
      thumb.alt = '';
    } else {
      thumb.textContent = '▣';
    }
    const textos = document.createElement('p');
    const nome = document.createElement('strong');
    nome.textContent = produto.nome || 'Produto sem nome';
    const detalhe = document.createElement('small');
    detalhe.textContent = produto.sku || produto.categoria || 'Sem código';
    textos.append(nome, detalhe);
    info.append(thumb, textos);

    const preco = document.createElement('span');
    preco.textContent = moeda.format(Number(produto.preco) || 0);
    const quantidade = document.createElement('span');
    quantidade.textContent = plural(Number(produto.quantidade) || 0, 'unidade', 'unidades');
    const status = statusProduto(produto);
    const pill = document.createElement('span');
    pill.className = `status-pill ${status.classe}`;
    pill.textContent = status.texto;
    linha.append(info, preco, quantidade, pill);
    listaRecentes.appendChild(linha);
  });
}
