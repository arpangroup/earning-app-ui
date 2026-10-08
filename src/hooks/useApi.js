import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Load data for a screen:  const { data, loading, error, reload } = useApi(() => api.getReferral(), []);
 * Ignores responses that arrive after unmount or after deps changed.
 */
export default function useApi(fetcher, deps = []) {
  const [state, setState] = useState({ data: undefined, loading: true, error: null });
  const callId = useRef(0);

  const load = useCallback(() => {
    const id = ++callId.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    fetcher()
      .then((data) => id === callId.current && setState({ data, loading: false, error: null }))
      .catch((error) => id === callId.current && setState((s) => ({ ...s, loading: false, error })));
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    load();
    return () => {
      callId.current++;
    };
  }, [load]);

  return { ...state, reload: load };
}
