const formLogin = document.querySelector(".login-section ");
const formSignUp = document.querySelector(".signUp-section");
const listNav = document.querySelector(".list-tags");
let tags = document.querySelectorAll(".list-tag");
let filterTarget;
const renderList = document.querySelector(".render-List");
const signOutBtn = document.querySelector(".todo-nav-btn");

//剛進入網頁確認是否是登入狀態
setAxiosToken();

//表單顯示登入或註冊帳號
function toggleForms(showLogin) {
  if (showLogin) {
    // 顯示登入表單，隱藏註冊表單
    formLogin.style.display = "flex";
    formSignUp.style.display = "none";
  } else {
    // 顯示註冊表單，隱藏登入表單

    formLogin.style.display = "none";
    formSignUp.style.display = "flex";
  }
}

//驗證登入表單
function validateLoginForm(event) {
  // 防止表單提交
  event.preventDefault();

  // 獲取帳號和密碼的值
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  // 檢查帳號和密碼是否為空
  if (!username) {
    alert("帳號不可以為空!");
    return false; // 阻止表單提交
  }

  if (!checkPwd(password)) {
    return false; // 如果密碼檢查不通過，阻止表單提交
  }
  // 如果帳號和密碼都不為空，則可以提交表單
  login(username, password);
}

//登入密碼
function checkPwd(password) {
  if (!password) {
    alert("密碼不可以為空!");
    return false; // 阻止表單提交
  } else if (password.length <= 6) {
    alert("密碼不可以小於6");
  } else {
    return true; // 如果密碼不為空，返回 true
  }
}

//帳密註冊
function validateSignUpForm(event) {
  // 防止表單提交
  event.preventDefault();

  // 獲取帳號和密碼的值
  const email = document.getElementById("email").value.trim();
  const nickName = document.getElementById("nickname").value.trim();
  const password = document.getElementById("sighUpPassword").value.trim();
  const confirmPassword = document
    .getElementById("confirm_password")
    .value.trim();

  // 檢查帳號是否為空
  if (!email) {
    alert("帳號不可以為空白!");
    return false; // 阻止表單提交
  }

  if (!nickName) {
    alert("暱稱不可以為空白!");
    return false; // 阻止表單提交
  }

  if (!checkPwd(password) || !checkPwdSame(password, confirmPassword)) {
    return false; // 如果密碼檢查不通過，阻止表單提交
  }
  // 如果帳號和密碼都不為空，則可以提交表單

  signUp(email, nickName, password);
}

// 驗證密碼是否一致
function checkPwdSame(pwd, conPwd) {
  if (pwd !== conPwd) {
    alert("密碼與再次輸入密碼不一致，請重新確認！");
    return false;
  }
  return true;
}

//登入後隱藏區塊
function hideElementIfNotNone(selector) {
  const element = document.querySelector(selector);
  //如果display不是none的話改為none
  if (element.style.display !== "none") {
    element.style.display = "none";
  }
}

function setAxiosToken() {
  token = localStorage.getItem("token"); //取得網頁中的token元素
  const nickname = localStorage.getItem("nickname"); //取得網頁中的token元素
  axios.defaults.headers.common["Authorization"] = token; //登入成功後設定axios的預設token
  if (token) {
    hideElementIfNotNone(".login");
    hideElementIfNotNone(".signUp");
    const todo = document.querySelector(".todo");
    todo.classList.remove("none");
    todo.querySelector("p").textContent = `${nickname}的代辦`;
    getTodo();
  } else {
    return;
  }
}

function signOutTodoList() {
  signOut(token);
}

function addItemsForm(event) {
  event.preventDefault();
  const addText = document.getElementById("addText").value.trim();
  if (!addText) {
    alert("代辦事項不可以為空白!");
    return false; // 阻止表單提交
  }

  addTodo(addText);
}

//監聽列表點擊
renderList.addEventListener("click", (event) => {
  const target = event.target;

  //如果點擊到文字內容，可修改內容
  if (target.tagName == "SPAN") {
    startEdit(target);
  }
});

function startEdit(e) {
  e.setAttribute("contenteditable", "true");
  e.focus();

  // 元素失去focus後執行
  e.onblur = function () {
    finishEdit(e);
  };

  document.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault(); //防止換行
      e.blur(); //取消焦點
    }
  });
}

function finishEdit(element) {
  element.setAttribute("contenteditable", "false");
  const todoItem = element.closest(".todo-item");
  fixTodo(element.textContent.trim(), todoItem.dataset.id);
}

//渲染畫面邏輯
function renderTodoList(curTodos, unfinished) {
  let dataList = "";
  if (curTodos.length === 0) {
    renderList.innerHTML = `<h2>目前尚無代辦事項</h2>
       <img
              width="240px"
              height="250px"
              src="./image/8911ab6dcbda98df56e26aa23c6643ac.png"
              alt="list-img"
            />`;

    return; // 如果沒有待辦事項，提前返回
  }

  curTodos.sort((a, b) => a.id.localeCompare(b.id)); //依todolist的ID做排序
  curTodos.forEach((item) => {
    let isChecked = item.completed_at ? "checked" : "";
    let addCheckClass = item.completed_at ? "list-addcheck" : "";

    dataList += `<div class="todo-item" data-id="${item.id}">
        <input id="${item.id}" type="checkbox" class="todo-checkbox" ${isChecked} onchange="toggleTodo('${item.id}')">
        <span class="todo-content ${addCheckClass}" contenteditable="false" >${item.content}</span>
        <button class="delete-btn" onclick="deleteTodo('${item.id}')">✕</button>
      </div>
      `;
  });

  dataList += `<div class="list-footer"><p>${unfinished}個待完成項目</p>
    <a href="#" onclick ="deleteFinishedList(event)">清除已完成項目</a></div>`;

  renderList.innerHTML = dataList;
  document.getElementById("addText").value = ""; // 清空input輸入內容
}

function deleteFinishedList(e) {
  e.preventDefault();
  todos.forEach((e) => {
    if (e.completed_at !== null) {
      deleteTodo(e.id);
    }
  });
}

tags.forEach((tag) => {
  tag.addEventListener("click", function (e) {
    filterTarget = e.target.innerText;
    setCurTodo();
    // 先移除所有元素的 list-active 樣式
    tags.forEach((tag) => tag.classList.remove("list-active"));
    // 為當前點擊的元素添加 list-active 樣式
    this.classList.add("list-active");
  });
});

function setCurTodo() {
  let curTodos =
    {
      全部: todos,
      已完成: todos.filter((item) => item.completed_at !== null),
      待完成: todos.filter((item) => item.completed_at === null),
    }[filterTarget] || [];

  renderTodoList(curTodos, unfinished);
}

signOutBtn.addEventListener("click", signOutTodoList);
