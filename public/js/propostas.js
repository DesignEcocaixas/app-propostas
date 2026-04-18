let paginaAtual = 1;

// ==========================================
// HELPERS DE MODAL (TAILWIND PURO)
// ==========================================
function abrirModal(id) {
    const m = document.getElementById(id);
    const c = m.querySelector('.modal-panel');
    m.classList.remove('hidden');
    setTimeout(() => {
        m.classList.remove('opacity-0');
        if(c) c.classList.remove('scale-95');
    }, 10);
}

function fecharModal(id) {
    const m = document.getElementById(id);
    const c = m.querySelector('.modal-panel');
    m.classList.add('opacity-0');
    if(c) c.classList.add('scale-95');
    setTimeout(() => { m.classList.add('hidden'); }, 300);
}

// ==========================================
// MODIFICAÇÕES
// ==========================================
function abrirNovaModificacao() {
  const lista = document.getElementById('listaModificacoes');
  const tempId = Date.now();
  lista.insertAdjacentHTML('beforeend', renderModificacaoEditavel({ id: tempId, descricao: '', data: '', modoEdicao: true }));
}

function renderModificacaoEditavel({ id, descricao, data, modoEdicao }) {
  return `
    <div class="card bg-gray-900/50 rounded-lg p-2 mb-2 border border-gray-700 flex flex-col sm:flex-row gap-2 items-center" data-id="${id}">
        <div class="flex-grow w-full">
            ${modoEdicao 
                ? `<input type="text" class="w-full bg-gray-800 border border-gray-600 rounded px-3 py-1.5 text-sm text-white focus:border-brand outline-none" value="${descricao}" placeholder="Descrição da alteração...">` 
                : `<strong class="text-sm text-gray-200 font-medium pl-1">${descricao}</strong>`
            }
        </div>
        <div class="w-full sm:w-36 shrink-0">
            ${modoEdicao 
                ? `<input type="date" class="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-white focus:border-brand outline-none" value="${data || dataHoje()}">` 
                : `<span class="text-xs font-bold text-gray-400 bg-gray-800 px-2 py-1 rounded border border-gray-700"><i class="fa-regular fa-calendar mr-1"></i>${formatarData(data)}</span>`
            }
        </div>
        <div class="flex gap-1 shrink-0 w-full sm:w-auto justify-end">
            ${modoEdicao
                ? `<button type="button" class="bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-white w-8 h-8 rounded flex items-center justify-center transition-colors" onclick="salvarModificacaoInline(this)"><i class="fa fa-check"></i></button>`
                : `<button type="button" class="bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white w-8 h-8 rounded flex items-center justify-center transition-colors" onclick="editarModificacaoInline(this)"><i class="fa fa-pen"></i></button>`
            }
            <button type="button" class="bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white w-8 h-8 rounded flex items-center justify-center transition-colors" onclick="excluirModificacaoInline(this)"><i class="fa fa-trash"></i></button>
        </div>
    </div>
  `;
}

function salvarModificacaoInline(btn) {
  const card = btn.closest('.card');
  const id = card.dataset.id;
  const descricao = card.querySelector('input[type="text"]').value;
  const data = card.querySelector('input[type="date"]').value;

  if (!descricao || !data) { alert('Preencha descrição e data'); return; }
  card.outerHTML = renderModificacaoEditavel({ id, descricao, data, modoEdicao: false });
}

function editarModificacaoInline(btn) {
  const card = btn.closest('.card');
  const id = card.dataset.id;
  const descricao = card.querySelector('strong').innerText;
  const dataTexto = card.querySelector('span').innerText;
  const [dia, mes, ano] = dataTexto.split('/');

  card.outerHTML = renderModificacaoEditavel({
    id, descricao, data: `${ano}-${mes}-${dia}`, modoEdicao: true
  });
}

function excluirModificacaoInline(btn) {
  if (!confirm('Deseja excluir esta modificação?')) return;
  btn.closest('.card').remove();
}

// ==========================================
// UTILITÁRIOS
// ==========================================
function formatarData(data) {
  if (!data) return '';
  const limpa = data.split('T')[0];
  const [ano, mes, dia] = limpa.split('-');
  return `${dia}/${mes}/${ano}`;
}

function dataHoje() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

