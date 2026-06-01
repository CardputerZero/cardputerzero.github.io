# Audio (ES8389)

## Specs

| Parameter | Value |
|-----------|-------|
| Codec | ES8389 |
| Interface | I2S |
| Sample Rates | 22.05, 44.1, 48 kHz |
| Speaker | 1W built-in (AW8737 amplifier) |
| Microphone | MEMS built-in |
| Jack | 3.5mm TRS output |
| Enable | GPIO24 (speaker enable) |

## Playback

### ALSA (command line)
```bash
aplay -D hw:0,0 sound.wav
```

### SDL2_mixer (in code)
```c
Mix_OpenAudio(44100, MIX_DEFAULT_FORMAT, 2, 2048);
Mix_Chunk *sfx = Mix_LoadWAV("beep.wav");
Mix_PlayChannel(-1, sfx, 0);
```

### Python
```python
import subprocess
subprocess.Popen(["aplay", "sound.wav"])
```

## Recording

```bash
arecord -D hw:0,0 -f S16_LE -r 16000 -c 1 recording.wav
```

## Volume Control

```bash
amixer set Master 75%
```
