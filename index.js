"use strict";
//Initialize
document.addEventListener("DOMContentLoaded", start);

//Variables
const studentURL = "https://petlatkea.dk/2021/hogwarts/students.json";
const familyURL = "https://petlatkea.dk/2021/hogwarts/families.json";
let allStudentData = [];
let expelledData = [];
let currentData = [];
let searchData = [];
let studentJSON;
let familyJSON;
let isHacked = false;

//settings
const settings = {
  filter: "all",
  sortBy: "firstName",
  sortDir: "asc",
  search: "",
};

//Prototype
const Student = {
  firstName: "",
  middleName: undefined,
  lastName: "",
  nickName: undefined,
  imageFile: "",
  house: "",
  prefect: false,
  expelled: false,
  bloodStatus: "",
  inquisitorial: false,
};

async function start() {
  registerButtons();
  await loadFamilyJSON();
  await loadStudenJSON();

  prepareObjects(studentJSON);
}

//Buttons
function registerButtons() {
  document.querySelectorAll("[data-action='filter']").forEach((button) => button.addEventListener("click", selectFilter));
  document.querySelector("#sorting").addEventListener("click", selectSorting);
  document.querySelector("#search").addEventListener("keyup", selectSearch);
}

async function loadStudenJSON() {
  const response = await fetch(studentURL);
  const data = await response.json();
  document.querySelector("#loadScreen").classList.add("hidden");
  studentJSON = data;
}
async function loadFamilyJSON() {
  const response = await fetch(familyURL);
  const data = await response.json();
  familyJSON = data;
}

function prepareObjects(jsonData) {
  allStudentData = jsonData.map(prepareObject);
  buildList();
}

function prepareObject(jsonObject) {
  const studentTemp = Object.create(Student);
  let nameArray = jsonObject.fullname.trim();
  nameArray = nameArray.toLowerCase();
  nameArray = nameArray.split(" ");
  let houseIs = jsonObject.house.trim();

  //Selecting and Captitalizing First Name
  studentTemp.firstName = firstNameClean(nameArray[0]);

  //Selecting and Captitalizing Middle and Nick Name (if Present)
  if (nameArray.length > 2 && !nameArray[1].includes(`"`)) {
    studentTemp.middleName = middleNameClean(nameArray[1]);
  } else if (nameArray.length > 2 && nameArray[1].includes(`"`)) {
    studentTemp.nickName = nicknameClean(nameArray[1]);
  }

  //Selecting and Captitalizing Last Name
  studentTemp.lastName = lastNameClean(nameArray[nameArray.length - 1]);

  //Selecting and Captitalizing Hypen Last Name (if present)
  if (nameArray[nameArray.length - 1].includes("-")) {
    studentTemp.lastName = lastNameHyphen(nameArray[nameArray.length - 1]);
  }
  if (studentTemp.lastName == studentTemp.firstName) {
    studentTemp.lastName = "No Last Name";
  }

  //Selecting and Captitalizing Houses
  studentTemp.house = houseFind(houseIs);

  //Selecting and defining Image File Names
  let imageFileName = imageFileLocate(nameArray);
  studentTemp.imageFile = imageFileName;

  //blood status
  let bloodStatus = checkBloodStatus(studentTemp.lastName);
  studentTemp.bloodStatus = bloodStatus;
  allStudentData.push(studentTemp);
  currentData.push(studentTemp);
  return studentTemp;
}

//Filtering
function selectFilter(event) {
  const filter = event.target.dataset.filter;
  setFilter(filter);
}

function setFilter(filter) {
  settings.filter = filter;
  buildList();
}

function filterList(filteredList) {
  if (settings.filter === "hufflepuff") {
    filteredList = filteredList.filter(isHufflepuff);
  } else if (settings.filter === "gryffindor") {
    filteredList = filteredList.filter(isGryffindor);
  } else if (settings.filter === "slytherin") {
    filteredList = filteredList.filter(isSlytherin);
  } else if (settings.filter === "ravenclaw") {
    filteredList = filteredList.filter(isRavenclaw);
  } else if (settings.filter === "prefects") {
    filteredList = filteredList.filter(isPrefect);
  } else if (settings.filter === "inquisitorial") {
    filteredList = filteredList.filter(isInquisitorial);
  } else if (settings.filter === "expelled") {
    filteredList = expelledData;
  }
  return filteredList;
}
//filter function
function isHufflepuff(student) {
  return student.house === "Hufflepuff";
}
function isGryffindor(student) {
  return student.house === "Gryffindor";
}
function isSlytherin(student) {
  return student.house === "Slytherin";
}
function isRavenclaw(student) {
  return student.house === "Ravenclaw";
}
function isPrefect(student) {
  return student.prefect === true;
}
function isInquisitorial(student) {
  return student.inquisitorial === true;
}

