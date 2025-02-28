// GET from CMS

  function getfromCMS(callback, errorCallback = console.error) {
      fetch('/api/cms')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not OK');
            }
            return response.json();
        })
        .then(data => {
            callback(data);  // Call the callback function with the retrieved data
        })
        .catch(error => {
            errorCallback(error);  // Call the error handling function
        });
    }
  

// new category addition

  async function createCategory() {
    const savedCatName                                     = document.getElementById('inputforCatTitle').value;

    const nCinput                                          = document.getElementById('inputforCatTitle');
    nCinput.classList.toggle('hidden');
    nCinput.value                                          = '';

    const nctxt                                            = document.getElementById('nCtxt');
    nCtxt.setAttribute('onclick', `changeToInput()`);
    nCtxt.innerHTML                                        = '<h1 onclick="changeToInput()">neue Kategorie (Klicke auf mich, benenne mich und dann gehe auf Plus Button)</h1>';

    const newCatContainer                                  = document.createElement('div');
    newCatContainer.classList.add('CatContainer', 'row');
    let catID = null;
    await fetch('/api/cms', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      return response.json();
    })
    .then(data => {
      if (!data) {
        throw new Error('No data received');
      }
      catID = data.length === 0 ? 1 : data.length + 1;
      return catID;
    })
    .catch(error => {
      console.error('Error:', error);
    })
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
    const newCatSecContCont                                = document.createElement('div');
    newCatSecContCont.classList.add('ContCont', 'bubbleContainer', 'row');
    newCatSecContent.appendChild(newCatSecContCont);
    const newCatSecContTxt                                 = document.createElement('div');
    newCatSecContTxt.classList.add('txtColumn', 'column');
    newCatSecContCont.appendChild(newCatSecContTxt);
    const newCatSecContImg                                 = document.createElement('div');
    newCatSecContImg.classList.add('imgColumn', 'column');
    newCatSecContCont.appendChild(newCatSecContImg);

    const deleteCircle                                     = document.createElement('div');
    deleteCircle.classList.add('deleteCircleBox');
    newCatContainer.appendChild(deleteCircle);

    // Prepare the request payload
    const payload = {
      Katname: savedCatName,
      KatID: catID.toString(),
      KatMover: MoveIconBox.outerHTML,
      KatSection: newCatSecContent.outerHTML,
      KatContentTxt: [],
      KatContentImg: [],
      KatLines: [],
      KatDelete: deleteCircle.outerHTML,
    };

    await fetch('/api/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify( payload ), // Send parameter data to the server
    }).then(response => {
      if (response.ok) {
        response.text();
        location.reload(); // Refresh the page
      } else {
        console.error('Failed to upload image');
      }
    })
      .then(data => console.log('Category recorded into CMS:', data))
      .catch(error => console.error('Error recording category into CMS:', error));
  }

// change Kat order

const container = document.getElementById('categories-container');
let sortTimeout; // Variable to store the timeout reference
new Sortable.create(container, {
  animation: 150,
  filter: ".EndArea, .imgreorder, .txtreorder",  // Selectors that do not lead to dragging (String or Function)
	preventOnFilter: true, // Call `event.preventDefault()` when triggered `filter`
  draggable: ".KatBox",
  direction: 'vertical',
  onEnd: function (evt) {
    // Clear any existing timeout to avoid multiple calls
    clearTimeout(sortTimeout);

      // Set a delay of 3 seconds before sending the request
    sortTimeout = setTimeout(() => {
      // Get new order
      const newOrder = Array.from(container.children).filter((div) => div.classList.contains('KatBox')).map((div) => {
        return div.id.split('-')[1];
      });

      // Send to backend via PUT
      fetch('/update-category-order', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newOrder }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Backend Response:', data);
        })
        .catch((error) => {
          console.error('Error updating order:', error);
        });
      }, 3000); // 3000ms = 3 seconds
  },
});


