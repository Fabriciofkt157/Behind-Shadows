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
  ordem: z.number().optional(),
  template: z.enum(['simple', 'character', 'inventory', 'timeline', 'evento', 'termo', 'mapa', 'grupo', 'cutscene', 'gameplay', 'glossary']).optional(),
  image_url: z.string().optional(),
  age: z.string().optional(),
  birthday: z.string().optional(),
  origin: z.string().optional(),
  sexo: z.string().optional(),
  natureza: z.string().optional(),
  natural_de: z.string().optional(),
  parentesco: z.string().optional(),
  aliados: z.string().optional(),
  personagens: z.array(z.string()).optional(),
  horario: z.string().optional()
});

async function processarGlossario() {
  const glossaryFilePath = path.join(conteudoPath, '01_Prefacio', 'glossario.md');
  const glossaryData = {};

  if (!fs.existsSync(glossaryFilePath)) {
    console.warn('⚠️  Arquivo glossario.md não encontrado. Pulando a geração do glossário.');
    return null;
  }

  try {
    const raw = await fs.readFile(glossaryFilePath, 'utf8');
    const { content } = matter(raw);

    const glossaryRegex = /###\s+(.*?)\s*\n+>\s(.*?)\s*\n+\[=> Ver mais em:\s+(.*?)\]/g;
    
    let match;
    while ((match = glossaryRegex.exec(content)) !== null) {
      const term = match[1].trim();
      const definition = match[2].trim();
      const link = match[3].trim();

      if (term) {
        glossaryData[term] = { definition, link };
      }
    }
    console.log(`✅ Glossário processado com ${Object.keys(glossaryData).length} termos.`);
    return glossaryData;
  } catch (error) {
    console.error('❌ Erro ao processar o arquivo de glossário:', error);
    return null;
  }
}


async function processarArquivo(filePath, topicos, secaoPai = null) {
  if (!filePath.endsWith('.md')) return;

  const raw = await fs.readFile(filePath, 'utf8');
  let { data, content } = matter(raw);
  const valid = frontmatterSchema.safeParse(data);

  if (!valid.success) {
    console.warn(`⚠️  Erro de validação em ${filePath}:`, valid.error.flatten().fieldErrors);
    return;
  }

  const navButtonRegex = />> \[(.*?)\]\((.*?)\)/g;
  content = content.replace(navButtonRegex, (match, text, url) => {
    return `<a href="${url}" class="nav-button"><i class="fas fa-arrow-right"></i> ${text}</a>`;
  });

  // --- INÍCIO DAS MODIFICAÇÕES ---

  // Helper function para processar a sintaxe customizada de gameplay/cutscene
  const parseGameContent = (innerContent) => {
    const lines = innerContent.trim().split('\n');
    const parsed = lines.map(line => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('[') && trimmedLine.endsWith(']')) {
        return `<div class="gameplay-info">${trimmedLine.slice(1, -1)}</div>`;
      }
      if (trimmedLine.startsWith('(') && trimmedLine.endsWith(')')) {
        return `<div class="gameplay-action">${trimmedLine.slice(1, -1)}</div>`;
      }
      const falaMatch = line.match(/^(.+?):\s(.+)$/); // Usar 'line' para pegar falas indentadas
      if (falaMatch && !trimmedLine.startsWith('-')) { // Não aplicar em headers de lista
        const personagem = falaMatch[1].trim();
        const fala = falaMatch[2].trim();
        return `<p class="gameplay-line"><strong>${personagem}:</strong> ${fala}</p>`;
      }
      if (trimmedLine === '') return ''; // preservar linhas em branco
      
      // Se não for nada especial, apenas retorne a linha para o marked processar (importante para listas)
      if (trimmedLine.startsWith('-')) {
        return line;
      }

      return `<p>${line}</p>`;
    });
    // Junta as linhas e DEIXA o marked processar o resultado
    // Isso garante que as listas de markdown (do <dialogo>) ainda funcionem
    return marked.parse(parsed.join('\n'));
  };

  // Parser para <gameplay> blocks
  content = content.replace(/<gameplay(:.*?)?>([\s\S]*?)<\/gameplay>/g, (_, label, innerContent) => {
    const title = label ? `<h4 class="gameplay-title">${label.slice(1).trim()}</h4>` : '';
    const parsedContent = parseGameContent(innerContent);
    return `<section class="gameplay-block">${title}\n${parsedContent}</section>`;
  });

  // NOVO Parser para <cutscene> blocks
  content = content.replace(/<cutscene(:.*?)?>([\s\S]*?)<\/cutscene>/g, (_, label, innerContent) => {
    const title = label ? `<h4 class="cutscene-title">${label.slice(1).trim()}</h4>` : '';
    const parsedContent = parseGameContent(innerContent); // Usa o mesmo parser
    return `<section class="cutscene-block">${title}\n${parsedContent}</section>`;
  });

  // NOVO Parser para <dialogo> blocks (que usa listas markdown)
  content = content.replace(/<dialogo(:.*?)?>([\s\S]*?)<\/dialogo>/g, (_, label, innerContent) => {
    const title = label ? `<h4 class="dialogo-title">${label.slice(1).trim()}</h4>` : '';
    const parsedContent = marked.parse(innerContent); // Apenas usa o marked
    return `<section class="dialogo-block">${title}\n${parsedContent}</section>`;
  });

  // --- FIM DAS MODIFICAÇÕES ---

  const id = path.basename(filePath, '.md');

  if (secaoPai && secaoPai.items) {
    if (id !== 'glossario') {
        secaoPai.items.push({ id, title: data.titulo, ordem: data.ordem });
    }
  }

  topicos[id] = {
    ...data,
    title: data.titulo,
    subtitle: data.subtitulo || '',
    template: data.template || (secaoPai?.template ?? 'simple'),
    icon: data.icone || secaoPai?.icon || 'fa-book',
    contentHtml: marked.parse(content) // O marked processa o HTML final
  };
}

// ... (Restante do arquivo 'build.js' sem alterações) ...

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
        items: [],
        ordem: data.ordem
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
  const glossario = await processarGlossario();

  const finalDb = {
    siteTitle: config.siteTitle || 'Behind Shadows',
    lastUpdated: new Date().toISOString(),
    sections: secoes,
    topics: topicos
  };
  
  if (glossario) {
      finalDb.glossary = glossario;
  }

  await fs.ensureDir(distPath);
  await fs.writeJson(path.join(distPath, 'db.json'), finalDb, { spaces: 2 });

  console.log('✅ db.json gerado com sucesso!');
}

gerarDbJson().catch(err => {
  console.error('Erro ao gerar db.json:', err);
});