/*
 * Copyright (c) A11yWatch, LLC. and its affiliates.
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/

import { addMinutes, isBefore, isSameDay } from "date-fns";
import { randomBytes } from "crypto";

import { connect } from "@app/database";
import { config } from "@app/config";

import {
  EMAIL_ERROR,
  GENERAL_ERROR,
  PASSWORD_ERROR,
  SUCCESS,
} from "../../strings";
import {
  transporter,
  mailOptions,
  saltHashPassword,
  signJwt,
} from "../../utils";
import { pubsub } from "../../subscriptions";
import { EMAIL_VERIFIED } from "../../static";
import { logoSvg } from "@app/html";
import { CountersController } from "../counters";
import { WebsitesController } from "../websites";

const {
  STRIPE_KEY,
  STRIPE_PREMIUM_PLAN,
  STRIPE_BASIC_PLAN,
  URL_SOURCE,
} = config;

const stripe = require("stripe")(STRIPE_KEY);

interface AuthParams {
  userId?: number;
  googleId?: number;
  password?: string;
  email?: string;
  newPassword?: string;
  resetCode?: string;
}
interface Params extends AuthParams {
  userId?: number;
  id?: number;
  emailConfirmCode?: string;
  email?: string;
  keyid?: number;
  stripeToken?: string;
  role?: number;
  alertEnabled?: boolean;
  code?: string;
  domain?: string;
}
interface UserControllerMethodsType {
  createUser(params: Params, chain: boolean): Promise<any>;
  getUser(params: Params, chain: boolean): Promise<any>;
  getUsers(chain: boolean): Promise<any>;
  getAllUsers(chain: boolean): Promise<any>;
  dataMigrateUsers(chain: boolean): Promise<any>;
  updateApiUsage(params: Params, chain: boolean): Promise<any>;
  deleteAll(): Promise<any>;
  verifyUser(params: AuthParams): Promise<any>;
  confirmEmail(params: Params): Promise<any>;
  addPaymentSubscription(params: Params): Promise<any>;
  cancelSubscription(params: Params): Promise<any>;
  updateUser(params: Params, chain: boolean): Promise<any>;
  forgotPassword(params: Params, chain: boolean): Promise<any>;
  toggleAlert(params: Params, chain: boolean): Promise<any>;
  resetPassword(params: Params, chain: boolean): Promise<any>;
  updateScanAttempt(params: Params, chain: boolean): Promise<any>;
  validateEmail(params: Params, chain: boolean): Promise<any>;
  unsubscribeEmails(params: Params): Promise<any>;
  sendWebsiteOffline(params: Params): Promise<any>;
}

interface UserControllerType {
  (user?: any): UserControllerMethodsType;
}

export const UsersController: UserControllerType = (
  { user: _user } = { user: null }
) => ({
  getUsers: async (chain) => {
    try {
      const [collection] = await connect("Users");
      const users = await collection.find().limit(20).toArray();
      return chain ? [users, collection] : users;
    } catch (e) {
      console.error(e);
    }
  },
  dataMigrateUsers: async (chain) => {
    const [allUsers, collection] = await this.getAllUsers(chain);

    allUsers?.forEach(async (item) => {
      const id = await CountersController().getNextSequenceValue("Users");

      if (item.id === null) {
        // TODO EMAIL USER
        collection.updateOne({ email: item.email }, { id });
      }
    });
  },
  getAllUsers: async function (chain) {
    try {
      const [collection] = await connect("Users");
      const users = await collection.find().limit(1000).toArray();
      return chain ? [users, collection] : users;
    } catch (e) {
      console.error(e);
    }
  },
  getUser: async ({ email, id, emailConfirmCode }, chain) => {
    try {
      let searchProps = {};

      if (email) {
        searchProps = { email };
      }
      if (typeof id !== "undefined") {
        searchProps = { ...searchProps, id };
      }
      if (emailConfirmCode) {
        searchProps = { ...searchProps, emailConfirmCode };
      }

      const [collection] = await connect("Users");
      const user = await collection.findOne(searchProps);

      return chain ? [user, collection] : user;
    } catch (e) {
      console.error(e);
    }
  },
  updateApiUsage: async ({ email, id, emailConfirmCode }, chain) => {
    try {
      const [user, collection] = await UsersController({
        user: _user,
      }).getUser({ id }, true);
      if (!user) {
        return chain ? [user, collection] : user;
      }

      const maxLimit = user.role === 0 ? 3 : user.role === 1 ? 100 : 500;
      const currentUsage = user?.apiUsage?.usage || 1;
      const blockScan = currentUsage >= maxLimit;

      let resetData = false;

      const lastScanDate = new Date();

      if (!isSameDay(user?.apiUsage?.lastScanDate, lastScanDate)) {
        resetData = true;
      }

      if (blockScan && !resetData) {
        return chain ? [user, collection] : user;
      }

      const updateCollectionProps = !resetData
        ? {
            apiUsage: { usage: user?.apiUsage?.usage + 1, lastScanDate },
          }
        : { apiUsage: { usage: 1, lastScanDate } };

      await collection.updateOne({ id }, { $set: updateCollectionProps });

      user.apiUsage = updateCollectionProps.apiUsage;

      return chain ? [user, collection] : user;
    } catch (e) {
      console.error(e);
    }
  },
  verifyUser: async ({ password, email, googleId }) => {
    const [user, collection] = await UsersController({
      user: _user,
    }).getUser({ email }, true);

    if (!user) {
      throw new Error(EMAIL_ERROR);
    }

    const salthash =
      user && !googleId && saltHashPassword(password, user?.salt);

    if (user?.password === salthash?.passwordHash || googleId) {
      let id = user?.id;
      let updateCollectionProps = {};

      if (user?.id === null) {
        id = await CountersController().getNextSequenceValue("Users");
        updateCollectionProps = { id };
      }
      const jwt = signJwt({
        email: email || user?.email,
        role: user?.role,
        keyid: id,
      });

      updateCollectionProps = { ...updateCollectionProps, jwt };

      if (googleId) {
        updateCollectionProps = { ...updateCollectionProps, googleId };
      }

      await collection.updateOne({ email }, { $set: updateCollectionProps });
      console.log(user);
      return {
        ...user,
        jwt,
      };
    }
    throw new Error(EMAIL_ERROR);
  },
  createUser: async ({ email, password, googleId, role = 0 }) => {
    if (!email) {
      throw new Error(EMAIL_ERROR);
    }
    const [user, collection] = await UsersController({
      user: _user,
    }).getUser({ email }, true);

    if (user?.salt || user?.googleId || (user && googleId)) {
      const salthash = password && saltHashPassword(password, user.salt);
      if (user?.password === salthash?.passwordHash || googleId) {
        let keyid = user?.id;
        let updateProps;

        if (typeof user?.id === "undefined" || user?.id === null) {
          keyid = await CountersController().getNextSequenceValue("Users");
          updateProps = { id: keyid };
        }

        const jwt = signJwt({
          email: user?.email,
          role: user.role || 0,
          keyid,
        });

        updateProps = { ...updateProps, jwt };

        if (googleId) {
          updateProps = { ...updateProps, googleId };
        }

        await collection.updateOne({ email }, { $set: updateProps });
        return user;
      } else {
        throw new Error(EMAIL_ERROR);
      }
    } else {
      const salthash = (password && saltHashPassword(password)) || {};
      const id = await CountersController().getNextSequenceValue("Users");

      const userObject = {
        email,
        password: salthash?.passwordHash,
        salt: salthash?.salt,
        id,
        jwt: signJwt({ email, role, keyid: id }),
        role,
        alertEnabled: false,
        emailConfirmed: false,
        googleId,
      };

      console.log(userObject);

      await collection.insertOne(userObject);

      await UsersController({ user: _user }).confirmEmail({ keyid: id });

      return userObject;
    }
  },
  addPaymentSubscription: async ({ email, userId, stripeToken }) => {
    const [user, collection] = await UsersController({
      user: _user,
    }).getUser({ email }, true);

    if (user && stripeToken) {
      const parsedToken = JSON.parse(stripeToken);

      let customer = !user.stripeID
        ? await stripe.customers.create({
            email,
          })
        : { id: user.stripeID };

      if (user.stripeID) {
        customer = await stripe.customers.retrieve(user.stripeID);
        if (customer.deleted) {
          customer = await stripe.customers.create({
            email,
          });
        }
      }

      if (customer) {
        const stripeCustomer = await stripe.customers.createSource(
          customer.id,
          {
            source: parsedToken.id,
          }
        );

        // console.log(stripeCustomer);
        let plan = STRIPE_BASIC_PLAN;

        if (parsedToken.plan === 1) {
          plan = STRIPE_PREMIUM_PLAN;
        }

        const charge = await stripe.subscriptions.create({
          customer: stripeCustomer.customer,
          items: [
            {
              plan: `plan_${plan}`,
            },
          ],
        });

        if (charge) {
          console.log("charge stripe account", charge);
          const role =
            charge.plan.amount === 1000
              ? 1
              : charge.plan.amount === 2000
              ? 2
              : user.role;

          const jwt = signJwt({ email, role, keyid: user.id });
          user.jwt = jwt;

          await collection.updateOne(
            { email },
            {
              $set: {
                stripeToken,
                jwt,
                role,
                stripeID: customer.id,
                paymentSubscription: charge,
              },
            }
          );
        }
      }

      return {
        user,
        code: 200,
        success: true,
        message: SUCCESS,
      };
    }

    return { code: 404, success: false, message: EMAIL_ERROR };
  },
  cancelSubscription: async ({ email }) => {
    const [user, collection] = await UsersController({
      user: _user,
    }).getUser({ email }, true);

    if (!user) {
      throw new Error(EMAIL_ERROR);
    }

    if (user && user.stripeID) {
      const customer = await stripe.customers.retrieve(user.stripeID);
      if (
        customer &&
        customer.subscriptions &&
        customer.subscriptions.data.length
      ) {
        const deletedSubscription = customer.subscriptions.data.every(
          (item) => {
            return stripe.subscriptions.del(item.id);
          }
        );

        if (deletedSubscription) {
          const jwt = signJwt({
            email: user?.email,
            role: 0,
            keyid: user.id,
          });

          user.jwt = jwt;
          user.role = 0;

          await collection.updateOne(
            { email },
            {
              $set: {
                jwt,
                role: 0,
                lastRole: user.role,
              },
            }
          );
        }
      }
    }

    return {
      user,
      code: 200,
      success: true,
      message: SUCCESS,
    };
  },
  updateUser: async ({ password, email, newPassword, stripeToken }) => {
    const [user, collection] = await UsersController({
      user: _user,
    }).getUser({ email }, true);

    const salthash = password && saltHashPassword(password, user.salt);

    if (password && salthash && user.password === salthash.passwordHash) {
      const jwt = await signJwt({
        email,
        role: user.role,
        keyid: user.id,
      });
      const newSaltHash = saltHashPassword(newPassword);

      await collection.updateOne(
        { email },
        {
          $set: {
            jwt,
            password: newPassword,
            salt: newSaltHash.salt,
            stripeToken,
          },
        }
      );

      return {
        user,
        jwt,
        code: 200,
        success: true,
        message: SUCCESS,
      };
    }

    if (password && salthash && user.password !== salthash.passwordHash) {
      throw new Error(PASSWORD_ERROR);
    }

    throw new Error(GENERAL_ERROR);
  },
  forgotPassword: async ({ email }) => {
    if (!email) {
      throw new Error(EMAIL_ERROR);
    }
    const [user, collection] = await UsersController({
      user: _user,
    }).getUser({ email }, true);

    if (user) {
      try {
        const resetCode = randomBytes(4).toString("hex");

        await transporter.verify();
        await transporter.sendMail(
          {
            ...mailOptions,
            to: user.email,
            subject: `A11yWatch - Password reset.`,
            html: `${logoSvg}<br /><h1>${resetCode} is your password reset code.</h1>`,
          },
          async (error, info) => {
            if (error) {
              console.log(error);
            } else {
              console.log("Email sent: " + info.response);
              await collection.findOneAndUpdate(
                { id: user.id },
                { $set: { resetCode } }
              );
            }
          }
        );

        return { email: "true" };
      } catch (e) {
        console.log(e);
      }
    } else {
      throw new Error(GENERAL_ERROR);
    }
  },
  resetPassword: async ({ email, resetCode }) => {
    if (!email) {
      throw new Error(EMAIL_ERROR);
    }
    const [user, collection] = await UsersController({
      user: _user,
    }).getUser({ email }, true);

    if (user && user.resetCode === resetCode) {
      try {
        const resetCode = randomBytes(4).toString("hex");
        const salthash = saltHashPassword(resetCode);

        const signedToken = signJwt({
          email,
          keyid: user.id,
          role: user.role || 0,
        });

        await collection.findOneAndUpdate(
          { id: user.id },
          {
            $set: {
              password: salthash.passwordHash,
              salt: salthash.salt,
              jwt: signedToken,
            },
          }
        );

        await transporter.verify();
        await transporter.sendMail(
          {
            ...mailOptions,
            to: user.email,
            subject: `A11yWatch - Temporary Password.`,
            html: `<h1>${resetCode} is your temp password. Login and go to profile to reset now.</h1>`,
          },
          (em_error, info) => {
            if (em_error) {
              console.log(em_error);
            } else {
              console.log("Email sent: " + info.response);
            }
          }
        );

        return { jwt: signedToken };
      } catch (e) {
        console.error(e);
      }
    } else {
      throw new Error(GENERAL_ERROR);
    }
  },
  toggleAlert: async ({ keyid, alertEnabled }) => {
    try {
      const [user, collection] = await UsersController({
        user: _user,
      }).getUser({ id: keyid }, true);

      if (user) {
        await collection.updateOne({ id: keyid }, { $set: { alertEnabled } });
        return {
          alertEnabled,
          code: 200,
          success: true,
          message: SUCCESS,
        };
      }
    } catch (e) {
      console.error(e);
      throw new Error(GENERAL_ERROR);
    }
  },
  confirmEmail: async ({ keyid }) => {
    if (typeof keyid === "undefined") {
      throw new Error(EMAIL_ERROR);
    }
    const [user, collection] = await UsersController({
      user: _user,
    }).getUser({ id: keyid }, true);

    if (user) {
      const emailConfirmCode = randomBytes(4).toString("hex");
      const resetLink = `${URL_SOURCE}/api/confirmEmail?code=${emailConfirmCode}`;
      const emailExpDate = addMinutes(Date.now(), 30);
      try {
        await transporter.verify();
        await transporter.sendMail(
          {
            ...mailOptions,
            to: user.email,
            subject: `A11yWatch - Email Confirmation.`,
            html: `
            ${logoSvg}
            <br />
            <h1>Click on this link to confirm your email for A11yWatch.</h1>
            <p>Confirmation code will expire in 30 minutes or you have to get a new link.</p>
            <a href="${resetLink}" aria-label="Confirm your email for a11ywatch">CONFIRM EMAIL</a>
            <p>Please do not reply back to this email, it will not be read</p>
            `,
          },
          (error, info) => {
            if (error) {
              console.log(error);
            } else {
              console.log("Email sent: " + info.response);
              collection.findOneAndUpdate(
                { id: user.id },
                { $set: { emailConfirmCode, emailExpDate } }
              );
            }
          }
        );
      } catch (e) {
        console.error(e);
        throw new Error(GENERAL_ERROR);
      }
    } else {
      throw new Error(GENERAL_ERROR);
    }
    return { code: 200, success: true, message: SUCCESS };
  },
  updateScanAttempt: async ({ userId }) => {
    const [user, collection] = await UsersController({
      user: _user,
    }).getUser({ userId }, true);

    if (user) {
      const lastScanDate = new Date();

      let scanInfo = user?.scanInfo
        ? user?.scanInfo
        : {
            lastScanDate,
            scanAttempts: 0,
          };

      scanInfo.scanAttempts =
        scanInfo?.lastScanDate && !isSameDay(scanInfo?.lastScanDate, new Date())
          ? 1
          : scanInfo.scanAttempts + 1;

      if (
        (scanInfo?.scanAttempts >= 3 && user?.role === 0) ||
        (scanInfo?.scanAttempts > 10 && user?.role === 1)
      ) {
        return false;
      }

      scanInfo.lastScanDate = lastScanDate;

      await collection.findOneAndUpdate(
        { id: user.id },
        { $set: { scanInfo } }
      );

      return true;
    }
    return false;
  },
  validateEmail: async ({ code }) => {
    if (!code) {
      throw new Error("CODE NOT FOUND");
    }
    const [user, collection] = await UsersController({
      user: _user,
    }).getUser({ emailConfirmCode: code }, true);

    if (user && isBefore(new Date(), new Date(user?.emailExpDate))) {
      collection.findOneAndUpdate(
        { id: user.id },
        {
          $set: {
            emailConfirmed: true,
            emailExpDate: undefined,
            emailConfirmCode: undefined,
          },
        }
      );

      pubsub.publish(EMAIL_VERIFIED, { emailVerified: true });

      return true;
    } else {
      return false;
    }
  },
  unsubscribeEmails: async ({ id, email }) => {
    try {
      const [user, collection] = await UsersController({
        user: _user,
      }).getUser({ id: id, email }, true);

      console.log(`unsubscribed emails`, user);
      // email alerts disabled
      collection.findOneAndUpdate(
        { id: id },
        {
          $set: {
            emailAlerts: false,
          },
        }
      );
    } catch (e) {
      console.error(e);
    }

    return true;
  },
  sendWebsiteOffline: async ({ id, domain }) => {
    try {
      const [user, collection] = await UsersController({
        user: _user,
      }).getUser({ id }, true);

      const [website, websiteCollection] = await WebsitesController({
        user: _user,
      }).getWebsite({ userId: id, domain }, true);

      console.log(website);

      if (website) {
        await websiteCollection.findOneAndUpdate(
          { userId: id, domain: domain },
          {
            $set: {
              online: false,
            },
          }
        );
      }
      let shouldEmail = false;
      // email alerts disabled
      if (user?.emailAlerts === false || !domain) {
        return false;
      }

      if (user?.downAlerts?.length) {
        const newAlerts = user?.downAlerts?.map((item: any) => {
          if (
            item.domain === domain &&
            isBefore(new Date(), new Date(item?.date))
          ) {
            shouldEmail = true;
            item.date = new Date().toUTCString();
          }
          return item;
        });
        if (shouldEmail) {
          await collection.findOneAndUpdate(
            { id: id },
            {
              $set: {
                downAlerts: newAlerts,
              },
            }
          );
        }
      } else {
        const downAlerts = [{ domain, date: new Date().toUTCString() }];
        shouldEmail = true;
        await collection.findOneAndUpdate(
          { id: id },
          {
            $set: {
              downAlerts,
            },
          }
        );
      }
      if (shouldEmail) {
        await transporter.verify();
        await transporter.sendMail(
          {
            ...mailOptions,
            to: user.email,
            subject: `${domain} is Offline.`,
            html: `
<h1>${domain} is currently offline.</h1>
<p>Please check your server logs to see what happened if issues are difficult to figure out.</p>
<div style="margin-top:30px;"></div>
<a href="${process.env.ROOT_URL}/api/unsubscribe-emails?id=${id}&domain=${domain}" target="_blank">Unsubscribe</a>
<div style="margin-top:30px; font-weight: 100;">Powered by A11yWatch, LLC</div>
`,
          },
          (er, info) => {
            if (er) {
              console.log(er);
            } else {
              console.log("Email sent: " + info.response);
            }
          }
        );
      }
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  /* DANGEROUS DO NOTE USE */
  deleteAll: async () => {
    try {
      const [collection] = await connect("Users");
      await collection.deleteMany();
    } catch (e) {
      console.error(e);
    }
  },
});
