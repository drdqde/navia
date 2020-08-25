**Format of NaViA sessions:**

Navia sessions are stored in a JSON file and are thus readable by many programming languages including python. Generally, the properties of NaViA are stored as dictionaries. 

The following properties are available:

'raw_data': a dictionary with 'm/z' and 'Intensity' as keys, each comprising a list of floats.

'ser_dict': a dictionary comprising of names of the series (naming is not implemented in the current version of NaViA but planned for future release)

'masses': a dictionary with 'Series', 'Mass', 'Uncertainty' and 'Colour' as keys. Colour refers to the line colour of the series in the session.

'sele': nested dictionary for all 20 possible series containing lists of intergers for lower, higher and maximum intensity  m/z indices  ('i_low', 'i_upp' and 'i_max' respectively)

'ser_data': the m/z corresponding dictionary to 'sele'. contains ('x_low', 'x_upp', 'max_int' and 'x_max') for mz-values and the intensity of the maxima or assigned peak if corrected.  

'charge_sign': either 'positive' or 'negative' depending on instrument mode. 

'subunits': contains lists of properties of subunits of complex ('mass', 'min', 'max', 'stride', 'name').

'stoichiometry': lists of properties of complex stoichiometry to measured masses for NaViA.

'dtp': lists of properties of data processing. 

'comment': string of the comment field.