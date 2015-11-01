/* 
 * main javascript file where all 3D processing is done
 */
/*var width = window.innerWidth;
var height = window.innerHeight;*/
var width = document.getElementById("WebGLoutput").offsetWidth;
var height = document.getElementById("WebGLoutput").offsetHeight;
var renderer; var scene; var camera; var gui; var neck; 
var MovingCube; //collision detect mesh. not used directly, but let it be
var cube; //what cube?
var yobaplane2; //floor plane
var excludeSet; //this variable has type of lib/set.js and it is used while removing objects from scene. It contains names of scene objects which should not be removed
               //initialized in init()
var kittenfound= false;

var controls = new function() { //unused. or used? I'm not sure... Let it be!
    this.rotationSpeed = 0.25;
    this.autoRotate = false;   }
var clock = new THREE.Clock;
var cameraTurnAngleDeg =5; var cameraLookPoint = new THREE.Vector3(); var CyclicCounterMAX=10; var CyclicCounterCUR = 0;
var cmrCurRotrAngle = 0;

function degInRad(deg) {
    return deg * Math.PI / 180;
}

function init () {
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setClearColor(0xEEAAFF);
        if ((width>=20)&&(height>=20)) {
            renderer.setSize(width-20, height-20); 
        } else {
            renderer.setSize(width, height); 
        }
        document.getElementById("WebGLoutput").appendChild(renderer.domElement);
        scene = new THREE.Scene;
        //--------
        //camera
        camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
        camera.position.y = 160;
        camera.position.z = 400;
        scene.add(camera);
        
        excludeSet = new Set();
}
function defGuiControls() {
    //---gui---
        gui = new dat.GUI({height: 32-1});
        gui.add(controls, 'rotationSpeed',0.0,10.0);
        gui.add(controls, 'autoRotate');
        document.getElementById("controloutput").appendChild(gui.domElement);
}
//-------
function render() {
    renderer.render(scene, camera);
        nyanstats.update(); //nyanstats is global! 
        lookUpPosition();
        adjustCameraLook();
    requestAnimationFrame(render);
}
function initStats() {
    console.log("STATS!");
    var stats = new Stats();
    stats.setMode(0);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    document.getElementById("statsoutput").appendChild(stats.domElement);
    return stats;
}
/**
 * This function uses myLevelStruct from SceneConstructor to predict collisions during movement
 */
