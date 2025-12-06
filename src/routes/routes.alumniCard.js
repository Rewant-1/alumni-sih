const express = require("express");
const AlumniCardController = require("../controller/controller.alumniCard");
const AuthMiddleware = require("../middleware/middleware.auth");

const router = express.Router();

// Public verification routes
router.get("/verify/:cardNumber", AlumniCardController.verifyCard);
router.get("/verify/nfc/:nfcTagId", AlumniCardController.verifyNFC);

// Protected routes
router.get("/my", AuthMiddleware.authenticateToken, AlumniCardController.getMyCard);
router.post("/generate", AuthMiddleware.authenticateToken, AlumniCardController.generateCard);
router.post("/regenerate-qr", AuthMiddleware.authenticateToken, AlumniCardController.regenerateQR);
router.post("/link-nfc", AuthMiddleware.authenticateToken, AlumniCardController.linkNFC);
router.post("/request-physical", AuthMiddleware.authenticateToken, AlumniCardController.requestPhysicalCard);
router.get("/usage-history", AuthMiddleware.authenticateToken, AlumniCardController.getUsageHistory);

module.exports = router;
