# API Routing Examples

This document provides example `fetch` requests for *Libre* API endpoints. With backend server running at `http://localhost:5000`.

---

## Authentication

### Sign Up

```js
fetch("http://localhost:5000/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
    credentials: "include"
})
```

### Login

```js
fetch("http://localhost:5000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    credentials: "include"
});
```

### Get Current User

```js
fetch("http://localhost:5000/me", {
    method: "GET",
    credentials: "include"
});
```

---

## Cart Operations

### Add to Cart

```js
fetch("http://localhost:5000/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, quantity }),
    credentials: "include"
});
```

### Remove Quantity from Cart

```js
fetch("http://localhost:5000/cart/12345", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity }),
    credentials: "include"
});
```

### Remove Item from Cart

```js
fetch("http://localhost:5000/cart/remove/12345", {
    method: "DELETE",
    credentials: "include"
});
```

---

## Product Ratings

### Rate a Product

```js
fetch("http://localhost:5000/rate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, rating }),
    credentials: "include"
});
```

### Get Product Rating

```js
fetch("http://localhost:5000/rating/{productId}", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId }),
    credentials: "include"
});
```

### Remove a Product Rating
```js
fetch("http://localhost:5000/rating/12345", {
    method: "GET"
});
```


---

## Wishlist

### Add to Wishlist

```js
fetch("http://localhost:5000/wishlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId: "12345" }),
    credentials: "include"
});
```

### Remove from Wishlist

```js
fetch("http://localhost:5000/wishlist/remove", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId: "12345" }),
    credentials: "include"
});
```

### Get Wishlist

```js
fetch("http://localhost:5000/wishlist", {
    method: "GET",
    credentials: "include"
});
```

---

> **Note:**  
> Replace variables like `username`, `email`, `password`, `productId`, and `quantity` with actual values as needed.