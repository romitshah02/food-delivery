"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const cart_1 = __importDefault(require("./routes/cart"));
const checkout_1 = __importDefault(require("./routes/checkout"));
const items_1 = __importDefault(require("./routes/items"));
const orders_1 = __importDefault(require("./routes/orders"));
const security_1 = require("./middleware/security");
dotenv_1.default.config();
const app = (0, express_1.default)();
// Debug: Log CORS configuration
console.log('CORS Configuration:', security_1.corsOptions);
// Security middleware
app.use((0, cors_1.default)(security_1.corsOptions));
app.use(express_1.default.json({ limit: '10kb' })); // Limit payload size
app.use(security_1.securityMiddleware);
app.use(security_1.limiter); // Global rate limiting
// API routes
app.use('/api/auth', auth_1.default);
app.use('/api/cart', cart_1.default);
app.use('/api/checkout', checkout_1.default);
app.use('/api/items', items_1.default);
app.use('/api/orders', orders_1.default);
// Error handling
app.use(security_1.errorHandler);
// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
exports.default = app;
//# sourceMappingURL=index.js.map