// change txt order

  function ObserveTxtReorder(KatBoxID) {
    const selectedKatBox = document.getElementById(KatBoxID); // Correctly selecting the KatBox by ID
    const txtColumn = selectedKatBox.querySelector('.txtColumn.column'); // The column of txtbubbles

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
        // Get the new order of txtbubbles by their IDs
        const newtxtbubblesOrder = Array.from(txtColumn.children)
          .filter((div) => div.classList.contains('txtbubble'))
          .map((div) => div.id.split('-')[1]);

        // Send the new order to the backend after 3 seconds delay
        setTimeout(() => {
          fetch('/update-txt-order', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newtxtbubblesOrder, KatBoxID }),
          })
            .then((response) => response.json())
            .then((data) => {
              console.log('Backend Response:', data);
            })
            .catch((error) => {
              console.error('Error updating order:', error);
            });
        }, 3000); // Delay of 3 seconds before sending the order to the backend
      }
    });

  }


// change img order

  function ObserveImgReorder(KatBoxID) {
    const selectedKatBox = document.getElementById(KatBoxID); // Correctly selecting the KatBox by ID
    const imgColumn = selectedKatBox.querySelector('.imgColumn.column'); // The column of txtbubbles

    // Create a Sortable instance only for the txtColumn within each KatBox
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
        // Get the new order of txtbubbles by their IDs
        const newimgbubblesOrder = Array.from(imgColumn.children)
          .filter((div) => div.classList.contains('imgbubble'))
          .map((div) => div.id.split('-')[1]);

        // Send the new order to the backend after 3 seconds delay
        setTimeout(() => {
          fetch('/update-img-order', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newimgbubblesOrder, KatBoxID }),
          })
            .then((response) => response.json())
            .then((data) => {
              console.log('Backend Response:', data);
            })
            .catch((error) => {
              console.error('Error updating order:', error);
            });
        }, 3000); // Delay of 3 seconds before sending the order to the backend
      }
    });

  }


// new category offer

  function changeToInput() {    
    const nCtxt                                  = document.querySelector('#nCtxt');
    nCtxt.setAttribute('onclick', '');
    const nCtxth1                                = nCtxt.children[0]; 
    if (nCtxt.children[0].tagName === 'H1') {
      nCtxt.children[0].style.display = 'none';
    }
    else {
      throw new Error('No H1 found');
    }

    const input                                  = document.querySelector('#inputforCatTitle');
    input.classList.toggle('hidden');

    const AddButton                              = document.querySelector('.AddButton1');
    AddButton.classList.add('AddButton2');
    AddButton.setAttribute('onclick', `createCategory()`);
  }

  function newCategoryOffer() {

    /* visual:
      <section class="newCategory row">
        <div class="AddButton"></div>
        <div id="nCtxt" class="nC-txt width100" onclick="changeToInput()">
          <h1 onclick="changeToInput()">neue Kategorie (Klicke auf mich, benenne mich und dann gehe auf Plus Button)</h1>
          <input type="text" id="inputforCatTitle" class="hidden"></div>
      </section>
    */

    const newCategory                            = document.createElement('section');
    newCategory.classList.add('newCategory', 'row');

    const AddButton                              = document.createElement('div');
    AddButton.classList.add('AddButton1');
    newCategory.appendChild(AddButton);

    const nCtxt                                  = document.createElement('div');
    nCtxt.id                                     = 'nCtxt';
    nCtxt.classList.add('nC-txt', 'width100');
    nCtxt.setAttribute('onclick', `changeToInput()`);
    nCtxt.innerHTML                              = '<h1 onclick="changeToInput()">neue Kategorie (Klicke auf mich, benenne mich und dann gehe auf Plus Button)</h1>';
    newCategory.appendChild(nCtxt);

    const nCInput                                = document.createElement('input');
    nCInput.setAttribute('type', 'text');
    nCInput.id                                   = 'inputforCatTitle';
    nCInput.classList.add('hidden');
    nCInput.value                                = '';
    nCtxt.appendChild(nCInput);

    return newCategory;
  }


// delete category
  
  document.body.addEventListener('click', (e) => {
    if (e.target.classList.contains('deleteCircleBox')) {
      console.log('here 1');
      const parentID = e.target.parentElement.id;

      if (parentID.startsWith('KatBox-')) {
        console.log('yes');
        const catID = parentID.split('-')[1];
        deleteCategory(catID);
      }
    }
  });

  function deleteCategory(KatID) {
    fetch(`/api/cms`, {   
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ KatID }),
    }).then(response => {
      if (response.ok) {
        response.text();
        location.reload(); // Refresh the page
      } else {
        console.error('Failed to upload image');
      }
    })
      .then(data => console.log(data)) // Log the success message
      .catch(error => console.error('Error deleting items:', error));
  }


