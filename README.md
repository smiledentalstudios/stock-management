# Smile Dental Studios — Stock Management v1.8

This repository contains the static HTML prototype for the Tarneit clinic's Stock Management app.

## Deploying on Netlify

- Build command: leave blank
- Publish directory: `.`
- Entry file: `index.html`

When the GitHub repository is connected to Netlify, future commits to the production branch can trigger automatic redeployment.

## Important limitations — prototype only

- Inventory and order data are currently stored in each browser's local storage. They do not synchronize between devices.
- This static page does not implement secure shared authentication or server-side access control.
- Do not use this version as the source of truth for live clinic stock or enter sensitive/confidential information until secure authentication, a shared cloud database, backups, and authorization rules are implemented and tested.
- Keep this source repository private. A private GitHub repository does not by itself make the deployed website private.

## Making changes

Edit `index.html`, commit the change, and push to the repository. If connected to Netlify, the website can redeploy automatically after each push.
