Feature: Shopping Cart Management
  As a customer of OctoCAT Supply
  I want to view and manage my shopping cart
  So that I can review items before purchasing and control my order

  Background:
    Given the user is on the OctoCAT Supply website
    And the cart context is initialized
    And localStorage is cleared

  # Cart Icon Visibility and Badge
  Scenario: Cart icon is visible in navigation
    When the user views the navigation bar
    Then the cart icon should be visible
    And the cart icon should display a badge with "0" items

  Scenario: Cart badge updates when items are added
    Given the user has added 2 "Smart Cat Feeder" items to the cart
    When the user views the navigation bar
    Then the cart icon badge should display "2"

  Scenario: Cart badge updates with multiple product quantities
    Given the user has added the following items to the cart:
      | Product Name        | Quantity |
      | Smart Cat Feeder    | 3        |
      | AI Cat Toy          | 2        |
      | Cat Health Monitor  | 1        |
    When the user views the navigation bar
    Then the cart icon badge should display "6"

  # Empty Cart State
  Scenario: Viewing an empty cart
    When the user navigates to "/cart"
    Then the page should display "Your cart is empty" message
    And the page should display an empty cart icon
    And the page should display "Add some products to get started" text
    And a "Browse Products" button should be visible
    And the "Browse Products" button should link to "/products"

  # Cart with Items
  Scenario: Viewing cart with single item
    Given the user has added 1 "Smart Cat Feeder" with price "$89.99" to the cart
    When the user navigates to "/cart"
    Then the cart should display the page title "Shopping Cart"
    And the cart should display a table header with columns:
      | S. No. | Product Image | Product Name | Unit Price | Quantity | Total | Remove |
    And the cart should display 1 item row
    And the item row should show serial number "1"
    And the item row should show product name "Smart Cat Feeder"
    And the item row should show unit price "$89.99"
    And the item row should show quantity "1"
    And the item row should show item total "$89.99"

  Scenario: Viewing cart with multiple items
    Given the user has added the following items to the cart:
      | Product Name        | Price   | Quantity |
      | Smart Cat Feeder    | $89.99  | 2        |
      | AI Cat Toy          | $49.99  | 1        |
    When the user navigates to "/cart"
    Then the cart should display 2 item rows
    And row 1 should show "Smart Cat Feeder" with total "$179.98"
    And row 2 should show "AI Cat Toy" with total "$49.99"

  # Discount Handling
  Scenario: Cart displays discounted price correctly
    Given the user has added 1 "Premium Cat Tracker" with price "$199.99" and discount "20%" to the cart
    When the user navigates to "/cart"
    Then the item row should show unit price "$159.99"
    And the item row should show item total "$159.99"

  # Quantity Management
  Scenario: Increasing item quantity in cart
    Given the user has added 1 "Smart Cat Feeder" with price "$89.99" to the cart
    And the user is on the "/cart" page
    When the user clicks the increment button for "Smart Cat Feeder"
    Then the quantity should update to "2"
    And the item total should update to "$179.98"
    And the cart badge should display "2"

  Scenario: Decreasing item quantity in cart
    Given the user has added 3 "Smart Cat Feeder" with price "$89.99" to the cart
    And the user is on the "/cart" page
    When the user clicks the decrement button for "Smart Cat Feeder"
    Then the quantity should update to "2"
    And the item total should update to "$179.98"
    And the cart badge should display "2"

  Scenario: Manually entering quantity
    Given the user has added 1 "Smart Cat Feeder" with price "$89.99" to the cart
    And the user is on the "/cart" page
    When the user enters "5" in the quantity input for "Smart Cat Feeder"
    Then the quantity should update to "5"
    And the item total should update to "$449.95"

  Scenario: Quantity cannot be set to zero via input
    Given the user has added 2 "Smart Cat Feeder" to the cart
    And the user is on the "/cart" page
    When the user enters "0" in the quantity input for "Smart Cat Feeder"
    Then the item should be removed from the cart
    And the cart should display "Your cart is empty" message

  # Remove Item
  Scenario: Removing an item from cart
    Given the user has added the following items to the cart:
      | Product Name        | Quantity |
      | Smart Cat Feeder    | 2        |
      | AI Cat Toy          | 1        |
    And the user is on the "/cart" page
    When the user clicks the remove button for "AI Cat Toy"
    Then "AI Cat Toy" should not be visible in the cart
    And the cart should display 1 item row
    And the cart badge should display "2"

  Scenario: Removing the last item shows empty cart
    Given the user has added 1 "Smart Cat Feeder" to the cart
    And the user is on the "/cart" page
    When the user clicks the remove button for "Smart Cat Feeder"
    Then the cart should display "Your cart is empty" message
    And the cart badge should display "0"

  # Order Summary
  Scenario: Order summary displays correct subtotal
    Given the user has added the following items to the cart:
      | Product Name        | Price   | Quantity |
      | Smart Cat Feeder    | $89.99  | 2        |
      | AI Cat Toy          | $49.99  | 1        |
    When the user views the cart page
    Then the order summary should display subtotal "$229.97"

  Scenario: Shipping cost applied when subtotal is below threshold
    Given the user has added 1 "AI Cat Toy" with price "$49.99" to the cart
    When the user views the cart page
    Then the order summary should display subtotal "$49.99"
    And the order summary should display shipping cost "$25.00"
    And the order summary should display total "$74.99"

  Scenario: Free shipping when subtotal meets threshold
    Given the user has added 2 "Smart Cat Feeder" with price "$89.99" to the cart
    When the user views the cart page
    Then the order summary should display subtotal "$179.98"
    And the order summary should display shipping cost "$0.00"
    And the order summary should display "FREE" shipping indicator
    And the order summary should display total "$179.98"

  Scenario: Free shipping threshold indicator
    Given the user has added 1 "Smart Cat Feeder" with price "$89.99" to the cart
    When the user views the cart page
    And the subtotal is below "$100.00"
    Then a message should display "Add $10.01 more for free shipping!"

  # Cart Persistence
  Scenario: Cart persists in localStorage
    Given the user has added 1 "Smart Cat Feeder" to the cart
    When the user refreshes the page
    Then the cart should still contain 1 "Smart Cat Feeder"
    And the cart badge should display "1"

  Scenario: Cart loads from localStorage on initial load
    Given the cart in localStorage contains 2 "AI Cat Toy" items
    When the user visits the website
    Then the cart badge should display "2"
    When the user navigates to "/cart"
    Then the cart should display 1 item row with "AI Cat Toy"

  # Theme Support
  Scenario: Cart page respects dark mode
    Given dark mode is enabled
    When the user navigates to "/cart"
    Then the cart page should use dark theme colors
    And the background should be dark
    And the text should be light colored

  Scenario: Cart page respects light mode
    Given dark mode is disabled
    When the user navigates to "/cart"
    Then the cart page should use light theme colors
    And the background should be light gray
    And the text should be dark colored

  # Navigation
  Scenario: Clicking cart icon navigates to cart page
    Given the user is on any page
    When the user clicks the cart icon in navigation
    Then the user should be redirected to "/cart"

  Scenario: Continue shopping from empty cart
    Given the user has an empty cart
    And the user is on the "/cart" page
    When the user clicks "Browse Products" button
    Then the user should be redirected to "/products"

  # Mobile Responsiveness
  Scenario: Cart table adapts to mobile view
    Given the user is viewing the cart on a mobile device
    And the user has items in the cart
    When the screen width is less than 768px
    Then the table header should be hidden
    And each cart item should display in a stacked mobile layout

  # Edge Cases
  Scenario: Adding same product multiple times consolidates quantity
    Given the user has added 2 "Smart Cat Feeder" to the cart
    When the user adds 3 more "Smart Cat Feeder" to the cart
    Then the cart should display 1 item row for "Smart Cat Feeder"
    And the quantity should show "5"
    And the cart badge should display "5"

  Scenario: Cart handles products with images
    Given the user has added 1 "Smart Cat Feeder" with image "cat-feeder.jpg" to the cart
    When the user views the cart page
    Then the product image should be displayed
    And the image src should contain "cat-feeder.jpg"

  Scenario: Decimal precision in price calculations
    Given the user has added 3 "Product A" with price "$10.99" to the cart
    When the user views the cart page
    Then the item total should display "$32.97"
    And the subtotal should display "$32.97"
