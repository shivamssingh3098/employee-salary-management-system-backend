const File = require("../models/fileModel");
const Salary = require("../models/salaryModel");
const User = require("../models/userModel");
const { uploadOnCloudinary } = require("../utils/cloudinary");
const { generate } = require("../utils/generateUniqueNumber");
const fs = require("fs");
const nodemailer = require("nodemailer");
const generateToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateToken();
    return { accessToken };
  } catch (error) {
    console.log(error);
  }
};

exports.currentUser = async (req, res) => {
  try {
    const currentUser = req.user;
    // console.log("currentUser", currentUser);
    res.status(200).json({
      status: "success",
      message: "User logged in successfully",
      user: currentUser,
    });
  } catch (error) {
    console.log("Current user is not available", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

exports.registerUser = async (req, res) => {
  try {
    const { userName, email, number, fullName, password, department } =
      req.body;
    console.log(userName, email, number, fullName, department, password);
    if (
      [userName, email, number, fullName, department, password].some(
        (field) => field?.trim() === ""
      )
    ) {
      console.log("All fields are required");
      res.status(400).json({
        status: "Bad Request",
        message: "All fields are required",
      });
    }

    const exitedUser = await User.findOne({
      $or: [{ userName }, { email }],
    });
    if (exitedUser) {
      res.status(400).json({
        status: "Bad Request",
        message: "User already exists",
      });
    }
    const user = await User.create({
      userName,
      email,
      number,
      fullName,
      department,
      password,
    });
    const createdUser = await User.findById(user._id).select("-password");

    if (!createdUser) {
      res.status(500).json({
        status: "Bad Request",
        message: "Something went wrong while creating the user",
      });
    }
    res.status(200).json({
      status: "success",
      message: "User created successfully",
      data: createdUser,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.addSalary = async (req, res) => {
  try {
    const { idSal, month, amount } = req.body;
    let empId = idSal;
    console.log(empId, month, amount);
    if ([empId, month].some((field) => field?.trim() === "")) {
      console.log("All fields are required");
      res.status(400).json({
        status: "Bad Request",
        message: "All fields are required",
      });
    }

    const empl = await User.findById(empId);

    const exitedEmpSalary = await Salary.findOne({
      empId: empId,
    });

    const transporter = await nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: "isaias55@ethereal.email",
        pass: "qPWX3n2Mfe6jXTHfVp",
      },
    });

    if (exitedEmpSalary) {
      // const salaryUpdate = await Salary.findByIdAndUpdate({empId:empId},{});
      exitedEmpSalary.amount = parseFloat(amount);
      exitedEmpSalary.month = month;
      exitedEmpSalary.totalAmount += parseFloat(amount);
      await exitedEmpSalary.save();

      empl.salary = exitedEmpSalary._id;
      await empl.save();

      const info = await transporter.sendMail({
        from: '"Shivam Singh 👻" <shivamssingh3098@gmail.com>', // sender address
        to: empl.email, // list of receivers
        subject: "salary done ✔", // Subject line
        text: "salary done", // plain text body
        html: "salary done successfully", // html body
      });
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      // res.send("done");
      console.log("Message sent: %s", info);

      res.status(200).json({
        status: "success",
        message: "salary updated successfully",
        data: exitedEmpSalary,
      });
      return;
    }
    const employee = await Salary.create({
      empId: empId,
      amount: amount,
      month: month,
      totalAmount: amount,
    });

    empl.salary = employee._id;
    await empl.save();
    const info = await transporter.sendMail({
      from: '"Shivam Singh 👻" <shivamssingh3098@gmail.com>', // sender address
      to: empl.email, // list of receivers
      subject: "salary done ✔", // Subject line
      text: "salary done", // plain text body
      html: "salary done successfully", // html body
    });
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // res.send("done");
    console.log("Message sent: %s", info);
    res.status(200).json({
      status: "success",
      message: "User created successfully",
      data: employee,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { userName, email, password } = req.body;
    if (!(userName || email)) {
      res.status(404).json({
        message: "Username or email is required",
      });
    }
    const user = await User.findOne({
      $or: [{ userName }, { email }],
    });
    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
    }
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
      res.status(401).json({
        message: "Invalid user credentials",
      });
    }

    const { accessToken } = await generateToken(user._id);
    console.log(accessToken);
    const loggedInUser = await User.findById(user._id).select("-password");
    const options = {
      httpOnly: true,
      secure: true,
    };
    console.log(loggedInUser);
    res.cookie("token", accessToken, options);

    console.log("loggedInUser before otp", loggedInUser);
    return res.status(200).json({
      message: "Correct credentials",
      user: loggedInUser,
      token: accessToken,
    });
  } catch (error) {
    console.log("Not login", error);
  }
};

exports.updateEmployee = async (req, res, next) => {
  const { userName, email, number, fullName, department } = req.body;
  const { id } = req.params;
  console.log("id", id);
  console.log(
    "userName, email, number, fullName, password, department",
    userName,
    email,
    number,
    fullName,

    department
  );

  const employee = await User.findById(id);
  if (!employee) {
    console.log("User not found");
    return res.status(404).json({
      message: "Employee not found",
    });
  }

  const updatedEmployee = await User.findByIdAndUpdate(
    { _id: id },
    {
      userName: userName,
      email: email,
      number: number,
      fullName: fullName,

      department: department,
    },
    { new: true }
  );

  console.log("updatedEmployee", updatedEmployee);
  return res.status(200).json({
    message: "Employee has been updated successfully",
    data: updatedEmployee,
  });
};

exports.updateSalary = async (req, res, next) => {
  const { month, amount, totalAmount } = req.body;
  const { id } = req.params;
  console.log(month, amount);
  console.log("updateSalary", id);
  const employee = await Salary.findById(id);
  if (!employee) {
    console.log("User not found");
    return res.status(404).json({
      message: "salary document not found",
    });
  }

  const salary = await Salary.findByIdAndUpdate(
    { _id: id },
    {
      month: month,
      amount: amount,
      totalAmount: totalAmount,
    },
    { new: true }
  );
  console.log("salary", salary);

  return res.status(200).json({
    message: "Employee salary has been updated successfully",
    data: salary,
  });
};

// ----------------------

exports.getEmployees = async (req, res, next) => {
  try {
    const getEmployees = await User.find().populate("salary");
    return res.status(200).json({
      message: "Employee salary has been updated successfully",
      data: getEmployees,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.logoutUser = async (req, res) => {
  try {
    const options = { httpOnly: true, secure: true };
    return res
      .status(200)
      .clearCookie("token", options)
      .json({ message: "User logged out successfully" });
  } catch (error) {
    console.log(error);
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    console.log(user);

    if (!user) {
      res.status(404).json({ message: "Couldn't delete" });
    }

    res
      .status(200)
      .json({ status: "success", message: "Employee deleted successfully" });
  } catch (error) {
    console.log(error);
  }
};
