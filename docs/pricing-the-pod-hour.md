# Pricing the pod hour

Working paper for discussion. Numbers below are a scale model, not a rate card. Swap in real rates, cost ratios, and measured productivity when we have them.

The repo already states the shift: see the work in pod hours, for efficiency, speed, value, and quality. This paper says what a pod is, what a pod hour carries, and how a customer still wins when we stop billing the shrinking man hour.

## The problem

99x sells software product engineering. The commercial meter is still the man hour: estimate the hours, multiply by a rate, invoice the timesheet.

A pilot working with agents changes what that hour is. The agents in use today are AI skills running inside an IDE as copilots, written and maintained by 99x experts. The same outcome takes fewer hours, so a timesheet invoice falls. Each remaining hour produces more, because the agents are in it, and the customer does not own those skills.

The cost of the agents never appears on the invoice. The license is the small part. The large part is expert time spent writing and maintaining the skills, and the judgment that decides where a copilot is allowed to act.

If the man hour keeps carrying the whole price, the customer receives more than they used to and 99x earns less for bringing it. Raising the day rate on the same timesheet does not fix this. Procurement reads it as a rate-card increase, and the invoice still shrinks every time the estimate shrinks.

Autopilot spend is a different subject. It is not part of the pod hour, and this paper does not try to recover it there.

## What a pod is

A pod is one human pilot with one or more agents.

