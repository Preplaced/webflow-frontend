try {
    document.domain = 'preplaced.in';
}
catch (e) { }

// console.log("%cWelcome to Preplaced LocalHost Server", "color: red; font-size:2rem;padding: 2px");

loadFile("styles/style.js",false);

//for development
// loadFile("variables.js",false);
// loadFile("checkout.js", false);

//for production
loadFile("variables.min.js",false);
loadFile("checkout.min.js", false);

var firebaseConfig = {
    apiKey: "AIzaSyDEjje1xnNR_5Ckx27w_8emPFUy5ppC0E8",
    authDomain: "preplaced-ui.firebaseapp.com",
    databaseURL: "https://preplaced-ui.firebaseio.com",
    projectId: "preplaced-ui",
    storageBucket: "preplaced-ui.appspot.com",
    messagingSenderId: "779441206847",
    appId: "1:779441206847:web:107bfb3d20f20bd7746a8a",
    measurementId: "G-JBWKVRBC25"
};
firebase.initializeApp(firebaseConfig);
var signOutUser = function (reload = true) {
    localStorage.removeItem('ACCESS_TOKEN');
    accessToken = undefined;
    verifiedUser = undefined;
    firebase.auth().signOut();
    setInitialDisplays();
    if (reload) window.location.reload();
}

var signOutWithoutReload = function () {
    signOutUser(false);
}

function getElement(id, parentId) {
    if (parentId) {
        return document.getElementById(parentId).querySelector(`#${id}`);
    }
    else {
        return document.getElementById(id);
    }
}

function getElements(idArray) {
    let selectors = [];
    for (let id in idArray) {
        selectors.push(getElement(idArray[id]))
    }
    return selectors;
}

let apiBaseURL = "https://backend.preplaced.in/";
let verifiedUser;
let credential;
let userLocation;
let localUserName = localStorage.getItem("Name");
let accessToken = localStorage.getItem("ACCESS_TOKEN");
let RecaptchaSelector = getElement('recaptcha');
var dashboardButton = getElement('dashboard-button');
var menuLoginButton = getElement('menuLoginButton');
var navbarSelector = getElement("navbar-container");
var loginModal = getElement("login-modal");
var closeLoginModalIcon = getElement("close-login-modal");
var checkoutModal = getElement("checkout-new");
var thankyouModal = getElement("thankyou-modal");
var userName = getElement('Name');
var phoneFormatter = getElement('phoneFormatter');
var downloadEbookButton = getElement('download-ebook-button');
var footerLogin = getElement('footer-login');
var currentPath = window.location.pathname;
var preplacedLogo = "https://uploads-ssl.webflow.com/5fa298c0bded9141021f03fa/5fe8f718a1688547053c318d_preplaced.png";
var customOnSignIn = false;
var customOnSignInMethod = function () {
}
var callAfterCheckout = false;
var afterCheckoutClosedMethod = function () {
}
var isMobile = window.innerWidth <= 425;
var menuLogin = document.getElementsByClassName("login-button");


// To check if a user is on mobile device or not
let details = navigator.userAgent;
let regexp = /android|iphone|kindle|ipad/i;
let isMobileDevice = regexp.test(details);

// Wait for Intercom to boot (max 30 seconds)
// const timeout = setTimeout(() => clearInterval(interval), 30000);



/*******************************************************************\
|                                                                   |
|                   Analytics Methods                               |
|                                                                   |
\*******************************************************************/
if (analytics) {
    const params = new URLSearchParams(window.location.search)
    if (window.sessionStorage.getItem("page_visited") == null) {
        var pageVisitParams = {}
        params.forEach(function (value, key) {
            window.sessionStorage.setItem(key, value)
            pageVisitParams[key] = value
        });
        // REMIND analytics.track('New Website Session', pageVisitParams) - Old Event Because for testing
        window.sessionStorage.setItem("page_visited", true)
    }
}

const urlSearchParams = new URLSearchParams(window.location.search);
const URLQueryParams = Object.fromEntries(urlSearchParams.entries());

function triggerEvent(eventName, params) {
    let eventParams = params || {}
    eventParams["event"] = eventName;
    dataLayer.push(eventParams);
    let fbParams = eventParams;
    if (!!fbParams.items) {
        fbParams = { ...fbParams, ...fbParams.items };
        delete fbParams.items;
        fbParams["value"] = fbParams.totalPrice || fbParams.price;
    }
    if (eventName === 'Payment Completed' || eventName === 'Payment Started') {
        let fbParamsString = JSON.stringify(fbParams)
        Sentry.captureException(`${verifiedUser.displayName} ${eventName}  ${fbParamsString}`, verifiedUser.displayName, eventName, fbParamsString)
    }
    if (analytics) {
        analytics.track(eventName, fbParams);
    }

    eventName = eventName[0].toUpperCase() + eventName.substring(1);
    fbq('track', eventName, fbParams);
}

