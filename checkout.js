//remove before upload --> rm -rf

/* -------------------------------------------------------------------------- */
/*                            Variable Declarations                           */
/* -------------------------------------------------------------------------- */

let pkDetails = JSON.parse(localStorage.getItem("packageDetails"));
let totalPrice = 0;
let coupon = "";
let gstAdded = (pkDetails && pkDetails.addGST) || false;
let gstPrice = 0;
let bubbleButtonsFlag = true;

// Selectors
let [
  changeDomainSelector,
  domainTitleSelector,
  experienceTitleSelector,
  packageTitleSelector,
  couponSelector,
  couponSubmitSelector,
  couponSuccessSelector,
  couponErrorSelector,
  totalAmountTextSelector,
  payNowButtonSelector,
  userDetailsSelector,
  nameDetailsSelector,
  phoneDetailsSelector,
  emailDetailsSelector,
  payNowOverlay,
  payNowWrapper,
  packagePriceSelector,
  discountPriceSelector,
  // totalPriceSelector,
  orderOverlay,
  orderErrorSelector,
  orderLoader,
  hideOverlay,
  gstContainer,
  gstLabel,
  gstPriceDiv,
  closeCheckout,
  mentorInstructionSelector,
] = getElements([
  "change-domain",
  "domain-title",
  "experience-title",
  "package-title",
  "coupon-field-new",
  "coupon-submit-new",
  "coupon-success-new",
  "coupon-error-new",
  "total-amount-text",
  "pay-now-button-new",
  "user-details-section",
  "verified-user-name",
  "verified-user-phone",
  "verified-user-email",
  "pay-now-overlay",
  "pay-now-wrapper",
  "package-price-new",
  "coupon-discount-price-new",
  // "total-price",
  "order-overlay",
  "order-error",
  "order-loader",
  "hide-overlay",
  "gst-addition-container",
  "gst-label",
  "gst-price",
  "close-checkout-new",
  "specific-instructions-new",
]);
let targetRoleSelector = getElement("target-role-new");
let targetCompaniesSelector = getElement("company-selector-new");
let domainSelector = getElement("target-domain-new");
let upcomingInterviewSelectors = document.getElementsByName("Radio-Options");
let mentorExperienceSelector = getElement("mentor-experience-new");
let totalPriceSelector = document.querySelector("#checkout-new #total-price");
var loginTextSelector = getElement("login-text");
var loginSubtextSelector = getElement("login-subtext");
var selectDurationOrCountSelector = document.getElementsByClassName(
  "duration-count-selector-grid"
)[0];
var bubbleButtonsSelectors;

//variables
let pricing = {};
let experienceList = [
  "0-3 years",
  "4-6 years",
  "7-10 years",
  "10-15 years",
  "15+ years",
];
let country = "India";
let locationUpdated = false;

//current Values
let currentCurrency = "INR";
let currentPrice = "7999";
let currentPackageId = "Interview Preparation Program";
var currentRole = "0-3 years";
var currentDomain = "backend_developer";
var currentUpcomingInterviewSchedule = "No";
var currentMentorExperience = "";
var currenTargetCompanies = [];
var currentMentorInstruction = "";
var currentPackageType = "trial";
var currentPackageDetails = {};
var currentPackageDetail = {};

let packageDetails = {};
let allTargetDomain = {
  backend_developer: "Backend Developer",
  frontend_developer: "Frontend Developer",
  fullstack_developer: "Fullstack Developer",
  data_scientist: "Data Scientist",
  ai_ml_engineer: "AI/ML Engineer",
  data_analyst: "Data Analyst",
  data_engineer: "Data Engineer",
  devops_engineer: "DevOps Engineer",
  sre: "SRE",
  cloud_engineer: "Cloud Engineer",
  project_manager: "Project Manager",
  finance_roles: "Finance Roles",
  marketing_roles: "Marketing Roles",
  hr: "HR",
  consultant: "Consultant",
  business_analyst: "Business Analyst",
  sales_roles: "Sales Roles",
};
let addGST = false;

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

const explainers = {
  "wwyg-trial": ["Interview Preparation Program - trial"],
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
};

