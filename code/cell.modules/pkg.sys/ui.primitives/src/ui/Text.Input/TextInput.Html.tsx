import React, { useEffect, useRef, useState } from 'react';

import { Keyboard } from '../../keyboard';
import { color, css, DEFAULT, R, t, time } from './common';
import { Util } from './Util';

type P = t.IHtmlInputProps;

export const HtmlInput: React.FC<P> = (props) => {
  const {
    isEnabled = true,
    disabledOpacity = 0.2,
    isPassword,
    maxLength,
    valueStyle = DEFAULT.TEXT.STYLE,
    selectionBackground,
  } = props;

  const instance = props.instance.id;
  const inputRef = useRef<HTMLInputElement>(null);

  const keyboard = Keyboard.useKeyboardState({ bus: props.instance.bus, instance });
  const cloneModifierKeys = () => ({ ...keyboard.state.current.modifiers });

  const [value, setValue] = useState('');
  const updateValue = (args: { value?: string; maxLength?: number } = {}) => {
    const { value = props.value, maxLength = props.maxLength } = args;
    setValue(Util.value.format({ value, maxLength }));
  };

  /**
   * [Lifecycle]
   */
  useEffect(() => {
    if (props.focusOnLoad) time.delay(0, () => focus());
  }, []); // eslint-disable-line

  /**
   * [Handlers]
   */
  const handleChange = (e: React.ChangeEvent) => {
    const { onChange, maxLength, mask } = props;

    // Derive values.
    const from = value;
    let to = ((e.target as any).value as string) || '';
    to = Util.value.format({ value: to, maxLength });
    const char = Util.value.getChangedChar(from, to);
    const isMax = maxLength === undefined ? null : to.length === maxLength;

    // Check whether an input-filter will mask the value.
    if (char && mask) {
      if (!mask({ text: to, char })) return; // Handled.
    }

    // Update state and alert listeners.
    if (from !== to) {
      updateValue({ value: to, maxLength });
      onChange?.({ instance, from, to, isMax, char, modifierKeys: cloneModifierKeys() });
    }
  };

  const handleKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const { onKeyDown, onEscape, onTab } = props;
    const event = toKeyboardEvent(e);

    if (onKeyDown) onKeyDown(event);
    if (onEscape && e.key === 'Escape') onEscape(event);

    if (onTab && e.key === 'Tab') {
      let isCancelled = false;
      onTab({
        modifierKeys: cloneModifierKeys(),
        get isCancelled() {
          return isCancelled;
        },
        cancel() {
          isCancelled = true;
          e.preventDefault();
        },
      });
    }

    fireKeyboard(event, true);
  };

  const handleKeyup = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const event = toKeyboardEvent(e);
    props.onKeyUp?.(event);
    fireKeyboard(event, false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const event = { ...e, modifierKeys: cloneModifierKeys() };
    if (e.key === 'Enter') props.onEnter?.(event);
    props.onKeyPress?.(event);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const { focusAction, onFocus, selectOnFocus } = props;
    if (focusAction === 'Select' || selectOnFocus) selectAll();
    if (focusAction === 'To:End') cursorToEnd();
    onFocus?.(e);
    fire({
      type: 'sys.ui.TextInput/Focus',
      payload: { instance, isFocused: true },
    });
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    props.onBlur?.(e);
    fire({
      type: 'sys.ui.TextInput/Focus',
      payload: { instance, isFocused: false },
    });
  };

  /**
   * [Utility]
   */

  const toKeyboardEvent = (e: React.KeyboardEvent<HTMLInputElement>): t.TextInputKeyEvent => {
    const event = {
      ...e,
      modifierKeys: cloneModifierKeys(),
      preventDefault: () => e.preventDefault(),
      stopPropagation: () => e.stopPropagation(),
    };
    return event;
  };

  const fireKeyboard = (event: t.TextInputKeyEvent, isPressed: boolean) => {
    fire({
      type: 'sys.ui.TextInput/Keypress',
      payload: { instance, key: event.key, isPressed, event },
    });
  };

  const fire = (event: t.TextInputEvent) => {
    props.events$.next(event);
    props.instance.bus.fire(event);
  };

  const focus = () => inputRef.current?.focus();
  const blur = () => inputRef.current?.blur();
  const selectAll = () => inputRef.current?.select();

  const cursorToStart = () => {
    const el = inputRef.current as any;
    if (el) {
      if (el.setSelectionRange) {
        // Modern browsers.
        el.focus();
        el.setSelectionRange(0, 0);
      } else if (el.createTextRange) {
        // IE8 and below.
        const range = el.createTextRange();
        range.collapse(true);
        range.moveEnd('character', 0);
        range.moveStart('character', 0);
        range.select();
      }
    }
  };

  const cursorToEnd = () => {
    const el = inputRef.current as any;
    if (el) {
      if (typeof el.selectionStart === 'number') {
        el.selectionStart = el.selectionEnd = el.value.length;
      } else if (typeof el.createTextRange !== 'undefined') {
        const range = el.createTextRange();
        range.collapse(false);
        range.select();
      }
    }
  };

  /**
   * [Render]
   */

  const styles = {
    base: {
      position: 'relative',
      border: 'none',
      width: '100%',
      lineHeight: 0,
      outline: 'none',
      background: 'transparent',
      boxSizing: 'border-box',
      opacity: 1,
    },
  };

  if (selectionBackground) {
    styles.base = {
      ...styles.base,
      '::selection': { backgroundColor: color.format(selectionBackground) },
    } as any;
  }

  styles.base = R.merge(styles.base, Util.css.toTextInput(isEnabled, valueStyle));
  styles.base.opacity = isEnabled ? 1 : disabledOpacity;

  return (
    <input
      {...css(styles.base, props.style)}
      className={props.className}
      ref={inputRef}
      type={isPassword ? 'password' : 'text'}
      disabled={!isEnabled}
      value={value}
      maxLength={maxLength}
      spellCheck={props.spellCheck}
      autoCapitalize={props.autoCapitalize === false ? 'off' : undefined}
      autoCorrect={props.autoCorrect === false ? 'off' : undefined}
      autoComplete={props.autoComplete === false ? 'off' : undefined}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyPress={handleKeyPress}
      onKeyDown={handleKeydown}
      onKeyUp={handleKeyup}
      onDoubleClick={props.onDblClick}
    />
  );
};

/**
 * [Helpers]
 */
