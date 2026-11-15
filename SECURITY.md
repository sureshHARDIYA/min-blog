# Security Policy

This policy covers the website [skmukhiya.com.np](https://www.skmukhiya.com.np/) and the code in this repository. It follows the OWASP Vulnerability Disclosure guidance and the [security.txt](https://www.skmukhiya.com.np/.well-known/security.txt) standard (RFC 9116).

## Reporting a vulnerability

Please report security issues privately. Do not open a public issue or pull request for them.

1. **Preferred:** use GitHub's private reporting form: [Report a vulnerability](https://github.com/sureshHARDIYA/min-blog/security/advisories/new).
2. **Alternative:** email [itsmeskm99@gmail.com](mailto:itsmeskm99@gmail.com) with the subject "Security report: min-blog".

Reports are welcome in English or Norwegian.

### What to include

- The affected URL, file or workflow.
- The steps to reproduce it, with a proof of concept where possible.
- What an attacker could achieve (the impact), in your assessment.
- Any conditions it depends on, such as a specific browser or account state.

Please leave out personal data and secrets. If you came across any while testing, say so without including them.

## What to expect

- **Acknowledgement:** within 5 working days.
- **Assessment:** an initial verdict and severity within 10 working days.
- **Fix:** timing depends on severity. You will be told the plan and kept informed.
- **Credit:** with your permission, you will be credited in the advisory once the issue is fixed.

This is a personal project. There is no bug bounty or other payment.

## Coordinated disclosure

Please give a reasonable time to fix an issue before making it public. The default is 90 days from your report, or sooner once a fix is released. If you believe a shorter or longer period is needed, say so in the report.

## Scope

In scope:

- The website `www.skmukhiya.com.np` and its pages, feeds and API routes.
- The source code, build configuration and GitHub Actions workflows in this repository.
- Publicly served assets that belong to the site, such as article audio.

Out of scope:

- Vulnerabilities in third-party platforms and services the site runs on or links to. Report those to the vendor.
- Denial of service, load testing, and any volumetric or resource-exhaustion testing.
- Social engineering, phishing, or physical attacks.
- Automated scanner output without a demonstrated, reproducible impact.
- Missing hardening or best practices that have no practical security impact.
- Spam or abuse of contact and subscription forms.

## Testing rules

Research carried out in good faith under these rules is welcome, and no legal action will be pursued or supported against it:

- Only test against your own data and accounts.
- Use the minimum access needed to demonstrate the issue. Do not read, change, delete or keep data that is not yours.
- Do not degrade the site for other visitors, and do not run tests that could generate cost for the site owner.
- Stop and report as soon as you have confirmed the issue.
- Keep the details private until disclosure has been agreed.

## Supported versions

Only the current `main` branch and the live website are supported. Fixes are released there; older commits are not patched.