function processCollision(moveVec) {
    var dirStmtX=0; var dirStmtZ=0; var dirStmtY=0;
    //var movementPredict = new Array(true,true,true,true); //Where can we move: south, north, east, west (globally in the 3d world. 'true' means that there's no obstacle in thst dir)
        console.log ("collision check");
        var rays = [ //define a set of collision vectors
            //new THREE.Vector3(0,1,0), new THREE.Vector3(0,-1,0), //up and down
            new THREE.Vector3(1,0,0), new THREE.Vector3(-1,0,0), //east and west
            new THREE.Vector3(0,0,1), new THREE.Vector3(0,0,-1)  //south and north
        ];
      var caster = new THREE.Raycaster();
      var distance = myUnitSz;
      //for (i = 0; i < rays.length; i += 1) {            
            caster.set(neck.position, moveVec.normalize()); // We reset the raycaster to this (current) direction
            // Test if we intersect with any obstacle mesh
            var collisions = caster.intersectObjects(myLevelStruct.Cubes);
            // And disable that direction if we do
            //if (collisions.length>0) { console.log(collisions[0].distance); }
            if (collisions.length > 0 && collisions[0].distance <= distance) {
                //return here uuid of mesh
                //return false;
                return collisions[0].object.uuid;
            }
    //}    	            
    //return true;
    return null;
}
//--Keyboard handling-- 
function processKey(kCode) {
    //console.log(kCode);
    //var collideStrategy = processCollision();
    var collideStrategy = [true,true,true,true];
    switch (kCode) {
        case 37: //left arrow
            {   
                //console.log("left");
                //console.log(neck.position);
                var startPnt = neck.position.clone();
                neck.translateX(-Math.round(myUnitSz/10));
                //console.log(neck.position);
                var endPnt = neck.position.clone();
                neck.translateX(Math.round(myUnitSz/10));
                //console.log(neck.position);
                var collideRes = processCollision(endPnt.sub(startPnt));
                if (collideRes == null) {
                    neck.translateX(-Math.round(myUnitSz/10));
                } else {
                    //find by uuid
                    var id_index = locateSingleItmByID(collideRes).nki_index; 
                    if (id_index !=-1) {
                    thePhrase=nkicollection[id_index];
                    document.getElementById("whatis").innerHTML = thePhrase;
                    } else {
                        document.getElementById("whatis").innerHTML = "♥♥♥ YOU HAVE FOUND KITTEN! WAY TO GO, ROBOT ♥♥♥";
                    }
                }
                break;   }
        case 38: //up arrow
            {   
                var startPnt = neck.position.clone();
                neck.translateZ(-Math.round(myUnitSz/10));
                //console.log(neck.position);
                var endPnt = neck.position.clone();
                neck.translateZ(+Math.round(myUnitSz/10));
                //console.log(neck.position);
                var collideRes = processCollision(endPnt.sub(startPnt));
                if (collideRes == null) {
                    neck.translateZ(-Math.round(myUnitSz/10));
                } else {
                    //find by uuid
                    var id_index = locateSingleItmByID(collideRes).nki_index; 
                    if (id_index !=-1) {
                    thePhrase=nkicollection[id_index];
                    document.getElementById("whatis").innerHTML = thePhrase;
                    } else {
                        document.getElementById("whatis").innerHTML = "♥♥♥ YOU HAVE FOUND KITTEN! WAY TO GO, ROBOT ♥♥♥";
                    }
                }
                //console.log("forward");                
                break;   }
        case 39: //right
            {
                var startPnt = neck.position.clone();
                neck.translateX(Math.round(myUnitSz/10));
                //console.log(neck.position);
                var endPnt = neck.position.clone();
                neck.translateX(-Math.round(myUnitSz/10));
                //console.log(neck.position);
                var collideRes = processCollision(endPnt.sub(startPnt));
                if (collideRes == null) {
                    neck.translateX(Math.round(myUnitSz/10));
                } else {
                    //find by uuid
                    var id_index = locateSingleItmByID(collideRes).nki_index; 
                    if (id_index !=-1) {
                    thePhrase=nkicollection[id_index];
                    document.getElementById("whatis").innerHTML = thePhrase;
                    } else {
                        document.getElementById("whatis").innerHTML = "♥♥♥ YOU HAVE FOUND KITTEN! WAY TO GO, ROBOT ♥♥♥";
                    }
                }
                break;   }
        case 40: //down arrow
            {   
                //console.log("back");
                var startPnt = neck.position.clone();
                neck.translateZ(Math.round(myUnitSz/10));
                //console.log(neck.position);
                var endPnt = neck.position.clone();
                neck.translateZ(-Math.round(myUnitSz/10));
                //console.log(neck.position);
                var collideRes = processCollision(endPnt.sub(startPnt));
                if (collideRes==null){
                    neck.translateZ(Math.round(myUnitSz/10));
                } else {
                    //find by uuid
                    var id_index = locateSingleItmByID(collideRes).nki_index; 
                    if (id_index !=-1) {
                    thePhrase=nkicollection[id_index];
                    document.getElementById("whatis").innerHTML = thePhrase;
                    } else {
                        document.getElementById("whatis").innerHTML = "♥♥♥ YOU HAVE FOUND KITTEN! WAY TO GO, ROBOT ♥♥♥";
                    }
                }
                break;   }
    }
}
function getChar(event) {
    var myKeyCode;
  if (controls.autoRotate==false)  {
        myKeyCode = event.keyCode;    
        processKey(myKeyCode);
  }
}
//---------------------
var mouseGeneralizedLocation = function() {
    this.right = false;
    this.left = false;
    this.top = false;
    this.bottom = false;
    
    this.mouseControlsLocked = false;
}
var mouseEvt = null;
//--Mouse handling. Camera Look changing--
function lookUpPosition() {
    //mouseEvt is global. stores the mousemove event of WebGLoutput div
    if ((mouseEvt!=null)&&(mouseEvt!=undefined)) {
        var myPosition = mousePositionElement(mouseEvt);
        //console.log(" "+myPosition.x+";"+myPosition.y);
        processPosition(myPosition);
        //mouseEvt = null; //no need in storing now. wait for next onmousemove
    } else {
        console.log('mouseEvt is busted: '+mouseEvt);
    }
}
function adjustCameraLook() { //set new camera position during movement
    /*x' = x\cos{(\phi_y)} + z\sin{(\phi_y)}
      y' = y
      z' = -x\sin{(\phi_y)} + z\cos{(\phi_y)}*/
    if (CyclicCounterCUR!=CyclicCounterMAX) {CyclicCounterCUR+=1; return; console.log("click!")} else {
        if ((mouseGeneralizedLocation.right==true)&&(mouseGeneralizedLocation.left==false))  {
            //console.log(cmrCurRotrAngle+":"+Math.sin(cmrCurRotrAngle*Math.PI/180.0)+";"+Math.cos(cmrCurRotrAngle*Math.PI/180.0));
            /*var cameraLookPoint2 = new THREE.Vector3(); cameraLookPoint2.y=cameraLookPoint.y;
            cameraLookPoint2.x = cameraLookPoint.x*Math.cos((-1)*cmrCurRotrAngle*Math.PI/180.0) + cameraLookPoint.z*Math.sin((-1)*cmrCurRotrAngle*Math.PI/180.0);
            cameraLookPoint2.z = -cameraLookPoint.x*Math.sin((-1)*cmrCurRotrAngle*Math.PI/180.0) + cameraLookPoint.z*Math.cos((-1)*cmrCurRotrAngle*Math.PI/180.0);
            cmrCurRotrAngle+=cameraTurnAngleDeg;
            if (cmrCurRotrAngle>360) cmrCurRotrAngle = cameraTurnAngleDeg;
            //console.log("("+cameraLookPoint2.x+";"+cameraLookPoint2.y+";"+cameraLookPoint2.z+")");
            camera.lookAt(cameraLookPoint2);*/
            neck.rotation.y -= degInRad(cameraTurnAngleDeg);
        } else {
            if ((mouseGeneralizedLocation.right==false)&&(mouseGeneralizedLocation.left==true)) {
                neck.rotation.y += degInRad(cameraTurnAngleDeg);
            } else {
                if ((mouseGeneralizedLocation.top==false)&&(mouseGeneralizedLocation.bottom==true)) {
                    if (cmrCurRotrAngle>-90) {
                    camera.rotation.x -= degInRad(cameraTurnAngleDeg); 
                    cmrCurRotrAngle-=cameraTurnAngleDeg;             }
                } else {
                 if ((mouseGeneralizedLocation.top==true)&&(mouseGeneralizedLocation.bottom==false)) {
                     if (cmrCurRotrAngle<90) {
                        camera.rotation.x += degInRad(cameraTurnAngleDeg);          
                        cmrCurRotrAngle+=cameraTurnAngleDeg;
                        }      }   
                }
            }
        }
        CyclicCounterCUR = 0;
    }
}
function processPosition(thePosition) { //determine where to rotate camera.
    var retrW = document.getElementById("WebGLoutput").offsetWidth;
    var retrH = document.getElementById("WebGLoutput").offsetHeight;
    //console.log("retrW:"+retrW+";"+"retrH:"+retrH+"//"+Math.round(retrW/2)+";"+Math.round(retrH/2)+"||"+thePosition.x+";"+thePosition.y);
        if ((thePosition.x>Math.round(retrW/4)) && (thePosition.x<Math.round(3*retrW/4))) {
            mouseGeneralizedLocation.left = false; mouseGeneralizedLocation.right = false;
            //console.log(thePosition.x+"=="+Math.round(retrW/2));
        } else {
            if (thePosition.x<=Math.round(retrW/4)) {
                mouseGeneralizedLocation.left=true; mouseGeneralizedLocation.right = false;
                //console.log(thePosition.x+"<"+Math.round(retrW/2));
            } else {
                if (thePosition.x>=Math.round(3*retrW/4)) {
                    mouseGeneralizedLocation.left=false; mouseGeneralizedLocation.right = true;
                    //console.log(thePosition.x+">"+Math.round(retrW/2));
                }
            }
        }
        if ((thePosition.y>Math.round(retrH/4))&&(thePosition.y<Math.round(3*retrH/4))) {
            mouseGeneralizedLocation.top=false; mouseGeneralizedLocation.bottom=false;
        } else {
            if (thePosition.y<=Math.round(retrH/4)) {
                mouseGeneralizedLocation.top=true; mouseGeneralizedLocation.bottom=false;
            } else {
                if (thePosition.y>=Math.round(3*retrH/4)) {
                mouseGeneralizedLocation.top=false; mouseGeneralizedLocation.bottom=true; }
            }     
        }
}
function mediatorFunc (e) { //storin' event in global
   // if (mouseGeneralizedLocation.mouseControlsLocked===false) {
        mouseEvt = e; //}
}
document.getElementById("WebGLoutput").onmousemove = mediatorFunc;
//----------------------------------------
init();
var nyanstats = initStats();
document.onkeydown = getChar;
console.log("spardo!");

