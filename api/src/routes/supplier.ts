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
 *     description: Retrieves a complete list of all suppliers in the system
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
 *             example:
 *               - supplierId: 1
 *                 name: "PurrTech Innovations"
 *                 description: "Leading supplier of premium smart cat technology"
 *                 contactPerson: "Felix Whiskerton"
 *                 email: "felix@purrtech.co"
 *                 phone: "555-0101"
 *               - supplierId: 2
 *                 name: "WhiskerWare Systems"
 *                 description: "Advanced feline-focused smart product supplier"
 *                 contactPerson: "Tabitha Pawson"
 *                 email: "tabitha@whiskerware.com"
 *                 phone: "555-0102"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Create a new supplier
 *     description: Creates a new supplier with the provided details
 *     tags: [Suppliers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               contactPerson:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *           example:
 *             name: "MeowTech Solutions"
 *             description: "Innovative cat technology provider"
 *             contactPerson: "Jane Doe"
 *             email: "jane@meowtech.com"
 *             phone: "555-1234"
 *     responses:
 *       201:
 *         description: Supplier created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Supplier'
 *             example:
 *               supplierId: 4
 *               name: "MeowTech Solutions"
 *               description: "Innovative cat technology provider"
 *               contactPerson: "Jane Doe"
 *               email: "jane@meowtech.com"
 *               phone: "555-1234"
 *       400:
 *         description: Validation error - invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error:
 *                 code: "VALIDATION_ERROR"
 *                 message: "Validation error: Name is required"
 *       409:
 *         description: Conflict - supplier already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error:
 *                 code: "CONFLICT"
 *                 message: "Conflict: Resource already exists"
 *
 * /api/suppliers/{id}:
 *   get:
 *     summary: Get a supplier by ID
 *     description: Retrieves a single supplier by their unique identifier
 *     tags: [Suppliers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Supplier ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Supplier found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Supplier'
 *             example:
 *               supplierId: 1
 *               name: "PurrTech Innovations"
 *               description: "Leading supplier of premium smart cat technology"
 *               contactPerson: "Felix Whiskerton"
 *               email: "felix@purrtech.co"
 *               phone: "555-0101"
 *       404:
 *         description: Supplier not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error:
 *                 code: "NOT_FOUND"
 *                 message: "Supplier with ID 999 not found"
 *   put:
 *     summary: Update a supplier
 *     description: Updates an existing supplier's information
 *     tags: [Suppliers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Supplier ID
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
 *               contactPerson:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *           example:
 *             name: "PurrTech Innovations Inc."
 *             description: "Premium smart cat technology leader"
 *     responses:
 *       200:
 *         description: Supplier updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Supplier'
 *             example:
 *               supplierId: 1
 *               name: "PurrTech Innovations Inc."
 *               description: "Premium smart cat technology leader"
 *               contactPerson: "Felix Whiskerton"
 *               email: "felix@purrtech.co"
 *               phone: "555-0101"
 *       404:
 *         description: Supplier not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error:
 *                 code: "NOT_FOUND"
 *                 message: "Supplier with ID 999 not found"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Delete a supplier
 *     description: Deletes a supplier from the system (requires no dependent products)
 *     tags: [Suppliers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Supplier ID
 *         example: 1
 *     responses:
 *       204:
 *         description: Supplier deleted successfully
 *       404:
 *         description: Supplier not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error:
 *                 code: "NOT_FOUND"
 *                 message: "Supplier with ID 999 not found"
 *       409:
 *         description: Conflict - supplier has dependent products
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error:
 *                 code: "VALIDATION_ERROR"
 *                 message: "Validation error: Cannot delete supplier with existing products"
 */

import express from 'express';
import { Supplier } from '../models/supplier';
import { getSuppliersRepository } from '../repositories/suppliersRepo';
import { handleDatabaseError, NotFoundError } from '../utils/errors';

const router = express.Router();

// Create a new supplier
router.post('/', async (req, res, next) => {
  try {
    const repo = await getSuppliersRepository();
    const newSupplier = await repo.create(req.body as Omit<Supplier, 'supplierId'>);
    res.status(201).json(newSupplier);
  } catch (error) {
    next(error);
  }
});

// Get all suppliers
router.get('/', async (req, res, next) => {
  try {
    const repo = await getSuppliersRepository();
    const suppliers = await repo.findAll();
    res.json(suppliers);
  } catch (error) {
    next(error);
  }
});

// Get a supplier by ID
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

// Update a supplier by ID
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

// Delete a supplier by ID
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
