const BASE_URL = "https://lighthouse-user-api.herokuapp.com/";
const INDEX_URL = BASE_URL + "api/v1/users/";

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form")
const searchInput = document.querySelector('#search-bar')
const paginator = document.querySelector('#paginator')
const selector = document.querySelector('#selector')
const dropdownMenu = document.querySelector('#dropdownMenu')
// const test1 = document.querySelector('.fa-heart')
// console.log(1,test1)

const peopleList = [];
let filterList = []
const cardsPerPage = 24
const defaultAgeLowerBound = 0
const defaultAgeUpperBound = 150
let genderList = []
let regionList = []

// 切分分頁user list
function getPeopleListByPage(page){
  const showList = filterList.length ? filterList : peopleList
  
  const startIndex = (page - 1) * cardsPerPage
  const lastIndex = startIndex + cardsPerPage

  return showList.slice(startIndex, lastIndex)
}

// 加入like名單(存取localStrage)
function addToLikeList(id) {
  const likeList = JSON.parse(localStorage.getItem('likeList')) || []
  const person = peopleList.find(person => person.id === id)

  likeList.push(person)
  localStorage.setItem('likeList', JSON.stringify(likeList))
}

// 移除like名單(存取localStrage)
function removeFromLikeList(id) {
  const likeList = JSON.parse(localStorage.getItem('likeList')) || []
  const deletePersonIndex = likeList.findIndex(person => person.id === id)
  likeList.splice(deletePersonIndex, 1)
  localStorage.setItem('likeList', JSON.stringify(likeList))
}

// render age search畫面
function renderAgeSelector(lowerBound, upperBound) {
  const ageLowerBoundSelector = document.querySelector('#age-lower-bound')
  const ageUpperBoundSelector = document.querySelector('#age-upper-bound')
  ageLowerBoundSelector.value = lowerBound
  ageUpperBoundSelector.value = upperBound
}

// render gender search畫面
function renderGenderSelector(list) {
  
  const genderSelector = document.querySelector('#gender-select')
  const option = document.createElement('option')
  option.setAttribute("value", "all")
  option.setAttribute("id", `all`)
  option.innerText = `ALL`
  genderSelector.append(option)

  
  list.forEach((gender) => {
    const option = document.createElement('option')
    option.setAttribute("value", `${gender}`)
    option.setAttribute("id", `${gender}`)
    option.innerText = `${gender}`
    genderSelector.append(option)
  })

  // const defaultSelected = document.querySelector(`#${defaultSelectedTag.toUpperCase()}`)
  // if (defaultSelected.id === 'MALE' || defaultSelected.id === 'FEMALE'){
  //   defaultSelected.setAttribute("selected", "")
  // }
  
}

// render region search畫面
function renderRegionSelector(list) {
  
  const regionSelector = document.querySelector('#region-select')
  const option = document.createElement('option')
  option.setAttribute("value", "all")
  option.setAttribute("id", `all`)
  option.innerText = `ALL`
  regionSelector.append(option)

  list.forEach((region) => {
    const option = document.createElement('option')
    option.setAttribute("value", `${region}`)
    option.setAttribute("id", `${region}`)
    option.innerText = `${region}`
    regionSelector.append(option)
  })

  // const defaultSelected = document.querySelector(`#${defaultSelectedTag.toUpperCase()}`)
  // defaultSelected.setAttribute("selected", "")
  
}

// render gear dropdowns
function renderSearchDropdownMenu(list) {
  list.forEach(person => {
    if (!genderList.includes(person.gender.toUpperCase())) genderList.push(person.gender.toUpperCase())
    if (!regionList.includes(person.region)) regionList.push(person.region)
  })
  
  renderAgeSelector(defaultAgeLowerBound, defaultAgeUpperBound)
  renderGenderSelector(genderList)
  renderRegionSelector(regionList)     
}

