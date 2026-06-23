# CardputerZero Hub User And Developer Agreement

This agreement applies to browsing, downloading, submitting, maintaining, or reviewing CardputerZero AppStore Hub apps, metadata, screenshots, binaries, comments, and related repository activity.

Submitting an app means you have read and agree to this agreement, the developer submission policy, privacy requirements, device-safety requirements, and maintainer review process.

## Scope

This agreement covers:

- App metadata.
- Source code.
- Debian packages and other binaries.
- Icons and screenshots.
- README files.
- Pull Requests.
- Issues.
- Discussions and comments.
- Registry files and generated static pages.

The Hub is a public directory and registry. Listing an app does not mean maintainers performed a complete security audit.

Users should check permissions, privacy behavior, source openness, download URL, checksum, risk flags, and app status before installing.

## Developer Responsibility

Developers must:

- Submit with a traceable GitHub identity.
- Have the right to distribute all code, assets, and binaries.
- Provide accurate and complete metadata.
- Disclose permissions, privacy behavior, network behavior, device access, and external hardware requirements.
- Keep download links and checksums current.
- Cooperate with maintainer review.
- Update metadata when app behavior changes.

## Metadata Truthfulness

Developers must not hide or misrepresent:

- Network access.
- File-system access.
- Microphone, camera, sensor, GPS, or keyboard use.
- Background services.
- External hardware.
- HDMI output.
- Account, payment, or cloud-service dependencies.
- Commercial-use restrictions.
- License restrictions.
- High CPU, storage, battery, or device risk.

If later versions change these behaviors, metadata must be updated before or alongside release.

## Privacy And Data

Apps that access, store, upload, or process user data must explain:

- What data is accessed.
- Why the data is needed.
- Whether data leaves the device.
- Who receives the data.
- How long data is retained.
- Whether users can delete the data.
- Whether data is shared with third parties.

Apps should follow data minimization. Unnecessary data collection can lead to rejection or delisting.

## Device Safety

Apps must not intentionally damage devices, system files, user data, external hardware, or network environments.

Apps that affect storage, system configuration, network, GPIO, sensors, power, audio, display, or external modules must clearly declare risks.

Maintainers may reject or delist apps that:

- Create undisclosed device instability.
- Can damage user data or system files without clear consent.
- Permanently change device behavior without a recovery path.
- Risk overheating or unreasonable hardware load.
- Hide high-risk behavior from users or reviewers.

## User Experience

Apps should meet a basic usability bar:

- They should launch through APPLaunch or the on-device AppStore.
- They should provide a recognizable app icon.
- GUI apps should fit the 320 x 170 CardputerZero screen.
- Users should not be trapped in the app.
- Normal startup should not crash immediately.
- UI should not be intentionally deceptive.
- Experimental, unfinished, or special-setup apps must be labeled clearly.

## Prohibited Content

The Hub may reject, hide, delist, or block apps involving:

- Illegal activity.
- Malware, spyware, credential theft, unauthorized persistence, or unauthorized access.
- Undisclosed or unreasonable user-data collection.
- Hate, harassment, stalking, or targeted abuse.
- Fraud, phishing, impersonation, or deception.
- Copyright, trademark, or license infringement.
- Weaponization, surveillance, targeting, or harm-oriented use.
- Hidden paid features or commercial restrictions.
- Hidden device or data-damage risks.
- Attempts to bypass registry review or installation policy.

This list is not exhaustive. Maintainers may reject submissions that create clear safety, legal, privacy, or community risk.

## Review, Listing, And Delisting

CI passing does not mean automatic listing. Maintainers may request changes, additional disclosures, manual demos, reproducible builds, or test logs.

Maintainers may set review status such as:

- `pending`
- `ci-passed`
- `approved`
- `needs-changes`
- `rejected`
- `deprecated`
- `blocked`

Apps can be delisted or blocked if they later violate this agreement, become unsafe, become unavailable, or receive credible complaints.

## Appeals

Developers may appeal rejection, delisting, or blocking through an Issue or Pull Request.

Appeals should include:

- App UUID and title.
- The decision being appealed.
- What changed or was misunderstood.
- Updated metadata, source, release, or evidence when relevant.

Maintainers should record final decisions when practical.

## Continuing Agreement

If you do not agree to this agreement, the submission policy, or maintainer review requirements, do not submit an app.

If an accepted app later violates these rules, maintainers may request changes, flag risk, delist, block, or retain audit records.

The agreement may evolve with the project. Material changes should be recorded publicly in the repository.
