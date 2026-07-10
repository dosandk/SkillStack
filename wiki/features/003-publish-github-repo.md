## Feature 3 — Publish a GitHub repo with skills

As a user, I want to publish my GitHub repository of skills to the system.

Tasks:

- [ ] Task 3.1 [FE] — build a form for submitting a GitHub repo link
- [ ] Task 3.2 [FE] — build a table listing the user's submitted repositories
- [ ] Task 3.3 [BE] — implement an API endpoint that stores GitHub repo information
- [ ] Task 3.4 [BE] — implement an API endpoint that returns the list of the user's submitted repos
- [ ] Task 3.5 [BE] — implement an API endpoint that deletes a specific repo from the system

### Task 3.1

Build a form that lets a logged-in user submit a GitHub repository link.

- Place it on the `/profile` page
- Provide a single URL input field for the GitHub repo link
- Validate the input as a well-formed GitHub repo URL before submitting
- On submit, call the store-repo API (Task 3.3)
- After a successful submit, the repo should appear in the table (Task 3.2) with `pending` status

### Task 3.2

Build a table that lists the repositories submitted by the logged-in user.

- Use eleks-ui components
- Load the data from the list-repos API (Task 3.4)
- Show for each repo: repo owner, repo name, validation status, and submission date
- Add a delete action per row that calls the delete-repo API (Task 3.5)
- Use mock data until the APIs are available

### Task 3.3

Create an API, implemented as a Firebase Cloud Function, that stores the submitted GitHub repo
information.

- Accept the GitHub repo URL from the authenticated user
- Persist the repo linked to the current user
- Store only the reference (repo owner, repo name, latest commit hash), not the skill files
- Set the initial validation status to `pending`
- Return the created record

### Task 3.4

Create an API, implemented as a Firebase Cloud Function, that returns the list of repositories
submitted by the authenticated user.

- Return only the current user's repos
- Include repo owner, repo name, validation status, and timestamps
- Support pagination

### Task 3.5

Create an API, implemented as a Firebase Cloud Function, that deletes a specific repository from the
system.

- Accept the repo identifier from the authenticated user
- Allow deleting only a repo that belongs to the current user
- Return a confirmation of the deletion
