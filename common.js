try {
    document.domain = 'preplaced.in';
}
catch (e) { }
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
var checkoutModal = getElement("checkout-modal");
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

// const interval = setInterval(() => {
//   if (window.Intercom.booted) {
//     // Intercom is booted!
//     try {
//         if(isMobileDevice){
//             Intercom('update', {
//                 "hide_default_launcher": true
//             });
//         }
//     } catch (error) {
//         console.log(error);
//     }
//     clearInterval(interval);
//     clearTimeout(timeout);
//   }
// }, 100);

// timeout();

// setTimeout(()=>{
//     try {
//         if(window.Intercom.booted && (isMobile || isMobileDevice)){
//             Intercom('update', {
//                 "hide_default_launcher": true
//             });
//         }
//     } catch (error) {
//         console.log(error);
//     }
// }, 6000)


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
        analytics.track('New Website Session', pageVisitParams)
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
    if (analytics) {
        analytics.track(eventName, fbParams);
    }

    eventName = eventName[0].toUpperCase() + eventName.substring(1);
    fbq('track', eventName, fbParams);
}

function triggerPurchase(packageDetails) {
    packageDetails['item_name'] = packageMap[packageDetails.package_id];
    packageDetails['item_id'] = packageDetails.package_id;
    let eventParams = {
        'coupon': packageDetails.coupon,
        'currency': packageDetails.currency,
        'transaction_id': packageDetails.order_id,
        'value': packageDetails.totalPrice,
        'items': packageDetails,
        'item_name': packageMap[packageDetails.package_id],
        'item_id': packageDetails.package_id,
        'experience': packageDetails.experience,
        'domain': packageDetails.domain,
        'designation': packageDetails.designation,
        'target_companies': packageDetails.target_companies,
        'logged_in': !!accessToken,
    }
    triggerEvent('Payment Completed', eventParams);
}

function triggerPurchaseInitiation(packageDetails) {
    packageDetails['item_name'] = packageMap[packageDetails.package_id];
    packageDetails['item_id'] = packageDetails.package_id;
    let eventParams = {
        'coupon': packageDetails.coupon,
        'currency': packageDetails.currency,
        'value': packageDetails.totalPrice,
        'items': packageDetails,
        'item_name': packageMap[packageDetails.package_id],
        'item_id': packageDetails.package_id,
        'experience': packageDetails.experience,
        'domain': packageDetails.domain,
        'designation': packageDetails.designation,
        'target_companies': packageDetails.target_companies,
        'logged_in': !!accessToken,
    }
    triggerEvent('Payment Started', eventParams);
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
    _LTracker.push({
        requestData: data,
        api: api,
        error: error,
        errorCode: errorCode,
        errorText: errorText,
        user: verifiedUser ? verifiedUser.displayName : "notSignedIn",
    })
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
        console.error("error getting company list");
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
            console.log("trying to identify user");
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

function checkCoupon(coupon, package_id, successCallback, errorCallback) {
    triggerEvent('Coupon Applied', { 'coupon': coupon });
    let url = apiBaseURL + `pricing/validate-coupon/${coupon}?package=${package_id}`;
    getAPI(url, function (response) {
        if (response.status === 200) {
            var discount = response.data
            successCallback(discount);
        }
        else {
            errorCallback(false);
        }
    }, function (error) {
        console.error("checkCoupon: ", error);
        errorCallback(false)
    })
}

function createOrder(packageDetails, successCallback, errorCallback) {
    triggerPurchaseInitiation(packageDetails);
    packageDetails["version"] = "default";
    packageDetails["package_type"] = packageMap[pkDetails.package_id];
    let url = apiBaseURL + "user/create-order";
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

let debounceTimer;
let timerId;
var throttle = function (func, delay) {
    // If setTimeout is already scheduled, no need to do anything
    if (timerId) {
        return
    }
    // Schedule a setTimeout after delay seconds
    timerId = setTimeout(function () {
        func()

        // Once setTimeout function execution is finished, timerId = undefined so that in <br>
        // the next scroll event function execution can be scheduled by the setTimeout
        timerId = undefined;
    }, delay);
}
const debounce = (func, delay) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func(), delay)
}

let lastScrollTop = 0;

let isNavbarChangeNeeded = true;

// function changeNavbarDisplay() {
//     if (isNavbarChangeNeeded){
//         let currentScrollTop = document.body.scrollTop || document.documentElement.scrollTop;
//         if (currentScrollTop > lastScrollTop){ //scroll down
//             navbarSelector.classList.remove("popNav");
//         }
//         else if (currentScrollTop < lastScrollTop - 50){ //scroll up
//             if (currentScrollTop > 105) {
//                 navbarSelector.classList.add("popNav");
//             } else {
//                 navbarSelector.classList.remove("popNav");
//             }
//         }
//         lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
//     }
// }

