"use strict";
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
var dotenv = require("dotenv");
var path = require("path");
var supabase_js_1 = require("@supabase/supabase-js");
// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
// Initialize Supabase client
var supabase = (0, supabase_js_1.createClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
// Initialize Prisma client
var prisma = new client_1.PrismaClient();
function getUserByEmail(email) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, users, error, user, userId, dbUserById, error_1, dbUser, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log("Looking up user with email: ".concat(email));
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 8, 9, 11]);
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 5, , 6]);
                    return [4 /*yield*/, supabase.auth.admin.listUsers({
                            page: 1,
                            perPage: 1000
                        })];
                case 3:
                    _a = _b.sent(), users = _a.data.users, error = _a.error;
                    if (error)
                        throw error;
                    user = users.find(function (u) { return u.email === email; });
                    if (!user)
                        throw new Error('User not found');
                    console.log('Supabase user found:', {
                        id: user.id,
                        email: user.email,
                        created_at: user.created_at,
                    });
                    userId = parseInt(user.id);
                    if (isNaN(userId))
                        throw new Error('Invalid user ID format');
                    return [4 /*yield*/, prisma.user.findFirst({
                            where: { id: userId },
                        })];
                case 4:
                    dbUserById = _b.sent();
                    if (dbUserById) {
                        console.log('Database user found by ID:', dbUserById);
                    }
                    else {
                        console.log('No database user found with this ID');
                    }
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _b.sent();
                    console.error('Supabase user not found:', error_1);
                    return [3 /*break*/, 6];
                case 6: return [4 /*yield*/, prisma.user.findFirst({
                        where: { email: email },
                    })];
                case 7:
                    dbUser = _b.sent();
                    if (dbUser) {
                        console.log('Database user found by email:', dbUser);
                    }
                    else {
                        console.log('No database user found with this email');
                    }
                    return [3 /*break*/, 11];
                case 8:
                    error_2 = _b.sent();
                    console.error('Error looking up user:', error_2);
                    return [3 /*break*/, 11];
                case 9: return [4 /*yield*/, prisma.$disconnect()];
                case 10:
                    _b.sent();
                    return [7 /*endfinally*/];
                case 11: return [2 /*return*/];
            }
        });
    });
}
// Get email from command line arguments
var email = process.argv[2];
if (!email) {
    console.error('Please provide an email as a command line argument');
    console.log('Usage: npx ts-node src/scripts/getUserByEmail.ts <email>');
    process.exit(1);
}
getUserByEmail(email)
    .catch(function (error) {
    console.error('Script execution failed:', error);
    process.exit(1);
});