// render主panel user cards畫面
function renderDataPanel(list) {
  let rawHtml = "";
  list.forEach((item) => {
    rawHtml += `
    <div class="col-sm-2 mb-2">
      <div class="card shadow p-1 mb-2 bg-body rounded">
        <img src="${item.avatar}" class="avatar" alt="user-avatar" data-bs-toggle="modal" data-bs-target="#user-modal" data-id="${item.id}">
        <div class="card-body d-flex justify-content-between align-items-center p-1">
          <div style="font-size: 16px">${item.name} ${item.surname}, ${item.age} </div>
          `
    // 控制愛心標記，若在喜歡清單內output fa-solid愛心, 若不在output fa-regular愛心
    const likeList = JSON.parse(localStorage.getItem('likeList')) || [];
    if (likeList.some(person => item.id === person.id)) {
      rawHtml += `
          <button type="button" class="btn btn-outline-danger btn-sm btn-like" data-id="${item.id}" id="btn-like">
            <i class="fa-regular fa-heart icon-heart fa-solid"></i>
          </button>
        </div>
      </div>
    </div>
      `
    }else {
      rawHtml += `
      <button type="button" class="btn btn-outline-dark btn-sm btn-like" data-id="${item.id}" id="btn-dislike">
        <i class="fa-regular fa-heart icon-heart"></i>
      </button>
    </div>
  </div>
</div>
      `
    }
  });
  dataPanel.innerHTML = rawHtml
}

// render user modal畫面
function renderUserModal(id) {
  const modalTitle = document.querySelector("#user-modal-title");
  const modalContent = document.querySelector("#user-modal-content");
  axios
    .get(INDEX_URL + id)
    .then((response) => {
      const infor = response.data;
      modalTitle.innerText = `${infor.name} ${infor.surname}, ${infor.age}`;
      modalContent.innerHTML =  `
      <div class="modal-body">
        <div class="row">
          <div class="col-sm-4">
            <img class="modalAvatar" src="${infor.avatar}" alt="img">
          </div>
          <div class="col-sm-8 pe-0">
            <i class="fa-regular fa-paper-plane"></i>  ${infor.email}<br>
            <i class="fa-regular fa-user"></i> ${infor.gender}<br>
            <i class="fa-solid fa-location-dot"></i> ${infor.region}<br>
            <i class="fa-solid fa-cake-candles"></i> ${infor.birthday}
          </div>
        </div>
      </div>
        `
    })
    .catch((err) => console.log(err));
}

// render頁籤
function paginatorRender(list) {
  const amount = list.length
  const totalPage = Math.ceil(amount / cardsPerPage)
  let rawHTML = ''
  rawHTML += `
  <li class="page-item" data-page="previous">
    <a class="page-link previous" href="#" aria-label="Previous">&laquo;</a>
  </li>
  <li class="page-item" data-page="1">
    <a class="page-link active" href="#" data-page="1">1</a>
  </li>
    `
  for (let page = 2; page <= totalPage; page++) {
    rawHTML += `
    <li class="page-item" data-page="${page}">
      <a class="page-link" href="#" data-page="${page}">${page}</a>
    </li>
    `
  }
  
  rawHTML += `
  <li class="page-item" data-page="next">
    <a class="page-link next" href="#" aria-label="Next">&raquo;</a>
  </li>`
  paginator.innerHTML = rawHTML
  
}

dataPanel.addEventListener("click", function clickOnBtnMore(event) {
  const target = event.target;
  const targetId = Number(target.dataset.id)
  if (target.matches(".avatar")) { 
    // 按頭像打開Modal
    renderUserModal(targetId);
  }else if (target.matches(".btn-like")) {
    // like Btn 紅實心愛心 <-> 黑空心愛心切換
    const btnClass = target.classList
    if (target.children[0].classList.toggle('fa-solid')) {
      // 黑 -> 紅(新增至like清單)
      btnClass.remove("btn-outline-dark")
      btnClass.add("btn-outline-danger")
      target.id = "btn-like"
      addToLikeList(Number(targetId))
    }else {
      // 紅 -> 黑(從like清單移除)
      removeFromLikeList(Number(targetId))
      btnClass.remove("btn-outline-danger")
      btnClass.add("btn-outline-dark")
      target.id = "btn-dislike"
    }
  }else if (target.matches(".icon-heart")) {
    btnClass = target.parentElement.classList
    // heart icon 紅實心愛心 <-> 黑空心愛心切換
    if (target.classList.toggle('fa-solid')) {
      // 黑 -> 紅(新增至like清單)
      btnClass.remove("btn-outline-dark")
      btnClass.add("btn-outline-danger")
      target.parentElement.id = "btn-like"      
      addToLikeList(Number(target.parentElement.dataset.id))
    }else {
      // 紅 -> 黑(從like清單移除)
      btnClass.remove("btn-outline-danger")
      btnClass.add("btn-outline-dark")
      target.parentElement.id = "btn-dislike"
      removeFromLikeList(Number(target.parentElement.dataset.id))
    }
  }
});

