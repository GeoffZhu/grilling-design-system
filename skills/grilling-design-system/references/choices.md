# Preview links and native single-select questions

## Publish the planned visual choice

Select the next high-impact unresolved node from decision-tree.md. Publish two comparable specimens with reviewType: choice. Use only enough UI to make the visual difference clear. Keep HTML free of feedback forms, checkboxes for choosing a design, and decision buttons; controls within specimens remain interactive.

Give clickable links using the actual server address and option IDs:

[Compare treatments](http://127.0.0.1:4310/) · [Option A](http://127.0.0.1:4310/#option-a) · [Option B](http://127.0.0.1:4310/#option-b)

Describe each visible difference in one short sentence. Use the user's language in links and questions. A recommendation may explain the visual reason, but cannot stand in for an answer.

## Use the agent's available question tool

Inspect the host's tools and their current availability. Call its native question tool with exactly one single-select question. AskUserQuestion is a conceptual name here; a host may expose request_user_input, request_user_input_async, or another equivalent. Use only the real tool's schema and obey its mode restrictions. Set multiSelect to false only when that field exists; otherwise use its native single-select options. Never send a multi-select request or invent fields.

For a host with an AskUserQuestion-compatible schema:

~~~json
{
  "questions": [{
    "header": "Corners",
    "question": "Which button and field corners do you prefer?",
    "multiSelect": false,
    "options": [
      {"label": "A: Rounded", "description": "Rounder corners on the same controls."},
      {"label": "B: Squared", "description": "Straighter corners on the same controls."}
    ]
  }]
}
~~~

For a host with request_user_input_async and string options, adapt to that schema:

~~~json
{
  "questions": [{
    "title": "Which button and field corners do you prefer?",
    "options": ["A: Rounded", "B: Squared"]
  }]
}
~~~

Use the same labels and order as the published specimens. Include links in the tool text where supported, and always send them in the conversation. Call the tool in the same response cycle as the links. If no usable question tool exists, briefly state that and collect a single A or B answer in chat. Do not build a substitute HTML form or claim a popup appeared.

## Record the actual response

Map the submitted label to one published ID. Submit via the running studio:

~~~json
{
  "roundId": "actual-current-round-id",
  "optionIds": ["a"],
  "action": "select",
  "feedback": "",
  "source": "ask-user-question"
}
~~~

~~~sh
node "$SKILL/scripts/studio.js" decide --session "$PROJECT/session" --url http://127.0.0.1:4310 --decision "$PROJECT/decision.json"
~~~

- One option without changes: select.
- Written changes or a request to combine parts: revise with the actual feedback and zero or one option ID. Never submit two IDs. Show the revised result before accepting it.
- Cancel, silence, timeout, or an unsubmitted default: submit nothing; leave the round pending.

Use source: chat for chat responses and ask-user-question for native tool answers. Never fabricate an answer, edit session.json, or retry a stale response against a different round.

## Derived checkpoints and the full-page presentation

For a checkpoint resolved by existing evidence, publish reviewType: derived with one candidate and a derivation rationale. Publishing advances automatically and records source: agent-derived, not a user choice. Do not ask a redundant question.

At preview, publish reviewType: presentation with exactly one integrated design. Link its full Desktop and Mobile views. Invite corrections or explicit confirmation in chat without A/B alternatives or an approve/revise option popup. Record confirmation as approve with the sole ID and source: chat; record corrections as revise. Merely opening the page is not approval.
