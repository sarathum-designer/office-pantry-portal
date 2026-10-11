# Raghav Group Pantry Portal — Setup Guide

A complete walkthrough for getting the portal running on your office WiFi.
Total time: ~10 minutes the first time.

---

## How it works (the big picture)

You'll run a small program on **one computer** in your office. That computer's job is to listen for orders. Everyone else (employees + pantry staff) connects to it over the office WiFi by opening a link in their phone or laptop browser. People outside your WiFi cannot reach it — your router blocks them automatically.

```
   Employee phone                 Pantry tablet/laptop
   (orders chai)                  (sees the order)
        │                                  │
        │           Office WiFi            │
        └─────────────┬────────────────────┘
                      │
              ┌───────▼────────┐
              │  Host computer │  ← runs server.js
              │  (always-on)   │
              └────────────────┘
```

---

## What you'll need

1. **A host computer** that stays on during office hours. Any of these works:
   - A spare laptop (just don't shut the lid)
   - A desktop in the office
   - A Raspberry Pi (for an always-on, no-fuss setup)
   The pantry's own tablet/laptop also works if it's plugged in and on.

2. **The project files** (you have these in the folder):
   - `server.js`, `index.html`, and the `css/` and `js/` folders

3. **Node.js** installed on the host computer (free, ~5 min install).

---

## Step 1 — Install Node.js on the host computer

1. Go to **https://nodejs.org**
2. Click the big green **LTS** button (the recommended version).
3. Run the installer. Click Next on every screen, accept the defaults.
4. Done. You don't need to open Node — it's just a runtime that the server uses.

To check it worked: open the **Terminal** (Mac) or **Command Prompt** / **PowerShell** (Windows) and type:
```
node --version
```
You should see something like `v22.x.x`. If you do, you're set.

---

## Step 2 — Put the files somewhere

1. Make a folder, e.g. on the Desktop, called `raghav-pantry`.
2. Copy `server.js`, `index.html` and the `css/` and `js/` folders into it, keeping the same layout.

That's it. No installation. No "npm install". The server uses only Node's built-in tools.

---

## Step 3 — Start the server

1. Open Terminal (Mac) / Command Prompt (Windows).
2. Navigate to the folder. Easiest way:
   - **Windows**: open the folder in File Explorer → click the address bar → type `cmd` → press Enter. A terminal opens already inside the folder.
   - **Mac**: right-click the folder → *Services* → *New Terminal at Folder*.
   - Or type: `cd path/to/raghav-pantry`
3. Type:
   ```
   node server.js
   ```
4. You'll see something like:
   ```
   ========================================
     Office Pantry Portal is running
   ========================================

     On this machine:    http://localhost:3000
     On the office WiFi: http://192.168.1.42:3000

     Share the WiFi link with your team.
     Press Ctrl+C to stop.
   ```

**Keep this window open.** Closing it stops the server. (See Step 6 for how to make it auto-restart.)

---

## Step 4 — Share the WiFi link with everyone

The line that says `On the office WiFi: http://192.168.x.x:3000` — that's the URL your team uses. Yours will look different but the format is the same.

Tell people to:
1. Connect to the office WiFi (essential).
2. Open the link in any browser — Chrome, Safari, whatever they use.
3. Bookmark it / add it to home screen.

A nice touch: print a small QR code of the link and stick it in the pantry. People scan with their phone camera and they're in.

The pantry staff opens the same link, taps **Pantry staff**, and enters the PIN.

---

## Step 5 — Test it

On any device on the WiFi:
1. Open the link → tap **I'm ordering** → enter "Test — Cabin 1" → add a chai → place order.
2. On another device (or the same one), tap the back arrow → **Pantry staff** → PIN `2580` → you should see the test order appear within ~3 seconds.
3. Tap **Preparing**, then **Ready**, then **Delivered**. Switch back to the employee tab — you'll see the status update on their side.

If that works, you're live.

---

## Step 6 — Make sure it stays running

The basic version stops if you close the terminal or restart the host computer. Three options, easiest first:

### Option A — Just leave it open (good for testing)
Keep the terminal window open. Don't shut the laptop. Done.

### Option B — Auto-restart on crash + on reboot (recommended)
This uses **PM2**, a small tool that babysits the server.

In the terminal:
```
npm install -g pm2
pm2 start server.js --name pantry
pm2 save
pm2 startup
```
The last command prints one more command — copy and run it (it sets up auto-start on boot). After this, even if the host reboots, the portal comes back automatically.

To check status anytime: `pm2 status`
To stop: `pm2 stop pantry`
To see live logs (orders coming in): `pm2 logs pantry`

### Option C — Raspberry Pi (best long-term)
A ₹3000–4000 Raspberry Pi tucked behind the pantry runs this 24/7 silently and uses ~3W of power. Install Node, install PM2, done.

---

## Customizing things

### Change the pantry PIN
Open `js/app.jsx` in any text editor (Notepad works). Near the top, find:
```js
const PANTRY_PIN = "2580";
```
Change it to whatever you want, save, refresh the browser. No server restart needed.

### Change the port (if 3000 is busy)
Open `server.js`, find:
```js
const PORT = 3000;
```
Change to e.g. `8080`, save, restart the server.

### Reset the menu / clear all orders
Stop the server. Delete the `pantry-data.json` file that appears next to `server.js`. Restart. The default menu comes back fresh.

### Backup
The `pantry-data.json` file holds everything. Copy it once a week if you want a backup.

---

## If someone can't connect

Run through this checklist:

| Problem | Fix |
|--|--|
| Page won't load on a phone | Phone must be on the **office WiFi**, not mobile data |
| "Site can't be reached" from a laptop on WiFi | Host computer's firewall is blocking. **Windows**: Windows Defender Firewall → Allow an app → add Node.js → check both Private and Public. **Mac**: System Settings → Network → Firewall → allow Node. |
| The IP address keeps changing | Reserve a fixed IP on your router for the host machine (DHCP reservation by MAC). Ask your IT person — it's a 30-second router setting. |
| "Address already in use" when starting | Another program is using port 3000. Either close it, or change the port in `server.js` to 8080. |
| Page loads but looks broken | The host needs internet on first load (to fetch fonts). If your office WiFi is offline, tell me and I'll send an offline-only version. |

---

## What about people outside the office?

They cannot reach it. The server only listens on your local network — your router blocks all incoming connections from the internet by default. Even if someone knew the IP, they'd hit a wall.

This is exactly what you wanted: WFH employees won't see it, no random orders, just the office.

If a remote employee ever needs access (e.g. someone working from a Raghav site office), the answer is a VPN — but for now this is overkill, and the system stays simple.

---

## Pantry staff — daily routine

1. Open the link on the pantry's tablet/laptop in the morning. Tap **Pantry staff** → PIN.
2. Leave that tab open all day. New orders appear automatically.
3. For each order:
   - When you start making it, tap **Preparing**.
   - When it's ready to deliver, tap **Ready**.
   - After dropping it off, tap **Delivered**.
4. Out of bourbon biscuits? Go to **Manage Menu**, toggle Bourbon to **OUT**. Employees will see it greyed out and can't order it. Toggle it back when restocked.
5. New item arrived (say, Oreo)? **Manage Menu** → **Add new item** → name it Oreo, choose Snacks, save.

That's the entire workflow.

---

Questions or something not working? The `pm2 logs pantry` command (if using PM2) shows everything happening live — useful for debugging.
