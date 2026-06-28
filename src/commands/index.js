// Command registry: maps command names and aliases to their module.
import generate from './generate.js';
import panel from './panel.js';
import balance from './balance.js';
import followers from './followers.js';
import stock from './stock.js';
import prices from './prices.js';
import limits from './limits.js';
import status from './status.js';
import settings from './settings.js';
import logs from './logs.js';
import history from './history.js';
import help from './help.js';

const list = [generate, panel, balance, followers, stock, prices, limits, status, settings, logs, history, help];

export const commands = new Map();
for (const command of list) {
  commands.set(command.name, command);
  for (const alias of command.aliases ?? []) commands.set(alias, command);
}
