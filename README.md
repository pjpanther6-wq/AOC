# AOC Staff Checklist Web App

This folder is ready for free static hosting, including GitHub Pages.

## Files
- `index.html` – app entry point
- `styles.css` – responsive styling
- `app.js` – checklist logic, timestamps, signature, local dashboard
- `sw.js` – offline caching service worker
- `manifest.webmanifest` – installable web app manifest
- `logo.png` – AOC logo
- `.nojekyll` – ensures GitHub Pages serves files as-is

## GitHub Pages quick setup
1. Create a new GitHub repository.
2. Upload the contents of this folder to the root of the repository.
3. In GitHub, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the **main** branch and the **/(root)** folder.
6. Save. GitHub will publish the site and give you a URL.

## Features
- Mobile-friendly checklist
- Offline support after first load
- Installable on Android and iPhone home screens
- Task completion timestamps
- Signature pad
- Email report button using the phone's mail app
- Local dashboard of saved completed checklists
- Dark/light theme toggle
