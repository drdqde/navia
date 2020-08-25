/// Data Processing similar to UniDEC

// 1. Load data
// cb_obj.button_type='danger'
// cb_obj.label='Processing data...'
var data = proc_mz.data;
var sele = {};
var ser_data={};
var dtp = DataProcessingParameters.data

var names = series_names;

/// remember i in x gives ith element
for(i_ser in names){
    sele[names[i_ser]]=series_sele[names[i_ser]].data;
    ser_data[names[i_ser]]=series_data[names[i_ser]].data;
}
// 2. Process data
proc_mz.data=data_processing(data, dtp, sele, ser_data, names, peak_mz)

// 3. Put data into sources
data2sources(names, sele, proc_mz.data, series_mz);

// 4. Tell console you are done
console.log('Done')
cb_obj.button_type='warning'
cb_obj.label='Reprocess Data'
