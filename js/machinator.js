// Handling creator's/instructor's content file
let thisSessionContent     = {
  "page": {
    "siteTitle": "Click on me to edit the title",
    "introTitle": "Click on me to edit the introduction title (or keep it empty)",
    "introText": "Write here your introduction text",
    "instructionsTitle": "Click on me to edit the instructions title",
  },
  "instructions": []
};


// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Registering title and intro-text changes on static site elements
document.querySelectorAll("#siteTitle, #introTitle, #introText, #instructionsTitle")
  .forEach((element) => {
    element.addEventListener("focus",  () => {
      element.textContent                                                                     = "Placeholder";
    });
    element.addEventListener("blur",  () => {
      thisSessionContent.page[element.id]                                                     = element.textContent;
      if (element.id === "site-title") document.getElementsByTagName("title")[0].innerHTML    = element.textContent;
      saveToLocalStorage(thisSessionContent);
    });
  });

// Autosave progress
// Save content whenever it changes
function saveToLocalStorage(tSC) {
  const data = tSC || thisSessionContent;
  localStorage.setItem('instructionContent', JSON.stringify(data));
}
document.addEventListener('input', saveToLocalStorage);


// Save project
async function saveContent(payload) {
  const dataToSave = payload || thisSessionContent;

  const blob = new Blob([JSON.stringify(dataToSave)], { type: 'application/json' })
  const a = document.createElement('a');
  a.download = 'content.json';
  a.href = URL.createObjectURL(blob);
  a.click();
  URL.revokeObjectURL(a.href);
}

const saveButton             = document.getElementById('save-button');
saveButton.addEventListener("click", () => saveContent(thisSessionContent));


// Load project
const loadButton             = document.getElementById('load-button');
const loadFrominput          = document.getElementById('loadFile');
loadButton.addEventListener("click", () => loadFrominput.click());

document.getElementById('loadFile').addEventListener('change', function(e) {
  thisSessionContent = {};
  localStorage.clear();
  instroContainer.innerHTML        = '';
  allLinesData                     = [];
  document.querySelectorAll("svg").forEach(svg => svg.remove());
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(ev) {
      const data = JSON.parse(ev.target.result);
      thisSessionContent = data;
      //document.querySelector('.newCategoryOffer').remove();
      saveToLocalStorage(thisSessionContent);
      updateContentToUI();
    };
    reader.readAsText(file);
  }
  this.value = ''; // Reset so same file can be loaded again
});


// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


// Delete Elements (KatBox, txtbubble, imgbubble and LLines) Template
function deleteElements(KBID, Obj = "", hash = "") {

  try {
    
    if (!Obj && !hash) {
      
      // delete the selected KatBox/element and its content
      const selectedKBx                          = document.getElementById("KatBox-" + KBID);
      selectedKBx.querySelectorAll('[id^="SP-"]').forEach((element) => { // deleting all txtbubble elements and its LeaderLines
        deleteLLine(element);
        element.remove();
      });
      selectedKBx.querySelectorAll('[id^="EA-"]').forEach(element => element.remove()); // deleting all EndArea elements
      selectedKBx.remove();

      // delete the selected item from thisSessionContent
      const selectedItemIndex                    = thisSessionContent.instructions.findIndex(item => item.KatID === KBID);
      thisSessionContent.instructions.splice(selectedItemIndex, 1);

    } else {
      
      // removing DOM elements and LeaderLines
      const selectedSP               = document.getElementById("SP-" + hash);
      if (selectedSP) deleteLLine(selectedSP);
      const EAelement                = document.getElementById("EA-" + hash);
      if (EAelement) EAelement.remove();
      document.querySelector(`[data-hash="${hash}"]`).remove(); // deleting the txt-/img-bubble and its children

      // updates thisSessionContent
      const selectedKatBox                                     = thisSessionContent.instructions.find(item => item.KatID === KBID);
      const selectedIndex                                      = selectedKatBox[Obj].findIndex(item => item.hashID === hash);
      selectedKatBox[Obj].splice(selectedIndex, 1);
      selectedKatBox.KatLines                                  = selectedKatBox.KatLines.filter(item => item.hashID !== hash || item.hImage !== hash);

    }

    // delete the line
    //console.log("allLinesData:", allLinesData, "hash", hash);
    allLinesData                               = allLinesData.filter(item => item.SPID !== "SP-" + hash);

    // saves the updated tSC
    saveToLocalStorage(thisSessionContent);

  } catch (error) {
    console.error('Error deleting element:', error);
  }

}

// Reposition LeaderLines on size (and supposedly position) changes
const resizeObserver = new ResizeObserver((entries) => {
  // This loop runs whenever ANY observed element changes size
  for (let entry of entries) {
    const element = entry.target;
    
    // If this element has a leader line attached, reposition it!
    if (element._leaderLine) {
      element._leaderLine.position();
    }
  }
});
/* 2. Tell it which elements to watch
Whenever you create a StartPoint or EndArea, pass it to the observer:
resizeObserver.observe(StartPoint);
resizeObserver.observe(EndArea);
*/


// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


// new category offer
function changeToInput() {    
  const nCtxt                                    = document.querySelector('#nCtxt');
  nCtxt.setAttribute('onclick', '');
  const nCtxth1                                  = nCtxt.children[0]; 
  if (nCtxt.children[0].tagName === 'H1') {
    nCtxt.children[0].style.display   = 'none';
  }
  else {
    throw new Error('No h1 found');
  }

  const input                                    = document.querySelector('#inputforCatTitle');
  input.classList.toggle('hidden');
  input.focus();
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      createCategory();
    }
  });

  const AddButton                                = document.querySelector('.AddButton1');
  AddButton.classList.add('AddButton2');
  AddButton.setAttribute('onclick', `createCategory()`);
}

