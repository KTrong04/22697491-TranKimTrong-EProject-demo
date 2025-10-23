require("dotenv").config();
const App = require("./src/app");

(async () => {
  const app = new App();
  await app.init(); // đảm bảo kết nối DB + RabbitMQ
  app.start();
})();
