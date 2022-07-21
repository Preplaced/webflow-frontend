let experienceList = ["zero_three", "three_six", "six_ten", "ten_plus"];
let domainClusters = {
  "/consulting-session": {
    "backend_developer": "Backend Developer",
    "frontend_developer": "Frontend Developer",
    "fullstack_developer": "Fullstack Developer",
    "data_scientist":"Data Scientist",
    "ai_ml_engineer":"AI/ML Engineer",
    "data_analyst":"Data Analyst",
    "data_engineer":"Data Engineer",
    "devops_engineer":"DevOps Engineer",
    "project_manager":"Project Manager",
    "sre":"SRE",
    "cloud_engineer":"Cloud Engineer",
    "finance_roles" : "Finance Roles",
    "hr" : "HR",
    "consultant": "Consultant",
    "business_analyst": "Business Analyst",
    "sales_roles": "Sales Roles"
  }
}


// Initial variables
let package_id = "consulting-session";
let trial_package_id = "consulting-session-trial";
let country = "India";
let currentCurrency = "INR";
let currentPrice = "7999";
let currentTrialPrice = "199";
let currentMentorExperience = "zero_three";
let pricing = {};
let trialPricing = {};
let packageDetails = {};
// let selectedCompanies = [];
let locationUpdated = false;
let addGST = false;

// Selectors
var packageName = getElement('program-name');
var experienceSelector = getElement('target-role');
var mentorDesignation = getElement('mentor-experience');

var priceSelector = getElement('program-price');
var slashedPrice = getElement('slashed-program-price');
// var priceLoader = getElement('price-loader');
var priceContainer = getElement('price-container');
var currencySelector = getElement('program-currency');
var slashedCurrency = getElement('slashed-program-currency');
var domainSelector = getElement('target-domain');
// $domainSelector = $('#domain').select2();
// var companiesSelector = getElement('companies');
// var selectDomainMessage = getElement('select-domain-message');
// var selectDesignationMessage = getElement('select-designation-message');
// var emptyCompanyMessage = getElement('empty-company-message');
// $companiesSelector = $('#companies').select2({placeholder: "Select your target companies", tags: true, matcher: matchMaker});
var bookButton = getElement('program-book-button');
var trialBookButton = getElement('trial-book-button');
var bookNowForm = getElement('book-now-form-container');
var contentSection = getElement('content-section');
// var radioButtonDomain = getElement('domain-wise');
// var radioButtonCompany = getElement('company-wise');
// var companyPreferenceContainer = getElement('company-preference-container');
// let reasonCheckboxes = document.querySelectorAll(".reason-checkbox-container");
// let reasonCounter = getElement("reason-counter");


// Set Initial Page Details
let currentDomainCluster = domainClusters[window.location.pathname];
hideElements([trialBookButton]);
packageName.innerText = "Consulting Session";

//methods

function populateDomainDropdown(){
  //clear initaial dropdown values 
  while (domainSelector.children.length > 0){
    domainSelector.remove(0);
  }
  // {
  //   "backend_developer": "Backend Developer",
  //   "frontend_developer": "Frontend Developer",
  //   "fullstack_developer": "Fullstack Developer"
  // }
  //add new options
  for (const domainId in currentDomainCluster){
    domainSelector.append(new Option(currentDomainCluster[domainId], domainId));
  }
}

// function setNoOfReasonsChecked() {
//   let totalChecked = 0;
//   reasonCheckboxes.forEach(function (checkboxContainer){
//     let checkbox = checkboxContainer.querySelector("input");
//     if (checkbox.checked) totalChecked++;
//   })
//   reasonCounter.innerText = `${totalChecked ? totalChecked : ""} ${totalChecked === 1 ? "Reason": "Reasons"}`
// }

// function setCheckboxListeners() {
//   reasonCheckboxes.forEach(function (checkboxContainer){
//     let checkbox = checkboxContainer.querySelector("input");
//     checkbox.onchange = function() {
//       console.log("checkbox changed");
//       setNoOfReasonsChecked();
//     }
//   })
// }



function setCurrency(currency){
  if (currency) currentCurrency = currency;
  var currencyText = (currentCurrency == "USD") ? "$" : "₹";
  currencySelector.innerText = currencyText;
  slashedCurrency.innerText = currencyText;
}

