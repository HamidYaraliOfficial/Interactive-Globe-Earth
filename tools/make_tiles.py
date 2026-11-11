#!/usr/bin/env python3
"""Builds data/earth.jpg (8192x4096) and data/tiles/<row><col>.jpg (32 high-res tiles, 2700px each = 60 px/deg) from Natural Earth I (public domain)."""
import os, urllib.request, numpy as np
from PIL import Image, ImageEnhance
Image.MAX_IMAGE_PIXELS = None
os.makedirs('../data/tiles', exist_ok=True)
enh = lambda im: ImageEnhance.Color(ImageEnhance.Contrast(im).enhance(1.12)).enhance(1.2)
if not os.path.exists('/tmp/ne1.tif'):
    urllib.request.urlretrieve('https://raw.githubusercontent.com/nvkelso/natural-earth-raster/master/50m_rasters/NE1_50M_LC_SR_W/NE1_50M_LC_SR_W.tif', '/tmp/ne1.tif')
enh(Image.open('/tmp/ne1.tif').convert('RGB').resize((8192, 4096), Image.LANCZOS)).save('../data/earth.jpg', quality=76, optimize=True, progressive=True)
U = 'https://raw.githubusercontent.com/nvkelso/natural-earth-raster/master/10m_rasters/NE1_HR_LC_SR_W_DR/NE1_HR_LC_SR_W_DR.tif'
BASE, ROW, T = 21652, 21600 * 3, 2700   # uncompressed RGB, 1 row per strip
for r in range(4):
    req = urllib.request.Request(U, headers={'Range': f'bytes={BASE + r * T * ROW}-{BASE + (r + 1) * T * ROW - 1}'})
    a = np.frombuffer(urllib.request.urlopen(req).read(), np.uint8).reshape(T, 21600, 3)
    for c in range(8):
        enh(Image.fromarray(a[:, c * T:(c + 1) * T])).save(f'../data/tiles/{r}{c}.jpg', quality=70, optimize=True, progressive=True)
    print('row', r, flush=True)
