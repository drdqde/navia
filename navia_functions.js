/// Define closest, BubbleSort Peak Prediction and MacSED


function mean_func(array){
    mean_res = 0.0
    for (i=0; i < array.length; i++){
        mean_res += array[i]
    }
    mean_res = mean_res / array.length
    return mean_res
}

 function std_func(array){
    mean_res = mean_func(array)
    std_res = 0
    for (i=0; i < array.length; i++){
        std_res += (array[i]-mean_res)*(array[i]-mean_res)
    }
    std_res = Math.sqrt(std_res / (array.length-1))
    return std_res
}


function closest(array,num){
    var i=0;
    var minDiff=10000;
    var i_closest;
    for(i=0; i< array.length; i++){
        var m=Math.abs(Math.abs(num)-array[i]);
        if(m<minDiff){ 
            minDiff=m; 
            i_closest=i; 
        }
    }
    return i_closest;
}

function BubbleSort(array){
var array= array;
  for(i=0; i < array.length-1; i++){
        for(j=0; j < array.length-1; j++){
            if(array[j] > array[j+1]){
                dummy = array[j];
                array[j] = array[j+1];
                array[j+1] = dummy;
            }
        }
        j=0
    }
    return array;
}

function MacSED(series_i_max){
    z_max=200
    m_h=1.00784
    maxima = []
    for(i=series_i_max.length-1; i>=0; i--){
        maxima.push(series_i_max[i])
    }
    mass_mat = []
    charge_mat = []
    mean_arr = []
    std_arr = []

    for(z=0; z < z_max; z++){
        mass_mat.push([])
        charge_mat.push([])
        for(i_m=0; i_m < maxima.length; i_m++){
            mass_mat[z].push((z+1+i_m)*maxima[i_m]-(z+1+i_m)*m_h)
            charge_mat[z].push(z+1+i_m)
        }
        mean_arr.push(mean_func(mass_mat[z]))
        std_arr.push(  std_func(mass_mat[z]))
    }
    i_best = closest(std_arr, 0.0)
    charge_arr=[]

    for (i=charge_mat[i_best].length-1; i>=0; i--){
        charge_arr.push(charge_mat[i_best][i])
    } 

    res = [mean_arr[i_best], std_arr[i_best], charge_arr]
    return res

}

function peakprediction(masses,ser_data, act){
    var ppm_data = { "xs":[], "ys":[] }
    var pps_data = { "xs":[], "ys":[] }

    if (act != 'Background'){
        if (ser_data[act]['x_max'].length > 1){
            i_act = 0
            /// Find correct series index for calculing peak prediction
            for (i_ms=0; i_ms < masses['Mass'].length; i_ms++){
                if (masses['Series'][i_ms] == act){
                    i_act=i_ms
                }
            }

            ppm_low = masses['Mass'][i_act] / (ser_data[act]['charge'][0] + 1)
            ppm_upp = masses['Mass'][i_act] / (ser_data[act]['charge'][ser_data[act]['charge'].length -1] - 1)
            pps_std_low = masses['Uncertainty'][i_act] / (ser_data[act]['charge'][0] + 1)
            pps_std_upp = masses['Uncertainty'][i_act] / (ser_data[act]['charge'][ser_data[act]['charge'].length -1] - 1)

            ppm_data['xs'].push([ppm_low, ppm_low])
            ppm_data['xs'].push([ppm_upp, ppm_upp])
            ppm_data['ys'].push([0.0, 100.0])
            ppm_data['ys'].push([0.0, 100.0])

            pps_data['xs'].push([ppm_low - 5 * pps_std_low, ppm_low - 5 * pps_std_low])
            pps_data['xs'].push([ppm_low + 5 * pps_std_low, ppm_low + 5 * pps_std_low])
            pps_data['xs'].push([ppm_upp - 5 * pps_std_upp, ppm_upp - 5 * pps_std_upp])
            pps_data['xs'].push([ppm_upp + 5 * pps_std_upp, ppm_upp + 5 * pps_std_upp])
            pps_data['ys'].push([0.0, 100.0])
            pps_data['ys'].push([0.0, 100.0])
            pps_data['ys'].push([0.0, 100.0])
            pps_data['ys'].push([0.0, 100.0])
        }
    }
    pp_mean_data.data = ppm_data;
    pp_std_data.data  = pps_data;
    console.log('peakprediction ok')
}

