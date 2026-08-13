"""Redraws the blue checkmark accent in VORQA logo/amblem PNGs with a thinner,
more proportional stroke instead of the current thick/blobby one."""
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage


def detect_blue_mask(arr, min_alpha=150):
    r, g, b, a = arr[:, :, 0].astype(int), arr[:, :, 1].astype(int), arr[:, :, 2].astype(int), arr[:, :, 3]
    mask = (a > min_alpha) & (b > 150) & (r < 100) & (b - r > 80) & (g > 40) & (g < 180)
    # opening removes isolated antialiasing-edge speckle noise while keeping the solid checkmark blob
    return ndimage.binary_opening(mask, iterations=2)


def detect_letter_mask(arr, letter_color, min_alpha=150, tol=60):
    r, g, b, a = arr[:, :, 0].astype(int), arr[:, :, 1].astype(int), arr[:, :, 2].astype(int), arr[:, :, 3]
    lr, lg, lb = letter_color
    d = np.sqrt((r - lr) ** 2 + (g - lg) ** 2 + (b - lb) ** 2)
    return (a > min_alpha) & (d < tol)


def nearest_cluster_tip(letter_mask, region_box, near_point, exclude_mask=None, max_radius=90):
    y0, y1, x0, x1 = region_box
    cy, cx = int(near_point[1]), int(near_point[0])
    ry0, ry1 = max(0, cy - max_radius), cy + max_radius
    rx0, rx1 = max(0, cx - max_radius), cx + max_radius
    sub = letter_mask[ry0:ry1, rx0:rx1].copy()
    if exclude_mask is not None:
        sub &= ~exclude_mask[ry0:ry1, rx0:rx1]
    cys, cxs = np.where(sub)
    if len(cxs) == 0:
        return None
    cpts = np.stack([cxs + rx0, cys + ry0], axis=1)
    d = np.linalg.norm(cpts - np.array(near_point), axis=1)
    return cpts[np.argmin(d)]


def fix_checkmark(in_path, out_path, letter_color, bg_fill, new_width, region_pad=20,
                   erase_dilate=2, blue_color=(13, 110, 210, 255), extend_px=6,
                   min_alpha=150, tip_search_radius=50, verbose=True,
                   manual_left_tip=None, manual_right_tip=None):
    im = Image.open(in_path).convert('RGBA')
    arr = np.array(im).astype(int)
    arr_u8_view = np.array(im)

    blue_mask = detect_blue_mask(arr_u8_view, min_alpha=min_alpha)
    ys, xs = np.where(blue_mask)
    if len(xs) == 0:
        raise ValueError('no checkmark found in ' + in_path)
    y0, y1, x0, x1 = max(0, ys.min() - region_pad), ys.max() + region_pad, max(0, xs.min() - region_pad), xs.max() + region_pad

    # a tighter blue-only fringe (excludes navy/white-letter antialiasing, which
    # also reads as faintly "blue-ish" under a loose threshold) plus dilation
    # covers the checkmark's own AA edge without eating into nearby letter strokes
    r_, g_, b_ = arr_u8_view[:, :, 0].astype(int), arr_u8_view[:, :, 1].astype(int), arr_u8_view[:, :, 2].astype(int)
    fringe = (arr_u8_view[:, :, 3] > 30) & (r_ < g_ * 0.75) & (b_ > r_) & (b_ > 90)
    region = np.zeros_like(blue_mask)
    region[y0:y1, x0:x1] = True
    erase_mask = ndimage.binary_dilation((blue_mask | fringe) & region, iterations=erase_dilate)

    pts = np.stack([xs, ys], axis=1)
    vertex = pts[np.argmax(pts[:, 1])].astype(float)
    leftmost = pts[np.argmin(pts[:, 0])].astype(float)
    rightmost = pts[np.argmax(pts[:, 0])].astype(float)

    if manual_left_tip is not None:
        left_tip = np.array(manual_left_tip)
    else:
        letter_mask = detect_letter_mask(arr_u8_view, letter_color, min_alpha=min_alpha)
        left_tip = nearest_cluster_tip(letter_mask, (y0, y1, x0, x1), leftmost, exclude_mask=erase_mask, max_radius=tip_search_radius)
    if manual_right_tip is not None:
        right_tip = np.array(manual_right_tip)
    else:
        letter_mask = detect_letter_mask(arr_u8_view, letter_color, min_alpha=min_alpha)
        right_tip = nearest_cluster_tip(letter_mask, (y0, y1, x0, x1), rightmost, exclude_mask=erase_mask, max_radius=tip_search_radius)

    def extend(p_from, p_toward, extra):
        d = p_toward - p_from
        n = np.linalg.norm(d)
        if n < 1e-6:
            return p_toward
        return p_toward + d / n * extra

    left_end = extend(vertex, left_tip.astype(float), extend_px) if left_tip is not None else leftmost
    right_end = extend(vertex, right_tip.astype(float), extend_px) if right_tip is not None else rightmost

    out = arr_u8_view.copy()
    out[erase_mask] = bg_fill
    out_im = Image.fromarray(out, 'RGBA')
    draw = ImageDraw.Draw(out_im)
    ptlist = [tuple(left_end), tuple(vertex), tuple(right_end)]
    draw.line(ptlist, fill=blue_color, width=new_width, joint='curve')
    rc = new_width / 2
    for pt in ptlist:
        draw.ellipse([pt[0] - rc, pt[1] - rc, pt[0] + rc, pt[1] + rc], fill=blue_color)

    out_im.save(out_path)
    if verbose:
        print(f'{in_path}: vertex={vertex} left_tip={left_tip} right_tip={right_tip} width={new_width}')
    return out_im
