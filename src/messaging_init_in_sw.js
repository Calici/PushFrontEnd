import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";
import axios from 'axios';

const firebaseConfig = {
  apiKey: "AIzaSyDmnXhzB_aRqfjZ4-Fus63vSXXp6csfyMI",
  authDomain: "hale-f4863.firebaseapp.com",
  databaseURL: "https://hale-f4863-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "hale-f4863",
  storageBucket: "hale-f4863.appspot.com",
  messagingSenderId: "911444961556",
  appId: "1:911444961556:web:819409277ac50063e87a01",
  measurementId: "G-Y8S8MZ5EPC"
};


function sendTokenToServer(token) {
  axios.post('http://127.0.0.1:8000/register_token/', { token: token })
    .then(response => {
      console.log("Token sent to server:", response.data);
    })
    .catch(error => {
      console.error("Error sending token to server:", error);
    });
}
function requestPermission() {
  console.log("Requesting permission...");
  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      console.log("Notification permission granted.");
      const app = initializeApp(firebaseConfig);

      const messaging = getMessaging(app);
      getToken(messaging, {
        vapidKey:
        "BMoHD2_MFPJBuqJIEO5n7uxpbaBT8T9eyDsBBONGZMYYaHAevVZ4sStX9GQDk8lmgFtE1zRnFQn1AQFg1eGlFe0",
      }).then((currentToken) => {
        if (currentToken) {
          console.log("currentToken: ", currentToken);
          sendTokenToServer(currentToken);
        } else {
          console.log("Can not get token");
        }
      });
    } else {
      console.log("Do not have permission!");
    }
  });
}

requestPermission();

