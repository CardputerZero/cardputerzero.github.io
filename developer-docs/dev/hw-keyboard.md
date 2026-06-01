# Keyboard (TCA8418)

## Specs

| Parameter | Value |
|-----------|-------|
| Controller | TCA8418 |
| Interface | I2C1 |
| Interrupt | GPIO27 |
| Keys | 46 |
| Layout | Compact QWERTY |

## Access via evdev

The keyboard appears as a standard Linux input device:

```bash
# Find the device
ls /dev/input/by-path/*i2c*

# Read events
evtest /dev/input/by-path/platform-3f804000.i2c-event
```

## In Your App

### C (raw evdev)
```c
#include <linux/input.h>
int fd = open("/dev/input/by-path/platform-3f804000.i2c-event", O_RDONLY);
struct input_event ev;
read(fd, &ev, sizeof(ev));
if (ev.type == EV_KEY) { /* handle ev.code, ev.value */ }
```

### SDL2
```c
SDL_Event e;
SDL_PollEvent(&e);
if (e.type == SDL_KEYDOWN) { /* e.key.keysym.sym */ }
```

### Python
```python
import evdev
dev = evdev.InputDevice('/dev/input/by-path/platform-3f804000.i2c-event')
for event in dev.read_loop():
    ...
```

## Key Modifiers

| Physical Key | Function |
|-------------|----------|
| Fn | Access F1-F12, special symbols |
| Shift | Uppercase, symbols |
| Ctrl | Ctrl+C, Ctrl+Alt+S (screenshot) |
| Alt | Alt combinations |
