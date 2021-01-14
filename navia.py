import bokeh
import pandas as pd
import numpy as np
import os
from bokeh import events
from bokeh.io import show
from bokeh.plotting import figure, output_file, ColumnDataSource
from bokeh.models.widgets import ColorPicker, Select, Toggle, Dropdown, DataTable, NumberFormatter, TableColumn,TextInput, Button, TextAreaInput, Slider, Div, RangeSlider, HTMLTemplateFormatter
from bokeh.layouts import Column, Row, gridplot, Spacer
from bokeh.models import HoverTool, CustomJS, BoxSelectTool, Panel, Tabs, Span, AjaxDataSource, ToolbarBox, Toolbar, Legend, LegendItem, PanTool, TapTool
from bokeh.models.glyphs import MultiLine
from bokeh.events import ButtonClick, SelectionGeometry, Press, Tap
from bokeh.util.compiler import JavaScript
import imageio as iio

output_file('index.html', title='Navia Beta v 0.10')

# Usual format 1366x768
plot_canvas = figure(plot_width=1366, plot_height=int(768/1), output_backend='canvas',
           x_axis_label='m/z ', y_axis_label='Rel. Abundance  [%]',
           tools=['box_zoom, reset, pan, wheel_zoom'],hidpi=True,
           toolbar_location='right')
plot_canvas.background_fill_color=None
plot_canvas.border_fill_color=None

svg_canvas = figure(
    plot_width=1366, plot_height=768,
    output_backend='svg',
    x_axis_label='m/z ', y_axis_label='Rel. Abundance  [%]',
    tools=['save'],
    hidpi=False, visible=True
)
highres_canvas = figure(plot_width=3840, plot_height=int(2160/1), output_backend='canvas',
           x_axis_label='m/z ', y_axis_label='Rel. Abundance  [%]',
           tools=['save'],
           toolbar_location='right', visible=True)
highres_canvas.axis.axis_label_text_font_size='40px'
highres_canvas.axis.major_label_text_font_size='32px'
highres_canvas.axis.axis_line_width=3
highres_canvas.axis.axis_line_width=3
highres_canvas.axis.major_tick_line_width=3
highres_canvas.axis.minor_tick_line_width=3
highres_canvas.axis.major_tick_out=14
highres_canvas.axis.minor_tick_out=10
highres_canvas.grid.grid_line_width=2
highres_canvas.background_fill_color=None 
highres_canvas.border_fill_color=None

legend = Legend(items=[])
plot_canvas.add_layout(legend)

# Defining colours
n_series = 20
series_colours = [ bokeh.palettes.Category20_20[int((2*i%20+np.floor(i/10)))] for i in range(20)]
series_cols = {}
series_data = {}
series_sele = {}
series_mz   = {}
series_mz4k = {}
series_mzsvg= {}
peak_mz   = {}
peak_mz4k   = {}
peak_mzsvg   = {}

series_names = ['Series {:d}'.format(i_series + 1) for i_series in range(n_series)]

for i_series in range(len(series_names)):
    series_cols[series_names[i_series]] = series_colours[i_series]
series_cols['Background']='#000000'

for i_series in series_names:
    series_data[i_series] = AjaxDataSource(data=dict(x_low=[], x_upp=[],  x_max=[],max_int=[], charge=[]))#
    series_sele[i_series] = AjaxDataSource(data=dict(i_low=[], i_upp=[], i_max=[]))
    series_mz[i_series]   = AjaxDataSource(data=dict(Intensity=[], mz=[]))
    series_mz4k[i_series] = AjaxDataSource(data=dict(Intensity=[], mz=[]))
    series_mzsvg[i_series]= AjaxDataSource(data=dict(Intensity=[], mz=[]))
    peak_mz[i_series]        = AjaxDataSource(data=dict(xs=[], ys=[]))
    peak_mz4k[i_series]      = AjaxDataSource(data=dict(xs=[], ys=[]))
    peak_mzsvg[i_series]     = AjaxDataSource(data=dict(xs=[], ys=[]))

series_masses = AjaxDataSource(data=dict(Series=[], Mass=[], Uncertainty=[], Colour=[]))
aser_data = AjaxDataSource(data=dict(x_low=[], x_upp=[],  x_max=[],max_int=[], charge=[]))
series_dict = AjaxDataSource(data=dict(series=series_names, names=series_names))

groel_data=pd.read_csv('Testdata/siyun_groel.txt', skiprows=10, delimiter='\t')
# groel_data.columns.values=[ 'Intensity']
groel_data.rename(columns={'1980.151514':'mz', '0.000000':'Intensity'}, inplace=True)
# print(groel_data.columns.values)
GroEL_mz = AjaxDataSource(data=groel_data)

raw_mz = AjaxDataSource(data=dict(Intensity=[], mz=[]))
proc_mz = AjaxDataSource(data=dict(Intensity=[], mz=[])) 
bg_mz = AjaxDataSource(data=dict(Intensity=[], mz=[]))
bg_mz4k = AjaxDataSource(data=dict(Intensity=[], mz=[]))
bg_mzsvg = AjaxDataSource(data=dict(Intensity=[], mz=[]))
# Define Dataprocessing parameters in DS to make them easier to access etc. 
DataProcessingParameters= AjaxDataSource(data=dict(mz_low=[0.0], mz_upp=[20000.0], gau_sigma=[0.0], gau_rep=[1], intensity_threshold=[0.0], sub_mode=['Substract Minimum'], sub_value=[0.0]))
series_colours_DS= AjaxDataSource(data=dict(series=[x for x in series_cols], colour=[series_cols[x] for x in series_cols]))

