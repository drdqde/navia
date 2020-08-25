mass_finder_exact_mass_sele.value=String(mass_finder_mass.value*1000.0)

if((raw_mz.data['mz'].length > 0) && (mass_finder_line_sele.active == true)){
	var mf_data = { "xs":[], "ys":[] }
	var comp_mass = mass_finder_mass.value*1000//prompt("Mass of complex in Da", "10000.0");
	var mz_min = raw_mz.data['mz'][0]//prompt("Lower m/z bound", "1000.0");
 	var mz_max = raw_mz.data['mz'][raw_mz.data['mz'].length-1]//prompt("Upper m/z bound", "2000.0");
 	// console.log({comp_mass},{mz_min},{mz_max})
 	
 	var z_min = Math.ceil(mass_finder_range_slider.value[0])//parseFloat(comp_mass) / (parseFloat(mz_max)+0.1))
	var z_max = Math.floor(mass_finder_range_slider.value[1])//parseFloat(comp_mass) / (parseFloat(mz_min)+0.1))

 	for (z=z_min; z<z_max; z++){
 		mz_pred= Number(comp_mass) / z
 		if((mz_min < mz_pred) && (mz_pred < mz_max)){
 			mf_data["ys"].push([0.0, 100.0])
 	 		mf_data["xs"].push([mz_pred, mz_pred])
 		}
 	}
 	console.log({mf_data})
 	console.log("Massfinder finished.")
 	mass_finder_data.data = mf_data;
}