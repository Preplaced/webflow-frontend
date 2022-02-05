
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
  
  function resetUI(resetUser=true) {
    signInTitleSelector.innerText = "Login";
    removeButtonLoading(formButtonSelector, "Send OTP");
    hideElements([errorFieldSelector, editPhoneSelector, recaptchaSelector, otpFieldSelector, resendOTPContainerSelector, userNameSelector, userEmailSelector, acceptTermsSelector, acceptSubscriptionSelector]);
    otpFieldSelector.value = "";
    otpSent = false;
    if (resetUser) userExists = true;
  }

	// countryCodeSelector.addEventListener('change', function(e){
  // 	e.preventDefault();
  //   code = countryCodeSelector.value;
  //   resetUI();
  // })

  function onLoginFailed(error) {
    if (verifiedUser){
        signOutWithoutReload();
    }
    if (error.code === "auth/invalid-verification-code"){
      errorFieldSelector.innerText = "Invalid OTP! Please check your Phone Number and OTP Entered."
    }
    else if (error.code && error.message) {
      errorFieldSelector.innerText = error.message;
    }
    else{
      console.error(error);
      errorFieldSelector.innerText = "Something went wrong. Please try again."
    }
    showElements([errorFieldSelector]);
    removeButtonLoading(formButtonSelector, "Verify OTP");
  }

  function verifyAndSendOTP(phoneNumber){
    console.log(phoneNumber);
    localStorage.setItem("Phone", phoneNumber);
    formButtonSelector.disabled = true;
    setButtonLoading(formButtonSelector, "Sending OTP")
    showElements([recaptchaSelector]);

    var onOTPSent = function() {
      console.log("otp Sent");
      showElements([otpFieldSelector, resendOTPContainerSelector]);
      startResendTimer(resendOTPContainerSelector);
      otpSent = true;
      removeButtonLoading(formButtonSelector, "Verify OTP");
      if(userExists){
        signInTitleSelector.innerText = "Enter OTP";
        formButtonSelector.disabled = false;
      }
      else{
        signInTitleSelector.innerText = "Register";
        formButtonSelector.disabled=true;
        showElements([userNameSelector, userEmailSelector, acceptTermsSelector, acceptSubscriptionSelector]);
      }
    }

    var onOTPSendingFailed = function(error) {
      if (error.code === "auth/invalid-phone-number"){
        errorFieldSelector.innerText = "Invalid Phone Number! Please check the Phone Number Entered."
      }
      else{
        errorFieldSelector.innerText = "Something went wrong. Please try again."
      }
      showElements([errorFieldSelector])
      formButtonSelector.disabled = false;
      removeButtonLoading(formButtonSelector, "Send OTP");
      otpSent = false;
    }    
    sendOTP(phoneNumber, onOTPSent, onOTPSendingFailed);
  }

  resendOTPSelector.addEventListener('click', function(event) {
    event.preventDefault();
    let resetUser = false;
    resetUI(resetUser);
    let phoneNumber = phoneFormatter.value; //countryCodeSelector.value + phoneNumberSelector.value;
    if (phoneNumber === "") return;
    verifyAndSendOTP(phoneNumber);
  });

  editPhoneSelector.addEventListener('click', function(){
    resetUI();
    phoneNumberSelector.disabled = false;
  });

  phoneFormatter.addEventListener('change', function(){
    resetUI();
    phoneNumberSelector.disabled = false;
  });

  // This function runs when the 'form-button' is clicked
  // sends otp to the phone number
  // Verifies the OTP and registers a User when not registered.
  formButtonSelector.addEventListener('click',function(e){
    event.preventDefault();
    if (formButtonSelector.classList.contains("loading")){
      return;
    }
    // code = countryCodeSelector.value;
    hideElements([errorFieldSelector]);
    if (!checkFieldsAndShowError([phoneNumberSelector], errorFieldSelector)){
      formButtonSelector.disabled = false;
      removeButtonLoading(formButtonSelector, "Send OTP");
      otpSent = false;
      return;
    }
    let phoneNumber = phoneFormatter.value; //code + phoneNumberSelector.value;
    if (phoneNumber === "") return;
    if (!otpSent){
      var onCheckUserResponse = function(exists) {
        userExists = exists;
        if (otpSent){
          if(userExists){
            signInTitleSelector.innerText = "Enter OTP";
            formButtonSelector.disabled = false;
          }
          else{
            signInTitleSelector.innerText = "Register";
            formButtonSelector.disabled=true;
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
      if(userExists){
        let validFields = checkFieldsAndShowError([otpFieldSelector], errorFieldSelector);
        if (validFields){
          function onLogin(){
            triggerEvent('login', {
              'source': 'sign-in',
              'method': 'phone',
              'country_code': `+${iti.getSelectedCountryData().dialCode}`
            });
            removeButtonLoading(formButtonSelector, "Veirfied");
            redirectToDashboard();
          }
          login(otp, onLogin, onLoginFailed);
        }
        else{
          removeButtonLoading(formButtonSelector, "Verify OTP");
        }
      }
      else{
        let validFields = checkFieldsAndShowError([otpFieldSelector, userNameSelector, userEmailSelector, acceptTermsSelector], errorFieldSelector)
        if (validFields){
          async function onLogin(result) {
            verifiedUser = result.user;
            let userNameValue = capitalize(userNameSelector.value);
            // updating auth user with name and email
            try {
              verifiedUser.updateEmail(userEmailSelector.value.toLowerCase()).then(function(){
                // verifiedUser.reauthenticateWithCredential(credential).then(function() {
                    verifiedUser.updateProfile({
                        displayName: userNameValue
                    }).then(async function(){
                      // add User Data to backend
                      await updateAccessToken();
                      triggerEvent('sign_up', {
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
                      }, redirectToDashboard, redirectToDashboard)
                    })
                    .catch(onLoginFailed)
                // }).catch(onLoginFailed)
              }).catch(onLoginFailed)
            }
            catch(error){
              console.error(error);
              onLoginFailed(error);
            }
          }
          login(otp, onLogin, onLoginFailed);
        }
        else{
          removeButtonLoading(formButtonSelector, "Verify OTP");
        }
      } 
    }
  });