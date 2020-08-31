var act =cb_obj.value;
console.log(act);

function table_to_csv(source){
    const columns = ['name', 'mass', 'min', 'max', 'stride']
    const nrows = source.get_length()
    const lines = ['Name,Mass,Minimum #,Maximum #,stride']

    for (let i = 0; i < nrows; i++) {
        let row = [];
        for (let j = 0; j < columns.length; j++) {
            const column = columns[j]
            row.push(source.data[column][i].toString())
        }
        lines.push(row.join(','))
    }
    return lines.join('\n').concat('\n')
}


function table_to_csv2(source, source2){
    const columns = ['name', 'mass', 'min', 'max', 'stride']
    const nrows = source.get_length()
    const lines = ['Name,Mass,Minimum #,Maximum #,stride']

    const columns2 = ['stoichiometry', 'mass', 'mass_diff']
    const nrows2 = source.get_length()

    for (let i = 0; i < nrows; i++) {
        let row = [];
        for (let j = 0; j < columns.length; j++) {
            const column = columns[j]
            row.push(source.data[column][i].toString())
        }
        lines.push(row.join(','))
    }
    lines.push('\nStoichiometry,Mass of SU Combination,Different to Measured Mass')
    for (let i = 0; i < nrows2; i++) {
        let row = [];
        for (let j = 0; j < columns2.length; j++) {
            const column = columns2[j]
            row.push(source2.data[column][i].toString())
        }
        lines.push(row.join(','))
    }
    return lines.join('\n').concat('\n')
}

function peak_table_to_csv(source){
    const columns = ['x_low', 'x_upp', 'x_max','max_int', 'charge']
    const nrows = source.get_length()
    const lines = ['Lower m/z ,Upper m/z,mz of Max,Intensity of Maximum,Charge']

    for (let i = 0; i < nrows; i++) {
        let row = [];
        for (let j = 0; j < columns.length; j++) {
            const column = columns[j]
            row.push(source.data[column][i].toString())
        }
        lines.push(row.join(','))
    }
    return lines.join('\n').concat('\n')
}

function masses_table_to_csv(source){
    const columns = ['Series', 'Mass', 'Uncertainty']
    const nrows = source.get_length()
    const lines = ['Series,Mass,Uncertainty']

    for (let i = 0; i < nrows; i++) {
        let row = [];
        for (let j = 0; j < columns.length; j++) {
            const column = columns[j]
            row.push(source.data[column][i].toString())
        }
        lines.push(row.join(','))
    }
    return lines.join('\n').concat('\n')
}
if(act == "save_peaks"){
   const filename = 'peak_table.csv'
    const filetext = peak_table_to_csv(aser_data)

    const blob = new Blob([filetext], { type: 'text/csv;charset=utf-8;' })

    //addresses IE
    if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, filename)
    } else {
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = filename
        link.target = '_blank'
        link.style.visibility = 'hidden'
        link.dispatchEvent(new MouseEvent('click'))
    } 
}

if(act == "save_masses"){
   const filename = 'masses_table.csv'
    const filetext = masses_table_to_csv(series_masses)

    const blob = new Blob([filetext], { type: 'text/csv;charset=utf-8;' })

    //addresses IE
    if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, filename)
    } else {
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = filename
        link.target = '_blank'
        link.style.visibility = 'hidden'
        link.dispatchEvent(new MouseEvent('click'))
    } 
}

