import { EmbedBuilder } from 'discord.js';
import { getStock } from '../bloxgen.js';
import { COLORS } from '../config.js';

export default {
  name: 'stock',
  async execute() {
    const data = await getStock();
    const lines = Object.entries(data).map(
      ([type, inStock]) => `${inStock ? '🟢' : '🔴'} \`${type}\` — ${inStock ? 'in stock' : 'out of stock'}`,
    );
    const embed = new EmbedBuilder()
      .setTitle('Account stock')
      .setColor(COLORS.brand)
      .setDescription(lines.join('\n') || 'No stock info available.');
    return { embeds: [embed] };
  },
};
