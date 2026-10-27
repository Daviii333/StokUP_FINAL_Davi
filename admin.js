'use strict';

/* botão adicionar produto */
const botao = document.querySelector('.actions button');

botao.addEventListener('click', function () {
  window.location.href = "produtos.html";
});

/* puxar dados do localStorage */

const produtos = JSON.parse(localStorage.getItem('produtos')) || [];
const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
const financeiro = JSON.parse(localStorage.getItem('financeiro')) || [];

/* total de produtos */
document.getElementById('totalProdutos').textContent =
  `${produtos.length} cadastrados`;

/* total de estoque */
let totalEstoque = 0;

produtos.forEach(produto => {
  totalEstoque += parseInt(produto.quantidade);
});

document.getElementById('totalEstoque').textContent =
  `${totalEstoque} peças`;

/* total financeiro */
let totalFinanceiro = 0;

financeiro.forEach(item => {
  if (item.tipo === 'entrada') {
    totalFinanceiro += Number(item.valor);
  } else {
    totalFinanceiro -= Number(item.valor);
  }
});

document.getElementById('totalFinanceiro').textContent =
  `R$ ${totalFinanceiro.toFixed(2)}`;

/* total de pedidos */
document.getElementById('totalPedidos').textContent =
  `${pedidos.length} pedidos`;

  const reset = document.createElement('button');
reset.textContent = 'Resetar Sistema';
reset.style.marginTop = '20px';

reset.addEventListener('click', () => {
  if (confirm('Apagar TODOS os dados?')) {
    localStorage.clear();
    location.reload();
  }
});

document.body.appendChild(reset);