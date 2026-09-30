export type BlockWidth = number; // 1 to 12 columns
export type BlockHeightMode = 'auto' | 'square' | 'compact' | 'tall' | 'extra-tall';

export type QuestionType = 
  | 'multiple_choice' 
  | 'statement_only'
  | 'true_false' 
  | 'open_development' 
  | 'matching' 
  | 'figure_only' 
  | 'reading_passage';

export type FigurePosition = 'top' | 'bottom' | 'left' | 'right' | 'full';

export type DevelopmentBoxStyle = 'lines' | 'dotted' | 'grid' | 'blank';

export interface ChoiceOption {
  id: string;
  label: string; // e.g. "A", "B", "C", "D"
  text: string;
  isCorrect?: boolean;
}

export interface MatchingPair {
  id: string;
  leftText: string;
  rightText: string;
}

export interface FigureData {
  url?: string;
  svgData?: string;
  caption?: string;
  position: FigurePosition;
  widthPercent: number; // 20 to 100
  alt?: string;
}

export interface ExamBlock {
  id: string;
  titleNumber?: string; // e.g., "01", "Pregunta 1", "Problema 3"
  statement: string; // Question or passage text
  type: QuestionType;
  width: BlockWidth; // 12, 8, 6, 4, 3
  heightMode: BlockHeightMode; // 'auto', 'square', etc.
  points: number;
  figure?: FigureData;
  options?: ChoiceOption[];
  trueFalseOptions?: {
    id: string;
    statement: string;
    isTrue: boolean;
  }[];
  developmentConfig?: {
    style: DevelopmentBoxStyle;
    heightPx: number;
    promptHint?: string;
  };
  matchingPairs?: MatchingPair[];
  teacherNotes?: string;
  blockTheme?: 'standard' | 'accent' | 'minimal' | 'dashed' | 'highlight';
  customMinHeight?: number;
}

export interface ExamHeaderConfig {
  institutionName: string;
  logoUrl?: string;
  titleAlignment?: 'left' | 'center';
  examTitle: string;
  subject: string;
  teacherName: string;
  gradeLevel: string;
  durationMinutes: number;
  dateStr: string;
  headerStyle: 'classic' | 'modern' | 'minimal' | 'boxed';
  showStudentNameField: boolean;
  showDateField: boolean;
  showScoreBox: boolean;
  scoreBoxSize?: 'normal' | 'large' | 'xlarge';
  generalInstructions: string;
}

export interface ExamDocument {
  id: string;
  title: string;
  createdAt: string;
  updatedAt?: string;
  header: ExamHeaderConfig;
  blocks: ExamBlock[];
  settings: {
    paperSize: 'a4' | 'letter';
    fontFamily: 'sans' | 'serif' | 'mono';
    baseFontSize: 'sm' | 'md' | 'lg';
    gridColumns: 12;
    showPointsInPrint: boolean;
    showBorders: boolean;
    twoColumnLayout: boolean;
    statementJustify?: boolean;
    lineSpacing?: 'compact' | 'normal' | 'relaxed';
  };
}

export interface StudentAnswers {
  [blockId: string]: {
    selectedChoiceId?: string;
    trueFalseAnswers?: { [statementId: string]: boolean };
    openText?: string;
    matchingAnswers?: { [pairId: string]: string };
  };
}
