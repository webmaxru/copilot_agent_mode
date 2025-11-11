/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: API endpoints for shopping cart management
 */

/**
 * @swagger
 * /api/cart/{branchId}:
 *   get:
 *     summary: Get or create active cart for a branch
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Branch ID
 *     responses:
 *       200:
 *         description: Active cart found or created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *
 * /api/cart/{cartId}/items:
 *   get:
 *     summary: Get all items in the cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cart (Order) ID
 *     responses:
 *       200:
 *         description: List of cart items with product details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                 total:
 *                   type: number
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cart (Order) ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *               - unitPrice
 *             properties:
 *               productId:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *               unitPrice:
 *                 type: number
 *     responses:
 *       201:
 *         description: Item added to cart
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderDetail'
 *
 * /api/cart/{cartId}/items/{itemId}:
 *   put:
 *     summary: Update cart item quantity
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cart (Order) ID
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order Detail ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Cart item updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderDetail'
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cart (Order) ID
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order Detail ID
 *     responses:
 *       204:
 *         description: Item removed from cart
 *
 * /api/cart/{cartId}/checkout:
 *   post:
 *     summary: Checkout cart (convert to order)
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cart (Order) ID
 *     responses:
 *       200:
 *         description: Cart converted to order
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 */

import express from 'express';
import { getOrdersRepository } from '../repositories/ordersRepo';
import { getOrderDetailsRepository } from '../repositories/orderDetailsRepo';
import { getProductsRepository } from '../repositories/productsRepo';
import { NotFoundError } from '../utils/errors';

const router = express.Router();

// Get or create active cart for a branch
router.get('/:branchId', async (req, res, next) => {
  try {
    const branchId = parseInt(req.params.branchId);
    const ordersRepo = await getOrdersRepository();

    let cart = await ordersRepo.findActiveCart(branchId);

    if (!cart) {
      // Create a new cart
      cart = await ordersRepo.create({
        branchId,
        orderDate: new Date().toISOString(),
        name: 'Shopping Cart',
        description: 'Active shopping cart',
        status: 'cart',
      });
    }

    res.json(cart);
  } catch (error) {
    next(error);
  }
});

// Get cart items with product details
router.get('/:cartId/items', async (req, res, next) => {
  try {
    const cartId = parseInt(req.params.cartId);
    const orderDetailsRepo = await getOrderDetailsRepository();
    const productsRepo = await getProductsRepository();

    const items = await orderDetailsRepo.findByOrderId(cartId);

    // Enrich items with product details
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const product = await productsRepo.findById(item.productId);
        return {
          ...item,
          product,
        };
      }),
    );

    const total = await orderDetailsRepo.getTotalValueByOrderId(cartId);

    res.json({
      items: enrichedItems,
      total,
    });
  } catch (error) {
    next(error);
  }
});

// Add item to cart
router.post('/:cartId/items', async (req, res, next) => {
  try {
    const cartId = parseInt(req.params.cartId);
    const { productId, quantity, unitPrice } = req.body;

    const orderDetailsRepo = await getOrderDetailsRepository();

    const item = await orderDetailsRepo.upsertCartItem(cartId, productId, quantity, unitPrice);

    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

// Update cart item quantity
router.put('/:cartId/items/:itemId', async (req, res, next) => {
  try {
    const itemId = parseInt(req.params.itemId);
    const { quantity } = req.body;

    const orderDetailsRepo = await getOrderDetailsRepository();

    const updatedItem = await orderDetailsRepo.update(itemId, { quantity });

    res.json(updatedItem);
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).send('Cart item not found');
    } else {
      next(error);
    }
  }
});

// Remove item from cart
router.delete('/:cartId/items/:itemId', async (req, res, next) => {
  try {
    const itemId = parseInt(req.params.itemId);

    const orderDetailsRepo = await getOrderDetailsRepository();

    await orderDetailsRepo.delete(itemId);

    res.status(204).send();
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).send('Cart item not found');
    } else {
      next(error);
    }
  }
});

// Checkout cart (convert to order)
router.post('/:cartId/checkout', async (req, res, next) => {
  try {
    const cartId = parseInt(req.params.cartId);
    const ordersRepo = await getOrdersRepository();

    const order = await ordersRepo.updateStatus(cartId, 'pending');

    res.json(order);
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).send('Cart not found');
    } else {
      next(error);
    }
  }
});

export default router;
