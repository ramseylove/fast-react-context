import React, {
  useRef,
  createContext,
  useContext,
  useCallback,
  useSyncExternalStore,
} from "react";

import { StateValue, StateValueKeys } from "./App";

export default function createFastContext<Store extends Object>(
  initialState: Store
) {
  function useStoreData(): {
    get: () => Store;
    set: (value: Partial<Store>) => void;
    createInput: () => void;
    subscribe: (callback: () => void) => () => void;
  } {
    const store = useRef(initialState);

    const get = useCallback(() => store.current, []);

    const subscribers = useRef(new Set<() => void>());

    const set = useCallback((value: Partial<Store>) => {
      const currentKey = Object.keys(value)[0] as keyof Store;
      const currentObj = store.current[currentKey];
      const newValues = {
        ...currentObj,
        ...value[currentKey],
      };
      store.current = { ...store.current, [currentKey]: newValues };

      console.info("store.current: ", store.current);
      subscribers.current.forEach((callback) => callback());
    }, []);

    const createInput = useCallback(() => {
      let inputsCopy = structuredClone(store.current);
      const id = "input" + (Object.keys(inputsCopy).length + 1).toString();
      store.current = { ...inputsCopy, [id]: { first: "", last: "" } };
      subscribers.current.forEach((callback) => callback());
    }, []);

    const subscribe = useCallback((callback: () => void) => {
      subscribers.current.add(callback);
      return () => subscribers.current.delete(callback);
    }, []);

    return {
      get,
      set,
      createInput,
      subscribe,
    };
  }

  type UseStoreDataReturnType = ReturnType<typeof useStoreData>;

  const StoreContext = createContext<UseStoreDataReturnType | null>(null);

  function Provider({ children }: { children: React.ReactNode }) {
    return (
      <StoreContext.Provider value={useStoreData()}>
        {children}
      </StoreContext.Provider>
    );
  }

  function useStore<SelectorOutput>(
    selector: (store: Store) => SelectorOutput
  ): [SelectorOutput, (value: Partial<Store>) => void, () => void] {
    const store = useContext(StoreContext);
    if (!store) {
      throw new Error("Store not found");
    }

    const state = useSyncExternalStore(
      store.subscribe,
      () => selector(store.get()),
      () => selector(initialState)
    );

    return [state, store.set, store.createInput];
  }

  return {
    Provider,
    useStore,
  };
}
