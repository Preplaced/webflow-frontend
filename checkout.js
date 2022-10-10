/* -------------------------------------------------------------------------- */
/*                              Select2 Register                              */
/* -------------------------------------------------------------------------- */
targetCompaniesSelector.setAttribute("multiple", "multiple");
$targetCompaniesSelector = $("#company-selector-new").select2({
  width: "100%",
  placeholder: "Your Target Company",
  tags: true,
  matcher: matchMaker,
  minimumInputLength: 3,
});

/* -------------------------------------------------------------------------- */
/*                                  Explainer                                 */
/* -------------------------------------------------------------------------- */

const explainers = {
  "wwyg-trial": ["Interview Preparation Program - Trial"],
  "wwyg-ipp": [
    "Interview Preparation Program - 1 month",
    "Interview Preparation Program - 2 months",
    "Interview Preparation Program - 3 months",
  ],
  "wwyg-mi": [
    "Mock Interview - 1 session",
    "Mock Interview - 3 sessions",
    "Mock Interview - 5 sessions",
    "Mock Interview - 10 sessions",
  ],
  "wwyg-cs": [
    "Consulting Session - 1 session",
    "Consulting Session - 3 sessions",
    "Consulting Session - 5 sessions",
    "Consulting Session - 10 sessions",
  ],
};

for (let explainer in explainers) {
  if (
    explainers[explainer].includes(
      `${currentPackageId} - ${currentPackageDetail.name}`
    )
  ) {
    getElement(explainer).style.display = "block";
    break;
  }
}

/* -------------------------------------------------------------------------- */
/*                                Modal Closes                                */
/* -------------------------------------------------------------------------- */

closeLoginModalIcon.onclick = function (event) {
  event.preventDefault();
  event.stopPropagation();
  closeLoginModal();
  let properties = {
    button_name: currentButtonName,
  };
  sendAnalyticsToSegment.track("Login/Signup Cancelled", properties);
};

closeCheckout.addEventListener("click", function (e) {
  e.preventDefault();
  closeCheckoutModal();
  scrollBody("scroll");
  let properties = {
    button_name: currentButtonName,
  };
  sendAnalyticsToSegment.track("Checkout Cancelled", properties);
});

/* -------------------------------------------------------------------------- */
/*                           Handle Display Pricing                           */
/* -------------------------------------------------------------------------- */
function handlePaymentSectionUI() {
  if(!couponAppliedSuccessfullyUsingURL){
    updatePaymentInfo();
  }
  packagePriceSelector.innerText = `${currencyMap[pkDetails.currency]} ${
    pkDetails.price
  }`;
  discountPriceSelector.innerText = `${currencyMap[pkDetails.currency]} 0`;
  !couponAppliedSuccessfullyUsingURL && hideElements([couponErrorSelector, couponSuccessSelector]);
  if (gstAdded) {
    if (pkDetails.currency !== "INR") {
      gstLabel.innerText = "IGST (18%)";
    }
  } else {
    hideElements([gstContainer]);
  }
  if (accessToken) {
    showElements([payNowWrapper]);
    hideElements([payNowOverlay]);
  } else {
    hideElements([payNowWrapper]);
  }
}

function updatePaymentInfo(couponDiscount) {
  let packagePrice = pkDetails.price;
  let discount = couponDiscount || 0;
  let discountedPrice = Math.ceil(discount * packagePrice).toFixed(2); // fixed to 2 decimal
  let priceAfterDiscount = packagePrice - discountedPrice;
  gstPrice = addGST ? (gstAdded ? priceAfterDiscount * 0.18 : 0) : 00;
  totalPrice = addGST
    ? priceAfterDiscount.toFixed(2)
    : (priceAfterDiscount + gstPrice).toFixed(2);
  pkDetails["totalPrice"] = totalPrice;
  gstPriceDiv.innerText = addGST
    ? `${currencyMap[pkDetails.currency]} ${gstPrice.toFixed(2)} `
    : `${currencyMap[pkDetails.currency]} 00`;
  discountPriceSelector.innerText = `- ${
    currencyMap[pkDetails.currency]
  } ${discountedPrice}`;
  totalPriceSelector.innerText = `${
    currencyMap[pkDetails.currency]
  } ${totalPrice}`;
  if (discount) {
    couponSuccessSelector.innerText = `Coupon Applied! You are saving ${
      currencyMap[pkDetails.currency]
    } ${discountedPrice} `;
  }
}

function updateUI() {
  handlePaymentSectionUI();
}

function updateCheckoutValuesOnShown() {
    pkDetails = JSON.parse(localStorage.getItem("packageDetails"));
    totalPrice = 0;
    coupon = "";
    gstAdded = pkDetails.addGST || false;
    gstPrice = 0;
    updateUI();
}

if(params.razorpay==="true"){
  autoCheckout = true;
}

/* -------------------------------------------------------------------------- */
/*                           Getting Companies List                           */
/* -------------------------------------------------------------------------- */

function populatePreferredCompanies(companies) {
  companies.sort();
  for (let index in companies) {
    $targetCompaniesSelector.append(
      new Option(companies[index], companies[index], false, false)
    );
  }
}

function getCompanies() {
  getAllCompanies(function (responseData) {
    populatePreferredCompanies(responseData["companyArray"]);
  });
}

getCompanies();

var paymentCheckoutSelectors = document.querySelectorAll(".payment-checkout");


