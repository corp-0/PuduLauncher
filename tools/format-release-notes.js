#!/usr/bin/env node

// Reads a markdown file and outputs a JSON-safe single-line string
// suitable for pasting into the "notes" field of latest.json.
//
// Usage: node tools/format-release-notes.js path/to/notes.md

import { readFileSync } from "fs";

const file = process.argv[2];

if (!file) {
    console.error("Usage: node tools/format-release-notes.js <markdown-file>");
    process.exit(1);
}

const content = readFileSync(file, "utf8").trim();
// JSON.stringify produces a quoted string with escaped \n, \t, etc.
// We print without the surrounding quotes so it can be pasted directly as a JSON value.
console.log(JSON.stringify(content));