const sendAnalyticsToSegment = {
    track:(eventName,properties) => {
        try{
            var failedTimes = 1;
            console.log("eventName: ", eventName, "\n properties: ", properties);
            analytics && analytics.track(eventName,properties)
            .then((success)=>{
                if(success.logger.log() && failedTimes <= 5){
                    analytics.track(eventName,properties)
                    failedTimes++;
                }
            })
            .catch((error)=>{console.log("Error in sendAnalyticsToSegment.track of analytics.track()",error)});
        }catch(error){
            console.error("Error in sendAnalyticsToSegment.track()",error);
            setTimeout(()=>{
                console.log("InCatch - eventName: ", eventName, "\n properties: ", properties);
                analytics && analytics.track(eventName,properties)
            },1000)
        }
    },
    identify:(email,identities) => {
        try{
            console.log("email :",email, " identities :", identities);
            analytics && analytics.identify(email,identities);
        }catch(error){
            console.error("Error in sendAnalyticsToSegment identify",error);
        }
    }
}

function triggerPurchase(packageDetails) {
    packageDetails['item_name'] = packageDetails.package;
    packageDetails['item_id'] = packageDetails.package;
    let eventParams = {
        'coupon': packageDetails.coupon,
        'currency': packageDetails.currency,
        'transaction_id': packageDetails.order_id,
        'value': packageDetails.totalPrice,
        'items': packageDetails,
        'item_name': packageDetails.package,
        'item_id': packageDetails.package,
        'experience': packageDetails.experience,
        'domain': packageDetails.domain,
        'designation': packageDetails.designation,
        'target_companies': packageDetails.target_companies,
        'logged_in': !!accessToken,
    }
    // REMIND triggerEvent('Payment Completed', eventParams);
}

function triggerPurchaseInitiation(packageDetails) {
    packageDetails['item_name'] = packageDetails.package;
    packageDetails['item_id'] = packageDetails.package;
    let eventParams = {
        'coupon': packageDetails.coupon,
        'currency': packageDetails.currency,
        'value': packageDetails.totalPrice,
        'items': packageDetails,
        'item_name': packageDetails.package,
        'item_id': packageDetails.package,
        'experience': packageDetails.experience,
        'domain': packageDetails.domain,
        'designation': packageDetails.designation,
        'target_companies': packageDetails.target_companies,
        'logged_in': !!accessToken,
    }
    // REMIND triggerEvent('Payment Started', eventParams);
}
//////////////////////////////////////////////////////////////////////


/*******************************************************************\
|                                                                   |
|                   CRUD  API COMMON METHODS                        |
|                                                                   |
\*******************************************************************/

function getDefaultConfig() {
    let config = {}
    if (accessToken) {
        config["headers"] = {
            'Authorization': `Bearer ${accessToken}`
        }
    }
    return config
}

function logAPIError(params) {
    let { api, error, data } = params;
    let errorCode = error.response ? error.response.status : "";
    let errorText = error.response ? error.response.statusText : "";
    // _LTracker.push({ 
    //     requestData: data,
    //     api: api,
    //     error: error,
    //     errorCode: errorCode,
    //     errorText: errorText,
    //     user: verifiedUser ? verifiedUser.displayName : "notSignedIn",
    // })
}

function getAPI(url, successCallback, errorCallback) {
    axios.get(url, getDefaultConfig())
        .then(function (response) {
            successCallback(response);
        })
        .catch(function (error) {
            errorCallback(error);
            logAPIError({
                api: url,
                error: error
            })
        });
}

function postAPI(url, data, successCallback, errorCallback) {
    axios.post(url, data, getDefaultConfig())
        .then(function (response) {
            successCallback(response);
        })
        .catch(function (error) {
            errorCallback(error);
            logAPIError({
                api: url,
                error: error,
                data: data
            });
        });
}
//////////////////////////////////////////////////////////////////////


/*******************************************************************\
|                                                                   |
|                       DOM Manipulations                           |
|                                                                   |
\*******************************************************************/

function hideElements(selectorsArray) {
    for (let index in selectorsArray) {
        try {
            if (selectorsArray[index].type === "checkbox") { //checkbox has label along with it. so hide/show applied on parent
                selectorsArray[index].parentElement.style.display = "none";
            }
            else {
                selectorsArray[index].style.display = "none";
            }
        } catch (error) {
            console.error("not a valid selector: ", selectorsArray[index]);
        }
    }
}

