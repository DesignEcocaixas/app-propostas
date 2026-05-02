// views/propostasView.js
const adminHeader = require('./adminHeader');

function propostasView() {
  
  // HTML da Barra de Pesquisa a ser injetado no Header
  const filtrosHTML = `
    <form class="flex w-full gap-2 items-center justify-end" onsubmit="event.preventDefault(); buscarPropostas(1);">
        <div class="relative w-full max-w-xs flex items-center">
            <i class="fa-solid fa-search absolute left-3 text-gray-500 text-sm pointer-events-none"></i>
            
            <input type="text" id="filtroCliente" autocomplete="off" class="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-8 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-brand transition-colors h-10" placeholder="Buscar cliente...">
            
            <!-- BOTÃO DE LIMPAR (X) -->
            <button type="button" id="btnLimparBusca" onclick="limparBusca()" class="absolute right-2 text-gray-500 hover:text-gray-300 hidden h-full px-2 flex items-center justify-center transition-colors">
                <i class="fa-solid fa-xmark text-sm"></i>
            </button>
            
            <!-- DROPDOWN DE PESQUISA EM TEMPO REAL -->
            <div id="searchDropdown" class="absolute left-0 top-full mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-50 hidden max-h-80 overflow-y-auto custom-scrollbar flex-col">
            </div>
        </div>
        
        <div class="hidden lg:flex items-center gap-2 shrink-0">
            <input type="date" id="filtroInicio" class="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none focus:border-brand transition-colors h-10 w-36">
            <span class="text-gray-500 text-sm">até</span>
            <input type="date" id="filtroFim" class="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none focus:border-brand transition-colors h-10 w-36">
        </div>

        <button type="button" onclick="buscarPropostas(1)" class="bg-brand hover:bg-brandDark text-white px-4 py-2 rounded-lg font-bold transition-colors flex items-center justify-center shadow-lg shadow-brand/20 h-10 shrink-0">
            <i class="fa-solid fa-search lg:hidden"></i>
            <span class="hidden lg:inline">Buscar</span>
        </button>
    </form>
  `;

  return `
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <title>Sistema de Propostas</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <script src="https://cdn.tailwindcss.com"></script>
  <script>
      tailwind.config = { 
          theme: { 
              extend: { 
                  colors: { brand: '#029723', brandDark: '#015e15', brandLight: '#e6f5e9' }, 
                  fontFamily: { sans: ['Inter', 'sans-serif'] } 
              } 
          } 
      }
  </script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="stylesheet" href="/public/css/transitions.css">

  <style>
    body { font-family: 'Inter', sans-serif; background-color: #0f172a; color: #e2e8f0; }
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: #1e293b; }
    ::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #64748b; }
  </style>
</head>
<body class="min-h-screen flex flex-col selection:bg-brand selection:text-white overflow-x-hidden">

  ${adminHeader('Propostas', filtrosHTML)}

  <main class="flex-grow px-4 md:px-6 lg:px-8 pt-8 pb-16 w-full lg:w-auto flex flex-col">

    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-black text-white lg:hidden">Mural</h2>
      
      <div class="flex items-center gap-3 ml-auto">
          <button type="button" onclick="abrirModalRelatorio()" class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-4 rounded-lg transition-colors shadow-lg flex items-center">
            <i class="fa-solid fa-file-excel sm:mr-2"></i> <span class="hidden sm:inline">Relatório</span>
          </button>
          
          <button onclick="limparModalProposta(); abrirModal('modalProposta')" class="bg-brand hover:bg-brandDark text-white text-sm font-bold py-2 px-4 rounded-lg transition-colors shadow-lg flex items-center">
            <i class="fa-solid fa-plus sm:mr-2"></i> <span class="hidden sm:inline">Nova Proposta</span>
          </button>
      </div>
    </div>

    <div id="loadingPropostas" class="hidden py-20 text-center">
        <i class="fa-solid fa-circle-notch fa-spin text-4xl text-brand mb-4"></i>
        <p class="text-gray-500 font-medium">Buscando propostas...</p>
    </div>

    <div id="listaPropostas" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4 auto-rows-max flex-grow pb-8">
    </div>

    <nav class="mt-auto pt-4 border-t border-gray-800/50 flex justify-center">
      <ul id="paginacaoPropostas" class="flex space-x-1">
      </ul>
    </nav>

  </main>

  <!-- Modal Relatório -->
  <div id="modalRelatorio" class="fixed inset-0 bg-gray-950/80 backdrop-blur-sm z-[100] hidden flex items-center justify-center transition-opacity opacity-0 px-4" style="transition: opacity 0.3s ease;">
    <div class="modal-panel bg-gray-900 rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-gray-700 transform scale-95 transition-transform duration-300">
      
      <div class="flex justify-between items-center mb-5 border-b border-gray-800 pb-4">
        <h3 class="text-xl font-black text-white"><i class="fa-solid fa-file-excel text-brand mr-2"></i> Exportar Relatório</h3>
        <button type="button" onclick="fecharModal('modalRelatorio')" class="text-gray-500 hover:text-white bg-gray-800 hover:bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center transition-colors">
            <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div class="mb-6 flex gap-4">
        <div class="flex-1">
          <label class="block text-xs font-bold text-gray-400 mb-1">Mês</label>
          <select id="relatorioMes" class="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-brand">
          </select>
        </div>
        <div class="flex-1">
          <label class="block text-xs font-bold text-gray-400 mb-1">Ano</label>
          <select id="relatorioAno" class="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-brand">
          </select>
        </div>
      </div>

      <div class="flex gap-3">
        <button type="button" onclick="fecharModal('modalRelatorio')" class="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-2.5 rounded-lg transition-colors text-sm">Cancelar</button>
        <button type="button" onclick="baixarRelatorioExcel()" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg shadow-lg transition-colors text-sm flex justify-center items-center">
            <i class="fa-solid fa-download mr-2"></i> Baixar
        </button>
      </div>

    </div>
  </div>

  <!-- Modal Proposta -->
  <div id="modalProposta" class="fixed inset-0 bg-gray-950/80 backdrop-blur-sm z-[100] hidden flex items-center justify-center transition-opacity opacity-0 px-4" style="transition: opacity 0.3s ease;">
    <div class="modal-panel bg-gray-900 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border border-gray-700 transform scale-95 transition-transform duration-300">
      
      <div class="px-6 py-4 border-b border-gray-800 flex justify-between items-center bg-gray-900 rounded-t-2xl shrink-0">
        <h3 class="text-xl font-black text-white"><i class="fa-solid fa-file-signature text-brand mr-2"></i> Proposta</h3>
        <button type="button" onclick="fecharModal('modalProposta')" class="text-gray-500 hover:text-white bg-gray-800 hover:bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center transition-colors">
            <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div class="p-6 overflow-y-auto flex-grow custom-scrollbar">
        <input type="hidden" id="propostaId">

        <div class="mb-6 bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
          <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Identificação</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-400 mb-1">Cliente</label>
              <input type="text" id="cliente" class="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-brand">
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-400 mb-1">Designer</label>
              <select id="designer" class="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-brand">
                <option value="">Selecione...</option>
                <option value="David">David</option>
                <option value="Salleth">Salleth</option>
              </select>
            </div>
          </div>
        </div>

        <div class="mb-6 bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
          <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Cronograma</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label class="block text-xs font-bold text-gray-400 mb-1">Data de Início</label>
              <input type="date" id="dataInicio" class="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none focus:border-brand">
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-400 mb-1">Data Fim (Previsão)</label>
              <input type="date" id="dataFim" class="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none focus:border-brand">
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-400 mb-1">Duração da Arte</label>
              <span id="duracaoBadge" class="bg-gray-700 text-gray-400 px-3 py-2 rounded-lg text-xs font-bold block text-center border border-gray-600">—</span>
            </div>
          </div>
        </div>

        <div class="mb-6 bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
          <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Logística de Clichê</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label class="block text-xs font-bold text-gray-400 mb-1">Solicitação</label>
              <input type="date" id="dataSolicitacaoCliche" class="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none focus:border-brand">
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-400 mb-1">Chegada</label>
              <input type="date" id="dataChegadaCliche" class="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none focus:border-brand">
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-400 mb-1">Tempo de Trânsito</label>
              <span id="prazoClicheBadge" class="bg-gray-700 text-gray-400 px-3 py-2 rounded-lg text-xs font-bold block text-center border border-gray-600">—</span>
            </div>
          </div>
        </div>

        <div class="mb-6">
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Observações Gerais</label>
          <textarea id="observacao" rows="3" class="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-brand" placeholder="Detalhes do pedido..."></textarea>
        </div>

        <div>
          <div class="flex justify-between items-center mb-3 border-b border-gray-800 pb-2">
            <h4 class="text-sm font-bold text-gray-300"><i class="fa-solid fa-clock-rotate-left mr-2"></i> Histórico de Modificações</h4>
            <button type="button" onclick="abrirNovaModificacao()" class="bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white px-3 py-1.5 rounded text-xs font-bold transition-colors">
              <i class="fa fa-plus mr-1"></i> Add Alteração
            </button>
          </div>
          <div id="listaModificacoes" class="space-y-2">
            </div>
        </div>

      </div>

      <div class="px-6 py-4 border-t border-gray-800 bg-gray-900 rounded-b-2xl flex justify-between items-center shrink-0">
        <div>
            <button type="button" id="btnExcluirModal" class="hidden bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center text-sm shadow-sm">
                <i class="fa-solid fa-trash mr-2"></i> Excluir
            </button>
        </div>
        <div class="flex gap-3">
            <button type="button" onclick="fecharModal('modalProposta')" class="bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-2 px-4 md:px-6 rounded-lg transition-colors text-sm md:text-base">Cancelar</button>
            <button type="button" onclick="salvarProposta()" class="bg-brand hover:bg-brandDark text-white font-bold py-2 px-6 md:px-8 rounded-lg shadow-lg transition-colors text-sm md:text-base">Salvar</button>
        </div>
      </div>

    </div>
  </div>

  <div id="modalSucesso" class="fixed inset-0 bg-gray-950/80 backdrop-blur-sm z-[110] hidden flex items-center justify-center transition-opacity opacity-0 px-4">
    <div class="modal-panel bg-gray-900 rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl border border-gray-700 transform scale-95 transition-transform duration-300">
      <div class="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <i class="fa-solid fa-check text-3xl"></i>
      </div>
      <h3 class="text-xl font-black text-white mb-2">Sucesso!</h3>
      <p id="mensagemSucesso" class="text-gray-400 text-sm mb-6">Operação realizada com sucesso.</p>
      <button type="button" onclick="fecharModal('modalSucesso')" class="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-2.5 rounded-lg transition-colors">OK, Entendi</button>
    </div>
  </div>

  <div id="modalConfirmacao" class="fixed inset-0 bg-gray-950/80 backdrop-blur-sm z-[110] hidden flex items-center justify-center transition-opacity opacity-0 px-4">
    <div class="modal-panel bg-gray-900 rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl border border-gray-700 transform scale-95 transition-transform duration-300">
      <div class="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <i class="fa-solid fa-triangle-exclamation text-3xl"></i>
      </div>
      <h3 class="text-xl font-black text-white mb-2">Atenção</h3>
      <p id="mensagemConfirmacao" class="text-gray-400 text-sm mb-6">Tem certeza que deseja realizar esta ação?</p>
      <div class="flex gap-3">
        <button type="button" onclick="fecharModal('modalConfirmacao')" class="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-2.5 rounded-lg transition-colors">Cancelar</button>
        <button type="button" id="btnConfirmarAcao" class="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-lg shadow-lg transition-colors">Sim, Excluir</button>
      </div>
    </div>
  </div>

  <script src="/public/js/propostas.js"></script>
  
  <script>
    async function abrirModalRelatorio() {
        if (typeof abrirModal === 'function') {
            abrirModal('modalRelatorio');
        }

        const anoSelect = document.getElementById('relatorioAno');
        const mesSelect = document.getElementById('relatorioMes');
        
        anoSelect.innerHTML = '<option value="">Carregando...</option>';
        mesSelect.innerHTML = '<option value="">Carregando...</option>';

        try {
            const response = await fetch('/admin/api/periodos-disponiveis');
            const periodos = await response.json();

            if (periodos.length === 0) {
                anoSelect.innerHTML = '<option value="">Sem registros</option>';
                mesSelect.innerHTML = '<option value="">Sem registros</option>';
                return;
            }

            const anosUnicos = [...new Set(periodos.map(p => p.ano))];
            anoSelect.innerHTML = anosUnicos.map(ano => \`<option value="\${ano}">\${ano}</option>\`).join('');

            function atualizarMeses() {
                const anoSelecionado = parseInt(anoSelect.value);
                const mesesDoAno = periodos.filter(p => p.ano === anoSelecionado).map(p => p.mes);
                
                const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
                
                mesSelect.innerHTML = mesesDoAno.map(mes => {
                    const mesFormatado = String(mes).padStart(2, '0');
                    return \`<option value="\${mesFormatado}">\${nomesMeses[mes - 1]}</option>\`;
                }).join('');
            }

            anoSelect.addEventListener('change', atualizarMeses);
            atualizarMeses(); 

        } catch (error) {
            console.error("Erro ao carregar períodos", error);
            anoSelect.innerHTML = '<option value="">Erro</option>';
            mesSelect.innerHTML = '<option value="">Erro</option>';
        }
    }

    function baixarRelatorioExcel() {
        const mes = document.getElementById('relatorioMes').value;
        const ano = document.getElementById('relatorioAno').value;
        
        if(!mes || !ano) return;

        if (window.showGlobalLoading) { 
            window.showGlobalLoading(); 
            setTimeout(() => window.hideGlobalLoading(), 1500); 
        }

        if (typeof fecharModal === 'function') {
            fecharModal('modalRelatorio');
        }

        window.location.href = \`/propostas/exportar/excel?mes=\${mes}&ano=\${ano}\`;
    }
  </script>
</body>
</html>
  `;
}

module.exports = propostasView;