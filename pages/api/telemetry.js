// pages/api/telemetry.js
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  try {
    const { event, props, at } = req.body || {};
    console.log("[telemetry]", event, { ...props, at });
    // Ici, tu peux plus tard forwarder vers une vraie analytics
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(200).json({ ok: true }); // ne casse jamais l'UI
  }
}
