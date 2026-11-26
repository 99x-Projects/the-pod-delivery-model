import { useEffect, useMemo, useState } from "react";
import { rateLabel } from "./model/compare";
import {
  ROLES,
  SUGGESTED_SKILLS,
  type Crossover,
  type Expert,
  type Level,
  type RoleId,
  expertLabel,
  priceTeam,
  roleById,
} from "./model/configure";
import { DEFAULT_RATES, TIER_ORDER, tierLabel, type TierRates } from "./model/rates";
import { SKILL_STORES, SKILLS, type Skill } from "./model/skills";

const STORAGE_KEY = "pod-configurator-v1";

export type Sheet = {
  name: string;
  experts: Expert[];
  crossovers: Crossover[];
};

const LEVELS: Level[] = ["low", "medium", "high"];

export function ConfigurePage({
  onChange,
  rates = DEFAULT_RATES,
}: {
  onChange?: (sheet: Sheet) => void;
  rates?: TierRates;
}) {
  const [sheet, setSheet] = useState<Sheet>(loadSheet);
  const [copied, setCopied] = useState(false);
  const priced = useMemo(
    () => priceTeam(sheet.experts, sheet.crossovers, rates),
    [sheet.experts, sheet.crossovers, rates],
  );

  useEffect(() => {
    onChange?.(sheet);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sheet));
    } catch {
      // The sheet still works for this visit when storage is unavailable.
    }
  }, [sheet, onChange]);

  function patch(next: Partial<Sheet>) {
    setSheet((current) => ({ ...current, ...next }));
  }

  function updateExpert(id: string, next: Partial<Expert>) {
    setSheet((current) => ({
      ...current,
      experts: current.experts.map((expert) =>
        expert.id === id ? { ...expert, ...next } : expert,
      ),
    }));
  }

  function removeExpert(id: string) {
    setSheet((current) => {
      const experts = current.experts.filter((expert) => expert.id !== id);
      return {
        ...current,
        experts: experts.length > 0 ? experts : [blankExpert()],
        crossovers: current.crossovers.map((group) => ({
          ...group,
          expertIds: group.expertIds.filter((expertId) => expertId !== id),
        })),
      };
    });
  }

  function toggleSkill(expertId: string, skillId: string) {
    setSheet((current) => ({
      ...current,
      experts: current.experts.map((expert) => {
        if (expert.id !== expertId) return expert;
        const skillIds = expert.skillIds.includes(skillId)
          ? expert.skillIds.filter((id) => id !== skillId)
          : [...expert.skillIds, skillId];
        return { ...expert, skillIds };
      }),
    }));
  }

  function toggleMember(groupId: string, expertId: string) {
    setSheet((current) => ({
      ...current,
      crossovers: current.crossovers.map((group) => {
        if (group.id !== groupId) return group;
        const expertIds = group.expertIds.includes(expertId)
          ? group.expertIds.filter((id) => id !== expertId)
          : [...group.expertIds, expertId];
        return { ...group, expertIds };
      }),
    }));
  }

  async function copySummary() {
    const lines = [sheet.name.trim() ? `Team: ${sheet.name.trim()}` : "Pod setup"];
    for (const group of priced.groups) {
      const name = group.crossover.name.trim() || "Cross-over";
      lines.push(
        `${name}: ${rateLabel(group.rate)} for the shared hour. Separate profile rates would be ${rateLabel(group.stacked)}.`,
      );
    }
    for (const pod of priced.separate) {
      lines.push(
        `${expertLabel(pod.expert, sheet.experts)}: ${rateLabel(pod.rate)} on separate work.`,
      );
    }
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <main className="wrap">
        <section className="hero hero-tool" id="configure">
          <p className="eyebrow">For the team</p>
          <h1>Set up the pods.</h1>
          <p className="lede">
            Choose each expert, then the skills that work with them. A pod is
            that one expert and those skills. When two or more experts share
            the same work, put them in a cross-over. You pay for the shared
            skills once, and for each other expert at the tier they bring.
            The comparison below is this setup.
          </p>
        </section>

        <form className="estimator" onSubmit={(event) => event.preventDefault()}>
          <div className="estimator-head">
            <h2>Experts</h2>
            <div className="sheet-actions">
              <button
                type="button"
                className="pill"
                onClick={() => patch({ experts: [...sheet.experts, blankExpert("developer")] })}
              >
                Add an expert
              </button>
              <button type="button" className="pill" onClick={() => patch(exampleSheet())}>
                Show an example
              </button>
              <button
                type="button"
                className="pill"
                onClick={() => patch({ name: "", experts: [blankExpert()], crossovers: [] })}
              >
                Clear
              </button>
            </div>
          </div>

          <div className="fields">
            <label>
              Name of this team
              <input
                type="text"
                value={sheet.name}
                placeholder="The team you are setting up"
                onChange={(event) => patch({ name: event.target.value })}
              />
            </label>
          </div>

          <div className="expert-grid">
            {sheet.experts.map((expert) => (
              <ExpertCard
                key={expert.id}
                expert={expert}
                experts={sheet.experts}
                onRole={(role) =>
                  updateExpert(expert.id, { role, judgement: roleById(role).judgement })
                }
                rates={rates}
                onJudgement={(judgement) => updateExpert(expert.id, { judgement })}
                onToggleSkill={(skillId) => toggleSkill(expert.id, skillId)}
                onRemove={() => removeExpert(expert.id)}
              />
            ))}
          </div>
        </form>

        <form className="estimator crossover-board" onSubmit={(event) => event.preventDefault()}>
          <div className="estimator-head">
            <h2>Cross-over pods</h2>
            <button
              type="button"
              className="pill"
              onClick={() =>
                patch({
                  crossovers: [
                    ...sheet.crossovers,
                    { id: newId(), name: "Shared work", expertIds: [] },
                  ],
                })
              }
            >
              Add a cross-over
            </button>
          </div>
          <p className="estimator-note">
            A cross-over is two or more experts on the same work. One expert,
            even with several skills, is one pod. Experts on different work stay
            separate, and their rates add.
          </p>
          {sheet.crossovers.length === 0 ? (
            <p className="estimator-note">Add a cross-over when experts will share the work.</p>
          ) : (
            <div className="expert-grid">
              {sheet.crossovers.map((group) => {
                const taken = new Set(
                  sheet.crossovers
                    .filter((other) => other.id !== group.id)
                    .flatMap((other) => other.expertIds),
                );
                return (
                  <article key={group.id} className="expert-card">
                    <div className="estimator-head">
                      <label className="crossover-name">
                        Name of this work
                        <input
                          type="text"
                          value={group.name}
                          placeholder="Shared work"
                          onChange={(event) =>
                            patch({
                              crossovers: sheet.crossovers.map((item) =>
                                item.id === group.id ? { ...item, name: event.target.value } : item,
                              ),
                            })
                          }
                        />
                      </label>
                      <button
                        type="button"
                        className="pill"
                        onClick={() =>
                          patch({
                            crossovers: sheet.crossovers.filter((item) => item.id !== group.id),
                          })
                        }
                      >
                        Remove
                      </button>
                    </div>
                    <ul className="member-list">
                      {sheet.experts.map((expert) => {
                        const usedElsewhere = taken.has(expert.id);
                        return (
                          <li key={expert.id}>
                            <label className="check">
                              <input
                                type="checkbox"
                                checked={group.expertIds.includes(expert.id)}
                                disabled={usedElsewhere}
                                onChange={() => toggleMember(group.id, expert.id)}
                              />
                              <span>
                                {expertLabel(expert, sheet.experts)}
                                {usedElsewhere ? " · already on other work" : ""}
                              </span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                    {group.expertIds.length < 2 ? (
                      <p className="estimator-note">Choose at least two experts to make this a cross-over.</p>
                    ) : null}
                  </article>
                );
              })}
            </div>
          )}
        </form>

        <section className="result-grid" aria-label="Pod rates">
          {priced.groups.map((group) => (
            <article key={group.crossover.id} className="result result-pod">
              <p className="kicker">Cross-over · same work</p>
              <h2>{group.crossover.name.trim() || "Shared work"}</h2>
              <p className="price">{rateLabel(group.rate)}</p>
              <p className="versus">
                Separate profile rates would be {rateLabel(group.stacked)}
              </p>
              <dl>
                <div>
                  <dt>Shared hour</dt>
                  <dd>{rateLabel(group.profileRate)}</dd>
                </div>
                <div>
                  <dt>Tier</dt>
                  <dd>{tierLabel(group.judgement)}</dd>
                </div>
                <div>
                  <dt>Skills, once</dt>
                  <dd>{group.skills.length}</dd>
                </div>
                <div>
                  <dt>Autonomy</dt>
                  <dd>{group.autonomy ? labelLevel(group.autonomy) : "None yet"}</dd>
                </div>
              </dl>
              <ul>
                <li>
                  {expertLabel(group.holder.expert, sheet.experts)} holds{" "}
                  {tierLabel(group.judgement)} in the shared hour.
                </li>
                {group.others.map((pod) => (
                  <li key={pod.expert.id}>
                    {expertLabel(pod.expert, sheet.experts)} joins at{" "}
                    {rateLabel(pod.classicRate)}, the classic rate for{" "}
                    {tierLabel(pod.expert.judgement)}.
                  </li>
                ))}
              </ul>
            </article>
          ))}
          {priced.separate.map((pod) => (
            <article key={pod.expert.id} className="result">
              <p className="kicker">Separate work</p>
              <h2>{expertLabel(pod.expert, sheet.experts)}</h2>
              <p className="price">{rateLabel(pod.rate)}</p>
              <p className="versus">
                {pod.skills.length > 0
                  ? `${pod.skills.length} ${pod.skills.length === 1 ? "skill" : "skills"} · ${labelLevel(pod.autonomy ?? "low").toLowerCase()} autonomy`
                  : "Classic hour, until you add a skill"}
              </p>
              <dl>
                <div>
                  <dt>Tier</dt>
                  <dd>{tierLabel(pod.expert.judgement)}</dd>
                </div>
                <div>
                  <dt>Classic rate</dt>
                  <dd>{rateLabel(pod.classicRate)}</dd>
                </div>
                <div>
                  <dt>Skills</dt>
                  <dd>{pod.skills.length}</dd>
                </div>
              </dl>
            </article>
          ))}
        </section>

        <section className="reading" aria-label="How the pod rate is set">
          <p>
            The pod hour rate follows the tier, the skills in the hour, and the
            autonomy those skills publish. {tierLabel("high")}, {tierLabel("medium")},
            and {tierLabel("low")} start at {rateLabel(rates.high)},{" "}
            {rateLabel(rates.medium)}, and {rateLabel(rates.low)}. The control
            in the header sets those rates. More skills, and higher autonomy,
            raise the rate and shorten the hours for the same outcome.
          </p>
          <p>
            In a cross-over the skills are priced once, on the highest tier in
            that work. Each other expert is added at the classic rate for the
            tier they bring. You do not pay a second copy of the same skills.
            An expert on different work stays a separate pod.
          </p>
          <p className="sheet-actions">
            <button type="button" className="pill" onClick={() => void copySummary()}>
              {copied ? "Copied" : "Copy the setup"}
            </button>
          </p>
        </section>
      </main>
    </>
  );
}

function ExpertCard({
  expert,
  experts,
  rates,
  onRole,
  onJudgement,
  onToggleSkill,
  onRemove,
}: {
  expert: Expert;
  experts: Expert[];
  rates: TierRates;
  onRole: (role: RoleId) => void;
  onJudgement: (judgement: Level) => void;
  onToggleSkill: (skillId: string) => void;
  onRemove: () => void;
}) {
  const suggested = SUGGESTED_SKILLS[expert.role];
  const selected = new Set(expert.skillIds);
  return (
    <article className="expert-card">
      <div className="estimator-head">
        <h3>{expertLabel(expert, experts)}</h3>
        <button type="button" className="pill" onClick={onRemove}>
          Remove
        </button>
      </div>
      <div className="expert-fields">
        <label>
          Expert
          <select value={expert.role} onChange={(event) => onRole(event.target.value as RoleId)}>
            {ROLES.map((role) => (
              <option key={role.id} value={role.id}>
                {role.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Tier
          <select
            value={expert.judgement}
            onChange={(event) => onJudgement(event.target.value as Level)}
          >
            {TIER_ORDER.map((level) => (
              <option key={level} value={level}>
                {tierLabel(level)} · {rateLabel(rates[level])}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="skill-heading">Skills with this expert</p>
      <div className="skill-chips">
        {suggested.map((skill) => (
          <SkillChip
            key={skill.id}
            skill={skill}
            pressed={selected.has(skill.id)}
            onToggle={() => onToggleSkill(skill.id)}
          />
        ))}
      </div>
      <details className="skill-more">
        <summary>Every expert skill</summary>
        {SKILL_STORES.map((store) => {
          const skills = SKILLS.filter((skill) => skill.store === store.id);
          if (skills.length === 0) return null;
          return (
            <div key={store.id} className="store-block">
              <h4>{store.label}</h4>
              <div className="skill-chips">
                {skills.map((skill) => (
                  <SkillChip
                    key={skill.id}
                    skill={skill}
                    pressed={selected.has(skill.id)}
                    onToggle={() => onToggleSkill(skill.id)}
                    detailed
                  />
                ))}
              </div>
            </div>
          );
        })}
      </details>
    </article>
  );
}

function SkillChip({
  skill,
  pressed,
  detailed,
  onToggle,
}: {
  skill: Skill;
  pressed: boolean;
  detailed?: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className="skill-chip"
      aria-pressed={pressed}
      onClick={onToggle}
    >
      {skill.title}
      {detailed ? <span>{labelLevel(skill.autonomy)} autonomy</span> : null}
    </button>
  );
}

function labelLevel(level: Level) {
  return level.charAt(0).toUpperCase() + level.slice(1);
}

function blankExpert(role: RoleId = "architect"): Expert {
  return { id: newId(), role, judgement: roleById(role).judgement, skillIds: [] };
}

function exampleSheet(): Sheet {
  return {
    name: "A build team",
    experts: [
      {
        id: "example-architect",
        role: "architect",
        judgement: "high",
        skillIds: ["product-backend-architect", "product-frontend-architect"],
      },
      {
        id: "example-developer",
        role: "developer",
        judgement: "medium",
        skillIds: ["auth-implementer", "runtime-debugger", "code-cleanup"],
      },
      {
        id: "example-qa",
        role: "qa",
        judgement: "low",
        skillIds: ["owasp-security-scanner"],
      },
    ],
    crossovers: [
      {
        id: "example-build",
        name: "Shared build",
        expertIds: ["example-architect", "example-developer"],
      },
    ],
  };
}

export function loadTeamSheet() {
  return loadSheet();
}

function loadSheet(): Sheet {
  const empty = exampleSheet();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<Sheet>;
    if (!parsed || !Array.isArray(parsed.experts) || parsed.experts.length === 0) return empty;
    const knownSkills = new Set(SKILLS.map((skill) => skill.id));
    const knownRoles = new Set(ROLES.map((role) => role.id));
    const experts = parsed.experts
      .filter((expert) => expert && knownRoles.has(expert.role))
      .map((expert) => ({
        id: typeof expert.id === "string" ? expert.id : newId(),
        role: expert.role,
        judgement: LEVELS.includes(expert.judgement) ? expert.judgement : roleById(expert.role).judgement,
        skillIds: Array.isArray(expert.skillIds)
          ? expert.skillIds.filter((id) => knownSkills.has(id))
          : [],
      }));
    if (experts.length === 0) return empty;
    const expertIds = new Set(experts.map((expert) => expert.id));
    const crossovers = Array.isArray(parsed.crossovers)
      ? parsed.crossovers
          .filter((group) => group && typeof group.id === "string")
          .map((group) => ({
            id: group.id,
            name: typeof group.name === "string" ? group.name : "",
            expertIds: Array.isArray(group.expertIds)
              ? group.expertIds.filter((id) => expertIds.has(id))
              : [],
          }))
      : [];
    return {
      name: typeof parsed.name === "string" ? parsed.name : "",
      experts,
      crossovers,
    };
  } catch {
    return empty;
  }
}

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `pod-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