function data2sources(names, sele, data){
    sers_mz = {}
    backg_mz = {'Intensity':[], 'mz':[]}
    for (i in names){
        sers_mz[names[i]]  = {'Intensity':[], 'mz':[]}
    }

    low_inds=[]
    upp_inds=[]

    // Put background to intensity 

    for(i_ser in names){
        if (sele[names[i_ser]]['i_low'].length > 0){
            for(i_peak=0; i_peak < sele[names[i_ser]]['i_low'].length; i_peak++){
                overlap_low = 1;
                overlap_upp = 1;

                if(sele[names[i_ser]]['i_low'][i_peak] <= 1){
                    overlap_low = sele[names[i_ser]]['i_low'][i_peak]
                }
                if(sele[names[i_ser]]['i_upp'][i_peak] >= data['Intensity'].length-1){
                    overlap_upp = data['Intensity'].length - sele[names[i_ser]]['i_upp'][i_peak]
                }
                low_inds.push(sele[names[i_ser]]['i_low'][i_peak])
                upp_inds.push(sele[names[i_ser]]['i_upp'][i_peak])
                mz=[]
                Intensity=[]
                for(i_dat=sele[names[i_ser]]['i_low'][i_peak] - overlap_low; i_dat < sele[names[i_ser]]['i_upp'][i_peak] + overlap_upp; i_dat++){
                    mz.push(data['mz'][i_dat])
                    Intensity.push(data['Intensity'][i_dat]) 
                }
                sers_mz[names[i_ser]]['mz'].push(mz)
                sers_mz[names[i_ser]]['Intensity'].push(Intensity)
            }
        }
        series_mz[names[i_ser]].data=sers_mz[names[i_ser]]
    }

    BubbleSort(low_inds)
    BubbleSort(upp_inds)

    if (low_inds[0] > 0){
        mz=[]
        Intensity=[]
        for (j=0; j < low_inds[0]; j++){
            mz.push(data['mz'][j])
            Intensity.push(data['Intensity'][j])
        }
        backg_mz['mz'].push(mz)
        backg_mz['Intensity'].push(Intensity)
    }
    if (upp_inds[upp_inds.length-1] < data['mz'].length){
        mz=[]
        Intensity=[]
        for (j=upp_inds[upp_inds.length-1]; j < data['mz'].length; j++){
            mz.push(data['mz'][j])
            Intensity.push(data['Intensity'][j])
        }
        backg_mz['mz'].push(mz)
        backg_mz['Intensity'].push(Intensity)
    }

    if (low_inds.length > 1){
        for(i=1; i < low_inds.length; i++){
            mz=[]
            Intensity=[]
            for (j=upp_inds[i-1]; j < low_inds[i]; j++){
                mz.push(data['mz'][j])
                Intensity.push(data['Intensity'][j])
            }
            backg_mz['mz'].push(mz)
            backg_mz['Intensity'].push(Intensity)
        }
    }
    if (low_inds.length > 0){
        bg_mz.data=backg_mz;
    }
    console.log('data2sources ok')
}

function data2active_table(new_act_data, aser_data, act){

     /// Fill shown table with active series
    let adat = { 'x_low':[], 'x_upp':[], 'x_max':[], 'max_int':[], 'charge':[]}
    if (act != 'Background'){
        for (i=0; i < new_act_data['x_low'].length; i++){
            adat['x_low'].push(new_act_data['x_low'][i])
            adat['x_upp'].push(new_act_data['x_upp'][i])
            adat['x_max'].push(new_act_data['x_max'][i])
            adat['max_int'].push(new_act_data['max_int'][i])
            adat['charge'].push(new_act_data['charge'][i])  
        }
    }
    
    aser_data.data = adat;
    console.log('data2active_table ok')
}

/// Loops & logics which makes sure overlapping selections are handled cor-
/// rectly (Compare i_low, and i_upp to prev selections and act accordingly)

