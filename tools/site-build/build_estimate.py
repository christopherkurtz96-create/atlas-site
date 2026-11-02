#!/usr/bin/env python3
"""Stamp the estimator's runtime files from .private-tools/instant-estimator-v2 into /estimate/ for deploy.
Only the runtime allowlist is copied (no tests, no server scripts, no READMEs).
Usage: python3 tools/site-build/build_estimate.py   (run from anywhere; paths are relative to the repo root)"""
import os, shutil, hashlib, json
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, ".private-tools", "instant-estimator-v2")
OUT = os.path.join(ROOT, "estimate")
FILES = ["index.html", "styles.css", "app.js", "map.mjs", "shapes.mjs", "config.mjs", "geo.mjs", "guards.mjs", "pricing.mjs", "logo.svg",
         "vendor/maplibre-gl.mjs", "vendor/maplibre-gl-worker.mjs", "vendor/maplibre-gl.css", "vendor/LICENSE.txt"]
if not os.path.isdir(SRC):
    raise SystemExit(f"source not found: {SRC} (the private source lives outside git; this script is for the machine that has it)")
os.makedirs(os.path.join(OUT, "vendor"), exist_ok=True)
manifest = {}
for f in FILES:
    s, d = os.path.join(SRC, f), os.path.join(OUT, f)
    if os.path.islink(s) or os.path.islink(d):
        raise SystemExit(f"refusing symlink: {f}")
    shutil.copyfile(s, d)
    manifest[f] = hashlib.sha256(open(d, "rb").read()).hexdigest()
json.dump(manifest, open(os.path.join(OUT, "MANIFEST.json"), "w"), indent=2)
print(f"stamped {len(FILES)} files into {OUT}")