function newCategoryOffer() {

  /* visual:
    <section class="newCategoryOffer row">
      <div class="AddButton"></div>
      <div id="nCtxt" class="nC-txt width100" onclick="changeToInput()">
        <h1 onclick="changeToInput()">new Category (click on me to name me und then Enter/Return)</h1>
        <input type="text" id="inputforCatTitle" class="hidden"></div>
    </section>
  */

  const newCategory                              = document.createElement('section');
  newCategory.classList.add('newCategoryOffer', 'row');

  const AddButton                                = document.createElement('div');
  AddButton.classList.add('AddButton1');
  newCategory.appendChild(AddButton);

  const nCtxt                                    = document.createElement('div');
  nCtxt.id                                       = 'nCtxt';
  nCtxt.classList.add('nC-txt', 'width100');
  nCtxt.setAttribute('onclick', `changeToInput()`);
  nCtxt.innerHTML                                = '<h1 onclick="changeToInput()">new Category (click on me, again to name me und then go to plus button)</h1>';
  newCategory.appendChild(nCtxt);

  const nCInput                                  = document.createElement('input');
  nCInput.setAttribute('type', 'text');
  nCInput.id                                     = 'inputforCatTitle';
  nCInput.classList.add('hidden');
  nCInput.value                                  = '';
  nCtxt.appendChild(nCInput);

  return newCategory;
}

// new category addition
function createCategory() {
  const nCinput                                          = document.getElementById('inputforCatTitle');
  const savedCatName                                     = nCinput.value;
  nCinput.classList.toggle('hidden');
  nCinput.value                                          = '';

  const nctxt                                            = document.getElementById('nCtxt');
  nCtxt.setAttribute('onclick', `changeToInput()`);
  nCtxt.innerHTML                                        = '<h1 onclick="changeToInput()">new Category (click on me to name me und then Enter/Return)</h1><input type="text" id="inputforCatTitle" class="hidden"></div>';

  const newCatContainer                                  = document.createElement('div');
  
  newCatContainer.classList.add('CatContainer', 'row');
  let catID = thisSessionContent.instructions.length;

  newCatContainer.id                                     = catID;

  const MoveIconBox                                      = document.createElement('div');
  MoveIconBox.classList.add('MoveIconBox');
  newCatContainer.appendChild(MoveIconBox);

  const newCatSecContent                                 = document.createElement('section');
  newCatSecContent.classList.add('Section', 'column');
  newCatContainer.appendChild(newCatSecContent);
  const CatTitle                                         = document.createElement('h2');
  CatTitle.textContent                                   = savedCatName;
  newCatSecContent.appendChild(CatTitle);
  const newCatSeccontainerC                              = document.createElement('div');
  newCatSeccontainerC.classList.add('containerC', 'bubbleContainer', 'row');
  newCatSecContent.appendChild(newCatSeccontainerC);
  const newCatSecContTxt                                 = document.createElement('div');
  newCatSecContTxt.classList.add('txtColumn', 'column');
  newCatSeccontainerC.appendChild(newCatSecContTxt);
  const newCatSecContImg                                 = document.createElement('div');
  newCatSecContImg.classList.add('imgColumn', 'column');
  newCatSeccontainerC.appendChild(newCatSecContImg);

  const deleteCircle                                     = document.createElement('div');
  deleteCircle.classList.add('deleteCircleBox');
  newCatContainer.appendChild(deleteCircle);

  const payload = {
    Katname: savedCatName,
    KatID: hashVgenerator(),
    KatMover: MoveIconBox.outerHTML,
    KatSection: newCatSecContent.outerHTML,
    KatContentTxt: [],
    KatContentImg: [],
    KatLines: [],
    KatDelete: deleteCircle.outerHTML,
  };

  thisSessionContent["instructions"].push(payload);

  updateContentToUI();
};

// change Kat order
const instroContainer = document.getElementById('instructions-container');
let sortTimeout; // Variable to store the timeout reference
new Sortable.create(instroContainer, {
  animation: 150,
  filter: ".EndArea, .imgreorder, .txtreorder",  // Selectors that do not lead to dragging (String or Function)
  preventOnFilter: true, // Call `event.preventDefault()` when triggered `filter`
  draggable: ".KatBox",
  direction: 'vertical',
  onEnd: function (evt) {
    // Clear any existing timeout to avoid multiple calls
    clearTimeout(sortTimeout);

    try {
      // Set a delay of 3 seconds before sending the request
      sortTimeout = setTimeout(() => {

        console.log("3 seconds passed");

        // update the LeaderLines
        const selectedSPs              = document.querySelectorAll('.StartPoint');
        if (selectedSPs) selectedSPs.forEach(sp => sp._leaderLine?.position());

        // Get new order
        const filteredArray            = Array.from(instroContainer.children).filter(div => div.classList.contains('KatBox'));
        const updatedInstructions      = filteredArray.map((div, index) => {

          const KBID                        = div.id.split('-')[1];
          const selectedItem                = thisSessionContent["instructions"].find(item => item.KatID === KBID); // Grab the original instruction object, clone it, and update KatID
          return {
            ...selectedItem, // Shallow clone to prevent mutating mid-flight
          };
        });
        thisSessionContent["instructions"] = updatedInstructions; // Overwrite the old array with re-ordered array
        
        //console.log("tSC after nOrder", thisSessionContent["instructions"]);

        saveToLocalStorage(thisSessionContent);

      }, 3000); // 3000ms = 3 seconds

      saveToLocalStorage(thisSessionContent);

    } catch (error) {
      console.error(error);
    }
  },
});

