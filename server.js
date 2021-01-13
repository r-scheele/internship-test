const express = require('express');
const csv = require('csvtojson')

const app = express()
app.use(express.json({extended: false}))

const csvTestFile = {
    "csv":{
      "url": 'server.csv',
      "select_fields": ["First Name", "Last Name", "Age"]
    }
  }

//@Desc -- Generate ID
const uniqueID = () => {
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
}

const middleware = async (req, res, next) => {
    try {
        const file = req.body.csv;
        if(!file.url.endsWith('.csv')) res.json({error: 'Invalid CSV file'})

        const response = await csv().fromFile(file.url)

        if(response) {
            req.result = response
            req.fields = file['select_fields']

        }
        else res.json({error: 'Invalid CSV file'})

        next()
    } catch (err) {
        console.error(err.message)
    }
}


const controller = (req, res) => {
    const {result, fields } = req

    if(!fields) res.json(result)
    else {
        const pickedKeys = (obj, keys) => Object.fromEntries(keys.map(key => [key, obj[key]]) )
        const arr = result.map(object => pickedKeys(object, fields))
        res.json({
            "conversion_key": uniqueID(),
            "json": arr
        })
    }
    
}



app.post('/', middleware, controller)






app.listen(3000, () => console.log('server running'))