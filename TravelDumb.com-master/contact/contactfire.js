// Initialize Firebasez
var config = {
    apiKey: "AIzaSyA9Tb7Kjty7LQHs_gX-aO1yoAhTlDZ3YJs",
    authDomain: "tratra-ba5c5.firebaseapp.com",
    databaseURL: "https://tratra-ba5c5.firebaseio.com",
    projectId: "tratra-ba5c5",
    storageBucket: "tratra-ba5c5.appspot.com",
    messagingSenderId: "540936121296"
};

/*Initialize Firebase
var config = {
    apiKey: "AIzaSyBO0rLxtS0tETHovCBbp_ZluucVKTa7SvA",
    authDomain: "contactform-9b228.firebaseapp.com",
    databaseURL: "https://contactform-9b228.firebaseio.com",
    projectId: "contactform-9b228",
    storageBucket: "contactform-9b228.appspot.com",
    messagingSenderId: "700979093385"
};*/



firebase.initializeApp(config);
firebase.auth().onAuthStateChanged(function (user) {
    if (!user) {
        document.getElementById("aboutp").style.display = "block";
        document.getElementById("contactp").style.display = "none";
        document.getElementById("getstartedp").style.display = "none";
        document.getElementById("signoutp").style.display = "none";
    } else {
        document.getElementById("aboutp").style.display = "block";
        document.getElementById("contactp").style.display = "block";
        document.getElementById("signoutp").style.display = "block";
        document.getElementById("getstartedp").style.display = "block";
        document.getElementById("loginp").style.display = "none";
    }
});
function logout() {
    firebase.auth().signOut().then(function () {
    }, function (error) {
    });
}

var messagesRef = firebase.database().ref('messages');
// Listen for form submit
document.getElementById('contact').addEventListener('submit', submitForm);

// Submit form
function submitForm() {
    //e.preventDefault();
    // Get values
    var fname = getInputVal('fname');
    var lname = getInputVal('lname');
    var email = getInputVal('email');
    var country = getInputVal('country');
    var subject = getInputVal('subject');
    // Save message
    saveMessage(fname, lname, email, country, subject);
    alert("Thank you, one of our team member will contact you soon");
    // Show alert
    document.querySelector('.alert').style.display = 'block';
    // Hide alert after 3 seconds
    setTimeout(function () {

        document.querySelector('.alert').style.display = 'none';
    }, 3000);
    // Clear form
    document.getElementById('contact').reset();
}
// Function to get get form values
function getInputVal(id) {
    return document.getElementById(id).value;
}
// Save message to firebase
function saveMessage(fname, lname, email, country, subject) {
    var newMessageRef = messagesRef.push();
    newMessageRef.set({
        fname: fname,
        lname: lname,
        email: email,
        country: country,
        subject: subject
    });
}
