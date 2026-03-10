import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, push, onValue, update, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

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

let reservationsCache = {};
let editingId = null;

const commissions = {
Airbnb:0.05,
Booking:0.13,
Decolar:0.17,
Expedia:0.15,
Direto:0,
Outro:0
};

function overlap(a1,a2,b1,b2){
return a1 < b2 && a2 > b1;
}

window.addReservation = function(){

const apt=document.getElementById("apt").value;
const guest=document.getElementById("guest").value;
const checkin=document.getElementById("checkin").value;
const checkout=document.getElementById("checkout").value;
const value=parseFloat(document.getElementById("value").value);
const operator=document.getElementById("operator").value;
const cleaning=parseFloat(document.getElementById("cleaning").value);

for(const r of Object.values(reservationsCache)){

if(editingId && r===reservationsCache[editingId]) continue;

if(r.apt===apt){

if(overlap(checkin,checkout,r.checkin,r.checkout)){
alert("Este flat já está reservado nesse período");
return;
}

}

}

const commission=value*commissions[operator];
const net=value-commission-cleaning;

const data={
apt,
guest,
checkin,
checkout,
value,
operator,
cleaning,
commission,
net
};

if(editingId){

update(ref(db,"reservations/"+editingId),data);
editingId=null;

}else{

push(reservationsRef,{
...data,
cleaningDone:false
});

}

}

window.editReservation = function(id){

const r = reservationsCache[id];

document.getElementById("apt").value = r.apt;
document.getElementById("guest").value = r.guest;
document.getElementById("checkin").value = r.checkin;
document.getElementById("checkout").value = r.checkout;
document.getElementById("value").value = r.value;
document.getElementById("operator").value = r.operator;
document.getElementById("cleaning").value = r.cleaning;

editingId = id;

}

window.deleteReservation = function(id){

if(confirm("Excluir reserva?")){
remove(ref(db,"reservations/"+id));
}

}

window.markCleaningDone = function(id){

update(ref(db,"reservations/"+id),{cleaningDone:true});

}

const table=document.querySelector("#table tbody");
const alerts=document.getElementById("alerts");
const map=document.getElementById("map");
const calendar=document.getElementById("calendar");
const cleaningList=document.getElementById("cleaningList");
const finance=document.getElementById("finance");

const flats=["008A","223B","210D","114C","121A"];

onValue(reservationsRef,(snapshot)=>{

table.innerHTML="";
alerts.innerHTML="";
map.innerHTML="";
calendar.innerHTML="";
cleaningList.innerHTML="";
finance.innerHTML="";

const data=snapshot.val();
if(!data) return;

reservationsCache=data;

let total=0;
let totalCommission=0;
let totalCleaning=0;
let totalNet=0;

const today=new Date().toISOString().split("T")[0];

Object.entries(data).forEach(([id,r])=>{

const tr=document.createElement("tr");

tr.innerHTML=`
<td>${r.apt}</td>
<td>${r.guest}</td>
<td>${r.checkin}</td>
<td>${r.checkout}</td>
<td>R$ ${(r.value||0).toFixed(2)}</td>
<td>R$ ${(r.net||0).toFixed(2)}</td>
<td>
<button onclick="editReservation('${id}')">Editar</button>
<button onclick="deleteReservation('${id}')">Excluir</button>
</td>
`;

table.appendChild(tr);

total+=r.value||0;
totalCommission+=r.commission||0;
totalCleaning+=r.cleaning||0;
totalNet+=r.net||0;

if(r.checkout===today){

alerts.innerHTML+=`⚠️ Check-out hoje: ${r.guest} (${r.apt})<br>`;

if(!r.cleaningDone){

alerts.innerHTML+=`
🧹 Faxina necessária: ${r.apt}
<button onclick="markCleaningDone('${id}')">Faxina feita</button><br>
`;

cleaningList.innerHTML+=`
🧹 ${r.apt} – saída de ${r.guest}
<button onclick="markCleaningDone('${id}')">✔</button><br>
`;

}

}

});

finance.innerHTML=`
Total reservas: R$ ${total.toFixed(2)} <br>
Comissões: R$ ${totalCommission.toFixed(2)} <br>
Limpeza: R$ ${totalCleaning.toFixed(2)} <br>
Líquido: R$ ${totalNet.toFixed(2)}
`;

});
