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
  orderOverlay,
  orderErrorSelector,
  orderLoader,
  hideOverlay,
  gstContainer,
  gstLabel,
  gstPriceDiv,
  closeCheckout,
  mentorInstructionSelector,
  letsAssignTextSelector
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
  "order-overlay",
  "order-error",
  "order-loader",
  "hide-overlay",
  "gst-addition-container",
  "gst-label",
  "gst-price",
  "close-checkout-new",
  "specific-instructions-new",
  "lets-assign-text"
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
var tC_ErrorSelector = getElement("tc-error");
var bubbleButtonsSelectors;

//variables
let pricing = {};
let experienceList = [
  "select_mentor_experience",
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
let currentPrice = "00";
let currentPackageId = "";
var currentRole = "";
var currentDomain = "";
var currentUpcomingInterviewSchedule = "No";
var currentMentorExperience = "";
var currenTargetCompanies = [];
var currentMentorInstruction = "";
var currentPackageType = "Trial";
var currentPackageDetails = {};
var currentPackageDetail = {};
var currentSku = "";
var currentCoupon = "";

/* -------------------------------------------------------------------------- */
/*                            Analytics Properities                           */
/* -------------------------------------------------------------------------- */
var currentButtonName = "";
var currentTriggerBy = "";
var signInType = "";

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