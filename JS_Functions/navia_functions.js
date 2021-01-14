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

function MacSED(series_i_max, posneg){
    sign = 1.0
    if (posneg.value == "Negative"){
        sign = -1.0
    }
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
            mass_mat[z].push((z+1+i_m)*maxima[i_m]-(z+1+i_m)*m_h*sign)
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

function data2sources(names, sele, data, series_mz){
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
        console.log("There are selections")
        bg_mz.data=backg_mz;
    }
    if (low_inds.length == 0) {
        console.log("In BG mode")
        mz=[]
        Intensity=[]
        len_data=data['mz'].length
        console.log(len_data)
        for(i=0; i<len_data; i++){
            mz.push(data['mz'][i])
            Intensity.push(data['Intensity'][i])
        }
        new_bg = {'mz': [mz], 'Intensity': [Intensity]}
        bg_mz.data = new_bg

    }
    console.log('data2sources ok')
}

function data2active_table(new_act_data, aser_data, act){

     /// Fill shown table with active series
    let adat = { 'x_low':[], 'x_upp':[], 'x_max':[], 'max_int':[], 'charge':[]}
    if ((act != 'Background') && (act != 'Background')){
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

function push_peak_lines(ser_data,peak_data, names){
    for(i_ser in names){
        if (ser_data[names[i_ser]]['x_low'].length > 0){
            peak_xy={'xs':[], 'ys':[]}
            for(i_peak=0; i_peak < ser_data[names[i_ser]]['x_low'].length; i_peak++){
                peak_xy['xs'].push()
                sele[names[i_ser]]['i_low'][i_peak]=closest(data['mz'], ser_data[names[i_ser]]['x_low'][i_peak]);
                sele[names[i_ser]]['i_upp'][i_peak]=closest(data['mz'], ser_data[names[i_ser]]['x_upp'][i_peak]);
                sele[names[i_ser]]['i_max'][i_peak]=closest(data['mz'], ser_data[names[i_ser]]['x_max'][i_peak]);
            }
        }
        series_sele[names[i_ser]].change.emit()
    }
    return;

}

function push_sele(nopush, sele, data, i_low, i_upp, ser_data, act, peak_data){
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
        peak_data[act]['xs'].push([data['mz'][i_max], data['mz'][i_max]])
        peak_data[act]['ys'].push([0.0, data["Intensity"][i_max]])
        console.log(act + ' ' + peak_data[act]['xs']+ ' ' + peak_data[act]['ys'])

         

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
        peak_mz[names[i_ser]].change.emit()
        series_sele[names[i_ser]].change.emit();
        series_data[names[i_ser]].change.emit();
    }
    console.log('push_sele ok')
}

/// Do MacSED

function DoMacSED(masses, ser_data, names, series_masses, posneg, series_colours_DS){
    MacSED_res=[[],[],[],[]]
    charges={}
    for(i_ser in names){
        if (sele[names[i_ser]]['i_max'].length > 1){
            mass_res=MacSED(ser_data[names[i_ser]]['x_max'], posneg)
            charges[names[i_ser]]=ser_data[names[i_ser]]["charge"]
            for(i_peak=0; i_peak < mass_res[2].length; i_peak++){
                charges[names[i_ser]][i_peak]=mass_res[2][i_peak]
            }
            series_data[names[i_ser]].change.emit()
            MacSED_res[0].push(names[i_ser])
            MacSED_res[1].push(mass_res[0])
            MacSED_res[2].push(mass_res[1])
            MacSED_res[3].push(series_colours_DS.data['colour'][i_ser])
        }
    }
    console.log({masses})
    if (MacSED_res[0].length > 0){
        for (i=0; i < MacSED_res[0].length; i++){
            if(i >= masses["Series"].length){
                masses["Series"].push(MacSED_res[0][i])
                masses["Mass"].push(MacSED_res[1][i])
                masses["Uncertainty"].push(MacSED_res[2][i])
                masses["Colour"].push(MacSED_res[3][i])
            }
            else{
                masses["Series"][i] = MacSED_res[0][i]
                masses["Mass"][i] = MacSED_res[1][i]
                masses["Uncertainty"][i] = MacSED_res[2][i]
                masses["Colour"][i] = MacSED_res[3][i]

            }
        }
    }
    series_masses.change.emit();
    console.log('MacSED ok')
}
/*Finding indices for mz values (the martial name refers to a Linear Algebra lecture of Prof Valentin Blomer the program author 
attended as a first year studentat the University of Goettingen. The same Prof Blomer also told his students in the same lecture
series not to implement a BubbleSort algorithm which the author remembered and promptly implemented because of the short lists to 
sort. )*/
function indexkrieg(data, sele, ser_data, names, peak_mz){
    console.log('Indexkrieg eingeleitet.')
    for(i_ser in names){
        peak_xy={'xs':[], 'ys':[]}
        if (sele[names[i_ser]]['i_low'].length > 0){
            for(i_peak=0; i_peak < sele[names[i_ser]]['i_low'].length; i_peak++){
                sele[names[i_ser]]['i_low'][i_peak]=closest(data['mz'], ser_data[names[i_ser]]['x_low'][i_peak]);
                sele[names[i_ser]]['i_upp'][i_peak]=closest(data['mz'], ser_data[names[i_ser]]['x_upp'][i_peak]);
                sele[names[i_ser]]['i_max'][i_peak]=closest(data['mz'], ser_data[names[i_ser]]['x_max'][i_peak]);
                // Now correct intensity bc of smooothing etc
                ser_data[names[i_ser]]['max_int'][i_peak]=data['Intensity'][sele[names[i_ser]]['i_max'][i_peak]];
                peak_xy['xs'].push([ser_data[names[i_ser]]['x_max'][i_peak],ser_data[names[i_ser]]['x_max'][i_peak]])
                peak_xy['ys'].push([0.0,ser_data[names[i_ser]]['max_int'][i_peak]])
            }
        }
        peak_mz[names[i_ser]].data=peak_xy
        series_sele[names[i_ser]].change.emit()
        series_data[names[i_ser]].change.emit()
    }
    return;
}

function cropping_data(data, cropping_min, cropping_max, sele, ser_data, names){
    i_min=closest(data['mz'],cropping_min)
    i_max=closest(data['mz'],cropping_max)
    len_data=data['mz'].length
    console.log(i_min + ' ' + i_max)
    // data['mz'].slice(i_min,i_max)
    // data['Intensity'].slice(i_min,i_max)
    // data['mz'].splice(0,cropping_min)
    // data['Intensity'].splice(0,cropping_min)
    mz=data['mz'].slice(i_min,i_max)
    Intensity=data['Intensity'].slice(i_min,i_max)
    new_data={'mz':mz, 'Intensity':Intensity}
    return new_data
}

function gaussian_filter(data, sigma){
    var array_x=data['mz']
    var array_y=data['Intensity']
    var len_y=array_y.length
    console.log('in gaussian')
    min_dist=10
    for(i=0; i<array_x.length-2; i++){
        dist=array_x[i+1]-array_x[i]
        if(dist < min_dist){
            min_dist=dist
        }
    }
    sigma2div2_pow_neg_1=1/(0.5*sigma*sigma)
    var smooth_array=array_y
    var trunc=Math.ceil(4*sigma/min_dist)    
    for(i=0; i < len_y; i++){
        weights= new Array(2*trunc)
        if((i>trunc) &&  (i < (len_y-1-trunc))){
            arr_ind=0
            sum_arr=0.0
            for(j=i-trunc; j <i+trunc; j++){
                x=array_x[j]-array_x[i]
                gauss_exponent = x*x*sigma2div2_pow_neg_1
                weights[arr_ind] = Math.exp(-gauss_exponent)
                sum_arr+= Math.exp(-gauss_exponent)
                arr_ind+=1
            }
            new_val=0.0
            arr_ind=0
            for(j=i-trunc; j <i+trunc; j++){
                new_val+= array_y[j]*weights[arr_ind]/sum_arr
                arr_ind+=1
            }
            smooth_array[i]=new_val
        }
    
        if (i<trunc){
            new_val=0.0
            arr_ind=0
            sum_arr=0.0

            for(j=0; j <=i+trunc; j++){
                x=array_x[j]-array_x[i]
                gauss_exponent = x*x*sigma2div2_pow_neg_1
                weights[arr_ind] = Math.exp(-gauss_exponent)
                sum_arr+= Math.exp(-gauss_exponent)
                arr_ind+=1
            }
            /// Part on the left which gets reflected
            for(j=0; j <=trunc-i; j++){
                x=array_x[j] + array_x[i] - array_x[0] - array_x[0]
                gauss_exponent = x*x*sigma2div2_pow_neg_1
                weights[arr_ind] = Math.exp(-gauss_exponent)
                sum_arr+= Math.exp(-gauss_exponent)
                arr_ind+=1
            }
            sum_arr_pow_neg_1=1/sum_arr
            arr_ind=0
            for(j=0; j <=i+trunc; j++){
                new_val+= array_y[j]*weights[arr_ind]*sum_arr_pow_neg_1
                arr_ind+=1
            }
            /// Part on the left which gets reflected
            for(j=0; j <=trunc-i; j++){
                new_val+= array_y[j]*weights[arr_ind]*sum_arr_pow_neg_1
                arr_ind+=1
            }
            smooth_array[i]=new_val
        }

        if (i>len_y-1-trunc){
            arr_ind=0
            sum_arr=0.0
            new_val=0.0
            for(j=i-trunc; j < len_y; j++){
                x=array_x[j]-array_x[i]
                gauss_exponent = x*x*sigma2div2_pow_neg_1
                weights[arr_ind] = Math.exp(-gauss_exponent)
                sum_arr+= Math.exp(-gauss_exponent)
                arr_ind+=1

            }
            var last_x2= 2*array_x[len_y-1] /// Multiply klast entry of array_x to get end point
            for(j=len_y-1; j > len_y -trunc; j--){
                x= last_x2  - array_x[j] - array_x[i]
                gauss_exponent = x*x*sigma2div2_pow_neg_1
                weights[arr_ind] = Math.exp(-gauss_exponent)
                sum_arr+= Math.exp(-gauss_exponent)
                arr_ind+=1
            }

            arr_ind=0
            for(j=i-trunc; j <len_y; j++){
                new_val+= array_y[j]*weights[arr_ind]*sum_arr_pow_neg_1
                arr_ind+=1
            }
            for(j=len_y-1; j >len_y-trunc; j--){
                new_val+= array_y[j]*weights[arr_ind]*sum_arr_pow_neg_1
                arr_ind+=1
            }

        smooth_array[i]=new_val
        }
        smooth_array[trunc]=0.5*(smooth_array[trunc+1]+smooth_array[trunc-1])
        smooth_array[array_y.length-1-trunc]=0.5*(smooth_array[array_y.length-trunc]+smooth_array[array_y.length-trunc-2])
        }
        returndata={'mz':array_x, 'Intensity':smooth_array}
    return returndata;
}

function smoothing(data, sigma, n){

    if (sigma !=0.0){
    n_gau=parseInt(n)
    console.log('Applying Gaussian Filter of sigma=' + sigma + ' for ' + n_gau + ' times.')
    for(i=0; i < n_gau; i++){
        data=gaussian_filter(data, sigma)
        console.log('Gaussian Filter successful for ' + i + ' times.')

    }
    }
    return data
    console.log('Smoothing complete')
}

function baseline_substraction(data, substraction_mode, substraction_value){
    console.log('Performing baseline substraction')
    var array_x=data['mz']
    var array_y=data['Intensity'] 

    if (substraction_mode == 'Substract Minimum' && substraction_value > 0.0){
    console.log('Mode: ' + substraction_mode)
    y_min = array_y[closest(array_y, 0.0)]
    console.log('Minimum: ' + y_min + ' %.')
    for(var i=0; i< array_y.length; i++){
        array_y[i]-=y_min
    }
    }

    if (substraction_mode == 'Substract Line' && substraction_value > 0.0){
        console.log('Mode: ' + substraction_mode)
        var n_points=Math.ceil(Number(substraction_value))
        console.log(n_points)
        var frontpart=0.0
        var backpart =0.0
        for(var i=0; i< n_points; i++){
            frontpart+=array_y[i]
            backpart +=array_y[array_y.length-1-i]
            console.log(frontpart + ' ' + backpart)

        }
        frontpart = frontpart / n_points
        backpart  =  backpart / n_points
        slope = (backpart - frontpart)/ (array_x[array_x.length-1] - array_x[0])

        console.log(frontpart + ' ' + backpart + ' ' + slope)

        for(var i=0; i < array_y.length; i++){
            array_y[i]-=slope * (array_x[i] - array_x[0]) + frontpart
        }

    }

    if (substraction_mode == 'Substract Curved' && substraction_value > 0.0){

        /* 
        Taken from Massign Paper (and UniDEC)
        First creates an array that matches the data but has the minimum value within a window of +/- buff.
        Then, smooths the minimum array with a Gaussian filter of width buff * 2 to form the background array.
        Finally, subtracts the background array from the data intensities.
        :param datatop: Data array
        :param buff: Width parameter
        :return: Subtracted data
        """
        length = len(datatop)
        mins = list(range(0, length))
        indexes = list(range(0, length))
        for i in indexes:
            mins[i] = np.amin(datatop[int(max([0, i - abs(buff)])):int(min([i + abs(buff), length])), 1])
        background = filt.gaussian_filter(mins, abs(buff) * 2)
        datatop[:, 1] = datatop[:, 1] - background
        return datatop
        */

        console.log('Mode: ' + substraction_mode)
        var n_points=Math.ceil(Number(substraction_value))
        var len_y=array_y.length
        var mins= []
        for(i=0; i < len_y; i++){
            low_ind=Math.max(0, i-n_points)
            upp_ind=Math.min(len_y, i+n_points)
            deduct_min=100.0
            for (j=low_ind; j< upp_ind; j++){
                if(deduct_min > array_y[j]){
                    deduct_min=array_y[j]
                }
            }
            // console.log(low_ind + ' ' + upp_ind + ' ' + deduct_min)
            mins.push(deduct_min)
        }
        console.log('Array of minima created.')
        temp_data={'mz':array_x, 'Intensity':mins}
        temp_data=gaussian_filter(temp_data,2.0*substraction_value, 1)
        mins=temp_data['Intensity']
        console.log('Array of minima smoothened.')
        for(var i=0; i< len_y; i++){
            array_y[i]-=mins[i]
        }
        console.log('Mimima from data deducted.')

    }


    returndata={'mz':array_x, 'Intensity':array_y}
    return returndata;
    console.log("Baseline substraction complete.")
}

function normalising_and_thresholding(data,intensity_threshold, sele){
    var array_x=data['mz']
    var array_y=data['Intensity']
    ///Normailisation
    y_max = array_y[closest(array_y, 1000.0)]
    var mult = 100.0/y_max
    for (i=0; i< array_y.length; i++){
        array_y[i]=array_y[i]*mult
    }
    console.log('Normalisation complete')
    ///Thresholding
    console.log('Thresholding value: ' + intensity_threshold + ' %.')    
    for (var i = array_y.length - 1; i >= 0; i--) {
        if (array_y[i] < intensity_threshold) {
            array_y[i] = 0.0   
        }    
    }
    returndata={'mz':array_x, 'Intensity':array_y}
    return returndata;
    console.log("Thresholding complete.")
}

function data_processing(data, dtp, sele, ser_data, names, peak_mz){
    var crop_dat=cropping_data(data, dtp['mz_low'][0], dtp['mz_upp'][0], sele, ser_data, names)
    var nat_data=normalising_and_thresholding(crop_dat,dtp['intensity_threshold'][0])
    var bld_data=baseline_substraction(nat_data, dtp['sub_mode'][0], dtp['sub_value'][0])
    var smo_data=smoothing(bld_data, dtp['gau_sigma'][0],dtp['gau_rep'][0])
    var final_data=normalising_and_thresholding(smo_data,0.0) // Renormailising
    indexkrieg(final_data, sele, ser_data, names, peak_mz)
    return final_data
}








