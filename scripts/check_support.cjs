#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

// From website/scripts this is the website root. An optional root is useful
// while staging the support bundle outside the website checkout.
const root = path.resolve(process.argv[2] || path.join(__dirname, ".."));
const modelPath = path.join(root, "site", "support-model.js");
const flowsPath = path.join(root, "site", "support-flows.json");
const model = require(modelPath);
const data = JSON.parse(fs.readFileSync(flowsPath, "utf8"));
const locales = ["zh-CN", "en", "ja"];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function expectThrow(callback, label) {
  assert.throws(callback, undefined, label);
}

function walkPaths(topicId, session, choices = [], terminals = []) {
  if (session.nodeId === "$solved" || session.nodeId === "$support") {
    terminals.push({ topicId, session, choices });
    return;
  }
  const node = data.nodes[session.nodeId];
  assert.ok(node, `active node exists: ${session.nodeId}`);
  node.choices.forEach((_choice, index) => {
    const before = JSON.stringify(session);
    const next = model.choose(data, session, index);
    assert.equal(JSON.stringify(session), before, "choose does not mutate its input");
    walkPaths(topicId, next, choices.concat(index), terminals);
  });
}

model.validateFlows(data);
assert.equal(data.schemaVersion, 1);
assert.ok(data.topics.length > 0, "at least one support topic");
assert.deepEqual(model.LOCALES, locales);
for (const topic of data.topics) {
  for (const locale of locales) {
    assert.equal(typeof topic.title[locale], "string", `${topic.id} title ${locale}`);
    assert.equal(typeof topic.description[locale], "string", `${topic.id} description ${locale}`);
  }
}

const allTerminals = [];
for (const topic of data.topics) {
  const initial = model.createSession(data, topic.id);
  assert.deepEqual(initial, { topicId: topic.id, nodeId: topic.entry, history: [] });
  const terminals = [];
  walkPaths(topic.id, initial, [], terminals);
  assert.ok(terminals.length > 0, `${topic.id} has a terminal path`);
  allTerminals.push(...terminals);
  for (const result of terminals) {
    const replayed = model.replay(data, topic.id, result.choices);
    assert.deepEqual(replayed, result.session, `${topic.id} replay matches choices`);
    let current = result.session;
    for (let index = result.choices.length - 1; index >= 0; index -= 1) {
      const previous = model.undo(data, current);
      const expected = model.replay(data, topic.id, result.choices.slice(0, index));
      assert.deepEqual(previous, expected, `${topic.id} undo step ${index}`);
      current = previous;
    }
    assert.deepEqual(model.undo(data, current), current, `${topic.id} undo at start`);
  }
}
assert.ok(allTerminals.some(({ session }) => session.nodeId === "$solved"), "a solved result exists");
assert.ok(allTerminals.some(({ session }) => session.nodeId === "$support"), "a support handoff exists");

// Session validation must replay history and reject caller-supplied node IDs.
const firstTopic = data.topics[0];
const first = model.createSession(data, firstTopic.id);
expectThrow(() => model.choose(data, { topicId: first.topicId, nodeId: "$support", history: [] }, 0), "forged node id");
expectThrow(() => model.choose(data, { topicId: first.topicId, nodeId: first.nodeId, history: [{ nodeId: "forged", choiceIndex: 0 }] }, 0), "forged history node");
expectThrow(() => model.choose(data, first, -1), "negative choice");
expectThrow(() => model.choose(data, first, 1.25), "fractional choice");
expectThrow(() => model.replay(data, firstTopic.id, [999]), "choice outside node");
expectThrow(() => model.replay(data, firstTopic.id, [-1]), "negative replay choice");
expectThrow(() => model.replay(data, firstTopic.id, ["0"]), "string replay choice");
expectThrow(() => model.replay(data, "missing-topic", []), "missing topic");
expectThrow(() => model.replay(data, firstTopic.id, null), "malformed replay history");

// The authored graph is treated as data: malformed copies must fail closed.
const badSchema = clone(data); badSchema.schemaVersion = 2;
expectThrow(() => model.validateFlows(badSchema), "schema version");
const missingLocale = clone(data); delete missingLocale.topics[0].title.en;
expectThrow(() => model.validateFlows(missingLocale), "missing locale");
const badRef = clone(data); badRef.nodes[badRef.topics[0].entry].choices[0].next = "missing-node";
expectThrow(() => model.validateFlows(badRef), "missing node reference");
const badTerminal = clone(data); badTerminal.nodes[badTerminal.topics[0].entry].choices[0].next = "$unknown";
expectThrow(() => model.validateFlows(badTerminal), "unknown terminal");
const duplicateTopic = clone(data); duplicateTopic.topics.push(clone(duplicateTopic.topics[0]));
expectThrow(() => model.validateFlows(duplicateTopic), "duplicate topic");
const orphan = clone(data); orphan.nodes.orphan = clone(orphan.nodes[orphan.topics[0].entry]);
expectThrow(() => model.validateFlows(orphan), "unreachable node");
const cycle = clone(data); cycle.nodes[cycle.topics[0].entry].choices[0].next = cycle.topics[0].entry;
expectThrow(() => model.validateFlows(cycle), "cycle");
const maliciousId = clone(data); maliciousId.topics.push({ id: "__proto__", title: clone(data.topics[0].title), description: clone(data.topics[0].description), entry: data.topics[0].entry });
expectThrow(() => model.validateFlows(maliciousId), "malicious topic id");

// History is bounded even when an otherwise valid graph is deliberately long.
const chain = { schemaVersion: 1, version: "test", topics: [{ id: "chain", title: {}, description: {}, entry: "n0" }], nodes: {} };
for (const locale of locales) {
  chain.topics[0].title[locale] = "Chain";
  chain.topics[0].description[locale] = "Chain";
}
for (let index = 0; index <= model.FLOW_LIMIT; index += 1) {
  const next = index === model.FLOW_LIMIT ? "$solved" : `n${index + 1}`;
  chain.nodes[`n${index}`] = { title: {}, body: {}, choices: [{ label: {}, next }] };
  for (const locale of locales) {
    chain.nodes[`n${index}`].title[locale] = "Step";
    chain.nodes[`n${index}`].body[locale] = "Step";
    chain.nodes[`n${index}`].choices[0].label[locale] = "Next";
  }
}
model.validateFlows(chain);
const withinLimit = new Array(model.FLOW_LIMIT).fill(0);
assert.equal(model.replay(chain, "chain", withinLimit).history.length, model.FLOW_LIMIT);
expectThrow(() => model.replay(chain, "chain", withinLimit.concat(0)), "overlong replay");
let chainSession = model.createSession(chain, "chain");
for (let index = 0; index < model.FLOW_LIMIT; index += 1) chainSession = model.choose(chain, chainSession, 0);
expectThrow(() => model.choose(chain, chainSession, 0), "overlong choose");

const source = JSON.stringify(data);
for (const terminal of allTerminals.slice(0, 8)) model.replay(data, terminal.topicId, terminal.choices);
assert.equal(JSON.stringify(data), source, "validation and traversal do not mutate authored data");
console.log(`PASS: validated ${data.topics.length} topics, ${allTerminals.length} terminal paths, immutable undo/replay, malformed graph rejection, and ${model.FLOW_LIMIT}-choice bound`);
