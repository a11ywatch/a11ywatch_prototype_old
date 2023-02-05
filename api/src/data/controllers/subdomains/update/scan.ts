/*
 * Copyright (c) A11yWatch, LLC. and its affiliates.
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/

import validUrl from "valid-url";

import { WEBSITE_NOT_FOUND, CRAWLER_FINISHED } from "@app/data/strings";
import { sourceBuild } from "@app/data/utils";
import { WebsitesController } from "../../websites";
import { generateWebsiteAverage } from "./domain";
import { fetchPuppet, extractPageData } from "./utils";

const EMPTY_RESPONSE = {
  website: null,
  code: 200,
  success: true,
  message: CRAWLER_FINISHED,
};

export const scanWebsite = async ({
  userId: userIdMap,
  url: urlMap,
  firstPage,
  lastPage,
  shared,
}: any) => {
  let userId = Number(!userIdMap && userIdMap !== 0 ? -1 : userIdMap);
  console.log(`crawling:`, urlMap, `user_id:${userId}`);

  if (!urlMap || !validUrl.isUri(urlMap)) {
    throw new Error(WEBSITE_NOT_FOUND);
  }

  let { url, domain, pageUrl } = sourceBuild(urlMap);

  if (
    process.env.NODE_ENV === "production" &&
    pageUrl.includes("http://localhost:")
  ) {
    throw new Error(
      "Cannot use localhost, please use a valid web url. Development env detection coming soon."
    );
  }

  let [website, websiteCollection] = await WebsitesController().findWebsite(
    {
      domain,
      userId,
    },
    true
  );

  if (!website?.length) {
    const newWebsitePage = {
      userId: -1,
      id: 0,
      url,
      domain,
      adaScore: null,
      cdnConnected: false,
      html: "",
      htmlIncluded: false,
      pageLoadTime: {
        duration: 0,
        durationFormated: "",
        color: "",
      },
      issuesInfo: {
        issuesFixedByCdn: 0,
        possibleIssuesFixedByCdn: 0,
        totalIssues: 0,
      },
      issues: [],
      lastScanDate: new Date().toUTCString(),
    };
    website = newWebsitePage;
  }

  return await new Promise(async (resolve, reject) => {
    try {
      const dataSource = await fetchPuppet({
        pageHeaders: website?.pageHeaders,
        url: urlMap,
        userId: userId,
        firstPage: firstPage,
        lastPage: lastPage,
        shared: shared,
        authed: false,
      });

      if (dataSource) {
        if (!dataSource?.webPage) {
          resolve({
            website: null,
            code: 300,
            success: false,
            message:
              "Website timeout exceeded threshhold for free scan, website rendered to slow under 15000 ms",
          });
        }
        let {
          issues,
          webPage,
          // issuesInfo,
          pageHasCdn,
          // errorCount,
          // noticeCount,
          // warningCount,
          // adaScore,
        } = extractPageData(dataSource);

        const avgScore = await generateWebsiteAverage(
          {
            domain,
            // cdnConnected: pageHasCdn,
            userId,
            url: null,
          },
          [website, websiteCollection]
        );

        const updateWebsiteProps = Object.assign(
          {},
          {
            issuesInfo: webPage?.issuesInfo || {},
            lastScanDate: webPage?.lastScanDate,
            avgScore,
            adaScore: avgScore,
            cdnConnected: !!website?.cdnConnected,
            pageLoadTime: null,
            online: !!website?.online || null,
          }
        );

        // BIND ALL PROPS FROM WEBPAGE
        if (website?.url === pageUrl) {
          updateWebsiteProps.cdnConnected = pageHasCdn;
          updateWebsiteProps.pageLoadTime = webPage?.pageLoadTime;
          updateWebsiteProps.online = true;
        }

        const slicedIssue =
          issues?.issues?.slice(
            issues?.issues.length -
              Math.max(Math.round(issues?.issues.length / 4), 2)
          ) || [];

        if (updateWebsiteProps.issuesInfo) {
          updateWebsiteProps.issuesInfo.limitedCount = slicedIssue.length;
        }

        resolve({
          website: {
            ...website,
            issue: slicedIssue,
            ...updateWebsiteProps,
            script: null,
          },
          code: 200,
          success: true,
          message: CRAWLER_FINISHED,
        });
      } else {
        resolve(EMPTY_RESPONSE);
      }
    } catch (e) {
      console.log(e);
      // reject(e);
    }
  });
};
