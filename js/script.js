// Entry Class: Represent each entry in the parking lot
class Entry {
  constructor(owner, vehicle, licensePlate, entryDate, slotNumber) {
    this.owner = owner;
    this.vehicle = vehicle;
    this.licensePlate = licensePlate;
    this.entryDate = entryDate;
    this.slotNumber = slotNumber;
  }
}

// UI Class: Handle User Interface Tasks
class UI {
  static displayEntries() {
    const entries = Store.getEntries();
    entries.forEach((entry) => UI.addEntryToTable(entry));
    // Initialize the next slot number when displaying entries
    UI.updateNextSlotNumber();
  }

  static addEntryToTable(entry) {
    const tableBody = document.querySelector('#tableBody');
    const row = document.createElement('tr');
    row.innerHTML = `   <td>${entry.owner}</td>
                        <td>${entry.vehicle}</td>
                        <td>${entry.licensePlate}</td>
                        <td>${entry.entryDate}</td>
                        <td>${entry.slotNumber}</td>
                        <td><button class="btn btn-danger delete">X</button></td>
                    `;
    tableBody.appendChild(row);

    // Call a function to update the slot number for the next entry
    UI.updateNextSlotNumber();
  }

  static clearInput() {
    const inputs = document.querySelectorAll('.form-control');
    inputs.forEach((input) => (input.value = ''));
  }

  static deleteEntry(target) {
    if (target.classList.contains('delete')) {
      target.parentElement.parentElement.remove();
    }
  }

  static showAlert(message, className) {
    const div = document.createElement('div');
    div.className = `alert alert-${className} w-50 mx-auto`;
    div.appendChild(document.createTextNode(message));
    const formContainer = document.querySelector('.form-container');
    const form = document.querySelector('#entryForm');
    formContainer.insertBefore(div, form);
    setTimeout(() => document.querySelector('.alert').remove(), 3000);
  }

  static validateInputs() {
    const owner = document.querySelector('#owner').value;
    const vehicle = document.querySelector('#vehicle').value;
    const licensePlate = document.querySelector('#licensePlate').value;
    const entryDate = document.querySelector('#entryDate').value;
    const slotNumber = document.querySelector('#slotNumber').value;
    var licensePlateRegex = /^(?:[A-Z]{3}-\d{4})|(?:[A-Z]{2}-\d{5})$/;
    if (
      owner === '' ||
      vehicle === '' ||
      licensePlate === '' ||
      entryDate === '' ||
      slotNumber === ''
    ) {
      UI.showAlert('All fields must be filled!', 'danger');
      return false;
    }

    if (!licensePlateRegex.test(licensePlate)) {
      UI.showAlert(
        'License Plate must be AAA-1234 for Private Vehicles and AA-12345 for Private Motorcycles',
        'danger'
      );
      return false;
    }
    return true;
  }

  static updateNextSlotNumber() {
    const entries = Store.getEntries();
    const lastEntry = entries[entries.length - 1];

    const nextSlotNumber = lastEntry ? parseInt(lastEntry.slotNumber) + 1 : 1;
    document.querySelector('#slotNumber').value = nextSlotNumber;
  }
}

// Store Class: Handle Local Storage
class Store {
  static getEntries() {
    let entries;
    if (localStorage.getItem('entries') === null) {
      entries = [];
    } else {
      entries = JSON.parse(localStorage.getItem('entries'));
    }
    return entries;
  }

  static addEntries(entry) {
    const entries = Store.getEntries();
    entries.push(entry);
    localStorage.setItem('entries', JSON.stringify(entries));
  }

  static removeEntries(licensePlate) {
    const entries = Store.getEntries();
    entries.forEach((entry, index) => {
      if (entry.licensePlate === licensePlate) {
        entries.splice(index, 1);
      }
    });
    localStorage.setItem('entries', JSON.stringify(entries));
  }

  static isSlotNumberTaken(slotNumber) {
    const entries = Store.getEntries();
    return entries.some(entry => entry.slotNumber === slotNumber);
  }
}

document.addEventListener('DOMContentLoaded', UI.displayEntries);

document.querySelector('#entryForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const owner = document.querySelector('#owner').value;
  const vehicle = document.querySelector('#vehicle').value;
  const licensePlate = document.querySelector('#licensePlate').value;
  const entryDate = document.querySelector('#entryDate').value;
  const slotNumber = document.querySelector('#slotNumber').value;

  if (!UI.validateInputs()) {
    return;
  }

  // Check if the slot number already exists
  if (Store.isSlotNumberTaken(slotNumber)) {
    UI.showAlert('Slot number is already taken. Choose a different slot.', 'danger');
    return;
  }

  const entry = new Entry(owner, vehicle, licensePlate, entryDate, slotNumber);
  UI.addEntryToTable(entry);
  Store.addEntries(entry);
  UI.clearInput();

  UI.showAlert('Vehicle successfully added to the parking lot', 'success');
});

document.querySelector('#tableBody').addEventListener('click', (e) => {
  UI.deleteEntry(e.target);
  var licensePlate =
    e.target.parentElement.previousElementSibling.previousElementSibling
      .previousElementSibling.textContent;
  Store.removeEntries(licensePlate);
  UI.showAlert(
    'Vehicle successfully removed from the parking lot list',
    'success'
  );
});

document.querySelector('#searchInput').addEventListener('keyup', function searchTable() {
  const searchValue = document.querySelector('#searchInput').value.toUpperCase();
  const tableLine = document.querySelector('#tableBody').querySelectorAll('tr');

  for (let i = 0; i < tableLine.length; i++) {
    var count = 0;
    const lineValues = tableLine[i].querySelectorAll('td');

    for (let j = 0; j < lineValues.length - 1; j++) {
      if ((lineValues[j].innerHTML.toUpperCase()).startsWith(searchValue)) {
        count++;
      }
    }
    if (count > 0) {
      tableLine[i].style.display = '';
    } else {
      tableLine[i].style.display = 'none';
    }
  }
});
