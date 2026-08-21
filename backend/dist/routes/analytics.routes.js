"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analytics_controller_1 = require("../controllers/analytics.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.get('/', analytics_controller_1.getAnalytics);
exports.default = router;