// ==========================================
// BADGES E CÁLCULOS DE DATA
// ==========================================
function atualizarBadgeTailwind(badge, texto, isSuccess) {
    badge.innerText = texto;
    badge.className = isSuccess 
        ? "bg-green-500/20 text-green-400 px-3 py-2 rounded-lg text-xs font-bold block text-center border border-green-500/20"
        : "bg-red-500/20 text-red-400 px-3 py-2 rounded-lg text-xs font-bold block text-center border border-red-500/20";
}

function calcularDuracao() {
  const inicio = document.getElementById('dataInicio').value;
  const fim = document.getElementById('dataFim').value;
  const badge = document.getElementById('duracaoBadge');

  if (!badge) return;
  badge.className = 'bg-gray-700 text-gray-400 px-3 py-2 rounded-lg text-xs font-bold block text-center border border-gray-600';
  badge.innerText = '—';

  if (!inicio || !fim) return;
  const diffMs = new Date(fim) - new Date(inicio);
  const dias = Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1;

  atualizarBadgeTailwind(badge, `${dias} dia${dias > 1 ? 's' : ''}`, dias <= 2);
}

function calcularPrazoCliche() {
  const solicitacao = document.getElementById('dataSolicitacaoCliche')?.value;
  const chegada = document.getElementById('dataChegadaCliche')?.value;
  const badge = document.getElementById('prazoClicheBadge');

  if (!badge) return;
  badge.className = 'bg-gray-700 text-gray-400 px-3 py-2 rounded-lg text-xs font-bold block text-center border border-gray-600';
  badge.innerText = '—';

  if (!solicitacao || !chegada) return;
  const diffMs = new Date(chegada) - new Date(solicitacao);
  const dias = Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1;

  atualizarBadgeTailwind(badge, `${dias} dia${dias > 1 ? 's' : ''}`, dias <= 2);
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('dataInicio')?.addEventListener('change', calcularDuracao);
  document.getElementById('dataFim')?.addEventListener('change', calcularDuracao);
  document.getElementById('dataSolicitacaoCliche')?.addEventListener('change', calcularPrazoCliche);
  document.getElementById('dataChegadaCliche')?.addEventListener('change', calcularPrazoCliche);
  buscarPropostas();
});

