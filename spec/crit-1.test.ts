import { readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

// C1 — "Forgotten web". These assert the week's published spec, in contract
// terms: what the shipped site must do, not how it was built. They run against
// dist/ for the same reason the invariants do — the deployed bytes are what
// gets marked, and Vite is perfectly capable of shipping something the source
// doesn't obviously contain.
//
// Two spec lines are deliberately NOT here:
//   - "deployed and live at its public GitHub Pages URL" — the CI `deploy` job
//     already asserts this against the real URL; a local copy would either
//     duplicate it or lie.
//   - process evidence (PROCESS.md, reflections/crit-1.md) — `pnpm
//     check:evidence` verifies these against the live course API, including
//     that the citations resolve to real commits.
//
// And two are for a person at the crit, not a test: that the look *commits* to
// a forgotten era, and that I can account for how I directed the agent.

const DIST = resolve("dist");

function htmlFiles(dir: string = DIST): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.name.endsWith(".html") ? [path] : [];
  });
}

function assetFiles(dir: string = DIST): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return assetFiles(path);
    return [relative(DIST, path)];
  });
}

const pages = htmlFiles().map((path) => ({
  name: relative(DIST, path),
  html: readFileSync(path, "utf8"),
  doc: new JSDOM(readFileSync(path, "utf8")).window.document,
}));

const home = pages.find(({ name }) => name === "index.html");

describe("C1: no JavaScript", () => {
  // "built with plain HTML and CSS, no JavaScript" is the one spec line a
  // build tool can violate behind your back, so it gets the sharpest test.
  for (const { name, doc } of pages) {
    it(`${name} ships no script element`, () => {
      const scripts = [...doc.querySelectorAll("script")].map(
        (s) => s.getAttribute("src") ?? "(inline)",
      );
      expect(scripts, `${name} must ship no <script>`).toEqual([]);
    });

    it(`${name} carries no inline event handlers`, () => {
      const offenders: string[] = [];
      for (const el of doc.querySelectorAll("*")) {
        for (const attr of el.attributes) {
          if (attr.name.startsWith("on")) {
            offenders.push(`<${el.tagName.toLowerCase()} ${attr.name}>`);
          }
        }
      }
      expect(offenders).toEqual([]);
    });
  }

  it("ships no .js file at all", () => {
    const js = assetFiles().filter((f) => f.endsWith(".js") || f.endsWith(".mjs"));
    expect(js, "dist/ must contain no JavaScript").toEqual([]);
  });
});

describe("C1: it is a real site", () => {
  it("is a handful of pages, not one", () => {
    // "a handful" — four is the floor at which a nav is doing real work.
    expect(pages.length).toBeGreaterThanOrEqual(4);
  });

  it("has a home page", () => {
    expect(home, "dist/index.html must exist").toBeTruthy();
  });

  it("reaches every page from the home page", () => {
    const linked = new Set(
      [...home!.doc.querySelectorAll("a[href]")]
        .map((a) => (a.getAttribute("href") ?? "").split("#")[0].replace(/^\.\//, ""))
        .map((href) => (href === "" || href === "./" ? "index.html" : href)),
    );

    const unreachable = pages
      .map(({ name }) => name)
      .filter((name) => name !== "index.html" && !linked.has(name));

    expect(
      unreachable,
      `not reachable from the home page: ${unreachable.join(", ")}`,
    ).toEqual([]);
  });

  for (const { name, doc } of pages) {
    it(`${name} carries readable content, not a stub`, () => {
      const main = doc.querySelector("main");
      expect(main, `${name} needs a <main>`).toBeTruthy();
      const words = (main?.textContent ?? "").trim().split(/\s+/).filter(Boolean);
      expect(
        words.length,
        `${name} has only ${words.length} words in <main>`,
      ).toBeGreaterThanOrEqual(120);
    });

    it(`${name} can navigate back to the home page`, () => {
      const hrefs = [...doc.querySelectorAll("nav a[href]")].map(
        (a) => a.getAttribute("href") ?? "",
      );
      expect(
        hrefs.some((h) => h === "./" || h === "./index.html" || h === "index.html"),
        `${name}'s nav must link home`,
      ).toBe(true);
    });
  }
});

describe("C1: internal links resolve", () => {
  // CI runs linkinator over dist/, but only once the repo is public. This is
  // the same contract, in the fast loop.
  const built = new Set(pages.map(({ name }) => name));

  for (const { name, doc } of pages) {
    it(`${name} has no dead internal link`, () => {
      const dead = [...doc.querySelectorAll("a[href]")]
        .map((a) => a.getAttribute("href") ?? "")
        .filter((href) => !/^(https?:|mailto:|#)/.test(href))
        .map((href) => href.split("#")[0].replace(/^\.\//, ""))
        .filter((href) => href !== "" && href !== "./")
        .filter((href) => !built.has(href));

      expect(dead, `${name} links to missing page(s): ${dead.join(", ")}`).toEqual([]);
    });
  }
});
