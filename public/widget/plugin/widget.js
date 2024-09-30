"use strict";

let widget = {}, 
currentlan, 
previouslan, 
chatInput, 
chatbotCloseBtn,
validationErr = false, 
validationErrMsg,
configParams, 
SESSION_ID_KEY;

widget.global = {
  init: function init() {
    this.appInfo(),
    this.bootApp();
    this.createContainer();
    this.createHeader();
    this.chatInputBox();
  },
  appInfo: function appInfo() {
    configParams = window.parent;
    document.addEventListener('click', handleClickEvents);
  },
  bootApp: function bootApp() {
    var cookie = configParams.chatBotConfig?.cookie;
    let loginRequest = {
      "module": "ChatBot",
      "module_code": "ChatBotBoot",
      "action": "connectBot",
      "data" : {
        "bot": configParams.chatBotConfig?.bot,
        "client_id": cookie ? cookie : "",
        "source": configParams.chatBotConfig?.messanger,
        "page_url": configParams.location.href,
        "language": configParams.chatBotConfig?.language
      }
    };
    let headers = {
      "Content-Type": "application/json",
      "api-key": configParams.chatBotConfig?.api_key,
      "api-source": 'web'
    };
    apiCall(configParams.chatBotConfig?.host.concat("api/v1/chatbot/boot"), loginRequest, headers, response => {
      if (response.code == 200) {
        SESSION_ID_KEY = response.data.config.session_key;
        window.sessionStorage.removeItem(SESSION_ID_KEY);
        const resData = response.data.question;
        const question = response.data.question.question;
        const chatbotContainer = document.querySelector('.chatbot');
        var chatboxUl = document.createElement("ul");
        chatboxUl.className = "chatbox";
        var chatLi = document.createElement("li");
        chatLi.className = "chat incoming";
        var chatLogoSpan = document.createElement("span");
        chatLogoSpan.className = "chatLogo";
        chatLi.appendChild(chatLogoSpan);
        var chatMessageP = document.createElement("p");
        chatMessageP.textContent = question.question;
        chatLi.appendChild(chatMessageP);
        chatboxUl.appendChild(chatLi);
        chatbotContainer.appendChild(chatboxUl);
        var chatUserInput = document.getElementById("userText");
        chatUserInput.setAttribute('bot_question', resData.next_question_id);
        chatUserInput.setAttribute('pervious-ques', resData.question_id);
        chatUserInput.setAttribute('chat-uid', resData._id);
        if (resData?.validation) setValidatorAttribute(resData, chatUserInput);
        this.languageDropDown(response.data.language);
      } else {
        const chatbotContainer = document.querySelector('.chatbot');
        const body = document.createElement('div');
        body.className = 'body';
        const bodyImg = document.createElement('img');
        bodyImg.src = configParams.chatBotConfig?.boot_host + 'dist/assets/images/401.png';
        bodyImg.alt = 'Chat Image';
        bodyImg.style.width = '100%';
        bodyImg.style.height = '66%';
        body.appendChild(bodyImg);
        chatbotContainer.appendChild(body);
      }
    });
  },
  createContainer: function createContainer() {
    const chatBotContainer = document.createElement('div');
    chatBotContainer.id = 'chatbot-container';
    document.body.appendChild(chatBotContainer);
    const chatbot = document.createElement('div');
    chatbot.classList.add('chatbot');
    chatBotContainer.appendChild(chatbot);
  },
  createHeader: function createHeader() {
    const chatbotContainer = document.querySelector('.chatbot');
    var header = document.createElement("header");
    header.className = "header";
    var img = document.createElement("img");
    img.src = configParams.chatBotConfig?.boot_host + "dist/assets/images/chat-avator.png";
    img.alt = "";
    header.appendChild(img);
    var h2 = document.createElement("h2");
    h2.textContent = "CHAT with ShriA";
    header.appendChild(h2);
    var closeBtn = document.createElement("span");
    closeBtn.className = "close-btn material-symbols-outlined";
    closeBtn.textContent = "close";
    header.appendChild(closeBtn);
    chatbotContainer.appendChild(header);
  },
  chatInputBox: function chatInputBox() {
    const chatbotContainer = document.querySelector('.chatbot');
    var chatInputDiv = document.createElement("div");
    chatInputDiv.className = "chat-input";
    var textarea = document.createElement("textarea");
    textarea.id = "userText";
    textarea.setAttribute("placeholder", "Enter a message..");
    textarea.setAttribute("required", "");
    chatInputDiv.appendChild(textarea);
    chatbotContainer.appendChild(chatInputDiv);
  },
  languageDropDown: function languageDropDown(language) {
    const chatbotContainer = document.querySelector('.chatbot');
    const chatInputDiv = document.querySelector('.chat-input');
    var languageDiv = document.createElement("div");
    languageDiv.className = "language";
    var languageButton = document.createElement("button");
    languageButton.className = "language__action";
    languageDiv.appendChild(languageButton);
    var languageUl = document.createElement("ul");
    languageUl.id = "CurrentLang";
    languageUl.className = "language__list";
    var languages = [];
    var languageIds = [];
    language.forEach((value) => {
      languages.push(value.language_name);
    });
    language.forEach((value) => {
      languageIds.push(value.language);
    });
    languages.forEach((value, index) => {
        var li = document.createElement("li");
        li.value = languageIds[index];
        li.id = languageIds[index];
        li.setAttribute('value', languageIds[index]);
        if (index === 0) {
            li.className = "active";
        }
        li.textContent = value;
        languageUl.appendChild(li);
    });
    languageDiv.appendChild(languageUl);
    chatInputDiv.appendChild(languageDiv);

    var sendBtn = document.createElement("span");
    sendBtn.id = "send-btn";
    sendBtn.className = "material-symbols-outlined";
    sendBtn.textContent = "send";
    chatInputDiv.appendChild(sendBtn);
    chatbotContainer.appendChild(chatInputDiv);
    this.languageEvent();
  },
  languageEvent: function languageEvent() {
    let languageAction = document.querySelector('.language__action');
    let language = document.querySelector('.language__list');
    let languageList = document.querySelectorAll('.language__list li');
    languageAction?.addEventListener('click', (event)=>{
        language.classList.toggle('active');
        event.stopImmediatePropagation();
    });
    languageList?.forEach((element)=>{
        element.addEventListener('click', (ele)=>{
            previouslan = document.querySelector('.language__list li.active')
            currentlan = ele.target.id;
            language.querySelector('li.active').classList.remove('active');
            ele.currentTarget.classList.add('active');
            language.classList.remove('active');
            let accessToken = sessionStorage.getItem(SESSION_ID_KEY);
            if(accessToken && previouslan?.id !== currentlan && validationErr === false){
              handlePreviousChat();
            } else if (accessToken && previouslan?.id !== currentlan && validationErr === true){
              handleErrorMessage();
            }
        });
    });
    document.body.addEventListener('click', ()=>{
        language?.classList.remove('active');
    });
  }
};
widget.global.init();

