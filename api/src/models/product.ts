/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - productId
 *         - name
 *         - price
 *       properties:
 *         productId:
 *           type: integer
 *           description: The unique identifier for the product
 *           example: 1
 *         name:
 *           type: string
 *           description: The name of the product
 *           example: "SmartFeeder One"
 *         description:
 *           type: string
 *           description: Detailed description of the product
 *           example: "This AI-powered feeder learns your cat's snack schedule based on nap cycles and mealtime habits."
 *         price:
 *           type: number
 *           format: float
 *           description: The current price of the product
 *           example: 129.99
 *         supplierId:
 *           type: integer
 *           description: The ID of the supplier providing this product
 *           example: 3
 *         sku:
 *           type: string
 *           description: Stock Keeping Unit identifier
 *           example: "CAT-FEED-001"
 *         unit:
 *           type: string
 *           description: Unit of measure for the product
 *           example: "piece"
 *         imgName:
 *           type: string
 *           description: Product image filename
 *           example: "feeder.png"
 *         discount:
 *           type: number
 *           format: float
 *           description: Discount percentage (if applicable) expressed as a decimal (e.g., 0.25 for 25%)
 *           example: 0.25
 */
export interface Product {
  productId: number;
  supplierId: number;
  name: string;
  description: string;
  price: number;
  sku: string;
  unit: string;
  imgName: string;
  discount?: number;
}
