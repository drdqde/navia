complexes=SU_act.data

complexes['name'].push('New Subunit')
complexes['mass'].push(1000.0)
complexes['min'].push(0)
complexes['max'].push(1)
complexes['stride'].push(1)

SU_act.change.emit()