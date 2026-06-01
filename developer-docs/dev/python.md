# Python App Development

Write CardputerZero apps in Python — fastest development cycle, no compilation.

## Framebuffer Approach (PIL)

Draw to the screen using PIL/Pillow and write RGB565 to the framebuffer:

```python
#!/usr/bin/env python3
import os, struct, time
from PIL import Image, ImageDraw, ImageFont

FB = os.environ.get("APPLAUNCH_LINUX_FBDEV_DEVICE", "/dev/fb0")
W, H = 320, 170

def rgb_to_565(r, g, b):
    return ((r >> 3) << 11) | ((g >> 2) << 5) | (b >> 3)

def blit(img):
    with open(FB, "wb") as fb:
        for y in range(H):
            for x in range(W):
                r, g, b = img.getpixel((x, y))
                fb.write(struct.pack("<H", rgb_to_565(r, g, b)))

# Create image
img = Image.new("RGB", (W, H), (0, 0, 0))
draw = ImageDraw.Draw(img)
draw.rectangle([50, 30, 270, 140], fill=(0, 50, 100))
draw.text((80, 70), "Hello Python!", fill=(255, 255, 255))

blit(img)
time.sleep(3)
```

## Input (evdev)

```python
import evdev

device = evdev.InputDevice('/dev/input/event0')
for event in device.read_loop():
    if event.type == evdev.ecodes.EV_KEY:
        key = evdev.categorize(event)
        if key.keystate == key.key_down:
            if key.scancode == evdev.ecodes.KEY_ESC:
                break
            print(f"Key: {key.keycode}")
```

## Packaging

Python apps don't need compilation. Your `packaging/build.sh` just validates syntax:

```bash
#!/bin/bash
python3 -m py_compile main.py
```

And `packaging/stage.sh` copies the script:

```bash
#!/bin/bash
mkdir -p "$STAGE$APP_INSTALL_DIR"
cp *.py "$STAGE$APP_INSTALL_DIR/"
```

Set `APP_EXEC` to: `python3 /usr/share/APPLaunch/apps/myapp/main.py`

## Dependencies

Add Python package dependencies to `PKG_DEPENDS` in `meta.env`:

```bash
PKG_DEPENDS="python3, python3-pil, python3-numpy, python3-evdev"
```

## Examples

| Example | Description |
|---------|-------------|
| `examples/Python_FrameBuffer_HelloWorld` | PIL → framebuffer |
| `examples/Demo_ImageViewer` | Image display with navigation |
| `examples/Demo_WifiScan` | WiFi scanner with live display |
| `examples/Demo_SysDashboard` | System info dashboard |
