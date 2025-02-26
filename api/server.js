const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path');  // Add path module
const app = express();
//const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Static files
app.use(express.static(path.join(__dirname)));

// Endpoint to get content from CMS.json
app.get('/api/cms', (req, res) => {
    fs.readFile('CMS.json', 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading CMS file');
        } else {
            res.json(JSON.parse(data));
        }
    });
});

// Endpoint to post data to CMS.json
app.post('/api/cms', (req, res) => {
    fs.readFile('CMS.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading CMS file');
        }

        let cmsData = [];
        try {
            // Parse the existing CMS.json file (if exists)
            cmsData = JSON.parse(data);
        } catch (e) {
            console.log('Error parsing CMS.json:', e);
        }

        // Add the new key-value pair (from the POST request)
        const newData = req.body; // This should be the key-value pair sent from the client
        cmsData.push(newData); // Add the new data to the array

        // Write the updated array back to CMS.json
        fs.writeFile('CMS.json', JSON.stringify(cmsData, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error writing CMS file');
            }
            res.send('CMS file updated successfully');
        });
    });
});
  
// Endpoint to update category order
app.put('/update-category-order', (req, res) => {
    const { newOrder } = req.body;

    if (!Array.isArray(newOrder)) {
        return res.status(400).json({ error: 'Invalid data format (not an Array)' });
    }

    let cmsData = [];
    try {
        cmsData = JSON.parse(fs.readFileSync('CMS.json', 'utf8'));
    } catch (e) {
        console.log('Error parsing CMS.json:', e);
    }

    const newOrderindexed = newOrder.map((id) => {
        return cmsData.find((cat) => cat.KatID === id);
    });

    const newOrderindexedUpdated = newOrderindexed.map((cat, index) => {
        return { ...cat, KatID: `${index + 1}` };
    });

    // Overwrite CMS.json with the updated categories
    fs.writeFile('CMS.json', JSON.stringify(newOrderindexedUpdated, null, 2), (err) => {
        if (err) {
            return res.status(500).send('Error writing CMS file');
        }
        res.json({ success: true, message: 'Order updated successfully' });
    });  
});

// Endpoint to update txtbubbles order
app.put('/update-txt-order', (req, res) => {
    const { newtxtbubblesOrder, KatBoxID } = req.body;

    if (!Array.isArray(newtxtbubblesOrder)) {
        return res.status(400).json({ error: 'Invalid data format (not an Array)' });
    }

    let cmsData = [];
    try {
        cmsData = JSON.parse(fs.readFileSync('CMS.json', 'utf8'));
    } catch (e) {
        console.log('Error parsing CMS.json:', e);
    }

    const KatIDextracted = KatBoxID.split('-')[1];
    const findKat        = cmsData.find((cat) => cat.KatID === KatIDextracted);
    const whoseKatTxtCnt = findKat.KatContentTxt;

    const newOrderindexed = whoseKatTxtCnt.map((txt, index) => {
        var txtID = newtxtbubblesOrder[index];
        if (typeof txtID === 'string') {
            txtID = parseInt(txtID, 10);
        }
        return whoseKatTxtCnt[txtID];
    });

    cmsData.forEach((cat) => {
        if (cat.KatID === KatIDextracted) {
            cat.KatContentTxt = newOrderindexed;
        }
    });

    // Overwrite CMS.json with the updated KatContentTxt
    fs.writeFile('CMS.json', JSON.stringify(cmsData, null, 2), (err) => {
        if (err) {
            return res.status(500).send('Error writing CMS file');
        }
        res.json({ success: true, message: 'Order updated successfully' });
    });  
});

//Handling instruction textes 
app.put('/txt-handler', (req, res) => {
    console.log(req.body);
    const { catID, txtContent, hashValue } = req.body;

    console.log(catID, txtContent);
    
    let cmsData = [];
    try {
        cmsData = JSON.parse(fs.readFileSync('CMS.json', 'utf8'));
    } catch (e) {
        console.log('Error parsing CMS.json:', e);
    }

    const whichCat = cmsData.find((cat) => cat.KatID === catID);

    whichCat.KatContentTxt.push({textbubble: txtContent, hash: hashValue});

    // Write the updated data to CMS.json
    fs.writeFile('CMS.json', JSON.stringify(cmsData, null, 2), (err) => {
        if (err) {
            return res.status(500).send('Error writing CMS file');
        }
        res.send('text injected successfully');
    });
})

