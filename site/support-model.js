/* Pure state machine for the CardputerZero Support self-help flow.
 *
 * The browser renderer owns presentation and persistence. This module only
 * validates the authored graph and moves an immutable session through it.
 */
(function attachSupportModel(global) {
  "use strict";

  const FLOW_LIMIT = 32;
  const LOCALES = ["zh-CN", "en", "ja"];
  const TERMINALS = new Set(["$solved", "$support"]);
  const ID_PATTERN = /^[A-Za-z][A-Za-z0-9_-]{0,95}$/;
  const RESERVED_IDS = new Set(["__proto__", "prototype", "constructor"]);

  function fail(message) {
    throw new TypeError(`Invalid support flow: ${message}`);
  }

  function isRecord(value) {
    if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  }

  function hasOwn(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
  }

  function requireId(value, context) {
    if (typeof value !== "string" || !ID_PATTERN.test(value) || RESERVED_IDS.has(value)) {
      fail(`${context} must be a safe identifier`);
    }
  }

  function requireLocalized(value, context) {
    if (!isRecord(value)) fail(`${context} must be a locale map`);
    for (const locale of LOCALES) {
      if (typeof value[locale] !== "string" || value[locale].trim() === "") {
        fail(`${context}.${locale} must be a non-empty string`);
      }
    }
  }

  function requireChoice(choice, nodeId, index, nodeIds) {
    if (!isRecord(choice)) fail(`nodes.${nodeId}.choices[${index}] must be an object`);
    requireLocalized(choice.label, `nodes.${nodeId}.choices[${index}].label`);
    if (typeof choice.next !== "string") fail(`nodes.${nodeId}.choices[${index}].next must be a string`);
    if (!TERMINALS.has(choice.next) && !nodeIds.has(choice.next)) {
      fail(`nodes.${nodeId}.choices[${index}] points to an unknown node`);
    }
  }

  function validateFlows(data) {
    if (!isRecord(data)) fail("root must be an object");
    if (data.schemaVersion !== 1) fail("schemaVersion must be 1");
    if (typeof data.version !== "string" || data.version.trim() === "") fail("version must be non-empty");
    if (!Array.isArray(data.topics) || data.topics.length === 0) fail("topics must be a non-empty array");
    if (!isRecord(data.nodes)) fail("nodes must be an object");

    const nodeIds = new Set(Object.keys(data.nodes));
    if (nodeIds.size === 0) fail("nodes must not be empty");
    for (const nodeId of nodeIds) {
      requireId(nodeId, "node id");
      const node = data.nodes[nodeId];
      if (!isRecord(node)) fail(`nodes.${nodeId} must be an object`);
      requireLocalized(node.title, `nodes.${nodeId}.title`);
      requireLocalized(node.body, `nodes.${nodeId}.body`);
      if (hasOwn(node, "note") && node.note !== undefined) {
        requireLocalized(node.note, `nodes.${nodeId}.note`);
      }
      if (!Array.isArray(node.choices) || node.choices.length === 0) {
        fail(`nodes.${nodeId}.choices must be a non-empty array`);
      }
      node.choices.forEach((choice, index) => requireChoice(choice, nodeId, index, nodeIds));
    }

    const topicIds = new Set();
    const starts = [];
    for (let index = 0; index < data.topics.length; index += 1) {
      const topic = data.topics[index];
      if (!isRecord(topic)) fail(`topics[${index}] must be an object`);
      requireId(topic.id, `topics[${index}].id`);
      if (topicIds.has(topic.id)) fail(`duplicate topic id ${topic.id}`);
      topicIds.add(topic.id);
      requireLocalized(topic.title, `topics[${index}].title`);
      requireLocalized(topic.description, `topics[${index}].description`);
      if (typeof topic.entry !== "string" || !nodeIds.has(topic.entry)) {
        fail(`topics[${index}].entry must reference a node`);
      }
      starts.push(topic.entry);
    }

    const reachable = new Set();
    function mark(nodeId) {
      if (reachable.has(nodeId)) return;
      reachable.add(nodeId);
      for (const choice of data.nodes[nodeId].choices) {
        if (!TERMINALS.has(choice.next)) mark(choice.next);
      }
    }
    starts.forEach(mark);
    for (const nodeId of nodeIds) {
      if (!reachable.has(nodeId)) fail(`node ${nodeId} is unreachable from a topic`);
    }

    const colors = new Map();
    function visit(nodeId) {
      const color = colors.get(nodeId) || 0;
      if (color === 1) fail(`cycle detected at node ${nodeId}`);
      if (color === 2) return;
      colors.set(nodeId, 1);
      for (const choice of data.nodes[nodeId].choices) {
        if (!TERMINALS.has(choice.next)) visit(choice.next);
      }
      colors.set(nodeId, 2);
    }
    for (const nodeId of nodeIds) visit(nodeId);
    return data;
  }

  function topicOrFail(data, topicId) {
    if (typeof topicId !== "string") fail("topic id must be a string");
    const topic = data.topics.find((candidate) => candidate.id === topicId);
    if (!topic) fail(`unknown topic ${topicId}`);
    return topic;
  }

  function makeSession(topicId, nodeId, history) {
    return { topicId, nodeId, history: history.map((item) => ({ ...item })) };
  }

  function replayValidated(data, topicId, historyIndices) {
    const topic = topicOrFail(data, topicId);
    if (!Array.isArray(historyIndices)) fail("history must be an array of choice indices");
    if (historyIndices.length > FLOW_LIMIT) fail(`history exceeds ${FLOW_LIMIT} choices`);
    let nodeId = topic.entry;
    const history = [];
    for (let index = 0; index < historyIndices.length; index += 1) {
      if (TERMINALS.has(nodeId)) fail("history continues after a terminal result");
      const choiceIndex = historyIndices[index];
      if (!Number.isInteger(choiceIndex) || choiceIndex < 0) fail("choice indices must be non-negative integers");
      const node = data.nodes[nodeId];
      if (choiceIndex >= node.choices.length) fail("choice index is outside the current node");
      history.push({ nodeId, choiceIndex });
      nodeId = node.choices[choiceIndex].next;
    }
    return makeSession(topic.id, nodeId, history);
  }

  function sessionHistory(data, session) {
    if (!isRecord(session)) fail("session must be an object");
    const canonical = replayValidated(data, session.topicId,
      Array.isArray(session.history)
        ? session.history.map((entry) => {
          if (!isRecord(entry) || !Number.isInteger(entry.choiceIndex)) fail("session history entry is malformed");
          return entry.choiceIndex;
        })
        : (() => { fail("session history must be an array"); })());
    if (session.nodeId !== canonical.nodeId) fail("session node does not match its replayed history");
    for (let index = 0; index < session.history.length; index += 1) {
      const entry = session.history[index];
      if (entry.nodeId !== canonical.history[index].nodeId) fail("session history node does not match replay");
    }
    return canonical;
  }

  function createSession(data, topicId) {
    validateFlows(data);
    const topic = topicOrFail(data, topicId);
    return makeSession(topic.id, topic.entry, []);
  }

  function choose(data, session, choiceIndex) {
    validateFlows(data);
    const canonical = sessionHistory(data, session);
    if (TERMINALS.has(canonical.nodeId)) fail("cannot choose after a terminal result");
    if (canonical.history.length >= FLOW_LIMIT) fail(`history exceeds ${FLOW_LIMIT} choices`);
    if (!Number.isInteger(choiceIndex) || choiceIndex < 0) fail("choice index must be a non-negative integer");
    const node = data.nodes[canonical.nodeId];
    if (choiceIndex >= node.choices.length) fail("choice index is outside the current node");
    const history = canonical.history.concat({ nodeId: canonical.nodeId, choiceIndex });
    return makeSession(canonical.topicId, node.choices[choiceIndex].next, history);
  }

  function undo(data, session) {
    validateFlows(data);
    const canonical = sessionHistory(data, session);
    if (canonical.history.length === 0) return canonical;
    const indices = canonical.history.slice(0, -1).map((entry) => entry.choiceIndex);
    return replayValidated(data, canonical.topicId, indices);
  }

  function replay(data, topicId, historyIndices) {
    validateFlows(data);
    return replayValidated(data, topicId, historyIndices);
  }

  const api = Object.freeze({ FLOW_LIMIT, LOCALES: Object.freeze([...LOCALES]), validateFlows, createSession, choose, undo, replay });
  global.SupportModel = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis === "object" ? globalThis : this);
