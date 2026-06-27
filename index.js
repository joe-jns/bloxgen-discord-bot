// Simple Discord bot for the BloxGen API (prefix commands)
import './loadenv.js';
import {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  PermissionFlagsBits,
} from 'discord.js';
import {
  ACCOUNT_TYPES,
  generate,
  getBalance,
  checkFollowers,
  getStock,
  getPrices,
  getDailyLimit,
} from './bloxgen.js';
import { getDelivery, setDelivery } from './settings.js';

const { DISCORD_TOKEN, BLOXGEN_API_KEY } = process.env;
const PREFIX = process.env.PREFIX || '+';

if (!DISCORD_TOKEN || !BLOXGEN_API_KEY) {
  console.error('Missing env vars. Copy .env.example to .env and fill DISCORD_TOKEN and BLOXGEN_API_KEY.');
  process.exit(1);
}

// --- Command handlers ---
// Each handler receives (message, args) and returns a reply (string or { embeds }).

async function cmdGenerate(message, args) {
  const type = args.join(' ').trim();
  if (!type) {
    return `Usage: \`${PREFIX}generate <type>\` — types: ${ACCOUNT_TYPES.map((t) => `\`${t}\``).join(', ')}`;
  }
  if (!ACCOUNT_TYPES.includes(type)) {
    return `❌ Invalid type. Available: ${ACCOUNT_TYPES.map((t) => `\`${t}\``).join(', ')}`;
  }

  const acc = await generate(type);

  const embed = new EmbedBuilder()
    .setTitle('Account generated')
    .setColor(0x5865f2)
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

  // Delivery mode is configurable per server via +settings (default: dm).
  const mode = getDelivery(message.guildId);

  if (mode === 'server' && message.guild) {
    await message.channel.send({ embeds: [embed] });
    return; // posted in channel, no extra reply needed
  }

  // Default: DM the credentials (they are sensitive).
  try {
    await message.author.send({ embeds: [embed] });
    return '📩 Account sent to your DMs.';
  } catch {
    return '❌ Could not DM you. Enable DMs from server members, or ask an admin to switch to `+settings server`.';
  }
}

async function cmdSettings(message, args) {
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
}

async function cmdBalance(message) {
  const data = await getBalance();
  const embed = new EmbedBuilder()
    .setTitle('BloxGen balance')
    .setColor(0x57f287)
    .setDescription(`**$${data.balance}**`);
  return { embeds: [embed] };
}

async function cmdFollowers(message, args) {
  const userid = args.join(' ').trim();
  if (!userid) {
    return `Usage: \`${PREFIX}followers <roblox username or id>\``;
  }

  const data = await checkFollowers(userid);
  const embed = new EmbedBuilder()
    .setTitle('Followers availability')
    .setColor(data.available ? 0x57f287 : 0xed4245)
    .addFields(
      { name: 'Account', value: String(data.userid), inline: true },
      { name: 'Available', value: data.available ? 'Yes' : 'No', inline: true },
      { name: 'Max followers', value: String(data.max_followers ?? 0), inline: true },
    );
  if (data.reason) embed.addFields({ name: 'Reason', value: data.reason });
  return { embeds: [embed] };
}

async function cmdStock() {
  const data = await getStock();
  const lines = Object.entries(data).map(
    ([type, inStock]) => `${inStock ? '🟢' : '🔴'} \`${type}\` — ${inStock ? 'in stock' : 'out of stock'}`,
  );
  const embed = new EmbedBuilder()
    .setTitle('Account stock')
    .setColor(0x5865f2)
    .setDescription(lines.join('\n') || 'No stock info available.');
  return { embeds: [embed] };
}

async function cmdPrices() {
  const data = await getPrices();
  const lines = Object.entries(data).map(([type, price]) => `\`${type}\` — $${price}`);
  const embed = new EmbedBuilder()
    .setTitle('Account prices')
    .setColor(0x5865f2)
    .setDescription(lines.join('\n') || 'No price info available.');
  return { embeds: [embed] };
}

