/// Get data source from Callback args

var data = raw_mz.data;
var act = ser_act.value;

var sele = {};
var ser_data={};
var act_data=aser_data.data;
var masses = series_masses.data;

var names = series_names;

/// remember i in x gives ith element
for(i_ser in names){
    sele[names[i_ser]]=series_sele[names[i_ser]].data;
    ser_data[names[i_ser]]=series_data[names[i_ser]].data;
}
    
/// get BoxSelectTool dimensions from cb_data parameter of Callback and find indices of lower/upper range marked

var geometry = cb_data['geometry'];
i_low = closest(data['mz'], geometry['x0']);
i_upp = closest(data['mz'], geometry['x1']);


/// Boolean to decide whether to append new selection

var nopush = sele_logics(i_low, i_upp, sele, names, ser_data, act);

push_sele(nopush, sele, data, i_low, i_upp, ser_data, act);

data2sources(names, sele, data);

DoMacSED(masses, ser_data, names, series_masses)

peakprediction(masses,ser_data, act);

data2active_table(ser_data[act], aser_data, act);

    