function commonProceedToCheckout(modalText) {
  try {
    const properties = {
      button_name: currentButtonName,
      triggered_by: currentTriggerBy,
      item_id: currentSku,
      package_name: currentPackageId,
      package_type: currentPackageType,
      logged_in: !!accessToken,
      ecommerce: {
        items: [
          {
            item_id: currentSku,
            item_name: currentPackageId,
          },
        ],
      },
    };
    if (!verifiedUser) {
      customOnSignInMethod = function () {
        hideElements([loginModal]);
        updateCheckoutValuesOnShown();
        showElements([checkoutModal], "flex");
        sendAnalyticsToSegment.track("Checkout Started",properties);
      };
      customOnSignIn = true;
      showLoginModal(modalText);
    } else {
      updateCheckoutValuesOnShown();
      showElements([checkoutModal], "flex");
      sendAnalyticsToSegment.track("Checkout Started", properties);
    }
  } catch (error) {
    console.error("Error in commonProceedCheckout", error);
    // TODO add sentry for more clearance.
  }
}

function commonSaveInfoToLocalStorage(package_id) {
  let domainText = domainSelector.options[domainSelector.selectedIndex].text; //change selector
  let companies = `${domainText} Domain`;
  const price = +currentPrice;
  packageDetails = {
    package: package_id,
    experience_id: mentorExperienceSelector.value,
    experience:
      targetRoleSelector.options[targetRoleSelector.selectedIndex].text,
    target_companies: companies,
    domain_id: domainSelector.options[domainSelector.selectedIndex].value,
    domain: domainText,
    target_role: `${
      targetRoleSelector.options[targetRoleSelector.selectedIndex].text
    } ${domainText}`,
    preferred_mentor_experience:
      mentorExperienceSelector.selectedOptions[0].text,
    designation: mentorExperienceSelector.value,
    currency: currentCurrency,
    price: price,
    country: country,
    addGST: addGST,
    upcoming_interview: currentUpcomingInterviewSchedule,
    package_type: currentPackageType,
    target_companies: currenTargetCompanies,
    mentor_instructions: currentMentorInstruction,
    version: "default",
    mentor_preference: currentMentorPreference,
  };
  if(couponAppliedSuccessfullyUsingURL){
    packageDetails["totalPrice"] = totalPrice;
    packageDetails["coupon"] = currentCoupon;
  }
  localStorage.setItem("packageDetails", JSON.stringify(packageDetails));
}

function commonPaymentCheckout(package_id, modalText) {
  try {
    commonSaveInfoToLocalStorage(package_id); //save the form Info here to local Storage which will be used in the checkout page
    commonProceedToCheckout(modalText);
  } catch (error) {
    console.error("error in commonPaymentCheckout()", error);
  }
}

function commonDisableLowerMentorDesignationOptions() {
  let candidateExperienceIndex = experienceList.indexOf(
    targetRoleSelector.value
  );
  for (let optionIndex in mentorExperienceSelector.options) {
    mentorExperienceSelector.options[optionIndex].disabled =
      candidateExperienceIndex > optionIndex;
  }
}

const creatBubbleButton = (name, discountText, preference_order) => `
<label id="w-node-_60605411-097f-b674-15a6-b170c86ed9${preference_order}8-b4e2d655" class="duration-count-radio-field-parent w-radio">
  <h3 class="duration-count-text">${name}</h3>
  <input type="radio" name="Type-Options" id="${name}" value="${name}" data-name="Type Options" required="" class="w-form-formradioinput actual-radio-button w-radio-input">
  <span data-w-id="60605411-097f-b674-15a6-b170c86ed9${preference_order}c" for="${name}" class="radio-field-label pill w-form-label" style="border-color: rgb(232, 231, 238);"></span>
  <h3 class="save_text">${discountText}</h3>
</label>`;

function createBubbleButtons() {
  for (let i = 0; i < pricing.length; i++) {
    if (pricing[i].name === currentPackageId) {
      for (let j = 0; j < pricing[i].type.length; j++) {
        let discountText = pricing[i].type[j].DiscountText;
        let name = pricing[i].type[j].name;
        let preference_order = pricing[i].type[j].preference_order;
        let bubble_button = creatBubbleButton(
          name,
          discountText,
          preference_order
        );
        selectDurationOrCountSelector.insertAdjacentHTML(
          "beforeend",
          bubble_button
        );
      }
    }
  }
}

function setCurrentPrice() {
    try{
        for (let i = 0; i < pricing.length; i++) {
            if (pricing[i].name === currentPackageId) {
              currentPackageDetails = pricing[i];
              for (let j = 0; j < pricing[i].type.length; j++) {
                if (pricing[i].type[j].name === currentPackageType) {
                  currentPackageDetail = pricing[i].type[j];
                  break;
                } else if (
                  pricing[i].type[j].preference_order === 1 &&
                  !currentPackageType
                ) {
                  currentPackageDetail = pricing[i].type[j];
                  currentPackageType = pricing[i].type[j].name;
                  break;
                }
              }
              break;
            }
          }
        
          for (let i = 0; i < currentPackageDetail.pricing.length; i++) {
            if (
              currentCurrency === "INR" &&
              currentPackageDetail.pricing[i].experience_level ===
                currentMentorExperience
            ) {
              currentPrice = currentPackageDetail.pricing[i].inr_pricing;
              currentSku = currentPackageDetail.pricing[i].sku;
              break;
            } else if (
              currentCurrency !== "INR" &&
              currentPackageDetail.pricing[i].experience_level ===
                currentMentorExperience
            ) {
              currentPrice = currentPackageDetail.pricing[i].usd_pricing;
              currentSku = currentPackageDetail.pricing[i].sku;
              break;
            }
          }
          /* -------------------------------------------------------------------------- */
          /*                            Show Price Container                            */
          /* -------------------------------------------------------------------------- */
          if (currentPrice == 0) {
            hideElements([totalPriceSelector]);
            showElements([priceCalculationSelector]);
          } else {
            hideElements([priceCalculationSelector]);
            showElements([totalPriceSelector]);
          }
    }catch(error){
        console.error("error in setcurrentprice",error)
    }
}

