const apiUrl = `https://todoo.5xcamp.us`;

let todos = []; //儲存todoList資料
let token = ""; //儲存金鑰
let unfinished = 0;

//註冊
function signUp(email, nickname, pwd) {
  axios
    .post(`${apiUrl}/users`, {
      user: {
        email: email,
        nickname: nickname,
        password: pwd,
      },
    })
    .then((res) =>
      alert(
        `${res.data.message}！${res.data.nickname}您好！您的帳號是:${res.data.email}`
      )
    )
    .catch((error) =>
      alert(error.response.data.message + " " + error.response.data.error)
    );
}

//登入
function login(email, pwd) {
  axios
    .post(`${apiUrl}/users/sign_in`, {
      user: {
        email: email,
        password: pwd,
      },
    })
    .then((res) => {
      alert(res.data.message);
      //紀錄已經登入的token
      localStorage.setItem("token", res.headers.authorization);
      localStorage.setItem("nickname", res.data.nickname);

      //登入成功後設定token渲染todolist畫面
      setAxiosToken();
    })
    .catch((error) => alert(error.response.data.message));
}

function signOut(token) {
  axios
    .delete(`${apiUrl}/users/sign_out`)
    .then((res) => {
      alert(res.data.message);
    })
    .catch((error) => alert(error.response.data.message))
    .finally(() => {
      localStorage.clear();
      window.location.reload();
    });
}

//取得todolist
function getTodo() {
  axios
    .get(`${apiUrl}/todos`)
    .then((res) => {
      console.log(res.data);
      todos = res.data.todos;

      todos.length > 0
        ? (listNav.style.visibility = "visible")
        : (listNav.style.visibility = "hidden");

      //算出未完成項目數量
      unfinished = todos.filter((e) => e.completed_at === null).length;

      //判斷是否存有filterTarget或者為全部，渲染整筆資料
      //判斷為否則進行篩選
      if (filterTarget === "全部" || !filterTarget) {
        renderTodoList(todos, unfinished);
      } else {
        setCurTodo();
      }
    })
    .catch((error) => console.log(error.response.data));
}

//添加todoList
function addTodo(content) {
  return axios
    .post(`${apiUrl}/todos`, {
      todo: {
        content: content,
      },
    })
    .then((res) => {
      getTodo();
      alert(`新增成功！${res.data.content}`);
      tags.forEach((t) => t.classList.remove("list-active"));
      tags[0].classList.add("list-active");
    })
    .catch((error) => alert(error.response.data.message));
}

//修改todolist
function fixTodo(content, todoId) {
  axios
    .put(`${apiUrl}/todos/${todoId}`, {
      todo: {
        content: content,
      },
    })
    .then((res) => {})
    .catch((error) => console.log(error.response));
}

//刪除todolist
function deleteTodo(todoId) {
  axios
    .delete(`${apiUrl}/todos/${todoId}`)
    .then((res) => {
      getTodo();
    })
    .catch((error) => console.log(error.response));
}

function toggleTodo(todoId) {
  axios
    .patch(`${apiUrl}/todos/${todoId}/toggle`, {})
    .then((res) => {
      getTodo();
    })
    .catch((error) => console.log(error.response));
}