// new txt offer

  function hashVgenerator() {
    const hashValue                                    = Math.random().toString(36).slice(10).padStart(3, '0');
    return hashValue;
  } 

  document.addEventListener('click', (event) => {
      if (event.target.closest('.SubmitContainer')) {

        let hashValue;
        do {
          hashValue = hashVgenerator();
          getfromCMS((data) => {
            const isDuplicate = data.some(item => item.KatContentTxt.some(txt => txt.tbValue === hashValue));
            if (isDuplicate) {
              hashValue = undefined;
            }
          });
        } while (typeof hashValue === 'undefined');          

        const catID                                        = event.target.closest('.SubmitContainer').id.split('-')[1];
        const correspondingQuill                           = document.querySelector('#quill-editor-' + catID);
        const closestOFquill                               = correspondingQuill.querySelector('.ql-editor');
        const txtContent                                   = closestOFquill.innerHTML;
        addTxt(catID, txtContent, hashValue);
      }
    });

  function newTxtOffer(catID) {

    /* visual:
      <div class="txtcontnew box">
            
        <div id="editor">
          <p>Schreib deine Anleitungen ...</p>
        </div>
        <div id="addTxt" class="AddButton1" onclick="addTxt()"></div>

      </div>
    */

    const newtxtcontent                           = document.createElement('div');
    newtxtcontent.id                              = 'editor-container';
    newtxtcontent.classList.add('txtcontnew', 'box', 'column');
    const editor                                  = document.createElement('div');
    editor.id                                     = 'quill-editor-' + catID;
    editor.innerHTML                              = '<p>Schreib deine Anleitungen ...</p>';
    newtxtcontent.appendChild(editor);
    const Submit                                  = document.createElement('div');
    Submit.id                                     = 'Submit-' + catID;
    Submit.classList.add('SubmitContainer');
    Submit.innerHTML                              = '<p>Eintragen</p>';
    newtxtcontent.appendChild(Submit);
    return newtxtcontent;
  } 


// new img offer

const fileInputElement                           = document.getElementById('file-input-element');
fileInputElement.addEventListener('change', function (e) {
  uploadImage(this.files, this.getAttribute('data-cat-id'))
});

  function newImgOffer(catID) {

    /* visual:
      <div class="imgcontnew box">
        <div id="image-input" class="box" ondrop="handleDrop(event)" ondragover="handleDragOver(event)" onclick="document.getElementById('file-input-element').click()">
          <p>Drag & Drop deine Bilder hierher, oder klicke hier hier drauf</p>
        </div>
      </div>
    */

    const newimgcontent                                    = document.createElement('div');
    newimgcontent.classList.add('imgcontnew', 'box');
    const divImageHolder                                   = document.createElement('div');
    divImageHolder.setAttribute('data-cat-id', catID);
    divImageHolder.classList.add('image-input', 'box');
    divImageHolder.addEventListener('drop', (ev) => {
      ev.preventDefault();
      const files = ev.dataTransfer.files;
      const catID = ev.target.getAttribute('data-cat-id'); // Retrieve the category
      uploadImage(files, catID); // Pass the category with files
    });
    divImageHolder.addEventListener('dragover', (ev) => {
      event.preventDefault(); // Required to allow dropping
      event.dataTransfer.dropEffect = 'copy'; // Provides a visual cue that the files can be dropped
    });
    // Attach click handler to trigger file input and set the category ID
    divImageHolder.addEventListener('click', () => {
      const fileInput = document.getElementById('file-input-element');
      fileInput.setAttribute('data-cat-id', catID); // Associate the category ID
      fileInput.click(); // Open the file picker
    });
    const pDragDrop                                        = document.createElement('p');
    pDragDrop.innerText                                    = 'Drag & Drop deine Bilder hierher, oder klicke hier drauf';
    divImageHolder.appendChild(pDragDrop);
    newimgcontent.appendChild(divImageHolder);
    return newimgcontent;
  } 