function loading_spectrum(content, cropping_slider, DataProcessingParameters, raw_mz, proc_mz, bg_mz, series_data, 
                          series_sele,series_mz, series_masses, aser_data){
    const new_data = {'mz': [], 'Intensity': []};
    for (i in series_names){
        series_data[series_names[i]].data = {'x_low':[], 'x_upp':[],  'x_max':[],'max_int':[], 'charge':[]}
        series_sele[series_names[i]].data = {'i_low':[], 'i_upp':[], 'i_max':[]}
        series_mz[series_names[i]].data  = {'Intensity':[], 'mz':[]}
    }
    series_masses.data = {'Series':[], 'Mass':[], 'Uncertainty':[], 'Colour':[]}

    aser_data.data = {'x_low':[], 'x_upp':[],  'x_max':[], 'max_int':[], 'charge':[]}


    var lines = content.split('\n')

    for(i=10; i < lines.length-10; i++){
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
    console.log('Intensity calculated and normalised.');

    cropping_slider.value[0]  = new_data['mz'][0]
    cropping_slider.value[1]  = new_data['mz'][new_data['mz'].length-1]
    cropping_slider.start     = new_data['mz'][0]
    cropping_slider.end       = new_data['mz'][new_data['mz'].length-1]
    DataProcessingParameters.data['mz_low'][0] = new_data['mz'][0]
    DataProcessingParameters.data['mz_upp'][0] = new_data['mz'][new_data['mz'].length-1]
    cropping_slider.change.emit()
    console.log('DataProcessingParameters set');
    raw_mz.data=new_data
    console.log('raw_mz created')
    proc_mz.data=new_data
    console.log('proc_mz created', new_data.mz.length, new_data.Intensity.length)
    bg_mz.data = {'mz': [new_data['mz']], 'Intensity': [new_data['Intensity']]}
    console.log('mz sources set.');
    bg_mz.change.emit()
}

if(act== "load_groel"){
    const new_data = GroEL_mz.data
    for (i in series_names){
        series_data[series_names[i]].data = {'x_low':[], 'x_upp':[],  'x_max':[],'max_int':[], 'charge':[]}
        series_sele[series_names[i]].data = {'i_low':[], 'i_upp':[], 'i_max':[]}
        series_mz[series_names[i]].data  = {'Intensity':[], 'mz':[]}
    }
    series_masses.data = {'Series':[], 'Mass':[], 'Uncertainty':[], 'Colour':[]}

    aser_data.data = {'x_low':[], 'x_upp':[],  'x_max':[], 'max_int':[], 'charge':[]}

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
    console.log('Intensity calculated and normalised.');

    cropping_slider.value[0]  = new_data['mz'][0]
    cropping_slider.value[1]  = new_data['mz'][new_data['mz'].length-1]
    cropping_slider.start     = new_data['mz'][0]
    cropping_slider.end       = new_data['mz'][new_data['mz'].length-1]
    DataProcessingParameters.data['mz_low'][0] = new_data['mz'][0]
    DataProcessingParameters.data['mz_upp'][0] = new_data['mz'][new_data['mz'].length-1]
    cropping_slider.change.emit()
    console.log('DataProcessingParameters set');
    raw_mz.data=new_data
    console.log('raw_mz created')
    proc_mz.data=new_data
    console.log('proc_mz created', new_data.mz.length, new_data.Intensity.length)
    bg_mz.data = {'mz': [new_data['mz']], 'Intensity': [new_data['Intensity']]}
    console.log('mz sources set.');
    bg_mz.change.emit()
    comment_window.value="Spectrum of GroEL collected by Siyun Chen in the Robinson Group at the University of Oxford."

}

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
            loading_spectrum(content, cropping_slider, DataProcessingParameters, raw_mz, proc_mz, bg_mz, series_data, series_sele,series_mz, series_masses, aser_data)
        }
    }
    input.click();
}

if(act== "load_clip"){
    var ms = prompt("Paste spectrum here", "");
    if (ms != null) {
       loading_spectrum(ms, cropping_slider, DataProcessingParameters, raw_mz, proc_mz, bg_mz, series_data, series_sele,series_mz, series_masses, aser_data)
    }

}


