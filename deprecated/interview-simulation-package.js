// Initial variables
let package_id = "mock-interview-bundle";
let mock_package_id = "mock-interview";
let country = "India";
let currentCurrency = "INR";
let currentPrice = "1799";
let currentTrialPrice = "399";
let currentExperience = "zero_three";
let pricing = {};
let mockInterviewPricing = {};
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
var priceSelector = getElement('program-price');
var priceContainer = getElement('pricing-section');
var currencySelector = getElement('program-currency');
var slashedCurrency = getElement('slashed-program-currency');
var slashedPrice = getElement('slashed-program-price');
var mockInterviewPriceSelector = getElement('planning-price');
var mockInterviewCurrencySelector = getElement('planning-currency');
var slashedMockInterviewCurrency = getElement('slashed-planning-currency');
var slashedMockInterviewPrice = getElement('slashed-planning-price');

var bookButton = getElement('program-book-button');
var mockInterviewBookButton = getElement('planning-book-button');


hideElements([slashedMockInterviewCurrency, slashedMockInterviewPrice]);



//methods


function populateDomainDropdown(domains){
  // //clear initaial dropdown values 
  while (domainSelector.children.length > 0){
    domainSelector.remove(0);
  }
  //add new options
  for (const domainId in domains){
    let domainData = domains[domainId];
    if (domainData.data && domainData.data.title && domainData.id)
    domainSelector.append(new Option(domainData.data.title, domainData.id));
  }
}

function getDomains(){
  //getDomains from Backend
  getAllDomains(function(responseData){
    populateDomainDropdown(responseData.domains);
  })
}

function setCurrency(currency){
  if (currency) currentCurrency = currency;
  var currencyText = (currentCurrency == "USD") ? "$" : "₹";
  currencySelector.innerText = currencyText;
  mockInterviewCurrencySelector.innerText = currencyText;
  slashedMockInterviewCurrency.innerText = currencyText;
  slashedCurrency.innerText = currencyText;
}

function updatePricing(){
  try{
    currentPrice = pricing[currentExperience];
    priceSelector.innerText = currentPrice;
    slashedPrice.innerText = (Math.ceil(currentPrice/60)*100 - 1)
  }
  catch(error){
    console.error("error: ", error);
  }
}

function updateMockInterviewPricing(){
  try{
      currentTrialPrice = mockInterviewPricing[currentExperience];
      mockInterviewPriceSelector.innerText = currentTrialPrice;
      slashedMockInterviewPrice.innerText = (Math.ceil(currentTrialPrice/80)*100 - 1)
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
  getPrice(country, mock_package_id, function(responseData){
    mockInterviewPricing = responseData.pricing;
    updateMockInterviewPricing();
  })
}

function saveInfoToLocalStorage(forTrial){
  let domainText = domainSelector.options[domainSelector.selectedIndex].text;
  const price = forTrial ? currentTrialPrice : currentPrice;
  const packageId = forTrial ? mock_package_id : package_id;
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

function scrollToPricing() {
  priceContainer.scrollIntoView({behavior: "smooth"});
}

callAfterCheckout = true;
if (afterCheckoutClosedMethod) {
  afterCheckoutClosedMethod = scrollToPricing;
}

experienceSelector.onchange = function(event){
  event.preventDefault();
  currentExperience = experienceSelector.options[experienceSelector.selectedIndex].value;
  updatePricing();
  updateMockInterviewPricing();
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

mockInterviewBookButton.onclick = function(event){
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
getDomains();
