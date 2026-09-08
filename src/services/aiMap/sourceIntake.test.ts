import { describe, expect, it } from 'vitest';
import { createTextSource, inspectFolderFiles } from './sourceIntake';

function createFolderFile(path: string, content: string, type = 'text/plain'): File {
  const file = new File([content], path.split('/').at(-1) ?? 'file.txt', { type });
  Object.defineProperty(file, 'webkitRelativePath', { value: path });
  return file;
}

describe('AI Map source intake', () => {
  it('excludes technical folders and sensitive filenames', async () => {
    const result = await inspectFolderFiles([
      createFolderFile('demo/src/app.ts', 'export const app = true;'),
      createFolderFile('demo/.env', 'API_KEY=do-not-read'),
      createFolderFile('demo/node_modules/lib/index.js', 'ignored'),
      createFolderFile('demo/assets/logo.png', 'binary-ish', 'image/png'),
    ]);

    expect(result.folderName).toBe('demo');
    expect(result.includedCount).toBe(1);
    expect(result.excludedCount).toBe(3);
    expect(result.context).toContain('export const app = true;');
    expect(result.context).not.toContain('do-not-read');
  });

  it('redacts likely credentials inside otherwise supported text files', async () => {
    const result = await inspectFolderFiles([
      createFolderFile(
        'demo/config/settings.ts',
        'const mode = "safe";\napi_key = sk-1234567890abcdefghijkl\nauthorization: Bearer abc123'
      ),
    ]);

    expect(result.redactedCount).toBe(2);
    expect(result.context).toContain('[REDACTADO]');
    expect(result.context).not.toContain('sk-1234567890abcdefghijkl');
    expect(result.context).not.toContain('Bearer abc123');
  });

  it('also redacts obvious tokens in pasted text', () => {
    const source = createTextSource(
      'Revisar despliegue con token ghp_1234567890abcdefghijklmnop y registrar el resultado.',
      'Entender el flujo de despliegue'
    );

    expect(source.redactedCount).toBe(1);
    expect(source.content).toContain('[REDACTADO]');
    expect(source.content).not.toContain('ghp_1234567890abcdefghijklmnop');
    expect(source.objective).toBe('Entender el flujo de despliegue');
  });

  it('redacts common code, JSON, bearer, cloud-key and JWT shapes', () => {
    const source = createTextSource(
      [
        'const apiKey = "super-secret-value";',
        '{ "client_secret": "json-secret" }',
        'headers.authorization = `Bearer abcdefghijklmnop`;',
        'awsAccessKey = "AKIA1234567890ABCDEF";',
        'jwt: eyJabcdefghijk.eyJabcdefghijk.abcdefghijk',
      ].join('\n'),
      'Auditar el flujo de credenciales'
    );

    expect(source.redactedCount).toBeGreaterThanOrEqual(5);
    expect(source.content).not.toContain('super-secret-value');
    expect(source.content).not.toContain('json-secret');
    expect(source.content).not.toContain('abcdefghijklmnop');
    expect(source.content).not.toContain('AKIA1234567890ABCDEF');
    expect(source.content).not.toContain('eyJabcdefghijk');
  });
});
