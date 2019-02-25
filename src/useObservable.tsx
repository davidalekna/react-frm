import { useState, useEffect } from 'react';

const useObservable = (observable$, initialValue?: any): any | undefined => {
  const [state, setState] = useState(initialValue);

  useEffect(() => {
    const s = observable$.subscribe(setState);
    return () => s.unsubscribe();
  }, [observable$]);

  return state;
};

export default useObservable;
