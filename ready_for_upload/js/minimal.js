/*
// Autosave progress
// Save content whenever it changes
function saveToLocalStorage(tSC) {
  const data = tSC || thisSessionContent;
  localStorage.setItem('instructionContent', JSON.stringify(data));
}
document.addEventListener('input', saveToLocalStorage);
*/


// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


// color theme switcher
const colorSwitchContainer             = document.getElementById('circle-container');
const themes                           = ["default", "dark", "theme1", "theme2"]

colorSwitchContainer.addEventListener('click', function (e) {
  let i = colorSwitchContainer.dataset.clicks = (parseInt(colorSwitchContainer.dataset.clicks) === themes.length - 1 || isNaN(colorSwitchContainer.dataset.clicks)) ? 0 : parseInt(colorSwitchContainer.dataset.clicks) + 1;
  document.documentElement.setAttribute('data-theme', themes[i]);
});


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
  let ImageHolder                                = imgColumn.querySelector(`[data-hash="${hI}"]`) || imgColumn.querySelectorAll('[id^="imgbubble-"]')[0] || null;
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
  //resizeObserver.observe(StartPoint);

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
      line.hide();
    } else {
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


// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    /*
    tempSection                          = document.createElement('section');
    tempSection.id                       = 'KatBox-' + e.KatID;
      
    tempSection.classList.add('KatBox', 'row', 'list-group-item');
    KatBox.addEventListener('click', function (e) {
        if ((e.target.tagName === 'H2')){
            this.querySelector('.containerC.bubbleContainer.row').classList.toggle('minimize');
            allLinesData.forEach(lineObj => {
            lineObj.line.position();
            })
        }
    });
    */

    // LeaderLine interactibility

    const allGAs             = document.querySelectorAll('.geometryArea'); // all geometryAreas
    allGAs.forEach(GA => GA.addEventListener('click', (e) => {
      
    }));

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
  

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


// headline buttons
const hlButtonintro          = document.getElementById("headline-intro");

hlButtonintro.addEventListener('click', function (e) {
  document.querySelector('#intro-height').classList.toggle('minimize');
  this.classList.toggle('changedState');
  allLinesData.forEach(lineObj => {
    lineObj.line.position();
  })
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

  allLinesData.forEach(lineObj => {
    lineObj.line.position();
  })

});


// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------