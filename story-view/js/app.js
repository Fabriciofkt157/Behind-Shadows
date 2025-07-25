// js/app.js

const DB_PATH = 'dist/db.json';

let db = null;
let characterDataMap = new Map(); // Mapa para acesso rápido aos dados dos personagens

const navMenuEl = document.getElementById('nav-menu');
const mainContentEl = document.getElementById('main-content');
const codexTitleEl = document.getElementById('codex-title');
const sidebarEl = document.getElementById('sidebar');

/**
 * Mapeia os dados dos personagens para acesso rápido.
 * Isso evita ter que percorrer todos os tópicos toda vez que uma cutscene é renderizada.
 */
function mapCharacterData() {
  if (!db || !db.topics) return;
  
  for (const topicId in db.topics) {
    const topic = db.topics[topicId];
    if (topic.template === 'character') {
      // O campo 'title' pode ter vários nomes, ex: "Alan / Lon"
      const names = topic.title.split('/').map(name => name.trim());
      
      const characterInfo = {
        id: topicId,
        imageUrl: topic.image_url || `https://placehold.co/80x80/292524/7dd3fc?text=${names[0][0]}`
      };

      // Adiciona todas as variações de nome ao mapa
      names.forEach(name => {
        characterDataMap.set(name, characterInfo);
      });
      // Adiciona o nome completo do subtítulo também, se existir (ex: "Alan Dount")
      if (topic.subtitle) {
         characterDataMap.set(topic.subtitle.trim(), characterInfo);
      }
    }
  }
}

/**
 * Estiliza o conteúdo de uma cutscene para parecer um chat.
 * Adiciona avatares, links e alinha os balões de diálogo.
 */
function styleChatBubbles() {
  const scriptContainer = mainContentEl.querySelector('.cutscene-script .prose');
  if (!scriptContainer) return;

  const lines = Array.from(scriptContainer.querySelectorAll('p'));
  let lastSpeaker = null;
  let currentSide = 'right'; // Começa com 'right' para o primeiro toggle ir para 'left'

  lines.forEach(line => {
    const speakerTag = line.querySelector('strong');
    const originalContent = line.innerHTML;
    let speakerName = '';
    let dialogText = originalContent;

    if (speakerTag) {
        speakerName = speakerTag.textContent.trim().replace(':', '');
        dialogText = originalContent.replace(/<strong>.*?<\/strong>:?/, '').trim();
    }

    const character = characterDataMap.get(speakerName);

    // Limpa o parágrafo para reconstruir com a nova estrutura
    line.innerHTML = ''; 

    if (character) { // É uma linha de diálogo de um personagem conhecido
      if (speakerName !== lastSpeaker) {
        currentSide = (currentSide === 'left') ? 'right' : 'left';
      }

      line.classList.add('chat-bubble', `chat-${currentSide}`);

      const avatarImg = document.createElement('img');
      avatarImg.src = character.imageUrl;
      avatarImg.alt = speakerName;
      avatarImg.className = 'chat-avatar';

      const textContainer = document.createElement('div');
      textContainer.className = 'chat-text-content';

      const nameLink = document.createElement('a');
      nameLink.href = `#${character.id}`;
      nameLink.className = 'chat-speaker-name';
      nameLink.textContent = speakerName;
      
      const dialogP = document.createElement('p');
      dialogP.innerHTML = dialogText;

      textContainer.appendChild(nameLink);
      textContainer.appendChild(dialogP);
      line.appendChild(avatarImg);
      line.appendChild(textContainer);
      
      lastSpeaker = speakerName;

    } else { // É uma linha de ação/narração
      line.classList.add('chat-action');
      line.innerHTML = dialogText;
    }
  });
}


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
    
    // Aplica o estilo de chat se o template for 'cutscene'
    if (item.template === 'cutscene') {
        styleChatBubbles();
    }

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

        mapCharacterData(); // Mapeia os personagens assim que o DB é carregado
        buildNavMenu();
        initializeEventHandlers();
        
        // Carrega o conteúdo inicial baseado no hash da URL
        renderContent(window.location.hash.slice(1) || 'home');

    } catch (err) {
        console.error('Erro ao inicializar o Códice:', err);
        mainContentEl.innerHTML = `
          <div class="text-center p-8 bg-red-900/50 rounded-lg text-red-300">
            <h2 class="text-3xl font-title">Erro ao carregar o Códice</h2>
            <p>Não foi possível encontrar ou ler o arquivo <code>${DB_PATH}</code>.</p>
            <p class="text-xs mt-4">Verifique o console para mais detalhes.</p>
          </div>`;
    }
}

document.addEventListener('DOMContentLoaded', init);
