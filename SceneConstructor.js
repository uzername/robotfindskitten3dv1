/* 
 * Defining scene. Be careful calling these routines.
 */
   
    var myUnitSz=20; var planewidth; var planedepth; var itm_coords; //array of singleItm objects
    var playerEntity;
    var playerModelPath = 'models/cyl_bot.js'; var tmpPlayerEntityMesh;
    
    function locateSingleItmByID(inpID) {
        var objToReturn = null;
        for (var i=0; i<itm_coords.length; i++) {
            if (itm_coords[i].theID == inpID){
                objToReturn = itm_coords[i];
                return objToReturn;
                break; //better safe than sorry
            }
        }
        return objToReturn;
    }
    /**
     * checks whether we already have item with these coordinates at scene
     * @param {type} crd1
     * @param {type} crd2
     * @returns {boolean}
     */
    function locateSingleItmByCoords (crd1, crd2) {
        
    }
    function singleItm(inpID, inpsceneX, inpsceneY, inp_nki_index) { //used in itm_coords
        this.theID = inpID; //UUID of the mesh
        this.sceneX = inpsceneX;
        this.sceneY = inpsceneY; //horisontal coordinates of mesh center in scene (integer values, in myUnitSz measured...)
        this.nki_index = inp_nki_index; //index of nki (value of -1 means that it's a kitten! Hilarious...) in nkicollection (see itmloader.js)
    }
    /**
     * 
     * @param {type} w - width of cube
     * @param {type} h - height
     * @param {type} d - depth
     * @param {Vector3} cntC - center of cube
     * @returns {MyCube}
     */
    function MyCube(w, h, d, cntC) {
        this.cubeWidth = w; this.cubeHeight = h; this.cubeDepth = d;
        this.centerCoord=new THREE.Vector3(); this.centerCoord.copy(cntC);
    }
    function MyPlane(w, h, lc, rt, plTex) {
        this.planeWidth = w; this.planeHeight = h;
        this.planeLocation = new THREE.Vector3(); this.planeLocation.copy(lc);
        this.planeRotationAngleDeg = rt;
        this.planeTexturePath = plTex;
    }
    function LevelStruct() {
        this.Planes=new Array();
        this.Cubes = new Array();
    }
    var myLevelStruct;
    function defBasicScene () {
        var cubeGeometry = new THREE.BoxGeometry(myUnitSz, 0, myUnitSz);
        cube = new THREE.Mesh(cubeGeometry, defCrateMaterial()); 
        //cube.rotation.y = Math.PI * 45 / 180;
        scene.add(cube);
        //    console.log(scene);
        //camera.lookAt(cube.position);

        //defSkyBox();

        //var pointLight = new THREE.PointLight(0xffffff);
        //pointLight.position.set(0, 300, 200); 
        //scene.add(pointLight);
    }
     function defSkyBox() {
        var skyboxGeometry = new THREE.BoxGeometry(10000, 10000, 10000);
        /*var urls = ['graphon/skyboxpng/grnplsntft.png',
                    'graphon/skyboxpng/grnplsntbk.png',
                    'graphon/skyboxpng/grnplsntup.png',
                    'graphon/skyboxpng/grnplsntdn.png',
                    'graphon/skyboxpng/grnplsntrt.png',
                    'graphon/skyboxpng/grnplsntlf.png'
                ]*/
         var urls = ['graphon/rfkskybox/starfield_ft.png',
                    'graphon/rfkskybox/starfield_bk.png',
                    'graphon/rfkskybox/starfield_up.png',
                    'graphon/rfkskybox/starfield_dn.png',
                    'graphon/rfkskybox/starfield_rt.png',
                    'graphon/rfkskybox/starfield_lf.png'
                ]
        // wrap it up into the object that we need
                var cubemap = THREE.ImageUtils.loadTextureCube(urls);
                // set the format, likely RGB
                // unless you've gone crazy
                cubemap.format = THREE.RGBFormat;
                //http://stackoverflow.com/questions/14371299/in-three-js-how-can-i-make-textures-resolution-independent-and-render-without-b
                    cubemap.magFilter = THREE.NearestFilter;
                    cubemap.minFilter = THREE.LinearMipMapLinearFilter;
                var shader = THREE.ShaderLib[ "cube" ];
                shader.uniforms[ "tCube" ].value = cubemap;
        var skyboxMaterial = new THREE.ShaderMaterial( {
                  fragmentShader: shader.fragmentShader,
                  vertexShader: shader.vertexShader,
                  uniforms: shader.uniforms,
                  depthWrite: false,
                  side: THREE.BackSide
                });
        var skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial); 
        skybox.rotation.x += Math.PI / 2;
        skybox.name = "skybox"; excludeSet.add(skybox.name);
        scene.add(skybox);
    }
    function defCrateMaterial() {
        var materials = [];
                    materials.push(new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture('graphon/bigCrate2.png') })); // right face
                    materials.push(new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture('graphon/bigCrate0.png') })); // left face
                    materials.push(new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture('graphon/bigCrateTop.png') })); // top face
                    materials.push(new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture('graphon/bigCrateTop.png') })); // bottom face
                    materials.push(new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture('graphon/bigCrate1.png') })); // front face
                    materials.push(new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture('graphon/oldWood.png') })); // back face
                    var cubeMaterial = new THREE.MeshFaceMaterial(materials);
                    return cubeMaterial;
    }
    /**
     * 
     * @param {array of objects} repeatCnt - repeating of textures. Array contains 3 elements for pairs of params for cube faces:
     *  right-left rep count (y0z), top-bottom (z0x), front-back repeat param (x0y)
     * @param {type} texPath - path to graphical file to use (ToDo - make it array)
     * @returns {THREE.MeshFaceMaterial} - mapped material for cube
     */
    function defPlainMaterialCube(repeatCnt, texPath) {
        /*var plainTexture = THREE.ImageUtils.loadTexture(texPath);
            plainTexture.wrapS = plainTexture.wrapT = THREE.RepeatWrapping;
            plainTexture.repeat.set( repeatCnt.rpt1, repeatCnt.rpt2 ); */
        var materials=[];
        for (var i=0; i<6; i++) {
           var plainTexture = THREE.ImageUtils.loadTexture(texPath);
            plainTexture.wrapS = plainTexture.wrapT = THREE.RepeatWrapping;
            plainTexture.repeat.set( repeatCnt[Math.floor(i/2)].rpt1, repeatCnt[Math.floor(i/2)].rpt2 );
            materials.push(new THREE.MeshLambertMaterial({map:plainTexture}));
        }
       var material = new THREE.MeshFaceMaterial(materials);
       return material;
    }
    function defPlane(w, h, rtAngleDeg, texPath, texMode, centerPos) {
        var GenericPlane = new THREE.PlaneGeometry( w, h );
        var floorTexture = THREE.ImageUtils.loadTexture(texPath);
        if (texMode!=null) {
            
            floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
            floorTexture.repeat.set( texMode.x, texMode.y ); }
        material = new THREE.MeshLambertMaterial({map: floorTexture, side:THREE.DoubleSide});
        var yobaplane = new THREE.Mesh( GenericPlane, material );
        yobaplane.position.x=centerPos.x; yobaplane.position.y=centerPos.y; yobaplane.position.z=centerPos.z;
        //yobaplane.rotation.x += degInRad(rtAngleDeg.x); yobaplane.rotation.y+=degInRad(rtAngleDeg.y); yobaplane.rotation.z+=degInRad(rtAngleDeg.z);
        yobaplane.rotateOnAxis(new THREE.Vector3(1, 0, 0), degInRad(rtAngleDeg.x));
        yobaplane.rotateOnAxis(new THREE.Vector3(0, 1, 0), degInRad(rtAngleDeg.y));
        yobaplane.rotateOnAxis(new THREE.Vector3(0, 0, 1), degInRad(rtAngleDeg.z));
        return yobaplane;
    }
    /**
     * 
     * @param {integer} w - width; measured along 0x axis
     * @param {integer} h - height; measured along 0y axis 
     * @param {integer} d - 
     * @param {type} rtAngleDeg - rotation angle of cube
     * @param {type} material
     * @param {type} centerPos
     * @returns {defCube.myCube|THREE.Mesh}
     */
    function defCube(w,h,d,rtAngleDeg, material, centerPos) {
        var geometry = new THREE.BoxGeometry( w, h, d );                 
        var myCube = new THREE.Mesh( geometry, material );
        myCube.position.z = centerPos.z; myCube.position.y = centerPos.y; myCube.position.x=centerPos.x;
        return myCube;
    }
    function MakeBuilding(w,h,d, material, centerPos, DoorsArr, wndArr) {
        var Bld1 = defCube(w, h, d, 0, 
                           material, centerPos);
        
        for (var i=0; i<DoorsArr.length; i++) {
            //position of door is now relative to building
            console.log("door!");
            /*var doorPlane=defPlane(DoorsArr[i].w, DoorsArr[i].h, new THREE.Vector3(0,0,0), 'graphon/DoorsMetalOrnate.jpg', null, new THREE.Vector3(10,10,10));
            scene.add(doorPlane); 
            doorPlane.position.x = DoorsArr[i].planeLocation.x; doorPlane.position.y=DoorsArr[i].planeLocation.y; doorPlane.position.z=DoorsArr[i].planeLocation.z;*/
        }
        scene.add(Bld1);
    }
    /**
     * The 'street' is a line of buildings with the same width or depth standing close to each other
     * @param {type} farNorthSide
     * @param {type} farSouthSide
     * @param {type} eastAlignLine
     * @param {type} constantDepth
     * @returns {undefined}
     */
    function MakeStreetNS(farNorthSide, farSouthSide, eastAlignLine, constantDepth) { 
        var curBldHeightInt; var curBldWidthInt; var curBldDepthInt; var curHorLoc = farNorthSide;  var d1=0; var d2=0;
        do {
            curBldHeightInt = getRandomInt(2,6);
            curBldWidthInt = getRandomInt(2,4);
            //curBldDepthInt = getRandomInt(2,4);
            curBldDepthInt=constantDepth;
            /*var myCubeBld = defCube(curBldWidthInt*myUnitSz, curBldHeightInt*myUnitSz, curBldDepthInt*myUnitSz, 0, defCrateMaterial(), 
                                  new THREE.Vector3(farEastSide,Math.floor(curBldHeightInt*myUnitSz/2),curHorLoc));*/
             MakeBuilding(curBldWidthInt*myUnitSz, curBldHeightInt*myUnitSz, curBldDepthInt*myUnitSz,
                          defPlainMaterialCube([new function() {this.rpt1=curBldDepthInt; this.rpt2=curBldHeightInt;}, new function() {this.rpt1=curBldWidthInt; this.rpt2=curBldDepthInt;}, new function() {this.rpt1=curBldDepthInt; this.rpt2=curBldHeightInt;}],
                          'graphon/ConcreteBare.jpg'),
                          new THREE.Vector3(eastAlignLine,Math.floor(curBldHeightInt*myUnitSz/2),curHorLoc),
                          [], []                                   );
            //console.log("w:"+curBldWidthInt+"("+curBldWidthInt*myUnitSz+")"+"; h:"+curBldHeightInt+"; d:"+curBldDepthInt+"("+curBldDepthInt*myUnitSz+")"+"; "+curHorLoc);                      
            d1=curBldDepthInt;
            if (d2==0) { d2=d1; }
            curHorLoc+=Math.round(d1*myUnitSz/2)+Math.round(d2*myUnitSz/2);
            console.log("dtemp: "+d1+";"+d2);
            d2=d1;
            //scene.add(myCubeBld);            
        } while (curHorLoc<farSouthSide)
    }
    function MakeStreetWE (farWestSide, farEastSide, northAlignLine, constantWidth) {
        var curBldHeightInt; var curBldWidthInt; var curBldDepthInt; var curHorLoc = farWestSide;  var d1=0; var d2=0;
        do {
            curBldHeightInt = getRandomInt(2,6);
            curBldWidthInt = constantWidth;
            //curBldDepthInt = getRandomInt(2,4);
            curBldDepthInt=getRandomInt(2,4);
            /*var myCubeBld = defCube(curBldWidthInt*myUnitSz, curBldHeightInt*myUnitSz, curBldDepthInt*myUnitSz, 0, defCrateMaterial(), 
                                  new THREE.Vector3(farEastSide,Math.floor(curBldHeightInt*myUnitSz/2),curHorLoc));*/
             MakeBuilding(curBldWidthInt*myUnitSz, curBldHeightInt*myUnitSz, curBldDepthInt*myUnitSz,
                          defPlainMaterialCube([new function() {this.rpt1=curBldDepthInt; this.rpt2=curBldHeightInt;}, new function() {this.rpt1=curBldDepthInt; this.rpt2=curBldWidthInt;}, new function() {this.rpt1=curBldDepthInt; this.rpt2=curBldHeightInt;}],
                          'graphon/ConcreteBare.jpg'),
                          new THREE.Vector3(curHorLoc,Math.floor(curBldHeightInt*myUnitSz/2),northAlignLine),
                          [], []                                   );
            //console.log("w:"+curBldWidthInt+"("+curBldWidthInt*myUnitSz+")"+"; h:"+curBldHeightInt+"; d:"+curBldDepthInt+"("+curBldDepthInt*myUnitSz+")"+"; "+curHorLoc);                      
            d1=curBldWidthInt;
            if (d2==0) { d2=d1; }
            curHorLoc+=Math.round(d1*myUnitSz/2)+Math.round(d2*myUnitSz/2);
            console.log("dtemp: "+d1+";"+d2);
            d2=d1;
            //scene.add(myCubeBld);            
        } while (curHorLoc<farEastSide)
    }
