# LVGL UI Development

[LVGL](https://lvgl.io/) (Light and Versatile Graphics Library) is ideal for creating embedded-style UIs — buttons, lists, charts, animations.

## When to Use LVGL

- Settings pages, dashboards, control panels
- Widget-based interfaces (buttons, sliders, lists)
- When you need the same UI framework as APPLauncher itself

## Example

```c
#include "lvgl/lvgl.h"

void create_ui(void) {
    lv_obj_t *label = lv_label_create(lv_scr_act());
    lv_label_set_text(label, "Hello LVGL!");
    lv_obj_center(label);

    lv_obj_t *btn = lv_btn_create(lv_scr_act());
    lv_obj_set_pos(btn, 110, 100);
    lv_obj_t *btn_label = lv_label_create(btn);
    lv_label_set_text(btn_label, "Click Me");
}
```

## Build with CMake

The LVGL example uses CMake + FetchContent to download LVGL source:

```cmake
FetchContent_Declare(lvgl
    GIT_REPOSITORY https://github.com/lvgl/lvgl.git
    GIT_TAG v9.2.2)
FetchContent_MakeAvailable(lvgl)
```

::: warning Network Required
LVGL builds require internet access in Docker to download source. Use `--network=host`:
```bash
docker run --rm --network=host -v $(pwd):/src -w /src \
  ghcr.io/cardputerzero/build-env:latest \
  scripts/pack-deb.sh examples/LVGL_HelloWorld
```
:::

## Display Driver

LVGL on CardputerZero uses the Linux framebuffer driver:

```c
lv_display_t *disp = lv_linux_fbdev_create();
lv_linux_fbdev_set_file(disp, getenv("APPLAUNCH_LINUX_FBDEV_DEVICE") ?: "/dev/fb0");
```

## Input Driver

```c
lv_indev_t *indev = lv_evdev_create(LV_INDEV_TYPE_KEYPAD,
    "/dev/input/by-path/platform-3f804000.i2c-event");
```

## Example

See `examples/LVGL_HelloWorld` for a complete CMake project with framebuffer + evdev setup.