function commonUpdatePricing() {
  currentMentorExperience = mentorExperienceSelector.options[
    mentorExperienceSelector.selectedIndex
  ].value
    ? mentorExperienceSelector.options[mentorExperienceSelector.selectedIndex]
        .value
    : currentMentorExperience;
  setCurrentPrice();
}

/* -------------------------------------------------------------------------- */
/*              onChange of targetRole & mentorExperienceSelector             */
/* -------------------------------------------------------------------------- */

targetRoleSelector.onchange = function (event) {
  event.preventDefault();
  currentRole = event.target.value;
  if (event.target.value !== "select_designation") {
    targetRoleSelector.classList.remove("error");
    mentorExperienceSelector.removeAttribute("disabled");
  }
  if(!flagMentorPreference){
    mentorExperienceSelector.value = "select_mentor_experience";
    commonDisableLowerMentorDesignationOptions();
  }
  commonSaveInfoToLocalStorage(currentPackageId);
  updateCheckoutValuesOnShown();
};

mentorExperienceSelector.onchange = function (event) {
  event.preventDefault();
  currentMentorExperience = event.target.value;
  event.target.value !== "select_mentor_experience" &&
    mentorExperienceSelector.classList.remove("error");
  commonUpdatePricing();
  if (currentPrice == 0) {
    hideElements([totalPriceSelector]);
    showElements([priceCalculationSelector]);
  } else {
    hideElements([priceCalculationSelector]);
    showElements([totalPriceSelector]);
  }
  commonSaveInfoToLocalStorage(currentPackageId);
  updateCheckoutValuesOnShown();
};

domainSelector.onchange = function (event) {
  event.preventDefault();
  currentDomain = event.target.value;
  event.target.value !== "select_domain" &&
    domainSelector.classList.remove("error");
  // commonUpdatePricing();
  commonSaveInfoToLocalStorage(currentPackageId);
  // updateCheckoutValuesOnShown();
};

function bubbleButtonClicks() {
  bubbleButtonsSelectors = document.querySelectorAll("[name=Type-Options]");
  bubbleButtonsSelectors.forEach((bubbleButtonsSelector) => {
    if (bubbleButtonsSelector.value === currentPackageType) {
      let currentlabel = bubbleButtonsSelector.parentElement;
      let currentspan = currentlabel.lastElementChild.previousElementSibling;
      currentspan.classList.add("bubble-button-border");
    }
    bubbleButtonsSelector.addEventListener("click", function (event) {
      currentPackageType = bubbleButtonsSelector.value;
      packageTypeShow();
      commonUpdatePricing();
      commonSaveInfoToLocalStorage(currentPackageId);
      updateCheckoutValuesOnShown();
      bubbleButtonsSelectors.forEach((bubbleButtonsSelector2) => {
        let label = bubbleButtonsSelector2.parentElement;
        let span = label.lastElementChild.previousElementSibling;
        span.classList.remove("bubble-button-border");
      });
      let currentlabel = bubbleButtonsSelector.parentElement;
      let currentspan = currentlabel.lastElementChild.previousElementSibling;
      currentspan.classList.toggle("bubble-button-border");
    });
  });
}

function emptyBubbleButtons() {
  const parent = document.getElementsByClassName(
    "duration-count-selector-grid"
  )[0];
  while (parent.lastChild) {
    parent.removeChild(parent.lastChild);
  }
}

function openCheckoutModal(package_id, modalText) {
  currentPackageId = package_id;
  emptyBubbleButtons();
  createBubbleButtons();
  bubbleButtonClicks();
  commonUpdatePricing();
  commonPaymentCheckout(currentPackageId, modalText);
}

/* -------------------------------------------------------------------------- */
/*                            Package-Type Visible                            */
/* -------------------------------------------------------------------------- */
function packageTypeShow() {
  for (let explainer in explainers) {
    getElement(explainer).style.display = "none";
    if (
      explainers[explainer].includes(
        `${currentPackageId} - ${currentPackageType}`
      )
    ) {
      getElement(explainer).style.display = "block";
    }
  }
}

/* -------------------------------------------------------------------------- */
/*                              Payment-Checkout                              */
/* -------------------------------------------------------------------------- */

