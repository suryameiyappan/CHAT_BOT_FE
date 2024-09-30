let loadChatBot = true;
async function lazy() {
  window.chatBotConfig = {
    "bot": "x17260488102373095",
    "api_key": "aca4cfc9-8839-46bc-928c-6d386564ddc8",
    "cookie": "BczxhRT5J3uZ7dUwDd64564gfdfgdfg456456t9",
    "boot_host": "http://chat-bot-fe.dv/",
    "host": "http://product-service-be.dv/",
    "messanger": "ChatMessanger",
    "session_key": "SLIC_CHAT_TOKEN",
    "language" : "ENGLISH"
  };
  var resource = document.createElement("script");
  if (loadChatBot == true) {
    resource.async = "true";
    resource.src = "http://chat-bot-fe.dv/dist/plugin/main.min.js";
    var script = document.getElementsByTagName("script")[0];
    script.parentNode.insertBefore(resource, script);
    loadChatBot = false;
    return loadChatBot;
  }
}
document.addEventListener("keydown", (event) => {
  lazy();
});
window.onscroll = function (e) {
  lazy();
};
window.onmousemove = function () {
  lazy();
};