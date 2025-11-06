"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const cart_1 = require("../controller/cart");
const router = express_1.default.Router();
router.use(auth_1.requireAuth);
router.get('/', cart_1.getCart);
router.post('/items', cart_1.addItem);
router.patch('/items/:id', cart_1.updateItem);
router.delete('/items/:id', cart_1.removeItem);
router.post('/merge', cart_1.mergeCart);
exports.default = router;
//# sourceMappingURL=cart.js.map