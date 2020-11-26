import { useEffect, useLayoutEffect } from 'react';

const useRendererEffect =
  typeof window?.document?.createElement !== 'undefined'
    ? useLayoutEffect
    : useEffect;

export default useRendererEffect;
