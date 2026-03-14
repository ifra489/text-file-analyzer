const fs = require("fs");
const path = require("path");

/* =========================
   Get Command Line Arguments
========================= */

const args = process.argv.slice(2);

/* =========================
   Help Message
========================= */

function showHelp() {
  console.log(`
Text File Analyzer

Usage:
node count.js <file.txt> [options]

Options:
-h, --help      Show help message
-s, --summary   Show summary statistics
-d, --detail    Show detailed statistics

Example:
node count.js sample.txt
node count.js sample.txt --detail
`);

  process.exit(0);
}

/* =========================
   Show help if needed
========================= */

if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
  showHelp();
}

/* =========================
   File path & flags
========================= */

const filePath = args[0];

const showDetail = args.includes("--detail") || args.includes("-d");

/* =========================
   Validate File
========================= */

if (!filePath.endsWith(".txt")) {
  console.log("Error: Please provide a .txt file");
  process.exit(1);
}

if (!fs.existsSync(filePath)) {
  console.log(`Error: File ${filePath} does not exist`);
  process.exit(1);
}

/* =========================
   Read File
========================= */

function readFile(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    return buffer;
  } catch (error) {
    console.log(`Error reading file: ${error.message}`);
    process.exit(1);
  }
}

/* =========================
   Count Statistics
========================= */

function countStatistics(buffer) {
  const content = buffer.toString();

  const characterCount = buffer.length;

  const lines = content.split(/\r?\n/);
  const lineCount = lines.length;

  const words = content.split(/\s+/).filter((word) => word.length > 0);

  const wordCount = words.length;

  const byteSize = buffer.byteLength;

  let stats = {
    characterCount,
    lineCount,
    wordCount,
    byteSize,
  };

  if (showDetail) {
    const nonWhitespaceCharacterCount = content.replace(/\s/g, "").length;

    const wordLengths = words.map((w) => w.length);

    const avgWordLength =
      wordLengths.reduce((sum, len) => sum + len, 0) / (wordCount || 1);

    const paragraphCount = content
      .split(/\r?\n\s*\r?\n/)
      .filter((p) => p.trim().length > 0).length;

    const wordFrequency = {};

    words.forEach((word) => {
      const normalized = word.toLowerCase().replace(/[^\w]/g, "");

      if (normalized.length > 0) {
        wordFrequency[normalized] = (wordFrequency[normalized] || 0) + 1;
      }
    });

    const commonWords = Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    stats = {
      ...stats,
      nonWhitespaceCharacterCount,
      paragraphCount,
      avgWordLength,
      commonWords,
    };
  }

  return stats;
}

/* =========================
   Format File Size
========================= */

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;

  const sizes = ["Bytes", "KB", "MB", "GB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return (
    parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i]
  );
}

/* =========================
   Display Statistics
========================= */

function displayStatistics(stats) {
  console.log("\n==== TEXT FILE STATISTICS ====\n");

  console.log(`File: ${path.basename(filePath)}`);
  console.log(`Size: ${formatBytes(stats.byteSize)}`);
  console.log(`Characters: ${stats.characterCount}`);
  console.log(`Words: ${stats.wordCount}`);
  console.log(`Lines: ${stats.lineCount}`);

  if (showDetail) {
    console.log("\n---- Detailed Statistics ----");

    console.log(
      `Non-whitespace characters: ${stats.nonWhitespaceCharacterCount}`,
    );

    console.log(`Paragraphs: ${stats.paragraphCount}`);

    console.log(`Average word length: ${stats.avgWordLength.toFixed(2)}`);

    console.log("\nMost common words:");

    stats.commonWords.forEach(([word, count]) => {
      console.log(`"${word}" : ${count}`);
    });
  }

  console.log("\n==== END ====\n");
}

/* =========================
   Main Execution
========================= */

const buffer = readFile(filePath);

const statistics = countStatistics(buffer);

displayStatistics(statistics);