function updatePricing(){
  // priceLoader.style.display="none";
  currentMentorExperience = mentorDesignation.options[mentorDesignation.selectedIndex].value;
  currentPrice = pricing[currentMentorExperience];
  priceSelector.innerText = currentPrice + "/-";
  slashedPrice.innerText = (Math.ceil(currentPrice/60)*100 - 1);
  updateTrialPricing();
}

function updateTrialPricing(){
  try{
      if (trialPricing[currentMentorExperience])
      currentTrialPrice = trialPricing[currentMentorExperience];

      trialBookButton.innerText = `${trialBookButton.innerText.split('@')[0]}@ ${(currentCurrency == "USD") ? "$" : "₹"}${currentTrialPrice}/-`;
      // trialPriceSelector.innerText = currentTrialPrice;
      // slashedPlanningPrice.innerText = (Math.ceil(currentTrialPrice/20)*100 - 1)
  }
  catch(error){
    console.error("error: ", error);
  }
}

function setGSTFlag(gstEnabled){
    addGST = gstEnabled;
}

function getPricingData() {
  //getting trial pricing
  getPrice(country, trial_package_id, function(responseData){
    trialPricing = responseData.pricing;
    // updateTrialPricing();
  })
  // getPricing from Backend
  getPrice(country, package_id, function(responseData){
    pricing = responseData.pricing;
    updatePricing();
    setCurrency(responseData.currency);
    setGSTFlag(responseData.gstEnabled);
  });
//   var response = {currency : "INR"};
//   response["pricing"] = { fresher: "1799", six_ten: "2999", ten_plus: "3499", three_six: "2499", zero_three: "1999" };
}

// function getDomains(){
//   //getDomains from Backend
//   getAllDomains(function(responseData){
//     populateDomainDropdown(responseData.domains);
//   })
// }

// function getCompanies(){
//   //getCompanies from backend
//   getAllCompanies(function(responseData){
//     populatePreferredCompanies(responseData["companyArray"]);
//   })
// }

function saveInfoToLocalStorage(forTrial){
  let domainText = domainSelector.options[domainSelector.selectedIndex].text;
  let companies = `${domainText} Domain`;
  const price = forTrial ? currentTrialPrice : currentPrice;
  const packageId = forTrial ? trial_package_id : package_id;
  packageDetails = {
    "package_id": packageId,
    "experience_id": mentorDesignation.value,
    "experience": experienceSelector.options[experienceSelector.selectedIndex].text,
    "target_companies": companies,
    "domain_id": domainSelector.options[domainSelector.selectedIndex].value,
    "domain": domainText,
    "target_role": `${experienceSelector.options[experienceSelector.selectedIndex].text} ${domainText}`,
    "preferred_mentor_experience": mentorDesignation.selectedOptions[0].text,
    "designation": mentorDesignation.value,
    "currency" : currentCurrency,
    "price": price,
    "country": country,
    "addGST": addGST
  }
  localStorage.setItem('packageDetails', JSON.stringify(packageDetails));
}

function proceedToCheckout() {
    if (!verifiedUser){
        customOnSignInMethod = function() {
          hideElements([loginModal]);
          updateCheckoutValuesOnShown();
          showElements([checkoutModal], "flex");
        }
        customOnSignIn = true;
        showElements([loginModal], "flex");
    }
    else{
        updateCheckoutValuesOnShown();
        showElements([checkoutModal], "flex");
    }
    //   window.location.assign('/checkout');
}

function disableLowerMentorDesignationOptions () {
  let candidateExperienceIndex = experienceList.indexOf(experienceSelector.value);
  for (let optionIndex in mentorDesignation.options){
    mentorDesignation.options[optionIndex].disabled = candidateExperienceIndex > optionIndex;
  }
}

experienceSelector.onchange = function(event){
  event.preventDefault();
  // let candidateExperienceIndex = experienceList.indexOf(experienceSelector.value);
  // let mentorExperienceIndex = experienceList.indexOf(mentorDesignation.value);
  mentorDesignation.value = experienceSelector.value;
  updatePricing();
  disableLowerMentorDesignationOptions();
}

// function domainNotSelected(){
//   return domainSelector.options[domainSelector.selectedIndex].value === "initial-domain-selector";
// }

// function designationNotAdded(){
//   return mentorDesignation.value === "";
// }

// function checkForDomain(){
//   if (domainNotSelected()){
//     showElements([selectDomainMessage]);
//   }
//   else{
//     hideElements([selectDomainMessage]);
//   }
// }

