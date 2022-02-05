let closeIcon = getElement("close-icon");
let userCompleptionForm = getElement("embed-user-completion-form");
let formOverlay = getElement("form-overlay");

if (URLQueryParams["profile-completed"]){
    localStorage.setItem("profileCompleted", true);
}

let profileCompleted = localStorage.getItem("profileCompleted");

let initialSampleElements = [
    packageStatusContainer,
    goalSettingSample,
    mockInterviewSample,
    consultingSessionSample
] = getElements([
    'package-status-container',
    'goal-setting-sample',
    'mock-interview-sample',
    'consulting-session-sample'
])

hideElements(initialSampleElements);

let sessionDetails = {}

function getFormattedDate(dateTime, format) {
    let formatType = format || "MMM Do YYYY, h:mm:ss a";
    return moment(dateTime).format(formatType);
}

let package_status = {
    'Assign POC': {
        'short': 'We’re Assigning A Dedicated POC For You'
    },
    'Look For Mentor': {
        'short': 'Looking For A Mentor'
    },
    'Assign Mentor': {
        'short': 'Looking For A Mentor'
    },
    'Confirm Mentor With Candidate': {
        'short': 'POC Will Confirm The Assigned Mentor With You'
    },
    'Package In Progress': {
        'short': 'Package In Progress'
    },
    'Collect Package Feedback': {
        'short': 'Package Completed'
    },
    'Take Package Feedback':{
        'short': 'Submit Your Package Feedback'
    },
    'Package Completed': {
        'short': 'Package Completed'
    },
    'Refund': {
        'short': 'Refund'
    }
}
let session_status = {
    'Schedule Session': {
        'short': 'To Be Scheduled',
        'long': 'Scheduling in Progress'
    },
    'Reschedule Session': {
        'short': 'Rescheduling',
        'long': 'Scheduling in Progress'
    },
    'Attend Session': {
        'short': 'Upcoming',
        'long': 'Scheduled'
    },
    'Session Completed': {
        'short': 'Completed',
        'long': 'Completed'
    },
    'Session Cancelled': {
        'short': 'Cancelled',
        'long': 'Cancelled'
    },
    'Pay The Mentor': {
        'short': 'Completed',
        'long': 'Completed'
    },
    'Payment Completed': {
        'short': 'Completed',
        'long': 'Completed'
    },
    'Payment Pending': {
        'short': 'Completed',
        'long': 'Completed'
    }
}

// mappings
// let mappings = {
//     "mock-interview":[
//         {
//             "longText": "You will receive an introductory call from Preplaced (within 1 day)",
//             "stages": ["Assign POC", "Introductory Call Pending"]
//         },
//         {
//             "longText": "We are searching a mentor for your profile",
//             "stages": ["Look for a Mentor", "Confirm Mentor with Candidate"]
//         },
//         {
//             "longText": "We are scheduling a mock interview for you",
//             "stages": ["Schedule Session"]
//         },
//         {
//             "longText": "Your interview is scheduled",
//             "stages": ["Attend/Record Session"]
//         },
//         {
//             "longText": "Mock Interview Completed. Hope you had a great experience!",
//             "stages": [" Collect Feedback and Testimonial","To DB", "To Database"]
//         }
//     ],
//     "consulting-session":[
//         {
//             "longText": "You will receive an introductory call from Preplaced (within 1 day)",
//             "stages": ["Assign POC", "Introductory Call Pending"]
//         },
//         {
//             "longText": "We are searching a mentor for your profile",
//             "stages": ["Look for a Mentor", "Confirm Mentor with Candidate"]
//         },
//         {
//             "longText": "We are scheduling a consulting session for you",
//             "stages": ["Schedule Session"]
//         },
//         {
//             "longText": "Your session is scheduled",
//             "stages": ["Attend/Record Session"]
//         },
//         {
//             "longText": "Session Completed. Hope all your doubts were cleared",
//             "stages": [" Collect Feedback and Testimonial","To DB", "To Database"]
//         }
//     ],
//     "interview-preparation-bundle":[
//         {
//             "longText": "You will receive an introductory call from Preplaced (within 1 day)",
//             "stages": ["Assign POC", "Introductory Call Pending"]
//         },
//         {
//             "longText": "We are searching a mentor for your profile",
//             "stages": ["Look for a Mentor", "Confirm Mentor with Candidate"]
//         },
//         {
//             "longText": "We are scheduling a goal setting session for you",
//             "stages": ["Schedule Goal Setting"]
//         },
//         {
//             "longText": "Your interview preparation is in progress",
//             "stages": ["Schedule 1st Mock", "Attend/Record 1st Mock", "Schedule 2nd Mock","Attend/Record 2nd Mock","Schedule 3rd Mock", "Attend/Record 3rd Mock"]
//         },
//         {
//             "longText": "Package Completed. You are now ready to crack the interview!",
//             "stages": ["Collect Feedback and Testimonial", "To DB", "To Database"]
//         }
//     ]
// }

