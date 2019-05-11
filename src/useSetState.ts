import { useReducer } from 'react';

export default function useSetState(initialState) {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    initialState,
  );

  return [state, setState];
}
