/**
 * HTML5 Canvas Graphing Calculator
 * By Curran Kelleher 11/14/2013
 *
 * Draws from examples found in
 * https://github.com/curran/screencasts/tree/gh-pages/grapher
 */

// Wait for the DOM to be ready using jQuery.
$(function (){

  // Get the 'canvas' DOM element based on its id.
  var canvas = $('#myCanvas')[0],

      // Get the canvas context, which is a namespace for the Canvas API 
      // functions for drawing graphics.
      c = canvas.getContext('2d'),
      
      // 'n' is the number of line segments used to approximate the math curve.
      n = 100,
      
      // Define the math "window", which is the visible region in
      // "math coordinates" that gets projected onto the Canvas.
      xMin = -10,
      xMax = 10,
      yMin = -10,
      yMax = 10,
      
      // Initialize the Math.js library
      // see http://mathjs.org/
      math = mathjs(),

      // 'expr' contains the mathematical expression as a string.
      expr = '',

      // 'defaultExpr' is assigned to 'expr' if there is no expression in the URL hash
      // when the page is loaded. Otherwise the URL hash is assigned to 'expr' on page load.
      defaultExpr = 'sin(x+t)*x',

      // 'scope' defines variables available inside the math expression.
      scope = {
        x: 0,
        t: 0
      },

      // 'tree' contains the parsed math expression.
      // see http://en.wikipedia.org/wiki/Abstract_syntax_tree
      tree,

      // Define a time value that gets incremented every frame.
      // This is assigned to 't' available inside the math expression.
      time = 0,
      timeIncrement = 0.1;

  // These are the main steps of the program.
  setExprFromHash();
  drawCurve();
  initTextField();
  startAnimation();

  // Update from use of back and forward buttons.
  window.addEventListener('hashchange', setExprFromHash);

  // Sets the expression from the URL hash.
  // Uses a default expression if there is no URL hash.
  function setExprFromHash(){

    var hash = getHashValue();
    if(hash){
      setExpr(hash);
    } else {
      setExpr(defaultExpr);
      setHashFromExpr();
    }

    // Update the text input to contain the expression.
    $('#inputField').val(expr);
  }

  // Sets the value of 'expr' and re-parses the expression into 'tree'.
  function setExpr(newExpr){
    expr = newExpr;
    tree = math.parse(expr, scope);
  }

  function setHashFromExpr(){
    setHashValue(expr);
  }

  function drawCurve(){
    // these are used inside the for loop.
    var i, 
        
        // these vary between xMin and xMax
        //                and yMin and yMax
        xPixel, yPixel,
        
        // these vary between 0 and 1.
        percentX, percentY,
        
        // these are in math coordinates.
        mathX, mathY;
    
    // Clear the canvas
    c.clearRect(0, 0, canvas.width, canvas.height);
    
    c.beginPath();
    for(i = 0; i < n; i++) {
      percentX = i / (n - 1);
      mathX = percentX * (xMax - xMin) + xMin;
     
      mathY = evaluateMathExpr(mathX);
      
      percentY = (mathY - yMin) / (yMax - yMin);
      
      // Flip to match canvas coordinates.
      percentY = 1 - percentY;
      
      xPixel = percentX * canvas.width;
      yPixel = percentY * canvas.height;
      c.lineTo(xPixel, yPixel);
    }
    c.stroke();
  }

  // Evaluates the current math expression based on the given 
  // values for 'mathX' and 'time' ('time' is global).
  // Returns a Y coordinate in math space.
  function evaluateMathExpr(mathX){

    // Set values on the scope visible inside the math expression.
    scope.x = mathX;
    scope.t = time;

    // Evaluate the previously parsed math expression with the
    // new values for 'x' and 't' and return it.
    return tree.eval();
  }

  // Initializes the text field value to contain the expression.
  // Also sets up an event listener to track changes to the text.
  function initTextField(){

    // Get a jQuery selection for the input field.
    var input = $('#inputField');

    // Set the initial text value from the math expression.
    input.val(expr);
    
    // Listen for changes using jQuery.
    input.keyup(function (event) {
      setExpr(input.val());
      setHashFromExpr();
    });
  }

  // Kick off an animation loop that re-renders the plot
  // 60 times each second using requestAnimationFrame.
  // See http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
  function startAnimation(){
    (function animloop(){
      requestAnimationFrame(animloop);
      render();
    }());
  }

  // This function is called each animation frame.
  function render(){
    // increment time
    time += timeIncrement;
    
    // redraw
    drawCurve();
  }

  // Gets the fragment identifier value.
  function getHashValue(){
    return location.hash.substr(1);
  }

  // Sets the fragment identifier value.
  function setHashValue(value){
    return location.hash = value;
  }
});