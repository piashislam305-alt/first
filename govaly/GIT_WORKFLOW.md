# Team Git Workflow — Customer_Repo

Per the project PDF: all work goes into `dev` via Pull Request. Never commit directly
to `main` (or `dev`).

## One-time setup

```bash
git clone <CUSTOMER_REPO_URL>
cd Customer_Repo            # (repo root — place server/ and client/ inside if needed)
```

## Start your feature branch (from dev)

```bash
git checkout dev
git pull origin dev
git checkout -b dev_Pias        # your personal branch
```

## Copy this project in & push

```bash
# copy the contents of the govaly/ folder into the repo (keep .gitignore!)
cp -r /path/to/govaly/* /path/to/Customer_Repo/
cp /path/to/govaly/.gitignore /path/to/Customer_Repo/

git add .
git status                       # sanity check: no node_modules, no dist, no .env
git commit -m "feat: customer storefront (home, auth, catalog, product, cart, checkout, orders, reviews)"
git push -u origin dev_Pias
```

## Open a Pull Request into dev

1. GitHub → **Customer_Repo** → *Pull requests* → *New pull request*
2. base: **`dev`** ← compare: **`dev_Pias`**
3. Add teammates as reviewers → merge after approval (squash & merge recommended)

## Keep your branch updated while working

```bash
git fetch origin
git rebase origin/dev            # or merge
git push --force-with-lease      # only after a rebase
```

> Note: `server/.env` is intentionally not committed (see `.gitignore`).
> The app runs without it; for production set `MONGO_URI`, `JWT_SECRET`, `PORT`.

## Suggested commit split (if you prefer small PRs)

| Commit | Contents |
|---|---|
| `feat(api): catalog, auth, orders, reviews, coupons` | `server/` |
| `feat(web): storefront pages & reusable ProductCard` | `client/src` |
| `chore: assets, fonts, seed catalog & docs` | `client/public`, README, docs |
