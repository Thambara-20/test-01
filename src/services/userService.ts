import { AppDataSource } from "../config/data-source";
import { User } from "../entity/user";
import { TemplateService } from "./templateService";

export class UserService {
  private userRepository = AppDataSource.getRepository(User);
  private templateService = new TemplateService();

  async createUser(user: User): Promise<User> {
    try {
      return await AppDataSource.transaction(
        async (transactionalEntityManager) => {
          const createdUser: User = await transactionalEntityManager.save(user);
          await this.templateService.createTemplate(
            "Default",
            createdUser.email,
            transactionalEntityManager
          );
          return createdUser;
        }
      );
    } catch (error) {
      console.error("Error creating user:", error, user);
      throw new Error("Failed to create user");
    }
  }
  async findByEmail(email: string): Promise<User | undefined> {
    if (!email) {
      return undefined;
    }
    return await this.userRepository.findOne({
      where: { email },
      relations: ["phone_numbers"],
    });
  }

  async isUniqueMobile(email: string, phoneId: string): Promise<boolean> {
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

  async updateUser(user: User): Promise<User> {
    return await this.userRepository.save(user);
  }
}

export function generateTemporaryPassword(): string {
  const crypto = require("crypto");
  const tempPassword = crypto.randomBytes(8).toString("hex");
  return tempPassword;
}

export default UserService;