// delete category  
document.body.addEventListener('click', (e) => {
  if (e.target.classList.contains('deleteCircleBox')) {
    const parentID                               = e.target.parentElement.id;

    if (parentID.startsWith('KatBox-')) {
      const catID                                = parentID.split('-')[1];
      deleteElements(catID);
    }
  }
});


// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


// new txt offer
function hashVgenerator() {
  const hashValue                                = Math.random().toString(36).slice(10).padStart(3, '0');
  return hashValue;
} 

document.addEventListener('click', (event) => {
    if (event.target.closest('.SubmitContainer')) {

      let hashValue;
      do {
        hashValue                                = hashVgenerator();
        const isDuplicate                        = thisSessionContent.instructions.some(item => item.KatContentTxt.some(txt => txt.hashID === hashValue));
        if (isDuplicate) {
          hashValue                              = undefined;
        }
      } while (typeof hashValue === 'undefined');          

      const catID                                = event.target.closest('.SubmitContainer').id.split('-')[1];
      const correspondingQuill                   = document.querySelector('#quill-editor-' + catID);
      const closestOFquill                       = correspondingQuill.querySelector('.ql-editor');
      const txtContent                           = closestOFquill.innerHTML;
      addTxtbubble(catID, txtContent, hashValue);
    }
  });

function newTxtOffer(catID) {

  /* visual:
  <div id="editor-container" class="txtcontnew box column">
      <div ----quill originated structure---- >
          <div id="Submit-1" class="SubmitContainer">
              <p>Submit</p>
          </div>
      </div>
  </div>
  */

  const newtxtcontent   = document.createElement("div");
  newtxtcontent.id      = "editor-container";
  newtxtcontent.classList.add("txtcontnew", "box", "column");
  const editor          = document.createElement("div");
  editor.id             = "quill-editor-" + catID;
  editor.innerHTML      = "<p>Write your instructions ...</p>";
  newtxtcontent.appendChild(editor);
  const Submit          = document.createElement("div");
  Submit.id             = "Submit-" + catID;
  Submit.classList.add("SubmitContainer");
  Submit.innerHTML      = "<p>Submit</p>";
  newtxtcontent.appendChild(Submit);
  return newtxtcontent;
}

// txt addition
function addTxtbubble(catID, txtContent, hashValue) {
  try {
    const tSCinstro                              = thisSessionContent.instructions.find(item => item.KatID === catID);
    tSCinstro.KatContentTxt.push({hashID: hashValue, tbContent: txtContent});
    updateContentToUI();
  } catch (error) {
    console.error('Error processing task:', error);
  }
}

// change txt order
function ObserveTxtReorder(KatBoxID) {

  const selectedKatBox       = document.getElementById(KatBoxID); // Correctly selecting the KatBox by ID
  const txtColumn            = selectedKatBox.querySelector('.txtColumn.column'); // The column of txtbubbles
  const KBHash               = KatBoxID.split('-')[1];
  const selectedKB           = thisSessionContent.instructions.find(block => block.KatID === KBHash);

  // Create a Sortable instance only for the txtColumn within each KatBox
  new Sortable(txtColumn, {
    group: 'nested', // To allow nested reordering within the KatBox
    animation: 150,
    filter: ".geometryArea, .txtDelete",  // Selectors that do not lead to dragging (String or Function)
    preventOnFilter: true, // Call `event.preventDefault()` when triggered `filter`
    draggable: ".txtbubble",
    fallbackOnBody: true,
    swapThreshold: 0.65,
    direction: 'vertical',
    onEnd: function (evt) {
      // Send the new order to thisSessionContent after 3 seconds delay
      setTimeout(() => {
        // Get the new order of txtbubbles by their IDs
        const newtxtbubblesOrder       = Array.from(txtColumn.children)
          .filter((div) => div.classList.contains('txtbubble'))
          .map(div => {
            const selectedSP           = div.querySelector('.StartPoint');
            if (selectedSP) selectedSP._leaderLine.position();
            const tbHash               = div.id.split('-')[1];
            const selectedtxtbbl       = selectedKB["KatContentTxt"].find(item => item.hashID === tbHash);

            return {...selectedtxtbbl};
          });

        selectedKB["KatContentTxt"]    = newtxtbubblesOrder;
        saveToLocalStorage(thisSessionContent);
        
      }, 3000); // Delay of 3 seconds before initiating the restructure
    }
  });
}


// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


// new img offer
const imgInput                                 = document.getElementById('image-input-element');
imgInput.addEventListener('change', function(e) {
    const file = this.files[0];
    if (!file) return;
    const catID = this.dataset.catId;
    if (catID) imageAddition(file, catID);
    this.value = '';
});
function newImgOffer(catID) {

  /* visual:
    <div class="imgcontnew box" class="box" ondrop="handleDrop(event)" ondragover="handleDragOver(event)" onclick="document.getElementById('file-input-element').click()">
      <p>Drag & Drop deine Bilder hierher, oder klicke hier hier drauf</p>
    </div>
  */

  const newImgContent                            = document.createElement('div');
  newImgContent.classList.add('imgcontnew', 'box');
  newImgContent.setAttribute('data-cat-id', catID);

  // click handler
  newImgContent.addEventListener('click', (ev) => {
    ev.stopPropagation(); // Prevent the click event from bubbling up
    imgInput.dataset.catId                       = catID;
    imgInput.click(); // Open the file picker
  });

  // drag over - allow drop
  newImgContent.addEventListener('dragover', (ev) => {
    ev.preventDefault(); // Required to allow dropping
    ev.dataTransfer.dropEffect                   = 'copy'; // Provides a visual cue that the files can be dropped
  });

  // drop handler
  newImgContent.addEventListener('drop', (ev) => {
    ev.preventDefault();
    const files                                  = ev.dataTransfer.files;
    imageAddition(files[0], catID);
  });

  // text
  const pDragDrop                                = document.createElement('p');
  pDragDrop.innerText                            = 'Drag & Drop your images here, click here on it';
  newImgContent.appendChild(pDragDrop);

  return newImgContent;
}

