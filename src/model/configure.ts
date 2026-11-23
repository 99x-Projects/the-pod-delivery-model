import { SKILLS, skillById, type Level, type RoleId, type Skill } from "./skills";

export type { Level, RoleId, Skill };

/** Scale-model classic rates. Not a rate card. */
export const CLASSIC_RATE: Record<Level, number> = {
  low: 80,
  medium: 100,
  high: 140,
};

const KEEP_SHARE = 0.5;

const RANK: Record<Level, number> = { low: 0, medium: 1, high: 2 };

export const ROLES: { id: RoleId; label: string; judgement: Level }[] = [
  { id: "architect", label: "Architect", judgement: "high" },
  { id: "developer", label: "Developer", judgement: "medium" },
  { id: "qa", label: "QA", judgement: "medium" },
  { id: "devops", label: "DevOps", judgement: "medium" },
  { id: "delivery-manager", label: "Delivery Manager", judgement: "high" },
  { id: "ui-ux", label: "UI/UX", judgement: "medium" },
  { id: "product-manager", label: "Product Manager", judgement: "high" },
];

export type Expert = {
  id: string;
  role: RoleId;
  judgement: Level;
  skillIds: string[];
};

export type Crossover = {
  id: string;
  name: string;
  expertIds: string[];
};

export type PodPrice = {
  expert: Expert;
  skills: Skill[];
  autonomy: Level | null;
  productivity: number;
  classicRate: number;
  rate: number;
};

export type CrossoverPrice = {
  crossover: Crossover;
  members: PodPrice[];
  holder: PodPrice;
  others: PodPrice[];
  skills: Skill[];
  autonomy: Level | null;
  judgement: Level;
  profileRate: number;
  rate: number;
  stacked: number;
};

export function roleById(id: RoleId) {
  return ROLES.find((role) => role.id === id) ?? ROLES[0];
}

export function highest(levels: Level[]): Level | null {
  if (levels.length === 0) return null;
  return levels.reduce((best, level) => (RANK[level] > RANK[best] ? level : best));
}

/** Hour reduction the selected skills can stand behind, on the published scale. */
export function productivity(autonomy: Level, skillCount: number) {
  if (skillCount <= 0) return 0;
  const extra = skillCount - 1;
  if (autonomy === "low") return Math.min(0.18, 0.1 + extra * 0.02);
  if (autonomy === "medium") return Math.min(0.36, 0.22 + extra * 0.04);
  return Math.min(0.52, 0.45 + extra * 0.02);
}

export function podHourRate(judgement: Level, autonomy: Level | null, skillCount: number) {
  const classic = CLASSIC_RATE[judgement];
  const share = autonomy ? productivity(autonomy, skillCount) : 0;
  if (share <= 0) return classic;
  return Math.round((classic * (1 - share * KEEP_SHARE)) / (1 - share));
}

export function skillsFor(ids: string[]) {
  return ids.map((id) => skillById(id)).filter((skill): skill is Skill => Boolean(skill));
}

export function pricePod(expert: Expert): PodPrice {
  const skills = skillsFor(expert.skillIds);
  const autonomy = highest(skills.map((skill) => skill.autonomy));
  const share = autonomy ? productivity(autonomy, skills.length) : 0;
  return {
    expert,
    skills,
    autonomy,
    productivity: share,
    classicRate: CLASSIC_RATE[expert.judgement],
    rate: podHourRate(expert.judgement, autonomy, skills.length),
  };
}

export function priceTeam(experts: Expert[], crossovers: Crossover[]) {
  const priced = new Map(experts.map((expert) => [expert.id, pricePod(expert)]));
  const grouped = new Set(
    crossovers.filter((group) => group.expertIds.length >= 2).flatMap((group) => group.expertIds),
  );

  const groups: CrossoverPrice[] = crossovers
    .map((crossover) => {
      const members = crossover.expertIds
        .map((id) => priced.get(id))
        .filter((pod): pod is PodPrice => Boolean(pod));
      if (members.length < 2) return null;
      const seen = new Set<string>();
      const skills = members
        .flatMap((pod) => pod.skills)
        .filter((skill) => (seen.has(skill.id) ? false : (seen.add(skill.id), true)));
      const autonomy = highest(skills.map((skill) => skill.autonomy));
      const judgement = highest(members.map((pod) => pod.expert.judgement)) ?? "medium";
      const holder = members.find((pod) => pod.expert.judgement === judgement) ?? members[0];
      const others = members.filter((pod) => pod.expert.id !== holder.expert.id);
      const profileRate = podHourRate(judgement, autonomy, skills.length);
      const stacked = members.reduce((sum, pod) => sum + pod.rate, 0);
      const raw = profileRate + others.reduce((sum, pod) => sum + pod.classicRate, 0);
      const rate = skills.length > 0 && raw >= stacked ? stacked - 1 : raw;
      return {
        crossover,
        members,
        holder,
        others,
        skills,
        autonomy,
        judgement,
        profileRate,
        rate,
        stacked,
      };
    })
    .filter((group): group is CrossoverPrice => Boolean(group));

  const separate = experts
    .filter((expert) => !grouped.has(expert.id))
    .map((expert) => priced.get(expert.id)!);

  return { groups, separate };
}

export type TeamUnit = {
  name: string;
  classicRate: number;
  podRate: number;
  productivity: number;
};

/** The priced pieces of a setup: each cross-over, then each expert on separate work. */
export function teamUnits(experts: Expert[], crossovers: Crossover[]): TeamUnit[] {
  const priced = priceTeam(experts, crossovers);
  return [
    ...priced.groups.map((group) => ({
      name: group.crossover.name.trim() || "Cross-over",
      classicRate: group.members.reduce((sum, pod) => sum + pod.classicRate, 0),
      podRate: group.rate,
      productivity: group.autonomy ? productivity(group.autonomy, group.skills.length) : 0,
    })),
    ...priced.separate.map((pod) => ({
      name: expertLabel(pod.expert, experts),
      classicRate: pod.classicRate,
      podRate: pod.rate,
      productivity: pod.productivity,
    })),
  ];
}

export function expertLabel(expert: Expert, experts: Expert[]) {
  const same = experts.filter((item) => item.role === expert.role);
  const label = roleById(expert.role).label;
  if (same.length < 2) return label;
  return `${label} ${same.findIndex((item) => item.id === expert.id) + 1}`;
}

export const SUGGESTED_SKILLS = Object.fromEntries(
  ROLES.map((role) => [role.id, SKILLS.filter((skill) => skill.fits.includes(role.id))]),
) as Record<RoleId, Skill[]>;
