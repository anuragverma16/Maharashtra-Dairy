import app from "./src/app.js";
import { connectDB, env, setupConnectionEvents } from "./src/config/db.js";

setupConnectionEvents();
await connectDB();

app.listen(env.PORT, () => {
  console.log(`🐄 Maharashtra Dairy running on http://localhost:${env.PORT}`);
  console.log(`📝 Environment: ${env.NODE_ENV}`);
});
