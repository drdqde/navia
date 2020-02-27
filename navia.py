import bokeh
import pandas as pd
import numpy as np
from bokeh import events
from bokeh.io import show
from bokeh.plotting import figure, output_file, ColumnDataSource
from bokeh.models.widgets import ColorPicker, Select, Toggle, Dropdown, DataTable, NumberFormatter, TableColumn,TextInput, Button, TextAreaInput
from bokeh.layouts import Column, Row, gridplot, Spacer
from bokeh.models import HoverTool, CustomJS, BoxSelectTool, Panel, Tabs, Span, AjaxDataSource
from bokeh.models.glyphs import MultiLine
from os.path import dirname, join


output_file('navia.html', title='Navia v 0.2')

# Usual format 1366x768
plot_canvas = figure(plot_width=1366, plot_height=768, output_backend='canvas',
           x_axis_label='m/z ', y_axis_label='Rel. Abundance  [%]',
           tools=['box_zoom, reset, save, pan, wheel_zoom'],
           toolbar_location='right' )

# Defining colours
n_series = 20
series_colours = [ bokeh.palettes.Category20_20[int((2*i%20+np.floor(i/10)))] for i in range(20)]
series_cols = {}
series_data = {}
series_sele = {}
series_mz   = {}

series_names = ['Series {:d}'.format(i_series + 1) for i_series in range(n_series)]

for i_series in range(len(series_names)):
    series_cols[series_names[i_series]] = series_colours[i_series]
series_cols['Background']='#000000'

for i_series in series_names:
    series_data[i_series] = AjaxDataSource(data=dict(x_low=[], x_upp=[],  x_max=[],max_int=[], charge=[]))#
    series_sele[i_series] = AjaxDataSource(data=dict(i_low=[], i_upp=[], i_max=[]))
    series_mz[i_series]   = AjaxDataSource(data=dict(Intensity=[], mz=[]))

series_masses = AjaxDataSource(data=dict(Series=[], Mass=[], Uncertainty=[]))
aser_data = AjaxDataSource(data=dict(x_low=[], x_upp=[],  x_max=[],max_int=[], charge=[]))
series_dict = AjaxDataSource(data=dict(series=[], names=[]))


raw_mz = AjaxDataSource(data=dict(Intensity=[], mz=[])) 
bg_mz = AjaxDataSource(data=dict(Intensity=[], mz=[])) 


sel_lines={}
for i_series in series_cols.keys():
    sel_lines[i_series] = MultiLine(xs='mz', ys='Intensity', line_color=series_cols[i_series], name=i_series)
sel_lines['Background'] = MultiLine(xs='mz', ys='Intensity', line_color=series_cols['Background'], name='Background')

# Peak prediction peaks
pp_mean_data = AjaxDataSource(data=dict(xs=[], ys=[]))
pp_std_data  = AjaxDataSource(data=dict(xs=[], ys=[]))

pp = Toggle(label="Peak prediction", width=150, height=30)

pp_mean = MultiLine(xs="xs", ys="ys", name='pp_mean', line_color=bokeh.palettes.Category20_20[0], line_width=2, line_alpha=0.5)
pp_std = MultiLine(xs="xs", ys="ys", name='pp_std', line_color=bokeh.palettes.Category20_20[0], line_dash='dashed',line_width=2, line_alpha=0.5)


# Selection and show of colour of Active Series


ser_act = Select(value='Background', options=['Background', 'New Series'], width=150, height=30)


col_cb = CustomJS(args=dict(series_names=series_names, sel_lines=sel_lines, ser_act=ser_act, pp_mean= pp_mean, pp_std=pp_std), code=open(join(dirname(__file__), "col_cb.js")).read())

col = ColorPicker(color='black', width=50, height=30, disabled=False, callback=col_cb)

ser_callback = CustomJS(args=dict(series_names=series_names, sel_lines=sel_lines, col=col, aser_data=aser_data, 
                        series_data=series_data, pp_mean= pp_mean, pp_std=pp_std, pp_mean_data=pp_mean_data, pp_std_data=pp_std_data, series_masses=series_masses), 
                        code=open(join(dirname(__file__), "navia_functions.js")).read() + open(join(dirname(__file__), "ser_cb.js")).read())


