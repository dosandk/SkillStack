import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

import { clearRepositories, seedRepositories } from './support/firestore';
import { REPOSITORY_FIXTURES } from './support/fixtures';

interface RenderedRepository {
  slug: string;
  owner: string;
  skillText: string;
}

// NOTE: Firebase SDK keeps long-poll connections open to the emulators, so
// 'networkidle' never settles; wait for the document and let each test's
// waitForSelector gate on the rendered content.
async function openApp(page: Page): Promise<void> {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
}

test.describe('RepositoryList e2e', () => {
  test('should render seeded repositories with slug, owner and skill count', async ({
    page
  }) => {
    await clearRepositories();
    await seedRepositories(REPOSITORY_FIXTURES);

    await openApp(page);
    await page.waitForSelector('[data-testid="repository-list"]');

    const rendered = await page.$$eval(
      '[data-testid="repository-item"]',
      items =>
        items.map(item => ({
          slug:
            item.querySelector('.MuiListItemText-primary')?.textContent ?? '',
          owner:
            item.querySelector('.MuiListItemText-secondary')?.textContent ?? '',
          skillText:
            item.querySelector('[data-testid="repository-skill-count"]')
              ?.textContent ?? ''
        }))
    );

    const sortBySlug = (repositories: RenderedRepository[]) =>
      [...repositories].sort((first, second) =>
        first.slug.localeCompare(second.slug)
      );

    const expected: RenderedRepository[] = REPOSITORY_FIXTURES.map(fixture => ({
      slug: fixture.repoSlug,
      owner: fixture.owner,
      skillText: `${fixture.skills.length} skills`
    }));

    expect(sortBySlug(rendered)).toEqual(sortBySlug(expected));
  });

  test('should render empty state when no repositories exist', async ({
    page
  }) => {
    await clearRepositories();

    await openApp(page);
    await page.waitForSelector('[data-testid="repository-empty"]');

    const itemCount = await page.$$eval(
      '[data-testid="repository-item"]',
      items => items.length
    );

    expect(itemCount).toBe(0);
  });
});
