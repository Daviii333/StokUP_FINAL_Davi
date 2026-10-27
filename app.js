'use strict';

/* LOGO ADMIN */

const logo =
  document.querySelector('.logo');

let cliques = 0;

if (logo) {

  logo.addEventListener('click', () => {

    cliques++;

    if (cliques >= 5) {

      window.location.href =
        'login.html';

    }

    setTimeout(() => {

      cliques = 0;

    }, 2000);

  });

}

/* CARRINHO */

const abrirCarrinho =
  document.getElementById('abrirCarrinho');

const carrinhoLateral =
  document.getElementById('carrinhoLateral');

if (abrirCarrinho && carrinhoLateral) {

  abrirCarrinho.addEventListener('click', () => {

    carrinhoLateral.classList.toggle('aberto');

  });

}

/* LOADING */

window.addEventListener('load', () => {

  const loading =
    document.getElementById('loading');

  setTimeout(() => {

    loading.style.opacity = '0';

    setTimeout(() => {

      loading.style.display = 'none';

    }, 500);

  }, 1200);

});