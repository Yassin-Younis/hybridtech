import re, sys, os
src = sys.argv[1]; out = sys.argv[2]; os.makedirs(out, exist_ok=True)
svg = open(src, encoding="utf-8").read()
# top-level paths only: strip <defs>...</defs> and <g ...>...</g> blocks
body = re.sub(r"<defs>.*?</defs>", "", svg, flags=re.S)
body = re.sub(r"<g[ >].*?</g>", "", body, flags=re.S)
paths = re.findall(r'<path[^>]*?/>', body)
keep = []
for p in paths:
    fill = re.search(r'fill="([^"]+)"', p)
    d = re.search(r' d="([^"]+)"', p)
    if not fill or not d: continue
    f = fill.group(1)
    if f.startswith("rgb(94.7"): col = "#F1511B"
    elif f.startswith("rgb(0%, 36.8") or f.startswith("rgb(0%, 36.7"): col = "#005E8A"
    else: continue
    nums = [float(x) for x in re.findall(r'-?\d+\.?\d*', d.group(1))]
    xs, ys = nums[0::2], nums[1::2]
    if ys[0] > 100 or min(xs) > 200: continue
    keep.append((col, d.group(1), min(xs), max(xs), min(ys), max(ys)))
print(len(keep), "paths kept;", sum(1 for k in keep if k[0]=="#F1511B"), "orange", sum(1 for k in keep if k[0]=="#005E8A"), "blue")
pad = 1.5
minx = min(k[2] for k in keep)-pad; maxx = max(k[3] for k in keep)+pad
miny = min(k[4] for k in keep)-pad; maxy = max(k[5] for k in keep)+pad
print("bbox", round(minx,2), round(miny,2), round(maxx,2), round(maxy,2))
for k in sorted(keep, key=lambda k:k[2]): print(k[0], "x %.1f-%.1f y %.1f-%.1f" % (k[2],k[3],k[4],k[5]))
def write(name, items, color_fn, title, bbox=None):
    b = bbox or (minx, miny, maxx, maxy)
    w, h = b[2]-b[0], b[3]-b[1]
    s = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{b[0]:.2f} {b[1]:.2f} {w:.2f} {h:.2f}" role="img" aria-labelledby="t"><title id="t">{title}</title>'
    for k in items: s += f'<path fill="{color_fn(k[0])}" d="{k[1]}"/>'
    s += "</svg>"
    open(os.path.join(out, name), "w").write(s); print("wrote", name, f"{w:.1f}x{h:.1f}")
write("logo.svg", keep, lambda c: c, "Hybrid Technology")
write("logo-mono.svg", keep, lambda c: "currentColor", "Hybrid Technology")
# mark = leftmost blue paths (arc + its nodes): blue paths with maxx < 60
mark = [k for k in keep if k[0]=="#005E8A" and k[3] < 60]
mb = (min(k[2] for k in mark)-pad, min(k[4] for k in mark)-pad, max(k[3] for k in mark)+pad, max(k[5] for k in mark)+pad)
print("mark paths", len(mark), "bbox", [round(v,2) for v in mb])
write("mark.svg", mark, lambda c: c, "Hybrid Technology mark", mb)
write("mark-mono.svg", mark, lambda c: "currentColor", "Hybrid Technology mark", mb)
