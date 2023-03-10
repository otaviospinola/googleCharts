const express = require('express')
const app = express()
const path = require('path');
const cors = require('cors')
const client = require('smartsheet');
const helmet = require('helmet');

app.use(cors())
app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );
app.set('view engine', 'ejs')

const ss = client.createClient({accessToken: process.env.ACCESS_TOKEN})

function columnMap(sheet){
    const columnMap = sheet.columns.reduce((tempMap, col) => { 
        tempMap[col.title] = col.id; 
        return tempMap; 
    }, {})

    return columnMap
}

app.get('/data', async (req, res) => {
    res.header('Content-Security-Policy', "default-src *  data: blob: filesystem: about: ws: wss: 'unsafe-inline' 'unsafe-eval' 'unsafe-dynamic'; script-src * data: blob: 'unsafe-inline' 'unsafe-eval'; connect-src * data: blob: 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src * data: blob: ; style-src * data: blob: 'unsafe-inline'; font-src * data: blob: 'unsafe-inline';")
    let options = {
        id: 7409111034816388,
        queryParameters: {        
            columnIds: '2561792620160900,5376542387267460,3124742573582212',
            rowNumbers: '1,2,3,4,5,6,7,8'
        }
    }

    let sheet = await ss.sheets.getSheet(options)
    .catch((err) => console.log(err))
    let columns = columnMap(sheet)

    let data = sheet.rows.map((row) => {
        let array = []
        for (cell of row.cells){
            array.push(cell.value)
        }
        return array
    })
    data.unshift(Object.keys(columns))
    console.log(data);
    res.render('index', {info: data})
})

app.listen(8080)
