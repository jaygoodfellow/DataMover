const express = require("express");
const router = express.Router();

const Home = require("../controllers/home");
const Exports = require("../controllers/exports");
const Generate = require("../controllers/generate");
const Process = require("../controllers/process");

router.get("/", Home.index);
router.get("/exports", Exports.index);
router.get("/exports/:id", Exports.list);
router.post("/export", Exports.export);
router.post("/generate", Generate.index);
router.get("/process", Process.index);

module.exports = router;
