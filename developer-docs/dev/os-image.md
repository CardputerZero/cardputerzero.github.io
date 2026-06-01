# OS Image Build

CardputerZero's OS is built using a customized [pi-gen](https://github.com/CardputerZero/cardputerzero-pigen) — the official Raspberry Pi OS image builder.

## What's Included

The image adds on top of standard Raspberry Pi OS:
- APPLauncher (systemd service, auto-start)
- Device tree overlays (ST7789V LCD, TCA8418 keyboard, ES8389 audio)
- Preinstalled packages (LVGL, SDL2, Python libs)
- CardputerZero APT repository configured
- SSH enabled by default

## Building the Image

```bash
git clone https://github.com/CardputerZero/cardputerzero-pigen.git
cd cardputerzero-pigen
./build-docker.sh
```

Output: `deploy/*.img.xz`

## Flashing

```bash
# Using Raspberry Pi Imager (GUI)
# Or command line:
xzcat deploy/cardputerzero-*.img.xz | sudo dd of=/dev/sdX bs=4M status=progress
```

## Customization

Edit `stage-cardputerzero/` to add:
- Additional packages (`packages` file)
- Config files (`root_overlay/`)
- Custom scripts (`scripts/`)
