/**
 MediaSignage Inc Digital Signage open source component
 This file serves as the HTML properties view for the Sample SignagePlayer component
 **/


var x2js = new X2JS();
var m_data = {};
var m_hRsources = {};
var hResource = 0;
var skipSave = 0;

/**
 Stop event, used when dropping resource
 @method preventDefault
 @param {Event} event
 **/
function preventDefault(event) {
    event.preventDefault();
}

/**
 Dropped (after dragged) resource onto target
 @method drop
 @param {Event} ev
 **/
function drop(ev) {
    ev.preventDefault();
    var dropID = $(ev.target).attr('name');
    var str = getDragData();
    var data = JSON.parse(str);
    var d0 = data[0];
    var resource = d0.Resource;
    var m_hRsource = parseInt(resource.hResource);
    var name = buildResourceName(dropID);
    m_hRsources[name] = m_hRsource;
    // alert(JSON.stringify(m_hRsources));
    getObjectValue(0, 'getResourcePath(' + m_hRsource + ')', function (b) {
        $(ev.target).attr('src', JSON.parse(b));
    });
}

/**
 SAVE: get settings from UI and save to local msdb
 @method getData
 @return {XML} json to xml data
 **/
function getData() {
    m_data = {Data: {}};

    // get background color
    m_data.Data._bgColor = document.getElementById('bgColor').value;
    m_data.Data._lineID1 = document.getElementById('lineID1').value;
    m_data.Data._lineID2 = document.getElementById('lineID2').value;
    m_data.Data._lineID3 = document.getElementById('lineID3').value;
    m_data.Data._lineID4 = document.getElementById('lineID4').value;
    m_data.Data._lineID5 = document.getElementById('lineID5').value;

    // alert(JSON.stringify(m_data));
    // return data as xml
    return x2js.json2xml_str(m_data);
}

/**
 Construct the resource name saved into the msdb
 @method buildResourceName
 @param {Number} i_number
 **/
function buildResourceName(i_number) {
    return '_hResource' + i_number;
}

/**
 LOAD: populate the UI with from local msdb onto UI
 we also must re-apply all data to m_data.Data so it gets
 saved bacl to the local msdb via getData()
 @method setData
 @param {XML} i_xmlData
 **/
function setData(i_xmlData) {
    if (skipSave)
        return;

    try {
        m_data = x2js.xml_str2json(i_xmlData);

        if (m_data.Data._lineID1 != null)
            $('#lineID1').val(m_data.Data._lineID1)
        if (m_data.Data._lineID2 != null)
            $('#lineID2').val(m_data.Data._lineID2)
        if (m_data.Data._lineID3 != null)
            $('#lineID3').val(m_data.Data._lineID3)
        if (m_data.Data._lineID4 != null)
            $('#lineID4').val(m_data.Data._lineID4)
        if (m_data.Data._lineID5 != null)
            $('#lineID5').val(m_data.Data._lineID5)

        // set background color
        if (m_data.Data._bgColor != null) {
            $('#bgColor').val(m_data.Data._bgColor);
        }
    } catch (e) {
        log('err 1 ' + e);
    }
}

/**
 Alert the data that would be saved to msdb at time of execution
 @method showSavedData
 **/
function showSavedData() {
    alert(JSON.stringify(m_data) + ' ' + window.log);
}

/**
 Example pf creating a new event and adding command and parmams to it
 @method createEvent
 **/
function createEvent() {
    log('addOnEve');
    getObjectValue(0, 'addEvent("some_important_event","some_command","some_command_params")', function (e) {
    });
}

/**
 Example of deleting an event
 @method deleteEvent
 **/
function deleteEvent() {
    getObjectValue(0, 'removeEventAt(0)', function (e) {
    });
}

/**
 DOM Ready
 @method onReady
 **/
$(document).ready(function () {
    var self = this;

    $('#tab-container').easytabs();

    $('#showSavedData').on('click', function (e) {
        showSavedData();
    });

    $('#remoteUrl').on('blur',function(){
        var url = $(this).val();
        $('#img4').attr('src',url);
    });
});

