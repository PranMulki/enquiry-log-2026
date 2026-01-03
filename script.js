const PASSWORD = "estimation2026";
let data = JSON.parse(localStorage.getItem("enquiryData")) || [];

function login() {
  if (document.getElementById("password").value === PASSWORD) {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("app").classList.remove("hidden");
    render();
  } else {
    alert("Wrong password");
  }
}

function addRow() {
  data.push({
    project: "",
    manager: "",
    candidate: "",
    received: "",
    deadline: "",
    status: "Not Started",
    value: ""
  });
  save();
}

function save() {
  localStorage.setItem("enquiryData", JSON.stringify(data));
  render();
}

function render() {
  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = "";

  data.forEach((r, i) => {
    const reminder =
      r.deadline &&
      r.status !== "Submitted" &&
      r.deadline < new Date().toISOString().split("T")[0]
        ? "Reminder Due"
        : "";

    tbody.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${8668 + i + 1}</td>
        <td><input value="${r.project}" oninput="update(${i},'project',this.value)"></td>
        <td>
          <select onchange="update(${i},'manager',this.value)">
            <option></option>
            <option ${r.manager=="Mr. Vishal"?"selected":""}>Mr. Vishal</option>
            <option ${r.manager=="Mr. Mukesh"?"selected":""}>Mr. Mukesh</option>
            <option ${r.manager=="Mr. Irshad"?"selected":""}>Mr. Irshad</option>
            <option ${r.manager=="Mr. Prem"?"selected":""}>Mr. Prem</option>
            <option ${r.manager=="Ms. Tania"?"selected":""}>Ms. Tania</option>
            <option ${r.manager=="Mr. Robbin"?"selected":""}>Mr. Robbin</option>
          </select>
        </td>
        <td>
          <select onchange="update(${i},'candidate',this.value)">
            <option></option>
            <option ${r.candidate=="Praneeth"?"selected":""}>Praneeth</option>
            <option ${r.candidate=="Chetaka"?"selected":""}>Chetaka</option>
          </select>
        </td>
        <td><input type="date" value="${r.received}" onchange="update(${i},'received',this.value)"></td>
        <td><input type="date" value="${r.deadline}" onchange="update(${i},'deadline',this.value)"></td>
        <td class="reminder">${reminder}</td>
        <td>
          <select onchange="update(${i},'status',this.value)">
            <option ${r.status=="Not Started"?"selected":""}>Not Started</option>
            <option ${r.status=="Working"?"selected":""}>Working</option>
            <option ${r.status=="Submitted"?"selected":""}>Submitted</option>
          </select>
        </td>
        <td><input type="number" value="${r.value}" oninput="update(${i},'value',this.value)"></td>
      </tr>`;
  });
}

function update(i, k, v) {
  data[i][k] = v;
  save();
}

function downloadExcel() {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Enquiry Log");
  XLSX.writeFile(wb, "Enquiry_Log_2026.xlsx");
}
