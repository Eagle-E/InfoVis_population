var jsonFilePath = "data/UN_JSON.json"
var jsonPopFilePath = "data/population.json"

var data = require(jsonFilePath);

let jsondata;    
fetch(jsonFilePath).then(
        function(u){ return u.json();}
      ).then(
        function(json){
          fetch(jsonPopFilePath).then(
            function(u){ return u.json();}
            ).then(
              function(json){
                jsondata = json;
              }
            )
          jsondata = json;
        }
      )



try {
  const [data1, data2, data3] = await Promise.all([
    fetch(url1),
    fetch(url2),
    fetch(url3),
  ]);

  // Now you can process the data:
  [data1, data2, data3].map(handleResponse);
} catch (error) {
  console.log('Error downloading one or more files:', error);
}
