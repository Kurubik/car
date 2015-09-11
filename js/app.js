// Create the physics world

var world = new p2.World({
    doProfiling : true,
    gravity : [ 0, -10 ],
});

// Set high friction so the wheels don't slip
world.defaultFriction = 100;

// Create ground
var planeShape = new p2.Rectangle(60, 1);
var plane = new p2.Body({
    position: [0, -1],
});
plane.addShape(planeShape);

var rightWall = new p2.Rectangle(10, 1);
var rightWallBody = new p2.Body({
    position : [ 29.5, 4.5],
});
rightWallBody.addShape(rightWall,0,1.57);

var leftWall = new p2.Rectangle(10, 1);
var leftWallBody = new p2.Body({
    position : [ -29.5, 4.5],
});
leftWallBody.addShape(leftWall,0,1.57);

var tromplShape = new p2.Rectangle(10, 1);
var tromplShapeBody = new p2.Body({
    position : [ -10, 1.5],
});
tromplShapeBody.addShape(tromplShape,0,0.5);

var circleShape = new p2.Circle(1);
var circleShapeBody = new p2.Body({
    position : [ 5, -0.8],
});
circleShapeBody.addShape(circleShape,0,0.5);

world.addBody(plane);
world.addBody(rightWallBody);
world.addBody(leftWallBody);
world.addBody(circleShapeBody);
world.addBody(tromplShapeBody);


// Create bonus
var bonusBody = new p2.Body({
    mass : 0,
    position : [ -18, 0.2 ]
}), bonusShape = new p2.Rectangle(0.5, 0.2);
bonusBody.addShape(bonusShape,0,1.57);
world.addBody(bonusBody);


// Create chassis
var chassisBody = new p2.Body({
    mass : 1,
    position : [ -28, 1 ]
}), chassisShape = new p2.Rectangle(1, 0.2);
chassisBody.addShape(chassisShape);
world.addBody(chassisBody);

// Create wheels
var wheelShape = new p2.Circle(0.3);

var wheelBody1 = new p2.Body({
    mass : 1,
    position : [ chassisBody.position[0] - 0.5, 0.7 ]
});
wheelBody1.addShape(wheelShape);
world.addBody(wheelBody1);

var wheelBody2 = new p2.Body({
    mass : 1,
    position : [ chassisBody.position[0] + 0.5, 0.7 ]
});
wheelBody2.addShape(wheelShape);
world.addBody(wheelBody2);

// Disable collisions between chassis and wheels
// Define bits for each shape type
var WHEELS = 1, CHASSIS = 2, GROUND = 4, BONUS = 5, OTHER = 8;

// Assign groups
wheelShape.collisionGroup = WHEELS;
chassisShape.collisionGroup = CHASSIS;
bonusShape.collisionGroup = BONUS;
planeShape.collisionGroup = GROUND;
rightWall.collisionGroup = GROUND;
leftWall.collisionGroup = GROUND;
circleShape.collisionGroup = GROUND;
tromplShape.collisionGroup = GROUND;

// Bonus sensor
bonusShape.sensor = true;


// Wheels can only collide with ground
wheelShape.collisionMask = GROUND | OTHER;

// Chassis can only collide with ground
chassisShape.collisionMask = GROUND | OTHER;

// Ground can collide with wheels and chassis
planeShape.collisionMask = WHEELS | CHASSIS | OTHER;
rightWall.collisionMask = WHEELS | CHASSIS | OTHER;
leftWall.collisionMask = WHEELS | CHASSIS | OTHER;
circleShape.collisionMask = WHEELS | CHASSIS | OTHER;
tromplShape.collisionMask = WHEELS | CHASSIS | OTHER;
bonusShape.collisionMask = WHEELS | CHASSIS | GROUND | OTHER;



// Stuff Collide



// Constrain wheels to chassis
var c1 = new p2.PrismaticConstraint(chassisBody, wheelBody1, {
    localAnchorA : [ -0.5, -0.3 ],
    localAnchorB : [ 0, 0 ],
    localAxisA : [ 0, 1 ],
    disableRotationalLock : true,
});
var c2 = new p2.PrismaticConstraint(chassisBody, wheelBody2, {
    localAnchorA : [ 0.5, -0.3 ],
    localAnchorB : [ 0, 0 ],
    localAxisA : [ 0, 1 ],
    disableRotationalLock : true,
});
c1.upperLimitEnabled = c2.upperLimitEnabled = true;
c1.upperLimit = c2.upperLimit = 0.2;
c1.lowerLimitEnabled = c2.lowerLimitEnabled = true;
c1.lowerLimit = c2.lowerLimit = -0.4;
world.addConstraint(c1);
world.addConstraint(c2);

