// Shared account-generation logic used by the command and the panel/button.
import { generate } from '../bloxgen.js';
import { buildAccountEmbed, generateAgainRow } from './ui.js';
import { logGeneration } from './logger.js';

// Generates an account, logs it, and returns the message payload (embed + button).
export async function generateAccount(client, { type, user, guildId }) {
  const acc = await generate(type);
  await logGeneration(client, { user, type, acc, guildId });
  return { embeds: [buildAccountEmbed(acc)], components: [generateAgainRow(type)] };
}
