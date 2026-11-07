# Collaborative planning guide

Use this guide when starting or continuing a system map. Use [the README](../README.md) for installation, helper commands, viewer controls, and verification limits.

## 1. Continue the shared plan

Maintain one authoritative `.plan.json` source per conversation. Reuse the existing source and preserve agreed decisions. For a new conversation, select a unique descriptive name; add a suffix if necessary. Keep private plans outside version control.

Read the goal, decisions, open questions, and `planningPosition` before proposing changes. Inspect relevant evidence when explaining an existing system. A label alone does not establish what was agreed or implemented. For large plans, load the current part and nearby connections rather than every page.

If only an older drawing exists, inspect its relevant pages before creating a source. Preserve meaning and make uncertainty explicit. Do not silently replace an established plan.

Record four different kinds of knowledge clearly:

- **Verified fact:** supported by inspected evidence, with a source reference.
- **Agreed plan:** explicitly accepted behavior, not proof of implementation.
- **Proposal:** a suggestion awaiting acceptance.
- **Unknown:** missing information; never invent a substitute.

## 2. Lead the conversation forward

Answer the current question before moving on. A question requesting understanding does not itself change the design. A clear requested change does: update the source and preserve unrelated decisions.

After agreement, finish that decision and choose the next material unresolved part from the whole goal. Explain its job, suggest a grounded approach, and ask one concrete choice when necessary. Offer two to four meaningful alternatives, not a list of technical chores.

Do not repeatedly interview the user about settled points. Do not merely report “saved” and make the user find the next issue. Keep a small record like this:

```json
"planningPosition": {
  "currentPart": "Check available copies",
  "settledPoints": ["Availability checking does not create a loan."],
  "nextMaterialDecision": "How should unavailable books be handled?"
}
```

Minor implementation defaults may stay labeled proposals without blocking all discussion. Important decisions about permissions, privacy, cost, or evidence need explicit agreement. A short “okay” accepts only the clear proposal just shown; it does not authorize unrelated work.

If confusion appears, return to the simplest supported explanation. Do not repeat the same explanation more forcefully. If nothing material remains unresolved, summarize readiness and offer review or separately authorized implementation. Planning is not product-building permission.

### Example: progress rather than an interview

The user agrees that unavailable books should enter a waiting list. Record that decision. If notification timing remains unresolved, explain what notification does, propose notifying when a copy becomes available, and ask one concrete timing choice. Do not ask again whether a waiting list is wanted. Do not invent contact details or permission to send messages.

## 3. Give each part one job

Store part records in `partRecords`, keyed by `pageId/nodeId`. Use `main` for the root page. This avoids collisions when node ids repeat across pages.

| Field | Meaning |
| --- | --- |
| `purpose` | The part's one job. |
| `input` | What arrives, including required information. |
| `action` | What work happens. |
| `output` | What result leaves. |
| `rules` | Agreed conditions, permission checks, and failure behavior. |
| `next` | Who receives the result and what is transferred. |
| `boundary` | Work belonging to other parts, excluded here. |
| `basis` | Evidence, an agreed decision, a labeled proposal, or an explicit unknown. |

Example record:

```json
"main/CHECK": {
  "purpose": "Determine whether a copy is available.",
  "input": "Requested book identifier.",
  "action": "Read saved copy records and count available copies.",
  "output": "Available-copy count.",
  "rules": ["Copies on loan do not count as available."],
  "next": "main/AVAILABLE receives the count.",
  "boundary": "Does not record a loan or hand over a book.",
  "basis": "Illustrative proposal, not verified implementation."
}
```

A store holds information. An action reads or changes it. Draw these separately when their distinction matters; do not label storage as though it performs work. A waiting state is not automatically another processing step.

Trace one concrete example through the connected parts. A book request supplies an identifier; checking returns a count; the availability decision reads that count. Check that every result fits its recipient's input. Unanswered behavior remains unknown until settled, not imaginary machinery inserted between boxes.

## 4. Source format and navigation

This small example illustrates structure, not an agreed or built system:

