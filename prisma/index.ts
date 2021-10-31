import authenticated from "../routes/authenticated";
import { PrismaClient } from "@prisma/client";
const express = require("express");
const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

async function main() {
  app.use(express.json());
  app.use("/auth", authenticated);
  app.listen(port, () => console.log(`Running on ${port}`));
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
