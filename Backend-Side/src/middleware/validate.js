const fail = (res, message) => res.status(400).json({ message });

//POST /api/products and PUT /api/products/:id
export const validateProduct = (req, res, next) => {
  const { name, sku, category, price, min_stock } = req.body;

  if (!name?.trim()) return fail(res, "Name is required");
  if (!sku?.trim()) return fail(res, "SKU is required");
  if (!category?.trim()) return fail(res, "Category is required");

  if (price === "" || price == null || isNaN(price))
    return fail(res, "Price is required and must be a number");
  if (Number(price) < 0) return fail(res, "Price cannot be negative");

  if (!Number.isInteger(Number(min_stock)) || Number(min_stock) < 0)
    return fail(res, "Minimum stock must be a whole number, 0 or more");

  next();
};

// POST /api/products/:id/stock
export const validateStock = (req, res, next) => {
  const { type, quantity, reason } = req.body;

  if (!["add", "remove"].includes(type))
    return fail(res, "Type must be add or remove");
  if (!Number.isInteger(Number(quantity)) || Number(quantity) <= 0)
    return fail(res, "Quantity must be a positive whole number");
  if (!reason?.trim()) return fail(res, "Reason is required");

  next();
};
