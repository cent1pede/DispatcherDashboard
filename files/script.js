var seriesArr = [];
var seriesArr2 = [];
var docs = [];
var resp;
var DBresponse;
var rolesObj = [];
var assignees = [];
var updateResponse;
var group = "\'SD FIRST\'";
var thismonday = getUnixMonday(new Date);
var restring = 'requeststr= SELECT [Owner],[Assignee],[Incident_Number],[Assigned_group],[Status],[Description],[Status_reason] FROM [hqitsm-db-arsys].[ARSystem].[dbo].[HPD_Help_Desk] WHERE ([Assigned_Group] = ' + group + ' AND ([Status]<4 AND ([Status_reason] NOT IN (11000,7000,93000) OR [Status_reason] IS NULL))) OR (([Status] IN (4,5) AND [Last_Resolved_Date]> ' + thismonday + ') AND [Assigned_Group] = ' + group + ' )';


//https://servicedesk.avp.ru/arsys/forms/itsmapp/SHR%3ALandingConsole/Default+Administrator+View/?mode=search&F304255500=HPD:Help%20Desk&F1000000076=FormOpen&F303647600=SearchTicketWithQual&F303647600=SearchTicketWithQual&F304255610='7'="Pending" AND ('1000000218'="Vladimir Vasilyev" AND ('1000000150'="Client Action Required" OR '1000000150'="Authorization"))


function formSpecialistsArray(resposeObject) {

    for (i in resposeObject) {
        if ($.inArray(resposeObject[i].Assignee, assignees) == -1) {
            assignees.push(resposeObject[i].Assignee);
        }
    }
    assignees.sort();
    assignees.reverse();
}


function getAllBacklog(emplArray) {




    //обрати внимание, что запрос должен выглядеть именно так requeststr= иначе работать не будет
    /*  var restring = 'requeststr= SELECT [Assignee],[Incident_Number],[Assigned_group],[Status],[Description],[Status_reason] FROM [hqitsm-db-arsys].[ARSystem].[dbo].[HPD_Help_Desk] WHERE [Assigned_Group] = ' + group + ' AND ([Status]<4 AND ([Status_reason] NOT IN (11000,7000,93000) OR [Status_reason] IS NULL))';*/







    var myconnection = $.ajax({
        mimeType: 'multipart/form-data',
        data: restring,
        method: 'POST',
        async: true,
        url: 'https://dutydashboard.avp.ru/ITSM_Reports_API/Home/Request',
        processData: false,
        success: function (response) {
            DBresponse = JSON.parse(response);
            // formSpecialistsArray(responseObj);
            //formTickets(assignees, responseObj);
            formTickets(emplArray, DBresponse);

        }
    });







}

function formTickets(specArray, resposeObject) {

    console.log("func started");
    var resolvedTickets;
    var ownedTickets;


    for (i in specArray) {
        resolvedTickets = 0;
        ownedTickets = 0;
        //     console.log(specArray[i]);

        for (j in resposeObject) {
            //        console.log(resposeObject[j]);
            if (specArray[i] == resposeObject[j].Assignee && (resposeObject[j].Status == 4 || resposeObject[j].Status == 5)) {
                resolvedTickets++;
            } else if ((specArray[i] == resposeObject[j].Owner && (resposeObject[j].Status == 1 || resposeObject[j].Status == 2)) || (specArray[i] == resposeObject[j].Assignee && (resposeObject[j].Status == 1 || resposeObject[j].Status == 2))) ownedTickets++;


        }
        //.css('width'=resolvedTickets;'height'='20')
        /*var g = $('<g>').addClass('bar').appendTo('#ticketchart');
        var rect = $('<rect>').appendTo(g);
        var text = $('<text>').text(specArray[i]).appendTo(g);
          */



        var li = $('<li>').appendTo('#tickets').text(specArray[i] + ' - Resolved: ' + resolvedTickets + ' - Assigned now: ' + ownedTickets);

        // $('#tickets').append(<li>)
        var temp = {
            name: specArray[i],
            value: resolvedTickets
            //   value: (Math.floor(Math.random() * 130) + 4)
        };

        var temp2 = {
            name: specArray[i],
            value: ownedTickets
            //         value: (Math.floor(Math.random() * 25) + 1)
        };

        if (temp.name != null && temp2.name != null) {
            seriesArr.push(temp);
            seriesArr2.push(temp2);
        }

    }

    var specForChart = [];
    var seriesForChart = [[]];
    for (i in seriesArr) {
        specForChart.push(seriesArr[i].name);
        seriesForChart[0].push(seriesArr[i].resolved);

    }



    var graphdef = {
        categories: ['Assigned', 'Resloved'],
        dataset: {
            'Assigned': seriesArr2,
            'Resloved': seriesArr
        },


    }

    var config = {
        dimension: {
            width: 600,
            height: 400
        },
        margin: {
            left: 150
        },
        meta: {
            caption: 'Assigned/resolved',
        },
        caption: {
            fontfamily: '"Tahoma"'
        }
    }

    var chart = uv.chart('StackedBar', graphdef, config);






    console.log(seriesArr);




}


