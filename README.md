# Product Inventory Manager

A simple full-stack app to manage products and track every stock change. Built with React, Node.js, Express and PostgreSQL, with intentionally minimal complexity (no ORM, no state library, no auth).

---

## 1. Features

- Create, edit and delete products (name, SKU, category, price, minimum stock level)
- Add or remove stock with a quantity and a reason
- Current stock shown for every product
- Full stock movement history, newest first
- Search products by name, SKU or category
- Filter products by category
- Products below their minimum stock level are highlighted in red and marked "(low)"

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, plain CSS, built-in `fetch` |
| Backend | Node.js (ES modules), Express |
| Database | PostgreSQL (`pg` driver, raw SQL) |
| Config | `dotenv` |

---

## 3. Project Structure

```
Product-Inventory-Management/
├── Backend-Side/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                  # pg Pool
│   │   ├── routes/
│   │   │   ├── product.routes.js      # products + stock change routes
│   │   │   └── stock.routes.js        # stock movement history route
│   │   ├── controllers/
│   │   │   ├── product.controller.js  # product CRUD, search, changeStock (transaction)
│   │   │   └── stock.controller.js    # movement history
│   │   ├── middleware/
│   │   │   └── validate.js            # product + stock validation
│   │   └── app.js                     # express setup, route mounting, error handler
│   ├                     
│   ├── .env
│   ├── .gitignore
│   └── package.json
│
└── Frontend-Side/
    ├── src/
    │   ├── services/
    │   │   └── api.js                 # all backend calls
    │   ├── components/
    │   │   ├── ProductForm.jsx
    │   │   ├── StockForm.jsx
    │   │   ├── ProductTable.jsx
    │   │   └── MovementTable.jsx
    │   ├── pages/
    │   │   ├── ProductsPage.jsx
    │   │   └── MovementsPage.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js                 # dev server port + /api proxy
    ├── .env
    ├── .gitignore
    └── package.json
```

> Folder names may differ in your copy of the repo. Adjust the paths in the commands below if so.

---

## 4. Getting Started

### Prerequisites

- Node.js 18 or newer
- PostgreSQL 13 or newer (with `psql` available)

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Product-Inventory-Management
```

### 2. Set up the database

```bash
createdb inventory
psql -d inventory -f Backend-Side/schema.sql
```

This creates both tables and inserts a few sample products with stock movements.

### 3. Set up the backend

```bash
cd Backend-Side
npm install
```

Create `Backend-Side/.env`:

```
PORT=3000
DATABASE_URL=postgres://USER:TRUST@localhost:5432/inventory
```

Replace `USER` and `PASSWORD` with your PostgreSQL credentials, then start the API:

```bash
npm run dev
# API running on http://localhost:3000
```

Quick check: open `http://localhost:3000/api/products` in a browser. You should see JSON with a `products` array.

### 4. Set up the frontend

Open a second terminal:

```bash
cd Frontend-Side
npm install
```

Create `Frontend-Side/.env`:

```
FRONTEND_PORT=5173
API_URL=http://localhost:3000
```

Start the app:

```bash
npm run dev
# http://localhost:5173
```

The frontend uses a Vite proxy, so every `/api` request is forwarded to `API_URL`. No CORS setup is needed during development. Restart the Vite server after changing `.env`.

---

## 5. API Endpoints

Base URL: `http://localhost:3000`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products?search=&category=` | List products with current stock. `search` matches name, SKU or category. `category` is an exact filter. |
| GET | `/api/products/categories` | Distinct categories (for the filter dropdown) |
| POST | `/api/products` | Create a product |
| PUT | `/api/products/:id` | Edit a product |
| DELETE | `/api/products/:id` | Delete a product and its stock history |
| POST | `/api/products/:id/stock` | Add or remove stock |
| GET | `/api/movements` | Stock movement history (latest 200, newest first) |

### Request bodies

Create / edit product:

```json
{ "name": "Wireless Mouse", "sku": "MOU-010", "category": "Peripherals", "price": 799, "min_stock": 10 }
```

Add or remove stock:

```json
{ "type": "add", "quantity": 40, "reason": "Initial stock" }
```

```json
{ "type": "remove", "quantity": 5, "reason": "Sold" }
```

### Responses

Success responses contain a `message` plus the data:

```json
{ "message": "Products fetched successfully", "products": [ ... ] }
{ "message": "Product created successfully", "product": { ... } }
{ "message": "Stock added successfully", "movement": { ... }, "stock": 40 }
{ "message": "Stock movements fetched successfully", "movements": [ ... ] }
```

Errors contain only a `message`:

```json
{ "message": "Only 10 in stock, cannot remove 50" }
```

| Status | Meaning |
|---|---|
| 200 / 201 | Success |
| 400 | Validation error, or removing more stock than available |
| 404 | Product not found |
| 409 | SKU already exists |
| 500 | Unexpected server error |

---

## 6. Database

Two tables: `products` and `stock_movements`.

```sql
CREATE TABLE products (
  id        SERIAL PRIMARY KEY,
  name      TEXT NOT NULL,
  sku       TEXT NOT NULL UNIQUE,
  category  TEXT NOT NULL,
  price     NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  min_stock INTEGER NOT NULL DEFAULT 0 CHECK (min_stock >= 0)
);

-- quantity: positive = stock added, negative = stock removed
CREATE TABLE stock_movements (
  id         SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity   INTEGER NOT NULL CHECK (quantity <> 0),
  reason     TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**How current stock works:** there is no stock column on `products`. Current stock is always the sum of that product's movements:

```
+50 (Initial stock), -35 (Sold), -4 (Damaged)  =>  current stock = 11
```

Because stock is calculated from the history, the two can never get out of sync. A product with no movements has stock 0.

---

## 7. Validation Rules

| Rule | Where it is enforced |
|---|---|
| Name, SKU and category are required | `validate.js` |
| SKU must be unique | Database `UNIQUE` constraint, returned as HTTP 409 |
| Price is required, numeric and cannot be negative | `validate.js` and database `CHECK` |
| Minimum stock is a whole number, 0 or more | `validate.js` and database `CHECK` |
| Stock `type` must be `add` or `remove` | `validate.js` |
| Stock quantity must be a positive whole number | `validate.js` |
| Stock reason is required | `validate.js` |
| Stock removal must not make stock negative | `changeStock` controller, inside a transaction with a row lock (`SELECT ... FOR UPDATE`) |

---

## 8. Project Status

**Completed.** All required features are implemented and manually tested:

- [x] Product list, create, edit, delete
- [x] Search and category filter
- [x] Stock add and remove with reason
- [x] Stock movement history
- [x] Low stock highlighting
- [x] Validation (unique SKU, no negative price, no negative stock)

---

## 9. Known Issues and Limitations

- **New products start with 0 stock.** Creating a product does not add an opening stock, so it shows as "low" until stock is added with the Stock button.
- **Deleting a product deletes its history.** Its stock movements are removed too (`ON DELETE CASCADE`).
- **History is capped at the latest 200 movements** and has no pagination.
- **The product list has no pagination.** All matching products load at once.
- **Search is not debounced.** One request is sent on every keystroke.
- **Category filter is an exact, case-sensitive match.** Categories typed with different spelling or case (for example "audio" and "Audio") are treated as different categories.
- **No authentication or user roles.** Anyone who can reach the API can change data.
- **Stock movements cannot be edited or undone.** To correct a mistake, add a new opposite movement.
- **No automated tests.** Testing so far has been manual (Postman and the UI).
- **Not production ready.** There is no rate limiting, request logging or Docker setup, and CORS is not configured because development relies on the Vite proxy.
