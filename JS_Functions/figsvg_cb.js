bg_mzsvg.data=bg_mz.data;
highres_canvas.xrange=plot_canvas.xrange;
highres_canvas.yrange=plot_canvas.yrange
for (var i = series_names.length - 1; i >= 0; i--) {
	series_mzsvg[series_names[i]].data=series_mz[series_names[i]].data
}