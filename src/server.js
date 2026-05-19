import "dotenv/config";
import { app } from "./app.js";
import { prisma } from "./lib/prisma.js";

const port = Number(process.env.PORT || 4000);

const server = app.listen(port, () => {
  console.log(`Pawberry API listening on http://127.0.0.1:${port}`);
});

async function shutdown() {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
