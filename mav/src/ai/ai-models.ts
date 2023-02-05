/*
 * Copyright (c) A11yWatch, LLC. and its affiliates.
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/

const mobilenet = require("@tensorflow-models/mobilenet");
const cocoSsd = require("@tensorflow-models/coco-ssd");
// const facemesh = require("@tensorflow-models/facemesh");

const version = 2;
const alpha = 1;

let mobileNetModel;
let cocoaSDModel;

const aiModels = {
  mobileNetModel: null,
  cocoaSDModel: null,
  loadingMobileNet: false,
  loadingCocoaNet: false,
  initMobileNet: async function (retry: number = 0) {
    try {
      if (mobileNetModel) {
        return mobileNetModel;
      } else {
        console.log("Loading mobile net model...");
        mobileNetModel = await mobilenet.load({ version, alpha });
        return mobileNetModel;
      }
    } catch (e) {
      console.error(e);
      if (retry === 0) {
        this.initMobileNet(1);
      }
      return null;
    }
  },
  initcocoSSD: async function (retry: number = 0) {
    try {
      if (cocoaSDModel) {
        return cocoaSDModel;
      } else {
        console.log("Loading cocossd model...");
        cocoaSDModel = await cocoSsd.load({ base: "mobilenet_v2" });
        return cocoaSDModel;
      }
    } catch (e) {
      console.error(e);
      if (retry === 0) {
        this.initcocoSSD(1);
      }
      return null;
    }
  },
  initModels: async function (bypass: boolean) {
    if (cocoaSDModel && mobileNetModel && !bypass) {
      console.log("MODELS ALREADY LOADED");
    } else {
      console.log("INIT ALL SHARED MODELS");
      await Promise.all([this.initcocoSSD(false), this.initMobileNet(false)]);
    }
  },
  clearModels: function (): void {
    mobileNetModel = null;
    cocoaSDModel = null;
    console.log("CLEAR SHARED MODELS");
  },
};

export { aiModels };
