# Tech Specs

## Compute

| Parameter | Specification |
|-----------|--------------|
| Module | Raspberry Pi Compute Module Zero (CM0 Lite) |
| SoC | BCM2710A1 (RP3A0 SiP) |
| CPU | Quad-core ARM Cortex-A53 @ 1.0 GHz |
| GPU | VideoCore IV, 400 MHz, OpenGL ES 2.0 |
| RAM | 512 MB LPDDR2 |
| Storage | MicroSD (Full version includes 32GB preloaded) |

## Display

| Parameter | Specification |
|-----------|--------------|
| Size | 1.9" IPS |
| Controller | ST7789V3 |
| Resolution | 320 × 170 pixels |
| Interface | SPI0 (CS0, MISO, MOSI, SCLK, DC) |
| Backlight | PWM adjustable |

## Power

| Parameter | Specification |
|-----------|--------------|
| Battery | 1500 mAh LiPo 3.7V |
| Fuel Gauge | BQ27220 (I2C 0x55) |
| Charging | IP2315 via USB-C |
| DC-DC | SY7088 ×2 (5V rails) |
| LDO | SY8003 (3.3V) |
| Budget | 6W total, CM0 ≈ 3W |

## Connectivity

| Parameter | Specification |
|-----------|--------------|
| WiFi | 802.11 b/g/n, 2.4 GHz, IPEX connector |
| Bluetooth | 4.2 + BLE |
| Ethernet | 100M Fast Ethernet (RJ45, USB-to-ETH) |
| USB | 2× USB-C + 1× USB-A (Host/Device switchable) |
| HDMI | 1080p30 output |
| IR | Transmit + Receive |

## Audio

| Parameter | Specification |
|-----------|--------------|
| Codec | ES8389 (I2S) |
| Amplifier | AW8737 |
| Speaker | 1W built-in |
| Microphone | MEMS built-in |
| Jack | 3.5mm TRS |

## Input

| Parameter | Specification |
|-----------|--------------|
| Keyboard | 46-key matrix (TCA8418, I2C scan) |
| IMU | LSM6DS3TR-C 6-axis (Full version only) |

## Camera (Full version)

| Parameter | Specification |
|-----------|--------------|
| Sensor | Sony IMX219, 8MP |
| Interface | 4-lane MIPI CSI |

## Expansion

| Interface | Description |
|-----------|------------|
| Grove | 4-pin, I2C or UART (switchable) |
| HAT Port | 1.25mm 4-pin, SPI/I2C isolated, 5V I/O |
| 14-pin GPIO | 2.54mm header: SPI, I2C, UART, USB, GPIO, 5V, GND |

## Sensors

| Chip | Function | Interface |
|------|----------|-----------|
| BQ27220 | Battery fuel gauge | I2C (0x55) |
| LSM6DS3TR-C | 6-axis IMU | I2C (0x68) |
| RXM0E53TR | RTC with battery backup | I2C (0x32) |
| ES8389 | Audio codec | I2S |
| TCA8418 | Keyboard scanner | I2C |

## Physical

| Parameter | Specification |
|-----------|--------------|
| Dimensions | 85 × 54 mm (credit card size) |
| Form Factor | Clamshell with keyboard |

## SKU Comparison

| Feature | Lite ($59) | Full ($89) |
|---------|-----------|-----------|
| Camera (8MP IMX219) | ❌ | ✅ |
| IMU (LSM6DS3TR-C) | ❌ | ✅ |
| 32GB microSD preloaded | ❌ | ✅ |
