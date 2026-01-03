const API_URL = "https://script.google.com/macros/s/AKfycbz7Wu9D21kUuURthXcX89sfzMU4TvKmAgXwprEdJa_hHUM8mVk2nLEsXnmXn3WoIbF3/exec";
const FORM_REF_KEY = "formRef";

let currentMonth = new Date().toISOString().slice(0,7);
let data = [];

/* AUTO START */
window.onload = () => {
  const savedRef = localStorage.getItem(FORM_REF_KEY);
  if (savedRef) document.getElementById("formRef").value = savedRef;

  document.getElementById("formRef").oninput = e =>
    localStorage.setItem(FORM_REF_KEY, e.target.value);

  initMonth();
};

/* MONTH SELECT */
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
<td><input type="number" value="${r.Value}" oninput="upd(${i},'Value',this.value)"></td>
</tr>`;
    });
}

function upd(i, key, value) {
  data[i][key] = value;
  save();
}

/* EXCEL DOWNLOAD */
function downloadExcel() {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, currentMonth);
  XLSX.writeFile(wb, `Enquiry_${currentMonth}.xlsx`);
}