/**
 * Defines mesh to be attached to camera holder node. 
 * Shown in thirdperson view
 * @returns {THREE.Mesh}
 */    
function defPlayerEntity() {
    var loader = new THREE.JSONLoader(); // init the loader util
    loader.load(playerModelPath, function (geometry, materials) { // init loading
    // create a new material
    var material = new THREE.MeshFaceMaterial(materials); 
    // create a mesh with models geometry and material
    var mesh = new THREE.Mesh(
        geometry,        material
    );  
    mesh.scale.x=7; mesh.scale.y=7; mesh.scale.z=7;
    //mesh.position.x=Math.round(-3*myUnitSz); mesh.position.y = Math.round(0.5*myUnitSz); mesh.position.z = Math.round(3*myUnitSz);
    tmpPlayerEntityMesh = mesh; //the clojure? magic!
    console.log("your mesh is ready!");
    neck.add(mesh);
    });
    //console.log(mesh);
    //return tmpPlayerEntityMesh;
}

function addCamera() {
            //idea from http://jsfiddle.net/ostapische/uFwFC/2/
    camera.position.x=0;
    camera.position.y = Math.round(myUnitSz/3); camera.position.z = 0;
    camera.name="camera"; excludeSet.add(camera.name);
    neck = new THREE.Object3D(); neck.name="neck"; excludeSet.add(neck.name);
    neck.position.x = camera.position.x;
    neck.position.z = camera.position.z;
    neck.position.y = camera.position.y;
            //neck.rotateOnAxis(new THREE.Vector3(1, 0, 0), degInRad(90));
            //neck.up = new THREE.Vector3(0, 0, 1);
    neck.up = new THREE.Vector3(0, 1, 0);
        var cubeGeometry = new THREE.CubeGeometry(myUnitSz,myUnitSz,myUnitSz,1,1,1);
	var wireMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe:true } );
	MovingCube = new THREE.Mesh( cubeGeometry, wireMaterial );
        MovingCube.position.x = neck.position.x;
        MovingCube.position.z = neck.position.z;
        MovingCube.position.y = neck.position.y; MovingCube.name="camcube"; excludeSet.add(MovingCube.name);
        //neck.add(MovingCube);
    console.log("handler position: "+neck.position.x+";"+neck.position.y+";"+neck.position.z);        
    neck.add(camera); 
        camera.translateY(Math.round(3*myUnitSz/4));
        camera.translateZ(myUnitSz*2);
    //playerEntity = defPlayerEntity();
    defPlayerEntity();
    //playerEntity = tmpPlayerEntityMesh;
    scene.add(neck);
    //also need to add some another mesh object to neck, for collision detection, like on http://stemkoski.github.io/Three.js/Collision-Detection.html
    //done. see MovingCube
}        
function defScene(int_wdth,int_hght,nki_num) {
    planedepth = int_hght; planewidth = int_wdth;
    yobaplane2=defPlane(int_wdth*myUnitSz, int_hght*myUnitSz, new THREE.Vector3(90,0,0), 'graphon/board_bg3.png', new function() {this.x=int_wdth; this.y=int_hght}, new THREE.Vector3(0,0,0));
    scene.add( yobaplane2 ); yobaplane2.name="yobaplane2";
    myLevelStruct = new LevelStruct();
        //addCamera();
    //defMainHall();
    var pointLight = new THREE.PointLight(0xffffff, 0.6);
    pointLight.position.set(0, 6*myUnitSz, 0); pointLight.name="pointlight";
    var pointLight2 = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(0, 6*myUnitSz, 20*myUnitSz); pointLight.name="pointlight2";
    var pointLight3 = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(0, 6*myUnitSz, -20*myUnitSz); pointLight.name="pointlight3";
    var pointLight4 = new THREE.PointLight(0xffffff, 0.4);
    pointLight.position.set(10*myUnitSz, 6*myUnitSz, 45*myUnitSz); pointLight.name="pointlight4";
    var pointLight5 = new THREE.PointLight(0xffffff, 0.4);
    pointLight.position.set(-10*myUnitSz, 6*myUnitSz, -45*myUnitSz); pointLight.name="pointlight5";
    scene.add(pointLight); scene.add(pointLight2); scene.add(pointLight3); scene.add(pointLight4); scene.add(pointLight5);
    var light = new THREE.AmbientLight( 0x303030 ); // soft white light
    light.name = "ambient";
    scene.add( light );
}
/**
 * randomly places items over the scene
 * @param {integer} itm_num - number of items
 */
