SUs = SU_act.data;
var masses = series_masses.data
var act = ser_match.value

ind = []

n_comb = 1

i_act=0
/// Find correct series index for calculing peak prediction
for (i_ms=0; i_ms < masses['Mass'].length; i_ms++){
    if (masses['Series'][i_ms] == act){
        i_act=i_ms
    }
}

var com_table= {'stoichiometry':[], 'mass':[], 'mass_diff':[]}


for (var i =  0; i < SUs["min"].length; i++) {
	n_comb *=  (Math.floor((SUs["max"][i]-SUs["min"][i])/SUs["stride"][i]) + 1)
	ind.push(Number(SUs["min"][i]))
}
for(i=0; i < n_comb; i++){
	for(j=0; j < SUs["min"].length; j++){
		if( (ind[j] + Number(SUs["stride"][j])) <= Number(SUs["max"][j])){
			ind[j] = ind[j] + Number(SUs["stride"][j])
			comb_mass=0.0
			for(k=0; k < SUs["min"].length; k++){
				comb_mass = comb_mass + SUs["mass"][k]*ind[k]
			}
			diff = comb_mass - masses['Mass'][i_act]
			if (diff*diff < diff_match.value*diff_match.value){
				com_table['mass'].push(comb_mass)
				com_table['mass_diff'].push(diff)
				sotich_string=''
				for(k=0; k < SUs["min"].length; k++){
					sotich_string= sotich_string + SUs["name"][k] + ': ' + ind[k] + '   '
				} 
				com_table['stoichiometry'].push(sotich_string)

			}
			break;
		}
		else{
			ind[j] = Number(SUs["min"][j])
		}
	}
}
stoich.data = com_table