function apiCall(url, data, headersReq, callbackRes){
  fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: headersReq
    }).then(res => res.json())
    .then(response => callbackRes(response)
    )
    .catch(error => console.error('Error:', error));
}

function setValidatorAttribute(data, messageInput){
  let validation = data?.validation;
  validationErrMsg = validation?.errorMessage;
  const minLength = validation?.minLength;
  const maxLength = validation?.maxLength;
  const regexPattern = validation?.regexPattern;
  const placeHolder = validation?.placeholder ? validation?.placeholder : "Write here…";
  const autoComplete = validation?.autocomplete;
  const validator = validation?.type;
  if (minLength) messageInput.setAttribute("minlength", minLength);
  if (maxLength) messageInput.setAttribute("maxlength", maxLength);
  if (regexPattern) messageInput.setAttribute("pattern", regexPattern);
  if (validator) messageInput.setAttribute("data-validator-type", validator);
  if (autoComplete) messageInput.setAttribute("autocomplete", autoComplete);
  if (placeHolder) messageInput.setAttribute("placeholder", placeHolder);
}

function handleClickEvents(event){
  this.chatInput = document.getElementById("userText");
  let inputInitHeight = this.chatInput.scrollHeight;
  this.chatInput.addEventListener("input", () => {
    this.chatInput.style.height = `${inputInitHeight}px`;
    this.chatInput.style.height = `${this.chatInput.scrollHeight}px`;
  });
  this.chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleChat();
    }
  });
  const sendChatBtn = document.querySelector("#send-btn");
  sendChatBtn.addEventListener('click', (e)=>{
    e.preventDefault();
    handleChat();
  });
  this.chatbotCloseBtn = document.querySelector(".close-btn");
  this.chatbotCloseBtn.addEventListener("click", () => {
    document.body.classList.remove("show-chatbot");
    configParams.document.body.classList.remove("show-chatbot");
  });
}

