import { describe, it, expect } from "vitest";
import { shouldAutoOpenAssistant } from "@/lib/project-assistant/deep-link";

// The assistant can be opened from a URL: /?assistant=open or /#assistant.
// These pin the deep-link decision so manual open and close are never affected
// by a normal visit to the site.

describe("assistant deep link", () => {
  it("opens when the query parameter is assistant=open", () => {
    expect(shouldAutoOpenAssistant("?assistant=open", "")).toBe(true);
  });

  it("opens when assistant=open appears alongside other params", () => {
    expect(shouldAutoOpenAssistant("?ref=email&assistant=open", "")).toBe(true);
  });

  it("opens when the hash is #assistant", () => {
    expect(shouldAutoOpenAssistant("", "#assistant")).toBe(true);
  });

  it("stays closed for a normal visit with no signal", () => {
    expect(shouldAutoOpenAssistant("", "")).toBe(false);
  });

  it("stays closed for an unrelated query value", () => {
    expect(shouldAutoOpenAssistant("?assistant=closed", "")).toBe(false);
    expect(shouldAutoOpenAssistant("?other=open", "")).toBe(false);
  });

  it("stays closed for an unrelated hash", () => {
    expect(shouldAutoOpenAssistant("", "#pricing")).toBe(false);
  });

  it("opens when either the query or the hash requests it", () => {
    expect(shouldAutoOpenAssistant("?assistant=open", "#assistant")).toBe(true);
    expect(shouldAutoOpenAssistant("?foo=bar", "#assistant")).toBe(true);
    expect(shouldAutoOpenAssistant("?assistant=open", "#other")).toBe(true);
  });
});
