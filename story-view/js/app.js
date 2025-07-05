// js/app.js

const DB_PATH = 'dist/db.json';

let db = null;

const navMenuEl = document.getElementById('nav-menu');
const mainContentEl = document.getElementById('main-content');
const codexTitleEl = document.getElementById('codex-title');
const sidebarEl = document.getElementById('sidebar');

function renderNavSection(section, container) {
    const sectionDiv = document.createElement('div');
    sectionDiv.className = section.parent ? 'ml-4 mt-2' : 'mt-4'; 

    if (section.title) {
        const titleH3 = document.createElement('h3');
        titleH3.className = 'text-xs font-title text-stone-500 uppercase tracking-wider flex items-center px-3';
        titleH3.innerHTML = `<i class="fas ${section.icon || 'fa-book'} fa-fw mr-3"></i><span>${section.title}</span>`;
        sectionDiv.appendChild(titleH3);
    }
    
    if (section.items && section.items.length > 0) {
        const itemListUl = document.createElement('ul');
        itemListUl.className = 'space-y-1 mt-1 ml-5 border-l border-stone-700';

        const sortedItems = [...section.items].sort((a, b) => a.title.localeCompare(b.title));

        sortedItems.forEach(item => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#${item.id}`;
            a.className = 'block text-stone-400 hover:text-sky-300 text-sm py-1 pl-4';
            a.textContent = item.title;
            a.dataset.target = item.id;
            li.appendChild(a);
            itemListUl.appendChild(li);
        });
        sectionDiv.appendChild(itemListUl);
    }

    if (section.children && section.children.length > 0) {
        const childrenContainer = document.createElement('div');
        const sortedChildren = [...section.children].sort((a,b) => a.id.localeCompare(b.id));
        sortedChildren.forEach(childSection => {
            renderNavSection(childSection, childrenContainer);
        });
        sectionDiv.appendChild(childrenContainer);
    }

    container.appendChild(sectionDiv);
}

function buildNavMenu() {
    navMenuEl.innerHTML = '';

    const homeLink = document.createElement('a');
    homeLink.href = '#home';
    homeLink.className = 'block text-stone-300 hover:bg-stone-700 hover:text-sky-300 rounded-md px-3 py-2 text-sm font-medium';
    homeLink.innerHTML = '<i class="fas fa-dungeon w-6 mr-2"></i>Início';
    homeLink.dataset.target = 'home';
    navMenuEl.appendChild(homeLink);

    const sectionsMap = new Map();
    const rootSections = [];

    db.sections.forEach(section => {
        sectionsMap.set(section.id, { ...section, children: [] });
    });

    sectionsMap.forEach(section => {
        if (section.parent && sectionsMap.has(section.parent)) {
            sectionsMap.get(section.parent).children.push(section);
        } else {
            rootSections.push(section);
        }
    });
    
    const sortedRoots = rootSections.sort((a,b) => a.id.localeCompare(b.id));

    sortedRoots.forEach(section => {
        renderNavSection(section, navMenuEl);
    });
}

