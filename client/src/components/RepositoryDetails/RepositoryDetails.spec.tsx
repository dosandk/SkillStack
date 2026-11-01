import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BackendApiError, GithubApiError } from '@shared';

import { RepositoryDetails } from './RepositoryDetails';

const { getRepositoryDetails, getSkillDescriptions } = vi.hoisted(() => ({
  getRepositoryDetails: vi.fn(),
  getSkillDescriptions: vi.fn()
}));

vi.mock('@shared', async importOriginal => {
  const actual = await importOriginal<typeof import('@shared')>();

  return {
    ...actual,
    backendService: {
      getRepositoriesList: vi.fn(),
      getRepositoryDetails
    },
    githubService: { getSkillDescriptions }
  };
});

const repository = {
  id: 'r1',
  repoSlug: 'octocat/hello-world',
  owner: 'octocat',
  defaultBranch: 'main',
  skills: ['code-review', 'git-commit', 'eleks-ui']
};

const skills = [
  { name: 'code-review', installCount: 3 },
  { name: 'git-commit', installCount: 1 },
  { name: 'eleks-ui', installCount: 0 }
];

const backendError = (status: number) =>
  new BackendApiError(`Backend API GET ${status}`, { status });

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

function renderPage(id = 'r1') {
  return render(
    <MemoryRouter initialEntries={[`/repositories/${id}`]}>
      <Routes>
        <Route path="/repositories/:id" element={<RepositoryDetails />} />
        <Route path="/" element={<div data-testid="catalog-page" />} />
      </Routes>
    </MemoryRouter>
  );
}

const skillRows = () => screen.getAllByTestId('skill-item');

const rowNames = () =>
  skillRows().map(
    row => row.querySelector('.MuiListItemText-primary')?.textContent
  );