function getUnixMonday(d) {
    d = new Date(d);
    var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6 : 1),
        t = new Date(d.setDate(diff));
    t.setHours(0, 0, 0, 0);

    return t / 1000;
}


function getAllDocs(database) {
    database.allDocs({
            include_docs: true,
            attachments: true
        },
        function (err, response) {
            if (err) {
                return console.log(err);

            } else resp = response;
        });

}

function updateOld() {

    $('.roleselector').each(function () {
        var oldvalue = $(this).val();
        $(this).data('oldValue', oldvalue);
        console.log('bobo');

    });

}


$(document).ready(function () {


    var db = new PouchDB('http://firstlinetools.avp.ru:5984/mydatabase');


    //   $('body').on('focus click', '.roleselector', function () {

    //       var stopped = false;
    //      console.log('CLICK function fired');
    //       if (!stopped){




    $('body').on('change', '.roleselector', function () {
        //    var transfer = $(this).val();
        //     console.log('CHANGE function fired');



        checkCollisions(this, 'role');
        console.log('momo');


    });
    //                    }
    //   });

    /*
    $('.roleselector').each(function() {
    //Store old value
    $(this).data('lastValue', $(this).val());
});

*/
    $('#roleupdater').on({
        "click": function () {
            $('#roleupdater').tooltip({
                items: "#roleupdater",
                content: "Updated!"
            });
            $('#roleupdater').tooltip("open");

        },
        "mouseout": function () {
            if ($(this).data('ui-tooltip')) {
                $(this).tooltip("disable");
            }

        }
    });


    $('body').on('change', '#meetingstart', function () {

        console.log($('#meetingstart').val());
        var validator = RegExp('^1[0-9]-[0-5][0-9]$');
        if (!validator.test($('#meetingstart').val())) {
            alert('Time is incorrect, please fill it again');
            $('#meetingstart').val('');
        } //else if()

        checkAllinputs();
    });


    $('body').on('change', '#meetingend', function () {

        console.log($('#meetingend').val());
        var validator = RegExp('^1[0-9]-[0-5][0-9]$');
        if (!validator.test($('#meetingend').val())) {
            alert('Time is incorrect, please fill it again');
            $('#meetingend').val('');
        }
        checkAllinputs();
    });


    $('body').on('change', '#meetingperson', function () {

        checkAllinputs();

    });





    var specArray = [null, "Vyacheslav Zakharenkov", "Vladimir Vasilyev", "Valeriya Lyameborshay", "Tatyana Pokhodyaeva", "Sergey Alexeev", "Pavel S Alexandrov", "Pavel Chilimov", "Owner Default", "Nikita Trushnikov", "Mikhail Kotyukov", "Mikhail Balashov", "Dmitry Minin", "Alexey Vokhmanov", "Alexey Kozlov", "Alexey Golovlev"]



    /*
        for (i in specArray) {

            var temp = {
                name: specArray[i],
                //          value: resolvedTickets
                value: (Math.floor(Math.random() * 130) + 4)
            };

            var temp2 = {
                name: specArray[i],
                value: (Math.floor(Math.random() * 25) + 1)
            };


            seriesArr.push(temp);
            seriesArr2.push(temp2);


        }
    */




    db.allDocs({
            include_docs: true,
            attachments: true
        },
        function (err, response) {
            if (err) {
                return console.log(err);
            }

            //          $('.roleselector').on('change');


            console.log(response);

            resp = response;

            var lunchtime = ["12-30", "13-15", "14-00", "14-45", "15-30", "16-15", "17-00"];

            for (i in lunchtime) {

                var div = $('<div/>').addClass('lunchrecord').appendTo('#lunches'),
                    div2 = $('<div/>').addClass('time').text(lunchtime[i]).appendTo(div),
                    select = $('<select/>').addClass('lunchselector').attr('id', lunchtime[i] + '_1').appendTo(div),
                    disabledOption = $('<option/>')
                    .text('<Choose a person>')
                    .prop('selected', true)
                    .prop('disabled', true)
                    .prop('value', true)
                    .appendTo(select),
                    select2 = $('<select/>').addClass('lunchselector').attr('id', lunchtime[i] + '_2').appendTo(div),
                    disabledOption2 = $('<option/>')
                    .text('<Choose a person>')
                    .prop('selected', true)
                    .prop('disabled', true)
                    .prop('value', true)
                    .appendTo(select2);
                for (j in response.rows) {

                    //                    console.log(response.rows[j].doc._id);
                    //                    console.log(lunchtime[i]);
                    //                    console.log(response.rows[j].doc.lunch);
                    //                    console.log(lunchtime[i] == response.rows[j].doc.lunch);

                    if (lunchtime[i] == response.rows[j].doc.lunch) {

                        console.log(response.rows[j].doc._id);


                        var selectorString = '#' + lunchtime[i] + '_1 option:selected',
                            selectorString2 = '#' + lunchtime[i] + '_2 option:selected';;

                        if ($(selectorString).text() == '<Choose a person>') {


                            //     ('#' + lunchtime[i] + '_1 option:selected').prop('selected',false);
                            var option = $('<option/>').val(response.rows[j].doc._id).text(response.rows[j].doc._id).prop('selected', true).appendTo(select);


                        } else if ($(selectorString2).text() == '<Choose a person>') {


                            var option2 = $('<option/>').text(response.rows[j].doc._id).val(response.rows[j].doc._id).appendTo(select2).prop('selected', true);
                        }


                    } else {
                        var option = $('<option/>').text(response.rows[j].doc._id).val(response.rows[j].doc._id).appendTo(select),
                            option2 = $('<option/>').text(response.rows[j].doc._id).val(response.rows[j].doc._id).appendTo(select2);
                    }
                }

            }

            var employeesFromBase = [];

            for (i in response.rows) {

                //    console.log((response.rows[i].doc.issupervisor).toString());
                if (response.rows[i].doc.issupervisor != true) {
                    var temp = {
                        name: response.rows[i].id,
                        //          value: resolvedTickets
                        value: (Math.floor(Math.random() * 130) + 4)
                    };

                    var temp2 = {
                        name: response.rows[i].id,
                        value: (Math.floor(Math.random() * 25) + 1)
                    };

                    employeesFromBase.push(response.rows[i].id);
                    //    seriesArr.push(temp);
                    //       seriesArr2.push(temp2);

                }

                var selectOptions = $('<select/>').addClass('roleselector').attr('id', response.rows[i].id)
                    .append('<option value="Analyst">Analyst</option>')
                    .append('<option value="Dispatcher">Dispatcher</option>')
                    .append('<option value="Backup">Backup</option>')
                    .append('<option value="1500">1500</option>')
                    .append('<option value="1500 Backup">1500 Backup</option>')
                    .append('<option value="Advocate">Advocate</option>')
                    .append('<option value="OOO">OOO</option>')
                    .append('<option value="Study">Study</option>');

                var role = 'option:contains("' + response.rows[i].doc.role + '")';

                //selectOptions.find(role).attr("selected", true);
                selectOptions.val(response.rows[i].doc.role);
                //    $(elementChanged).val(oldValue);

                var div = $('<div/>').addClass('employee').appendTo('#usercontainer'),
                    div2 = $('<div/>').addClass('username').text(response.rows[i].id).appendTo(div);




                //   console.log(i + selectOptions.toString());
                div.append(selectOptions);
                //  selector = $('<>')






            }

            getAllBacklog(employeesFromBase);

            if ($('.cge-assigned').length == 0) {

                setTimeout(function () {
                    $('.cge-assigned').each(function () {

                        var assignedToField = '1000000218';
                        var statusField = '7';



                        var emplTitle = $(this).find('title').text().split('[')[1].split(']')[0];

                        var emptyLink = 'https://servicedesk.avp.ru/arsys/forms/itsmapp/SHR%3ALandingConsole/Default+Administrator+View/?mode=search&F304255500=HPD:Help%20Desk&F1000000076=FormOpen&F303647600=SearchTicketWithQual&F303647600=SearchTicketWithQual&F304255610=\'' + statusField + '\'="Assigned" AND \'' + assignedToField + '\'="' + emplTitle + '"';


                        console.log('emptyLink');
                        console.log(emptyLink);

                        var link = $('<a/>').attr('href', emptyLink);

                      //  $(this).wrap('<a href="#"/>');


                    });

                },2000);
            }




            //
            //OLD GRAPH DEFINITION
            //
            /*
            var graphdef = {
                categories: ['Assigned', 'Resloved'],
                dataset: {
                    'Assigned': seriesArr2,
                    'Resloved': seriesArr
                },


            }
            var config = {
                dimension: {
                    width: 600,
                    height: 400
                },
                margin: {
                    left: 150
                },
                meta: {
                    caption: 'ДАННЫЕ ПОКА ЧТО ГЕНЕРЯТСЯ РАНДОМНО',
                },
                caption: {
                    fontfamily: '"Tahoma"'
                }
            }


            var chart = uv.chart('StackedBar', graphdef, config);

*/
            updateOld();


            //
            //
            //Function to add meetings from database
            //

            var fillableSelector = $('<select/>').addClass('meetingselector').attr('id', 'meetingperson');

            var placeholderOption = $('<option/>')
                .text('<Choose a person>')
                .prop('selected', true)
                .prop('disabled', true)
                .prop('value', '<Choose a person>')
                .appendTo(fillableSelector);
            for (k in response.rows) {

                var option = $('<option/>').val(response.rows[k].doc._id).text(response.rows[k].doc._id).appendTo(fillableSelector);

            }

            var fillablediv = $('<div/>')
                .addClass('meetingrecord').attr('id', 'fillablemeeting')
                .appendTo('#meetings'),
                fillableinput = $('<input/>').addClass('meetingtime start').attr('id', 'meetingstart').attr('type', 'text').attr('pattern', '^1[0-9]-[0-5][0-9]$')

                .appendTo(fillablediv),
                fillableinput2 = $('<input/>').addClass('meetingtime end').attr('id', 'meetingend').attr('type', 'text').attr('pattern', '^1[0-9]-[0-5][0-9]$')

                .appendTo(fillablediv);



            fillableSelector.appendTo(fillablediv);
            $('<button/>').addClass('meetingcreator').text('Add').attr('onClick', addRemoveMeeting).appendTo(fillablediv);



            for (i in response.rows) {

                if (response.rows[i].doc.meetings.length != 0) {
                    //    console.log(response.rows[i].doc.meetings);


                    var meetingSelector = $('<select/>').addClass('meetingselector');

                    for (k in response.rows) {

                        var option = $('<option/>').val(response.rows[k].doc._id).text(response.rows[k].doc._id).appendTo(meetingSelector);


                    }




                    for (j in response.rows[i].doc.meetings) {

                        var div = $('<div/>')
                            .addClass('meetingrecord')
                            .appendTo('#meetings'),
                            input = $('<span/>').addClass('meetingtime')
                            .text(convertTime(response.rows[i].doc.meetings[j].start) + ' - ')
                            .appendTo(div),
                            input2 = $('<span/>').addClass('meetingtime')
                            .text(convertTime(response.rows[i].doc.meetings[j].end))
                            .appendTo(div);
                        meetingSelector.val(response.rows[i].doc._id).appendTo(div).attr('disabled', true);

                        var removeButton = $('<button/>').addClass('meetingcreator').text('Remove').attr('onClick', addRemoveMeeting).appendTo(div);




                        console.log(response.rows[i].doc._id + ' Start:' + response.rows[i].doc.meetings[j].start);
                        var b = convertTime(response.rows[i].doc.meetings[j].end);

                        console.log('here is date' + b);

                    }


                    /*
                                    var div = $('<div/>').addClass('lunchrecord').appendTo('#lunches'),
                                        div2 = $('<div/>').addClass('time').text(lunchtime[i]).appendTo(div),
                                        select = $('<select/>').addClass('lunchselector').attr('id', lunchtime[i] + '_1').appendTo(div),
                                        disabledOption = $('<option/>')
                                        .text('<Choose a person>')
                                        .prop('selected', true)
                                        .prop('disabled', true)
                                        .prop('value', true)
                                        .appendTo(select),*/
                }



            }


            $('#fillablemeeting .meetingtime').timepicker({
                timeFormat: 'H-i',
                minTime: '10:00am',
                maxTime: '6:30pm',
                step: 10,
                //   useSelect:true

            });

            /*

                        $('#fillablemeeting').datepair({
                            'anchor': $('#meetingstart').val()



                        });

                        $('#meetingstart').on('change', function () {
                            $('#fillablemeeting').option('anchor', $('#meetingstart').val());
                        });
            */


            var anchorExampleEl = document.getElementById('fillablemeeting');
            var anchorDatepair = new Datepair(anchorExampleEl, {
                anchor: 'start',
                timeClass: 'meetingtime',
                defaultTimeDelta: 1800000
            });

            /*            $('#meetingstart').on('change', function () {
                            anchorDatepair.option('anchor', $('#meetingstart').val());
                        });*/





        }); //Getting and displaying all documents



    //  updateRoles();
    /*
        $('.meetingtime').timepicker({
            timeFormat: 'H-i',
            minTime: '10:00am',
            maxTime: '6:30pm',
            step: 10,
            //   useSelect:true

        });*/







});


