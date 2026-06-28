import { MessageFlags } from 'discord.js';
import { ACCOUNT_TYPES } from '../bloxgen.js';
import { generateAccount } from '../lib/generation.js';
import { getDelivery } from '../lib/settings.js';
import { buildHistoryPage } from '../commands/history.js';

// Generate from a button/menu interaction. The account is sent to DMs (or the
// channel) so it persists; the interaction reply is just an ephemeral receipt.
async function handleGenerateInteraction(interaction, type) {
  if (!ACCOUNT_TYPES.includes(type)) {
    await interaction.reply({ content: '❌ Unknown account type.', flags: MessageFlags.Ephemeral });
    return;
  }

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  try {
    const payload = await generateAccount(interaction.client, {
      type,
      user: interaction.user,
      guildId: interaction.guildId,
    });

    const mode = getDelivery(interaction.guildId);
    if (mode === 'server' && interaction.guild) {
      await interaction.channel.send(payload);
      await interaction.editReply('✅ Account posted in the channel.');
      return;
    }

    try {
      await interaction.user.send(payload);
      await interaction.editReply('📩 Account sent to your DMs.');
    } catch {
      await interaction.editReply('❌ Could not DM you. Enable DMs from server members and try again.');
    }
  } catch (err) {
    console.error('Interaction generate failed:', err);
    await interaction.editReply(`❌ ${err.message || 'Something went wrong.'}`);
  }
}

export const name = 'interactionCreate';

export async function execute(interaction) {
  try {
    if (interaction.isStringSelectMenu() && interaction.customId === 'gen-select') {
      await handleGenerateInteraction(interaction, interaction.values[0]);
    } else if (interaction.isButton() && interaction.customId.startsWith('gen-again:')) {
      await handleGenerateInteraction(interaction, interaction.customId.slice('gen-again:'.length));
    } else if (interaction.isButton() && interaction.customId.startsWith('hist:')) {
      const page = Math.max(1, parseInt(interaction.customId.slice('hist:'.length), 10) || 1);
      try {
        const payload = await buildHistoryPage(page);
        await interaction.update(payload);
      } catch (err) {
        await interaction.reply({ content: `❌ ${err.message || 'Something went wrong.'}`, flags: MessageFlags.Ephemeral });
      }
    }
  } catch (err) {
    console.error('interactionCreate handler error:', err);
  }
}
