#!/usr/bin/env python3
"""Monthly technical SEO check for deployatlas.com.
Crawls every sitemap URL on the LIVE site and prints a markdown report:
status, canonical, H1 count, title/meta length, JSON-LD validity, word count, alt text, timing,
plus redirect/host/404 checks. Exit code 0 always; findings are in the report.
Usage: python3 tools/seo/site_check.py [--json out.json]
"""
import re, json, sys, time, html, urllib.request, urllib.error

SITE = "https://deployatlas.com"
UA = {"User-Agent": "Mozilla/5.0 (atlas-site-check)"}

def get(u):
    req = urllib.request.Request(u, headers=UA)
    t0 = time.time()
    try:
        r = urllib.request.urlopen(req, timeout=25)
        return r.status, r.read(), time.time() - t0, r.geturl()
    except urllib.error.HTTPError as e:
        return e.code, b"", time.time() - t0, u
    except Exception as e:
        return 0, b"", time.time() - t0, u

def main():
    st, body, _, _ = get(f"{SITE}/sitemap.xml")
    urls = re.findall(r"<loc>([^<]+)</loc>", body.decode())
    rows, issues = [], []
    for u in urls:
        st, b, dt, final = get(u)
        t = b.decode("utf-8", "ignore")
        title = html.unescape((re.search(r"<title>(.*?)</title>", t, re.S) or [None, ""])[1]).strip()
        meta = html.unescape((re.search(r'<meta name="description" content="(.*?)"', t, re.S) or [None, ""])[1])
        h1s = re.findall(r"<h1[^>]*>(.*?)</h1>", t, re.S)
        canon = (re.search(r'<link rel="canonical" href="([^"]+)"', t) or [None, ""])[1]
        bad = 0
        for blk in re.findall(r'<script type="application/ld\+json">(.*?)</script>', t, re.S):
            try: json.loads(blk)
            except Exception: bad += 1
        core = re.sub(r"<script.*?</script>|<style.*?</style>|<header.*?</header>|<footer.*?</footer>|<nav.*?</nav>", "", t, flags=re.S)
        words = len(re.sub(r"<[^>]+>", " ", core).split())
        imgs = re.findall(r"<img[^>]*>", t)
        noalt = sum(1 for i in imgs if 'alt="' not in i or 'alt=""' in i)
        rows.append(dict(url=u, status=st, ms=int(dt * 1000), title=title, tlen=len(title), mlen=len(meta), h1=len(h1s), canon=canon, badld=bad, words=words, noalt=noalt))
        p = u.replace(SITE, "") or "/"
        if st != 200: issues.append(("CRITICAL", p, f"status {st}"))
        if canon != u: issues.append(("HIGH", p, f"canonical is {canon}"))
        if len(h1s) != 1: issues.append(("HIGH", p, f"{len(h1s)} H1 tags"))
        if bad: issues.append(("HIGH", p, f"{bad} invalid JSON-LD block(s)"))
        if not title or len(title) > 60: issues.append(("MEDIUM", p, f"title {len(title)} chars"))
        if not meta or len(meta) > 160 or len(meta) < 80: issues.append(("MEDIUM", p, f"meta {len(meta)} chars"))
        if noalt: issues.append(("LOW", p, f"{noalt} image(s) without alt"))
        if words < 300 and "/blog/" not in u and p not in ("/contact", "/privacy", "/terms"): issues.append(("MEDIUM", p, f"thin page, {words} words"))
        if dt > 1.5: issues.append(("LOW", p, f"slow, {int(dt*1000)} ms"))
    checks = []
    for u, want in [("https://www.deployatlas.com/", "redirect to apex"), ("http://deployatlas.com/", "redirect to https"),
                    (f"{SITE}/services/demolition.html", "301 to /demolition/"), (f"{SITE}/instant-bid", "301 to /consultation/"),
                    (f"{SITE}/this-page-does-not-exist-xyz", "404"), (f"{SITE}/robots.txt", "200"), (f"{SITE}/llms.txt", "200")]:
        st, _, _, final = get(u)
        ok = (st == 404) if want == "404" else (st == 200 and (final.startswith(SITE) if "redirect" in want or "301" in want else True))
        checks.append((u, want, st, final, "ok" if ok else "CHECK"))
        if not ok: issues.append(("HIGH", u, f"expected {want}, got {st} -> {final}"))
    order = ["CRITICAL", "HIGH", "MEDIUM", "LOW"]
    issues.sort(key=lambda x: order.index(x[0]))
    print(f"# Site check {time.strftime('%Y-%m-%d')}\n")
    print(f"Pages: {len(rows)} | avg {sum(r['ms'] for r in rows)//max(1,len(rows))} ms | issues: {len(issues)}\n")
    print("| Severity | Page | Finding |\n|---|---|---|")
    for s, p, m in issues: print(f"| {s} | {p} | {m} |")
    if not issues: print("| — | — | none |")
    print("\n## Host, redirect and error checks\n\n| URL | Expected | Status | Final | Result |\n|---|---|---|---|---|")
    for u, want, st, final, res in checks: print(f"| {u} | {want} | {st} | {final} | {res} |")
    if "--json" in sys.argv:
        json.dump({"rows": rows, "issues": issues, "checks": checks}, open(sys.argv[sys.argv.index("--json") + 1], "w"), indent=1)

if __name__ == "__main__":
    main()
