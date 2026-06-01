# .desktop File Specification

The `.desktop` file tells APPLauncher how to display and launch your app.

## Auto-Generated

By default, `pack-deb.sh` generates a `.desktop` file from your `meta.env`. You usually don't need to write one manually.

## Custom Template

To customize, create `packaging/app.desktop.in`:

```ini
[Desktop Entry]
Name={{APP_NAME}}
Exec={{APP_EXEC}}
Terminal={{APP_TERMINAL}}
Icon={{APP_ICON}}
Type=Application
Sysplause={{APP_SYSPLAUSE}}
```

### Supported Variables

| Variable | Source | Description |
|----------|--------|-------------|
| `{{APP_NAME}}` | meta.env | Display name |
| `{{APP_EXEC}}` | meta.env | Absolute path to binary |
| `{{APP_TERMINAL}}` | meta.env | `true` or `false` |
| `{{APP_ICON}}` | meta.env | Icon path |
| `{{APP_SYSPLAUSE}}` | meta.env | Pause system UI while running |

### Sysplause

When `Sysplause=true` (default), APPLauncher pauses its rendering while your app runs, giving you exclusive framebuffer access. Set to `false` if your app runs alongside the launcher (e.g., a background service).

## Installation Path

```
/usr/share/APPLaunch/applications/myapp.desktop
```

APPLauncher scans this directory on startup and adds matching entries to the home screen carousel.
