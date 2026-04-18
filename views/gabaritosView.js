// views/gabaritosView.js
const adminHeader = require('./adminHeader');

module.exports = function renderGabaritos(gabaritos = []) {
    
    // Função auxiliar para renderizar os cards dos gabaritos
    const renderGabaritosCards = () => {
        if (gabaritos.length === 0) {
            return `
            <div class="col-span-full text-center py-20 bg-gray-900/50 rounded-3xl border-2 border-dashed border-gray-700">
                <i class="fa-solid fa-folder-open text-6xl text-gray-600 mb-4"></i>
                <h3 class="text-2xl font-black text-gray-300 mb-2">Nenhum gabarito encontrado</h3>
                <p class="text-gray-500">Faça o upload do seu primeiro arquivo .cdr ou .ai acima.</p>
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
            <div class="gabarito-card bg-gray-800 rounded-2xl shadow-lg border border-gray-700 overflow-hidden hover:border-gray-500 transition-all duration-300 flex flex-col group" data-nome="${gab.nome.toLowerCase()}">
                <div class="p-6 flex-grow flex flex-col items-center text-center relative">
                    
                    <span class="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${bgTema} ${corTema}">
                        ${labelTipo}
                    </span>

                    <div class="w-20 h-20 rounded-full ${bgTema} flex items-center justify-center mb-6 mt-4 group-hover:scale-110 transition-transform duration-300">
                        <i class="fa-solid ${icone} text-3xl ${corTema}"></i>
                    </div>
                    
                    <h4 class="text-lg font-black text-white mb-1 truncate w-full" title="${gab.nome}">
                        ${nomeExibicao}
                    </h4>
                    <p class="text-xs text-gray-400 font-medium">Arquivo: ${gab.nome}</p>
                </div>
                
                <div class="bg-gray-900 border-t border-gray-700 p-4 flex justify-between gap-3">
                    <a href="${gab.url}" download class="flex-1 bg-gray-800 hover:bg-brand text-white text-sm font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center shadow-sm">
                        <i class="fa-solid fa-download mr-2"></i> Baixar
                    </a>
                    
                    <form action="/admin/gabaritos/delete/${gab.id}" method="POST" class="m-0" onsubmit="return confirm('Tem certeza que deseja excluir este gabarito permanentemente?')">
                        <button type="submit" class="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white w-10 h-full rounded-lg transition-colors flex items-center justify-center shadow-sm">
                            <i class="fa-solid fa-trash"></i>
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
        <title>Gabaritos | EcoAdmin</title>
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
                padding: 10px 20px;
                border-radius: 8px;
                color: #fff;
                cursor: pointer;
                font-weight: bold;
                transition: background .2s ease-in-out;
            }
            input[type=file]::file-selector-button:hover { background: #015e15; }
        </style>
    </head>
    <body class="text-gray-200 min-h-screen flex flex-col selection:bg-brand selection:text-white">

        ${adminHeader('Gabaritos')}

        <main class="flex-grow container mx-auto px-6 py-10 max-w-6xl">
            
            <div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
                <div>
                    <h2 class="text-3xl font-black text-white tracking-tight mb-2">Central de Gabaritos</h2>
                    <p class="text-gray-400">Gerencie os arquivos base (.cdr e .ai) para criação das artes das caixas.</p>
                </div>
            </div>

            <div class="bg-gray-800/80 backdrop-blur rounded-3xl p-6 md:p-8 shadow-xl border border-gray-700 mb-12">
                <h3 class="text-lg font-black text-white mb-6 flex items-center border-b border-gray-700 pb-4">
                    <i class="fa-solid fa-cloud-arrow-up text-brand mr-3 text-xl"></i> Novo Upload
                </h3>
                
                <form action="/admin/gabaritos/upload" method="POST" enctype="multipart/form-data" class="flex flex-col md:flex-row gap-4 items-center">
                    
                    <div class="flex-grow w-full relative">
                        <input type="file" name="arquivo_gabarito" accept=".cdr, .ai" class="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-sm text-gray-300 outline-none focus:border-brand transition-colors cursor-pointer" required>
                    </div>
                    
                    <button type="submit" class="w-full md:w-auto bg-brand text-white font-black py-4 px-8 rounded-xl hover:bg-brandDark transition-all shadow-lg shadow-brand/20 whitespace-nowrap flex items-center justify-center">
                        <i class="fa-solid fa-upload mr-2"></i> Salvar Gabarito
                    </button>
                </form>
                <p class="text-xs text-gray-500 mt-4"><i class="fa-solid fa-circle-info mr-1"></i> Formatos aceitos: <strong>.cdr</strong> (CorelDraw) e <strong>.ai</strong> (Adobe Illustrator).</p>
            </div>

            <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-gray-800 pb-4">
                <h3 class="text-lg font-bold text-gray-300 flex items-center">
                    <i class="fa-solid fa-layer-group text-gray-500 mr-2"></i> Arquivos Disponíveis
                </h3>
                
                ${gabaritos.length > 0 ? `
                <div class="relative w-full md:w-72">
                    <i class="fa-solid fa-search absolute left-3 top-2.5 text-gray-500 text-sm"></i>
                    <input type="text" id="buscaGabarito" onkeyup="filtrarGabaritos()" class="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-brand transition-colors" placeholder="Buscar por nome...">
                </div>
                ` : ''}
            </div>
                
            <div id="gridGabaritos" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                ${renderGabaritosCards()}
            </div>

            <div id="emptySearch" class="hidden text-center py-16 bg-gray-900/30 rounded-3xl border border-dashed border-gray-700 mt-6">
                <i class="fa-solid fa-search text-4xl text-gray-600 mb-3"></i>
                <h4 class="text-lg font-bold text-gray-400">Nenhum gabarito encontrado</h4>
                <p class="text-sm text-gray-500">Tente buscar com outras palavras-chave.</p>
            </div>

        </main>

        <footer class="bg-gray-900 py-6 border-t border-gray-800 mt-auto">
            <div class="container mx-auto px-6 text-center text-sm text-gray-500">
                <span class="text-gray-300 font-bold">Ecocaixas</span> &copy; 2026 — Sistema Interno.
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