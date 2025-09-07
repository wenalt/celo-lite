// lib/react-spinners-shim.js
import pkg from 'react-spinners';

// expose les exports nommés attendus par le code tiers
export const BounceLoader = pkg.BounceLoader;
export const ClipLoader = pkg.ClipLoader;
export const PulseLoader = pkg.PulseLoader;
export const ScaleLoader = pkg.ScaleLoader;

// export par défaut conservé (au cas où)
export default pkg;
