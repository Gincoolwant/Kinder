const BASE_URL = "https://lighthouse-user-api.herokuapp.com/";
const INDEX_URL = BASE_URL + "api/v1/users/";

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form")
const searchInput = document.querySelector('#search-bar')
const likeBtn = document.querySelector('#btn-like')
const paginator = document.querySelector('#paginator')

const likeList = JSON.parse(localStorage.getItem('likeList')) || []
let filterList = []
const cardsPerPage = 36

function getPeopleListByPage(page){
  const showList = filterList.length ? filterList : likeList
  
  const startIndex = (page - 1) * cardsPerPage
  const lastIndex = startIndex + cardsPerPage

  return showList.slice(startIndex, lastIndex)
}


function removeFromLikeList(id) {
  const deletePersonIndex = likeList.findIndex(person => person.id === id)
  
  likeList.splice(deletePersonIndex, 1)
  localStorage.setItem('likeList', JSON.stringify(likeList))

  paginatorRender(likeList)
  renderDataPanel(getPeopleListByPage(1))
}

function renderDataPanel(list) {
  let rawHtml = "";
  list.forEach((item) => {
    rawHtml += `
    <div class="col-sm-2 mb-2">
      <div class="card shadow p-1 mb-2 bg-body rounded">
        <img src="${item.avatar}" class="avatar" alt="user-avatar" data-bs-toggle="modal" data-bs-target="#user-modal" data-id="${item.id}">
        <div class="card-body d-flex justify-content-between align-items-center p-1">
          <div style="font-size: 16px">${item.name} ${item.surname}, ${item.age} </div>
            <button type="button" class="btn btn-outline-danger btn-sm btn-dislike" data-id="${item.id}" id="btn-dislike">
            <i class="fa-solid fa-trash-can icon-delete"></i>
          </button>
        </div>
      </div>
    </div>
      `
  })
  dataPanel.innerHTML = rawHtml
}

function renderUserModal(id) {
  const modalTitle = document.querySelector("#user-modal-title");
  const modalContent = document.querySelector("#user-modal-content");
  axios
    .get(INDEX_URL + id)
    .then((response) => {
      const infor = response.data;
      modalTitle.innerText = `${infor.name} ${infor.surname}`;
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

function paginatorRender(list) {
  const amount = list.length
  if (amount === 0) return paginator.innerHTML = `Go Like Someone ! Let's get started~`
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
    renderUserModal(targetId);
  }else if (target.matches(".btn-dislike")) {
    removeFromLikeList(Number(targetId))
  }else if (target.matches(".icon-delete")) {
      removeFromLikeList(Number(target.parentElement.dataset.id))
  }
  
});

searchForm.addEventListener('keyup', function clickOnBtnSubmitted(event) {
  event.preventDefault()
  
  const keyword = searchInput.value.trim().toLowerCase()
  
  filterList = likeList.filter(person => {
    let fullName = `${person.name} ${person.surname}`
    return fullName.toLowerCase().includes(keyword)
  })
  paginatorRender(filterList)
  renderDataPanel(getPeopleListByPage(1))
})

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

paginatorRender(likeList)
renderDataPanel(getPeopleListByPage(1));
