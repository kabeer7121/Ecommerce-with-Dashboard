## ShopEase PHP + MySQL Backend

### 1) Prerequisites
- Install XAMPP (Apache + MySQL).
- Put this project inside `htdocs`, e.g.:
  `C:\xampp\htdocs\for-sell`

### 2) Configure DB
- Open `backend/config.php`.
- Update DB credentials if needed.
  - Default XAMPP usually works with:
    - user: `root`
    - password: empty

### 3) Run installer
- In browser, open:
  `http://localhost/for-sell/backend/install.php`
- This will:
  - create all tables in configured database
  - create default admin user (if missing)

### 4) Default admin
- username: `admin`
- password: `admin123`

### 5) API endpoints
- Auth:
  - `backend/api/auth/login.php` (POST)
  - `backend/api/auth/logout.php` (POST)
  - `backend/api/auth/me.php` (GET)
- Products:
  - `backend/api/products/list.php` (GET)
  - `backend/api/products/save.php` (POST, admin)
  - `backend/api/products/delete.php` (POST, admin)
- Orders:
  - `backend/api/orders/list.php` (GET, admin)
  - `backend/api/orders/save.php` (POST)
  - `backend/api/orders/status.php` (POST, admin)
- Reviews:
  - `backend/api/reviews/list.php` (GET)
  - `backend/api/reviews/save.php` (POST)
  - `backend/api/reviews/status.php` (POST, admin)
  - `backend/api/reviews/delete.php` (POST, admin)
