import { Phone } from "../entity/phone";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/user";
import { Button } from "../entity/button";

export class PhoneService {
  private phoneRepository = AppDataSource.getRepository(Phone);
  private userRepository = AppDataSource.getRepository(User);
  private buttonsRepository = AppDataSource.getRepository(Button);

  async updatePhoneNumbersByUserId(userId: any, phoneNumbers: string[]) {
    try {
      if (!userId) {
        return undefined;
      }

      const user = await this.userRepository.findOne({
        where: { email: userId, verified: true },
      });

      if (!user) {
        return undefined;
      }

      const phone_numbers = await this.phoneRepository.find({
        where: { user: { email: userId } },
      });

      for (const phone_number of phone_numbers) {
        await this.phoneRepository.remove(phone_number);
      }

      const validPhoneNumbers = [];
      for (const phoneNumber of phoneNumbers) {
        if (phoneNumber.length < 10) {
          console.log(`Invalid phone number: ${phoneNumber}`);
          continue;
        }

        const phone = new Phone();
        phone.phone_number = phoneNumber;
        phone.user = user;

        await this.phoneRepository.save(phone);
        validPhoneNumbers.push(phoneNumber);
      }

      return validPhoneNumbers;
    } catch (error) {
      console.error("Error updating phone numbers:", error);
      return undefined;
    }
  }

  async getPhoneNumbersByUserId(email: string) {
    if (!email) {
      return undefined;
    }
    const user = await this.userRepository.findOne({
      where: { email, verified: true },
      relations: ["phone_numbers"],
    });

    if (!user) {
      return undefined;
    }
    console.log(user.phone_numbers, "user.phone_numbers");
    const phoneNumbers = user.phone_numbers.map((phone) => phone.phone_number);
    return { allowedMobileNumbers: phoneNumbers };
  }

  async getAllByMobileId(phoneId: string, from: string) {
    if (!phoneId || !from) {
      return undefined;
    }
    const user = await this.userRepository.findOne({
      where: { phoneId, verified: true },
      relations: ["templates", "phone_numbers"],
    });
    const allowed = user.phone_numbers;

    if (!user || !allowed.some((phone) => phone.phone_number === from)) {
      console.log("user not found or not allowed");
      console.log(user.phone_numbers, "user.phone_numbers");
      return undefined;
    }

    console.log(user.templates[0], "user.templates[0]", {
      ...user.phone_numbers,
    });
    const buttons = await this.buttonsRepository.find({
      where: { template: user.templates[0] },
    });
    console.log(buttons, "buttons");

    console.log({
      template: user.templates[0],
      buttons: buttons,
      user: {
        email: user.email,
        whatsappToken: user.whatsappToken,
        phoneId: user.phoneId,
      },
    });

    return {
      template: user.templates[0],
      buttons,
      user: {
        email: user.email,
        whatsappToken: user.whatsappToken,
        phoneId: user.phoneId,
      },
    };
  }
}