sel_lines={}
sel_lines4k={}
sel_linessvg={}
peak_lines={}
peak_lines4k={}
peak_linessvg={}
for i_series in series_cols.keys():
    sel_lines[i_series] = MultiLine(xs='mz', ys='Intensity', line_color=series_cols[i_series], name=i_series)
    sel_lines4k[i_series] = MultiLine(xs='mz', ys='Intensity', line_color=series_cols[i_series], name=i_series, line_width=4)
    sel_linessvg[i_series] = MultiLine(xs='mz', ys='Intensity', line_color=series_cols[i_series], name=i_series)
    peak_lines[i_series] = MultiLine(xs='xs', ys='ys', line_color=series_cols[i_series], line_alpha=0.5)
    peak_lines4k[i_series] = MultiLine(xs='xs', ys='ys', line_color=series_cols[i_series], line_width=4, line_alpha=0.5)
    peak_linessvg[i_series] = MultiLine(xs='xs', ys='ys', line_color=series_cols[i_series], line_alpha=0.5)
sel_lines['Background'] = MultiLine(xs='mz', ys='Intensity', line_color=series_cols['Background'], name='Background')
sel_lines4k['Background'] = MultiLine(xs='mz', ys='Intensity', line_color=series_cols['Background'], name='Background', line_width=4)
sel_linessvg['Background'] = MultiLine(xs='mz', ys='Intensity', line_color=series_cols['Background'], name='Background')


# Peak prediction peaks
pp_mean_data = AjaxDataSource(data=dict(xs=[], ys=[]))
pp_std_data  = AjaxDataSource(data=dict(xs=[], ys=[]))

pp_mean = MultiLine(xs="xs", ys="ys", name='pp_mean', line_color=bokeh.palettes.Category20_20[0], line_width=2, line_alpha=0.5)
pp_std = MultiLine(xs="xs", ys="ys", name='pp_std', line_color=bokeh.palettes.Category20_20[0], line_dash='dashed',line_width=2, line_alpha=0.5)


# Selection and show of colour of Active Series

ser_act_menu=[('Background (Eraser)', 'Background'), ('New Series', 'New Series')]
# ser_act = Select(value='Background', options=['Background', 'New Series'], width=150, height=30)



ser_act = Dropdown(label="Create Series", value='Background', menu=ser_act_menu, width=140, height=30)
 
col_cb = CustomJS(args=dict(series_data=series_data, pp_mean_data=pp_mean_data, pp_std_data=pp_std_data, plot_canvas=plot_canvas, peak_lines=peak_lines, peak_lines4k=peak_lines4k, series_colours_DS=series_colours_DS, series_names=series_names, sel_lines=sel_lines, ser_act=ser_act, pp_mean= pp_mean, pp_std=pp_std, series_masses=series_masses)
    , code=open(os.path.join(os.getcwd(), 'JS_Functions', "navia_functions.js")).read() + open(os.path.join(os.getcwd(), 'JS_Functions', "col_cb.js")).read())

col = ColorPicker(color='black', width=50, height=30, disabled=False, callback=col_cb)
ser_match = Select(value='', options=[], title='Stoich. Calculation Series:', width=150, height=45)

ser_callback = CustomJS(args=dict(series_colours_DS=series_colours_DS, series_names=series_names, sel_lines=sel_lines, sel_lines4k=sel_lines4k, peak_lines=peak_lines,peak_lines4k=peak_lines4k, col=col, aser_data=aser_data, ser_match=ser_match,
                        series_data=series_data, pp_mean= pp_mean, pp_std=pp_std, pp_mean_data=pp_mean_data, pp_std_data=pp_std_data, series_masses=series_masses, plot_canvas=plot_canvas), 
                        code=open(os.path.join(os.getcwd(), 'JS_Functions', "navia_functions.js")).read() + open(os.path.join(os.getcwd(), 'JS_Functions', "ser_cb.js")).read())



# Additional Buttons

menu = [("Load spectrum (txt file)", "load_file"), ("Load spectrum (clipboard)", "load_clip"), ("Load example (GroEL)", "load_groel"), None, ("Save session", "save_sess"), ("Load session", "load_sess"), None, ("Save Peaks Table", "save_peaks"), ("Save Masses Table", "save_masses"),None, ("Load Subunit table", "load_SU"), ("Save Subunit table", "save_SU"), None, ("Save Stoichiometry Table", "save_mm")]#, None, ("Load subunit table", "load_suta")]


# Further options to implement ("Export SVG","expo_svg"), ("Export high-res PNG","expo_svg")]

ser_act.js_on_change('value', ser_callback)
posneg_menu=[('Positive Mode','Positive'), ('Negative Mode', 'Negative')]
posneg = Dropdown(menu=posneg_menu, value='Positive', label='Instrument Mode: +' , width=160, height=30)
graph_opt = Toggle(label='Figure', width=110, height=30)

