# Framebuffer Development

Direct framebuffer access gives maximum performance with zero library overhead.

## How It Works

CardputerZero's LCD is exposed as a Linux framebuffer device. Your app mmaps it and writes pixels directly.

```
App → mmap(/dev/fbX) → Kernel DRM/fbdev → SPI → ST7789V3 LCD
```

## Getting the Device Path

**Never hardcode `/dev/fb0`**. The framebuffer device is passed via environment variable:

```c
const char *fbdev = getenv("APPLAUNCH_LINUX_FBDEV_DEVICE");
if (!fbdev) fbdev = "/dev/fb0";
```

## Basic Setup

```c
#include <fcntl.h>
#include <sys/mman.h>
#include <sys/ioctl.h>
#include <linux/fb.h>
#include <stdlib.h>
#include <unistd.h>

int main(void) {
    const char *fbdev = getenv("APPLAUNCH_LINUX_FBDEV_DEVICE");
    if (!fbdev) fbdev = "/dev/fb0";

    int fd = open(fbdev, O_RDWR);
    struct fb_var_screeninfo vinfo;
    struct fb_fix_screeninfo finfo;
    ioctl(fd, FBIOGET_VSCREENINFO, &vinfo);
    ioctl(fd, FBIOGET_FSCREENINFO, &finfo);

    int w = vinfo.xres;           // 320
    int h = vinfo.yres;           // 170
    int bpp = vinfo.bits_per_pixel; // 16 (RGB565)
    int line_len = finfo.line_length;
    size_t fb_size = line_len * h;

    uint16_t *fb = mmap(NULL, fb_size, PROT_READ | PROT_WRITE, MAP_SHARED, fd, 0);

    // Draw a red pixel at (100, 50)
    // RGB565: RRRRR GGGGGG BBBBB
    fb[50 * (line_len/2) + 100] = 0xF800; // Pure red

    munmap(fb, fb_size);
    close(fd);
    return 0;
}
```

## Color Format: RGB565

16-bit per pixel, little-endian:

```
Bit:  15 14 13 12 11 | 10 9 8 7 6 5 | 4 3 2 1 0
       R  R  R  R  R |  G  G G G G G | B  B B B B
```

Helper macro:
```c
#define RGB565(r, g, b) (((r >> 3) << 11) | ((g >> 2) << 5) | (b >> 3))
```

## Double Buffering

For flicker-free animation, draw to a buffer then memcpy:

```c
uint16_t *backbuf = malloc(w * h * 2);

// Draw frame to backbuf...
for (int y = 0; y < h; y++)
    memcpy(fb + y * (line_len/2), backbuf + y * w, w * 2);

free(backbuf);
```

## Input (evdev)

Read keyboard events from the evdev device:

```c
#include <linux/input.h>

const char *kbd = getenv("LV_LINUX_KEYBOARD_DEVICE");
if (!kbd) kbd = "/dev/input/event0";

int kfd = open(kbd, O_RDONLY | O_NONBLOCK);
struct input_event ev;
while (read(kfd, &ev, sizeof(ev)) == sizeof(ev)) {
    if (ev.type == EV_KEY && ev.value == 1) { // key down
        switch (ev.code) {
            case KEY_UP:    move_up(); break;
            case KEY_DOWN:  move_down(); break;
            case KEY_ESC:   running = 0; break;
        }
    }
}
```

## Performance

- Direct framebuffer: ~1000 FPS theoretical (SPI limited to ~60 FPS actual refresh)
- No compositor overhead
- Ideal for: retro games, status displays, boot animations