// Add springs for the suspension
var stiffness = 100, damping = 5, restLength = 0.5;

// Left spring
world.addSpring(new p2.Spring(chassisBody, wheelBody1, {
    restLength : restLength,
    stiffness : stiffness,
    damping : damping,
    localAnchorA : [ -0.5, 0 ],
    localAnchorB : [ 0, 0 ],
}));

// Right spring
world.addSpring(new p2.Spring(chassisBody, wheelBody2, {
    restLength : restLength,
    stiffness : stiffness,
    damping : damping,
    localAnchorA : [ 0.5, 0 ],
    localAnchorB : [ 0, 0 ],
}));

// Apply current engine torque after each step
var torque = 0;
world.on('postStep', function(evt) {
    var max = 200;
    if (wheelBody1.angularVelocity * torque < max)
        wheelBody1.angularForce += torque;
    if (wheelBody2.angularVelocity * torque < max)
        wheelBody2.angularForce += torque;
});

world.on('addBody', function(evt) {
    evt.body.setDensity(1);
});


// Change the current engine torque with the left/right keys
window.onkeydown = function(evt) {
    t = 6;
    switch (evt.keyCode) {
        case 39: // right
            torque = -t;
            break;
        case 37: // left
            torque = t;
            break;
    }
};
window.onkeyup = function() {
    torque = 0;
};



