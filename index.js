"use strict";
//Initialize
document.addEventListener("DOMContentLoaded", start);

//Variables
const url = "https://petlatkea.dk/2021/hogwarts/students.json";
let cleanedData = [];
let expelledData = [];

const settings = {
  filter: "all",
  sortBy: "firstName",
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
  inquisitorial: false,
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
  document.querySelector("#sorting").addEventListener("click", selectSorting);
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

function filterList(filteredList) {
  if (settings.filter === "hufflepuff") {
    console.log(settings.filter);
    filteredList = filteredList.filter(isHufflepuff);
  } else if (settings.filter === "gryffindor") {
    console.log(settings.filter);
    filteredList = filteredList.filter(isGryffindor);
  } else if (settings.filter === "slytherin") {
    console.log(settings.filter);
    filteredList = filteredList.filter(isSlytherin);
  } else if (settings.filter === "ravenclaw") {
    console.log(settings.filter);
    filteredList = filteredList.filter(isRavenclaw);
  } else if (settings.filter === "prefects") {
    console.log(settings.filter);
    filteredList = filteredList.filter(isPrefect);
  } else if (settings.filter === "inquisitorial") {
    console.log(settings.filter);
    filteredList = filteredList.filter(isInquisitorial);
  } else if (settings.filter === "expelled") {
    console.log(settings.filter);
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
  console.log(event);
  console.log("sortBy:", sortBy);
  console.log("sortDir:", sortDir);
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

//Build List
function buildList() {
  const currentList = filterList(cleanedData);
  const sortedList = sortList(currentList);
  // displayList(currentList);
  displayList(sortedList);
}

/////////////////////////////////////////////////////////
//Show data
function displayList(students) {
  document.querySelector("#pasteTemplate").innerHTML = "";
  students.forEach(displayStudent);
}

function displayStudent(student) {
  //create clone
  const myTemplate = document.querySelector("#newTemplate").content;
  const myCopy = myTemplate.cloneNode(true);

  //Easy Content
  myCopy.querySelector("[data-field=firstName]").textContent =
    student.firstName;
  myCopy.querySelector("[data-field=lastName]").textContent = student.lastName;
  myCopy.querySelector("[data-field=house]").textContent = student.house;
  if (student.middleName != undefined) {
    myCopy.querySelector("[data-field=middleName]").textContent =
      student.middleName;
  }
  if (student.nickName != undefined) {
    myCopy.querySelector("[data-field=nickName]").textContent =
      student.nickName;
  }

  //Pop-up Content
  myCopy.querySelector(".studentDiv").addEventListener("click", popOpen);
  function popOpen() {
    console.log(this.querySelector("[data-field=firstName]").textContent);
    document.querySelector("[data-field=studentPortait]").src =
      student.imageFile;
    // document.querySelector("[data-field=houdeCrest").src = `images/${
    //   document.querySelector("[data-field=popHouse]").textContent
    // }Crest.png`;
    document.querySelector("[data-field=houdeCrest").src =
      "images/" + student.house + "Crest.png";
    document.querySelector("[data-field=popFirstName]").textContent =
      this.querySelector("[data-field=firstName]").textContent;
    document.querySelector("[data-field=popMiddleName]").textContent =
      this.querySelector("[data-field=middleName]").textContent;
    document.querySelector("[data-field=popNickname]").textContent = `${
      this.querySelector("[data-field=nickName]").textContent
    }`;
    document.querySelector("[data-field=popLastName]").textContent = `${
      this.querySelector("[data-field=lastName]").textContent
    }, `;
    document.querySelector("[data-field=popHouse]").textContent =
      this.querySelector("[data-field=house]").textContent;
    document.querySelector("#pop-up").classList.remove("hidden");
    document.querySelector(".closeButton").addEventListener("click", () => {
      document.querySelector("#pop-up").classList.add("hidden");
    });
  }
  //Prefect

  //Inquisitorial

  //Expelled

  // append clone
  const parent = document.querySelector("#pasteTemplate");
  parent.appendChild(myCopy);
}
//Show details
/* function popOpen() {
  console.log(this.querySelector("[data-field=firstName]").textContent);
  document.querySelector("[data-field=popFirstName]").textContent = `${
    this.querySelector("[data-field=firstName]").textContent
  }, `;
  document.querySelector("[data-field=popMiddleName]").textContent =
    this.querySelector("[data-field=middleName]").textContent;
  document.querySelector("[data-field=popNickname]").textContent = `"${
    this.querySelector("[data-field=nickName]").textContent
  }"`;
  document.querySelector("[data-field=popLastName]").textContent =
    this.querySelector("[data-field=lastName]").textContent;
  document.querySelector("#pop-up").classList.remove("hidden");
} */

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
