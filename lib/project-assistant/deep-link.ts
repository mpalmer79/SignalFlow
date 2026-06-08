// Deep-link support for the project assistant. A visitor can open the panel
// directly from a URL, for example /?assistant=open or /#assistant, which is
// handy for sharing a link that lands someone straight in the assistant. Pure
// and deterministic so it can be tested without a browser. It only reads the
// URL; it never rewrites it.
export function shouldAutoOpenAssistant(search: string, hash: string): boolean {
  const params = new URLSearchParams(search);
  if (params.get("assistant") === "open") return true;
  return hash === "#assistant";
}