function checkAllinputs() {



    if ($('#meetingend').val() == $('#meetingstart').val()) {
        alert('Incorrect time!');
        $('#meetingend').val('');
        $('#meetingend').toggleClass('redborder');
        setTimeout(function () {
            $('#meetingend').toggleClass('redborder');
            $('#meetingend').toggleClass('noborder');
        }, 2000)
        //  $( "#meetingend" ).tooltip( "option", "content", "Awesome title!" );
        /*        $('#meetingend').tooltip({
                    items: "#meetingend",
                    content: "error!"
                });
                $('#meetingend').tooltip("open");*/

        /*        setTimeout(function () {
                    $('#meetingend').tooltip('hide');
                }, 2000);*/




        //  return false;
    } else if (($('#meetingend').val() != '' &&
            $('#meetingstart').val() != '') &&
        (($('#meetingperson').find('option:selected').text() != '<Choose a person>'))) {

        console.log('All set!');


    }
}

function convertTime(timeString) {

    if ((typeof timeString) == 'string') {

        var timeArr = timeString.split('-');

        var t = new Date();

        t.setHours(timeArr[0], timeArr[1], 0, 0);

        return t;

    } else if ((typeof timeString) == 'number') {

        var tempDate = new Date(timeString);

        var tempMinuites = tempDate.getMinutes(),
            tempHours = tempDate.getHours();

        if (tempHours < 10) tempHours = '0' + tempHours;
        if (tempMinuites < 10) tempMinuites = '0' + tempMinuites;


        var t = tempHours + '-' + tempMinuites;

        return t;

    }


}

