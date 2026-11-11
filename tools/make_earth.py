#!/usr/bin/env python3
"""Builds data/earth.jpg (8192x4096 equirectangular shaded relief) from Natural Earth I 50m (public domain)."""
import sys, urllib.request
from PIL import Image, ImageEnhance
Image.MAX_IMAGE_PIXELS = None
U = 'https://raw.githubusercontent.com/nvkelso/natural-earth-raster/master/50m_rasters/NE1_50M_LC_SR_W/NE1_50M_LC_SR_W.tif'
urllib.request.urlretrieve(U, '/tmp/ne1.tif')
im = Image.open('/tmp/ne1.tif').convert('RGB').resize((8192, 4096), Image.LANCZOS)
im = ImageEnhance.Color(ImageEnhance.Contrast(im).enhance(1.12)).enhance(1.2)
im.save('../data/earth.jpg', quality=78, optimize=True); print(im.size)
