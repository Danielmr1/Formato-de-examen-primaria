import { ExamBlock } from '../types';

export interface LayoutSegment {
  type: 'full' | 'split';
  fullBlock?: { block: ExamBlock; index: number };
  leftColumn?: Array<{ block: ExamBlock; index: number }>;
  rightColumn?: Array<{ block: ExamBlock; index: number }>;
  leftWidthCols?: number;
  rightWidthCols?: number;
}

/**
 * Estimate the visual height of a block in pixels based on its content & settings.
 */
export function estimateBlockHeight(block: ExamBlock): number {
  if (block.customMinHeight && block.customMinHeight > 60) {
    return block.customMinHeight;
  }
  let baseHeight = 90; // Header + question number + base statement
  if (block.statement && block.statement.length > 70) {
    baseHeight += Math.min(80, Math.floor((block.statement.length - 70) / 35) * 16);
  }
  if (block.figure?.url || block.figure?.svgData) {
    baseHeight += 120;
  }
  if (block.type === 'open_development') {
    return baseHeight + (block.developmentConfig?.heightPx || 100);
  }
  if (block.type === 'matching') {
    const pairCount = block.matchingPairs?.length || 3;
    let extraHeight = 0;
    if (block.matchingPairs) {
      const isNarrow = (block.width || 12) <= 6;
      block.matchingPairs.forEach(p => {
        const textLen = Math.max(p.leftText?.length || 0, p.rightText?.length || 0);
        const threshold = isNarrow ? 12 : 25;
        if (textLen > threshold) {
          extraHeight += Math.min(36, Math.floor((textLen - threshold) / 10) * 16 + 16);
        }
      });
    }
    return baseHeight + pairCount * 44 + extraHeight;
  }
  if (block.type === 'multiple_choice') {
    const optCount = block.options?.length || 4;
    return baseHeight + optCount * 36;
  }
  if (block.type === 'true_false') {
    const stCount = block.trueFalseOptions?.length || 3;
    return baseHeight + stCount * 36;
  }
  if (block.heightMode === 'tall') return Math.max(baseHeight, 280);
  if (block.heightMode === 'compact') return Math.max(baseHeight, 110);
  return Math.max(baseHeight, 160);
}

/**
 * Height-aware layout segmenter:
 * - Questions with width >= 11 (full row) render as a single transversal row ('full').
 * - Sub-width questions are grouped into dynamic height-balanced split segments.
 * - When a tall question on the right (like matching) shares its vertical span with 2 shorter questions
 *   on the left (e.g. Q3 + Q5 alongside Q4), they are grouped in the SAME segment:
 *     - No empty gap below Q3 (Q5 sits directly below Q3).
 *     - Changing width of Q4 only adjusts Q3, Q5 and Q4.
 *     - Previous rows (Q1+Q2) and subsequent rows (Q6+Q7) maintain their own independent widths.
 */
export function buildMasonrySegments(blocks: ExamBlock[]): LayoutSegment[] {
  const segments: LayoutSegment[] = [];

  let currentSplit: {
    leftColumn: Array<{ block: ExamBlock; index: number }>;
    rightColumn: Array<{ block: ExamBlock; index: number }>;
    leftHeight: number;
    rightHeight: number;
    leftWidthCols: number;
    rightWidthCols: number;
  } | null = null;

  const flushSplit = () => {
    if (currentSplit && (currentSplit.leftColumn.length > 0 || currentSplit.rightColumn.length > 0)) {
      segments.push({
        type: 'split',
        leftColumn: currentSplit.leftColumn,
        rightColumn: currentSplit.rightColumn,
        leftWidthCols: currentSplit.leftWidthCols || 6,
        rightWidthCols: currentSplit.rightWidthCols || 6,
      });
      currentSplit = null;
    }
  };

  for (let idx = 0; idx < blocks.length; idx++) {
    const block = blocks[idx];
    const width = Math.min(12, Math.max(1, block.width || 12));
    const blockHeight = estimateBlockHeight(block);

    if (width >= 12) {
      flushSplit();
      segments.push({
        type: 'full',
        fullBlock: { block, index: idx },
      });
      continue;
    }

    if (!currentSplit) {
      // Start a new split segment
      currentSplit = {
        leftColumn: [{ block, index: idx }],
        rightColumn: [],
        leftHeight: blockHeight,
        rightHeight: 0,
        leftWidthCols: width,
        rightWidthCols: Math.max(2, 12 - width),
      };
    } else {
      // We already have an active split segment
      if (currentSplit.rightColumn.length === 0) {
        // First right column block
        currentSplit.rightColumn.push({ block, index: idx });
        currentSplit.rightHeight += blockHeight;
        
        // If both columns now have 1 block and heights are relatively close, flush as a balanced row
        if (Math.abs(currentSplit.leftHeight - currentSplit.rightHeight) <= 55) {
          flushSplit();
        }
      } else {
        // Both columns already have at least 1 block
        // Put block in the shorter column to fill vertical space
        if (currentSplit.leftHeight < currentSplit.rightHeight) {
          currentSplit.leftColumn.push({ block, index: idx });
          currentSplit.leftHeight += blockHeight;
        } else {
          currentSplit.rightColumn.push({ block, index: idx });
          currentSplit.rightHeight += blockHeight;
        }

        // Check if both columns have now reached height balance
        if (Math.abs(currentSplit.leftHeight - currentSplit.rightHeight) <= 55) {
          flushSplit();
        }
      }
    }
  }

  flushSplit();
  return segments;
}

export interface PageChunk {
  pageNumber: number;
  segments: LayoutSegment[];
}

/**
 * Partitions masonry segments into discrete physical pages (like Word / Google Docs)
 * based on estimated heights and page limits.
 */
export function partitionSegmentsIntoPages(
  segments: LayoutSegment[],
  isA5: boolean,
  headerHeight: number = isA5 ? 110 : 140
): PageChunk[] {
  if (segments.length === 0) {
    return [{ pageNumber: 1, segments: [] }];
  }

  const targetHeight = isA5 ? 720 : 1050;
  const pages: PageChunk[] = [];
  let currentPageSegments: LayoutSegment[] = [];
  let currentPageHeight = headerHeight;
  let pageNum = 1;

  for (const segment of segments) {
    let segHeight = 0;
    if (segment.type === 'full' && segment.fullBlock) {
      segHeight = estimateBlockHeight(segment.fullBlock.block);
    } else if (segment.type === 'split') {
      const leftH = segment.leftColumn?.reduce((acc, b) => acc + estimateBlockHeight(b.block), 0) || 0;
      const rightH = segment.rightColumn?.reduce((acc, b) => acc + estimateBlockHeight(b.block), 0) || 0;
      segHeight = Math.max(leftH, rightH);
    }

    // Si ya hay al menos un segmento en la página y este segmento no cabe en el espacio restante:
    if (currentPageSegments.length > 0 && currentPageHeight + segHeight > targetHeight) {
      pages.push({ pageNumber: pageNum, segments: currentPageSegments });
      pageNum++;
      currentPageSegments = [segment];
      currentPageHeight = segHeight + 18;
    } else {
      currentPageSegments.push(segment);
      currentPageHeight += segHeight + 18;
    }
  }

  if (currentPageSegments.length > 0 || pages.length === 0) {
    pages.push({ pageNumber: pageNum, segments: currentPageSegments });
  }

  return pages;
}



