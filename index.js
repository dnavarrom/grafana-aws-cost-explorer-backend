/* Simple Json Grafana Plugin requires to implement the following endpoints

/ should return 200 ok. Used for "Test connection" on the datasource config page.
/search used by the find metric options on the query tab in panels.
/query should return metrics based on input.
/annotations should return annotations.
/tag-keys should return tag keys for ad hoc filters.
/tag-values should return tag values for ad hoc filters.

*/

var log = console.log;
console.log = function(){
  log.apply(console, [Date.now()].concat(arguments));
};

var express = require('express');
var bodyParser = require('body-parser');
var _ = require('lodash');
var auth = require('./lib/auth.js');
var app = express();
app.use(auth);
var dataStore = require('./lib/dataStore.js');

/* //not working
var searchOptions = [ 
    { "text" :"Year to Date Aggregated", "value": 1}, 
    { "text" :"Year to Date by Tag", "value": 2},
    { "text" :"Month to Date Aggregated", "value": 3},
    { "text" :"Month to Date by Tag", "value": 4} 
];
*/

var searchOptions = [
    "Year to Date Aggregated",
    "Year to Date by Tag",
    "Month to Date Aggregated",
    "Month to Date by Tag",
    "Last Month Aggregated",
    "Last Month By Tag"
];


app.use(bodyParser.json());

function setCORSHeaders(res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST");
    res.setHeader("Access-Control-Allow-Headers", "accept, content-type", "X-Auth-Token");  
  }


function callServiceApi(target, callback) {

    let opts = {
        granularity : 'DAILY'
    };

    let dataStoreKey = "";

    if (target.target == searchOptions[1] || 
        target.target == searchOptions[3] || 
        target.target == searchOptions[5]) {
        opts.groupBy = [
            {
              'Type': 'TAG',
              'Key': 'Aplicacion' 
            }
          ]
    }

    //FIX this code
    if (target.target == searchOptions[0] ||target.target == searchOptions[1]) {
        dataStoreKey = "ytd";
    }
    if (target.target == searchOptions[2] ||target.target == searchOptions[3])
    {
        dataStoreKey = "mtd";
    }

    if (target.target == searchOptions[4] ||target.target == searchOptions[5]) {
      dataStoreKey = "lmt";
    }

    dataStore.getResults(dataStoreKey, opts, function(error, data) {
        return callback(error, data);
    });

    
}

function buildResultTable(data,target) {

    let table = {
        columns : [
            {text: 'Start', type: 'date'}, 
            {text: 'End', type: 'date'}, 
            {text: 'Cost', type: 'number'}
        ],
        rows : [],
        type : "table"
    };

    // add Rows
    Object.keys(data.ResultsByTime).forEach(function(key) {
        let row = [
            data.ResultsByTime[key].TimePeriod.Start,
            data.ResultsByTime[key].TimePeriod.End,
            parseFloat(data.ResultsByTime[key].Total.BlendedCost.Amount)
        ];
        table.rows.push(row);
    });


  return table;
}

function buildResultTimeSeries(data, target) {
    
    let result = {
        "target" : target.target,
        "datapoints" : []
    };

    Object.keys(data.ResultsByTime).forEach(function(key) {
       let dataPoint = [ 
           parseFloat(data.ResultsByTime[key].Total.BlendedCost.Amount),
           new Date(data.ResultsByTime[key].TimePeriod.End).getTime()
        ];
       result.datapoints.push(dataPoint);
    });


    return result;
}

  app.all('/', function(req, res) {
    setCORSHeaders(res);
    //console.log(req.url);
    //console.log(req.body);
    res.send('It works!!');
    res.end();
  });

  app.all('/search', function(req, res){
    setCORSHeaders(res);
    //console.log(req.url);
    //console.log(req.body);
    var result = searchOptions;
    res.json(result);
    res.end();
  });


  app.all('/query', function(req, res){
    setCORSHeaders(res);
    //console.log(req.url);
    //console.log(req.body);

    var tsResult = [];

    if (req.body.adhocFilters && req.body.adhocFilters.length > 0) {
        console.log('filters data request');
    }

    _.each(req.body.targets, function(target) { 
            callServiceApi(target, function(err,data) {
                if (err)
                    return;
                if (target.type === 'table') {
                    tsResult.push(buildResultTable(data,target));
                }
                else {
                    tsResult.push(buildResultTimeSeries(data,target));
                }
            });
    });

    //console.dir(tsResult, {depth : null});
    res.json(tsResult);
    res.end();
  
});



  app.all('/annotations', function(req, res) {
    setCORSHeaders(res);
    //console.log(req.url);
    //console.log(req.body);

    var annotations = [
      { annotation: annotation, "title": "When is the next ", "time": 1450754160000, text: "teeext", tags: "taaags" }
    ];
  
    res.json(annotations);
    res.end();
  });

  app.all('/tag[\-]keys', function(req, res) {
    setCORSHeaders(res);
    //console.log(req.url);
    //console.log(req.body);


    var tagKeys = [
      {"type":"string","text":"Country"}
    ];
  
    res.json(tagKeys);
    res.end();
  });

  app.all('/tag[\-]values', function(req, res) {
    setCORSHeaders(res);
    //console.log(req.url);
    //console.log(req.body);

    var countryTagValues = [
      {'text': 'SE'},
      {'text': 'DE'},
      {'text': 'US'}
    ];
  
    if (req.body.key == 'City') {
      res.json(cityTagValues);
    } else if (req.body.key == 'Country') {
      res.json(countryTagValues);
    }
    res.end();
  });

app.listen(8090);

console.log("Server is listening to port 8090");
