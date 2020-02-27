complexes=SU_act.data

complexes['name'].push(SU_name.value)
complexes['mass'].push(SU_mass.value)
complexes['min'].push(SU_min.value)
complexes['max'].push(SU_max.value)
complexes['stride'].push(SU_stride.value)

SU_act.change.emit()