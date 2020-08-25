/// Get data source from Callback args
console.log(cb_obj.value)
if (String(cb_obj.value)== 'Positive'){
	cb_obj.label='Instrument Mode: +'
}
if (String(cb_obj.value)== 'Negative'){
	cb_obj.label='Instrument Mode: -'
}
var data = proc_mz.data;
var act = ser_act.value;
var peak_data={};

var sele = {};
var ser_data={};
var act_data=aser_data.data;
var masses = series_masses.data;

var names = series_names;

/// remember i in x gives ith element
for(i_ser in names){
    sele[names[i_ser]]=series_sele[names[i_ser]].data;
    ser_data[names[i_ser]]=series_data[names[i_ser]].data;
    peak_data[names[i_ser]]=peak_mz[names[i_ser]].data;
}


/// Boolean to decide whether to append new selection

DoMacSED(masses, ser_data, names, series_masses, posneg)
data2active_table(ser_data[act], aser_data, act);