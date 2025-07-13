import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { z } from 'zod';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const conteudoPath = path.resolve(__dirname, '../conteudo');
const distPath = path.resolve(__dirname, '../dist');
const configPath = path.join(conteudoPath, 'config.json');


const frontmatterSchema = z.object({
  titulo: z.string(),
  subtitulo: z.string().optional(),
  icone: z.string().optional(),
  template: z.enum(['simple', 'character', 'inventory', 'timeline', 'evento', 'termo', 'mapa', 'grupo', 'cutscene']).optional(),
  image_url: z.string().optional(),
  age: z.string().optional(),
  birthday: z.string().optional(),
  origin: z.string().optional(),
  sexo: z.string().optional(),
  natureza: z.string().optional(),
  natural_de: z.string().optional(),
  parentesco: z.string().optional(),
  aliados: z.string().optional(),
  personagens: z.array(z.string()).optional()
});

/**
 * Processa o markdown personalizado para gerar uma estrutura de árvore aninhada em HTML.
 * - '*' cria um bloco pai.
 * - '->' cria um filho do último item de nível superior.
 * - '-->' cria um neto (filho do último '->').
 */

function processarListas(text) {
    // Regex para encontrar blocos que começam com ': {' e terminam com '}'
    const listRegex = /:\s*\{([^}]*)\}/g;

    return text.replace(listRegex, (match, blockContent) => {
        const items = blockContent.trim().split('\n');
        let listHtml = '<ul class="inline-list">';

        for (const item of items) {
            const trimmedItem = item.trim();
            if (trimmedItem.startsWith('- ')) {
                const itemContent = trimmedItem.slice(2).trim();
                // Usamos marked.parseInline para suportar **negrito** e *itálico* dentro dos itens
                listHtml += `<li>${marked.parseInline(itemContent)}</li>`;
            }
        }

        listHtml += '</ul>';
        // A substituição retorna apenas a lista HTML, 
        // pois o título/label já está no texto original.
        return listHtml; 
    });
}

function processarBlocosEspeciais(markdown) {
    const lines = markdown.split('\n').filter(line => line.trim() !== '');
    let html = '';
    let currentBlock = null;

    function closeCurrentBlock() {
        if (currentBlock) {
            html += renderNode(currentBlock) + '</div>';
            currentBlock = null;
        }
    }

    function renderNode(node) {
        let nodeHtml = '';
        if (node.level === 0) { // Tópico principal (*)
            nodeHtml += `<div class="bullet-item">${marked.parseInline(node.content)}</div>`;
        } else { // Sub-tópicos (->, -->)
            nodeHtml += `<div class="sub-bullet-node">
                      <div class="branch-line"></div>
                      <div class="branch-content">${marked.parseInline(node.content)}</div>
                   </div>`;
        }

        if (node.children.length > 0) {
            nodeHtml += '<div class="sub-bullet-wrapper">';
            nodeHtml += node.children.map(renderNode).join('');
            nodeHtml += '</div>';
        }
        return nodeHtml;
    }
    
    let lastNodeLevel1 = null;
    let lastNodeLevel2 = null;

    for (const line of lines) {
        const trimmedLine = line.trim();
        
        if (trimmedLine.startsWith('* ')) {
            closeCurrentBlock();
            currentBlock = { level: 0, content: trimmedLine.slice(2), children: [] };
            html += '<div class="bullet-block">';
            lastNodeLevel1 = currentBlock;
        } else if (trimmedLine.startsWith('-->') && lastNodeLevel2) {
            const node = { level: 3, content: processarListas(trimmedLine.slice(3).trim()), children: [] };
            lastNodeLevel2.children.push(node);
        } else if (trimmedLine.startsWith('->')) {
            if (!lastNodeLevel1) continue;
            const node = { level: 2, content: processarListas(trimmedLine.slice(2).trim()), children: [] };           
            lastNodeLevel1.children.push(node);
            lastNodeLevel2 = node;
        } else {
            closeCurrentBlock();
            html += marked.parse(processarListas(trimmedLine));
        }
    }

    closeCurrentBlock();
    return html;
}

async function processarArquivo(filePath, topicos, secaoPai = null) {
    if (!filePath.endsWith('.md')) return;

    const raw = await fs.readFile(filePath, 'utf8');
    const { data, content } = matter(raw);
    const valid = frontmatterSchema.safeParse(data);

    if (!valid.success) {
        console.warn(`⚠️  Erro de validação em ${filePath}:`, valid.error.flatten().fieldErrors);
        return;
    }

    const id = path.basename(filePath, '.md');
    
    if (secaoPai && secaoPai.items) {
      secaoPai.items.push({ id, title: data.titulo });
    }

    topicos[id] = {
        ...data,
        title: data.titulo,
        subtitle: data.subtitulo || '',
        template: data.template || (secaoPai?.template ?? 'simple'),
        icon: data.icone || secaoPai?.icon || 'fa-book',
        contentHtml: processarBlocosEspeciais(content)
    };
}

// O restante do arquivo (processarDiretorio, gerarDbJson) pode permanecer o mesmo.
async function processarDiretorio(dir) {
  const secoes = [];
  const topicos = {};

  async function walk(currentDir, parentId = null) {
    const itens = await fs.readdir(currentDir);
    let secaoAtual = null;

    const indexFile = itens.find(item => item === '_index.md');
    if (indexFile) {
      const fullPath = path.join(currentDir, indexFile);
      const raw = await fs.readFile(fullPath, 'utf8');
      const { data } = matter(raw);
      const secaoId = path.relative(conteudoPath, currentDir).replace(/\\/g, '/');
      
      secaoAtual = {
        id: secaoId,
        title: data.titulo.replace(/_/g, ' '),
        icon: data.icone || 'fa-book',
        template: data.template || 'simple',
        parent: parentId,
        items: []
      };
      secoes.push(secaoAtual);
    }

    for (const item of itens) {
      const fullPath = path.join(currentDir, item);
      const stat = await fs.stat(fullPath);

      if (stat.isDirectory()) {
        const proximoPaiId = secaoAtual ? secaoAtual.id : parentId;
        await walk(fullPath, proximoPaiId);
      } else if (item !== '_index.md' && item.endsWith('.md')) {
        await processarArquivo(fullPath, topicos, secaoAtual);
      }
    }
  }

  const itensRaiz = await fs.readdir(dir);
  for (const item of itensRaiz) {
      const fullPath = path.join(dir, item);
      const stat = await fs.stat(fullPath);
      if (stat.isFile() && item.endsWith('.md') && item !== '_index.md') {
          await processarArquivo(fullPath, topicos, null);
      }
  }

  for (const item of itensRaiz) {
      const fullPath = path.join(dir, item);
      const stat = await fs.stat(fullPath);
      if (stat.isDirectory()) {
          await walk(fullPath, null);
      }
  }

  return { secoes, topicos };
}

async function gerarDbJson() {
  const config = await fs.readJson(configPath).catch(() => ({ siteTitle: 'Story-View' }));
  const { secoes, topicos } = await processarDiretorio(conteudoPath);

  const finalDb = {
    siteTitle: config.siteTitle || 'Behind Shadows',
    lastUpdated: new Date().toISOString(),
    sections: secoes,
    topics: topicos
  };

  await fs.ensureDir(distPath);
  await fs.writeJson(path.join(distPath, 'db.json'), finalDb, { spaces: 2 });

  console.log('✅ db.json gerado com sucesso!');
}

gerarDbJson().catch(err => {
  console.error('Erro ao gerar db.json:', err);
});
