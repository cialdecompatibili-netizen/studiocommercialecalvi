import os, re, glob, subprocess
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(R)
os.makedirs('_servizi', exist_ok=True)

def rw(p, fn):
    s = open(p, encoding='utf-8').read()
    n = fn(s)
    if n != s:
        open(p, 'w', encoding='utf-8', newline='\n').write(n)

# 1) articoli -> _servizi
moved = 0
for p in glob.glob('_posts/*.md'):
    dst = '_servizi/' + os.path.basename(p)
    subprocess.run(['git', 'mv', p, dst], check=True)
    rw(dst, lambda s: s.replace('permalink: /blog/', 'permalink: /servizi/', 1))
    moved += 1
print('spostati', moved)

# 2) pagine categoria + pagina servizi
for p in glob.glob('_pages/cat-*.md'):
    if 'cat-list' in p:
        continue
    def f(s):
        s = s.replace('permalink: /blog/', 'permalink: /servizi/', 1)
        return s.replace('{% include lista-categoria.html cat=page.categoria %}',
                         '{% include lista-categoria.html cat=page.categoria src="servizi" %}')
    rw(p, f)
rw('_pages/servizi.md', lambda s: s.replace("'/blog/", "'/servizi/"))

# 3) redirect vecchi
for p in glob.glob('redirect/*.html'):
    rw(p, lambda s: s.replace('/blog/', '/servizi/'))

# 4) include lista-categoria
def inc(s):
    s = s.replace('{%- assign posts_l = site.posts | where: "lang", page.lang -%}',
                  '{%- if include.src == "servizi" -%}{%- assign posts_l = site.servizi | where: "lang", page.lang | sort: "date" | reverse -%}{%- assign home_ref = "servizi" -%}{%- else -%}{%- assign posts_l = site.posts | where: "lang", page.lang -%}{%- assign home_ref = "blog" -%}{%- endif -%}')
    s = s.replace('{% include url-ref.html ref="blog" %}', '{% include url-ref.html ref=home_ref %}')
    s = s.replace('">Blog</a> &rsaquo;', '">{% if home_ref == "servizi" %}Servizi{% else %}Blog{% endif %}</a> &rsaquo;')
    return s
rw('_includes/lista-categoria.html', inc)
print('ok')
