let experienceList = ["zero_three", "three_six", "six_ten", "ten_plus"];
let domainClusters = {
  "/mock-interview-bundle": {
    "backend_developer": "Backend Developer",
    "frontend_developer": "Frontend Developer",
    "fullstack_developer": "Fullstack Developer",
    "data_scientist":"Data Scientist",
    "ai_ml_engineer":"AI/ML Engineer",
    "data_analyst":"Data Analyst",
    "data_engineer":"Data Engineer",
    "devops_engineer":"DevOps Engineer",
    "sre":"SRE",
    "cloud_engineer":"Cloud Engineer",
    "project_manager":"Project Manager",
    "finance_roles" : "Finance Roles",
    "marketing_roles": "Marketing Roles",
    "hr" : "HR",
    "consultant": "Consultant",
    "business_analyst": "Business Analyst",
    "sales_roles": "Sales Roles"
  },
  "/mock-interview": {
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
    "marketing_roles": "Marketing Roles",
    "finance_roles" : "Finance Roles",
    "hr" : "HR",
    "consultant": "Consultant",
    "business_analyst": "Business Analyst",
    "sales_roles": "Sales Roles"
  }
}


// Initial variables
let package_id = "mock-interview-bundle";
let trial_package_id = "mock-interview";
let country = "India";
let currentCurrency = "INR";
let currentPrice = "7999";
let currentTrialPrice = "1999";
let currentMentorExperience = "zero_three";
let pricing = {};
let trialPricing = {};
let packageDetails = {};
let locationUpdated = false;
let addGST = false;

// Selectors
var packageName = getElement('program-name');
var experienceSelector = getElement('target-role');
var mentorDesignation = getElement('mentor-experience');

var priceSelector = getElement('program-price');
var slashedPrice = getElement('slashed-program-price');
var priceContainer = getElement('price-container');
var currencySelector = getElement('program-currency');
var slashedCurrency = getElement('slashed-program-currency');
var domainSelector = getElement('target-domain');
var bookButton = getElement('program-book-button');
var trialBookButton = getElement('trial-book-button');
var bookNowForm = getElement('book-now-form-container');
var contentSection = getElement('content-section');


//Set initial Package Details
packageName.innerText = "Mock Interview Bundle";
let currentDomainCluster = domainClusters[window.location.pathname];
//methods

function populateDomainDropdown(){
  //clear initaial dropdown values 
  while (domainSelector.children.length > 0){
    domainSelector.remove(0);
  }
  //add new options
  for (const domainId in currentDomainCluster){
    domainSelector.append(new Option(currentDomainCluster[domainId], domainId));
  }
}


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
}


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
  mentorDesignation.value = experienceSelector.value;
  updatePricing();
  disableLowerMentorDesignationOptions();
}


mentorDesignation.onchange = function(event){
  event.preventDefault();
  updatePricing();
}

bookButton.onclick = function(event){
  event.preventDefault();
  const forTrial = false;
  saveInfoToLocalStorage(forTrial); //save the form Info here to local Storage which will be used in the checkout page
  triggerEvent('Checkout Started', {
    'experience': packageDetails.experience,
    'domain': packageDetails.domain,
    'designation': packageDetails.designation,
    'target_companies': packageDetails.target_companies,
    'logged_in': !!accessToken,
    'items': packageDetails
  })
  if(gtag){
    gtag("event", "Checkout Started", { items:[{...pkDetails}] })
  }
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
  if(gtag){
    gtag("event", "Checkout Started", { items:[{...pkDetails}] })
  }
  proceedToCheckout();
}

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

getLocation();
populateDomainDropdown();