function showElements(selectorsArray, displayType = "block") {
    for (let index in selectorsArray) {
        try {
            if (selectorsArray[index].type === "checkbox") { //checkbox has label along with it. so hide/show applied on parent
                selectorsArray[index].parentElement.style.display = displayType;
            }
            else {
                selectorsArray[index].style.display = displayType;
                selectorsArray[index].classList.remove('hide');
            }
        } catch (error) {
            console.error("not a valid selector: ", selectorsArray[index]);
        }
    }
}

function setInnerText(selectorsArray) {
    for (let index in selectorsArray) {
        try {
            selectorsArray[index]["s"].innerText = selectorsArray[index]["t"];
        } catch (error) {
            console.error("not a valid selector: ", selectorsArray[index]);
        }
    }
}

function setButtonLoading(buttonSelector, text) {
    if (buttonSelector.children.length === 2) {
        buttonSelector.classList.add("loading");
        buttonSelector.children[1].style.display = "none";
        buttonSelector.children[0].style.display = "block";
        buttonSelector.style.cursor = "no-drop";
    }
}

function removeButtonLoading(buttonSelector, text) {
    if (buttonSelector.children.length === 2) {
        buttonSelector.children[0].style.display = "none";
        buttonSelector.children[1].innerText = text;
        buttonSelector.children[1].style.display = "block";
        buttonSelector.classList.remove("loading");
        buttonSelector.style.cursor = "pointer";
    }
}

function checkFieldsAndShowError(fieldSelectors, errorField) {
    function showErrorBorder(fieldSelector) {
        let borderSelector = fieldSelector.type === "checkbox" ? fieldSelector.parentElement.children[0] : fieldSelector;
        let previousBorder = fieldSelector.style.border;
        borderSelector.style.border = "1px solid #e45356";
        function resetBorder() {
            borderSelector.style.border = previousBorder;
            fieldSelector.removeEventListener("change", resetBorder)
        }
        fieldSelector.addEventListener("change", resetBorder);
    }
    for (let index in fieldSelectors) {
        if (fieldSelectors[index].type === "checkbox") {
            if (!fieldSelectors[index].checked) {
                errorField.innerText = "Please make sure you've checked the required checkbox";
                showErrorBorder(fieldSelectors[index]);
                errorField.style.display = "block";
                return false;
            }
        }
        else if (fieldSelectors[index].type === "email") {
            if (!isValidEmail(fieldSelectors[index].value)) {
                errorField.innerText = "Please enter a valid email";
                showErrorBorder(fieldSelectors[index]);
                errorField.style.display = "block";
                return false;
            }
        }
        else if (fieldSelectors[index].value === "") {
            showErrorBorder(fieldSelectors[index]);
            errorField.innerText = "Please fill out the required fields";
            errorField.style.display = "block";
            return false;
        }
    }
    return true;
}

function startResendTimer(resendContainer) {
    if (resendContainer.children.length === 2) {
        let resendInText = resendContainer.children[0];
        resendContainer.children[1].style.display = "none";
        resendInText.style.display = "block";
        let counterTimer = 30;
        resendInText.innerText = "Resend OTP in 00:30";
        window.counterInterval = setInterval(function () {
            counterTimer--;
            let counterString = counterTimer.toLocaleString('en-US',
                {
                    minimumIntegerDigits: 2,
                    useGrouping: false
                });
            resendInText.innerText = "Resend OTP in 00:" + counterString;
            if (counterTimer === 0) {
                resendInText.style.display = "none";
                resendContainer.children[1].style.display = "block";
                clearInterval(window.counterInterval);
            }
        }, 1000);
    }
}

// Create a Recaptcha verifier instance globally
if (RecaptchaSelector) {
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
        "recaptcha",
        {
            size: "invisible",
            callback: function (response) {
                hideElements([getElement("recaptcha")]);
            }
        }
    );
}
//////////////////////////////////////////////////////////


/*******************************************************************\
|                                                                   |
|                  OTHER COMMON METHODS                             |
|                                                                   |
\*******************************************************************/


function sendOTP(phoneNumber, successCallback, errorCallback) {
    var appVerifier = window.recaptchaVerifier;
    firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier)
        .then(function (confirmationResult) {
            window.confirmationResult = confirmationResult;
            successCallback();
        })
        .catch(function (error) {
            console.log(error);
            errorCallback(error);
        });
}

function getLocationData(callback) {
    $.getJSON('https://ipinfo.io', function (data) {
        callback && callback(data);
    })
}

function getLocationFromStorage(onFetch) {
    let locationData = JSON.parse(localStorage.getItem("locationData"));
    if (!locationData) {
        console.log("locationData",locationData);
        getLocationData(function (data) {
            locationData = {
                "country": data.country === "IN" ? "India" : data.country
            }
            localStorage.setItem("locationData", JSON.stringify(locationData));
            onFetch && onFetch(locationData);
        });
    }
    else {
        onFetch && onFetch(locationData);
    }

}

