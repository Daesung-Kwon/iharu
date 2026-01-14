/**
 * Material Design 기반 색상 상수
 * @deprecated Use materialDesign.ts instead
 * 이 파일은 하위 호환성을 위해 유지됩니다.
 */

import { ActivityMaterialColors, MaterialColors } from './materialDesign';

export const ActivityColors = ActivityMaterialColors;

// 배경 그라디언트 (Material Design Surface 기반)
export const BackgroundGradients = {
  warm: [MaterialColors.primary[50], MaterialColors.background.default],
  cool: ['#E3F2FD', MaterialColors.background.default],
  purple: [MaterialColors.secondary[50], MaterialColors.background.default],
};

// 텍스트 색상 (Material Design Text)
export const TextColors = {
  primary: MaterialColors.text.primary,
  secondary: MaterialColors.text.secondary,
  light: MaterialColors.text.disabled,
  white: '#FFFFFF',
};

// UI 색상 (Material Design 기반)
export const UIColors = {
  border: MaterialColors.divider,
  shadow: 'rgba(0, 0, 0, 0.1)',
  success: MaterialColors.success[500],
  warning: MaterialColors.primary[700],
  error: MaterialColors.error[500],
};