let sessionClassMapping = {
    'Consulting Session': 'consulting-session',
    'Mock Interview': 'mock-interview',
    'Goal Setting': 'goal-setting'
}


function createClone(id, idSuffix, parentDOMID){
    try{
        let domToClone = parentDOMID ? getElement(id, parentDOMID) : getElement(id);
        let domToBeAppended = domToClone.cloneNode(true);
        domToBeAppended.id = domToBeAppended.id + "-" + idSuffix;
        showElements([domToBeAppended]);
        domToClone.parentElement.appendChild(domToBeAppended);
        return domToBeAppended;
    }
    catch(e){
        console.error(e, id, parentDOMID);
    }
}

function textAssigner(funcParams){
    let { id, value, idAppender, parentDOMID } = funcParams;
    try{
        let domElement = parentDOMID ? getElement(id, parentDOMID) : getElement(id);
        if (idAppender){
            domElement.id = id + "-" + idAppender;
        }
        domElement.innerText = value;
    }
    catch(e){
        console.error(e);
    }
} 

function assignValues(funcParams){
    let { domArray, idAppender, parentDOMID } = funcParams;
    for (let domIndex in domArray){
        let domObject = domArray[domIndex];
        let domElement = getElement(domObject.id, parentDOMID);
        if (domObject.class){
            domElement.classList.add(domObject.class);
        }
        if (domObject.hide){
            hideElements([domElement]);
        }
        else if (!domObject.value && domObject.hideIfEmpty){
            hideElements([getElement(domObject.hideIfEmpty, parentDOMID)]);
        }
        else{
            if (domObject.type === "link"){
                domElement.href = domObject.value;
            }
            else if (domObject.type === "button"){
                domElement.onclick = domObject.value;
            }
            else{
                textAssigner({
                    id : domObject.id, 
                    value : domObject.value, 
                    idAppender : (domObject.idSuffix || idAppender), 
                    parentDOMID
                });
            }
            // if (domObject.hideIfEmpty){ //show the hideIfEmpty dom if value present
            //     showElements([getElement(domObject.hideIfEmpty)]);
            // }
        }
    }
}

function parsePipefyMeetLink(meetingLink){
    if (meetingLink){
        return `https://${meetingLink}`
    }
    return null;
}

function parsePipefyDocLink(docLink){
    if (docLink){
        let linkSplit = docLink.split(" ");
        let parsedDocLink = linkSplit[0]
        if(linkSplit.length > 2){
            parsedDocLink = `${parsedDocLink}?passcode=${linkSplit[2]}`
        }
        return parsedDocLink;
    }
    return null;
}

