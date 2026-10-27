# Raw request and run limits — INIT-0002

Received 2026-10-26 from the requester (repository owner, rortegalizardo),
relayed verbatim by the driving session. Committed before any triage synthesis
(`SKILL-triage-product-request` step 7). Nothing below is paraphrased.

## The request (verbatim)

"I want to mark some tasks as more important than others and see the important ones first when I list. Keep it simple."

## Run limits from the owner (verbatim, as relayed)

- Product, all phases combined: ≤ 400k tokens and ≤ 90 minutes wall. If you see you will cross either, stop at a clean checkpoint and report.
- Target 1 story; at most 3, and only if the requirements need them. The project is scaling profile S; the size rule (§9d) applies if you record size: small at INTAKE.
- Fill the gaps and make the technical/product choices yourself, recording them as PD- records. Escalate to the owner only genuine stakeholder or taste questions (escalation-policy §2 A), as Q- records with a recommendation and a default. If you have such a question, checkpoint and end your turn with a BLOCKED line naming the Q- file; the driving session relays it to the owner and resumes you with the recorded answer.
- This is a CLI with no visual surface: no design path.
- Acceptance criteria must be observable CLI behaviour (commands and expected output/exit codes), because verification will run the CLI against each criterion. No new test suites are required by product.
