'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('produtoForm');
  const lista = document.getElementById('listaProdutos');
  const dialog = document.getElementById('confirmDialog');
  const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  let indiceExclusao = null;

  const campo = (id) => document.getElementById(id);
  const refs = {
    nome: campo('nome'), categoria: campo('categoria'), sku: campo('sku'), descricao: campo('descricao'),
    preco: campo('preco'), quantidade: campo('quantidade'), estoqueMinimo: campo('estoqueMinimo'), imagem: campo('imagem')
  };

  let produtos;
  try {
    const dados = JSON.parse(localStorage.getItem('produtos'));
    produtos = Array.isArray(dados) ? dados : [];
  } catch {
    produtos = [];
  }

  const salvarProdutos = () => localStorage.setItem('produtos', JSON.stringify(produtos));
  const plural = (valor, singular, pluralText) => `${valor} ${valor === 1 ? singular : pluralText}`;
  const limiteEstoque = (produto) => produto.estoqueMinimo === 0 || produto.estoqueMinimo
    ? Math.max(0, Number(produto.estoqueMinimo) || 0)
    : 3;
  const statusProduto = (produto) => {
    const quantidade = Number(produto.quantidade) || 0;
    if (quantidade <= 0) return { classe: 'esgotado', texto: 'Esgotado' };
    if (quantidade <= limiteEstoque(produto)) return { classe: 'baixo', texto: 'Estoque baixo' };
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

  const criarThumb = (produto) => {
    const thumb = document.createElement('div');
    thumb.className = 'product-thumb';
    const imagem = urlImagemSegura(produto.imagem);
    if (imagem) {
      thumb.classList.add('has-image');
      thumb.style.backgroundImage = `url("${imagem.replaceAll('"', '%22')}")`;
    }
    const icone = document.createElement('span');
    icone.textContent = '▣';
    thumb.appendChild(icone);
    return thumb;
  };

  function renderizarProdutos() {
    lista.innerHTML = '';
    const termo = campo('buscaProduto').value.trim().toLocaleLowerCase('pt-BR');
    const filtro = campo('filtroEstoque').value;
    const encontrados = produtos.map((produto, index) => ({ produto, index })).filter(({ produto }) => {
      const busca = `${produto.nome || ''} ${produto.sku || ''} ${produto.categoria || ''}`.toLocaleLowerCase('pt-BR');
      const correspondeBusca = !termo || busca.includes(termo);
      const status = statusProduto(produto).classe;
      return correspondeBusca && (filtro === 'todos' || status === filtro);
    });

    campo('catalogCount').textContent = produtos.length;
    if (!encontrados.length) {
      const vazio = document.createElement('div');
      vazio.className = 'empty-state';
      vazio.innerHTML = produtos.length
        ? '<div class="empty-state-icon">⌕</div><strong>Nenhum produto encontrado</strong><p>Tente alterar a busca ou o filtro selecionado.</p>'
        : '<div class="empty-state-icon">▣</div><strong>Seu catálogo ainda está vazio</strong><p>Preencha o formulário acima para cadastrar o primeiro produto.</p>';
      lista.appendChild(vazio);
      return;
    }

    const head = document.createElement('div');
    head.className = 'product-list-head';
    head.innerHTML = '<span>Produto</span><span>Preço</span><span>Estoque</span><span>Status</span><span>Ações</span>';
    lista.appendChild(head);

    encontrados.forEach(({ produto, index }) => {
      const item = document.createElement('article');
      item.className = 'product-item';
      const principal = document.createElement('div');
      principal.className = 'product-main';
      const textos = document.createElement('p');
      const nome = document.createElement('strong');
      nome.textContent = produto.nome || 'Produto sem nome';
      const detalhe = document.createElement('small');
      detalhe.textContent = [produto.sku, produto.categoria].filter(Boolean).join(' • ') || 'Sem código ou categoria';
      textos.append(nome, detalhe);
      principal.append(criarThumb(produto), textos);

      const preco = document.createElement('span');
      preco.className = 'product-price';
      preco.textContent = moeda.format(Number(produto.preco) || 0);
      const estoque = document.createElement('span');
      estoque.className = 'stock-cell';
      estoque.textContent = plural(Number(produto.quantidade) || 0, 'unidade', 'unidades');
      const statusDados = statusProduto(produto);
      const status = document.createElement('span');
      status.className = `status-pill ${statusDados.classe}`;
      status.textContent = statusDados.texto;

      const acoes = document.createElement('div');
      acoes.className = 'product-actions';
      const editar = document.createElement('button');
      editar.type = 'button'; editar.className = 'icon-button'; editar.title = 'Editar produto'; editar.setAttribute('aria-label', `Editar ${produto.nome}`); editar.textContent = '✎';
      editar.addEventListener('click', () => iniciarEdicao(index));
      const excluir = document.createElement('button');
      excluir.type = 'button'; excluir.className = 'icon-button delete'; excluir.title = 'Excluir produto'; excluir.setAttribute('aria-label', `Excluir ${produto.nome}`); excluir.textContent = '×';
      excluir.addEventListener('click', () => solicitarExclusao(index));
      acoes.append(editar, excluir);
      item.append(principal, preco, estoque, status, acoes);
      lista.appendChild(item);
    });
  }

  function atualizarPreview() {
    campo('previewName').textContent = refs.nome.value.trim() || 'Nome do produto';
    campo('previewCategory').textContent = refs.categoria.value || 'Sem categoria';
    campo('previewDescription').textContent = refs.descricao.value.trim() || 'A prévia será atualizada enquanto você preenche o formulário.';
    campo('previewPrice').textContent = moeda.format(Number(refs.preco.value) || 0);
    campo('previewStock').textContent = `${Number(refs.quantidade.value) || 0} em estoque`;
    campo('descricaoCount').textContent = refs.descricao.value.length;
    const preview = campo('previewImage');
    const imagem = urlImagemSegura(refs.imagem.value);
    preview.classList.toggle('has-image', Boolean(imagem));
    preview.style.backgroundImage = imagem ? `url("${imagem.replaceAll('"', '%22')}")` : '';
  }

  function validarFormulario() {
    const validacoes = [
      [refs.nome, refs.nome.value.trim().length > 1],
      [refs.preco, refs.preco.value !== '' && Number(refs.preco.value) >= 0],
      [refs.quantidade, refs.quantidade.value !== '' && Number.isInteger(Number(refs.quantidade.value)) && Number(refs.quantidade.value) >= 0]
    ];
    validacoes.forEach(([input, valido]) => input.closest('.field').classList.toggle('invalid', !valido));
    const primeiroInvalido = validacoes.find(([, valido]) => !valido);
    if (primeiroInvalido) primeiroInvalido[0].focus();
    return !primeiroInvalido;
  }

  function limparFormulario() {
    form.reset();
    campo('editIndex').value = '';
    campo('formTitle').textContent = 'Cadastrar novo produto';
    campo('formSubtitle').textContent = 'Preencha os dados para incluir um item no catálogo.';
    campo('salvarProduto').innerHTML = '<span aria-hidden="true">✓</span> Salvar produto';
    campo('cancelarEdicao').classList.add('hidden');
    form.querySelectorAll('.invalid').forEach((elemento) => elemento.classList.remove('invalid'));
    atualizarPreview();
  }

  function iniciarEdicao(index) {
    const produto = produtos[index];
    refs.nome.value = produto.nome || '';
    refs.categoria.value = [...refs.categoria.options].some((option) => option.value === produto.categoria) ? produto.categoria : '';
    refs.sku.value = produto.sku || '';
    refs.descricao.value = produto.descricao || '';
    refs.preco.value = Number(produto.preco) || 0;
    refs.quantidade.value = Number(produto.quantidade) || 0;
    refs.estoqueMinimo.value = produto.estoqueMinimo ?? 3;
    refs.imagem.value = produto.imagem || '';
    campo('editIndex').value = index;
    campo('formTitle').textContent = 'Editar produto';
    campo('formSubtitle').textContent = 'Atualize as informações necessárias e salve as alterações.';
    campo('salvarProduto').innerHTML = '<span aria-hidden="true">✓</span> Salvar alterações';
    campo('cancelarEdicao').classList.remove('hidden');
    atualizarPreview();
    campo('novo-produto').scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => refs.nome.focus(), 350);
  }

  function solicitarExclusao(index) {
    indiceExclusao = index;
    campo('confirmText').textContent = `O produto “${produtos[index].nome}” será removido do catálogo e do estoque.`;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else if (window.confirm(campo('confirmText').textContent)) confirmarExclusao();
  }

  function confirmarExclusao() {
    if (indiceExclusao === null) return;
    const removido = produtos.splice(indiceExclusao, 1)[0];
    salvarProdutos();
    renderizarProdutos();
    if (dialog.open) dialog.close();
    indiceExclusao = null;
    mostrarToast('Produto excluído', `${removido.nome} foi removido do catálogo.`, true);
  }

  let toastTimer;
  function mostrarToast(titulo, texto, alerta = false) {
    const toast = campo('toast');
    toast.querySelector('strong').textContent = titulo;
    toast.querySelector('small').textContent = texto;
    toast.querySelector('span').textContent = alerta ? '!' : '✓';
    toast.querySelector('span').style.background = alerta ? '#e05260' : '';
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validarFormulario()) return;
    const indice = campo('editIndex').value;
    const produtoAnterior = indice === '' ? {} : produtos[Number(indice)];
    const produto = {
      ...produtoAnterior,
      nome: refs.nome.value.trim(), categoria: refs.categoria.value, sku: refs.sku.value.trim().toUpperCase(),
      descricao: refs.descricao.value.trim(), preco: Number(refs.preco.value), quantidade: Number(refs.quantidade.value),
      estoqueMinimo: refs.estoqueMinimo.value === '' ? 3 : Number(refs.estoqueMinimo.value), imagem: refs.imagem.value.trim(),
      criadoEm: produtoAnterior.criadoEm || new Date().toISOString(), atualizadoEm: new Date().toISOString()
    };
    if (indice === '') produtos.push(produto);
    else produtos[Number(indice)] = produto;
    salvarProdutos();
    renderizarProdutos();
    mostrarToast(indice === '' ? 'Produto cadastrado' : 'Produto atualizado', `${produto.nome} foi salvo com sucesso.`);
    limparFormulario();
  });

  Object.values(refs).forEach((input) => input.addEventListener('input', () => {
    input.closest('.field')?.classList.remove('invalid');
    atualizarPreview();
  }));
  refs.categoria.addEventListener('change', atualizarPreview);
  campo('buscaProduto').addEventListener('input', renderizarProdutos);
  campo('filtroEstoque').addEventListener('change', renderizarProdutos);
  campo('cancelarEdicao').addEventListener('click', limparFormulario);
  campo('cancelarExclusao').addEventListener('click', () => { indiceExclusao = null; dialog.close(); });
  campo('confirmarExclusao').addEventListener('click', confirmarExclusao);
  campo('focarFormulario').addEventListener('click', () => {
    limparFormulario();
    campo('novo-produto').scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => refs.nome.focus(), 350);
  });

  renderizarProdutos();
  atualizarPreview();
});
