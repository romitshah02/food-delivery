"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const checkout_1 = require("../controller/checkout");
const router = express_1.default.Router();
router.post('/', auth_1.requireAuth, checkout_1.checkout);
exports.default = router;
//# sourceMappingURL=checkout.js.map