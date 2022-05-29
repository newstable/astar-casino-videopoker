const express = require("express");
const router = express.Router();
const User = require("./api_controller");

module.exports = (router) => {
    // User API
    router.post("/start-VideoPoker", User.StartSignal);
};
