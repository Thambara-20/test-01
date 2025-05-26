import { Request, Response } from "express";
import UserService, {
  generateTemporaryPassword,
} from "../services/userService";
import * as jwt from "jsonwebtoken";
import { User } from "../entity/user";
import * as bcrypt from "bcrypt";
import { sendMessage, sendSignupEmail } from "../services/emailService";
import { getSocketInstance } from "../services/socketService";
import { PhoneService } from "../services/phoneService";

const SECRET_KEY = process.env.SECRET_KEY;
const domain =
  process.env.NODE_ENV === "development" ? "localhost" : ".lbmsalpha.live";
const isSecure = process.env.NODE_ENV === "development" ? false : true;

export class UserController {
  private userService = new UserService();
  private phoneService = new PhoneService();
  private io = getSocketInstance();

  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      const user = await this.userService.findByEmail(email);
      if (!user || !(await user.comparePassword(password))) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      const accessToken = jwt.sign({ email, role: user.role }, SECRET_KEY, {
        expiresIn: "1h",
      });

      const refreshToken = jwt.sign({ email }, SECRET_KEY, {
        expiresIn: "7d",
      });

      res
        .cookie("accessToken", accessToken, {
          httpOnly: true,
          domain: domain,
          secure: isSecure,
          maxAge: 1000 * 60 * 60,
        })
        .cookie("refreshToken", refreshToken, {
          httpOnly: true,
          domain: domain,
          secure: isSecure,
          maxAge: 1000 * 60 * 60 * 24 * 7,
        })
        .status(200)
        .json({ role: user.role });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async email(req: Request, res: Response) {
    const { email, role, name, phoneId, whatsappToken } = req.body;
    const socketId = req.params.socketId;
    console.log("email", email, "role", role, "name", name, socketId, phoneId);

    try {
      if (name && role && email && phoneId && whatsappToken) {
        const tempToken = jwt.sign({ email, role }, SECRET_KEY, {
          expiresIn: "1h",
        });

        const isUniqueMobile = await this.userService.isUniqueMobile(
          email,
          phoneId
        );
        if (!isUniqueMobile) {
          res.status(400).json({ message: "Mobile number already exists" });
          sendMessage(this.io, socketId, "NewUser_Mobile_is_taken", email);
          return;
        }
        let user = await this.userService.findByEmail(email);
        const hashedToken = await bcrypt.hash(tempToken, 10);
        console.log("email", email, "role", role, "name", name, "user", user);

        if (!user) {
          const newUser = new User();
          newUser.email = email;
          newUser.role = role;
          newUser.tempToken = hashedToken;
          newUser.phoneId = phoneId;
          newUser.whatsappToken = whatsappToken;

          const tempPassword = generateTemporaryPassword();
          newUser.password = await bcrypt.hash(tempPassword, 10);

          await this.userService.createUser(newUser);
        } else {
          if (user.verified) {
            res
              .status(200)
              .json({ message: "email already exists", isVerified: true });
            return;
          }
          user.tempToken = hashedToken;
          await this.userService.updateUser(user);
        }

        await sendSignupEmail(email, role, name, tempToken);
        res.status(200).json({
          message: "Signup link sent successfully",
          tempToken,
          isVerified: isSecure,
        });
        sendMessage(this.io, socketId, "email_sent_successfully", email);
      } else {
        res.status(400).json({ error: "Invalid request parameters" });
        sendMessage(this.io, socketId, "socketId_sent_fail", email);
      }
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async create(req: Request, res: Response) {
    const { password, token, tel } = req.body;
    console.log("token", token, "password", password, "tel", tel);
    try {
      const decodedToken: any = jwt.verify(token, SECRET_KEY);
      const curr_user = await this.userService.findByEmail(decodedToken.email);
      if (!curr_user || !(await curr_user.compareTempToken(token)) || !tel) {
        res.status(401).json({ error: "Invalid token" });
        return;
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User();
      user.email = decodedToken.email;
      user.password = hashedPassword;
      user.tempToken = null;
      user.verified = true;
      user.tel = tel;
      user.active = true;

      console.log("user", user);
      await this.userService.updateUser(user);
      const updated = await this.phoneService.updatePhoneNumbersByUserId(
        user.email,
        [tel]
      );
      if (!updated) {
        res.status(400).json({ message: "Invalid phone numbers" });
        return;
      }
      res.status(200).json({ message: "User created successfully" });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async register(req: Request, res: Response) {
    const { email, password, role } = req.body;
    try {
      const user: any = await this.userService.findByEmail(email);

      if (user && user.verified) {
        res
          .status(200)
          .json({ messege: "email already exists", isVerified: true });
        return;
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User();
        newUser.email = email;
        newUser.password = hashedPassword;
        newUser.role = "observer";
        newUser.verified = true;
        await this.userService.createUser(newUser);
        res.status(200).json({ message: "User created successfully" });
      }
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async logout(req: any, res: any) {
    try {
      res
        .clearCookie("accessToken", {
          httpOnly: true,
          domain: domain,
          secure: isSecure,
        })
        .clearCookie("refreshToken", {
          httpOnly: true,
          domain: domain,
          secure: isSecure,
        })
        .status(200)
        .json({ message: "User logged out successfully" });
      console.log("logout");
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async refreshToken(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(401).json({ error: "Access denied. Token not provided." });
      return;
    }

    jwt.verify(refreshToken, SECRET_KEY, async (err: any, payload: any) => {
      if (err) {
        res.status(403).json({ error: "Invalid token." });
        return;
      }

      const user = await this.userService.findByEmail(payload.email);

      if (!user) {
        res.status(403).json({ error: "Invalid token." });
        return;
      }

      const accessToken = jwt.sign(
        { email: user.email, role: user.role },
        SECRET_KEY,
        {
          expiresIn: "5h",
        }
      );

      res
        .cookie("accessToken", accessToken, {
          httpOnly: true,
          domain: domain,
          secure: isSecure,
          maxAge: 1000 * 60,
        })
        .status(200)
        .json({ role: user.role });
    });
  }

  async updateUser(req: any, res: Response) {
    const { tel, whatsappToken, phoneNumbers, phoneId, verifyToken } = req.body;
    const email = req.user.email;
    const socketId = req.params.socketId;
    try {
      if (
        !email ||
        tel.length < 10 ||
        !whatsappToken ||
        !phoneId
      ) {
        res.status(400).json({ message: "Invalid data" });
        return;
      }

      const isUnique = await this.userService.isUniqueMobile(email, phoneId);
      if (!isUnique) {
        res.status(400).json({ message: "mobile number existing" });
        sendMessage(this.io, socketId, "Mobile_is_taken", email);
        return;
      }
      const user = await this.userService.findByEmail(email);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      user.tel = tel;
      user.phoneId = phoneId;
      user.whatsappToken = whatsappToken;
      user.active = true;

      await this.userService.updateUser(user);
      
      console.log(user.email, phoneNumbers, "phoneNumbers");
      const updated = await this.phoneService.updatePhoneNumbersByUserId(
        user.email,
        phoneNumbers
      );
      console.log("updated", updated);
      if (!updated) {
        res.status(400).json({ message: "Invalid phone numbers" });
        return;
      }
      sendMessage(this.io, socketId, "settings_updated_successfully", email);
      res.status(200).json({ message: "Mobile number updated successfully" });
    } catch (error) {
      sendMessage(this.io, socketId, "settings_updated_fail", email);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async verify(req: any, res: Response) {
    const user = await this.userService.findByEmail(req.user.email);
    res.status(200).json({
      message: "User verified successfully",
      role: req.user.role,
      email: req.user.email,
      phoneId: user?.phoneId,
      tel: user?.tel,
      whatsappToken: user?.whatsappToken,
      active: user?.active,
    });
  }
}
