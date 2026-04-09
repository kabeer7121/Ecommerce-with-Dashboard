# Hostinger Deployment Guide (PHP + MySQL)

This guide deploys ShopEase to a Hostinger shared hosting account.

## 1) Create Database in Hostinger

In hPanel:
1. Go to **Databases > MySQL Databases**
2. Create:
   - database name
   - database user
   - database password
3. Note:
   - DB host
   - DB port (usually `3306`)
   - DB name/user/password

## 2) Upload Project Files

1. Open **File Manager**
2. Upload all project files to your target domain folder (usually `public_html`)
3. Ensure `backend/` is uploaded as well.

## 3) Configure Database Credentials

Edit `backend/config.php` defaults if needed, or set server env vars:
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASS`

If you do not use environment variables, update constant defaults directly in `backend/config.php`.

## 4) Install Schema

Open in browser:
- `https://your-domain.com/backend/install.php`

This creates tables and default admin (if missing).

## 5) Test Website

- Storefront: `https://your-domain.com/`
- Admin login: `https://your-domain.com/wp-admin.html`
- Admin default credentials:
  - user: `admin`
  - pass: `admin123`

## 6) Recommended Post-Deploy Actions

1. Login to admin and change data/customization values.
2. Change admin password in DB (or implement password-change route).
3. Remove or protect `backend/install.php` after successful setup.
4. Enable HTTPS (Hostinger SSL).

## 7) Troubleshooting

- **500 error on API calls**
  - verify PHP version and DB credentials
  - check Hostinger error logs

- **Login or save fails**
  - verify DB user privileges
  - run installer again to ensure schema exists

- **Site works but data not saving**
  - ensure `backend/api/*` routes are reachable
  - verify session/cookie behavior on your domain