function convertPipefyToPackageObject(orderObject, addToSessionDetailsCallback, assignPackageDetailsCallback){
    let pipefyObject = orderObject.pipefy_object;

    let packageObject = {
        "orderID": orderObject.orderId,
        "packageRecordID": orderObject.orderId,
        "packageType": packageMap[orderObject.Package],
        "status": getPipefyMapping(pipefyObject.order_status)["package_status"],
    }
    if (pipefyObject["mentor_name"]){
        packageObject["mentor"]= {
            "name": pipefyObject["mentor_name"],
            "company": pipefyObject["mentor_company"],
            "linkedInURL": pipefyObject["mentor_linkedin_url"],
        }
    }
    pipefyObject["myinterviewdoc_link"] = parsePipefyDocLink(pipefyObject["myinterviewdoc_link"]);
    if (orderObject.Package === "consulting-session"){
        packageObject.sessions = [{
            "recordID": orderObject.orderId + "1",
            "status": getPipefyMapping(pipefyObject.order_status)["session_status"],
            "type": "Consulting Session"
        }]
        addToSessionDetailsCallback(orderObject.orderId + "1", {
            "meetingLink": parsePipefyMeetLink(pipefyObject["meeting_link"]),
            "packageType": "Consulting Session",
            "sessionRecordID": orderObject.orderId + "1",
            "sessionStartTime": pipefyObject["mock_interview_date_time"],
            "sessionType": "Consulting Session",
            "status": getPipefyMapping(pipefyObject.order_status)["session_status"]
        }, pipefyObject, orderObject);
    }
    else if (orderObject.Package === "mock-interview"){
        packageObject.sessions = [{
            "recordID": orderObject.orderId + "1",
            "status": getPipefyMapping(pipefyObject.order_status)["session_status"],
            "type": "Mock Interview"
        }]
        addToSessionDetailsCallback(orderObject.orderId + "1", {
            "meetingLink": parsePipefyMeetLink(pipefyObject["meeting_link"]),
            "packageType": "Mock Interview",
            "sessionRecordID": orderObject.orderId + "1",
            "sessionStartTime": pipefyObject["mock_interview_date_time"],
            "sessionType": "Mock Interview",
            "status": getPipefyMapping(pipefyObject.order_status)["session_status"]
        });
    }
    else if (orderObject.Package === "interview-preparation-bundle"){
        packageObject.sessions = [
            {
                "recordID": orderObject.orderId + "1",
                "status": getPipefyMapping(pipefyObject.order_status)["goal_setting_status"],
                "type": "Goal Setting"
            },
            {
                "recordID": orderObject.orderId + "2",
                "status": getPipefyMapping(pipefyObject.order_status)["first_mock_status"],
                "type": "Mock Interview"
            },
            {
                "recordID": orderObject.orderId + "3",
                "status": getPipefyMapping(pipefyObject.order_status)["second_mock_status"],
                "type": "Mock Interview"
            },
            {
                "recordID": orderObject.orderId + "4",
                "status": getPipefyMapping(pipefyObject.order_status)["third_mock_status"],
                "type": "Mock Interview"
            },
        ]
        addToSessionDetailsCallback(orderObject.orderId + "1", {
            "meetingLink": parsePipefyMeetLink(pipefyObject["goal_setting_meeting_link"]),
            "packageType": "Interview Preparation Bundle",
            "sessionRecordID": orderObject.orderId + "1",
            "sessionStartTime": pipefyObject["goal_setting_date_time"],
            "sessionType": "Goal Setting",
            "status": getPipefyMapping(pipefyObject.order_status)["goal_setting_status"]
        });
        addToSessionDetailsCallback(orderObject.orderId + "2", {
            "meetingLink": parsePipefyMeetLink(pipefyObject["first_mock_meeting_link"]),
            "packageType": "Interview Preparation Bundle",
            "recordingLink": pipefyObject["first_mock_recording_link"],
            "sessionRecordID": orderObject.orderId + "2",
            "sessionStartTime": pipefyObject["first_mock_date_time"],
            "sessionType": "Mock Interview",
            "status": getPipefyMapping(pipefyObject.order_status)["first_mock_status"]
        });
        addToSessionDetailsCallback(orderObject.orderId + "3", {
            "meetingLink": parsePipefyMeetLink(pipefyObject["second_mock_meeting_link"]),
            "packageType": "Interview Preparation Bundle",
            "recordingLink": pipefyObject["second_mock_recording_link"],
            "sessionRecordID": orderObject.orderId + "3",
            "sessionStartTime": pipefyObject["second_mock_date_time"],
            "sessionType": "Mock Interview",
            "status": getPipefyMapping(pipefyObject.order_status)["second_mock_status"],
        });
        addToSessionDetailsCallback(orderObject.orderId + "4", {
            "meetingLink": parsePipefyMeetLink(pipefyObject["third_mock_meeting_link"]),
            "recordingLink": pipefyObject["third_mock_recording_link"],
            "packageType": "Interview Preparation Bundle",
            "sessionRecordID": orderObject.orderId + "4",
            "sessionStartTime": pipefyObject["third_mock_date_time"],
            "sessionType": "Mock Interview",
            "status": getPipefyMapping(pipefyObject.order_status)["third_mock_status"]
        });
    }
    orderObject["package_object"] = packageObject;
    assignPackageDetailsCallback(orderObject);
}


