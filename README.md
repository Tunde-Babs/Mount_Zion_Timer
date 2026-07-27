# Mount Zion Timer

A professional timer application for events, presentations, conferences, and church services.

## Features

- ⏱️ **Multiple Timers** - Create and manage multiple timers with titles and notes
- 🎯 **Presenter View** - Full-screen display for projectors/external monitors
- 🔊 **Audio Alerts** - Customizable warning sounds at 60s, 30s, and timer end
- 📋 **Save/Load Schedules** - Save timer configurations for reuse
- 🖱️ **Drag & Drop** - Reorder timers by dragging
- ⌨️ **Keyboard Shortcuts** - Full keyboard control for quick operation
- 🎨 **Color-Coded Progress** - Visual feedback (green → yellow → red)
- 💬 **Messages** - Send announcements to the presenter view
- 🏠 **Multiple Rooms** - Manage separate timer sets for different rooms

---

## Project Structure

```
mount-zion-timer-app/
├── package.json              # Dependencies and build scripts
├── vite.config.js            # Vite bundler configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── postcss.config.js         # PostCSS configuration
├── .gitignore               # Git ignore rules
├── README.md                # This file
│
├── assets/                  # App icons (YOU MUST ADD THESE)
│   ├── icon.ico            # Windows icon (256x256)
│   ├── icon.icns           # macOS icon
│   └── icon.png            # Linux icon (512x512)
│
├── src/
│   ├── main/               # Electron main process
│   │   └── index.js        # Main window, IPC handlers
│   │
│   ├── preload/            # Electron preload scripts
│   │   └── index.js        # Secure IPC bridge
│   │
│   └── renderer/           # React frontend
│       ├── index.html      # Main HTML template
│       ├── presenter.html  # Presenter view HTML
│       ├── main.jsx        # React entry point
│       ├── App.jsx         # App component
│       ├── components/
│       │   └── MountZionTimerApp.jsx  # Main timer component
│       └── styles/
│           └── index.css   # Tailwind CSS
│
├── dist/                   # Built React files (generated)
└── release/               # Built installers (generated)
```

---

## Prerequisites

- **Node.js 18+** - Download from https://nodejs.org/
- **Git** (optional) - For version control

---

## Step-by-Step Build Guide

### Step 1: Setup Project in VS Code

1. **Extract the project** to a folder (e.g., `C:\Projects\mount-zion-timer-app`)

2. **Open in VS Code:**
   - Open VS Code
   - File → Open Folder → Select `mount-zion-timer-app`

3. **Open Terminal in VS Code:**
   - View → Terminal (or press `Ctrl + ~`)

### Step 2: Install Dependencies

```bash
npm install
```

Wait for all packages to download (may take 2-5 minutes).

### Step 3: Add App Icons

**IMPORTANT:** You must add icons before building!

1. Create/obtain your icon in these formats:
   - `icon.png` - 512x512 PNG (required for Linux, base for others)
   - `icon.ico` - Windows icon
   - `icon.icns` - macOS icon

2. Place them in the `assets/` folder:
   ```
   assets/
   ├── icon.ico
   ├── icon.icns
   └── icon.png
   ```

**To create icons from a PNG:**
```bash
# Install icon generator
npm install -g electron-icon-builder

# Generate all formats from a 512x512 PNG
electron-icon-builder --input=./my-logo.png --output=./assets
```

Or use online converters:
- https://icoconvert.com/ (PNG → ICO)
- https://cloudconvert.com/png-to-icns (PNG → ICNS)

### Step 4: Test in Development Mode

```bash
npm run electron:dev
```

This runs the app without building installers. Use this to test changes quickly.

### Step 5: Build for Production

#### Build React Frontend First:
```bash
npm run build
```

#### Build for Windows (64-bit and 32-bit):
```bash
npm run dist:win
```

#### Build for Windows 64-bit only:
```bash
npm run dist:win64
```

#### Build for Windows 32-bit only:
```bash
npm run dist:win32
```

#### Build for macOS:
```bash
npm run dist:mac
```
**Note:** Building for macOS requires a Mac computer.

#### Build for Linux:
```bash
npm run dist:linux
```

#### Build for All Platforms:
```bash
npm run dist:all
```
**Note:** Cross-platform building has limitations. Build on target OS for best results.

### Step 6: Find Your Installers

After building, find your installers in the `release/` folder:

```
release/
├── Mount Zion Timer Setup 2.0.0.exe      # Windows installer
├── Mount Zion Timer Setup 2.0.0-ia32.exe # Windows 32-bit
├── Mount Zion Timer-2.0.0.dmg            # macOS installer
└── Mount Zion Timer-2.0.0.AppImage       # Linux installer
```

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play/Pause current timer |
| `N` | Add new timer |
| `R` | Reset current timer |
| `M` | Toggle mute |
| `1-9` | Switch to timer 1-9 |
| `Ctrl+P` | Open presenter view |
| `?` | Show keyboard shortcuts |
| `Esc` | Close modals / Exit presenter |

---

## Troubleshooting

### "Cannot find module" errors
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### "ffmpeg.dll not found" on Windows
This usually means the build didn't complete properly. Try:
```bash
npm run build
npm run dist:win64
```

### Build fails with icon errors
Make sure you have all three icon files in `assets/`:
- icon.ico (Windows)
- icon.icns (macOS)  
- icon.png (Linux)

### App won't start after install
1. Uninstall the old version completely
2. Delete leftover data: `%APPDATA%\mount-zion-timer-app`
3. Reinstall

### Presenter view not showing on external monitor
- The app auto-detects external monitors
- If not working, drag the presenter window manually
- Check display settings in Windows/macOS

---

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server only |
| `npm run electron:dev` | Start full app in dev mode |
| `npm run build` | Build React frontend |
| `npm run pack` | Build unpacked app (for testing) |
| `npm run dist` | Build installer for current OS |
| `npm run dist:win` | Build Windows installer (x64 + ia32) |
| `npm run dist:win64` | Build Windows 64-bit only |
| `npm run dist:win32` | Build Windows 32-bit only |
| `npm run dist:mac` | Build macOS installer |
| `npm run dist:linux` | Build Linux installer |

---

## Version History

- **v2.0.0** - Complete rewrite with Vite, improved UI, audio alerts, drag & drop
- **v1.0.0** - Initial release

---

## License

MIT License - Feel free to use and modify for your needs.

## Author

Babs <tunde.ajala@gmail.com>
