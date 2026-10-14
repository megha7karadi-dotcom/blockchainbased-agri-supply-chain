# Custom Domain Setup Guide for AgriTrace

This guide details the exact manual steps required to connect your custom domain (e.g. `agritrace.org` or `app.yourdomain.com`) to this application before public launch.

---

## 1. Domain Registrar DNS Configuration

Log in to your domain registrar (Cloudflare, Namecheap, GoDaddy, Google Domains / Squarespace) and add the following standard DNS records:

### For Apex Domain (`yourdomain.com`):
| Type | Name | Value / Target | TTL | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `@` | Host IP from Cloud Provider (or Cloudflare Proxy) | Auto / 300s | Routes root apex traffic |
| **CNAME** | `www` | `yourdomain.com` | Auto / 300s | Aliases www to root apex |

### For Subdomain (e.g. `trace.yourdomain.com` or `app.yourdomain.com`):
| Type | Name | Value / Target | TTL | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **CNAME** | `trace` (or `app`) | `ghs.googlehosted.com` (or Cloud Run domain mapping target) | Auto / 300s | Dedicated app domain |

---

## 2. Cloud Run / Host Domain Mapping

If deploying on Google Cloud Run:
1. Open the [Google Cloud Console](https://console.cloud.google.com/run).
2. Go to **Cloud Run** > **Manage Custom Domains**.
3. Click **Add Mapping**:
   - **Service to route to**: Select your `agritrace` service.
   - **Domain**: Enter your apex domain (`yourdomain.com`) or subdomain (`trace.yourdomain.com`).
4. Copy the verified TXT verification record and paste it into your DNS registrar.
5. Google Cloud automatically provisions an SSL/TLS certificate (Let's Encrypt / Google Trust Services) within 15 to 60 minutes once DNS propagates.

---

## 3. Environment Variables

In your deployment environment (or production `.env`), ensure the canonical URL is set:

```env
CUSTOM_DOMAIN=yourdomain.com
VITE_APP_URL=https://yourdomain.com
```

---

## 4. Pre-Launch Verification Checklist

- [x] Favicon added (`/public/favicon.svg` with emerald agricultural leaf)
- [x] Canonical URL tag registered in `index.html` (`<link rel="canonical" href="https://yourdomain.com" />`)
- [x] "Made with AI" tags, artificial watermarks, and neon markers purged
- [x] Privacy Policy page live at `/privacy`
- [x] Terms and Conditions page live at `/terms`
- [x] Fake reviews replaced with dynamic customer feedback state
- [x] Typography standardized to clean professional modern sans-serif (Inter)
- [x] Purple gradients, emoji icons, and em dashes removed
