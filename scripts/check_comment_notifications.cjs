const assert = require("node:assert/strict");
const { test } = require("node:test");
const notify = require("./notify_app_developer.cjs");
const registry = require("../generated/registry.json");

const categoryId = "DIC_kwDOSWq5V84C8kA5";
const app = { uuid: "example-uuid", share_code: "EXAM", title: "Example", author: { github: "Developer" } };
const clone = (value) => JSON.parse(JSON.stringify(value));

function fixture() {
  const state = {
    context: {
      eventName: "discussion_comment",
      repo: { owner: "CardputerZero", repo: "cardputerzero.github.io" },
      payload: {
        action: "created",
        discussion: { node_id: "D_1", category: { node_id: categoryId } },
        comment: { node_id: "DC_1", user: { type: "User" } }
      }
    },
    registry: { apps: [clone(app)] },
    live: {
      id: "DC_1", url: "https://github.com/CardputerZero/cardputerzero.github.io/discussions/31#discussioncomment-1",
      isMinimized: false, deletedAt: null,
      author: { login: "Visitor", __typename: "User" }, replyTo: null,
      discussion: {
        id: "D_1", title: "EXAM · Example", locked: false,
        category: { id: categoryId }, repository: { nameWithOwner: "CardputerZero/cardputerzero.github.io" }
      }
    },
    pages: [{ nodes: [], pageInfo: { hasNextPage: false, endCursor: null } }],
    reads: [], writes: [], logs: []
  };
  state.run = () => notify({
    context: state.context, registry: state.registry,
    core: { info: (message) => state.logs.push(message) },
    github: { graphql: async (query, variables) => {
      if (query.includes("query NotificationComment")) {
        state.reads.push(variables);
        return { node: state.live, viewer: { login: "github-actions[bot]" } };
      }
      if (query.includes("query NotificationReplies")) {
        state.reads.push(variables);
        const index = variables.after ? Number(variables.after) : 0;
        return { node: { replies: state.pages[index] } };
      }
      assert.ok(query.includes("mutation NotifyDeveloper"));
      state.writes.push(variables.input);
      return { addDiscussionComment: { comment: { id: "DC_notice" } } };
    } }
  });
  return state;
}

test("new top-level comment mentions the registry developer in the same thread", async () => {
  const state = fixture();
  await state.run();
  assert.equal(state.writes.length, 1);
  assert.deepEqual(state.writes[0], {
    discussionId: "D_1", replyToId: "DC_1",
    body: `@Developer New app comment: [View comment](${state.live.url}).\n\n<!-- app-developer-notification:DC_1 -->`
  });
});

test("new reply notifies under the root comment and links to that reply", async () => {
  const state = fixture();
  state.live.replyTo = { id: "DC_root" };
  await state.run();
  assert.equal(state.writes[0].replyToId, "DC_root");
  assert.ok(state.writes[0].body.includes(state.live.url));
});

test("manual backfill reads and notifies only the requested older comment", async () => {
  const state = fixture();
  state.context.eventName = "workflow_dispatch";
  state.context.payload = { inputs: { comment_id: "DC_1" } };
  await state.run();
  assert.deepEqual(state.reads[0], { id: "DC_1" });
  assert.equal(state.writes.length, 1);
  assert.equal(state.writes[0].replyToId, "DC_1");
});

test("manual backfill retains category, author and duplicate checks", async () => {
  for (const change of [
    (s) => { delete s.context.payload.inputs.comment_id; },
    (s) => { s.live.discussion.category.id = "other"; },
    (s) => { s.live.discussion.repository.nameWithOwner = "other/repo"; },
    (s) => { s.live.author.login = "developer"; },
    (s) => { s.live.author.__typename = "Bot"; },
    (s) => { s.pages[0].nodes.push({ body: "<!-- app-developer-notification:DC_1 -->", author: { login: "github-actions[bot]" } }); }
  ]) {
    const state = fixture();
    state.context.eventName = "workflow_dispatch";
    state.context.payload = { inputs: { comment_id: "DC_1" } };
    change(state);
    await state.run();
    assert.equal(state.writes.length, 0);
  }
});

test("all current registry apps map to their own developer", async () => {
  for (const entry of registry.apps) {
    const state = fixture();
    state.registry = registry;
    state.live.discussion.title = `${entry.share_code} · ${entry.title}`;
    await state.run();
    assert.equal(state.writes.length, 1, entry.title);
    assert.ok(state.writes[0].body.startsWith(`@${entry.author.github} `), entry.title);
  }
});

