import { LogLevel } from '@nestjs/common';
import { expect } from 'chai';
import { EVMHealthController } from '../../src/controllers/evm-health.controller';
import { EvmNodeEngineService } from '../../src/services/evm-services/evm-node-engine.service';
import { RedactingLogger } from '../../src/utils/logger';
import { redactUrls } from '../../src/utils/redact';

const SECRET = 'supersecretapikey';
const RPC_URL = `https://rpc.example.com/v1/${SECRET}`;

/** RedactingLogger that collects formatted lines instead of writing to stdout. */
class CapturingLogger extends RedactingLogger {
  lines: string[] = [];
  protected override printMessages(
    messages: unknown[],
    _context: string,
    logLevel: LogLevel,
  ): void {
    for (const m of messages) {
      this.lines.push(this.stringifyMessage(m, logLevel));
    }
  }
}

// ethers puts the request URL, and so any key in it, into its error messages
function failingEngine(): EvmNodeEngineService {
  const fail = () =>
    Promise.reject(
      new Error(
        `server response 503 Service Unavailable (request={"url":"${RPC_URL}"})`,
      ),
    );
  return {
    getStateSetting: fail,
    getServiceVersion: fail,
  } as unknown as EvmNodeEngineService;
}

function controller(logger: CapturingLogger): EVMHealthController {
  const c = new EVMHealthController(failingEngine());
  Object.assign(c, { logger });
  return c;
}

describe('redactUrls', () => {
  it('keeps scheme and host, drops path, query and credentials', () => {
    expect(
      redactUrls(
        `failed (request={"url":"https://user:pw@rpc.example.com:8545/v1/${SECRET}?key=${SECRET}"}) and ws://n.example.org/${SECRET}`,
      ),
    ).to.equal(
      'failed (request={"url":"https://rpc.example.com:8545/…"}) and ws://n.example.org/…',
    );
  });

  it('leaves text without URLs alone', () => {
    expect(redactUrls('connect ECONNREFUSED 10.0.0.5:8545')).to.equal(
      'connect ECONNREFUSED 10.0.0.5:8545',
    );
  });
});

describe('EVM health controller on node failure', () => {
  for (const route of ['nodeState', 'nodeVersion'] as const) {
    it(`${route} answers a generic error and logs the detail without the key`, async () => {
      const logger = new CapturingLogger();
      const res = await controller(logger)[route]();

      expect(res.status).to.equal('ERROR');
      expect(res.errorMessage).to.equal('EVM node unavailable');
      expect(JSON.stringify(res)).to.not.include(SECRET);

      const warn = logger.lines.find((l) => l.includes('failed'));
      expect(warn).to.include('503');
      expect(warn).to.include('rpc.example.com');
      expect(warn).to.not.include(SECRET);
    });
  }
});

describe('RedactingLogger', () => {
  it('redacts stack traces too', () => {
    const out: string[] = [];
    const capture = (chunk: string | Uint8Array) => {
      out.push(String(chunk));
      return true;
    };
    const stdout = process.stdout.write.bind(process.stdout);
    const stderr = process.stderr.write.bind(process.stderr);
    process.stdout.write = capture as typeof process.stdout.write;
    process.stderr.write = capture as typeof process.stderr.write;
    try {
      new RedactingLogger('test').error(
        'boom',
        `Error: boom\n    at fetch (${RPC_URL}:12:34)`,
      );
    } finally {
      process.stdout.write = stdout;
      process.stderr.write = stderr;
    }

    const text = out.join('');
    expect(text).to.include('at fetch (https://rpc.example.com/…');
    expect(text).to.not.include(SECRET);
  });
});
