import { OCRToken, ReconstructedCode, ReconstructedLine } from '../types';

/**
 * Code Reconstruction Engine
 * Reconstructs source code from spatial OCR tokens:
 * - Clusters tokens vertically into code lines.
 * - Sorts tokens horizontally within each line.
 * - Estimates indentation level from left margins.
 * - Preserves programming symbols, brackets, parentheses, keywords.
 * - Separates raw OCR literals from interpreted code.
 */
export function reconstructCodeFromTokens(tokens: OCRToken[]): ReconstructedCode {
  // Filter out student metadata tokens
  const codeTokens = tokens.filter((t) => !t.isStudentInfo);

  if (codeTokens.length === 0) {
    return { rawText: '', interpretedText: '', lines: [] };
  }

  // Find line groups by comparing token Y coordinates
  // Typical line height in scanned exam is 25-45px
  const sortedByY = [...codeTokens].sort((a, b) => a.boundingBox.y - b.boundingBox.y);

  const lineGroups: OCRToken[][] = [];
  let currentGroup: OCRToken[] = [];
  let currentYCenter = -1;

  for (const token of sortedByY) {
    const tokenYCenter = token.boundingBox.y + token.boundingBox.height / 2;

    if (currentGroup.length === 0) {
      currentGroup.push(token);
      currentYCenter = tokenYCenter;
    } else {
      // If within 18px of current line center, same line
      if (Math.abs(tokenYCenter - currentYCenter) < 18) {
        currentGroup.push(token);
        // update running center
        currentYCenter =
          currentGroup.reduce((acc, t) => acc + (t.boundingBox.y + t.boundingBox.height / 2), 0) /
          currentGroup.length;
      } else {
        lineGroups.push(currentGroup);
        currentGroup = [token];
        currentYCenter = tokenYCenter;
      }
    }
  }

  if (currentGroup.length > 0) {
    lineGroups.push(currentGroup);
  }

  // Sort tokens in each line left-to-right
  lineGroups.forEach((group) => {
    group.sort((a, b) => a.boundingBox.x - b.boundingBox.x);
  });

  // Calculate base left margin across all lines to determine indentation
  const leftMargins = lineGroups.map((g) => g[0]?.boundingBox.x ?? 0).filter((x) => x > 0);
  const minLeftMargin = leftMargins.length > 0 ? Math.min(...leftMargins) : 0;

  const reconstructedLines: ReconstructedLine[] = lineGroups.map((group, index) => {
    const lineX = group[0]?.boundingBox.x ?? minLeftMargin;
    const deltaX = Math.max(0, lineX - minLeftMargin);

    // Assume ~35-45px per 4-space indentation level
    const indentLevel = Math.min(3, Math.round(deltaX / 40));
    const indentSpaces = ' '.repeat(indentLevel * 4);

    const rawLineTokens = group.map((t) => t.text).join(' ');
    const interpretedLineTokens = group.map((t) => t.interpretedText || t.text).join(' ');

    const tokenIds = group.map((t) => t.id);

    return {
      lineNumber: index + 1,
      text: `${indentSpaces}${rawLineTokens}`,
      interpretedText: `${indentSpaces}${interpretedLineTokens}`,
      tokenIds,
      indentation: indentLevel * 4
    };
  });

  const rawText = reconstructedLines.map((l) => l.text).join('\n');
  const interpretedText = reconstructedLines.map((l) => l.interpretedText || l.text).join('\n');

  return {
    rawText,
    interpretedText,
    lines: reconstructedLines
  };
}
