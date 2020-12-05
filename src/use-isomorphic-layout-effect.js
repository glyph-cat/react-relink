import { useEffect, useLayoutEffect } from 'react';

const useIsomorphicLayoutEffect =
  typeof window?.document?.createElement !== 'undefined'
    ? useLayoutEffect
    : useEffect;

export default useIsomorphicLayoutEffect;
