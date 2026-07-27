import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Browser } from 'puppeteer';

import { launchBrowser, openApp } from './support/browser';
import { clearRepositories, seedRepositories } from './support/firestore';
import { REPOSITORY_FIXTURES } from './support/fixtures';

interface RenderedRepository {
  slug: string;
  owner: string;
  skillText: string;
}

describe('RepositoryList e2e', () => {
  let browser: Browser;

  beforeAll(async () => {
    browser = await launchBrowser();
  });

  afterAll(async () => {
    await browser.close();
  });

  it('should render seeded repositories with slug, owner and skill count', async () => {
    await clearRepositories();
    await seedRepositories(REPOSITORY_FIXTURES);

    const page = await openApp(browser);
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

  it('should render empty state when no repositories exist', async () => {
    await clearRepositories();

    const page = await openApp(browser);
    await page.waitForSelector('[data-testid="repository-empty"]');

    const itemCount = await page.$$eval(
      '[data-testid="repository-item"]',
      items => items.length
    );

    expect(itemCount).toBe(0);
  });
});
