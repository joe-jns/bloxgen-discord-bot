import { PREFIX } from '../config.js';
import { ACCOUNT_TYPES } from '../bloxgen.js';
import { buildPanel } from '../lib/ui.js';
import { generateAccount } from '../lib/generation.js';
import { getDelivery } from '../lib/settings.js';

export default {
  name: 'generate',
  aliases: ['gen'],
  async execute({ message, args, client }) {
    const type = args.join(' ').trim();

    // No type given -> show the interactive dropdown panel.
    if (!type) return buildPanel();

    if (!ACCOUNT_TYPES.includes(type)) {
      return `❌ Invalid type. Available: ${ACCOUNT_TYPES.map((t) => `\`${t}\``).join(', ')}`;
    }

    const payload = await generateAccount(client, {
      type,
      user: message.author,
      guildId: message.guildId,
    });

    const mode = getDelivery(message.guildId);
    if (mode === 'server' && message.guild) {
      await message.channel.send(payload);
      return;
    }

    // Default: DM the credentials (they are sensitive).
    try {
      await message.author.send(payload);
      return '📩 Account sent to your DMs.';
    } catch {
      return '❌ Could not DM you. Enable DMs from server members, or ask an admin to switch to `+settings server`.';
    }
  },
};
