x=cb_data['geometries']['x']

i_closest=closest(proc_mz.data['mz'], x)
// console.log(i_closest)
len_dat=proc_mz.data['mz'].length
// console.log(len_dat)
low_ind=Math.max(0, i_closest-5)
// console.log(low_ind)
upp_ind=Math.min(len_dat-1, i_closest+5)
// console.log(upp_ind)
slice_for_max =[]
for (var i = low_ind; i < upp_ind; i++) {
	slice_for_max.push(proc_mz.data['Intensity'][i])
}
// slice_for_max=proc_mz.data['Intensity'].splice(low_ind,upp_ind-low_ind)
// console.log(slice_for_max)
i_new_max=closest(slice_for_max, 100.0)
// console.log(i_new_max)
i_new_max+=low_ind
// console.log(i_new_max)
// console.log(low_ind + ' ' +  upp_ind-low_ind + ' ' +  slice_for_max + ' ' +  i_new_max)

/// Get data source from Callback args

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
    

for(i_ser in names){
    if (sele[names[i_ser]]['i_max'].length > 0){
        for(i_peak=0; i_peak < sele[names[i_ser]]['i_max'].length; i_peak++){
            if((sele[names[i_ser]]['i_low'][i_peak] <= i_new_max) && (sele[names[i_ser]]['i_upp'][i_peak] >= i_new_max)){
            	sele[names[i_ser]]['i_max'][i_peak]     = i_new_max
            	ser_data[names[i_ser]]['max_int'][i_peak] = data["Intensity"][i_new_max]
            	ser_data[names[i_ser]]['x_max'][i_peak]   = data['mz'][i_new_max]
            	peak_data[names[i_ser]]['xs'][i_peak]     = [data['mz'][i_new_max], data['mz'][i_new_max]]
        		peak_data[names[i_ser]]['ys'][i_peak]     = [0.0, data["Intensity"][i_new_max]]
            }
  		}
    }
}
console.log('yep')

/// Selection of indices done, emit changes
    for(i_ser in names){
        peak_mz[names[i_ser]].change.emit()
        series_sele[names[i_ser]].change.emit();
        series_data[names[i_ser]].change.emit();
    }
    console.log('correction ok')

DoMacSED(masses, ser_data, names, series_masses, posneg, series_colours_DS)

peakprediction(masses,ser_data, act);

data2active_table(ser_data[act], aser_data, act);