//Sorting
function selectSorting(event) {
  const sortBy = event.target.dataset.sort;
  const sortDir = event.target.dataset.sortDirection;
  if (sortBy != undefined) {
    setSort(sortBy, sortDir);
  }
}

function setSort(sortBy, sortDir) {
  settings.sortBy = sortBy;
  settings.sortDir = sortDir;
  buildList();
}

function sortList(sortedList) {
  let direction = 1;
  if (settings.sortDir === "desc") {
    direction = -1;
  } else {
    direction = 1;
  }

  sortedList = sortedList.sort(sortByProperty);
  function sortByProperty(studentA, studentB) {
    if (studentA[settings.sortBy] < studentB[settings.sortBy]) {
      return -1 * direction;
    } else {
      return 1 * direction;
    }
  }
  return sortedList;
}
//Search
function selectSearch(event) {
  const value = event.target.value.toLowerCase();
  setSearch(value);
}
function setSearch(search) {
  settings.search = search;
  buildList();
}
function searchList(searchedList) {
  searchedList = searchedList.filter(isSearched);
  return searchedList;
}
function isSearched(student) {
  return student.firstName.toLowerCase().includes(settings.search) || student.lastName.toLowerCase().includes(settings.search);
}

//Build List
function buildList() {
  const currentList = filterList(currentData);
  const sortedList = sortList(currentList);
  const searchedList = searchList(sortedList);
  aboutDisplay(searchedList);
  displayList(searchedList);
}

/////////////////////////////////////////////////////////
//Show data
function displayList(students) {
  document.querySelector("#pasteTemplate").innerHTML = "";
  if (isHacked === true) {
    currentData.forEach(reScramble);
  }
  students.forEach(displayStudent);
}

function displayStudent(student) {
  //create clone
  const myTemplate = document.querySelector("#newTemplate").content;
  const myCopy = myTemplate.cloneNode(true);

  //Easy Content
  myCopy.querySelector("[data-field=firstName]").textContent = student.firstName;
  myCopy.querySelector("[data-field=lastName]").textContent = student.lastName;
  myCopy.querySelector("[data-field=house]").textContent = student.house;
  if (student.middleName != undefined) {
    myCopy.querySelector("[data-field=middleName]").textContent = student.middleName;
  }
  if (student.nickName != undefined) {
    myCopy.querySelector("[data-field=nickName]").textContent = `"${student.nickName}"`;
  }

  //Pop-up Content
  myCopy.querySelector(".studentDiv .studentInfo").addEventListener("click", () => {
    popOpen(student);
  });
  //Prefect
  myCopy.querySelector("[data-field=prefect]").dataset.prefect = student.prefect;

  if (student.expelled === false) {
    myCopy.querySelector("[data-field=prefect]").addEventListener("click", clickPrefect);
  }
  function clickPrefect() {
    if (student.prefect === true) {
      student.prefect = false;
      removedFromGroup(student, "Prefects");
    } else {
      tryToMakeAPrefect(student);
    }
    buildList();
  }

  //Expelled
  myCopy.querySelector("[data-field=expelled]").dataset.expelled = student.expelled;
  if (student.title != "hacker") {
    myCopy.querySelector("[data-field=expelled]").addEventListener("click", clickExpell);
  } else {
    myCopy.querySelector("[data-field=expelled]").addEventListener("click", cantExpel);
  }
  function clickExpell() {
    if (student.expelled === false) {
      tryToExpell(student);
    }
  }

  //Inquisitorial
  myCopy.querySelector("[data-field=inquisitorial").dataset.inquisitorial = student.inquisitorial;
  if (student.expelled === false) {
    myCopy.querySelector("[data-field=inquisitorial").addEventListener("click", clickInquisitorial);
  }
  function clickInquisitorial() {
    if (student.inquisitorial === true) {
      student.inquisitorial = false;
      removedFromGroup(student, "Inqusitorial");
    } else {
      tryToMakeInquisitorial(student);
    }
    buildList();
  }

  // append clone
  const parent = document.querySelector("#pasteTemplate");
  parent.appendChild(myCopy);
}
function cantExpel() {
  document.querySelector("#expelWarning").classList.remove("hidden");
  document.querySelector("#expelWarning #removeStudent").classList.add("hidden");
  document.querySelector("#expelWarning .expelText").classList.add("hidden");
  document.querySelector("#expelZone").innerHTML += "<p>This student cannot be expelled</p>";
  document.querySelector("#expelWarning .closeButton").addEventListener("click", () => {
    document.querySelector("#expelWarning").classList.add("hidden");
    document.querySelector("#expelWarning #removeStudent").classList.remove("hidden");
    document.querySelector("#expelWarning .expelText").classList.remove("hidden");
    document.querySelector("#expelZone p").remove();
  });
}

