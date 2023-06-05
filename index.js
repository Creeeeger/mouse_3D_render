(function(global) {

  /*
  * Constants and Main
  * www.programmingtil.com
  * www.codenameparkerllc.com
  */
  var state = {
    gl: null,
    program: null,
    ui: {
      dragging: false,
      mouse: {
        lastX: -1,
        lastY: -1,
      },
      pressedKeys: {},
    },
    animation: {},
    app: {
      angle: {
        x: 0,
        y: 0,
      },
      eye: {
        x:2.,
        y:2.,
        z:7.,
      },
    },
  };

  // Cube verts
  var DEFAULT_VERT = [
     1, 1, 1, 1, 1,1,1,1,
    -1, 1, 1, 1, 1,0,0,1,
    -1,-1, 1, 1, 0,1,0,1,
     1,-1, 1, 1, 0,0,1,1,
     1,-1,-1, 1, 0,1,1,1,
     1, 1,-1, 1, 1,1,0,1,
    -1, 1,-1, 1, 1,0,1,1,
    -1,-1,-1, 1, 0,0,0,1,
  ];

  var DEFAULT_INDICES = new Uint8Array([
    0, 1, 2,   0, 2, 3,    // front
    0, 3, 4,   0, 4, 5,    // right
    0, 5, 6,   0, 6, 1,    // up
    1, 6, 7,   1, 7, 2,    // left
    7, 4, 3,   7, 3, 2,    // down
    4, 7, 6,   4, 6, 5     // back
 ]);

  glUtils.SL.init({ callback:function() { main(); } });

  function main() {
    state.canvas = document.getElementById("glcanvas");
    state.gl = glUtils.checkWebGL(state.canvas);
    initCallbacks();
    initShaders();
    initGL();
    animate();
  }

  /*
  * Initialization
  * www.programmingtil.com
  * www.codenameparkerllc.com
  */
  function initCallbacks() {
    document.onkeydown = keydown;
    document.onkeyup = keyup;
    state.canvas.onmousedown = mousedown;
    state.canvas.onmouseup = mouseup;
    state.canvas.onmousemove = mousemove;
  }

  function initShaders() {
    var vertexShader = glUtils.getShader(state.gl, state.gl.VERTEX_SHADER, glUtils.SL.Shaders.v1.vertex),
      fragmentShader = glUtils.getShader(state.gl, state.gl.FRAGMENT_SHADER, glUtils.SL.Shaders.v1.fragment);
    state.program = glUtils.createProgram(state.gl, vertexShader, fragmentShader);
  }

  function initGL() {
    state.gl.clearColor(0,0,0,1);
    state.gl.enable(state.gl.DEPTH_TEST);
  }

  /*
  * Rendering / Drawing / Animation
  * www.programmingtil.com
  * www.codenameparkerllc.com
  */
  function animate() {
    state.animation.tick = function() {
      updateState();
      draw();
      requestAnimationFrame(state.animation.tick);
    };
    state.animation.tick();
  }

  function updateState() {
    var speed = 0.2;
    if (state.ui.pressedKeys[37]) {
      // left
      state.app.eye.x += speed;
    } else if (state.ui.pressedKeys[39]) {
      // right
      state.app.eye.x -= speed;
    } else if (state.ui.pressedKeys[40]) {
      // down
      state.app.eye.y += speed;
    } else if (state.ui.pressedKeys[38]) {
      // up
      state.app.eye.y -= speed;
    }
  }

  function draw(args) {
    var v = (args && args.v) ? args.v : DEFAULT_VERT;
    var vi = (args && args.vi) ? args.vi : DEFAULT_INDICES;
    var uMVPMatrix = state.gl.getUniformLocation(state.program, 'uMVPMatrix');
    var n = initVertexBuffers(v, vi).indices.length;
    var mvm = mat4.create();
    var pm = mat4.create();
    var mvp = mat4.create();

    mat4.perspective(pm,
      20, 1/1, 1, 100
    );
    mat4.lookAt(mvm,
      vec3.fromValues(state.app.eye.x,state.app.eye.y,state.app.eye.z),
      vec3.fromValues(0,0,0),
      vec3.fromValues(0,1,0)
    );
    mat4.copy(mvp, pm);
    mat4.multiply(mvp, mvp, mvm);
    mat4.rotateX(mvp, mvp, state.app.angle.x);
    mat4.rotateY(mvp, mvp, state.app.angle.y);

    state.gl.useProgram(state.program);
    state.gl.clear(state.gl.COLOR_BUFFER_BIT | state.gl.DEPTH_BUFFER_BIT);
    state.gl.uniformMatrix4fv(uMVPMatrix, false, mvp);
    state.gl.drawElements(state.gl.TRIANGLES, n, state.gl.UNSIGNED_BYTE, 0);
  }

  function initVertexBuffers(v, i) {
    var vertices = new Float32Array(v);
    vertices.stride = 8;
    vertices.attributes = [
      {name:'aPosition', size:3, offset:0},
      {name:'aColor',    size:3, offset:4},
    ];
    vertices.n = vertices.length/vertices.stride;
    vertices.indices = i;
    state.program.renderBuffers(vertices, i);
    return vertices;
  }

  /*
  * UI Events
  * www.programmingtil.com
  * www.codenameparkerllc.com
  */
  function keydown(event) {
    state.ui.pressedKeys[event.keyCode] = true;
  }

  function keyup(event) {
    state.ui.pressedKeys[event.keyCode] = false;
  }

  function mousedown(event) {
    var x = event.clientX;
    var y = event.clientY;
    var rect = event.target.getBoundingClientRect();
    // If we're within the rectangle, mouse is down within canvas.
    if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
      state.ui.mouse.lastX = x;
      state.ui.mouse.lastY = y;
      state.ui.dragging = true;
    }
  }

  function mouseup(event) {
    state.ui.dragging = false;
  }

  function mousemove(event) {
    var x = event.clientX;
    var y = event.clientY;
    if (state.ui.dragging) {
      // The rotation speed factor
      // dx and dy here are how for in the x or y direction the mouse moved
      var factor = 10/state.canvas.height;
      var dx = factor * (x - state.ui.mouse.lastX);
      var dy = factor * (y - state.ui.mouse.lastY);

      // update the latest angle
      state.app.angle.x = state.app.angle.x + dy;
      state.app.angle.y = state.app.angle.y + dx;
    }
    // update the last mouse position
    state.ui.mouse.lastX = x;
    state.ui.mouse.lastY = y;
  }
})(window || this);

