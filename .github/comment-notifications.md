# App developer notifications

`notify-app-developer.yml` listens for new comments and replies in the Giscus
**App Comments** category. It replies in the same thread, mentioning the app's
`author.github` account from `generated/registry.json` and linking to the new
comment. This also covers comments posted directly on GitHub.

The store's shared Giscus theme hides replies authored by the GitHub Actions app account.
Threads containing only those replies also hide the reply area and reply count;
human replies and pagination controls remain available. The notification replies
remain on GitHub, so developer mentions and notification delivery are unchanged.

- Current `CODE · Title` discussion titles and the earlier
  `cardputerzero-app:UUID` titles are recognized. Ambiguous or unknown titles
  and missing/invalid GitHub accounts are skipped.
- Developer self-comments, bot comments, deleted/minimized comments and locked
  discussions are skipped. Edits and reactions do not trigger notifications.
- Each notification has a per-comment marker. Re-running a successful job does
  not post another notification, even in threads with more than 100 replies.
- The workflow uses the built-in `GITHUB_TOKEN` with `contents: read` and
  `discussions: write`; no additional secret or server is needed.

The workflow starts handling **new** comments when it reaches the repository's
default branch and Actions is enabled. Existing comments are not backfilled.
There may be a delay while GitHub schedules the job. Mention delivery and email
depend on the developer's GitHub notification settings.

To notify an older comment, manually run **Notify App Developer** with its GraphQL
comment node ID as `comment_id`. The same category, app, developer, author and
duplicate checks apply; no other existing comments are processed.

Run the mocked checks without posting any comments:

```sh
node --test scripts/check_comment_notifications.cjs
```

Live verification requires a new comment from a different human account on an
app discussion. Check the **Notify App Developer** Actions run and its reply.
To disable notifications, disable that workflow in GitHub Actions.
