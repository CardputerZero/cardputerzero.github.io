# Display (ST7789V3)

## Specs

| Parameter | Value |
|-----------|-------|
| Controller | ST7789V3 |
| Resolution | 320 × 170 |
| Color | 16-bit RGB565 |
| Interface | SPI0 |
| Backlight | PWM (GPIO10 via PY32 co-processor) |
| DC Pin | GPIO25 |

## Access Methods

### 1. Framebuffer (recommended for apps)

```c
const char *fb = getenv("APPLAUNCH_LINUX_FBDEV_DEVICE");
int fd = open(fb ?: "/dev/fb0", O_RDWR);
// mmap and write RGB565 pixels
```

### 2. SDL2 (recommended for games)

SDL2 renders through the framebuffer automatically:
```c
SDL_CreateWindow("App", 0, 0, 320, 170, SDL_WINDOW_SHOWN);
```

### 3. LVGL

LVGL uses the `lv_linux_fbdev` driver internally.

## Backlight Control

Read/write via sysfs:
```bash
# Read current brightness (0-255)
cat /sys/class/backlight/*/brightness

# Set brightness
echo 128 > /sys/class/backlight/*/brightness
```

Or via APPLauncher HAL: `hal_backlight_read()` / `hal_backlight_write(val)`