async function handleChat() {
    var chatUserInput = document.getElementById("userText");
    var chatUserbox = document.querySelector(".chatbox");
    let userInput = chatUserInput;
    let userInputMessage = chatUserInput.value.trim();
    if (!userInputMessage) return;

    let inputInitHeight = chatUserInput.scrollHeight
    chatUserInput.value = "";
    chatUserInput.style.height = `${inputInitHeight}px`;
  
    chatUserbox.appendChild(createChatLi(userInputMessage, "outgoing", userInput, "input"));
    chatUserbox.scrollTo(0, chatUserbox.scrollHeight);

    /*| validate data start |*/
    let validatorGet = validatorAttribute(chatUserInput);
    let validation = await validator(validatorGet.regexObject, userInputMessage, validatorGet.minMaxValues, validatorGet.fieldValidator);
    if (validation?.validation === false) {
        validationErr = true;
        let validationStatus =  true;
        const incomingChatLi = createChatLi(validationErrMsg[validation?.type], "incoming", userInput, "input", validationStatus);
        chatUserbox.appendChild(incomingChatLi);
        chatUserbox.scrollTo(0, chatUserbox.scrollHeight);
        return;
    }
    /*| validate data end |*/
    if (validation !== false) {
      validationErr = false;
      setTimeout(() => {
        const incomingChatLi = createChatLi("Thinking ....", "incoming", userInput, "input");
        chatUserbox.appendChild(incomingChatLi);
        chatUserbox.scrollTo(0, chatUserbox.scrollHeight);
        execute(incomingChatLi, userInputMessage);
      }, 600);
    }
}

function validatorAttribute(chatUserInput) {
  let minMaxValues = {};
  const fieldValidator = chatUserInput.getAttribute("data-validator-type");
  const minLength = chatUserInput.getAttribute("minlength");
  const maxLength = chatUserInput.getAttribute("maxlength");
  const regexPattern = chatUserInput.getAttribute("pattern");
  const regexObject = new RegExp(regexPattern);
  if (minLength || maxLength) {
      minMaxValues = {
        minlength: minLength ? parseInt(minLength) : "",
        maxlength: maxLength ? parseInt(maxLength) : "",
      };
  }
  return {
    "minMaxValues" : minMaxValues,
    "regexObject" : regexObject,
    "fieldValidator" : fieldValidator,
  };
}

function handlePreviousChat() {
	var chatUserInput = document.getElementById("userText");
	var chatUserbox = document.querySelector(".chatbox");
	let userInput = chatUserInput;
	let userInputMessage = chatUserInput.getAttribute("previous-input");
  let inputInitHeight = chatUserInput.scrollHeight
	chatUserInput.value = "";
	chatUserInput.style.height = `${inputInitHeight}px`;
	chatUserbox.scrollTo(0, chatUserbox.scrollHeight);
	setTimeout(() => {
		const incomingChatLi = createPreviousChatLi("Thinking ....", "incoming", userInput, "input");
		chatUserbox.appendChild(incomingChatLi);
		chatUserbox.scrollTo(0, chatUserbox.scrollHeight);
		execute(incomingChatLi, userInputMessage);
	}, 600);
}

function handleErrorMessage() {
  var chatUserInput = document.getElementById("userText");
  let questionCode = chatUserInput.getAttribute('pervious-ques');
  let chatUid = chatUserInput.getAttribute('chat-uid');
  let message = chatUserInput.getAttribute('previous-input');
	let accessToken = sessionStorage.getItem(SESSION_ID_KEY);
    let chatReq = {
			"module": "ChatBot",
      "module_code": "chatBotService",
      "action": "chatErrMessage",
			"data": {
        "bot": configParams.chatBotConfig?.bot,
        "page_url": configParams.location.href,
        "chatUId": chatUid,
        "qCode" : questionCode,
        "qLanguage": currentlan ? currentlan : "ENGLISH",
        "message" : message,
        "timestamp": new Date().getTime()
			}
		}
		let headers = {
			"Content-Type": "application/json",
			"api-key": configParams.chatBotConfig?.api_key,
			"api-source": 'web',
			"Authorization": 'Bearer ' + accessToken
		}
		apiCall(configParams.chatBotConfig?.host.concat("api/v1/chatbot/service"), chatReq, headers, response => {
      if (response.code === 200) {
        let validation = response.data.validation;
        validationErrMsg = validation.errorMessage;
      } else {
        alert("something went wrong..!");
      }
		});
}

