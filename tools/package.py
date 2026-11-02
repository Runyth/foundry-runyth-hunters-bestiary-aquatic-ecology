from pathlib import Path
import hashlib, json, zipfile, shutil
ROOT=Path(__file__).resolve().parents[1]
DIST=ROOT/'dist'
if DIST.exists(): shutil.rmtree(DIST)
DIST.mkdir(parents=True, exist_ok=True)
MANIFEST=json.loads((ROOT/'module.json').read_text(encoding='utf-8'))
VERSION=MANIFEST['version']; MOD=MANIFEST['id']; FIXED=(2026,1,1,0,0,0)
RUNTIME=['module.json','README.md','CHANGELOG.md','LICENSE','main.mjs','scripts','styles','templates','lang','data','assets']
EXCLUDE={'dist','.git','node_modules','__pycache__'}
def files_for(parts):
  out=[]
  for part in parts:
    p=ROOT/part
    if p.is_file(): out.append(p)
    elif p.is_dir(): out += [f for f in p.rglob('*') if f.is_file()]
  return sorted(out, key=lambda p:p.relative_to(ROOT).as_posix())
def source_files():
  return sorted([p for p in ROOT.rglob('*') if p.is_file() and not any(x in EXCLUDE for x in p.relative_to(ROOT).parts)], key=lambda p:p.relative_to(ROOT).as_posix())
def write_zip(target, files):
  with zipfile.ZipFile(target,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for f in files:
      info=zipfile.ZipInfo(f'{MOD}/{f.relative_to(ROOT).as_posix()}',FIXED); info.compress_type=zipfile.ZIP_DEFLATED; info.external_attr=0o100644<<16
      z.writestr(info,f.read_bytes())
install=DIST/f'{MOD}-v{VERSION}.zip'; source=DIST/f'{MOD}-source-v{VERSION}.zip'
write_zip(install,files_for(RUNTIME)); write_zip(source,source_files())

def verify_manifest_paths(archive):
  with zipfile.ZipFile(archive) as z:
    names=set(z.namelist())
    referenced=list(MANIFEST.get('esmodules',[]))+list(MANIFEST.get('scripts',[]))+list(MANIFEST.get('styles',[]))+[entry['path'] for entry in MANIFEST.get('languages',[])]
    missing=[path for path in referenced if f'{MOD}/{path}' not in names]
    if missing:
      raise RuntimeError(f'Manifest paths missing from {archive.name}: {missing}')
    for name in names:
      normalized=Path(name)
      if normalized.is_absolute() or '..' in normalized.parts:
        raise RuntimeError(f'Unsafe archive path in {archive.name}: {name}')

verify_manifest_paths(install)
verify_manifest_paths(source)
checks=DIST/f'{MOD}-v{VERSION}-SHA256SUMS.txt'
checks.write_text('\n'.join(f'{hashlib.sha256(p.read_bytes()).hexdigest()}  {p.name}' for p in [install,source])+'\n')
print(install); print(source); print(checks)
