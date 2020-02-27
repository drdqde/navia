
new_data = {'mz': [], 'Intensity': []}

for (i in series_names){
    series_data[series_names[i]].data = {'x_low':[], 'x_upp':[],  'x_max':[],'max_int':[], 'charge':[]}
    series_sele[series_names[i]].data = {'i_low':[], 'i_upp':[], 'i_max':[]}
    series_mz[series_names[i]].data  = {'Intensity':[], 'mz':[]}
}

series_masses.data = {'Series':[], 'Mass':[], 'Uncertainty':[]}

aser_data.data = {'x_low':[], 'x_upp':[],  'x_max':[], 'max_int':[], 'charge':[]}



var act =cb_obj.value;
console.log(act)
if(act== "load_file"){
    var input = document.createElement('input');
    input.type = 'file';
    input.onchange = e => {

    // getting a hold of the file reference
    var file = e.target.files[0];

    // setting up the reader
    var reader = new FileReader();
    reader.readAsText(file,'UTF-8');

    // here we tell the reader what to do when it's done reading...
    reader.onload = readerEvent => {
        var content = readerEvent.target.result; // this is the content!
        ///console.log( content );

        var lines = content.split('\n')

        for(i=10; i < lines.length; i++){
            line = lines[i].split('\t')
            new_data['mz'].push(parseFloat(line[0]))
            new_data['Intensity'].push(parseFloat(line[1]))
        }

          /// Find maximum and normalise data
        max_int=0.0
        for(i=0; i < new_data['Intensity'].length; i++){
            if(new_data['Intensity'][i] > max_int){
                max_int = new_data['Intensity'][i];
            }
        }
        for(i=0; i < new_data['Intensity'].length; i++){
            new_data['Intensity'][i] = 100 * new_data['Intensity'][i] / max_int;
        }
        raw_mz.data=new_data
        new_bg = {'mz': [new_data['mz']], 'Intensity': [new_data['Intensity']]}
        bg_mz.data = new_bg
        }
    }
    input.click();
}

if(act== "load_clip"){

    var ms = prompt("Paste spectrum here", "");
    if (ms != null) {
        var lines = ms.split('\n')
        for(i=10; i < lines.length; i++){
            line = lines[i].split('\t')
            new_data['mz'].push(parseFloat(line[0]))
            new_data['Intensity'].push(parseFloat(line[1]))
        }
      
        /// Find maximum and normalise data
        max_int=0.0
        for(i=0; i < new_data['Intensity'].length; i++){
            if(new_data['Intensity'][i] > max_int){
                max_int = new_data['Intensity'][i];
            }
        }
        for(i=0; i < new_data['Intensity'].length; i++){
            new_data['Intensity'][i] = 100 * new_data['Intensity'][i] / max_int;
        }
        raw_mz.data=new_data
        new_bg = {'mz': [new_data['mz']], 'Intensity': [new_data['Intensity']]}
        bg_mz.data = new_bg
    }

}

if (act == 'load_sess'){
    var input = document.createElement('input');
        input.type = 'file';
        input.onchange = e => {

        // getting a hold of the file reference
        var file = e.target.files[0];

        // setting up the reader
        var reader = new FileReader();
        reader.readAsText(file,'UTF-8');

        // here we tell the reader what to do when it's done reading...
        reader.onload = readerEvent => {
            var content = readerEvent.target.result; // this is the content!
            /// Line below is short for look in content for key data and put into left data (professional name object destructuring)
            const {raw_data} = JSON.parse(content)
            raw_mz.data = data
        }
    }
    input.click();
}


if (act == 'save_sess'){
    var raw_data =raw_mz.data;
    var smooth_data =raw_mz.data;

    let save_json = {  data, }

    var jsonData = JSON.stringify(data);
    function download(content, fileName, contentType) {
        var a = document.createElement("a");
        var file = new Blob([content], {type: contentType});
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
    }
    download(jsonData, 'json.navia', 'navia');
}

/// Save sessions regurlarly
/*
window.setInteval(function(){
    let save_json = {  data, }
    var jsonData = JSON.stringify(data);
    try {
        window.localStorage.setItem("curr_sess", jsonData)
    }},1000)
*/