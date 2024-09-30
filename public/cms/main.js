var questionMapId;
var question_Id;
var languageAddArray = [];
var nextQuestion_Id;
let reqBodyArray = [];
let editQuestionArray = [];
let onInit = {};
let qaInputType;
let updateQaCodeinputType;
let body = document.querySelector(".body");
let sun = document.querySelector(".sun");
let moon = document.querySelector(".moon");
let radioButtonCount = 1, editRadioButtonCount = 1;
let organizationEditData = {},
productEditData = {}, 
configEditData = {}, 
languageEditData = {},
questionEditData = {};

onInit.loadObject = {
  init: function init() {
    const theme = localStorage.getItem('app-theme');
    if (theme) {
      body.classList.add("dark--mode")
    }
    const currentURL = window.location.pathname;
    const sidebarLinks = document.querySelectorAll('.sidebar--items a');
    sidebarLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href == currentURL) {
        link.classList.add('active');
      }
    });
   if (currentURL == "/language") getAllLanguages();
  }
};
onInit.loadObject.init();

moon.onclick = function(){
    body.classList.add("dark--mode")
    localStorage.setItem('app-theme', 'dark--mode')
}
sun.onclick = function(){
    body.classList.remove("dark--mode")
    localStorage.removeItem('app-theme')
}
let menu = document.querySelector(".menu")
let sidebar = document.querySelector(".sidebar")
let mainContainer = document.querySelector(".main--container")

mainContainer.onclick = function(){
    sidebar.classList.remove("activemenu")
}

function apiCall(url, data, headersReq , callbackRes){
  fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: headersReq
    }).then(res => res.json())
    .then(response => callbackRes(response)
    )
    .catch(error => console.error('Error:', error));
}

function organizationCreatePopup() {
  initModal("#openOrganizationAddModal");
}

function organizationEditPopup(data) {
  organizationEditData = JSON.parse(data);
  document.getElementById('editOrganizationCode').value = organizationEditData.organization_code;
  document.getElementById('editOrganizationName').value = organizationEditData.organization_name;
  document.getElementById('organizationStatus').value = organizationEditData.status;
  initModal("#editOrganizationModal");
}

function productEditPopup(data) {
  productEditData = JSON.parse(data);
  document.getElementById('editOrganizationCode').value = productEditData.organization_id;
  document.getElementById('editProductCode').value = productEditData.product_code;
  document.getElementById('editProductName').value = productEditData.product_name ;
  document.getElementById('ProductStatus').value = productEditData.status;
  initModal("#editProductModal");
}

function languageEditPopup(data) {
  languageEditData = JSON.parse(data);
  const languageStatus = document.getElementById('languageStatus');
  languageStatus.value = languageEditData.status
  initModal("#editLanguageModal");
}

function questionEditPopup(data) {
  questionEditData = JSON.parse(data), editRadioButtonCount = 1;
  const organization = document.getElementById('editOrganizationCode');
  const product = document.getElementById('editProductCode');
  const language = document.getElementById('editQaLanguage');
  const inputType = document.getElementById('editQaInputType');
  const questionText = document.getElementById('editQuestionText');

  organization.value = questionEditData.organization_code;
  product.value = questionEditData.product_code;
  language.value = questionEditData.language;
  inputType.value = questionEditData.question_type;
  let question = questionEditData.question;
  questionText.value = question.question;
  editInputTypeChange(questionEditData.question_type);

  if (questionEditData.question_type == 'inputBox') {
    let validation = questionEditData.validation;
    let errorMessage = questionEditData.validation.errorMessage;
    document.getElementById('editMinLength').value = validation.minLength;
    document.getElementById('editMinLengthErr').value = errorMessage.minLength;
    document.getElementById('editMaxLength').value = validation.maxLength;
    document.getElementById('editMaxLengthErr').value = errorMessage.maxLength;
    document.getElementById('editRegex').value = validation.regexPattern;
    document.getElementById('editRegexErr').value = errorMessage.alphaValidation;
    document.getElementById('editRequiredErr').value = errorMessage.required;
    document.getElementById('editPlaceHolder').value = validation.placeHolder;
    const selectElement = document.getElementById('editValidationType');
    selectElement.value = validation.type;


  } else if (questionEditData.question_type == 'radio') {
    var elements = document.querySelectorAll('.edit-rm-radio');
    elements.forEach(function(element) {
      element.remove();
    });

    let radioCount = 1;
    const radioContainerOne = document.querySelectorAll(`.edit-radio_0`);
    const editOptionTextOne = radioContainerOne[0].querySelector('textarea[name="editOptionText"]');
    const editOptionTitleOne = radioContainerOne[1].querySelector('textarea[name="editOptionTitle"]');
    editOptionTextOne.value = questionEditData.options[0].question;
    editOptionTitleOne.value = questionEditData.options[0].question_title;
    if (questionEditData.options[0]?.question_id) {
      editOptionTextOne.setAttribute('qa_question_attribute', questionEditData.options[0]?.question_id);
    }
    if (questionEditData.options[0]?.next_question_id) {
      editOptionTextOne.setAttribute('qa_ne_question_attribute', questionEditData.options[0]?.next_question_id);
    }

    questionEditData.options.slice(1).forEach(function(option) {
      radioButton('edit-');
      const radioContainer = document.querySelectorAll(`.edit-radio_${radioCount}`);
      const editOptionText = radioContainer[0].querySelector('textarea[name="editOptionText"]');
      const editOptionTitle = radioContainer[1].querySelector('textarea[name="editOptionTitle"]');
      editOptionText.value = option.question;
      editOptionTitle.value = option.question_title;
      if (option?.question_id) {
        editOptionText.setAttribute('qa_question_attribute', option?.question_id);
      }
      if (option?.next_question_id) {
        editOptionText.setAttribute('qa_ne_question_attribute', option?.next_question_id);
      }
      radioCount++;
    });
  }
  initModal("#editQuoteForm");
}

function configurationEditPopup(data) {
  configEditData = JSON.parse(data);
  const organizationCode = document.getElementById('editOrganizationCode');
  const editProductCode = document.getElementById('editProductCode');
  const editSessionKey = document.getElementById('editSessionKey');
  const configStatus = document.getElementById('configStatus');

  organizationCode.value = configEditData.organization_code;
  editProductCode.value = configEditData.product_code;
  editSessionKey.value = configEditData.session_key;
  configStatus.value = configEditData.status;
  initModal("#editConfigModal");
}

function editQuestionDetails() {
  const editAaInputType = document.getElementById("editQaInputType");
  const editQuestionValue = document.getElementById("editQuestionText").value;
  if (editAaInputType.value == 'radio') {
    const textareas = document.querySelectorAll('textarea');
    let options = {}, optionArray = [];
    var optionQaCount = 0;
    textareas.forEach(textarea => {
      const name = textarea.getAttribute('name');
      const value = textarea.value.trim();;
      if (name === 'editOptionText' && value !== '') {
        let qaAttribute = textarea.getAttribute('qa_question_attribute');
        let nextQaAttribute = textarea.getAttribute('qa_ne_question_attribute');
        options.question = value;
        if (questionEditData.options[optionQaCount]?.question_id == qaAttribute) {
          options.question_id = questionEditData.options[optionQaCount]?.question_id;
        }
        if (questionEditData.options[optionQaCount]?.next_question_id == nextQaAttribute) {
          options.next_question_id = questionEditData.options[optionQaCount]?.next_question_id;
        }
        optionQaCount += 1;
      }
      if (name === 'editOptionTitle' && value !== '') {
        options.question_title = value;
        optionArray.push(options);
        options = {};
      }
    });
    editQuestionArray.push({
      "question" : { "id": 1, "active": true, "question": editQuestionValue },
      "options" : optionArray
    });
  } else if (editAaInputType.value == 'inputBox') {
    let validationType = document.getElementById("editValidationType").value;
    editQuestionArray.push({
          "question": { "id": 1, "active": true, "question": editQuestionValue },
          "validation": {
              "minLength": document.getElementById("editMinLength").value,
              "maxLength": document.getElementById("editMaxLength").value,
              "regexPattern": document.getElementById("editRegex").value,
              "placeHolder": document.getElementById("editPlaceHolder").value,
              "autocomplete": document.getElementById("editautoComplete").value,
              "type": validationType,
              "errorMessage": {
                "minLength" : document.getElementById("editMinLengthErr").value,
                "maxLength" : document.getElementById("editMaxLengthErr").value,
                [validationType] : document.getElementById("editRegexErr").value,
                "required": document.getElementById("editRequiredErr").value 
              }
          }
    });
  }
  questionInfo(questionEditData._id, 'edit');
}

