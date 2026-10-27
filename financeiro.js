'use strict';

const form = document.getElementById('financeiroForm');
const lista = document.getElementById('listaFinanceira');

/* carregar movimentações salvas */
let financeiro = JSON.parse(localStorage.getItem('financeiro')) || [];

/* renderizar lista */
function renderizarFinanceiro() {
  lista.innerHTML = '';

  financeiro.forEach((item) => {
    const li = document.createElement('li');

    if (item.tipo === 'entrada') {
      li.textContent = `+ ${item.descricao} | R$ ${item.valor}`;
    } else {
      li.textContent = `- ${item.descricao} | R$ ${item.valor}`;
    }

    lista.appendChild(li);
  });
}

/* salvar */
function salvarFinanceiro() {
  localStorage.setItem('financeiro', JSON.stringify(financeiro));
}

/* atualizar resumo (cards) */
function atualizarResumo() {
  let entradas = 0;
  let saidas = 0;

  financeiro.forEach(item => {
    if (item.tipo === 'entrada') {
      entradas += Number(item.valor);
    } else {
      saidas += Number(item.valor);
    }
  });

  const lucro = entradas - saidas;

  document.getElementById('faturamento').textContent =
    `R$ ${entradas.toFixed(2)}`;

  document.getElementById('despesas').textContent =
    `R$ ${saidas.toFixed(2)}`;

  document.getElementById('lucro').textContent =
    `R$ ${lucro.toFixed(2)}`;
}

/* cadastrar movimentação */
form.addEventListener('submit', function (event) {
  event.preventDefault();

  const descricao = document.getElementById('descricao').value;
  const valor = document.getElementById('valor').value;
  const tipo = document.getElementById('tipo').value;

  const novaMovimentacao = {
    descricao,
    valor: Number(valor),
    tipo
  };

  financeiro.push(novaMovimentacao);

  salvarFinanceiro();
  renderizarFinanceiro();
  atualizarResumo(); // 👈 AQUI é o passo 4

  form.reset();
});

/* iniciar */
renderizarFinanceiro();
atualizarResumo();