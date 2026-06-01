# Hardware Overview

CardputerZero V0.3 block diagram:

```
┌──────────┐    ┌──────────┐    ┌─────────────────────────┐
│  USB-A   │    │  HDMI    │    │      CM0 (132-pin)      │
│  USBC-L  │───▶│USB2.0 HUB│───▶│  BCM2710A1             │
│  100M RJ45│    │          │    │  Cortex-A53 × 4        │
│  1.25-4p │    └──────────┘    │  512MB LPDDR2          │
└──────────┘                    │  WiFi/BT               │
                                │                         │
┌──────────┐    ┌──────────┐    │  SPI0 ──── LCD         │
│  USBC-R  │───▶│  IP2315  │    │  I2S  ──── ES8389      │
│ (charge) │    │ (charger)│    │  I2C1 ──── TCA8418 KB  │
└──────────┘    └──────────┘    │  I2C1 ──── BQ27220     │
                                │  I2C1 ──── IMU/RTC     │
┌──────────┐    ┌──────────┐    │  CSI  ──── Camera      │
│  BATTERY │───▶│ BQ27220  │    │  GPIO ──── Grove/HAT   │
│ 1500mAh  │    │ (gauge)  │    └─────────────────────────┘
└──────────┘    └──────────┘
```

## Sections

- [Display](/hardware/display) — ST7789V3, SPI interface, backlight control
- [Keyboard](/hardware/keyboard) — 46-key matrix, TCA8418 scanner
- [Audio](/hardware/audio) — ES8389 codec, speaker, mic, 3.5mm jack
- [Power](/hardware/power) — Battery, charging, power management
- [Connectivity](/hardware/connectivity) — WiFi, BT, Ethernet, USB, HDMI, IR
- [Camera](/hardware/camera) — 8MP IMX219 via MIPI CSI (Full version)
- [Expansion](/hardware/expansion) — Grove, HAT port, GPIO header

