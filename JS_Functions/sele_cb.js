/// Get data source from Callback args


// if ((ser_act.value == "Background") && (ser_act.options.length ==2)){
//         ser_act.options.splice(ser_act.options.length-1,1)
//         i = ser_act.options.length
//         ser_act.options.push("Series " + i)
//         ser_act.options.push("New Series")
//         ser_act.value="Series " + i
//         ser_match.options.push("Series " + i)
//         ser_match.value="Series " + i
//     }

// for(i_ser in names){
//     sele_lines[names[i_ser]]=sel_lines[names[i_ser]];
//     ser_data[names[i_ser]]=series_data[names[i_ser]].data;
//     }
// sele_lines['Background']=sel_lines['Background'];


// peakprediction(masses, ser_data, act);

// if(act != 'Background'){
//     col.color = sele_lines[act].line_color.value;
// 	pp_mean.line_color = sele_lines[act].line_color;
// 	pp_std.line_color = sele_lines[act].line_color;
// 	aser_data.data = series_data[act].data;
// }

if(ser_act.label != 'Create New Series'){
	var data = proc_mz.data;
	var peak_data={};
	var act = ser_act.label;

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
	    
	/// get BoxSelectTool dimensions from cb_data parameter of Callback and find indices of lower/upper range marked

	var geometry = cb_data['geometry'];
	i_low = closest(data['mz'], geometry['x0']);
	i_upp = closest(data['mz'], geometry['x1']);


	/// Boolean to decide whether to append new selection

	var nopush = sele_logics(i_low, i_upp, sele, names, ser_data, act);

	push_sele(nopush, sele, data, i_low, i_upp, ser_data, act, peak_data);

	data2sources(names, sele, data, series_mz);

	DoMacSED(masses, ser_data, names, series_masses, posneg, series_colours_DS)

	peakprediction(masses,ser_data, act, data);

	data2active_table(ser_data[act], aser_data, act);
}


    