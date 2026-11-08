export function dialoguePreview(text: string, max = 150): string {
  const compact = text.replace(/\s+/g, ' ').trim();
  const match = compact.match(/^[^.!?]+[.!?]?/);
  const sentence = match?.[0]?.trim() ?? compact;
  if (sentence.length > 0 && sentence.length <= max) return sentence;
  if (compact.length <= max) return compact;
  return `${compact.slice(0, max).trimEnd()}…`;
}
