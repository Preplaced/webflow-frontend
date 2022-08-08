// Selector's
const targetCompaniesSelector =
  document.getElementsByClassName("select-field-7")[3];
const domainSelector = getElement("field-2");

targetCompaniesSelector.id = "target-companies";
targetCompaniesSelector.setAttribute("multiple", "multiple");
targetCompaniesSelector.selectedIndex = -1;

document.addEventListener("DOMContentLoaded", (event) => {
  $targetCompaniesSelector = $("#target-companies").select2({
    width: "100%",
    placeholder: "Your Target Company",
    tags: true,
    matcher: matchMaker,
  });
});

// $targetCompaniesSelector.val()

function populatePreferredCompanies(companies) {
  companies.sort();
  for (let index in companies) {
    $targetCompaniesSelector.append(
      new Option(companies[index], companies[index])
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
