/* Читает assets/img/manifest.json, если он собран. Отсутствие файла — не
   ошибка: шаблон покажет плашку-заглушку и сборка не упадёт. */
const fs = require("fs");
const path = require("path");

module.exports = () => {
  const p = path.join(__dirname, "..", "..", "assets", "img", "manifest.json");
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (e) {
    return {};
  }
};
