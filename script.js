const API_URL = "https://script.google.com/macros/s/AKfycbz7Wu9D21kUuURthXcX89sfzMU4TvKmAgXwprEdJa_hHUM8mVk2nLEsXnmXn3WoIbF3/exec";
const FORM_REF_KEY = "formRef";

let currentMonth = "2025-01";
let data = [];

/* AUTO START */
window.onload = () => {
  const savedRef = localStorage.getItem(FORM_REF_KEY);
  if (savedRef) document.getElementById("formRef").value = savedRef;

  document.getElementById("formRef").oninput = e =>
    localStorage.setItem(FORM_REF_KEY, e.target.value);

  initMonth();
};

/* MONTH DROPDOWN: JAN 2025 → JAN 2026 */
function initMonth() {
  const sel = document.getElementById("monthSelect");
  sel.innerHTML = "";

  const start = new Date(2025, 0, 1); // Jan 2025
  const end = new Date(2026, 0, 1);   // Jan 2026

  let d = new Date(start);

  while (d <= end) {
    const value = d.toISOString().slice(0, 7);
    const label = d.toLocaleString("en-US", {
      month: "long",
      year: "numeric"
    });

    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = label;

    if (value === currentMonth) opt.selected = true;

    sel.appendChild(opt);
    d.setMonth(d.getMonth() + 1);
  }

  loadData();
}

function changeMonth() {
  currentMonth = document.getElementById("monthSelect").value;
  loadData();
}

/* LOAD DATA */
function loadData() {
  fetch(`${API_URL}?month=${currentMonth}`)
    .then(res => res.json())
    .then(rows => {
      data = rows || [];
      render();
    })
    .catch(err => {
      console.error("API Error:", err);
      data = [];
      render();
    });
}

/* ADD ROW */
function addRow() {
  const sl = data.length + 1;
  data.push({
    "Month": currentMonth,
    "Sl.No": sl,
    "Quote Ref": `${currentMonth.replace("-", "")}-${sl}`,
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

/* SAVE DATA */
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

      tbody.innerHTML += `
<tr>
<td>${r["Sl.No"]}</td>
<td><input value="${r["Quote Ref"]}" oninput="upd(${i},'Quote Ref',this.value)"></td>
<td><input value="${r["Project Name"]}" oninput="upd(${i},'Project Name',this.value)"></td>
<td><input value="${r["Project Manager"]}" oninput="upd(${i},'Project Manager',this.value)"></td>
<td><input value="${r["Candidate"]}" oninput="upd(${i},'Candidate',this.value)"></td>
<td><input type="date" value="${r["Enquiry Received"]}" onchange="upd(${i},'Enquiry Received',this.value)"></td>
<td><input type="date" value="${r["Deadline"]}" onchange="upd(${i},'Deadline',this.value)"></td>
<td class="reminder">${reminder}</td>
<td>
  <select onchange="upd(${i},'Status',this.value)">
    <option ${r.Status=="Not Started"?"selected":""}>Not Started</option>
    <option ${r.Status=="Working"?"selected":""}>Working</option>
    <option ${r.Status=="Submitted"?"selected":""}>Submitted</option>
  </select>
</td>
<td><input type="number" value="${r.Value}" oninput="upd(${i},'Value'
