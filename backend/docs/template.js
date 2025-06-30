/**
 * Swagger Documentation Templates
 * 
 * This file contains templates for documenting different types of API endpoints
 * using Swagger JSDoc comments. Copy and modify these templates for your controllers.
 */

/**
 * GET Endpoint Template
 * 
 * @swagger
 * /api/resource:
 *   get:
 *     summary: Get all resources
 *     description: Retrieve a list of resources with optional filtering
 *     tags: [ResourceName]
 *     parameters:
 *       - in: query    
 *         name: param1
 *         schema:
 *           type: string
 *         description: Filter by parameter
 *       - in: query
 *         name: param2
 *         schema:
 *           type: integer
 *         description: Filter by another parameter
 *     responses:
 *       200:
 *         description: Resources retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Resource'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             $ref: '#/components/schemas/Error'
 */

/**
 * GET Single Resource Template
 * 
 * @swagger
 * /api/resource/{id}:
 *   get:
 *     summary: Get a single resource by ID
 *     description: Retrieve detailed information about a specific resource
 *     tags: [ResourceName]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Resource ID
 *     responses:
 *       200:
 *         description: Resource details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Resource'
 *       404:
 *         description: Resource not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Resource not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             $ref: '#/components/schemas/Error'
 */

/**
 * POST Endpoint Template
 * 
 * @swagger
 * /api/resource:
 *   post:
 *     summary: Create a new resource
 *     description: Create a new resource with all required information
 *     tags: [ResourceName]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Resource Name"
 *                 description: Name of the resource
 *               description:
 *                 type: string
 *                 example: "Resource description"
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 example: "active"
 *     responses:
 *       201:
 *         description: Resource created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Resource created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             $ref: '#/components/schemas/Error'
 */

/**
 * PUT Endpoint Template
 * 
 * @swagger
 * /api/resource/{id}:
 *   put:
 *     summary: Update a resource
 *     description: Update an existing resource's information
 *     tags: [ResourceName]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Resource ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Resource Name"
 *               description:
 *                 type: string
 *                 example: "Updated description"
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 example: "active"
 *     responses:
 *       200:
 *         description: Resource updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Resource updated successfully
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             $ref: '#/components/schemas/Error'
 */

/**
 * DELETE Endpoint Template
 * 
 * @swagger
 * /api/resource/{id}:
 *   delete:
 *     summary: Delete a resource
 *     description: Delete a resource and all its associated data
 *     tags: [ResourceName]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Resource ID
 *     responses:
 *       200:
 *         description: Resource deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Resource deleted successfully
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             $ref: '#/components/schemas/Error'
 */

/**
 * Schema Template
 * 
 * Add this to your swagger.js file in the components.schemas section:
 * 
 * Resource:
 *   type: object
 *   properties:
 *     id:
 *       type: integer
 *       example: 1
 *     name:
 *       type: string
 *       example: "Resource Name"
 *     description:
 *       type: string
 *       example: "Resource description"
 *     status:
 *       type: string
 *       enum: [active, inactive]
 *       example: "active"
 *     created_at:
 *       type: string
 *       format: date-time
 *       example: "2024-01-01T00:00:00.000Z"
 *     updated_at:
 *       type: string
 *       format: date-time
 *       example: "2024-01-01T00:00:00.000Z"
 */

module.exports = {
  // This file is for reference only
  description: 'Swagger documentation templates for API endpoints'
}; 