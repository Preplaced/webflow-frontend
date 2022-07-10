// Initial variables
let package_id = "interview-preparation-bundle";
let country = "India";
let currentCurrency = "INR";
let currentPrice = "1799";
let currentTrialPrice = "399";
let currentExperience = "zero_three";
let pricing = {};
let trialPricing = {};
let packageDetails = {};
let selectedCompanies = [];
let locationUpdated = false;
let addGST = false;

// Selectors
// var packageExperienceSelector = getElement('experience');
var experienceSelector = getElement('experience');
var domainSelector = getElement('domain');
// var trialExperienceSelector = getElement('trial-experience');
// var mentorDesignation = getElement('mentor-designation');
var priceSelector = getElement('package-price');
// var priceLoader = getElement('price-loader');
var priceContainer = getElement('price-container');
var currencySelector = getElement('package-currency');
var trialPriceSelector = getElement('planning-price');
var trialCurrencySelector = getElement('planning-currency');
var bookButton = getElement('package-book-button');
var trialBookButton = getElement('planning-book-button');
// var bookNowForm = getElement('book-now-form-container');


var domainURL = window.location.pathname.split("programs/")[1];
var DomainURLMapping = {
    "backend-interview-preparation": {
        "text": "Backend",
        "id": "back_end"
    },
    "data-science-interview-preparation": {
        "text": "Data Science",
        "id": "data_science"
    },
    "devops-interview-preparation": {
        "text": "DevOps",
        "id": "dev_ops"
    },
    "frontend-interview-preparation":{
        "text": "Frontend",
        "id": "front_end"
    }
}
// let domainText = DomainURLMapping[domainURL].text;
// let domainId = DomainURLMapping[domainURL].id;


//methods
function setCurrency(currency){
  if (currency) currentCurrency = currency;
  var currencyText = (currentCurrency == "USD") ? "$" : "Rs";
  currencySelector.innerText = currencyText;
  trialCurrencySelector.innerText = currencyText;
}

function updatePricing(){
  try{
    currentPrice = pricing[currentExperience];
    priceSelector.innerText = currentPrice + "/-";
  }
  catch(error){
    console.error("error: ", error);
  }
}

function updateTrialPricing(){
  try{
      currentTrialPrice = trialPricing[currentExperience];
      trialPriceSelector.innerText = currentTrialPrice + "/-";
  }
  catch(error){
    console.error("error: ", error);
  }
}

function setGSTFlag(gstEnabled){
    addGST = gstEnabled;
}

function getPricingData() {
  // getPricing from Backend
  getPrice(country, package_id, function(responseData){
    pricing = responseData.pricing;
    updatePricing();
    setCurrency(responseData.currency);
    setGSTFlag(responseData.gstEnabled);
  })

  //getting trial pricing
  getPrice(country, package_id+"-trial", function(responseData){
    trialPricing = responseData.pricing;
    updateTrialPricing();
  })
}

function saveInfoToLocalStorage(forTrial){
  let domainText = domainSelector.options[domainSelector.selectedIndex].text;
  const price = forTrial ? currentTrialPrice : currentPrice;
  const packageId = forTrial ? package_id+"-trial" : package_id;
  let companies = `${domainText} Domain`;
  packageDetails = {
    "package_id": packageId,
    "experience_id": experienceSelector.options[experienceSelector.selectedIndex].value,
    "experience": experienceSelector.options[experienceSelector.selectedIndex].text,
    "target_companies": companies,
    "domain_id": domainSelector.options[domainSelector.selectedIndex].value,
    "domain": domainText,
    "designation": experienceSelector.options[experienceSelector.selectedIndex].text,
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

experienceSelector.onchange = function(event){
  event.preventDefault();
  currentExperience = experienceSelector.options[experienceSelector.selectedIndex].value;
  updatePricing();
  updateTrialPricing();
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
