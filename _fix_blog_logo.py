import glob, re

nav_old = '''<img src="/brand_assets/vorqa_amblem_transparent.png" alt="Vorqa Global" width="24" height="24" style="display:block;flex-shrink:0"><span style="font-family:'Sora Variable',Sora,sans-serif;font-weight:700;font-size:19px;letter-spacing:-.02em;color:#0A2540;margin-left:10px">VORQA</span><span style="font-family:'JetBrains Mono Variable',monospace;font-size:8px;letter-spacing:2.5px;text-transform:uppercase;margin-left:10px;border-left:1px solid rgba(10,37,64,.14);padding-left:10px;color:rgba(10,37,64,.4)">Global</span>'''
nav_new = '''<img src="/brand_assets/vorqa_logo_main_cropped.png" alt="Vorqa Global" style="display:block;height:28px;width:auto">'''

foot_old = '''<img src="/brand_assets/vorqa_amblem_white.png" alt="" width="20" height="20" style="display:block;flex-shrink:0">'''
foot_new = '''<span class="foot-logo-plaque"><img src="/brand_assets/vorqa_logo_main_cropped.png" alt="Vorqa Global"></span>'''

css_anchor = '.ft-social{display:flex;gap:16px;align-items:center}'
css_inject = css_anchor + '\n.foot-logo-plaque{display:inline-flex;align-items:center;background:#fff;border-radius:5px;padding:5px 12px;box-shadow:0 2px 10px rgba(0,0,0,.15)}\n.foot-logo-plaque img{display:block;height:22px;width:auto}'

files = glob.glob('vorqa-blog/*.html')
for f in files:
    with open(f, 'r', encoding='utf-8') as fh:
        content = fh.read()
    orig = content
    assert nav_old in content, f'nav pattern not found in {f}'
    assert foot_old in content, f'foot pattern not found in {f}'
    assert css_anchor in content, f'css anchor not found in {f}'
    content = content.replace(nav_old, nav_new)
    content = content.replace(foot_old, foot_new)
    content = content.replace(css_anchor, css_inject)
    if content != orig:
        with open(f, 'w', encoding='utf-8') as fh:
            fh.write(content)
        print('updated', f)
