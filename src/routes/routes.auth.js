const express = require("express");
const router = express.Router();

const AuthController = require("../controller/controller.auth");
const { internalAuth, authenticateToken } = require("../middleware/middleware.auth");
const validate = require("../middleware/middleware.validate");
const { authSchemas } = require("../middleware/middleware.validation");
const { authLimiter } = require("../middleware/middleware.rateLimit");

/**
 * @swagger
 * /auth/register/alumni:
 *   post:
 *     summary: Register a new alumni
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - collegeId
 *               - graduationYear
 *               - department
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               collegeId:
 *                 type: string
 *               graduationYear:
 *                 type: number
 *               department:
 *                 type: string
 *     responses:
 *       201:
 *         description: Alumni registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
    "/register/alumni",
    authLimiter,
    validate(authSchemas.registerAlumni),
    AuthController.registerAlumni
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
    "/login",
    authLimiter,
    validate(authSchemas.login),
    AuthController.login
);
router.post(
    "/verify/:alumniId",
    internalAuth,
    AuthController.verifyAlumni
);
// Get current authenticated user
router.get(
    "/me",
    authenticateToken,
    AuthController.getMe
);
router.get("/test",()=>{
    console.log("auth working.")
})

module.exports = router;
