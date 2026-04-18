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
        const classesBase = "flex items-center gap-2 text-sm font-bold transition-all h-full px-1 border-b-2";
        const classesEstado = isAtivo 
            ? "text-brand border-brand" 
            : "text-gray-400 border-transparent hover:text-gray-200 hover:border-gray-600";
            
        return `
        <a href="${link.url}" class="${classesBase} ${classesEstado}">
            <i class="fa-solid ${link.icone}"></i> 
            <span class="hidden md:inline">${link.nome}</span>
        </a>`;
    }).join('');

    return `
    <header class="bg-gray-900 border-b border-gray-800 shadow-sm sticky top-0 z-40">
        <div class="container mx-auto px-4 md:px-6 flex flex-col xl:flex-row justify-between items-center h-full min-h-[4rem] gap-4 py-3 xl:py-0">
            
            <div class="flex items-center gap-3 shrink-0 xl:h-16 w-full xl:w-auto justify-center xl:justify-start">
                <div class="w-8 h-8 bg-brand rounded-lg flex items-center justify-center shadow-lg shadow-brand/20">
                    <i class="fa-solid fa-leaf text-white text-sm"></i>
                </div>
                <h1 class="text-xl font-black text-white tracking-tight flex items-center gap-2">
                    EcoAdmin <span class="text-gray-600 font-normal text-lg hidden sm:inline">|</span> <span class="text-gray-400 font-medium text-base hidden sm:inline">${paginaAtiva}</span>
                </h1>
            </div>

            <div class="flex-grow flex justify-center w-full xl:w-auto order-3 xl:order-none">
                ${slotCentral}
            </div>

            <nav class="flex items-center gap-4 md:gap-6 shrink-0 xl:h-16 overflow-x-auto w-full xl:w-auto justify-center xl:justify-end order-2 xl:order-none">
                ${linksHTML}
            </nav>

        </div>
    </header>
    `;
};