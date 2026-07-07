# PCA-10 Study Platform — Spec para Claude Code

## Contexto
Certificação ABAC PCA-10 (venda de consórcio). Curso preparatório que eu usava
(ConKey) foi descontinuado. Preciso de uma plataforma local para (1) revisar
teoria e (2) gerar simulados que imitam a prova real o mais fielmente possível.
Prova em ~2 dias — priorize algo funcional rápido, com espaço para evoluir depois.

## Estrutura real da prova (fonte: Edital Oficial ABAC/Kaptiva, v3.0, 23/03/2023)
A prova real NÃO tem peso igual entre módulos. Isso é crítico pro gerador de simulado:

| Módulo | Nome oficial              | Qtd. questões | Pontos/questão | Total do módulo |
|--------|----------------------------|---------------|-----------------|------------------|
| 1      | Objetivos e Legislação      | 15            | 1,60            | 24,0             |
| 2      | Funcionamento e Processos   | 20            | 1,30            | 26,0             |
| 3      | Cálculos Financeiros        | 10            | 2,50            | 25,0             |
| 4      | Ética e Melhores Práticas   | 5             | 5,00            | 25,0             |
| **Total** |                          | **50**        |                 | **100**          |

- Aprovação: **≥70% do total geral** E **nenhum módulo pode zerar** (0 acertos no módulo = reprovado, mesmo passando no total).
- Tempo de prova real: **120 minutos**, 50 questões, sem possibilidade de voltar questão.
- No meu mapeamento interno de módulos (`etica`, `legislacao`, `processos`, `calculos`) o
  módulo oficial "Objetivos e Legislação" = `legislacao` e "Funcionamento e Processos" = `processos`.

## Dados já prontos (não precisa gerar, só consumir)
```
data/questions.json    → 90 questões já extraídas, com gabarito e explicação
data/glossario.md      → teoria de referência (Fundo Comum, Taxa Adm, fórmulas, etc.)
raw/                   → PDFs e MDs originais, para auditoria/reprocessamento
build_questions.py     → script que gerou o questions.json (fonte de verdade do gabarito)
parser.py              → CLI para ingerir NOVO material de estudo no futuro (usa Claude API)
```

Schema de cada questão em `questions.json`:
```json
{
  "id": 1,
  "modulo": "etica",
  "enunciado": "...",
  "opcoes": {"a": "...", "b": "...", "c": "...", "d": "..."},
  "gabarito": "b",
  "explicacao": "...",
  "fonte_arquivo": "QUESTÕES_SOBRE_ÉTICA_E_BOAS_PRATICAS.pdf",
  "vezes_respondida": 0,
  "vezes_correta": 0
}
```

⚠️ **90 questões é pouco para 50 questões/simulado sem repetição excessiva**, especialmente
em `etica` (só 10 no banco, mas a prova real pede 5 por módulo — dá pra rotacionar) e em
`calculos` (20 no banco vs 10 na prova — ok). O app deve deixar isso visível ao usuário
(ex.: "banco tem 10 questões de ética, prova pede 5 — pouca variedade, considere revisar
teoria além de simular").

## Stack sugerida
- **Frontend**: React + Vite + TypeScript + Tailwind (single-page app, tudo client-side)
- **Persistência**: localStorage (é um app pessoal, single-user, rodando local) —
  guardar: histórico de simulados, estatísticas por módulo/questão, questões marcadas
  para revisão.
- **Sem backend**: `questions.json` é lido estaticamente do `data/`. Se no futuro o
  parser.py adicionar questões, é só rebuildar o app.
- Rodar com `npm run dev` no VS Code.

## Telas / Funcionalidades

### 1. Dashboard (Home)
- Progresso geral: % de acerto histórico por módulo (etica/legislacao/processos/calculos)
- Botão destaque: "Simulado Completo (50 questões, cronometrado)"
- Botões secundários: "Treino por módulo", "Revisão teórica", "Questões que mais erro"
- Contagem regressiva até a data da prova (input configurável, default: 2 dias a partir de hoje)

### 2. Modo Revisão (teoria)
- Renderiza `data/glossario.md` com navegação por seção (sidebar com âncoras)
- Cada conceito do glossário pode linkar para as questões do banco que o testam
  (match simples por palavras-chave do módulo, não precisa ser NLP sofisticado)

### 3. Simulado Completo (fiel à prova real)
- Sorteia **exatamente** 15 de legislacao + 20 de processos + 10 de calculos + 5 de etica
  = 50 questões, na ordem embaralhada dos módulos entre si (não em blocos, como a prova real)
- Se o banco não tiver questões suficientes num módulo (ex: só 10 de ética, precisa de 5
  — ok; mas se pedisse mais que o banco tem, repita com aviso visível "questão repetida
  por banco limitado")
- Cronômetro regressivo de 120 minutos, visível, com aviso nos últimos 10 minutos
- Sem possibilidade de voltar questão respondida (replica a regra real do edital,
  mas ofereça um toggle "modo treino" que permite voltar, para quem quiser praticar sem essa pressão)
- Ao final: calcula pontuação ponderada exata (1,60 / 1,30 / 2,50 / 5,00 por módulo),
  mostra % geral, % por módulo, e destaca se algum módulo zerou (reprovação automática
  mesmo com média geral ≥70%)
- Tela de revisão pós-simulado: cada questão errada mostra gabarito + explicação

### 4. Treino por módulo
- Escolhe um módulo, define quantidade de questões, sem cronômetro
- Feedback imediato (certo/errado + explicação) a cada resposta, não só no final

### 5. Questões que mais erro (spaced repetition simples)
- Ordena por `vezes_respondida > 0 AND (vezes_correta/vezes_respondida)` ascendente
- Prioriza isso nos treinos por módulo quando o usuário pedir "revisão dos erros"

### 6. Import de novas questões (opcional, fase 2)
- Botão "Adicionar material" que apenas instrui a rodar `python parser.py raw/arquivo.pdf`
  no terminal (não precisa expor a API key no frontend) e depois recarregar o app

## Considerações de UX
- Mobile-first não é prioridade (uso em notebook/VS Code local), mas deixe responsivo básico.
- Cores neutras, foco em legibilidade — é para estudo sob pressão de tempo, evitar poluição visual.
- Todo texto em pt-BR.

## O que NÃO fazer
- Não inventar questões novas sem fonte — só usar o banco de `questions.json`.
- Não remover o campo `fonte_arquivo` (serve de auditoria caso um gabarito esteja errado
  e precise ser corrigido em `build_questions.py`).
- Não persistir dados em servidor externo — tudo local (localStorage).

## Comando inicial sugerido para o Claude Code
"Leia data/questions.json e data/glossario.md, depois monte o scaffold do projeto Vite +
React + Tailwind conforme as telas descritas neste spec, começando pelo Simulado Completo
e Dashboard, que são as mais urgentes dado que a prova é em 2 dias."
