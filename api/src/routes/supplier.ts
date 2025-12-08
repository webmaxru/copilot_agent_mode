/**
 * @swagger
 * tags:
 *   name: Suppliers
 *   description: API endpoints for managing suppliers
 */

/**
 * @swagger
 * /api/suppliers:
 *   get:
 *     summary: Returns all suppliers
 *     tags: [Suppliers]
 *     responses:
 *       200:
 *         description: List of all suppliers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Supplier'
 *   post:
 *     summary: Create a new supplier
 *     tags: [Suppliers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Supplier'
 *     responses:
 *       201:
 *         description: Supplier created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Supplier'
 *
 * /api/suppliers/{id}:
 *   get:
 *     summary: Get a supplier by ID
 *     tags: [Suppliers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Supplier ID
 *     responses:
 *       200:
 *         description: Supplier found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Supplier'
 *       404:
 *         description: Supplier not found
 *   put:
 *     summary: Update a supplier
 *     tags: [Suppliers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Supplier ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Supplier'
 *     responses:
 *       200:
 *         description: Supplier updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Supplier'
 *       404:
 *         description: Supplier not found
 *   delete:
 *     summary: Delete a supplier
 *     tags: [Suppliers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Supplier ID
 *     responses:
 *       204:
 *         description: Supplier deleted successfully
 *       404:
 *         description: Supplier not found
 */

import express from 'express';
import { Supplier } from '../models/supplier';
import { getSuppliersRepository } from '../repositories/suppliersRepo';
import { handleDatabaseError, NotFoundError } from '../utils/errors';

const router = express.Router();

/**
 * POST /api/suppliers
 * Creates a new supplier in the system.
 * 
 * @param {Omit<Supplier, 'supplierId'>} req.body - Supplier data (excluding supplierId which is auto-generated)
 * @returns {Supplier} 201 - Created supplier with generated ID
 * @throws {ValidationError} 400 - Invalid request data
 * @throws {ConflictError} 409 - Constraint violation
 * @throws {DatabaseError} 500 - Database operation failed
 */
router.post('/', async (req, res, next) => {
  try {
    const repo = await getSuppliersRepository();
    const newSupplier = await repo.create(req.body as Omit<Supplier, 'supplierId'>);
    res.status(201).json(newSupplier);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/suppliers
 * Retrieves all suppliers in the system.
 * 
 * @returns {Array} 200 - Array of all supplier objects
 * @throws {DatabaseError} 500 - Database operation failed
 */
router.get('/', async (req, res, next) => {
  try {
    const repo = await getSuppliersRepository();
    const suppliers = await repo.findAll();
    res.json(suppliers);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/suppliers/:id
 * Retrieves a specific supplier by their unique ID.
 * 
 * @param {number} req.params.id - Supplier ID
 * @returns {Object} 200 - Supplier object if found
 * @returns {string} 404 - Supplier not found message
 * @throws {DatabaseError} 500 - Database operation failed
 */
router.get('/:id', async (req, res, next) => {
  try {
    const repo = await getSuppliersRepository();
    const supplier = await repo.findById(parseInt(req.params.id));
    if (supplier) {
      res.json(supplier);
    } else {
      res.status(404).send('Supplier not found');
    }
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/suppliers/:id
 * Updates an existing supplier's information.
 * 
 * @param {number} req.params.id - Supplier ID
 * @param {Partial<Omit<Supplier, 'supplierId'>>} req.body - Partial or complete supplier data to update
 * @returns {Supplier} 200 - Updated supplier object
 * @returns {string} 404 - Supplier not found
 * @throws {ValidationError} 400 - Invalid request data
 * @throws {DatabaseError} 500 - Database operation failed
 */
router.put('/:id', async (req, res, next) => {
  try {
    const repo = await getSuppliersRepository();
    const updatedSupplier = await repo.update(parseInt(req.params.id), req.body);
    res.json(updatedSupplier);
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).send('Supplier not found');
    } else {
      next(error);
    }
  }
});

/**
 * DELETE /api/suppliers/:id
 * Deletes a supplier from the system.
 * Note: This will cascade delete related products and deliveries due to foreign key constraints.
 * 
 * @param {number} req.params.id - Supplier ID
 * @returns {void} 204 - Supplier deleted successfully (no content)
 * @returns {string} 404 - Supplier not found
 * @throws {ConflictError} 409 - Cannot delete due to constraint violations
 * @throws {DatabaseError} 500 - Database operation failed
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const repo = await getSuppliersRepository();
    await repo.delete(parseInt(req.params.id));
    res.status(204).send();
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).send('Supplier not found');
    } else {
      next(error);
    }
  }
});

export default router;
