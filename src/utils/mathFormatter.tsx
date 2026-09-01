import React from 'react';

/**
 * Unicode vulgar fraction map
 */
const VULGAR_FRACTIONS: Record<string, { num: string; den: string }> = {
  '½': { num: '1', den: '2' },
  '⅓': { num: '1', den: '3' },
  '⅔': { num: '2', den: '3' },
  '¼': { num: '1', den: '4' },
  '¾': { num: '3', den: '4' },
  '⅕': { num: '1', den: '5' },
  '⅖': { num: '2', den: '5' },
  '⅗': { num: '3', den: '5' },
  '⅘': { num: '4', den: '5' },
  '⅙': { num: '1', den: '6' },
  '⅚': { num: '5', den: '6' },
  '⅛': { num: '1', den: '8' },
  '⅜': { num: '3', den: '8' },
  '⅝': { num: '5', den: '8' },
  '⅞': { num: '7', den: '8' },
};

/**
 * Token types for formatted math and mixed numbers
 */
type MathToken =
  | { type: 'text'; content: string }
  | { type: 'bold'; content: string }
  | { type: 'mixed_number'; whole: string; num: string; den: string }
  | { type: 'fraction'; num: string; den: string }
  | { type: 'power'; base: string; exp: string }
  | { type: 'subscript'; base: string; sub: string };

/**
 * Parses raw text into rich tokens supporting:
 * - Bold: **text**
 * - Mixed numbers: "3 1/2", "3\frac{1}{2}", "[3 1/2]", "3½"
 * - Fractions: "1/2", "\frac{3}{4}", "3/4"
 * - Powers: "x^2", "10^5", "x^{n+1}"
 * - Subscripts: "x_1", "a_{ij}"
 */
