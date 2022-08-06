console.log("Loading File Dashboard V3");
const DATE_TIME_OPTION ={ month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
const DATE_OPTION ={ month: 'long', day: 'numeric' };
const SESSION_COMPLETED_STATUSES = ["Take Session Feedback", "Session Completed"];
const SESSION_STATUS_MAP = {
    "Schedule Session": "To Be Scheduled",
    "Attend Session": "Session Scheduled",
    "Take Session Feedback": "Session Completed",
    "Session Cancelled": "Session Cancelled",
    "Session Completed": "Session Completed",
}

const JOIN_SLACK_LINK = "https://join.slack.com/t/preplaced-community/shared_invite/zt-1dicxbmfb-bVy2PGkvAn4TW0dHIRlj8A";
let slackCTALink = JOIN_SLACK_LINK;

let welcomeText = getElement("welcome-text");
let packageDropdown = getElement("package-selector");
let packageDropdownContainer = getElement("package-selector-form");
let packageStatusList = getElement("package-status-list");
let packageContainer = getElement("package-container");
let packageName =  getElement("package-type-name");
let packageID = getElement("package-id");
let domainName = getElement("interview-domain");
let targetCompanies = getElement("target-companies");
let targetRole = getElement("target-role");
let rmName = getElement("rm-name");
let rmContainer = getElement("poc-container");
let slackTitle = getElement("slack-title");
let slackCTA = getElement("slack-cta");
let mentorName = getElement("mentor-name");
let mentorProfile = getElement("mentor-profile");
let mentorProfileCTA = getElement("mentor-profile-cta");
let mentorProfilePicture = getElement("mentor-profile-pic");
let mentorProfileContainer = getElement("mentor-profile-container");
let plannerDocTitle= getElement("planner-title");
let plannerDocCTA = getElement("planner-cta");
let plannedDocContainer = getElement("planner-container");
let packageGuidelinesCTA = getElement("package-guidelines-cta");
let packageGuidelinesContainer = getElement("package-guidelines-container");
let exploreProgramsSection = getElement("explore-programs-section");
let sessionContainer = getElement("session-container");

const activeFormsContainer = getElement("active-form-container");
const activeFormsHeader = getElement("active-form-title");
const activeFormsSubtext = getElement("active-form-subtitle");
const activeFormsCTA = getElement("active-form-link");
const activeFormsModal = getElement("active-form-modal");
const activeFormsEmbed = getElement("embed-user-form");
const closeModalIcon = getElement("modal-close-icon");

const DUMMY_SESSION_ID = "dummy-session-container"
const SESSION_CONTAINER = "session-container";
const SESSION_NAME = "session-name";
const SESSION_DATE = "session-date";
const SESSION_STATUS = "session-status";
const SESSION_CTA = "session-cta";
const ACTIVE_ICON_IDENTIFIER = "lottie-animation-23";

const sessionsContainer = getElement("sessions-container");
const dummySessionContainer = getElement(DUMMY_SESSION_ID);


const loaderSpinner = getElement("loader-overlay");

let logoutonDashboardButton = getElement("dashboard-button");

logoutonDashboardButton.innerText = "Log out"
logoutonDashboardButton.onclick = function(event) {
    event.preventDefault();
    signOutUser();
}


///Things to Interact with
/*
Candidate Name : welcome-text | Welcome Human 👋🏼
Package Dropdown: package-dropdown
Active Form Container: active-form-container
Active Form Title: active-form-title 
Active Form Subtitle: active-form-subtitle 
Active Form Link: active-form-link 

Package Name: package-title
Package ID: package-id
Preparing For (Domain): interview-domain
Target Companies: target-companies
Target Role: target-role
RM Name: rm-name

Session Container: session-container
Session Name: session-name
Session Date: session-date
Session Status: session-status
Session CTA: session-cta

Slack Title: slack-title
Slack CTA: slack-cta


Mentor Name: mentor-name
Mentor Profile: mentor-profile
Mentor Profile: mentor-profile-cta



Planner CTA: planner-cta
Planner Title: planner-title

Package Guidelines CTA: package-guidelines-cta





Different Statuses

Package Status:
Package Onboarding
Mentor Matchmaking
Sessions In Progress
Package Feedback
Package Completed


Package Onboarding Status:
Assign Relationship Manager
Get Candidate Profile Completed
Get Package Onboarding Form Completed
Done


Status (from Potential Mentor Assignment):
Confirm Mentor With Candidate
Confirm Candidate With Mentor
Rejected By The Candidate
Rejected By The Mentor
Accepted


Session Status (from Active Session):
Schedule Session
Attend Session
Take Session Feedback
Session Cancelled
Session Completed

*/

const getCurrentStatus= () => {
    let step1Text="";
    let step2Text="";
    let step3Text="";
    let activeStep=1;
    
    let phaseStatus = "Package Onboarding";
    let packageOnboardingStatus = "Assign Relationship Manager";
    switch(phaseStatus){
        case("Package Onboarding"):
            switch(packageOnboardingStatus){
                case("Assign Relationship Manager"):
                case("Get Candidate Profile Completed"):
                    step1Text = "Waiting For Profile Completion";
                    step2Text = "Filling Package Expectation Form";
                    step3Text = "Mentor Assignment";
                    activeStep = 1;
                    break;
                case("Get Package Onboarding Form Completed"):
                    step1Text = "Waiting For Package Expectation";
                    step2Text = "Mentor Assignment";
                    step3Text = "Package Kickoff";
                    activeStep = 1;
                    break;
                case("Done"):
                    step1Text = "Looking for a Mentor";
                    step2Text = "Mentor Assignment";
                    step3Text = "Package Kickoff";
                    activeStep = 1;
                    break;
            }
            break;
    }

}


const setPackageStatus = () =>{
    let packageStatus = activePackage.packageStatus;
    let activeIndex = 0;
    switch(packageStatus){
        case("Package Onboarding"):
        case("Mentor Matchmaking"):
            activeIndex = 0;
            break;
        case("Sessions In Progress"):
        case("Package Paused"):
            activeIndex = 1;
            break;
        case("Post Package Steps"):
        case("Package Expired"):
            activeIndex = 2
    }
    // setting correct classes
    for (let index=0; index < packageStatusList.children.length; index++){
        if (index == activeIndex){
            console.log("Active: ", packageStatusList.children[index]);
            packageStatusList.children[index].classList = "progress-state"
            showElements([packageStatusList.children[index].querySelector("."+ACTIVE_ICON_IDENTIFIER)])
        }
        else{
            console.log("Inactive: ", packageStatusList.children[index]);
            packageStatusList.children[index].classList = "progress-state inactive"
            hideElements([packageStatusList.children[index].querySelector("."+ACTIVE_ICON_IDENTIFIER)])
        }
    }
}



let candidateData = {};
let activePackage;
let packageList;

const getSlackChannelLink = (channelID) => {
    return `https://preplaced-community.slack.com/archives/${channelID}`;
}

const getSlackProfileLink = (userID) => {
    return `https://preplaced-community.slack.com/team/${userID}`
}


const setActiveForms = () =>{
    //show first needed Active Form
    let activeForms = candidateData.activeForms;
    if (activeForms.length > 0){
        let priorityList = ["P5", "P4", "P3","P2", "P1"];
        let formToShow;
        let priorityIndex = -1;
        for (let formIndex in activeForms){
            let currentForm = activeForms[formIndex];
            if (currentForm.status == "Active" && priorityList.indexOf(currentForm.cfgActiveForms[0].priority) >= priorityIndex){
                formToShow = currentForm;
                priorityIndex = priorityList.indexOf(currentForm.cfgActiveForms[0].priority);
            }
        }
        if (formToShow){
            activeFormsHeader.innerText = formToShow.cfgActiveForms[0].header;
            activeFormsSubtext.innerText = formToShow.cfgActiveForms[0].subtext;
            activeFormsCTA.innerText = formToShow.cfgActiveForms[0].buttonText;
            addIframe(formToShow.formUrl);
            activeFormsCTA.onclick = () => onActiveFormsCTAClick(formToShow.formUrl);
        }
        else{
            hideElements([activeFormsContainer]);
        }
        
        
    } else{
        hideElements([activeFormsContainer]);
    }
}

const onActiveFormsFetched = (response) => {
    console.log("Candidate Active Forms Fetched: ", response);
    candidateData.activeForms = response.data.candidates[0].activeForms;
    setActiveForms();
}

const onActiveFormsFetchedError = (response) => {
    console.log("Candidate Active Form Fetched Error", response);
}

const fetchActiveForms = () =>{
    let url = apiBaseURL+ 'user/get-user-data-graphql';
    let reqBodyFormatted = `query MyQuery {
        candidates(email: "${verifiedUser.email}") {
          activeForms {
            id
            formUrl
            status
            cfgActiveForms {
              buttonText
              header
              subtext
              type
              priority
            }
          }
        }
    }`
    let reqBody = reqBodyFormatted.replace(/(\r\n|\n|\r)/gm, "").trim();
    postAPI(url, reqBody, onActiveFormsFetched, onActiveFormsFetchedError);
}

closeModalIcon.onclick = () => closeFormModal();




function onActiveFormSubmit() {
    setTimeout(fetchActiveForms, 2000);
    setTimeout(closeFormModal, 5000);
}

function closeFormModal (){
    console.log("closing the icon");
    hideElements([activeFormsModal]);
}

function checkFormSubmissionAndCloseFormModal(message) {
    console.log("message received: ", message);
    let messageData = JSON.parse(message.data);
    console.log("messageData: ",messageData)
    if (messageData.event === 'Tally.FormSubmitted'){
        onActiveFormSubmit();
    }
}


window.addEventListener('message', function(message) {
    if (typeof(message.data) !== 'string') return;
    checkFormSubmissionAndCloseFormModal(message);
});

packageDropdown.onchange = () => {
    onPackageChange(packageDropdown.selectedIndex);
}

const hideLoadingSpinner = () => {
    hideElements([loaderSpinner]);
}


const onCandidateFetched = (response) => {
    console.log("Candidate Data Fetched: ", response);
    candidateData = response.data.candidates[0];
    setIntialUI();
    hideLoadingSpinner();
}

const onCandidateFetchedError = (response) => {
    console.log("Error Fetching Candidate Data: ", response);
    hidePackageDetails();
    hideElements([activeFormsContainer]);
}

const getCandidateData = () => {
    let url = apiBaseURL+ 'user/get-user-data-graphql';
    let reqBodyFormatted = `query MyQuery {
        candidates(email: "${verifiedUser.email}") {
          activeForms {
            id
            formUrl
            status
            cfgActiveForms {
              buttonText
              header
              subtext
              type
              priority
            }
          }
          email
          name
          slackId
          packages {
            id
            packageId
            created
            plannerDocLink
            packageStatus
            packageOnboardingStatus
            slackChannelId
            domainFromOrder
            packageFromPackageConfiguration
            sessionStatusFromActiveSession
            statusFromPotentialMentorAssignment
            mentors {
              publicProfileLink
              currentCompany
              currentDesignation
              name
              id
              photoUrl
            }
            sessions {
              id
              meetingLink
              sessionStatus
              sessionDateTime
              isInThePast
              feedbackToBeFilledByCandidate
              name
              recording
              myInterviewDocLink
            }
            frPackageOnboarding {
              report
              targetCompanies
              currentSituation
              upcomingInterviewCompany
              upcomingInterviewDate
              upcomingScheduledInterview
              packageExpectationsOthers
              packageExpectations
              packageExpectationId
              mentorSpecificRequirement
              id
              expectedPreparationDuration
            }
            preferredMentorExperienceFromOrder
            targetDomainFromOrder
            targetRoleFromOrder
            relationshipManagers {
              name
              phoneNumber
              slackId
            }
            packageConfiguration {
              packageCandidateGuidelinesLink
            }
          }
        }
      }`
    let reqBody = reqBodyFormatted.replace(/(\r\n|\n|\r)/gm, "").trim();
    postAPI(url, reqBody, onCandidateFetched, onCandidateFetchedError);
}

hidePackageDetails = () => {
    hideElements([packageContainer, packageDropdownContainer]);
    hideLoadingSpinner();
}


setDropdownAndInitialPackage = () => {
    packageList = candidateData.packages;
    if (!packageList.length){
        hidePackageDetails();
        return;
    }
    else{
        hideElements([exploreProgramsSection]);
    }
    packageList.reverse();
    try{
        while (packageDropdown.children.length > 0){
            packageDropdown.remove(0);
          }    
        for (let packageIndex in packageList){
            let package = packageList[packageIndex];
            packageDropdown.append(new Option(`${package.packageFromPackageConfiguration[0]} - ${new Date(package.created).toLocaleString('en-US', DATE_OPTION)}`, packageIndex));
        }
    }catch(e){
        console.log(e);
    }
    onPackageChange(0)
}

onPackageChange =  (index) => {
    activePackage = packageList[index];
    renderPackageView();
}

const setPackageDetails = () => {
    try{
        packageName.innerText = activePackage.packageFromPackageConfiguration[0];
        packageID.innerText = activePackage.id;
        domainName.innerText =  activePackage.domainFromOrder ? activePackage.domainFromOrder[0] + " Interviews" : "Interviews";
        targetCompanies.innerText = activePackage.frPackageOnboarding[0] ? activePackage.frPackageOnboarding[0].targetCompanies : "";
        targetRole.innerText = activePackage.targetRoleFromOrder ? activePackage.targetRoleFromOrder[0]: "";
        if (activePackage.relationshipManagers[0]){
            rmName.innerText = activePackage.relationshipManagers[0].name
            showElements([rmContainer]);
        }
        else{
            hideElements([rmContainer]);
        }
    }
    catch(e){
        console.log(e);
    }
}

const setSessionDetails = () => {
    let sessionsData = activePackage.sessions;
    if (sessionsData.length === 0){
        hideElements([sessionContainer]);
        return;
    }
    let clonedSessionContainer;
    
    //Create Initial display
    // remove all session except the dummy one
    let sessionIndex = sessionsContainer.childNodes.length - 1;
    while(sessionsContainer.childNodes.length > 1){
        if (sessionsContainer.childNodes[sessionIndex].id !== DUMMY_SESSION_ID){
            sessionsContainer.removeChild(sessionsContainer.childNodes[sessionIndex]);
            sessionIndex = sessionsContainer.childNodes.length - 1;
        }
        else{
            sessionIndex--;
        }
    }
    hideElements([dummySessionContainer]);
    // add Sessions Data
    // {
    //     "id": "recWjgWZrKFryJjZe",
    //     "meetingLink": null,
    //     "sessionStatus": null,
    //     "sessionDateTime": null,
    //     "isInThePast": null,
    //     "feedbackReportForTheCandidate": null,
    //     "feedbackToBeFilledByCandidate": "?session_id=recWjgWZrKFryJjZe",
    //     "name": "1 - Planning Session",
    //     "recording": null,
    //     "myInterviewDocLink": null
    //   },
    for (sessionIndex in sessionsData){
        let session = sessionsData[sessionIndex]
        if (!session.sessionStatus) continue;
        clonedSessionContainer = dummySessionContainer.cloneNode(true);
        clonedSessionContainer.id = SESSION_CONTAINER + "-" + session.id;
        
        let sessionNameDOM = clonedSessionContainer.querySelector(`#dummy-${SESSION_NAME}`);
        if (sessionNameDOM){
            sessionNameDOM.id= SESSION_NAME + "-" + session.id;
            sessionNameDOM.innerText = session.name;
        }
        let sessionDateDOM = clonedSessionContainer.querySelector(`#dummy-${SESSION_DATE}`);
        if (sessionDateDOM){
            sessionDateDOM.id= SESSION_DATE + "-" + session.id;
            sessionDateDOM.innerText = session.sessionDateTime ? new Date(session.sessionDateTime).toLocaleString('en-US', DATE_TIME_OPTION) : "";
        }
        let sessionStatusDOM = clonedSessionContainer.querySelector(`#dummy-${SESSION_STATUS}`);
        if (sessionStatusDOM){
            sessionStatusDOM.id= SESSION_STATUS + "-" + session.id;
            sessionStatusDOM.innerText = SESSION_STATUS_MAP[session.sessionStatus];
        }
        let sessionCTADOM = clonedSessionContainer.querySelector(`#dummy-${SESSION_CTA}`);
        if (sessionCTADOM){
            sessionCTADOM.id= SESSION_CTA + "-" + session.id;
            sessionCTADOM.innerText = "Contact Support →";
            sessionCTADOM.href = slackCTALink;
            if (SESSION_COMPLETED_STATUSES.includes(session.sessionStatus)){
                if (session.feedbackReportForTheCandidate) {// change the logic to show the report here
                    sessionCTADOM.innerText = "View Report →";
                    sessionCTADOM.href = session.feedbackReportForTheCandidate;
                }
            }
            else if (session.sessionStatus === "Attend Session" && session.meetingLink){
                sessionCTADOM.innerText = "Join Meeting →";
                sessionCTADOM.href = session.meetingLink;
            }
        }
        sessionsContainer.append(clonedSessionContainer);
        showElements([clonedSessionContainer], "grid")
    }
}


const setSlackDetails = () => {
    const JOIN_SLACK_TEXT = "Have any queries? Join Slack to get in touch with us";
    const JOIN_SLACK_CTA = "Join Slack ->";
    
    const OPEN_SLACK_TEXT = "Have any queries? Reach out to us on slack now";
    const OPEN_SLACK_CTA = "Open Slack ->";
    const OPEN_SLACK_CHANNEL_TEXT = "Open your Slack group to connect with your Relationship Manager";
    const OPEN_SLACK_CHANNEL_WITH_MENTOR_TEXT = "Open your Slack group to connect with your Mentor now";

    let candidateHasJoinedSlack = !!candidateData.slackId;
    let slackTitleText = JOIN_SLACK_TEXT;
    let slackCTAText = JOIN_SLACK_CTA;
    
    if (candidateHasJoinedSlack){
        slackCTAText = OPEN_SLACK_CTA;
        if(activePackage.slackChannelId){
            slackCTALink = getSlackChannelLink(activePackage.slackChannelId);
            let isMentorAssigned = !!activePackage.mentors[0];
            if (isMentorAssigned) {
                slackTitleText = OPEN_SLACK_CHANNEL_WITH_MENTOR_TEXT;
            }
            else{
                slackTitleText = OPEN_SLACK_CHANNEL_TEXT;
            }
        }
        else{
            slackTitleText = OPEN_SLACK_TEXT;
            slackCTALink = getSlackProfileLink(activePackage.relationshipManagers[0].slackId);
        }
    }
    slackTitle.innerText = slackTitleText;
    slackCTA.innerText = slackCTAText;
    slackCTA.href = slackCTALink;
}

const setMentorDetails = () => {
    // "mentors": [
    //     {
    //       "publicProfileLink": "https://mentor.preplaced.in/profile/shailesh-bhattarai",
    //       "currentCompany": "Preplaced",
    //       "currentDesignation": "Senior Software Engineer",
    //       "name": "Shailesh Bhattarai",
    //       "id": "recmkItiwwiT9UYwW",
    //       "photoUrl": "https://firebasestorage.googleapis.com/v0/b/preplaced-upload-prod/o/image%2Fmentor-profile%2Fdownload.jpeg?alt=media&token=ed51fcbd-0a8e-45ce-a969-d9e48c5823fd"
    //     }
    //   ],
    let mentor = activePackage.mentors[0]
    if (mentor){
        showElements([mentorProfileContainer, mentorProfileCTA])
        mentorName.innerText = mentor.name;
        mentorProfile.innerText = `${mentor.currentDesignation}, ${mentor.currentCompany}`;
        mentorProfileCTA.href = mentor.publicProfileLink;
        mentorProfilePicture.src = mentor.photoUrl;
    }
    else{
        hideElements([mentorProfileCTA]);
    }
}

const setPlannerDetails = () => {
    let planner = activePackage.plannerDocLink;
    if (planner){
        showElements([plannedDocContainer]);
        plannerDocCTA.href = planner;
    }
    else{
        hideElements([plannedDocContainer]);
    }
}

const setPackageGuidelinesDetails = () => {
    try{
        let guidelinesLink = activePackage.packageConfiguration[0].packageCandidateGuidelinesLink;
        if (guidelinesLink){
            showElements([packageGuidelinesContainer]);
            packageGuidelinesCTA.href=guidelinesLink
        }
        else{
            hideElements([packageGuidelinesContainer])
        }
    }
    catch(e){
        console.log(e);
    }
}

const setSideBarElements = () =>{
    // Set Slack
    setSlackDetails();

    // Set Mentor
    setMentorDetails();

    // Set Planner
    setPlannerDetails();

    // Set Package Guidelines
    setPackageGuidelinesDetails();
}



// Set Selected Package
const renderPackageView = () => {
    // Set Package Status
    setPackageStatus();

    // Set Package Details
    setPackageDetails();

    // Set Sidebar Elements
    setSideBarElements();

    // Set Sessions
    setSessionDetails();
}

const addIframe = (url) => {
    try{
        activeFormsEmbed.removeChild(activeFormsEmbed.childNodes[0]);
    }
    catch(e){};
    let iframeDom = document.createElement('iframe');
    iframeDom.classList="active-form-iframe";
    iframeDom.src = url;
    iframeDom.width = "100%";
    iframeDom.height = "100%";
    activeFormsEmbed.appendChild(iframeDom);
}

onActiveFormsCTAClick = (url) =>{
    // addIframe(url);
    showElements([activeFormsModal]);
}



const setIntialUI = () => {

    // Set Packages Dropdown and default Package
    setDropdownAndInitialPackage();

    //set Active Forms
    setActiveForms()
}

async function authenticateAndUpdateUserName() {
    if (accessToken){
        let welcomeDom = getElement("welcome-text");
        firebase.auth().onAuthStateChanged(async function (user) {
            if (user){
                //set User Name
                await updateAccessToken();
                welcomeText.innerText = welcomeText.innerText.replace("Human", verifiedUser.displayName);
                getCandidateData();
            }
            else {
                redirect('/', true);
            }
        });
    }
    else{
        redirect('/', true);
    }
}

authenticateAndUpdateUserName();



