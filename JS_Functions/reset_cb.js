/// Data Processing similar to UniDEC

// 1. Load data
var data = raw_mz.data;
var sele = {};
var ser_data={};

var names = series_names;

/// remember i in x gives ith element
for(i_ser in names){
    sele[names[i_ser]]=series_sele[names[i_ser]].data;
    ser_data[names[i_ser]]=series_data[names[i_ser]].data;
}
// 2. Process data
proc_mz.data=data
indexkrieg(data, sele, ser_data, names, peak_mz)
// 3. Put data into sources
data2sources(names, sele, proc_mz.data, series_mz);

// 4. Tell console you are done
process_data.button_type='success'
process_data.label='Process Data'
console.log('Done')