import React from 'react';

import { t, useItemMonitor } from '../common';
import { Switch } from '../../../components/Primitives';
import { ButtonView } from '../Button';

export type BoolProps = {
  namespace: string;
  bus: t.EventBus;
  item: t.ActionBoolean;
};

export const Bool: React.FC<BoolProps> = (props) => {
  const { namespace } = props;
  const model = useItemMonitor({ bus: props.bus, item: props.item });
  const bus = props.bus.type<t.DevActionEvent>();
  const { label, description, isSpinning } = model;
  const isActive = model.handlers.length > 0;
  const value = Boolean(model.current);

  const fire = () => {
    bus.fire({
      type: 'dev:action/Boolean',
      payload: {
        namespace,
        item: model,
        changing: { next: !value },
      },
    });
  };

  const elSwitch = <Switch value={value} isEnabled={isActive} height={18} />;

  return (
    <ButtonView
      isActive={isActive}
      isSpinning={isSpinning}
      label={label}
      description={description}
      right={elSwitch}
      onClick={fire}
    />
  );
};
