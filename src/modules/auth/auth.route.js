const express = require("express");
const { body } = require("express-validator");
const { register, login } = require("./auth.controller");

const router = express.Router();

// Validasi dipisah ke sini supaya controller tetap bersih
const registerValidation = [
  body("email").isEmail().withMessage("Paramter email tidak sesuai format"),
  body("first_name").notEmpty().withMessage("First name tidak boleh kosong"),
  body("last_name").notEmpty().withMessage("Last name tidak boleh kosong"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password minimal 8 karakter"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Paramter email tidak sesuai format"),
  body("password").notEmpty().withMessage("Password tidak boleh kosong"),
];

router.post("/registration", registerValidation, register);
router.post("/login", loginValidation, login);

module.exports = router;
