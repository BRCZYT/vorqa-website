from PIL import Image
import numpy as np

for name in ['vorqa_logo_white.png', 'vorqa_logo_main.png']:
    path = f'brand_assets/{name}'
    img = Image.open(path)
    print(f'=== {name} ===')
    print('size:', img.size)
    print('mode:', img.mode)
    print('bands:', img.getbands())

    arr = np.array(img.convert('RGBA'))
    alpha = arr[:, :, 3]
    print('alpha min/max:', alpha.min(), alpha.max())
    print('has transparency (any alpha < 255):', bool((alpha < 255).any()))
    print('fully transparent pixel count:', int((alpha == 0).sum()), '/', alpha.size)

    # Sample corner pixel (background) vs center pixel
    h, w = alpha.shape
    corner = arr[5, 5]
    center = arr[h//2, w//2]
    print('corner pixel (RGBA):', corner.tolist())
    print('center pixel (RGBA):', center.tolist())

    # Unique colors count (a rough proxy for "clean flat design" vs "noisy/artifact-laden")
    opaque_mask = alpha > 10
    if opaque_mask.sum() > 0:
        opaque_pixels = arr[opaque_mask][:, :3]
        unique_colors = len(np.unique(opaque_pixels.reshape(-1, 3), axis=0))
        print('unique RGB colors among opaque-ish pixels:', unique_colors)
    print()