function editOrganizationDetails() {
  organizationInfo(organizationEditData._id, 'edit');
}

function editProductDetails() {
  productInfo(productEditData._id, 'edit');
}

function editLanguageDetails() {
  languageInfo(languageEditData._id, 'edit');
}

function editConfigDetails() {
  configurationInfo(configEditData._id, 'edit');
}

function openProduct() {
  initModal("#openProductAddModal");
}

function openConfig() {
  initModal("#openConfigAddModal");
}

function openLanguage() {
  initModal("#openLanguageAddModal");
}

function initModal(id) {
  document.body.classList.add('modal-open');
  document.body.insertAdjacentHTML(
      'beforeend',
      '<div class="modal-backdrop fade"></div>'
  );
  var backdrop = document.querySelector('.modal-backdrop');
  backdrop.classList.add('show');
  let activeTabContent = document.body.querySelector(id);
  activeTabContent.style.display = 'block';
  setTimeout(() => {
      activeTabContent.classList.add('show');
      // Modal align at Bottom
      if (window.innerWidth <= 767) {
          if (activeTabContent.classList.contains('modal-align-mobile-bottom')) {
              activeTabContent.classList.add('modal-up-animate');
          }
      }
  }, 300);
}

function closePopUp() {
    let modals = document.querySelectorAll('.modal.fade.show');
    modals.forEach(modal => {
      if (modal?.style?.display == 'block') {
        modal.classList.remove('show');
        modal.style.display = 'none';
        setTimeout(() => {
          let backdrop = document.querySelector(
            '.modal-backdrop'
          );
          backdrop?.classList.remove('show');
          backdrop?.remove();
        }, 150);
        setTimeout(() => {
          let body = document.body;
          body?.classList.remove('modal-open');
          }, 150);
      }
  });
}

function openQuestionPopup() {
  const form = document.getElementById('qaForm');
  if (form) {
    form.reset();
  }
  const radioDivs = document.querySelectorAll('.rm-radio');
  radioDivs.forEach(div => {
    div.remove();
  });
  document.getElementById('add_questions_array').disabled = false;
  document.getElementById('step-2').disabled = true;
  document.getElementById('qaInputType').disabled = false;
  addLanguageOption();
  initModal("#GetQuoteForm");
}

function addLanguageOption() {
  const newOptions = [
    { value: 'TAMIL', text: 'TAMIL' },
    { value: 'ENGLISH', text: 'ENGLISH' },
    { value: 'HINDI', text: 'HINDI' }
  ];
  let qaLanguage = document.getElementById('qaLanguage');
  while (qaLanguage.firstChild) {
    qaLanguage.removeChild(qaLanguage.firstChild);
  }
  newOptions.forEach(option => {
    const newOption = document.createElement('option');
    newOption.value = option.value;
    newOption.textContent = option.text;
    qaLanguage.appendChild(newOption);
  });
}

function submitOrganizationDetails() {
    let organizationName = document.getElementById("organizationName");
    let organizationCode = document.getElementById("organizationCode");
    let ReqBody = {
        "module": "ChatBotCms",
        "module_code": "ChatCmsService",
        "action": "addOrganization",
        "data": {
          "organization_code" : organizationCode.value,
          "organization_name" : organizationName.value
        }
    };
    let headers = {
        "Content-Type": "application/json",
        "Authorization": 'Bearer ' + sessionStorage.getItem('SLIC_CHAT_TOKEN')
    };
    apiCall("http://product-service-be.dv/api/v1/chatbot/service", ReqBody, headers, response => {
        if (response.code == 200) {
          closePopUp();
          loadOrganization();
          swalOpenClose('success', 'Organization added Successfully..!');
        } else if (response.code == 201) {
          closePopUp();
          swalOpenClose('failure', response.message);
        } else {
          closePopUp();
          swalOpenClose('failure', 'Organization added failure..!');
        }
    });
}

function searchOrganization() {
  let page = getPage(), limit = 5, skip = (page - 1) * limit;
  let ReqBody = {
    "module": "ChatBotCms",
    "module_code": "ChatCmsService",
    "action": "searchOrganization",
    "data": {
      "searchValue" : document.getElementById('searchOrganization').value,
      "limit": limit,
      "skip": skip
    }
  };
  let headers = {
      "Content-Type": "application/json",
      "Authorization": 'Bearer ' + sessionStorage.getItem('SLIC_CHAT_TOKEN')
  };
  apiCall("http://product-service-be.dv/api/v1/chatbot/service", ReqBody, headers, response => {
      if (response.code == 200) {
        const resData = response.data.organization;
        appendOrganization(resData, limit);
      }
  });
}

function loadOrganization() {
  let page = getPage(), limit = 5, skip = (page - 1) * limit;
  let ReqBody = {
    "module": "ChatBotCms",
    "module_code": "ChatCmsService",
    "action": "getOrganization",
    "data": {
        "limit": limit,
        "skip": skip
    }
  };
  let headers = {
      "Content-Type": "application/json",
      "Authorization": 'Bearer ' + sessionStorage.getItem('SLIC_CHAT_TOKEN')
  };
  apiCall("http://product-service-be.dv/api/v1/chatbot/service", ReqBody, headers, response => {
      if (response.code == 200) {
        const resData = response.data.organization;
        appendOrganization(resData, limit);
      }
  });
}