function sele_logics(i_low, i_upp, sele, names,ser_data, act){
    nopush = false;
    console.log(act)
    if (act != 'Background'){
        for(i_ser in names){
            if (sele[names[i_ser]]['i_low'].length > 0){
                for(i_peak=sele[names[i_ser]]['i_low'].length-1; i_peak >= 0 ; i_peak--){

                    /// Case new selection in an old selection (WORKS)
                    if( i_low > sele[names[i_ser]]['i_low'][i_peak] && i_upp < sele[names[i_ser]]['i_upp'][i_peak] ){
                        nopush = true;
                    }
                    /// Case old selection in new selection
                    else if ( i_low <= sele[names[i_ser]]['i_low'][i_peak] && i_upp >= sele[names[i_ser]]['i_upp'][i_peak] ){
                        sele[names[i_ser]]['i_low'].splice(i_peak,1);
                        sele[names[i_ser]]['i_upp'].splice(i_peak,1);
                        sele[names[i_ser]]['i_max'].splice(i_peak,1);
                        ser_data[names[i_ser]]['x_low'].splice(i_peak,1);
                        ser_data[names[i_ser]]['x_upp'].splice(i_peak,1);
                        ser_data[names[i_ser]]['x_max'].splice(i_peak,1);
                        ser_data[names[i_ser]]['max_int'].splice(i_peak,1);
                    }
                    /// i_low in old selection of same series
                    else if (i_low > sele[names[i_ser]]['i_low'][i_peak] && i_low < sele[names[i_ser]]['i_upp'][i_peak]  
                             && i_upp >= sele[names[i_ser]]['i_upp'][i_peak] && names[i_ser] == act){
                        sele[names[i_ser]]['i_upp'][i_peak]=i_upp;
                        ser_data[names[i_ser]]['x_upp'][i_peak]=data['mz'][i_upp];
                        nopush = true;
                    }
                    /// i_upp in old selection of same series
                    else if (i_upp > sele[names[i_ser]]['i_low'][i_peak] && i_upp < sele[names[i_ser]]['i_upp'][i_peak] 
                             && i_low <= sele[names[i_ser]]['i_low'][i_peak] && names[i_ser] == act){
                        sele[names[i_ser]]['i_low'][i_peak]=i_low;
                        ser_data[names[i_ser]]['x_low'][i_peak]=data['mz'][i_low];
                        nopush = true;
                    }
                    /// i_low in old selection of different series
                    else if (i_low > sele[names[i_ser]]['i_low'][i_peak] && i_low < sele[names[i_ser]]['i_upp'][i_peak] 
                             && i_upp >= sele[names[i_ser]]['i_upp'][i_peak] && names[i_ser] != act){
                        sele[names[i_ser]]['i_upp'][i_peak]=i_low;
                        ser_data[names[i_ser]]['x_upp'][i_peak]=data['mz'][i_low];
                    }
                    /// i_upp in old selection of different series
                    else if (i_upp > sele[names[i_ser]]['i_low'][i_peak] && i_upp < sele[names[i_ser]]['i_upp'][i_peak] 
                             && i_low <= sele[names[i_ser]]['i_low'][i_peak] && names[i_ser] != act){
                        sele[names[i_ser]]['i_low'][i_peak]=i_upp;
                        ser_data[names[i_ser]]['x_low'][i_peak]=data['mz'][i_upp];
                    }
                } 
            }
        }
    }
    else{
        for(i_ser in names){
            if (sele[names[i_ser]]['i_low'].length > 0){
                for(i_peak=0; i_peak < sele[names[i_ser]]['i_low'].length; i_peak++){

                    /// Case new selection in an old selection (WORKS)
                    if( i_low > sele[names[i_ser]]['i_low'][i_peak] && i_upp < sele[names[i_ser]]['i_upp'][i_peak] ){
                        nopush = true;
                    } 
                    /// Case old selection in new selection
                    else if ( i_low <= sele[names[i_ser]]['i_low'][i_peak] && i_upp >= sele[names[i_ser]]['i_upp'][i_peak] ){
                        sele[names[i_ser]]['i_low'].splice(i_peak,1);
                        sele[names[i_ser]]['i_upp'].splice(i_peak,1);
                        sele[names[i_ser]]['i_max'].splice(i_peak,1);
                        ser_data[names[i_ser]]['x_low'].splice(i_peak,1);
                        ser_data[names[i_ser]]['x_upp'].splice(i_peak,1);
                        ser_data[names[i_ser]]['x_max'].splice(i_peak,1);
                        ser_data[names[i_ser]]['max_int'].splice(i_peak,1);
                    }
                    /// i_low in old selection of same series
                    else if (i_low > sele[names[i_ser]]['i_low'][i_peak] && i_low < sele[names[i_ser]]['i_upp'][i_peak] 
                             && i_upp >= sele[names[i_ser]]['i_upp'][i_peak] ){
                        sele[names[i_ser]]['i_upp'][i_peak]=i_low;
                        ser_data[names[i_ser]]['x_upp'][i_peak]=data['mz'][i_low];
                    }
                    /// i_upp in old selection of same series
                    else if (i_upp > sele[names[i_ser]]['i_low'][i_peak] && i_upp < sele[names[i_ser]]['i_upp'][i_peak] 
                             && i_low <= sele[names[i_ser]]['i_low'][i_peak] ){
                        sele[names[i_ser]]['i_low'][i_peak]=i_upp;
                        ser_data[names[i_ser]]['x_low'][i_peak]=data['mz'][i_upp];
                    }
                } 
            }
        }
    nopush = true;
    }
    return nopush;
}

