/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API endpoints for user account management
 */

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Authenticate a user and return their profile
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid email or password
 *
 * /api/users/register:
 *   post:
 *     summary: Register a new user account
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegistration'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already in use
 *
 * /api/users:
 *   get:
 *     summary: Returns all user accounts
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *   put:
 *     summary: Update a user's profile
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *   delete:
 *     summary: Delete a user account
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */

import express from 'express';
import { getUsersRepository } from '../repositories/usersRepo';
import { NotFoundError } from '../utils/errors';

const router = express.Router();

// POST /api/users/login – authenticate
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'email and password are required' } });
      return;
    }
    const repo = await getUsersRepository();
    const user = await repo.validateCredentials(email, password);
    if (!user) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid email or password' } });
      return;
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// POST /api/users/register – create account
router.post('/register', async (req, res, next) => {
  try {
    const repo = await getUsersRepository();
    const newUser = await repo.create(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
});

// GET /api/users – list all users
router.get('/', async (req, res, next) => {
  try {
    const repo = await getUsersRepository();
    const users = await repo.findAll();
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:id – get user by ID
router.get('/:id', async (req, res, next) => {
  try {
    const repo = await getUsersRepository();
    const user = await repo.findById(parseInt(req.params.id));
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
    }
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/:id – update user profile
router.put('/:id', async (req, res, next) => {
  try {
    const repo = await getUsersRepository();
    const { name, role } = req.body;
    const updatedUser = await repo.update(parseInt(req.params.id), { name, role });
    res.json(updatedUser);
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
    } else {
      next(error);
    }
  }
});

// DELETE /api/users/:id – delete user
router.delete('/:id', async (req, res, next) => {
  try {
    const repo = await getUsersRepository();
    await repo.delete(parseInt(req.params.id));
    res.status(204).send();
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
    } else {
      next(error);
    }
  }
});

export default router;
