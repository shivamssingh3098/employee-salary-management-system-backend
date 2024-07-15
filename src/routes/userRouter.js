const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,

  logoutUser,

  currentUser,

  addSalary,
  updateEmployee,
  updateSalary,
  getEmployees,
  deleteEmployee,
} = require("../controllers/user.controller");
const { jwtVerify } = require("../middlewares/authMiddleware");

router.route("/register").post(registerUser);
router.route("/add-salary").post(addSalary);

router.route("/login").post(loginUser);

router.route("/update-emp/:id").patch(jwtVerify, updateEmployee);
router.route("/update-salary/:id").patch(jwtVerify, updateSalary);
router.route("/all-employee").get(jwtVerify, getEmployees);
router.route("/employee/:id").delete(jwtVerify, deleteEmployee);

// ------------------------------

router.route("/").get(jwtVerify, currentUser);

router.route("/logout").post(jwtVerify, logoutUser);

module.exports = router;
