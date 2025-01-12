#!/usr/bin/env bun
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const DOCS_DIR = 'docs';
const OUTPUT_FILE = 'docs/context.md';
const IGNORE_PATTERNS = [/\.git/, /node_modules/, /logs/, /context\.md$/];

function shouldIncludeFile(path: string): boolean {
  return (
    !IGNORE_PATTERNS.some((pattern) => pattern.test(path)) &&
    (path.endsWith('.md') || path.endsWith('.yml'))
  );
}

function getAllFiles(dir: string): string[] {
  const files: string[] = [];

  function traverse(currentDir: string) {
    const entries = readdirSync(currentDir);

    for (const entry of entries) {
      const fullPath = join(currentDir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (shouldIncludeFile(fullPath)) {
        files.push(fullPath);
      }
    }
  }

  traverse(dir);
  return files;
}

function generateContext() {
  const files = getAllFiles(DOCS_DIR);
  let content = '# Growth Partner Documentation Context\n\n';

  for (const file of files) {
    const relativePath = relative('.', file);
    const fileContent = readFileSync(file, 'utf-8');
    const fileType = file.endsWith('.yml') ? 'yaml' : 'markdown';

    content += `## ${relativePath}\n\n\`\`\`${fileType}\n${fileContent}\n\`\`\`\n\n`;
  }

  writeFileSync(OUTPUT_FILE, content);
  console.log(`✨ Context file generated at ${OUTPUT_FILE}`);
}

generateContext();
