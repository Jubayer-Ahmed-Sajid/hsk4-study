/**
 * Fuzzy matching utilities for pinyin, meaning, and Chinese character comparison.
 * Handles tone marks, common input variations, and partial matches.
 */

// Tone mark to base vowel mapping
const TONE_MAP: Record<string, string> = {
  'ā': 'a', 'á': 'a', 'ǎ': 'a', 'à': 'a',
  'ē': 'e', 'é': 'e', 'ě': 'e', 'è': 'e',
  'ī': 'i', 'í': 'i', 'ǐ': 'i', 'ì': 'i',
  'ō': 'o', 'ó': 'o', 'ǒ': 'o', 'ò': 'o',
  'ū': 'u', 'ú': 'u', 'ǔ': 'u', 'ù': 'u',
  'ǖ': 'v', 'ǘ': 'v', 'ǚ': 'v', 'ǜ': 'v',
  'ü': 'v',
};

/**
 * Remove tone marks from pinyin for comparison.
 * "juéde" → "juede", "nǚ" → "nv"
 */
export function stripToneMarks(pinyin: string): string {
  return [...pinyin].map(ch => TONE_MAP[ch] ?? ch).join('');
}

/**
 * Normalize pinyin for comparison: lowercase, strip tone marks, trim whitespace.
 */
function normalizePinyin(s: string): string {
  return stripToneMarks(s.toLowerCase().trim());
}

/**
 * Match pinyin input against correct pinyin.
 * - Matches with or without tone marks
 * - Accepts "lv" for "lü" / "lǚ"
 * - Case insensitive
 * - Trims whitespace
 */
export function matchPinyin(input: string, correct: string): boolean {
  const normInput = normalizePinyin(input);
  const normCorrect = normalizePinyin(correct);

  // Direct match
  if (normInput === normCorrect) return true;

  // Handle "lv" → "lü" substitution (already handled by stripToneMarks on correct)
  // But also handle user typing "lv" for "lü"
  const inputLvFixed = normInput.replace(/lv/g, 'v');
  if (inputLvFixed === normCorrect) return true;

  // Handle user typing "u:" for "ü"
  const inputUColon = normInput.replace(/u:/g, 'v');
  if (inputUColon === normCorrect) return true;

  // Partial match: if input is at least 60% of correct and starts the same
  if (normInput.length >= 2 && normCorrect.startsWith(normInput) && normInput.length >= normCorrect.length * 0.6) {
    return true;
  }

  return false;
}

/**
 * Match meaning input against correct meaning.
 * Meanings may be separated by "/" or "；" or ",".
 * Accepts if input contains any key term from the correct meaning,
 * or if any correct meaning variant is found in the input.
 */
export function matchMeaning(input: string, correct: string): boolean {
  const normInput = input.toLowerCase().trim();
  const normCorrect = correct.toLowerCase().trim();

  // Exact match
  if (normInput === normCorrect) return true;

  // Split correct meaning by separators
  const variants = normCorrect
    .split(/[\/;；,，]/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  // Check if input matches any variant exactly
  if (variants.some(v => normInput === v)) return true;

  // Check if input contains any variant (for longer answers)
  if (variants.some(v => v.length >= 3 && normInput.includes(v))) return true;

  // Check if any variant contains the input (partial match for short answers)
  if (normInput.length >= 3 && variants.some(v => v.includes(normInput))) return true;

  // Token-based matching: split both into words, check overlap
  const inputTokens = normInput.split(/\s+/).filter(t => t.length >= 3);
  const correctTokens = variants.flatMap(v => v.split(/\s+/)).filter(t => t.length >= 3);

  if (inputTokens.length > 0 && correctTokens.length > 0) {
    const overlap = inputTokens.filter(it => correctTokens.some(ct => ct === it || ct.startsWith(it) || it.startsWith(ct)));
    if (overlap.length > 0 && overlap.length / inputTokens.length >= 0.5) return true;
  }

  return false;
}

/**
 * Match Chinese characters: exact match required.
 */
export function matchChinese(input: string, correct: string): boolean {
  return input.trim() === correct.trim();
}
