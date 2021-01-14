var str = 'For technical support please email support@navia.ms.\n\n\
More information and introduction videos on NaViA can be found on the\
Github project (https://github.com/d-que/navia) & Youtube (https://www.youtube.com/channel/UCRvzQxegz0WNkjvvaRJ8PpQ).\n\n\
Please confirm to visit the Github project.'

windowconfirm=window.confirm(str);
if (windowconfirm==true){
	window.open('https://github.com/d-que/navia', '_blank')
}


// window.alert("<b>Test</b> asds")