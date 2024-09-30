const express = require("express"),
axios = require('axios'),
router = express.Router();

  router.get("/login", function (req, res, next) {
    if (req.session) {
      req.session.destroy();
    }
      res.render("login");
  });

  router.get("/user/verify", function (req, res, next) {
    const { token } = req.query;
    axios({
      method: 'POST',
      url: process.env.SERVICE_URL.concat("api/v1/authentication"),
      headers: {
        'Content-Type': 'application/json',
        'api-version': process.env.API_VERSION
      },
      data: JSON.stringify({
        "module": "Auth",
        "module_code": "JWTAUTH",
        "action": "verification",
        "data" : {
          "verify_token": token
        }
      })
    }).then(response => {
      const responseData = response.data;
      if (responseData.code == 200) {
        res.render("user-verify", { resData: "success" });
      } else {
        res.render("user-verify", { resData: "expired" });
      }
    }); 
  });

  router.post("/", async function (req, res, next) {
      axios({
        method: 'POST',
        url: process.env.SERVICE_URL.concat("api/v1/authentication"),
        headers: {
          'Content-Type': 'application/json',
          'api-version': process.env.API_VERSION
        },
        data: JSON.stringify(req.body)
      }).then(response => {
        const responseData = response.data;
        if (responseData.code == 200) {
          req.session.userId = responseData.data;
          req.session.save();
          return res.status(200).json(responseData);
        } else {
          return res.status(201).json({
            code: 201,
            type: "Invalid Credentials",
            message: "please provide the valid username or password",
          });
        }
      });
  });

module.exports = router;
