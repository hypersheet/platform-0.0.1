import React, { useEffect } from 'react';

import {
  CssValue,
  MediaEvent,
  MediaStreamController,
  MediaStreamEvents,
  t,
  useVideoStreamState,
} from './common';
import { EventBridge } from './DEV.EventBridge';
import { DevVideo } from './DEV.Video';

export type DevVideoSelfProps = {
  peer: t.PeerId;
  bus: t.EventBus<any>;
  width?: number;
  height?: number;
  style?: CssValue;
};

export const DevVideoSelf: React.FC<DevVideoSelfProps> = (props) => {
  const { width = 150, height = 100 } = props;
  const videoRef = EventBridge.videoRef(props.peer);
  const bus = props.bus.type<t.PeerEvent | MediaEvent>();

  const { stream } = useVideoStreamState({ bus, ref: videoRef });

  useEffect(() => {
    MediaStreamController({ bus });
    const events = MediaStreamEvents({ bus });
    events.start(videoRef).video();
    return () => events.dispose();
  }, [bus, videoRef]);

  return <DevVideo width={width} height={height} stream={stream} />;
};
