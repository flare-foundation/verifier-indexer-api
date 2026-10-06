import { readFile } from 'fs/promises';
import { join } from 'path';
import { Version } from '../dtos/indexer/ApiDbVersion.dto';

// version metadata files are written next to dist/ by the docker build
const PROJECT_ROOT = join(__dirname, '../..');

/**
 * Reads a version metadata file from the project root.
 * Returns null when the file does not exist (local development).
 */
async function readVersionFile(fileName: string): Promise<string | null> {
  try {
    const data = await readFile(join(PROJECT_ROOT, fileName), 'utf-8');
    return data.trim();
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'ENOENT'
    ) {
      return null;
    }
    throw error;
  }
}

/**
 * Version of the running api server, read from build-time metadata files.
 */
export async function getApiServerVersion(): Promise<Version> {
  const [gitTag, gitHash, buildDate] = await Promise.all([
    readVersionFile('PROJECT_VERSION'),
    readVersionFile('PROJECT_COMMIT_HASH'),
    readVersionFile('PROJECT_BUILD_DATE'),
  ]);
  return {
    gitTag: gitTag || 'local',
    gitHash: gitHash || 'local',
    buildDate: Number(buildDate) || Math.floor(Date.now() / 1000),
  };
}