// ==========================================
// CRUD PROPOSTAS
// ==========================================
async function salvarProposta() {
  const id = document.getElementById('propostaId').value;
  const payload = {
    cliente: document.getElementById('cliente').value,
    designer: document.getElementById('designer').value || null,
    data_inicio: document.getElementById('dataInicio').value,
    data_fim: document.getElementById('dataFim').value,
    observacao: document.getElementById('observacao').value,
    data_solicitacao_cliche: document.getElementById('dataSolicitacaoCliche').value || null,
    data_chegada_cliche: document.getElementById('dataChegadaCliche').value || null,
    modificacoes: coletarModificacoes()
  };

  const url = id ? `/propostas/${id}` : '/propostas';
  const res = await fetch(url, {
    method: id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const result = await res.json();
  if (!result.success) { alert('Erro ao salvar proposta'); return; }

  fecharModal('modalProposta');
  buscarPropostas(paginaAtual);
  mostrarSucesso('Proposta salva com sucesso!');
}

async function buscarPropostas(page = 1) {
  paginaAtual = page;
  const cliente = document.getElementById('filtroCliente')?.value || '';
  const inicio = document.getElementById('filtroInicio')?.value || '';
  const fim = document.getElementById('filtroFim')?.value || '';

  mostrarLoadingPropostas();

  try {
    const res = await fetch(`/propostas?cliente=${encodeURIComponent(cliente)}&data_inicio=${inicio}&data_fim=${fim}&page=${page}`);
    const json = await res.json();
    const data = Array.isArray(json.data) ? json.data : [];
    
    const lista = document.getElementById('listaPropostas');
    lista.innerHTML = '';

    if (data.length === 0) {
      lista.innerHTML = `<div class="col-span-full text-center py-10 bg-gray-900/50 rounded-xl border border-dashed border-gray-700 text-gray-400">Nenhuma proposta encontrada.</div>`;
      renderizarPaginacao(null);
      return;
    }

    data.forEach(p => {
      // Calcula os dias para o badge do Card
      let diasStr = '—';
      let badgeClass = 'bg-gray-700 text-gray-300';
      if (p.data_inicio && p.data_fim) {
          const d1 = new Date(p.data_inicio);
          const d2 = new Date(p.data_fim);
          const dias = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
          diasStr = `${dias} dia${dias > 1 ? 's' : ''}`;
          badgeClass = dias <= 2 ? 'bg-green-500/20 text-green-400 border border-green-500/20' : 'bg-red-500/20 text-red-400 border border-red-500/20';
      }

      // Card clicável com hover e badges dinâmicos
      lista.innerHTML += `
        <div class="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-brand/50 hover:bg-gray-800/80 transition-all shadow-lg flex flex-col h-full cursor-pointer group" onclick="editarProposta(${p.id})">
           <div class="flex justify-between items-start mb-2 gap-2">
               <h5 class="font-black text-white text-base truncate w-full" title="${p.cliente}">${p.cliente}</h5>
               <div class="flex gap-1.5 shrink-0">
                   <span class="${badgeClass} text-[10px] px-2 py-0.5 rounded font-bold whitespace-nowrap shadow-sm">${diasStr}</span>
                   <span class="bg-gradient-to-r from-blue-600 to-pink-500 text-white text-[10px] px-2 py-0.5 rounded font-bold whitespace-nowrap shadow-sm">${p.total_modificacoes || 0} mod</span>
               </div>
           </div>
           
           <div class="text-[11px] font-bold text-gray-400 mb-2 flex items-center bg-gray-900 px-2 py-1.5 rounded border border-gray-700/50">
               <i class="fa-regular fa-calendar text-brand mr-1.5"></i> ${formatarData(p.data_inicio)} <i class="fa-solid fa-arrow-right mx-1.5 text-gray-600"></i> ${formatarData(p.data_fim)}
           </div>
           
           <div class="flex-grow">
               <p class="text-xs text-gray-400 line-clamp-2 mt-1 leading-relaxed">${p.observacao || '<span class="italic opacity-50">Sem observações detalhadas</span>'}</p>
           </div>
        </div>
      `;
    });

    renderizarPaginacao(json.pagination || null);

  } catch (err) {
    document.getElementById('listaPropostas').innerHTML = `<div class="col-span-full text-center text-red-400">Erro ao carregar propostas</div>`;
  } finally {
    esconderLoadingPropostas();
  }
}

function excluirProposta(id) {
  mostrarConfirmacao('Deseja realmente excluir esta proposta permanentemente?', async () => {
      try {
        const res = await fetch(`/propostas/${id}`, { method: 'DELETE' });
        const result = await res.json();
        if (!result.success) { mostrarSucesso('Erro ao excluir proposta.'); return; }
        
        fecharModal('modalProposta'); // Fecha o modal após excluir
        buscarPropostas(paginaAtual);
        mostrarSucesso('Proposta excluída com sucesso!');
      } catch (err) { mostrarSucesso('Erro ao excluir proposta.'); }
  });
}

async function editarProposta(id) {
  try {
    const res = await fetch(`/propostas/${id}`);
    const data = await res.json();
    if (!data.proposta) { alert('Proposta não encontrada'); return; }

    const { proposta, modificacoes } = data;
    document.getElementById('propostaId').value = proposta.id;
    document.getElementById('cliente').value = proposta.cliente || '';
    document.getElementById('designer').value = proposta.designer || '';
    document.getElementById('dataInicio').value = proposta.data_inicio?.split('T')[0] || '';
    document.getElementById('dataFim').value = proposta.data_fim?.split('T')[0] || '';
    document.getElementById('observacao').value = proposta.observacao || '';
    document.getElementById('dataSolicitacaoCliche').value = proposta.data_solicitacao_cliche?.split('T')[0] || '';
    document.getElementById('dataChegadaCliche').value = proposta.data_chegada_cliche?.split('T')[0] || '';

    calcularDuracao();
    calcularPrazoCliche();

    const lista = document.getElementById('listaModificacoes');
    lista.innerHTML = '';
    modificacoes.forEach(m => {
      lista.insertAdjacentHTML('beforeend', renderModificacaoEditavel({
        id: m.id, descricao: m.descricao, data: m.data_modificacao?.split('T')[0], modoEdicao: false
      }));
    });

    // Exibe e configura o botão de excluir
    const btnExcluir = document.getElementById('btnExcluirModal');
    btnExcluir.classList.remove('hidden');
    btnExcluir.setAttribute('onclick', `excluirProposta(${id})`);

    abrirModal('modalProposta');

  } catch (err) { alert('Erro ao carregar proposta'); }
}

function coletarModificacoes() {
  const cards = document.querySelectorAll('#listaModificacoes .card');
  const modificacoes = [];
  cards.forEach(card => {
    const descricao = card.querySelector('input[type="text"]')?.value || card.querySelector('strong')?.innerText;
    let data = card.querySelector('input[type="date"]')?.value || card.querySelector('span.text-xs')?.innerText;
    if (!descricao || !data) return;
    if (data.includes('/')) {
      const parts = data.replace(/[^0-9/]/g, '').split('/');
      data = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    modificacoes.push({ descricao, data_modificacao: data });
  });
  return modificacoes;
}

function limparModalProposta() {
  document.getElementById('propostaId').value = '';
  document.getElementById('cliente').value = '';
  document.getElementById('dataInicio').value = '';
  document.getElementById('dataFim').value = '';
  document.getElementById('observacao').value = '';
  document.getElementById('dataSolicitacaoCliche').value = '';
  document.getElementById('dataChegadaCliche').value = '';
  document.getElementById('listaModificacoes').innerHTML = '';

  // Esconde o botão de excluir, já que é uma nova proposta
  document.getElementById('btnExcluirModal').classList.add('hidden');

  const b1 = document.getElementById('duracaoBadge');
  if (b1) { b1.className = 'bg-gray-700 text-gray-400 px-3 py-2 rounded-lg text-xs font-bold block text-center border border-gray-600'; b1.innerText = '—'; }
  const b2 = document.getElementById('prazoClicheBadge');
  if (b2) { b2.className = 'bg-gray-700 text-gray-400 px-3 py-2 rounded-lg text-xs font-bold block text-center border border-gray-600'; b2.innerText = '—'; }
}

// ==========================================
// AVISOS E PAGINAÇÃO
// ==========================================
function mostrarSucesso(mensagem) {
  document.getElementById('mensagemSucesso').innerText = mensagem;
  abrirModal('modalSucesso');
}

function mostrarConfirmacao(mensagem, onConfirmar) {
  document.getElementById('mensagemConfirmacao').innerText = mensagem;
  const btn = document.getElementById('btnConfirmarAcao');
  const novoBtn = btn.cloneNode(true);
  btn.parentNode.replaceChild(novoBtn, btn);

  novoBtn.addEventListener('click', () => {
    fecharModal('modalConfirmacao');
    onConfirmar();
  });
  abrirModal('modalConfirmacao');
}

function mostrarLoadingPropostas() {
  document.getElementById('loadingPropostas')?.classList.remove('hidden');
  document.getElementById('listaPropostas')?.classList.add('hidden');
}

function esconderLoadingPropostas() {
  document.getElementById('loadingPropostas')?.classList.add('hidden');
  document.getElementById('listaPropostas')?.classList.remove('hidden');
}

function renderizarPaginacao(pagination) {
  const ul = document.getElementById('paginacaoPropostas');
  ul.innerHTML = '';
  if (!pagination || pagination.totalPages <= 1) return;
  const { page, totalPages } = pagination;

  ul.innerHTML += `
    <li><a href="#" onclick="buscarPropostas(${page - 1})" class="w-8 h-8 flex items-center justify-center rounded bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors ${page === 1 ? 'pointer-events-none opacity-50' : ''}"><i class="fa-solid fa-chevron-left text-xs"></i></a></li>
  `;

  for (let i = 1; i <= totalPages; i++) {
    ul.innerHTML += `
      <li><a href="#" onclick="buscarPropostas(${i})" class="w-8 h-8 flex items-center justify-center rounded text-sm font-bold transition-colors ${i === page ? 'bg-brand text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}">${i}</a></li>
    `;
  }

  ul.innerHTML += `
    <li><a href="#" onclick="buscarPropostas(${page + 1})" class="w-8 h-8 flex items-center justify-center rounded bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors ${page === totalPages ? 'pointer-events-none opacity-50' : ''}"><i class="fa-solid fa-chevron-right text-xs"></i></a></li>
  `;
}