const express = require("express"),
axios = require('axios'),
router = express.Router();
  
  router.get("/dashboard", function (req, res, next) {
    let reqParams = {
      "module": "ChatBotCms",
      "module_code": "ChatCmsService",
      "action": "getDashboardDetails",
      "data": {}
    };
    axios({
      method: 'POST',
      url: process.env.SERVICE_URL.concat("api/v1/product/service"),
      headers: {
        'Content-Type': 'application/json',
        'api-version': process.env.API_VERSION,
        "Authorization": 'Bearer ' + req.session.userId
      },
      data: JSON.stringify(reqParams)
    }).then(response => {
      const profileImage = response.data.data.profile_data;
      res.render("dashboard", { 
        profileImage: profileImage,
        resData: response.data.data.data_count,
        organization: response.data.data.organizations
       });
    });
  });

  router.get("/organization", function (req, res, next) {
    let page = parseInt(req.query.page) || 1, limit = 5, skip = (page - 1) * limit;
    let reqParams = {
      "module": "ChatBotCms",
      "module_code": "ChatCmsService",
      "action": "getOrganization",
      "data": {
        "limit": limit,
        "skip": skip
      }
    };
    axios({
      method: 'POST',
      url: process.env.SERVICE_URL.concat("api/v1/chatbot/service"),
      headers: {
        'Content-Type': 'application/json',
        'api-version': process.env.API_VERSION,
        "Authorization": 'Bearer ' + req.session.userId
      },
      data: JSON.stringify(reqParams)
    }).then(response => {
      const profileImage = response.data.data.profile_data;
      const totalPages = Math.ceil(response.data.data.organization.totallength / limit);
      res.render("organization", { 
        resData: response.data.data, 
        profileImage: profileImage,
        currentPage: page, 
        totalPages: totalPages
      });
    });
  });

  router.get("/products", function (req, res, next) {
    let page = parseInt(req.query.page) || 1, limit = 5, skip = (page - 1) * limit;
    let reqParams = {
      "module": "ChatBotCms",
      "module_code": "ChatCmsService",
      "action": "getProducts",
      "data": {
        "limit": limit,
        "skip": skip
      }
    };
    axios({
      method: 'POST',
      url: process.env.SERVICE_URL.concat("api/v1/chatbot/service"),
      headers: {
        'Content-Type': 'application/json',
        'api-version': process.env.API_VERSION,
        "Authorization": 'Bearer ' + req.session.userId
      },
      data: JSON.stringify(reqParams)
    }).then(response => {
      const resData = response.data.data.product;
      const profileImage = response.data.data.profile_data;
      const totalPages = Math.ceil(resData.totallength / limit);
      res.render("products", { 
        products: resData.products, 
        organization : resData.organization, 
        profileImage: profileImage,
        currentPage: page, 
        totalPages: totalPages
       });
    });
  });

  router.get("/questions", function (req, res, next) {
    let page = parseInt(req.query.page) || 1, limit = 5, skip = (page - 1) * limit;
    let reqParams = {
      "module": "ChatBotCms",
      "module_code": "ChatCmsService",
      "action": "getQuestions",
      "data": {
        "limit": limit,
        "skip": skip
      }
    };
    axios({
      method: 'POST',
      url: process.env.SERVICE_URL.concat("api/v1/chatbot/service"),
      headers: {
        'Content-Type': 'application/json',
        'api-version': process.env.API_VERSION,
        "Authorization": 'Bearer ' + req.session.userId
      },
      data: JSON.stringify(reqParams)
    }).then(response => {
      const resData = response.data.data.question;
      const profileImage = response.data.data.profile_data;
      const totalPages = Math.ceil(resData.totallength / limit);
      res.render("questions", { 
        organization : resData.organization, 
        questions : resData.questions, 
        profileImage: profileImage,
        currentPage: page, 
        totalPages: totalPages
      });
    });
  });

  router.get("/questions/mapping", function (req, res, next) {
    let page = parseInt(req.query.page) || 1, limit = 8, skip = (page - 1) * limit;
    let reqParams = {
      "module": "ChatBotCms",
      "module_code": "ChatCmsService",
      "action": "searchQuestionMapping",
      "data": {
        "limit": limit,
        "skip": skip
      }
    };
    axios({
      method: 'POST',
      url: process.env.SERVICE_URL.concat("api/v1/chatbot/service"),
      headers: {
        'Content-Type': 'application/json',
        'api-version': process.env.API_VERSION,
        "Authorization": 'Bearer ' + req.session.userId
      },
      data: JSON.stringify(reqParams)
    }).then(response => {
      const resData = response.data.data;
      const totalPages = Math.ceil(resData.totallength / limit);
      res.render("question-mapping", { 
        organization : resData.data.organization, 
        questions : resData.data.questions, 
        profileImage: resData.profile_data,
        currentPage: page, 
        totalPages: totalPages
      });
    });
  });

  router.get("/language", function (req, res, next) {
    let page = parseInt(req.query.page) || 1, limit = 5, skip = (page - 1) * limit;
    let reqParams = {
      "module": "ChatBotCms",
      "module_code": "ChatCmsService",
      "action": "getLanguages",
      "data": {
        "limit": limit,
        "skip": skip
      }
    };
    axios({
      method: 'POST',
      url: process.env.SERVICE_URL.concat("api/v1/chatbot/service"),
      headers: {
        'Content-Type': 'application/json',
        'api-version': process.env.API_VERSION,
        "Authorization": 'Bearer ' + req.session.userId
      },
      data: JSON.stringify(reqParams)
    }).then(response => {
      const resData = response.data.data.language;
      const totalPages = Math.ceil(resData.totallength / limit);
      const profileImage = response.data.data.profile_data;
      res.render("language", { 
        resData: resData, 
        profileImage: profileImage, 
        currentPage: page, 
        totalPages: totalPages
      });
    });
  });

  router.get("/configuration", function (req, res, next) {
    let page = parseInt(req.query.page) || 1, limit = 5, skip = (page - 1) * limit;
    let reqParams = {
      "module": "ChatBotCms",
      "module_code": "ChatCmsService",
      "action": "getConfigurations",
      "data": {
        "limit": limit,
        "skip": skip
      }
    };
    axios({
      method: 'POST',
      url: process.env.SERVICE_URL.concat("api/v1/chatbot/service"),
      headers: {
        'Content-Type': 'application/json',
        'api-version': process.env.API_VERSION,
        "Authorization": 'Bearer ' + req.session.userId
      },
      data: JSON.stringify(reqParams)
    }).then(response => {
      const resData = response.data.data.config;
      const profileImage = response.data.data.profile_data;
      const totalPages = Math.ceil(resData.totallength / limit);
      res.render("configuration", { 
        products: resData.configs, 
        organization : resData.organization, 
        profileImage: profileImage,
        currentPage: page, 
        totalPages: totalPages
       });
    });
  });

  router.get("/submission", function (req, res, next) {
    let page = parseInt(req.query.page) || 1, limit = 5, skip = (page - 1) * limit;
    let reqParams = {
      "module": "ChatBotCms",
      "module_code": "ChatCmsService",
      "action": "getSubmission",
      "data": {
        "limit": limit,
        "skip": skip
      }
    };
    axios({
      method: 'POST',
      url: process.env.SERVICE_URL.concat("api/v1/chatbot/service"),
      headers: {
        'Content-Type': 'application/json',
        'api-version': process.env.API_VERSION,
        "Authorization": 'Bearer ' + req.session.userId
      },
      data: JSON.stringify(reqParams)
    }).then(response => {
      const resData = response.data.data.submission;
      const profileImage = response.data.data.profile_data;
      const totalPages = Math.ceil(resData.totallength / limit);
      res.render("submission", { 
        submissions: resData.submissions, 
        organization : resData.organization, 
        profileImage: profileImage,
        currentPage: page, 
        totalPages: totalPages
       });
    });
  });

  router.get("/settings", function (req, res, next) {
    let reqParams = {
      "module": "ChatBotCms",
      "module_code": "ChatCmsService",
      "action": "getConfigurations",
      "data": {}
    };
    axios({
      method: 'POST',
      url: process.env.SERVICE_URL.concat("api/v1/chatbot/service"),
      headers: {
        'Content-Type': 'application/json',
        'api-version': process.env.API_VERSION,
        "Authorization": 'Bearer ' + req.session.userId
      },
      data: JSON.stringify(reqParams)
    }).then(response => {
      const resData = response.data.data;
      const profileImage = response.data.data.profile_data;
      res.render("settings", { resData: resData, profileImage: profileImage });
    });
  });

module.exports = router;
