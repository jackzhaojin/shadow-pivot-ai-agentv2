import { useState } from 'react';

export default function useBoolean(initial = false) {
  const [value, setValue] = useState(initial);
  const toggle = () => setValue((v) => !v);
  return { value, toggle, setValue };
}
