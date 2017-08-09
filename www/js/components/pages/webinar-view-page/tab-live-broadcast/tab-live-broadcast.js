define([
    'knockout',
    'text!components/pages/webinar-view-page/tab-live-broadcast/tab-live-broadcast.html',
    'ajaxAdapter',

    /**
     * broadcast package
     * */
    "md5.min",
    'janus',
    'adapterJanus'
], function (
    ko,
    template,
    ajaxAdapter
) {

    var server = null;

    var janus = null;
    var streaming = null;

    var selectedStream = null;

    function updateStreamsList() {
        streaming.send({"message": { "request": "list" }, success: function(result) {
            selectedStream = result.list[0].id; // custom default
            startStream();
        }});
    }

    function startStream() {
        streaming.send({"message": { "request": "watch", id: selectedStream }});
    }

    function stopStream() {
        var body = { "request": "stop" };
        streaming.send({"message": body});
        streaming.hangup();
    }

    function Component(params) {
        this.started = ko.observable();

        if(!Janus.isWebrtcSupported()) {
            alert("No WebRTC support... ");
            return;
        }

        var that = this;

        this.janus = null;

        var sessionUrl = 'https://stream-dev.nefrosovet.ru/?token=' + ajaxAdapter.getToken();

        $.get(sessionUrl)

            .done(function(response){
                janusInit(response.data.id, "https://sj-dev.nefrosovet.ru");
            })

            .fail(function(){
                alert('Error from server');
            });

        function janusInit (id, serverUrl){
            Janus.init({debug: "all", callback: function() {
                janus = new Janus(
                    {
                        sessionId: id,
                        server: serverUrl,
                        success: function() {
                            janus.attach(
                                {
                                    plugin: "janus.plugin.streaming",
                                    success: function(pluginHandle) {
                                        streaming = pluginHandle;
                                        updateStreamsList();
                                        setTimeout(function(){
                                            //janus.destroy();
                                        }, 100);
                                    },
                                    error: function(error) {
                                        alert("Error attaching plugin... " + error);
                                    },
                                    onmessage: function(msg, jsep) {
                                        var result = msg["result"];
                                        if(result !== null && result !== undefined) {
                                            if(result["status"] !== undefined && result["status"] !== null) {
                                                var status = result["status"];

                                                //starting
                                                //started
                                                //stopped

                                                if(status === 'stopped') {
                                                    stopStream();
                                                }
                                            }
                                        } else if(msg["error"] !== undefined && msg["error"] !== null) {
                                            alert(msg["error"]);
                                            stopStream();
                                            return;
                                        }
                                        if(jsep !== undefined && jsep !== null) {
                                            streaming.createAnswer(
                                                {
                                                    jsep: jsep,
                                                    media: { audioSend: false, videoSend: false },	// We want recvonly audio/video
                                                    success: function(jsep) {
                                                        var body = { "request": "start" };
                                                        streaming.send({"message": body, "jsep": jsep});
                                                    },
                                                    error: function(error) {
                                                        alert("WebRTC error... " + JSON.stringify(error));
                                                    }
                                                });
                                        }
                                    },
                                    onremotestream: function(stream) {
                                        $("#remotevideo").bind("playing", function () {
                                            //alert('playing')
                                        });
                                        attachMediaStream($('#remotevideo').get(0), stream);
                                    },
                                    oncleanup: function() {
                                        $('#remotevideo').remove();
                                    }
                                });
                        },
                        error: function(error) {
                            alert(error);
                            //window.location.reload();
                        },
                        destroyed: function() {
                            //window.location.reload();
                        }
                    });
            }});
        }
    }

    Component.prototype = {
        afterRender: function(){

        },

        dispose : function() {
            stopStream();
        }
    };

    return { viewModel: Component, template: template }
});