# sysmap

**Plan a system you can see—not a wall of text.**

Talk through an idea with your AI assistant. Keep decisions in one saved plan. Explore the system through clickable maps.

![How sysmap works: discuss an idea, save decisions, explore the map, and build only when approved](docs/images/planning-loop.svg)

[See the example](#see-it-in-action) · [Use the skill](#use-the-skill) · [Run the viewer](#run-the-example) · [Planning guide](references/planning.md)

## See it in action

### Start with the whole system

This example shows how borrowing a library book works. Follow the arrows from request to result.

![Actual sysmap viewer showing the complete library book-borrowing example, fitted to the screen](docs/images/overview.png)

### Click a box to understand its job

Click **Check available copies**. Its detail page shows only that part's work. **Back** returns to the whole system.

![Actual detail page for checking copies, showing the incoming request, saved copy records, count, result, and Back button](docs/images/detail.png)

*These are real screenshots of the included example, not interface mockups. Dashed boxes describe an illustrative plan—not a built library service.*

## What the skill helps with

| Instead of… | sysmap asks the assistant to… |
| --- | --- |
| Forgetting an earlier decision | Read and preserve the saved plan. |
| Asking endless small questions | Settle a point, then propose the next meaningful part. |
| Putting unrelated work inside a box | Define its job, inputs, results, and boundaries. |
| Opening a page because its letter happens to match | Use an explicit destination for each linked box. |
| Presenting suggestions as facts | Separate evidence, agreed plans, proposals, and unknowns. |
| Coding while you're still planning | Wait for separate implementation permission. |

These are planning instructions, not guarantees of model correctness. The helper checks catch structural mistakes; a sensible design still needs review.

## Use the skill

sysmap uses the **Agent Skills** format. It is portable by design, without a dependency on a particular AI application. Cross-harness compatibility has not been certified.

1. Clone or download [this repository](https://github.com/Pu11en/sysmap).
2. Put the repository in your assistant's supported skill directory, keeping its files together.
3. Ask the assistant:

> Use sysmap to help me plan this system. Show the system on a map, keep questions in chat, and don't build it yet.

**Skill locations differ between applications.** Follow your application's installation instructions. The entry point is [SKILL.md](SKILL.md); its detailed method is in [the planning guide](references/planning.md).

If your assistant has no skills feature, ask it to read those files explicitly. That does not prove full integration.

## Run the example

Requires **Node.js 20+** and a browser. No npm package installation is needed.

```sh
git clone https://github.com/Pu11en/sysmap.git
cd sysmap
node scripts/build.mjs examples/library.plan.json --out output
node scripts/serve.mjs --dir output --port 4321
```

Open **<http://127.0.0.1:4321/?map=library>**. Keep the server running; stop it with Ctrl+C. Choose another port if 4321 is already in use.

The builder writes Mermaid text and explicit navigation metadata. The browser loads **Mermaid 11.4.1 from jsDelivr** and renders the drawing. **Internet access is required.** It is not an offline viewer, and the builder does not write SVG files.

### Move around

| Control | Result |
| --- | --- |
| Click a linked box | Open that part's detail page. |
| Back | Return to the previous page. |
| Fit | Show the whole current page. |
| Ctrl + scroll | Zoom in or out. |
| Hold Space + left-drag | Grab and move the map. |
| Normal scroll | Move vertically; horizontal wheel movement also pans. |

Each page opens fitted. There is no row of step buttons taking space above the map. Questions stay in your assistant's chat.

## Your own system

Use **one uniquely named `.plan.json` source per planning conversation**. The assistant edits that source, not generated diagrams. Rebuild after plan changes.

The source contains:

- **Flow:** nodes, labeled connections, and detail pages.
- **Meaning:** each part's job, input, work, result, rules, and boundary.
- **Decisions:** what is agreed, proposed, unknown, and next to discuss.

See [the complete example](examples/library.plan.json) and [source format](references/planning.md#4-source-format-and-navigation). Detail links name exact pages; repeated local box ids do not create links.

Keep private plans outside this repository or otherwise out of version control. The server binds to localhost only. Do not expose it through a public tunnel. The viewer contacts jsDelivr for its drawing library.

## Checks and limits

```sh
npm test
```

Eight automated checks passed in the author's Windows environment. They cover plan structure, explicit navigation, output generation, server restrictions, and viewer script syntax.

Headless Chrome also rendered the example and its detail-page screenshots. **Physical mouse behavior, planning quality, and operation inside other AI applications remain unverified.** Multi-platform CI is included; check the repository's actual Actions results before claiming a platform passed.

<details>
<summary>Browser checks and reproducible screenshots</summary>

Set `CHROME` to your Chrome or Chromium executable, then run:

```sh
node tests/browser-smoke.mjs
node scripts/capture-docs.mjs
```

Both need network access. Screenshot capture recreates the two images above from the included example. These checks do not simulate a complete human planning session.

</details>

## License and sources

Original repository work is [MIT licensed](LICENSE). See [external software](THIRD_PARTY.md) and [planning sources](references/planning.md#sources). No affiliation or endorsement by another skill project or AI application is implied.
