const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const { existsSync, readFileSync, readdirSync } = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
const cli = path.join(root, "node_modules", "webpack-cli", "bin", "cli.js");

function build(config) {
  execFileSync(process.execPath, [cli, "--config", config], {
    cwd: root,
    stdio: "inherit"
  });
}

build("webpack.vulnerable.js");
const bundle = readFileSync(path.join(dist, "bundle.js"), "utf8");
assert.match(bundle, /sourceMappingURL=bundle\.js\.map/);
const map = JSON.parse(readFileSync(path.join(dist, "bundle.js.map"), "utf8"));
assert.equal(map.version, 3);
assert.ok(Array.isArray(map.sources));
assert.ok(Array.isArray(map.sourcesContent));
assert.equal(map.sources.length, map.sourcesContent.length);
const internalIndex = map.sources.findIndex(source => /(?:^|\/)internal\.js$/.test(source));
assert.ok(internalIndex >= 0, "Expected original internal.js in the map");
assert.ok(map.sourcesContent[internalIndex].includes("DEMO_TOKEN_NOT_A_REAL_SECRET"));
assert.ok(!bundle.includes("DEMO_TOKEN_NOT_A_REAL_SECRET"),
  "The illustrative comment should be exposed through the map, not this minified bundle");

build("webpack.fixed.js");
assert.ok(existsSync(path.join(dist, "bundle.js")));
assert.ok(!readdirSync(dist).some(file => file.endsWith(".map")));
assert.doesNotMatch(readFileSync(path.join(dist, "bundle.js"), "utf8"), /sourceMappingURL=/);
console.log("PASS: local source-map exposure and no-map builds verified.");
