# Rust App Development

Build safe, fast applications in Rust for CardputerZero.

## Setup

The Docker SDK includes `rustc` and `cargo`. No additional setup needed.

## Framebuffer Example

```rust
use std::fs::OpenOptions;
use std::io::Write;
use std::env;

fn main() {
    let fb_path = env::var("APPLAUNCH_LINUX_FBDEV_DEVICE")
        .unwrap_or_else(|_| "/dev/fb0".to_string());

    let mut fb = OpenOptions::new()
        .write(true)
        .open(&fb_path)
        .expect("Cannot open framebuffer");

    let (w, h) = (320u32, 170u32);

    // Fill with blue (RGB565)
    let blue: u16 = 0x001F;
    let pixel = blue.to_le_bytes();
    for _ in 0..(w * h) {
        fb.write_all(&pixel).unwrap();
    }
}
```

## Packaging

`packaging/build.sh`:
```bash
#!/bin/bash
cargo build --release
```

`packaging/stage.sh`:
```bash
#!/bin/bash
mkdir -p "$STAGE$APP_INSTALL_DIR"
cp target/release/myapp "$STAGE$APP_INSTALL_DIR/"
```

## Cross-Compilation Note

Since the Docker SDK runs native arm64, `cargo build` produces arm64 binaries directly — no cross-compile target needed.

## Example

See `examples/Rust_FrameBuffer_HelloWorld` for a complete working project.