drop_cb = CustomJS(args=dict(series_names=series_names, series_masses=series_masses, aser_data=aser_data, series_data=series_data, series_sele=series_sele, sel_lines=sel_lines, series_mz=series_mz, raw_mz=raw_mz, bg_mz=bg_mz, plot_canvas=plot_canvas, pp_mean_data=pp_mean_data, pp_std_data=pp_std_data), code=open(join(dirname(__file__), "navia_functions.js")).read() + open(join(dirname(__file__), "drop_cb.js")).read())


ser_act.js_on_change('value', ser_callback)


# Additional Buttons

menu = [("Load spectrum from file", "load_file"), ("Load spectrum from clipboard", "load_clip"), None, ("Save session", "save_sess"), ("Load session", "load_sess"), None, ("Load subunit table", "load_suta")]


# Further options to implement ("Export SVG","expo_svg"), ("Export high-res PNG","expo_svg")]

dropdown = Dropdown(label="File", menu=menu, width=200, height=30)
dropdown.js_on_change('value', drop_cb)


mass_finder = Toggle(label='Mass Finder', width=150, height=30)
mass_match = Toggle(label='Mass Matching & Comment', width=200, height=30)

sele_cb = CustomJS(args=dict(raw_mz=raw_mz, bg_mz=bg_mz, ser_act=ser_act, series_sele=series_sele, series_data=series_data, series_mz=series_mz,
                         series_names=series_names, series_masses=series_masses, pp_mean_data=pp_mean_data, pp_std_data=pp_std_data, aser_data=aser_data), code=open(join(dirname(__file__), "navia_functions.js")).read()
                    + open(join(dirname(__file__), "sele_cb.js")).read())


box_selectdq = BoxSelectTool(callback=sele_cb, dimensions='width')



# Add lines to graph
plot_canvas.add_glyph(bg_mz,sel_lines['Background'])

for i_series in series_names:
    plot_canvas.add_glyph(series_mz[i_series],sel_lines[i_series])

ppml = plot_canvas.add_glyph(pp_mean_data, pp_mean, visible=False)
ppsl = plot_canvas.add_glyph(pp_std_data , pp_std , visible=False)


pp.js_link('active', ppml, 'visible')
pp.js_link('active', ppsl, 'visible')


# Defining Mass Finder
mass_finder_line= MultiLine(xs="xs", ys="ys", line_color="#002147", line_width=2, line_alpha=0.5)
mass_finder_data=AjaxDataSource(data=dict(xs=[], ys=[]))
mfl = plot_canvas.add_glyph(mass_finder_data, mass_finder_line, visible=False)

mass_finder_cb =CustomJS(args=dict(mass_finder_data=mass_finder_data, mfl=mfl), code=open(join(dirname(__file__), "mass_finder_cb.js")).read())
mass_finder.js_on_change('active', mass_finder_cb)


# Define Hovertool
    
hover = HoverTool()
hover.tooltips = [("m/z", "$x{5.2f}"), ("Abundance", "$y %")]
plot_canvas.add_tools(hover)
plot_canvas.add_tools(box_selectdq)


columns = [
        TableColumn(field="x_low", title="Lower m/z", formatter=NumberFormatter(format='0,0.00')),
        TableColumn(field="x_upp", title="Upper m/z", formatter=NumberFormatter(format='0,0.00')),
        TableColumn(field="x_max", title="mz of Max", formatter=NumberFormatter(format='0,0.00')),
        TableColumn(field="charge", title="Charge"),
        # TableColumn(field="max_int", title="Intensity of Maximum", formatter=NumberFormatter(format='0,0.00')),
    ]

showtab = DataTable(source=aser_data, name=i_series, columns=columns, width=680, height=480, editable=False, index_position=None)


