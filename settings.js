// Tiny per-server settings store, persisted to settings.json next to this file.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const FILE = join(dirname(fileURLToPath(import.meta.url)), 'settings.json');

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

// Where generated accounts are sent: "dm" (default) or "server".
export function getDelivery(guildId) {
  if (!guildId) return 'dm';
  return readAll()[guildId]?.delivery ?? 'dm';
}

export function setDelivery(guildId, delivery) {
  const data = readAll();
  data[guildId] = { ...data[guildId], delivery };
  writeAll(data);
}

// Channel ID where generations are logged for this server (null = none set).
export function getLogChannel(guildId) {
  if (!guildId) return null;
  return readAll()[guildId]?.logChannel ?? null;
}

// Pass null/undefined to clear the configured log channel.
export function setLogChannel(guildId, channelId) {
  const data = readAll();
  data[guildId] = { ...data[guildId], logChannel: channelId ?? null };
  writeAll(data);
}