// if (navbarSelector){ 
//     window.onscroll = function() {
//         throttle(function(){
//             changeNavbarDisplay();
//         },200);
//     }
// }


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
        console.log("otp Sent");
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
/////////////////////////////////////////////////////////////////////



/*******************************************************************\
|                                                                   |
|                   CHECKOUT LOGIC                                  |
|                                                                   |
\*******************************************************************/
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
    totalPriceSelector,
    orderOverlay,
    orderErrorSelector,
    orderLoader,
    hideOverlay,
    gstContainer,
    gstLabel,
    gstPriceDiv,
    closeCheckout
] = getElements([
    'change-domain',
    'domain-title',
    'experience-title',
    'package-title',
    'coupon-field',
    'coupon-submit',
    'coupon-success',
    'coupon-error',
    'total-amount-text',
    'pay-now-button',
    'user-details-section',
    'verified-user-name',
    'verified-user-phone',
    'verified-user-email',
    'pay-now-overlay',
    'pay-now-wrapper',
    'package-price',
    'coupon-discount-price',
    'total-price',
    'order-overlay',
    'order-error',
    'order-loader',
    'hide-overlay',
    'gst-addition-container',
    'gst-label',
    'gst-price',
    'close-checkout'
])

let pkDetails = JSON.parse(localStorage.getItem('packageDetails'));

let totalPrice = 0;
let coupon = "";
let gstAdded = (pkDetails && pkDetails.addGST) || false;
let gstPrice = 0;

function updateCheckoutValuesOnShown() {
    pkDetails = JSON.parse(localStorage.getItem('packageDetails'));
    totalPrice = 0;
    coupon = "";
    gstAdded = pkDetails.addGST || false;
    gstPrice = 0;
    updateUI();
}


function handlePaymentSectionUI() {
    updatePaymentInfo();
    packagePriceSelector.innerText = `${currencyMap[pkDetails.currency]} ${pkDetails.price}`;
    discountPriceSelector.innerText = `${currencyMap[pkDetails.currency]} 0`;
    hideElements([couponErrorSelector, couponSuccessSelector]);
    if (gstAdded) {
        if (pkDetails.currency !== "INR") {
            gstLabel.innerText = "IGST (18%)";
        }
        // showElements([gstContainer]);
    }
    else {
        hideElements([gstContainer]);
    }
    if (accessToken) {
        showElements([payNowWrapper]);
        hideElements([payNowOverlay]);
    } else {
        hideElements([payNowWrapper]);
    }
}

function updatePaymentInfo(couponDiscount) {
    let packagePrice = pkDetails.price;
    let discount = couponDiscount || 0;
    let discountedPrice = Math.ceil(discount * packagePrice).toFixed(2); // fixed to 2 decimal
    let priceAfterDiscount = packagePrice - discountedPrice;
    gstPrice = (gstAdded ? priceAfterDiscount * 0.18 : 0);
    totalPrice = (priceAfterDiscount + gstPrice).toFixed(2);
    pkDetails['totalPrice'] = totalPrice;
    gstPriceDiv.innerText = `${currencyMap[pkDetails.currency]} ${gstPrice.toFixed(2)} `;
    discountPriceSelector.innerText = `- ${currencyMap[pkDetails.currency]} ${discountedPrice}`
    totalPriceSelector.innerText = `${currencyMap[pkDetails.currency]} ${totalPrice}`;
    if (discount) {
        couponSuccessSelector.innerText = `Coupon Applied! You are saving ${currencyMap[pkDetails.currency]} ${discountedPrice} `;
    }
}

function updateUI() {
    domainTitleSelector.innerText = pkDetails.domain;
    packageTitleSelector.innerText = packageMap[pkDetails.package_id];
    experienceTitleSelector.innerText = pkDetails.experience !== "Fresher" ? pkDetails.experience + " Experience" : "Fresher";
    // handleUserDetailsUI();
    handlePaymentSectionUI();
}



function onCouponApplied(discount) {
    updatePaymentInfo(discount);
    showElements([couponSuccessSelector]);
    couponSubmitSelector.innerText = "Redeem";
}

function onInvalidCoupon() {
    showElements([couponErrorSelector]);
    couponSubmitSelector.innerText = "Redeem";
    updatePaymentInfo();
    coupon = "";
    // discountPriceSelector.innerText=`${currencyMap[pkDetails.currency]} 0`;
    // totalPriceSelector.innerText=`${currencyMap[pkDetails.currency]} ${totalPrice}`;
}

changeDomainSelector.addEventListener('click', function (e) {
    e.preventDefault();
    // redirect("/"+pkDetails.package_id);
    closeCheckoutModal();
    if (callAfterCheckout) {
        afterCheckoutClosedMethod && afterCheckoutClosedMethod();
    }

})

closeCheckout.addEventListener('click', function (e) {
    e.preventDefault();
    // redirect("/"+pkDetails.package_id);
    closeCheckoutModal();
})

