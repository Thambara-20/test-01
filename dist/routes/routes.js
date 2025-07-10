"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Routes = exports.Role = void 0;
const userController_1 = require("../controllers/userController");
const templateController_1 = require("../controllers/templateController");
const auth_1 = require("../middleware/auth");
const phoneController_1 = require("../controllers/phoneController");
const buttonController_1 = require("../controllers/buttonController");
var Role;
(function (Role) {
    Role["ADMIN"] = "admin";
    Role["OBSERVER"] = "observer";
    Role["NONE"] = "";
})(Role || (exports.Role = Role = {}));
exports.Routes = [
    {
        method: "post",
        route: "/users/signup",
        controller: userController_1.UserController,
        action: "create",
        middleware: [],
    },
    {
        method: "post",
        route: "/users/register",
        controller: userController_1.UserController,
        action: "register",
        middleware: [],
    },
    {
        method: "post",
        route: "/users/login",
        controller: userController_1.UserController,
        action: "login",
        middleware: [],
    },
    {
        method: "post",
        route: "/users/email/:socketId",
        controller: userController_1.UserController,
        action: "email",
        middleware: [auth_1.authenticateToken, (0, auth_1.authorizeRole)([Role.ADMIN])],
    },
    {
        method: "post",
        route: "/users/verify",
        controller: userController_1.UserController,
        action: "verify",
        middleware: [auth_1.authenticateToken],
    },
    {
        method: "post",
        route: "/users/refreshtoken",
        controller: userController_1.UserController,
        action: "refreshToken",
        middleware: [],
    },
    {
        method: "post",
        route: "/users/logout",
        controller: userController_1.UserController,
        action: "logout",
        middleware: [],
    },
    {
        method: "post",
        route: "/user/update/:socketId",
        controller: userController_1.UserController,
        action: "updateUser",
        middleware: [auth_1.authenticateToken],
    },
    // Template routes
    {
        method: "get",
        route: "/templates",
        controller: templateController_1.TemplateController,
        action: "getAllTemplates",
        middleware: [],
    },
    {
        method: "get",
        route: "/template",
        controller: templateController_1.TemplateController,
        action: "getTemplateByUserId",
        middleware: [auth_1.authenticateToken, (0, auth_1.authorizeRole)([Role.ADMIN, Role.OBSERVER])],
    },
    {
        method: "put",
        route: "/templates/update/:socketId",
        controller: templateController_1.TemplateController,
        action: "updateTemplate",
        middleware: [],
    },
    // Phone routes
    {
        method: "get",
        route: "/phone",
        controller: phoneController_1.PhoneController,
        action: "getPhoneNumbersByUserId",
        middleware: [auth_1.authenticateToken, (0, auth_1.authorizeRole)([Role.ADMIN, Role.OBSERVER])],
    },
    {
        method: "post",
        route: "/template/buttons",
        controller: phoneController_1.PhoneController,
        action: "getAllByMobileId",
        middleware: [],
    },
    // button routes
    {
        method: "get",
        route: "/button/:id",
        controller: buttonController_1.ButtonController,
        action: "getButtonById",
        middleware: [],
    },
    {
        method: "get",
        route: "/health",
        controller: class {
            health() {
                return { status: "ok", timestamp: new Date().toISOString() };
            }
        },
        action: "health",
        middleware: [],
    },
];
//# sourceMappingURL=routes.js.map