/* What is saved in a session: 

raw_mz, series_dict, series_data, series_sele, 
series_cols, posneg, SU_act, stoich, cropping_slider, gaussian_smooth, 
n_smooth, intensity_threshold, sub_name, substract, 


var peak_data={};

var sele = {};
var ser_data={};
var masses = series_masses.data;

var names = series_names;

/// remember i in x gives ith element
for(i_ser in names){
    sele[names[i_ser]]=series_sele[names[i_ser]].data;
    ser_data[names[i_ser]]=series_data[names[i_ser]].data;
    peak_data[names[i_ser]]=peak_mz[names[i_ser]].data;
}


*/
if (act == 'save_sess'){
    var raw_data =raw_mz.data;
    // var proc_data =proc_mz.data;
    var dtp        = DataProcessingParameters.data
    var ser_dict = series_dict.data
    var ser_cols = series_colours_DS.data
    var stoichiometry = stoich.data
    var subunits= SU_act.data
    var charge_sign= posneg.value
    var comment = comment_window.value
    var masses = series_masses.data;
    var peak_data={};

    // var sele = {};
    var ser_data={};
    var sele={}
    var names = series_names;

    /// remember i in x gives ith element
    for(i_ser in names){
        sele[names[i_ser]]=series_sele[names[i_ser]].data;
        ser_data[names[i_ser]]=series_data[names[i_ser]].data;
    }

    // let save_json = {data, }
    let save_json = { raw_data, ser_dict, masses, sele, ser_data, ser_cols, charge_sign, subunits, stoichiometry, dtp, comment }

    var jsonData = JSON.stringify(save_json);
    function download(content, fileName, contentType) {
        var a = document.createElement("a");
        var file = new Blob([content], {type: contentType});
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
    }
    download(jsonData, 'session.navia', 'navia');
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
            const { raw_data, ser_dict, masses, sele, ser_data, peak_data, ser_cols, charge_sign, subunits, stoichiometry, dtp, comment } = JSON.parse(content)
            raw_mz.data = raw_data
            DataProcessingParameters.data = dtp
            series_dict.data = ser_dict
            series_colours_DS.data = ser_cols
            stoich.data = stoichiometry
            SU_act.data = subunits
            posneg.value = charge_sign
            comment_window.value = comment
            series_masses.data = masses;

            names = series_names;
            ser_act.options=['Background', 'New Series']
            /// remember i in x gives ith element
            for(i in ser_cols['series']){
                sel_lines[ser_cols['series'][i]].line_color.value=ser_cols['colour'][i]
                sel_lines4k[ser_cols['series'][i]].line_color.value=ser_cols['colour'][i]
                peak_lines[ser_cols['series'][i]].line_color.value=ser_cols['colour'][i]
                peak_lines4k[ser_cols['series'][i]].line_color.value=ser_cols['colour'][i]
            }

            for(i_ser in names){
                series_data[names[i_ser]].data = ser_data[names[i_ser]];
                series_sele[names[i_ser]].data = sele[names[i_ser]];
                if (ser_data[names[i_ser]]['x_low'].length > 0){
                    ser_act.options.splice(ser_act.options.length-1,1)
                    i = ser_act.options.length
                    ser_act.options.push("Series " + i)
                    ser_act.options.push("New Series")
                    ser_act.value="Series " + i
                    ser_match.options.push("Series " + i)
                    ser_match.value="Series " + i
                    act="Series " + i
                }
            }
            proc_mz.data=data_processing(raw_data, DataProcessingParameters.data, sele, ser_data, names, peak_mz)
            cropping_slider.value[0]  = dtp['mz_low'][0]
            cropping_slider.value[1]  = dtp['mz_upp'][0]
            gaussian_smooth.value     = dtp['gau_sigma'][0]
            n_smooth.value            = dtp['gau_rep'][0]
            intensity_threshold.value = dtp['intensity_threshold'][0]
            sub_name.value            = dtp['sub_mode'][0]
            substract.value           = dtp['sub_value'][0]
            

            process_data.button_type='warning'
            process_data.label='Reprocess Data'
            data2sources(names, sele, proc_mz.data, series_mz);
            peakprediction(masses,ser_data, act);
            data2active_table(ser_data[act], aser_data, act);
        }
    }
    input.click();
}

if(act == "load_SU"){
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
            var lines = content.split('\n')
            for(i=1; i < lines.length; i++){
                line = lines[i].split(',')
                if (line.length == 5){
                    console.log(line[0])
                    SU_act.data['name'].push(line[0])
                    SU_act.data['mass'].push(parseFloat(line[1]))
                    SU_act.data['min'].push(parseInt(line[2]))
                    SU_act.data['max'].push(parseInt(line[3]))
                    SU_act.data['stride'].push(parseInt(line[4]))
                }
            }
        SU_act.change.emit()
        }
    }
    input.click();
}

if(act == "save_SU"){
   const filename = 'subunit_table.csv'
    const filetext = table_to_csv(SU_act)

    const blob = new Blob([filetext], { type: 'text/csv;charset=utf-8;' })

    //addresses IE
    if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, filename)
    } else {
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = filename
        link.target = '_blank'
        link.style.visibility = 'hidden'
        link.dispatchEvent(new MouseEvent('click'))
    } 
}

if(act == "save_mm"){
    const filename = 'mass_matching_results.csv'
    const filetext = table_to_csv2(SU_act, stoich)
    const blob = new Blob([filetext], { type: 'text/csv;charset=utf-8;' })

    //addresses IE
    if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, filename)
    } else {
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = filename
        link.target = '_blank'
        link.style.visibility = 'hidden'
        link.dispatchEvent(new MouseEvent('click'))
    }
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