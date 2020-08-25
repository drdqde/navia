var names = series_names
names.push('Background')
for(i_ser in names){
    sel_lines[names[i_ser]].line_width=linew_txt.value
    sel_linessvg[names[i_ser]].line_width=linew_txt.value
    sel_lines4k[names[i_ser]].line_width=4.0*linew_txt.value
}