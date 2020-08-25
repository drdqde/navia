var data = proc_mz.data;
var peak_data={};
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
    peak_data[names[i_ser]]=peak_mz[names[i_ser]].data;
}
/// Step 1: compare aser_data to data in active source in dictionary x_low=[], x_upp=[],  x_max=[],max_int=[], charge=[]
const len_active= aser_data.get_length()
for (var i = 0; i < len_active; i++) {
	if (act_data['x_low'][i] != ser_data[act]['x_low'][i]){

	}
	if (act_data['x_upp'][i] != ser_data[act]['x_upp'][i]){
		
	}
	if (act_data['x_max'][i] != ser_data[act]['x_max'][i]){
		if((act_data['x_max'][i] > act_data['x_low'][i]) && (act_data['x_max'][i] < act_data['x_upp'][i])){
			ser_data[act]['x_max'][i] = act_data['x_max'][i]
		}
		else{
			window.alert("Corrected peak not in selection.")
		}
		
	}
	if (act_data['charge'][i] != ser_data[act]['charge'][i]){
		act_data['charge'][i] = ser_data[act]['charge'][i]
		window.alert("Please do not modify the assigned charge states. It will most likely lead to false mass calculations.")	
	}
}