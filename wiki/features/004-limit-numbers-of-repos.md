## Feature 4 — Limit the number of repos a user can submit

As a user, I want to know how many repositories I can submit, and the system should stop me from
exceeding that limit.

Tasks:

- [ ] Task 4.1 [FE] — show the submission limit on the profile page
- [ ] Task 4.2 [BE] — enforce the maximum number of stored repositories per user (limit: 10)

### Task 4.1

Show the repository submission limit on the `/profile` page.

- Display the limit and the user's current usage (e.g. `3 / 10 repositories`)
- When the limit is reached, disable the submit form (Task 3.1) and explain why

### Task 4.2

Enforce the per-user repository limit in the store-repo API (Task 3.3).

- Before storing a repo, count how many the user already has
- Reject the request when the user already has 10 repositories
- Return a clear error the front end can show to the user
- Keep the limit configurable rather than hard-coded inline
