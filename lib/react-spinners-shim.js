// lib/react-spinners-shim.js
// ⚠️ NE PAS importer depuis "react-spinners" (ça bouclerait avec l'alias).
// On ré-exporte directement les modules profonds.
export { default as BounceLoader } from "react-spinners/BounceLoader";
export { default as ClipLoader } from "react-spinners/ClipLoader";
export { default as PulseLoader } from "react-spinners/PulseLoader";
export { default as ScaleLoader } from "react-spinners/ScaleLoader";

// on peut fournir un export par défaut vide (optionnel)
export default {};