function addRemoveMeeting(action) {

    var testStart = $('#meetingstart').val();
    var testEnd = $('#meetingstart').val();


    //  if()



}


function updateRoles() {

    db.allDocs({
            include_docs: true,
            attachments: true
        },
        function (err, response) {
            if (err) {
                return console.log(err);
            }
            updateResponse = response;

            $(".roleselector").each(function () {
                //     alert($(this).attr("name"));
                //    alert($(this).attr('id') + " " + $(this).children("option:selected").text());//.each(function () {

                var tempObj = {
                    _id: "",
                    role: ""
                };
                tempObj._id = $(this).attr('id');
                tempObj.role = $(this).children("option:selected").text();

                rolesObj.push(tempObj);








                //   });
            });


            for (var i = 0; i < updateResponse.rows.length; i++) {

                for (var j = 0; j < rolesObj.length; j++) {


                    console.log(i + ":" + j);

                    if (rolesObj[j]._id == updateResponse.rows[i].doc._id) {

                        console.log("----");
                        console.log(i + ":" + j);
                        console.log(rolesObj[j]._id == updateResponse.rows[i].doc._id);
                        console.log("rolesObj: " + rolesObj[j]._id);
                        console.log("updateResponse: " + updateResponse.rows[i].doc._id);
                        console.log(rolesObj[j]._id == updateResponse.rows[i].doc._id);
                        console.log("----");


                        var toAdd = updateResponse.rows[i].doc;

                        toAdd.role = rolesObj[j].role;

                        docs.push(toAdd);
                        /*
                            {
                                "_id": "Alexey Kozlov",
                                "_rev": "7-647c36dbec61a87ddb8c0cefc14aa606",
                                "role": "Analyst",
                                "lunch": "",
                                "meetings": {},
                                "issupervisor": false
                            }
                    
                            */

                    }

                }


            }

            db.bulkDocs(docs);

        });

    getAllDocs(db);


}


