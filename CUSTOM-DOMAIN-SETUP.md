# Custom Domain Setup: dev.retrostoremanager.com

This guide walks you through adding your custom domain **dev.retrostoremanager.com** to your Azure Static Web App.

## Step 1: Add Custom Domain in Azure

1. Go to [Azure Portal](https://portal.azure.com) → **Static Web Apps** → **retrostoremanager-dev**
2. In the left menu, select **Custom domains**
3. Click **+ Add**
4. **Custom domain**: `dev.retrostoremanager.com`
5. Azure will show the **CNAME target** (e.g. `jolly-cliff-047c0730f.4.azurestaticapps.net`)
6. Leave the dialog open – you'll need the target for Step 2

## Step 2: Configure DNS in Cloudflare

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → select **retrostoremanager.com**
2. **DNS** → **Records** → **Add record**
3. Configure:
   - **Type**: CNAME
   - **Name**: `dev`
   - **Target**: `jolly-cliff-047c0730f.4.azurestaticapps.net` (use the value from Azure)
   - **Proxy status**: **DNS only** (gray cloud) – recommended for initial setup
4. Click **Save**

## Step 3: Complete Domain Validation in Azure

1. Back in Azure Static Web App → Custom domains
2. Click **Add** to complete adding the domain
3. Azure will validate the CNAME – this may take a few minutes
4. Once validated, Azure will provision a free managed SSL certificate

## Step 4: Update Backend (Entra External ID)

Add redirect URIs in your Entra app registration:

1. Azure Portal → **Microsoft Entra ID** → **App registrations** → your app
2. **Authentication** → **Add URI**
3. Add:
   - `https://dev.retrostoremanager.com`
   - `https://dev.retrostoremanager.com/verify`
   - `https://dev.retrostoremanager.com/reset-password`
4. Save

## Step 5: Apply Infrastructure Updates

The infra config is already updated for the custom domain. To apply:

**Option A – Deploy Bicep** (adds CORS + syncs Key Vault):
```powershell
cd infra-mystore
az deployment group create --resource-group mystore-rg-dev --template-file main.bicep --parameters "parameters.dev.json" postgresAdminPassword="<your-password>"
```

**Option B – Manual Key Vault update**:
```powershell
az keyvault secret set --vault-name mystore-kv-dev --name "VerificationBaseUrl" --value "https://dev.retrostoremanager.com/verify" --output none
az keyvault secret set --vault-name mystore-kv-dev --name "PasswordResetBaseUrl" --value "https://dev.retrostoremanager.com/reset-password" --output none
az keyvault secret set --vault-name mystore-kv-dev --name "AllowedOrigins" --value "https://dev.retrostoremanager.com" --output none
az functionapp restart --name mystore-func-dev --resource-group mystore-rg-dev
```

## Step 6: (Optional) Add API Custom Domain

To use `dev-api.retrostoremanager.com` for your API:

1. Function App → **Custom domains** → Add `dev-api.retrostoremanager.com`
2. Request managed certificate
3. In Cloudflare: CNAME `dev-api` → `mystore-func-dev.azurewebsites.net`
4. Update `VITE_API_URL` in `.github/workflows/deploy-web-app.yml` to `https://dev-api.retrostoremanager.com/api`

## Summary

| Step | Action |
|------|--------|
| 1 | Add custom domain in Azure Static Web App |
| 2 | Add CNAME record in Cloudflare: `dev` → `jolly-cliff-047c0730f.4.azurestaticapps.net` |
| 3 | Complete validation in Azure |
| 4 | Add redirect URIs in Entra |
| 5 | Deploy Bicep or update Key Vault manually |

After setup, your app will be available at **https://dev.retrostoremanager.com**.