// img addition
function imageAddition(file, catID) {

  if (!file) {
    return; // no file selected
  }

  const reader                                             = new FileReader();
  reader.onload = (e) => {
      // find the KatBox
      const selectedKB = thisSessionContent.instructions.find(
          cat => cat.KatID === catID
      );

      // add too thisSessionContent
      const imgPath = `assets/Content/images/${file.name}`
      selectedKB.KatContentImg.push({
          hashID: hashVgenerator(),
          filename: file.name,
          imgPath: imgPath,
      });
      
      saveToLocalStorage(thisSessionContent);
      updateContentToUI();
  };
  reader.readAsDataURL(file);
  reader.onerror = () => {
    console.error('Failed to read file');
  };
  //reader.readAsDataURL(file); // Convert to Base64
}

// change img order
function ObserveImgReorder(KatBoxID) {

  const selectedKatBox       = document.getElementById(KatBoxID); // Correctly selecting the KatBox by ID
  const imgColumn            = selectedKatBox.querySelector('.imgColumn.column'); // The column of txtbubbles
  const KBHash               = selectedKatBox.id.split('-')[1];
  const selectedKB           = thisSessionContent["instructions"].find(block => block.KatID === KBHash);

  // Create a Sortable instance only for the imgColumn within each KatBox
  new Sortable(imgColumn, {
    group: 'nested', // To allow nested reordering within the KatBox
    animation: 150,
    filter: ".imgDelete, .EndArea, .KatBox",  // Selectors that do not lead to dragging (String or Function)
    preventOnFilter: true, // Call `event.preventDefault()` when triggered `filter`
    draggable: ".imgbubble",
    fallbackOnBody: true,
    swapThreshold: 0.65,
    direction: 'vertical',
    onEnd: function (evt) {
      // Send the new order to the backend after 3 seconds delay
      setTimeout(() => {

        // update the LeaderLine positions
        const selectedSPs              = selectedKatBox.querySelectorAll('.StartPoint');
        if (selectedSPs) selectedSPs.forEach(sSP => {
          sSP._leaderLine?.position(); // if (sSP._leaderLine) sSP._leaderLine.position();
        });

        // Get the new order of txtbubbles by their IDs
        const newimgbubblesOrder       = Array.from(imgColumn.children)
          .filter((div) => div.classList.contains('imgbubble'))
          .map(div => {
            const imgID                = div.id.split('-')[1];
            const selectedimg          = selectedKB.KatContentImg.find(item => item.hashID === imgID);
            return {...selectedimg};
          });

          // Update the order in thisSessionContent
          selectedKB["KatContentImg"] = newimgbubblesOrder;
          saveToLocalStorage(thisSessionContent);
        
      }, 3000); // Delay of 3 seconds before sending the order to the backend
    }
  });
}


// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


// Quill intitializations
function initializeQuillForNewEditors() {
  document.querySelectorAll('[id^="quill-editor-"]').forEach((editorElement) => {
      if (!editorElement.quillInstance) { // Avoid reinitializing
          editorElement.quillInstance = new Quill(editorElement, { theme: 'snow' });
      }
  });
}


// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


// indicators & LeaderLines
let allLinesData = [], line = Timer = EAstyleV = null; //invisibility = false;

function toggleIndicator(SPID, KatID) {

  const selectedObj = allLinesData.find(object => object.SPID === SPID);

  const targetedSPID                               = document.querySelector(`#${SPID}`);
  targetedSPID.classList.toggle('invisible');
  const targetedEAID                               = document.querySelector(`#${selectedObj.EAID}`);
  targetedEAID.classList.toggle('invisible');

  if (targetedSPID.classList.contains('invisible')) {
    selectedObj.line.hide();
  }
  else {
    selectedObj.line.show();
  }

  clearTimeout(Timer);
  Timer = setTimeout(() => {
    console.log('3 seconds have passed', SPID);

    const isHidden                 = targetedSPID.classList.contains('invisible');
    //console.log('linePayload:', isHidden , 'stringified:', JSON.stringify(isHidden));
    
    const selectedKB               = thisSessionContent.instructions.find(block => block.KatID === KatID);
    const tbHash                   = SPID.split('-')[1];
    const selectedLine             = selectedKB.KatLines.find(line => line.hashID === tbHash);
    selectedLine.invisible         = isHidden;

    saveToLocalStorage(thisSessionContent);
  }, 3000);

  //invisibility        = isHidden;

};

