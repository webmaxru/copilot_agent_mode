/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - userId
 *         - email
 *         - name
 *         - role
 *       properties:
 *         userId:
 *           type: integer
 *           description: The unique identifier for the user
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address (unique)
 *         name:
 *           type: string
 *           description: The user's display name
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           description: The user's role
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the account was created
 *     UserRegistration:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - name
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           minLength: 8
 *         name:
 *           type: string
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           default: user
 *     UserLogin:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 */
export interface User {
  userId: number;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface UserWithPassword extends User {
  passwordHash: string;
}
