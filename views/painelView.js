// views/painelView.js
const adminHeader = require('./adminHeader');

module.exports = function painelView(dadosGraficos) {
  const dadosInjetados = JSON.stringify(dadosGraficos);

  return `
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <title>Dashboard | Ecocaixas</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
      tailwind.config = { 
          theme: { 
              extend: { 
                  colors: { brand: '#029723', brandDark: '#015e15' }, 
                  fontFamily: { sans: ['Inter', 'sans-serif'] } 
              } 
          } 
      }
  </script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

  <style>
    body { font-family: 'Inter', sans-serif; background-color: #0f172a; color: #e2e8f0; }
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #1e293b; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
  </style>
</head>
<body class="min-h-screen flex flex-col selection:bg-brand selection:text-white overflow-x-hidden">

  ${adminHeader('Painel')}

  <!-- A MÁGICA AQUI: removido 'container mx-auto' e adicionado 'w-full lg:w-auto' -->
  <main class="flex-grow px-4 md:px-6 lg:px-8 py-6 w-full lg:w-auto">
    
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-black text-white tracking-tight">Produção de Artes</h2>
        <p class="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Monitoramento de Volume por Dia</p>
      </div>
      <div class="bg-gray-800/50 px-4 py-2 rounded-xl border border-gray-700/50 flex items-center gap-3">
         <span class="flex h-2 w-2 rounded-full bg-brand animate-pulse"></span>
         <span class="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Live Dashboard</span>
      </div>
    </div>

    <div class="grid grid-cols-12 gap-5">
        
        <div class="col-span-12 lg:col-span-8 bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-2xl relative">
            <h3 class="text-sm font-black text-white mb-4 flex items-center">
                <i class="fa-solid fa-chart-line text-brand mr-2"></i>
                <span id="labelAtual">Mês Atual</span>
            </h3>
            <div class="relative h-64 w-full">
                <canvas id="chartAtual"></canvas>
            </div>
        </div>

        <div class="col-span-12 lg:col-span-4 flex flex-col gap-5">
            
            <div class="bg-gray-800/30 border border-gray-800 rounded-2xl p-4 shadow-xl">
                <h3 class="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center">
                    <i class="fa-solid fa-history mr-2"></i> <span id="labelAnterior">...</span>
                </h3>
                <div class="relative h-32 w-full">
                    <canvas id="chartAnterior"></canvas>
                </div>
            </div>

            <div class="bg-gray-800/30 border border-gray-800 rounded-2xl p-4 shadow-xl">
                <h3 class="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center">
                    <i class="fa-solid fa-history mr-2"></i> <span id="labelRetrasado">...</span>
                </h3>
                <div class="relative h-32 w-full">
                    <canvas id="chartRetrasado"></canvas>
                </div>
            </div>

        </div>
    </div>
  </main>

  <div id="modalDetalhesDia" class="fixed inset-0 bg-gray-950/90 backdrop-blur-md z-[100] hidden flex items-center justify-center opacity-0 transition-opacity duration-300">
    <div class="bg-gray-900 border border-gray-700 rounded-3xl w-full max-w-md shadow-2xl transform scale-95 transition-transform duration-300 overflow-hidden">
        <div class="p-5 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
            <div>
                <h4 class="text-lg font-black text-white" id="modalDataTitulo">00/00/0000</h4>
                <div class="flex items-center gap-2 mt-1">
                    <span class="w-2 h-2 rounded-full bg-brand"></span>
                    <p class="text-[10px] text-gray-500 font-black uppercase tracking-widest">Relatório Diário</p>
                </div>
            </div>
            <button onclick="fecharModalDetalhes()" class="text-gray-500 hover:text-white bg-gray-800 w-9 h-9 rounded-full flex items-center justify-center transition-colors">
                <i class="fa-solid fa-xmark text-sm"></i>
            </button>
        </div>
        <div class="p-5 max-h-[400px] overflow-y-auto custom-scrollbar space-y-3" id="listaPropostasDia">
            </div>
        <div class="p-3 bg-gray-950/50 text-center border-t border-gray-800">
            <p class="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Fim da Lista</p>
        </div>
    </div>
  </div>

  <script>
    const dadosGraficos = ${dadosInjetados};
    
    function abrirModalDetalhes(dataIso, dataFormatada) {
        const modal = document.getElementById('modalDetalhesDia');
        const lista = document.getElementById('listaPropostasDia');
        document.getElementById('modalDataTitulo').innerText = dataFormatada;
        
        lista.innerHTML = '<div class="py-12 text-center"><i class="fa-solid fa-circle-notch fa-spin text-brand text-2xl"></i></div>';
        
        modal.classList.remove('hidden');
        setTimeout(() => { modal.classList.remove('opacity-0'); modal.children[0].classList.remove('scale-95'); }, 10);

        fetch('/admin/api/propostas-por-dia/' + dataIso)
            .then(res => res.json())
            .then(data => {
                if(data.length === 0) {
                    lista.innerHTML = '<div class="py-10 text-center"><i class="fa-solid fa-ghost text-gray-700 text-3xl mb-2"></i><p class="text-gray-600 text-xs font-bold">Nenhum registro encontrado.</p></div>';
                    return;
                }
                lista.innerHTML = data.map(p => \`
                    <div class="group flex items-center justify-between p-3 bg-gray-800/40 border border-gray-700 rounded-xl hover:border-brand hover:bg-gray-800 transition-all duration-300">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 bg-brand/10 text-brand rounded-lg flex items-center justify-center font-black text-[10px] border border-brand/20 group-hover:bg-brand group-hover:text-white transition-colors">
                                \${p.hora}
                            </div>
                            <div>
                                <h5 class="text-white font-bold text-xs group-hover:text-brand transition-colors">\${p.cliente}</h5>
                                <p class="text-[10px] text-gray-500 font-medium">Designer: \${p.designer || 'David'}</p>
                            </div>
                        </div>
                        <i class="fa-solid fa-chevron-right text-gray-800 group-hover:text-brand text-[10px]"></i>
                    </div>
                \`).join('');
            });
    }

    function fecharModalDetalhes() {
        const modal = document.getElementById('modalDetalhesDia');
        modal.classList.add('opacity-0');
        modal.children[0].classList.add('scale-95');
        setTimeout(() => modal.classList.add('hidden'), 300);
    }

    document.addEventListener('DOMContentLoaded', function() {
        Chart.defaults.color = '#475569';
        Chart.defaults.font.family = "'Inter', sans-serif";
        Chart.defaults.font.weight = '600';

        function setupChart(id, index, isMain = false) {
            const ctx = document.getElementById(id).getContext('2d');
            const info = dadosGraficos[index];
            
            document.getElementById('label' + id.replace('chart', '')).innerText = info.nome + ' ' + info.ano;

            const config = {
                type: 'line',
                data: {
                    labels: info.dias,
                    datasets: [{
                        data: info.totais,
                        borderColor: isMain ? '#029723' : '#334155',
                        backgroundColor: (c) => {
                            const g = c.chart.ctx.createLinearGradient(0, 0, 0, isMain ? 250 : 100);
                            g.addColorStop(0, isMain ? 'rgba(2, 151, 35, 0.3)' : 'rgba(51, 65, 85, 0.15)');
                            g.addColorStop(1, 'rgba(15, 23, 42, 0)');
                            return g;
                        },
                        borderWidth: isMain ? 3 : 2,
                        fill: true,
                        pointRadius: isMain ? 4 : 2,
                        pointHoverRadius: 7,
                        pointBackgroundColor: '#0f172a',
                        pointBorderColor: isMain ? '#029723' : '#334155',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                        legend: { display: false },
                        tooltip: { 
                            enabled: true, // Força a ativação do Tooltip em TODOS os gráficos
                            backgroundColor: 'rgba(15, 23, 42, 0.95)', // Fundo escuro
                            titleColor: '#fff',
                            bodyColor: '#e2e8f0',
                            borderColor: 'rgba(51, 65, 85, 1)', // Borda sutil
                            borderWidth: 1,
                            padding: 10,
                            displayColors: false, // Esconde aquele quadradinho de cor ao lado do texto
                            callbacks: {
                                label: function(context) { 
                                    return context.parsed.y + ' artes criadas'; // Formatação correta solicitada
                                }
                            }
                        }
                    },
                    scales: {
                        y: { 
                            beginAtZero: true, 
                            grid: { color: 'rgba(255,255,255,0.02)', drawBorder: false }, 
                            ticks: { stepSize: 1, display: isMain, font: { size: 10 } } 
                        },
                        x: { 
                            grid: { display: false }, 
                            ticks: { display: isMain, font: { size: 9 }, autoSkip: true, maxRotation: 0 } 
                        }
                    },
                    interaction: { mode: 'index', intersect: false },
                    onClick: (e, elements) => {
                        if (elements.length > 0) {
                            const idx = elements[0].index;
                            const dia = info.dias[idx];
                            const mes = (info.mes + 1).toString().padStart(2, '0');
                            const dataIso = info.ano + '-' + mes + '-' + dia;
                            const dataFormatada = dia + '/' + mes + '/' + info.ano;
                            abrirModalDetalhes(dataIso, dataFormatada);
                        }
                    }
                }
            };
            new Chart(ctx, config);
        }

        setupChart('chartAtual', 0, true);
        setupChart('chartAnterior', 1);
        setupChart('chartRetrasado', 2);
    });
  </script>
</body>
</html>
    `;
}