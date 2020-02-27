var names = series_names;
var sele_lines = {};
var masses = series_masses.data
var ser_data = {};

if (cb_obj.value == "New Series"){
        cb_obj.options.splice(cb_obj.options.length-1,1)
        i = cb_obj.options.length
        cb_obj.options.push("Series " + i)
        cb_obj.options.push("New Series")
        cb_obj.value="Series " + i
    }

for(i_ser in names){
    sele_lines[names[i_ser]]=sel_lines[names[i_ser]];
    ser_data[names[i_ser]]=series_data[names[i_ser]].data;
    }
sele_lines['Background']=sel_lines['Background'];


var act = cb_obj.value;

peakprediction(masses, ser_data, act);

if(act != 'Background'){
    col.color = sele_lines[act].line_color.value;
	pp_mean.line_color = sele_lines[act].line_color;
	pp_std.line_color = sele_lines[act].line_color;
	aser_data.data = series_data[act].data;
}
else{
    col.color = sele_lines['Background'].line_color.value;
    empty_aser={ 'x_low':[], 'x_upp':[], 'x_max':[], 'max_int':[], 'charge':[]}
    aser_data.data = empty_aser
} 

