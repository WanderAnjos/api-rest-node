"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/app.ts
var import_cookie = __toESM(require("@fastify/cookie"));
var import_fastify = __toESM(require("fastify"));

// src/connection.ts
var import_knex = require("knex");

// src/env/index.ts
var import_dotenv = require("dotenv");
var import_zod = require("zod");
if (process.env.NODE_ENV === "test") {
  (0, import_dotenv.config)({
    path: ".env.test"
  });
} else {
  (0, import_dotenv.config)();
}
var envSchema = import_zod.z.object({
  NODE_ENV: import_zod.z.enum(["development", "test", "production"]).default("production"),
  DATABASE_URL: import_zod.z.string(),
  PORT: import_zod.z.number().default(3333)
});
var _env = envSchema.safeParse(process.env);
if (_env.success === false) {
  console.error("Invalid Enviroment Variables", _env.error.format());
  process.exit(1);
}
var env = _env.data;

// src/connection.ts
var config2 = {
  client: "sqlite",
  connection: {
    filename: env.DATABASE_URL
  },
  useNullAsDefault: true
};
var knex = (0, import_knex.knex)(config2);

// src/routes/transactions.ts
var import_node_crypto = __toESM(require("crypto"));
var import_zod2 = require("zod");
async function transactionsRoutes(app2) {
  app2.post("/", async (req, res) => {
    const { body } = req;
    const createTransactionBodySchema = import_zod2.z.object({
      title: import_zod2.z.string(),
      amount: import_zod2.z.number(),
      type: import_zod2.z.enum(["credit", "debit"])
    });
    const { title, amount, type } = createTransactionBodySchema.parse(body);
    let sessionId = req.cookies.sessionId;
    if (!sessionId) {
      sessionId = import_node_crypto.default.randomUUID();
      res.setCookie("sessionId", sessionId, {
        path: "/",
        maxAge: 1e3 * 60 * 60 * 24 * 7
        // -> 7 Dias
      });
    }
    await knex("transactions").insert({
      id: import_node_crypto.default.randomUUID(),
      title,
      amount: type === "credit" ? amount : amount * -1,
      session_id: sessionId
    });
    return res.status(201).send();
  });
  app2.get("/", async (req, res) => {
    const { sessionId } = req.cookies;
    const transactions = await knex("transactions").where("session_id", sessionId).select();
    return {
      transactions
    };
  });
  app2.get("/:id", async (req, res) => {
    const { sessionId } = req.cookies;
    const getTransactionsParamsSchema = import_zod2.z.object({
      id: import_zod2.z.string().uuid()
    });
    const { id } = getTransactionsParamsSchema.parse(req.params);
    const transaction = await knex("transactions").where("id", id).where("session_id", sessionId).first();
    return transaction;
  });
  app2.get("/summary", async (req) => {
    const { sessionId } = req.cookies;
    const summary = await knex("transactions").sum("amount", { as: "amount" }).where("session_id", sessionId).first();
    return {
      summary
    };
  });
}

// src/app.ts
var app = (0, import_fastify.default)();
app.register(import_cookie.default);
app.register(transactionsRoutes, {
  prefix: "transactions"
});
app.get("/schemas", async (req, res) => {
  return await knex("transactions").select("*");
});

// src/server.ts
app.listen({
  port: env.PORT
}).then(() => {
  console.log("HTTP Server Running");
});
