import { t } from '../common';
import { BindingMonitor } from './BindingMonitor';

/**
 * Manages style operations.
 */
export function init(args: { grid: t.IGrid; fire: t.FireGridKeyboardCommandEvent }) {
  const { grid } = args;
  const bindings = new BindingMonitor({ grid });

  const monitor = (cmd: t.GridStyleCommand) =>
    bindings.monitor(cmd, e => {
      console.log(cmd, e);
    });
  monitor('BOLD');
  monitor('ITALIC');
  monitor('UNDERLINE');
}