help_alert = CustomJS(args=dict(), code=open(os.path.join(os.getcwd(), 'JS_Functions', "help_cb.js")).read())

mass_finder = Toggle(label='Mass Finder', width=110, height=30)
mass_match = Toggle(label='Complex Stoichiometry', width=150, height=30)
dt_button = Toggle(label='Data Processing', width=110, height=30)
help_button = Button(label='Help', width=90, height=30)
help_button.js_on_event(ButtonClick, help_alert)


sele_cb = CustomJS(args=dict(peak_mz=peak_mz, bg_mz=bg_mz, proc_mz=proc_mz, ser_act=ser_act, series_sele=series_sele, series_data=series_data, series_mz=series_mz,
                         series_names=series_names, series_masses=series_masses, pp_mean_data=pp_mean_data, pp_std_data=pp_std_data, aser_data=aser_data, posneg=posneg, series_colours_DS=series_colours_DS), code=open(os.path.join(os.getcwd(), 'JS_Functions', "navia_functions.js")).read()
                    + open(os.path.join(os.getcwd(), 'JS_Functions', "sele_cb.js")).read())

correct_cb = CustomJS(args=dict(series_colours_DS=series_colours_DS, peak_mz=peak_mz, bg_mz=bg_mz, proc_mz=proc_mz, ser_act=ser_act, series_sele=series_sele, series_data=series_data, series_mz=series_mz,
                         series_names=series_names, series_masses=series_masses, pp_mean_data=pp_mean_data, pp_std_data=pp_std_data, aser_data=aser_data, posneg=posneg), code=open(os.path.join(os.getcwd(), 'JS_Functions', "navia_functions.js")).read()
                    + open(os.path.join(os.getcwd(), 'JS_Functions', "correct_cb.js")).read())
posneg_cb = CustomJS(args=dict(series_colours_DS=series_colours_DS, peak_mz=peak_mz, bg_mz=bg_mz, proc_mz=proc_mz, ser_act=ser_act, series_sele=series_sele, series_data=series_data, series_mz=series_mz,
                         series_names=series_names, series_masses=series_masses, pp_mean_data=pp_mean_data, pp_std_data=pp_std_data, aser_data=aser_data, posneg=posneg), code=open(os.path.join(os.getcwd(), 'JS_Functions', "navia_functions.js")).read()
                    + open(os.path.join(os.getcwd(), 'JS_Functions', "posneg_cb.js")).read())
posneg.js_on_change('value', posneg_cb)

class DQTapTool(TapTool):
    # language=JavaScript
    __implementation__ = JavaScript("""
        
        import {TapTool} from "models/tools";
        
        export class DQTapTool extends TapTool {
            static __name__ = 'DQTapTool'
            get tooltip() {
                return 'Correct Peak.  \\n (Tap on data point to set value for mass calculation of respective to tapped m/z.)';
            }
        }    
    """)


class RenamedBoxSelectTool(BoxSelectTool):
    # language=JavaScript
    __implementation__ = JavaScript("""
        
        import {BoxSelectTool} from "models/tools";
        
        export class RenamedBoxSelectTool extends BoxSelectTool {
            static __name__ = 'RenamedBoxSelectTool'
            get tooltip() {
                return 'Mark Peak \\n (Press left mouse button and hold to select range.)';
            }
        }    
    """)

box_selectdq = RenamedBoxSelectTool(dimensions='width', callback=sele_cb, name='Select Peak')
tapdq = DQTapTool(name='Select Peak', callback=correct_cb)
# tapdq.js_on_event(Tap, correct_cb)

# Add lines to graph
plot_canvas.add_glyph(bg_mz,sel_lines['Background'])
highres_canvas.add_glyph(bg_mz4k,sel_lines4k['Background'])
svg_canvas.add_glyph(bg_mzsvg,sel_linessvg['Background'])


ppml = plot_canvas.add_glyph(pp_mean_data, pp_mean, visible=False)
ppsl = plot_canvas.add_glyph(pp_std_data , pp_std , visible=False)
plot_canvas.toolbar.active_tap=None
plot_canvas.toolbar.active_drag=box_selectdq

pp = Toggle(label="Predict adjecent peaks", width=150, height=30)
pp.js_link('active', ppml, 'visible')
pp.js_link('active', ppsl, 'visible')
# pl.js_link('active', plpc, 'visible')
# pl.js_link('active', pl4k, 'visible')

# Defining Mass Finder
mass_finder_line= MultiLine(xs="xs", ys="ys", line_color="#002147", line_width=2, line_alpha=0.5)
mass_finder_data=AjaxDataSource(data=dict(xs=[], ys=[]))
mfl = plot_canvas.add_glyph(mass_finder_data, mass_finder_line, visible=False)



# Define Hovertool
    
hover = HoverTool()
hover.tooltips = [("m/z", "$x{5.2f}"), ("Abundance", "$y %")]
plot_canvas.add_tools(hover)
plot_canvas.add_tools(box_selectdq)
plot_canvas.add_tools(tapdq)

columns = [
        TableColumn(field="x_low", title="Lower m/z", formatter=NumberFormatter(format='0,0.00')),
        TableColumn(field="x_upp", title="Upper m/z", formatter=NumberFormatter(format='0,0.00')),
        TableColumn(field="x_max", title="mz of Max", formatter=NumberFormatter(format='0,0.00')),
        TableColumn(field="max_int", title="Intensity of Maximum", formatter=NumberFormatter(format='0,0.00')),
        TableColumn(field="charge", title="Charge"),
    ]

