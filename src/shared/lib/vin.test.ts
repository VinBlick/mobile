import { describe, expect, it } from "@jest/globals";
import { hasValidCheckDigit, normalizeVin, validateVin, vinFromBarcode } from "./vin";

describe("vin", () => {
  it("normalizes pasted values", () => {
    expect(normalizeVin(" wvw-zzz 1kz6w000123 ")).toBe("WVWZZZ1KZ6W000123");
  });
  it("validates", () => {
    expect(validateVin("")).toBe("empty");
    expect(validateVin("WVWZZZ1KZ6W00012O")).toBe("forbidden");
    expect(validateVin("WVWZZZ1KZ6W00")).toBe("length");
    expect(validateVin("WVWZZZ1KZ6W000123")).toBeNull();
  });
  it("checks the north-american check digit", () => {
    expect(hasValidCheckDigit("1M8GDM9AXKP042788")).toBe(true);
    expect(hasValidCheckDigit("1M8GDM9A1KP042788")).toBe(false);
  });
  it("reads VINs from barcodes", () => {
    expect(vinFromBarcode("IWVWZZZ1KZ6W000123")).toBe("WVWZZZ1KZ6W000123");
    expect(vinFromBarcode("VIN:WVWZZZ1KZ6W000123/2020")).toBe("WVWZZZ1KZ6W000123");
    expect(vinFromBarcode("hello")).toBeNull();
  });
});
