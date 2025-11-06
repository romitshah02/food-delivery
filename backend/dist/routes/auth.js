"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../controller/auth");
const validate_1 = require("../middleware/validate");
const validation_1 = require("../schemas/validation");
const security_1 = require("../middleware/security");
const router = express_1.default.Router();
router.post('/register', (0, validate_1.validateRequest)(validation_1.registerSchema), auth_1.register);
router.post('/login', security_1.authLimiter, (0, validate_1.validateRequest)(validation_1.loginSchema), auth_1.login);
router.post('/refresh', auth_1.refresh);
router.post('/logout', auth_1.logout);
exports.default = router;
//# sourceMappingURL=auth.js.map