async function cmdLimits() {
  const data = await getDailyLimit();
  const embed = new EmbedBuilder()
    .setTitle('Daily generation limits')
    .setColor(0x5865f2)
    .setDescription(
      `Total today: **${data.generationsToday}/${data.dailyLimit}** ` +
        `(**${data.remainingGenerations}** left)`,
    );

  for (const t of data.accountTypes ?? []) {
    embed.addFields({
      name: `${t.canGenerate ? '🟢' : '🔴'} ${t.accountType}`,
      value: `${t.generationsToday}/${t.dailyLimit} used`,
      inline: true,
    });
  }
  if (data.resetTime) embed.setFooter({ text: `Resets at ${data.resetTime}` });
  return { embeds: [embed] };
}

function cmdHelp() {
  const embed = new EmbedBuilder()
    .setTitle('BloxGen bot — commands')
    .setColor(0x5865f2)
    .addFields(
      { name: `${PREFIX}generate <type>`, value: `Generate an account (${ACCOUNT_TYPES.map((t) => `\`${t}\``).join(', ')})` },
      { name: `${PREFIX}balance`, value: 'Check your BloxGen balance' },
      { name: `${PREFIX}followers <id>`, value: 'Check max followers for a Roblox account' },
      { name: `${PREFIX}stock`, value: 'Show which account types are in stock' },
      { name: `${PREFIX}prices`, value: 'Show price per account type' },
      { name: `${PREFIX}limits`, value: 'Show your daily generation limits' },
      { name: `${PREFIX}settings [dm|server]`, value: 'Where generated accounts are sent (admin only)' },
    );
  return { embeds: [embed] };
}

const handlers = {
  generate: cmdGenerate,
  gen: cmdGenerate,
  balance: cmdBalance,
  bal: cmdBalance,
  followers: cmdFollowers,
  stock: cmdStock,
  prices: cmdPrices,
  limits: cmdLimits,
  settings: cmdSettings,
  help: cmdHelp,
};

// --- Client ---
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // privileged: enable in the Developer Portal
    GatewayIntentBits.DirectMessages,
  ],
});

client.once('clientReady', (c) => {
  console.log(`Logged in as ${c.user.tag} — prefix "${PREFIX}"`);
});

// Reply without ever throwing (e.g. missing permissions, deleted message).
async function safeReply(message, content) {
  try {
    await message.reply(content);
  } catch (err) {
    console.error('Failed to send reply:', err.message);
  }
}

client.on('messageCreate', async (message) => {
  try {
    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;

    const [name, ...args] = message.content.slice(PREFIX.length).trim().split(/\s+/);
    const handler = handlers[name.toLowerCase()];
    if (!handler) return;

    try {
      const reply = await handler(message, args);
      if (reply) await safeReply(message, reply);
    } catch (err) {
      console.error(`${PREFIX}${name} failed:`, err);
      await safeReply(message, `❌ ${err.message || 'Something went wrong.'}`);
    }
  } catch (err) {
    // Last-resort guard so a bad message can never crash the bot.
    console.error('messageCreate handler error:', err);
  }
});

// Discord.js connection-level errors (don't crash, just log).
client.on('error', (err) => console.error('Client error:', err));
client.on('shardError', (err) => console.error('Shard error:', err));

// Global safety net: log unexpected errors instead of crashing the process.
process.on('unhandledRejection', (reason) => console.error('Unhandled rejection:', reason));
process.on('uncaughtException', (err) => console.error('Uncaught exception:', err));

try {
  await client.login(DISCORD_TOKEN);
} catch (err) {
  console.error('Failed to log in. Check your DISCORD_TOKEN in .env.');
  console.error(err.message);
  await client.destroy().catch(() => {});
  process.exitCode = 1;
}
