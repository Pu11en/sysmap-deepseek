# sysmap

Plan a system together, then explore its parts in a clickable map.

This repository provides an Agent Skills-format skill and small local map helpers. It is harness-independent: no particular assistant application is required. This is a portability goal, not certification across harnesses.

The skill preserves decisions, separates facts from proposals, and moves planning forward. It does not grant permission to build the planned product.

## Install the skill

Clone or copy this repository into your harness's discovered skill directory. Keep [SKILL.md](SKILL.md) at the skill folder's root, alongside [references/planning.md](references/planning.md). Keep the repository together if you want its helpers.

**Discovery paths differ between harnesses.** Check your harness's instructions for its supported location and whether it needs a restart. Do not assume one installation path works everywhere.

If your harness has no skills feature, explicitly ask the assistant to read [SKILL.md](SKILL.md), then follow its linked planning guide. Reading instructions manually does not prove full harness integration.

## Try the local map helpers

Use Node.js **20 or newer**. Run these commands from the repository root. No npm dependencies or installation step are required.

```sh
node scripts/build.mjs examples/library.plan.json --out output
node scripts/serve.mjs --dir output --port 4321
```

Open <http://127.0.0.1:4321/?map=library> while the server is running. Stop the foreground server with Ctrl+C.

The builder writes Mermaid text (`.mmd`) and a navigation manifest (`.json`) into the selected output directory. It does **not** write SVG images. The browser viewer loads **Mermaid 11.4.1 from jsDelivr**, requiring internet access, and renders the drawing in the browser.

Viewer controls:

- **Fit:** fit the current page to the viewing area.
- **Ctrl + scroll:** zoom the drawing.
- **Space + left-drag:** move around the drawing.
- **Click a linked box:** open its explicitly assigned detail page.
- **Back:** return through the page navigation history.

There is no top step-button bar. Nested pages are reached through explicit page metadata, not inferred from matching box names.

## Keep one source plan

For your own work, create one uniquely named `.plan.json` source per planning conversation. Choose a private local location outside the repository when appropriate. The new source plan becomes the authority; edit it, not generated files. Rebuild after changes.

The source format includes:

- `nodes`: `{id, label, shape, status, detail?}` records.
- `links`: `{from, to, label}` records.
- `steps`: `{id, label, nodes, links}` detail-page records.
- Planning notes: goal, decisions, open questions, part records, and planning position.

`detail` names an explicit destination page id. Page ids are globally unique; node ids are scoped to their page. Deeper navigation uses detail links between pages in `steps`, not nested array objects. See [the planning guide](references/planning.md) for constraints and examples.

## Privacy and verification

The helper serves map data on **localhost only**. Do not expose it through a public tunnel or shared proxy. Keep generated output and private local plans out of git. Review files before committing: a local-only server does not make committed plans private. The viewer contacts jsDelivr to download Mermaid; it is not an offline viewer.

Run the helper checks:

```sh
npm test
```

Eight automated checks passed on the author's Windows environment: validation, explicit navigation metadata, generated output, server access restrictions, and viewer script syntax. A separate headless Chrome check rendered the example and found a linked box. These checks do not establish correct planning, physical mouse behavior, or compatibility across harnesses. The multi-platform CI configuration is included but has not yet run on GitHub.

Optional browser render check, after setting `CHROME` to your Chrome or Chromium executable:

```sh
node tests/browser-smoke.mjs
```

This browser check also needs network access to jsDelivr. It does not exercise physical keyboard or mouse controls.

## Sources and license

Original repository work is offered under the [MIT license](LICENSE). External planning ideas are acknowledged in [the planning guide](references/planning.md#sources). Mermaid is an external browser dependency; its code is not bundled by the builder.

This documentation does not announce publication or an official hosting destination.
