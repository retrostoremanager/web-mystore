# Migration to Azure Static Web Apps

This guide walks you through completing the migration from Azure Storage Static Website to Azure Static Web Apps. The codebase is already prepared; you need to create the Azure resource and configure a few settings.

## What's Already Done

- **staticwebapp.config.json** – Added for SPA routing (React Router fallback to index.html)
- **deploy-web-app.yml** – Updated to deploy to Azure Static Web Apps instead of Storage

## Step 1: Create the Static Web App in Azure

1. Go to [Azure Portal](https://portal.azure.com) → **Create a resource**
2. Search for **Static Web App** → **Create**
3. Fill in the form:

   | Field | Value |
   |-------|-------|
   | Subscription | Your subscription |
   | Resource group | Same as your other MyStore resources (e.g. `mystore-rg-dev`) |
   | Name | `mystore-swadev` (or similar) |
   | Plan type | **Free** |
   | Region | Same as your Function App |

4. **Deployment details**:
   - **Deployment source**: **Other** (choose this to get the deployment token without Azure creating a duplicate workflow)
   - Leave the rest blank – we're using our own GitHub workflow

5. Click **Review + create** → **Create**

6. After creation, go to the Static Web App → **Overview**
7. Copy the **Deployment token** (or use **Manage deployment token**)

## Step 2: Add GitHub Secret

1. Go to your **web-mystore** repo on GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. **New repository secret**
   - **Name**: `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - **Value**: Paste the deployment token from Step 1

## Step 3: Configure Build Environment (Optional)

If you need to change the API URL (e.g. to `https://dev-api.retrostoremanager.com/api`), edit `.github/workflows/deploy-web-app.yml`:

```yaml
env:
  VITE_API_URL: https://dev-api.retrostoremanager.com/api  # or your Function App URL
```

Add other `VITE_*` variables here if needed (e.g. `VITE_STRIPE_PUBLISHABLE_KEY`).

## Step 4: Add Custom Domain

1. In the Static Web App → **Custom domains** → **+ Add**
2. **Custom domain**: `dev.retrostoremanager.com`
3. Azure will show the CNAME target (e.g. `mystore-swadev.azurestaticapps.net`)

4. In **Cloudflare** (or your DNS provider):
   - **Type**: CNAME
   - **Name**: `dev`
   - **Target**: `mystore-swadev.azurestaticapps.net` (use the value from Azure)
   - **Proxy**: DNS only (gray cloud) while testing

5. Back in Azure, click **Add** – validation may take a few minutes

## Step 5: Update Backend Configuration

### Infra Workflow (infra-mystore repo)

After migration, update the deploy-infrastructure workflow so Key Vault secrets use the new URL:

In `infra-mystore/.github/workflows/deploy-infrastructure.yml`, change:

```yaml
BASE_URL="https://mystorestgdev.z13.web.core.windows.net"
```

to:

```yaml
BASE_URL="https://dev.retrostoremanager.com"
```

(Or use `https://mystore-swadev.azurestaticapps.net` if you haven't set up the custom domain yet.)

### Function App CORS

1. Azure Portal → Function App (`mystore-func-dev`) → **CORS**
2. Add: `https://dev.retrostoremanager.com`
3. Add: `https://mystore-swadev.azurestaticapps.net` (default URL)

### Key Vault Secrets

Update these secrets (via `configure-keyvault-secrets.ps1` or Azure Portal):

| Secret | New Value |
|--------|-----------|
| VerificationBaseUrl | `https://dev.retrostoremanager.com/verify` |
| PasswordResetBaseUrl | `https://dev.retrostoremanager.com/reset-password` |
| AllowedOrigins | `https://dev.retrostoremanager.com` |

### Entra External ID (CIAM)

In your Entra app registration, add redirect URIs:

- `https://dev.retrostoremanager.com`
- `https://dev.retrostoremanager.com/verify`
- `https://dev.retrostoremanager.com/reset-password`

## Step 6: Trigger Deployment

Push to the `development` branch or manually run the workflow:

1. GitHub → **Actions** → **Deploy Web App to Azure Static Web Apps**
2. **Run workflow**

## Step 7: (Optional) Add API Custom Domain

To use `dev-api.retrostoremanager.com` for your API:

1. Function App → **Custom domains** → Add `dev-api.retrostoremanager.com`
2. Request managed certificate
3. In Cloudflare: CNAME `dev-api` → `mystore-func-dev.azurewebsites.net`
4. Update `VITE_API_URL` in the workflow to `https://dev-api.retrostoremanager.com/api`

## Cleanup (After Migration)

Once everything works:

- You can stop deploying to Azure Storage `$web` – the workflow no longer does this
- The Storage account is still used by the Function App; only the static website hosting is replaced

## Troubleshooting

- **Build fails**: Check that `VITE_API_URL` is set in the workflow env
- **404 on refresh**: Ensure `staticwebapp.config.json` exists with the navigation fallback
- **CORS errors**: Add both the custom domain and `*.azurestaticapps.net` to Function App CORS
