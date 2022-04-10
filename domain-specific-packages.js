// Initial variables
let package_id = "interview-preparation-bundle";
let country = "India";
let currentCurrency = "INR";
let currentPrice = "1799";
let currentTrialPrice = "99";
let currentExperience = "fresher";
let pricing = {};
let trialPricing = {};
let packageDetails = {};
let selectedCompanies = [];
let locationUpdated = false;
let addGST = false;

// Selectors
var packageExperienceSelector = getElement('package-experience');
var experienceSelector = packageExperienceSelector;
var trialExperienceSelector = getElement('trial-experience');
// var mentorDesignation = getElement('mentor-designation');
var priceSelector = getElement('price');
// var priceLoader = getElement('price-loader');
var priceContainer = getElement('price-container');
var currencySelector = getElement('package-currency');
var trialPriceSelector = getElement('trial-price');
var trialCurrencySelector = getElement('trial-currency');
var bookButton = getElement('package-book-button');
var trialBookButton = getElement('trial-book-button');
var bookNowForm = getElement('book-now-form-container');

var packageTab = getElement('package-tab');
var trialTab = getElement('trial-tab');
var goToTrialLink = getElement('go-to-trial');


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
let domainText = DomainURLMapping[domainURL].text;
let domainId = DomainURLMapping[domainURL].id;


//methods

function updatePackageTabDetails () {
    package_id = "interview-preparation-bundle";
    experienceSelector = packageExperienceSelector;
    experienceSelector.value = currentExperience;
    updatePricing();
}

function updateTrialTabDetails() {
    package_id = "interview-preparation-bundle-trial";
    experienceSelector = trialExperienceSelector;
    experienceSelector.value = currentExperience;
    updateTrialPricing();
}

function setCurrency(currency){
  if (currency) currentCurrency = currency;
  var currencyText = (currentCurrency == "USD") ? "$" : "Rs";
  currencySelector.innerText = currencyText;
  trialCurrencySelector.innerText = currencyText;
}

function updatePricing(){
  currentExperience = experienceSelector.options[experienceSelector.selectedIndex].value;
  currentPrice = pricing[currentExperience];
  priceSelector.innerText = currentPrice + "/-";
}

function updateTrialPricing(){
      currentExperience = experienceSelector.options[experienceSelector.selectedIndex].value;
      currentPrice = trialPricing[currentExperience];
      trialPriceSelector.innerText = trialPricing[currentExperience]; + "/-";
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
    // updateTrialPricing();
  })
}

function saveInfoToLocalStorage(){
//   let domainText = domainSelector.options[domainSelector.selectedIndex].text;
  let companies = `${domainText} Domain`;
  packageDetails = {
    "package_id": package_id,
    "experience_id": experienceSelector.options[experienceSelector.selectedIndex].value,
    "experience": experienceSelector.options[experienceSelector.selectedIndex].text,
    "target_companies": companies,
    "domain_id": domainId, //domainSelector.options[domainSelector.selectedIndex].value,
    "domain": domainText,
    "designation": experienceSelector.options[experienceSelector.selectedIndex].text,
    "currency" : currentCurrency,
    "price": currentPrice,
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

packageExperienceSelector.onchange = function(event){
  event.preventDefault();
  updatePricing();
}

trialExperienceSelector.onchange = function(event){
    event.preventDefault();
    updateTrialPricing();
  }

packageTab.onclick = updatePackageTabDetails;

trialTab.onclick = updateTrialTabDetails;

goToTrialLink.onclick = function(){
  trialTab.click();
}

bookButton.onclick = function(event){
  event.preventDefault();
  saveInfoToLocalStorage(); //save the form Info here to local Storage which will be used in the checkout page
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
    saveInfoToLocalStorage(); //save the form Info here to local Storage which will be used in the checkout page
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
