
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCNnLYBh43H1z0lIkUvlg6hhSodHLeMwVQ",
  authDomain: "flats-manager-53e7c.firebaseapp.com",
  databaseURL: "https://flats-manager-53e7c-default-rtdb.firebaseio.com",
  projectId: "flats-manager-53e7c",
  storageBucket: "flats-manager-53e7c.firebasestorage.app",
  messagingSenderId: "916765346885",
  appId: "1:916765346885:web:5360917aaaae759234a72c"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const reservationsRef = ref(db, "reservations");

window.addReservation = function(){

const apt = document.getElementById("apt").value;
const guest = document.getElementById("guest").value;
const checkin = document.getElementById("checkin").value;
const checkout = document.getElementById("checkout").value;

push(reservationsRef,{
apt,
guest,
checkin,
checkout
});

}

const tableBody = document.querySelector("#table tbody");
const alertsDiv = document.getElementById("alerts");

onValue(reservationsRef,(snapshot)=>{

tableBody.innerHTML="";
alertsDiv.innerHTML="";

const data = snapshot.val();
if(!data) return;

const today = new Date().toISOString().split("T")[0];

Object.values(data).forEach(r=>{

const tr = document.createElement("tr");
tr.innerHTML = `
<td>${r.apt}</td>
<td>${r.guest}</td>
<td>${r.checkin}</td>
<td>${r.checkout}</td>
`;
tableBody.appendChild(tr);

if(r.checkin === today){
alertsDiv.innerHTML += `<div>Check‑in hoje: ${r.guest} (${r.apt})</div>`;
}

if(r.checkout === today){
alertsDiv.innerHTML += `<div>Check‑out hoje: ${r.guest} (${r.apt})</div>`;
}

});

});