showtab = DataTable(source=aser_data, name=i_series, columns=columns, width=580, height=300, editable=False, index_position=None)
# show_tab_cb=CustomJS(args=dict(peak_mz=peak_mz, bg_mz=bg_mz, proc_mz=proc_mz, ser_act=ser_act, series_sele=series_sele, series_data=series_data, series_mz=series_mz,
#                          series_names=series_names, series_masses=series_masses, pp_mean_data=pp_mean_data, pp_std_data=pp_std_data, aser_data=aser_data, posneg=posneg), code=open(os.path.join(os.getcwd(), 'JS_Functions', "navia_functions.js")).read()
#                     + open(os.path.join(os.getcwd(), 'JS_Functions', "showtab_cb.js")).read())
# aser_data.js_on_change('patching', show_tab_cb)
template="""
            <div style="background:<%= 
                (function colorfromint(){
                    return(Colour)
                    }()) %>; 
                color: <%= 
                    (function colorfromint(){
                        return(Colour)
                        }()) %>;"> 
                <%= value %>
                </font>
            </div>
            """
formatter =  HTMLTemplateFormatter(template=template)

columns_mass_table = [
        TableColumn(field="Colour", title="Colour", formatter=formatter, width=120),
        TableColumn(field="Series", title="Series"),
        TableColumn(field="Mass", title="Mass", formatter=NumberFormatter(format='0,0.00')),
        TableColumn(field="Uncertainty", title="Uncertainty", formatter=NumberFormatter(format='0,0.00')),
    ]
masses_table = DataTable(source=series_masses, name='Mass table', columns=columns_mass_table, width=370, height=300, index_position=None, editable=False)

n_complexes = 10

SU_act = AjaxDataSource(dict(name=[],mass=[],min=[],max=[], stride=[]))

columns_complex_table = [
        TableColumn(field="name", title="Subunit", width=250),
        TableColumn(field="mass", title="Mass", formatter=NumberFormatter(format='0,0.00'), width=100),
        TableColumn(field="min", title="Min. #", formatter=NumberFormatter(format='0,0'), width=50),
        TableColumn(field="max", title="Max. #", formatter=NumberFormatter(format='0,0'), width=50),
        TableColumn(field="stride", title="Stride", formatter=NumberFormatter(format='0,0'), width=50),
    ]
complex_table = DataTable(source=SU_act, name='Complex table', columns=columns_complex_table, width=450, height=280, index_position=None, editable=True)

# Define buttons for adding subunits
Add_SU_cb=CustomJS(args=dict(SU_act=SU_act), code=open(os.path.join(os.getcwd(), 'JS_Functions', "Add_SU_cb.js")).read() )
Del_SU_cb=CustomJS(args=dict(SU_act=SU_act), code=open(os.path.join(os.getcwd(), 'JS_Functions', "del_SU_cb.js")).read() )

SU_add_button=Button(label='Add subunit', width=120, height=30, button_type='success')
SU_del_button=Button(label='Delete subunit', width=120, height=30, button_type='danger')

SU_add_button.js_on_event(ButtonClick, Add_SU_cb)
SU_del_button.js_on_event(ButtonClick, Del_SU_cb)

comment_window = TextAreaInput(value="Add comments here", width = 340, height= 280)


stoich = AjaxDataSource(dict(stoichiometry=[], mass=[], mass_diff=[]))
diff_match   = TextInput(value= str(1000.0), title='Allowed ΔMass',  disabled=False, width=150, height=50)

columns_match_table = [
        TableColumn(field="stoichiometry", title="Stoichiometry"),
        TableColumn(field="mass", title="Mass of Combination", formatter=NumberFormatter(format='0,0.00')),
        TableColumn(field="mass_diff", title="Difference to Measured Mass", formatter=NumberFormatter(format='0,0.00')),
    ]



# Further options to implement ("Export SVG","expo_svg"), ("Export high-res PNG","expo_svg")]
match_table = DataTable(source=stoich, name='Complex table', columns=columns_match_table, width=534, height=280, index_position=None)

mass_match_cb=CustomJS(args=dict(ser_match=ser_match, diff_match=diff_match,series_masses=series_masses, stoich=stoich, SU_act=SU_act), code=open(os.path.join(os.getcwd(), 'JS_Functions', "MassMatching_cb.js")).read())
mass_match_button=Button(label='Stoichiometry', width=150, height=30, button_type='success')
mass_match_button.js_on_event(ButtonClick, mass_match_cb)

cropping_slider = RangeSlider(start=0.0, end=100000.0, value=(0.0,100000.0), name='cropping_slider', step=100, width= 150, height=30)
gaussian_smooth = Slider(value=0.0, start=0, end=50, step=1, name='gau_sigma', width=150, height=30) #TextInput(value=str(0.0),   disabled=False, width=100, height=30)
n_smooth = Slider(value=1, start=0, end=10, step=1, name='gau_rep', width=150, height=30)
intensity_threshold = Slider(value=0.0, start=0, end=100, step=0.1, name='intensity_threshold', width=150, height=30)#TextInput(value=str(0.0), disabled=False, width=100, height=30)
substract = Slider(value=0.0, start=0, end=100, step=1, name='sub_value', width=150, height=30) #TextInput(value=str(0.0),    disabled=False, width=100, height=30)
# adduct_mass = TextInput(value=str(0.0),    disabled=False, width=100, height=30)
# data_reduction = TextInput(value=str(0.0),    disabled=False, width=100, height=30)

