// js/app.js

const DB_PATH = 'dist/db.json';

let db = null;

const navMenuEl = document.getElementById('nav-menu');
const mainContentEl = document.getElementById('main-content');
const codexTitleEl = document.getElementById('codex-title');
const sidebarEl = document.getElementById('sidebar');

function customSort(a, b, key = 'id') {
  const aHasOrder = typeof a.ordem === 'number';
  const bHasOrder = typeof b.ordem === 'number';

  if (aHasOrder && bHasOrder) {
    return a.ordem - b.ordem;
  }
  if (aHasOrder) return -1;
  if (bHasOrder) return 1;

  return a[key].localeCompare(b[key]);
}

function renderNavSection(section, container) {
    const sectionDiv = document.createElement('div');
    sectionDiv.className = `nav-section ${section.parent ? 'ml-4 mt-2' : 'mt-4'} relative`;

    if (section.title) {
        const titleH3 = document.createElement('h3');
        titleH3.className = 'text-xs font-title text-stone-500 uppercase tracking-wider flex items-center px-3 relative';

        const toggleBtn = document.createElement('span');
        toggleBtn.className = 'nav-toggle-btn absolute left-[-12px]';
        toggleBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
        toggleBtn.title = 'Mostrar/Ocultar';
        toggleBtn.addEventListener('click', e => {
            e.stopPropagation();
            sectionDiv.classList.toggle('nav-collapsed');
            toggleBtn.classList.toggle('rotate');
        });

        const iconEl = document.createElement('i');
        iconEl.className = `fas ${section.icon || 'fa-book'} fa-fw mr-3`;

        const spanTitle = document.createElement('span');
        spanTitle.textContent = section.title;

        titleH3.appendChild(toggleBtn);
        titleH3.appendChild(iconEl);
        titleH3.appendChild(spanTitle);
        sectionDiv.appendChild(titleH3);
    }

    if (section.items && section.items.length) {
        const ul = document.createElement('ul');
        ul.className = 'space-y-1 mt-1 ml-5 border-l border-stone-700';
        section.items
            .sort((a, b) => customSort(a, b, 'title'))
            .forEach(item => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = `#${item.id}`;
                a.className = 'block text-stone-400 hover:text-sky-300 text-sm py-1 pl-4';
                a.textContent = item.title;
                a.dataset.target = item.id;
                li.appendChild(a);
                ul.appendChild(li);
            });
        sectionDiv.appendChild(ul);
    }

    if (section.children && section.children.length) {
        const childrenContainer = document.createElement('div');
        section.children
            .sort((a, b) => customSort(a, b, 'id'))
            .forEach(child => renderNavSection(child, childrenContainer));
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

    rootSections
        .sort((a, b) => customSort(a, b, 'id'))
        .forEach(section => renderNavSection(section, navMenuEl));
}

function renderContent(itemId) {
    if (!itemId || itemId === '#') {
        itemId = 'home';
    }

    const item = db.topics[itemId];
    if (!item) {
        return renderContent('home');
    }

    const templateName = item.template || 'simple';
    const templateContainer = document.getElementById(`${templateName}-template-display`);
    if (!templateContainer) {
        return mainContentEl.innerHTML = `<p>Erro: Template '${templateName}' não existe.</p>`;
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
            .filter(d => d.value)
            .map(d => `<p><strong>${d.label}:</strong> ${d.value}</p>`)
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

    navMenuEl.addEventListener('click', e => {
        const target = e.target.closest('a');
        if (target && target.dataset.target) {
            e.preventDefault();
            window.location.hash = target.dataset.target;
        }
    });

    sidebarToggleBtn.addEventListener('click', e => {
        e.stopPropagation();
        sidebarEl.classList.toggle('open');
    });

    document.addEventListener('click', e => {
        if (sidebarEl.classList.contains('open') &&
            !sidebarEl.contains(e.target) &&
            !sidebarToggleBtn.contains(e.target)) {
            sidebarEl.classList.remove('open');
        }
    });

    const loadContentFromHash = () => {
        renderContent(window.location.hash.slice(1) || 'home');
        if (window.innerWidth <= 768) {
            sidebarEl.classList.remove('open');
        }
    };
    window.addEventListener('hashchange', loadContentFromHash);
    window.addEventListener('load', loadContentFromHash);
}

async function init() {
    try {
        const response = await fetch(DB_PATH + `?v=${Date.now()}`);
        if (!response.ok) throw new Error(response.statusText);
        db = await response.json();

        document.title = codexTitleEl.textContent = db.siteTitle || 'Códice';
        const lastUpdatedEl = document.getElementById('last-updated');
        if (db.lastUpdated) {
            const date = new Date(db.lastUpdated);
            lastUpdatedEl.textContent = `Última atualização: ${date.toLocaleDateString()} às ${date.toLocaleTimeString()}`;
        }

        buildNavMenu();
        initializeEventHandlers();
    } catch (err) {
        mainContentEl.innerHTML = `
          <div class="text-center p-8 bg-red-900/50 rounded-lg text-red-300">
            <h2 class="text-3xl font-title">Erro ao carregar o Códice</h2>
            <p>Não foi possível encontrar ou ler o arquivo <code>${DB_PATH}</code>.</p>
          </div>`;
    }
}

document.addEventListener('DOMContentLoaded', init);