function appendOrganization(resData, limit) {
  const tbodyId = 'organization-table';
    const tbody = document.getElementById(tbodyId);
    if (tbody) {
      tbody.parentNode.removeChild(tbody);
    }
    const tableBody = document.createElement('tbody');
    tableBody.id = tbodyId;
    tableBody.innerHTML = ''; 
    if (resData.organization.length > 0) {
      resData.organization.forEach((data, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${data.organization_code}</td>
          <td>${data.organization_name}</td>
          <td style="color: ${data.status == '1' ? 'green' : 'red'}">${data.status == '1' ? 'Active' : 'InActive'}</td>
          <td>
            <div>
              <span class="options">
                <i class="fas fa-edit" onclick="organizationEditPopup('${escapeHTML(JSON.stringify(data))}')"></i>
              </span>
            </div>
          </td>
          <td>
            <div>
              <span class="options">
                <i class="fas fa-trash-alt" onclick="organizationInfo('${data._id}', 'delete')"></i>
              </span>
            </div>
          </td>
        `;
        tableBody.appendChild(row);
      });
      generatePagination(resData.totallength, limit, 'organization');
    } else {
      const tr = document.createElement('tr');
      const notFound = document.createElement('td');
      notFound.innerHTML = "No Data Found";
      notFound.colSpan = 9;
      notFound.style.textAlign = "center";
      tr.appendChild(notFound);
      tableBody.appendChild(tr);
      clearPagination();
    }
    document.querySelector('table').appendChild(tableBody);
}

function getLangauges() {
    let page = getPage(), limit = 5, skip = (page - 1) * limit;
    const searchPid = document.getElementById('searchProductCode');
    const searchOid = document.getElementById('searchOrganizationCode');
    let ReqBody = {
        "module": "ChatBotCms",
        "module_code": "ChatCmsService",
        "action": "getLanguages",
        "data": {
          "search_pid" : searchPid.value ? searchPid.value : "",
          "search_oid" : searchOid.value ? searchOid.value : "",
          "limit": limit,
          "skip": skip
        }
    };
    let headers = {
        "Content-Type": "application/json",
        "Authorization": 'Bearer ' + sessionStorage.getItem('SLIC_CHAT_TOKEN')
    };
    apiCall("http://product-service-be.dv/api/v1/chatbot/service", ReqBody, headers, response => {
        const languageOptions = response.data.language.langauges;
        const tbodyId = 'languageTableBody';
        const tbody = document.getElementById(tbodyId);
        if (tbody) {
          tbody.parentNode.removeChild(tbody);
        }
        const tableBody = document.createElement('tbody');
        tableBody.id = tbodyId;
        tableBody.innerHTML = ''; 
        if (languageOptions.length > 0) {
          languageOptions.forEach((data, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
              <td>${index + 1}</td>
              <td>${data.organization_code}</td>
              <td>${data.product_code}</td>
              <td>${data.language}</td>
              <td>${data.language_name}</td>
              <td style="color: ${data.status == '1' ? 'green' : 'red'}">${data.status == '1' ? 'Active' : 'InActive'}</td>
              <td>
                <div>
                  <span class="options">
                    <i class="fas fa-edit" onclick="languageEditPopup('${escapeHTML(JSON.stringify(data))}')"></i>
                  </span>
                </div>
              </td>
              <td>
                <div>
                  <span class="options">
                    <i class="fas fa-trash-alt" onclick="languageInfo('${data._id}', 'delete')"></i>
                  </span>
                </div>
              </td>
            `;
            tableBody.appendChild(row);
          });
          document.querySelector('table').appendChild(tableBody);
          generatePagination(response.data.language.totallength, limit, 'language');
        } else {
          const tr = document.createElement('tr');
          const notFound = document.createElement('td');
          notFound.innerHTML = "No Data Found";
          notFound.colSpan = 9;
          notFound.style.textAlign = "center";
          tr.appendChild(notFound);
          tableBody.appendChild(tr);
          document.querySelector('table').appendChild(tableBody);
          clearPagination();
        }
    });
}

function getProductsByOrganization() {
  let page = getPage(), limit = 5, skip = (page - 1) * limit;
  let ReqBody = {
    "module": "ChatBotCms",
    "module_code": "ChatCmsService",
    "action": "getProductsByOrganization",
    "data": {
      "organization_id": document.getElementById("searchOrganization").value,
      "limit": limit,
      "skip": skip
    }
  };
  let headers = {
      "Content-Type": "application/json",
      "Authorization": 'Bearer ' + sessionStorage.getItem('SLIC_CHAT_TOKEN')
  };
  apiCall("http://product-service-be.dv/api/v1/chatbot/service", ReqBody, headers, response => {
    if (response.code == 200) {
      const resData = response.data.products;
      appendProducts(resData, limit);
    }
  });
}

function getAllLanguages() {
    let ReqBody = {
        "module": "ChatBotCms",
        "module_code": "ChatCmsService",
        "action": "languageMaster",
        "data": {}
    };
    let headers = {
        "Content-Type": "application/json",
        "Authorization": 'Bearer ' + sessionStorage.getItem('SLIC_CHAT_TOKEN')
    };
    apiCall("http://product-service-be.dv/api/v1/chatbot/service", ReqBody, headers, response => {
      let data = {
        data: response.data.language_master
      }
      new MultiSelect('#dynamic', {
        ...data,
        selectAll: false,
        placeholder: 'Select Languages',
        onChange: function(value, text, element) {
          const exists = languageAddArray.some(item => item.language === value);
          languageAddArray = languageAddArray.filter(item => item.language !== value);
          if (!exists) {
              languageAddArray.push({
                  "organization_id": document.getElementById("organizationCode").value,
                  "product_id": document.getElementById("productCode").value,
                  "language": value,
                  "language_name": text,
                  "status": "1"
              });
          }
        }
      });
    });
}

function loadProducts() {
  let page = getPage(), limit = 5, skip = (page - 1) * limit;
  let ReqBody = {
    "module": "ChatBotCms",
    "module_code": "ChatCmsService",
    "action": "getProducts",
    "data": {
      "limit": limit,
      "skip": skip
    }
  };
  let headers = {
      "Content-Type": "application/json",
      "Authorization": 'Bearer ' + sessionStorage.getItem('SLIC_CHAT_TOKEN')
  };
  apiCall("http://product-service-be.dv/api/v1/chatbot/service", ReqBody, headers, response => {
      if (response.code == 200) {
        const resData = response.data.product;
        appendProducts(resData, limit);
      }
  });
}

function appendProducts(resData, limit){
  const tbodyId = 'products-table';
  const tbody = document.getElementById(tbodyId);
  if (tbody) {
    tbody.parentNode.removeChild(tbody);
  }
  const tableBody = document.createElement('tbody');
  tableBody.id = tbodyId;
  tableBody.innerHTML = ''; 
  if (resData.products.length > 0) {
    resData.products.forEach((data, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${data.organization_code}</td>
        <td>${data.product_code}</td>
        <td>${data.product_name}</td>
        <td style="color: ${data.status == '1' ? 'green' : 'red'}">${data.status == '1' ? 'Active' : 'InActive'}</td>
        <td>
          <div>
            <span class="options">
              <i class="fas fa-edit" onclick="productEditPopup('${escapeHTML(JSON.stringify(data))}')"></i>
            </span>
          </div>
        </td>
        <td>
          <div>
            <span class="options">
              <i class="fas fa-trash-alt" onclick="productInfo('${data._id}', 'delete')"></i>
            </span>
          </div>
        </td>
      `;
      tableBody.appendChild(row);
      generatePagination(resData.totallength, limit, 'products');
    });
  } else {
    const tr = document.createElement('tr');
    const notFound = document.createElement('td');
    notFound.innerHTML = "No Data Found";
    notFound.colSpan = 9;
    notFound.style.textAlign = "center";
    tr.appendChild(notFound);
    tableBody.appendChild(tr);
    clearPagination();
  }
  document.querySelector('table').appendChild(tableBody);
}

function loadConfigurations() {
  let page = getPage(), limit = 5, skip = (page - 1) * limit;
  const organizationCode = document.getElementById("searchOrganizationCode");
  const productCode = document.getElementById("searchProductCode");
  let ReqBody = {
    "module": "ChatBotCms",
    "module_code": "ChatCmsService",
    "action": "getConfigurations",
    "data": {
      "search_oid": organizationCode.value ?? "",
      "search_pid": productCode.value ?? "",
      "limit": limit,
      "skip": skip
    }
  };
  let headers = {
      "Content-Type": "application/json",
      "Authorization": 'Bearer ' + sessionStorage.getItem('SLIC_CHAT_TOKEN')
  };
  apiCall("http://product-service-be.dv/api/v1/chatbot/service", ReqBody, headers, response => {
      if (response.code == 200) {
        const resData = response.data.config;
        appendConfigurations(resData, limit);
      }
  });
}

function loadSubmissions() {
  let page = getPage(), limit = 5, skip = (page - 1) * limit;
  const organizationCode = document.getElementById("searchOrganizationCode");
  const productCode = document.getElementById("searchProductCode");
  let ReqBody = {
    "module": "ChatBotCms",
    "module_code": "ChatCmsService",
    "action": "getSubmission",
    "data": {
      "search_oid": organizationCode.value ?? "",
      "search_pid": productCode.value ?? "",
      "limit": limit,
      "skip": skip
    }
  };
  let headers = {
      "Content-Type": "application/json",
      "Authorization": 'Bearer ' + sessionStorage.getItem('SLIC_CHAT_TOKEN')
  };
  apiCall("http://product-service-be.dv/api/v1/chatbot/service", ReqBody, headers, response => {
      if (response.code == 200) {
        const resData = response.data.submission;
        appendSubmissions(resData, limit);
      }
  }); 
}

function appendSubmissions(resData, limit){
  const tbodyId = 'submission-table';
  const tbody = document.getElementById(tbodyId);
  if (tbody) {
    tbody.parentNode.removeChild(tbody);
  }
  const tableBody = document.createElement('tbody');
  tableBody.id = tbodyId;
  tableBody.innerHTML = ''; 
  if (resData.submissions.length > 0) {
    resData.submissions.forEach((data, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${data.organization_code}</td>
        <td>${data.product_code}</td>
        <td>${data.question_language}</td>
        <td>${data.question_code}</td>
        <td>${data.bot_question}</td>
        <td>${data.received_message}</td>
        <td>${data.page_url}</td>
      `;
      tableBody.appendChild(row);
      generatePagination(resData.totallength, limit, 'submission');
    });
  } else {
    const tr = document.createElement('tr');
    const notFound = document.createElement('td');
    notFound.innerHTML = "No Data Found";
    notFound.colSpan = 9;
    notFound.style.textAlign = "center";
    tr.appendChild(notFound);
    tableBody.appendChild(tr);
    clearPagination();
  }
  document.querySelector('table').appendChild(tableBody);
}