function createLeaderLine(tbIdentifier, invisibility, SPID, EAID, lColor, EAValues, hI) {

  //console.log('tbIdentifier:', tbIdentifier, 'invisibility:', invisibility, 'SPID:', SPID, 'EAID:', EAID, 'lColor:', lColor, 'EAValues:', EAValues, 'hI:', hI);

  // colors
  const lineColors                               = ['orange', 'white', 'tomato', 'sandybrown', 'springgreen', 'yellow', 'fuchsia', 'sienna', 'crimson', 'deeppink'];
  let lineColor                                  = lColor || lineColors[0];

  // restrictors
  const textbubble                               = document.querySelector(`[data-hash="${tbIdentifier}"]`);
  const geoArea                                  = textbubble.querySelector(`.geometryArea`);
  const KatBox                                   = textbubble.closest('.KatBox');
  const BubblesCont                              = KatBox.querySelector('.containerC.bubbleContainer.row');
  const alltxtbubbles                            = BubblesCont.querySelectorAll('.txtbubble');
  const imgColumn                                = KatBox.querySelector('.imgColumn.column');
  const allimagebubbles                          = imgColumn.querySelectorAll('.imgbubble');
  if (!allimagebubbles.length) return;
  let ImageHolder                               = imgColumn.querySelector(`[data-hash="${hI}"]`) || imgColumn.querySelectorAll('[id^="imgbubble-"]')[0] || null;
  //storing ImageHolder dimensions
  let hIwidth, hIheight, leftPosPercent, topPosPercent = 0;
  function HIDimensions(e1, e2) {
    hIwidth  = e1 || ImageHolder.offsetWidth || 0;
    hIheight = e2 || ImageHolder.offsetHeight || 0;
  }

  HIDimensions();

  // StartPoint creation
  const StartPoint                               = document.createElement('div');
  StartPoint.classList.add('StartPoint');
  if (invisibility) StartPoint.classList.add('invisible');
  StartPoint.id                                  = SPID;
  StartPoint.style.backgroundColor               = lineColor;
  geoArea.appendChild(StartPoint);

  // EndArea creation
  const EndArea                                  = document.createElement('div');
  EndArea.classList.add('EndArea');
  if (invisibility) EndArea.classList.add('invisible');
  EndArea.id                                     = EAID;
  EndArea.style.width                            = EAValues.EAwidth;
  EndArea.style.height                           = EAValues.EAheight;
  EndArea.style.borderRadius                     = '10px';
  EndArea.setAttribute('data-clicks', '0');
  EndArea.style.border                           = '5px solid ' + `${lineColor}`;
  EndArea.style.left                             = EAValues.EAleft;
  EndArea.style.top                              = EAValues.EAtop;
  EndArea.style.transform                        = EAValues.EAtransform;
  EndArea.setAttribute('data-x', '0');
  EndArea.setAttribute('data-y', '0');
  ImageHolder.appendChild(EndArea);
  // storing EndArea dimensions
  let EAwidth, EAheight;
  function EADimensions(e1, e2) {
    EAwidth  = e1 || EndArea.offsetWidth;
    EAheight = e2 || EndArea.offsetHeight;
  };
  EADimensions;

  // Function to check if two elements overlap
  function isOverlapping(element1, element2) {
  return !(
    element1.top > element2.bottom ||
    element1.bottom < element2.top ||
    element1.left > element2.right ||
    element1.right < element2.left
  );
  }

  function dragMoveListener (event) {
    var target = event.target;
    var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
    var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);

    line.position();
  }

  // this function is used later in the resizing and gesture demos
  window.dragMoveListener = dragMoveListener

  // getting the relation of EndArea to the ImageHolder
  function EAtohIrelValues() {
    const EARect           = EndArea.getBoundingClientRect();
    const hoverImageRect   = ImageHolder.getBoundingClientRect();
    deltax                 = EARect.left - hoverImageRect.left;
    deltay                 = EARect.top - hoverImageRect.top;
    hIwidth                = hoverImageRect.width;
    hIheight               = hoverImageRect.height;
    leftPosPercent         = (hIwidth / deltax);
    topPosPercent          = (hIheight / deltay);
    EADimensions(EndArea.width, EndArea.height);          
  }

  EAtohIrelValues();

  // interact.js on EndArea
  interact(EndArea)
  .on('tap', function (event) {
    if (line) {
      let i = EndArea.dataset.clicks = (parseInt(EndArea.dataset.clicks) === lineColors.length - 1 || isNaN(EndArea.dataset.clicks)) ? 0 : parseInt(EndArea.dataset.clicks) + 1;
      lineColor                                              = lineColors[i];
      line.color = StartPoint.style.backgroundColor          = lineColor;
      EndArea.style.border                                   = '5px solid ' + `${lineColor}`;
      event.preventDefault();
    }
  })
  .resizable({
    // resize from all edges and corners
    edges: { left: true, right: true, bottom: true, top: true },

    listeners: {
      move (event) {
        var target = event.target
        var x = (parseFloat(target.getAttribute('data-x')) || 0)
        var y = (parseFloat(target.getAttribute('data-y')) || 0)

        // update the element's style
        target.style.width  = event.rect.width + 'px'
        target.style.height = event.rect.height + 'px'

        // translate when resizing from top or left edges
        x += event.deltaRect.left
        y += event.deltaRect.top

        target.style.transform = 'translate(' + x + 'px,' + y + 'px)'

        target.setAttribute('data-x', x)
        target.setAttribute('data-y', y)

        EADimensions(EndArea.offsetWidth, EndArea.offsetHeight);
        line.position();
      }
    },
    modifiers: [
      // keep the edges inside the parent
      interact.modifiers.restrictEdges({
        outer: imgColumn
      }),

      // minimum size
      interact.modifiers.restrictSize({
        min: { width: 5, height: 5 }
      })
    ],

    inertia: true
  })
  .draggable({
    // enable inertial throwing
    inertia: true,
    // keep the element within the area of it's parent
    modifiers: [
      interact.modifiers.restrictRect({
        restriction: imgColumn,
        endOnly: true
      })
    ],
    // enable autoScroll
    autoScroll: true,

    listeners: {
      // call this function on every dragmove event
      move: dragMoveListener,

      // call this function on every dragend event
      end (event) {

        // Cache layout values if necessary
        const EndAreaRect                = EndArea.getBoundingClientRect();
        const hvrdImageRect              = ImageHolder.getBoundingClientRect();
        
        if (!isOverlapping(EndAreaRect, hvrdImageRect)) {
          // Iterate over images and check overlap without forcing multiple reflows
          allimagebubbles.forEach((img) => {

            const imgRect                = img.getBoundingClientRect(); // Cache layout data for each image
            if (img && isOverlapping(EndAreaRect, imgRect)) {
              ImageHolder               = img;
              img.insertAdjacentElement('afterbegin', EndArea);
              EndArea.style.top = EndArea.style.left = '0';
              EndArea.style.transform                = 'translate(0, 0)';
              EndArea.setAttribute('data-x', '0');
              EndArea.setAttribute('data-y', '0');
            }
          });
        }

        EAtohIrelValues()

        line.position();
      }
    }
  })

  // Line by LeaderLine
  const line = new LeaderLine(
    StartPoint,
    EndArea,
    {
      size: 5,
      color: lineColor,
      endPlug: 'behind'
    }
  )

  // Attach the line reference to the element
  StartPoint._leaderLine = line;
  //EndArea._leaderLine    = line;

  // entry to the ResizeObserver (for registering any movements for updating the start point of this LeaderLine)
  resizeObserver.observe(StartPoint);

  // window size change
  window.addEventListener('resize', function () {
    // Update the dimensions of ImageHolder
    const hIRect               = ImageHolder.getBoundingClientRect();
    const hIchangeINwidth      = hIRect.width / hIwidth;
    const hIchangeINheight     = hIRect.height / hIheight;

    // Update size and position of EndArea
    /*EndArea.style.transform    = `translate(0px, 0px)`;
    EndArea.setAttribute('data-x', '0');
    EndArea.setAttribute('data-y', '0'); */
    //console.log('Positions in Percentage', topPosPercent, leftPosPercent);
    EndArea.style.width        = EAwidth * hIchangeINwidth + 'px';
    EndArea.style.height       = EAheight * hIchangeINheight + 'px';
    EndArea.style.top          = hIRect.height / topPosPercent + 'px';
    EndArea.style.left         = hIRect.width / leftPosPercent + 'px';

    HIDimensions(hIRect.offsetWidth, hIRect.offsetHeight);
    EADimensions(EndArea.offsetWidth, EndArea.offsetHeight);

    line.position();
  });

  // storing coordinates onto backend
  // KatBox ID
  const KatBoxID = KatBox.id;
  function Payload(tbIdentifier, lineColor, hI) {
    return {
      hashID: tbIdentifier,
      invisible: false,
      EAValues: {
        EAwidth: EAwidth / ImageHolder.offsetWidth,
        EAheight: EAheight / ImageHolder.offsetHeight,
        EAtop: topPosPercent,
        EAleft: leftPosPercent,
        EAtransform: 'transform(0, 0)'
      },
      lineColor: lineColor,
      hImage: hI
    };
  }


  EndArea.addEventListener('click', () => {
    clearTimeout(Timer);
    Timer                    = setTimeout(() => {
      console.log('3 seconds have passed');

      EAstyleV               = EndArea.getAttribute('style');
      const linePayload      = Payload(tbIdentifier, lineColor, ImageHolder.dataset.hash);
      //console.log('linePayload:', linePayload , '\nstringified:', JSON.stringify(linePayload), "KatboxID:", KatBoxID);

      const targetedIndex    = KatBoxID.split('-')[1];
      const selectedKBID     = thisSessionContent["instructions"].find(item => item.KatID === targetedIndex);
      selectedKBID.KatLines.push(linePayload);

      saveToLocalStorage(thisSessionContent);

      //console.log("tSC:", thisSessionContent);
    }, 3000);    

  });

  // updating StartPoint and Line when textest were shuffled
  /*
  alltxtbubbles.forEach(img => {
    img.addEventListener('dragend', function () {line.position();});
  });
  */

  // updating position of EndArea and Line when images were shuffled
  allimagebubbles.forEach(img => {
    img.addEventListener('dragend', function () {line.position();});
  });

  // line.hide() and .show() min-and-maximizing headlines
  const h2Headline = KatBox.querySelector('.Section.column h2');
  let isCollapsed1 = false;
  h2Headline.addEventListener('click', () => {
    isCollapsed1 = !isCollapsed1;
    if (isCollapsed1) {
      console.log('passedS1');
      line.hide();
    } else {
      console.log('passedS1A');
      line.show();
    }
  });
  // global hlButtonIns is in another <script>

  // ImageHolder if deleted
  /*
  const deleteBtn   = ImageHolder.querySelector('.imgDelete');
  const imgbubbleID = ImageHolder.id.split('-')[1];
  const imgHash     = ImageHolder.dataset.hash;
  deleteBtn.addEventListener('click', () => {
    allLinesData.filter(line => line.SPID === SPID);
    console.log('allinesData post:', allLinesData);
    deleteImage(KatBox.id, imgbubbleID, imgHash)
  })
  */

  // bundle all SPID, LID, EAID
  /*
  if (!invisibility) {
    setInterval(() => {
      line.position(); 
    }, 1500);
  }
  */
  const bundle                                   = { SPID, line, EAID };
  allLinesData.push(bundle);

  return allLinesData;

};

