const auth = require("http-auth");
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const { check, validationResult } = require("express-validator");

const router = express.Router();
const Registration = mongoose.model("Registration");
const basic = auth.basic({
  file: path.join(__dirname, "../users.htpasswd"),
});

router.get("/", (req, res) => {
  res.render("form", { title: "Drop me a message" });
});

router.post(
  "/",
  [
    check("name").isLength({ min: 1 }).withMessage("Please enter a name"),
    check("email").isLength({ min: 1 }).withMessage("Please enter an email"),
    check("message").isLength({ min: 1 }).withMessage("Please enter a message"),
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      const registration = new Registration(req.body);
      registration
        .save()
        .then(() => {
          res.render("thank", { title: "Thank you" });
        })
        .catch((err) => {
          console.log(err);
          res.send("Sorry! Something went wrong.");
        });
    } else {
      res.render("form", {
        title: "Message form",
        errors: errors.array(),
        data: req.body,
      });
    }
  }
);

router.get(
  "/admin",
  basic.check((req, res) => {
    Registration.find()
      .then((registrations) => {
        res.render("index", { title: "Listing message", registrations });
      })
      .catch((err) => {
        console.log(err);
        res.send("Sorry! Something went wrong.");
      });
  })
);

module.exports = router;
