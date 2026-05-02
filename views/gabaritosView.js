// views/gabaritosView.js
const adminHeader = require('./adminHeader');

module.exports = function renderGabaritos(gabaritos = []) {
    
    // Função auxiliar para renderizar os cards dos gabaritos
    const renderGabaritosCards = () => {
        if (gabaritos.length === 0) {
            return `
            <div class="col-span-full text-center py-16 bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-700">
                <i class="fa-solid fa-folder-open text-4xl text-gray-600 mb-3"></i>
                <h3 class="text-xl font-black text-gray-300 mb-1">Nenhum gabarito encontrado</h3>
                <p class="text-sm text-gray-500">Faça o upload do seu primeiro arquivo .cdr ou .ai acima.</p>
            </div>`;
        }

        return gabaritos.map(gab => {
            // Identifica o tipo do arquivo para mudar a cor e o ícone
            const isCorel = gab.nome.toLowerCase().endsWith('.cdr');
            const isAi = gab.nome.toLowerCase().endsWith('.ai');
            
            // Remove a extensão do nome para o título do card
            const nomeExibicao = gab.nome.replace(/\.(cdr|ai)$/i, '');
            
            // Estilos dinâmicos baseados na extensão
            const corTema = isCorel ? 'text-green-500' : (isAi ? 'text-orange-500' : 'text-brand');
            const bgTema = isCorel ? 'bg-green-500/10 border-green-500/20' : (isAi ? 'bg-orange-500/10 border-orange-500/20' : 'bg-brand/10 border-brand/20');
            const icone = isCorel ? 'fa-pen-nib' : (isAi ? 'fa-bezier-curve' : 'fa-file-lines');
            const labelTipo = isCorel ? 'CorelDraw' : (isAi ? 'Illustrator' : 'Arquivo');

            return `
            <div class="gabarito-card bg-gray-800 rounded-xl shadow border border-gray-700 overflow-hidden hover:border-gray-500 transition-all duration-300 flex flex-col group" data-nome="${gab.nome.toLowerCase()}">
                <div class="p-4 flex-grow flex flex-col items-center text-center relative">
                    
                    <span class="absolute top-3 left-3 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${bgTema} ${corTema}">
                        ${labelTipo}
                    </span>

                    <div class="w-14 h-14 rounded-full ${bgTema} flex items-center justify-center mb-4 mt-4 group-hover:scale-110 transition-transform duration-300">
                        <i class="fa-solid ${icone} text-xl ${corTema}"></i>
                    </div>
                    
                    <h4 class="text-sm font-black text-white mb-0.5 truncate w-full" title="${gab.nome}">
                        ${nomeExibicao}
                    </h4>
                    <p class="text-[10px] text-gray-400 font-medium truncate w-full" title="Arquivo: ${gab.nome}">Arquivo: ${gab.nome}</p>
                </div>
                
                <div class="bg-gray-900 border-t border-gray-700 p-2.5 flex justify-between gap-2">
                    <a href="${gab.url}" download class="flex-1 bg-gray-800 hover:bg-brand text-white text-xs font-bold py-1.5 rounded-lg transition-colors flex items-center justify-center shadow-sm">
                        <i class="fa-solid fa-download mr-1.5"></i> Baixar
                    </a>
                    
                    <form action="/admin/gabaritos/delete/${gab.id}" method="POST" class="m-0" onsubmit="return confirm('Tem certeza que deseja excluir este gabarito permanentemente?')">
                        <button type="submit" class="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white w-8 h-full rounded-lg transition-colors flex items-center justify-center shadow-sm">
                            <i class="fa-solid fa-trash text-xs"></i>
                        </button>
                    </form>
                </div>
            </div>
            `;
        }).join('');
    };

    return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ecocaixas | Design</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script>
            tailwind.config = { theme: { extend: { colors: { brand: '#029723', brandDark: '#015e15', brandLight: '#e6f5e9', darkBg: '#0a1910' }, fontFamily: { sans: ['Inter', 'sans-serif'], } } } }
        </script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <style>
            body { font-family: 'Inter', sans-serif; background-color: #0f172a; } /* Slate 900 */
            
            /* Customização do input type="file" para combinar com o dark mode */
            input[type=file]::file-selector-button {
                margin-right: 15px;
                border: none;
                background: #029723;
                padding: 6px 14px;
                border-radius: 6px;
                color: #fff;
                cursor: pointer;
                font-size: 12px;
                font-weight: bold;
                transition: background .2s ease-in-out;
            }
            input[type=file]::file-selector-button:hover { background: #015e15; }
        </style>
    </head>
    <body class="text-gray-200 min-h-screen flex flex-col selection:bg-brand selection:text-white overflow-x-hidden">

        ${adminHeader('Gabaritos')}

        <!-- Removido o 'container mx-auto max-w-6xl' e adicionado 'w-full lg:w-auto' -->
        <main class="flex-grow px-4 md:px-6 lg:px-8 py-6 w-full lg:w-auto">
            
            <div class="max-w-7xl mx-auto w-full">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
                    <div>
                        
                        <p class="text-sm text-gray-400">Gerencie os arquivos base (.cdr e .ai) para criação das artes das caixas.</p>
                    </div>
                </div>

                <div class="bg-gray-800/80 backdrop-blur rounded-2xl p-5 shadow-xl border border-gray-700 mb-8">
                    <h3 class="text-base font-black text-white mb-4 flex items-center border-b border-gray-700 pb-3">
                        <i class="fa-solid fa-cloud-arrow-up text-brand mr-2 text-lg"></i> Novo Upload
                    </h3>
                    
                    <form action="/admin/gabaritos/upload" method="POST" enctype="multipart/form-data" class="flex flex-col sm:flex-row gap-3 items-center">
                        
                        <div class="flex-grow w-full relative">
                            <input type="file" name="arquivo_gabarito" accept=".cdr, .ai" class="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-xs text-gray-300 outline-none focus:border-brand transition-colors cursor-pointer" required>
                        </div>
                        
                        <button type="submit" class="w-full sm:w-auto bg-brand text-white text-sm font-black py-2.5 px-6 rounded-lg hover:bg-brandDark transition-all shadow-lg shadow-brand/20 whitespace-nowrap flex items-center justify-center">
                            <i class="fa-solid fa-upload mr-2"></i> Salvar Gabarito
                        </button>
                    </form>
                    <p class="text-[10px] text-gray-500 mt-2.5"><i class="fa-solid fa-circle-info mr-1"></i> Formatos aceitos: <strong>.cdr</strong> (CorelDraw) e <strong>.ai</strong> (Adobe Illustrator).</p>
                </div>

                <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 gap-3 border-b border-gray-800 pb-3">
                    <h3 class="text-base font-bold text-gray-300 flex items-center">
                        <i class="fa-solid fa-layer-group text-gray-500 mr-2"></i> Arquivos Disponíveis
                    </h3>
                    
                    ${gabaritos.length > 0 ? `
                    <div class="relative w-full md:w-64">
                        <i class="fa-solid fa-search absolute left-3 top-2 text-gray-500 text-xs"></i>
                        <input type="text" id="buscaGabarito" onkeyup="filtrarGabaritos()" class="w-full bg-gray-900 border border-gray-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 outline-none focus:border-brand transition-colors" placeholder="Buscar por nome...">
                    </div>
                    ` : ''}
                </div>
                    
                <div id="gridGabaritos" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                    ${renderGabaritosCards()}
                </div>

                <div id="emptySearch" class="hidden text-center py-12 bg-gray-900/30 rounded-2xl border border-dashed border-gray-700 mt-5">
                    <i class="fa-solid fa-search text-3xl text-gray-600 mb-2"></i>
                    <h4 class="text-base font-bold text-gray-400">Nenhum gabarito encontrado</h4>
                    <p class="text-xs text-gray-500">Tente buscar com outras palavras-chave.</p>
                </div>
            </div>
        </main>

        <footer class="bg-gray-900 py-4 border-t border-gray-800 mt-auto w-full lg:w-auto">
            <div class="px-6 text-center text-xs text-gray-500">
                <span class="text-gray-300 font-bold">Ecocaixas</span> &copy; 2026 — Setor Design.
            </div>
        </footer>

        <script>
            // Função simples e rápida para filtrar os cards pelo nome digitado
            function filtrarGabaritos() {
                const input = document.getElementById('buscaGabarito').value.toLowerCase();
                const cards = document.querySelectorAll('.gabarito-card');
                const emptyState = document.getElementById('emptySearch');
                let visiveis = 0;

                cards.forEach(card => {
                    const nomeArquivo = card.getAttribute('data-nome');
                    
                    if (nomeArquivo.includes(input)) {
                        card.style.display = 'flex'; // Restaura o display original do Tailwind flex-col
                        visiveis++;
                    } else {
                        card.style.display = 'none'; // Esconde o card
                    }
                });

                // Mostra ou esconde a mensagem de "Nenhum resultado"
                if (emptyState) {
                    emptyState.style.display = visiveis === 0 ? 'block' : 'none';
                }
            }
        </script>
    </body>
    </html>
    `;
};