// Endpoint to update imgbubbles order
app.put('/update-img-order', (req, res) => {
    const { newimgbubblesOrder, KatBoxID } = req.body;

    if (!Array.isArray(newimgbubblesOrder)) {
        return res.status(400).json({ error: 'Invalid data format (not an Array)' });
    }

    let cmsData = [];
    try {
        cmsData = JSON.parse(fs.readFileSync('CMS.json', 'utf8'));
    } catch (e) {
        console.log('Error parsing CMS.json:', e);
    }

    const KatIDextracted = KatBoxID.split('-')[1];
    const findKat        = cmsData.find((cat) => cat.KatID === KatIDextracted);
    const whoseKatImgCnt = findKat.KatContentImg;

    const newOrderindexed = whoseKatImgCnt.map((img, index) => {
        var imgID = newimgbubblesOrder[index];
        if (typeof imgID === 'string') {
            imgID = parseInt(imgID, 10);
        }
        return whoseKatImgCnt[imgID];
    });

    cmsData.forEach((cat) => {
        if (cat.KatID === KatIDextracted) {
            cat.KatContentImg = newOrderindexed;
        }
    });

    // Overwrite CMS.json with the updated KatContentTxt
    fs.writeFile('CMS.json', JSON.stringify(cmsData, null, 2), (err) => {
        if (err) {
            return res.status(500).send('Error writing CMS file');
        }
        res.json({ success: true, message: 'Order updated successfully' });
    });  
});

// Configure Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname); // Use the hash-prefixed filename from the frontend
    },
  });

const upload = multer({ storage });

// Helper: Check for Duplicate Hash
function isDuplicateHash(hash, hashFilePath) {
    if (!fs.existsSync(hashFilePath)) return false;
  
    const existingHashes = fs.readFileSync(hashFilePath, 'utf-8').split('\n');
    return existingHashes.includes(hash);
  }

// Image Upload Endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
      return res.status(400).send('Error: No file uploaded');
    }
  
    const hashFilePath            = path.join(__dirname, 'uploads', 'hashes.txt');
  
    try {

      // Extract the hash from the filename
      const [hash]                = req.file.filename.split('-');
      const filename              = req.file.originalname;
      const threeDigitHash        = req.body.ThreeDigitHash;
      const newImg                = { 'ThreeDigitHash': threeDigitHash, 'hash': hash, 'filename': filename };
  
      // Check if the hash already exists
      if (isDuplicateHash(hash, hashFilePath)) {
        // Return the existing image URL if a duplicate hash is detected
        console.log('Duplicate hash detected:', hash);
        //return res.json({ imgPath: `/uploads/${req.file.filename}` });
      }

      let cmsData = [];
      try {
          cmsData = JSON.parse(fs.readFileSync('CMS.json', 'utf8'));
      } catch (e) {
          console.log('Error parsing CMS.json:', e);
      }

      const whichKatID            = cmsData.find(category => category.KatID === req.body.catID);
      whichKatID.KatContentImg.push(newImg);

      // Store the hash in hashes.txt
      fs.appendFileSync( hashFilePath, `${hash}\n`, 'utf-8' ); // Append the hash to hashes.txt 

      // Write the updated data to CMS.jsoner
      fs.writeFileSync('CMS.json', JSON.stringify(cmsData, null, 2));
  
      // Respond with the file path
      res.json({ imgPath: `/uploads/${req.file.filename}` });
    } catch (err) {
      console.error('Error processing file:', err);
      res.status(500).send('Internal Server Error');
    }
  });

// Serve static images from the 'uploads' directory/cache
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    maxAge: '1d', // Cache images for 1 day
}));

