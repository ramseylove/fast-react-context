import { useState } from "react";
import createFastContext from "./createFastContext";

// type StateValue = {
//   first: string;
//   last: string;
// };

// type StateValueKeys = keyof StateValue;
// rewritten
export type StateValueKeys = "first" | "last";

export type StateValue = Record<"tags", string>;

type Store = {
  [id: string]: Partial<StateValue>;
};

type TextInputProps = {
  value: "tags";
  id: keyof Store;
};

const initialTokens = {
  input1: {
    tags: "willy",
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
      <TextInput value="first" id={id} key={"inputfirst-" + id} />
      <TextInput value="last" id={id} key={"inputlast-" + id} />
    </div>
  );
};

const DisplayContainer = ({ id }: { id: string }) => {
  return (
    <div className="container">
      <h5>{id} - DisplayContainer</h5>
      <Display value="first" id={id} key={"displayfirst-" + id} />
      <Display value="last" id={id} key={"displaylast-" + id} />
    </div>
  );
};

const ContentContainer = () => {
  const [store, setStore, createInput] = useStore((store) => store);
  return (
    <div className="container">
      <h5>ContentContainer</h5>
      <button type="button" onClick={() => createInput()}>
        Add New
      </button>
      {Object.keys(store).map((obj, idx) => (
        <div className="input-display-container">
          <TextInput value="tags" id={obj} key={"inputfirst-" + idx} />
        </div>
      ))}
    </div>
  );
};

const Application = () => {
  return (
    <Provider>
      <div className="container">
        <h5>App</h5>
        <ContentContainer />
      </div>
    </Provider>
  );
};

export default Application;