The agents are copilot skills running inside the IDE with the pilot. They are not extra people, and they are not extra hours. What we show customers is [Copilots Studio](https://xianix-team.github.io/copilots-studio/): two libraries, one way of working.

- **IDE Expert Agents** ([ide-expert-agents](https://github.com/xianix-team/ide-expert-agents)). Sixty-two specialist agents across twelve stores: pre-sales, analysis, UX, architecture, coding, QA, DevOps, compliance, data platforms, delivery process, delivery management, and feature builders. One MCP server exposes each agent as a slash command in Claude Code, Cursor, and GitHub Copilot. Every agent is rated `high`, `medium`, or `low` on two fields: `autonomy` (how much of the task it carries once scope is agreed) and `human-judgement` (how much expert judgement the output needs before anyone acts on it).
- **Intent Delivery Framework** ([ai-dlc-base](https://github.com/xianix-team/ai-dlc-base)). The delivery operating system inside AI-DLC. Inception, build, operate, improvements. Six framework agents, twenty skills, installed by a conversation with the team rather than stamped from a template. Expert agents slot into that loop. The framework is how the pod works. The expert agents are who the pilot calls.

A runbook, such as the pre-sales pipeline or the data-platform cycle, coordinates several agents and is still one pod. The agents in it are not priced one by one. Two pilots running that runbook together are a cross-over.

The studio invites a customer to run an agent themselves. The pod hour is not a fee for the files. It is the pilot's delivered hour, with those agents and the framework in it, at a rate that follows the ratings on the agents actually used.

One hour delivered by that unit is a pod hour.

An engagement can use several pods. Each pod still has one pilot. Pods that work apart are priced apart: two pilots on separate work are two pod hours, and the profile rates add. Adding another agent to the same pilot does not add another hour. It changes the rate.

Pods that merge on the same work are a cross-over. The merged hour has its own rate, below the sum of the member rates.

## What the pod hour carries

The price of a pod hour carries:

1. The pilot.
2. The agents in that pod: the copilot skills running with the pilot, and a contribution toward the experts who keep those skills current.
3. A margin that stays intact when the estimate shrinks.

It does not carry autopilot expenses. Autopilot build, run cost, and autopilot-only delivery stay outside this rate. If an engagement uses autopilots, that spend is quoted on its own and is not folded into the pilot's hour.

The customer is buying the pilot's delivered hour with those agents in it. They are not buying leftover labor after the tools have finished, and they are not paying autopilot costs through the pod hour.

## Recommended model

Bill the pod hour. Package it as a committed pod month when the pilot stays. Keep classic hourly billing where the customer wants a person without 99x agents.

### The rate follows the pod

There is no single pod-hour rate. The rate follows four things, named on the estimate before the work starts:

1. **Stack.** Which stores and which framework skills are in the hour. A QA audit and a pre-sales pipeline are different hours. The Intent Delivery Framework in the hour is part of the stack, not a separate surcharge.
2. **Number of agents.** How many expert agents are active with the pilot, including the agents a runbook lines up. More agents raise the rate. They do not add hours, and a runbook is not the sum of its agents' rates.
3. **Human judgement.** The `human-judgement` rating of the hour: `low`, `medium`, or `high`, in the sense already published on the agents. `high` means the output is a decision, commitment, or risk a qualified person must own: an estimate, a proposal, an architecture, a compliance position, a UAT. That sets the classic rate the pod hour is built on. A high-judgement hour was already worth more than a low-judgement hour before any agent was added.
4. **Autonomy.** The `autonomy` rating: `low` (the pilot drives), `medium` (the agent stops at checkpoints), or `high` (the agent runs the task and hands back a result). Higher autonomy is a higher rate and a larger cut in hours. It does not lower the judgement rating. An estimate can be high autonomy and high human-judgement at once: the agent drafts it, the pilot owns the number. Autonomy is a property of the pod hour, not an autopilot charge. Autopilot expenses stay outside the rate.

Stack, agent count, and autonomy are what make the hour reduction believable. Human judgement sets the unassisted base. The two ratings are independent, which is how the agents are already labeled. A flat rate would hide both.

### Price from a shared surplus

Start from a baseline both sides already understand: the classic estimate at the classic rate for that judgement.

- Baseline price `B` = classic man hours × classic rate for that judgement.
- Productivity `p` = the share of those hours this profile removes, for the same outcome. One pod hour is one pilot hour. `p` belongs to the profile. Low autonomy, one agent, a small `p`. Medium autonomy inside the Intent Delivery Framework, with a few agents, a larger one. High autonomy, as on a scan or an audit that returns a finished result, the largest. High human-judgement does not by itself enlarge `p`.
- Surplus `S` = `B × p`. That surplus exists because the agents are in the pod.

Split the surplus. The customer keeps a share as a lower total. 99x keeps a share so the agents stay funded when the hours fall.

With a keep share `k` for 99x:

`Price = B × (1 − p + k × p)`

`Pod-hour rate = classic rate for that judgement × (1 − p + k × p) / (1 − p)`

At `k = 0.50`, the customer pays `1 − p / 2` of the classic total. The rate rises with `p`, and the total falls with `p`. Higher autonomy costs more per hour and less for the outcome. Higher human-judgement lifts the base, so a decision the pilot must own stays expensive even when autonomy is low.

The worked profiles use `k = 0.50`. That keep share is still a discussion setting, not policy.

Sales do not recompute this on a timesheet. We publish a short list of profiles. Each profile fixes the four factors, the `p` we will stand behind, and the rate. A quote picks a profile and estimates pod hours. Not every combination needs a published row. We publish the ones we will actually staff.

Show the customer the profile rate beside the two totals. The unit they buy is the pod hour. Internally we still split each pod hour into pilot recovery and agent recovery. Autopilot cost is not a line in that split.

### Cross-over pods

A cross-over is two or more pods merged on the same work, so they share a stack, a pool of agents, and one judgement for that work. The customer gets one optimized rate for the merged hour. Member profile rates are not added on top of each other.

The merged hour is priced from what is actually in it:

1. **Once:** the stack, the distinct agents, the judgement the work needs, and the autonomy those shared agents bring. That is one profile rate, on the pilot who holds that judgement.
2. **For each other pilot:** the classic rate for the judgement that pilot actually provides. They join the shared stack. They do not bring a second copy of it.

`Cross-over rate = merged profile rate + classic judgement rate of each other pilot`

Pooling agents can lift the merged profile. Two delivery pods, each on a domain stack, can become one hour with a wider agent pool and higher autonomy. The merged profile then steps up, and that richer hour is still priced once. The rate is for a better instrument, and it stays below the sum of the standalone rates.

What does not happen:

- A pilot's judgement is not downgraded to make the merge cheaper. A pilot who is owning a high-judgement output is added at the high-judgement classic rate.
- A runbook stays one profile when one pilot runs it. It becomes a cross-over only when a second pilot joins that same work.
- Pods on different work are not a cross-over. Their profile rates add.
- Autopilot expenses stay outside the cross-over rate, as they do for a single pod.

### The pod month

The default sale for a pilot who stays is a month of one pod: a block of pod hours, one named pilot, and one named profile. The profile fixes the stack, the agent count, the judgement, and the autonomy.

**Fixed scope.** The estimate is written in pod hours. The price uses the surplus split. The customer sees three numbers before they start: classic total, proposed total, and expected calendar.

**A pilot who stays the month.** The committed hours are billed at that profile's rate, not cut by `p`. The pilot is still delivering those hours. The customer's gain is how much ships in them. Cutting the month by the productivity factor, and still including the agents, gives the surplus away twice. A change of stack, agent count, judgement, or autonomy is a change of profile, and the rate changes with it.

Adding a pod on separate work adds a profile rate. Merging that pod into the work already underway reprices the hour as a cross-over. It does not mean more humans inside a single pilot's pod, and it does not mean stacking both profile rates.

### What stays on the man hour

A person the customer directs, without 99x agents, stays on the classic rate card. Those estimates do not assume 99x skills. Mixing agent-backed hours and unassisted hours on one timesheet makes the pod hour impossible to defend.

## Worked example

Four profiles, using the ratings the agents already publish. The rates and the `p` values are a scale model. Delivery has to replace `p`, and finance has to replace the classic rate for each judgement level.

`k = 0.50` in every row. Customer pays `1 − p / 2` of the classic total for that judgement. Pod-hour rates are rounded to the nearest whole number. Classic rate in this scale: low judgement 80, medium 100, high 140.

| Profile | What it matches in the catalog | Judgement | Autonomy | `p` | Classic rate | Pod-hour rate | Customer pays |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: |
| Discovery | Pre-sales, one agent, pilot drives (`discovery-interview`) | high | low | 0.10 | 140 | 148 | 95% |
| Delivery bolt | Intent Delivery Framework plus two or three coding and QA agents | medium | medium | 0.30 | 100 | 121 | 85% |
| Specialist audit | One QA agent that returns a finished result (OWASP scan, accessibility audit) | low | high | 0.45 | 80 | 113 | 77.5% |
| Owned build | Architecture, compliance, or an estimate the pilot must own, high autonomy | high | high | 0.45 | 140 | 197 | 77.5% |

Reading across: human judgement lifts the classic base. Autonomy, stack, and agent count lift `p`, which lifts the pod-hour rate and lowers the customer's total. Discovery stays close to the unassisted expert hour, because the agent facilitates and the pilot owns the conversation. The specialist audit is a cheaper outcome than the classic low-judgement hour because the agent runs the task. The owned build is the most expensive hour, and still a cheaper outcome than an unassisted expert, because autonomy is high and the judgement base was already 140. High autonomy did not pull that base down.

The delivery bolt, worked through on one outcome:

- Classic rate for medium human-judgement = 100 per man hour.
- Pilot delivery cost = 60 per hour. Agent upkeep is paid from the kept surplus, not given a fake line here. Autopilot expenses are excluded from the price and from this cost.
- Same outcome. Classic estimate = 1,000 man hours.
- `p = 0.30`. The delivery pod completes it in 700 pod hours.
- `k = 0.50`.

| | Classic man hours | Naive: fewer hours, same rate | Pod hour, surplus split |
| --- | ---: | ---: | ---: |
| Hours | 1,000 | 700 | 700 pod hours |
| Price | 100,000 | 70,000 | 85,000 |
| Rate the customer sees | 100 per man hour | 100 per man hour | 121 per pod hour |
| Pilot cost | 60,000 | 42,000 | 42,000 |
| Margin before agent upkeep | 40,000 | 28,000 | 43,000 |
| Customer vs classic | — | pays 70% | pays 85% |
| Calendar vs classic | — | 70% | 70% |

The delivery rate is `100 × 0.85 / 0.70 = 121`. Same formula as the other rows: classic rate for that judgement, enriched by the `p` that stack, agent count, and autonomy can support.

Reading it from each side:

- The customer pays 85,000 instead of 100,000, and the work is delivered in 700 pod hours instead of 1,000. They keep half the surplus, and they get the time back.
- Billing the 700 hours at the old rate invoices 70,000 and drops margin from 40,000 to 28,000. The agents that created the saving are unpaid.
- On the pod hour, margin before agent upkeep is 43,000. The 21 above the classic rate is the kept half of the surplus. Skill upkeep comes out of that 21. Autopilot spend does not.

A retained month uses the profile that was sold, on a full block of hours. On the delivery bolt, 140 pod hours in the month are about 17,000, against 14,000 for an unassisted medium-judgement month. Those hours are aimed at the output that used to take about 200 unassisted hours. The month costs more than the matching unassisted month. The fixed-scope quote is the one that comes in below the classic total.

### Two pods, priced as a cross-over

Same scale. Two ways to buy the same merged hour.

| | Stacked profiles | Cross-over |
| --- | ---: | ---: |
| What is billed | Delivery bolt 121 + delivery bolt 121 | Shared delivery bolt 121 + second pilot at the medium-judgement classic rate 100 |
| Rate for the hour | 242 | 221 |

The 21 that comes off is the second copy of the agent enrichment. The stack and the agents are in the hour once.

Where the merge also changes the instrument, take two pods that would each have been an owned build if staffed alone:

| | Stacked profiles | Cross-over |
| --- | ---: | ---: |
| What is billed | Owned build 197 + owned build 197 | One owned-build profile 197, shared, + second pilot at the medium-judgement classic rate 100 |
| Rate for the hour | 394 | 297 |

The hour still has the shared stack, the pooled agents, high human-judgement once, and high autonomy once. The second pilot is paid for. The second copy of that stack is not. 297 against 394 is the optimized rate.

If the second pilot is also owning a high-judgement output, they are added at 140, not at 100. The cross-over rate becomes 337, still below 394. Judgement that is really there stays in the price. A pre-sales pipeline run by one pilot is not this table. It is one pod, at the profile its agents' ratings support. It becomes a row here only when a second pilot joins it.

## How we would say it

To a customer:

> A pod is one pilot and the agents they work with. You have seen the agents and the Intent Delivery Framework on Copilots Studio. A pod hour is one hour that pilot delivers with those agents, not a license for the library. The rate follows the stores in the hour, how many agents are active, and the autonomy and human-judgement ratings already printed on those agents. For this outcome the profile is a delivery bolt: medium judgement, medium autonomy, the framework, and two or three coding and QA agents. The estimate you are used to prices it at 100,000, on 1,000 hours. We take it on as 700 pod hours at 121, for 85,000. You pay less than the classic total, and you get the time back. Autopilot costs are not in that rate. If you want a person without the agents, that stays on the classic hour, and the estimate goes back to the classic hours.

> Where two pods merge on the same work, you do not pay both profile rates. You pay for the shared stack once, and for the second pilot at their judgement rate. Two owned builds stacked would be 394 for the hour. Merged, with the second pilot joining that stack, the hour is 297.

To ourselves:

> We sell a named profile: stack, agent count, judgement, autonomy. The rate comes from that profile. Where pods merge, we price the shared stack once and each other pilot at their judgement rate. We do not add profile rates. The total for a known outcome sits below the classic estimate for the same judgement. Autopilot expenses stay out of the pod hour. If we cannot name the profile, or the cross-over, and show the baseline beside the quote, we are not ready to quote.

## Paths that look simpler and fail

**One flat pod-hour rate.** A low-judgement scan and a high-judgement decision look the same, and one agent looks like a full stack. The four factors are the rate card.

**Add every pod's rate when they work as one.** The customer pays twice for one stack. A cross-over prices the shared stack, the distinct agents, and the judgement once.

**A volume discount with no merge.** A second pod on different work is a second profile. The optimized rate is for pods that actually share the hour.

**Raise the man-hour rate.** The meter still shrinks. A buyer compares day rates and never sees the profile.

**Bill residual hours and add a gainshare.** The man hour remains the real price. The agents are framed as a refund. Every quarter becomes a negotiation about what the saving was.

**Fold autopilot expenses into the pod hour.** The pilot's hour becomes a dumping ground for a different cost. Customers who use copilots and not autopilots pay for a machine they did not run.

**Price only the outcome.** Right for a narrow, repeatable scope with a clear acceptance test. Weak as the default for product engineering, where the backlog moves and the outcome risk sits entirely on 99x. The pod month already points this way: the customer directs priority, one pilot and their agents bring a stable capacity.

## What has to change in delivery

The price breaks if the estimate is still written as man hours and the agents are treated as a private accelerator.

- Estimates name the profile, then the pod hours. Stack, agent count, judgement, and autonomy are fixed before the work starts. A change of any of the four is a change of rate, agreed as a new profile, not discovered at invoicing.
- A pod hour counts when that unit delivers an hour on the customer's work.
- Another agent does not multiply the hours. It can move the hour into a higher profile. Another pilot on separate work is another pod hour at that profile's rate.
- A cross-over is named on the estimate: which pods merge, the shared stack, the distinct agents, who holds the judgement, and the autonomy. The rate is the cross-over rate. If they stop sharing the work, the quote goes back to the separate profile rates.
- The baseline classic estimate, at the classic rate for that judgement, is kept as the comparison, not as the quote.
- `p` is per profile, from completed 99x work of that kind, stated as a range, and reviewed. We do not print a profile's `p` on a proposal until we are willing to be measured against it.
- Quality stays inside the pod. Hours saved and then spent on rework are not productivity.
- Autopilot use is recorded apart from pod hours, so it cannot leak into the rate.

## Decisions to make in this discussion

The rate follows the stack, the number of agents, the human judgement the hour requires, and the autonomy the agents bring. Pods that merge are a cross-over: shared stack and agents priced once, each other pilot at the classic rate for the judgement they provide, and the merged rate below the sum of the profile rates. Those decisions are in the model above. What is still open:

1. **Keep share.** The profiles give the customer half the surplus and keep half. Is 50/50 the opening, or should the first customers keep more?
2. **Profiles to publish.** Autonomy and human-judgement already use `high` / `medium` / `low` on every agent. Which combinations become a priced profile (discovery, delivery bolt, specialist audit, owned build, a named runbook), and what is the real classic rate for low, medium, and high judgement?
3. **Where `p` comes from.** Do we already have measured before-and-after figures per profile, or is the first step a pilot with a capped comparison against a classic estimate?
4. **What the kept surplus must fund.** Skill authors, IDE copilot licenses, delivery lead, warranty. Autopilot expenses are already out. What else is in?
5. **Classic hourly boundary.** Is a person without 99x agents the only thing left on man hours, or are there accounts we should not move yet?

When those are answered with real rates, this paper can become the offer: the profile card, the pod-hour definition, and the one-page comparison we put in front of a customer.
