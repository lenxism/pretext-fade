export function wordsInText(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

export function msForLine(lineText: string, wpm: number): number {
  const words = wordsInText(lineText);
  return (words / wpm) * 60_000;
}
