// Initialize Firebasez
var config = {
    apiKey: "AIzaSyA9Tb7Kjty7LQHs_gX-aO1yoAhTlDZ3YJs",
    authDomain: "tratra-ba5c5.firebaseapp.com",
    databaseURL: "https://tratra-ba5c5.firebaseio.com",
    projectId: "tratra-ba5c5",
    storageBucket: "tratra-ba5c5.appspot.com",
    messagingSenderId: "540936121296"
};
firebase.initializeApp(config);
firebase.auth().onAuthStateChanged(function (user) {
    if (!user) {
        document.getElementById("aboutp").style.display = "block";
        document.getElementById("contactp").style.display = "none";
        document.getElementById("signoutp").style.display = "none";
        document.getElementById("getstartedp").style.display = "none";
    } else {
        document.getElementById("aboutp").style.display = "block";
        document.getElementById("contactp").style.display = "block";
        document.getElementById("getstartedp").style.display = "block";
        document.getElementById("signoutp").style.display = "block";
        // document.getElementById("loginp").style.display = "none";
    }
});

function logout() {
    firebase.auth().signOut().then(function () {
        window.location.href="../home.html";
    }, function (error) {
    });
}
