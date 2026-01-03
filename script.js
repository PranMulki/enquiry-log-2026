const PASSWORD = "Insides";   // 🔐 editable password
const API_URL = "YOUR_WEB_APP_URL";  // Google Apps Script URL
const FORM_REF_KEY = "formRef";

let currentMonth = new Date().toISOString().slice(0,7);
let data = [];

/* LOGIN */
function login() {
  if (document.getElementById("password").value === PASSWORD) {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("app").classList.remove("hidden");

    const savedRef = localStorage.getItem(FORM_REF_KEY);
    if (savedRef) document.getElementById("formRef").value = savedRef;

    document.getElementById("formRef").oninput = e =>
      localStorage.setItem(FORM_REF_KEY, e.target.value);

    initMonth();
  } else {
    alert("Wrong password");
  }
}

/* MONTH SETUP */
function initMonth() {
  const sel = document.getElementById("monthSelect");
  sel.innerHTML = "";

  for (let i = 0; i < 12; i++) {
    const d = new Date(new Date().getFullYear(), new Date().getMonth() - i, 1);
    const m = d.toISOString().slice(0,7);
    sel.add(new Option(m, m, m === currentMonth, m === currentMonth));
  }
  loadData();
}

function changeMonth() {
  currentMonth = document.getElementById("monthSelect").value;
  loadData();
}

/* LOAD FROM GOOGLE SHEET */
function loadData() {
  fetch(`${API_URL}?month=${currentMonth}`)
    .then(res => res.json())
    .then(rows => {
      data = rows;
      render();
    });
}

/* ADD ROW */
function addRow() {
  const sl = data.length + 1;
  data.push({
    "Month": currentMonth,
    "Sl.No": sl,
    "Quote Ref": `${currentMonth.replace("-","")}-${sl}`,
    "Project Name": "",
    "Project Manager": "",
    "Candidate": "",
    "Enquiry Received": "",
    "Deadline": "",
    "Status": "Not Started",
    "Value": ""
  });
  save();
}

/* SAVE TO GOOGLE SHEET */
function save() {
  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(data)
  }).then(loadData);
}

/* RENDER TABLE */
function render() {
  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = "";

  const fs = document.getElementById("filterStatus").value;
  const fm = document.getElementById("filterManager").value;

  data
    .filter(r => (!fs || r.Status === fs))
    .filter(r => (!fm || r["Project Manager"] === fm))
    .forEach((r, i) => {

      const reminder =
        r.Deadline &&
        r.Status !== "Submitted" &&
        r.Deadline < new Date().toISOString().split("T")[0]
          ? "Reminder Due"
          : "";
