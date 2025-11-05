/**
 * @swagger
 * components:
 *   schemas:
 *     Supplier:
 *       type: object
 *       required:
 *         - supplierId
 *         - name
 *       properties:
 *         supplierId:
 *           type: integer
 *           description: The unique identifier for the supplier
 *           example: 1
 *         name:
 *           type: string
 *           description: The name of the supplier
 *           example: "PurrTech Innovations"
 *         address:
 *           type: string
 *           description: The physical address of the supplier
 *           example: "123 Cat Street, Silicon Valley, CA 94025"
 *         contactPerson:
 *           type: string
 *           description: Name of the primary contact person
 *           example: "Felix Whiskerton"
 *         email:
 *           type: string
 *           format: email
 *           description: Contact email for the supplier
 *           example: "felix@purrtech.co"
 *         phone:
 *           type: string
 *           description: Contact phone number for the supplier
 *           example: "555-0101"
 *         description:
 *           type: string
 *           description: Additional details about the supplier
 *           example: "Leading supplier of premium smart cat technology"
 *     Error:
 *       type: object
 *       required:
 *         - error
 *       properties:
 *         error:
 *           type: object
 *           required:
 *             - code
 *             - message
 *           properties:
 *             code:
 *               type: string
 *               description: Machine-readable error code
 *               example: "NOT_FOUND"
 *             message:
 *               type: string
 *               description: Human-readable error message
 *               example: "Supplier with ID 999 not found"
 */
export interface Supplier {
  supplierId: number;
  name: string;
  description: string;
  contactPerson: string;
  email: string;
  phone: string;
}
