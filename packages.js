// Initial variables
let package_id = window.location.pathname.slice(1);
let country = "India";
let currentCurrency = "INR";
let currentPrice = "1799";
let currentExperience = "fresher";
let pricing = {};
let packageDetails = {};
let selectedCompanies = [];
let locationUpdated = false;
let addGST = false;

// Selectors
var experienceSelector = getElement('experience');
var mentorDesignation = getElement('mentor-designation');
var priceSelector = getElement('price');
var priceLoader = getElement('price-loader');
var priceContainer = getElement('price-container');
var currencySelector = getElement('currency');
var domainSelector = getElement('domain');
$domainSelector = $('#domain').select2();
var companiesSelector = getElement('companies');
var selectDomainMessage = getElement('select-domain-message');
var selectDesignationMessage = getElement('select-designation-message');
var emptyCompanyMessage = getElement('empty-company-message');
$companiesSelector = $('#companies').select2({placeholder: "Select your target companies", tags: true, matcher: matchMaker});
var bookButton = getElement('book-button');
var bookNowForm = getElement('book-now-form-container');
var contentSection = getElement('content-section');
var radioButtonDomain = getElement('domain-wise');
var radioButtonCompany = getElement('company-wise');
var companyPreferenceContainer = getElement('company-preference-container');


//methods

function populateDomainDropdown(domains){
  // //clear initaial dropdown values 
  // while (domainSelector.children.length > 0){
  //   domainSelector.remove(0);
  // }
  //add new options
  for (const domainId in domains){
    let domainData = domains[domainId];
    if (domainData.data && domainData.data.title && domainData.id)
    domainSelector.append(new Option(domainData.data.title, domainData.id));
  }
}

function populatePreferredCompanies(companies){
	companies.sort();
  for(let index in companies){
    $companiesSelector.append(new Option(companies[index], companies[index]));
  }
}

function setCurrency(currency){
  if (currency) currentCurrency = currency;
  var currencyText = (currentCurrency == "USD") ? "$" : "Rs";
  currencySelector.innerText = currencyText;
}

function updatePricing(){
  priceLoader.style.display="none";
  currentExperience = experienceSelector.options[experienceSelector.selectedIndex].value;
  currentPrice = pricing[currentExperience];
  priceSelector.innerText = currentPrice + "/-";
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
//   var response = {currency : "INR"};
//   response["pricing"] = { fresher: "1799", six_ten: "2999", ten_plus: "3499", three_six: "2499", zero_three: "1999" };
}

function getDomains(){
  //getDomains from Backend
  getAllDomains(function(responseData){
    populateDomainDropdown(responseData.domains);
  })
}

function getCompanies(){
  //getCompanies from backend
  getAllCompanies(function(responseData){
    populatePreferredCompanies(responseData["companyArray"]);
  })
}

function saveInfoToLocalStorage(){
  let domainText = domainSelector.options[domainSelector.selectedIndex].text;
  let companies = radioButtonDomain.checked ? `${domainText} Domain` : selectedCompanies.map(word => capitalize(word.trim())).join();
  packageDetails = {
    "package_id": package_id,
    "experience_id": experienceSelector.options[experienceSelector.selectedIndex].value,
    "experience": experienceSelector.options[experienceSelector.selectedIndex].text,
    "target_companies": companies,
    "domain_id": domainSelector.options[domainSelector.selectedIndex].value,
    "domain": domainText,
    "designation": mentorDesignation.value,
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

experienceSelector.onchange = function(event){
  event.preventDefault();
  updatePricing();
}

function domainNotSelected(){
  return domainSelector.options[domainSelector.selectedIndex].value === "initial-domain-selector";
}

function designationNotAdded(){
  return mentorDesignation.value === "";
}

function checkForDomain(){
  if (domainNotSelected()){
    showElements([selectDomainMessage]);
  }
  else{
    hideElements([selectDomainMessage]);
  }
}

function checkForDesignation(){
  if (designationNotAdded()){
    showElements([selectDesignationMessage]);
  }
  else{
    hideElements([selectDesignationMessage]);
  }
}

function companyNeedsTobeAdded(){
  return (radioButtonCompany.checked && selectedCompanies.length === 0)
}

function checkForCompany() {
  if (companyNeedsTobeAdded()){
    showElements([emptyCompanyMessage]);
  }
  else{
    hideElements([emptyCompanyMessage]);
  }
}

domainSelector.onchange = function(event){
  checkForDomain();
}

mentorDesignation.onchange = function(){
  checkForDesignation();
  let designation = mentorDesignation.value;
  if (designation.length <= 5){
    mentorDesignation.value = designation.toUpperCase();
  }
  else{
    mentorDesignation.value = capitalize(designation);
  }
}

function radioButtonChanged() {
  hideElements([emptyCompanyMessage]);
  if (radioButtonCompany.checked){
    showElements([companyPreferenceContainer])
  }
  else{
    hideElements([companyPreferenceContainer])
  }
}

radioButtonDomain.onchange = radioButtonChanged;
radioButtonCompany.onchange = radioButtonChanged;

bookButton.onclick = function(event){
  event.preventDefault();
  saveInfoToLocalStorage(); //save the form Info here to local Storage which will be used in the checkout page
  checkForDesignation();
  if (designationNotAdded()){
    return;
  }
  checkForDomain();
  if (domainNotSelected()){
    return;
  }
  checkForCompany();
  if(companyNeedsTobeAdded()){
    return;
  }
  triggerEvent('begin_checkout', {
    'experience': packageDetails.experience,
    'domain': packageDetails.domain,
    'designation': packageDetails.designation,
    'target_companies': packageDetails.target_companies,
    'logged_in': !!accessToken,
    'items': packageDetails
  })
  proceedToCheckout();
}

$companiesSelector.on("select2:select", function (e) {
  var lastSelectedItem = e.params.data.text;
  selectedCompanies.push(lastSelectedItem);
  checkForCompany();
  console.log(selectedCompanies)
});

$companiesSelector.on("select2:unselect", function (e) {
  var unselectedItem = e.params.data.text;
  var index = selectedCompanies.indexOf(unselectedItem);
  selectedCompanies.splice(index, 1);
  checkForCompany();
});

contentSection.onmouseenter = function(){
    isNavbarChangeNeeded = false;
    navbarSelector.classList.remove("popNav");
}

contentSection.onmouseleave = function(){
    isNavbarChangeNeeded = true;
    changeNavbarDisplay();
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

hideElements([selectDomainMessage, selectDesignationMessage, emptyCompanyMessage]);
try {
  radioButtonDomain.checked = true;
  hideElements([companyPreferenceContainer]);
}
catch(e){

}
getLocation();
getDomains();
getCompanies();