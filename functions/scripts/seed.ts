import admin from 'firebase-admin';

import {
  PROJECT_ID,
  assertLocalEmulator,
  clearAllRecords,
  useEmulator
} from './emulator.ts';

useEmulator();

const REPO_OWNERS = [
  'dosandk',
  'eleks',
  'octocat',
  'acme-labs',
  'open-collab',
  'devhub',
  'nimbus-tools',
  'brightstack'
];

const REPO_NAMES = [
  'SkillStack',
  'awesome-skills',
  'devtools-kit',
  'ui-recipes',
  'agent-playbook',
  'prompt-lab',
  'workflow-forge',
  'code-atlas'
];

const SKILL_NAMES = [
  'code-review',
  'frontend-design',
  'git-commit',
  'implement-issue',
  'check-duplicates',
  'eleks-ui',
  'deep-research',
  'dataviz',
  'security-review',
  'test-conventions',
  'dedupe-code',
  'commit-helper',
  'refactor-assist',
  'api-scaffold',
  'release-notes'
];

// NOTE: `main` is weighted heavier by repetition so most repos default to it.
const DEFAULT_BRANCHES = ['main', 'main', 'main', 'master', 'develop'];

const DEFAULT_REPO_COUNT = 15;
const MIN_SKILLS_PER_REPO = 3;
const MAX_SKILLS_PER_REPO = 8;
const MIN_INSTALL_COUNT = 1;
const MAX_INSTALL_COUNT = 500;

type SeededSkill = { name: string; installCount: number };

type SeededRepository = {
  repoSlug: string;
  owner: string;
  defaultBranch: string;
  skills: SeededSkill[];
  totalInstalls: number;
};

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<TItem>(items: TItem[]): TItem {
  return items[randomInt(0, items.length - 1)];
}

function pickRandomSubset<TItem>(items: TItem[], size: number): TItem[] {
  const shuffled = [...items].sort(() => Math.random() - 0.5);

  return shuffled.slice(0, Math.min(size, items.length));
}

function resolveRepoCount(): number {
  const rawCount =
    process.argv.find(argument => /^\d+$/.test(argument)) ??
    process.env.SEED_REPOS;

  if (!rawCount) {
    return DEFAULT_REPO_COUNT;
  }

  const parsedCount = Number.parseInt(rawCount, 10);

  if (!Number.isFinite(parsedCount) || parsedCount <= 0) {
    throw new Error(
      `Invalid repository count: "${rawCount}" (expected a positive integer)`
    );
  }

  return parsedCount;
}

function buildRepositories(repoCount: number): SeededRepository[] {
  const usedSlugs = new Set<string>();
  const repositories: SeededRepository[] = [];

  for (let repoIndex = 0; repoIndex < repoCount; repoIndex += 1) {
    const owner = pickRandom(REPO_OWNERS);

    let repoSlug = `${owner}/${pickRandom(REPO_NAMES)}`;
    let suffix = 2;

    while (usedSlugs.has(repoSlug)) {
      repoSlug = `${owner}/${pickRandom(REPO_NAMES)}-${suffix}`;
      suffix += 1;
    }

    usedSlugs.add(repoSlug);

    const skillNames = pickRandomSubset(
      SKILL_NAMES,
      randomInt(MIN_SKILLS_PER_REPO, MAX_SKILLS_PER_REPO)
    );

    const skills: SeededSkill[] = skillNames.map(skillName => ({
      name: skillName,
      installCount: randomInt(MIN_INSTALL_COUNT, MAX_INSTALL_COUNT)
    }));

    const totalInstalls = skills.reduce(
      (sum, skill) => sum + skill.installCount,
      0
    );

    repositories.push({
      repoSlug,
      owner,
      defaultBranch: pickRandom(DEFAULT_BRANCHES),
      skills,
      totalInstalls
    });
  }

  return repositories;
}

async function seed(): Promise<void> {
  assertLocalEmulator();

  const shouldClear = process.argv.includes('--fresh');
  const repoCount = resolveRepoCount();

  admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();

  if (shouldClear) {
    console.log('Clearing existing repositories before seeding');
    await clearAllRecords();
  }

  const repositories = buildRepositories(repoCount);
  let skillDocCount = 0;

  for (const repository of repositories) {
    const batch = db.batch();
    const repoRef = db.collection('repositories').doc();

    batch.set(repoRef, {
      repoSlug: repository.repoSlug,
      owner: repository.owner,
      defaultBranch: repository.defaultBranch,
      skills: repository.skills.map(skill => skill.name),
      totalInstalls: repository.totalInstalls
    });

    for (const skill of repository.skills) {
      batch.set(repoRef.collection('skills').doc(skill.name), {
        installCount: skill.installCount
      });
      skillDocCount += 1;
    }

    await batch.commit();
  }

  console.log(
    `✅ Seeded ${repositories.length} repositories \n with ${skillDocCount} skill doc(s) \n` +
      `into the Firestore emulator at ${process.env.FIRESTORE_EMULATOR_HOST}`
  );
}

seed()
  .catch(error => {
    console.error('🔴 Seeding failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (admin.apps.length > 0) {
      await admin.app().delete();
    }
  });
