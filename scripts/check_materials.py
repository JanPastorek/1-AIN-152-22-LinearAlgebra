"""Validate course navigation, task/solution coverage and clean notebook sources."""
from pathlib import Path
import ast
import json
import re
import sys
from urllib.parse import unquote, urlsplit
import nbformat

ROOT = Path(__file__).resolve().parents[1]
errors = []
manifest = json.loads((ROOT/'data/semester.json').read_text())
if [row['week'] for row in manifest] != list(range(1,14)):
    errors.append('Semester manifest must cover weeks 1 through 13 exactly once.')
for row in manifest:
    for kind in ['sheet', 'solutions']:
        path = ROOT/row[kind]
        if not path.exists():
            errors.append(f'Missing {kind}: {path}'); continue
        body = path.read_text()
        for task in row['tasks']:
            if len(re.findall(r'^## '+re.escape(task)+r'\s*$',body,re.M)) != 1:
                errors.append(f'{row[kind]} must contain exactly one section for {task}.')
        if re.search(r'\b(?:TODO|TBD|FIXME)\b',body):
            errors.append(f'Unfinished placeholder in {row[kind]}')
    if row['minutes'] != 90:
        errors.append(f'Unexpected duration for week {row["week"]}')
    if row['lab'] and not (ROOT/'notebooks'/row['lab']).exists():
        errors.append(f'Missing lab for week {row["week"]}')

markdown_paths = [ROOT/'README.md']
for folder in ['seminars','solutions','assessment','docs','extras']:
    markdown_paths += list((ROOT/folder).rglob('*.md'))
documents = [(path, path.read_text()) for path in markdown_paths]
notebooks = sorted(p for p in ROOT.glob('*.ipynb') if p.name!='OCRusingTesseract.ipynb')
notebooks += sorted((ROOT/'notebooks').glob('*.ipynb'))
for path in notebooks:
    nb = nbformat.read(path,as_version=4)
    nbformat.validate(nb)
    documents.append((path,'\n'.join(cell.source for cell in nb.cells if cell.cell_type=='markdown')))
    for i,cell in enumerate(nb.cells):
        if cell.cell_type=='code':
            if cell.outputs or cell.execution_count is not None:
                errors.append(f'{path.name} cell {i}: commit clean sources without outputs.')
            if re.search(r'^\s*[!%]',cell.source,re.M):
                errors.append(f'{path.name} cell {i}: shell/magic command in core notebook.')
            try: ast.parse(cell.source)
            except SyntaxError as exc: errors.append(f'{path.name} cell {i}: {exc}')

links = 0
for path,body in documents:
    for target in re.findall(r'!?\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)',body):
        split = urlsplit(target)
        if split.scheme or split.netloc or not split.path: continue
        dest = path.parent/unquote(split.path)
        links += 1
        if not dest.exists(): errors.append(f'{path.relative_to(ROOT)}: broken relative link {target}')
for path in [ROOT/'la_labs.py', *list((ROOT/'scripts').glob('*.py')), *list((ROOT/'tests').glob('*.py'))]:
    try: ast.parse(path.read_text())
    except SyntaxError as exc: errors.append(f'{path}: {exc}')
if errors:
    print('\n'.join(errors)); sys.exit(1)
print(f'PASS: 13 paired seminar sheets, {len(notebooks)} clean core notebooks, {links} local links, Python syntax.')
