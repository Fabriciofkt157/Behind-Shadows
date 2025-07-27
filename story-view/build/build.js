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
  template: z.enum(['simple', 'character', 'inventory', 'timeline', 'evento', 'termo', 'mapa', 'grupo', 'cutscene', 'gameplay']).optional(),
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

async function processarArquivo(filePath, topicos, secaoPai = null) {
  if (!filePath.endsWith('.md')) return;

  const raw = await fs.readFile(filePath, 'utf8');
  let { data, content } = matter(raw);
  const valid = frontmatterSchema.safeParse(data);

  if (!valid.success) {
    console.warn(`⚠️  Erro de validação em ${filePath}:`, valid.error.flatten().fieldErrors);
    return;
  }

  // Substituição de botões de navegação (>> [Texto](#link))
  const navButtonRegex = />> \[(.*?)\]\((.*?)\)/g;
  content = content.replace(navButtonRegex, (match, text, url) => {
    return `<a href="${url}" class="nav-button"><i class="fas fa-arrow-right"></i> ${text}</a>`;
  });

  // Parser para blocos de <gameplay>
  content = content.replace(/<gameplay(:.*?)?>([\s\S]*?)<\/gameplay>/g, (_, label, innerContent) => {
    const lines = innerContent.trim().split('\n');
    const parsed = lines.map(line => {
      if (line.trim().startsWith('[') && line.trim().endsWith(']')) {
        return `<div class="gameplay-info">${line.trim().slice(1, -1)}</div>`;
      }
      if (line.trim().startsWith('(') && line.trim().endsWith(')')) {
        return `<div class="gameplay-action">${line.trim().slice(1, -1)}</div>`;
      }
      const falaMatch = line.match(/^(.+?):\s(.+)$/);
      if (falaMatch) {
        const personagem = falaMatch[1].trim();
        const fala = falaMatch[2].trim();
        return `<p class="gameplay-line"><strong>${personagem}:</strong> ${fala}</p>`;
      }
      return `<p>${line}</p>`;
    });
    return `<section class="gameplay-block">${parsed.join('\n')}</section>`;
  });

  const id = path.basename(filePath, '.md');

  if (secaoPai && secaoPai.items) {
    secaoPai.items.push({ id, title: data.titulo, ordem: data.ordem });
  }

  topicos[id] = {
    ...data,
    title: data.titulo,
    subtitle: data.subtitulo || '',
    template: data.template || (secaoPai?.template ?? 'simple'),
    icon: data.icone || secaoPai?.icon || 'fa-book',
    contentHtml: marked.parse(content)
  };
}

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
