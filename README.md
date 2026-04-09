# ShopEase Ecommerce Website

Production-ready multi-page ecommerce website with:
- public storefront (`index`, `shop`, `product`, `cart`, `order`, `success`, `about`, `contact`)
- admin dashboard (`admin.html`) with login (`wp-admin.html`)
- PHP + MySQL backend APIs for auth, products, orders, and reviews
- CMS-style customization for branding/content settings

## Main Features

- Catalog browsing with category filters and search
- Product detail page with:
  - image gallery
  - buy box
  - real review system (stars, image reviews, image viewer)
- Cart, checkout, and success flow
- Admin dashboard:
  - product CRUD + gallery + highlights
  - order management + status updates + filters
  - review moderation (approve / decline / delete + view modal)
  - overview KPIs and charts (status + top products)
  - category management (add/remove/reorder)
  - customization:
    - site name/logo/footer brand text
    - top bar enable/disable + text
    - contact info (phone/email/address)
    - country/currency selector (applies across site)

## Tech Stack

- Frontend: HTML, CSS, Vanilla JavaScript
- Backend: PHP 8+, MySQL
- Icons/Fonts: Font Awesome, Google Fonts

## Project Structure

- `index.html`, `shop.html`, `product.html`, `cart.html`, `order.html`, `success.html`, `about.html`, `contact.html`
- `admin.html`, `wp-admin.html`
- `style.css`, `script.js`
- `backend/`
  - `api/auth/*`
  - `api/products/*`
  - `api/orders/*`
  - `api/reviews/*`
  - `schema.sql`, `helpers.php`, `config.php`, `install.php`

## Local Setup

1. Place project in a PHP-enabled server root (XAMPP/WAMP/Laragon), e.g. `htdocs/shopease`.
2. Configure DB in `backend/config.php` or via environment variables:
   - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`
3. Run installer:
   - `http://localhost/shopease/backend/install.php`
4. Open:
   - Store: `http://localhost/shopease/`
   - Admin login: `http://localhost/shopease/wp-admin.html`
5. Default admin:
   - username: `admin`
   - password: `admin123`

## Important Notes

- Product data is **not persisted in localStorage** anymore.
- Products/orders/reviews are expected to persist through backend APIs + database.
- Cart and some user session convenience values still use localStorage client-side.

## Deployment

Use the Hostinger deployment guide in `HOSTINGER_DEPLOY.md`.