function getPipefyMapping(pipefyStatus) {
    let mapping_object = {
        "package_status": "Assign POC",
        "session_status": "Schedule Session",
        "goal_setting_status": "Schedule Session",
        "first_mock_status": "Schedule Session",
        "second_mock_status": "Schedule Session",
        "third_mock_status": "Schedule Session"
    }
    switch(pipefyStatus){
        case("Look for a Mentor"):
        case("Confirm Mentor with Candidate"):
            mapping_object["package_status"] = "Look For Mentor";
            break;
        case("Schedule Session"):
            mapping_object["package_status"] = "Package In Progress";
            break;
        case("Attend/Record Session"):
            mapping_object["package_status"] = "Package In Progress";
            mapping_object["session_status"] = "Attend Session";
            break;
        case("Schedule Goal Setting"): 
            mapping_object = {
                "package_status": "Package In Progress",
                "goal_setting_status": "Schedule Session",
                "first_mock_status": "Schedule Session",
                "second_mock_status": "Schedule Session",
                "third_mock_status": "Schedule Session"
            }
            break;
        case("Schedule 1st Mock"):
            mapping_object = {
                "package_status": "Package In Progress",
                "goal_setting_status": "Session Completed",
                "first_mock_status": "Schedule Session",
                "second_mock_status": "Schedule Session",
                "third_mock_status": "Schedule Session"
            }
            break;
        case("Attend/Record 1st Mock"):
            mapping_object = {
                "package_status": "Package In Progress",
                "goal_setting_status": "Session Completed",
                "first_mock_status": "Attend Session",
                "second_mock_status": "Schedule Session",
                "third_mock_status": "Schedule Session"
            }
            break;
        case("Schedule 2nd Mock"):
            mapping_object = {
                "package_status": "Package In Progress",
                "goal_setting_status": "Session Completed",
                "first_mock_status": "Session Completed",
                "second_mock_status": "Schedule Session",
                "third_mock_status": "Schedule Session"
            }
            break;
        case("Attend/Record 2nd Mock"):
            mapping_object = {
                "package_status": "Package In Progress",
                "goal_setting_status": "Session Completed",
                "first_mock_status": "Session Completed",
                "second_mock_status": "Attend Session",
                "third_mock_status": "Schedule Session"
            }
            break;
        case("Schedule 3rd Mock"):
            mapping_object = {
                "package_status": "Package In Progress",
                "goal_setting_status": "Session Completed",
                "first_mock_status": "Session Completed",
                "second_mock_status": "Session Completed",
                "third_mock_status": "Schedule Session"
            }
            break;
        case("Attend/Record 3rd Mock"):
            mapping_object = {
                "package_status": "Package In Progress",
                "goal_setting_status": "Session Completed",
                "first_mock_status": "Session Completed",
                "second_mock_status": "Session Completed",
                "third_mock_status": "Attend Session",
            }
            break;
        case(" Collect Feedback and Testimonial"):
        case("Collect Feedback and Testimonial"):
        case("To DB"):
        case("To Database"):
            mapping_object = {
                "package_status": "Package Completed",
                "session_status": "Session Completed",
                "goal_setting_status": "Session Completed",
                "first_mock_status": "Session Completed",
                "second_mock_status": "Session Completed",
                "third_mock_status": "Session Completed"
            }
            break;
        case("Assign POC"):
        case("Introductory Call Pending"):
        default:
            break;
    }
    return mapping_object;
}



function assignPackageDetails(orderObject){
    let orderId = orderObject.orderId || packageObject['packageRecordID'];
    let packageDOM = createClone('package-status-container', orderId);
    let packageDOMID = 'package-status-container-' + orderId;
    let packageObject = orderObject.package_object;
    let mentorDetails = packageObject['mentor'];
    let packageStatusMapping =[
        {
            'id': 'package-title',
            'value': packageObject['packageType'],
        },
        {
            'id': 'package-id',
            'value': `packageID: ${packageObject['packageRecordID']}`, 
        },
        {
            'id': 'current-status-text',
            'value': package_status[packageObject['status']] &&  package_status[packageObject['status']].short, 
        },
        {
            'id': 'interview-domain',
            'value': `${orderObject['Domain']} Interviews`, 
        },
        {
            'id': 'target-companies',
            'value': orderObject['Target Companies'],
            'hideIfEmpty' : 'target-companies-container'
        },
        {
            'id': 'mentor-designation',
            'value': orderObject['Designation'], 
            'hideIfEmpty': 'mentor-designation-container'
        },
        {
            'id': 'poc-details',
            'value': packageObject['POC'] ? `${packageObject['POC']['name']}, ${packageObject['POC']['phoneNumber']}` : null,
            'hideIfEmpty': 'poc-container'
        },
        {
            'id': 'mentor-name',
            'value': (mentorDetails && mentorDetails['name']), 
            'hideIfEmpty': 'mentor-container'
        },
        {
            'id': 'mentor-sub-info',
            'value': (mentorDetails ? `${mentorDetails['designation'] || ''}, ${mentorDetails['company'] || ''}` : 'Not Assigned yet')
        }
    ];
    
    assignValues({   
        domArray: packageStatusMapping, 
        idAppender: orderId, 
        parentDOMID: packageDOMID 
    });
    let mentorLinkedInButton = getElement('mentor-linkedin-profile', packageDOMID);
    mentorLinkedInButton.id = mentorLinkedInButton.id + '-' + packageDOMID;
    if (mentorDetails){
        if (mentorDetails['linkedInURL']){
            mentorLinkedInButton.href = mentorDetails['linkedInURL'];
        }
        else{
            hideElements([mentorLinkedInButton]);
        }
    }
    else{
        hideElements([mentorLinkedInButton]);
    }
    !!packageObject && setSessionValues(packageObject['sessions'], packageDOMID);
}

