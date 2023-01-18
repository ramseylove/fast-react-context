import React, {
  useRef,
  createContext,
  useContext,
  useCallback,
  useSyncExternalStore,
} from "react";

type FormData = { first: string; last: string };

type FormKeys = keyof FormData;

type Store = {
  [key: string]: Partial<FormData>;
};

const initialData = {
  input1: {
    first: "",
    last: "",
  },
  input2: {
    first: "",
    last: "",
  },
} as Store;

function useStoreData(): {
  get: () => Store;
  set: (value: Partial<Store>) => void;
  subscribe: (callback: () => void) => () => void;
} {
  const store = useRef<Store>(initialData);

  const get = useCallback(() => store.current, []);

  const subscribers = useRef(new Set<() => void>());

  const set = useCallback((value: Partial<Store>) => {
    //  Accessing the key of value being passed in: Object.keys(value)[0]
    const currentKey = Object.keys(value)[0];
    const currentObj = store.current[currentKey];
    const newValues = { ...currentObj, ...value[currentKey] };
    // console.info("currentKey: ", currentKey);
    // console.info("currentObj: ", currentObj);
    // console.info("newValues: ", newValues);
    // console.info("value[currentKey]: ", value[currentKey]);
    store.current = { ...store.current, [currentKey]: newValues };
    subscribers.current.forEach((callback) => callback());
  }, []);

  const subscribe = useCallback((callback: () => void) => {
    subscribers.current.add(callback);
    return () => subscribers.current.delete(callback);
  }, []);

  return {
    get,
    set,
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
): [SelectorOutput, (value: Partial<Store>) => void] {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error("Store not found");
  }

  const state = useSyncExternalStore(store.subscribe, () =>
    selector(store.get())
  );

  return [state, store.set];
}

type TextInputProps = {
  value: FormKeys;
  id: keyof Store;
};

const TextInput = ({ value, id }: TextInputProps) => {
  const [fieldValue, setStore] = useStore((store) => store[id][value]);
  return (
    <div className="field">
      {value}:{" "}
      <input
        value={fieldValue}
        onChange={(e) => setStore({ [id]: { [value]: e.target.value } })}
      />
    </div>
  );
};

const Display = ({ value, id }: TextInputProps) => {
  const [fieldValue] = useStore((store) => store[id][value]);
  return (
    <div className="value">
      {value}: {fieldValue}
    </div>
  );
};

const FormContainer = () => {
  return (
    <div className="container">
      <h5>FormContainer</h5>
      <TextInput value="first" id="input1" />
      <TextInput value="last" id="input1" />
    </div>
  );
};

const DisplayContainer = () => {
  return (
    <div className="container">
      <h5>DisplayContainer</h5>
      <Display value="first" id="input1" />
      <Display value="last" id="input1" />
    </div>
  );
};

const ContentContainer = () => {
  return (
    <div className="container">
      <h5>ContentContainer</h5>
      <FormContainer />
      <DisplayContainer />
    </div>
  );
};

function App() {
  return (
    <Provider>
      <div className="container">
        <h5>App</h5>
        <ContentContainer />
      </div>
    </Provider>
  );
}

export default App;
