import { describe, expect, it, jest } from "@jest/globals";
jest.mock("@/shared/config/env", () => ({ env: { siteUrl: "https://vinblick.de", apiBaseUrl: "" } }));
// eslint-disable-next-line import/first -- jest.mock is hoisted
import { isListingUrl, parseAppLink } from "./links";

describe("parseAppLink", () => {
  it("parses share, code and order links", () => {
    expect(parseAppLink("https://vinblick.de/r/abc123")).toEqual({ type: "share", token: "abc123" });
    expect(parseAppLink("https://vinblick.de/check/ab7k-92xm")).toEqual({ type: "code", code: "AB7K-92XM" });
    expect(parseAppLink("https://vinblick.de/orders/o1?access=tok")).toEqual({ type: "order", orderId: "o1", access: "tok" });
    expect(parseAppLink("vinblick://r/xyz")).toEqual({ type: "share", token: "xyz" });
  });
  it("ignores foreign links", () => {
    expect(parseAppLink("https://evil.example/r/abc")).toBeNull();
    expect(parseAppLink("not a url")).toBeNull();
  });
  it("detects marketplace listings", () => {
    expect(isListingUrl("https://suchen.mobile.de/fahrzeuge/details.html?id=1")).toBe(true);
    expect(isListingUrl("https://www.autoscout24.de/angebote/x")).toBe(true);
    expect(isListingUrl("https://example.com")).toBe(false);
  });
});