function setSessionValues(sessions, packageDOMID){
    let valueMapping;
    if (sessions.length === 0){
        hideElements([getElement('sessions-card-container', packageDOMID)]);
        return;
    }
    for (let sessionIndex in sessions){
        let sessionObject = sessions[sessionIndex];
        let sessionTypeID = sessionClassMapping[sessionObject['type']]
        let sessionDom = createClone(`${sessionTypeID}-sample`, sessionObject['recordID'], packageDOMID);
        let toFade = ["Schedule Session", "Session Cancelled"].includes(sessionObject['status']);
        sessionDom.classList = `session-container ${sessionClassMapping[sessionObject['type']]} ${toFade ? 'dim' : ''}`;
        showElements([sessionDom]);
        valueMapping = [
            {
                'id': `${sessionTypeID}-title`,
                'value': sessionObject['type'],
                'idSuffix': sessionObject['recordID']
            },
            {
                id: `${sessionTypeID}-status-overview`,
                value: session_status[sessionObject['status']] && session_status[sessionObject['status']].short,
                'idSuffix': sessionObject['recordID']
            },
            {
                'id': `${sessionTypeID}-view-button`,
                'type': 'button',
                'class': (toFade ? 'disabled' : null),
                'value': () => { toFade ? null : getSessionDetails(sessionObject['recordID'])},
                'idSuffix': sessionObject['recordID']
            }
        ];
        let sessionDOMID = `${sessionTypeID}-sample-${sessionObject['recordID']}`;
        assignValues({   
            domArray: valueMapping, 
            idAppender: (Math.random() * 100000000000000000), 
            parentDOMID: sessionDOMID 
        });
    }
    
}

function getSessionDetails(sessionID){
    if (sessionDetails[sessionID]){
        onSessionDetailsFetched(sessionID);
    }
    else{
        let url = apiBaseURL+ `user/get-session-details?session_id=${sessionID}`;
        getAPI(url, function(response){
        if (response.status === 200){
            var sessionData = response.data
            sessionDetails[sessionID] = sessionData;
            onSessionDetailsFetched(sessionID);
        }
        }, function(error){
            console.error("Dashboard: error while getting sessions - ", error);
        });
    }
}

function onSessionDetailsFetched(sessionID){
    let sessionObject = sessionDetails[sessionID];
    let sessionOverlay = getElement('session-overlay');
    let sessionComplete = false;
    try{
        sessionComplete = (new Date() > new Date(sessionObject['sessionEndTime'] || sessionObject['sessionStartTime']))
    }
    catch(e){

    }
    let valueMapping = [
        {
            'id': 'session-modal-title',
            value: sessionObject["sessionType"] || "Mock Interview"
        },
        {
            'id': 'session-id-text',
            value: `Session ID: ${sessionID}`
        },
        {
            'id': 'session-status',
            'value': session_status[sessionObject['status']] && session_status[sessionObject['status']].long,
        },
        {
            'id': 'session-time',
            'value': sessionObject['sessionStartTime'] ? 
                getFormattedDate(sessionObject['sessionStartTime'])
                : null,
            'hideIfEmpty': 'session-time-container'
        },
        {
            'id': 'meeting-link',
            'value': sessionObject['meetingLink'],
            'type': 'link',
            'hideIfEmpty': 'meeting-link-container'

        },
        {
            'id': 'myinterviewdoc-link',
            'value': sessionObject['myInterviewDocLink'],
            'type': 'link',
            'hideIfEmpty': 'myinterviewdoc-link-container'

        },
        {
            'id': 'submit-mentor-feedback',
            'value': !sessionObject['feedbackReportForMentorLink'] && sessionComplete && sessionObject['feedbackForMentorSubmissionLink'],
            'type': 'link',
            'hideIfEmpty': 'submit-mentor-feedback'

        },
        {
            'id': 'download-feedback-button',
            'value': sessionObject['feedbackReportForCandidateLink'],
            'type': 'link',
            'hideIfEmpty': 'download-feedback-button'

        }
    ];
    assignValues({   
        domArray: valueMapping, 
        parentDOMID: 'session-overlay' 
    });
    showElements([sessionOverlay]);
}

