import { ExamDocument } from '../types';
import { formatMathToHtml } from './mathFormatter';

export function generateExamHtml(exam: ExamDocument): string {
  const fontClass = exam.settings.fontFamily === 'serif' 
    ? 'font-serif' 
    : exam.settings.fontFamily === 'mono' 
      ? 'font-mono' 
      : 'font-sans';

  const blocksHtml = exam.blocks.map(block => {
    // Width classes based on 12 cols
    let colSpanClass = 'col-12';
    if (block.width === 6) colSpanClass = 'col-6';
    else if (block.width === 4) colSpanClass = 'col-4';
    else if (block.width === 8) colSpanClass = 'col-8';

    // Figure HTML if present
    let figureHtml = '';
    if (block.figure) {
      const isSideFig = block.figure.position === 'left' || block.figure.position === 'right';
      const figPercent = block.figure.widthPercent || (isSideFig ? 45 : 70);
      const containerStyle = isSideFig 
        ? 'width: 100%;' 
        : `width: ${figPercent}%; margin: 6px auto;`;

      if (block.figure.svgData) {
        figureHtml = `
          <div class="figure-container" style="${containerStyle}">
            ${block.figure.svgData}
            ${block.figure.caption && block.figure.caption.trim() ? `<div class="figure-caption">${block.figure.caption}</div>` : ''}
          </div>
        `;
      } else if (block.figure.url) {
        figureHtml = `
          <div class="figure-container" style="${containerStyle}">
            <img src="${block.figure.url}" alt="${block.figure.caption || ''}" />
            ${block.figure.caption && block.figure.caption.trim() ? `<div class="figure-caption">${block.figure.caption}</div>` : ''}
          </div>
        `;
      }
    }

    // Question content by type
    let contentHtml = '';

    if (block.type === 'multiple_choice' && block.options) {
      contentHtml = `
        <div class="options-grid">
          ${block.options.map(opt => `
            <div class="option-item">
              <span class="option-letter">(${opt.label})</span>
              <span class="option-text">${formatMathToHtml(opt.text)}</span>
            </div>
          `).join('')}
        </div>
      `;
    } else if (block.type === 'true_false' && block.trueFalseOptions) {
      contentHtml = `
        <div class="tf-list">
          ${block.trueFalseOptions.map(tf => `
            <div class="tf-item">
              <div class="tf-statement">${formatMathToHtml(tf.statement)}</div>
              <div class="tf-boxes">
                <span class="tf-box">V</span>
                <span class="tf-box">F</span>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } else if (block.type === 'open_development') {
      const devStyle = block.developmentConfig?.style || 'grid';
      const devHeight = block.developmentConfig?.heightPx || 120;
      contentHtml = `
        <div class="dev-area dev-${devStyle}" style="min-height: ${devHeight}px;"></div>
      `;
    } else if (block.type === 'matching' && block.matchingPairs) {
      contentHtml = `
        <div class="matching-container">
          <div class="matching-col">
            ${block.matchingPairs.map((pair, idx) => `
              <div class="matching-item">
                <span class="matching-badge">${String.fromCharCode(65 + idx)}</span>
                <span>${formatMathToHtml(pair.leftText)}</span>
              </div>
            `).join('')}
          </div>
          <div class="matching-col">
            ${block.matchingPairs.map((pair) => `
              <div class="matching-item">
                <span class="matching-parentheses">( &nbsp; )</span>
                <span>${formatMathToHtml(pair.rightText)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Determine layout if figure has position
    const figPos = block.figure?.position || 'top';
    let blockBody = '';
    const pointsBadgeHtml = exam.settings.showPointsInPrint && block.points && block.points > 0 ? `<span class="points-badge">[${block.points} pts]</span>` : '';
    const justifyClass = exam.settings.statementJustify ? 'statement-justified' : '';
    const statementFormatted = formatMathToHtml(block.statement);

    if (block.figure && figPos === 'right') {
      const figWidth = block.figure.widthPercent ? `${Math.min(75, Math.max(20, block.figure.widthPercent))}%` : '45%';
      blockBody = `
        <div class="split-horizontal">
          <div class="split-left">
            <div class="block-header-inline">
              <span class="title-number">${block.titleNumber || ''}.</span>
              <div class="statement-text ${justifyClass}">${statementFormatted}</div>
              ${pointsBadgeHtml}
            </div>
            ${contentHtml}
          </div>
          <div class="split-right" style="width: ${figWidth}; max-width: ${figWidth};">
            ${figureHtml}
          </div>
        </div>
      `;
    } else if (block.figure && figPos === 'left') {
      const figWidth = block.figure.widthPercent ? `${Math.min(75, Math.max(20, block.figure.widthPercent))}%` : '45%';
      blockBody = `
        <div class="split-horizontal">
          <div class="split-left" style="width: ${figWidth}; max-width: ${figWidth}; flex: none;">
            ${figureHtml}
          </div>
          <div class="split-right" style="flex: 1; width: auto;">
            <div class="block-header-inline">
              <span class="title-number">${block.titleNumber || ''}.</span>
              <div class="statement-text ${justifyClass}">${statementFormatted}</div>
              ${pointsBadgeHtml}
            </div>
            ${contentHtml}
          </div>
        </div>
      `;
    } else {
      blockBody = `
        ${figPos === 'top' ? figureHtml : ''}
        <div class="block-header-inline">
          <span class="title-number">${block.titleNumber || ''}.</span>
          <div class="statement-text ${justifyClass}">${statementFormatted}</div>
          ${pointsBadgeHtml}
        </div>
        ${figPos === 'bottom' || figPos === 'full' ? figureHtml : ''}
        ${contentHtml}
      `;
    }

    return `
      <div class="exam-block ${colSpanClass} ${block.blockTheme ? `theme-${block.blockTheme}` : 'theme-standard'} ${block.type === 'reading_passage' ? 'theme-reading' : ''}">
        <div class="block-body">
          ${blockBody}
        </div>
      </div>
    `;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${exam.title || 'Examen'}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Merriweather:wght@400;700&family=JetBrains+Mono:wght@400;600&display=swap');

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: ${exam.settings.fontFamily === 'serif' ? "'Merriweather', serif" : exam.settings.fontFamily === 'mono' ? "'JetBrains Mono', monospace" : "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif"};
      background: #f8fafc;
      color: #0f172a;
      line-height: 1.5;
      font-size: 13.5px;
      padding: 24px 12px;
    }

    .page-container {
      max-width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background: #ffffff;
      padding: 10mm 12mm;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
      border-radius: 4px;
    }

    /* Header Section */
    .header-boxed {
      border: 1.5px solid #0f172a;
      border-radius: 6px;
      padding: 10px 14px;
      margin-bottom: 14px;
      background: #fff;
    }

    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1.5px solid #0f172a;
      padding-bottom: 8px;
      margin-bottom: 10px;
    }

    .inst-name {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #475569;
    }

    .exam-title {
      font-size: 18px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.02em;
      color: #0f172a;
      margin-top: 2px;
    }

    .score-box {
      border: 2px solid #0f172a;
      border-radius: 6px;
      width: ${exam.header.scoreBoxSize === 'xlarge' ? '145px' : exam.header.scoreBoxSize === 'normal' ? '100px' : '125px'};
      height: ${exam.header.scoreBoxSize === 'xlarge' ? '90px' : exam.header.scoreBoxSize === 'normal' ? '60px' : '75px'};
      flex-shrink: 0;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px 16px;
      font-size: 12px;
      margin-bottom: 10px;
    }

    .meta-item {
      display: flex;
      gap: 6px;
    }

    .meta-label {
      font-weight: 700;
      color: #334155;
    }

    .student-field {
      display: flex;
      align-items: flex-end;
      font-size: 13px;
      margin-top: 6px;
      padding-top: 8px;
      border-top: 1px dashed #cbd5e1;
    }

    .student-line {
      flex: 1;
      border-bottom: 1.5px dotted #0f172a;
      margin-left: 8px;
      min-height: 28px;
      height: 28px;
    }

    .instructions-box {
      margin-top: 8px;
      padding: 6px 10px;
      background: #f1f5f9;
      border-left: 3px solid #0f172a;
      font-size: 11.5px;
      font-style: italic;
      color: #334155;
    }

    /* Grid Bento layout */
    .blocks-grid {
      display: flex;
      flex-wrap: wrap;
      margin: -7px;
    }

    .exam-block {
      padding: 7px;
      display: flex;
      flex-direction: column;
    }

    .col-12 { width: 100%; }
    .col-8 { width: 66.666%; }
    .col-6 { width: 50%; }
    .col-4 { width: 33.333%; }
    .col-3 { width: 25%; }

    .exam-block > .block-body,
    .theme-bordered {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 12px 14px;
      background: #ffffff;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .theme-reading {
      background: #f8fafc !important;
      border-color: #94a3b8 !important;
    }

    .block-header-inline {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      margin-bottom: 8px;
    }

    .title-number {
      font-weight: 800;
      font-size: 13px;
      background: #0f172a;
      color: #ffffff;
      padding: 1px 6px;
      border-radius: 3px;
      flex-shrink: 0;
      line-height: 1.4;
      margin-top: 1px;
    }

    .reading-badge {
      font-size: 10px;
      font-weight: 700;
      background: #e2e8f0;
      color: #334155;
      padding: 2px 6px;
      border-radius: 3px;
    }

    .points-badge {
      font-size: 11px;
      font-weight: 700;
      color: #475569;
      flex-shrink: 0;
      margin-left: auto;
      padding-left: 6px;
    }

    .statement-text {
      font-size: 13px;
      font-weight: 500;
      color: #1e293b;
      line-height: 1.45;
      flex: 1;
    }

    .statement-justified {
      text-align: justify;
      text-justify: inter-word;
    }

    /* Options */
    .options-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 6px;
      margin-top: 4px;
    }

    .option-item {
      display: flex;
      align-items: baseline;
      gap: 8px;
      font-size: 12.5px;
    }

    .option-letter {
      font-weight: 700;
      color: #0f172a;
    }

    /* True/False */
    .tf-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 4px;
    }

    .tf-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12.5px;
      padding: 4px 0;
      border-bottom: 1px dashed #f1f5f9;
    }

    .tf-boxes {
      display: flex;
      gap: 6px;
    }

    .tf-box {
      width: 24px;
      height: 24px;
      border: 1px solid #0f172a;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 11px;
      border-radius: 3px;
    }

    /* Development Area */
    .dev-area {
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      margin-top: 8px;
      position: relative;
      background: #fff;
    }

    .dev-grid {
      background-size: 20px 20px;
      background-image: 
        linear-gradient(to right, #f1f5f9 1px, transparent 1px),
        linear-gradient(to bottom, #f1f5f9 1px, transparent 1px);
    }

    .dev-lined {
      background-size: 100% 24px;
      background-image: linear-gradient(to bottom, transparent 23px, #cbd5e1 24px);
    }

    .dev-hint {
      position: absolute;
      bottom: 4px;
      right: 8px;
      font-size: 10px;
      color: #94a3b8;
      font-style: italic;
    }

    /* Matching */
    .matching-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-top: 6px;
    }

    .matching-col {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .matching-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
    }

    .matching-badge {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #0f172a;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
      flex-shrink: 0;
    }

    .matching-parentheses {
      font-family: monospace;
      font-weight: 700;
      color: #475569;
    }

    /* Mixed Numbers & Stacked Fractions */
    .mixed-number {
      display: inline-flex;
      align-items: center;
      vertical-align: middle;
      margin: 0 3px;
      font-weight: 600;
    }

    .mixed-whole {
      font-size: 1.1em;
      font-weight: 700;
      margin-right: 2px;
    }

    .fraction-stacked {
      display: inline-flex;
      flex-direction: column;
      text-align: center;
      font-size: 0.74em;
      line-height: 1.15;
      vertical-align: middle;
      font-weight: 700;
      margin: 0 1.5px;
    }

    .frac-num {
      border-bottom: 1.5px solid currentColor;
      padding: 0 1.5px 0.5px 1.5px;
    }

    .frac-den {
      padding: 0.5px 1.5px 0 1.5px;
    }

    /* Figures */
    .figure-container {
      margin: 4px auto;
      text-align: center;
    }

    .figure-container svg,
    .figure-container img {
      width: 100%;
      max-width: 100%;
      height: auto;
      display: inline-block;
      border-radius: 4px;
    }

    .figure-caption {
      font-size: 10.5px;
      color: #64748b;
      margin-top: 4px;
      font-style: italic;
    }

    .split-horizontal {
      display: flex;
      gap: 14px;
      align-items: flex-start;
      width: 100%;
    }

    .split-left {
      flex: 1;
      min-width: 0;
    }

    .split-right {
      flex-shrink: 0;
    }

    /* Print styling */
    @page {
      size: ${exam.settings.paperSize === 'letter' ? 'letter portrait' : 'A4 portrait'};
      margin: 6mm 8mm 8mm 8mm;
    }

    @media print {
      body {
        background: #fff;
        padding: 0;
      }

      .page-container {
        box-shadow: none;
        border: none;
        padding: 0;
        max-width: 100%;
      }

      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="page-container">
    <!-- Header -->
    <div class="header-boxed">
      <div class="header-top">
        <div>
          <div class="inst-name">${exam.header.institutionName}</div>
          <div class="exam-title">${exam.header.examTitle}</div>
        </div>
        ${exam.header.showScoreBox ? `
          <div class="score-box"></div>
        ` : ''}
      </div>

      <div class="meta-grid">
        <div class="meta-item"><span class="meta-label">Asignatura:</span> <span>${exam.header.subject || ''}</span></div>
        <div class="meta-item"><span class="meta-label">Docente:</span> <span>${exam.header.teacherName || ''}</span></div>
        <div class="meta-item"><span class="meta-label">Grado / Nivel:</span> <span>${exam.header.gradeLevel || ''}</span></div>
        <div class="meta-item"><span class="meta-label">Fecha:</span> <span>${exam.header.dateStr || ''}</span></div>
        <div class="meta-item"><span class="meta-label">Duración:</span> <span>${exam.header.durationMinutes ? `${exam.header.durationMinutes} min` : ''}</span></div>
      </div>

      ${exam.header.showStudentNameField ? `
        <div class="student-field">
          <span class="meta-label">Estudiante:</span>
          <div class="student-line"></div>
        </div>
      ` : ''}

      ${exam.header.generalInstructions ? `
        <div class="instructions-box">
          ${exam.header.generalInstructions}
        </div>
      ` : ''}
    </div>

    <!-- Questions Grid -->
    <div class="blocks-grid">
      ${blocksHtml}
    </div>
  </div>
</body>
</html>`;
}
