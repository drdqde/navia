console.log(save4k_text.button_type)
if(save4k_text.button_type=='success'){
	bg_mz4k.data=bg_mz.data;
	highres_canvas.xrange=plot_canvas.xrange;
	highres_canvas.yrange=plot_canvas.yrange
	for (var i = series_names.length - 1; i >= 0; i--) {
		series_mz4k[series_names[i]].data=series_mz[series_names[i]].data
	}
	save4k_text.button_type='danger'
	save4k_text.label='Click before continuing'
	save4k.visible=true
} else {
	console.log('else')
	save4k_text.button_type='success'
	save4k_text.label=' Create 4K PNG figure: '
	save4k.visible=false
}