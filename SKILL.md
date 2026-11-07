---
name: deepseek
description: Plan and explain systems in DeepSeek Harness through one saved, clickable map. Use for collaborative design, continuing planning, system explanations, or preparing an agreed plan for implementation. Keep questions in chat.
---

# System planning in DeepSeek Harness

This skill is for DeepSeek Harness. Keep the working map in its side browser and planning discussion in chat. Use the bundled viewer for a new setup; preserve existing map tools and source formats when continuing an established plan. It is an independent community skill, not an official DeepSeek product.

Create a shared understanding before drawing or building. The map shows system behavior; chat holds discussion. Planning never grants permission to implement the product.

Read [the planning guide](references/planning.md) before starting or resuming planning. It defines the source format, part records, navigation, and checks. For helper setup and commands, read [the README](README.md).

## Start from evidence

Continue the conversation's one saved `.plan.json` source. Read its goal, decisions, open questions, and current planning position. Inspect relevant project evidence before describing existing behavior. Load only the current part and its neighbors when the source is large.

For a new conversation, choose a unique descriptive source name. Never overwrite another conversation's plan. The source plan is authoritative; generated drawings and manifests are not editable plans.

Separate verified facts, agreed plans, unknowns, and unaccepted proposals. Cite evidence. Never infer an earlier decision from a vague label or invent facts to close a gap.

## Define meaning before drawing

For every part, record its one job, input, work, result, rules, next recipient, boundary, and evidence. Use the field names defined in the guide.

Keep storage separate from actions. Distinguish a waiting state from work. Connect each result to the next part's expected input. Walk one concrete example through the connected parts.

Use short labels and named arrows. Child pages explain their parent part. Connect them through explicit `detail` destinations, never matching names or guessed links. Keep tool choices, design questions, and commentary about removed features out of the graph.

## Collaborate and advance

Answer the current question first. Read settled decisions before asking another question. Clear requested changes update the source while preserving unrelated decisions. Agreement accepts only the proposal actually shown.

After settling a point, move toward the next meaningful unresolved part. Explain its purpose, propose a grounded approach, then ask one concrete choice when it changes the design. Do not turn planning into an interview or stop at “saved.”

Label minor defaults as proposals. Do not silently decide permission, privacy, cost, or factual evidence. Resolve confusion before advancing. If no material decisions remain, summarize readiness and offer review or separately authorized implementation.

## Check before claiming completion

After changing a plan, build it and inspect affected connections and child-page meaning. If browser access is available, inspect the drawing and navigation too. Report unavailable checks honestly.

Helper tests check structure and generated output, not system truth, physical mouse behavior, or reliable planning inside DeepSeek Harness.
