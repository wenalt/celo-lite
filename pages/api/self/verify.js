import { SelfBackendVerifier, AllIds, DefaultConfigStore } from "@selfxyz/core";

const verification_config = {
  excludedCountries: [],
  ofac: false,
  minimumAge: 18,
};
const configStore = new DefaultConfigStore(verification_config);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  // Construit l'endpoint exact (prod/preview/local) à partir des headers
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers.host;
  const endpoint = `${proto}://${host}/api/self/verify`;

  const verifier = new SelfBackendVerifier(
    process.env.NEXT_PUBLIC_SELF_SCOPE || "celo-lite",
    endpoint,
    process.env.SELF_USE_MOCK === "true",
    AllIds,
    configStore,
    "hex" // on identifie par adresse EVM (hex)
  );

  try {
    const { attestationId, proof, publicSignals, userContextData } = req.body || {};
    if (!proof || !publicSignals || !attestationId || !userContextData) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const result = await verifier.verify(attestationId, proof, publicSignals, userContextData);

    if (result.isValidDetails.isValid) {
      return res.status(200).json({
        ok: true,
        credentialSubject: result.discloseOutput, // ex: nationality/gender si demandés
      });
    }
    return res.status(400).json({ ok: false, details: result.isValidDetails });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false });
  }
}