function placeItems(itm_num) {
    itm_coords = new Array();
    for (var i=0; i<itm_num; i++) {
        /*placeSingleItm(0,0,"-1", 0xff0000);
        placeSingleItm(1,1,"-2", 0x00ff00);
        placeSingleItm(0,planedepth-1,"-3",0x0000ff);
        placeSingleItm(planewidth-1, 0,"-4",0xffffff);
        placeSingleItm(planewidth-1, planedepth-1,"-5",0x112233);*/
        var p1=getRandomInt(0,planewidth-1); var p2=getRandomInt(0,planedepth-1);
        placeSingleItm(p1,p2, "N"+i+"", Math.random()*0xffffff);
        //console.log("item: "+p1+";"+p2+"| i="+i+"itm_num="+itm_num);
    }
    //declare one of items as "kitten"
    itm_coords[getRandomInt(0,itm_coords.length-1)].nki_index=-1;
    console.log("items on field");
    console.log(itm_coords);
}
function genSymbol(char,colr){
    var material = new THREE.MeshLambertMaterial({
        color: colr, overdraw:0.5
    });
    var textGeom = new THREE.TextGeometry( char, {
        font: 'anonymous pro',
        size: 80,
        height: 20,
        curveSegments:2
    });
    var textMesh = new THREE.Mesh( textGeom, material );
    textGeom.computeBoundingBox();
        var textWidth = textGeom.boundingBox.max.x - textGeom.boundingBox.min.x;
        var textDepth = textGeom.boundingBox.max.z - textGeom.boundingBox.min.z;
        var textHeight = textGeom.boundingBox.max.y - textGeom.boundingBox.min.y;
        textMesh.scale.x=(myUnitSz*1.0)/(textWidth*1.0); 
        //textMesh.scale.z=(myUnitSz*1.0)/(textDepth*1.0); 
        textMesh.scale.z=(myUnitSz*1.0)/(textWidth*1.0);
        //textMesh.scale.y=(textMesh.scale.x+textMesh.scale.z)/2.0;
        textMesh.scale.y=(myUnitSz*2.0)/(textHeight*1.0);
    return textMesh;
}
/**
 * Place single item to a field. v_int_coord1 - corresponds to "width" coord on plane
 * v_int_coord2 - corresponds to "depth" coord on plane. (0;0) corresponds to far corner of plane.
 * this subroutine features multiplaying by myUnitSz
 */
