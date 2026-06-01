# SDL2 Game Development

SDL2 is the recommended framework for games and real-time graphics on CardputerZero.

## Why SDL2?

- Hardware-accelerated rendering
- Built-in input handling (keyboard events map directly)
- Audio via SDL2_mixer
- TrueType fonts via SDL2_ttf
- Mature ecosystem, extensive documentation
- Offline compilation (no network dependencies)

## Display Setup

CardputerZero screen: **320×170 pixels, 16-bit color**.

```c
#include <SDL2/SDL.h>

#define SCREEN_W 320
#define SCREEN_H 170

int main(int argc, char *argv[]) {
    SDL_Init(SDL_INIT_VIDEO | SDL_INIT_AUDIO);

    SDL_Window *win = SDL_CreateWindow("MyGame",
        SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED,
        SCREEN_W, SCREEN_H, SDL_WINDOW_SHOWN);

    SDL_Renderer *ren = SDL_CreateRenderer(win, -1,
        SDL_RENDERER_ACCELERATED | SDL_RENDERER_PRESENTVSYNC);

    // Game loop
    int running = 1;
    while (running) {
        SDL_Event e;
        while (SDL_PollEvent(&e)) {
            if (e.type == SDL_QUIT) running = 0;
            if (e.type == SDL_KEYDOWN && e.key.keysym.sym == SDLK_ESCAPE)
                running = 0;
        }

        SDL_SetRenderDrawColor(ren, 0, 0, 0, 255);
        SDL_RenderClear(ren);

        // Draw your game here...

        SDL_RenderPresent(ren);
    }

    SDL_DestroyRenderer(ren);
    SDL_DestroyWindow(win);
    SDL_Quit();
    return 0;
}
```

## Keyboard Input

CardputerZero's 46-key keyboard maps to standard SDL keycodes:

```c
case SDL_KEYDOWN:
    switch (e.key.keysym.sym) {
        case SDLK_UP:    player_y--; break;
        case SDLK_DOWN:  player_y++; break;
        case SDLK_LEFT:  player_x--; break;
        case SDLK_RIGHT: player_x++; break;
        case SDLK_SPACE: shoot(); break;
        case SDLK_ESCAPE: running = 0; break;
    }
    break;
```

## Audio

```c
#include <SDL2/SDL_mixer.h>

Mix_OpenAudio(44100, MIX_DEFAULT_FORMAT, 2, 2048);
Mix_Chunk *sfx = Mix_LoadWAV("shoot.wav");
Mix_PlayChannel(-1, sfx, 0);
```

## Fonts

```c
#include <SDL2/SDL_ttf.h>

TTF_Init();
TTF_Font *font = TTF_OpenFont("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 16);
SDL_Surface *surf = TTF_RenderText_Solid(font, "Score: 42", (SDL_Color){255,255,255,255});
SDL_Texture *tex = SDL_CreateTextureFromSurface(ren, surf);
SDL_Rect dst = {10, 10, surf->w, surf->h};
SDL_RenderCopy(ren, tex, NULL, &dst);
```

## Makefile

```makefile
CC       ?= gcc
CFLAGS   ?= -std=c11 -Wall -O2
PKGS     := sdl2 SDL2_ttf SDL2_mixer
PKG_CFLAGS := $(shell pkg-config --cflags $(PKGS))
PKG_LIBS   := $(shell pkg-config --libs $(PKGS))

TARGET := mygame
SRC    := main.c

all: $(TARGET)
$(TARGET): $(SRC)
	$(CC) $(CFLAGS) $(PKG_CFLAGS) $(SRC) -o $(TARGET) $(PKG_LIBS)
clean:
	rm -f $(TARGET)
```

## Examples

| Example | Features |
|---------|----------|
| `examples/SDL2_HelloWorld` | Window + basic drawing |
| `examples/SDL2_Game` | Full game with audio, fonts, input |
| `examples/Game_Asteroids` | Vector graphics, physics |
| `examples/Game_Tetris` | Classic puzzle game |
| `examples/Game_Pong` | Two-player paddle game |

## Tips

- Target **60 FPS** with `SDL_RENDERER_PRESENTVSYNC`
- Use **320×170** — don't assume other resolutions
- Always handle **ESC** to exit (APPLauncher expects clean exit)
- Keep assets small (SD card space is limited)
- Test with `SDL_WINDOW_FULLSCREEN` for device-like experience