function updateLunches() {

    db.allDocs({
            include_docs: true,
            attachments: true
        },
        function (err, response) {
            if (err) {
                return console.log(err);
            }
            updateResponse = response;

            var lunchObj = [{}];

            $(".lunchselector").each(function () {
                //     alert($(this).attr("name"));
                //    alert($(this).attr('id') + " " + $(this).children("option:selected").text());//.each(function () {


                if ($(this).find('option:selected').text() != '<Choose a person>') {
                    var tempObj = {
                        _id: "",
                        role: ""
                    };

                    tempObj._id = $(this).find('option:selected').text();
                    tempObj.lunch = $(this).attr('id').split('_')[0];

                    lunchObj.push(tempObj);

                }

                //   });
            });


            for (var i = 0; i < updateResponse.rows.length; i++) {

                for (var j = 0; j < lunchObj.length; j++) {


                    console.log(i + ":" + j);

                    if (lunchObj[j]._id == updateResponse.rows[i].doc._id) {

                        console.log("----");
                        console.log(i + ":" + j);
                        console.log(lunchObj[j]._id == updateResponse.rows[i].doc._id);
                        console.log("lunchObj: " + lunchObj[j]._id);
                        console.log("updateResponse: " + updateResponse.rows[i].doc._id);
                        console.log(lunchObj[j]._id == updateResponse.rows[i].doc._id);
                        console.log("----");


                        var toAdd = updateResponse.rows[i].doc;

                        toAdd.lunch = lunchObj[j].lunch;

                        docs.push(toAdd);
                        /*
                            {
                                "_id": "Alexey Kozlov",
                                "_rev": "7-647c36dbec61a87ddb8c0cefc14aa606",
                                "role": "Analyst",
                                "lunch": "",
                                "meetings": {},
                                "issupervisor": false
                            }
                    
                            */

                    }

                }


            }

            db.bulkDocs(docs);

        });



}


