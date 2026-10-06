import { describe, expect, it } from "vitest";
import { localePath, switchLangPath } from "../src/i18n/config";

describe("language paths", () => {
  it("builds page addresses per language", () => {
    expect(localePath("sv", "/")).toBe("/");
    expect(localePath("en", "/")).toBe("/en/");
    expect(localePath("en", "/calculator/")).toBe("/en/calculator/");
    expect(localePath("sv", "/boka/")).toBe("/boka/");
    expect(localePath("en", "/boka/")).toBe("/en/book/");
    expect(localePath("en", "/boka/?topic=programs")).toBe("/en/book/?topic=programs");
    expect(localePath("en", "/#about")).toBe("/en/#about");
  });

  it("switches to the same page in the other language", () => {
    expect(switchLangPath("/", "en")).toBe("/en/");
    expect(switchLangPath("/en/", "sv")).toBe("/");
    expect(switchLangPath("/calculator/", "en")).toBe("/en/calculator/");
    expect(switchLangPath("/boka/", "en")).toBe("/en/book/");
    expect(switchLangPath("/en/book", "sv")).toBe("/boka/");
  });
});
