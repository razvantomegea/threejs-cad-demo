/** `#rrggbb` for `<input type="color">` from Three hex (e.g. `0xff00aa`). */
export function colorNumberToHexInput(color: number): string {
  return `#${(color & 0xffffff).toString(16).padStart(6, "0")}`;
}

/** Three hex from `#rrggbb`. */
export function hexInputToColorNumber(hex: string): number {
  return Number.parseInt(hex.slice(1), 16);
}