function getAllDomains(callback) {
    let url = apiBaseURL + "details/get-all-domains";
    getAPI(url, function (response) {
        if (response.status === 200) {
            callback(response.data);
        }
    }, function (error) {
        console.error("error getting domains");
    });
}

function getAllCompanies(callback) {
    let url = apiBaseURL + "details/get-all-companies";
    getAPI(url, function (response) {
        if (response.status === 200) {
            callback(response.data);
        }
    }, function (error) {
        console.error("error getting company list",error);
    });
}

function getPrice(country, package_id, callback) {
    let queryString = `?country=${encodeURIComponent(country)}&package=${encodeURIComponent(package_id)}`
    let url = apiBaseURL + "pricing/get-price" + queryString;
    getAPI(url, function (response) {
        if (response.status === 200) {
            callback(response.data);
        }
    }, function (error) {
        console.error("error getting Price");
    });
}

function checkUserProfile(callback) {
    let url = apiBaseURL + "user/check-user-profile-completion";
    getAPI(url, function (response) {
        if (response.status === 200) {
            var userExists = !!response.data
            callback(userExists);
        }
        else {
            callback(false);
        }
    }, function (error) {
        console.error("checkUser: ", error);
        callback(false);
    });
}

function checkUser(phoneNumber, callback) {
    let url = apiBaseURL + "details/check-user-exists?phone=" + encodeURIComponent(phoneNumber);
    getAPI(url, function (response) {
        if (response.status === 200) {
            var userExists = !!response.data
            callback(userExists);
        }
        else {
            callback(false);
        }
    }, function (error) {
        console.error("checkUser: ", error);
        callback(false)
    });
}

function login(code, successCallback, errorCallback) {
    credential = firebase.auth.PhoneAuthProvider.credential(window.confirmationResult.verificationId, code);
    firebase.auth().signInWithCredential(credential)
        .then(function (result) {
            console.log("trying to identify user",result);
            if (analytics) {
                console.log("identifying user");
                analytics.identify(result.user.email);
            }
            console.log("were you able to identify user?");
            successCallback(result);
        })
        .catch(function (error) {
            errorCallback(error);
        })
}

async function updateAccessToken() {
    if (verifiedUser) {
        accessToken = await verifiedUser.getIdToken().then(function (token) { return token });
        localStorage.setItem("ACCESS_TOKEN", accessToken);
        return accessToken;
    }
}

function addUserDetails(details, successCallback, errorCallback) {
    let url = apiBaseURL + "user/add-user-data"
    postAPI(url, details, successCallback, function (error) {
        console.error("addUserDetails: ", error);
        errorCallback(error);
    });
}


function createOrder(packageDetails, successCallback, errorCallback) {
    triggerPurchaseInitiation(packageDetails);
    packageDetails["version"] = "default";
    packageDetails["package_type"] = currentPackageType;
    let url = apiBaseURL + "user/create-order/v2";
    postAPI(url, packageDetails, function (response) {
        if (response.status === 200) {
            successCallback(response.data);
        }
        else {
            errorCallback(response);
        }
    }, function (error) {
        console.error("createOrder: ", error);
        errorCallback(error);
    });
}

function updateOrder(orderObject, successCallback, errorCallback) {
    let url = apiBaseURL + "user/verify-payment";
    postAPI(url, orderObject, successCallback, function (error) {
        console.error("updateOrder: ", error);
        errorCallback(error);
    });
}

