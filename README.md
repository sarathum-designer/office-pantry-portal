# Office Pantry Portal

A zero-dependency web app for ordering from the office pantry over the local WiFi. Employees order from their phones and pantry staff see orders appear within about 3 seconds, then move each one through **Preparing → Ready → Delivered**.

## Features

- **Employee ordering:** pick items, add your name or cabin, and track the order status live
- **Pantry dashboard:** PIN-protected queue with one-tap status updates
- **Menu management:** mark items out of stock and add new items without code changes
- **LAN only:** the portal can't be reached from the internet because the router blocks outside connections
- **No setup overhead:** uses only Node's built-in modules (no `npm install`) and saves data to one JSON file

## Quick start

```bash
node server.js
```

The terminal prints a WiFi URL such as `http://192.168.1.42:3000`. Share it with the team, or print it as a QR code for the pantry wall.

Full walkthrough, including auto-restart with PM2 and a Raspberry Pi option: **[SETUP.md](SETUP.md)**

## Tech

`Node.js (http, fs)` · Vanilla HTML/CSS/JS · JSON file storage

## Configuration

| Setting | Location |
| --- | --- |
| Pantry PIN | `PANTRY_PIN` in `index.html` (**change the default before deploying**) |
| Port | `PORT` in `server.js` (default `3000`) |
| Data / backup | `pantry-data.json` (created automatically) |
