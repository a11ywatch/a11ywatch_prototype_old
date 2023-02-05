/*
 * Copyright (c) A11yWatch, LLC. and its affiliates.
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/

import { createCanvasPupet } from "@app/data/lib";
import { needsLongTextAlt, missingAltText } from "@app/data/strings";
import { detectImageModel } from "@app/ai";
import { extractAlt } from "./extract-alt";

interface Alt {
  alt: string;
  lang: string;
}

export const grabAlt = async ({ element, page, pageUrl }): Promise<Alt> => {
  let alt = "";

  if (
    [needsLongTextAlt, missingAltText].includes(element?.message) &&
    element?.selector
  ) {
    try {
      const { imageToBase64, width, height } = await page.evaluate(
        createCanvasPupet,
        element.selector
      );

      const img = await detectImageModel(imageToBase64, {
        width,
        height,
      });

      alt = extractAlt(img);
    } catch (e) {
      console.log(e);
    }
  }

  return {
    alt,
    lang: "en",
  };
};
