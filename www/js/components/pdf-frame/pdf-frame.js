//todo when remove iframe
define([
    '_',
    'knockout',
    'View',
    'text!components/pdf-frame/pdf-frame.html'
], function(
    _,
    ko,
    View,
    template

    //	'pdf',
    //	'pdf-l10n',
    ////	'pdf-pdf.worker',
    //	'pdf-viewer',
    //	'pdf-compatibility',
    //	'pdf-debugger'
){

    var Component = _.defineSubclass(View,

        function Component(params) {

            this.afterRender(params.data[0]);

        } , {

            afterRender: function(url){
                //currentUrlFile = url;
//			currentUrlFile = "/js/lib/pdf.js/web/compressed.tracemonkey-pldi-09.pdf";
//
//			PDFJS.imageResourcesPath = '/js/lib/pdf.js/web/images/';
//			PDFJS.workerSrc = '/js/lib/pdf.js/build/pdf.worker.js';
//			PDFJS.cMapUrl = '/js/lib/pdf.js/web/cmaps/';

//			if (application.support.postMessage){
//
//			}
//			location.search = 'file=' + url;

                //location.hash = "!" + url;

                window._PDFSource = url; // todo
            },

            dispose: function(){

            }
        }
    );

    return { viewModel: Component, template: template }
});