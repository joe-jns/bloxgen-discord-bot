// Tiny per-server settings store, persisted to settings.json in the project root.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from '../config.js';

const FILE = join(ROOT, 'settings.json');

function readAll() {
  try {
    return JSON.parse(readFileSync(FILE, 'utf8'));
  } catch {
    return {};
  }
}

function writeAll(data) {
  writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function update(guildId, patch) {
  const data = readAll();
  data[guildId] = { ...data[guildId], ...patch };
  writeAll(data);
}

// Where generated accounts are sent: "dm" (default) or "server".
export function getDelivery(guildId) {
  if (!guildId) return 'dm';
  return readAll()[guildId]?.delivery ?? 'dm';
}

export function setDelivery(guildId, delivery) {
  update(guildId, { delivery });
}

// Channel ID where generations are logged for this server (null = none set).
export function getLogChannel(guildId) {
  if (!guildId) return null;
  return readAll()[guildId]?.logChannel ?? null;
}

// Pass null/undefined to clear the configured log channel.
export function setLogChannel(guildId, channelId) {
  update(guildId, { logChannel: channelId ?? null });
}
