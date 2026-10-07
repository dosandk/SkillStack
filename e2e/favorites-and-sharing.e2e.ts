import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

import { clearAuthAccounts, signInAsMockGithubUser } from './support/auth';
import { clearRepositories, seedRepositories } from './support/firestore';
import { REPOSITORY_FIXTURES } from './support/fixtures';

// NOTE: Firebase SDK keeps long-poll connections open to the emulators, so
// 'networkidle' never settles; wait for the document and let each test's
// waitForSelector/getBy* auto-wait gate on rendered content.
async function openApp(page: Page, path = '/'): Promise<void> {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
}

async function waitForRepositoryList(page: Page): Promise<void> {
  await page.waitForSelector('[data-testid="repository-list"]');
}

async function openRepositoryDetail(page: Page, repoSlug: string): Promise<void> {
  await waitForRepositoryList(page);
  await page.getByRole('link', { name: repoSlug }).click();
  await page.waitForSelector('[data-testid="repository-skill-list"]');
}

const WHOLE_REPO_FIXTURE = REPOSITORY_FIXTURES.find(
  fixture => fixture.repoSlug === 'eleks/awesome-skills'
);
const SINGLE_SKILL_FIXTURE = REPOSITORY_FIXTURES.find(
  fixture => fixture.repoSlug === 'dosandk/SkillStack'
);

if (!WHOLE_REPO_FIXTURE || !SINGLE_SKILL_FIXTURE) {
  throw new Error('Favorites e2e expects the standard repository fixtures');
}

