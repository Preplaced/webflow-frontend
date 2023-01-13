var loginDashboardBtnSelectorMob = document.getElementById('login-dashboard-btn-mob');

const changeButtonName = () => {
    if(getCookie('email')){
        loginDashboardBtnSelectorMob.innerText = "Dashboard";
    }
}

changeButtonName();