paymentCheckoutSelectors.forEach((paymentCheckoutSelector) => {
  paymentCheckoutSelector.addEventListener("click", function (event) {
    scrollBody("hidden");
    mentorExperienceSelector.value === "select_mentor_experience" &&
      targetRoleSelector.value === "select_designation" &&
      mentorExperienceSelector.setAttribute("disabled", true);
    // Mandatory
    currentPackageId = paymentCheckoutSelector.getAttribute("package-id");
    currentPackageType = paymentCheckoutSelector.getAttribute("package-type");

    // Optional
    currentMentorExperience =
      paymentCheckoutSelector.getAttribute("mentor-experience");

    currentRole = paymentCheckoutSelector.getAttribute("role");

    currentDomain = paymentCheckoutSelector.getAttribute("domain");

    loginTextSelector = paymentCheckoutSelector.getAttribute("login-text");

    loginSubtextSelector =
      paymentCheckoutSelector.getAttribute("login-subtext");

    let modalText = {
      loginTextSelector,
      loginSubtextSelector,
    };

    programNameSelector.innerText = currentPackageId;

    if (currentPrice == 0) {
      hideElements([totalPriceSelector]);
      showElements([priceCalculationSelector]);
    } else {
      hideElements([priceCalculationSelector]);
      showElements([totalPriceSelector]);
    }

    // Checkout Started Analytics
    currentTriggerBy = "button";
    currentButtonName = paymentCheckoutSelector.getAttribute("button-name");

    //getting current Sku
    pricing.map((price) => {
      if (price.name === currentPackageId) {
        price.type.map((type) => {
          if (type.name === currentPackageType) {
            currentSku = type.pricing[0].sku;
          }
        });
      }
    });

    const properties = {
      button_name: currentButtonName,
      triggered_by: currentTriggerBy,
      item_id: currentSku,
      package_name: currentPackageId,
      package_type: currentPackageType,
      logged_in: !!accessToken,
      ecommerce: {
        items: [
          {
            item_id: currentSku,
            item_name: currentPackageId,
          },
        ],
      },
    };
    sendAnalyticsToSegment.track("Checkout Button Clicked", properties);
    packageTypeShow();
    /* -------------------------------------------------------------------------- */
    /*               Get Cookies and Show Checkout According to that              */
    /* -------------------------------------------------------------------------- */
    currentMentorPreference = getCookie("mentor-preference") || "";
    currentMentorPreferenceExp = +getCookie("mentor-preference-exp") || ""; //REMIND
    if(currentMentorPreference){
      mentorPreferenceCheckout();
    }
    openCheckoutModal(currentPackageId, modalText);
  });
});

/* -------------------------------------------------------------------------- */
/*                                 Get Pricing                                */
/* -------------------------------------------------------------------------- */
function getAllPricing(callback) {
  let url = apiBaseURL + "pricing/get-price/v3";
  getAPI(
    url,
    function (response) {
      if (response.status === 200) {
        callback(response.data);
      }
    },
    function (error) {
      console.error("error getting Price", error);
    }
  );
}

function commonSetGSTFlag(gstEnabled) {
  addGST = gstEnabled;
}

function commonGetPricingData() {
  getAllPricing(function (response) {
    pricing = response;
    currentCurrency = country === "India" ? "INR" : "USD";
    commonSetGSTFlag(false);
    if(response){
      checkoutStartedViaURLs();
    }
  });
}
/* -------------------------------------------------------------------------- */
/*                          Checkout Started Via URL                          */
/* -------------------------------------------------------------------------- */

const checkoutStartedViaURLs = () => {
  const {checkout} = params;
  if(checkout && params["package-id"] && params["package-type"]){
    /* -------------------------------------------------------------------------- */
    /*                          setting up current values                         */
    /* -------------------------------------------------------------------------- */
    currentTriggerBy = "url";
    currentPackageId = params["package-id"];
    currentPackageType = params["package-type"];
    currentDomain = domainMapper[params.domain] || "select_domain";
    currentRole = roleMapper[params.role] || "select_designation";
    currentMentorExperience = params["mentor-experience"] || "select_mentor_experience";
    currenTargetCompanies = params["target-companies"] || "";
    currentCoupon = params.coupon || "";
    currentUpcomingInterviewSchedule = params["upcoming-interview"] || "No";
    currentMentorPreference = params["mentor-preference"] || "";
    currentMentorPreferenceExp = params["mentor-preference-exp"] || ""; //REMIND
    /* -------------------------------------------------------------------------- */
    /*                          mentor preference feature                         */
    /* -------------------------------------------------------------------------- */
    if(currentMentorPreference){
      mentorPreferenceCheckout();
    }

    /* -------------------------------------------------------------------------- */
    /*                       set prefilled data using params                      */
    /* -------------------------------------------------------------------------- */
    targetRoleSelector.value = currentRole;
    domainSelector.value = currentDomain ;
    // if mentor preference experience contains then mentor value set in the mentorPreferenceCheckout()
    if(!currentMentorPreferenceExp){
      mentorExperienceSelector.value = currentMentorExperience;
    }
    couponSelector.value = currentCoupon;
    /* -------------------------------------------------------------------------- */
    /*                settingup value of upcomingInterviewSelector                */
    /* -------------------------------------------------------------------------- */
    currentUpcomingInterviewSchedule == "No" && setUpcommingInterviewAndColor();

    /* -------------------------------------------------------------------------- */
    /*                       setting Target Companies Values                      */
    /* -------------------------------------------------------------------------- */
    currenTargetCompanies != "" && setTargetCompanyValues();
    openCheckout();
  }
}