toggle_cb=CustomJS(code=''' if (cb_obj.active == true) {cb_obj.label='on'} else {cb_obj.label='off'} ''')

### MASS FINDER ###

mass_finder_header = Div(text= " <h2>Mass Finder</h2>", height=45, width=400 )
# mass_finder_range_text = Div(text= " Range mz:", width= 150, height=30 )
mass_finder_range_slider = RangeSlider(start=1.0, end=500.0, value=(1.0,50.0), title='Charge range:',name='mass_finder_range_slider', step=1, width= 250, height=30)
# mass_finder_mass_text = Div(text= " Mass of Complex (kDa):", width= 150, height=30 )
mass_finder_mass = Slider(value=100, start=0.0, end=1000.0, step=10.0, title='Mass of Complex (kDa)',name='gau_sigma', width=250, height=30)

mass_finder_exact_mass_text = Div(text= "Enter excact Mass (Da)", width= 150, height=30 )
mass_finder_exact_mass_sele = TextInput(value=str(mass_finder_mass.value*1000), disabled=False, width=100, height=30)

mass_finder_line_text = Div(text= "Show mz prediction", width= 150, height=30 )
mass_finder_line_sele = Toggle(label='off', active=False, width=100, height=30, callback=toggle_cb)

mass_finder_cb =CustomJS(args=dict(mass_finder_line_sele=mass_finder_line_sele, raw_mz=raw_mz, mass_finder_data=mass_finder_data, mass_finder_exact_mass_sele=mass_finder_exact_mass_sele, mass_finder_mass=mass_finder_mass, mass_finder_range_slider=mass_finder_range_slider, mfl=mfl), code=open(os.path.join(os.getcwd(), 'JS_Functions', "mass_finder_cb.js")).read())
mass_finder_exact_cb =CustomJS(args=dict(mass_finder_line_sele=mass_finder_line_sele, mass_finder_exact_mass_sele=mass_finder_exact_mass_sele, mass_finder_mass=mass_finder_mass), code=open(os.path.join(os.getcwd(), 'JS_Functions', "mass_finder_exact_cb.js")).read())
mass_finder_exact_mass_sele.js_on_change('value', mass_finder_exact_cb)

mass_finder_column=Column(mass_finder_header,mass_finder_mass, mass_finder_range_slider, Row(mass_finder_exact_mass_text,mass_finder_exact_mass_sele), Row(mass_finder_line_text, mass_finder_line_sele), visible=False)
mass_finder.js_link('active', mass_finder_column, 'visible')
mass_finder_line_sele.js_link('active', mfl, 'visible')
mass_finder_mass.js_on_change('value', mass_finder_cb)
mass_finder_line_sele.js_on_change('active', mass_finder_cb)
mass_finder_range_slider.js_on_change('value',mass_finder_cb)
### DATA PROCESSING ###

cropping = Div(text= " Range mz:", width= 150, height=30 )
# crop_max = Div(text= " ", width= 150, height=30 )
gau_name = Div(text= " Gaussian Smoothing:", width= 150, height=30 )
n_smooth_name = Div(text= " Repeats of Smoothing:", width= 150, height=30 )
# bin_name = Div(text= " Bin Every:", width= 150, height=30 )
int_name = Div(text= " Intensity Threshold (%)", width= 150, height=30 )
sub_name = Select(options=['Substract Minimum', 'Substract Line', 'Substract Curved'], name='sub_mode', value='Substract Minimum', width= 150, height=30 )
# add_name = Div(text= " Adduct Mass (Da)", width= 150, height=30 )
# dat_name = Div(text= " Data Reduction (%)", width= 150, height=30 )
#pro_name = Div(text= " bla", width= 150, height=30 )
dt_name  = Div(text= " <h2>Data Processing</h2>", height=45 )
dtp_update=CustomJS(args=dict(DataProcessingParameters=DataProcessingParameters), code=open(os.path.join(os.getcwd(), 'JS_Functions', "DataProcessingParameters_update_cb.js")).read())

cropping_slider.js_on_change('value', dtp_update)
n_smooth.js_on_change('value', dtp_update)
gaussian_smooth.js_on_change('value', dtp_update)
intensity_threshold.js_on_change('value', dtp_update)
substract.js_on_change('value', dtp_update)
sub_name.js_on_change('value', dtp_update)


