import { Observable } from 'rxjs';

type O = Record<string, unknown>;

export type Event<P extends O = any> = {
  type: string;
  payload: P;
};

export type FireEvent<E extends Event = Event> = (event: E) => void;

export type EventBus<E extends Event = Event> = {
  event$: Observable<E>;
  fire: FireEvent<E>;
  type<T extends Event>(): EventBus<T>;
  filter<T extends Event = E>(fn: EventBusFilter<T>): EventBus<T>;
};

export type EventBusFilter<E extends Event> = (e: E) => boolean;
