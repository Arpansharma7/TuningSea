# TuningSea Desktop

All desktop-specific source, dependencies, and build output live in this folder.

## Run

```powershell
npm start
```

## Build the Windows installer

```powershell
npm run make
```

The current interface is copied from the project root into `ui` before every run or build. Installers are written to `out/make`.
