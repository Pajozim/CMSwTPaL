// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


// headline button Introduction
const hlButtonIntro          = document.getElementById("headline-intro");
const headlineIntro          = document.querySelector('#intro-height');

// Pure UI Renderer: Accepts explicit state (boolean)
function setHlIntroState(isMinimized) {
  headlineIntro?.classList.toggle('minimized', isMinimized);
  hlButtonIntro?.classList.toggle('changedState', isMinimized);
}

hlButtonIntro.addEventListener('click', () => handleClicks("hlIntro"));

// headline button Instruction
const hlButtonInstro         = document.getElementById("headline-instro");
const instroContainer        = document.querySelector('#instructions-container');

// Pure UI Renderer: Accepts explicit state (boolean)
function setHlInstroState(isMinimized) {  
  instroContainer?.classList.toggle('minimized', isMinimized);
  hlButtonInstro?.classList.toggle('changedState', isMinimized);
  hlButtonInstro?.classList.toggle('width100', !isMinimized);
}

hlButtonInstro.addEventListener('click', () => handleClicks("hlInstro"));


// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


// updating storedContiditionals status
function updateSC(property, changedValue, hash = '') {
  if (hash) {
    storedConditionals[property].find(item => item.id === hash).status = changedValue;
  } else {
    storedConditionals[property] = changedValue;
  }
  saveToLocalStorage();
}


// ------------------------------------------------------------------------------------------------------------------------------------------------


const allLinesData                               = window.allLinesData;
const lineColors                                 = ['orange', 'white', 'tomato', 'sandybrown', 'springgreen', 'yellow', 'fuchsia', 'sienna', 'crimson', 'deeppink'];

window.addEventListener('load', () => {
  allLinesData.forEach((lineObj, index) => {
    const hash         = lineObj.tbHash;
    const geometryArea = document.getElementById(`geometryArea-${hash}`);
    const SPelement    = document.getElementById(`SP-${hash}`);
    const EndArea      = document.getElementById(`EA-${hash}`);
    const IHhash       = lineObj.IHDH;

    // Instantiate LeaderLine once
    const line = new LeaderLine(SPelement, EndArea, {
      size: 5,
      color: SPelement.style.backgroundColor,
      endPlug: 'behind'
    });

    allLinesData[index].line = line;

    // Listeners (Only attached ONCE)
    geometryArea?.addEventListener('click', () => {
      SPelement.classList.toggle('invisible');
      EndArea.classList.toggle('invisible');
      if (SPelement.classList.contains('invisible')) lineObj.line.hide();
      else lineObj.line.show();  
    });

    EndArea?.addEventListener('click', e => {
      let i = EndArea.dataset.clicks = (parseInt(EndArea.dataset.clicks) === lineColors.length - 1 || isNaN(EndArea.dataset.clicks)) ? 0 : parseInt(EndArea.dataset.clicks) + 1;
      const selectedColor                  = lineColors[i];
      lineObj.line.color = SPelement.style.backgroundColor = selectedColor;
      EndArea.style.border                 = '5px solid ' + `${selectedColor}`;
      e.preventDefault();
    });

    const ImageHolder  = document.querySelector(`[data-hash="${IHhash}"]`);
    let hIwidth        = ImageHolder?.offsetWidth || 0;
    let hIheight       = ImageHolder?.offsetHeight || 0;
    let leftPosPercent = 0;
    let topPosPercent  = 0;
    let EAwidth        = EndArea?.offsetWidth || 0;
    let EAheight       = EndArea?.offsetHeight || 0;

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

    if (ImageHolder && EndArea) EAtohIrelValues();

    window.addEventListener('resize', () => {
      const hIRect           = ImageHolder.getBoundingClientRect();
      const hIchangeINwidth  = hIRect.width / hIwidth;
      const hIchangeINheight = hIRect.height / hIheight;

      EndArea.style.transform = `translate(0px, 0px)`;
      EndArea.setAttribute('data-x', '0');
      EndArea.setAttribute('data-y', '0');

      EndArea.style.width  = EAwidth * hIchangeINwidth + 'px';
      EndArea.style.height = EAheight * hIchangeINheight + 'px';
      EndArea.style.top    = hIRect.height / topPosPercent + 'px';
      EndArea.style.left   = hIRect.width / leftPosPercent + 'px';

      EAtohIrelValues();
      lineObj.line.position();
    });

    /*
    // Initial visibility state from storage
    const lineStatus = storedConditionals?.linesVisibility?.find(item => item.id === hash)?.status;
    if (lineStatus) lineObj.line.hide();
    else lineObj.line.show();
    */

    // lines visibility on first DOMCOntent load
    const tbElement                    = document.querySelector(`[data-hash="${hash}"]`);
    const bubbleCIsCollapsed           = tbElement?.closest('.containerC.bubbleContainer.row')?.classList.contains('minimized');
    if (bubbleCIsCollapsed) lineObj.line.hide();
    else lineObj.line.show();

  });

  // regarding minimized state of instructions container
  if (instroContainer?.classList.contains('minimized')) {
    allLinesData.forEach(lineObj => lineObj.line.hide());
  }

  // headlines' CSS change listeners
  hlButtonIntro?.addEventListener('click', () => {
    allLinesData.forEach(lineObj => lineObj.line.position());
  })
  hlButtonInstro?.addEventListener('click', () => {
    // Reposition LeaderLines to account for shifted elements
    let isCollapsed            = instroContainer?.classList.contains('minimized');
    const allBCboxes           = document.querySelectorAll('.containerC.bubbleContainer.row');
    if (isCollapsed) {
      allLinesData.forEach(Obj => {
        Obj.line.hide();
        updateSC("linesVisibility", true, Obj.tbHash);
      });
    }
    else {
      allBCboxes.forEach(BCbox => {
        if (BCbox.classList.contains('minimized')) return;
        const alltxtbubbles    = BCbox.querySelectorAll('.txtbubble');
        alltxtbubbles.forEach(txtbubble => {
          const hash           = txtbubble.dataset.hash;
          const lineObj        = allLinesData.find(lineObj => lineObj.tbHash === hash);
          if (!lineObj) return;
          lineObj.line.position();
          lineObj.line.show();
          updateSC("linesVisibility", false, hash);
        })
      });
    }
  })

});


