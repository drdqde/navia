# Data Processing

Data processing in NaViA follows the data processing in UniDEC. The following steps are carried successively.

- Cropping data
- Normalising and thresholding of data
- Baseline substraction
- Smoothing of data
- Renormalising of smoothed data

For normalising the data, the intensity is given as a percentage of the intensity of the most abundant m/z, i.e. all values are divided by maximum intensity and multilpied by 100. If the user gives a threshold, all values below the threshold are set to zero.

Baseline substraction takes place in three flavours: substraction of a set value from all intensities and set to zero if negative. The second option is a linear substraction, where a linear function is fit through the smallest and largest n values respectively and subtracted. The curved substraction follows the the procedure of Massign (see [here](https://pubs.acs.org/doi/abs/10.1021/ac300056a)). 

Smoothing is done by n times application of Gaussian smoothing with a given standard deviation. Renormalisation is necessary because smoothing might change the maximum intensity and is carried out as described above. 

