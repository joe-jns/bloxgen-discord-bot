// Load .env from this project folder, no matter the current working directory.
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const here = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(here, '.env') });
