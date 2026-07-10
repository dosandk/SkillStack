## Feature 1 — Browse and search skills

Status: new

As a user, I want to browse and search skills through the web interface.

Tasks:

- [ ] Task 1.1 [FE] — build the web page that displays the list of skills
- [ ] Task 1.2 [BE] — create an API that returns the list of skills
- [ ] Task 1.3 [FE] — add a search bar to the skills list page
- [ ] Task 1.4 [BE] — create an API that searches skills

### Task 1.1

Create a page that shows the list of skills.

- Serve it on the root path `/`
- Use eleks-ui components
- Use mock data for the skills
- Add pagination to the list

Each skill item (DTO) should contain the following fields:

- Repo owner — e.g. `John Doe`
- Repo name — e.g. `super-repo`
- Title — e.g. `Git commit skill`
- Description — e.g. `Helps write a good commit message based on the changed files`

### Task 1.2

Create an API, implemented as a Firebase Cloud Function, that returns the list of skills.

- Use mock data for the skills list
- Support pagination

### Task 1.3

Add a search bar to the skills list page.

- Use the skills search API (Task 1.4)

### Task 1.4

Create an API, implemented as a Firebase Cloud Function, that searches skills by name
or description.