function capitalize(stringValue) {
    return stringValue.toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function isValidEmail(email) {
    return (/^\w+([^@]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))
}

function redirect(path, replace = true) {
    let redirectPath = path ? path : "/";
    if (replace) { // we don't want current tab in the history (e.g no need to have sign-in, checkout in history)
        window.location.replace(redirectPath);
    }
    else {
        window.location.assign(redirectPath);
    }
}

function redirectTo(path) {
    let redirectPath = localStorage.getItem('REDIRECT_TO');
    localStorage.removeItem('REDIRECT_TO');
    if (redirectPath) {
        redirect(redirectPath);
    }
    else if (!!path) {
        redirect(path);
    }
    else {
        redirect("/");
    }
}

function redirectToDashboard() {
    redirectTo("/dashboard");
}

var isValidLinkedInURL = function (url) {
    return /((|https?:\/\/)?((www|\w\w)\.)?linkedin\.com\/)((([\w]{2,3})?)|([^\/]+\/(([\w|\d-&#?=])+\/?){1,}))$/.test(url)
}

var privatePages = [
    '/dashboard',
    '/onboarding',
    '/mentor-onboarding',
    '/candidate-onboarding',
    '/welcome'
];

var publicPages = [
    '/login',
    '/sign-in'
];

var currencyMap = {
    INR: '₹',
    USD: '$'
}

var packageMap = {
    'mock-interview': 'Mock Interview',
    'interview-preparation-bundle': 'Interview Preparation Program',
    'mock-interview-bundle': 'Mock Interview Bundle',
    'interview-preparation-bundle-trial': 'Planning Session',
    'consulting-session': 'Consulting Session',
    'consulting-session-trial': "Interview Preparation Program Trial"
}

// need to set Initial component displays
var setInitialDisplays = function () {
    if (accessToken) {
        // hideElements([menuLoginButton]);
        hideElements(menuLogin);
        if (!isMobile) {
            showElements([dashboardButton], "flex");
        }
        else {
            hideElements([dashboardButton]);
        }
        (localUserName && userName) ?
            (userName.innerHTML = "Welcome " + localUserName)
            : userName && userName.classList.add('hide');
    }
    else {
        hideElements([dashboardButton]);
        // showElements([menuLoginButton]);
        showElements(menuLogin);
    }
}
setInitialDisplays();
getLocationFromStorage(function (locationData) {
    userLocation = locationData
});

function matchMaker(params, data) {
    if ($.trim(params.term) === '') {
        return data;
    }
    keywords = (params.term).split(" ");
    for (var i = 0; i < keywords.length; i++) {
        if (((data.text).toUpperCase()).indexOf((keywords[i]).toUpperCase()) == -1)
            return null;
    }
    return data;
};



/*******************************************************************\
|                                                                   |
|                       ON LOGIN VERIFIED                           |
|                                                                   |
\*******************************************************************/

firebase.auth().onAuthStateChanged(function (user) {
    var logoutUser = function (e) {
        e.preventDefault();
        signOutUser();
    }

    if (user) {
        // User is signed in.
        verifiedUser = user;
        console.log('User is logged in!');
        //console.log('User First time logged on',user.metadata.creationTime);
        console.log('phone: ' + user.phoneNumber);
        console.log('UID: ' + user.uid);
        updateAccessToken();
        // hideElements([menuLoginButton]);
        hideElements(menuLogin);
        if (!isMobile) {
            showElements([dashboardButton], "flex");
        }
        else {
            hideElements([dashboardButton]);
        }

        //changing the footer login text to dashboard
        if (footerLogin) {
            footerLogin.innerText = "Dashboard";
        }
    } else {
        // User is signed out.
        if (privatePages.includes(currentPath)) {
            window.location.replace('/');
        } else {
            // showElements([menuLoginButton]);
            showElements(menuLogin);
            hideElements([dashboardButton]);
            console.log('No user is logged in');
        }
    }
});

let lastScrollTop = 0;

let isNavbarChangeNeeded = true;



if (downloadEbookButton) {
    downloadEbookButton.onclick = function () {
        triggerEvent('Ebook Downloaded');
    }
}


/*******************************************************************\
|                                                                   |
|                   SIGN IN LOGIC                                   |
|                                                                   |
\*******************************************************************/

// Selectors
var signInTitleSelector = document.getElementById('sign-in-title');
var countryCodeSelector = document.getElementById('country-code');
var phoneNumberSelector = document.getElementById('phone');
var editPhoneSelector = document.getElementById('edit-phone');
var recaptchaSelector = document.getElementById('recaptcha');
var otpFieldSelector = document.getElementById('otp-field');
var resendOTPSelector = document.getElementById('resend-otp');
var resendOTPContainerSelector = document.getElementById('resend-otp-container');
var userNameSelector = document.getElementById('user-name');
var userEmailSelector = document.getElementById('user-email');
var acceptTermsSelector = document.getElementById('accept-terms');
var acceptSubscriptionSelector = document.getElementById('accept-subscription');
var formButtonSelector = document.getElementById('form-button');
var formSubmitButtonSelector = document.getElementById('form-button-hidden');
var errorFieldSelector = document.getElementById('error-message');

var code = "+91";
var otpSent = false;
var userExists = true;
var webflowFormSubmitted = false;

function resetUI(resetUser = true) {
    signInTitleSelector.innerText = "Login";
    removeButtonLoading(formButtonSelector, "Send OTP");
    hideElements([errorFieldSelector, editPhoneSelector, recaptchaSelector, otpFieldSelector, resendOTPContainerSelector, userNameSelector, userEmailSelector, acceptTermsSelector, acceptSubscriptionSelector]);
    otpFieldSelector.value = "";
    otpSent = false;
    if (resetUser) userExists = true;
}

function onLoginFailed(error) {
    if (verifiedUser) {
        signOutWithoutReload();
    }
    if (error.code === "auth/invalid-verification-code") {
        errorFieldSelector.innerText = "Invalid OTP! Please check your Phone Number and OTP Entered."
    }
    else if (error.code && error.message) {
        errorFieldSelector.innerText = error.message;
    }
    else {
        console.error(error);
        errorFieldSelector.innerText = "Something went wrong. Please try again."
    }
    showElements([errorFieldSelector]);
    removeButtonLoading(formButtonSelector, "Verify OTP");
}

function verifyAndSendOTP(phoneNumber) {
    console.log(phoneNumber);
    localStorage.setItem("Phone", phoneNumber);
    formButtonSelector.disabled = true;
    setButtonLoading(formButtonSelector, "Sending OTP")
    showElements([recaptchaSelector]);

    var onOTPSent = function () {
        const properties = {
            "phone_number":phoneNumber,
            "button_name":currentButtonName,
        };
        sendAnalyticsToSegment.track("OTP Sent",properties);
        showElements([otpFieldSelector, resendOTPContainerSelector]);
        startResendTimer(resendOTPContainerSelector);
        otpSent = true;
        removeButtonLoading(formButtonSelector, "Verify OTP");
        if (userExists) {
            signInTitleSelector.innerText = "Enter OTP";
            formButtonSelector.disabled = false;
        }
        else {
            signInTitleSelector.innerText = "Register";
            formButtonSelector.disabled = true;
            showElements([userNameSelector, userEmailSelector, acceptTermsSelector, acceptSubscriptionSelector]);
        }
    }

    var onOTPSendingFailed = function (error) {
        if (error.code === "auth/invalid-phone-number") {
            errorFieldSelector.innerText = "Invalid Phone Number! Please check the Phone Number Entered."
        }
        else {
            errorFieldSelector.innerText = "Something went wrong. Please try again."
        }
        showElements([errorFieldSelector])
        formButtonSelector.disabled = false;
        removeButtonLoading(formButtonSelector, "Send OTP");
        otpSent = false;
    }
    sendOTP(phoneNumber, onOTPSent, onOTPSendingFailed);
}

resendOTPSelector.addEventListener('click', function (event) {
    event.preventDefault();
    let resetUser = false;
    resetUI(resetUser);
    let phoneNumber = phoneFormatter.value; //countryCodeSelector.value + phoneNumberSelector.value;
    if (phoneNumber === "") return;
    verifyAndSendOTP(phoneNumber);
});

editPhoneSelector.addEventListener('click', function () {
    resetUI();
    phoneNumberSelector.disabled = false;
});

phoneFormatter.addEventListener('change', function () {
    resetUI();
    phoneNumberSelector.disabled = false;
});

// This function runs when the 'form-button' is clicked
// sends otp to the phone number
// Verifies the OTP and registers a User when not registered.
formButtonSelector.addEventListener('click', function (e) {
    event.preventDefault();
    if (formButtonSelector.classList.contains("loading")) {
        return;
    }
    // code = countryCodeSelector.value;
    hideElements([errorFieldSelector]);
    if (!checkFieldsAndShowError([phoneNumberSelector], errorFieldSelector)) {
        formButtonSelector.disabled = false;
        removeButtonLoading(formButtonSelector, "Send OTP");
        otpSent = false;
        return;
    }
    let phoneNumber = phoneFormatter.value; //code + phoneNumberSelector.value;
    if (phoneNumber === "") return;
    if (!otpSent) {
        var onCheckUserResponse = function (exists) {
            userExists = exists;
            if (otpSent) {
                if (userExists) {
                    signInTitleSelector.innerText = "Enter OTP";
                    formButtonSelector.disabled = false;
                }
                else {
                    signInTitleSelector.innerText = "Register";
                    formButtonSelector.disabled = true;
                    showElements([userNameSelector, userEmailSelector, acceptTermsSelector, acceptSubscriptionSelector]);
                }
            }
        }
        showElements([editPhoneSelector]);
        phoneNumberSelector.disabled = true;
        checkUser(phoneNumber, onCheckUserResponse);
        verifyAndSendOTP(phoneNumber);
    }
    else {
        setButtonLoading(formButtonSelector, "Verifying")
        let otp = otpFieldSelector.value;
        hideElements([errorFieldSelector]);
        if (userExists) {
            let validFields = checkFieldsAndShowError([otpFieldSelector], errorFieldSelector);
            if (validFields) {
                function onLogin() {

                    // login Analytics
                    signInType = "login"; // login signInType
                    if(signInType === "login"){
                        let properties = {
                            'source': 'sign-in',
                            'method': 'otp',
                            'button_name':currentButtonName
                        }

                        if(localStorage.getItem("hasVisitedBefore") !== null){
                            var FirstWebsitedVisitedOn = new Date(JSON.parse(localStorage.getItem("hasVisitedBefore"))["visited-date"])
                            // var creationDate = new Date(verifiedUser.metadata.creationTime);
                            // if(creationDate < FirstWebsitedVisitedOn){
                            //     properties = {
                            //         ...properties,
                            //         ...JSON.parse(localStorage.getItem("hasVisitedBefore"))
                            //     }
                            //     sendAnalyticsToSegment.identify(verifiedUser.email,properties)
                            // }  
                        }
                        sendAnalyticsToSegment.track("Login Completed",properties);
                    }
                    triggerEvent('Signed In', {
                        'source': 'sign-in',
                        'method': 'phone',
                        'country_code': `+${iti.getSelectedCountryData().dialCode}`
                    });
                    removeButtonLoading(formButtonSelector, "Verified");
                    if (customOnSignIn) {
                        customOnSignInMethod();
                    }
                    else {
                        // redirectToDashboard();
                        closeLoginModal();
                    }
                }
                login(otp, onLogin, onLoginFailed);
            }
            else {
                removeButtonLoading(formButtonSelector, "Verify OTP");
            }
        }
        else {        
            let validFields = checkFieldsAndShowError([otpFieldSelector, userNameSelector, userEmailSelector, acceptTermsSelector], errorFieldSelector)
            if (validFields) {
                async function onLogin(result) {
                    verifiedUser = result.user;
                    let userNameValue = capitalize(userNameSelector.value);
                    // updating auth user with name and email
                    try {
                        var redirectToDashbaordOnSignup = function () {
                            if (customOnSignIn) {
                                customOnSignInMethod();
                            }
                            else {
                                setTimeout(() => {
                                    // redirectToDashboard();
                                    closeLoginModal();
                                }, 1000);
                            }
                        }
                        verifiedUser.updateEmail(userEmailSelector.value.toLowerCase()).then(function () {
                            // verifiedUser.reauthenticateWithCredential(credential).then(function() {
                            verifiedUser.updateProfile({
                                displayName: userNameValue
                            }).then(async function () {
                                // add User Data to backend
                                await updateAccessToken();

                                if (analytics) {
                                    analytics.identify(userEmailSelector.value.toLowerCase(), {
                                        name: userNameValue,
                                        email: userEmailSelector.value.toLowerCase(),
                                        phone: phoneNumber
                                    });
                                }
                                // SignUp Analytics
                                signInType = 'register';
                                if(signInType === 'register'){
                                    let properties = {
                                        name: userNameValue,
                                        email: userEmailSelector.value.toLowerCase(),
                                        phone: phoneNumber,
                                        button_name:currentButtonName,
                                        method:"otp",
                                        ...JSON.parse(localStorage.getItem("hasVisitedBefore"))
                                    }
                                    sendAnalyticsToSegment.identify(properties.email,properties);
                                    sendAnalyticsToSegment.track("Signup Completed",properties);
                                }

                                triggerEvent('Signed Up', {
                                    'source': 'sign-in',
                                    'method': 'phone',
                                    'country_code': `+${iti.getSelectedCountryData().dialCode}`,
                                    'subscribe_newsletter': acceptSubscriptionSelector.checked
                                });


                                addUserDetails({
                                    name: userNameValue,
                                    email: userEmailSelector.value.toLowerCase(),
                                    phoneNumber: phoneNumber,
                                    subscribed: acceptSubscriptionSelector.checked
                                }, redirectToDashbaordOnSignup, redirectToDashbaordOnSignup)
                            })
                                .catch(onLoginFailed)
                            // }).catch(onLoginFailed)
                        }).catch(onLoginFailed)
                    }
                    catch (error) {
                        console.error(error);
                        onLoginFailed(error);
                    }
                }
                login(otp, onLogin, onLoginFailed);
            }
            else {
                removeButtonLoading(formButtonSelector, "Verify OTP");
            }
        }
    }
});



// Intl-tel-input -->
var input = getElement("phone"),
    dialCode = getElement(".dialCode"),
    errorMsg = getElement("error-msg"),
    validMsg = getElement("valid-msg");

var iti = intlTelInput(input, { initialCountry: "in", placeholderNumberType: 'FIXED_LINE', separateDialCode: true, });
var errorMap = ["Invalid number", "Invalid country code", "Too short", "Too long", "Invalid number"];

var reset = function (event) {
    input.classList.remove("error");
    errorMsg.innerHTML = "";
    errorMsg.classList.add("hide");
    validMsg.classList.add("hide");
    if (event && event.key === "Enter") {
        // Cancel the default action, if needed
        event.preventDefault();
        getPhoneNumberFromIti(function () {
            formButtonSelector.click()
        });
    }
};

var getPhoneNumberFromIti = function (onCorrectNumber) {
    reset();
    if (input.value.trim()) {
        if (iti.isValidNumber()) {
            phoneFormatter.value = iti.getNumber();
            if (onCorrectNumber) {
                onCorrectNumber();
            }
            // validMsg.classList.remove("hide");
        } else {
            input.classList.add("error");
            var errorCode = iti.getValidationError();
            errorMsg.innerHTML = errorMap[errorCode];
            errorMsg.classList.remove("hide");
        }
    }
}

input.addEventListener('blur', function () {
    getPhoneNumberFromIti()
});

input.addEventListener('change', reset);
input.addEventListener('keyup', reset);



function onPaymentFailure(place) {
    console.error("Payment failed at", place);
    const properties = {
        "button_name":currentButtonName,
        "item_id":currentSku,
        "value": +pkDetails.totalPrice,
        "package_name":currentPackageId,
        "package_type":currentPackageType,
        "coupon_code": currentCoupon,
        "package_amount":+pkDetails.totalPrice,
        ecommerce: {
          currency: pkDetails.currency,
          value: +pkDetails.totalPrice,
          coupon: pkDetails.coupon,
          items:[
            {
              "item_id":currentSku,
              "item_name":currentPackageId,
              "item_variant": currentMentorExperience,
              "coupon":pkDetails.coupon,
              "currency":pkDetails.currency,
              "addGST": pkDetails.addGST,
              "country": pkDetails.country,
              "designation": pkDetails.designation,
              "domain": pkDetails.domain,
              "domain_id": pkDetails.domain_id,
              "experience": pkDetails.experience,
              "experience_id": pkDetails.experience_id,
              "mentor_instructions": pkDetails.mentor_instructions,
              "package": pkDetails.package,
              "package_type": pkDetails.package_type,
              "preferred_mentor_experience": pkDetails.preferred_mentor_experience,
              "price": pkDetails.price,
              "target_companies": pkDetails.target_companies,
              "target_role": pkDetails.target_role,
              "value": +pkDetails.totalPrice,
              "upcoming_interview": pkDetails.upcoming_interview,
              "version": pkDetails.version
            }
          ]
        }
      }
    sendAnalyticsToSegment.track("Payment Failed",properties);
    hideElements([orderLoader]);
    showElements([orderOverlay, orderErrorSelector]);
}


function closeCheckoutModal() {
    hideElements([checkoutModal])
}

function showLoginModal() {
    if (!verifiedUser) {
        showElements([loginModal], "flex");
        const properties = {
            "button_name": currentButtonName,
        }
        sendAnalyticsToSegment.track("Login/Signup Started",properties);
    }
}

function closeLoginModal() {
    hideElements([loginModal]);
}


for(let i=0;i<menuLogin.length;i++){
    menuLogin[i].onclick = function (event) {
        currentButtonName = menuLogin[i].getAttribute("button-name");
        const properties = {
            "button_name": currentButtonName,
        }
        sendAnalyticsToSegment.track("Login/Signup Button Clicked",properties);
        // sendAnalyticsToSegment.track("Login/Signup Started",properties);
        event.preventDefault();
        event.stopPropagation();
        event.returnValue = false;
        showLoginModal();
    }
}


let bookSessionMethod = function () {
    triggerEvent('Sales Session Booking Started', {});
}

//intercombot launch
let bookSessionButtons = document.querySelectorAll(".intercom-bot")
for (let i = 0; i < bookSessionButtons.length; i++) {
    bookSessionButtons[i].onclick = bookSessionMethod;
}

var loginLink01 = getElement("login-link-01");
if (loginLink01) {
    loginLink01.onclick = function (event) {
        event.preventDefault();
        event.stopPropagation();
        event.returnValue = false;
        showLoginModal();
    }
}



if (footerLogin) {
    footerLogin.onclick = function (event) {
        event.preventDefault();
        if (verifiedUser) {
            redirect('/dashboard');
        }
        else {
            showLoginModal();
        }
    }
}

dashboardButton.addEventListener("click", (event) => {
    var properties = {
        "button_name": dashboardButton.getAttribute("button-name")
    };
    if(event.currentTarget.innerText.includes("Dashboard")){
        sendAnalyticsToSegment.track("Dashboard Opened",properties);
    }else{
        sendAnalyticsToSegment.track("Logout",properties);
    }
});

function onReady() {
    let params = Object.fromEntries(
        new URLSearchParams(window.location.search).entries()
      );
    let properties = {
        ...params,
        "referrer":document.referrer
    };
    sendAnalyticsToSegment.track("Page Visit",properties);
    if (localStorage.getItem("hasVisitedBefore") === null) {
        sendAnalyticsToSegment.track("First Website Visit",properties);
        properties["hasVisitedBefore"] = true;
        properties["visited-date"] = new Date();
        localStorage.setItem("hasVisitedBefore", JSON.stringify(properties));
    }
}

onReady();