(function(global){

  var uiUtils = {
    VERSION : '0.0.2',
    pixelInputToGLCoord: function(event, canvas) {
      var x = event.clientX,
        y = event.clientY,
        midX = canvas.width/2,
        midY = canvas.height/2,
        rect = event.target.getBoundingClientRect();
      x = ((x - rect.left) - midX) / midX;
      y = (midY - (y - rect.top)) / midY;
      return {x:x,y:y};
    },
    pixelInputToCanvasCoord: function(event, canvas) {
      var x = event.clientX,
        y = event.clientY,
        rect = event.target.getBoundingClientRect();
      x = x - rect.left;
      y = rect.bottom - y;
      return {x:x,y:y};
    }
  };

  // Expose uiUtils globally
  global.uiUtils = uiUtils;

}(window || this));

/*!!
 * JS Signals <http://millermedeiros.github.com/js-signals/>
 * Released under the MIT license <http://www.opensource.org/licenses/mit-license.php>
 * @author Miller Medeiros <http://millermedeiros.com/>
 * @version 0.6.3
 * @build 187 (07/11/2011 10:14 AM)
 */
(function(global){
    var signals = /** @lends signals */{
        VERSION : '0.6.3'
    };
    function SignalBinding(signal, listener, isOnce, listenerContext, priority) {
        this._listener = listener;
        this._isOnce = isOnce;
        this.context = listenerContext;
        this._signal = signal;
        this._priority = priority || 0;
    }
    SignalBinding.prototype = /** @lends signals.SignalBinding.prototype */ {
        active : true,
        params : null,
        execute : function (paramsArr) {
            var handlerReturn, params;
            if (this.active && !!this._listener) {
                params = this.params? this.params.concat(paramsArr) : paramsArr;
                handlerReturn = this._listener.apply(this.context, params);
                if (this._isOnce) {
                    this.detach();
                }
            }
            return handlerReturn;
        },
        detach : function () {
            return this.isBound()? this._signal.remove(this._listener) : null;
        },
        isBound : function () {
            return (!!this._signal && !!this._listener);
        },
        getListener : function () {
            return this._listener;
        },
        _destroy : function () {
            delete this._signal;
            delete this._listener;
            delete this.context;
        },
        isOnce : function () {
            return this._isOnce;
        },
        toString : function () {
            return '[SignalBinding isOnce: ' + this._isOnce +', isBound: '+ this.isBound() +', active: ' + this.active + ']';
        }
    };
    function validateListener(listener, fnName) {
        if (typeof listener !== 'function') {
            throw new Error( 'listener is a required param of {fn}() and should be a Function.'.replace('{fn}', fnName) );
        }
    }
    signals.Signal = function () {
        this._bindings = [];
    };
    signals.Signal.prototype = {
        _shouldPropagate : true,
        active : true,
        _registerListener : function (listener, isOnce, scope, priority) {
            var prevIndex = this._indexOfListener(listener),
            binding;
            if (prevIndex !== -1) { //avoid creating a new Binding for same listener if already added to list
                binding = this._bindings[prevIndex];
                if (binding.isOnce() !== isOnce) {
                    throw new Error('You cannot add'+ (isOnce? '' : 'Once') +'() then add'+ (!isOnce? '' : 'Once') +'() the same listener without removing the relationship first.');
                }
            } else {
                binding = new SignalBinding(this, listener, isOnce, scope, priority);
                this._addBinding(binding);
            }
            return binding;
        },
        _addBinding : function (binding) {
            //simplified insertion sort
            var n = this._bindings.length;
            do { --n; } while (this._bindings[n] && binding._priority <= this._bindings[n]._priority);
            this._bindings.splice(n + 1, 0, binding);
        },
        _indexOfListener : function (listener) {
            var n = this._bindings.length;
            while (n--) {
                if (this._bindings[n]._listener === listener) {
                    return n;
                }
            }
            return -1;
        },
        add : function (listener, scope, priority) {
            validateListener(listener, 'add');
            return this._registerListener(listener, false, scope, priority);
        },
        addOnce : function (listener, scope, priority) {
            validateListener(listener, 'addOnce');
            return this._registerListener(listener, true, scope, priority);
        },
        remove : function (listener) {
            validateListener(listener, 'remove');
            var i = this._indexOfListener(listener);
            if (i !== -1) {
                this._bindings[i]._destroy(); //no reason to a SignalBinding exist if it isn't attached to a signal
                this._bindings.splice(i, 1);
            }
            return listener;
        },
        removeAll : function () {
            var n = this._bindings.length;
            while (n--) {
                this._bindings[n]._destroy();
            }
            this._bindings.length = 0;
        },
        getNumListeners : function () {
            return this._bindings.length;
        },
        halt : function () {
            this._shouldPropagate = false;
        },
        dispatch : function (params) {
            if (! this.active) {
                return;
            }
            var paramsArr = Array.prototype.slice.call(arguments),
            bindings = this._bindings.slice(), //clone array in case add/remove items during dispatch
            n = this._bindings.length;
            this._shouldPropagate = true; //in case `halt` was called before dispatch or during the previous dispatch.
            do { n--; } while (bindings[n] && this._shouldPropagate && bindings[n].execute(paramsArr) !== false);
        },
        dispose : function () {
            this.removeAll();
            delete this._bindings;
        },
        toString : function () {
            return '[Signal active: '+ this.active +' numListeners: '+ this.getNumListeners() +']';
        }
    };
    global.signals = signals;
}(window || this));

