"""Rebuild the "References" section at the end of every Markdown file.

How it works
- Inline markers like [2] or [4][10] in the text point to docs/references.json (numbers are the same in every file).
- This script finds the markers each file uses, then writes:
    1. "References": the sources that file cites, with hyperlinks
    2. "Other project references": every remaining source title, hyperlinked
  between <!-- refs:start --> and <!-- refs:end --> (safe to re-run).
Usage: python3 scripts/apply-refs.py
"""
import json, os, re

ROOT = os.path.join(os.path.dirname(__file__), '..')
REFS = json.load(open(os.path.join(ROOT, 'docs', 'references.json'), encoding='utf-8'))
START, END = '<!-- refs:start -->', '<!-- refs:end -->'
SKIP_DIRS = {'node_modules', 'dist', '.git'}
MARK = re.compile(r'(?<![\[\w])\[(\d{1,2})\](?!\()')

def md_files():
    for d, dirs, files in os.walk(ROOT):
        dirs[:] = [x for x in dirs if x not in SKIP_DIRS]
        for f in files:
            if f.endswith('.md'):
                yield os.path.join(d, f)

def cited(text):
    ids, fence = set(), False
    for line in text.splitlines():
        if line.strip().startswith('```'):
            fence = not fence
            continue
        if fence:
            continue
        ids |= {m for m in MARK.findall(line) if m in REFS}
    return sorted(ids, key=int)

def section(ids):
    out = [START, '## References', '']
    for i in ids:
        r = REFS[i]
        out.append(f"[{i}] {r['cite']} [{r['title']}]({r['url']})  ")
    if not ids:
        out.append('_No sources are cited in this file._')
    rest = [i for i in sorted(REFS, key=int) if i not in ids]
    out += ['', '### Other project references', '']
    out += [f"- [{i}] [{REFS[i]['title']}]({REFS[i]['url']})" for i in rest]
    out += ['', 'Numbers are the same in every file. Full list with notes on what we read: [`docs/REFERENCES.md`](' + os.path.relpath(os.path.join(ROOT, 'docs', 'REFERENCES.md'), start=os.path.dirname(PATH)).replace(os.sep, '/') + ').', END]
    return '\n'.join(out)

for PATH in md_files():
    text = open(PATH, encoding='utf-8').read()
    if os.path.basename(PATH) == 'REFERENCES.md':
        continue
    body = re.sub(re.escape(START) + r'.*?' + re.escape(END), '', text, flags=re.S).rstrip() + '\n'
    ids = cited(body)
    open(PATH, 'w', encoding='utf-8').write(body + '\n' + section(ids) + '\n')
    print(f"{os.path.relpath(PATH, ROOT):45s} cites {ids}")

# master list
lines = ['# References (master list)', '',
         'Numbers are used as inline markers like [2] in every Markdown file and in the concept note. "Status" says what we actually read, so nothing is cited beyond what we opened.', '',
         '| # | Source | Status |', '|---|---|---|']
for i in sorted(REFS, key=int):
    r = REFS[i]
    lines.append(f"| [{i}] | {r['cite']} [{r['title']}]({r['url']}) | {r['note']} |")
lines += ['', '## Cited by the Consensus reports but not opened by us', '',
          'Do not cite these until you have opened them: Karusala et al. (2024) and Huggins (2021) on safeguards; Hasan et al. (2026) on OCR for khatians; Safiullah (2021). They appear only through the Consensus P3 report [11].', '',
          'Regenerate the reference sections of all Markdown files with `python3 scripts/apply-refs.py`.']
open(os.path.join(ROOT, 'docs', 'REFERENCES.md'), 'w', encoding='utf-8').write('\n'.join(lines) + '\n')
print('docs/REFERENCES.md written')
