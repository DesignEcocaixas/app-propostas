let paginaAtual = 1;

function abrirNovaModificacao() {
  const lista = document.getElementById('listaModificacoes');
  const tempId = Date.now();

  lista.insertAdjacentHTML('beforeend', renderModificacaoEditavel({
    id: tempId,
    descricao: '',
    data: '',
    modoEdicao: true
  }));
}

function renderModificacaoEditavel({ id, descricao, data, modoEdicao }) {
  return `
    <div class="card mb-2" data-id="${id}">
      <div class="card-body p-2">
        <div class="row g-2 align-items-center">

          <div class="col-md-5">
            ${modoEdicao
      ? `<input type="text" class="form-control" value="${descricao}" placeholder="Descrição">`
      : `<strong>${descricao}</strong>`
    }
          </div>

          <div class="col-md-4">
            ${modoEdicao
      ? `<input type="date" class="form-control" value="${data || dataHoje()}">`
      : `<span class="text-muted">${formatarData(data)}</span>`
    }
          </div>

          <div class="col-md-3 d-flex gap-2 justify-content-end">
            ${modoEdicao
      ? `
                  <button class="btn btn-sm btn-outline-success"
                    onclick="salvarModificacaoInline(this)">
                    <i class="fa fa-check"></i>
                  </button>
                `
      : `
                  <button class="btn btn-sm btn-outline-primary"
                    onclick="editarModificacaoInline(this)">
                    <i class="fa fa-pen"></i>
                  </button>
                `
    }

            <button class="btn btn-sm btn-outline-danger"
              onclick="excluirModificacaoInline(this)">
              <i class="fa fa-trash"></i>
            </button>
          </div>

        </div>
      </div>
    </div>
  `;
}


function salvarModificacaoInline(btn) {
  const card = btn.closest('.card');
  const id = card.dataset.id;

  const descricao = card.querySelector('input[type="text"]').value;
  const data = card.querySelector('input[type="date"]').value;

  if (!descricao || !data) {
    alert('Preencha descrição e data');
    return;
  }

  card.outerHTML = renderModificacaoEditavel({
    id,
    descricao,
    data,
    modoEdicao: false
  });
}

function editarModificacaoInline(btn) {
  const card = btn.closest('.card');
  const id = card.dataset.id;

  const descricao = card.querySelector('strong').innerText;
  const dataTexto = card.querySelector('span').innerText;
  const [dia, mes, ano] = dataTexto.split('/');

  card.outerHTML = renderModificacaoEditavel({
    id,
    descricao,
    data: `${ano}-${mes}-${dia}`, // volta pro formato input
    modoEdicao: true
  });
}

function excluirModificacaoInline(btn) {
  if (!confirm('Deseja excluir esta modificação?')) return;
  btn.closest('.card').remove();
}

