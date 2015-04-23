/**
 SignagePlayer main Application view
 @class SamplePlayerView
 @constructor
 @return {object} instantiated SamplePlayerView
 **/
define(['jquery', 'backbone', 'text!templates/Line.html', 'TweenLite', 'ScrollToPlugin'], function ($, Backbone, LineTemplate, TweenLite, ScrollToPlugin) {


    var SamplePlayerView = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            BB.comBroker.setService(BB.SERVICES.SAMPLE_VIEW, self);
            BB.CONSTS.BUSINESS_ID = -1;
            self.m_jData = undefined;
            self.m_cacheExpirationSec = 1;
            self.m_purgedIfNotUsedSec = 1000000;
            self.m_scrollPosition = 0;
            _.templateSettings = {interpolate: /\{\{(.+?)\}\}/g};
            self.m_lineTemplate = _.template(LineTemplate);
            self._listenDispose();
            self._listenPlayerEvents();
            self._listenSendEvents();

            self._log('mode: ' + window.mode);
            self._log('WebKit inside SignagePlayer: ' + BB.SIGNAGEPLAYER_MODE);
        },

        _log: function (i_data) {
            $(Elements.CONSOLE_LOG).append(i_data + '<br/>');
        },

        /**
         Example of sending event to SignagePlayer every 10 seconds which is cought by a collection and switches images.
         Of course you will need to setup a collection first with proper 'next page' event listener within StudioPro
         @method _sendEvents
         **/
        _listenSendEvents: function () {
            var self = this;
            $(Elements.FIRE_NEXT_EVENT).on('click', function () {
                self._log('sending next event');
                self._sendEvent('next', _.random(1, 100));
            });
        },

        /**
         Send event through bridge and into SignagePlayer
         @method _sendEvent
         @param {String} i_event event string
         @param {String} i_value event string
         **/
        _sendEvent: function (i_event, i_value) {
            var self = this;
            getObjectValue(0, 'sendCommand("' + i_event + '", ' + i_value + ')', function (e) {
                // console.log(e);
            });
        },

        /**
         Listen when new player data event is fire from AS3 side of SignagePlayer
         @method _listenPlayerEvents
         **/
        _listenPlayerEvents: function () {
            var self = this;
            BB.comBroker.listen(BB.EVENTS.ON_PLAYER_EVENT, function (e) {
                self._log('event: ' + e.edata.name + ' ' + e.edata.param);
            });
        },

        /**
         Listen application / component removed from timeline
         @method _listenDispose
         **/
        _listenDispose: function () {
            var self = this;
            BB.comBroker.listen(BB.EVENTS.ON_DISPOSE, function (e) {
                BB.comBroker.setService(BB.SERVICES.SAMPLE_VIEW, undefined);
                BB.comBroker.stopListen(BB.EVENTS.ON_PLAYER_EVENT);
                BB.comBroker.stopListen(BB.EVENTS.ON_DISPOSE);
            });
        },

        /**
         Get the last called service_id for line
         @method _pollNowServicing server:LastCalledQueue
         **/
        _pollNowServicing: function (i_businessID, i_lineID) {
            var self = this;
            var lastCalledQueue = function () {
                $.ajax({
                    url: BB.CONSTS.ROOT_URL + '/LastCalledQueue',
                    data: {
                        business_id: i_businessID,
                        line_id: i_lineID
                    },
                    success: function (i_model) {
                        var $divLineID = $('#divLineID' + i_model['line_id']);
                        $divLineID.find('.lineName').text(i_model.name);
                        $divLineID.find('.serviceID').text(i_model.service_id);

                    },
                    error: function (e) {
                        log('error ajax ' + e);
                    },
                    dataType: 'json'
                });
            };
            self.m_statusHandler = setInterval(function () {
                lastCalledQueue();
            }, 5000);
            lastCalledQueue();
        },

        /**
         Example of storing values locally for later retrieval (works only in Node-Web-Kit)
         @method _exampleSimpleStorage
         **/
        _exampleSimpleStorage: function () {
            var self = this;
            simplestorage.set('test', 123);
            if (simplestorage.get('test')) {
            } else {
            }
        },

        /**
         Kick off this component when xml_data is available from AS3 SignagePlayer bridge
         and grab the business id through reflection
         @method _dataLoaded
         @param {XML} i_xmlData
         **/
        dataLoaded: function (i_jData) {
            var self = this;
            self.m_jData = i_jData;
            getObjectValue(0, 'framework.StateBroker.GetState("businessId")', function (i_business_id) {
                BB.CONSTS.BUSINESS_ID = i_business_id

                // todo: debug override business id
                BB.CONSTS.BUSINESS_ID = 372844;
                _.forEach(self.m_jData, function (lineID, lineKey) {
                    if (lineKey.indexOf('lineID') > -1 && lineID != "") {
                        var m = {
                            divLineID: 'divLineID' + lineID
                        };
                        $(Elements.LINES_CONTAINER).append($(self.m_lineTemplate(m)).hide().fadeIn());
                        self._pollNowServicing(BB.CONSTS.BUSINESS_ID, lineID);
                    }
                });
            });
        }
    });

    return SamplePlayerView;
});