function createChatLi(message, className, event, action, validationStatus = false) {
  var chatUserInput = document.getElementById("userText");
	const chatLi = document.createElement("li");
	chatLi.classList.add("chat", `${className}`);
	let chatContent = className === "outgoing" ? `<p></p><span class="userLogo"></span>` : `<span class="chatLogo"></span><p><span class="botAnswer"></span></p>`;
	chatLi.innerHTML = chatContent;
	chatLi.querySelector("p").textContent = message;
  let accessToken = sessionStorage.getItem(SESSION_ID_KEY);
	if (accessToken) {
		var userCurrentCode;
		if (action == "click") {
			  userCurrentCode = event?.target.getAttribute('bot_question');
		} else if (action == "input") {
        if (validationStatus) {
          userCurrentCode = event.getAttribute('pervious-ques');
        } else {
          userCurrentCode = event.getAttribute('bot_question');
        }
		}
		if (className == "outgoing") {
			chatUserInput.setAttribute('user-current-code', userCurrentCode);
		} else if (className == "incoming") {
			chatUserInput.setAttribute('user-current-code', userCurrentCode);
		}
	}
	return chatLi;
}

function createPreviousChatLi(message, className, event, action) {
	var chatUserInput = document.getElementById("userText");
	const chatLi = document.createElement("li");
	chatLi.classList.add("chat", `${className}`);
	let chatContent = className === "outgoing" ? `<p></p><span class="userLogo"></span>` : `<span class="chatLogo"></span><p><span class="botAnswer"></span></p>`;
	chatLi.innerHTML = chatContent;
	chatLi.querySelector("p").textContent = message;
	let accessToken = sessionStorage.getItem(SESSION_ID_KEY);
	if (accessToken) {
		var userCurrentCode;
		if (action == "click") {
			userCurrentCode = event?.target.getAttribute('pervious-ques');
		} else if (action == "input") {
			userCurrentCode = event.getAttribute('pervious-ques');
		}
		if (className == "outgoing") {
			chatUserInput.setAttribute('user-current-code', userCurrentCode);
		} else if (className == "incoming") {
			chatUserInput.setAttribute('user-current-code', userCurrentCode);
		}
	}
	return chatLi;
}

function createLink(event) {
	var chatUserbox = document.querySelector(".chatbox");
	let getEventVal = event.target.value;
	let userInputMessage = getEventVal.trim();
	if (!userInputMessage) return;

	const outGoingChatLi = createChatLi(userInputMessage, "outgoing", event, "click");
	chatUserbox.appendChild(outGoingChatLi);
	chatUserbox.scrollTo({ bottom: 0, behavior: "smooth" });
	setTimeout(() => {
		const incomingChatLi = createChatLi("Thinking1 ....", "incoming", event, "click");
		chatUserbox.appendChild(incomingChatLi);
		chatUserbox.scrollTo({ bottom: 0, behavior: "smooth" });
		execute(incomingChatLi, userInputMessage, event);
	}, 600);
}

function execute(chatElement, userMessage) {
	document.getElementById("userText").placeholder = "Enter a message...";
	document.getElementById("userText").removeAttribute("disabled");
  let accessToken = sessionStorage.getItem(SESSION_ID_KEY);
  let methodName = accessToken ? 'chatService' : 'authentication';
  chatModule[methodName](chatElement, userMessage);
}

const chatModule = {
  authentication: function(chatElement, userMessage) {
    var chatUserInput = document.getElementById("userText");
    var messageElement = chatElement.querySelector("p");
    var cookie = configParams.chatBotConfig?.cookie;
    let loginAccessReq = {
      "module": "Auth",
      "module_code": "ChatBotAuth",
      "action": "loginAccess",
      "data": {
        "bot": configParams.chatBotConfig?.bot,
        "client_id": cookie ? cookie : "",
        "page_url": configParams.location.href,
        "chatUId": chatUserInput.getAttribute("chat-uid"),
        "qCode" : chatUserInput.getAttribute("bot_question"),
        "qLanguage": currentlan ? currentlan : "ENGLISH",
        "message" : userMessage,
        "timestamp": new Date().getTime()
      }
    }
    let headers = {
      "Content-Type": "application/json",
      "api-key": configParams.chatBotConfig?.api_key,
      "api-source": 'web'
    };
		apiCall(configParams.chatBotConfig?.host.concat("api/v1/authentication"), loginAccessReq, headers, response => {
			sessionStorage.setItem(SESSION_ID_KEY, response?.data?.access_token);
      let questionType = response.data.context.question_type;
      eventModule[questionType](response, chatUserInput, messageElement, userMessage);
		});
		messageElement.textContent = "";
  },
  chatService: function(chatElement, userMessage) {
    var chatUserInput = document.getElementById("userText");
    let value = document.getElementById("userText").getAttribute("user-current-code");
    var messageElement = chatElement.querySelector("p");
    let accessToken = sessionStorage.getItem(SESSION_ID_KEY);
    let chatReq = {
			"module": "ChatBot",
      "module_code": "chatBotService",
      "action": "chatService",
			"data": {
        "bot": configParams.chatBotConfig?.bot,
        "page_url": configParams.location.href,
        "chatUId": chatUserInput.getAttribute("chat-uid"),
        "qCode" : value,
        "qLanguage": currentlan ? currentlan : "ENGLISH",
        "message" : userMessage,
        "timestamp": new Date().getTime()
			}
		}
		let headers = {
			"Content-Type": "application/json",
			"api-key": configParams.chatBotConfig?.api_key,
			"api-source": 'web',
			"Authorization": 'Bearer ' + accessToken
		}
		apiCall(configParams.chatBotConfig?.host.concat("api/v1/chatbot/service"), chatReq, headers, response => {
      if (response.code === 200) {
        let questionType = response.data.context.question_type;
        eventModule[questionType](response, chatUserInput, messageElement, userMessage, accessToken);
      } else {
        alert("something went wrong..!");
      }
		});
		messageElement.textContent = "";
  }
};