getElement('close-session-modal').onclick = function(){
    hideElements([getElement('session-overlay')]);
}

let pipeftIDMappings = {
    "consulting-session": [
        {
            "pipefy_key":"mentor_name",
            "dom_id": "consulting-mentor-name",
            "type": "text",
            "defaultText": "N/A"
        },
        {
            "pipefy_key":"mentor_linkedin_url",
            "dom_id": "consulting-linkedin-profile",
            "type": "link"
        },
        {
            "pipefy_key":"mock_interview_date_time",
            "dom_id": "consulting-meeting-date",
            "type": "text",
            "defaultText": "Not Scheduled"
        },
        {
            "pipefy_key":"meeting_link",
            "dom_id": "consulting-meeting-link",
            "type": "link"
        },
        {
            "pipefy_key":"myinterviewdoc_link",
            "dom_id": "consulting-myinterviewdoc-link",
            "type": "link"
        }
    ],
    "mock-interview": [
        {
            "pipefy_key":"mentor_name",
            "dom_id": "mock-mentor-name",
            "type": "text",
            "defaultText": "N/A"
        },
        {
            "pipefy_key":"mentor_linkedin_url",
            "dom_id": "mock-linkedin-profile",
            "type": "link"
        },
        {
            "pipefy_key":"mock_interview_date_time",
            "dom_id": "mock-meeting-date",
            "type": "text",
            "defaultText": "Not Scheduled"
        },
        {
            "pipefy_key":"meeting_link",
            "dom_id": "mock-meeting-link",
            "type": "link"
        },
        {
            "pipefy_key":"myinterviewdoc_link",
            "dom_id": "mock-myinterviewdoc-link",
            "type": "link"
        }
    ],
    "interview-preparation-bundle": [
        {
            "pipefy_key":"mentor_name",
            "dom_id": "ipb-mentor-name",
            "type": "text",
            "defaultText": "N/A"
        },
        {
            "pipefy_key":"mentor_linkedin_url",
            "dom_id": "ipb-linkedin-profile",
            "type": "link"
        },
        {
            "pipefy_key":"first_mock_date_time",
            "dom_id": "ipb-meeting-date-1",
            "type": "text",
            "defaultText": "Not Scheduled"
        },
        {
            "pipefy_key":"first_mock_meeting_link",
            "dom_id": "ipb-meeting-link-1",
            "type": "link"
        },
        {
            "pipefy_key":"second_mock_date_time",
            "dom_id": "ipb-meeting-date-2",
            "type": "text",
            "defaultText": "Not Scheduled"
        },
        {
            "pipefy_key":"second_mock_meeting_link",
            "dom_id": "ipb-meeting-link-2",
            "type": "link"
        },
        {
            "pipefy_key":"third_mock_date_time",
            "dom_id": "ipb-meeting-date-3",
            "type": "text",
            "defaultText": "Not Scheduled"
        },
        {
            "pipefy_key":"third_mock_meeting_link",
            "dom_id": "ipb-meeting-link-3",
            "type": "link"
        },
        {
            "pipefy_key":"myinterviewdoc_link",
            "dom_id": "ipb-myinterviewdoc-link",
            "type": "link"
        }
    ]
}

function addToSessionDetails(sessionId, sessionObject, pipefyObject, orderObject){
    sessionObject.mentor = {
        "linkedInURL": pipefyObject["mentor_linkedin_url"],
        "name": pipefyObject["mentor_name"],
    };
    sessionObject.myInterviewDocLink = pipefyObject["myinterviewdoc_link"];
    sessionObject.orderID = orderObject.orderId;
    sessionDetails[sessionId] = sessionObject;
}




