# JoRA Build Instructions

## Development

```bash
npm install
npm start
```

## Building Binaries

```bash
npm run build
```

This creates binaries in the `dist/` folder:
- `jora-linux` - Linux binary
- `jora-win.exe` - Windows binary  
- `jora-mac` - macOS binary

## Individual Builds

```bash
npm run build:linux
npm run build:win
npm run build:mac
```

## Distribution

Upload the binaries to GitHub Releases or distribute them directly to users.

Users can then:
1. Download the appropriate binary
2. Put it in their project (e.g., `tools/jora`)
3. Run `./tools/jora init` to initialize
4. Run `./tools/jora` to start the web interface