Stage(function(stage) {
    stage.viewbox(50, 50).pin('align',-0.5);
    new Stage.P2(world).appendTo(stage);
});
/*
 <!DOCTYPE html>
 <html>

 <head>
 <script type="text/javascript">
 // Global variables
 var shipX = 0; // X position of ship
 var shipY = 0; // Y position of ship
 var canvas; // canvas
 var ctx; // context
 var back = new Image(); // storage for new background piece
 var oldBack = new Image(); // storage for old background piece
 var ship = new Image(); // ship
 var shipX = 0; // current ship position X
 var shipY = 0; // current ship position Y
 var oldShipX = 0; // old ship position Y
 var oldShipY = 0; // old ship position Y
 // This function is called on page load.


 function canvasSpaceGame() {

 // Get the canvas element.
 canvas = document.getElementById("myCanvas");

 // Make sure you got it.
 if (canvas.getContext)

 // If you have it, create a canvas user interface element.
 {
 // Specify 2d canvas type.
 ctx = canvas.getContext("2d");

 // Paint it black.
 ctx.fillStyle = "black";
 ctx.rect(0, 0, 300, 300);
 ctx.fill();

 // Save the initial background.
 back = ctx.getImageData(0, 0, 30, 30);

 // Paint the starfield.
 stars();

 // Draw space ship.
 makeShip();

 // Draw asteroids.
 drawAsteroids();
 }

 // Play the game until the until the game is over.
 gameLoop = setInterval(doGameLoop, 16);

 // Add keyboard listener.
 window.addEventListener('keydown', whatKey, true);

 }

 // Paint a random starfield.


 function stars() {

 // Draw 50 stars.
 for (i = 0; i <= 50; i++) {
 // Get random positions for stars.
 var x = Math.floor(Math.random() * 299);
 var y = Math.floor(Math.random() * 299);

 // Make the stars white
 ctx.fillStyle = "#EEEEEE";

 // Paint the star but not if too close to ship.
 if (x > 40 && y > 40) {

 // Draw an individual star.
 ctx.beginPath();
 ctx.arc(x, y, 3, 0, Math.PI * 2, true);
 ctx.closePath();
 ctx.fill();
 } else--i;
 }
 // Save black background.
 oldBack = ctx.getImageData(0, 0, 30, 30);

 }

 function makeShip() {

 // Draw saucer bottom.
 ctx.beginPath();
 ctx.moveTo(28.4, 16.9);
 ctx.bezierCurveTo(28.4, 19.7, 22.9, 22.0, 16.0, 22.0);
 ctx.bezierCurveTo(9.1, 22.0, 3.6, 19.7, 3.6, 16.9);
 ctx.bezierCurveTo(3.6, 14.1, 9.1, 11.8, 16.0, 11.8);
 ctx.bezierCurveTo(22.9, 11.8, 28.4, 14.1, 28.4, 16.9);
 ctx.closePath();
 ctx.fillStyle = "rgb(222, 103, 0)";
 ctx.fill();

 // Draw saucer top.
 ctx.beginPath();
 ctx.moveTo(22.3, 12.0);
 ctx.bezierCurveTo(22.3, 13.3, 19.4, 14.3, 15.9, 14.3);
 ctx.bezierCurveTo(12.4, 14.3, 9.6, 13.3, 9.6, 12.0);
 ctx.bezierCurveTo(9.6, 10.8, 12.4, 9.7, 15.9, 9.7);
 ctx.bezierCurveTo(19.4, 9.7, 22.3, 10.8, 22.3, 12.0);
 ctx.closePath();
 ctx.fillStyle = "rgb(51, 190, 0)";
 ctx.fill();

 // Save ship data.
 ship = ctx.getImageData(0, 0, 30, 30);

 // Erase it for now.
 ctx.putImageData(oldBack, 0, 0);
 }

 function doGameLoop() {

 // Put old background down to erase shipe.
 ctx.putImageData(oldBack, oldShipX, oldShipY);

 // Put ship in new position.
 ctx.putImageData(ship, shipX, shipY);
 }

 // Get key press.


 function whatKey(evt) {

 // Flag to put variables back if we hit an edge of the board.
 var flag = 0;

 // Get where the ship was before key process.
 oldShipX = shipX;
 oldShipY = shipY;
 oldBack = back;

 switch (evt.keyCode) {

 // Left arrow.
 case 37:
 shipX = shipX - 30;
 if (shipX < 0) {
 // If at edge, reset ship position and set flag.
 shipX = 0;
 flag = 1;
 }
 break;

 // Right arrow.
 case 39:
 shipX = shipX + 30;
 if (shipX > 270) {
 // If at edge, reset ship position and set flag.
 shipX = 270;
 flag = 1;
 }
 break;

 // Down arrow
 case 40:
 shipY = shipY + 30;
 if (shipY > 270) {
 // If at edge, reset ship position and set flag.
 shipY = 270;
 flag = 1;
 }
 break;

 // Up arrow
 case 38:
 shipY = shipY - 30;
 if (shipY < 0) {
 // If at edge, reset ship position and set flag.
 shipY = 0;
 flag = 1;
 }
 break;

 default:

 flag = 1;
 alert("Please only use the arrow keys.");
 }

 // If flag is set, the ship did not move.
 // Put everything back the way it was.
 if (flag) {
 shipX = oldShipX;
 shipY = oldShipY;
 back = oldBack;
 } else {
 // Otherwise, get background where the ship will go
 // So you can redraw background when the ship
 // moves again.
 back = ctx.getImageData(shipX, shipY, 30, 30);
 }

 collideTest();
 }

 function collideTest() {

 // Collision detection. Get a clip from the screen.
 var clipWidth = 20;
 var clipDepth = 20;
 var clipLength = clipWidth * clipDepth;
 // alert(clipLength);
 var clipOffset = 5;
 var whatColor = ctx.getImageData(shipX + clipOffset, shipY + clipOffset, clipWidth, clipDepth);

 // Loop through the clip and see if you find red or blue.
 for (var i = 0; i < clipLength * 4; i += 4) {
 if (whatColor.data[i] == 255) {
 alert("red");
 break;
 }
 // Second element is green but we don't care.
 if (whatColor.data[i + 2] == 255) {
 alert("blue");
 break;
 }
 // Fourth element is alpha and we don't care.
 }
 }

 function drawAsteroids() {

 // Draw asteroids.
 for (i = 0; i <= 20; i++) {
 // Get random positions for asteroids.
 var a = Math.floor(Math.random() * 299);
 var b = Math.floor(Math.random() * 299);

 // Make the asteroids red
 ctx.fillStyle = "#FF0000";

 // Keep the asteroids far enough away from
 // the beginning or end.
 if (a > 40 && b > 40 && a < 270 && b < 270) {

 // Draw an individual asteroid.
 ctx.beginPath();
 ctx.arc(a, b, 10, 0, Math.PI * 2, true);
 ctx.closePath();
 ctx.fill();
 } else--i;
 }

 // Draw blue base.
 ctx.fillStyle = "#0000FF";
 ctx.beginPath();
 ctx.rect(270, 270, 30, 30);
 ctx.closePath();
 ctx.fill();
 }
 </script>
 </head>

 <body onload="canvasSpaceGame()">
 <h1>
 Canvas Space Game
 </h1>
 <canvas id="myCanvas" width="300" height="300">
 </canvas>
 </body>

 </html>
 */