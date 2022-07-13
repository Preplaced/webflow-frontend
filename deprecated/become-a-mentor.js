let selectedCompanies = [];
var domainSelector = getElement('domain');
var mentorPhoneFormatter = getElement('mentorPhoneFormatter');
var companiesSelector = getElement('companies');
var mentorName = getElement('mentor-name');
var designationSelector = getElement('Designation');
var userEmailSelector = getElement('Email');
$domainSelector = $('#domain').select2({selectionCssClass: 'all', dropdownCssClass: 'all'});
$companiesSelector = $('#companies').select2({width: "100%", placeholder: "What companies have you worked for?", tags: true, matcher: matchMaker});

//methods

function populateDomainDropdown(domains){
  //add new options
  domainSelector.options.item(0).setAttribute("disabled","disabled");
  for (const domainId in domains){
    let domainData = domains[domainId];
    if (domainData.data && domainData.data.title && domainData.id){
      domainSelector.append(new Option(domainData.data.title, domainData.title));
    }
  }
}

function populatePreferredCompanies(companies){
	companies.sort();
  for(let index in companies){
    $companiesSelector.append(new Option(companies[index], companies[index]));
  }
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

$companiesSelector.on("select2:select", function (e) {
  var lastSelectedItem = e.params.data.text;
  selectedCompanies.push(lastSelectedItem);
  console.log(selectedCompanies)
});

$companiesSelector.on("select2:unselect", function (e) {
  var unselectedItem = e.params.data.text;
  var index = selectedCompanies.indexOf(unselectedItem);
  selectedCompanies.splice(index, 1);
});

mentorName.onchange = function() {
    mentorName.value = capitalize(mentorName.value);
}

userEmailSelector.onchange = function(){
  userEmailSelector.value = userEmailSelector.value.toLowerCase()
}

designationSelector.onchange = function(){
  let designation = designationSelector.value;
  if (designation.length <= 5){
    designationSelector.value = designation.toUpperCase();
  }
  else{
    designationSelector.value = capitalize(designation);
  }
}

getDomains();
getCompanies();


var mentorPhoneNumber = document.querySelector("#mentor-phone"),
	dialCode = document.querySelector(".dialCode"),
 	errorMsg = document.querySelector("#error-msg"),
  validMsg = document.querySelector("#valid-msg");

var iti = intlTelInput(mentorPhoneNumber, {
  initialCountry: "in",
  placeholderNumberType: 'FIXED_LINE',
  separateDialCode: true,
});

var updateInputValue = function (event) {
  dialCode.value = "+" + iti.getSelectedCountryData().dialCode;
};
mentorPhoneNumber.addEventListener('input', updateInputValue, false);
mentorPhoneNumber.addEventListener('countrychange', updateInputValue, true);

var errorMap = ["Invalid number", "Invalid country code", "Too short", "Too long", "Invalid number"];

var reset = function() {
  mentorPhoneNumber.classList.remove("error");
  errorMsg.innerHTML = "";
  errorMsg.classList.add("hide");
  validMsg.classList.add("hide");
};

mentorPhoneNumber.addEventListener('blur', function() {
  reset();
  if (mentorPhoneNumber.value.trim()) {
    if (iti.isValidNumber()) {
    	mentorPhoneFormatter.value = iti.getNumber();
      validMsg.classList.remove("hide");
    } else {
      mentorPhoneNumber.classList.add("error");
      var errorCode = iti.getValidationError();
      errorMsg.innerHTML = errorMap[errorCode];
      errorMsg.classList.remove("hide");
    }
  }
});

mentorPhoneNumber.addEventListener('change', reset);
mentorPhoneNumber.addEventListener('keyup', reset);