processing_cb=CustomJS(args=dict(peak_mz=peak_mz, bg_mz=bg_mz, raw_mz=raw_mz, proc_mz=proc_mz, DataProcessingParameters=DataProcessingParameters, series_data=series_data, series_sele=series_sele, series_names=series_names, series_mz=series_mz), code=open(os.path.join(os.getcwd(), 'JS_Functions', "navia_functions.js")).read() + open(os.path.join(os.getcwd(), 'JS_Functions', "data_processing_cb.js")).read())
process_data=Button(label='Process Data', width=100, height=30, button_type='success', callback=processing_cb)
reset_cb=CustomJS(args=dict(process_data=process_data, peak_mz=peak_mz, bg_mz=bg_mz, raw_mz=raw_mz, proc_mz=proc_mz, series_data=series_data, series_sele=series_sele, series_names=series_names, series_mz=series_mz), code=open(os.path.join(os.getcwd(), 'JS_Functions', "navia_functions.js")).read() + open(os.path.join(os.getcwd(), 'JS_Functions', "reset_cb.js")).read())
reset_data=Button(label='Reset Processing', width=80, height=30, button_type='danger', callback=reset_cb)
dt_names = Column(cropping, gau_name, n_smooth_name ,int_name, sub_name, reset_data)#, pro_name)

dt_inp=Column(cropping_slider, gaussian_smooth, n_smooth, intensity_threshold, substract, process_data)

grid_text = Div(text= " Show Grid", width= 150, height=30 )
grid_sele = Toggle(label='on', active=True, width=100, height=30, callback=toggle_cb)
for x_grid_line in plot_canvas.xgrid:
  grid_sele.js_link('active', x_grid_line, 'visible')
for y_grid_line in plot_canvas.ygrid:
  grid_sele.js_link('active', y_grid_line, 'visible')
for x_grid_line in highres_canvas.xgrid:
  grid_sele.js_link('active', x_grid_line, 'visible')
for y_grid_line in highres_canvas.ygrid:
  grid_sele.js_link('active', y_grid_line, 'visible')
grid_sele.js_link('active', plot_canvas, 'outline_line_alpha')
grid_sele.js_link('active', highres_canvas, 'outline_line_alpha')

labels_text = Div(text= " Show labels", width= 150, height=30 )
labels_sele = Toggle(label='on', active=True, width=100, height=30, callback=toggle_cb)


ticks_text = Div(text= " Show Ticks", width= 150, height=30 )
ticks_sele = Toggle(label='on', active=True, width=100, height=30, callback=toggle_cb)
axes_text = Div(text= " Show Axes", width= 150, height=30 )
axes_sele = Toggle(label='on', active=True, width=100, height=30, callback=toggle_cb)
for item in plot_canvas.axis + highres_canvas.axis + svg_canvas.axis:
    labels_sele.js_link('active', item ,'axis_label_text_alpha')
    labels_sele.js_link('active', item ,'major_label_text_alpha')
    ticks_sele.js_link('active', item ,'major_tick_line_alpha')
    ticks_sele.js_link('active', item ,'minor_tick_line_alpha')
for item in plot_canvas.axis + highres_canvas.axis + svg_canvas.axis:
  axes_sele.js_link('active', item ,'axis_line_alpha')
  fig_text = Div(text= "Note: 4K/SVG figure creation on Safari on MacOS is slow and might crash. Please save high-resolution PNG figures in a different browser. SVG creation takes a few seconds.\n", width= 300, height=70 )
peakmz_text = Div(text= " Show mz of Peaks", width= 150, height=30 )
peakmz_sele = Toggle(label='off', active=False, width=100, height=30, callback=toggle_cb)

plpc={}
pl4k={}
plsvg={}

for i_series in series_names:
    plot_canvas.add_glyph(series_mz[i_series],sel_lines[i_series])
    highres_canvas.add_glyph(series_mz4k[i_series], sel_lines4k[i_series])
    svg_canvas.add_glyph(series_mzsvg[i_series], sel_linessvg[i_series])
    plpc[i_series]=plot_canvas.add_glyph(peak_mz[i_series], peak_lines[i_series], visible=False)
    pl4k[i_series]=highres_canvas.add_glyph(peak_mz4k[i_series], peak_lines4k[i_series], visible=False)
    plsvg[i_series]=svg_canvas.add_glyph(peak_mzsvg[i_series], peak_lines[i_series], visible=False)
    peakmz_sele.js_link('active', plpc[i_series], 'visible')
    peakmz_sele.js_link('active', pl4k[i_series], 'visible')
    peakmz_sele.js_link('active', plsvg[i_series], 'visible')


save4k_text= Button(label= " Create 4K PNG figure: ", width= 150, height=30, button_type='success')
# save4k_text.js_link('active', highres_canvas, 'visible')
savesvg_text= Button(label= " Create SVG figure:  ", width= 150, height=30, button_type='success' )
# savesvg_text.js_link('active', svg_canvas, 'visible')



linew_text= Div(text= " Line width ", width= 150, height=30 )
linew_inp = TextInput(value=str(sel_lines['Background'].line_width), disabled=False, width=100, height=30) 
save4k = ToolbarBox()
save4k.toolbar = Toolbar(tools=highres_canvas.tools, logo=None)
save4k.toolbar_location ='above'
savesvg = ToolbarBox()
savesvg.toolbar = Toolbar(tools=svg_canvas.tools, logo=None)
savesvg.toolbar_location ='above'
graph_text=Column(grid_text, labels_text, ticks_text, axes_text, peakmz_text, linew_text)
graph_act=Column(grid_sele, labels_sele, ticks_sele, axes_sele, peakmz_sele, linew_inp)

savesvg.visible=False
save4k.visible=False

