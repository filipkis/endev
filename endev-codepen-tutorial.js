/*!
 * The setup code for Endev Tutorial that makes it possible for people not
 * to override each others data when forking the code in CodePen.
 *
 * Author: Filip Kis
 * License: MIT
 */


// HELPER METHODS

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}

function getCodePenId() {
    var CODEPEN_ID = /codepen\.io\/[^/]+\/(?:pen|debug|fullpage|fullembedgrid)\/([^?#]+)/;
    var id;

    if(CODEPEN_ID.test(window.location.href)) {
        id = CODEPEN_ID.exec(window.location.href)[1];
    } else {
        // Case when you're in CodePen editor
        // the iFrame doesn't contain the pen's id and you can't
        // access the perant's address as it's on different subdomain
        var metas = document.getElementsByTagName('link');
        for(i=0;i<metas.length;i++) {
            if(metas[i].getAttribute('rel') == 'canonical') {
                if(CODEPEN_ID.test(metas[i].getAttribute('href')))
                    id = CODEPEN_ID.exec(metas[i].getAttribute('href'))[1];
            }
        }
    }

    return id;
}

var createGuid = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// MAIN CODE

// Try to get the CodePen ID
var guid;

window.parent.parent.postMessage("getEndevTutorialId","*");

window.addEventListener("message", receiveMessage, false);

function receiveMessage(event)
{
    if(event.data && event.data.messageName == 'endevTutorialId') {
        console.log('Got the message',getCodePenId());
        guid = event.data.id;
        setCookie('endevTutorial',guid);
    }
}

// Setup the Firebase connection.
endev.firebaseProvider = {
    path: "https://endev-tutorial-01.firebaseio.com/"
}


endev.app.run(["$timeout",function ($timeout) {
    $timeout(function(){
        console.log("Entered Angular", getCodePenId());
        // Note that this means that even the Firebase code
        // will be browser dependent as each code instance run
        // in differnt browser (where the cookies is not set) will
        // connect to different document in Firebase.
        if(!guid) {
            if (!getCookie('endevTutorial')) {
                guid = createGuid();
                setCookie('endevTutorial',guid);
            } else {
                guid = getCookie('endevTutorial');
            }
        }

        // Only record non embeded ones
        if (window.location.href.indexOf('fullembedgrid')<0){
            var code_snapshot_ref = new Firebase("https://endev-tutorial-01-c.firebaseio.com/Tutorial-v1-Snapshots");

            var data_to_save = {
                html: document.documentElement.innerHTML,
            }

            if(getCodePenId()) {
                data_to_save.codePenId = getCodePenId();
            }
            code_snapshot_ref.child(guid).child(Date.now()).set(data_to_save);
        }
    },200);
}])


