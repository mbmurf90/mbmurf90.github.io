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
  if (user) {
    document.getElementById("user_div").style.display = "block";
    document.getElementById("login_div").style.display = "none";
    var user = firebase.auth().currentUser;
    if (user != null) {
      var email_id = user.email;
      var email_verified = user.emailVerified;
      if (email_verified) {
        // refreshed
        document.getElementById("verify_btn").style.display = "none";
        document.getElementById("login_div").style.display = "block";
        document.getElementById("createacc").style.display = "none";
      } else {
        document.getElementById("verify_btn").style.display = "block";
      }
      document.getElementById('user_para').innerHTML = "Welcome User :" + email_id + "Verified: " + email_verified;
    }
  } else {
    document.getElementById("user_div").style.display = "none";
    document.getElementById("login_div").style.display = "block";
  }
});
function login() {
  var userEmail = document.getElementById("email_field").value;
  var userPass = document.getElementById("password_field").value;
  firebase.auth().signInWithEmailAndPassword(userEmail, userPass)
    .then(function (firebaseUser) {
      window.alert("Signed in");
      window.location.pathname = "../../search/index.html";
    })
    .catch(function (error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      window.alert("Error : " + errorMessage);
    });
}


function create_account() {
  var userEmail = document.getElementById("email_field").value;
  var userPass = document.getElementById("password_field").value;
  firebase.auth().createUserWithEmailAndPassword(userEmail, userPass).catch(function (error) {
    var errorCode = error.code;
    var errorMessage = error.message;
    window.alert("Error : " + errorMessage);
  });
  window.alert("Thank you for registrating, please check your email and sign in");
}
function logout() {
  firebase.auth().signOut();
  window.location.pathname = "../../homepage/home.html";
}
function send_verification() {
  var user = firebase.auth().currentUser;
  user.sendEmailVerification().then(function () {
    window.alert("Verification Sent");
  }).catch(function (error) {
    window.alert("Error : " + error.message);
  });
}

function callGoogleSignIn(){
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider).then(function(result)
  {
    var token = result.credential.accessToken;
    var user = result.user;
    window.location.pathname = "../../search/index.html";}).catch(function(error){
      var errorCode = error.code;
      var errorMessage = error.message;
      var email = error.email;
      var credential = error.credential;
      window.location.pathname = "../../search/index.html";
    });
  }

function callFacebookSignIn(){
var provider = new firebase.auth.FacebookAuthProvider();

firebase.auth().signInWithPopup(provider).then(function(result) {
  // This gives you a Facebook Access Token. You can use it to access the Facebook API.
  var token = result.credential.accessToken;
  // The signed-in user info.
  var user = result.user;
  // ...
window.location.pathname = "../../search/index.html";}).catch(function(error) {
  // Handle Errors here.
  var errorCode = error.code;
  var errorMessage = error.message;
  // The email of the user's account used.
  var email = error.email;
  // The firebase.auth.AuthCredential type that was used.
  var credential = error.credential;
  // ...
  window.location.pathname = "../../search/index.html";
});


}

function forgotPassword(){

var userEmail = document.getElementById("email_field").value;

firebase.auth().sendPasswordResetEmail(userEmail).then(function(){

  alert("Password email sent");


// }).catch(function(error)

});
}
        