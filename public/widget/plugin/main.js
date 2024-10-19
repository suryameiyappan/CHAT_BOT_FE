import './common.css';

let app = {}, chatConfig = window.parent.chatBotConfig;
app.global = {
  init: function init() {
    app.global.events();
  },
  events: function events() {
    const chatbotDragContainer = document.createElement('div');
    chatbotDragContainer.id = 'chatbot-drag';
    chatbotDragContainer.classList.add('chatbot-loader', 'draggable');
    const chatbotIcon = document.createElement('div');
    chatbotIcon.classList.add('chatbot-toggler');
    chatbotDragContainer.appendChild(chatbotIcon);
    const boxShowHide = document.createElement('div');
    boxShowHide.classList.add('msg-box-show-hide');
    chatbotDragContainer.appendChild(boxShowHide);
    document.body.appendChild(chatbotDragContainer);
    app.global.createWidgetUiFrame();
  },
  createWidgetUiFrame: function createWidgetUiFrame() {
    let chatbotContainer = document.querySelector('.msg-box-show-hide');
    const iframe = document.createElement('iframe');
    iframe.id = 'ymIframe';
    iframe.name = 'ymIframe';
    iframe.allowFullscreen = true;
    iframe.frameBorder = 0;
    iframe.allowTransparency = true;
    iframe.scrolling = 'yes';
    iframe.style.height = 'calc(100vh - 100px)';
    iframe.style.width = '450px';
    chatbotContainer.appendChild(iframe);

    let iframeHead = window.frames['ymIframe'].document.head;
    let iframebody = window.frames['ymIframe'].document.body;

    let metaXUACompatible = document.createElement("meta");
    metaXUACompatible.httpEquiv = "X-UA-Compatible";
    metaXUACompatible.content = "IE=edge";
    iframeHead.appendChild(metaXUACompatible);

    // Create viewport meta tag
    let metaViewport = document.createElement("meta");
    metaViewport.name = "viewport";
    metaViewport.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
    iframeHead.appendChild(metaViewport);

    // Create charset meta tag
    let metaCharset = document.createElement("meta");
    metaCharset.charset = "utf-8";
    iframeHead.appendChild(metaCharset);

    // Create Content-Type meta tag
    let metaContentType = document.createElement("meta");
    metaContentType["http-equiv"] = "Content-Type";
    metaContentType.content = "text/html; charset=utf-8";
    iframeHead.appendChild(metaContentType);

    // Create Js file
    let widgetCssJs = document.createElement('script');
    widgetCssJs.type = 'text/javascript';
    widgetCssJs.src = chatConfig.boot_host + 'dist/plugin/widget-css.min.js';
    iframebody.appendChild(widgetCssJs);
    let widgetJs = document.createElement('script');
    widgetJs.type = 'text/javascript';
    widgetJs.src = chatConfig.boot_host + 'dist/plugin/widget.min.js';
    iframebody.appendChild(widgetJs);
  }
};
if (chatConfig) app.global.init();

let chatBotIconHideShow = document.querySelector(".chatbot-toggler");
chatBotIconHideShow?.addEventListener("click", function (el) {
  if (chatConfig) {
    let iframeBody = window.frames['ymIframe'].document.body;
    iframeBody.classList.toggle("show-chatbot");
    document.body.classList.toggle("show-chatbot");
    let showChatBox = document.querySelector(".msg-box-show-hide");
    showChatBox.style.display = "block";
  }
});