function placeSingleItm(v_int_coord1, v_int_coord2, id, inpcolor){            
            var test_coord1=v_int_coord1*myUnitSz-Math.round((planewidth/2)*myUnitSz)+Math.round(myUnitSz/2);
            var test_coord2=v_int_coord2*myUnitSz-Math.round((planedepth/2)*myUnitSz)+Math.round(myUnitSz/2);
                var cubeGeometry = new THREE.CubeGeometry(myUnitSz,myUnitSz,myUnitSz,1,1,1);
                var wireMaterial = new THREE.MeshBasicMaterial( { color: inpcolor, wireframe:true } );
                wireMaterial.transparent = true;
                wireMaterial.opacity = 0.0;
                var objectDebug = new THREE.Mesh( cubeGeometry, wireMaterial );
                objectDebug.position.x = test_coord1;
                objectDebug.position.z = test_coord2;
                objectDebug.position.y = Math.round(myUnitSz/2);
                scene.add(objectDebug); objectDebug.name="object("+id+")";
                myLevelStruct.Cubes.push(objectDebug);
	/*var objectCube = new THREE.Mesh( cubeGeometry, wireMaterial );*/
       //var theCharacter = String.fromCharCode(getRandomInt(33,126));
       var symbols = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"; symbols += "<>$%&*()дл{}@?=+бБ";
       theCharacter = symbols[getRandomInt(0,symbols.length-1)];
       var objectCube = genSymbol(theCharacter,inpcolor);
        objectCube.position.x = test_coord1-Math.round(myUnitSz/2);
        objectCube.position.z = test_coord2-Math.round(myUnitSz/2);
        objectCube.position.y = Math.round(myUnitSz/2); 
        itm_coords.push(new singleItm(objectDebug.uuid, objectDebug.position.x, objectDebug.position.z, getRandomInt(0, nkicollection.length) ) );
        scene.add(objectCube);
}
function cleanScene() {
    //https://www.packtpub.com/books/content/working-basic-components-make-threejs-scene
    var allChildren = scene.children;
    for(var i = allChildren.length-1;i>=0;i--){
        var child = allChildren[i];
        //child.clear();
        if (!(excludeSet.contains(child.name))) {
        scene.remove(child)    
        //console.log(child.name);  
        }
    };
}

// использование Math.round() даст неравномерное распределение!
function getRandomInt(min, max)
{
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