(function(global){

  var glUtils = {
    VERSION : '0.0.6',
    checkWebGL: function(canvas, opts) {
      /**
       * Check if WebGL is available.
       **/
      var contexts = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"], gl;
      for (var i=0; i < contexts.length; i++) {
        try {
          gl = canvas.getContext(contexts[i], opts);
        } catch(e) {}
        if (gl) {
          break;
        }
      }
      if (!gl) {
        alert("WebGL not available, sorry! Please use a new version of Chrome or Firefox.");
      }
      return gl;
    },

    createProgram: function(gl, vertexShader, fragmentShader) {
      /**
       * Create and return a shader program
       **/
      var program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      // Check that shader program was able to link to WebGL
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        var error = gl.getProgramInfoLog(program);
        console.log('Failed to link program: ' + error);
        gl.deleteProgram(program);
        gl.deleteShader(fragmentShader);
        gl.deleteShader(vertexShader);
        return null;
      }

      // Set the vertex and fragment shader to the program for easy access
      program.vertexShader = vertexShader;
      program.fragmentShader = fragmentShader;

      // Render buffers for all the attributes
      program.renderBuffers = function(vertices, indices) {
        var buffer = gl.createBuffer();
        var indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        vertices.FSIZE = vertices.BYTES_PER_ELEMENT;

        // Attributes
        var attributes = program.vertexShader.attributes;
        for (var i=0; i<attributes.length; i++) {
          var name = attributes[i].name;
          for (var j=0; j<vertices.attributes.length; j++) {
            if (name === vertices.attributes[j].name) {
              var attr = gl.getAttribLocation(program, name);
              gl.enableVertexAttribArray(attr);
              gl.vertexAttribPointer(
                attr,
                vertices.attributes[j].size,
                gl.FLOAT,
                false,
                vertices.FSIZE*vertices.stride,
                vertices.FSIZE*vertices.attributes[j].offset
              );
            }
          }
        }

        if (indices) {
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
          gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
        }
      }

      return program;
    },

    getShader: function(gl,type,source) {
      /**
       * Get, compile, and return an embedded shader object
       **/
      var shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      // Check if compiled successfully
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log("An error occurred compiling the shaders:" + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }

      // Set the attributes, varying, and uniform to shader
      shader.attributes = this.attributesFromSource(source);
      shader.varyings = this.varyingsFromSource(source);
      shader.uniforms = this.uniformsFromSource(source);
      return shader;
    },

    /*
     * Get attributes, varyings, and uniforms from source dynamically.
     */
    xFromSource: function(source, x) {
      var xs = [];
      var lines = source.split('\n');
      for (var i=0; i<lines.length; i++) {
        var line = lines[i];
        // check that it contains the keyword at the beginning of the line (not a comment)
        if (line.slice(0, x.length) == x) {
          var words = line.split(' ');
          // remove the semicolon
          var name = words[2].slice(0, words[2].length-1);
          xs.push({type:words[1], name:name});
        }
      }
      return xs;
    },
    attributesFromSource: function(source) {
      return this.xFromSource(source, 'attribute');
    },
    varyingsFromSource: function(source) {
      return this.xFromSource(source, 'varying');
    },
    uniformsFromSource: function(source) {
      return this.xFromSource(source, 'uniform');
    }
  };

  /*
   * ShaderLoader: get shaders from HTML, or from external source
   */
  glUtils.SL = {
    sourceFromHtml: function(opts) {
      var opts = opts || {};
      this.elemName = opts.elemName || "shader";
      this.dataType = opts.dataType || "data-type";
      this.dataVersion = opts.dataVersion || "data-version";
      this.shaderElems = document.getElementsByName(this.elemName);
      this.Shaders = this.Shaders || {};
      this.slShaderCount = this.shaderElems.length;
      for(var i = 0; i < this.slShaderCount; i++) {
        var shader = this.shaderElems[i];
        if (!shader) {
          return null;
        }

        var source = "";
        var currentChild = shader.firstChild;
        while (currentChild) {
          if (currentChild.nodeType == currentChild.TEXT_NODE) {
            source += currentChild.textContent;
          }
          currentChild = currentChild.nextSibling;
        }

        var version = shader.getAttribute(this.dataVersion);
        if(!this.Shaders[version]) {
          this.Shaders[version] = {
            vertex: '',
            fragment: ''
          };
        }
        this.Shaders[version][shader.getAttribute(this.dataType)] = source;
      }
    },
    /*
     * Ajax stuff
     */
    XMLHttpFactories: [
      function () {return new XMLHttpRequest()},
      function () {return new ActiveXObject("Msxml2.XMLHTTP")},
      function () {return new ActiveXObject("Msxml3.XMLHTTP")},
      function () {return new ActiveXObject("Microsoft.XMLHTTP")}
    ],
    createXMLHTTPObject: function() {
      var xmlhttp = false;
      for (var i=0;i< this.XMLHttpFactories.length;i++) {
        try { xmlhttp = this.XMLHttpFactories[i](); }
        catch (e) { continue; }
        break;
      }
      return xmlhttp;
    },
    sendRequest: function(url,callback,element) {
      var req = this.createXMLHTTPObject();
      if (!req) return;
      var method = "GET";
      req.open(method,url,true);
      req.onreadystatechange = function () {
        if (req.readyState != 4) return;
        if (req.status != 0 && req.status != 200 && req.status != 304) {
          return;
        }
        callback(req,element);
      }
      if (req.readyState == 4) return;
      req.send();
    },
    /*
     * Signals
     */
    init: function(opts) {
      var opts = opts || {};
      this.callback = opts.callback || function() {};
      this.elemName = opts.elemName || "shader";
      this.dataSrc = opts.dataSrc || "data-src";
      this.dataType = opts.dataType || "data-type";
      this.dataVersion = opts.dataVersion || "data-version";
      this.shaderElems = document.getElementsByName(this.elemName);
      this.loadedSignal = new global.signals.Signal();
      this.Shaders = this.Shaders || {};
      this.loadedSignal.add(this.callback);
      this.slShaderCount = this.shaderElems.length;
      for(var i = 0; i < this.slShaderCount; i++) {
        var shader = this.shaderElems[i];
        this.sendRequest(shader.getAttribute(this.dataSrc), this.processShader, shader);
      }
      this.checkForComplete();
    },
    checkForComplete: function() {
      if(!this.slShaderCount) {
        this.loadedSignal.dispatch();
      }
    },
    processShader: function(req,element) {
      glUtils.SL.slShaderCount--;
      var version = element.getAttribute(glUtils.SL.dataVersion);
      if(!glUtils.SL.Shaders[version]) {
        glUtils.SL.Shaders[version] = {
          vertex: '',
          fragment: ''
        };
      }
      glUtils.SL.Shaders[version][element.getAttribute(glUtils.SL.dataType)] = req.responseText;
      glUtils.SL.checkForComplete();
    },
  };

  // Expose glUtils globally
  global.glUtils = glUtils;

}(window || this));