// Inqusitorial
function tryToMakeInquisitorial(student) {
  if (student.house === "Slytherin" || student.bloodStatus === "Pureblood") {
    makeInqusitor(student);
    if (isHacked === true) {
      setTimeout(() => {
        student.inquisitorial = false;
        removedFromGroup(student, "Inqusitorial");
        buildList();
      }, 1000);
    }
  } else {
    document.querySelector("#inqusitorWarning").classList.remove("hidden");
    document.querySelector("#inqusitorWarning [data-field=inqusitorHouse]").textContent = student.house;
    document.querySelector("#inqusitorWarning [data-field=inqusitorFamily]").textContent = student.bloodStatus;
    document.querySelector("#inqusitorWarning .closeButton").addEventListener("click", closeDialog);
  }
  function makeInqusitor() {
    student.inquisitorial = true;
  }
  function closeDialog() {
    document.querySelector("#inqusitorWarning .closeButton").removeEventListener("click", closeDialog);
    document.querySelector("#inqusitorWarning").classList.add("hidden");
  }
}
//Removed privliege
function removedFromGroup(student, group) {
  document.querySelector("#removedAlert").classList.remove("hidden");
  if (student.firstName != undefined) {
    document.querySelector("#removedAlert [data-field=removedName]").textContent = student.firstName;
  } else {
    document.querySelector("#removedAlert [data-field=removedName]").textContent = student;
  }
  document.querySelector("#removedAlert [data-field=removedGroup]").textContent = group;

  document.querySelector("#removedAlert .closeButton").addEventListener("click", closeDialog);

  function closeDialog() {
    document.querySelector("#removedAlert").classList.add("hidden");
    document.querySelector("#removedAlert .closeButton").removeEventListener("click", closeDialog);
  }
}

//PopOpen
function popOpen(student) {
  document.querySelector(".houseColours").classList.add(student.house);
  document.querySelector("[data-field=studentPortait]").src = student.imageFile;
  document.querySelector("[data-field=houdeCrest").src = "images/" + student.house + "Crest.svg";
  document.querySelector("[data-field=popFirstName]").textContent = student.firstName;
  document.querySelector("[data-field=popMiddleName]").textContent = student.middleName;
  document.querySelector("#pop-up [data-field=prefect]").dataset.prefect = student.prefect;
  document.querySelector("#pop-up [data-field=expelled]").dataset.expelled = student.expelled;
  if (student.nickName != undefined) {
    document.querySelector("[data-field=popNickname]").textContent = `"${student.nickName}"`;
  }
  document.querySelector("[data-field=popLastName]").textContent = `${student.lastName}, `;
  document.querySelector("[data-field=popHouse]").textContent = student.house;
  document.querySelector("[data-field=bloodStatus]").textContent = student.bloodStatus;
  document.querySelector("#pop-up").classList.remove("hidden");
  document.querySelector(".closeButton").addEventListener("click", () => {
    document.querySelector(".houseColours").classList.remove(student.house);
    document.querySelector("#pop-up").classList.add("hidden");
  });
}

//Expell
function tryToExpell(selectedStudent) {
  document.querySelector("#expelWarning").classList.remove("hidden");
  document.querySelector("#expelWarning [data-field=expelledStudent]").textContent = selectedStudent.firstName;
  document.querySelector("#expelWarning .closeButton").addEventListener("click", closeDialog);

  document.querySelector("#expelWarning #removeStudent").addEventListener("click", expelStudent);

  function expelStudent() {
    let index = currentData.indexOf(selectedStudent);
    selectedStudent.expelled = true;
    selectedStudent.prefect = false;
    selectedStudent.inquisitorial = false;
    expelledData.push(selectedStudent);
    currentData.splice(index, 1);
    closeDialog();
  }

  function closeDialog() {
    document.querySelector("#expelWarning .closeButton").removeEventListener("click", closeDialog);
    document.querySelector("#expelWarning #removeStudent").removeEventListener("click", expelStudent);
    document.querySelector("#expelWarning").classList.add("hidden");
    buildList();
  }
}

