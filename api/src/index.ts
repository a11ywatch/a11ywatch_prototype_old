/*
 * Copyright (c) A11yWatch, LLC. and its affiliates.
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/

import express from "express";
import http from "http";
import cors from "cors";
import { CronJob } from "cron";
import { ApolloServer } from "apollo-server-express";
import bodyParser from "body-parser";
import { config } from "./config";
import {
  // cronTimer,
  corsOptions,
  logServerInit,
  BYPASS_AUTH,
} from "./config/server";

import { imageDetect } from "./data/external";
// const { usersEmail } = require("./data/controllers/users/email");
import { decodeJwt, verifyJwt } from "./data/utils";
import { schema } from "./data/schema";
import { AUTH_ERROR, TOKEN_EXPIRED_ERROR } from "./data/strings";

import { SubDomainController } from "./data/controllers/subdomains";
import { ScriptsController } from "./data/controllers/scripts";
import { HistoryController } from "./data/controllers/history";
import { WebsitesController, websiteWatch } from "./data/controllers/websites";
import { UsersController } from "./data/controllers/users";
import { IssuesController } from "./data/controllers/issues";
import { FeaturesController } from "./data/controllers/features";
import { AnalyticsController } from "./data/controllers/analytics";
import { initDbConnection } from "./database";

const { GRAPHQL_PORT, DEV } = config;
const app = express();

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ type: "application/*+json" }));

const server = new ApolloServer({
  tracing: DEV,
  schema,
  subscriptions: {
    keepAlive: 10000,
  },
  context: ({ req, connection }) => {
    if (connection) {
      return connection?.context;
    }
    const bearerToken = req.headers?.authorization;
    const token = bearerToken?.includes("Bearer ") && bearerToken.split(" ")[1];
    const user = token && decodeJwt(token);

    if (!BYPASS_AUTH.includes(req.body?.operationName)) {
      if (!user) {
        throw new Error(AUTH_ERROR);
      }

      if (token && !verifyJwt(token)) {
        throw new Error(TOKEN_EXPIRED_ERROR);
      }
    }
    return {
      user,
      models: {
        User: UsersController({ user }),
        Website: WebsitesController({ user }),
        Issue: IssuesController({ user }),
        Features: FeaturesController({ user }),
        SubDomain: SubDomainController({ user }),
        History: HistoryController({ user }),
        Analytics: AnalyticsController({ user }),
        Scripts: ScriptsController({ user }),
      },
    };
  },
});

server.applyMiddleware({ app, cors: false });
const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

app.get("/", (req, res) => {
  res.json({
    server_status: "online",
  });
});

app.get("/api/unsubscribe-emails", async (req, res) => {
  try {
    const email = req?.query?.email;
    const id = req?.query?.id;

    await UsersController().unsubscribeEmails({
      id: Number(id),
      email: String(email),
    });
    res.json({
      sucess: "unsubscribed from email alerts",
    });
  } catch (e) {
    console.log(e);
    res.json({
      failed: "failed to unsubscribed from email alerts",
    });
  }
});

app.post("/api/website-crawl", async (req, res) => {
  try {
    const { data } = req.body;

    if (data) {
      const { user_id, pages, domain } = JSON.parse(data);

      if (pages?.length === 0) {
        console.log("page offline", domain);
        await UsersController().sendWebsiteOffline({ id: user_id, domain });
        res.send(false);
      } else {
        for (
          let websiteIterator = 0;
          websiteIterator < pages.length;
          websiteIterator++
        ) {
          await SubDomainController().crawlWebsite({
            url: pages[websiteIterator],
            userId: user_id,
          });
        }
        res.send(true);
      }
    }
  } catch (e) {
    console.error(e);
    res.send(false);
  }
});

app.post("/api/crawlWebsite", (req, res) => {
  const url = req.query?.websiteUrl;
  const userId = req.query?.userId;

  try {
    SubDomainController().crawlWebsite({
      url,
      userId,
    });
  } catch (crawl_error) {
    console.log(crawl_error);
  }

  res.send(true);
});

const websiteChecker = async (req, res) => {
  const url = req.query?.url || req.body?.url;
  if (!url) {
    res.json({
      status: 400,
      message: "URL NOT FOUND",
      success: false,
    });
  } else {
    const bearerToken = req.query?.jwt || req.body?.jwt;
    const token =
      (bearerToken?.includes("Bearer ") && bearerToken.split(" ")[1]) ||
      bearerToken;
    const user = token && decodeJwt(token);

    if (!user) {
      res.json({
        status: 400,
        message: "USER NOT FOUND",
        success: false,
      });
    } else {
      const { keyid, audience } = user?.payload;

      const [userData] = await UsersController({
        user,
      }).updateApiUsage({ id: keyid }, true);

      const usage = userData?.apiUsage?.usage;

      if (
        (audience === 0 && usage >= 3) ||
        (audience === 1 && usage >= 100) ||
        (audience === 2 && usage >= 500)
      ) {
        res.json({
          data: null,
          status: 429,
          message:
            "RATE EXCEEDED: Please try again tomorrow or upgrade your account",
          success: false,
        });
      } else {
        let data = {};

        try {
          data = await SubDomainController().crawlWebsite({
            url: url?.includes("http") ? url : `http://${url}`,
            userId: keyid,
            apiData: true,
          });

          console.log(data);
        } catch (e) {
          console.error(e);
        }

        res.json(data);
      }
    }
  }
};

app.get("/api/website-check", websiteChecker);
app.post("/api/website-check", websiteChecker);

app.post("/api/image-check", async (req, res) => {
  const img = req.body?.imageBase64;
  const bearerToken = req.body?.jwt;
  const token =
    (bearerToken?.includes("Bearer ") && bearerToken.split(" ")[1]) ||
    bearerToken;
  const user = token && decodeJwt(token);

  if (!user) {
    res.json({
      data: null,
      status: 400,
      message: "USER NOT FOUND",
      success: false,
    });
  } else {
    const { keyid, audience } = user?.payload;
    const [userData] = await UsersController({
      user: user,
    }).updateApiUsage({ id: keyid }, true);

    const usage = userData?.apiUsage?.usage;

    if (
      (audience === 0 && usage >= 3) ||
      (audience === 1 && usage >= 100) ||
      (audience === 2 && usage >= 500)
    ) {
      res.json({
        data: null,
        status: 429,
        message:
          "RATE EXCEEDED: Please try again tomorrow or upgrade your account",
        success: false,
      });
    } else {
      let data = { status: false };

      try {
        data = await imageDetect({ img });
      } catch (crawl_error) {
        console.log(crawl_error);
      }

      res.json(data);
    }
  }
});

app.post("/api/adminWatchTrigger", (req, res) => {
  const password = req.query?.password;
  if (password === "a11ywatch_live") {
    try {
      websiteWatch();
    } catch (crawl_error) {
      console.log(crawl_error);
    }
  }

  res.send(true);
});

app.get("/api/confirmEmail", async (req, res) => {
  const code: any = req.query?.code || "";
  console.log("CONFRIMING EMAIL:", code);
  const response = await UsersController().validateEmail(
    {
      code,
    },
    false
  );

  res.send(
    response
      ? "Success, email verified"
      : "Link expired, please get a new link and try again."
  );
});

httpServer.listen(GRAPHQL_PORT, async () => {
  await initDbConnection(null);
  logServerInit(server);
  if (process.env.DYNO === "web.1") {
    const job = new CronJob("00 00 00 * * *", function () {
      websiteWatch();
    });
    job.start();
    // usersEmail();
  }
});