export function parseMathText(rawText: string): MathToken[] {
  if (!rawText) return [];

  // Match pattern priorities:
  // 1. Bold: \*\*(.+?)\*\*
  // 2. LaTeX Mixed Number: (\d+)\s*\\frac\{(\d+)\}\{(\d+)\}
  // 3. LaTeX Fraction: \\frac\{([^}]+)\}\{([^}]+)\}
  // 4. Bracketed Mixed Number: \[(\d+)\s+(\d+)\/(\d+)\]
  // 5. Standard Mixed Number: (?<=\s|^)(\d+)\s+(\d+)\/(\d+)(?=\s|[.,;:?!)]|$)
  // 6. Unicode Mixed Number: (?<=\s|^)(\d+)\s*([½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])
  // 7. Unicode Fraction: ([½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])
  // 8. Plain Fraction: (?<=\s|[(\[{=+-]|^)(\d+)\/(\d+)(?=\s|[),;:?!\]}]|$)
  // 9. Powers: ([a-zA-Z0-9]+)\^\{([^}]+)\} or ([a-zA-Z0-9]+)\^([a-zA-Z0-9+-]+)
  // 10. Subscripts: ([a-zA-Z0-9]+)_\{([^}]+)\} or ([a-zA-Z0-9]+)_([a-zA-Z0-9]+)

  const regex = /(\*\*.*?\*\*)|(?:(\d+)\s*\\frac\{(\d+)\}\{(\d+)\})|(?:\\frac\{([^}]+)\}\{([^}]+)\})|(?:\[(\d+)\s+(\d+)\/(\d+)\])|(?:(?:^|(?<=\s|[(\[{=+-]))(\d+)\s+(\d+)\/(\d+)(?=\s|[),;:?!\]}]|$))|(?:(?:^|(?<=\s|[(\[{=+-]))(\d+)\s*([½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]))|([½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])|(?:(?:^|(?<=\s|[(\[{=+-]))(\d+)\/(\d+)(?=\s|[),;:?!\]}]|$))|(?:([a-zA-Z0-9]+)\^\{([^}]+)\}|([a-zA-Z0-9]+)\^([a-zA-Z0-9+-]+))|(?:([a-zA-Z0-9]+)_\{([^}]+)\}|([a-zA-Z0-9]+)_([a-zA-Z0-9]+))/g;

  const tokens: MathToken[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(rawText)) !== null) {
    // Push preceding plain text
    if (match.index > lastIndex) {
      tokens.push({
        type: 'text',
        content: rawText.slice(lastIndex, match.index),
      });
    }

    const [
      fullMatch,
      boldGroup,
      // LaTeX Mixed Number: (\d+)\s*\\frac\{(\d+)\}\{(\d+)\}
      ltxMixWhole, ltxMixNum, ltxMixDen,
      // LaTeX Fraction: \\frac\{([^}]+)\}\{([^}]+)\}
      ltxFracNum, ltxFracDen,
      // Bracketed Mixed: \[(\d+)\s+(\d+)\/(\d+)\]
      brkMixWhole, brkMixNum, brkMixDen,
      // Standard Mixed: (\d+)\s+(\d+)\/(\d+)
      stdMixWhole, stdMixNum, stdMixDen,
      // Unicode Mixed: (\d+)\s*([½...])
      uniMixWhole, uniMixFrac,
      // Standalone Unicode Fraction: ([½...])
      uniFrac,
      // Plain Fraction: (\d+)\/(\d+)
      plainFracNum, plainFracDen,
      // Powers
      powBase1, powExp1, powBase2, powExp2,
      // Subscripts
      subBase1, subVal1, subBase2, subVal2,
    ] = match;

    if (boldGroup) {
      tokens.push({
        type: 'bold',
        content: boldGroup.slice(2, -2),
      });
    } else if (ltxMixWhole && ltxMixNum && ltxMixDen) {
      tokens.push({
        type: 'mixed_number',
        whole: ltxMixWhole,
        num: ltxMixNum,
        den: ltxMixDen,
      });
    } else if (ltxFracNum && ltxFracDen) {
      tokens.push({
        type: 'fraction',
        num: ltxFracNum,
        den: ltxFracDen,
      });
    } else if (brkMixWhole && brkMixNum && brkMixDen) {
      tokens.push({
        type: 'mixed_number',
        whole: brkMixWhole,
        num: brkMixNum,
        den: brkMixDen,
      });
    } else if (stdMixWhole && stdMixNum && stdMixDen) {
      tokens.push({
        type: 'mixed_number',
        whole: stdMixWhole,
        num: stdMixNum,
        den: stdMixDen,
      });
    } else if (uniMixWhole && uniMixFrac && VULGAR_FRACTIONS[uniMixFrac]) {
      tokens.push({
        type: 'mixed_number',
        whole: uniMixWhole,
        num: VULGAR_FRACTIONS[uniMixFrac].num,
        den: VULGAR_FRACTIONS[uniMixFrac].den,
      });
    } else if (uniFrac && VULGAR_FRACTIONS[uniFrac]) {
      tokens.push({
        type: 'fraction',
        num: VULGAR_FRACTIONS[uniFrac].num,
        den: VULGAR_FRACTIONS[uniFrac].den,
      });
    } else if (plainFracNum && plainFracDen) {
      tokens.push({
        type: 'fraction',
        num: plainFracNum,
        den: plainFracDen,
      });
    } else if (powBase1 && powExp1) {
      tokens.push({
        type: 'power',
        base: powBase1,
        exp: powExp1,
      });
    } else if (powBase2 && powExp2) {
      tokens.push({
        type: 'power',
        base: powBase2,
        exp: powExp2,
      });
    } else if (subBase1 && subVal1) {
      tokens.push({
        type: 'subscript',
        base: subBase1,
        sub: subVal1,
      });
    } else if (subBase2 && subVal2) {
      tokens.push({
        type: 'subscript',
        base: subBase2,
        sub: subVal2,
      });
    } else {
      tokens.push({
        type: 'text',
        content: fullMatch,
      });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < rawText.length) {
    tokens.push({
      type: 'text',
      content: rawText.slice(lastIndex),
    });
  }

  return tokens;
}

/**
 * React Component for pristine Mathematical & Mixed Number typography
 */
