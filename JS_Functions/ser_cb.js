var names = series_names;
var sele_lines = {};
var masses = series_masses.data
var ser_data = {};
var ser_colours = series_colours_DS.data

console.log(cb_obj.value)

if (cb_obj.value == 'New Series'){
    i_ser= String(cb_obj.menu.length-1)
    cb_obj.menu.push(('Series ' + i_ser, 'Series ' + i_ser))
    ser_match.options.push('Series ' + i_ser)
    ser_match.value='Series ' + i_ser
    cb_obj.label= 'Series ' + i_ser
    cb_obj.value= 'Series ' + i_ser 
}
else{
    cb_obj.label= cb_obj.value
}
var act = cb_obj.value;

for(i in ser_colours['series']){
    sel_lines[ser_colours['series'][i]].line_color.value=ser_colours['colour'][i]
    sel_lines4k[ser_colours['series'][i]].line_color.value=ser_colours['colour'][i]
    peak_lines[ser_colours['series'][i]].line_color.value=ser_colours['colour'][i]
    peak_lines4k[ser_colours['series'][i]].line_color.value=ser_colours['colour'][i]
}

for(i_ser in names){
    sele_lines[names[i_ser]]=sel_lines[names[i_ser]];
    ser_data[names[i_ser]]=series_data[names[i_ser]].data;
    }
sele_lines['Background']=sel_lines['Background'];

peakprediction(masses, ser_data, act, proc_mz.data);
if(act != 'Background'){
    col.color = sele_lines[act].line_color.value;
	pp_mean.line_color.value = sele_lines[act].line_color.value;
	pp_std.line_color.value = sele_lines[act].line_color.value;
	aser_data.data = series_data[act].data;
}
else{
    col.color = sele_lines['Background'].line_color.value;
    empty_aser={ 'x_low':[], 'x_upp':[], 'x_max':[], 'max_int':[], 'charge':[]}
    aser_data.data = empty_aser
} 

