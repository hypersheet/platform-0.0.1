import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { R, rx, t } from '../../common';

type M = MediaStreamConstraints;
type Refs = { [ref: string]: Ref };
type Ref = { ref: string; stream: MediaStream; constraints: M };

/**
 * Manages an event bus dealing with video stream.
 */
export function VideoStreamBusController(args: { bus: t.EventBus<any> }) {
  const dispose$ = new Subject<void>();
  const bus = args.bus.type<t.VideoEvent>();
  const $ = bus.event$.pipe(takeUntil(dispose$));
  let refs: Refs = {};

  /**
   * STSTUS
   */

  rx.payload<t.VideoStreamStatusRequestEvent>($, 'VideoStream/status:req')
    .pipe()
    .subscribe((e) => {
      const { ref } = e;
      const item = refs[ref];
      const exists = Boolean(item);
      const stream = item?.stream;
      const constraints = item?.constraints;
      const tracks = toTracks(item?.stream);

      bus.fire({
        type: 'VideoStream/status:res',
        payload: { ref, exists, stream, constraints, tracks },
      });
    });

  /**
   * START Connect to local-device media (camera/audio).
   */
  rx.payload<t.VideoStreamStartEvent>($, 'VideoStream/start')
    .pipe()
    .subscribe(async (e) => {
      const { ref } = e;

      if (!refs[ref]) {
        const base: M = {
          video: true,
          audio: { echoCancellation: { ideal: true } },
        };
        const constraints = R.mergeDeepRight(base, e.constraints || {}) as M;
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        refs[ref] = { ref, stream, constraints };
      }

      const { stream } = refs[ref];

      bus.fire({
        type: 'VideoStream/started',
        payload: { ref, stream },
      });
    });

  /**
   * STOP
   */
  rx.payload<t.VideoStreamStopEvent>($, 'VideoStream/stop')
    .pipe()
    .subscribe((e) => {
      const { ref } = e;
      const stream = refs[ref]?.stream;
      delete refs[ref];

      (stream?.getTracks() || []).forEach((track) => track.stop());
      const tracks = toTracks(stream);

      bus.fire({
        type: 'VideoStream/stopped',
        payload: { ref, tracks },
      });
    });

  return {
    dispose$: dispose$.asObservable(),
    dispose() {
      dispose$.next();
      refs = {};
    },
  };
}

/**
 * [Helpers]
 */

function toTracks(stream?: MediaStream) {
  return (stream?.getTracks() || []).map(toTrack);
}

function toTrack(input: MediaStreamTrack): t.VideoStreamTrack {
  const { id, enabled: isEnabled, muted: isMuted, label, readyState: state } = input;
  const kind = input.kind as t.VideoStreamTrack['kind'];
  return { kind, id, isEnabled, isMuted, label, state };
}
