// views/adminHeader.js
module.exports = function adminHeader(paginaAtiva = 'Propostas', slotCentral = '') {
    // Lista de links do sistema
    const navLinks = [
        { nome: 'Painel', url: '/admin', icone: 'fa-table-columns' },
        { nome: 'Propostas', url: '/', icone: 'fa-file-signature' },
        { nome: 'Gabaritos', url: '/admin/gabaritos', icone: 'fa-folder-open' }
    ];

    const linksHTML = navLinks.map(link => {
        const isAtivo = link.nome === paginaAtiva;
        
        // Estilo moderno com cantos arredondados, sombras e transições suaves
        const classesBase = "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 border border-transparent";
        const classesEstado = isAtivo 
            ? "bg-brand text-white shadow-lg shadow-brand/20 border-brand/20" 
            : "text-gray-400 hover:text-white hover:bg-gray-800/80 hover:border-gray-700/50";
            
        return `
        <a href="${link.url}" class="${classesBase} ${classesEstado}">
            <i class="fa-solid ${link.icone} w-5 text-center text-lg"></i> 
            <span>${link.nome}</span>
        </a>`;
    }).join('');

    return `
    <!-- Estilo dinâmico para empurrar o conteúdo principal quando a sidebar estiver visível em telas grandes -->
    <style>
        @media (min-width: 1024px) {
            main, footer { margin-left: 16rem !important; transition: margin-left 0.3s ease; }
        }
    </style>

    <!-- Overlay escura para menu Mobile -->
    <div id="mobileOverlay" class="fixed inset-0 bg-gray-950/80 backdrop-blur-sm z-40 hidden lg:hidden transition-opacity" onclick="toggleSidebar()"></div>

    <!-- MENU LATERAL (SIDEBAR) -->
    <aside id="sidebar" class="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 flex flex-col transform -translate-x-full lg:translate-x-0 transition-transform duration-300 shadow-2xl">
        
        <!-- Logo -->
        <div class="h-20 flex items-center gap-3 px-6 border-b border-gray-800 shrink-0 bg-gray-900/50">
            <div class="w-10 h-10 bg-brand rounded-xl flex items-center justify-center shadow-lg shadow-brand/20">
                <i class="fa-solid fa-leaf text-white text-lg"></i>
            </div>
            <div>
                <h1 class="text-xl font-black text-white tracking-tight leading-none">Ecocaixas</h1>
                <p class="text-[9px] text-gray-500 font-black uppercase tracking-widest mt-1">Setor Design</p>
            </div>
        </div>

        <!-- Links de Navegação -->
        <nav class="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
            <p class="px-4 text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Navegação Principal</p>
            ${linksHTML}
        </nav>
    </aside>

    <!-- TOPBAR (Para comportar as Barras de Pesquisa / mobile toggle) -->
    <header class="sticky top-0 z-30 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 shadow-sm lg:ml-64 transition-all duration-300 h-[72px]">
        <div class="flex items-center justify-between h-full px-4 md:px-6 gap-4">
            
            <!-- Controle Mobile e Breadcrumbs -->
            <div class="flex items-center gap-4 shrink-0">
                <button onclick="toggleSidebar()" class="lg:hidden w-10 h-10 rounded-xl bg-gray-800 border border-gray-700 text-gray-400 hover:text-white flex items-center justify-center transition-colors shadow-sm">
                    <i class="fa-solid fa-bars"></i>
                </button>
                <h2 class="text-lg font-black text-white hidden sm:block lg:hidden">${paginaAtiva}</h2>
                
                <!-- Breadcrumb limpo para Desktop -->
                <div class="hidden lg:flex items-center gap-2 text-sm font-bold">
                    <i class="fa-solid fa-layer-group text-gray-600"></i>
                    <span class="text-gray-200 ml-1">${paginaAtiva}</span>
                </div>
            </div>

            <!-- Injeção da Barra de Pesquisa e Filtros (Se existir) -->
            <div class="flex-grow flex justify-end w-full max-w-3xl">
                ${slotCentral}
            </div>
            
        </div>
    </header>

    <script>
        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('mobileOverlay');
            
            sidebar.classList.toggle('-translate-x-full');
            overlay.classList.toggle('hidden');
            
            // Previne a rolagem da página quando o menu lateral estiver aberto no celular
            if (!sidebar.classList.contains('-translate-x-full')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }
    </script>
    `;
};