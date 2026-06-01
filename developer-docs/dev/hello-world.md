# Hello World

Your first CardputerZero app in under 5 minutes.

## SDL2 Hello World (Recommended)

The simplest graphical app — draws colored rectangles to the screen.

### Source: `main.c`

```c
#include <SDL2/SDL.h>
#include <SDL2/SDL_ttf.h>

int main(int argc, char *argv[]) {
    SDL_Init(SDL_INIT_VIDEO);
    TTF_Init();

    SDL_Window *win = SDL_CreateWindow("Hello",
        SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED,
        320, 170, SDL_WINDOW_SHOWN);
    SDL_Renderer *ren = SDL_CreateRenderer(win, -1, SDL_RENDERER_ACCELERATED);

    // Draw green background
    SDL_SetRenderDrawColor(ren, 0, 100, 0, 255);
    SDL_RenderClear(ren);

    // Draw white rectangle
    SDL_SetRenderDrawColor(ren, 255, 255, 255, 255);
    SDL_Rect rect = {110, 60, 100, 50};
    SDL_RenderFillRect(ren, &rect);

    SDL_RenderPresent(ren);
    SDL_Delay(3000);  // Show for 3 seconds

    SDL_DestroyRenderer(ren);
    SDL_DestroyWindow(win);
    SDL_Quit();
    return 0;
}
```

### Build & Package

```bash
cd CardputerZero-AppBuilder
docker run --rm -v $(pwd):/src -w /src \
  ghcr.io/cardputerzero/build-env:latest \
  scripts/pack-deb.sh examples/SDL2_HelloWorld
```

### Deploy

```bash
scp dist/sdl2-hello_*.deb pi@<device-ip>:/tmp/
ssh pi@<device-ip> "sudo dpkg -i /tmp/sdl2-hello_*.deb"
```

---

## Framebuffer Hello World (No Dependencies)

Writes directly to `/dev/fb0` — zero library dependencies, maximum control.

```c
#include <fcntl.h>
#include <sys/mman.h>
#include <sys/ioctl.h>
#include <linux/fb.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

int main(void) {
    const char *fbdev = getenv("APPLAUNCH_LINUX_FBDEV_DEVICE");
    if (!fbdev) fbdev = "/dev/fb0";

    int fd = open(fbdev, O_RDWR);
    struct fb_var_screeninfo vinfo;
    ioctl(fd, FBIOGET_VSCREENINFO, &vinfo);

    int w = vinfo.xres, h = vinfo.yres;
    int bpp = vinfo.bits_per_pixel / 8;
    size_t size = w * h * bpp;

    char *fb = mmap(NULL, size, PROT_WRITE, MAP_SHARED, fd, 0);

    // Fill screen with blue (RGB565: 0x001F)
    uint16_t blue = 0x001F;
    for (int i = 0; i < w * h; i++)
        ((uint16_t*)fb)[i] = blue;

    sleep(2);
    munmap(fb, size);
    close(fd);
    return 0;
}
```

### Build

```bash
docker run --rm -v $(pwd):/src -w /src \
  ghcr.io/cardputerzero/build-env:latest \
  scripts/pack-deb.sh examples/FrameBuffer_HelloWorld
```

---

## Python Hello World

No compilation needed — just script + package.

```python
#!/usr/bin/env python3
"""Draw 'Hello' on the framebuffer using PIL."""
import os
from PIL import Image, ImageDraw, ImageFont

FB = os.environ.get("APPLAUNCH_LINUX_FBDEV_DEVICE", "/dev/fb0")
W, H = 320, 170

img = Image.new("RGB", (W, H), (0, 0, 0))
draw = ImageDraw.Draw(img)
draw.text((100, 70), "Hello!", fill=(0, 255, 0))

# Write RGB565 to framebuffer
with open(FB, "wb") as fb:
    for y in range(H):
        for x in range(W):
            r, g, b = img.getpixel((x, y))
            rgb565 = ((r >> 3) << 11) | ((g >> 2) << 5) | (b >> 3)
            fb.write(rgb565.to_bytes(2, 'little'))
```

---

## Project Structure

Every app needs this structure:

```
examples/MyApp/
├── main.c (or main.py, etc.)
├── Makefile (or CMakeLists.txt)
└── packaging/
    ├── meta.env      # Name, version, dependencies
    ├── build.sh      # How to compile
    ├── stage.sh      # What to install
    └── icon.png      # 100×100 app icon
```

See [Docker SDK Setup](/dev/docker-sdk) for the full workflow.