posneg_text = Div(text= " Ion Charge", width= 150, height=30 )
data_header = Div(text= " <h2>Data Processing</h2>", height=45, width=400 )
posneg_header = Div(text= " <h2>Instrument Mode</h2>", height=45, width=400 )
# save4k.toolbar_options={'logo':None}
data_text = Div(text= "Note: The data processing might take a couple of seconds. Please stay patient and refrain from pressing the Process Data button repeatedly. \n", width= 300, height=70 )

data_tools= Column(data_header, Row(dt_names, dt_inp), data_text, visible=False, name='Data Processing')


row_graphic=Row(graph_text, graph_act, width=150)
graph_header = Div(text= " <h2>Graphics options</h2>", height=45, width=400 )
window_header = Div(text= " <h2>Window Range</h2>", height=45, width=400 )

range_spacer=Div(text= "", width= 100, height=20 )
range_min=Div(text= "<b>Min</b>", width= 70, height=20 )
range_max=Div(text= "<b>Max</b>", width= 70, height=20 )

x_range_text=Div(text= " <b>X-Range (m/z)</b>", width= 100, height=30 )
y_range_text=Div(text= " <b>Y-Range (%)</b>", width= 100, height=30 )
x_range_min=TextInput(value=str(1000.0), disabled=False, width=70, height=30)
x_range_max=TextInput(value=str(20000.0), disabled=False, width=70, height=30)
y_range_min=TextInput(value=str(0.0), disabled=False, width=70, height=30)
y_range_max=TextInput(value=str(100.0), disabled=False, width=70, height=30)



range_text=Column(range_spacer,x_range_text,y_range_text)
range_min=Column(range_min, x_range_min,y_range_min)
range_max=Column(range_max, x_range_max,y_range_max)
range_row=Row(range_text, range_min, range_max)

range_cb=CustomJS(args=dict(plot_canvas=plot_canvas, x_range_min=x_range_min, x_range_max=x_range_max, y_range_min=y_range_min, y_range_max=y_range_max), code=open(os.path.join(os.getcwd(), 'JS_Functions', "range_cb.js")).read())

set_spacer=Div(text= "", width= 100, height=30)
set_range=Button(label='Set range', width=150, height=30, button_type='success', callback=range_cb)
set_range.js_on_event(ButtonClick, range_cb)

graph_layout= Column(graph_header, row_graphic, Row(save4k_text, save4k), Row(savesvg_text, savesvg), fig_text, window_header, range_row, Row(set_spacer, set_range), visible=False)

graph_opt.js_link('active', graph_layout, 'visible')

fig4k_cb=CustomJS(args=dict(save4k=save4k, plot_canvas=plot_canvas, svg_canvas=svg_canvas, highres_canvas=highres_canvas , series_names=series_names,\
                  bg_mz=bg_mz, bg_mz4k=bg_mz4k, bg_mzsvg=bg_mzsvg, series_mz4k=series_mz4k, series_mzsvg=series_mzsvg, series_mz=series_mz,save4k_text=save4k_text), code=open(os.path.join(os.getcwd(), 'JS_Functions', "fig4k_cb.js")).read())
figsvg_cb=CustomJS(args=dict(savesvg=savesvg, plot_canvas=plot_canvas, svg_canvas=svg_canvas, highres_canvas=highres_canvas , series_names=series_names,\
                  bg_mz=bg_mz, bg_mz4k=bg_mz4k, bg_mzsvg=bg_mzsvg, series_mz4k=series_mz4k, series_mzsvg=series_mzsvg, series_mz=series_mz,savesvg_text=savesvg_text), code=open(os.path.join(os.getcwd(), 'JS_Functions', "figsvg_cb.js")).read())

save4k_text.js_on_event(ButtonClick, fig4k_cb)
savesvg_text.js_on_event(ButtonClick, figsvg_cb)

graphics_cb=CustomJS(args=dict(linew_txt=linew_inp, ticks_sele=ticks_sele, labels_sele=labels_sele, grid_sele=grid_sele, \
                  plot_canvas=plot_canvas, highres_canvas=highres_canvas, sel_lines=sel_lines, sel_linessvg=sel_linessvg, sel_lines4k=sel_lines4k, series_names=series_names), code=open(os.path.join(os.getcwd(), 'JS_Functions', "graphics_cb.js")).read())
linew_inp.js_on_change('value', graphics_cb)


drop_cb = CustomJS(args=dict(GroEL_mz=GroEL_mz, peak_lines=peak_lines, peak_lines4k=peak_lines4k, col=col, sel_lines=sel_lines, sel_lines4k=sel_lines4k, cropping_slider=cropping_slider, gaussian_smooth=gaussian_smooth, \
  n_smooth=n_smooth, intensity_threshold=intensity_threshold, process_data=process_data, substract=substract, sub_name=sub_name, ser_match=ser_match, \
  ser_act=ser_act, comment_window=comment_window, stoich=stoich, SU_act=SU_act, posneg=posneg, series_colours_DS=series_colours_DS, series_dict=series_dict, \
  DataProcessingParameters=DataProcessingParameters, series_names=series_names, series_masses=series_masses, aser_data=aser_data, series_data=series_data, \
  series_sele=series_sele, series_mz=series_mz, raw_mz=raw_mz, proc_mz=proc_mz, bg_mz=bg_mz, peak_mz=peak_mz, plot_canvas=plot_canvas, \
  pp_mean_data=pp_mean_data, pp_std_data=pp_std_data), \
  code=open(os.path.join(os.getcwd(), 'JS_Functions', "navia_functions.js")).read() + open(os.path.join(os.getcwd(), 'JS_Functions', "drop_cb.js")).read())