test.describe('Favorites & Sharing e2e', () => {
  test.beforeEach(async () => {
    await clearRepositories();
    await clearAuthAccounts();
    await seedRepositories(REPOSITORY_FIXTURES);
  });

  test('should favorite a whole repository from the catalog and list it under Favorites', async ({
    page
  }) => {
    await openApp(page);
    await signInAsMockGithubUser(page);
    await waitForRepositoryList(page);

    const repoSlug = WHOLE_REPO_FIXTURE.repoSlug;

    await page
      .getByRole('button', { name: `Favorite ${repoSlug}` })
      .click();

    // NOTE: aria-label flips to the "Remove ..." variant once the mutation
    // resolves — that's our signal that the write round-tripped.
    await expect(
      page.getByRole('button', { name: `Remove ${repoSlug} from favorites` })
    ).toBeVisible();

    await page.getByRole('link', { name: 'Favorites' }).click();
    await page.waitForSelector('[data-testid="favorites-list"]');

    const favoriteItems = page.getByTestId('favorites-item');
    await expect(favoriteItems).toHaveCount(1);

    const favoritedRepo = favoriteItems.first();
    await expect(favoritedRepo).toContainText(repoSlug);
    await expect(favoritedRepo).toContainText('All skills favorited');
  });

  test('should favorite only the selected skill from repository detail and show only that skill under Favorites', async ({
    page
  }) => {
    await openApp(page);
    await signInAsMockGithubUser(page);

    const { repoSlug, skills } = SINGLE_SKILL_FIXTURE;
    const targetSkill = skills[0];

    await openRepositoryDetail(page, repoSlug);

    await page
      .getByRole('button', { name: `Favorite skill ${targetSkill}` })
      .click();

    await expect(
      page.getByRole('button', {
        name: `Remove skill ${targetSkill} from favorites`
      })
    ).toBeVisible();

    // NOTE: whole-repo toggle must remain in the "not favorited" state — this
    // guards against a regression that would promote per-skill picks to a full
    // repo favorite (which would also flip every other skill icon).
    await expect(
      page.getByRole('button', {
        name: `Favorite whole repository ${repoSlug}`
      })
    ).toBeVisible();

    await page.getByRole('link', { name: 'Favorites' }).click();
    await page.waitForSelector('[data-testid="favorites-list"]');

    const favoriteItems = page.getByTestId('favorites-item');
    await expect(favoriteItems).toHaveCount(1);

    const favoritedRepo = favoriteItems.first();
    await expect(favoritedRepo).toContainText(repoSlug);
    await expect(favoritedRepo).toContainText(`1 skill(s): ${targetSkill}`);
  });

  test('should prompt visitors to sign in when favoriting and add nothing until they authenticate', async ({
    page
  }) => {
    await openApp(page);
    await waitForRepositoryList(page);

    const repoSlug = WHOLE_REPO_FIXTURE.repoSlug;

    await page
      .getByRole('button', { name: `Favorite ${repoSlug}` })
      .click();

    const promptDialog = page.getByRole('dialog', { name: /sign in required/i });
    await expect(promptDialog).toBeVisible();
    await expect(promptDialog).toContainText(
      /sign in with github to favorite repositories and skills/i
    );

    await promptDialog.getByRole('button', { name: /cancel/i }).click();
    await expect(promptDialog).toBeHidden();

    // NOTE: the toggle must stay in the "not favorited" state since the click
    // was intercepted by the sign-in prompt — no optimistic write is allowed.
    await expect(
      page.getByRole('button', { name: `Favorite ${repoSlug}` })
    ).toBeVisible();

    await signInAsMockGithubUser(page);

    await page.getByRole('link', { name: 'Favorites' }).click();

    // NOTE: no favorites-list rendered when the collection is empty — assert
    // both the absence of any item and the empty-state page instead of a
    // count on a missing container.
    await expect(page.getByTestId('favorites-list')).toHaveCount(0);
    await expect(page.getByTestId('favorites-item')).toHaveCount(0);
  });

  test('should share favorites via a public link that another visitor can open while private favorites stay private', async ({
    page,
    browser
  }) => {
    const context = page.context();
    // NOTE: FavoritesPage writes the share URL to navigator.clipboard, so grant
    // clipboard permissions before reading it back in the test.
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await openApp(page);
    await signInAsMockGithubUser(page);
    await waitForRepositoryList(page);

    const repoSlug = WHOLE_REPO_FIXTURE.repoSlug;

    await page
      .getByRole('button', { name: `Favorite ${repoSlug}` })
      .click();
    await expect(
      page.getByRole('button', { name: `Remove ${repoSlug} from favorites` })
    ).toBeVisible();

    await page.getByRole('link', { name: 'Favorites' }).click();
    await page.waitForSelector('[data-testid="favorites-list"]');

    await page.getByRole('button', { name: /share all favorites/i }).click();

    // NOTE: the Snackbar message includes the copied URL — waiting for it
    // guarantees the clipboard write finished before we read it.
    await expect(page.getByText(/share link copied:/i)).toBeVisible();

    const shareUrl = await page.evaluate(() => navigator.clipboard.readText());
    expect(shareUrl).toMatch(/\/shared\/[A-Za-z0-9]+$/);

    const visitorContext = await browser.newContext();

    try {
      const visitorPage = await visitorContext.newPage();

      await visitorPage.goto(shareUrl, { waitUntil: 'domcontentloaded' });
      await visitorPage.waitForSelector('[data-testid="shared-collection"]');

      const sharedItems = visitorPage.getByTestId('shared-collection-item');
      await expect(sharedItems).toHaveCount(1);

      const sharedItem = sharedItems.first();
      await expect(sharedItem).toContainText(repoSlug);
      await expect(sharedItem).toContainText('All skills');

      // NOTE: without the share link, an unauthenticated visitor must not see
      // any of the owner's favorites — the Favorites page shows the sign-in
      // required 401 state instead.
      await visitorPage.goto('/favorites', { waitUntil: 'domcontentloaded' });
      await expect(
        visitorPage.getByText(
          /sign in with github to view and share your favorites/i
        )
      ).toBeVisible();
      await expect(visitorPage.getByTestId('favorites-list')).toHaveCount(0);
    } finally {
      await visitorContext.close();
    }

    // Owner still sees their favorites after the anonymous share view.
    const ownerFavorites = page.getByTestId('favorites-item');
    await expect(ownerFavorites).toHaveCount(1);
    await expect(ownerFavorites.first()).toContainText(repoSlug);
  });
});
