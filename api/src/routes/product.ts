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
 *     description: Retrieves a complete list of all products in the catalog
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
 *             example:
 *               - productId: 1
 *                 supplierId: 3
 *                 name: "SmartFeeder One"
 *                 description: "This AI-powered feeder learns your cat's snack schedule"
 *                 price: 129.99
 *                 sku: "CAT-FEED-001"
 *                 unit: "piece"
 *                 imgName: "feeder.png"
 *                 discount: 0.25
 *               - productId: 2
 *                 supplierId: 3
 *                 name: "AutoClean Litter Dome"
 *                 description: "A self-cleaning litter box"
 *                 price: 199.99
 *                 sku: "CAT-LITTER-001"
 *                 unit: "piece"
 *                 imgName: "litter-box.png"
 *                 discount: 0.25
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Create a new product
 *     description: Adds a new product to the catalog
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - supplierId
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 format: float
 *               supplierId:
 *                 type: integer
 *               sku:
 *                 type: string
 *               unit:
 *                 type: string
 *               imgName:
 *                 type: string
 *               discount:
 *                 type: number
 *                 format: float
 *           example:
 *             name: "LaserChase Pro"
 *             description: "Automated laser toy for endless entertainment"
 *             price: 59.99
 *             supplierId: 2
 *             sku: "CAT-LASER-001"
 *             unit: "piece"
 *             imgName: "laser.png"
 *             discount: 0.10
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *             example:
 *               productId: 13
 *               name: "LaserChase Pro"
 *               description: "Automated laser toy for endless entertainment"
 *               price: 59.99
 *               supplierId: 2
 *               sku: "CAT-LASER-001"
 *               unit: "piece"
 *               imgName: "laser.png"
 *               discount: 0.10
 *       400:
 *         description: Validation error - invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error:
 *                 code: "VALIDATION_ERROR"
 *                 message: "Validation error: Invalid reference to related entity"
 *
 * /api/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     description: Retrieves a single product by its unique identifier
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Product found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *             example:
 *               productId: 1
 *               supplierId: 3
 *               name: "SmartFeeder One"
 *               description: "This AI-powered feeder learns your cat's snack schedule"
 *               price: 129.99
 *               sku: "CAT-FEED-001"
 *               unit: "piece"
 *               imgName: "feeder.png"
 *               discount: 0.25
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error:
 *                 code: "NOT_FOUND"
 *                 message: "Product with ID 999 not found"
 *   put:
 *     summary: Update a product
 *     description: Updates an existing product's information
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               discount:
 *                 type: number
 *           example:
 *             price: 119.99
 *             discount: 0.30
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *             example:
 *               productId: 1
 *               supplierId: 3
 *               name: "SmartFeeder One"
 *               description: "This AI-powered feeder learns your cat's snack schedule"
 *               price: 119.99
 *               sku: "CAT-FEED-001"
 *               unit: "piece"
 *               imgName: "feeder.png"
 *               discount: 0.30
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Delete a product
 *     description: Removes a product from the catalog (requires no active orders)
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *         example: 1
 *     responses:
 *       204:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Conflict - product has active orders
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

import express from 'express';
import { Product } from '../models/product';
import { getProductsRepository } from '../repositories/productsRepo';
import { handleDatabaseError, NotFoundError } from '../utils/errors';

const router = express.Router();

// Create a new product
router.post('/', async (req, res, next) => {
  try {
    const repo = await getProductsRepository();
    const newProduct = await repo.create(req.body as Omit<Product, 'productId'>);
    res.status(201).json(newProduct);
  } catch (error) {
    next(error);
  }
});

// Get all products
router.get('/', async (req, res, next) => {
  try {
    const repo = await getProductsRepository();
    const products = await repo.findAll();
    res.json(products);
  } catch (error) {
    next(error);
  }
});

// Get a product by ID
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

// Get a product by name
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

// Update a product by ID
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

// Delete a product by ID
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