const mentorPreferenceCheckout = () => {
  /* -------------------------------------------------------------------------- */
  /*                         Flag value for identifying                         */
  /* -------------------------------------------------------------------------- */
  flagMentorPreference = true;
  /* -------------------------------------------------------------------------- */
  /*                set Mentor Preference in Cookies with Expiry                */
  /* -------------------------------------------------------------------------- */
  let expiry = new Date(Date.now() + 86400e3);
  expiry = expiry.toUTCString();
  if(!getCookie("mentor-preference") || !getCookie("mentor-preference-exp")){
    setCookie("mentor-preference",currentMentorPreference,expiry);
    setCookie("mentor-preference-exp",currentMentorPreferenceExp,expiry);
  }
  /* -------------------------------------------------------------------------- */
  /*                Mentor Preference Display and assigning value               */
  /* -------------------------------------------------------------------------- */
  $("#mentor-preference-block").css("display","flex");
  $("#mentor-name").text(currentMentorPreference);
  $("#Mentor-Name-2").val(currentMentorPreference);
  mentorPreferenceSelectorAll[0].setAttribute("for",currentMentorPreference)
    mentorPreferenceSelectorAll.forEach((mentorPreferenceSelector)=>{
      mentorPreferenceSelector.style.border = "2px solid #e8e7ee";
      if(mentorPreferenceSelector.getAttribute("for")===currentMentorPreference){
        mentorPreferenceSelector.style.border = "2px solid #2463EB";
      }
  })
  /* -------------------------------------------------------------------------- */
  /*                        Mentor Preference Experience                        */
  /* -------------------------------------------------------------------------- */
  setMentorExpViaMentorPreferExp();
  /* -------------------------------------------------------------------------- */
  /*                           Lock Mentor Experience                           */
  /* -------------------------------------------------------------------------- */
  mentorExperienceSelector.setAttribute("disabled",true)
}

const setMentorExpViaMentorPreferExp = () => {
  if(+currentMentorPreferenceExp >= 0 && +currentMentorPreferenceExp <= 3){
    mentorExperienceSelector.value = "0-3 years"
  }else if(+currentMentorPreferenceExp > 3 && +currentMentorPreferenceExp <= 6){
    mentorExperienceSelector.value = "4-6 years"
  }else if(+currentMentorPreferenceExp > 6 && +currentMentorPreferenceExp <= 10){
    mentorExperienceSelector.value = "7-10 years"
  }else{
    mentorExperienceSelector.value = "11-15 years"
  }
}

const openCheckout = () => {
  const { razorpay } = params;
  /* -------------------------------------------------------------------------- */
  /*                             apply coupon  auto                             */
  /* -------------------------------------------------------------------------- */
  if(currentCoupon != "" && razorpay === "true"){
      couponSubmitSelector.click();
  }
  /* -------------------------------------------------------------------------- */
  /*                           checking User Logged In                          */
  /* -------------------------------------------------------------------------- */
  checkingUserLoggedIn();
}

const checkingUserLoggedIn = () => {
  var checkVerifiedUserResult = setInterval(() => {
    if (verifiedUser && userLoggedInStatus === "Logged In") {
      clearInterval(checkVerifiedUserResult);
      packageTypeShow();
      openCheckoutModal(currentPackageId);
      if(params.razorpay === "true" && currentCoupon===""){
        payNowButtonSelector.click();
      }
    } else {
      console.log("Not Verified User");
      if (userLoggedInStatus === "Not Logged In") {
        console.log("No User Logged In")
        clearInterval(checkVerifiedUserResult);
        packageTypeShow();
        openCheckoutModal(currentPackageId);
      }
    }
  }, 100);
};

const setTargetCompanyValues = () => {
  if(currenTargetCompanies.length > 0){
    let companies = [];
    currenTargetCompanies.split(",").map((company) => {
      companies.push({ id: company, text: company, selected: true });
    });
    $targetCompaniesSelector.select2({
      multiple: true,
      data: companies,
      width: "100%",
      tags: true,
      matcher: matchMaker,
      minimumInputLength: 3,
    })
  }
}

const setUpcommingInterviewAndColor = () => {
  upcomingInterviewSelectors.forEach((upcomingInterviewSelector) => {
    if (
      currentUpcomingInterviewSchedule ==
      upcomingInterviewSelector.getAttribute("value")
    ) {
      upcomingInterviewSelector.value = currentUpcomingInterviewSchedule;
    }
  });
  /* -------------------------------------------------------------------------- */
  /*                     upcoming interview selector - span                     */
  /* -------------------------------------------------------------------------- */
  upcomingInterviewSelectorAll.forEach((upcomingInterviewSelector)=>{
    upcomingInterviewSelector.style.border = "2px solid #e8e7ee";
    if(upcomingInterviewSelector.getAttribute("for")===currentUpcomingInterviewSchedule){
      upcomingInterviewSelector.style.border = "2px solid #2463EB";
    }
  })
}

const mentorPreferenceCheckoutSetup = () => {
  if(params["mentor-preference"] && params["mentor-preference-exp"]){
    currentMentorPreference = params["mentor-preference"] || "";
    currentMentorPreferenceExp = params["mentor-preference-exp"] || "";
    /* -------------------------------------------------------------------------- */
    /*                          mentor preference feature                         */
    /* -------------------------------------------------------------------------- */
    if(currentMentorPreference){
      mentorPreferenceCheckout();
    }
  }
}

mentorPreferenceCheckoutSetup();

/* -------------------------------------------------------------------------- */
/*                                Redeem Coupen                               */
/* -------------------------------------------------------------------------- */

function couponAppliedAnalytics() {
  var properties = {
    button_name: currentButtonName,
    triggered_by: currentTriggerBy,
    item_id: currentSku,
    value: +pkDetails.totalPrice,
    coupon_code: coupon,
    package_name: currentPackageId,
    package_type: currentPackageType,
    package_amount: currentPrice,
    ecommerce: {
      currency: pkDetails.currency,
      value: +pkDetails.totalPrice,
      promotion_id: coupon,
      items: [
        {
          item_id: currentSku,
          item_name: currentPackageId,
          item_variant: currentMentorExperience,
          coupon: coupon,
          currency: pkDetails.currency,
          addGST: pkDetails.addGST,
          country: pkDetails.country,
          designation: pkDetails.designation,
          domain: pkDetails.domain,
          domain_id: pkDetails.domain_id,
          experience: pkDetails.experience,
          experience_id: pkDetails.experience_id,
          mentor_instructions: pkDetails.mentor_instructions,
          package: pkDetails.package,
          package_type: pkDetails.package_type,
          preferred_mentor_experience: pkDetails.preferred_mentor_experience,
          price: pkDetails.price,
          target_companies: currenTargetCompanies,
          target_role: pkDetails.target_role,
          value: +pkDetails.totalPrice,
          upcoming_interview: pkDetails.upcoming_interview,
          version: pkDetails.version,
        },
      ],
    },
  };
  sendAnalyticsToSegment.track("Coupon Applied", properties);
}

