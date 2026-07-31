
// color theme switcher
const colorSwitchContainer             = document.getElementById('circle-container');
const themes                           = ["default", "dark", "theme1", "theme2"]

colorSwitchContainer.addEventListener('click', function (e) {
  let i = colorSwitchContainer.dataset.clicks = (parseInt(colorSwitchContainer.dataset.clicks) === themes.length - 1 || isNaN(colorSwitchContainer.dataset.clicks)) ? 0 : parseInt(colorSwitchContainer.dataset.clicks) + 1;
  document.documentElement.setAttribute('data-theme', themes[i]);
});


// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

const allLinesData                               = window.allLinesData;
const lineColors                                 = ['orange', 'white', 'tomato', 'sandybrown', 'springgreen', 'yellow', 'fuchsia', 'sienna', 'crimson', 'deeppink'];

window.addEventListener('load', () => {
  allLinesData.forEach((lineObj, index) => {

    const hash                 = lineObj.tbHash;
    const geometryArea         = document.getElementById(`geometryArea-${hash}`);
    const SPelement            = document.getElementById(`SP-${hash}`);
    const EndArea              = document.getElementById(`EA-${hash}`);
    const IHhash               = lineObj.IHDH;
      
    // reinstantiatng LeaderLine
    const line = new LeaderLine(SPelement, EndArea, {
        size: 5,
        color: SPelement.style.backgroundColor,
        endPlug: 'behind'
    });
    
    allLinesData[index].line = line;

    geometryArea.addEventListener('click', e => {
      SPelement.classList.toggle('invisible');
      EndArea.classList.toggle('invisible');

      if (SPelement.classList.contains('invisible')) lineObj.line.hide();
      else lineObj.line.show();  
    })

    EndArea.addEventListener('click', e => {
      let i = EndArea.dataset.clicks = (parseInt(EndArea.dataset.clicks) === lineColors.length - 1 || isNaN(EndArea.dataset.clicks)) ? 0 : parseInt(EndArea.dataset.clicks) + 1;
      lineColor                                              = lineColors[i];
      lineObj.line.color = SPelement.style.backgroundColor   = lineColor;
      EndArea.style.border                                   = '5px solid ' + `${lineColor}`;
      e.preventDefault();
    })

    const ImageHolder          = document.querySelector(`[data-hash="${IHhash}"]`);
    let hIwidth                = ImageHolder.offsetWidth;
    let hIheight               = ImageHolder.offsetHeight;
    let leftPosPercent         = 0;
    let topPosPercent          = 0;
    
    
    // storing EndArea dimensions
    let EAwidth                = EndArea.offsetWidth;
    let EAheight               = EndArea.offsetHeight;

    // getting the relation of EndArea to the ImageHolder
  function EAtohIrelValues() {
    const EARect         = EndArea.getBoundingClientRect();
    const hoverImageRect = ImageHolder.getBoundingClientRect();
    const deltax         = EARect.left - hoverImageRect.left;
    const deltay         = EARect.top - hoverImageRect.top;
    hIwidth              = hoverImageRect.width;
    hIheight             = hoverImageRect.height;
    leftPosPercent       = deltax ? (hIwidth / deltax) : 0;
    topPosPercent        = deltay ? (hIheight / deltay) : 0;
    EAwidth              = EndArea.offsetWidth;
    EAheight             = EndArea.offsetHeight;     
  }

    EAtohIrelValues();

    // window size change
    window.addEventListener('resize', function () {
      // Update the dimensions of ImageHolder
      const hIRect               = ImageHolder.getBoundingClientRect();
      const hIchangeINwidth      = hIRect.width / hIwidth;
      const hIchangeINheight     = hIRect.height / hIheight;

      // Update size and position of EndArea
      EndArea.style.transform    = `translate(0px, 0px)`;
      EndArea.setAttribute('data-x', '0');
      EndArea.setAttribute('data-y', '0');

      EndArea.style.width        = EAwidth * hIchangeINwidth + 'px';
      EndArea.style.height       = EAheight * hIchangeINheight + 'px';
      EndArea.style.top          = hIRect.height / topPosPercent + 'px';
      EndArea.style.left         = hIRect.width / leftPosPercent + 'px';

      EAtohIrelValues();

      lineObj.line.position();
    });

    SPelement.closest('.containerC.bubbleContainer.row').classList.contains('minimize') ? lineObj.line.hide() : lineObj.line.show();

  });
})

// line.hide() and .show() min-and-maximizing headlines
const KatBoxes               = document.querySelectorAll('[id^="KatBox-"]');
KatBoxes.forEach(element => {
  element.addEventListener('click', e => {
    if (e.target.classList.contains('CatTitleArea') || (e.target.tagName === 'H2') ) {
      const cCbC               = element.querySelector('.containerC.bubbleContainer.row');
      cCbC.classList.toggle('minimize');
      const isCollapsed        = cCbC.classList.contains('minimize');
      element.querySelectorAll('[id^="txtbubble-"]').forEach(tb => {
        const hash             = tb.id.split('-')[1];
        const lineObject       = allLinesData.find(lineObj => lineObj.tbHash === hash);
        if (!lineObject) return;

        if (isCollapsed) {
          lineObject.line.hide();
        } else {
          lineObject.line.show();
        }
      });
      allLinesData.forEach(lineObj => lineObj.line.position());
    }
  });
});
  

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


// headline buttons
const hlButtonintro          = document.getElementById("headline-intro");

hlButtonintro.addEventListener('click', function (e) {
  const headline             = document.querySelector('#intro-height')
  headline.classList.toggle('minimize');
  this.classList.toggle('changedState');
  
  let isCollapsed            = headline.classList.contains('minimize');
  allLinesData.forEach(lineObj => lineObj.line.position());
});

const hlButtonInstro         = document.getElementById("headline-instro");

hlButtonInstro.addEventListener('click', function (e) {
  const headline             = document.querySelector('#instructions-container');
  headline.classList.toggle('minimize');
  this.classList.toggle('changedState'); 
  this.classList.toggle('width100');

  let isCollapsed            = headline.classList.contains('minimize');
  const allBCboxes           = document.querySelectorAll('.containerC.bubbleContainer.row');
  if (isCollapsed) {
    allLinesData.forEach(Obj => Obj.line.hide());
  }
  else {
    allBCboxes.forEach(BCbox => {
      if (BCbox.classList.contains('minimize')) return;
      const alltxtbubbles    = BCbox.querySelectorAll('.txtbubble');
      alltxtbubbles.forEach(txtbubble => {
        const hash           = txtbubble.id.split('-')[1];
        const lineObj        = allLinesData.find(lineObj => lineObj.tbHash === hash);
        if (!lineObj) return;
        lineObj.line.position();
        lineObj.line.show();
      })
    });
  }
});


// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

/*
What to do:
- localStorage
 */