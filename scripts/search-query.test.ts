import { strict as assert } from "node:assert";
import { canAppendToken, findToken, normalizeQuery } from "../src/features/pages/searchQuery";

const normalize = (input: string) => normalizeQuery(input);

assert.equal(normalize(""), "");
assert.equal(normalize("  hello  "), "hello");
assert.equal(normalize("tag:rust"), "tags:rust");
assert.equal(normalize("tags:rust,solid tag:solid"), "tags:rust,solid");
assert.equal(normalize("tag:a tag:b tag:c tag:d"), "tags:a,b,c");
assert.equal(normalize("hello tag:rust tag:solid"), "hello tags:rust,solid");

const categoryMatch = findToken("foo category:bar baz", "category:");
assert.deepEqual(categoryMatch, { valueStart: 13, valueEnd: 16 });

assert.equal(canAppendToken("tag:a tag:b tag:c", "tag:"), false);
assert.equal(canAppendToken("tag:a tag:b", "tag:"), true);
assert.equal(canAppendToken("category:foo", "category:"), false);

console.log("search-query.test.ts passed");
