const STORAGE_KEY = "enquiry_log_2026";
const FORM_REF_KEY = "formRef";

let currentMonth = "2025-01";
let allData = {};

/* AUTO START */
window.onload = () => {
  // load saved data
  allData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

  // load form ref
  const savedRef = localStorage.getItem(FORM_REF_KEY);
  if (savedRef) document.getElementById("formRef").value = savedRef;

  document.getElementById("formRef").oninput = e =>
    localStorage.setItem(FORM_REF_KEY, e.target.value);

  initMonthDropdown();
};

/* MONTH DROPDOWN: JAN 2025 → JAN 2026 */
function initMonthDropdown() {
  const sel = document.getElementById("monthSelect");
  sel.innerHTML = "";

  let d = new Date(2025, 0, 1); // Jan 2025
  const end = new Date(2026, 0, 1); // Jan 2026

  while (d <= end) {
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("en-US", {
      month: "long",
      year: "numeric"
    });

    sel.add(new Option(label, value, value === currentMonth, value === currentMonth));
    d.setMonth(d.getMonth() + 1);
  }

  loadMonth();
}

function changeMonth() {
  currentMonth = document.getElementById("monthSelect").value;
  loadMonth();
}

/* LOAD MONTH DATA */
function loadMonth() {
  if (!allData[currentMonth]) allData[currentMonth] = [];
  render();
}

/* ADD ROW */
function addRow() {
  const rows = allData[currentMonth];
  const sl = rows.length + 1;

  rows.push({
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

/* SAVE TO LOCAL STORAGE */
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
  render();
}

/* RENDER TABLE */
function render() {
  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = "";

  const rows = allData[currentMonth] || [];
  const fs = document.getElementById("filterStatus").value;
  const fm = document.getElementById("filterManager").value;

  rows
    .filter(r => !fs || r.Status === fs)
    .filter(r => !fm || r["Project Manager"] === fm)
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
      <option ${r.Status==="Not Started"?"selected":""}>Not Started</option>
      <option ${r.Status==="Working"?"selected":""}>Working</option>
      <option ${r.Status==="Submitted"?"selected":""}>Submitted</option>
    </select>
  </td>
  <td><input type="number" value="${r.Value}" oninput="upd(${i},'Value',this.value)"></td>
</tr>`;
    });
}

function upd(i, key, value) {
  allData[currentMonth][i][key] = value;
  save();
}

/* DOWNLOAD EXCEL */
function downloadExcel() {
  const rows = allData[currentMonth] || [];
  if (!rows.length) {
    alert("No data for this month");
    return;
  }

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, currentMonth);
  XLSX.writeFile(wb, `Enquiry_${currentMonth}.xlsx`);
}
