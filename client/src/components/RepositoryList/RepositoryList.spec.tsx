import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RepositoryList } from './RepositoryList';

const { getRepositoriesList } = vi.hoisted(() => ({
  getRepositoriesList: vi.fn()
}));

vi.mock('@shared', async importOriginal => {
  const actual = await importOriginal<typeof import('@shared')>();

  return {
    ...actual,
    backendService: { getRepositoriesList, getRepositoryDetails: vi.fn() }
  };
});

const repositories = [
  {
    id: 'r1',
    repoSlug: 'octocat/hello-world',
    owner: 'octocat',
    defaultBranch: 'main',
    skills: ['a', 'b']
  },
  {
    id: 'id with/slash',
    repoSlug: 'eleks/awesome-skills',
    owner: 'eleks',
    defaultBranch: 'main',
    skills: ['c']
  }
];

function renderList() {
  return render(
    <MemoryRouter>
      <RepositoryList />
    </MemoryRouter>
  );
}

describe('RepositoryList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getRepositoriesList.mockResolvedValue({ repositories });
  });

  it('should link each repository to its own page', async () => {
    renderList();

    const items = await screen.findAllByTestId('repository-item');

    expect(items).toHaveLength(2);
    expect(within(items[0]).getByRole('link')).toHaveAttribute(
      'href',
      '/repositories/r1'
    );
    expect(within(items[1]).getByRole('link')).toHaveAttribute(
      'href',
      '/repositories/id%20with%2Fslash'
    );
  });

  it('should keep showing the repository name, owner and skill count', async () => {
    renderList();

    const [first] = await screen.findAllByTestId('repository-item');

    expect(within(first).getByText('octocat/hello-world')).toBeInTheDocument();
    expect(within(first).getByText('octocat')).toBeInTheDocument();
    expect(
      within(first).getByTestId('repository-skill-count')
    ).toHaveTextContent('2 skills');
  });

  it('should show the empty state when there are no repositories', async () => {
    getRepositoriesList.mockResolvedValue({ repositories: [] });

    renderList();

    expect(await screen.findByTestId('repository-empty')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