function appendConfigurations(resData, limit){
  const tbodyId = 'configuration-table';
  const tbody = document.getElementById(tbodyId);
  if (tbody) {
    tbody.parentNode.removeChild(tbody);
  }
  const tableBody = document.createElement('tbody');
  tableBody.id = tbodyId;
  tableBody.innerHTML = ''; 
  if (resData.configs.length > 0) {
    resData.configs.forEach((data, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${data.organization_code}</td>
        <td>${data.product_code}</td>
        <td>${data.bot_id}</td>
        <td>${data.api_key}</td>
        <td style="color: ${data.status == '1' ? 'green' : 'red'}">${data.status == '1' ? 'Active' : 'InActive'}</td>
        <td>
          <div>
            <span class="options">
              <i class="fas fa-edit" onclick="configurationEditPopup('${escapeHTML(JSON.stringify(data))}')"></i>
            </span>
          </div>
        </td>
        <td>
          <div>
            <span class="options">
              <i class="fas fa-trash-alt" onclick="configurationInfo('${data._id}', 'delete')"></i>
            </span>
          </div>
        </td>
      `;
      tableBody.appendChild(row);
      generatePagination(resData.totallength, limit, 'configuration');
    });
  } else {
    const tr = document.createElement('tr');
    const notFound = document.createElement('td');
    notFound.innerHTML = "No Data Found";
    notFound.colSpan = 9;
    notFound.style.textAlign = "center";
    tr.appendChild(notFound);
    tableBody.appendChild(tr);
    clearPagination();
  }
  document.querySelector('table').appendChild(tableBody);
}

function submitProductDetails() {
  let productName = document.getElementById("productName");
  let productCode = document.getElementById("productCode");
  let organizationCode = document.getElementById("organizationCode");
  let ReqBody = {
      "module": "ChatBotCms",
      "module_code": "ChatCmsService",
      "action": "addProducts",
      "data": {
        "product_code" : productCode.value,
        "product_name" : productName.value,
        "organization_code" : organizationCode.value
      }
  };
  let headers = {
      "Content-Type": "application/json",
      "Authorization": 'Bearer ' + sessionStorage.getItem('SLIC_CHAT_TOKEN')
  };
  apiCall("http://product-service-be.dv/api/v1/chatbot/service", ReqBody, headers, response => {
    if (response.code == 200) {
      closePopUp();
      loadProducts();
      swalOpenClose('success', 'Product added Successfully..!');
    } else if (response.code == 201) {
      closePopUp();
      swalOpenClose('failure', response.message);
    } else {
      closePopUp();
      swalOpenClose('failure', 'Product added failure..!');
    }
  });
}

function submitConfigDetails() {
  let productCode = document.getElementById("productCode");
  let organizationCode = document.getElementById("organizationCode");
  let sessionKeyName = document.getElementById("sessionKeyName");
  let ReqBody = {
      "module": "ChatBotCms",
      "module_code": "ChatCmsService",
      "action": "addConfigurations",
      "data": {
        "product_code" : productCode.value,
        "organization_code" : organizationCode.value,
        "session_key" : sessionKeyName.value
      }
  };
  let headers = {
      "Content-Type": "application/json",
      "Authorization": 'Bearer ' + sessionStorage.getItem('SLIC_CHAT_TOKEN')
  };
  apiCall("http://product-service-be.dv/api/v1/chatbot/service", ReqBody, headers, response => {
    if (response.code == 200) {
      closePopUp();
      loadConfigurations();
      swalOpenClose('success', 'Configuration added Successfully..!');
    } else if (response.code == 201) {
      closePopUp();
      swalOpenClose('failure', response.message);
    } else {
      closePopUp();
      swalOpenClose('failure', 'Configuration added failure..!');
    }
  });
}

function submitLanguageDetails() {
    let ReqBody = {
        "module": "ChatBotCms",
        "module_code": "ChatCmsService",
        "action": "addLanguages",
        "data": {
          "organization_id": document.getElementById("organizationCode").value, 
          "product_id": document.getElementById("productCode").value,
          "languages" : languageAddArray
        }
    };
    let headers = {
        "Content-Type": "application/json",
        "Authorization": 'Bearer ' + sessionStorage.getItem('SLIC_CHAT_TOKEN')
    };
    apiCall("http://product-service-be.dv/api/v1/chatbot/service", ReqBody, headers, response => {
      if (response.code == 200) {
        closePopUp();
        getLangauges();
        swalOpenClose('success', 'Language added Successfully..!');
      } else if (response.code == 201) {
        closePopUp();
        swalOpenClose('failure', response.message);
      } else {
        closePopUp();
        swalOpenClose('failure', 'Language added failure..!');
      }
    });
}

function addQuestionArray() {
  document.getElementById('qaInputType').disabled = true;
  let qaLanguage = document.getElementById('qaLanguage');
  let language = qaLanguage.value;
  let options = qaLanguage.options;
  let clearFields = true;
  if (options.length != 1) {
    for (let i = 0; i < options.length; i++) {
      if (options[i].value === qaLanguage.value) {
          qaLanguage.remove(i);
          break;
      }
    }
  } else {
    clearFields = false;
    document.getElementById('add_questions_array').disabled = true;
    document.getElementById('step-2').disabled = false;
  }
  if (qaInputType.value == 'radio') {
      const textareas = document.querySelectorAll('textarea');
      let options = {}, optionArray = [];
      textareas.forEach(textarea => {
        const name = textarea.getAttribute('name');
        const value = textarea.value;
        if (name === 'OptionText' && value.trim() !== '') {
          options.question = value;
        }
        if (name === 'OptionTitle' && value.trim() !== '') {
          options.question_title = value;
          optionArray.push(options);
          options = {};
        }
      });
      reqBodyArray.push({
        "language" : language,
        "product_id" : document.getElementById("productCode").value,
        "organization_id" : document.getElementById("organizationCode").value,
        "question_type" : document.getElementById("qaInputType").value,
        "question" : document.getElementById("QuestionText").value,
        "options" : optionArray
      });
  } else if (qaInputType.value == 'inputBox') {
    let validationType = document.getElementById("validationType").value;
    reqBodyArray.push({
          "language" : language,
          "organization_id" : document.getElementById("organizationCode").value,
          "product_id" : document.getElementById("productCode").value,
          "question_type": document.getElementById("qaInputType").value,
          "question": document.getElementById("QuestionText").value,
          "validation": {
              "minLength": document.getElementById("minLength").value,
              "maxLength": document.getElementById("maxLength").value,
              "regexPattern": document.getElementById("regex").value,
              "placeHolder": document.getElementById("placeHolder").value,
              "autocomplete": document.getElementById("autoComplete").value,
              "type": validationType,
              "errorMessage": {
                "minLength" : document.getElementById("minLengthErr").value,
                "maxLength" : document.getElementById("maxLengthErr").value,
                [validationType] : document.getElementById("regexErr").value,
                "required": document.getElementById("RequiredErr").value 
              }
          }
    });
  }
  swalOpenClose('success', 'Question added Successfully..!');
  if (clearFields) clearFieldValues();
}

function clearFieldValues() {
  let containers = document.querySelectorAll('.remove_value');
  containers.forEach(container => {
      let select = container.querySelector('select');
      if (select) select.value = '';
      let inputs = container.querySelectorAll('input');
      inputs.forEach(input => {
          input.value = '';
      });
      let textareas = container.querySelectorAll('textarea');
      textareas.forEach(textarea => {
          textarea.value = '';
      });
  });
}

function questionSave() {
    let ReqBody = {
        "module": "ChatBotCms",
        "module_code": "ChatCmsService",
        "action": "addQuestion",
        "data": {
          "question" : reqBodyArray,
          "organization_id": document.getElementById("organizationCode").value,
          "product_id": document.getElementById("productCode").value,
        }
    };
    let headers = {
        "Content-Type": "application/json",
        "Authorization": 'Bearer ' + sessionStorage.getItem('SLIC_CHAT_TOKEN')
    };
    apiCall("http://product-service-be.dv/api/v1/chatbot/service", ReqBody, headers, response => {
        reqBodyArray = [];
        closePopUp();
        getQuestion();
        Swal.fire({
          title: 'Question added Successfully..!',
          text: 'success',
          icon: 'success',
          showConfirmButton: true,
          allowOutsideClick: true,
          allowEscapeKey: true,
          allowEnterKey: true
        });
    });
}

function questionStepOne() {
  var step1Form = document.getElementById("step-1-form");
  var step2Form = document.getElementById("step-2-form");
  step1Form.style.display = "none";
  step2Form.style.display = "block";
}

function getQuestion() {
    let page = getPage(), limit = 5, skip = (page - 1) * limit;
    const product_code = document.getElementById('searchProductCode');
    const organization_code = document.getElementById('searchOrganizationCode');
    let ReqBody = {
        "module": "ChatBotCms",
        "module_code": "ChatCmsService",
        "action": "searchQuestion",
        "data": {
          "search_pid" : product_code?.value ?? "",
          "search_oid" : organization_code?.value ?? "",
          "limit": limit,
          "skip": skip
        }
    };
    let headers = {
        "Content-Type": "application/json",
        "Authorization": 'Bearer ' + sessionStorage.getItem('SLIC_CHAT_TOKEN')
    };
    apiCall("http://product-service-be.dv/api/v1/chatbot/service", ReqBody, headers, response => {
        const optionData = response.data;
        appendQuestions(optionData, limit);
    });
}

function organizationInfo(id, type) {
    let ReqBody = {
        "module": "ChatBotCms",
        "module_code": "ChatCmsService",
        "action": type == 'edit' ? "updateOrganizationDetails" : "deleteOrganizationDetails",
        "data": {
          "organization_id" : id,
          "updateData" : type == 'delete' ? "" : {
            "status": document.getElementById('organizationStatus').value,
            "organization_code": document.getElementById('editOrganizationCode').value,
            "organization_name": document.getElementById('editOrganizationName').value,
          },
        }
    };
    let headers = {
        "Content-Type": "application/json",
        "Authorization": 'Bearer ' + sessionStorage.getItem('SLIC_CHAT_TOKEN')
    };
    apiCall("http://product-service-be.dv/api/v1/chatbot/service", ReqBody, headers, response => {
      if (type == 'edit') {
        closePopUp();
        organizationEditData = {};
        swalOpenClose("success", "Organization updated Successfully..!");
      } else {
        swalOpenClose("success", "Organization Deleted Successfully..!");
      }
      loadOrganization();
    });
}

function questionInfo(id, type) {
  let page = getPage(), limit =5, skip = (page - 1) * limit;
  const searchOid = document.getElementById('searchOrganizationCode');
  const searchPid = document.getElementById('searchProductCode');
  let ReqBody = {
    "module": "ChatBotCms",
    "module_code": "ChatCmsService",
    "action": type == 'edit' ? "updateQuestionDetails" : "deleteQuestionDetails",
    "data": {
      "question_id" : id,
      "updateData" : type == 'delete' ? "" : {
        ...editQuestionArray,
      },
      "search_pid" : searchPid.value ? searchPid.value : "",
      "search_oid" : searchOid.value ? searchOid.value : "",
      "limit": limit,
      "skip": skip
    }
  };
  let headers = {
      "Content-Type": "application/json",
      "Authorization": 'Bearer ' + sessionStorage.getItem('SLIC_CHAT_TOKEN')
  };
  apiCall("http://product-service-be.dv/api/v1/chatbot/service", ReqBody, headers, response => {
    if (type == 'edit') {
      closePopUp();
      editQuestionArray = [];
      swalOpenClose("success", "Question updated Successfully..!");
    } else {
      swalOpenClose("success", "Question Deleted Successfully..!");
    }
    appendQuestions(response.data, limit);
  });
}

function productInfo(id, type) {
  let ReqBody = {
    "module": "ChatBotCms",
    "module_code": "ChatCmsService",
    "action": type == 'edit' ? "updateProductDetails" : "deleteProductDetails",
    "data": {
      "product_id" : id,
      "updateData" : type == 'delete' ? "" : {
        "product_code" : document.getElementById("editProductCode").value,
        "product_name" : document.getElementById("editProductName").value,
        "status" : document.getElementById("ProductStatus").value
      },
    }
  };
  let headers = {
      "Content-Type": "application/json",
      "Authorization": 'Bearer ' + sessionStorage.getItem('SLIC_CHAT_TOKEN')
  };
  apiCall("http://product-service-be.dv/api/v1/chatbot/service", ReqBody, headers, response => {
    if (type == 'edit') {
      closePopUp();
      productEditData = {};
      swalOpenClose("success", "Product updated Successfully..!");
    } else {
      swalOpenClose("success", "Product Deleted Successfully..!");
    }
    loadProducts();
  });
}

function configurationInfo(id, type) {
  let ReqBody = {
    "module": "ChatBotCms",
    "module_code": "ChatCmsService",
    "action": type == 'edit' ? "updateConfigDetails" : "deleteConfigDetails",
    "data": {
      "config_id" : id,
      "updateData" : type == 'delete' ? "" : {
        "session_key": document.getElementById('editSessionKey').value,
        "status": document.getElementById('configStatus').value,
      },
    }
  };
  let headers = {
      "Content-Type": "application/json",
      "Authorization": 'Bearer ' + sessionStorage.getItem('SLIC_CHAT_TOKEN')
  };
  apiCall("http://product-service-be.dv/api/v1/chatbot/service", ReqBody, headers, response => {
    if (type == 'edit') {
      closePopUp();
      configEditData = {};
      swalOpenClose("success", "Config updated Successfully..!");
    } else {
      swalOpenClose("success", "Config Deleted Successfully..!");
    }
    loadConfigurations();
  });
}

function languageInfo(id, type) {
  let ReqBody = {
    "module": "ChatBotCms",
    "module_code": "ChatCmsService",
    "action": type == 'edit' ? "updateLanguageDetails" : "deleteLanguageDetails",
    "data": {
      "language_id" : id,
      "updateData" : type == 'delete' ? "" : {
        "status" : document.getElementById("languageStatus").value
      },
    }
  };
  let headers = {
      "Content-Type": "application/json",
      "Authorization": 'Bearer ' + sessionStorage.getItem('SLIC_CHAT_TOKEN')
  };
  apiCall("http://product-service-be.dv/api/v1/chatbot/service", ReqBody, headers, response => {
    if (type == 'edit') {
      closePopUp();
      languageEditData = {};
      swalOpenClose("success", "Language updated Successfully..!");
    } else {
      swalOpenClose("success", "Language Deleted Successfully..!");
    }
    getLangauges();
  });
}

function appendQuestions(resData, limit) {
  const tbodyId = 'questionsTableBody';
  const tbody = document.getElementById(tbodyId);

  if (tbody) {
    tbody.parentNode.removeChild(tbody);
  }
  const newTbody = document.createElement('tbody');
  newTbody.id = tbodyId;

  if (resData.questions.length > 0) {
    resData.questions.forEach((question, index) => {
      const tr = document.createElement('tr');
      const tdIndex = document.createElement('td');
      tdIndex.textContent = index + 1;
      tr.appendChild(tdIndex);

      const organization = document.createElement('td');
      organization.textContent = question.organization_code;
      tr.appendChild(organization);

      const product = document.createElement('td');
      product.textContent = question.product_code;
      tr.appendChild(product);

      const tdQuestionType = document.createElement('td');
      tdQuestionType.textContent = question.question_type;
      tr.appendChild(tdQuestionType);

      const tdLanguage = document.createElement('td');
      tdLanguage.textContent = question.language;
      tr.appendChild(tdLanguage);

      const tdQuestion = document.createElement('td');
      const button = document.createElement('button');
      button.type = 'button';
      button.id = 'show_questions_' + (index + 1);
      button.className = 'show_questions';
      button.textContent = 'Show Question';
      button.setAttribute('onclick', `openQuestion('${JSON.stringify(question.question)}')`)
      tdQuestion.appendChild(button);
      tr.appendChild(tdQuestion);

      const statusCell = document.createElement('td');
      statusCell.style.color = question.status == '1' ? 'green' : 'red';
      statusCell.textContent = question.status == '1' ? 'Active' : 'InActive';
      tr.appendChild(statusCell);

      const editCell = document.createElement('td');
      const editDiv = document.createElement('div');
      const editSpan = document.createElement('span');
      editSpan.className = 'options';
      const editIcon = document.createElement('i');
      editIcon.className = 'fas fa-edit';
      editIcon.setAttribute('onclick', `questionEditPopup('${JSON.stringify(question)}')`)
      editSpan.appendChild(editIcon);
      editDiv.appendChild(editSpan);
      editCell.appendChild(editDiv);
      tr.appendChild(editCell);

      const trashCell = document.createElement('td');
      const trashDiv = document.createElement('div');
      const trashSpan = document.createElement('span');
      trashSpan.className = 'options';
      const trashIcon = document.createElement('i');
      trashIcon.className = 'fas fa-trash-alt';
      trashIcon.setAttribute('onclick', `questionInfo('${question._id}', 'delete')`)
      trashSpan.appendChild(trashIcon);
      trashDiv.appendChild(trashSpan);
      trashCell.appendChild(trashDiv);
      tr.appendChild(trashCell);
      newTbody.appendChild(tr);
      generatePagination(resData.totallength, limit, 'questions');
    });
  } else {
    const tr = document.createElement('tr');
    const notFound = document.createElement('td');
    notFound.innerHTML = "No Data Found";
    notFound.colSpan = 9;
    notFound.style.textAlign = "center";
    tr.appendChild(notFound);
    newTbody.appendChild(tr);
    clearPagination();
  }
  document.querySelector('table').appendChild(newTbody);
}

function openQuestion(question) {
  let qaAppendText = document.getElementById("questionTxt");
  qaAppendText.innerHTML = formatJson(JSON.parse(question));
  initModal("#openQuestions");
}

function formatJson(json) {
  let formatted = '<div>';
  for (let key in json) {
      if (json.hasOwnProperty(key)) {
          formatted += `<p><span class="key">${key}:</span> <span class="value">${json[key]}</span></p>`;
      }
  }
  formatted += '</div>';
  return formatted;
}

function qmSearchOrganizationCode(event, dropDownId, page = '') {
    const dropdown = dropDownId;
    if (!event.target.value)  {
      for (let i = dropdown.options.length - 1; i >= 0; i--) {
        dropdown.remove(dropdown.options[i]);
      }
      return;
    }
    for (let i = dropdown.options.length - 1; i >= 0; i--) {
      dropdown.remove(dropdown.options[i]);
    }
    let ReqBody = {
        "module": "ChatBotCms",
        "module_code": "ChatCmsService",
        "action": "getProductCodeByOrganization",
        "data": {
          "organization_code" : event.target.value
        }
    };
    let headers = {
        "Content-Type": "application/json",
        "Authorization": 'Bearer ' + sessionStorage.getItem('SLIC_CHAT_TOKEN')
    };
    apiCall("http://product-service-be.dv/api/v1/chatbot/service", ReqBody, headers, response => {
        const optionData = response.data;
        optionData.forEach(options => {
          const option = document.createElement('option');
          option.text = options.product_name;
          option.value = options._id;
          dropdown.appendChild(option);
          if (page == 'questionPage') {
            appendLanguageIndropDown(event.target.value, options._id);
          }
        });
    });
}

function appendLanguageIndropDown(organizationId, productId) {
  let qaLanguage = document.getElementById('qaLanguage');
  while (qaLanguage.firstChild) {
    qaLanguage.removeChild(qaLanguage.firstChild);
  }
  let ReqBody = {
    "module": "ChatBotCms",
    "module_code": "ChatCmsService",
    "action": "getLanguageByOrganizationAndPrduct",
    "data": {
      "organization_code" : organizationId,
      "product_code" : productId
    }
  };
  let headers = {
      "Content-Type": "application/json",
      "Authorization": 'Bearer ' + sessionStorage.getItem('SLIC_CHAT_TOKEN')
  };
  apiCall("http://product-service-be.dv/api/v1/chatbot/service", ReqBody, headers, response => {
      const optionData = response.data;
      console.log(optionData);
      optionData.forEach(option => {
        const newOption = document.createElement('option');
        newOption.value = option.language;
        newOption.text = option.language;
        qaLanguage.appendChild(newOption);
      });
  });
}

function openQaMapEditor(data, inputType) {
  reloadModal();
  let resData = JSON.parse(data);
  updateQaCodeinputType = inputType;
  questionMapId = resData.question_map_id;

  if (resData.question_id) {
    document.getElementById("QaCode").value = resData.question_id ? resData.question_id : "";
  }
  if (inputType == 'inputBox') {
      if (resData.next_question_id) {
        document.getElementById("NextQaCode").value = resData.next_question_id;
      }
  } else if (inputType == 'radio') {
    document.getElementById("NextQaCode").disabled = true;
    let mappaingQaNext = document.querySelector(".row.question_add");
    const fragment = document.createDocumentFragment();
    resData.options.forEach((option, i) => {
      const tempContainer1 = document.createElement('div');
      tempContainer1.className = 'col-md-3';
      tempContainer1.innerHTML = `
        <div class="form-group focused">
          <label for="Option_${i}">Option:</label>
          <input id="Option_${i}" type="text" name="Option_${i}" value="${option.question ? option.question : ""}" class="form-control" disabled=true>
        </div>
      `;
      const tempContainer2 = document.createElement('div');
      tempContainer2.className = 'col-md-3';
      tempContainer2.innerHTML = `
        <div class="form-group focused">
          <label for="OptionCode_${i}">Option Code:</label>
          <input id="OptionCode_${i}" type="text" name="OptionCode_${i}" value="${option.question_id ? option.question_id : ""}" class="form-control">
        </div>
      `;
      const tempContainer3 = document.createElement('div');
      tempContainer3.className = 'col-md-3';
      tempContainer3.innerHTML = `
        <div class="form-group focused">
          <label for="OptionNextQaCode_${i}">Next Questioncode:</label>
          <input id="OptionNextQaCode_${i}" type="text" name="OptionNextQaCode_${i}" value="${option.next_question_id ? option.next_question_id : ""}" class="form-control">
        </div>
      `;
      fragment.appendChild(tempContainer1);
      fragment.appendChild(tempContainer2);
      fragment.appendChild(tempContainer3);
    });
    mappaingQaNext.appendChild(fragment);
  }
  initModal("#OpenQaMapping");
}

function editInputTypeChange(qaInputType){
  if (qaInputType) {
    const inputGroups = document.querySelectorAll('.edit-input-group');
    inputGroups.forEach(group => group.classList.add('edit-hidden'));
    if (qaInputType) {
      const inputGroup = document.querySelectorAll(`.edit-input-${qaInputType}`);
      inputGroup.forEach(group => {
        if (group) {
          group.classList.remove('edit-hidden');
        }
      });
    }
  }
}

function inputTypeChange(){
  qaInputType = document.getElementById("qaInputType");
  if (qaInputType) {
    const inputGroups = document.querySelectorAll('.input-group');
    inputGroups.forEach(group => group.classList.add('hidden'));
    const selectedOption = qaInputType.value;
    if (selectedOption) {
      const inputGroup = document.querySelectorAll(`.input-${selectedOption}`);
      inputGroup.forEach(group => {
        if (group) {
          group.classList.remove('hidden');
        }
      });
    }
  }
}

function updateQuestionCode() {
  let reqBody = {};
  const productCode = document.getElementById('qmSearchProductCode');
  const QaCode = document.getElementById('QaCode');
  const NextQaCode = document.getElementById('NextQaCode');
  if (updateQaCodeinputType == 'inputBox') {
    reqBody = {
        "module": "ChatBotCms",
        "module_code": "ChatCmsService",
        "action": "updateQuestionCode",
        "data": {
          "qcode_map_id" : questionMapId,
          "product_code": productCode.value,
          "question_code" : QaCode.value,
          "next_question_code" : NextQaCode.value
        }
    };
  } else if(updateQaCodeinputType == 'radio') {
    let values = [];
    let index = 0;

    while (document.getElementById(`OptionCode_${index}`) && document.getElementById(`OptionNextQaCode_${index}`)) {
        let obj = {};
        obj['index'] = index;
        obj['question_id'] = document.getElementById(`OptionCode_${index}`).value;
        obj['next_question_id'] = document.getElementById(`OptionNextQaCode_${index}`).value;
        values.push(obj);
        index++;
    }
    reqBody = {
      "module": "ChatBotCms",
      "module_code": "ChatCmsService",
      "action": "updateQuestionOptionCode",
      "data": {
        "qcode_map_id" : questionMapId,
        "product_code": productCode.value,
        "question_code" : QaCode.value,
        "question_option_code" : values
      }
    };
  }
  let headers = {
      "Content-Type": "application/json",
      "Authorization": 'Bearer ' + sessionStorage.getItem('SLIC_CHAT_TOKEN')
  };
  apiCall("http://product-service-be.dv/api/v1/chatbot/service", reqBody, headers, response => {
    closePopUp();
    searchQuestionMapping();
    Swal.fire({
      title: 'Question updated Successfully..!',
      text: 'success',
      icon: 'success',
      showConfirmButton: true,
      allowOutsideClick: true,
      allowEscapeKey: true,
      allowEnterKey: true
    });
  });
}

function searchQuestionMapping() {
  let page = getPage(), limit = 8, skip = (page - 1) * limit;
  const product_code = document.getElementById('qmSearchProductCode');
  const organization_code = document.getElementById('qmSearchOrganizationCode');
    let ReqBody = {
        "module": "ChatBotCms",
        "module_code": "ChatCmsService",
        "action": "searchQuestionMapping",
        "data": {
          "search_pid" : product_code.value,
          "search_oid" : organization_code.value,
          "limit": limit,
          "skip": skip
        }
    };
    let headers = {
        "Content-Type": "application/json",
        "Authorization": 'Bearer ' + sessionStorage.getItem('SLIC_CHAT_TOKEN')
    };
    apiCall("http://product-service-be.dv/api/v1/chatbot/service", ReqBody, headers, response => {
      if (response.data) {
        const optionData = response.data.data.questions;
        const groupedQuestion = optionData.reduce((acc, item) => {
          if (!acc[item.question_map_id]) {
              acc[item.question_map_id] = [];
          }
          acc[item.question_map_id].push(item);
          return acc;
        }, {});

        let container = document.querySelectorAll('.cards')[0];
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
        if (Object.getOwnPropertyNames(groupedQuestion).length !== 0) {
            Object.keys(groupedQuestion).forEach(key => {
              const array = groupedQuestion[key];
              const card = document.createElement('div');
              card.className = 'card card-1';
              const titleDiv = document.createElement('div');
              titleDiv.className = 'card--title';
              const titleSpan = document.createElement('span');
              titleSpan.textContent = key;
              titleDiv.appendChild(titleSpan);
              const editDiv = document.createElement('div');
              editDiv.className = 'edit-qa-button ri-edit-box-line'; 
              editDiv.id = 'qa_value_' + key;

              if (array[0].question_data[0].question_type == 'radio') {
                editDiv.setAttribute('onclick', `openQaMapEditor('${JSON.stringify(array[0].question_data[0])}', 'radio')`)
              } else if(array[0].question_data[0].question_type == 'inputBox') {
                editDiv.setAttribute('onclick', `openQaMapEditor('${JSON.stringify(array[0].question_data[0])}',  'inputBox')`)
              }
              card.appendChild(titleDiv);
              card.appendChild(editDiv);

              array.forEach(item => {
                item.question_data.forEach(question => {
                  const valueH3 = document.createElement('h3');
                  valueH3.className = 'card--value';
                  valueH3.textContent = question.language;
                  valueH3.setAttribute("data-question", question.question.question);
                  valueH3.setAttribute('onclick', `questionView('${JSON.stringify(question)}')`)
                  card.appendChild(valueH3);
                });
              });
              const chartDiv = document.createElement('div');
              chartDiv.className = 'chart';
              const qId = document.createElement('p');
              qId.id = "q_id_" + key;
              qId.className = array[0].question_data[0].question_id;
              qId.textContent = array[0].question_data[0].question_id ? "q_id : " + array[0].question_data[0].question_id : "q_id : N/A";
              chartDiv.appendChild(qId);
              const nextqId = document.createElement('p');
              nextqId.id = "next_qid_" + key;
              nextqId.className = array[0].question_data[0].next_question_id;
              nextqId.textContent = array[0].question_data[0].next_question_id ? "next_qid : " + array[0].question_data[0].next_question_id : "next_qid : N/A";
              chartDiv.appendChild(nextqId);
              card.appendChild(chartDiv);
              container.appendChild(card);
            });
            generatePagination(response.data.data.totallength, limit, 'questions/mapping');
        } else {
          const notFound = document.createElement('h2');
          notFound.className = 'no_data_found';
          notFound.textContent = "no records found";
          container.appendChild(notFound);
          // clearPagination();
        }
      }
    });
}

function questionView(data) {
  let resData = JSON.parse(data);
  let qaAppendText = document.getElementById("question_text");
  let qaOptionTextDiv = document.getElementById("question-options");
  qaOptionTextDiv.innerHTML = "";
  qaAppendText.innerHTML = "Question:  " + resData.question.question;

  if (resData.question_type == 'radio') {
    let concatenatedString = '';
    resData.options.forEach(item => {
      concatenatedString += item.question + ', ';
    });
    const options = document.createElement('h2');
    options.className = 'qa_option_show heading-xlarge text-center';
    concatenatedString = concatenatedString.slice(0, -2);
    options.textContent = "Options:  " + concatenatedString;
    qaOptionTextDiv.appendChild(options);
  }
  
  initModal("#openQuestionText");
}

function radioButton(type = "") {
    let radioColumn = `${type}radio_${type ? editRadioButtonCount : radioButtonCount}`;
    const col1 = document.createElement('div');
    col1.className = `col-md-6 ${type}input-group ${type}remove_value edit-rm-radio ${type}input-radio ${radioColumn}`;

    const formGroup1 = document.createElement('div');
    formGroup1.className = 'form-group focused';

    const label1 = document.createElement('label');
    label1.setAttribute('for', `${type ? 'edit' : ''}OptionText`);
    label1.textContent = 'Option:';

    const textarea1 = document.createElement('textarea');
    textarea1.className = 'form-control';
    textarea1.id = `${type ? 'edit' : ''}OptionText`;
    textarea1.name = `${type ? 'edit' : ''}OptionText`;
    textarea1.rows = 4;
    textarea1.cols = 50;
    textarea1.spellcheck = false;

    formGroup1.appendChild(label1);
    formGroup1.appendChild(textarea1);
    col1.appendChild(formGroup1);

    // Create the second column
    const col2 = document.createElement('div');
    col2.className = `col-md-6 ${type}input-group ${type}remove_value edit-rm-radio ${type}input-radio ${radioColumn}`;

    const formGroup2 = document.createElement('div');
    formGroup2.className = 'form-group focused';

    const label2 = document.createElement('label');
    label2.setAttribute('for', `${type ? 'edit' : ''}OptionTitle`);
    label2.textContent = 'Option title:';

    const textarea2 = document.createElement('textarea');
    textarea2.className = 'form-control';
    textarea2.id = `${type ? 'edit' : ''}OptionTitle`;
    textarea2.name = `${type ? 'edit' : ''}OptionTitle`;
    textarea2.rows = 4;
    textarea2.cols = 50;

    const removeButton = document.createElement('button');
    removeButton.className = `remove ${type}remove_radio`;
    removeButton.id = radioColumn;
    removeButton.setAttribute('onclick', `removeRadioButton('${radioColumn}', '${type}')`)
    
    const removeIcon = document.createElement('i');
    removeIcon.className = 'fa.fa-minus';
    removeButton.appendChild(removeIcon);
    removeButton.appendChild(document.createTextNode(' Remove'));

    formGroup2.appendChild(label2);
    formGroup2.appendChild(textarea2);
    formGroup2.appendChild(removeButton);
    col2.appendChild(formGroup2);

    // Append columns to the container
    const container = document.querySelector(`.row.${type ? 'edit_' : '' }new_row`);
    container.appendChild(col1);
    container.appendChild(col2);
    if (type) {
      editRadioButtonCount++;
    } else {
      radioButtonCount++;
    }  
}

function removeRadioButton(className, type) {
  const elements = document.querySelectorAll(`.col-md-6.${type}input-group.${type}input-radio.${className}`);
  elements.forEach(element => {
    if (type && element.querySelector('[name]')?.getAttribute('name') == 'editOptionText') {
      const qaQuestionAttr = element.querySelector('[qa_question_attribute]')?.getAttribute('qa_question_attribute');
      const qaNeQuestionAttr = element.querySelector('[qa_ne_question_attribute]')?.getAttribute('qa_ne_question_attribute');
      const questionId = qaQuestionAttr ?? qaNeQuestionAttr;
        const index = questionEditData.options.findIndex(item => item.question_id === questionId);
        if (index !== -1) {
            questionEditData.options.splice(index, 1);
            console.log(`Removed object with question_id: ${questionId}`);
        } else {
            console.log(`No matching object found for question_id: ${questionId}`);
        }
    }
    element.remove()
  });
  console.log(questionEditData);
}

function reloadModal() {
  document.getElementById('OpenQaMapping').remove();
  const modal = document.createElement('div');
  modal.id = 'OpenQaMapping';
  modal.className = 'modal fade modal-align-mobile-bottom show';
  modal.style.display = 'none';
  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-lg modal-dialog-center">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" id="closeQaMap" class="modal-close" onclick="closePopUp(document.getElementById('OpenQaMapping'))">
            <span class="sr-only">close</span>
          </button>
        </div>
        <div class="modal-body">
          <form id="form-question">
            <div id="step-1-form" class="step-1-form">
              <h2 class="heading-xlarge text-center">Question Code</h2>
              <br>
              <div class="mobile-scroll-popup">
                <div class="row question_add">
                  <div class="col-md-6">
                    <div class="form-group focused">
                      <label for="QaCode">Question Code:</label>
                      <input id="QaCode" type="text" name="QaCode" class="form-control">
                    </div>
                  </div>
                  <div class="col-md-4" id="mapping_qa_next">
                    <div class="form-group focused">
                      <label for="NextQaCode">Next Question Code:</label>
                      <input id="NextQaCode" type="text" name="NextQaCode" class="form-control">
                    </div>
                  </div>
                </div>
                <div class="row button_submit">
                  <div class="col-md-6 text-center">
                    <button type="button" id="updateQcode" class="button button--large button--blue button--mobile" onclick="updateQuestionCode()">
                      <span>Continue</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function swalOpenClose(type, message) {
  if (type == 'success') {
    Swal.fire({
      title: message,
      text: 'success',
      icon: 'success',
      showConfirmButton: true,
      allowOutsideClick: true,
      allowEscapeKey: true,
      allowEnterKey: true
    });
  } else if (type == 'failure') {
    Swal.fire({
      title: message,
      text: 'error',
      icon: 'error',
      showConfirmButton: true,
      allowOutsideClick: true,
      allowEscapeKey: true,
      allowEnterKey: true
    });
  }
}

function generatePagination(totallength, limit, slug) {
  let currentPage = getPage();
  const totalPages = Math.ceil(totallength / limit);
  let pagination = document.getElementById('pagination');
  pagination.innerHTML = "";
  if (totalPages <= 0) {
    return '';
  }
  let paginationHTML = '<nav data-pagination="">';
  if (currentPage >= 1) {
    paginationHTML += `<a href="/${slug}?page=${currentPage - 1}">Previous<i class="ion-chevron-left"></i></a>`;
  }
  paginationHTML += '<ul>';
  for (let page = 1; page <= totalPages; page++) {
    paginationHTML += `<li class="${page == currentPage ? 'active' : ''}"><a href="/${slug}?page=${page}">${page}</a></li>`;
  }
  paginationHTML += '</ul>';

  if (currentPage < totalPages) {
    paginationHTML += `<a href="/${slug}?page=${currentPage + 1}">Next<i class="ion-chevron-right"></i></a>`;
  }
  paginationHTML += '</nav>';
  pagination.innerHTML = paginationHTML;
}

function clearPagination() {
  let pagination = document.getElementById('pagination');
  pagination.innerHTML = "";
}

function escapeHTML(unsafe) {
  return unsafe
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
}

function getPage(){
  const url = new URL(window.location.href);
  const queryParams = new URLSearchParams(url.search);
  return queryParams.get('page') || 1;
}