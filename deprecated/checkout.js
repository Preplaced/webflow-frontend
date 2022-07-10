let [
    userTitleSelector, 
    countryCodeSelector, 
    phoneNumberSelector,
    editPhoneSelector,
    otpFieldSelector,
    resendOTPSelector,
    resendContainer,
    userNameSelector,
    userEmailSelector,
    acceptTermsSelector,
    subSelector,
    formButtonSelector,
    errorFieldSelector,
    verifyUserFormSelector,
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
    'verify-user-title',
    'country-code',
    'phone-number',
    'edit-phone',
    'otp-field',
    'resend-otp',
    'resend-otp-container',
    'user-name',
    'user-email',
    'accept-terms',
    'accept-subscription',
    'form-button',
    'error-message',
    'verify-user-form',
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

var code = "+91";
var otpSent = false;
var userExists = true;
let totalPrice = 0;
let coupon= "";
let addGST = pkDetails.addGST || false;
let gstPrice = 0;

// function handleUserDetailsUI(){
//     if (accessToken){
//         if (!verifiedUser){
//             firebase.auth().onAuthStateChanged(function (user) {
//                 if (!user) return;
//                 userTitleSelector.innerText = "Billing Details";
//                 nameDetailsSelector.innerText = user.displayName;
//                 phoneDetailsSelector.innerText = user.phoneNumber;
//                 emailDetailsSelector.innerText = user.email;
//                 showElements([userDetailsSelector]);
//                 hideElements([verifyUserFormSelector]);
//             })
//         }
//         else {
//             userTitleSelector.innerText = "Billing Details"
//             nameDetailsSelector.innerText = verifiedUser.displayName;
//             phoneDetailsSelector.innerText = verifiedUser.phoneNumber;
//             emailDetailsSelector.innerText = verifiedUser.email;
//             showElements([userDetailsSelector]);
//             hideElements([verifyUserFormSelector]);
//         }
//     }else{
//         userTitleSelector.innerText = "Verify Your Number";
//         showElements([verifyUserFormSelector]);
//         hideElements([userDetailsSelector]);
//     }
// }

function updateUI(){
    domainTitleSelector.innerText = pkDetails.domain;
    packageTitleSelector.innerText = packageMap[pkDetails.package_id];
    experienceTitleSelector.innerText = pkDetails.experience !== "Fresher" ?  pkDetails.experience + " Experience": "Fresher";
    // handleUserDetailsUI();
    handlePaymentSectionUI();

}

if(!pkDetails) {
    redirect('/');
}
else{
    pkDetails.price = parseInt(pkDetails.price).toFixed(2); //rounding it 2 decimal
    // totalPrice = pkDetails.price;
    updateUI();
}

function onCouponApplied(discount){
    updatePaymentInfo(discount);
    showElements([couponSuccessSelector]);
    couponSubmitSelector.innerText = "Redeem";
}

function onInvalidCoupon(){
    showElements([couponErrorSelector]);
    couponSubmitSelector.innerText = "Redeem";
    updatePaymentInfo();
    coupon = "";
    // discountPriceSelector.innerText=`${currencyMap[pkDetails.currency]} 0`;
    // totalPriceSelector.innerText=`${currencyMap[pkDetails.currency]} ${totalPrice}`;
}

changeDomainSelector.addEventListener('click', function(e){
    e.preventDefault();
    // redirect("/"+pkDetails.package_id);
    closeCheckoutModal();
})

closeCheckout.addEventListener('click', function(e){
    e.preventDefault();
    // redirect("/"+pkDetails.package_id);
    closeCheckoutModal();
})

couponSubmitSelector.addEventListener('click', function(e){
    e.preventDefault();
    couponSubmitSelector.innerText = "Checking";
    hideElements([couponErrorSelector, couponSuccessSelector]);
    coupon = couponSelector.value.toUpperCase();
    if (coupon){
        checkCoupon(coupon, pkDetails.package_id, onCouponApplied, onInvalidCoupon);
    }
    else{
        couponSubmitSelector.innerText = "Redeem";
        updatePaymentInfo();
    }
});

function onPaymentFailure(place){
    console.error("Payment failed at", place);
    hideElements([orderLoader]);
    showElements([orderOverlay, orderErrorSelector]);
}

hideOverlay.addEventListener('click', function(e){
    hideElements([orderOverlay, orderErrorSelector]);
});

payNowButtonSelector.addEventListener('click', function(e) {
    e.preventDefault();
    hideElements([orderErrorSelector]);
    showElements([orderOverlay, orderLoader]);
    if (verifiedUser && verifiedUser.phoneNumber && verifiedUser.displayName && verifiedUser.email){
        function onPaymentComplete(response){
            hideElements([orderErrorSelector]);
            showElements([orderOverlay, orderLoader]);
            pkDetails['totalPrice'] = totalPrice;
            pkDetails['order_id'] = response.razorpay_order_id;
            triggerPurchase(pkDetails);
            function goToThankYouPage(){
                redirect('/thankyou');
            }
            updateOrder({
                "order_id": response.razorpay_order_id,
                "payment_id": response.razorpay_payment_id || "",
                "signature": response.razorpay_signature || ""
            }, goToThankYouPage, function(){onPaymentFailure("update-order")} );
        }
        function onOrderCreated(responseData){
            let order = responseData.razorpay_order_object;
            if (!!order){
                var options = {
                    "key": responseData.key || "rzp_test_sPcDgJ2yGLxdzT", // Enter the Key ID generated from the Dashboard
                    "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
                    "currency": order.currency,
                    "name": "Preplaced Education Pvt. Ltd",
                    "description": packageMap[pkDetails.package_id],
                    "order_id": order.id,
                    "handler": function (response){
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
                rzp1.on('payment.failed', function (response){
                    onPaymentFailure("razorpay");
                    console.error("razorpay_error:",response.error);
                });
                hideElements([orderOverlay, orderErrorSelector]);
                rzp1.open();
            }
            else{
                onPaymentComplete({
                    'razorpay_order_id': `${responseData.orderId}`
                })
            }
        }

        pkDetails["coupon"] = coupon;
        createOrder(pkDetails, onOrderCreated,function(){onPaymentFailure("create-order")} );
    }
});

function closeCheckoutModal(){
    hideElements([checkoutModal])
}