// searchform掛上監聽器，執行搜尋人名功能
searchForm.addEventListener('keyup', function clickOnBtnSubmitted(event) {
  event.preventDefault()
  
  const keyword = searchInput.value.trim().toLowerCase()
  // 由完整user list中filter出全名包含關鍵字的user
  filterList = peopleList.filter(person => {
    let fullName = `${person.name} ${person.surname}`
    return fullName.toLowerCase().includes(keyword)
  })
  paginatorRender(filterList)
  renderDataPanel(getPeopleListByPage(1))
})

// gear submit鍵掛上監聽器，執行age gender region搜尋功能
selector.addEventListener('submit', (event) =>{
  event.preventDefault()
  const genderSelector = document.querySelector('#gender-select')
  const genderKeyword = genderSelector.value.toLowerCase()
  
  const regionSelector = document.querySelector('#region-select')
  const regionKeyword = regionSelector.value.toLowerCase()

  const ageLowerBoundSelector = document.querySelector('#age-lower-bound')
  const ageUpperBoundSelector = document.querySelector('#age-upper-bound')
  const ageLowerBound = ageLowerBoundSelector.value
  const ageUpperBound = ageUpperBoundSelector.value
  
  // age資料驗證，若前項大於後項，提示錯誤並復歸age欄，不執行主畫面render
  if (Number(ageLowerBound) > Number(ageUpperBound)){
    alert('Please check the range of Age')
    renderAgeSelector(defaultAgeLowerBound, defaultAgeUpperBound)
    return
  }

  // flow control age/ gender/ region組合，執行filter list
  if (genderKeyword === 'all' && regionKeyword === 'all') {
    filterList = peopleList.filter(person => person.age >= ageLowerBound && person.age <= ageUpperBound)
  } else if (genderKeyword === 'all'){
    filterList = peopleList.filter(person => person.region.toLowerCase() === regionKeyword && (person.age >= ageLowerBound && person.age <= ageUpperBound))
  } else if (regionKeyword === 'all') {
    filterList = peopleList.filter(person => person.gender.toLowerCase() === genderKeyword && (person.age >= ageLowerBound && person.age <= ageUpperBound))
  } else{
    filterList = peopleList.filter(person => (person.gender.toLowerCase() === genderKeyword) && (person.region.toLowerCase() === regionKeyword) && (person.age >= ageLowerBound && person.age <= ageUpperBound))
  }

  // 提示無搜尋配對結果，不執行主畫面render
  if (filterList.length === 0) {
    alert('Oops! Your matches are just on the way to join~')
    return
  }

  // 根據filter結果重新render分頁籤 & 主user畫面
  paginatorRender(filterList)
  renderDataPanel(getPeopleListByPage(1))  
})

// 分頁籤掛上監聽器，執行分頁render及上/ 下頁切換功能
paginator.addEventListener('click', function clickOnPaginator(event){
  const target = event.target
  let page = 0
  if (target.tagName !== 'A') return

  const activePage = document.querySelector('.page-link.active')
  if (target.matches('.previous') && activePage.dataset.page === "1") return
  if (target.matches('.next') && activePage.parentElement.nextElementSibling.dataset.page === "next") return

  activePage.classList.toggle('active')
  
  if (target.matches('.previous')) {
    activePage.parentElement.previousElementSibling.children[0].classList.toggle('active')
    page = activePage.parentElement.previousElementSibling.dataset.page
  }else if (target.matches('.next')) {
    activePage.parentElement.nextElementSibling.children[0].classList.toggle('active')
    page = activePage.parentElement.nextElementSibling.dataset.page
  }else{
    target.classList.toggle('active')
    page = target.dataset.page
  }

  renderDataPanel(getPeopleListByPage(Number(page)))
})

axios.get(INDEX_URL)
  .then((response) => {
    peopleList.push(...response.data.results);
    paginatorRender(peopleList)
    renderDataPanel(getPeopleListByPage(1));
    renderSearchDropdownMenu(peopleList)
  })
  .catch((err) => console.log(err));

// const test2 = document.querySelector('.fa-heart')
// console.log(2,test2)