// function checkForDesignation(){
//   if (designationNotAdded()){
//     showElements([selectDesignationMessage]);
//   }
//   else{
//     hideElements([selectDesignationMessage]);
//   }
// }

// function companyNeedsTobeAdded(){
//   return (radioButtonCompany.checked && selectedCompanies.length === 0)
// }

// function checkForCompany() {
//   if (companyNeedsTobeAdded()){
//     showElements([emptyCompanyMessage]);
//   }
//   else{
//     hideElements([emptyCompanyMessage]);
//   }
// }

// domainSelector.onchange = function(event){
//   checkForDomain();
// }

mentorDesignation.onchange = function(event){
  event.preventDefault();
  updatePricing();
  // checkForDesignation();
  // let designation = mentorDesignation.value;
  // if (designation.length <= 5){
  //   mentorDesignation.value = designation.toUpperCase();
  // }
  // else{
  //   mentorDesignation.value = capitalize(designation);
  // }
}

// function radioButtonChanged() {
//   hideElements([emptyCompanyMessage]);
//   if (radioButtonCompany.checked){
//     showElements([companyPreferenceContainer])
//   }
//   else{
//     hideElements([companyPreferenceContainer])
//   }
// }

// radioButtonDomain.onchange = radioButtonChanged;
// radioButtonCompany.onchange = radioButtonChanged;

bookButton.onclick = function(event){
  event.preventDefault();
  const forTrial = false;
  saveInfoToLocalStorage(forTrial); //save the form Info here to local Storage which will be used in the checkout page
  // checkForDesignation();
  // if (designationNotAdded()){
  //   return;
  // }
  // checkForDomain();
  // if (domainNotSelected()){
  //   return;
  // }
  // checkForCompany();
  // if(companyNeedsTobeAdded()){
  //   return;
  // }
  triggerEvent('Checkout Started', {
    'experience': packageDetails.experience,
    'domain': packageDetails.domain,
    'designation': packageDetails.designation,
    'target_companies': packageDetails.target_companies,
    'logged_in': !!accessToken,
    'items': packageDetails
  })
  proceedToCheckout();
}

trialBookButton.onclick = function(event){
  event.preventDefault();
  const forTrial = true;
  saveInfoToLocalStorage(forTrial); //save the form Info here to local Storage which will be used in the checkout page
  triggerEvent('Checkout Started', {
    'experience': packageDetails.experience,
    'domain': packageDetails.domain,
    'designation': packageDetails.designation,
    'target_companies': packageDetails.target_companies,
    'logged_in': !!accessToken,
    'items': packageDetails
  })
  proceedToCheckout();
}

// $companiesSelector.on("select2:select", function (e) {
//   var lastSelectedItem = e.params.data.text;
//   selectedCompanies.push(lastSelectedItem);
//   checkForCompany();
//   console.log(selectedCompanies)
// });

// $companiesSelector.on("select2:unselect", function (e) {
//   var unselectedItem = e.params.data.text;
//   var index = selectedCompanies.indexOf(unselectedItem);
//   selectedCompanies.splice(index, 1);
//   checkForCompany();
// });

// contentSection.onmouseenter = function(){
//     isNavbarChangeNeeded = false;
//     navbarSelector.classList.remove("popNav");
// }

// contentSection.onmouseleave = function(){
//     isNavbarChangeNeeded = true;
//     changeNavbarDisplay();
// }

//initialize methods
function getLocation(){
    if (userLocation){
        country = userLocation.country;
        locationUpdated = true;
        getPricingData();
    }
    else{
        window.waitingForLocation = setInterval(function(){
            if (userLocation){
                country = userLocation.country;
                locationUpdated = true;
                getPricingData();
                clearInterval(window.waitingForLocation);
            }
        }, 300);
    }

    setTimeout(function(){
        if (!locationUpdated){
            country = "India";
            getPricingData();
            clearInterval(window.waitingForLocation);
        }
    }, 3000);
}

// hideElements([selectDomainMessage, selectDesignationMessage, emptyCompanyMessage]);
try {
  // radioButtonDomain.checked = true;
  // hideElements([companyPreferenceContainer]);
}
catch(e){

}
getLocation();
populateDomainDropdown();
// setCheckboxListeners();
// getDomains();
// getCompanies();