function push_sele(nopush, sele, data, i_low, i_upp, ser_data, act){
/// Append new indices if selection requires it

    if (nopush == false){

        /// Find index of maximum (i.e. closest to 100% intensity in spliced array) and correct for missing indices (i_low)

        var data_to_find_max = [];
        for(i_ind = i_low; i_ind < i_upp; i_ind++){
            data_to_find_max.push(data['Intensity'][i_ind]);
        }

        
        i_max = closest(data_to_find_max, 100.0) + i_low

        sele[act]['i_max'].push(i_max);
        sele[act]['i_upp'].push(i_upp);
        sele[act]['i_low'].push(i_low);

        ser_data[act]['x_max'].push(data['mz'][i_max]);
        ser_data[act]['x_upp'].push(data['mz'][i_upp]);
        ser_data[act]['x_low'].push(data['mz'][i_low]);
        ser_data[act]['max_int'].push(data["Intensity"][i_max]);
         

        if (ser_data[act]['x_max'].length >1 ){
            ser_data[act]['x_max'] = BubbleSort(ser_data[act]['x_max'])
            ser_data[act]['x_upp'] = BubbleSort(ser_data[act]['x_upp'])
            ser_data[act]['x_low'] = BubbleSort(ser_data[act]['x_low'])
            sele[act]['i_max'] = BubbleSort(sele[act]['i_max'])
            sele[act]['i_upp'] = BubbleSort(sele[act]['i_upp'])
            sele[act]['i_low'] = BubbleSort(sele[act]['i_low'])
            x = sele[act]['i_max']
            for(i=0; i < x.length; i++){
                x[i]= data["Intensity"][sele[act]['i_max'][i]]
            }
            ser_data[act]["charge"].push(0);

            
        }
        else{
            ser_data[act]["charge"].push(0);
        }
    }

/// Selection of indices done, emit changes
    for(i_ser in names){
        series_sele[names[i_ser]].change.emit();
        series_data[names[i_ser]].change.emit();
    }
    console.log('push_sele ok')
}

/// Do MacSED

function DoMacSED(masses, ser_data, names, series_masses){
    MacSED_res=[[],[],[]]
    charges={}
    for(i_ser in names){
        if (sele[names[i_ser]]['i_max'].length > 1){
            mass_res=MacSED(ser_data[names[i_ser]]['x_max'])
            charges[names[i_ser]]=ser_data[names[i_ser]]["charge"]
            for(i_peak=0; i_peak < mass_res[2].length; i_peak++){
                charges[names[i_ser]][i_peak]=mass_res[2][i_peak]
            }
            series_data[names[i_ser]].change.emit()
            MacSED_res[0].push(names[i_ser])
            MacSED_res[1].push(mass_res[0])
            MacSED_res[2].push(mass_res[1])

        }
    }

    if (MacSED_res[0].length > 0){
        for (i=0; i < MacSED_res[0].length; i++){
            if(i >= masses["Series"].length){
                masses["Series"].push(MacSED_res[0][i])
                masses["Mass"].push(MacSED_res[1][i])
                masses["Uncertainty"].push(MacSED_res[2][i])
            }
            else{
                masses["Series"][i] = MacSED_res[0][i]
                masses["Mass"][i] = MacSED_res[1][i]
                masses["Uncertainty"][i] = MacSED_res[2][i]
            }
        }
    }
    series_masses.change.emit();
    console.log('MacSED ok')
}
