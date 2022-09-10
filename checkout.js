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
    "button_name":currentButtonName
  };
  sendAnalyticsToSegment.track("Login/Signup Cancelled",properties);
};

closeCheckout.addEventListener("click", function (e) {
  e.preventDefault();
  closeCheckoutModal();
  scrollBody("scroll");
  let properties = {
    "button_name":currentButtonName
  }
  sendAnalyticsToSegment.track("Checkout Cancelled",properties);
});

/* -------------------------------------------------------------------------- */
/*                           Handle Display Pricing                           */
/* -------------------------------------------------------------------------- */
function handlePaymentSectionUI() {
  updatePaymentInfo();
  packagePriceSelector.innerText = `${currencyMap[pkDetails.currency]} ${
    pkDetails.price
  }`;
  discountPriceSelector.innerText = `${currencyMap[pkDetails.currency]} 0`;
  hideElements([couponErrorSelector, couponSuccessSelector]);
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

const successGetAllPriceForCountry = (response) => {
  console.log("success response", response);
};

function commonProceedToCheckout(modalText) {
  if (!verifiedUser) {
    customOnSignInMethod = function () {
      hideElements([loginModal]);
      updateCheckoutValuesOnShown();
      showElements([checkoutModal], "flex");
    };
    customOnSignIn = true;
    showLoginModal(modalText);
  } else {
    updateCheckoutValuesOnShown();
    showElements([checkoutModal], "flex");
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
  };
  localStorage.setItem("packageDetails", JSON.stringify(packageDetails));
}

function commonPaymentCheckout(package_id, modalText) {
  try {
    commonSaveInfoToLocalStorage(package_id); //save the form Info here to local Storage which will be used in the checkout page
    // REMIND triggerEvent("Checkout Started", {
    //   experience: packageDetails.experience,
    //   domain: packageDetails.domain,
    //   designation: packageDetails.designation,
    //   target_companies: packageDetails.target_companies,
    //   logged_in: !!accessToken,
    //   items: packageDetails,
    // });
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
      currentSku = currentPackageDetail.pricing[i].sku
      break;
    } else if (
      currentCurrency !== "INR" &&
      currentPackageDetail.pricing[i].experience_level ===
        currentMentorExperience
    ) {
      currentPrice = currentPackageDetail.pricing[i].usd_pricing;
      currentSku = currentPackageDetail.pricing[i].sku
      break;
    }
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
  if(event.target.value !== "select_designation"){
    targetRoleSelector.classList.remove("error");
    mentorExperienceSelector.removeAttribute("disabled");
    // mentorExperienceSelector.classList.remove("error");
  }
  mentorExperienceSelector.value = 'select_mentor_experience';
  commonDisableLowerMentorDesignationOptions();
  // commonUpdatePricing();
  commonSaveInfoToLocalStorage(currentPackageId);
  updateCheckoutValuesOnShown();
};

mentorExperienceSelector.onchange = function (event) {
  event.preventDefault();
  currentMentorExperience = event.target.value;
  event.target.value !== "select_mentor_experience" && mentorExperienceSelector.classList.remove("error");
  commonUpdatePricing();
  if(currentPrice == 0){
    hideElements([totalPriceSelector]);
    showElements([priceCalculationSelector]);
  }else{
    hideElements([priceCalculationSelector]);
    showElements([totalPriceSelector]);
  }
  commonSaveInfoToLocalStorage(currentPackageId);
  updateCheckoutValuesOnShown();
};

domainSelector.onchange = function (event) {
  event.preventDefault();
  currentDomain = event.target.value;
  event.target.value !== "select_domain" && domainSelector.classList.remove("error");
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
function packageTypeShow(){
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
    (mentorExperienceSelector.value === 'select_mentor_experience' && targetRoleSelector.value === 'select_designation') && mentorExperienceSelector.setAttribute("disabled",true);
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

    if(currentPrice == 0){
      hideElements([totalPriceSelector]);
      showElements([priceCalculationSelector]);
    }else{
      hideElements([priceCalculationSelector]);
      showElements([totalPriceSelector]);
    }

    // Checkout Started Analytics
    currentTriggerBy = "button";
    currentButtonName = paymentCheckoutSelector.getAttribute("button-name");

    //getting current Sku
    pricing.map((price)=>{
      if(price.name === currentPackageId){
        price.type.map((type) => {
            if(type.name === currentPackageType){
              currentSku = type.pricing[0].sku
            }
        })
      }
    })

    const properties = {
      "button_name":currentButtonName,
      "triggered_by":currentTriggerBy,
      "item_id":currentSku,
    "package_name":currentPackageId,
    "package_type":currentPackageType,
    logged_in: !!accessToken,
      "ecommerce":{
        "items":[{
          "item_id":currentSku,
          "item_name":currentPackageId,
        }]
      }
    }
    sendAnalyticsToSegment.track("Checkout Started",properties);
    packageTypeShow()
    openCheckoutModal(currentPackageId, modalText);
  });
});

