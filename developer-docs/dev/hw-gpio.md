# GPIO / Grove / HAT

## Expansion Ports

### Grove (4-pin HY2.0)

| Pin | Function |
|-----|----------|
| 1 | GND |
| 2 | VCC (3.3V or 5V) |
| 3 | SDA (I2C) or TX (UART) |
| 4 | SCL (I2C) or RX (UART) |

Switchable between I2C and UART via GPIO17 (GROVE_EN).

### HAT Port (1.25mm 4-pin)

| Pin | Function |
|-----|----------|
| 1 | EXT_5VIN |
| 2 | EXT_5VOUT |
| 3 | SPI/I2C data |
| 4 | SPI/I2C clock |

SPI and I2C isolated from main bus.

### 14-pin GPIO Header (2.54mm)

Exposes: SPI, I2C, UART, USB, GPIO, 5V, GND.

## Access

### sysfs GPIO
```bash
echo 17 > /sys/class/gpio/export
echo out > /sys/class/gpio/gpio17/direction
echo 1 > /sys/class/gpio/gpio17/value
```

### I2C
```bash
i2cdetect -y 1          # Scan bus 1
i2cget -y 1 0x55 0x00   # Read register
```

### Python
```python
import RPi.GPIO as GPIO
GPIO.setmode(GPIO.BCM)
GPIO.setup(17, GPIO.OUT)
GPIO.output(17, GPIO.HIGH)
```

## Compatible Modules

Over 100 M5Stack Grove modules work directly:
- Temperature/humidity sensors
- Motion/gesture sensors
- Relay modules
- OLED displays
- LoRa radio modules
- NFC readers
