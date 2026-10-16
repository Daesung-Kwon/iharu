/**
 * One look for every modal, sheet and dialog.
 * Reference: ActivityFormModal (활동 추가/수정) — 32pt corners, white rim,
 * soft floating shadow, 24pt BMJUA title, round close button.
 *
 * - Sheets (bottom, slide):  ModalBackdrop + modalStyles.sheetOverlay + modalStyles.sheet
 * - Dialogs (centred, fade): ModalBackdrop + modalStyles.dialogOverlay + modalStyles.dialog
 * No drag handle: none of the sheets can be dragged, so a handle would promise a
 * gesture that does nothing.
 */
import { Platform, StyleSheet } from 'react-native';
import { SoftPopColors } from './theme';
import { SHEET_MAX_WIDTH } from '../utils/safeArea';

export const MODAL_BACKDROP_COLOR = 'rgba(0, 0, 0, 0.5)';
export const MODAL_RADIUS = 32;
export const DIALOG_MAX_WIDTH = 420;
export const MODAL_ANIMATION = { sheet: 'slide', dialog: 'fade' } as const;

const shadow = (dy: number) => ({
  shadowColor: '#000',
  shadowOffset: { width: 0, height: dy },
  shadowOpacity: 0.3,
  shadowRadius: 16,
  elevation: 12,
});

export const modalStyles = StyleSheet.create({
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  dialogOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  sheet: {
    width: '100%',
    maxWidth: SHEET_MAX_WIDTH,
    alignSelf: 'center',
    backgroundColor: SoftPopColors.white,
    borderTopLeftRadius: MODAL_RADIUS,
    borderTopRightRadius: MODAL_RADIUS,
    borderWidth: 2,
    borderColor: SoftPopColors.white,
    ...shadow(-4),
  },
  dialog: {
    width: '100%',
    maxWidth: DIALOG_MAX_WIDTH,
    backgroundColor: SoftPopColors.white,
    borderRadius: MODAL_RADIUS,
    borderWidth: 2,
    borderColor: SoftPopColors.white,
    padding: 24,
    ...shadow(8),
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    fontFamily: 'BMJUA',
    fontWeight: Platform.OS === 'android' ? 'normal' : '700',
    color: SoftPopColors.text,
  },
  closeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: SoftPopColors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  closeButtonPressed: {
    transform: [{ scale: 0.95 }],
    shadowOpacity: 0.08,
    elevation: 1,
  },
});
