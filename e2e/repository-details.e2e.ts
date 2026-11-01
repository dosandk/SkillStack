import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

import { FUNCTIONS_BASE_URL } from './support/constants';
import {
  clearRepositories,
  seedRepositories,
  trackInstalls
} from './support/firestore';
import { REPOSITORY_FIXTURES } from './support/fixtures';

const [SKILLSTACK] = REPOSITORY_FIXTURES;

// NOTE: install counts: code-review 3, git-commit 1, eleks-ui 0
const EXPECTED_SKILLS = [
  { name: 'code-review', installs: '3 installs' },
  { name: 'git-commit', installs: '1 install' },
  { name: 'eleks-ui', installs: '0 installs' }
];

async function seedWithInstalls(): Promise<string> {
  await clearRepositories();

  const [skillStackId] = await seedRepositories(REPOSITORY_FIXTURES);

  await trackInstalls(SKILLSTACK, ['code-review']);
  await trackInstalls(SKILLSTACK, ['code-review']);
  await trackInstalls(SKILLSTACK, ['code-review']);
  await trackInstalls(SKILLSTACK, ['git-commit']);

  return skillStackId;
}

// NOTE: Firebase SDK keeps long-poll connections open to the emulators, so
// 'networkidle' never settles; wait for the document and let each test's
// locator gate on the rendered content.
async function openCatalog(page: Page): Promise<void> {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-testid="repository-list"]');
}

async function openSkillStackPage(page: Page): Promise<void> {
  await openCatalog(page);
  await page
    .locator('[data-testid="repository-item"]', {
      hasText: SKILLSTACK.repoSlug
    })
    .getByRole('link')
    .click();
}

test.describe('RepositoryDetails e2e', () => {
  test("should open a repository's page from the catalog at its own address", async ({
    page
  }) => {
    const skillStackId = await seedWithInstalls();

    await openSkillStackPage(page);

    await expect(page).toHaveURL(new RegExp(`/repositories/${skillStackId}$`));
    await expect(
      page.getByRole('heading', { name: SKILLSTACK.repoSlug })
    ).toBeVisible();
    await expect(page.getByTestId('Heading')).toContainText(SKILLSTACK.owner);

    await page.getByTestId('back-to-repositories').click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByTestId('repository-list')).toBeVisible();
  });

  test('should list the skills with descriptions, highest install count first', async ({
    page
  }) => {
    const skillStackId = await seedWithInstalls();

    await page.goto(`/repositories/${skillStackId}`, {
      waitUntil: 'domcontentloaded'
    });
    await page.waitForSelector('[data-testid="skill-list"]');

    const rendered = await page.$$eval('[data-testid="skill-item"]', items =>
      items.map(item => ({
        name: item.querySelector('.MuiListItemText-primary')?.textContent ?? '',
        installs:
          item.querySelector('[data-testid="skill-install-count"]')
            ?.textContent ?? ''
      }))
    );

    expect(rendered).toEqual(EXPECTED_SKILLS);

    // NOTE: descriptions come from githubServiceMock in dev mode
    for (const { name } of EXPECTED_SKILLS) {
      await expect(
        page
          .locator('[data-testid="skill-item"]', { hasText: name })
          .locator('.MuiListItemText-secondary')
      ).toHaveText(`Description of ${name}`);
    }
  });

  test('should copy the npx skillstack-cli install command without showing it on the page', async ({
    page,
    context
  }) => {
    const skillStackId = await seedWithInstalls();
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.goto(`/repositories/${skillStackId}`, {
      waitUntil: 'domcontentloaded'
    });
    await page.waitForSelector('[data-testid="skill-list"]');

    const command =
      'npx skillstack-cli add https://github.com/dosandk/SkillStack --skill code-review';

    await expect(page.getByText('npx skillstack-cli')).toHaveCount(0);

    await page
      .locator('[data-testid="skill-item"]', { hasText: 'code-review' })
      .getByTestId('skill-copy-button')
      .click();

    await expect(page.getByTestId('copy-feedback')).toContainText(
      'Install command copied'
    );
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      command
    );
    await expect(page.getByText('npx skillstack-cli')).toHaveCount(0);
  });

  test('should show a not-found state for an unknown repository address', async ({
    page
  }) => {
    await clearRepositories();
    await seedRepositories(REPOSITORY_FIXTURES);

    await page.goto('/repositories/does-not-exist', {
      waitUntil: 'domcontentloaded'
    });

    await expect(page.getByTestId('repository-not-found')).toBeVisible();
    await expect(page.getByTestId('back-to-repositories')).toBeVisible();
  });

  test('should show the skills within 2 seconds of opening the page', async ({
    page
  }) => {
    const skillStackId = await seedWithInstalls();

    // NOTE: warm the endpoint so the budget measures a warm backend
    await fetch(
      `${FUNCTIONS_BASE_URL}/apiGetRepositoryDetails?id=${skillStackId}`
    );

    await openSkillStackPage(page);

    await expect(page.getByTestId('skill-list')).toBeVisible({ timeout: 2000 });
    await expect(page.getByTestId('skill-item')).toHaveCount(
      SKILLSTACK.skills.length
    );
  });
});
