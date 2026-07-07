#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
parser.py — CLI de ingestão de material de estudo para o banco de questões PCA-10.

Uso:
    export ANTHROPIC_API_KEY=sk-ant-...
    python parser.py raw/novo_material.md
    python parser.py raw/                      # processa a pasta inteira
    python parser.py raw/novo.pdf --dry-run     # só mostra o que seria extraído

O que faz:
  1. Lê um arquivo (.md, .txt ou .pdf via pdfplumber) da pasta raw/.
  2. Manda o conteúdo para o Claude com um prompt fixo pedindo extração
     estruturada de questões (id, modulo, enunciado, opcoes, gabarito, explicacao).
  3. Valida o JSON retornado contra um schema mínimo.
  4. Faz merge em data/questions.json, continuando a numeração de id a partir
     do maior id já existente (evita colisão).
  5. Nunca sobrescreve questões existentes — só adiciona novas (idempotente
     por hash do enunciado).

Requisitos:
    pip install anthropic pdfplumber --break-system-packages
"""
import argparse
import hashlib
import json
import os
import sys
from pathlib import Path

DATA_PATH = Path(__file__).parent / "data" / "questions.json"
MODULOS_VALIDOS = {"etica", "legislacao", "processos", "calculos"}

SYSTEM_PROMPT = """Você atua como Engenheiro de Dados especializado em processar material \
de estudo para a certificação ABAC PCA-10 (consórcios). Você recebe texto bruto \
(extraído de PDF ou Markdown) contendo questões de múltipla escolha, com ou sem \
gabarito/explicação explícitos.

Converta o conteúdo em uma lista JSON seguindo EXATAMENTE este schema, e nada além do JSON:

[
  {
    "modulo": "etica" | "legislacao" | "processos" | "calculos",
    "enunciado": "string - texto completo da pergunta",
    "opcoes": {"a": "string", "b": "string", "c": "string", "d": "string"},
    "gabarito": "a" | "b" | "c" | "d",
    "explicacao": "string curta (1-3 frases) justificando a resposta"
  }
]

Regras:
- Classifique o "modulo" pelo assunto: legislação (Lei 11.795/08, contratos, assembleias,
  cotas), processos (rotina operacional, transferências, contemplação prática, dados
  cadastrais), calculos (fórmulas, parcelas, saldo devedor, lances) ou etica (postura do
  vendedor, CDC, boas práticas).
- Se o gabarito não estiver explícito no texto, resolva você mesmo usando conhecimento
  da Lei 11.795/2008 e do Sistema de Consórcios, e sinalize isso deixando a explicação
  clara sobre o raciocínio usado.
- Se não for possível determinar o gabarito com segurança, marque "gabarito": "INCERTO"
  e explique a dúvida em "explicacao" — não invente.
- Não inclua nenhum texto fora do array JSON (sem markdown fences, sem preâmbulo).
"""


def extract_text(path: Path) -> str:
    if path.suffix.lower() == ".pdf":
        import pdfplumber
        text = []
        with pdfplumber.open(path) as pdf:
            for page in pdf.pages:
                text.append(page.extract_text() or "")
        return "\n".join(text)
    return path.read_text(encoding="utf-8", errors="ignore")


def call_claude(raw_text: str) -> list:
    from anthropic import Anthropic
    client = Anthropic()  # usa ANTHROPIC_API_KEY do ambiente
    resp = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=8000,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": raw_text[:180000]}]
    )
    text = "".join(b.text for b in resp.content if b.type == "text")
    text = text.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    return json.loads(text)


def question_hash(q: dict) -> str:
    return hashlib.sha1(q["enunciado"].strip().lower().encode()).hexdigest()


def load_db() -> dict:
    if DATA_PATH.exists():
        return json.loads(DATA_PATH.read_text(encoding="utf-8"))
    return {"meta": {"total_questoes": 0, "modulos": sorted(MODULOS_VALIDOS)}, "questions": []}


def save_db(db: dict):
    db["meta"]["total_questoes"] = len(db["questions"])
    DATA_PATH.write_text(json.dumps(db, ensure_ascii=False, indent=2), encoding="utf-8")


def merge_questions(db: dict, new_items: list, source_file: str) -> int:
    existing_hashes = {question_hash(q) for q in db["questions"]}
    next_id = max((q["id"] for q in db["questions"]), default=0) + 1
    added = 0
    for item in new_items:
        if item.get("modulo") not in MODULOS_VALIDOS:
            print(f"  [SKIP] modulo inválido: {item.get('modulo')!r} -> {item.get('enunciado', '')[:60]}")
            continue
        if item.get("gabarito") not in {"a", "b", "c", "d"}:
            print(f"  [REVISAR] gabarito incerto: {item.get('enunciado', '')[:60]}")
        h = question_hash(item)
        if h in existing_hashes:
            continue  # já existe, idempotente
        item["id"] = next_id
        item["fonte_arquivo"] = source_file
        item["vezes_respondida"] = 0
        item["vezes_correta"] = 0
        db["questions"].append(item)
        existing_hashes.add(h)
        next_id += 1
        added += 1
    return added


def process_file(path: Path, dry_run: bool = False):
    print(f"Processando {path.name} ...")
    raw_text = extract_text(path)
    if not raw_text.strip():
        print("  (arquivo vazio ou sem texto extraível, pulando)")
        return
    items = call_claude(raw_text)
    print(f"  {len(items)} questões extraídas pelo modelo.")
    if dry_run:
        print(json.dumps(items[:3], ensure_ascii=False, indent=2))
        return
    db = load_db()
    added = merge_questions(db, items, path.name)
    save_db(db)
    print(f"  {added} novas questões adicionadas ao banco (total agora: {len(db['questions'])}).")


def main():
    ap = argparse.ArgumentParser(description="Ingestão de material de estudo PCA-10")
    ap.add_argument("path", help="Arquivo ou pasta em raw/ para processar")
    ap.add_argument("--dry-run", action="store_true", help="Mostra o resultado sem salvar")
    args = ap.parse_args()

    target = Path(args.path)
    files = [target] if target.is_file() else sorted(
        [p for p in target.glob("*") if p.suffix.lower() in {".pdf", ".md", ".txt"}]
    )
    if not files:
        print("Nenhum arquivo .pdf/.md/.txt encontrado.")
        sys.exit(1)
    for f in files:
        process_file(f, dry_run=args.dry_run)


if __name__ == "__main__":
    main()