/* -------------------------------------------------------------------------- */
/*                                 Get Pricing                                */
/* -------------------------------------------------------------------------- */

function getAllPricing(callback) {
  let url = apiBaseURL + "pricing/get-price/v2";
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
    // commonUpdatePricing();
    currentCurrency = country === "India" ? "INR" : "USD";
    commonSetGSTFlag(false);
    let params = Object.fromEntries(
      new URLSearchParams(window.location.search).entries()
    );
    if ( params.checkout && params["package-id"] && params["package-type"] && response ) {
      currentPackageId = params["package-id"];
      currentPackageType = params["package-type"];
      currentTriggerBy = "url";
      const properties = {
        "button_name":currentButtonName,
        "triggered_by":currentTriggerBy,
        "item_id":currentSku,
        "package_name":currentPackageId,
        "package_type":currentPackageType,
        logged_in: !!accessToken,
        "ecommerce":{
          "items":[{
            "item_id":currentSku,
            "item_name":currentPackageId,
          }]
        }
      }
    sendAnalyticsToSegment.track("Checkout Started",properties);
      packageTypeShow()
      openCheckoutModal(currentPackageId);
    }
  });
}

/* -------------------------------------------------------------------------- */
/*                                Redeem Coupen                               */
/* -------------------------------------------------------------------------- */

function onCouponApplied(discount) {
  updatePaymentInfo(discount);
  showElements([couponSuccessSelector]);
  couponSubmitSelector.innerText = "Redeem";
}

function onInvalidCoupon() {
  showElements([couponErrorSelector]);
  couponSubmitSelector.innerText = "Redeem";
  updatePaymentInfo();
  coupon = "";
}

