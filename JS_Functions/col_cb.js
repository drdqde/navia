var act = ser_act.value;
var names = series_names;
var line = sel_lines[act]
var pline= peak_lines[act]
var pline4k= peak_lines4k[act]
var ser_colours=series_colours_DS.data
var ser_data = {};
var data = proc_mz.data;
for(i_ser in names){
    ser_data[names[i_ser]]=series_data[names[i_ser]].data;
}


pline.line_color.value = cb_obj.color;
pline4k.line_color.value = cb_obj.color;
line.line_color.value = cb_obj.color;
pp_mean.line_color.value = sel_lines[act].line_color.value;
pp_std.line_color.value = sel_lines[act].line_color.value;

var masses = series_masses.data;
console.log(cb_obj)

for(var i=0; i<ser_colours['series'].length; i++){
	if(act == ser_colours['series'][i]){
		console.log(ser_colours['series'][i] + ' ' + series_masses.data['Colour'][i] + ' ' + cb_obj.color)
		ser_colours['colour'][i]=cb_obj.color;
		masses['Colour'][i]=cb_obj.color
		series_masses.change.emit();
		series_colours_DS.change.emit();
	}
}
peakprediction(masses, ser_data, act, data);
if(act != 'Background'){
    cb_obj.color = sel_lines[act].line_color.value;
	pp_mean.line_color.value = sel_lines[act].line_color.value;
	pp_std.line_color.value = sel_lines[act].line_color.value;
}
else{
    cb_obj.color = sel_lines['Background'].line_color.value;
    empty_aser={ 'x_low':[], 'x_upp':[], 'x_max':[], 'max_int':[], 'charge':[]}
} 
plot_canvas.change.emit()

console.log('Colour callback done.')