// function updateAndReturnPipefyStatus(domToBeAppended, packageDetails){
//     try{
//         let packageType = packageDetails["Package"];
//         let completedClassList = ["completed", "inactive"];
//         let ongoingClassList = ["currently-active", `add-border-pulse-${packageType}`];
//         let incompleteClassList = ["inactive"];
//         let timeline = mappings[packageType];
//         let foundCurrentStage = false;
//         let pipefyData = packageDetails["pipefy_object"]
//         let currentPipefyStage = pipefyData["order_status"].trim();
//         for (stepIndex in timeline){
//             let step = timeline[stepIndex];
//             let stepId = `${packageType}-step${parseInt(stepIndex)+1}`;
//             let stepDom = domToBeAppended.querySelector(`#${stepId}`);
//             stepDom.id=stepId+"-"+ (packageDetails["orderId"] || packageDetails["payment id"])
//             if (stepDom){
//                 if (foundCurrentStage){ // incomplete ones
//                         for (classindex in completedClassList){
//                             stepDom.classList.remove(completedClassList[classindex]);
//                         }
//                         for (classindex in ongoingClassList){
//                             stepDom.classList.remove(ongoingClassList[classindex]);
//                         }
//                         for (classindex in incompleteClassList){
//                             stepDom.classList.add(incompleteClassList[classindex]);
//                         }
//                 }
//                 else {
//                     if (step.stages.includes(currentPipefyStage)){ // ongoing step
//                         for (classindex in completedClassList){
//                             stepDom.classList.remove(completedClassList[classindex]);
//                         }
//                         for (classindex in incompleteClassList){
//                             stepDom.classList.remove(incompleteClassList[classindex]);
//                         }
//                         for (classindex in ongoingClassList){
//                             stepDom.classList.add(ongoingClassList[classindex]);
//                         }
//                         foundCurrentStage=true;
//                     }
//                     else { // completed ones
//                         for (classindex in ongoingClassList){
//                             stepDom.classList.remove(ongoingClassList[classindex]);
//                         }
//                         for (classindex in incompleteClassList){
//                             stepDom.classList.remove(incompleteClassList[classindex]);
//                         }
//                         for (classindex in completedClassList){
//                             stepDom.classList.add(completedClassList[classindex]);
//                         }
//                     }
//                 }
//                 stepDom.querySelector(".fe02_card_titles div").innerText = step.longText;
//             }
//         }

//         //Assigning Links And Text
//         let assigningArray = pipeftIDMappings[packageType];
//         for (mappingElementIndex in assigningArray){
//             try{
//                 let mappingElement = assigningArray[mappingElementIndex];
//                 let mappingElementData = pipefyData[mappingElement.pipefy_key];
//                 let dataDom = domToBeAppended.querySelector(`#${mappingElement.dom_id}`);
//                 dataDom.id=dataDom.id+"-"+ (packageDetails["orderId"] || packageDetails["payment id"]);
//                 switch(mappingElement.type){
//                     case("text"):
//                         if (mappingElementData){
//                             dataDom.innerText = mappingElementData;
//                         }
//                         else{

//                             dataDom.innerText = mappingElement.defaultText || "N/A";
//                         }
//                         break;
//                     case("link"):
//                         if (mappingElementData){
//                             dataDom.onclick = function(){
//                                 if (!mappingElementData.includes("https://") && !mappingElementData.includes("http://")){
//                                     mappingElementData = "https://"+mappingElementData;
//                                 }
//                                 window.open(mappingElementData);
//                             }
//                         }
//                         else{
//                             dataDom.style.cursor = "not-allowed";
//                         }
//                 }
//             }
//             catch(error){
//                 console.error("error setting the pipefy data: ", error);
//             }
//         }

        
//     }
//     catch(error){
//         console.error("error setting the package status");
//     }
//     return domToBeAppended;
// }

// function addPackageContainer(packageDetails){
//     try{
//         let domToClone = document.getElementById(`${packageDetails["Package"]}-package`);
//         let domToBeAppended = domToClone.cloneNode(true);
//         domToBeAppended.id = domToBeAppended.id + "-" + (packageDetails["orderId"] || packageDetails["payment id"]);
//         domToBeAppended.querySelector(".domain-text").innerText = `${packageDetails["Domain"]} Interviews`;
//         let targetCompanies = packageDetails["Target Companies"];
//         if (targetCompanies){
//             domToBeAppended.querySelector(".companies-text").innerText = `${packageDetails["Target Companies"]}`;
//         }
//         else {
//             domToBeAppended.querySelector(".companies-text").innerText = `your preferred company`;
//         }
//         domToBeAppended.querySelector(".payment-title").innerText = packageDetails["Payment Status"] === "Paid" ? "Payment Received": "Payment Pending";
//         // __TODO__ addInvoiceDetails
//         if (!!packageDetails["pipefy_object"]){
//             domToBeAppended = updateAndReturnPipefyStatus(domToBeAppended, packageDetails);
//         }
//         else {
//             packageDetails["pipefy_object"] = {
//                 "order_status": "Assign POC"
//             }
//             domToBeAppended = updateAndReturnPipefyStatus(domToBeAppended, packageDetails);
//         }
//         // hanlding showing of purchase date
//         let purchaseDate = packageDetails["pipefy_object"]["purchase_date"];
//         let purchadeDateDom = domToBeAppended.querySelector(".purchase-date-text");
//         if (purchaseDate && purchadeDateDom){
//             purchadeDateDom.innerText = new Date(purchaseDate).toDateString()
//         }
//         else if(!purchaseDate && purchadeDateDom){
//             hideElements([purchadeDateDom.parentNode]);
//         }
//         domToBeAppended.style.display = "block";
//         let packagesContainer = document.getElementById("packages-container");
//         packagesContainer.insertBefore(domToBeAppended, packagesContainer.firstChild);
//     }
//     catch(error){
//         console.error("error adding the package");
//     }
// }