couponSubmitSelector.addEventListener('click', function (e) {
    e.preventDefault();
    couponSubmitSelector.innerText = "Checking";
    hideElements([couponErrorSelector, couponSuccessSelector]);
    coupon = couponSelector.value.toUpperCase().trim();
    if (coupon) {
        checkCoupon(coupon, pkDetails.package_id, onCouponApplied, onInvalidCoupon);
    }
    else {
        couponSubmitSelector.innerText = "Redeem";
        updatePaymentInfo();
    }
});

function onPaymentFailure(place) {
    console.error("Payment failed at", place);
    hideElements([orderLoader]);
    showElements([orderOverlay, orderErrorSelector]);
}

hideOverlay.addEventListener('click', function (e) {
    hideElements([orderOverlay, orderErrorSelector]);
});

payNowButtonSelector.addEventListener('click', function (e) {
    e.preventDefault();
    hideElements([orderErrorSelector]);
    showElements([orderOverlay, orderLoader]);
    if (verifiedUser && verifiedUser.phoneNumber && verifiedUser.displayName && verifiedUser.email) {
        function onPaymentComplete(response) {
            hideElements([orderErrorSelector]);
            showElements([orderOverlay, orderLoader]);
            pkDetails['totalPrice'] = totalPrice;
            pkDetails['order_id'] = response.razorpay_order_id;
            triggerPurchase(pkDetails);
            function goToThankYouPage() {
                // redirect('/thankyou');   
                hideElements([orderOverlay, orderLoader, checkoutModal]);
                showElements([thankyouModal], "flex");
                var redirectingText = getElement('redirecting-text');
                let count = 10;
                let initialText = redirectingText.innerText;
                redirectingText.innerText = initialText + ' ' + count-- + ' secs'
                setInterval(() => {
                    redirectingText.innerText = initialText + ' ' + count + (count > 1 ? ' secs' : ' sec');
                    count--;
                    if (count === 0) {
                        redirect('/dashboard', true);
                    }
                }, 1000);
            }
            updateOrder({
                "order_id": response.razorpay_order_id,
                "payment_id": response.razorpay_payment_id || "",
                "signature": response.razorpay_signature || ""
            }, goToThankYouPage, function () { onPaymentFailure("update-order") });
        }
        function onOrderCreated(responseData) {
            let order = responseData.razorpay_order_object;
            if (!!order) {
                var options = {
                    "key": responseData.key || "rzp_test_sPcDgJ2yGLxdzT", // Enter the Key ID generated from the Dashboard
                    "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
                    "currency": order.currency,
                    "name": "Preplaced Education Pvt. Ltd",
                    "description": packageMap[pkDetails.package_id],
                    "order_id": order.id,
                    "handler": function (response) {
                        onPaymentComplete(response);
                    },
                    "prefill": {
                        "name": verifiedUser.displayName,
                        "email": verifiedUser.email,
                        "contact": verifiedUser.phoneNumber
                    },
                    "notes": {
                        "Package": `${packageMap[pkDetails.package_id]}`,
                        "Domain": responseData.Domain
                    }
                };
                var rzp1 = new Razorpay(options);
                rzp1.on('payment.failed', function (response) {
                    onPaymentFailure("razorpay");
                    console.error("razorpay_error:", response.error);
                });
                hideElements([orderOverlay, orderErrorSelector]);
                rzp1.open();
            }
            else {
                onPaymentComplete({
                    'razorpay_order_id': `${responseData.orderId}`
                })
            }
        }

        pkDetails["coupon"] = coupon;
        createOrder(pkDetails, onOrderCreated, function () { onPaymentFailure("create-order") });
    }
});

///////////////////////////////////////////////////////////////

function closeCheckoutModal() {
    hideElements([checkoutModal])
}

function showLoginModal() {
    if (!verifiedUser) {
        showElements([loginModal], "flex");
    }
}

function closeLoginModal() {
    hideElements([loginModal]);
}

// if (menuLoginButton) {
//     menuLoginButton.onclick = function (event) {
//         event.preventDefault();
//         event.stopPropagation();
//         event.returnValue = false;
//         showLoginModal();
//     }
// }

// menuLogin.forEach((logBtn)=>{
//     logBtn.onclick = function (event) {
//         event.preventDefault();
//         event.stopPropagation();
//         event.returnValue = false;
//         showLoginModal();
//     }
// })

for(let i=0;i<menuLogin.length;i++){
    menuLogin[i].onclick = function (event) {
        event.preventDefault();
        event.stopPropagation();
        event.returnValue = false;
        showLoginModal();
    }
}


let bookSessionMethod = function () {
    triggerEvent('Sales Session Booking Started', {});
    //Intercom('trackEvent', 'Sales Session Booking Started');
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

closeLoginModalIcon.onclick = function (event) {
    event.preventDefault();
    event.stopPropagation();
    closeLoginModal();
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