function onCouponApplied(discount) {
  updatePaymentInfo(discount);
  showElements([couponSuccessSelector]);
  couponSubmitSelector.innerText = "Redeem";
  couponAppliedAnalytics();
  commonSaveInfoToLocalStorage(currentPackageId);
  if(autoCheckout){
    console.log("pkDetails: ", pkDetails);
    payNowButtonSelector.click();
  }
}

function onInvalidCoupon() {
  showElements([couponErrorSelector]);
  couponSubmitSelector.innerText = "Redeem";
  updatePaymentInfo();
  coupon = "";
}

function checkCoupon(coupon, successCallback, errorCallback) {
  let url = apiBaseURL + `pricing/validate-coupon/v3/${coupon}`;
  getAPI(
    url,
    function (response) {
      if (response.status === 200) {
        var discount = response.data;
        successCallback(discount);
      } else {
        errorCallback(false);
      }
    },
    function (error) {
      console.error("checkCoupon: ", error);
      errorCallback(false);
    }
  );
}

couponSubmitSelector.addEventListener("click", function (e) {
  e.preventDefault();
  couponSubmitSelector.innerText = "Checking";
  hideElements([couponErrorSelector, couponSuccessSelector]);
  coupon = couponSelector.value.toUpperCase().trim();
  if (coupon) {
    currentCoupon = coupon;
    checkCoupon(coupon, onCouponApplied, onInvalidCoupon);
  } else {
    couponSubmitSelector.innerText = "Redeem";
    updatePaymentInfo();
  }
  return true;
});

/* -------------------------------------------------------------------------- */
/*                             Pay - Now - Button                             */
/* -------------------------------------------------------------------------- */
function payNowButtonLoader() {
  var text = payNowButtonSelector.firstChild.firstChild;
  var loader = payNowButtonSelector.lastElementChild;
  var arrow = loader.previousElementSibling;
  text.innerText = "Loading...";
  arrow.style.display = "none";
  loader.style.display = "block";
}

function payNowButtonIdealState() {
  var text = payNowButtonSelector.firstChild.firstChild;
  var loader = payNowButtonSelector.lastElementChild;
  var arrow = loader.previousElementSibling;
  text.innerText = "START PREPARING NOW";
  arrow.style.display = "block";
  loader.style.display = "none";
}

