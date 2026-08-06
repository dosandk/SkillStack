## 1 Naming convention

- JavaScript/Typescript specific
- General naming convention

===

- Classical tools:
  - project docs
  - team competency level
  - editorconfig
  - ESLint
  - prettier
- AI integration:
  - rule
  - architecture docs
- Process: development
- Verification process: git hook, code review, ai-hook

note:
правило для іменування файлів

--

## 2 Single Responsibility Principle

- Classical tools:
  - project docs
  - team competency level
- AI integration: rule
- Process: development
- Verification process: code review

--

## 3 DRY

- Classical tools:
  - project docs
  - team competency level
- AI integration:
  - skill for code duplicates search
  - slash command
- Process: development
- Verification process: code review

--

## 4 KISS and YAGNI

- Classical tools:
  - project docs
  - team competency level
- AI integration:
  - code review agent
  - code review skill
- Process: development
- Verification process: code review

--

## 5 Code Comments Convention

- AI integration: rule
- Process: development
- Verification process: code review

--

## 6 Code Consistency

- Classical tools: team competency level
- AI integration: skill, code-consistency-agent
- Process: development
- Verification process: code review

--

## 7 Branching Strategy

- AI integration:
  - rule
  - "AGENT.md" or "CLAUDE.md"
  - part of "implement-task" skill
- Process: git
- Classical tools: "contribution.md"
- Verification process: git hook, CI/CD, code review

--

## 8 Commit Message Convention

- AI integration: skill: commit, slash-command: commit
- Classical tools: commit-lint
- Process: git
- Verification process: git hook, CI/CD, code review

--

## 9 Pull Request Size & Scope

- Classical tools: gh cli
- AI integration: skill, slash-command: create-pr
- Process: git
- Verification process: code review

--

## 10 Code Review Checklist

- AI integration: skill, slash-command
- Classical tool: "readme.md", "contribution.md", architecture docs
- Verification process: git hook, CI/CD, code review

--

====

## 11 Function Size & Complexity Limits

- AI integration: skill, slash-command
- Classical tools: ESLint + SonarJS
- Process: verification
- Verification process: git hook, CI/CD, code review

--

## 12 Unit Testing Best Practices

- AI integration: rule, skill, agent
- Classical tools: "contribution.md", architecture docs
- Process: testing
- Verification process: git hook, CI/CD

--

## 13 E2E Testing Best Practices

- Classical tools: team competency level
- AI integration: rule, skill, agent
- Process: testing
- Verification process: git hook, CI/CD

--

## 14 Test Coverage Guidelines & Code Quality Gates

- Classical tools: team competency level, test coverage cli
- AI integration: skill
- Process: testing
- Verification process: git hook, CI/CD

--

## 15 Mocking & Stubbing Best Practices

to discuss: частина якось флова чи процесу чи...

--

## 16 Error Handling Convention

--

## 17 Logging Best Practices

тут будуть специфічні практики для client, server та cli
їх розділимо на файли окремі

можливо дамо приклад з sentry...

- AI integration: rule
- Classical tools: team competency level

--

## 18 Security Best Practices

- Classical tools: team competency level, SonalLint, other tools
- AI integration: skill, agent: "security-check-agent"
- Process: validation
- Verification process: git hook, CI/CD

--

## 19 Dependency Vulnerability Management

- Classical tools: npm audit, dependabot, other cli tools
- AI integration: skill, agent: "dependency-vulnerability-agent"
- Process: validation
- Verification process: git hook, CI/CD

--

## 20 API Contract-First Design

- Classical tools: team competency level, project docs
- AI integration: rule, skill, agent
- Process: development
- Verification process: code review

Ось тут, можливо, треба робити до тестів

- Postphoned right now

--

## 21 Refactoring Best Practices

- Classical tools: team competency level, project docs
- AI integration: skill, agent
- Process: development
- Verification process: code review

--

## 22 Technical Debt Management

як фіксувати, тегувати, пріоритизувати борг

- Classical tools: team competency level, sonar, other cli tools
- AI integration: skill, agent
- Process: development
- Verification process: code review


- Postphoned right now

--

## 23 Documentation Convention

структура README, стиль,
коли писати ADR, який формат

- Classical tools: team competency level, team agreements
- AI integration: skill, agent
- Process: documentation
- Verification process: code review

--

## 24 Changelog & Semantic Versioning

- Classical tools: cli tools
- AI integration: skill
- Process: documentation
- Verification process: code review


- Postphoned right now
