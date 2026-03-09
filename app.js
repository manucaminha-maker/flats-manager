
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
const reservationsRef = ref(db,"reservations");

const commissions = {
Airbnb:0.05,
Booking:0.13,
Decolar:0.17,
Expedia:0.15,
Direto:0,
Outro:0
}

window.addReservation = function(){

const apt=document.getElementById("apt").value
const guest=document.getElementById("guest").value
const checkin=document.getElementById("checkin").value
const checkout=document.getElementById("checkout").value
const value=parseFloat(document.getElementById("value").value)
const operator=document.getElementById("operator").value
const cleaning=parseFloat(document.getElementById("cleaning").value)

const commission=value*commissions[operator]
const net=value-commission-cleaning

push(reservationsRef,{
apt,guest,checkin,checkout,value,operator,cleaning,commission,net
})

}

const table=document.querySelector("#table tbody")
const alerts=document.getElementById("alerts")
const map=document.getElementById("map")
const finance=document.getElementById("finance")

const flats=["008A","223B","210D","114C","121A"]

onValue(reservationsRef,(snapshot)=>{

table.innerHTML=""
alerts.innerHTML=""
map.innerHTML=""
finance.innerHTML=""

const data=snapshot.val()
if(!data) return

let total=0
let totalCommission=0
let totalCleaning=0
let totalNet=0

const today=new Date().toISOString().split("T")[0]

Object.values(data).forEach(r=>{

const tr=document.createElement("tr")

tr.innerHTML=`
<td>${r.apt}</td>
<td>${r.guest}</td>
<td>${r.checkin}</td>
<td>${r.checkout}</td>
<td>R$ ${r.value.toFixed(2)}</td>
<td>R$ ${r.net.toFixed(2)}</td>
`

table.appendChild(tr)

total+=r.value
totalCommission+=r.commission
totalCleaning+=r.cleaning
totalNet+=r.net

if(r.checkin===today){
alerts.innerHTML+=`<div>Check-in hoje: ${r.guest} (${r.apt})</div>`
}

if(r.checkout===today){
alerts.innerHTML+=`<div>Check-out hoje: ${r.guest} (${r.apt})</div>`
}

})

flats.forEach(f=>{

let occupied=false

Object.values(data).forEach(r=>{
if(r.apt===f){
occupied=true
}
})

const div=document.createElement("div")
div.className="flat"
div.innerHTML=occupied?`${f} 🔴`:`${f} 🟢`
map.appendChild(div)

})

finance.innerHTML=`
Total reservas: R$ ${total.toFixed(2)} <br>
Comissões: R$ ${totalCommission.toFixed(2)} <br>
Limpeza: R$ ${totalCleaning.toFixed(2)} <br>
Líquido: R$ ${totalNet.toFixed(2)}
`

})
