inds=[]
for(i in SU_act.selected.indices){
	inds.push(SU_act.selected.indices[i])
}
complexes=SU_act.data
// if(inds.length==0){
// 	inds.push(complexes['name'].length-1)
// }
for (var i = inds.length - 1; i >= 0; i--) {
	complexes['name'].splice(inds[i],1);
	complexes['mass'].splice(inds[i],1);
	complexes['min'].splice(inds[i],1);
	complexes['max'].splice(inds[i],1);
	complexes['stride'].splice(inds[i],1);
}
SU_act.change.emit()