```json
{
  "title": "Availability example",
  "goal": "Return the available-copy count for a requested book.",
  "nodes": [
    {"id":"CHECK","label":"Check copies","shape":"step","status":"planned","detail":"CheckCopies"}
  ],
  "links": [],
  "steps": [
    {
      "id":"CheckCopies",
      "label":"Inside: check copies",
      "nodes":[
        {"id":"COPIES","label":"Saved copies","shape":"store","status":"planned"},
        {"id":"COUNT","label":"Count available copies","shape":"step","status":"planned"}
      ],
      "links":[{"from":"COPIES","to":"COUNT","label":"matching copy records"}]
    }
  ],
  "partRecords": {},
  "decisions": [],
  "openQuestions": [],
  "planningPosition": {}
}
```

Complete the part records for a working plan. The helpers preserve the source separately; the generated navigation manifest is not a copy of its planning notes.

### Graph fields

- `nodes`: records containing `id`, `label`, `shape`, `status`, and optional `detail`.
- `links`: records containing `from`, `to`, and a nonempty `label`. Both ends belong to the same page.
- `steps`: a flat list of detail pages, each containing `id`, `label`, `nodes`, and `links`.
- Root `nodes` and `links` form the page with reserved id `main`.
- Shapes: `start`, `step`, `decision`, `store`, `external`.
- Statuses: `built`, `planned`, `broken`, `changed`. Write shape and status explicitly for clarity.

Use identifiers beginning with a letter, followed by letters, digits, or underscores. Avoid `end` as a node id. Page ids must be globally unique, including when compared without letter case. Node ids need only be unique within their page.

`detail` is an explicit destination page id, not a Boolean flag or implied naming convention. Pages may link to deeper pages through their own nodes' `detail` fields. All detail pages remain entries in the flat `steps` list. Every page must be reachable from `main`; detail cycles are rejected.

Only explicit detail links create navigation. Reusing a node id elsewhere does not create a relationship. There is no top step-button bar. A child page explains its parent box's job, not an unrelated task. Its inputs, results, and boundary must match that parent's record.

The builder emits one Mermaid `.mmd` file per page and one `.json` navigation manifest per source plan. It does not generate SVG files. The browser loads Mermaid 11.4.1 from jsDelivr and renders the drawing; internet access is required.

## 5. Keep the graph about behavior

Prefer top-to-bottom flow and roughly five to nine boxes per page; fewer are fine. Use short plain labels. Arrows name transferred information or the condition selecting a branch. Put deeper behavior in the appropriate child page.

Keep questions, design alternatives, and unresolved choices in chat and plan metadata, not process boxes. Unchosen tools and notes about removed features are not flow steps. A real business condition may appear as a branch, but commentary about the planning process should not.

Status appearance is supplied by the builder:

- `built`: green; use only with evidence of implementation.
- `planned`: dashed grey; includes proposed behavior, distinguished through planning notes.
- `broken`: red; describe the evidence for the failure.
- `changed`: thick blue; use deliberately and explain its basis.

A status color is not proof. Preserve the distinction between an accepted plan and working software.

## 6. Save, build, and check

Edit the source only. Use the commands in [the README](../README.md#try-the-local-map-helpers) to rebuild and serve the generated output locally. Do not hand-edit generated drawings or manifests.

For a clear plan change:

1. Save the source while preserving unrelated decisions.
2. Run the builder and address reported structural failures.
3. Inspect affected connections and parent/child meaning.
4. If browser access is available, inspect rendering and actual navigation.
5. Report what changed and what remains unverified.

A question alone does not require redrawing. A successful build does not establish a correct system design. Helper command-line tests check schema constraints and generated output only. They do not prove browser layout, real mouse behavior, or reliable planning inside DeepSeek Harness. If you cannot inspect the browser, say so. Never claim a click destination or interface behavior was verified without checking it.

## Sources

Planning principles are adapted and restated, not copied wholesale from an external skill package:

- [Superpowers: brainstorming](https://github.com/obra/superpowers/blob/main/skills/brainstorming/SKILL.md): collaborative design and explicit agreement before implementation.
- [Anthropic: effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents): load relevant context rather than everything.
- [Anthropic: demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents): distinguish limited checks from broader behavioral evidence.

These links acknowledge external ideas. They do not imply endorsement, bundled external text, or cross-harness certification.