// line.hide() and .show() min-and-maximizing headlines
const KatBoxes               = document.querySelectorAll('[id^="KatBox-"]');
KatBoxes.forEach(element => {
  element.addEventListener('click', e => {
    if (e.target.classList.contains('CatTitleArea') || (e.target.tagName === 'H2') ) {
      const cCbC               = element.querySelector('.containerC.bubbleContainer.row');
      cCbC.classList.toggle('minimized');
      const isCollapsed        = cCbC.classList.contains('minimized');
      updateSC("KatBoxes", isCollapsed, element.id);
      element.querySelectorAll('[id^="txtbubble-"]').forEach(tb => {
        const hash             = tb.dataset.hash;
        const lineObject       = allLinesData.find(lineObj => lineObj.tbHash === hash);
        if (!lineObject) return;

        if (isCollapsed) {
          lineObject.line.hide();
          updateSC("linesVisibility", true, hash);
        } else {
          lineObject.line.show();
          updateSC("linesVisibility", false, hash);
        }
      });
      allLinesData.forEach(lineObj => lineObj.line.position());
    }
  });
});


// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


// color theme switcher
const colorSwitchContainer             = document.getElementById('circle-container');
const themes                           = ["default", "dark", "theme1", "theme2"]

colorSwitchContainer.addEventListener('click', () => handleClicks("colorTheme"));


// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


// click handlers
function handleClicks(keyword) {
  let willBeMinimized;
  switch (keyword) {
    case "hlIntro":
      willBeMinimized = !headlineIntro?.classList.contains('minimized');
      console.log(willBeMinimized);
      setHlIntroState(willBeMinimized); // Update UI
      updateSC(keyword, willBeMinimized); // Persist State
      break;
    case "hlInstro":
      willBeMinimized = !instroContainer?.classList.contains('minimized');
      setHlInstroState(willBeMinimized); // Update UI
      updateSC(keyword, willBeMinimized); // Persist State
      break;
    case "colorTheme":
      let i = colorSwitchContainer.dataset.clicks = (parseInt(colorSwitchContainer.dataset.clicks) === themes.length - 1 || isNaN(colorSwitchContainer.dataset.clicks)) ? 0 : parseInt(colorSwitchContainer.dataset.clicks) + 1;
      document.documentElement.setAttribute('data-theme', themes[i]);
      updateSC(keyword, themes[i]);
      break;
    default:
      break;      
  }
}


// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


// for localStorage and intitialization
let storedConditionals = {
  linesVisibility: Array.from(document.querySelectorAll('.StartPoint')).map(SP => {
    return {
      id: SP.id.split('-')[1],
      status: SP.classList.contains('invisible')
    }
  }),
  hlIntro: hlButtonIntro.classList.contains('minimized'),
  hlInstro: hlButtonInstro.classList.contains('minimized'),
  colorTheme: themes[colorSwitchContainer.dataset.clicks],
  KatBoxes: Array.from(KatBoxes).map(KatBox => ({
    id: KatBox.id, 
    status: KatBox.querySelector('.containerC.bubbleContainer.row').classList.contains('minimized')
  }))
}

//console.log(allLinesData);
//console.log(storedConditionals);

function saveToLocalStorage() {
  localStorage.setItem('instructionContentUsers', JSON.stringify(storedConditionals));
}

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


// setting the conditionals on the UI
function setUI() {
  // Safe extraction with default fallback
  const { hlIntro, hlInstro, colorTheme, KatBoxes = [] } = storedConditionals || {};

  // 1. Modern class toggling (replaces if/else blocks)
  setHlIntroState(Boolean(hlIntro));
  setHlInstroState(Boolean(hlInstro));

  // 2. Set theme (falling back to default if undefined)
  if (colorTheme !== undefined) {
    document.documentElement.setAttribute('data-theme', colorTheme);
  }

  // 3. Clean iteration over KatBoxes
  KatBoxes.forEach(({ id, status }) => {
    const bubbleContainer = document.getElementById(id)?.querySelector('.containerC.bubbleContainer.row');
    bubbleContainer?.classList.toggle('minimized', Boolean(status));
  });
}

function loadFromLocalStorage() {
  const saved                = localStorage.getItem('instructionContentUsers');
  if (saved) {
    const parsedData         = JSON.parse(saved);
    storedConditionals       = parsedData;
    saveToLocalStorage();
    setUI();
  }
}

document.addEventListener('DOMContentLoaded', loadFromLocalStorage);


/*

 */