// Endpoint to delete items based on criteria
app.delete('/api/cms', (req, res) => {
    const criteria = req.body; // no {} here, so if there are other issues, maybe checking here
    console.log('Criteria:', criteria);
  
    // Load CMS.json data
    let newCmsData = [], cmsData = JSON.parse(fs.readFileSync('CMS.json', 'utf-8'));
  
    if (criteria.KatID && criteria.imgID) {
        console.log('Both KatID and imgID');

        // Find the category with the specified KatID
        const category = cmsData.find(cat => cat.KatID === criteria.KatID);

        const imgIDInt = parseInt(criteria.imgID, 10);

        // Create a new KatContentImg array without the specified imgID
        const updatedCategory = {
            ...category,
            KatContentImg: category.KatContentImg.filter((imgObj, index) => index !== imgIDInt),
        };

        // Update cmsData by replacing the old category
        newCmsData = cmsData.map(cat => 
            cat.KatID === criteria.KatID ? updatedCategory : cat
        );
    }  
    else if (criteria.KatID && criteria.txtbubbleID) {
        console.log('txtbubbleID and KatID');

        // Find the category with the specified KatID
        const category = cmsData.find(cat => cat.KatID === criteria.KatID);

        const txtBIDInt = parseInt(criteria.txtbubbleID, 10);

        // Create a new KatContentTxt array without the specified txtbubbleID
        const updatedCategory = {
            ...category,
            KatContentTxt: category.KatContentTxt.filter((imgObj, index) => index !== txtBIDInt),
        };
        
        // Update cmsData by replacing the old category
        newCmsData = cmsData.map(cat => 
            cat.KatID === criteria.KatID ? updatedCategory : cat
        );
    }

    else if (criteria.KatID && (!criteria.txtbubbleID && !criteria.imgID)) {
        console.log('KatID only');
        // Filter out items that match the criteria
        newCmsData = criteria && criteria.KatID ? cmsData.filter(category => !category.KatID.includes(criteria.KatID)) : [];
        newCmsData.forEach((category, index) => category.KatID = `${index + 1}`);
    }     

    // Write updated data to CMS.json
    fs.writeFileSync('CMS.json', JSON.stringify(newCmsData, null, 2));
    res.send('Items deleted based on criteria');
  });  

app.put('/LeaderLine', (req, res) => {
  const { KatBoxID, LeaderLine } = req.body;

    let cmsData = [];
    try {
        cmsData = JSON.parse(fs.readFileSync('CMS.json', 'utf8'));
    } catch (e) {
        console.log('Error parsing CMS.json:', e);
    }

    const KatIDextracted = KatBoxID.split('-')[1];
    const findKat        = cmsData.find((cat) => cat.KatID === KatIDextracted);
    const KatLines       = findKat.KatLines;
    const findDuplicate  = KatLines.find((obj) => {
        return obj.generalID === LeaderLine.generalID;
    });
    console.log('findDuplicate', findDuplicate);

    if (findDuplicate) Object.assign(findDuplicate, LeaderLine);
    else KatLines.push(LeaderLine);

    fs.writeFile('CMS.json', JSON.stringify(cmsData, null, 2), (err) => {
        if (err) {
            return res.status(500).send('Error writing CMS file');
        }
        res.json({ success: true, message: 'indication registered or updated successfully' });
    });

});

app.put('/LeaderLineUpdate', (req, res) => {
    const { generalID, invisible } = req.body;
    console.log('generalID&invisible', generalID, invisible);
  
      let cmsData = [];
      try {
          cmsData = JSON.parse(fs.readFileSync('CMS.json', 'utf8'));
      } catch (e) {
          console.log('Error parsing CMS.json:', e);
      }
  
      const findKat        = cmsData.find((cat) => cat.KatLines.find(line => line.generalID === generalID));
      const findObj        = findKat.KatLines.find(line => line.generalID === generalID);
      findObj.invisible    = invisible;
  
      fs.writeFile('CMS.json', JSON.stringify(cmsData, null, 2), (err) => {
          if (err) {
              return res.status(500).send('Error writing CMS file');
          }
          res.json({ success: true, message: 'indication registered or updated successfully' });
      });
  
  });

app.use(express.static('input.html'));
app.use(express.static('index.html'));
// Serve static images from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(3000, () => console.log('Server running on http://localhost:3000'));

module.exports = (req, res) => {
    console.log("Request received:", req.method, req.url);
  
    try {
      res.status(200).json({ message: "API is working!" });
    } catch (error) {
      console.error("Error in API:", error);
      res.status(500).json({ error: error.message });
    }
  };
  