test("UUID discussion titles and GitHub profile URLs are supported", async () => {
  const state = fixture();
  state.live.discussion.title = `cardputerzero-app:${app.uuid}`;
  state.registry.apps[0].author.github = "https://github.com/Developer/";
  await state.run();
  assert.ok(state.writes[0].body.startsWith("@Developer "));
});

test("edits, reactions, unrelated categories and bot events do no API work", async () => {
  for (const change of [
    (s) => { s.context.payload.action = "edited"; },
    (s) => { s.context.eventName = "discussion"; },
    (s) => { s.context.payload.discussion.category.node_id = "other"; },
    (s) => { s.context.payload.comment.user.type = "Bot"; }
  ]) {
    const state = fixture(); change(state); await state.run();
    assert.equal(state.reads.length, 0);
    assert.equal(state.writes.length, 0);
  }
});

test("live developer self-comments and bots are skipped case-insensitively", async () => {
  for (const author of [
    { login: "dEvElOpEr", __typename: "User" },
    { login: "other-bot", __typename: "Bot" },
    { login: "github-actions[bot]", __typename: "User" },
    null
  ]) {
    const state = fixture(); state.live.author = author; await state.run();
    assert.equal(state.writes.length, 0);
  }
});

test("deleted, minimized, locked or moved comments cannot notify", async () => {
  for (const change of [
    (s) => { s.live = null; },
    (s) => { s.live.deletedAt = "2026-11-13T12:00:00Z"; },
    (s) => { s.live.isMinimized = true; },
    (s) => { s.live.discussion.locked = true; },
    (s) => { s.live.discussion.category.id = "other"; },
    (s) => { s.live.discussion.id = "other"; },
    (s) => { s.live.discussion.repository.nameWithOwner = "other/repo"; },
    (s) => { s.live.url = "https://example.com/comment"; }
  ]) {
    const state = fixture(); change(state); await state.run();
    assert.equal(state.writes.length, 0);
  }
});

test("missing or ambiguous app identities never guess a developer", async () => {
  for (const change of [
    (s) => { s.live.discussion.title = "Example"; },
    (s) => { s.live.discussion.title = "UNKNOWN · Example"; },
    (s) => { s.registry.apps.push(clone(app)); },
    (s) => { s.registry.apps[0].author = { display_name: "Developer" }; }
  ]) {
    const state = fixture(); change(state); await state.run();
    assert.equal(state.writes.length, 0);
  }
});

test("invalid profile values cannot inject extra mentions or teams", async () => {
  for (const github of [
    "", "@Developer", "dev @someone", "org/team", "-dev", "dev-", "dev--name", "x".repeat(40),
    "https://example.com/Developer", "https://github.com/org/repo", "https://github.com/Developer?x=y",
    "https://user@github.com/Developer", "https://github.com/Developer#extra"
  ]) {
    const state = fixture(); state.registry.apps[0].author.github = github; await state.run();
    assert.equal(state.writes.length, 0, github);
  }
});

test("reruns find an existing notification beyond the first 100 replies", async () => {
  const state = fixture();
  state.pages = [
    { nodes: Array.from({ length: 100 }, () => ({ body: "Other reply", author: { login: "Visitor" } })),
      pageInfo: { hasNextPage: true, endCursor: "1" } },
    { nodes: [{ body: "<!-- app-developer-notification:DC_1 -->", author: { login: "github-actions[bot]" } }],
      pageInfo: { hasNextPage: false, endCursor: null } }
  ];
  await state.run();
  assert.equal(state.writes.length, 0);
  assert.equal(state.reads.length, 3);
});

test("a visitor's forged marker cannot suppress the developer notification", async () => {
  const state = fixture();
  state.pages[0].nodes.push({ body: "<!-- app-developer-notification:DC_1 -->", author: { login: "Visitor" } });
  await state.run();
  assert.equal(state.writes.length, 1);
});

test("a different comment in the same thread gets its own notification", async () => {
  const state = fixture();
  state.pages[0].nodes.push({ body: "<!-- app-developer-notification:DC_other -->", author: { login: "github-actions[bot]" } });
  await state.run();
  assert.equal(state.writes.length, 1);
});
