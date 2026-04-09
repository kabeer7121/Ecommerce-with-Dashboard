# Release Notes

## Version: 2026.04

This release prepares the project for real deployment and repository publishing.

## Highlights

- Admin + storefront UX improvements
  - Product editor and category sections are collapsible
  - Add New Product flow opens editor automatically
  - Reviews UX improved with star interactions and image viewer navigation

- CMS customization upgrades
  - Site name/logo/footer brand text controls
  - Top news bar enable/disable + text
  - Contact details (phone/email/address) centralized and auto-applied site-wide
  - Country/currency selector wired to price formatting across pages

- Review system enhancements
  - Image reviews end-to-end
  - Admin moderation with approve/decline/delete and view modal
  - Product page uses real reviews display logic

- Dashboard improvements
  - KPI overview + status bars + top performing products
  - Order status filtering
  - Product category ordering controls

- Deployment readiness
  - Hostinger-friendly backend config (existing DB connection model)
  - New `README.md` and `HOSTINGER_DEPLOY.md`
  - Added `.htaccess` security/caching baseline
  - Added `LICENSE`
  - Removed obsolete/unneeded files

## Packaging

Two release archives are generated in `release/`:

- `hostinger-ready.zip`
- `github-repo.zip`