function deleteLLine(element) {
  // Guard clause: If the element wasn't found in the DOM, stop immediately
  if (!element) {
    console.warn("deleteLLine was called, but the element didn't exist.");
    return; 
  }

  // 1. Safely remove the LeaderLine SVG if it exists
  if (element._leaderLine) {
    element._leaderLine.remove();
    element._leaderLine = null; // Clear the memory reference
  }

  // 2. Safely remove the DOM element itself
  //element.remove(); // since parent element will be deleted, children are also deleted
}


// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


// update content without reloading page
function updateDocument(tSCpage) {

  document.querySelectorAll("#siteTitle, #introTitle, #introText, #instructionsTitle")
  .forEach((element) => {
    element.textContent                                         = tSCpage[element.id];
  });

  document.getElementsByTagName("title")[0].innerHTML           = tSCpage.siteTitle;

}

function updateContentToUI() {

  console.log("thisSC:", thisSessionContent);

  saveToLocalStorage(thisSessionContent);
  
  const instroCt                                       = document.querySelector('#instructions-container'); // instroCt = instructions content
  if (!instroCt) {
    console.error('Container element not found');
    return;
  }

  updateDocument(thisSessionContent.page);

  thisSessionContent.instructions.forEach(e => {
    if (!e || !e.KatID) {
      console.error('Invalid category data:', e);
      return;
    }

    let tempSection, PickTxtColumn;
    if (!document.getElementById(`KatBox-${e.KatID}`)) {
      tempSection                          = document.createElement('section');
      tempSection.id                       = 'KatBox-' + e.KatID;
      tempSection.classList.add('KatBox', 'row', 'list-group-item');
      tempSection.addEventListener('click', function (e) {
        if ((e.target.tagName === 'H2')){
          this.querySelector('.containerC.bubbleContainer.row').classList.toggle('minimize');
        }
      });
      tempSection.innerHTML                      = e.KatMover + e.KatSection + e.KatDelete;

      const KatMover                             = tempSection.querySelector('.MoveIconBox');
      if (!KatMover) {
        console.error('MoveIconBox element not found');
        return;
      }
      KatMover.classList.add('glyphicon', 'glyphicon-move');
      instroCt.appendChild(tempSection);
    }
    else tempSection                             = document.getElementById(`KatBox-${e.KatID}`);

    PickTxtColumn                                = tempSection.querySelector('.txtColumn');
    if (!PickTxtColumn) {
      console.error('txtColumn element not found');
      return;
    }

    if (Array.isArray(e.KatContentTxt)) {
      e.KatContentTxt.forEach((txt, index) => {

        //console.log("inside KatContentTxt conditional", index);

        if (!txt || !txt.hashID || !txt.tbContent) {
          console.error('Invalid txtbubble data:', txt);
          return;
        }

        if (!document.getElementById(tempSection.id).querySelector(`#txtbubble-${txt.hashID}`)) {

          const reorderTab                               = document.createElement('div');
          reorderTab.classList.add('MoveIconBox', 'txtreorder', 'glyphicon', 'glyphicon-move');
          const KatBoxID                                 = tempSection.id;
          ObserveTxtReorder(KatBoxID)

          const KContTxtBubble                           = document.createElement('div');
          KContTxtBubble.id                              = 'txtbubble-' + txt.hashID;
          KContTxtBubble.classList.add('txtbubble', 'box', 'row');
          KContTxtBubble.dataset.hash                    = txt.hashID;
          PickTxtColumn.appendChild(KContTxtBubble);
          KContTxtBubble.insertAdjacentElement('afterbegin', reorderTab);

          const KCTBtxtholder                            = document.createElement('div');
          KCTBtxtholder.id                               = 'KCTBth-' + txt.hashID;
          KCTBtxtholder.classList.add('KCTBth', 'column');
          KCTBtxtholder.innerHTML                        = txt.tbContent;
          reorderTab.insertAdjacentElement('afterend', KCTBtxtholder);
          

          const geometryArea                             = document.createElement('div');
          geometryArea.id                                = 'geometryArea-' + txt.hashID;
          const gAID                                     = geometryArea.id;
          const tbIdentifier                             = txt.hashID;
          const SPID                                     = 'SP-' + `${tbIdentifier}`;
          const EAID                                     = 'EA-' + `${tbIdentifier}`;
          geometryArea.classList.add('geometryArea');
          KContTxtBubble.appendChild(geometryArea); 
          let lColor = hI    = null;
          let invisibility   = false;
          let EAValues       = { EAwidth: '25%', EAheight: '25%', EAtop: '0', EAleft: '0', EAtransform: 'matrix(1, 0, 0, 1, 0, 0)' };
          geometryArea.addEventListener('click', () => {
            const existingLine = allLinesData.find(line => line.SPID === SPID);
            if (!existingLine) createLeaderLine(tbIdentifier, invisibility, SPID, EAID, lColor, EAValues, hI);
            else toggleIndicator(SPID, KatBoxID.split('-')[1]);
          });

          const KCTBdelete                               = document.createElement('div');
          KCTBdelete.classList.add('txtDelete');
          setTimeout(() => {KCTBdelete.style.opacity  = '0';}, 15000);
          KCTBdelete.addEventListener('mouseover', function (e) {
            this.style.opacity                           = '1';
            const parentElement = this.closest('.txtbubble');
            if (parentElement) {
              parentElement.style.border = '5px solid var(--colorseagreen)';
            }
            this.style.backgroundImage                   = 'url(assets/Basura.svg)';
          });
          KCTBdelete.addEventListener('mouseout', function (e) {
            this.style.opacity                           = '0';
            const parentElement                          = this.closest('.txtbubble');
              if (parentElement) {
                parentElement.style.border = 'none';
              }
            this.style.backgroundImage                   = 'url(assets/deleteCircle.svg)';
          });
          KCTBdelete.addEventListener('click', function (e) {
            const parentElement                          = this.closest('.txtbubble');
            const txtbubbleID                            = parentElement.id.split('-')[1];
            const KatBox                                 = this.closest('.KatBox');
            const KatID                                  = KatBox.id.split('-')[1];
            if (!txtbubbleID || !KatID) {
                return console.error('Invalid txtbubble ID or KatID:', txtbubbleID, KatID);
            }
            deleteElements(KatID, "KatContentTxt", tbIdentifier);
          });
          KContTxtBubble.appendChild(KCTBdelete);
        }

      });
    }
  
    const txtOffer                               = document.getElementById(tempSection.id).querySelector("#editor-container") || newTxtOffer(e.KatID);
    PickTxtColumn.appendChild(txtOffer); 

    const PickImgColumn                          = tempSection.querySelector('.imgColumn');
    if (!PickImgColumn) {
      console.error('imgColumn element not found');
      return;
    }
    if (Array.isArray(e.KatContentImg)) {
      e.KatContentImg.forEach(imgObj => {
        if (!imgObj || !imgObj.filename) {
          console.error('Invalid imgbubble data:', imgObj);
          return;
        }

        if (!document.querySelector(`[data-hash="${imgObj.hashID}"]`)) {

          const KContImgBubble                           = document.createElement('div');
          KContImgBubble.id                              = 'imgbubble-' + imgObj.hashID;
          KContImgBubble.classList.add('imgbubble', 'row');
          KContImgBubble.dataset.hash                    = imgObj.hashID;
          const KCIBimg                                  = document.createElement('img');
          KCIBimg.src                                    = imgObj.imgPath;
          KContImgBubble.appendChild(KCIBimg);

          const TabFORreorder                            = document.createElement('div');
          TabFORreorder.classList.add('MoveIconBox', 'imgreorder', 'glyphicon', 'glyphicon-move');
          const KatBoxID                                 = tempSection.id;
          ObserveImgReorder(KatBoxID)
          KContImgBubble.insertAdjacentElement('afterbegin', TabFORreorder);

          const KCIBimgDelete                            = document.createElement('div');
          KCIBimgDelete.classList.add('imgDelete');
          setTimeout(() => {KCIBimgDelete.style.opacity  = '0';}, 5000);
          KCIBimgDelete.addEventListener('mouseover', function (e) {
            this.style.opacity                           = '1';
            const parentElement                          = this.closest('.imgbubble');
            parentElement.style.border                   = '5px solid var(--colorrazzmatazzo)';
            this.style.backgroundImage                   = 'url(assets/Basura.svg)';
          })
          KCIBimgDelete.addEventListener('mouseout', function (e) {
            this.style.opacity                           = '0';
            const parentElement                          = this.closest('.imgbubble');
            parentElement.style.border                   = 'none';
            this.style.backgroundImage                   = 'url(assets/deleteCircle.svg)';
          })
          KCIBimgDelete.addEventListener('click', function (e) {
            const parentElement                          = this.closest('.imgbubble');
            const hash                                   = parentElement.dataset.hash;
            const KatBox                                 = this.closest('.KatBox');
            const KatID                                  = KatBox.id.split('-')[1];
            deleteElements(KatID, "KatContentImg", hash);
          })

          KContImgBubble.appendChild(KCIBimgDelete);
          PickImgColumn.appendChild(KContImgBubble);
        }
      });
    }
    const imgOffer                                   = document.getElementById(tempSection.id).querySelector('.imgcontnew.box') || newImgOffer(e.KatID);
    PickImgColumn.appendChild(imgOffer);

    if (Array.isArray(e.KatLines)) {
      e.KatLines.forEach(lineData => {

        const tbIdentifier   = lineData.hashID;
        const invisibility   = lineData.invisible;
        const SPID           = 'SP-' + `${lineData.hashID}`;
        const EAID           = 'EA-' + `${lineData.hashID}`;
        const lColor         = lineData.lineColor;

        const hIelement      = document.querySelector(`[data-hash="${lineData.hImage}"]`);

        if (hIelement === null) console.warn(`No image found for line with hashID: ${lineData.hImage}`);
        
        const img            = hIelement.querySelector('img');
      
        img.addEventListener('load', () => {
          const hIRect       = hIelement.getBoundingClientRect();

          const { EAwidth, EAheight, EAleft, EAtop, EAtransform } = lineData.EAValues;

          const scaleX       = hIRect.width;
          const scaleY       = hIRect.height;

          const EAValues     = {
            EAleft: `${scaleX / EAleft}px`,
            EAtop: `${scaleY / EAtop}px`,
            EAwidth: `${scaleX * EAwidth}px`,
            EAheight: `${scaleY * EAheight}px`,
            EAtransform: EAtransform
          };

          createLeaderLine(tbIdentifier, invisibility, SPID, EAID, lColor, EAValues, hI);
        });
      });
    };

  });

  const newCatOffer                                  = document.querySelectorAll('.newCategoryOffer')[0] || newCategoryOffer();
  instroCt.appendChild(newCatOffer);

  initializeQuillForNewEditors()
};


// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


// headline buttons
const hlButtonintro          = document.getElementById("headline-intro");

hlButtonintro.addEventListener('click', function (e) {
  document.querySelector('#intro-height').classList.toggle('minimize');
  this.classList.toggle('changedState');
});

const hlButtonInstro         = document.getElementById("headline-instro");
let isCollapsed2             = false;

hlButtonInstro.addEventListener('click', function (e) {
  document.querySelector('#instructions-container').classList.toggle('minimize'); 
  this.classList.toggle('changedState'); 
  this.classList.toggle('width100');

  isCollapsed2 = !isCollapsed2;

  if (isCollapsed2) {
    allLinesData.forEach(Obj => {
      Obj.line.hide();
    })
  }
  else {
    const allBCboxes             = document.querySelectorAll('.containerC.bubbleContainer');
    allBCboxes.forEach(BCbox => {
      allLinesData.forEach(Obj => {
        const DOMelement  = document.getElementById(Obj.SPID);
        if (!DOMelement.closest('.minimize')) {
          Obj.line.show();
        }
      })
    });
  }
});


// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


// first run
// Load saved content on page load
function loadFromLocalStorage() {
  const saved                = localStorage.getItem('instructionContent');
  if (saved) {
    const parsedData         = JSON.parse(saved);
    thisSessionContent       = parsedData;
    saveToLocalStorage(thisSessionContent);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadFromLocalStorage();
  updateContentToUI();
});

// What to test/check?
// - h2 headline (including the instro h2) buttons do not let always show the LeaderLines, correction: it shows, but does not update position