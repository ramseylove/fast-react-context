import { useState } from "react";
import createFastContext from "./createFastContext";

// type StateValue = {
//   first: string;
//   last: string;
// };

// type StateValueKeys = keyof StateValue;
// rewritten
export type StateValueKeys = "first" | "last";

export type StateValue = Record<StateValueKeys, string>;

type Store = {
  [id: string]: Partial<StateValue>;
};

type TextInputProps = {
  value: StateValueKeys;
  id: keyof Store;
};

const initialTokens = {
  input1: {
    first: "willy",
    last: "mays",
  },
  input2: {
    first: "ricky",
    last: "robinson",
  },
} as Store;

const { Provider, useStore } = createFastContext(initialTokens);

function createTextInput(id: string) {}

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

const FormContainer = ({ id }: { id: string }) => {
  return (
    <div className="container">
      <h5>{id} - FormContainer</h5>
      <TextInput value="first" id={id} />
      <TextInput value="last" id={id} />
    </div>
  );
};

const DisplayContainer = ({ id }: { id: string }) => {
  return (
    <div className="container">
      <h5>{id} - DisplayContainer</h5>
      <Display value="first" id={id} />
      <Display value="last" id={id} />
    </div>
  );
};

const ContentContainer = ({ parameters }: { parameters: string[] }) => {
  return (
    <div className="container">
      <h5>ContentContainer</h5>
      {parameters.map((id) => (
        <FormContainer id={id} key={"form-" + id} />
      ))}
      {parameters.map((id) => (
        <DisplayContainer id={id} key={"display-" + id} />
      ))}
    </div>
  );
};

const App = () => {
  const [parameters, setParameters] = useState<string[]>(["input1"]);
  return (
    <Provider>
      <div className="container">
        <h5>App</h5>
        <button
          type="button"
          onClick={() =>
            setParameters((prev) => [
              ...prev,
              "input" + (prev.length += 1).toString(),
            ])
          }
        >
          Add New
        </button>
        <ContentContainer parameters={parameters} />
      </div>
    </Provider>
  );
};

export default App;
