if (cb_obj.active==true){
	var mf_data = { "xs":[], "ys":[] }
	var comp_mass = prompt("Mass of complex in Da", "10000.0");
	var mz_min = prompt("Lower m/z bound", "1000.0");
 	var mz_max = prompt("Upper m/z bound", "2000.0");


	var z_max = Math.floor(parseFloat(comp_mass) / (parseFloat(mz_min)+0.1))
 	var z_min = Math.ceil(parseFloat(comp_mass) / (parseFloat(mz_max)+0.1))

 	for (z=z_min; z<z_max; z++){
 	 	mf_data["ys"].push([0.0, 100.0])
 	 	mf_data["xs"].push([Number(comp_mass) / z , Number(comp_mass) / z])
 	 	///console.log(Number(comp_mass) / z)
 	}
 	mfl.visible=true;
 	mass_finder_data.data = mf_data;
}

else{
 	 mfl.visible=false;
 	 var mf_data = { "xs":[], "ys":[] }
 	 mass_finder_data.data = mf_data;
}