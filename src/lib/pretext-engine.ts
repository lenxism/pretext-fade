export interface TextLine {
  text: string;
  width: number;
  index: number;
}

export interface LayoutState {
  lines: TextLine[];
  height: number;
  lineCount: number;
}

let pretextModule: typeof import("@chenglou/pretext") | null = null;

async function loadPretext() {
  if (!pretextModule) {
    pretextModule = await import("@chenglou/pretext");
  }
  return pretextModule;
}

export async function measureLines(
  text: string,
  font: string,
  containerWidth: number,
  lineHeight: number
): Promise<LayoutState> {
  const { prepareWithSegments, layoutWithLines } = await loadPretext();
  const prepared = prepareWithSegments(text, font);
  const result = layoutWithLines(prepared, containerWidth, lineHeight);
  return {
    lines: result.lines.map((line, i) => ({
      text: line.text,
      width: line.width,
      index: i,
    })),
    height: result.height,
    lineCount: result.lineCount,
  };
}

export async function predictHeight(
  text: string,
  font: string,
  containerWidth: number,
  lineHeight: number
): Promise<{ height: number; timeMs: number }> {
  const { prepare, layout } = await loadPretext();
  const t0 = performance.now();
  const prepared = prepare(text, font);
  const result = layout(prepared, containerWidth, lineHeight);
  const t1 = performance.now();
  return { height: result.height, timeMs: t1 - t0 };
}

export function removeLineText(
  lines: TextLine[],
  lineIndex: number
): string {
  return lines
    .filter((_, i) => i !== lineIndex)
    .map((l) => l.text.trim())
    .filter(Boolean)
    .join(" ");
}
