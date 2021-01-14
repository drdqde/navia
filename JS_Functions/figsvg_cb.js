bg_mzsvg.data=bg_mz.data;
highres_canvas.xrange=plot_canvas.xrange;
highres_canvas.yrange=plot_canvas.yrange
for (var i = series_names.length - 1; i >= 0; i--) {
	series_mzsvg[series_names[i]].data=series_mz[series_names[i]].data
}

console.log(savesvg_text.button_type)
if(savesvg_text.button_type=='success'){
	bg_mzsvg.data=bg_mz.data;
	highres_canvas.xrange=plot_canvas.xrange;
	highres_canvas.yrange=plot_canvas.yrange
	for (var i = series_names.length - 1; i >= 0; i--) {
		series_mzsvg[series_names[i]].data=series_mz[series_names[i]].data
	}
	savesvg_text.button_type='danger'
	savesvg_text.label='Click before continuing'
	savesvg.visible=true
} else {
	console.log('else')
	savesvg_text.button_type='success'
	savesvg_text.label=' Create SVG figure: '
	savesvg.visible=false
}