function checkCollisions(elementChanged, menuType, oldData) {

    if (menuType == 'role') {

        var existingRoles = [];

        var selected = $(elementChanged).find('option:selected').text();

        var rolesArr = ['Dispatcher', 'Backup', '1500', '1500 Backup', 'Advocate'];

        $('.roleselector').each(function () { //Get all existing roles, but not the changed one

            if ($(elementChanged).attr('id') != $(this).attr('id')) existingRoles.push($(this).find("option:selected").text());

        });



        if (($.inArray(selected, rolesArr) != -1) && ($.inArray(selected, existingRoles) != -1)) {
            console.log($(elementChanged).attr('id'));
            alert('Role already taken!');

            var oldValue = $(elementChanged).data('oldValue');

            $(elementChanged).val(oldValue);

        }

    }
    updateOld();


}




function testAllData(element) {

    var currentRoles = [];
    $('.roleselector').each(function () {
        var tempSpec = {};
        tempSpec.meetings = [];
        tempSpec.lunch = '';
        console.log($(this).attr('id'));
        tempSpec.employee = $(this).attr('id');
        tempSpec.role = $(this).find('option:selected').text();

        currentRoles.push(tempSpec);


    });

    $('.lunchselector').each(function () {

        for (i in currentRoles) {

            if ($(this).find('option:selected').text() == currentRoles[i].employee) {

                currentRoles[i].lunch = $(this).attr('id').split('_')[0];
            }

        }


    });

    $('.meetingselector').each(function () {

        for (i in currentRoles) {
            var j = 0;

            if ($(this).find('option:selected').text() == currentRoles[i].employee) {

                currentRoles[i].meetings[j] = {
                    start: '',
                    end: ''
                }

                var tempStart = new Date(moment($(this).prev().prev().text().split(' ')[0], 'HH-mm'));
                var tempEnd = new Date(moment($(this).prev().text(), 'HH-mm'));

                currentRoles[i].meetings[j].start = tempStart.getTime();
                currentRoles[i].meetings[j].end = tempEnd.getTime();
                j++;
            }

        }


    });

    var rolesArr = ['Dispatcher', 'Backup', '1500', '1500 Backup'];
    for (i in currentRoles) {

        if ((currentRoles[i].lunch != '') && $.inArray(currentRoles[i].role, rolesArr) != -1) {
            for (j in currentRoles) {
                if (((currentRoles[i].employee != currentRoles[j].employee) && ((currentRoles[i].lunch == currentRoles[j].lunch) && $.inArray(currentRoles[j].role, rolesArr) != -1))) {

                    console.log(currentRoles[i].employee + '  -  ' + currentRoles[j].employee);
                    console.log('ERROR!!!!!!!!!!!!!!!!!!!!!');

                }
            }
        }

        if (currentRoles[i].meetings.length != 0) {

            // console.log(i + ' i fired - user -' + currentRoles[i].employee);

            for (k in currentRoles[i].meetings) {

                //     console.log(k + ' k fired - user -' + currentRoles[i].employee);
                for (j in currentRoles) {

                    //        console.log(j + ' j fired - user -' + currentRoles[i].employee);
                    //       console.log(' j  - user -' + currentRoles[j].employee);
                    for (l in currentRoles[j].meetings) {

                        //        console.log(l + ' l fired - user -' + currentRoles[i].employee);


                        if ((currentRoles[i].employee != currentRoles[j].employee) && ((currentRoles[i].meetings[k].start < currentRoles[j].meetings[l].end && currentRoles[i].meetings[k].start >= currentRoles[j].meetings[l].start) ||
                                (currentRoles[j].meetings[l].start < currentRoles[i].meetings[k].end && currentRoles[j].meetings[l].start >= currentRoles[i].meetings[k].start))) {


                            console.log('meeetingerror!!!!!1' + currentRoles[i].employee);
                        }


                    }



                }

            }


        }


    }

    return currentRoles;
}







/*db.info().then(function (info) {
    console.log(info);
})*/




//DB POPULATION
/*var specArray = ["Vyacheslav Zakharenkov", "Vladimir Vasilyev", "Valeriya Lyameborshay", "Tatyana Pokhodyaeva", "Sergey Alexeev", "Pavel S Alexandrov", "Pavel Chilimov", "Owner Default", "Nikita Trushnikov", "Mikhail Kotyukov", "Mikhail Balashov", "Dmitry Minin", "Alexey Vokhmanov", "Alexey Kozlov", "Alexey Golovlev"]
for (var i=0;i< specArray.length; i++) {

    var index = "id" + (i+1);
    console.log(index);
    var doc = {
        "_id": specArray[i],
        "role": "Analyst",
		"lunch": "",
		"meetings":{},		
		"issupervisor": false,
		 
    };
    

    db.put(doc);
}*/