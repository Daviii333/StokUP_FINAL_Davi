'use strict';

document.addEventListener('DOMContentLoaded', function () {

  const form = document.getElementById('produtoForm');
  const lista = document.getElementById('listaProdutos');

  let produtos = JSON.parse(localStorage.getItem('produtos')) || [];

  function salvarProdutos() {
    localStorage.setItem('produtos', JSON.stringify(produtos));
  }

  function renderizarProdutos() {
    lista.innerHTML = '';

    produtos.forEach((produto, index) => {
      const li = document.createElement('li');

      li.innerHTML = `
        ${produto.nome} | R$ ${produto.preco.toFixed(2)} | Qtd: ${produto.quantidade}
        <button onclick="editar(${index})">✏️</button>
        <button onclick="excluir(${index})">❌</button>
      `;

      lista.appendChild(li);
    });
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const nome = document.getElementById('nome').value;
    const preco = document.getElementById('preco').value;
    const quantidade = document.getElementById('quantidade').value;
    const imagem = document.getElementById('imagem').value;
    const descricao = document.getElementById('descricao').value;

    const novoProduto = {
      nome,
      preco: Number(preco),
      quantidade: Number(quantidade),
      imagem,
      descricao
    };

    produtos.push(novoProduto);

    salvarProdutos();
    renderizarProdutos();

    form.reset();
  });

  // 🔥 deixar funções globais
  window.excluir = function (index) {
    if (confirm('Deseja excluir este produto?')) {
      produtos.splice(index, 1);
      salvarProdutos();
      renderizarProdutos();
    }
  };

  window.editar = function (index) {
    const produto = produtos[index];

    const novoNome = prompt('Novo nome:', produto.nome);
    const novoPreco = prompt('Novo preço:', produto.preco);
    const novaQtd = prompt('Nova quantidade:', produto.quantidade);

    if (novoNome && novoPreco && novaQtd) {
      produtos[index] = {
        ...produto,
        nome: novoNome,
        preco: Number(novoPreco),
        quantidade: Number(novaQtd)
      };

      salvarProdutos();
      renderizarProdutos();
    }
  };

  renderizarProdutos();
});