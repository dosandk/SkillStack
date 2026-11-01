## Code review: branch `feature/42-order-export` vs `main`

**Verdict:** ❌ Request changes
**Motivation / Approach:** Export is requested in #42; adding it to `OrdersController` works but
duplicates the paging logic already in `OrderQueries`.
**Summary:** Endpoint meets 2 of 3 criteria, but it loads all orders into memory and has no
ownership check. **Build/tests:** ✅

### Spec review

| # | Requirement | Status | Evidence |
| --- | --- | --- | --- |
| 1 | `GET /orders/export` returns CSV | Met | `OrdersController.cs:58` |
| 2 | Only the caller's orders | Missing | no user filter, `OrdersController.cs:61` |
| 3 | Limit 10 000 rows | Partial | limit applied after `ToList()`, `OrdersController.cs:63` |

Scope creep: unrelated `TargetFramework` bump in `Api.csproj:4`.

### Findings

#### 🔴 Critical

1. **[Security] Export returns other users' orders (IDOR)** - `Api/OrdersController.cs:61` (blocker)
   - **Problem:** `_db.Orders` is queried without `UserId`; any authenticated user downloads all orders.
   - **Fix:** filter by `User.GetUserId()` before materializing.

#### 🟠 High

2. **[Performance] Whole table loaded before the limit** - `Api/OrdersController.cs:63` (blocker)
   - **Problem:** `.ToList().Take(10_000)` loads every row; large tables cause OOM.
   - **Fix:** `.Take(10_000).AsNoTracking().ToListAsync(ct)`.

#### 🔵 Low

3. **[Smell] Duplicated paging logic** - `Api/OrdersController.cs:55-70` (advisory)
   - **Problem:** same code as `OrderQueries.GetPage`.
   - **Fix:** Extract Method / reuse `OrderQueries`.

### ❓ Questions (unverified)

- Is the `TargetFramework` bump in `Api.csproj` intentional? CI image version not checked.

No files were changed. Tell me which fixes to apply.
