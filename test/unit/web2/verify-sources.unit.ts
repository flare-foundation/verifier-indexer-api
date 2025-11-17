import { expect } from 'chai';
import { WEB2_JSON_SOURCES } from '../../../src/config/web2/web2-json-sources';
import { WEB2_JSON_TEST_SOURCES } from '../../../src/config/web2/web2-json-test-sources';

describe('Web2Json source validation', () => {
  describe('source id validation', () => {
    it('source ids should be valid', () => {
      const allIds = WEB2_JSON_SOURCES.concat(WEB2_JSON_TEST_SOURCES).map(
        (s) => s.sourceId,
      );
      // byte length should fit into 32 bytes
      const invalidIds = allIds.filter(
        (id) => Buffer.byteLength(id, 'utf8') > 32,
      );
      expect(invalidIds, `Source Id exceeds 32 bytes: ${invalidIds.join(',')}`)
        .to.be.empty;
      // should only contain alphanumeric characters
      const invalidCharIds = allIds.filter((id) => !/^[a-zA-Z0-9]+$/.test(id));
      expect(
        invalidCharIds,
        `Source Id should only contain alphanumeric characters: ${invalidCharIds.join(',')}`,
      ).to.be.empty;
    });
    it('all source ids should be unique', () => {
      const allIds = WEB2_JSON_SOURCES.concat(WEB2_JSON_TEST_SOURCES).map(
        (s) => s.sourceId,
      );

      const rawDuplicates = allIds.filter(
        (id, idx) => allIds.indexOf(id) !== idx,
      );
      const uniqueDuplicates = Array.from(new Set(rawDuplicates));

      expect(
        uniqueDuplicates,
        `Duplicate sourceIds found: ${uniqueDuplicates.join(',')}`,
      ).to.be.empty;
    });
  });
  describe('host and path validation', () => {
    const allSources = WEB2_JSON_SOURCES.concat(WEB2_JSON_TEST_SOURCES);

    it('all endpoint host+path combinations should form valid URLs', () => {
      for (const source of allSources) {
        for (const endpoint of source.endpoints) {
          const host = endpoint.host;
          if (!host || host.trim().length === 0) {
            throw new Error(
              `Invalid host: sourceId=${source.sourceId}:<empty-host>`,
            );
          }

          const paths = endpoint.paths;
          if (paths === '*') {
            try {
              new URL(`https://${host}`);
            } catch (err) {
              throw new Error(
                `Invalid endpoint host for sourceId=${source.sourceId}: ${err}`,
              );
            }
            continue;
          }

          for (const path of paths) {
            if (!path || path.trim().length === 0) {
              throw new Error(
                `Invalid endpoint: sourceId=${source.sourceId}:${endpoint.host}:<empty-path>`,
              );
            }

            const normalizedPath = path.startsWith('/') ? path : `/${path}`;
            const candidate = `https://${host}${normalizedPath}`;

            try {
              new URL(candidate);
            } catch (err) {
              throw new Error(
                `Invalid endpoint URL for sourceId=${source.sourceId}: ${candidate} (${err})`,
              );
            }
          }
        }
      }
    });
  });
});
