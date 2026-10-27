'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;

  const icons = {
    'Dashboard': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6v-9h-6v9Zm0-16v5h6V4h-6Z"/></svg>',
    'Produtos': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Zm0 2.3L7 8l5 2.8L17 8l-5-2.7Zm-6 4.4v5.6l5 2.8v-5.6L6 9.7Zm7 8.4 5-2.8V9.7l-5 2.8v5.6Z"/></svg>',
    'Estoque': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v4H4V4Zm1 6h14v10H5V10Zm5 3v2h4v-2h-4Z"/></svg>',
    'Financeiro': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 3v2.1c2.3.4 4 1.8 4 3.9h-2.4c0-1.1-1-1.8-2.6-1.8-1.5 0-2.5.6-2.5 1.6 0 .8.6 1.3 2.9 1.8 3.3.7 4.8 1.9 4.8 4.3 0 2.2-1.7 3.7-4.2 4.1v2h-2v-2c-2.8-.4-4.5-2-4.5-4.3h2.4c0 1.4 1.1 2.2 3.1 2.2 1.7 0 2.7-.7 2.7-1.8 0-.9-.7-1.5-2.9-2-3.2-.7-4.7-1.8-4.7-4.1 0-2.1 1.5-3.5 3.9-3.9V3h2Z"/></svg>',
    'Administração': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m19.4 13 .1-1-.1-1 2-1.5-2-3.4-2.4 1a8 8 0 0 0-1.7-1L15 3.5h-4L10.7 6c-.6.3-1.2.6-1.7 1L6.6 6l-2 3.4 2 1.5-.1 1 .1 1-2 1.5 2 3.4 2.4-1c.5.4 1.1.7 1.7 1l.3 2.5h4l.3-2.5c.6-.3 1.2-.6 1.7-1l2.4 1 2-3.4-2-1.5ZM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Z"/></svg>'
  };

  sidebar.querySelectorAll('nav a').forEach((link) => {
    const label = link.textContent.trim();
    link.dataset.label = label;
    link.title = label;
    link.insertAdjacentHTML('afterbegin', `<span class="nav-icon">${icons[label] || ''}</span><span class="nav-text">${label}</span>`);
    [...link.childNodes].filter((node) => node.nodeType === Node.TEXT_NODE).forEach((node) => node.remove());
  });

  const brand = sidebar.querySelector('.brand');
  if (brand) brand.insertAdjacentHTML('beforeend', '<span class="brand-monogram" aria-hidden="true">S</span>');

  const collapse = document.createElement('button');
  collapse.type = 'button';
  collapse.className = 'sidebar-toggle';
  collapse.innerHTML = '<span aria-hidden="true">‹</span>';
  sidebar.appendChild(collapse);

  const mobileButton = document.createElement('button');
  mobileButton.type = 'button';
  mobileButton.className = 'mobile-menu-button';
  mobileButton.setAttribute('aria-label', 'Abrir menu');
  mobileButton.setAttribute('aria-expanded', 'false');
  mobileButton.innerHTML = '<span></span><span></span><span></span>';
  document.body.appendChild(mobileButton);

  const overlay = document.createElement('button');
  overlay.type = 'button';
  overlay.className = 'menu-overlay';
  overlay.setAttribute('aria-label', 'Fechar menu');
  document.body.appendChild(overlay);

  const media = window.matchMedia('(max-width: 760px)');
  const aplicarPreferencia = () => {
    if (media.matches) document.body.classList.remove('sidebar-collapsed');
    else document.body.classList.toggle('sidebar-collapsed', localStorage.getItem('stokupMenuCollapsed') === 'true');
    const recolhido = document.body.classList.contains('sidebar-collapsed');
    collapse.setAttribute('aria-label', recolhido ? 'Expandir menu' : 'Recolher menu');
    collapse.title = recolhido ? 'Expandir menu' : 'Recolher menu';
  };
  const fecharMobile = () => {
    document.body.classList.remove('menu-open');
    mobileButton.setAttribute('aria-expanded', 'false');
    mobileButton.setAttribute('aria-label', 'Abrir menu');
  };

  collapse.addEventListener('click', () => {
    const recolhido = !document.body.classList.contains('sidebar-collapsed');
    document.body.classList.toggle('sidebar-collapsed', recolhido);
    localStorage.setItem('stokupMenuCollapsed', String(recolhido));
    aplicarPreferencia();
  });
  mobileButton.addEventListener('click', () => {
    const aberto = document.body.classList.toggle('menu-open');
    mobileButton.setAttribute('aria-expanded', String(aberto));
    mobileButton.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
  });
  overlay.addEventListener('click', fecharMobile);
  sidebar.querySelectorAll('nav a').forEach((link) => link.addEventListener('click', fecharMobile));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') fecharMobile(); });
  media.addEventListener('change', () => { fecharMobile(); aplicarPreferencia(); });
  aplicarPreferencia();
});
