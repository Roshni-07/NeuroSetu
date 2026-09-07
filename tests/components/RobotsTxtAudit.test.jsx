import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Search Indexing & Privacy Configuration', () => {
  it('has public/robots.txt disallowing all indexing for clinical patient privacy', () => {
    const robotsPath = path.resolve(__dirname, '../../public/robots.txt');
    expect(fs.existsSync(robotsPath)).toBe(true);

    const content = fs.readFileSync(robotsPath, 'utf8');
    expect(content).toMatch(/User-agent:\s*\*/i);
    expect(content).toMatch(/Disallow:\s*\//i);
  });

  it('does not contain public/sitemap.xml so private clinical routes are not published', () => {
    const sitemapPath = path.resolve(__dirname, '../../public/sitemap.xml');
    expect(fs.existsSync(sitemapPath)).toBe(false);
  });
});