// img addition

  function imageShow(imgPath, catID) {

    const dragDropArea                                     = document.getElementById('drag-drop-area');

    // Create and configure the image element
    const imageElement                                     = document.createElement('img');
    imageElement.id                                        = 'upl-Img';
    imageElement.src                                       = imgPath;
    imageElement.alt                                       = 'Uploaded image';
    imageElement.style.display                             = 'block';
    dragDropArea.appendChild(imageElement);

    // Create and configure the delete button
    const deleteImgButton                                  = document.createElement('div');
    deleteImgButton.id                                     = 'deleteImg';
    deleteImgButton.className                              = 'buttonV1';
    deleteImgButton.innerHTML                              = '<p>Löschen</p>';
    deleteImgButton.style.display                          = 'flex';
    // Attach a click event directly to delete the image
    deleteImgButton.onclick = function() {
      imageElement.remove();          // Remove the image element
      deleteImgButton.remove();       // Remove the delete button
      document.getElementById('image-input').style.display = 'flex'; // Show the image input again
      document.getElementById('file-input-element').value  = ""; // Clear the value of the input element with id
    };
    // Append the delete button to the drag-drop area
    dragDropArea.appendChild(deleteImgButton);

    // Hide the image input element after image is uploaded
    document.getElementById('image-input').style.display   = 'none';
  }

  async function generateHash(file) {
    const buffer                                           = await file.arrayBuffer();
    const cryptoObj                                        = window.crypto || window.msCrypto;
    const hashArray                                        = new Uint8Array(await cryptoObj.subtle.digest("SHA-256", buffer));
    const hash                                             = Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('');
    return hash;
  }

  async function uploadImage(files, catID) {
    if (files.length === 0) {
      return; // If no files selected
    }
    const file                                             = files[0];
    const hash                                             = await generateHash(file);
    const ThreeDigitHash                                   = await hashVgenerator();
    const formData                                         = new FormData();
    formData.append('image', file, `${hash}-${file.name}`);
    formData.append('ThreeDigitHash', ThreeDigitHash);
    formData.append('catID', catID); // Append catID to formData
    console.log(formData);
    const response                                         = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })
    .then(response => {
      console.log('passed from server?');
      response.json();
      location.reload();
    })
    .catch(error => console.error('Error uploading image:', error));
    
    //imageShow(data.imgPath, catID);
  }


// img deletion
  
  function deleteImage(imgID, KatID) {
    fetch(`/api/cms`, {   
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ KatID, imgID }),
    }).then(response => {
      if (response.ok) {
        response.text();
        location.reload(); // Refresh the page
      } else {
        console.error('Failed to upload image');
      }
    })
      .then(data => console.log(data)) // Log the success message
      .catch(error => console.error('Error deleting items:', error));
  }

// Quill intitializations

  function initializeQuillForNewEditors() {
    document.querySelectorAll('[id^="quill-editor-"]').forEach((editorElement) => {
        if (!editorElement.quillInstance) { // Avoid reinitializing
            editorElement.quillInstance = new Quill(editorElement, { theme: 'snow' });
        }
    });
  }


// txt addition

  function addTxt(catID, txtContent, hashValue) {
    fetch('/txt-handler', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ catID, txtContent, hashValue }),
    })
    .then(response => {
      if (response.ok) {
        response.text();
        location.reload(); // Refresh the page
      } else {
        console.error('Failed to upload image');
      }
    })
    .catch(error => console.error('Error processing task:', error));
  }

// indicators & line

let allLinesData = [], line = Timer = EAstyleV = null, invisibility = false;

function toggleIndicator(tbIdentifier, SPID) {

const selectedObj = allLinesData.find(object => object.SPID === SPID);

const targetedSPID                             = document.querySelector(`#${SPID}`);
targetedSPID.classList.toggle('invisible');
const targetedEAID                             = document.querySelector(`#${selectedObj.EAID}`);
targetedEAID.classList.toggle('invisible');

if (targetedSPID.classList.contains('invisible')) {
  selectedObj.line.hide();
}
else {
  selectedObj.line.show();
}

clearTimeout(Timer);
    Timer = setTimeout(() => {
      console.log('5 seconds have passed');

      const isHidden = targetedSPID.classList.contains('invisible') ? true : false;
      console.log('linePayload:', isHidden , 'stringified:', JSON.stringify(isHidden));
      
      fetch('/LeaderLineUpdate', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generalID: tbIdentifier, invisible: isHidden })  
        })
        .then(response => response.json())
        .then(data => console.log('Saved:', data))
        .catch(error => console.error('Error saving:', error));
      }, 3000);

