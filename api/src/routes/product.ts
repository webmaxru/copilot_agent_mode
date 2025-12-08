/**
 * @swagger
 * tags:
 *   name: Products
 *   description: API endpoints for managing products
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Returns all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of all products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *
 * /api/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *   put:
 *     summary: Update a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       204:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 */

import express from 'express';
import { Product } from '../models/product';
import { getProductsRepository } from '../repositories/productsRepo';
import { handleDatabaseError, NotFoundError } from '../utils/errors';

const router = express.Router();

/**
 * POST /api/products
 * Creates a new product in the catalog.
 * Products must be associated with a valid supplier.
 * 
 * @param {Object} req.body - Product data (excluding productId which is auto-generated)
 * @returns {Object} 201 - Created product with generated ID
 * @throws {ValidationError} 400 - Invalid request data (e.g., missing required fields)
 * @throws {ConflictError} 409 - Supplier does not exist or SKU conflict
 * @throws {DatabaseError} 500 - Database operation failed
 */
router.post('/', async (req, res, next) => {
  try {
    const repo = await getProductsRepository();
    const newProduct = await repo.create(req.body as Omit<Product, 'productId'>);
    res.status(201).json(newProduct);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/products
 * Retrieves all products in the catalog.
 * 
 * @returns {Array} 200 - Array of all product objects
 * @throws {DatabaseError} 500 - Database operation failed
 */
router.get('/', async (req, res, next) => {
  try {
    const repo = await getProductsRepository();
    const products = await repo.findAll();
    res.json(products);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/products/:id
 * Retrieves a specific product by its unique ID.
 * 
 * @param {number} req.params.id - Product ID
 * @returns {Object} 200 - Product object if found
 * @returns {string} 404 - Product not found message
 * @throws {DatabaseError} 500 - Database operation failed
 */
router.get('/:id', async (req, res, next) => {
  try {
    const repo = await getProductsRepository();
    const product = await repo.findById(parseInt(req.params.id));
    if (product) {
      res.json(product);
    } else {
      res.status(404).send('Product not found');
    }
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/products/name/:name
 * Searches for a product by its exact name.
 * 
 * @param {string} req.params.name - Product name (case-sensitive)
 * @returns {Object} 200 - Product object if found
 * @returns {string} 404 - Product not found message
 * @throws {DatabaseError} 500 - Database operation failed
 */
router.get('/name/:name', async (req, res, next) => {
  try {
    const repo = await getProductsRepository();
    const product = await repo.findByName(req.params.name);
    if (product) {
      res.json(product);
    } else {
      res.status(404).send('Product not found');
    }
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/products/:id
 * Updates an existing product's information.
 * Partial updates are supported - only provided fields will be updated.
 * 
 * @param {number} req.params.id - Product ID
 * @param {Object} req.body - Partial or complete product data to update
 * @returns {Object} 200 - Updated product object
 * @returns {string} 404 - Product not found
 * @throws {ValidationError} 400 - Invalid request data
 * @throws {ConflictError} 409 - SKU conflict or invalid supplier reference
 * @throws {DatabaseError} 500 - Database operation failed
 */
router.put('/:id', async (req, res, next) => {
  try {
    const repo = await getProductsRepository();
    const updatedProduct = await repo.update(parseInt(req.params.id), req.body);
    res.json(updatedProduct);
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).send('Product not found');
    } else {
      next(error);
    }
  }
});

/**
 * DELETE /api/products/:id
 * Deletes a product from the catalog.
 * Note: This will cascade delete related order details due to foreign key constraints.
 * 
 * @param {number} req.params.id - Product ID
 * @returns {void} 204 - Product deleted successfully (no content)
 * @returns {string} 404 - Product not found
 * @throws {ConflictError} 409 - Cannot delete due to existing orders
 * @throws {DatabaseError} 500 - Database operation failed
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const repo = await getProductsRepository();
    await repo.delete(parseInt(req.params.id));
    res.status(204).send();
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).send('Product not found');
    } else {
      next(error);
    }
  }
});

export default router;
