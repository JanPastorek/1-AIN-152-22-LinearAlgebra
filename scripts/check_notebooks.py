"""Execute every core notebook in its own fresh kernel; fail on errors.

OCR and optional Manim are not course prerequisites and are excluded explicitly.
Executed outputs are local QA artifacts, never saved into teaching source files.
"""
from pathlib import Path
import json
import os
import sys
import time
import argparse
import subprocess
import nbformat
from nbclient import NotebookClient

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--engine', choices=['kernel', 'source'], default='kernel', help='source uses isolated IPython processes without kernel sockets')
parser.add_argument('--one', help=argparse.SUPPRESS)
args = parser.parse_args()
OUTPUT = ROOT / '.build/executed'
OUTPUT.mkdir(parents=True, exist_ok=True)
os.environ['MPLBACKEND'] = 'Agg'
os.environ['PATH'] = str(Path(sys.executable).parent) + os.pathsep + os.environ['PATH']
if args.one:
    from IPython.core.interactiveshell import InteractiveShell
    from IPython.utils.capture import capture_output
    path = Path(args.one)
    os.chdir(path.parent)
    nb = nbformat.read(path, as_version=4)
    shell = InteractiveShell.instance()
    for i, cell in enumerate(nb.cells):
        if cell.cell_type == 'code':
            with capture_output() as captured:
                result = shell.run_cell(cell.source, store_history=False)
            if result.error_before_exec or result.error_in_exec:
                print(captured.stdout, captured.stderr)
                raise RuntimeError(f'{path.name}, cell {i}: {result.error_before_exec or result.error_in_exec}')
    if 'Geometric_view' in path.name:
        result = shell.run_cell('a_x_slider.value = 0\na_y_slider.value = 0\nupdate()\non_reset(None)\nupdate()')
        result.raise_error()
    if path.parent.name == 'notebooks' and path.name != '02_tiny_tomography.ipynb':
        result = shell.run_cell('''
if sliders is not None:
    for slider in sliders.values():
        slider.value = slider.min
        slider.value = slider.max
    explore(**{key: slider.value for key, slider in sliders.items()})
''')
        result.raise_error()
    sys.exit(0)
paths = sorted(p for p in ROOT.glob('*.ipynb') if p.name != 'OCRusingTesseract.ipynb')
paths += sorted((ROOT/'notebooks').glob('*.ipynb'))
report = []
for path in paths:
    start = time.monotonic()
    nb = nbformat.read(path, as_version=4)
    nbformat.validate(nb)
    if args.engine == 'source':
        result = subprocess.run([sys.executable, str(Path(__file__).resolve()), '--one', str(path)], capture_output=True, text=True, timeout=240)
        if result.returncode:
            print(result.stdout[-12000:]); print(result.stderr[-12000:])
            raise RuntimeError(f'Source execution failed: {path.name}')
        print(f'PASS source: {path.relative_to(ROOT)}', flush=True)
        report.append({'notebook': str(path.relative_to(ROOT)), 'engine': 'isolated IPython source process', 'status': 'passed', 'seconds': round(time.monotonic()-start,2)})
        continue
    if path.name == '2_Geometric_view_of_linear_algebra_checkpoint.ipynb':
        nb.cells.append(nbformat.v4.new_code_cell('''
# Regression: sliders must still work after the final 3D plot has executed.
a_x_slider.value = 0
a_y_slider.value = 0
assert np.isnan(angle_between(np.zeros(2), np.ones(2)))
update()
on_reset(None)
assert a_x_slider.value == 2
update()
'''))
    if path.parent.name == 'notebooks' and path.name != '02_tiny_tomography.ipynb':
        nb.cells.append(nbformat.v4.new_code_cell('''
# Exercise actual observer state at both ends of each slider range.
if sliders is not None:
    for slider in sliders.values():
        slider.value = slider.min
        slider.value = slider.max
    # Call directly too: widget callback exceptions must not mask a plot error.
    explore(**{key: slider.value for key, slider in sliders.items()})
'''))
    print(f'Executing {path.relative_to(ROOT)} ...', flush=True)
    NotebookClient(nb, timeout=180, kernel_name='python3', resources={'metadata': {'path': str(path.parent)}}, allow_errors=False).execute()
    nbformat.write(nb, OUTPUT/path.name)
    errors = [out for cell in nb.cells if cell.cell_type == 'code' for out in cell.get('outputs', []) if out.output_type == 'error']
    if errors:
        raise RuntimeError(f'Unexpected error output in {path.name}')
    report.append({'notebook': str(path.relative_to(ROOT)), 'status': 'passed', 'seconds': round(time.monotonic()-start, 2)})
(ROOT/f'.build/notebook-results-{args.engine}.json').write_text(json.dumps(report, indent=2)+'\n')
print(f'PASS: {len(report)} notebooks; engine={args.engine}. Browser rendering is a separate manual check.')
