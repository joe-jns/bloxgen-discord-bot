// Reusable embeds and message components.
import {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { ACCOUNT_TYPES } from '../bloxgen.js';
import { COLORS } from '../config.js';

// Embed shown for a generated account.
export function buildAccountEmbed(acc) {
  const embed = new EmbedBuilder()
    .setTitle('✅ Account generated')
    .setColor(COLORS.success)
    .addFields(
      { name: 'Username', value: '`' + acc.username + '`', inline: true },
      { name: 'Password', value: '`' + acc.password + '`', inline: true },
      { name: 'Type', value: String(acc.type), inline: true },
    );

  if (acc.id != null) embed.addFields({ name: 'User ID', value: String(acc.id), inline: true });
  if (acc.region) embed.addFields({ name: 'Region', value: acc.region, inline: true });
  if (acc.cost != null) embed.addFields({ name: 'Cost', value: `$${acc.cost}`, inline: true });
  if (acc.robux != null) embed.addFields({ name: 'Robux', value: String(acc.robux), inline: true });
  if (acc.rap != null) embed.addFields({ name: 'RAP', value: String(acc.rap), inline: true });
  if (acc.avatarUrl) embed.setThumbnail(acc.avatarUrl);
  if (acc.cookie) {
    embed.addFields({ name: '.ROBLOSECURITY cookie', value: '```\n' + acc.cookie + '\n```' });
  }
  return embed;
}

// A "Generate again" button that regenerates the same type.
export function generateAgainRow(type) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`gen-again:${type}`)
      .setLabel('Generate again')
      .setEmoji('🔄')
      .setStyle(ButtonStyle.Secondary),
  );
}

// The dropdown panel to pick an account type.
export function buildPanel() {
  const embed = new EmbedBuilder()
    .setColor(COLORS.brand)
    .setTitle('🧬 Generate an account')
    .setDescription('Pick an account type from the menu below.\nYour account will be sent to your DMs.');

  const menu = new StringSelectMenuBuilder()
    .setCustomId('gen-select')
    .setPlaceholder('Choose an account type…')
    .addOptions(ACCOUNT_TYPES.map((t) => ({ label: t, value: t })));

  return { embeds: [embed], components: [new ActionRowBuilder().addComponents(menu)] };
}
