"""Bundle procediments/recta-tangent.html into one artifact page (preview only: Claude artifact pages).
Usage: python3 procediments/proves/eines/empaqueta.py <repo-root> <katex-dist> <out.html> <proc.js> <Global> <title>
(set LC_ALL=C.UTF-8 when the title has accents)
KaTeX CSS is inlined with woff2 fonts as data URIs (the artifact CSP only allows
stylesheets from Google Fonts); local scripts are inlined; katex.min.js stays on cdnjs."""
import base64, os, re, sys

root, kd, out = sys.argv[1:4]
procjs, glob, titol = (sys.argv[4:7] + ['recta-tangent.js', 'RectaTangent', 'Recta tangent, pas a pas'])[:3] if len(sys.argv) > 4 else ('recta-tangent.js', 'RectaTangent', 'Recta tangent, pas a pas')
proc = os.path.join(root, 'procediments')

css = open(os.path.join(kd, 'katex.min.css')).read()
def font(m):
    data = base64.b64encode(open(os.path.join(kd, 'fonts', m.group(1) + '.woff2'), 'rb').read()).decode()
    return f'src:url(data:font/woff2;base64,{data}) format("woff2")'
css = re.sub(r'src:url\(fonts/([A-Za-z0-9_-]+)\.woff2\) format\("woff2"\),url\([^)]*\) format\("woff"\),url\([^)]*\) format\("truetype"\)', font, css)
assert 'fonts/' not in css

def js(name):
    s = open(os.path.join(proc, name)).read()
    assert '</script' not in s.lower()
    return s

motor = js('motor.js').replace("href: '../index.html'", "href: 'https://pau.step-quiz.net/'")
assert "pau.step-quiz.net" in motor

# Local scripts in the order the real page loads them (no hard-coded lists).
html = open(os.path.join(proc, procjs.replace('.js', '.html'))).read()
locals_ = '\n'.join('<script>\n' + (motor if n == 'motor.js' else js(n)) + '\n</script>'
                     for n in re.findall(r'<script src="([a-z0-9-]+\.js)"></script>', html))
assert procjs in locals_ or js(procjs) in locals_

page = f'''<title>{titol}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Code+Pro:wght@400;600&display=swap" rel="stylesheet">
<style>{css}</style>
<style>
{open(os.path.join(proc, 'estil.css')).read()}
</style>
<div id="procediment">
  <noscript><p class="error-carrega">Aquesta pàgina necessita JavaScript per mostrar l'animació.</p></noscript>
</div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js"></script>
{locals_}
<script>const procediment = Motor.inicia({glob});</script>
'''
os.makedirs(os.path.dirname(out), exist_ok=True)
open(out, 'w').write(page)
print(out, len(page) // 1024, 'KB')