function renderContent(itemId) {
    // Se o itemId for vazio, nulo ou '#', redirecione para 'home'
    if (!itemId || itemId === '#') {
        itemId = 'home';
    }

    const item = db.topics[itemId];

    if (!item) {
        console.warn(`Tópico com id "${itemId}" não encontrado. Carregando página inicial.`);
        // Se o tópico não for encontrado, tente carregar o 'home' como fallback
        renderContent('home'); 
        return;
    }

    const templateName = item.template || 'simple';
    const templateContainer = document.getElementById(`${templateName}-template-display`);
    if (!templateContainer) {
        console.error(`Template de visualização para '${templateName}' não encontrado.`);
        mainContentEl.innerHTML = `<p>Erro: Template '${templateName}' não existe.</p>`;
        return;
    }
    
    let templateHtml = templateContainer.innerHTML;
    
    if (templateName === 'character') {
        const details = [
            { label: 'Idade', value: item.age },
            { label: 'Sexo', value: item.sexo },
            { label: 'Aniversário', value: item.birthday },
            { label: 'Natureza', value: item.natureza },
            { label: 'Origem', value: item.origin },
            { label: 'Natural de', value: item.natural_de },
            { label: 'Parentesco', value: item.parentesco },
            { label: 'Aliados', value: item.aliados },
        ];

        const detailsHtml = details
            .filter(detail => detail.value)
            .map(detail => `<p><strong>${detail.label}:</strong> ${detail.value}</p>`)
            .join('');
        
        templateHtml = templateHtml.replace('{details_grid}', detailsHtml);
    }
    
    Object.keys(item).forEach(key => {
        const regex = new RegExp(`{${key}}`, 'g');
        let content = item[key] || '';
        if (key === 'image_url' && !content) {
            content = `https://placehold.co/200x200/292524/7dd3fc?text=${item.title ? item.title[0] : '?'}`;
        }
        templateHtml = templateHtml.replace(regex, content);
    });
    
    mainContentEl.innerHTML = templateHtml;
    mainContentEl.scrollTop = 0;
    
    const horarioBox = document.querySelector('.horario-box');
    if (item.horario) {
        horarioBox.innerHTML = `<i class="fa-solid fa-clock mr-1 text-yellow-400"></i><span>${item.horario}</span>`;
        horarioBox.style.display = 'flex';
    } else {
        horarioBox.style.display = 'none';
    }
}

function initializeEventHandlers() {
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    
    navMenuEl.addEventListener('click', (e) => {
        const target = e.target.closest('a');
        if (target && target.dataset.target) {
            e.preventDefault();
            const itemId = target.dataset.target;
            window.location.hash = itemId;
            // A renderização agora é tratada pelo 'hashchange'
        }
    });

    sidebarToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebarEl.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
        if (sidebarEl.classList.contains('open') && !sidebarEl.contains(e.target) && !sidebarToggleBtn.contains(e.target)) {
            sidebarEl.classList.remove('open');
        }
    });

    // Evento unificado para carregar conteúdo
    const loadContentFromHash = () => {
        const itemId = window.location.hash.substring(1);
        renderContent(itemId || 'home');
        if (window.innerWidth <= 768) {
            sidebarEl.classList.remove('open');
        }
    };

    window.addEventListener('hashchange', loadContentFromHash);
    // Carrega o conteúdo inicial na primeira vez
    window.addEventListener('load', loadContentFromHash);
}

async function init() {
    try {
        const response = await fetch(DB_PATH + `?v=${new Date().getTime()}`); // Cache busting
        if (!response.ok) {
            throw new Error(`Erro ao carregar o arquivo db.json: ${response.statusText}`);
        }
        db = await response.json();

        document.title = db.siteTitle || 'Códice';
        codexTitleEl.textContent = db.siteTitle || 'Códice';
        
        const lastUpdatedEl = document.getElementById('last-updated');
        if (db.lastUpdated) {
            const date = new Date(db.lastUpdated);
            lastUpdatedEl.textContent = `Última atualização: ${date.toLocaleDateString()} às ${date.toLocaleTimeString()}`;
        }

        buildNavMenu();
        initializeEventHandlers();

    } catch (error) {
        console.error("Falha ao inicializar a aplicação:", error);
        mainContentEl.innerHTML = `<div class="text-center p-8 bg-red-900/50 rounded-lg text-red-300">
            <h2 class="text-3xl font-title">Erro ao carregar o Códice</h2>
            <p>Não foi possível encontrar ou ler o arquivo <code>${DB_PATH}</code>.</p>
            <p class="mt-4">Verifique se o arquivo existe e se o servidor local está rodando corretamente.</p>
        </div>`;
    }
}

document.addEventListener('DOMContentLoaded', init);
