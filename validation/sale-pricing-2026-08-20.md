# Sale Pricing UI Verification

The direct administrator product route is `/products`; `/product-manager` is intentionally not registered and returns the application 404 page. The mobile `/products` route reaches the authenticated LESOUL Product Manager shell with the Product Manager header, category management, and product-add entry. The discount controls are rendered inside the add/edit form after product data loads or the administrator opens the product form.

Customer discount pricing is implemented through the shared product price resolver. Purchase request creation re-queries products on the server and uses the current effective sale price.
