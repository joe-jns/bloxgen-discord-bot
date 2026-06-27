# 🤖 BloxGen Discord Bot

A simple Discord bot that lets you generate Roblox accounts through the [BloxGen API](https://docs.bloxgen.net), right from your Discord server.

You type commands like `+generate alt` and the bot does the rest.

---

## ✨ What it can do

| Command | What it does |
| --- | --- |
| `+generate <type>` | Generates a Roblox account and sends it to you |
| `+balance` | Shows how much money is left on the BloxGen account |
| `+followers <id>` | Checks how many followers can be added to a Roblox account |
| `+settings` | Choose where accounts are sent: your DMs or the channel (admins only) |
| `+help` | Shows the list of commands |

**Account types** for `+generate`: `alt`, `+30 days old`, `+1 year old`, `5+ years old`, `dump`.

> 💡 By default, generated accounts are sent to you in **private messages (DM)** so nobody else sees the passwords. An admin can change this with `+settings server` if you want them posted in the channel instead.

---

## 🚀 Setup guide (no coding needed)

Follow these steps once. It takes about 10 minutes.

### Step 1 — Install Node.js

The bot needs a free program called **Node.js** to run.

1. Go to **https://nodejs.org**
2. Download the **LTS** version (the big green button) and install it (just click Next → Next → Finish).

### Step 2 — Download the bot

1. On this GitHub page, click the green **`Code`** button → **Download ZIP**.
2. Unzip it somewhere easy to find, like your Desktop.

### Step 3 — Create your Discord bot

1. Go to **https://discord.com/developers/applications** and log in.
2. Click **New Application**, give it a name, click **Create**.
3. In the left menu, click **Bot**.
4. Click **Reset Token**, then **Copy** — keep this token safe, you'll need it. ⚠️ Never share it.
5. Scroll down to **Privileged Gateway Intents** and turn ON **MESSAGE CONTENT INTENT**. Click **Save**.

### Step 4 — Invite the bot to your server

1. In the left menu, click **OAuth2**.
2. Under **OAuth2 URL Generator**, scroll down, check **`bot`**.
3. In the **Bot Permissions** box that appears, check: **Send Messages**, **Embed Links**, **Read Message History**.
4. Copy the link at the bottom, paste it in your browser, and pick your server to invite the bot.

### Step 5 — Get your BloxGen API key

1. Log in to your **[BloxGen Dashboard](https://bloxgen.net/dashboard/overview)**.
2. Copy your **API key** (it looks like `BLOX-xxxxxxxxxxxxxxxx`).
3. ⚠️ Important: in the dashboard, **accept the rules once** — otherwise `+generate` won't work.

### Step 6 — Add your tokens to the bot

1. In the bot folder, find the file named **`.env.example`**.
2. Make a copy of it and rename the copy to **`.env`** (just `.env`, nothing before the dot).
3. Open `.env` with Notepad and fill in:
   ```
   DISCORD_TOKEN=paste-your-discord-token-here
   BLOXGEN_API_KEY=BLOX-your-key-here
   ```
4. Save the file.

### Step 7 — Start the bot

1. Open the bot folder.
2. Click the address bar at the top of the window, type `cmd`, and press **Enter** (this opens a black command window in that folder).
3. Type this and press Enter (only needed the first time):
   ```
   npm install
   ```
4. Then start the bot:
   ```
   npm start
   ```

When you see **`Logged in as ...`**, the bot is online! 🎉
Go to your Discord server and try `+help`.

> To keep the bot running, leave that command window open. Closing it stops the bot.

---

## ⚙️ Settings: DM vs channel

By default accounts are sent privately to whoever ran the command.

A server admin (someone with **Manage Server** permission) can change this:

- `+settings dm` → accounts sent privately by DM (default, safest)
- `+settings server` → accounts posted directly in the channel
- `+settings` → shows the current setting

⚠️ **Warning:** `server` mode means everyone who can read the channel will see the account password and cookie. Only use it in a private/admin-only channel.

---

## ❓ Troubleshooting

| Problem | Fix |
| --- | --- |
| Bot doesn't respond to commands | Make sure **MESSAGE CONTENT INTENT** is ON (Step 3.5) and the bot is online. |
| "Could not DM you" | Allow DMs from server members (Server settings → Privacy), or use `+settings server`. |
| "API key is required" / "Invalid API key" | Double-check `BLOXGEN_API_KEY` in your `.env`. |
| "You must accept the rules before generating" | Accept the rules once in the BloxGen dashboard. |
| "Insufficient balance" | Top up your BloxGen balance. |
| `'npm' is not recognized` | Node.js isn't installed — redo Step 1, then reopen the command window. |

---

## 🔒 Notes

- The BloxGen API key belongs to **you (the bot owner)** — everyone using the bot spends from **your** balance.
- Never share your `.env` file, your Discord token, or your API key.
- Keep the bot in a server/channel you trust.

---

## 🛠️ For developers

- Node.js 18+ (uses built-in `fetch`), [discord.js](https://discord.js.org) v14.
- `index.js` — bot + command handlers
- `bloxgen.js` — BloxGen API client
- `settings.js` — per-server delivery setting (`settings.json`)
- `loadenv.js` — loads `.env` regardless of working directory

```bash
npm install
npm start
```