export const FormattedMathText: React.FC<{
  text: string;
  className?: string;
}> = ({ text, className = '' }) => {
  if (!text) return null;

  const lines = text.split('\n');

  return (
    <div className={className}>
      {lines.map((line, lIdx) => {
        const tokens = parseMathText(line);

        return (
          <p key={lIdx} className="mb-0.5 last:mb-0 leading-relaxed">
            {tokens.map((token, tIdx) => {
              if (token.type === 'bold') {
                return (
                  <strong key={tIdx} className="font-bold text-slate-950">
                    {token.content}
                  </strong>
                );
              }

              if (token.type === 'mixed_number') {
                return (
                  <span
                    key={tIdx}
                    className="inline-flex items-center align-middle mx-1 font-semibold text-slate-900 select-all"
                    title={`Número mixto: ${token.whole} enteros ${token.num}/${token.den}`}
                  >
                    <span className="text-[1.1em] mr-0.5 font-bold">{token.whole}</span>
                    <span className="inline-flex flex-col text-center text-[0.72em] leading-tight font-bold align-middle">
                      <span className="border-b-[1.5px] border-slate-900 pb-[0.5px] px-0.5">
                        {token.num}
                      </span>
                      <span className="pt-[0.5px] px-0.5">
                        {token.den}
                      </span>
                    </span>
                  </span>
                );
              }

              if (token.type === 'fraction') {
                return (
                  <span
                    key={tIdx}
                    className="inline-flex flex-col text-center align-middle text-[0.72em] leading-tight font-bold mx-0.5 text-slate-900 select-all"
                    title={`Fracción: ${token.num}/${token.den}`}
                  >
                    <span className="border-b-[1.5px] border-slate-900 pb-[0.5px] px-0.5">
                      {token.num}
                    </span>
                    <span className="pt-[0.5px] px-0.5">
                      {token.den}
                    </span>
                  </span>
                );
              }

              if (token.type === 'power') {
                return (
                  <span key={tIdx} className="font-medium text-slate-900">
                    {token.base}
                    <sup className="text-[0.75em] font-bold text-slate-900">{token.exp}</sup>
                  </span>
                );
              }

              if (token.type === 'subscript') {
                return (
                  <span key={tIdx} className="font-medium text-slate-900">
                    {token.base}
                    <sub className="text-[0.75em] font-bold text-slate-900">{token.sub}</sub>
                  </span>
                );
              }

              return <span key={tIdx}>{token.content}</span>;
            })}
          </p>
        );
      })}
    </div>
  );
};

/**
 * Generates standalone HTML string for math & mixed numbers in HTML exports / Print
 */
export function formatMathToHtml(rawText: string): string {
  if (!rawText) return '';

  const lines = rawText.split('\n');

  return lines
    .map((line) => {
      const tokens = parseMathText(line);
      const lineHtml = tokens
        .map((token) => {
          if (token.type === 'bold') {
            return `<strong>${escapeHtml(token.content)}</strong>`;
          }
          if (token.type === 'mixed_number') {
            return `<span class="mixed-number"><span class="mixed-whole">${escapeHtml(
              token.whole
            )}</span><span class="fraction-stacked"><span class="frac-num">${escapeHtml(
              token.num
            )}</span><span class="frac-den">${escapeHtml(token.den)}</span></span></span>`;
          }
          if (token.type === 'fraction') {
            return `<span class="fraction-stacked"><span class="frac-num">${escapeHtml(
              token.num
            )}</span><span class="frac-den">${escapeHtml(token.den)}</span></span>`;
          }
          if (token.type === 'power') {
            return `${escapeHtml(token.base)}<sup>${escapeHtml(token.exp)}</sup>`;
          }
          if (token.type === 'subscript') {
            return `${escapeHtml(token.base)}<sub>${escapeHtml(token.sub)}</sub>`;
          }
          return escapeHtml(token.content);
        })
        .join('');

      return `<p class="statement-line">${lineHtml}</p>`;
    })
    .join('');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
