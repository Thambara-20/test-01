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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const dotenv = __importStar(require("dotenv"));
const user_1 = require("../entity/user");
const button_1 = require("../entity/button");
const template_1 = require("../entity/template");
const phone_1 = require("../entity/phone");
dotenv.config();
// Only create DataSource if database URL is provided
exports.AppDataSource = process.env.PG_DATABASE_URL ? new typeorm_1.DataSource({
    url: process.env.PG_DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
    type: "postgres",
    synchronize: true,
    logging: false,
    entities: [user_1.User, button_1.Button, template_1.Template, phone_1.Phone],
    migrations: [],
    subscribers: [],
}) : null;
// export const AppDataSource = new DataSource({
//   type: "postgres",
//   host: process.env.HOST,
//   port: 5432,
//   username: process.env.PG_USERNAME,
//   password: process.env.PASSWORD ,
//   database: process.env.DATABASE,
//   entities: [User],
//   synchronize: false,
//   logging: true,
// });
//# sourceMappingURL=data-source.js.map