// getOrderDetails
function getOrderDetails(){
    let url = apiBaseURL+ `user/get-user-order-details`;
    let ongoingPackageTitleShown = false;
    getAPI(url, function(response){
    if (response.status === 200){
        var orders = response.data
        orders.reverse().forEach(function (orderDetails){
            if (orderDetails["Payment Status"] !== "Not Paid"){
                if (orderDetails.package_object){
                    assignPackageDetails(orderDetails);
                }
                else if(orderDetails.pipefy_object){
                    convertPipefyToPackageObject(orderDetails, addToSessionDetails, assignPackageDetails);
                }
                if(!ongoingPackageTitleShown){
                    showElements([getElement('ongoing-packages-title')]);
                    ongoingPackageTitleShown = true;
                }
            }
        });
    }
    else{
        console.error("Dashboard: error while getting orders");
    }
    }, function(error){
        window["apiError"] = error;
        if (error && error.response && error.response.status === 400){
            console.error("Error while getting the user details. Refreshing as token expired");
            window.location.reload();
        }
        else{
            console.error("Dashboard: error while getting orders - ", error);
        }
    });
}

closeIcon.onclick = function(){
    hideElements([formOverlay]);
    // restrict background scrolling
    document.documentElement.style.overflow = 'scroll';
    document.body.scroll = "yes";
}

function addUserCompletionForm(profileComplete){
    if (!profileComplete){
        showElements([formOverlay]);
        userCompleptionForm.style.height = "calc(100% - 60px)";
        // restrict background scrolling
        document.documentElement.style.overflow = 'hidden';
        document.body.scroll = "no";
        let userPhoneNumber = encodeURIComponent(verifiedUser.phoneNumber);
        let iframeDoc = document.createElement("iframe");
        iframeDoc.src = "https://tally.so/embed/mVJvNm?hideTitle=1&alignLeft=1&transparentBackground=1&phoneNo="+userPhoneNumber;
        iframeDoc.width = "100%";
        iframeDoc.height = "100%";
        iframeDoc.frameborder="0";
        iframeDoc.marginheight="0";
        iframeDoc.marginwidth="0"; 
        iframeDoc.title="Complete Your Profile";
        userCompleptionForm.appendChild(iframeDoc);
    }
    // <iframe src="https://tally.so/embed/mVJvNm?hideTitle=1&alignLeft=1&transparentBackground=1" width="100%" height="500" frameborder="0" marginheight="0" marginwidth="0" title="Complete Your Profile"></iframe>
}

function checkIfUserProfileIsComplete(){
    if (!profileCompleted){ //profile complete not in localStorage, checking on the server
        checkUserProfile(addUserCompletionForm);
    }
    
}

function authenticateAndUpdateUserName() {
    if (accessToken){
        let welcomeDom = getElement("welcome-text");
        if (!verifiedUser){
            firebase.auth().onAuthStateChanged(function (user) {
                if (user){
                    welcomeDom.innerText = `Welcome, ${user.displayName}`;
                    showElements([welcomeDom]);
                    getOrderDetails();
                    checkIfUserProfileIsComplete();
                }
                else {
                    redirect('/', true);
                }
            });
        }
        else{
            welcomeDom.innerText = `Welcome, ${verifiedUser.displayName}`;
            showElements([welcomeDom]);
            getOrderDetails();
            checkIfUserProfileIsComplete();
        }
    }
    else{
        redirect('/', true);
    }
}

authenticateAndUpdateUserName();
