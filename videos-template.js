firebase.auth().onAuthStateChanged(function (user) {
    if (!user) {
        // showing login modal in videos page if not logged in
        showLoginModal()
    }
});