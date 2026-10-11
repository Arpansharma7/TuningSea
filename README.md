# TuningSea

TuningSea is a local-first desktop workspace for preparing data, choosing a model, running fine-tuning jobs, comparing results, and managing saved models in one place.

This repository currently contains an early working prototype. The interface is functional, but the real model-training engine is still being built.

## Try the desktop app

You will need Node.js 22 or newer.

```powershell
cd DESKTOP_APPLICATION
npm install
npm start
```

To create a Windows installer:

```powershell
npm run make
```

The installer will be created inside `DESKTOP_APPLICATION/out/make`.

## Web preview

Open `WEB/index.html` in a browser to explore the interface without installing anything.

TuningSea is a work in progress. Feedback and ideas are welcome.
