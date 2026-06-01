# Camera (IMX219)

*Full version only*

## Specs

| Parameter | Value |
|-----------|-------|
| Sensor | Sony IMX219 |
| Resolution | 8MP (3280 × 2464) |
| Interface | 4-lane MIPI CSI |
| Control | I2C0, GPIO16 enable |
| Power | SSP7615 (CAM_3V3) |

## Access via libcamera

```bash
# Take a photo
libcamera-still -o photo.jpg --width 1280 --height 720

# Stream preview
libcamera-vid -t 0 --width 640 --height 480 --framerate 30
```

## In Python

```python
from picamera2 import Picamera2
cam = Picamera2()
cam.start()
frame = cam.capture_array()
cam.stop()
```

## In C

Use the libcamera C++ API. See `M5CardputerZero-Launcher` source for the camera page implementation.
