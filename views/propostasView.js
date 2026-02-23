function propostasView() {
  return `
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <title>Sistema de Propostas</title>

  <!-- Bootstrap -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">

  <!-- Font Awesome (opcional, mas recomendado) -->
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" rel="stylesheet">

  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"/>

  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <link rel="stylesheet" href="/public/css/transitions.css">

    <style>
  html, body {
    height: 100%;
  }

  /* ===== DARK CINZA FORÇADO (inclusive bg-light) ===== */
  body,
  body.bg-light {
    margin: 0;
    background-color: #121212 !important; /* cinza quase preto */
    color: #e5e5e5 !important;
    min-height: 100vh;
    position: relative;
  }

  /* ===== GRANULADO CINZA ===== */
  body::before {
    content: "";
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background-image:
      radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
      radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 3px 3px;
    background-position: 0 0, 1.5px 1.5px;
    opacity: 0.35;
  }

  body > * {
    position: relative;
    z-index: 1;
  }

  /* ===== NAVBAR ===== */
  .navbar,
  .bg-dark {
    background-color: #1a1a1a !important;
  }

  /* ===== CARDS E MODAIS ===== */
  .card,
  .modal-content {
    background-color: #1e1e1e !important;
    border: 1px solid #2a2a2a !important;
    color: #e5e5e5 !important;
  }

  .modal-header {
    background-color: #181818 !important;
    border-bottom: 1px solid #2a2a2a !important;
  }

  .modal-footer {
    border-top: 1px solid #2a2a2a !important;
  }

  /* ===== INPUTS ===== */
  .form-control {
    background-color: #1a1a1a !important;
    border: 1px solid #2f2f2f !important;
    color: #e5e5e5 !important;
  }

  .form-control:focus {
    background-color: #1a1a1a !important;
    border-color: #555 !important;
    box-shadow: 0 0 0 0.2rem rgba(255,255,255,0.05);
    color: #ffffff !important;
  }

  textarea {
    background-color: #1a1a1a !important;
    color: #e5e5e5 !important;
  }

  .form-label,
  .text-muted {
    color: #9a9a9a !important;
  }

  /* ===== BOTÕES ===== */
  .btn-secondary {
    background-color: #2a2a2a !important;
    border: none !important;
  }

  .btn-outline-light {
    border-color: #444 !important;
    color: #d1d1d1 !important;
  }

  .btn-outline-light:hover {
    background-color: #2a2a2a !important;
  }

  /* ===== PAGINAÇÃO ===== */
  .pagination .page-item:not(.active) .page-link {
    background: transparent !important;
    border: none !important;
    color: #cfcfcf !important;
    padding: 4px 8px;
  }

  .pagination .page-item.active .page-link {
    background: transparent !important;
    border: none !important;
    font-weight: 600;
    color: #ffffff !important;
  }

  .pagination .page-link {
    border-radius: 0;
  }

  /* ===== BADGES ===== */
  .badge.bg-secondary {
    background-color: #2a2a2a !important;
  }

  /* ===== BADGE MODIFICAÇÕES COM DEGRADÊ ===== */
  .badge.bg-info {
    background: linear-gradient(135deg, #0026FF, #FF0088) !important;
    color: #ffffff !important;
    border: none !important;
    font-weight: 600;
  }

  /* ===== LOADING ===== */
  .spinner-border {
    color: #ffffff !important;
  }
    /* ===== BOTÃO FECHAR BRANCO ===== */
.btn-close {
  filter: invert(1) grayscale(100%) brightness(200%);
  opacity: 0.9;
}

.btn-close:hover {
  opacity: 1;
}
</style>

</head>
<body class="bg-light">

<!-- ================= HEADER ================= -->
<nav class="navbar navbar-expand-lg navbar-dark bg-dark px-3">
  <span class="navbar-brand">
    <i class="fa-solid fa-file-lines me-1"></i> Propostas
  </span>

  <form class="d-flex ms-auto gap-2">
    <input type="text" class="form-control" placeholder="Cliente" id="filtroCliente">

    <input type="date" class="form-control" id="filtroInicio">
    <input type="date" class="form-control" id="filtroFim">

    <button type="button" class="btn btn-outline-light" onclick="buscarPropostas()">
      <i class="fa fa-search"></i>
    </button>
  </form>
</nav>

<!-- ================= CONTEÚDO ================= -->
<div class="container my-4">

  <div class="d-flex justify-content-between align-items-center mb-3">
    <h4 class="mb-0">Lista de Propostas</h4>

    <button
        class="btn btn-success"
        data-bs-toggle="modal"
        data-bs-target="#modalProposta"
        onclick="limparModalProposta()"
        >
        <i class="fa fa-plus"></i> Nova Proposta
        </button>

  </div>

  <!-- LOADING -->
<div id="loadingPropostas" class="text-center my-5 d-none">
  <div class="spinner-border text-primary" role="status">
    <span class="visually-hidden">Carregando...</span>
  </div>
  <div class="mt-2 text-muted">
    Carregando propostas...
  </div>
</div>


  <!-- LISTA -->
  <div id="listaPropostas" class="row g-3">
    <!-- Cards gerados via JS -->
  </div>

  <!-- PAGINAÇÃO -->
  <nav class="mt-3">
    <ul class="pagination pagination-sm justify-content-center" id="paginacaoPropostas">
      <!-- JS -->
    </ul>
  </nav>

</div>

<!-- ================= MODAL PROPOSTA ================= -->
<div class="modal fade" id="modalProposta" tabindex="-1">
  <div class="modal-dialog modal-lg modal-dialog-scrollable">
    <div class="modal-content">

      <!-- HEADER -->
      <div class="modal-header">
        <h5 class="modal-title">Proposta</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>

      <!-- BODY -->
      <div class="modal-body">

        <input type="hidden" id="propostaId">

        <!-- 🔹 DADOS PRINCIPAIS -->
        <div class="mb-4">
          <h6 class="text-muted mb-3">Dados da Proposta</h6>

          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Cliente</label>
              <input type="text" class="form-control" id="cliente">
            </div>
          </div>

          <div class="col-md-6">
            <label class="form-label">Designer</label>
            <select class="form-select" id="designer">
              <option value="">Selecione</option>
              <option value="David">David</option>
              <option value="Salleth">Salleth</option>
            </select>
          </div>

        </div>

        <!-- 🔹 PRAZO DA PROPOSTA -->
        <div class="mb-4">
          <h6 class="text-muted mb-3">Prazo da Proposta</h6>

          <div class="row g-3 align-items-end">
            <div class="col-md-3">
              <label class="form-label">Data início</label>
              <input type="date" class="form-control" id="dataInicio">
            </div>

            <div class="col-md-3">
              <label class="form-label">Data fim</label>
              <input type="date" class="form-control" id="dataFim">
            </div>

            <div class="col-md-3">
              <label class="form-label d-block">Duração</label>
              <span id="duracaoBadge" class="badge bg-secondary">—</span>
            </div>
          </div>
        </div>

        <!-- 🔹 CLICHÊ -->
        <div class="mb-4">
          <h6 class="text-muted mb-3">Clichê</h6>

          <div class="row g-3 align-items-end">
            <div class="col-md-3">
              <label class="form-label">Data solicitação</label>
              <input type="date" class="form-control" id="dataSolicitacaoCliche">
            </div>

            <div class="col-md-3">
              <label class="form-label">Data chegada</label>
              <input type="date" class="form-control" id="dataChegadaCliche">
            </div>

            <div class="col-md-3">
              <label class="form-label d-block">Prazo do clichê</label>
              <span id="prazoClicheBadge" class="badge bg-secondary">—</span>
            </div>
          </div>
        </div>

        <!-- 🔹 OBSERVAÇÃO -->
        <div class="mb-4">
          <h6 class="text-muted mb-3">Observações</h6>

          <textarea
            class="form-control"
            rows="3"
            id="observacao"
          ></textarea>
        </div>

        <hr>

        <!-- 🔹 MODIFICAÇÕES -->
        <div class="mb-2 d-flex justify-content-between align-items-center">
          <h6 class="mb-0">Modificações</h6>

          <button
            class="btn btn-sm btn-outline-primary"
            onclick="abrirNovaModificacao()"
          >
            <i class="fa fa-plus"></i> Adicionar
          </button>
        </div>

        <div id="listaModificacoes">
          <!-- Cards de modificações -->
        </div>

      </div>

      <!-- FOOTER -->
      <div class="modal-footer">
        <button class="btn btn-secondary" data-bs-dismiss="modal">
          Cancelar
        </button>
        <button
  type="button"
  class="btn btn-primary"
  onclick="salvarProposta()"
>
  Salvar
</button>

      </div>

    </div>
  </div>
</div>


<!-- ================= SCRIPTS ================= -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

<script src="/public/js/propostas.js"></script>

<div class="modal fade" id="modalSucesso" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">

      <div class="modal-header bg-success text-white">
        <h5 class="modal-title">
          <i class="fa fa-check-circle"></i> Sucesso
        </h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
      </div>

      <div class="modal-body text-center">
        <p id="mensagemSucesso" class="mb-0">
          Operação realizada com sucesso.
        </p>
      </div>

      <div class="modal-footer justify-content-center">
        <button class="btn btn-success" data-bs-dismiss="modal">
          OK
        </button>
      </div>

    </div>
  </div>
</div>

<div class="modal fade" id="modalConfirmacao" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">

      <div class="modal-header bg-danger text-white">
        <h5 class="modal-title">
          <i class="fa fa-exclamation-triangle"></i> Confirmação
        </h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
      </div>

      <div class="modal-body text-center">
        <p id="mensagemConfirmacao">
          Tem certeza que deseja realizar esta ação?
        </p>
      </div>

      <div class="modal-footer justify-content-center">
        <button class="btn btn-secondary" data-bs-dismiss="modal">
          Cancelar
        </button>
        <button class="btn btn-danger" id="btnConfirmarAcao">
          Confirmar
        </button>
      </div>

    </div>
  </div>
</div>


</body>
</html>
`;
}

module.exports = propostasView;
