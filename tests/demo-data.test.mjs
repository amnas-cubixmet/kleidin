import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { normalizeDemoProducts, SEED_SOURCE, validateTarget, allowedImage } from "../scripts/demo-data.mjs";

const originals = JSON.parse(readFileSync("scripts/fixtures/demo-products.json", "utf8"));
const uri = "mongodb://localhost:27017";

test("valid fixture becomes eight realistic uniquely identifiable demo records", () => {
  const normalized = normalizeDemoProducts(originals);
  assert.equal(normalized.length, 8);
  assert.equal(new Set(normalized.map((p) => p.sku)).size, normalized.length);
  assert.equal(new Set(normalized.map((p) => p.slug)).size, normalized.length);
  for (const product of normalized) {
    assert.equal(product.demo, true);
    assert.equal(product.seedSource, SEED_SOURCE);
    assert.equal(product.status, "active");
    assert.equal(product.wholesaleEnabled, false);
    assert.ok(product.stock > 0);
    assert.equal(product.stock, product.colorVariants.reduce((sum, v) => sum + v.stock, 0));
    for (const variant of product.colorVariants) {
      assert.equal(variant.stock, Object.values(variant.sizeStocks).reduce((sum, value) => sum + value, 0));
    }
  }
});

test("fixture validation rejects collisions and invalid numbers", () => {
  assert.throws(() => normalizeDemoProducts([originals[0], originals[0]]), /Duplicate SKU or slug/);
  assert.throws(() => normalizeDemoProducts([{ ...originals[0], sku: "REAL-001" }]), /DEMO-/);
  assert.throws(() => normalizeDemoProducts([{ ...originals[0], price: -1 }]), /price/);
  assert.throws(() => normalizeDemoProducts([{ ...originals[0], colorVariants: [] }]), /colorVariants/);
  assert.throws(() => normalizeDemoProducts([{ ...originals[0], slug: "../secret" }]), /slug/);
  assert.throws(() => normalizeDemoProducts([{ ...originals[0], image: "javascript:alert(1)" }]), /image host/);
});

test("only project-configured image locations are accepted", () => {
  assert.equal(allowedImage("/images/product-1.png"), true);
  assert.equal(allowedImage("https://res.cloudinary.com/my-cloud/image/upload/item.jpg"), true);
  assert.equal(allowedImage("https://unsafe.example.com/item.png"), false);
  assert.equal(allowedImage("//evil.example.com/item.png"), false);
});

test("database write requires matching confirmation and a staging name", () => {
  assert.equal(validateTarget({ uri, dbName: "kleidin_demo", confirmDb: "kleidin_demo" }), "kleidin_demo");
  assert.throws(() => validateTarget({ uri, dbName: "kleidin_demo", confirmDb: "other" }), /confirm-db/);
  assert.throws(() => validateTarget({ uri, dbName: "kleidin", confirmDb: "kleidin" }), /Non-staging/);
  assert.equal(validateTarget({ uri, dbName: "kleidin", confirmDb: "kleidin", allowLiveDb: true }), "kleidin");
  assert.throws(() => validateTarget({ uri, dbName: "kleidin_demo", confirmDb: "kleidin_demo", nodeEnv: "production" }), /NODE_ENV/);
  assert.throws(() => validateTarget({ uri: "", dbName: "kleidin_demo", confirmDb: "kleidin_demo" }), /MONGODB_URI/);
});
