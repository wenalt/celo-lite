// utils/eip6963.js
export async function discoverInjectedProviders6963(timeoutMs = 300) {
  if (typeof window === "undefined") return [];
  const results = new Map(); // key = info.uuid

  function onAnnounce(e) {
    const { info, provider } = e.detail || {};
    if (info?.uuid && provider) results.set(info.uuid, { info, provider });
  }

  window.addEventListener("eip6963:announceProvider", onAnnounce);
  window.dispatchEvent(new Event("eip6963:requestProvider"));
  await new Promise((r) => setTimeout(r, timeoutMs));
  window.removeEventListener("eip6963:announceProvider", onAnnounce);

  return Array.from(results.values()); // [{ info:{uuid,name,icon,rdns}, provider }, ...]
}
