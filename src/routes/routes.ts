import { UserController } from "../controllers/userController";
import { TemplateController } from "../controllers/templateController";
import { authenticateToken, authorizeRole } from "../middleware/auth";
import { PhoneController } from "../controllers/phoneController";
import { ButtonController } from "../controllers/buttonController";
export enum Role {
  ADMIN = "admin",
  OBSERVER = "observer",
  NONE = "",
}

export const Routes = [
  {
    method: "post",
    route: "/users/signup",
    controller: UserController,
    action: "create",
    middleware: [],
  },
  {
    method: "post",
    route: "/users/register",
    controller: UserController,
    action: "register",
    middleware: [],
  },
  {
    method: "post",
    route: "/users/login",
    controller: UserController,
    action: "login",
    middleware: [],
  },
  {
    method: "post",
    route: "/users/email/:socketId",
    controller: UserController,
    action: "email",
    middleware: [authenticateToken, authorizeRole([Role.ADMIN])],
  },
  {
    method: "post",
    route: "/users/verify",
    controller: UserController,
    action: "verify",
    middleware: [authenticateToken],
  },
  {
    method: "post",
    route: "/users/refreshtoken",
    controller: UserController,
    action: "refreshToken",
    middleware: [],
  },
  {
    method: "post",
    route: "/users/logout",
    controller: UserController,
    action: "logout",
    middleware: [],
  },

  {
    method: "post",
    route: "/user/update/:socketId",
    controller: UserController,
    action: "updateUser",
    middleware: [authenticateToken],
  },
  // Template routes
  {
    method: "get",
    route: "/templates",
    controller: TemplateController,
    action: "getAllTemplates",
    middleware: [],
  },

  {
    method: "get",
    route: "/template",
    controller: TemplateController,
    action: "getTemplateByUserId",
    middleware: [authenticateToken, authorizeRole([Role.ADMIN, Role.OBSERVER])],
  },
  {
    method: "put",
    route: "/templates/update/:socketId",
    controller: TemplateController,
    action: "updateTemplate",
    middleware: [],
  },

  // Phone routes
  {
    method: "get",
    route: "/phone",
    controller: PhoneController,
    action: "getPhoneNumbersByUserId",
    middleware: [authenticateToken, authorizeRole([Role.ADMIN, Role.OBSERVER])],
  },
  {
    method: "post",
    route: "/template/buttons",
    controller: PhoneController,
    action: "getAllByMobileId",
    middleware: [],
  },
  // button routes
  {
    method: "get",
    route: "/button/:id",
    controller: ButtonController,
    action: "getButtonById",
    middleware: [],
  },
];