//Prefect
function tryToMakeAPrefect(selectedStudent) {
  const prefects = currentData.filter((student) => student.prefect);
  const gryffindorPrefects = prefects.filter((student) => student.house === "Gryffindor");
  const hufflepuffPrefects = prefects.filter((student) => student.house === "Hufflepuff");
  const slytheringPrefects = prefects.filter((student) => student.house === "Slytherin");
  const ravenclawPrefects = prefects.filter((student) => student.house === "Ravenclaw");

  if (selectedStudent.house === "Gryffindor" && gryffindorPrefects.length >= 2) {
    removeAorB(gryffindorPrefects[0], gryffindorPrefects[1]);
  } else if (selectedStudent.house === "Hufflepuff" && hufflepuffPrefects.length >= 2) {
    removeAorB(hufflepuffPrefects[0], hufflepuffPrefects[1]);
  } else if (selectedStudent.house === "Slytherin" && slytheringPrefects.length >= 2) {
    removeAorB(slytheringPrefects[0], slytheringPrefects[1]);
  } else if (selectedStudent.house === "Ravenclaw" && ravenclawPrefects.length >= 2) {
    removeAorB(ravenclawPrefects[0], ravenclawPrefects[1]);
  } else {
    makePrefect(selectedStudent);
  }

  function removeAorB(prefectA, prefectB) {
    //ask user to ignore or remove, a or b
    document.querySelector("#prefectWarning").classList.remove("hidden");
    document.querySelector("#prefectWarning .closeButton").addEventListener("click", closeDialog);
    document.querySelector("#prefectWarning #removea").addEventListener("click", clickRemoveA);
    document.querySelector("#prefectWarning #removeb").addEventListener("click", clickRemoveB);
    //shownames
    document.querySelector("#prefectWarning [data-field=prefectA]").textContent = prefectA.firstName;
    document.querySelector("#prefectWarning [data-field=prefectB]").textContent = prefectB.firstName;
    document.querySelector("#prefectWarning [data-field=prefectHouse]").textContent = selectedStudent.house;

    //if use ignore - do nothing
    function closeDialog() {
      document.querySelector("#prefectWarning").classList.add("hidden");
      document.querySelector("#prefectWarning .closeButton").removeEventListener("click", closeDialog);
      document.querySelector("#prefectWarning #removea").removeEventListener("click", clickRemoveA);
      document.querySelector("#prefectWarning #removeb").removeEventListener("click", clickRemoveB);
    }
    //if user remove a:
    function clickRemoveA() {
      removePrefect(prefectA);
      makePrefect(selectedStudent);
      buildList();
      closeDialog();
    }
    //if user remove b:
    function clickRemoveB() {
      removePrefect(prefectB);
      makePrefect(selectedStudent);
      buildList();
      closeDialog();
    }
  }
  function removePrefect(prefectStudent) {
    prefectStudent.prefect = false;
  }

  function makePrefect(student) {
    student.prefect = true;
  }
}

//Cleaning data
function firstNameClean(firstNames) {
  firstNames = firstNames.charAt(0).toUpperCase() + firstNames.slice(1);
  let firstName = firstNames;
  return firstName;
}

function middleNameClean(middleNames) {
  middleNames = middleNames.toString();
  middleNames = middleNames.charAt(0).toUpperCase() + middleNames.slice(1);
  let middleName = middleNames;
  return middleName;
}

function nicknameClean(nickNames) {
  nickNames = nickNames.replaceAll(`"`, ``);
  nickNames = nickNames.charAt(0).toUpperCase() + nickNames.slice(1);
  let nickName = nickNames;
  return nickName;
}

function lastNameClean(lastNames) {
  lastNames = lastNames.charAt(0).toUpperCase() + lastNames.slice(1);
  return lastNames;
}

function lastNameHyphen(lastNames) {
  lastNames = lastNames.charAt(0).toUpperCase() + lastNames.slice(1);
  const hyphenName = lastNames.split("-");
  hyphenName[1] = hyphenName[1].charAt(0).toUpperCase() + hyphenName[1].slice(1);
  lastNames = hyphenName.join("-");
  return lastNames;
}

function imageFileLocate(imageTitle) {
  if (imageTitle[imageTitle.length - 1] === "patil") {
    let imageName = `images/${imageTitle[imageTitle.length - 1]}_${imageTitle[0]}.png`;
    return imageName;
  } else if (imageTitle[imageTitle.length - 1].includes("-")) {
    let imageName = imageTitle[imageTitle.length - 1].split("-");
    imageName = `images/${imageName[1]}_${imageTitle[0].charAt(0)}.png`;
    return imageName;
  } else {
    let imageName = `images/${imageTitle[imageTitle.length - 1]}_${imageTitle[0].charAt(0)}.png`;
    return imageName;
  }
}