const eventModule = {
  inputBox: function(response, chatUserInput, messageElement, userMessage, accessToken = '') {
      const resData = response.data.context;
      const question = response.data.context.question;
      chatUserInput.setAttribute('bot_question', resData.next_question_id);
      chatUserInput.setAttribute('pervious-ques', resData.question_id);
      chatUserInput.setAttribute('chat-uid', resData._id);
      chatUserInput.setAttribute('previous-input', userMessage);
      if (accessToken) {
        chatUserInput.removeAttribute('authques');
      } else { 
        chatUserInput.setAttribute('authques', "yes");
      }
      if (resData?.validation) setValidatorAttribute(resData, chatUserInput);
			var optionText = document.createTextNode(question.question);
			messageElement.appendChild(optionText);
  },
  radio: function(response, chatUserInput, messageElement, userMessage, accessToken = '') {
    const resData = response.data.context;
    const question = response.data.context.question;
    const questionOptions = response.data.context.options;
    var questionElement = document.createElement('p');
    questionElement.classList.add("designText");
    var QustionText = document.createTextNode(question.question);
    questionElement.appendChild(QustionText);
    messageElement.appendChild(questionElement);

    questionOptions.forEach(questionValue => {
        var optionValue = document.createElement("button");
        optionValue.classList.add('selectOptBtn');
        optionValue.setAttribute("bot_question", questionValue.next_question_id);
        optionValue.setAttribute("value", questionValue.question);
        chatUserInput.setAttribute('previous-input', userMessage);
        chatUserInput.setAttribute('pervious-ques', resData.question_id);
        chatUserInput.setAttribute('chat-uid', resData._id);
        if (accessToken) {
          chatUserInput.removeAttribute('authques');
        } else { 
          chatUserInput.setAttribute('authques', "yes");
        }
        var optionText = document.createTextNode(questionValue.question);
        optionValue.appendChild(optionText);
        messageElement.appendChild(optionValue);
        optionValue.addEventListener("click", createLink);
    });
    document.getElementById("userText").placeholder = "Please select options";
    document.getElementById("userText").setAttribute("disabled",true);
  }
};

const validatorObject = {
  empty: function (value) {
    return { value: value == "", type: "required" };
  },
  alphaValidation: function (dataObj) {
    return { value: dataObj.regexObject.test(dataObj.value), type: "alphaValidation" };
  },
  numericValidation: function (dataObj) {
    return { value: dataObj.regexObject.test(dataObj.value), type: "numericValidation" };
  },
  alphaNumericValidation: function (dataObj) {
    return { value: dataObj.regexObject.test(dataObj.value), type: "alphaNumericValidation" };
  },
  emailValidation: function (dataObj) {
    return { value: dataObj.regexObject.test(dataObj.value), type: "emailValidation" };
  },
  panValidation: function (dataObj) {
    return { value: dataObj.regexObject.test(dataObj.value), type: "panValidation" };
  },
};

async function validator(regexObject, dataValue, minMaxValues, validator) {
  if (dataValue == validatorObject.empty(dataValue).value) {
      return { validation: false, type: 'empty' };
  } else if (minMaxValues?.minlength && dataValue.length < minMaxValues.minlength) {
      return { validation: false, type: 'minLength' };
  } else if (minMaxValues?.maxlength && dataValue.length > minMaxValues.maxlength) {
      return { validation: false, type: 'maxLength' };
  }

  if (regexObject && validator && validatorObject[validator] && typeof validatorObject[validator] === "function") {
      let dataObject = {
        value: dataValue,
        regexObject: regexObject,
      };
      let validationObj = validatorObject[validator](dataObject);
      return {
        validation : validationObj.value ? validationObj.value : false,
        type: validationObj.type
      };
  }
  return { validation: true, type: "" };
}
