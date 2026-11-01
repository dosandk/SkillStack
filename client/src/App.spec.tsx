import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BackendApiError } from '@shared';

import App from './App';

const { getRepositoriesList, getRepositoryDetails, getSkillDescriptions } =
  vi.hoisted(() => ({
    getRepositoriesList: vi.fn(),
    getRepositoryDetails: vi.fn(),
    getSkillDescriptions: vi.fn()
  }));

vi.mock('@shared', async importOriginal => {
  const actual = await importOriginal<typeof import('@shared')>();

  return {
    ...actual,
    backendService: { getRepositoriesList, getRepositoryDetails },
    githubService: { getSkillDescriptions }
  };
});

const repository = {
  id: 'r1',
  repoSlug: 'octocat/hello-world',
  owner: 'octocat',
  defaultBranch: 'main',
  skills: ['alpha']
};

function renderApp(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );
}

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getRepositoriesList.mockResolvedValue({ repositories: [repository] });
    getRepositoryDetails.mockResolvedValue({
      repository,
      skills: [{ name: 'alpha', installCount: 2 }]
    });
    getSkillDescriptions.mockResolvedValue({});
  });

  it('should show the catalog at the root address', async () => {
    renderApp('/');

    expect(
      await screen.findByRole('heading', { name: 'Repositories' })
    ).toBeInTheDocument();
    expect(await screen.findByTestId('repository-list')).toBeInTheDocument();
  });

  it('should open the repository page when a repository is clicked', async () => {
    const user = userEvent.setup();
    renderApp('/');

    const [item] = await screen.findAllByTestId('repository-item');
    await user.click(within(item).getByRole('link'));

    expect(await screen.findByTestId('skill-list')).toBeInTheDocument();
    expect(getRepositoryDetails).toHaveBeenCalledWith('r1');
    expect(
      screen.getByRole('heading', { name: 'octocat/hello-world' })
    ).toBeInTheDocument();
    expect(screen.queryByTestId('repository-list')).not.toBeInTheDocument();
  });

  it("should open a repository's page directly from its address", async () => {
    renderApp('/repositories/r1');

    expect(await screen.findByTestId('skill-list')).toBeInTheDocument();
    expect(getRepositoryDetails).toHaveBeenCalledWith('r1');
    expect(getRepositoriesList).not.toHaveBeenCalled();
  });

  it('should show the catalog after leaving a repository page that failed to load', async () => {
    const user = userEvent.setup();
    getRepositoryDetails.mockRejectedValue(
      new BackendApiError('Backend API GET 500', { status: 500 })
    );
    renderApp('/repositories/r1');

    await screen.findByTestId('repository-details-error');
    await user.click(screen.getByTestId('back-to-repositories'));

    expect(await screen.findByTestId('repository-list')).toBeInTheDocument();
    expect(screen.getAllByTestId('repository-item')).toHaveLength(1);
  });

  it('should redirect an unknown address to the catalog', async () => {
    renderApp('/no/such/page');

    expect(await screen.findByTestId('repository-list')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Repositories' })
    ).toBeInTheDocument();
  });
});
