require("dotenv").config();
const App = require("./src/app");

(async () => {
  const app = new App();
  await app.init();   // ✅ đảm bảo MongoDB và RabbitMQ kết nối trước
  app.start();
})();
