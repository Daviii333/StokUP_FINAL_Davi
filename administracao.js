'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const porId = (id) => document.getElementById(id);
  const ler = (chave) => { try { const dados = JSON.parse(localStorage.getItem(chave)); return Array.isArray(dados) ? dados : []; } catch { return []; } };
  const produtos = ler('produtos'); const financeiro = ler('financeiro'); const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const unidades = produtos.reduce((soma, produto) => soma + Math.max(0, Number(produto.quantidade) || 0), 0);
  const saldo = financeiro.reduce((soma, item) => item.tipo === 'entrada' ? soma + (Number(item.valor) || 0) : soma - (Number(item.valor) || 0), 0);
  const bytes = new Blob([JSON.stringify({ produtos, financeiro })]).size;
  const plural = (valor, singular, pluralText) => `${valor} ${valor === 1 ? singular : pluralText}`;
  porId('admProdutos').textContent = produtos.length; porId('admUnidades').textContent = plural(unidades, 'unidade no estoque', 'unidades no estoque'); porId('admFinanceiro').textContent = financeiro.length; porId('admSaldo').textContent = `Saldo de ${moeda.format(saldo)}`; porId('admStorage').textContent = `${(bytes / 1024).toFixed(1).replace('.', ',')} KB`; porId('dataProdutos').textContent = plural(produtos.length, 'registro', 'registros'); porId('dataFinanceiro').textContent = plural(financeiro.length, 'registro', 'registros');
  let toastTimer;
  function toast(titulo, texto) { const el = porId('toastAdmin'); el.querySelector('strong').textContent = titulo; el.querySelector('small').textContent = texto; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 3200); }
  function exportar() {
    const backup = { aplicativo: 'StokUP', versao: 1, exportadoEm: new Date().toISOString(), produtos, financeiro };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `stokup-backup-${new Date().toISOString().slice(0, 10)}.json`; document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    porId('ultimoBackup').textContent = `Último backup: ${new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date())}`; toast('Backup exportado', 'O arquivo JSON foi baixado com sucesso.');
  }
  const dialog = porId('dialogLimpar'); const check = porId('confirmacaoLimpeza'); const confirmar = porId('confirmarLimpeza');
  porId('exportarDados').addEventListener('click', exportar); porId('exportarDadosCard').addEventListener('click', exportar);
  porId('limpar').addEventListener('click', () => { check.checked = false; confirmar.disabled = true; dialog.showModal(); });
  check.addEventListener('change', () => { confirmar.disabled = !check.checked; });
  porId('cancelarLimpeza').addEventListener('click', () => dialog.close());
  confirmar.addEventListener('click', () => { localStorage.removeItem('produtos'); localStorage.removeItem('financeiro'); dialog.close(); location.reload(); });
});