closeCheckout.addEventListener("click", function (e) {
  e.preventDefault();
  // redirect("/"+pkDetails.package_id);
  closeCheckoutModal();
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
    // showElements([gstContainer]);
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
  // domainTitleSelector.innerText = pkDetails.domain;
  // packageTitleSelector.innerText = packageMap[pkDetails.package_id];
  // experienceTitleSelector.innerText = pkDetails.experience !== "Fresher" ? pkDetails.experience + " Experience" : "Fresher";
  // handleUserDetailsUI();
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

// function selectOptionCreated(selector, optionsObject) {
//   for (let option in optionsObject) {
//     var optionTag = document.createElement("option");
//     optionTag.value = option;
//     optionTag.innerText = optionsObject[option];
//     selector.appendChild(optionTag);
//   }
// }

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
  //getCompanies from backend
  getAllCompanies(function (responseData) {
    populatePreferredCompanies(responseData["companyArray"]);
  });
}

getCompanies();

/* -------------------------------------------------------------------------- */
/*                           CheckOut Dynamic Common                          */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*                      Create Package Selector DropDown                      */
/* -------------------------------------------------------------------------- */
// Creating the single select dropdown for selecting different programs
var divTag = document.createElement("div"); // div for the parent for select list
var pTag = document.createElement("p"); // p to give label to the list
pTag.innerText = "Interview package Selection";

// Create and append select list
var selectList = document.createElement("select");
selectList.id = "interview-package-selection";
divTag.appendChild(pTag);
divTag.appendChild(selectList);
// clonedCheckoutForm.appendChild(divTag);

// Create and append the options
for (let property in packageMap) {
  var option = document.createElement("option");
  option.value = property;
  option.text = packageMap[property];
  selectList.appendChild(option);
}

// Setting the attribute for select list
selectList.setAttribute("name", "Experience-4");
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
  const price = currentPrice;
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
    triggerEvent("Checkout Started", {
      experience: packageDetails.experience,
      domain: packageDetails.domain,
      designation: packageDetails.designation,
      target_companies: packageDetails.target_companies,
      logged_in: !!accessToken,
      items: packageDetails,
    });
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
      break;
    } else if (
      currentCurrency !== "INR" &&
      currentPackageDetail.pricing[i].experience_level ===
        currentMentorExperience
    ) {
      currentPrice = currentPackageDetail.pricing[i].usd_pricing;
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

selectList.onchange = function (event) {
  // currentPackageId = selectList.options[selectList.selectedIndex].value;
  commonUpdatePricing();
  commonSaveInfoToLocalStorage(currentPackageId);
  updateCheckoutValuesOnShown();
};

/* -------------------------------------------------------------------------- */
/*              onChange of targetRole & mentorExperienceSelector             */
/* -------------------------------------------------------------------------- */

targetRoleSelector.onchange = function (event) {
  event.preventDefault();
  mentorExperienceSelector.value = targetRoleSelector.value;
  commonUpdatePricing();
  commonDisableLowerMentorDesignationOptions();
  commonSaveInfoToLocalStorage(currentPackageId);
  updateCheckoutValuesOnShown();
};

mentorExperienceSelector.onchange = function (event) {
  event.preventDefault();
  commonUpdatePricing();
  commonSaveInfoToLocalStorage(currentPackageId);
  updateCheckoutValuesOnShown();
};

domainSelector.onchange = function (event) {
  event.preventDefault();
  commonUpdatePricing();
  commonSaveInfoToLocalStorage(currentPackageId);
  updateCheckoutValuesOnShown();
};

function setSelectedValue(selectObj, valueToSet) {
  for (var i = 0; i < selectObj.options.length; i++) {
    if (selectObj.options[i].value == valueToSet) {
      selectObj.options[i].selected = true;
    }
  }
  return selectObj;
}

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
    // let analytics_gtag = {
    //   role,
    //   domain,
    //   package_id: currentPackageId,
    //   mentor_experience: currentMentorExperience,
    // };

    //explainer showcase on button click
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
    commonUpdatePricing();
    currentCurrency = country === "India" ? "INR" : "USD";
    // currentCurrency = "USD"; // to change currency manually for testing.
    commonSetGSTFlag(false);

    let params = Object.fromEntries(
      new URLSearchParams(window.location.search).entries()
    );
    let package_id = "Interview Preparation Program";
    if (params.checkout && pricing) {
      openCheckoutModal(package_id);
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
  // discountPriceSelector.innerText=`${currencyMap[pkDetails.currency]} 0`;
  // totalPriceSelector.innerText=`${currencyMap[pkDetails.currency]} ${totalPrice}`;
}

function checkCoupon(coupon, successCallback, errorCallback) {
  triggerEvent("Coupon Applied", { coupon: coupon });
  let url = apiBaseURL + `pricing/validate-coupon/v2/${coupon}`;
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
    checkCoupon(coupon, onCouponApplied, onInvalidCoupon);
  } else {
    couponSubmitSelector.innerText = "Redeem";
    updatePaymentInfo();
  }
});

/* -------------------------------------------------------------------------- */
  /*                             RazorPayModalClosed                            */
  /* -------------------------------------------------------------------------- */
  // var RazorpayModalClosedSelector = document.getElementById("modal-close");
  // RazorpayModalClosedSelector.addEventListener("click", () => {console.log("close button clicked")});

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
payNowButtonSelector.addEventListener("click", function (e) {
  e.preventDefault();
  payNowButtonLoader();
  console.log(" pkDetails in createOrder ", pkDetails);
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
      function goToThankYouPage() {
        // redirect('/thankyou');
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
});

//put all these stuff onclick of paymentcheckout button
document.addEventListener("DOMContentLoaded", (event) => {});

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
