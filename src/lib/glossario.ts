import { slugify } from './slug'

export interface Secao {
  titulo: string
  slug: string
  corpo: string
}

const STOPWORDS = new Set([
  'de', 'da', 'do', 'das', 'dos', 'e', 'ou', 'a', 'o', 'as', 'os', 'em', 'para', 'por', 'com',
  'que', 'se', 'ao', 'no', 'na', 'nos', 'nas', 'um', 'uma', 'como', 'seu', 'sua', 'ser', 'não',
])

function limparLinha(linha: string): string {
  return linha
    .replace(/^#{1,6}\s+/, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/^-\s+/, '• ')
}

export function parseSecoes(markdown: string): Secao[] {
  const linhas = markdown.split('\n')
  const secoes: Secao[] = []
  let atual: Secao | null = null
  for (const linha of linhas) {
    const match = linha.match(/^##\s+(.+)$/)
    if (match) {
      if (atual) secoes.push(atual)
      const titulo = limparLinha(match[1].trim())
      atual = { titulo, slug: slugify(titulo), corpo: '' }
    } else if (atual && !linha.startsWith('# ') && !linha.startsWith('>')) {
      atual.corpo += limparLinha(linha) + '\n'
    }
  }
  if (atual) secoes.push(atual)
  return secoes
}

export function palavrasChave(texto: string): string[] {
  return texto
    .toLowerCase()
    .replace(/[^\p{L}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !STOPWORDS.has(w))
}