function formatarData(data) {
  if (!data) return '';

  // remove parte de hora se vier do MySQL
  const limpa = data.split('T')[0]; // YYYY-MM-DD
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

function calcularDuracao() {
  const inicio = document.getElementById('dataInicio').value;
  const fim = document.getElementById('dataFim').value;
  const badge = document.getElementById('duracaoBadge');

  // reset
  badge.className = 'badge bg-secondary';
  badge.innerText = '—';

  if (!inicio || !fim) return;

  const dataInicio = new Date(inicio);
  const dataFim = new Date(fim);

  const diffMs = dataFim - dataInicio;
  const dias = Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1;

  badge.innerText = `${dias} dia${dias > 1 ? 's' : ''}`;

  if (dias <= 2) {
    badge.className = 'badge bg-success';
  } else {
    badge.className = 'badge bg-danger';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const dataInicio = document.getElementById('dataInicio');
  const dataFim = document.getElementById('dataFim');

  if (dataInicio && dataFim) {
    dataInicio.addEventListener('change', calcularDuracao);
    dataFim.addEventListener('change', calcularDuracao);
  }
});

async function salvarProposta() {
  const id = document.getElementById('propostaId').value;

  const payload = {
    cliente: document.getElementById('cliente').value,
    designer: document.getElementById('designer').value || null,
    data_inicio: document.getElementById('dataInicio').value,
    data_fim: document.getElementById('dataFim').value,
    observacao: document.getElementById('observacao').value,

    data_solicitacao_cliche:
      document.getElementById('dataSolicitacaoCliche').value || null,

    data_chegada_cliche:
      document.getElementById('dataChegadaCliche').value || null,

    // 🔥 ESTE CAMPO É O QUE ESTAVA FALTANDO
    modificacoes: coletarModificacoes()
  };

  const metodo = id ? 'PUT' : 'POST';
  const url = id ? `/propostas/${id}` : '/propostas';

  const res = await fetch(url, {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const result = await res.json();

  if (!result.success) {
    alert('Erro ao salvar proposta');
    return;
  }

  bootstrap.Modal.getInstance(
    document.getElementById('modalProposta')
  ).hide();

  buscarPropostas();
  mostrarSucesso('Proposta salva com sucesso!');
}



function calcularPrazoCliche() {
  const solicitacao = document.getElementById('dataSolicitacaoCliche')?.value;
  const chegada = document.getElementById('dataChegadaCliche')?.value;
  const badge = document.getElementById('prazoClicheBadge');

  if (!badge) return;

  // reset
  badge.className = 'badge bg-secondary';
  badge.innerText = '—';

  if (!solicitacao || !chegada) return;

  const dataSolicitacao = new Date(solicitacao);
  const dataChegada = new Date(chegada);

  const diffMs = dataChegada - dataSolicitacao;
  const dias = Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1;

  badge.innerText = `${dias} dia${dias > 1 ? 's' : ''}`;

  if (dias <= 2) {
    badge.className = 'badge bg-success';
  } else {
    badge.className = 'badge bg-danger';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const solicitacao = document.getElementById('dataSolicitacaoCliche');
  const chegada = document.getElementById('dataChegadaCliche');

  if (solicitacao && chegada) {
    solicitacao.addEventListener('change', calcularPrazoCliche);
    chegada.addEventListener('change', calcularPrazoCliche);
  }
});

async function buscarPropostas(page = 1) {
  paginaAtual = page;

  const cliente = document.getElementById('filtroCliente')?.value || '';
  const inicio = document.getElementById('filtroInicio')?.value || '';
  const fim = document.getElementById('filtroFim')?.value || '';

  mostrarLoadingPropostas();

  try {
    const url =
      `/propostas?cliente=${encodeURIComponent(cliente)}` +
      `&data_inicio=${inicio}&data_fim=${fim}&page=${page}`;

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Erro HTTP ${res.status}`);
    }

    const json = await res.json();
    const data = Array.isArray(json.data) ? json.data : [];
    const pagination = json.pagination || null;

    const lista = document.getElementById('listaPropostas');
    lista.innerHTML = '';

    if (data.length === 0) {
      lista.innerHTML = `
        <div class="col-12 text-center text-muted">
          Nenhuma proposta encontrada
        </div>
      `;
      renderizarPaginacao(null);
      return;
    }

    data.forEach(p => {
      lista.innerHTML += `
        <div class="col-md-4">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <h5>${p.cliente}</h5>

              <small class="text-muted">
                ${formatarData(p.data_inicio)} → ${formatarData(p.data_fim)}
              </small>

              <p class="mt-2 text-muted">
                ${p.observacao || ''}
              </p>

              <span class="badge bg-info">
                ${p.total_modificacoes || 0} modificação${p.total_modificacoes !== 1 ? 's' : ''}
              </span>

              <div class="mt-3 d-flex gap-2">
                <button class="btn btn-sm btn-outline-primary"
                  onclick="editarProposta(${p.id})">
                  <i class="fa fa-pen"></i>
                </button>

                <button class="btn btn-sm btn-outline-danger"
                  onclick="excluirProposta(${p.id})">
                  <i class="fa fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    renderizarPaginacao(pagination);

  } catch (err) {
    console.error('Erro ao buscar propostas:', err);

    document.getElementById('listaPropostas').innerHTML = `
      <div class="col-12 text-center text-danger">
        Erro ao carregar propostas
      </div>
    `;
  } finally {
    esconderLoadingPropostas();
  }
}


document.addEventListener('DOMContentLoaded', () => {
  buscarPropostas();
});

function excluirProposta(id) {
  mostrarConfirmacao(
    'Deseja realmente excluir esta proposta?',
    async () => {
      try {
        const res = await fetch(`/propostas/${id}`, {
          method: 'DELETE'
        });

        const result = await res.json();

        if (!result.success) {
          mostrarSucesso('Erro ao excluir proposta.');
          return;
        }

        buscarPropostas();
        mostrarSucesso('Proposta excluída com sucesso!');

      } catch (err) {
        console.error('Erro ao excluir proposta:', err);
        mostrarSucesso('Erro ao excluir proposta.');
      }
    }
  );
}

async function editarProposta(id) {
  try {
    const res = await fetch(`/propostas/${id}`);
    const data = await res.json();

    if (!data.proposta) {
      alert('Proposta não encontrada');
      return;
    }

    const { proposta, modificacoes } = data;

    // Preenche campos principais
    // Preenche campos principais
    document.getElementById('propostaId').value = proposta.id;
    document.getElementById('cliente').value = proposta.cliente || '';
    document.getElementById('designer').value = proposta.designer || '';
    document.getElementById('dataInicio').value = proposta.data_inicio?.split('T')[0] || '';
    document.getElementById('dataFim').value = proposta.data_fim?.split('T')[0] || '';
    document.getElementById('observacao').value = proposta.observacao || '';


    // Campos de clichê
    document.getElementById('dataSolicitacaoCliche').value =
      proposta.data_solicitacao_cliche?.split('T')[0] || '';

    document.getElementById('dataChegadaCliche').value =
      proposta.data_chegada_cliche?.split('T')[0] || '';

    // Recalcula badges
    calcularDuracao();
    calcularPrazoCliche();

    // Limpa modificações
    const lista = document.getElementById('listaModificacoes');
    lista.innerHTML = '';

    // Renderiza modificações existentes
    modificacoes.forEach(m => {
      lista.insertAdjacentHTML(
        'beforeend',
        renderModificacaoEditavel({
          id: m.id,
          descricao: m.descricao,
          data: m.data_modificacao?.split('T')[0],
          modoEdicao: false
        })
      );
    });

    // Abre modal
    const modal = new bootstrap.Modal(document.getElementById('modalProposta'));
    modal.show();

  } catch (err) {
    console.error('Erro ao editar proposta:', err);
    alert('Erro ao carregar proposta');
  }
}

function coletarModificacoes() {
  const cards = document.querySelectorAll('#listaModificacoes .card');
  const modificacoes = [];

  cards.forEach(card => {
    // descrição (input OU texto)
    const descricao =
      card.querySelector('input[type="text"]')?.value ||
      card.querySelector('strong')?.innerText;

    // data (input OU texto formatado)
    let data =
      card.querySelector('input[type="date"]')?.value ||
      card.querySelector('span.text-muted')?.innerText;

    if (!descricao || !data) return;

    // converte dd/mm/yyyy -> yyyy-mm-dd
    if (data.includes('/')) {
      const [dia, mes, ano] = data.split('/');
      data = `${ano}-${mes}-${dia}`;
    }

    modificacoes.push({
      descricao,
      data_modificacao: data
    });
  });

  return modificacoes;
}

function limparModalProposta() {
  // limpa id (define como nova proposta)
  document.getElementById('propostaId').value = '';

  // campos principais
  document.getElementById('cliente').value = '';
  document.getElementById('dataInicio').value = '';
  document.getElementById('dataFim').value = '';
  document.getElementById('observacao').value = '';

  // campos de clichê
  document.getElementById('dataSolicitacaoCliche').value = '';
  document.getElementById('dataChegadaCliche').value = '';

  // limpa modificações
  document.getElementById('listaModificacoes').innerHTML = '';

  // reseta badges
  const duracaoBadge = document.getElementById('duracaoBadge');
  if (duracaoBadge) {
    duracaoBadge.className = 'badge bg-secondary';
    duracaoBadge.innerText = '—';
  }

  const prazoClicheBadge = document.getElementById('prazoClicheBadge');
  if (prazoClicheBadge) {
    prazoClicheBadge.className = 'badge bg-secondary';
    prazoClicheBadge.innerText = '—';
  }
}

function mostrarSucesso(mensagem = 'Operação realizada com sucesso.') {
  document.getElementById('mensagemSucesso').innerText = mensagem;

  const modal = new bootstrap.Modal(
    document.getElementById('modalSucesso')
  );

  modal.show();
}

function mostrarConfirmacao(mensagem, onConfirmar) {
  document.getElementById('mensagemConfirmacao').innerText = mensagem;

  const btnConfirmar = document.getElementById('btnConfirmarAcao');

  // remove eventos antigos
  const novoBtn = btnConfirmar.cloneNode(true);
  btnConfirmar.parentNode.replaceChild(novoBtn, btnConfirmar);

  novoBtn.addEventListener('click', () => {
    bootstrap.Modal.getInstance(
      document.getElementById('modalConfirmacao')
    ).hide();

    onConfirmar();
  });

  const modal = new bootstrap.Modal(
    document.getElementById('modalConfirmacao')
  );

  modal.show();
}

function mostrarLoadingPropostas() {
  document.getElementById('loadingPropostas')?.classList.remove('d-none');
  document.getElementById('listaPropostas')?.classList.add('d-none');
}

function esconderLoadingPropostas() {
  document.getElementById('loadingPropostas')?.classList.add('d-none');
  document.getElementById('listaPropostas')?.classList.remove('d-none');
}

function renderizarPaginacao(pagination) {
  const ul = document.getElementById('paginacaoPropostas');
  ul.innerHTML = '';

  if (!pagination || pagination.totalPages <= 1) return;

  const { page, totalPages } = pagination;

  ul.innerHTML += `
    <li class="page-item ${page === 1 ? 'disabled' : ''}">
      <a class="page-link" href="#" onclick="buscarPropostas(${page - 1})">
        Anterior
      </a>
    </li>
  `;

  for (let i = 1; i <= totalPages; i++) {
    ul.innerHTML += `
      <li class="page-item ${i === page ? 'active' : ''}">
        <a class="page-link" href="#" onclick="buscarPropostas(${i})">
          ${i}
        </a>
      </li>
    `;
  }

  ul.innerHTML += `
    <li class="page-item ${page === totalPages ? 'disabled' : ''}">
      <a class="page-link" href="#" onclick="buscarPropostas(${page + 1})">
        Próxima
      </a>
    </li>
  `;
}