function preparePayment(e = "none") {
  if (
    $targetCompaniesSelector.val().length === 0 ||
    targetRoleSelector.value === "select_designation" ||
    domainSelector.value === "select_domain" ||
    mentorExperienceSelector.value === "select_mentor_experience"
  ) {
    targetRoleSelector.value === "select_designation" &&
      targetRoleSelector.classList.add("error");
    domainSelector.value === "select_domain" &&
      domainSelector.classList.add("error");
    mentorExperienceSelector.value === "select_mentor_experience" &&
      mentorExperienceSelector.classList.add("error");
    $targetCompaniesSelector.val().length === 0 &&
      targetCompaniesSelector.parentElement.classList.add("error");
    $targetCompaniesSelector.val().length === 0 &&
    showElements([tC_ErrorSelector]);
    $(".error").filter(":first")[0].scrollIntoView();
  } else {
    const properties = {
      button_name: currentButtonName,
      triggered_by: currentTriggerBy,
      item_id: currentSku,
      value: +pkDetails.totalPrice,
      package_name: currentPackageId,
      package_type: currentPackageType,
      domain: pkDetails.domain,
      designation: pkDetails.designation,
      experience: pkDetails.experience,
      coupon_code: currentCoupon,
      package_amount: +pkDetails.totalPrice,
      currency: pkDetails.currency,
      ecommerce: {
        currency: pkDetails.currency,
        value: +pkDetails.totalPrice,
        coupon: currentCoupon,
        items: [
          {
            item_id: currentSku,
            item_name: currentPackageId,
            item_variant: currentMentorExperience,
            coupon: currentCoupon,
            currency: pkDetails.currency,
            addGST: pkDetails.addGST,
            country: pkDetails.country,
            designation: pkDetails.designation,
            domain: pkDetails.domain,
            domain_id: pkDetails.domain_id,
            experience: pkDetails.experience,
            experience_id: pkDetails.experience_id,
            mentor_instructions: pkDetails.mentor_instructions,
            package: pkDetails.package,
            package_type: pkDetails.package_type,
            preferred_mentor_experience: pkDetails.preferred_mentor_experience,
            price: pkDetails.price,
            target_companies: currenTargetCompanies,
            target_role: pkDetails.target_role,
            value: +pkDetails.totalPrice || totalPrice,
            upcoming_interview: pkDetails.upcoming_interview,
            version: pkDetails.version,
          },
        ],
      },
    };
    
    sendAnalyticsToSegment.identify(verifiedUser.email,properties)
    sendAnalyticsToSegment.track("Payment Started", properties);
    e != "none" && e.preventDefault();
    payNowButtonLoader();
    hideElements([orderErrorSelector]);
    showElements([orderOverlay, orderLoader]);

    if (
      verifiedUser &&
      verifiedUser.phoneNumber &&
      verifiedUser.displayName &&
      verifiedUser.email
    ) {
      function onPaymentComplete(response) {
        hideElements([orderErrorSelector]);
        showElements([orderOverlay, orderLoader]);
        pkDetails["totalPrice"] = totalPrice;
        pkDetails["order_id"] = response.razorpay_order_id;
        triggerPurchase(pkDetails);
        const properties = {
          button_name: currentButtonName,
          triggered_by: currentTriggerBy,
          item_id: currentSku,
          value: +pkDetails.totalPrice,
          package_name: currentPackageId,
          package_type: currentPackageType,
          domain: pkDetails.domain,
          designation: pkDetails.designation,
          experience: pkDetails.experience,
          coupon_code: currentCoupon,
          package_amount: +pkDetails.totalPrice,
          transaction_id: response.razorpay_payment_id,
          ecommerce: {
            transaction_id: response.razorpay_payment_id,
            currency: pkDetails.currency,
            value: +pkDetails.totalPrice,
            coupon: pkDetails.coupon,
            items: [
              {
                item_id: currentSku,
                item_name: currentPackageId,
                item_variant: currentMentorExperience,
                coupon: pkDetails.coupon,
                currency: pkDetails.currency,
                addGST: pkDetails.addGST,
                country: pkDetails.country,
                designation: pkDetails.designation,
                domain: pkDetails.domain,
                domain_id: pkDetails.domain_id,
                experience: pkDetails.experience,
                experience_id: pkDetails.experience_id,
                mentor_instructions: pkDetails.mentor_instructions,
                package: pkDetails.package,
                package_type: pkDetails.package_type,
                preferred_mentor_experience:
                  pkDetails.preferred_mentor_experience,
                price: pkDetails.price,
                target_companies: pkDetails.target_companies,
                target_role: pkDetails.target_role,
                value: +pkDetails.totalPrice,
                upcoming_interview: pkDetails.upcoming_interview,
                version: pkDetails.version,
              },
            ],
          },
        };
        sendAnalyticsToSegment.identify(verifiedUser.email,properties)
        sendAnalyticsToSegment.track("Payment Completed", properties);
        function goToThankYouPage() {
          hideElements([orderOverlay, orderLoader, checkoutModal]);
          showElements([thankyouModal], "flex");
          var redirectingText = getElement("redirecting-text");
          let count = 10;
          let initialText = redirectingText.innerText;
          redirectingText.innerText = initialText + " " + count-- + " secs";
          setInterval(() => {
            redirectingText.innerText =
              initialText + " " + count + (count > 1 ? " secs" : " sec");
            count--;
            if (count === 0) {
              redirect("/dashboard", true);
            }
          }, 1000);
        }
        updateOrder(
          {
            order_id: response.razorpay_order_id,
            payment_id: response.razorpay_payment_id || "",
            signature: response.razorpay_signature || "",
          },
          goToThankYouPage,
          function () {
            onPaymentFailure("update-order");
          }
        );
      }
      function onOrderCreated(responseData){
        let order = responseData.razorpay_order_object;
        if (!!order) {
          var options = {
            key: responseData.key || "rzp_test_sPcDgJ2yGLxdzT", // Enter the Key ID generated from the Dashboard
            amount: order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
            currency: order.currency,
            name: "Preplaced Education Pvt. Ltd",
            description: packageMap[pkDetails.package],
            order_id: order.id,
            handler: function (response) {
              onPaymentComplete(response);
            },
            prefill: {
              name: verifiedUser.displayName,
              email: verifiedUser.email,
              contact: verifiedUser.phoneNumber,
            },
            notes: {
              Package: `${packageMap[pkDetails.package]}`,
              Domain: responseData.Domain,
            },
            modal: {
              ondismiss: function () {
                couponAppliedSuccessfullyUsingURL = false;
                const properties = {
                  button_name: currentButtonName,
                  triggered_by: currentTriggerBy,
                  item_id: currentSku,
                  value: +pkDetails.totalPrice,
                  package_name: currentPackageId,
                  package_type: currentPackageType,
                  coupon_code: currentCoupon,
                  package_amount: +pkDetails.totalPrice,
                  ecommerce: {
                    currency: pkDetails.currency,
                    value: +pkDetails.totalPrice,
                    coupon: pkDetails.coupon,
                    items: [
                      {
                        item_id: currentSku,
                        item_name: currentPackageId,
                        item_variant: currentMentorExperience,
                        coupon: pkDetails.coupon,
                        currency: pkDetails.currency,
                        addGST: pkDetails.addGST,
                        country: pkDetails.country,
                        designation: pkDetails.designation,
                        domain: pkDetails.domain,
                        domain_id: pkDetails.domain_id,
                        experience: pkDetails.experience,
                        experience_id: pkDetails.experience_id,
                        mentor_instructions: pkDetails.mentor_instructions,
                        package: pkDetails.package,
                        package_type: pkDetails.package_type,
                        preferred_mentor_experience:
                          pkDetails.preferred_mentor_experience,
                        price: pkDetails.price,
                        target_companies: pkDetails.target_companies,
                        target_role: pkDetails.target_role,
                        value: +pkDetails.totalPrice,
                        upcoming_interview: pkDetails.upcoming_interview,
                        version: pkDetails.version,
                      },
                    ],
                  },
                };
                sendAnalyticsToSegment.identify(verifiedUser.email,properties)
                sendAnalyticsToSegment.track("Payment Cancelled", properties);
                payNowButtonIdealState();
              },
            },
          };
          var rzp1 = new Razorpay(options);
          rzp1.on("payment.failed", function (response) {
            onPaymentFailure("razorpay");
            console.error("razorpay_error:", response.error);
          });
          hideElements([orderOverlay, orderErrorSelector]);
          rzp1.open();
          autoCheckout = false;
        } else {
          onPaymentComplete({
            razorpay_order_id: `${responseData.orderId}`,
          });
        }
      }
      pkDetails["coupon"] = coupon;
      pkDetails["target_companies"] = $targetCompaniesSelector.val().join(",");
      pkDetails["mentor_instructions"] = mentorInstructionSelector.value;
      pkDetails["upcoming_interview"] = currentUpcomingInterviewSchedule;
      if(couponAppliedSuccessfullyUsingURL){
        pkDetails["coupon"] = currentCoupon;
      }

      createOrder(pkDetails, onOrderCreated, function () {
        onPaymentFailure("create-order");
      });
    }
  }
}

