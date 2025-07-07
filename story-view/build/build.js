import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { z } from 'zod';

const conteudoPath = path.resolve('conteudo');
const distPath = path.resolve('dist');
const configPath = path.join(conteudoPath, 'config.json');

// Schema com novos campos personalizados
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

// Suporte a blocos internos com ### Título
function processarBlocosEspeciais(markdown) {
  const lines = markdown.split('\n');
  let result = [];

  const firstHeadingIndex = lines.findIndex(line => line.match(/^###\s+.*/));
  if (firstHeadingIndex > 0) {
      result.push(lines.slice(0, firstHeadingIndex).join('\n'));
  } else if (firstHeadingIndex === -1) {
      result.push(lines.join('\n'));
      return marked.parse(result.join(''));
  }

  const contentAfterFirstHeading = lines.slice(firstHeadingIndex).join('\n');
  const blocks = contentAfterFirstHeading.split(/(?=^###\s+.*$)/m);

  blocks.forEach(block => {
      if (block.trim() === '') return;
      const blockLines = block.trim().split('\n');
      const title = blockLines[0].replace(/^###\s+/, '').trim();
      const content = blockLines.slice(1).join('\n');
      result.push(`<div class="bloco"><h3>${title}</h3>\n${marked.parse(content)}</div>`);
  });

  return result.join('\n');
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
    buildId: Math.random().toString(36).substring(2), // força mudança
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
