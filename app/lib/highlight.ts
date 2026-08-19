// A deliberately tiny syntax highlighter for the "View source code" overlay.
//
// WHY THIS EXISTS instead of Shiki/Prism: this repo advertises a four-package
// runtime dependency list, and Shiki costs ~13-14 MB installed (its grammar
// package ships all ~1000 TextMate grammars regardless of how few you import).
// For four files of 30-75 lines, that trade isn't worth it.
//
// WHAT IT GIVES UP, honestly: this is a regex tokenizer, not a parser. It gets
// the genuinely ambiguous cases wrong — a regex literal like /foo\/bar/ reads as
// division, and `${expr}` inside a template literal is coloured as string rather
// than recursively highlighted. Those don't occur in the demo files. If they
// ever do, the wrong colour is a cosmetic bug, not a broken page.
//
// It runs on the SERVER (called from app/api/source/route.ts) and emits tokens,
// not HTML — so the browser gets no highlighter code, and the client renders
// each token as a <span>. React escapes text nodes, which means no
// dangerouslySetInnerHTML and no hand-rolled HTML escaping to get wrong.

export type TokenKind =
  | 'plain'
  | 'comment'
  | 'string'
  | 'keyword'
  | 'number'
  | 'tag'
  | 'heading'
  | 'code'
  | 'bold'
  | 'marker'

/** [kind, text]. Concatenating every `text` reproduces the input exactly. */
export type Token = [TokenKind, string]

const KEYWORDS = [
  'abstract', 'as', 'async', 'await', 'break', 'case', 'catch', 'class',
  'const', 'continue', 'declare', 'default', 'delete', 'do', 'else', 'enum',
  'export', 'extends', 'finally', 'for', 'from', 'function', 'get', 'if',
  'implements', 'import', 'in', 'infer', 'instanceof', 'interface', 'is',
  'keyof', 'let', 'namespace', 'new', 'null', 'of', 'private', 'protected',
  'public', 'readonly', 'return', 'satisfies', 'set', 'static', 'super',
  'switch', 'this', 'throw', 'try', 'type', 'typeof', 'undefined', 'var',
  'void', 'while', 'yield',
  // Not keywords strictly, but they read as language-level in this code.
  'true', 'false',
]

// Order matters: comments and strings come first because they can contain
// anything that looks like a keyword ("// return early" must stay a comment).
const TS_PATTERN = new RegExp(
  [
    '(?<comment>//[^\\n]*|/\\*[\\s\\S]*?\\*/)',
    "(?<string>'(?:\\\\.|[^'\\\\\\n])*'|\"(?:\\\\.|[^\"\\\\\\n])*\"|`(?:\\\\.|[^`\\\\])*`)",
    '(?<tag></?[A-Z][\\w.]*|</?[a-z][\\w-]*(?=[\\s/>]))',
    `(?<keyword>\\b(?:${KEYWORDS.join('|')})\\b)`,
    '(?<number>\\b\\d[\\w.]*\\b)',
  ].join('|'),
  'g',
)

// Headings/list markers are line-anchored, hence the `m` flag.
const MD_PATTERN = new RegExp(
  [
    '(?<heading>^#{1,6} [^\\n]*)',
    '(?<code>`[^`\\n]+`)',
    '(?<bold>\\*\\*[^*\\n]+\\*\\*)',
    '(?<marker>^[ \\t]*(?:[-*+]|\\d+\\.) )',
  ].join('|'),
  'gm',
)

// Walks `pattern` across `source`, emitting a 'plain' token for every gap so the
// token list always reconstitutes the original text.
function tokenize(source: string, pattern: RegExp): Token[] {
  const tokens: Token[] = []
  let last = 0

  pattern.lastIndex = 0
  for (let m = pattern.exec(source); m !== null; m = pattern.exec(source)) {
    if (m.index > last) tokens.push(['plain', source.slice(last, m.index)])

    const groups = m.groups ?? {}
    const kind = (Object.keys(groups).find((k) => groups[k] !== undefined) ??
      'plain') as TokenKind
    tokens.push([kind, m[0]])
    last = m.index + m[0].length

    // A zero-length match would loop forever. None of our patterns can produce
    // one, but the guard is cheaper than the hang.
    if (m[0].length === 0) pattern.lastIndex++
  }

  if (last < source.length) tokens.push(['plain', source.slice(last)])
  return tokens
}

/**
 * Tokenize a source file for display. `filename` picks the ruleset by
 * extension; anything unrecognised comes back as a single plain token, so an
 * unknown file type renders as uncoloured text rather than failing.
 */
export function highlight(source: string, filename: string): Token[] {
  if (/\.tsx?$/.test(filename)) return tokenize(source, TS_PATTERN)
  if (/\.md$/.test(filename)) return tokenize(source, MD_PATTERN)
  return [['plain', source]]
}
