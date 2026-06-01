# Quick Start

Get your CardputerZero up and running in 5 minutes.

## What You Need

- CardputerZero device
- MicroSD card (16GB+ recommended, 32GB included with Full version)
- USB-C cable for charging
- A computer (Windows/macOS/Linux) for flashing the SD card

## Step 1: Download the OS Image

Download the latest CardputerZero OS image from the [Releases page](https://github.com/CardputerZero/cardputerzero-pigen/releases).

## Step 2: Flash the SD Card

Use [Raspberry Pi Imager](https://www.raspberrypi.com/software/) or [balenaEtcher](https://etcher.balena.io/):

1. Insert MicroSD card into your computer
2. Select the downloaded `.img.xz` file
3. Select your SD card as target
4. Click "Write"

## Step 3: First Boot

1. Insert the flashed SD card into CardputerZero
2. Press the power button (side switch)
3. Wait ~30 seconds for first boot
4. The APPLauncher home screen appears

## Step 4: Connect WiFi

1. Navigate to **Settings** → **WiFi** → **Scan**
2. Select your network
3. Enter password
4. Connected!

## Step 5: SSH Access

Once connected to WiFi:

```bash
ssh pi@<device-ip>
# Default password: pi
```

## Next Steps

- [Install apps via AppStore](/software/appstore)
- [Build your first app](/software/docker-sdk)
- [Explore hardware interfaces](/hardware/)