payNowButtonSelector.addEventListener("click", function (e) {
  preparePayment(e);
});


upcomingInterviewSelectors.forEach((upcomingInterviewSelector) => {
  var nextSubling = upcomingInterviewSelector.nextElementSibling;
  upcomingInterviewSelector.addEventListener("click", (event) => {
      //set value of upcoming interview schuedule
      currentUpcomingInterviewSchedule = upcomingInterviewSelector.getAttribute("value");
      //remove color from unselected options
      upcomingInterviewSelectors.forEach((upcomingInterviewSelector2) => {
        var nextSubling2 = upcomingInterviewSelector2.nextElementSibling;
        nextSubling2.style.border = "2px solid #e8e7ee";
      })
      //set color for selected option
      nextSubling.style.border = "2px solid #2463EB";
  });
});

mentorPreferenceSelectors.forEach((mentorPreferenceSelector)=>{
  mentorPreferenceSelector.addEventListener("click", (event) => {
    currentMentorPreference = event.target.value;
    /* -------------------------------------------------------------------------- */
    /*            whenever auto assign selected the flag becomes false            */
    /* -------------------------------------------------------------------------- */
    if(currentMentorPreference === "Preplaced Auto Assign"){
      flagMentorPreference = false;
      mentorExperienceSelector.removeAttribute("disabled");
    }
    /* -------------------------------------------------------------------------- */
    /*         whenever auto assign is not selected then flag becomes true        */
    /* -------------------------------------------------------------------------- */
    if(currentMentorPreference === params["mentor-preference"] || currentMentorPreference === getCookie("mentor-preference")){
      flagMentorPreference = true;
      mentorExperienceSelector.setAttribute("disabled", true);
      setMentorExpViaMentorPreferExp();
    }
    /* -------------------------------------------------------------------------- */
    /*                  setting up the update pricing on checkout                 */
    /* -------------------------------------------------------------------------- */
    commonUpdatePricing();
    commonSaveInfoToLocalStorage(currentPackageId);
    updateCheckoutValuesOnShown();
    /* -------------------------------------------------------------------------- */
    /*                      setup color for mentor preference                     */
    /* -------------------------------------------------------------------------- */
    mentorPreferenceSelectorAll.forEach((mentorPreferenceSelector)=>{
      mentorPreferenceSelector.style.border = "2px solid #e8e7ee";
      if(mentorPreferenceSelector.getAttribute("for").replaceAll(" ","-")===currentMentorPreference.replaceAll(" ", "-")){
        mentorPreferenceSelector.style.border = "2px solid #2463EB";
      }
  })
  })
})

/* -------------------------------------------------------------------------- */
/*                                 GeoLocation                                */
/* -------------------------------------------------------------------------- */

function getLocation() {
  if (userLocation) {
    country = userLocation.country;
    locationUpdated = true;
    commonGetPricingData();
  } else {
    window.waitingForLocation = setInterval(function () {
      if (userLocation) {
        country = userLocation.country;
        locationUpdated = true;
        commonGetPricingData();
        clearInterval(window.waitingForLocation);
      }
    }, 300);
  }

  setTimeout(function () {
    if (!locationUpdated) {
      country = "India";
      commonGetPricingData();
      clearInterval(window.waitingForLocation);
    }
  }, 3000);
}

getLocation();

/* -------------------------------------------------------------------------- */
/*                            Coupon Hit Enter Fix                            */
/* -------------------------------------------------------------------------- */
$(function () {
  $(window).keydown(function (event) {
    if (event.keyCode == 13) {
      event.preventDefault();
      return false;
    }
  });
});

$("#company-selector-new")
  .select2({
    width: "100%",
    placeholder: "Your Target Company",
    tags: true,
    matcher: matchMaker,
    minimumInputLength: 3,
  })
  .on("change", function () {
    currenTargetCompanies = $targetCompaniesSelector.val().join(",");
    targetCompaniesSelector.parentElement.classList.remove("error");
    hideElements([tC_ErrorSelector]);
  });

function scrollBody(overflowValue) {
  document.body.style.overflow = overflowValue;
}

/* -------------------------------------------------------------------------- */
/*                                 set Cookies                                */
/* -------------------------------------------------------------------------- */
function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  let expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

/* -------------------------------------------------------------------------- */
/*                                 get Cookies                                */
/* -------------------------------------------------------------------------- */
function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}