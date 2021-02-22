import * as React from "react";
import localforage from "localforage";

type Subscriber = (newVal: any) => void;

export class ForageListener<E extends string> {
  storageKey?: string;
  state: Partial<Record<E, any>>;
  events: Map<E, Set<Subscriber>>;

  constructor(storageKey?: string) {
    this.storageKey = storageKey;
    this.events = new Map();
    this.state = {};
  }

  init(storageKey?: string) {
    if (storageKey != null) {
      this.storageKey = storageKey;
    }

    this.getStoredState();

    return this;
  }

  async getStoredState() {
    if (this.storageKey == null) {
      return;
    }

    try {
      const value = await localforage.getItem(this.storageKey);
      if (value) {
        this.state = JSON.parse(value as string);
        for (const [key, val] of Object.entries(this.state)) {
          if (!this.events.has(key as E)) {
            return;
          }

          for (const sub of this.events.get(key as E)!) {
            sub(val);
          }
        }
      }
    } catch (e) {
      throw Error(e);
    }
  }

  getValue(key: E) {
    return this.state[key];
  }

  subscribe(key: E, subscriber: Subscriber) {
    if (this.events.has(key)) {
      this.events.get(key)!.add(subscriber);
    } else {
      this.events.set(key, new Set([subscriber]));
    }

    return () => {
      this.events.get(key)?.delete(subscriber);
    };
  }

  update(key: E, value: any) {
    try {
      const newState = { ...this.state, [key]: value };
      const newStateString = JSON.stringify(newState);

      if (!this.events.has(key) || this.storageKey == null) {
        return;
      }

      for (const sub of this.events.get(key)!) {
        sub(value);
      }
      localforage.setItem(this.storageKey, newStateString);
      this.state = newState;
    } catch (e) {
      throw Error(`Failed to update Async storage:  ${e}`);
    }
  }
}

type Setter<T> = (newVal: T) => void;

export function makeCreateForage<E extends string>(
  storageListener: ForageListener<E>
) {
  return function createForage<T>(
    key: E,
    defaultValue: T
  ): [() => [T, Setter<T>], Setter<T>, ForageListener<E>] {
    function setVal(newVal: T) {
      storageListener.update(key, newVal);
    }

    function useStorage(): [T, Setter<T>] {
      const [state, setState] = React.useState<T>(
        storageListener.getValue(key) ?? defaultValue
      );

      React.useEffect(() => {
        return storageListener.subscribe(key, setState);
      }, []);

      return [state, setVal];
    }

    return [useStorage, setVal, storageListener];
  };
}
