/* -------------------------------------------------------------------------- */
/*                          Segment Analytics Methods                         */
/* -------------------------------------------------------------------------- */

const sendAnalyticsToSegment = {
  track: (eventName, properties) => {
    try {
      // console.log("eventName: ", eventName, "\n properties: ", properties);
      analytics && analytics.track(eventName, properties);
    } catch (error) {
      console.error("Error in sendAnalyticsToSegment analytics", error);
    }
  },
  identify: (email, identities = {}) => {
    try {
      // console.log("email :", email, " identities :", identities);
      analytics && analytics.identify(email, identities);
    } catch (error) {
      console.error("Error in sendAnalyticsToSegment identify", error);
    }
  },
};

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

function onReady() {
  try {
    /* -------------------------------------------------------------------------- */
    /*                               identify Person                              */
    /* -------------------------------------------------------------------------- */
    if (getCookie("email")) {
      sendAnalyticsToSegment.identify(getCookie("email"));
    }
    /* -------------------------------------------------------------------------- */
    /*                               Params Creating                              */
    /* -------------------------------------------------------------------------- */
    let params = Object.fromEntries(
      new URLSearchParams(window.location.search).entries()
    );
    let properties = {
      url_params: {
        ...params,
        referrer: document.referrer,
      },
    };

    /* -------------------------------------------------------------------------- */
    /*                         Checking FirstWebsite Visit                        */
    /* -------------------------------------------------------------------------- */
    if (
      localStorage.getItem("hasVisitedBefore") === null &&
      !getCookie("firstWebsiteVisitUTMs")
    ) {
      properties["hasVisitedBefore"] = true;
      properties["visited-date"] = new Date();
      let maxAge = "; max-age=" + 3650 * 24 * 60 * 60;
      sendAnalyticsToSegment.track("First Website Visit", properties);
      localStorage.setItem("hasVisitedBefore", JSON.stringify(properties));
      if (window.location.host.endsWith("webflow.io")) {
        document.cookie = `firstWebsiteVisitUTMs=${JSON.stringify(
          properties
        )};domain=webflow.io;`;
      }
      if (window.location.host.endsWith("preplaced.in")) {
        document.cookie = `firstWebsiteVisitUTMs=${JSON.stringify(
          properties
        )};domain=preplaced.in${maxAge}`;
      }
    }
    /* -------------------------------------------------------------------------- */
    /*                           Page Visited Analytics                           */
    /* -------------------------------------------------------------------------- */
    sendAnalyticsToSegment.track("Page Visited", properties);
  } catch (e) {
    console.error(e);
  }
}

onReady();
loadFile("commonV2.js", false);
