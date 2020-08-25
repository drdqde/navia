var dtp = DataProcessingParameters.data
if (cb_obj.name == 'cropping_slider'){
	dtp['mz_low'][0]= cb_obj.value[0]
	dtp['mz_upp'][0]= cb_obj.value[1]
}
else{
	dtp[cb_obj.name][0]=cb_obj.value
}
DataProcessingParameters.change.emit()