"use strict";
//Initialize
document.addEventListener("DOMContentLoaded", start);

//Variables
const url = "https://petlatkea.dk/2021/hogwarts/students.json";
let cleanedData = [];

const settings = {
  filter: "all",
  sortBy: "name",
  sortDir: "asc",
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
};

function start() {
  console.log("ready");
  registerButtons();
  loadJSON();
}

//Buttons
function registerButtons() {
  document
    .querySelectorAll("[data-action='filter']")
    .forEach((button) => button.addEventListener("click", selectFilter));
  document
    .querySelectorAll("[data-action='sort']")
    .addEventListener("change", selectSort);
}

async function loadJSON() {
  const response = await fetch(url);
  const jsonData = await response.json();
  prepareObjects(jsonData);
}

function prepareObjects(jsonData) {
  cleanedData = jsonData.map(prepareObject);

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
  // console.log(studentTemp);
  cleanedData.push(studentTemp);

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
  hyphenName[1] =
    hyphenName[1].charAt(0).toUpperCase() + hyphenName[1].slice(1);
  lastNames = hyphenName.join("-");
  return lastNames;
}

function imageFileLocate(imageTitle) {
  if (imageTitle[imageTitle.length - 1] === "patil") {
    let imageName = `images/${imageTitle[imageTitle.length - 1]}_${
      imageTitle[0]
    }.png`;
    return imageName;
  } else if (imageTitle[imageTitle.length - 1].includes("-")) {
    let imageName = imageTitle[imageTitle.length - 1].split("-");
    imageName = `images/${imageName[1]}_${imageTitle[0].charAt(0)}.png`;
    return imageName;
  } else {
    let imageName = `images/${
      imageTitle[imageTitle.length - 1]
    }_${imageTitle[0].charAt(0)}.png`;
    return imageName;
  }
}

function houseFind(houseNames) {
  let houseSort = houseNames.toLowerCase();
  houseSort = houseSort.charAt(0).toUpperCase() + houseSort.slice(1);
  return houseSort;
}
//Filtering
function selectFilter(event) {
  const filter = event.target.dataset.filter;
  console.log(filter);
  filterList(filter);
}
function filterList(filterOption) {
  let filteredList = cleanedData;
  if (filterOption === "hufflepuff") {
    filteredList = cleanedData.filter(isHufflepuff);
    console.log(filteredList);
  } else if (filterOption === "gryffindor") {
    filteredList = cleanedData.filter(isGryffindor);
    console.log(filteredList);
  } else if (filterOption === "slytherin") {
    filteredList = cleanedData.filter(isSlytherin);
    console.log(filteredList);
  } else if (filterOption === "ravenclaw") {
    filteredList = cleanedData.filter(isRavenclaw);
    console.log(filteredList);
  }
  showData(filteredList);
}

function isHufflepuff(houseIs) {
  return houseIs.house === "Hufflepuff";
}
function isGryffindor(houseIs) {
  return houseIs.house === "Gryffindor";
}
function isSlytherin(houseIs) {
  return houseIs.house === "Slytherin";
}
function isRavenclaw(houseIs) {
  return houseIs.house === "Ravenclaw";
}

/////////////////////////////////////////////////////////
//Show data

function showData(students) {
  document.querySelector("#pasteTemplate").innerHTML = "";
  students.forEach(showStudent);
}
function showStudent(student) {
  const myTemplate = document.querySelector("#newTemplate").content;
  const myCopy = myTemplate.cloneNode(true);
  //Change Here
  myCopy.querySelector("[data-field=firstName]").textContent =
    student.firstName;
  myCopy.querySelector("[data-field=lastName]").textContent = student.lastName;
  myCopy.querySelector("[data-field=house]").textContent = student.house;
  if (student.middleName != undefined) {
    myCopy.querySelector(".middleName").textContent = student.middleName;
  }
  if (student.nickName != undefined) {
    myCopy.querySelector("[data-field=nickName]").textContent =
      student.nickName;
  }
  /* myCopy.querySelector(".imgStudent").src = student.imageFile;
  myCopy.querySelector(".imgStudent").alt = `Image of ${student.lastName}`; */
  //Paste Change
  const parent = document.querySelector("#pasteTemplate");
  parent.appendChild(myCopy);
}