function houseFind(houseNames) {
  let houseSort = houseNames.toLowerCase();
  houseSort = houseSort.charAt(0).toUpperCase() + houseSort.slice(1);
  return houseSort;
}

function checkBloodStatus(lastName) {
  let familyStatus = "Muggle-born";
  if (lastName === "No Last Name") {
    familyStatus = "Unknown";
  } else if (familyJSON.half.includes(lastName)) {
    familyStatus = "Halfblood";
  } else if (familyJSON.pure.includes(lastName)) {
    familyStatus = "Pureblood";
  }
  return familyStatus;
}

//Hacking
window.addEventListener("keydown", (event) => {
  if (event.code === "Digit8" && event.key === "8") {
    hackTheSystem();
  }
});
function hackTheSystem() {
  isHacked = true;
  const injectMe = new injectHacker("Terese", "Tess", "Jensen", "Hufflepuff", false, false, false, "Muggle-born", "hacker");

  if (allStudentData[allStudentData.length - 1].firstName != "Terese") {
    allStudentData.push(injectMe);
    currentData.push(injectMe);
    currentData.forEach(removePrivilege);
    currentData.forEach(scrambleBloodStatus);
    setFontHack();
    removedFromGroup("All Students", "Inqusitorial");
    buildList();
  }
}
function injectHacker(firstName, nickName, lastName, house, expelled, prefect, inquisitorial, bloodStatus, title) {
  this.firstName = firstName;
  this.nickName = nickName;
  this.lastName = lastName;
  this.house = house;
  this.expelled = expelled;
  this.prefect = prefect;
  this.inquisitorial = inquisitorial;
  this.bloodStatus = bloodStatus;
  this.title = title;
}
function scrambleBloodStatus(student) {
  if (student.bloodStatus === "Muggle-born") {
    student.originalBlood = "Muggle-born";
    student.bloodStatus = "Pureblood";
  } else if (student.bloodStatus === "Halfblood") {
    student.originalBlood = "Halfblood";
    student.bloodStatus = "Pureblood";
  } else if (student.bloodStatus === "Unknown") {
    student.originalBlood = "Unknown";
    student.bloodStatus = "Pureblood";
  } else {
    student.originalBlood = "Pureblood";
    function randomNumber(max) {
      return Math.floor(Math.random() * max);
    }
    let bloodStatusArray = ["Halfblood", "Pureblood", "Muggle-born"];
    let x = randomNumber(3);
    student.bloodStatus = bloodStatusArray[x];
  }
}
function setFontHack() {
  var link = document.createElement("link");
  link.setAttribute("rel", "stylesheet");
  link.setAttribute("type", "text/css");
  link.setAttribute("href", "https://fonts.googleapis.com/css2?family=Libre+Barcode+39&display=swap");
  document.head.appendChild(link);

  document.querySelector("main").style.backgroundColor = "var(--fith-colour)";
  document.querySelector("main h1").style.fontFamily = "'Libre Barcode 39', cursive";
  document.querySelector(".listFiltering h5").style.fontFamily = "'Libre Barcode 39', cursive";
  document.querySelector(".listSorting h5").style.fontFamily = "'Libre Barcode 39', cursive";
}
function removePrivilege(student) {
  student.inquisitorial = false;
}

function reScramble(student) {
  if (student.originalBlood === "Pureblood") {
    function randomNumber(max) {
      return Math.floor(Math.random() * max);
    }
    let bloodStatusArray = ["Halfblood", "Pureblood", "Muggle-born"];
    let x = randomNumber(3);
    student.bloodStatus = bloodStatusArray[x];
  }
}

function aboutDisplay(currentInfo) {
  let amountGryffindor = allStudentData.filter(isGryffindor).length;
  let amountHufflepuff = allStudentData.filter(isHufflepuff).length;
  let amountSlytherin = allStudentData.filter(isSlytherin).length;
  let amountRavenclaw = allStudentData.filter(isRavenclaw).length;

  document.querySelector(".listsInfo [data-field=amountCurrentDisplay]").textContent = currentInfo.length;
  document.querySelector(".listsInfo [data-field=amountCurrentStudents]").textContent = currentData.length;
  document.querySelector(".listsInfo [data-field=amountExpelled]").textContent = expelledData.length;
  document.querySelector(".listsInfo [data-field=amountGryffindor]").textContent = amountGryffindor;
  document.querySelector(".listsInfo [data-field=amountHufflepuff]").textContent = amountHufflepuff;
  document.querySelector(".listsInfo [data-field=amountSlytherin]").textContent = amountSlytherin;
  document.querySelector(".listsInfo [data-field=amountRavenclaw]").textContent = amountRavenclaw;
}
