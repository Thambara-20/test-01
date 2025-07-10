"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
exports.generateTemporaryPassword = generateTemporaryPassword;
const data_source_1 = require("../config/data-source");
const user_1 = require("../entity/user");
const templateService_1 = require("./templateService");
class UserService {
    constructor() {
        this.userRepository = data_source_1.AppDataSource.getRepository(user_1.User);
        this.templateService = new templateService_1.TemplateService();
    }
    async createUser(user) {
        try {
            return await data_source_1.AppDataSource.transaction(async (transactionalEntityManager) => {
                const createdUser = await transactionalEntityManager.save(user);
                await this.templateService.createTemplate("Default", createdUser.email, transactionalEntityManager);
                return createdUser;
            });
        }
        catch (error) {
            console.error("Error creating user:", error, user);
            throw new Error("Failed to create user");
        }
    }
    async findByEmail(email) {
        if (!email) {
            return undefined;
        }
        return await this.userRepository.findOne({
            where: { email },
            relations: ["phone_numbers"],
        });
    }
    async isUniqueMobile(email, phoneId) {
        if (!email || !phoneId) {
            return false;
        }
        const existing = await this.userRepository.find({
            where: { phoneId },
        });
        for (const user of existing) {
            if (user.email != email) {
                console.log("User with email already exists", user, email);
                return false;
            }
        }
        return true;
    }
    async updateUser(user) {
        return await this.userRepository.save(user);
    }
}
exports.UserService = UserService;
function generateTemporaryPassword() {
    const crypto = require("crypto");
    const tempPassword = crypto.randomBytes(8).toString("hex");
    return tempPassword;
}
exports.default = UserService;
//# sourceMappingURL=userService.js.map