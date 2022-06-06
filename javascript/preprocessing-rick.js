var jsonFilePath = "data/UN_JSON.json"

let jsondata;    
fetch(jsonFilePath)
  .then((response) => {
    return response.json();
  })
  .then((myJson) => {
    handle_data(myJson);
  });

function handle_data(json)
{
    dat = Object.values(json["2000"])
    update_plot(wrapper, dat)
    console.log(dat)
}