dropdown = Dropdown(label="File", menu=menu, width=150, height=30, callback=drop_cb)
topleftspacer=Spacer(height=30, width=23)
row1 = Row(topleftspacer, dropdown, ser_act, col, posneg, mass_match, pp, mass_finder, dt_button, graph_opt, help_button)
row2 = Row(plot_canvas,Column(mass_finder_column, data_tools, graph_layout), height=768)
row3 = Row(topleftspacer,showtab, masses_table, comment_window)#, row_graphic)

SU_header = Div(text= " <h2>Subunits</h2>", height=35, width=580 )
MM_header = Div(text= " <h2>Stoichiometry</h2>", height=35, width=684 )
SU_text = Div(text= "Note: Edit new subunits in the table on the left. Delete Subunits deletes the highlighted subunit.\n", width= 120 )

SU_column=Column(Spacer(height=30), SU_add_button, SU_del_button, SU_text)
MM_column=Column(Spacer(height=30), ser_match, diff_match, Spacer(height=10), Row(mass_match_button))


mass_match_and_comment = Row(topleftspacer, Column(Row(SU_header, MM_header), Row(complex_table, SU_column, match_table, MM_column)),  visible=False)

# collumnasd =[row1, p]
# layout=gridplot(collumnasd, ncols=1)



left_logo_img = iio.imread(os.path.join(os.getcwd(), 'Logo', 'navia_logo.png'))
new_img=[]
for i in range(len(left_logo_img)):
    new_img.append(left_logo_img[len(left_logo_img)-1-i])
left_logo_img=np.array(new_img)
right_logo_img = iio.imread(os.path.join(os.getcwd(), 'Logo', 'oxford_rect.png'))
new_img=[]
for i in range(len(right_logo_img)):
    new_img.append(right_logo_img[len(right_logo_img)-1-i])
right_logo_img=np.array(new_img)



p = figure(width=300, height=100, toolbar_location=None)
p.x_range.range_padding = p.y_range.range_padding = 0
# must give a vector of images
p.image_rgba(image=[new_img], x=0, y=0, dw=10, dh=10)





left_logo = figure(width=300, height=100, toolbar_location=None, tools='')
left_logo.x_range.range_padding = left_logo.y_range.range_padding = 0

left_logo.image_rgba(image=[left_logo_img], x=0, y=0, dw=10, dh=10)
# left_logo.image_url(url=['navia_logo.png'], x=0, y=1, w=1, h=1)


left_logo.xgrid.grid_line_color = None
left_logo.ygrid.grid_line_color = None
left_logo.outline_line_alpha=0.0
left_logo.axis.minor_tick_line_alpha=0.0
left_logo.axis.major_label_text_alpha=0.0
left_logo.axis.major_tick_line_alpha=0.0
left_logo.axis.axis_line_alpha=0.0
left_logo.axis.axis_label_text_alpha=0.0

right_logo = figure(width=276, height=100, toolbar_location=None, tools='')
right_logo.x_range.range_padding = right_logo.y_range.range_padding = 0

right_logo.image_rgba(image=[right_logo_img], x=0, y=0, dw=10, dh=10)


# right_logo.image_url(url=['oxford_rect.png'], x=0, y=1, w=1, h=1)


right_logo.xgrid.grid_line_color = None
right_logo.ygrid.grid_line_color = None
right_logo.outline_line_alpha=0.0
right_logo.axis.minor_tick_line_alpha=0.0
right_logo.axis.major_label_text_alpha=0.0
right_logo.axis.major_tick_line_alpha=0.0
right_logo.axis.axis_line_alpha=0.0
right_logo.axis.axis_label_text_alpha=0.0


row0=Row(left_logo, Spacer(width=160), Div(text= "<h> <b>Na</b>tive <b>Vi</b>sual <b>A</b>nalyser </h>", width= 596, height=70 , style={'font-size': '42px', 'color':'#002147'}, align='center'), right_logo)
row2b=Row(topleftspacer,Div(text= " <h2>Peaks of Active Series (m/z)</h2>", width= 580, height=35 ),Div(text= " <h2>Masses</h2>", width= 370, height=35 ), Div(text= " <h2>Notes on Spectrum</h2>", width= 280, height=35 ))
layout = Column(row0, row1, row2, row2b, row3, mass_match_and_comment)
dt_button.js_link('active', data_tools, 'visible')
mass_match.js_link('active', mass_match_and_comment, 'visible')
highres_text = Div(text= "<b> This is an empty panel for the 4k plot. </b>", width= 300, height=70)
svg_text = Div(text= "<b> This is an empty panel for the SVG plot. </b>", width= 300, height=70)

tab=Tabs(tabs=[
    Panel(child=layout, title='Plot'),
    Panel(child=Column(highres_text,highres_canvas), title='4k Plot'),
    Panel(child=Column(svg_text,svg_canvas), title='SVG Plot')
], tabs_location='below')
show(tab)