function checkCoupon(coupon, successCallback, errorCallback) {
// REMIND   triggerEvent("Coupon Applied", { coupon: coupon });
  let url = apiBaseURL + `pricing/validate-coupon/v2/${coupon}`;
  getAPI(
    url,
    function (response) {
      if (response.status === 200) {
        var discount = response.data;
        var properties = {
            "button_name":currentButtonName,
            "triggered_by":currentTriggerBy,
            "item_id":currentSku,
            "value": +pkDetails.totalPrice,
            "coupon_code": coupon,
            package_name:currentPackageId,
            package_type:currentPackageType,
            package_amount:currentPrice,
            ecommerce: {
              currency: pkDetails.currency,
              value: +pkDetails.totalPrice,
              "promotion_id": coupon,
              items:[
                {
                  "item_id":currentSku,
                  "item_name":currentPackageId,
                  "item_variant":currentMentorExperience,
                  "coupon":coupon,
                  "currency":pkDetails.currency,
                  "addGST": pkDetails.addGST,
                  "country": pkDetails.country,
                  "designation": pkDetails.designation,
                  "domain": pkDetails.domain,
                  "domain_id": pkDetails.domain_id,
                  "experience": pkDetails.experience,
                  "experience_id": pkDetails.experience_id,
                  "mentor_instructions": pkDetails.mentor_instructions,
                  "package": pkDetails.package,
                  "package_type": pkDetails.package_type,
                  "preferred_mentor_experience": pkDetails.preferred_mentor_experience,
                  "price": pkDetails.price,
                  "target_companies": currenTargetCompanies,
                  "target_role": pkDetails.target_role,
                  "value": +pkDetails.totalPrice,
                  "upcoming_interview": pkDetails.upcoming_interview,
                  "version": pkDetails.version
                }
              ]
            }
          }
          sendAnalyticsToSegment.track("Coupon Applied",properties)
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

function payNowButtonIdealState(){
  var text = payNowButtonSelector.firstChild.firstChild;
  var loader = payNowButtonSelector.lastElementChild;
  var arrow = loader.previousElementSibling;
  text.innerText = "START PREPARING NOW";
  arrow.style.display = "block";
  loader.style.display = "none";
}


payNowButtonSelector.addEventListener("click", function (e) {
  if($targetCompaniesSelector.val().length === 0 || targetRoleSelector.value === 'select_designation' || domainSelector.value === 'select_domain' || mentorExperienceSelector.value === 'select_mentor_experience'){
    targetRoleSelector.value === 'select_designation' && targetRoleSelector.classList.add("error");
    domainSelector.value === 'select_domain' && domainSelector.classList.add("error");
    mentorExperienceSelector.value === 'select_mentor_experience' && mentorExperienceSelector.classList.add("error");
    $targetCompaniesSelector.val().length === 0 && targetCompaniesSelector.parentElement.classList.add("error");
    $targetCompaniesSelector.val().length === 0 && showElements([tC_ErrorSelector]);
    $('.error').filter(":first")[0].scrollIntoView();
  }else{
  const properties = {
    "button_name":currentButtonName,
    "triggered_by":currentTriggerBy,
    "item_id":currentSku,
    "value": +pkDetails.totalPrice,
    "package_name":currentPackageId,
    "package_type":currentPackageType,
    "coupon_code": currentCoupon,
    "package_amount":+pkDetails.totalPrice,
    currency: pkDetails.currency,
    // ecommerce: {
    //   currency: pkDetails.currency,
    //   value: +pkDetails.totalPrice,
      coupon: currentCoupon,
      items:[
        {
          "item_id":currentSku,
          "item_name":currentPackageId,
          "item_variant": currentMentorExperience,
          "coupon":currentCoupon,
          "currency":pkDetails.currency,
          "addGST": pkDetails.addGST,
          "country": pkDetails.country,
          "designation": pkDetails.designation,
          "domain": pkDetails.domain,
          "domain_id": pkDetails.domain_id,
          "experience": pkDetails.experience,
          "experience_id": pkDetails.experience_id,
          "mentor_instructions": pkDetails.mentor_instructions,
          "package": pkDetails.package,
          "package_type": pkDetails.package_type,
          "preferred_mentor_experience": pkDetails.preferred_mentor_experience,
          "price": pkDetails.price,
          "target_companies": currenTargetCompanies,
          "target_role": pkDetails.target_role,
          "value": +pkDetails.totalPrice,
          "upcoming_interview": pkDetails.upcoming_interview,
          "version": pkDetails.version
        }
      ]
    // }
  }
  sendAnalyticsToSegment.track("Payment Started",properties);
  e.preventDefault();
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
        "button_name":currentButtonName,
        "triggered_by":currentTriggerBy,
        "item_id":currentSku,
        "value": +pkDetails.totalPrice,
        "package_name":currentPackageId,
        "package_type":currentPackageType,
        "coupon_code": currentCoupon,
        "package_amount":+pkDetails.totalPrice,
        transaction_id: response.razorpay_payment_id,
        ecommerce: {
          transaction_id: response.razorpay_payment_id,
          currency: pkDetails.currency,
          value: +pkDetails.totalPrice,
          coupon: pkDetails.coupon,
          items:[
            {
              "item_id":currentSku,
              "item_name":currentPackageId,
              "item_variant": currentMentorExperience,
              "coupon":pkDetails.coupon,
              "currency":pkDetails.currency,
              "addGST": pkDetails.addGST,
              "country": pkDetails.country,
              "designation": pkDetails.designation,
              "domain": pkDetails.domain,
              "domain_id": pkDetails.domain_id,
              "experience": pkDetails.experience,
              "experience_id": pkDetails.experience_id,
              "mentor_instructions": pkDetails.mentor_instructions,
              "package": pkDetails.package,
              "package_type": pkDetails.package_type,
              "preferred_mentor_experience": pkDetails.preferred_mentor_experience,
              "price": pkDetails.price,
              "target_companies": pkDetails.target_companies,
              "target_role": pkDetails.target_role,
              "value": +pkDetails.totalPrice,
              "upcoming_interview": pkDetails.upcoming_interview,
              "version": pkDetails.version
            }
          ]
        }
      }
      sendAnalyticsToSegment.track("Payment Completed",properties); // TODO 
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
    function onOrderCreated(responseData) {
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
          "modal": {
            "ondismiss": function(){
              const properties = {
                "button_name":currentButtonName,
                "triggered_by":currentTriggerBy,
                "item_id":currentSku,
                "value": +pkDetails.totalPrice,
                "package_name":currentPackageId,
                "package_type":currentPackageType,
                "coupon_code": currentCoupon,
                "package_amount":+pkDetails.totalPrice,
                ecommerce: {
                  currency: pkDetails.currency,
                  value: +pkDetails.totalPrice,
                  coupon: pkDetails.coupon,
                  items:[
                    {
                      "item_id":currentSku,
                      "item_name":currentPackageId,
                      "item_variant": currentMentorExperience,
                      "coupon":pkDetails.coupon,
                      "currency":pkDetails.currency,
                      "addGST": pkDetails.addGST,
                      "country": pkDetails.country,
                      "designation": pkDetails.designation,
                      "domain": pkDetails.domain,
                      "domain_id": pkDetails.domain_id,
                      "experience": pkDetails.experience,
                      "experience_id": pkDetails.experience_id,
                      "mentor_instructions": pkDetails.mentor_instructions,
                      "package": pkDetails.package,
                      "package_type": pkDetails.package_type,
                      "preferred_mentor_experience": pkDetails.preferred_mentor_experience,
                      "price": pkDetails.price,
                      "target_companies": pkDetails.target_companies,
                      "target_role": pkDetails.target_role,
                      "value": +pkDetails.totalPrice,
                      "upcoming_interview": pkDetails.upcoming_interview,
                      "version": pkDetails.version
                    }
                  ]
                }
              }
              sendAnalyticsToSegment.track("Payment Cancelled",properties);
              payNowButtonIdealState()
            }
        }
        };
        var rzp1 = new Razorpay(options);
        rzp1.on("payment.failed", function (response) {
          onPaymentFailure("razorpay");
          console.error("razorpay_error:", response.error);
        });
        hideElements([orderOverlay, orderErrorSelector]);
        rzp1.open();
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
    createOrder(pkDetails, onOrderCreated, function () {
      onPaymentFailure("create-order");
    });
  }
  }
}
);

upcomingInterviewSelectors.forEach((upcomingInterviewSelector) => {
  upcomingInterviewSelector.addEventListener("click", (event) => {
    currentUpcomingInterviewSchedule =
      upcomingInterviewSelector.getAttribute("value");
  });
});

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
})

$('#company-selector-new').select2({
  width: "100%",
  placeholder: "Your Target Company",
  tags: true,
  matcher: matchMaker,
  minimumInputLength: 3,
}).on('change', function(){
  currenTargetCompanies = $targetCompaniesSelector.val().join(",");
  targetCompaniesSelector.parentElement.classList.remove("error");
  hideElements([tC_ErrorSelector])
});

function scrollBody(overflowValue){
    document.body.style.overflow = overflowValue;
}
