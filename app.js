const apiUrl = `https://todoo.5xcamp.us`;
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

      //渲染todolist畫面
      setAxiosToken();
      getTodo();
    })
    .catch((error) => alert(error.response.data.message));
}

function signOut(token) {
  axios
    .delete(`${apiUrl}/users/sign_out`)
    .then((res) => {
      alert(res.data.message);
    })
    .catch((error) => alert(error.response.data.message));
}

//取得todolist
function getTodo(filter = "", callback = null) {
  axios
    .get(`${apiUrl}/todos`)
    .then((res) => {
      let todos = res.data.todos;
      let unfinished = 0;
      todos.length > 0
        ? (listNav.style.visibility = "visible")
        : (listNav.style.visibility = "hidden");

      //算出未完成項目數量
      // 計算未完成的待辦事項數量
      unfinished = todos.filter((e) => e.completed_at === null).length;

      if (filter === "待完成") {
        todos = todos.filter((item) => item.completed_at === null); // 只保留未完成的
      } else if (filter === "已完成") {
        todos = todos.filter((item) => item.completed_at !== null); // 只保留已完成的
      }
      todos.sort((a, b) => {
        return a.id.localeCompare(b.id);
      }); //用ID來進行項目排序

      if (callback) {
        callback(todos);
      } else {
        renderTodoList(todos, unfinished);
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
      return res.data;
    })
    .catch((error) => console.log(error.response.data.message));
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
      refreshTodoList();
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
