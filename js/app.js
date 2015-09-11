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