columns_mass_table = [
        TableColumn(field="Series", title="Series"),
        TableColumn(field="Mass", title="Mass", formatter=NumberFormatter(format='0,0.00')),
        TableColumn(field="Uncertainty", title="Uncertainty", formatter=NumberFormatter(format='0,0.00')),
    ]
masses_table = DataTable(source=series_masses, name='Mass table', columns=columns_mass_table, width=270, height=280, index_position=None)

n_complexes = 10

SU_act = AjaxDataSource(dict(name=[],mass=[],min=[],max=[], stride=[]))

columns_complex_table = [
        TableColumn(field="name", title="Subunit"),
        TableColumn(field="mass", title="Mass", formatter=NumberFormatter(format='0,0.00')),
        TableColumn(field="min", title="Minimum #", formatter=NumberFormatter(format='0,0')),
        TableColumn(field="max", title="Maximum #", formatter=NumberFormatter(format='0,0')),
        TableColumn(field="stride", title="Stride", formatter=NumberFormatter(format='0,0')),
    ]
complex_table = DataTable(source=SU_act, name='Complex table', columns=columns_complex_table, width=534, height=280, index_header='Index', editable=True)

# Define buttons for adding subunits


SU_name   = TextInput(value='Subunit 1',  title='Name ',   disabled=False, width=80)
SU_mass   = TextInput(value= str(1000.0), title='Mass ',   disabled=False, width=80)
SU_min    = TextInput(value=str(0),       title='Min:',    disabled=False, width=80)
SU_max    = TextInput(value=str(1),       title='Max:',    disabled=False, width=80)
SU_stride = TextInput(value=str(1),       title='Stride:', disabled=False, width=80)


Add_SU_cb=CustomJS(args=dict(SU_name=SU_name, SU_mass=SU_mass, SU_min=SU_min, SU_max= SU_max, SU_stride=SU_stride, SU_act=SU_act), code=open(join(dirname(__file__), "Add_SU_cb.js")).read() )

SU_add_button=Button(label='Add subunit', width=84, height=30, button_type='success', callback=Add_SU_cb)
SU_button_spacer=Spacer(width=SU_add_button.width, height=20 )
SU_button=Column(SU_button_spacer,SU_add_button)
comment_window = TextAreaInput(value="Add comments on spectrum...", title="Comment:", width = 534, height= 200)


stoich = AjaxDataSource(dict(stoichiometry=[], mass=[], mass_diff=[]))
ser_match = Select(value='Series 1', options=list(series_cols.keys()), width=150, height=30)
diff_match   = TextInput(value= str(1000.0),   disabled=False, width=80)

columns_match_table = [
        TableColumn(field="stoichiometry", title="Stoichiometry"),
        TableColumn(field="mass", title="Mass of Combination", formatter=NumberFormatter(format='0,0.00')),
        TableColumn(field="mass_diff", title="Difference to Measured Mass", formatter=NumberFormatter(format='0,0.00')),
    ]

match_table = DataTable(source=stoich, name='Complex table', columns=columns_match_table, width=534, height=280, index_position=None)

mass_match_cb=CustomJS(args=dict(ser_match=ser_match, diff_match=diff_match,series_masses=series_masses, stoich=stoich, SU_act=SU_act), code=open(join(dirname(__file__), "MassMatching_cb.js")).read())
mass_match_button=Button(label='Mass Matching', width=84, height=30, button_type='success', callback=mass_match_cb)


row1 = Row(dropdown, ser_act, col, pp, mass_finder, mass_match)
row2 = Row(plot_canvas)
row3 = Row(showtab, masses_table)

row1b = Row(SU_name, SU_mass, SU_min, SU_max, SU_stride, SU_button)
row2b = Row(complex_table)
row3b = Row(ser_match, diff_match, mass_match_button)
row4b = Row(match_table)
row5b = Row(comment_window) 

# collumnasd =[row1, p]
# layout=gridplot(collumnasd, ncols=1)
col1 = Column(row1, row2, row3)
col2 = Column(row1b, row2b, row3b, row4b, row5b, visible=False)
mass_match.js_link('active', col2, 'visible')
layout = Row(col1, col2)
show(layout)
