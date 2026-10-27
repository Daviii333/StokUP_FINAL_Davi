'use strict';

const lista = document.getElementById('estoqueLista');

/* pegar produtos do localStorage */
let produtos = JSON.parse(localStorage.getItem('produtos')) || [];

/* renderizar estoque */
function renderizarEstoque() {
  lista.innerHTML = '';

  produtos.forEach((produto, index) => {
    const div = document.createElement('div');
    div.classList.add('produto-card');

    let statusClasse = 'em-estoque';
    let statusTexto = 'Em estoque';

    if (produto.quantidade <= 0) {
      statusClasse = 'esgotado';
      statusTexto = 'Esgotado';
    } else if (produto.quantidade <= 3) {
      statusClasse = 'estoque-baixo';
      statusTexto = 'Estoque baixo';
    }

    div.innerHTML = `
      <h3>${produto.nome}</h3>
      <p>Quantidade: <span class="quantidade">${produto.quantidade}</span></p>
      <p class="status ${statusClasse}">${statusTexto}</p>

      <div class="acoes">
        <button onclick="adicionar(${index})">+ Entrada</button>
        <button onclick="remover(${index})">- Saída</button>
      </div>
    `;

    lista.appendChild(div);
  });
}

/* salvar */
function salvar() {
  localStorage.setItem('produtos', JSON.stringify(produtos));
}

/* adicionar estoque */
function adicionar(index) {
  produtos[index].quantidade++;
  salvar();
  renderizarEstoque();
}

/* remover estoque */
function remover(index) {
  if (produtos[index].quantidade > 0) {
    produtos[index].quantidade--;
    salvar();
    renderizarEstoque();
  }
}
 window.adicionar = adicionar;
window.remover = remover;

document.addEventListener('DOMContentLoaded', function () {
  renderizarEstoque();
});