return invisibility = targetedSPID.classList.contains('invisible') ? true : false

};

function createTXTtoIMG(tbIdentifier, invisibility, SPID, EAID, lColor, EAValues, hI) {
  // colors
  const lineColors                               = ['orange', 'white', 'tomato', 'sandybrown', 'springgreen', 'yellow', 'fuchsia', 'sienna', 'crimson', 'deeppink'];
  let lineColor                                  = lColor || lineColors[0];

  // restrictors
  const textbubble                               = document.querySelector(`[data-hash-value="${tbIdentifier}"]`);
  const geoArea                                  = textbubble.querySelector(`.geometryArea`);
  const KatBox                                   = textbubble.closest('.KatBox');
  const BubblesCont                              = KatBox.querySelector('.ContCont.bubbleContainer.row');
  const alltxtbubbles                            = BubblesCont.querySelectorAll('.txtbubble');
  const imgColumn                                = KatBox.querySelector('.imgColumn.column');
  const allimagebubbles                          = imgColumn.querySelectorAll('.imgbubble');
  let hoveredImage                               = imgColumn.querySelector(`[data-img-hash="${hI}"]`) || imgColumn.querySelector('#imgbubble-0');
  //storing hoveredImage dimensions
  let hIwidth = 0, hIheight = 0, leftPosPercent = 0, topPosPercent = 0;
  function HIDimensions(e1, e2) {
    hIwidth  = e1 || hoveredImage.offsetWidth;
    hIheight = e2 || hoveredImage.offsetHeight;
  }
  HIDimensions();

  // StartPoint creation
  const StartPoint                               = document.createElement('div');
  StartPoint.classList.add('StartPoint');
  if (invisibility) StartPoint.classList.add('invisible');
  StartPoint.id                                  = SPID; // Create a unique ID for the StartPoint
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
  hoveredImage.appendChild(EndArea);
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

  // getting the relation of EndArea to the hoveredImage
  function EAtohIrelValues() {
    const EARect           = EndArea.getBoundingClientRect();
    const hoverImageRect   = hoveredImage.getBoundingClientRect();
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
      lineColor                                     = lineColors[i];
      line.color = StartPoint.style.backgroundColor = lineColor;
      EndArea.style.border                          = '5px solid ' + `${lineColor}`;
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
        target.style.width = event.rect.width + 'px'
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
        const EndAreaRect              = EndArea.getBoundingClientRect();
        const hvrdImageRect            = hoveredImage.getBoundingClientRect();
        
        if (!isOverlapping(EndAreaRect, hvrdImageRect)) {
          // Iterate over images and check overlap without forcing multiple reflows
          allimagebubbles.forEach((img) => {

            const imgRect = img.getBoundingClientRect(); // Cache layout data for each image
            if (img && isOverlapping(EndAreaRect, imgRect)) {
              hoveredImage            = img;
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

  // window size change
  window.addEventListener('resize', function () {
    // Update the dimensions of hoveredImage
    const hIRect               = hoveredImage.getBoundingClientRect();
    const hIchangeINwidth      = hIRect.width / hIwidth;
    const hIchangeINheight     = hIRect.height / hIheight;

    // Update size and position of EndArea
    /*EndArea.style.transform    = `translate(0px, 0px)`;
    EndArea.setAttribute('data-x', '0');
    EndArea.setAttribute('data-y', '0'); */
    console.log('Positions in Percentage', topPosPercent, leftPosPercent);
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
      generalID: tbIdentifier,
      invisible: false,
      EAValues: {
        EAwidth: EAwidth / hoveredImage.offsetWidth,
        EAheight: EAheight / hoveredImage.offsetHeight,
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
  Timer = setTimeout(() => {
  console.log('5 seconds have passed');

  EAstyleV = EndArea.getAttribute('style');
  const linePayload = Payload(tbIdentifier, lineColor, hoveredImage.dataset.imgHash);
  console.log('linePayload:', linePayload , 'stringified:', JSON.stringify(linePayload));

  fetch('/LeaderLine', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ KatBoxID: KatBoxID, LeaderLine: linePayload })  
    })
    .then(response => response.json())
    .then(data => console.log('Saved:', data))
    .catch(error => console.error('Error saving:', error));
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

  // bundle all SPID, LID, EAID
  if (!invisibility) {
    setInterval(() => {
      line.position(); 
    }, 1500);
  }  
  const bundle                                   = { SPID, line, EAID };
  allLinesData.push(bundle);

  return allLinesData;

};


// txtbubble deletion
  
  function deleteTxtBubble(txtbubbleID, KatID) {
    fetch(`/api/cms`, {   
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ KatID, txtbubbleID }),
    }).then(response => {
      if (response.ok) {
        response.text();
        location.reload(); // Refresh the page
      } else {
        console.error('Failed to upload image');
      }
    })
      .then(data => console.log(data)) // Log the success message
      .catch(error => console.error('Error deleting items:', error));
  }


// first run

  document.addEventListener('DOMContentLoaded', () => {
    getfromCMS((data) => {
      if (!data) {
        console.error('No data received');
        return;
      }
      const contCont                                       = document.querySelector('#categories-container');
      if (!contCont) {
        console.error('Container element not found');
        return;
      }
      if (!data.length) {
        contCont.appendChild(newCategoryOffer());
        return;
      }
      data.forEach(e => {
        if (!e || !e.KatID) {
          console.error('Invalid category data:', e);
          return;
        }
        const tempSection                                = document.createElement('section');
        tempSection.id                                   = 'KatBox-' + e.KatID;
        tempSection.classList.add('KatBox', 'row', 'list-group-item');
        tempSection.addEventListener('click', function (e) {
          if ((e.target.tagName === 'H2')){
            this.querySelector('.ContCont.bubbleContainer.row').classList.toggle('minimize');
          }
        });
        tempSection.innerHTML                            = e.KatMover + e.KatSection + e.KatDelete;

        const KatMover                                   = tempSection.querySelector('.MoveIconBox');
        if (!KatMover) {
          console.error('MoveIconBox element not found');
          return;
        }
        KatMover.classList.add('glyphicon', 'glyphicon-move');
        contCont.appendChild(tempSection);

        const PickTxtColumn                              = tempSection.querySelector('.txtColumn');
        if (!PickTxtColumn) {
          console.error('txtColumn element not found');
          return;
        }

        if (Array.isArray(e.KatContentTxt)) {
          e.KatContentTxt.forEach((txt, index) => {
            if (!txt || !txt.textbubble) {
              console.error('Invalid txtbubble data:', txt);
              return;
            }

            const reorderTab                               = document.createElement('div');
            reorderTab.classList.add('MoveIconBox', 'txtreorder', 'glyphicon', 'glyphicon-move');
            const KatBoxID                                 = tempSection.id;
            ObserveTxtReorder(KatBoxID)

            const htmlString                               = txt.textbubble;
            const KContTxtBubble                           = document.createElement('div');
            const txtbubbleorder                           = index; // Guaranteed to be valid
            KContTxtBubble.id                              = 'txtbubble-' + txtbubbleorder;
            KContTxtBubble.classList.add('txtbubble', 'box', 'row');
            KContTxtBubble.innerHTML                       = htmlString;
            KContTxtBubble.dataset.hashValue               = txt.hash;
            PickTxtColumn.appendChild(KContTxtBubble);
            KContTxtBubble.insertAdjacentElement('afterbegin', reorderTab);

            const geometryArea                             = document.createElement('div');
            geometryArea.id                                = 'geometryArea-' + txtbubbleorder;
            const gAID                                     = geometryArea.id;
            const tbIdentifier                             = txt.hash;
            const SPID                                     = 'SP-' + `${tbIdentifier}`;
            const EAID                                     = 'EA-' + `${tbIdentifier}`;
            geometryArea.classList.add('geometryArea');
            KContTxtBubble.appendChild(geometryArea); 
            let lColor = null, hI = null;
            let invisibility = false;
            let EAValues = { EAwidth: '25%', EAheight: '25%', EAtop: '0', EAleft: '0', EAtransform: 'matrix(1, 0, 0, 1, 0, 0)' };
            geometryArea.addEventListener('click', () => {
              const existingLine = allLinesData.find(line => line.SPID === SPID);
              if (!existingLine) createTXTtoIMG(tbIdentifier, invisibility, SPID, EAID, lColor, EAValues, hI);
              else toggleIndicator(tbIdentifier, SPID);
            });       

            const KCTBdelete                               = document.createElement('div');
            KCTBdelete.classList.add('txtDelete');
            setTimeout(() => {KCTBdelete.style.opacity  = '0';}, 5000);
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
              this.style.backgroundImage                   = 'url(assets/deleteCirculo.svg)';
            });
            KCTBdelete.addEventListener('click', function (e) {
              const parentElement                          = this.closest('.txtbubble');
              const txtbubbleID                            = parentElement.id.split('-')[1];
              const KatBox                                 = this.closest('.KatBox');
              const KatID                                  = KatBox.id.split('-')[1];
              if (!txtbubbleID || !KatID) {
                 return console.error('Invalid txtbubble ID or KatID:', txtbubbleID, KatID);
              }
              deleteTxtBubble(txtbubbleID, KatID);
            });
            KContTxtBubble.appendChild(KCTBdelete);

          });
        }
        
        const txtOffer                                   = newTxtOffer(e.KatID);
        PickTxtColumn.appendChild(txtOffer);

        const PickImgColumn                              = tempSection.querySelector('.imgColumn');
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
            const KContImgBubble                           = document.createElement('div');
            KContImgBubble.id                              = 'imgbubble-' + e.KatContentImg.indexOf(imgObj);
            KContImgBubble.classList.add('imgbubble', 'row');
            KContImgBubble.dataset.imgHash                 = imgObj.ThreeDigitHash;
            const KCIBimg                                  = document.createElement('img');
            KCIBimg.src                                    = `/uploads/${imgObj.filename}`;
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
              this.style.backgroundImage                   = 'url(assets/deleteCirculo.svg)';
            })
            KCIBimgDelete.addEventListener('click', function (e) {
              const parentElement                          = this.closest('.imgbubble');
              const imgID                                  = parentElement.id.split('-')[1];
              const KatBox                                 = this.closest('.KatBox');
              const KatID                                  = KatBox.id.split('-')[1];
              deleteImage(imgID, KatID);
            })

            KContImgBubble.appendChild(KCIBimgDelete);
            PickImgColumn.appendChild(KContImgBubble);
          });
        }
        const imgOffer                                   = newImgOffer(e.KatID);
        PickImgColumn.appendChild(imgOffer);

        if (Array.isArray(e.KatLines)) {
          e.KatLines.forEach(lineData => {

            const tbIdentifier = lineData.generalID;
            const invisibility = lineData.invisible;
            const SPID         = 'SP-' + `${lineData.generalID}`;
            const EAID         = 'EA-' + `${lineData.generalID}`;
            const lColor       = lineData.lineColor;

            const hI           = lineData.hImage;
            const hIelement    = document.querySelector(`[data-img-hash="${hI}"]`);
            const img          = hIelement.querySelector('img');
            
            img.addEventListener('load', () => {
              const hIRect = hIelement.getBoundingClientRect();

              const { EAwidth, EAheight, EAleft, EAtop, EAtransform } = lineData.EAValues;

              const scaleX = hIRect.width;
              const scaleY = hIRect.height;

              const EAValues = {
                EAleft: `${scaleX / EAleft}px`,
                EAtop: `${scaleY / EAtop}px`,
                EAwidth: `${scaleX * EAwidth}px`,
                EAheight: `${scaleY * EAheight}px`,
                EAtransform: EAtransform
              };
  
              createTXTtoIMG(tbIdentifier, invisibility, SPID, EAID, lColor, EAValues, hI);
            
            });

          });
        }

      });

      contCont.appendChild(newCategoryOffer());

      initializeQuillForNewEditors()
    });
  });

// headline buttons

  const hlButtonBio            = document.getElementById("headline-bio");
  
  hlButtonBio.addEventListener('click', function (e) {
    document.querySelector('#bio-height').classList.toggle('minimize');
    this.classList.toggle('changedState');
  });
  
  const hlButtonIns            = document.getElementById("headline-ins");
  let isCollapsed2             = false;
  
  hlButtonIns.addEventListener('click', function (e) {
    document.querySelector('#categories-container').classList.toggle('minimize'); 
    this.classList.toggle('changedState'); 
    this.classList.toggle('width100');

    isCollapsed2 = !isCollapsed2;

    if (isCollapsed2) {
      allLinesData.forEach(Obj => {
        Obj.line.hide();
      })
    }
    else {
      const allBCboxes             = document.querySelectorAll('.ContCont.bubbleContainer');
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
  

