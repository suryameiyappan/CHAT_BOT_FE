function apiCall(url,data,headersReq ,callbackRes){
  fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: headersReq
    }).then(res => res.json())
    .then(response => callbackRes(response)
    )
    .catch(error => console.error('Error:', error));
}

let login = document.getElementById("login");
login?.addEventListener('click', (event)=>{
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    let ReqBody = {
        "module": "Auth",
        "module_code": "JWTAUTH",
        "action": "login",
        "data" : {
          "email": email.value,
          "password": password.value
        }
    };
    let headers = {
        "Content-Type": "application/json"
    };
    apiCall("/api/auth/login", ReqBody, headers, response => {
      if (response.code == 200) {
        sessionStorage.setItem("SLIC_CHAT_TOKEN", response.data)
        window.location = "/dashboard";
      } else {
        alert("invalid credentials");
      }
    });
});