describe('RepositoryDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSkillDescriptions.mockResolvedValue({});
  });

  it('should show a loading state while the repository is loading', () => {
    getRepositoryDetails.mockReturnValue(new Promise(() => undefined));

    renderPage();

    expect(
      screen.getByTestId('repository-details-loading')
    ).toBeInTheDocument();
    expect(screen.queryByTestId('skill-list')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('repository-details-error')
    ).not.toBeInTheDocument();
  });

  it('should request the repository whose id is in the address', async () => {
    getRepositoryDetails.mockResolvedValue({ repository, skills });

    renderPage('r1');

    await screen.findByTestId('skill-list');

    expect(getRepositoryDetails).toHaveBeenCalledWith('r1');
  });

  it('should show the repository name, owner and a link back to the catalog', async () => {
    getRepositoryDetails.mockResolvedValue({ repository, skills });

    renderPage();

    expect(
      await screen.findByRole('heading', { name: 'octocat/hello-world' })
    ).toBeInTheDocument();
    expect(screen.getByTestId('Heading')).toHaveTextContent('octocat');

    const back = screen.getByTestId('back-to-repositories');

    expect(back).toHaveTextContent('Back to repositories');
    expect(back).toHaveAttribute('href', '/');
  });

  it('should show the link back to the catalog while the repository is loading', () => {
    getRepositoryDetails.mockReturnValue(new Promise(() => undefined));

    renderPage();

    expect(screen.getByTestId('back-to-repositories')).toHaveAttribute(
      'href',
      '/'
    );
  });

  it('should open the catalog when the back link is clicked', async () => {
    const user = userEvent.setup();
    getRepositoryDetails.mockResolvedValue({ repository, skills });
    renderPage();

    await user.click(await screen.findByTestId('back-to-repositories'));

    expect(await screen.findByTestId('catalog-page')).toBeInTheDocument();
  });

  it('should list the skills with their GitHub descriptions and install counts', async () => {
    getRepositoryDetails.mockResolvedValue({ repository, skills });
    getSkillDescriptions.mockResolvedValue({
      'code-review': 'Reviews code',
      'git-commit': 'Writes commits'
    });

    renderPage();

    await screen.findByTestId('skill-list');

    expect(skillRows()).toHaveLength(3);
    expect(await screen.findByText('Reviews code')).toBeInTheDocument();
    expect(screen.getByText('Writes commits')).toBeInTheDocument();
    expect(
      within(skillRows()[0]).getByTestId('skill-install-count')
    ).toHaveTextContent('3 installs');
    expect(
      within(skillRows()[1]).getByTestId('skill-install-count')
    ).toHaveTextContent('1 install');
    expect(
      within(skillRows()[2]).getByTestId('skill-install-count')
    ).toHaveTextContent('0 installs');
    expect(getSkillDescriptions).toHaveBeenCalledWith({
      repoSlug: 'octocat/hello-world',
      defaultBranch: 'main',
      skillNames: ['code-review', 'git-commit', 'eleks-ui']
    });
  });

  it('should show names and install counts while descriptions are still loading', async () => {
    const descriptions = deferred<Record<string, string>>();
    getRepositoryDetails.mockResolvedValue({ repository, skills });
    getSkillDescriptions.mockReturnValue(descriptions.promise);

    renderPage();

    await screen.findByTestId('skill-list');

    expect(rowNames()).toEqual(['code-review', 'git-commit', 'eleks-ui']);
    expect(
      within(skillRows()[0]).getByTestId('skill-install-count')
    ).toHaveTextContent('3 installs');
    expect(screen.queryByText('Reviews code')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('repository-details-loading')
    ).not.toBeInTheDocument();

    await act(async () => {
      descriptions.resolve({ 'code-review': 'Reviews code' });
    });

    expect(await screen.findByText('Reviews code')).toBeInTheDocument();
    expect(rowNames()).toEqual(['code-review', 'git-commit', 'eleks-ui']);
  });

  it('should keep the skill order returned by the backend', async () => {
    getRepositoryDetails.mockResolvedValue({
      repository,
      skills: [
        { name: 'zeta', installCount: 12 },
        { name: 'alpha', installCount: 5 },
        { name: 'mid', installCount: 0 }
      ]
    });

    renderPage();

    await screen.findByTestId('skill-list');

    expect(rowNames()).toEqual(['zeta', 'alpha', 'mid']);
  });

  it('should list the skills without descriptions and no error state when GitHub fails', async () => {
    getRepositoryDetails.mockResolvedValue({ repository, skills });
    getSkillDescriptions.mockRejectedValue(
      new GithubApiError('rate limited', { status: 403 })
    );

    renderPage();

    await screen.findByTestId('skill-list');
    await waitFor(() => expect(getSkillDescriptions).toHaveBeenCalled());
    await act(async () => undefined);

    expect(rowNames()).toEqual(['code-review', 'git-commit', 'eleks-ui']);
    expect(
      within(skillRows()[0]).getByTestId('skill-install-count')
    ).toHaveTextContent('3 installs');
    skillRows().forEach(row => {
      expect(row.querySelector('.MuiListItemText-secondary')).toBeNull();
    });
    expect(
      screen.queryByTestId('repository-details-error')
    ).not.toBeInTheDocument();
  });

  it('should list a skill without a description next to skills that have one', async () => {
    getRepositoryDetails.mockResolvedValue({ repository, skills });
    getSkillDescriptions.mockResolvedValue({ 'code-review': 'Reviews code' });

    renderPage();

    await screen.findByText('Reviews code');

    expect(rowNames()).toEqual(['code-review', 'git-commit', 'eleks-ui']);
    expect(
      skillRows()[1].querySelector('.MuiListItemText-secondary')
    ).toBeNull();
  });

  it('should show an empty state when the repository has no skills', async () => {
    getRepositoryDetails.mockResolvedValue({ repository, skills: [] });

    renderPage();

    expect(await screen.findByTestId('skill-empty')).toHaveTextContent(
      'This repository has no skills yet.'
    );
    expect(screen.queryByTestId('skill-item')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('repository-details-error')
    ).not.toBeInTheDocument();
  });

  it('should show an error state when the request fails', async () => {
    getRepositoryDetails.mockRejectedValue(backendError(500));

    renderPage();

    expect(
      await screen.findByTestId('repository-details-error')
    ).toHaveTextContent(
      'Could not load this repository. Please try again later.'
    );
    expect(screen.queryByTestId('skill-list')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('repository-not-found')
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('back-to-repositories')).toBeInTheDocument();
  });

  it('should show an error state when the network is unreachable', async () => {
    getRepositoryDetails.mockRejectedValue(
      new BackendApiError('Request failed', { status: 0 })
    );

    renderPage();

    expect(
      await screen.findByTestId('repository-details-error')
    ).toBeInTheDocument();
  });

  it('should show a not-found state when the repository does not exist', async () => {
    getRepositoryDetails.mockRejectedValue(backendError(404));

    renderPage('missing');

    expect(await screen.findByTestId('repository-not-found')).toHaveTextContent(
      'This repository does not exist.'
    );
    expect(
      screen.queryByTestId('repository-details-error')
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('back-to-repositories')).toBeInTheDocument();
  });

  it('should not load descriptions when the repository does not exist', async () => {
    getRepositoryDetails.mockRejectedValue(backendError(404));

    renderPage('missing');

    await screen.findByTestId('repository-not-found');

    expect(getSkillDescriptions).not.toHaveBeenCalled();
  });
});
