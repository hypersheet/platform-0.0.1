import { t } from './common';

/**
 * Synthesized events for the base Monaco editor abstraction.
 */
export type MonacoEvent =
  | ICodeEditorMonacoContentChangedEvent
  | ICodeEditorMonacoCursorPositionChangedEvent
  | ICodeEditorMonacoCursorSelectionChangedEvent
  | ICodeEditorMonacoFocusChangeEvent;

/**
 * Fired when the code editor content has changed.
 */
export type ICodeEditorMonacoContentChangedEvent = {
  type: 'Monaco/changed:content';
  payload: ICodeEditorMonacoContentChanged;
};
export type ICodeEditorMonacoContentChanged = t.IMonacoModelContentChangedEvent & {
  instance: string;
};

/**
 * Fired when the code editor's cursor position changes.
 */
export type ICodeEditorMonacoCursorPositionChangedEvent = {
  type: 'Monaco/changed:cursorPosition';
  payload: ICodeEditorMonacoCursorPositionChanged;
};
export type ICodeEditorMonacoCursorPositionChanged = t.IMonacoCursorPositionChangedEvent & {
  instance: string;
};

/**
 * Fired when the code editor's cursor selection changes.
 */
export type ICodeEditorMonacoCursorSelectionChangedEvent = {
  type: 'Monaco/changed:cursorSelection';
  payload: ICodeEditorMonacoCursorSelectionChanged;
};
export type ICodeEditorMonacoCursorSelectionChanged = t.IMonacoCursorSelectionChangedEvent & {
  instance: string;
};

/**
 * Fired when editor reieves of loses focus.
 */
export type ICodeEditorMonacoFocusChangeEvent = {
  type: 'Monaco/changed:focus';
  payload: ICodeEditorMonacoFocusChange;
};
export type ICodeEditorMonacoFocusChange = {
  instance: string;
  isFocused: boolean;
  source: 'text' | 'widget';
};
