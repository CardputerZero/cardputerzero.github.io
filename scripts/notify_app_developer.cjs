// Called by notify-app-developer.yml. Comment content is never executed.
const CATEGORY_ID = "DIC_kwDOSWq5V84C8kA5";

function developerLogin(value) {
  let login = String(value || "").trim();
  if (/^https?:\/\//i.test(login)) {
    try {
      const url = new URL(login);
      if (url.hostname !== "github.com" || url.username || url.password || url.port || url.search || url.hash) return "";
      login = url.pathname.replace(/^\//, "").replace(/\/$/, "");
    } catch {
      return "";
    }
  }
  // Only individual GitHub logins; no teams, display names or arbitrary URLs.
  return /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(login) && !login.includes("--") ? login : "";
}

function findApp(apps, title) {
  // The current Giscus mapping is "CODE · Title". Also recognize discussions
  // created with the earlier UUID mapping, without relying on localized names.
  const matches = apps.filter((app) => title === `cardputerzero-app:${app.uuid}` ||
    (String(app.share_code || "").trim() && title === `${String(app.share_code).trim().toUpperCase()} · ${app.title || app.app_name || app.download?.package || ""}`));
  return matches.length === 1 ? matches[0] : null;
}

module.exports = async function notifyAppDeveloper({ github, context, core, registry }) {
  const { action, discussion, comment } = context.payload;
  const skip = (reason) => core.info(`Developer notification skipped: ${reason}`);
  if (context.eventName !== "discussion_comment" || action !== "created" ||
      discussion?.category?.node_id !== CATEGORY_ID || !comment?.node_id ||
      comment.user?.type === "Bot") return skip("not a new human app comment");

  // Read the live comment so a deleted, hidden or moved comment isn't notified
  // using stale webhook data. The query also finds the thread's top-level ID.
  const { node: live, viewer } = await github.graphql(`
    query NotificationComment($id: ID!) {
      viewer { login }
      node(id: $id) {
        ... on DiscussionComment {
          id url isMinimized deletedAt
          author { login __typename }
          replyTo { id }
          discussion {
            id title locked
            category { id }
            repository { nameWithOwner }
          }
        }
      }
    }
  `, { id: comment.node_id });
  const currentDiscussion = live?.discussion;
  const repository = `${context.repo.owner}/${context.repo.repo}`;
  if (!live?.id || live.deletedAt || live.isMinimized || currentDiscussion?.locked ||
      currentDiscussion?.id !== discussion.node_id || currentDiscussion?.category?.id !== CATEGORY_ID ||
      currentDiscussion?.repository?.nameWithOwner?.toLowerCase() !== repository.toLowerCase()) {
    return skip("comment no longer available in this app category");
  }
  const app = findApp(registry.apps || [], currentDiscussion.title);
  const developer = developerLogin(app?.author?.github);
  if (!developer) return skip("no unique app with a valid developer GitHub account");
  if (!live.author || live.author.__typename === "Bot" ||
      live.author.login.toLowerCase() === developer.toLowerCase() ||
      live.author.login.toLowerCase() === viewer.login.toLowerCase()) return skip("developer or bot comment");

  const commentUrl = new URL(live.url);
  if (commentUrl.origin !== "https://github.com" ||
      !commentUrl.pathname.toLowerCase().startsWith(`/${repository.toLowerCase()}/discussions/`)) {
    return skip("unexpected comment URL");
  }
  // GitHub Discussions supports one reply level. Replies to replies must use
  // the original top-level comment, with a link to the triggering reply.
  const replyToId = live.replyTo?.id || live.id;
  const marker = `<!-- app-developer-notification:${live.id} -->`;
  let after = null;
  do {
    const { node: thread } = await github.graphql(`
      query NotificationReplies($id: ID!, $after: String) {
        node(id: $id) {
          ... on DiscussionComment {
            replies(first: 100, after: $after) {
              nodes { body author { login } }
              pageInfo { hasNextPage endCursor }
            }
          }
        }
      }
    `, { id: replyToId, after });
    if (!thread?.replies) return skip("thread no longer available");
    if (thread.replies.nodes.some((reply) => reply.author?.login?.toLowerCase() === viewer.login.toLowerCase() && reply.body.includes(marker))) {
      return skip("already notified for this comment");
    }
    after = thread.replies.pageInfo.hasNextPage ? thread.replies.pageInfo.endCursor : null;
  } while (after);

  await github.graphql(`
    mutation NotifyDeveloper($input: AddDiscussionCommentInput!) {
      addDiscussionComment(input: $input) { comment { id } }
    }
  `, {
    input: {
      discussionId: currentDiscussion.id,
      replyToId,
      body: `@${developer} New app comment: [View comment](${commentUrl.href}).\n\n${marker}`
    }
  });
  core.info("Developer notification posted.");
};
