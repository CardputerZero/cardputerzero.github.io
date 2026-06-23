# Developer Submission Policy

CardputerZero AppStore should be safe, transparent, and maintainable. Submitted apps must respect users, devices, maintainers, open-source licenses, and applicable law.

## Basic Requirements

Developers must:

- Submit accurate metadata.
- Explain the app purpose.
- Declare data access, device access, network access, and external hardware needs.
- Provide a working icon and preferably screenshots.
- Provide a valid `.deb` download URL and checksum.
- Declare source openness, license, and commercial-use restrictions.
- Respond in good faith to maintainer review.
- Update metadata when app behavior or download URLs change.

## Metadata Truthfulness

Apps must not hide or misrepresent:

- Personal data collection.
- Network behavior.
- Camera, microphone, GPS, sensors, filesystem, keyboard, or external hardware access.
- Background services.
- Paid features, commercial limits, or license restrictions.
- Known high CPU, storage, battery, or device risk.

If a later version changes behavior, metadata must be updated before or with the release.

## Privacy

Apps that access, store, upload, or process user data must explain:

- What data is accessed.
- Why it is needed.
- Whether it leaves the device.
- Who receives it.
- How long it is retained.
- Whether users can delete it.
- Whether third parties receive it.

Unnecessary data collection can lead to rejection or delisting.

## Device Safety

Apps must not intentionally damage devices, system files, user data, or external hardware.

Apps touching storage, system settings, network, GPIO, sensors, power, audio, display, or external modules must declare risks.

Reasons for rejection include:

- Undisclosed device instability.
- User data or system file damage without clear consent.
- Permanent behavior changes without a recovery path.
- Overheating or unreasonable hardware load.
- Hidden high-risk behavior.

## User Experience

Apps should meet a basic usability bar:

- Launch from APPLaunch or the on-device AppStore.
- Provide a recognizable icon.
- Fit the 320 x 170 screen.
- Provide a clear exit path.
- Not crash immediately on normal startup.
- Avoid deceptive UI.
- Mark experimental, unfinished, or special-setup requirements clearly.

## Prohibited Content

Maintainers may reject, hide, delist, or block apps involving:

- Illegal activity.
- Malware, spyware, credential theft, unauthorized persistence, or unauthorized access.
- Undisclosed or unreasonable data collection.
- Hate, harassment, stalking, fraud, phishing, impersonation, or deception.
- Copyright, trademark, or license infringement.
- Weaponization, surveillance, targeting, or harm-oriented use.
- Hidden paid features or commercial limits.
- Hidden device or data-damage risks.
- Attempts to bypass registry review or install policy.

This list is not exhaustive. Maintainers can reject submissions that create clear safety, legal, privacy, or community risk.

## Review And Appeals

Maintainers may request metadata changes, package changes, experimental labels, extra declarations, screenshots, test logs, reproducible builds, or manual demos.

Developers can appeal rejection, delisting, or blocked decisions through an issue or pull request. Appeals should include app UUID, title, requested decision change, remediation notes, and supporting evidence.
