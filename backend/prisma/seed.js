"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var bcrypt = __importStar(require("bcrypt"));
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var cat1, cat2, cat3, cat4, cat5, products, _i, products_1, p, passwordHash, customerHash, vouchers, _a, vouchers_1, v;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log('🌱 Seeding database...');
                    return [4 /*yield*/, prisma.category.upsert({ where: { slug: 'do-dung-nha-bep' }, update: {}, create: { name: 'Đồ dùng nhà bếp', slug: 'do-dung-nha-bep' } })];
                case 1:
                    cat1 = _b.sent();
                    return [4 /*yield*/, prisma.category.upsert({ where: { slug: 'do-dung-phong-tam' }, update: {}, create: { name: 'Đồ dùng phòng tắm', slug: 'do-dung-phong-tam' } })];
                case 2:
                    cat2 = _b.sent();
                    return [4 /*yield*/, prisma.category.upsert({ where: { slug: 'do-gia-dung-dien-may' }, update: {}, create: { name: 'Đồ gia dụng - Điện máy', slug: 'do-gia-dung-dien-may' } })];
                case 3:
                    cat3 = _b.sent();
                    return [4 /*yield*/, prisma.category.upsert({ where: { slug: 'dung-cu-lam-vuon' }, update: {}, create: { name: 'Dụng cụ làm vườn', slug: 'dung-cu-lam-vuon' } })];
                case 4:
                    cat4 = _b.sent();
                    return [4 /*yield*/, prisma.category.upsert({ where: { slug: 've-sinh-nha-cua' }, update: {}, create: { name: 'Vệ sinh nhà cửa', slug: 've-sinh-nha-cua' } })];
                case 5:
                    cat5 = _b.sent();
                    products = [
                        { categoryId: cat1.id, name: 'Nồi cơm điện 1.8L', slug: 'noi-com-dien-1-8l', description: 'Nồi cơm điện công nghệ mới', price: 850000, stock: 50, imageUrl: 'https://placehold.co/300x300' },
                        { categoryId: cat1.id, name: 'Chảo chống dính 28cm', slug: 'chao-chong-dinh-28cm', description: 'Chảo chống dính cao cấp', price: 320000, stock: 100, imageUrl: 'https://placehold.co/300x300' },
                        { categoryId: cat1.id, name: 'Bộ dao inox 5 món cao cấp', slug: 'bo-dao-inox-5-mon-cao-cap', description: 'Bộ dao bếp inox chống gỉ', price: 450000, stock: 80, imageUrl: 'https://placehold.co/300x300' },
                        { categoryId: cat1.id, name: 'Máy xay sinh tố đa năng 2 cối', slug: 'may-xay-sinh-to-da-nang-2-coi', description: 'Máy xay công suất lớn', price: 690000, stock: 40, imageUrl: 'https://placehold.co/300x300' },
                        { categoryId: cat2.id, name: 'Kệ để đồ phòng tắm inox', slug: 'ke-de-do-phong-tam-inox', description: 'Kệ inox chống gỉ', price: 220000, stock: 60, imageUrl: 'https://placehold.co/300x300' },
                        { categoryId: cat2.id, name: 'Thảm chân chống trượt', slug: 'tham-chan-chong-truot', description: 'Chất liệu cao su, chống thấm', price: 95000, stock: 150, imageUrl: 'https://placehold.co/300x300' },
                        { categoryId: cat3.id, name: 'Quạt đứng điều khiển từ xa', slug: 'quat-dung-dieu-khien-tu-xa', description: 'Quạt 3 tốc độ gió', price: 590000, stock: 35, imageUrl: 'https://placehold.co/300x300' },
                        { categoryId: cat4.id, name: 'Bộ dụng cụ làm vườn mini 7 món', slug: 'bo-dung-cu-lam-vuon-mini-7-mon', description: 'Đầy đủ dụng cụ cắt, xới', price: 165000, stock: 75, imageUrl: 'https://placehold.co/300x300' },
                        { categoryId: cat5.id, name: 'Chổi lau nhà 360 độ', slug: 'choi-lau-nha-360-do', description: 'Xoay 360 độ, lau sạch mọi góc', price: 145000, stock: 130, imageUrl: 'https://placehold.co/300x300' },
                    ];
                    _i = 0, products_1 = products;
                    _b.label = 6;
                case 6:
                    if (!(_i < products_1.length)) return [3 /*break*/, 9];
                    p = products_1[_i];
                    return [4 /*yield*/, prisma.product.upsert({ where: { slug: p.slug }, update: {}, create: p })];
                case 7:
                    _b.sent();
                    _b.label = 8;
                case 8:
                    _i++;
                    return [3 /*break*/, 6];
                case 9: return [4 /*yield*/, bcrypt.hash('admin123', 10)];
                case 10:
                    passwordHash = _b.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'admin@shop.com' },
                            update: { passwordHash: passwordHash },
                            create: { fullName: 'Admin', email: 'admin@shop.com', passwordHash: passwordHash, role: 'admin' },
                        })];
                case 11:
                    _b.sent();
                    return [4 /*yield*/, bcrypt.hash('customer123', 10)];
                case 12:
                    customerHash = _b.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'customer@shop.com' },
                            update: { passwordHash: customerHash },
                            create: { fullName: 'Khách Hàng Test', email: 'customer@shop.com', passwordHash: customerHash, role: 'customer' },
                        })];
                case 13:
                    _b.sent();
                    vouchers = [
                        { code: 'GIAM10', discountType: 'percent', discountValue: 10, minOrderAmount: 100000, maxDiscount: 50000, quantity: 0, description: 'Giảm 10% cho đơn từ 100.000đ', expiresAt: new Date('2027-12-31') },
                        { code: 'WELCOME', discountType: 'percent', discountValue: 20, minOrderAmount: 0, maxDiscount: 1000000, quantity: 0, description: 'Dành cho khách hàng mới, tối đa 1.000.000đ', expiresAt: new Date('2027-12-31') },
                        { code: 'WELCOME10', discountType: 'percent', discountValue: 10, minOrderAmount: 0, maxDiscount: 50000, quantity: 100, description: 'Giảm 10% cho đơn hàng đầu tiên' },
                        { code: 'FREE50', discountType: 'fixed', discountValue: 50000, minOrderAmount: 300000, quantity: 50, description: 'Giảm 50.000đ cho đơn từ 300.000đ' },
                        { code: 'SHIP30', discountType: 'fixed', discountValue: 30000, minOrderAmount: 200000, quantity: 200, description: 'Giảm 30.000đ phí vận chuyển' },
                        { code: 'SUMMER15', discountType: 'percent', discountValue: 15, minOrderAmount: 500000, maxDiscount: 100000, quantity: 30, expiresAt: new Date('2026-09-30'), description: 'Giảm 15% mùa hè, tối đa 100.000đ' },
                    ];
                    _a = 0, vouchers_1 = vouchers;
                    _b.label = 14;
                case 14:
                    if (!(_a < vouchers_1.length)) return [3 /*break*/, 17];
                    v = vouchers_1[_a];
                    return [4 /*yield*/, prisma.voucher.upsert({
                            where: { code: v.code },
                            update: {},
                            create: v,
                        })];
                case 15:
                    _b.sent();
                    _b.label = 16;
                case 16:
                    _a++;
                    return [3 /*break*/, 14];
                case 17:
                    console.log('✅ Seeding completed!');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) { console.error(e); process.exit(1); })
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    switch (_a.label) {
        case 0: return [4 /*yield*/, prisma.$disconnect()];
        case 1:
            _a.sent();
            return [2 /*return*/];
    }
}); }); });
