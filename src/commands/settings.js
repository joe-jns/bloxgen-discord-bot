import { PermissionFlagsBits } from 'discord.js';
import { PREFIX } from '../config.js';
import { getDelivery, setDelivery } from '../lib/settings.js';

export default {
  name: 'settings',
  async execute({ message, args }) {
    const current = getDelivery(message.guildId);

    if (!message.guild) {
      return 'Settings can only be changed in a server. (Accounts are always DMed in direct messages.)';
    }

    const choice = (args[0] || '').toLowerCase();
    if (!choice) {
      return `Account delivery is currently set to **${current}**.\n` +
        `Use \`${PREFIX}settings dm\` (private) or \`${PREFIX}settings server\` (posted in the channel).`;
    }

    // Only server managers can change delivery (server mode exposes credentials publicly).
    if (!message.member?.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return '❌ You need the **Manage Server** permission to change this.';
    }

    const map = { dm: 'dm', private: 'dm', server: 'server', channel: 'server', public: 'server' };
    const mode = map[choice];
    if (!mode) {
      return `❌ Unknown option. Use \`${PREFIX}settings dm\` or \`${PREFIX}settings server\`.`;
    }

    setDelivery(message.guildId, mode);
    if (mode === 'server') {
      return '✅ Generated accounts will now be **posted in the channel**.\n⚠️ Anyone who can read the channel will see the credentials and cookie.';
    }
    return '✅ Generated accounts will now be **sent privately via DM**.';
  },
};
