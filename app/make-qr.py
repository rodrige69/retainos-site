#!/usr/bin/env python3
"""Regenerate app/qr/<shop>.svg from https://app.retainos.co/join.html?shop=<shop>."""
import sys
from pathlib import Path

import qrcode
import qrcode.image.svg

BASE = "https://app.retainos.co/join.html?shop="

def main(slugs):
    out = Path(__file__).parent / "qr"
    out.mkdir(exist_ok=True)
    for slug in slugs:
        url = BASE + slug
        qr = qrcode.QRCode(box_size=10, border=0,
                           error_correction=qrcode.constants.ERROR_CORRECT_M)
        qr.add_data(url)
        qr.make(fit=True)
        img = qr.make_image(image_factory=qrcode.image.svg.SvgPathImage)
        img.save(out / f"{slug}.svg")
        print(f"{slug:20s} {url}")

if __name__ == "__main__":
    main(sys.argv[1:] or ["fade-lab"])
