/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@babel/runtime/helpers/interopRequireDefault.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/interopRequireDefault.js ***!
  \**********************************************************************/
/***/ ((module) => {

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

module.exports = _interopRequireDefault;
module.exports["default"] = module.exports, module.exports.__esModule = true;

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/typeof.js":
/*!*******************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/typeof.js ***!
  \*******************************************************/
/***/ ((module) => {

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    module.exports = _typeof = function _typeof(obj) {
      return typeof obj;
    };

    module.exports["default"] = module.exports, module.exports.__esModule = true;
  } else {
    module.exports = _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    module.exports["default"] = module.exports, module.exports.__esModule = true;
  }

  return _typeof(obj);
}

module.exports = _typeof;
module.exports["default"] = module.exports, module.exports.__esModule = true;

/***/ }),

/***/ "./node_modules/@luma.gl/engine/dist/esm/lib/animation-loop.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@luma.gl/engine/dist/esm/lib/animation-loop.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ AnimationLoop)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/init.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/classes/query.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/request-animation-frame.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/classes/framebuffer.js");
/* harmony import */ var probe_gl_env__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! probe.gl/env */ "./node_modules/probe.gl/dist/es5/env/index.js");
/* provided dependency */ var Promise = __webpack_require__(/*! es6-promise */ "./node_modules/es6-promise/dist/es6-promise.js");



const isPage = (0,probe_gl_env__WEBPACK_IMPORTED_MODULE_1__.isBrowser)() && typeof document !== 'undefined';
let statIdCounter = 0;
class AnimationLoop {
  constructor(props = {}) {
    const {
      onCreateContext = opts => (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.createGLContext)(opts),
      onAddHTML = null,
      onInitialize = () => {},
      onRender = () => {},
      onFinalize = () => {},
      onError,
      gl = null,
      glOptions = {},
      debug = false,
      createFramebuffer = false,
      autoResizeViewport = true,
      autoResizeDrawingBuffer = true,
      stats = _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_2__.lumaStats.get(`animation-loop-${statIdCounter++}`)
    } = props;
    let {
      useDevicePixels = true
    } = props;

    if ('useDevicePixelRatio' in props) {
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.deprecated('useDevicePixelRatio', 'useDevicePixels')();
      useDevicePixels = props.useDevicePixelRatio;
    }

    this.props = {
      onCreateContext,
      onAddHTML,
      onInitialize,
      onRender,
      onFinalize,
      onError,
      gl,
      glOptions,
      debug,
      createFramebuffer
    };
    this.gl = gl;
    this.needsRedraw = null;
    this.timeline = null;
    this.stats = stats;
    this.cpuTime = this.stats.get('CPU Time');
    this.gpuTime = this.stats.get('GPU Time');
    this.frameRate = this.stats.get('Frame Rate');
    this._initialized = false;
    this._running = false;
    this._animationFrameId = null;
    this._nextFramePromise = null;
    this._resolveNextFrame = null;
    this._cpuStartTime = 0;
    this.setProps({
      autoResizeViewport,
      autoResizeDrawingBuffer,
      useDevicePixels
    });
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this._pageLoadPromise = null;
    this._onMousemove = this._onMousemove.bind(this);
    this._onMouseleave = this._onMouseleave.bind(this);
  }

  delete() {
    this.stop();

    this._setDisplay(null);
  }

  setNeedsRedraw(reason) {
    (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_3__.assert)(typeof reason === 'string');
    this.needsRedraw = this.needsRedraw || reason;
    return this;
  }

  setProps(props) {
    if ('autoResizeViewport' in props) {
      this.autoResizeViewport = props.autoResizeViewport;
    }

    if ('autoResizeDrawingBuffer' in props) {
      this.autoResizeDrawingBuffer = props.autoResizeDrawingBuffer;
    }

    if ('useDevicePixels' in props) {
      this.useDevicePixels = props.useDevicePixels;
    }

    return this;
  }

  start(opts = {}) {
    if (this._running) {
      return this;
    }

    this._running = true;

    const startPromise = this._getPageLoadPromise().then(() => {
      if (!this._running || this._initialized) {
        return null;
      }

      this._createWebGLContext(opts);

      this._createFramebuffer();

      this._startEventHandling();

      this._initializeCallbackData();

      this._updateCallbackData();

      this._resizeCanvasDrawingBuffer();

      this._resizeViewport();

      this._gpuTimeQuery = _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_4__["default"].isSupported(this.gl, ['timers']) ? new _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_4__["default"](this.gl) : null;
      this._initialized = true;
      return this.onInitialize(this.animationProps);
    }).then(appContext => {
      if (this._running) {
        this._addCallbackData(appContext || {});

        if (appContext !== false) {
          this._startLoop();
        }
      }
    });

    if (this.props.onError) {
      startPromise.catch(this.props.onError);
    }

    return this;
  }

  redraw() {
    if (this.isContextLost()) {
      return this;
    }

    this._beginTimers();

    this._setupFrame();

    this._updateCallbackData();

    this._renderFrame(this.animationProps);

    this._clearNeedsRedraw();

    if (this.offScreen && this.gl.commit) {
      this.gl.commit();
    }

    if (this._resolveNextFrame) {
      this._resolveNextFrame(this);

      this._nextFramePromise = null;
      this._resolveNextFrame = null;
    }

    this._endTimers();

    return this;
  }

  stop() {
    if (this._running) {
      this._finalizeCallbackData();

      this._cancelAnimationFrame(this._animationFrameId);

      this._nextFramePromise = null;
      this._resolveNextFrame = null;
      this._animationFrameId = null;
      this._running = false;
    }

    return this;
  }

  attachTimeline(timeline) {
    this.timeline = timeline;
    return this.timeline;
  }

  detachTimeline() {
    this.timeline = null;
  }

  waitForRender() {
    this.setNeedsRedraw('waitForRender');

    if (!this._nextFramePromise) {
      this._nextFramePromise = new Promise(resolve => {
        this._resolveNextFrame = resolve;
      });
    }

    return this._nextFramePromise;
  }

  async toDataURL() {
    this.setNeedsRedraw('toDataURL');
    await this.waitForRender();
    return this.gl.canvas.toDataURL();
  }

  isContextLost() {
    return this.gl.isContextLost();
  }

  onCreateContext(...args) {
    return this.props.onCreateContext(...args);
  }

  onInitialize(...args) {
    return this.props.onInitialize(...args);
  }

  onRender(...args) {
    return this.props.onRender(...args);
  }

  onFinalize(...args) {
    return this.props.onFinalize(...args);
  }

  getHTMLControlValue(id, defaultValue = 1) {
    const element = document.getElementById(id);
    return element ? Number(element.value) : defaultValue;
  }

  setViewParameters() {
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.removed('AnimationLoop.setViewParameters', 'AnimationLoop.setProps')();
    return this;
  }

  _startLoop() {
    const renderFrame = () => {
      if (!this._running) {
        return;
      }

      this.redraw();
      this._animationFrameId = this._requestAnimationFrame(renderFrame);
    };

    this._cancelAnimationFrame(this._animationFrameId);

    this._animationFrameId = this._requestAnimationFrame(renderFrame);
  }

  _getPageLoadPromise() {
    if (!this._pageLoadPromise) {
      this._pageLoadPromise = isPage ? new Promise((resolve, reject) => {
        if (isPage && document.readyState === 'complete') {
          resolve(document);
          return;
        }

        window.addEventListener('load', () => {
          resolve(document);
        });
      }) : Promise.resolve({});
    }

    return this._pageLoadPromise;
  }

  _setDisplay(display) {
    if (this.display) {
      this.display.delete();
      this.display.animationLoop = null;
    }

    if (display) {
      display.animationLoop = this;
    }

    this.display = display;
  }

  _cancelAnimationFrame(animationFrameId) {
    if (this.display && this.display.cancelAnimationFrame) {
      return this.display.cancelAnimationFrame(animationFrameId);
    }

    return (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_5__.cancelAnimationFrame)(animationFrameId);
  }

  _requestAnimationFrame(renderFrameCallback) {
    if (this._running) {
      if (this.display && this.display.requestAnimationFrame) {
        return this.display.requestAnimationFrame(renderFrameCallback);
      }

      return (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_5__.requestAnimationFrame)(renderFrameCallback);
    }

    return undefined;
  }

  _renderFrame(...args) {
    if (this.display) {
      this.display._renderFrame(...args);

      return;
    }

    this.onRender(...args);
  }

  _clearNeedsRedraw() {
    this.needsRedraw = null;
  }

  _setupFrame() {
    this._resizeCanvasDrawingBuffer();

    this._resizeViewport();

    this._resizeFramebuffer();
  }

  _initializeCallbackData() {
    this.animationProps = {
      gl: this.gl,
      stop: this.stop,
      canvas: this.gl.canvas,
      framebuffer: this.framebuffer,
      useDevicePixels: this.useDevicePixels,
      needsRedraw: null,
      startTime: Date.now(),
      engineTime: 0,
      tick: 0,
      tock: 0,
      time: 0,
      _timeline: this.timeline,
      _loop: this,
      _animationLoop: this,
      _mousePosition: null
    };
  }

  _updateCallbackData() {
    const {
      width,
      height,
      aspect
    } = this._getSizeAndAspect();

    if (width !== this.animationProps.width || height !== this.animationProps.height) {
      this.setNeedsRedraw('drawing buffer resized');
    }

    if (aspect !== this.animationProps.aspect) {
      this.setNeedsRedraw('drawing buffer aspect changed');
    }

    this.animationProps.width = width;
    this.animationProps.height = height;
    this.animationProps.aspect = aspect;
    this.animationProps.needsRedraw = this.needsRedraw;
    this.animationProps.engineTime = Date.now() - this.animationProps.startTime;

    if (this.timeline) {
      this.timeline.update(this.animationProps.engineTime);
    }

    this.animationProps.tick = Math.floor(this.animationProps.time / 1000 * 60);
    this.animationProps.tock++;
    this.animationProps.time = this.timeline ? this.timeline.getTime() : this.animationProps.engineTime;
    this.animationProps._offScreen = this.offScreen;
  }

  _finalizeCallbackData() {
    this.onFinalize(this.animationProps);
  }

  _addCallbackData(appContext) {
    if (typeof appContext === 'object' && appContext !== null) {
      this.animationProps = Object.assign({}, this.animationProps, appContext);
    }
  }

  _createWebGLContext(opts) {
    this.offScreen = opts.canvas && typeof OffscreenCanvas !== 'undefined' && opts.canvas instanceof OffscreenCanvas;
    opts = Object.assign({}, opts, this.props.glOptions);
    this.gl = this.props.gl ? (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.instrumentGLContext)(this.props.gl, opts) : this.onCreateContext(opts);

    if (!(0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL)(this.gl)) {
      throw new Error('AnimationLoop.onCreateContext - illegal context returned');
    }

    (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.resetParameters)(this.gl);

    this._createInfoDiv();
  }

  _createInfoDiv() {
    if (this.gl.canvas && this.props.onAddHTML) {
      const wrapperDiv = document.createElement('div');
      document.body.appendChild(wrapperDiv);
      wrapperDiv.style.position = 'relative';
      const div = document.createElement('div');
      div.style.position = 'absolute';
      div.style.left = '10px';
      div.style.bottom = '10px';
      div.style.width = '300px';
      div.style.background = 'white';
      wrapperDiv.appendChild(this.gl.canvas);
      wrapperDiv.appendChild(div);
      const html = this.props.onAddHTML(div);

      if (html) {
        div.innerHTML = html;
      }
    }
  }

  _getSizeAndAspect() {
    const width = this.gl.drawingBufferWidth;
    const height = this.gl.drawingBufferHeight;
    let aspect = 1;
    const {
      canvas
    } = this.gl;

    if (canvas && canvas.clientHeight) {
      aspect = canvas.clientWidth / canvas.clientHeight;
    } else if (width > 0 && height > 0) {
      aspect = width / height;
    }

    return {
      width,
      height,
      aspect
    };
  }

  _resizeViewport() {
    if (this.autoResizeViewport) {
      this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
    }
  }

  _resizeCanvasDrawingBuffer() {
    if (this.autoResizeDrawingBuffer) {
      (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.resizeGLContext)(this.gl, {
        useDevicePixels: this.useDevicePixels
      });
    }
  }

  _createFramebuffer() {
    if (this.props.createFramebuffer) {
      this.framebuffer = new _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_6__["default"](this.gl);
    }
  }

  _resizeFramebuffer() {
    if (this.framebuffer) {
      this.framebuffer.resize({
        width: this.gl.drawingBufferWidth,
        height: this.gl.drawingBufferHeight
      });
    }
  }

  _beginTimers() {
    this.frameRate.timeEnd();
    this.frameRate.timeStart();

    if (this._gpuTimeQuery && this._gpuTimeQuery.isResultAvailable() && !this._gpuTimeQuery.isTimerDisjoint()) {
      this.stats.get('GPU Time').addTime(this._gpuTimeQuery.getTimerMilliseconds());
    }

    if (this._gpuTimeQuery) {
      this._gpuTimeQuery.beginTimeElapsedQuery();
    }

    this.cpuTime.timeStart();
  }

  _endTimers() {
    this.cpuTime.timeEnd();

    if (this._gpuTimeQuery) {
      this._gpuTimeQuery.end();
    }
  }

  _startEventHandling() {
    const {
      canvas
    } = this.gl;

    if (canvas) {
      canvas.addEventListener('mousemove', this._onMousemove);
      canvas.addEventListener('mouseleave', this._onMouseleave);
    }
  }

  _onMousemove(e) {
    this.animationProps._mousePosition = [e.offsetX, e.offsetY];
  }

  _onMouseleave(e) {
    this.animationProps._mousePosition = null;
  }

}
//# sourceMappingURL=animation-loop.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/engine/dist/esm/lib/model-utils.js":
/*!******************************************************************!*\
  !*** ./node_modules/@luma.gl/engine/dist/esm/lib/model-utils.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getBuffersFromGeometry": () => (/* binding */ getBuffersFromGeometry),
/* harmony export */   "inferAttributeAccessor": () => (/* binding */ inferAttributeAccessor)
/* harmony export */ });
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/classes/buffer.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");

const GLTF_TO_LUMA_ATTRIBUTE_MAP = {
  POSITION: 'positions',
  NORMAL: 'normals',
  COLOR_0: 'colors',
  TEXCOORD_0: 'texCoords',
  TEXCOORD_1: 'texCoords1',
  TEXCOORD_2: 'texCoords2'
};
function getBuffersFromGeometry(gl, geometry, options) {
  const buffers = {};
  let indices = geometry.indices;

  for (const name in geometry.attributes) {
    const attribute = geometry.attributes[name];
    const remappedName = mapAttributeName(name, options);

    if (name === 'indices') {
      indices = attribute;
    } else if (attribute.constant) {
      buffers[remappedName] = attribute.value;
    } else {
      const typedArray = attribute.value;
      const accessor = { ...attribute
      };
      delete accessor.value;
      buffers[remappedName] = [new _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_0__["default"](gl, typedArray), accessor];
      inferAttributeAccessor(name, accessor);
    }
  }

  if (indices) {
    const data = indices.value || indices;
    (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_1__.assert)(data instanceof Uint16Array || data instanceof Uint32Array, 'attribute array for "indices" must be of integer type');
    const accessor = {
      size: 1,
      isIndexed: indices.isIndexed === undefined ? true : indices.isIndexed
    };
    buffers.indices = [new _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_0__["default"](gl, {
      data,
      target: 34963
    }), accessor];
  }

  return buffers;
}

function mapAttributeName(name, options) {
  const {
    attributeMap = GLTF_TO_LUMA_ATTRIBUTE_MAP
  } = options || {};
  return attributeMap && attributeMap[name] || name;
}

function inferAttributeAccessor(attributeName, attribute) {
  let category;

  switch (attributeName) {
    case 'texCoords':
    case 'texCoord1':
    case 'texCoord2':
    case 'texCoord3':
      category = 'uvs';
      break;

    case 'vertices':
    case 'positions':
    case 'normals':
    case 'pickingColors':
      category = 'vectors';
      break;

    default:
  }

  switch (category) {
    case 'vectors':
      attribute.size = attribute.size || 3;
      break;

    case 'uvs':
      attribute.size = attribute.size || 2;
      break;

    default:
  }

  (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_1__.assert)(Number.isFinite(attribute.size), `attribute ${attributeName} needs size`);
}
//# sourceMappingURL=model-utils.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/engine/dist/esm/lib/model.js":
/*!************************************************************!*\
  !*** ./node_modules/@luma.gl/engine/dist/esm/lib/model.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Model)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _program_manager__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./program-manager */ "./node_modules/@luma.gl/engine/dist/esm/lib/program-manager.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/utils/utils.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/classes/clear.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/classes/program.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/classes/vertex-array.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/classes/buffer.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/classes/transform-feedback.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/debug/debug-vertex-array.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/debug/debug-uniforms.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/debug/debug-program-configuration.js");
/* harmony import */ var _model_utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./model-utils */ "./node_modules/@luma.gl/engine/dist/esm/lib/model-utils.js");





const LOG_DRAW_PRIORITY = 2;
const LOG_DRAW_TIMEOUT = 10000;
const ERR_MODEL_PARAMS = 'Model needs drawMode and vertexCount';

const NOOP = () => {};

const DRAW_PARAMS = {};
class Model {
  constructor(gl, props = {}) {
    const {
      id = (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_1__.uid)('model')
    } = props;
    (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_2__.assert)((0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL)(gl));
    this.id = id;
    this.gl = gl;
    this.id = props.id || (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_1__.uid)('Model');
    this.lastLogTime = 0;
    this.animated = false;
    this.initialize(props);
  }

  initialize(props) {
    this.props = {};
    this.programManager = props.programManager || _program_manager__WEBPACK_IMPORTED_MODULE_3__["default"].getDefaultProgramManager(this.gl);
    this._programManagerState = -1;
    this._managedProgram = false;
    const {
      program = null,
      vs,
      fs,
      modules,
      defines,
      inject,
      varyings,
      bufferMode,
      transpileToGLSL100
    } = props;
    this.programProps = {
      program,
      vs,
      fs,
      modules,
      defines,
      inject,
      varyings,
      bufferMode,
      transpileToGLSL100
    };
    this.program = null;
    this.vertexArray = null;
    this._programDirty = true;
    this.userData = {};
    this.needsRedraw = true;
    this._attributes = {};
    this.attributes = {};
    this.uniforms = {};
    this.pickable = true;

    this._checkProgram();

    this.setUniforms(Object.assign({}, this.getModuleUniforms(props.moduleSettings)));
    this.drawMode = props.drawMode !== undefined ? props.drawMode : 4;
    this.vertexCount = props.vertexCount || 0;
    this.geometryBuffers = {};
    this.isInstanced = props.isInstanced || props.instanced || props.instanceCount > 0;

    this._setModelProps(props);

    this.geometry = {};
    (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_2__.assert)(this.drawMode !== undefined && Number.isFinite(this.vertexCount), ERR_MODEL_PARAMS);
  }

  setProps(props) {
    this._setModelProps(props);
  }

  delete() {
    for (const key in this._attributes) {
      if (this._attributes[key] !== this.attributes[key]) {
        this._attributes[key].delete();
      }
    }

    if (this._managedProgram) {
      this.programManager.release(this.program);
      this._managedProgram = false;
    }

    this.vertexArray.delete();

    this._deleteGeometryBuffers();
  }

  getDrawMode() {
    return this.drawMode;
  }

  getVertexCount() {
    return this.vertexCount;
  }

  getInstanceCount() {
    return this.instanceCount;
  }

  getAttributes() {
    return this.attributes;
  }

  getProgram() {
    return this.program;
  }

  setProgram(props) {
    const {
      program,
      vs,
      fs,
      modules,
      defines,
      inject,
      varyings,
      bufferMode,
      transpileToGLSL100
    } = props;
    this.programProps = {
      program,
      vs,
      fs,
      modules,
      defines,
      inject,
      varyings,
      bufferMode,
      transpileToGLSL100
    };
    this._programDirty = true;
  }

  getUniforms() {
    return this.uniforms;
  }

  setDrawMode(drawMode) {
    this.drawMode = drawMode;
    return this;
  }

  setVertexCount(vertexCount) {
    (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_2__.assert)(Number.isFinite(vertexCount));
    this.vertexCount = vertexCount;
    return this;
  }

  setInstanceCount(instanceCount) {
    (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_2__.assert)(Number.isFinite(instanceCount));
    this.instanceCount = instanceCount;
    return this;
  }

  setGeometry(geometry) {
    this.drawMode = geometry.drawMode;
    this.vertexCount = geometry.getVertexCount();

    this._deleteGeometryBuffers();

    this.geometryBuffers = (0,_model_utils__WEBPACK_IMPORTED_MODULE_4__.getBuffersFromGeometry)(this.gl, geometry);
    this.vertexArray.setAttributes(this.geometryBuffers);
    return this;
  }

  setAttributes(attributes = {}) {
    if ((0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_1__.isObjectEmpty)(attributes)) {
      return this;
    }

    const normalizedAttributes = {};

    for (const name in attributes) {
      const attribute = attributes[name];
      normalizedAttributes[name] = attribute.getValue ? attribute.getValue() : attribute;
    }

    this.vertexArray.setAttributes(normalizedAttributes);
    return this;
  }

  setUniforms(uniforms = {}) {
    Object.assign(this.uniforms, uniforms);
    return this;
  }

  getModuleUniforms(opts) {
    this._checkProgram();

    const getUniforms = this.programManager.getUniforms(this.program);

    if (getUniforms) {
      return getUniforms(opts);
    }

    return {};
  }

  updateModuleSettings(opts) {
    const uniforms = this.getModuleUniforms(opts || {});
    return this.setUniforms(uniforms);
  }

  clear(opts) {
    (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_5__.clear)(this.program.gl, opts);
    return this;
  }

  draw(opts = {}) {
    this._checkProgram();

    const {
      moduleSettings = null,
      framebuffer,
      uniforms = {},
      attributes = {},
      transformFeedback = this.transformFeedback,
      parameters = {},
      vertexArray = this.vertexArray
    } = opts;
    this.setAttributes(attributes);
    this.updateModuleSettings(moduleSettings);
    this.setUniforms(uniforms);
    let logPriority;

    if (_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.priority >= LOG_DRAW_PRIORITY) {
      logPriority = this._logDrawCallStart(LOG_DRAW_PRIORITY);
    }

    const drawParams = this.vertexArray.getDrawParams();
    const {
      isIndexed = drawParams.isIndexed,
      indexType = drawParams.indexType,
      indexOffset = drawParams.indexOffset,
      vertexArrayInstanced = drawParams.isInstanced
    } = this.props;

    if (vertexArrayInstanced && !this.isInstanced) {
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.warn('Found instanced attributes on non-instanced model', this.id)();
    }

    const {
      isInstanced,
      instanceCount
    } = this;
    const {
      onBeforeRender = NOOP,
      onAfterRender = NOOP
    } = this.props;
    onBeforeRender();
    this.program.setUniforms(this.uniforms);
    const didDraw = this.program.draw(Object.assign(DRAW_PARAMS, opts, {
      logPriority,
      uniforms: null,
      framebuffer,
      parameters,
      drawMode: this.getDrawMode(),
      vertexCount: this.getVertexCount(),
      vertexArray,
      transformFeedback,
      isIndexed,
      indexType,
      isInstanced,
      instanceCount,
      offset: isIndexed ? indexOffset : 0
    }));
    onAfterRender();

    if (_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.priority >= LOG_DRAW_PRIORITY) {
      this._logDrawCallEnd(logPriority, vertexArray, framebuffer);
    }

    return didDraw;
  }

  transform(opts = {}) {
    const {
      discard = true,
      feedbackBuffers,
      unbindModels = []
    } = opts;
    let {
      parameters
    } = opts;

    if (feedbackBuffers) {
      this._setFeedbackBuffers(feedbackBuffers);
    }

    if (discard) {
      parameters = Object.assign({}, parameters, {
        [35977]: discard
      });
    }

    unbindModels.forEach(model => model.vertexArray.unbindBuffers());

    try {
      this.draw(Object.assign({}, opts, {
        parameters
      }));
    } finally {
      unbindModels.forEach(model => model.vertexArray.bindBuffers());
    }

    return this;
  }

  render(uniforms = {}) {
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.warn('Model.render() is deprecated. Use Model.setUniforms() and Model.draw()')();
    return this.setUniforms(uniforms).draw();
  }

  _setModelProps(props) {
    Object.assign(this.props, props);

    if ('uniforms' in props) {
      this.setUniforms(props.uniforms);
    }

    if ('pickable' in props) {
      this.pickable = props.pickable;
    }

    if ('instanceCount' in props) {
      this.instanceCount = props.instanceCount;
    }

    if ('geometry' in props) {
      this.setGeometry(props.geometry);
    }

    if ('attributes' in props) {
      this.setAttributes(props.attributes);
    }

    if ('_feedbackBuffers' in props) {
      this._setFeedbackBuffers(props._feedbackBuffers);
    }
  }

  _checkProgram() {
    const needsUpdate = this._programDirty || this.programManager.stateHash !== this._programManagerState;

    if (!needsUpdate) {
      return;
    }

    let {
      program
    } = this.programProps;

    if (program) {
      this._managedProgram = false;
    } else {
      const {
        vs,
        fs,
        modules,
        inject,
        defines,
        varyings,
        bufferMode,
        transpileToGLSL100
      } = this.programProps;
      program = this.programManager.get({
        vs,
        fs,
        modules,
        inject,
        defines,
        varyings,
        bufferMode,
        transpileToGLSL100
      });

      if (this.program && this._managedProgram) {
        this.programManager.release(this.program);
      }

      this._programManagerState = this.programManager.stateHash;
      this._managedProgram = true;
    }

    (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_2__.assert)(program instanceof _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_6__["default"], 'Model needs a program');
    this._programDirty = false;

    if (program === this.program) {
      return;
    }

    this.program = program;

    if (this.vertexArray) {
      this.vertexArray.setProps({
        program: this.program,
        attributes: this.vertexArray.attributes
      });
    } else {
      this.vertexArray = new _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_7__["default"](this.gl, {
        program: this.program
      });
    }

    this.setUniforms(Object.assign({}, this.getModuleUniforms()));
  }

  _deleteGeometryBuffers() {
    for (const name in this.geometryBuffers) {
      const buffer = this.geometryBuffers[name][0] || this.geometryBuffers[name];

      if (buffer instanceof _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_8__["default"]) {
        buffer.delete();
      }
    }
  }

  _setAnimationProps(animationProps) {
    if (this.animated) {
      (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_2__.assert)(animationProps, 'Model.draw(): animated uniforms but no animationProps');
    }
  }

  _setFeedbackBuffers(feedbackBuffers = {}) {
    if ((0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_1__.isObjectEmpty)(feedbackBuffers)) {
      return this;
    }

    const {
      gl
    } = this.program;
    this.transformFeedback = this.transformFeedback || new _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_9__["default"](gl, {
      program: this.program
    });
    this.transformFeedback.setBuffers(feedbackBuffers);
    return this;
  }

  _logDrawCallStart(logLevel) {
    const logDrawTimeout = logLevel > 3 ? 0 : LOG_DRAW_TIMEOUT;

    if (Date.now() - this.lastLogTime < logDrawTimeout) {
      return undefined;
    }

    this.lastLogTime = Date.now();
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.group(LOG_DRAW_PRIORITY, `>>> DRAWING MODEL ${this.id}`, {
      collapsed: _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.level <= 2
    })();
    return logLevel;
  }

  _logDrawCallEnd(logLevel, vertexArray, uniforms, framebuffer) {
    if (logLevel === undefined) {
      return;
    }

    const attributeTable = (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_10__.getDebugTableForVertexArray)({
      vertexArray,
      header: `${this.id} attributes`,
      attributes: this._attributes
    });
    const {
      table: uniformTable,
      unusedTable,
      unusedCount
    } = (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_11__.getDebugTableForUniforms)({
      header: `${this.id} uniforms`,
      program: this.program,
      uniforms: Object.assign({}, this.program.uniforms, uniforms)
    });
    const {
      table: missingTable,
      count: missingCount
    } = (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_11__.getDebugTableForUniforms)({
      header: `${this.id} uniforms`,
      program: this.program,
      uniforms: Object.assign({}, this.program.uniforms, uniforms),
      undefinedOnly: true
    });

    if (missingCount > 0) {
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.log('MISSING UNIFORMS', Object.keys(missingTable))();
    }

    if (unusedCount > 0) {
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.log('UNUSED UNIFORMS', Object.keys(unusedTable))();
    }

    const configTable = (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_12__.getDebugTableForProgramConfiguration)(this.vertexArray.configuration);
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.table(logLevel, attributeTable)();
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.table(logLevel, uniformTable)();
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.table(logLevel + 1, configTable)();

    if (framebuffer) {
      framebuffer.log({
        logLevel: LOG_DRAW_PRIORITY,
        message: `Rendered to ${framebuffer.id}`
      });
    }

    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.groupEnd(LOG_DRAW_PRIORITY, `>>> DRAWING MODEL ${this.id}`)();
  }

}
//# sourceMappingURL=model.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/engine/dist/esm/lib/program-manager.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@luma.gl/engine/dist/esm/lib/program-manager.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ProgramManager)
/* harmony export */ });
/* harmony import */ var _luma_gl_shadertools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/shadertools */ "./node_modules/@luma.gl/shadertools/dist/esm/lib/assemble-shaders.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/classes/program.js");


class ProgramManager {
  static getDefaultProgramManager(gl) {
    gl.luma = gl.luma || {};
    gl.luma.defaultProgramManager = gl.luma.defaultProgramManager || new ProgramManager(gl);
    return gl.luma.defaultProgramManager;
  }

  constructor(gl) {
    this.gl = gl;
    this._programCache = {};
    this._getUniforms = {};
    this._registeredModules = {};
    this._hookFunctions = [];
    this._defaultModules = [];
    this._hashes = {};
    this._hashCounter = 0;
    this.stateHash = 0;
    this._useCounts = {};
  }

  addDefaultModule(module) {
    if (!this._defaultModules.find(m => m.name === module.name)) {
      this._defaultModules.push(module);
    }

    this.stateHash++;
  }

  removeDefaultModule(module) {
    const moduleName = typeof module === 'string' ? module : module.name;
    this._defaultModules = this._defaultModules.filter(m => m.name !== moduleName);
    this.stateHash++;
  }

  addShaderHook(hook, opts) {
    if (opts) {
      hook = Object.assign(opts, {
        hook
      });
    }

    this._hookFunctions.push(hook);

    this.stateHash++;
  }

  get(props = {}) {
    const {
      vs = '',
      fs = '',
      defines = {},
      inject = {},
      varyings = [],
      bufferMode = 0x8c8d,
      transpileToGLSL100 = false
    } = props;

    const modules = this._getModuleList(props.modules);

    const vsHash = this._getHash(vs);

    const fsHash = this._getHash(fs);

    const moduleHashes = modules.map(m => this._getHash(m.name)).sort();
    const varyingHashes = varyings.map(v => this._getHash(v));
    const defineKeys = Object.keys(defines).sort();
    const injectKeys = Object.keys(inject).sort();
    const defineHashes = [];
    const injectHashes = [];

    for (const key of defineKeys) {
      defineHashes.push(this._getHash(key));
      defineHashes.push(this._getHash(defines[key]));
    }

    for (const key of injectKeys) {
      injectHashes.push(this._getHash(key));
      injectHashes.push(this._getHash(inject[key]));
    }

    const hash = `${vsHash}/${fsHash}D${defineHashes.join('/')}M${moduleHashes.join('/')}I${injectHashes.join('/')}V${varyingHashes.join('/')}H${this.stateHash}B${bufferMode}${transpileToGLSL100 ? 'T' : ''}`;

    if (!this._programCache[hash]) {
      const assembled = (0,_luma_gl_shadertools__WEBPACK_IMPORTED_MODULE_0__.assembleShaders)(this.gl, {
        vs,
        fs,
        modules,
        inject,
        defines,
        hookFunctions: this._hookFunctions,
        transpileToGLSL100
      });
      this._programCache[hash] = new _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_1__["default"](this.gl, {
        hash,
        vs: assembled.vs,
        fs: assembled.fs,
        varyings,
        bufferMode
      });

      this._getUniforms[hash] = assembled.getUniforms || (x => {});

      this._useCounts[hash] = 0;
    }

    this._useCounts[hash]++;
    return this._programCache[hash];
  }

  getUniforms(program) {
    return this._getUniforms[program.hash] || null;
  }

  release(program) {
    const hash = program.hash;
    this._useCounts[hash]--;

    if (this._useCounts[hash] === 0) {
      this._programCache[hash].delete();

      delete this._programCache[hash];
      delete this._getUniforms[hash];
      delete this._useCounts[hash];
    }
  }

  _getHash(key) {
    if (this._hashes[key] === undefined) {
      this._hashes[key] = this._hashCounter++;
    }

    return this._hashes[key];
  }

  _getModuleList(appModules = []) {
    const modules = new Array(this._defaultModules.length + appModules.length);
    const seen = {};
    let count = 0;

    for (let i = 0, len = this._defaultModules.length; i < len; ++i) {
      const module = this._defaultModules[i];
      const name = module.name;
      modules[count++] = module;
      seen[name] = true;
    }

    for (let i = 0, len = appModules.length; i < len; ++i) {
      const module = appModules[i];
      const name = module.name;

      if (!seen[name]) {
        modules[count++] = module;
        seen[name] = true;
      }
    }

    modules.length = count;
    return modules;
  }

}
//# sourceMappingURL=program-manager.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/engine/dist/esm/transform/buffer-transform.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/@luma.gl/engine/dist/esm/transform/buffer-transform.js ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ BufferTransform)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/classes/buffer.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/classes/transform-feedback.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");



class BufferTransform {
  constructor(gl, props = {}) {
    this.gl = gl;
    this.currentIndex = 0;
    this.feedbackMap = {};
    this.varyings = null;
    this.bindings = [];
    this.resources = {};

    this._initialize(props);

    Object.seal(this);
  }

  setupResources(opts) {
    for (const binding of this.bindings) {
      this._setupTransformFeedback(binding, opts);
    }
  }

  updateModelProps(props = {}) {
    const {
      varyings
    } = this;

    if (varyings.length > 0) {
      props = Object.assign({}, props, {
        varyings
      });
    }

    return props;
  }

  getDrawOptions(opts = {}) {
    const binding = this.bindings[this.currentIndex];
    const {
      sourceBuffers,
      transformFeedback
    } = binding;
    const attributes = Object.assign({}, sourceBuffers, opts.attributes);
    return {
      attributes,
      transformFeedback
    };
  }

  swap() {
    if (this.feedbackMap) {
      this.currentIndex = this._getNextIndex();
      return true;
    }

    return false;
  }

  update(opts = {}) {
    this._setupBuffers(opts);
  }

  getBuffer(varyingName) {
    const {
      feedbackBuffers
    } = this.bindings[this.currentIndex];
    const bufferOrParams = varyingName ? feedbackBuffers[varyingName] : null;

    if (!bufferOrParams) {
      return null;
    }

    return bufferOrParams instanceof _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_1__["default"] ? bufferOrParams : bufferOrParams.buffer;
  }

  getData(options = {}) {
    const {
      varyingName
    } = options;
    const buffer = this.getBuffer(varyingName);

    if (buffer) {
      return buffer.getData();
    }

    return null;
  }

  delete() {
    for (const name in this.resources) {
      this.resources[name].delete();
    }
  }

  _initialize(props = {}) {
    this._setupBuffers(props);

    this.varyings = props.varyings || Object.keys(this.bindings[this.currentIndex].feedbackBuffers);

    if (this.varyings.length > 0) {
      (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_2__.assert)((0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(this.gl));
    }
  }

  _getFeedbackBuffers(props) {
    const {
      sourceBuffers = {}
    } = props;
    const feedbackBuffers = {};

    if (this.bindings[this.currentIndex]) {
      Object.assign(feedbackBuffers, this.bindings[this.currentIndex].feedbackBuffers);
    }

    if (this.feedbackMap) {
      for (const sourceName in this.feedbackMap) {
        const feedbackName = this.feedbackMap[sourceName];

        if (sourceName in sourceBuffers) {
          feedbackBuffers[feedbackName] = sourceName;
        }
      }
    }

    Object.assign(feedbackBuffers, props.feedbackBuffers);

    for (const bufferName in feedbackBuffers) {
      const bufferOrRef = feedbackBuffers[bufferName];

      if (typeof bufferOrRef === 'string') {
        const sourceBuffer = sourceBuffers[bufferOrRef];
        const {
          byteLength,
          usage,
          accessor
        } = sourceBuffer;
        feedbackBuffers[bufferName] = this._createNewBuffer(bufferName, {
          byteLength,
          usage,
          accessor
        });
      }
    }

    return feedbackBuffers;
  }

  _setupBuffers(props = {}) {
    const {
      sourceBuffers = null
    } = props;
    Object.assign(this.feedbackMap, props.feedbackMap);

    const feedbackBuffers = this._getFeedbackBuffers(props);

    this._updateBindings({
      sourceBuffers,
      feedbackBuffers
    });
  }

  _setupTransformFeedback(binding, {
    model
  }) {
    const {
      program
    } = model;
    binding.transformFeedback = new _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_3__["default"](this.gl, {
      program,
      buffers: binding.feedbackBuffers
    });
  }

  _updateBindings(opts) {
    this.bindings[this.currentIndex] = this._updateBinding(this.bindings[this.currentIndex], opts);

    if (this.feedbackMap) {
      const {
        sourceBuffers,
        feedbackBuffers
      } = this._swapBuffers(this.bindings[this.currentIndex]);

      const nextIndex = this._getNextIndex();

      this.bindings[nextIndex] = this._updateBinding(this.bindings[nextIndex], {
        sourceBuffers,
        feedbackBuffers
      });
    }
  }

  _updateBinding(binding, opts) {
    if (!binding) {
      return {
        sourceBuffers: Object.assign({}, opts.sourceBuffers),
        feedbackBuffers: Object.assign({}, opts.feedbackBuffers)
      };
    }

    Object.assign(binding.sourceBuffers, opts.sourceBuffers);
    Object.assign(binding.feedbackBuffers, opts.feedbackBuffers);

    if (binding.transformFeedback) {
      binding.transformFeedback.setBuffers(binding.feedbackBuffers);
    }

    return binding;
  }

  _swapBuffers(opts) {
    if (!this.feedbackMap) {
      return null;
    }

    const sourceBuffers = Object.assign({}, opts.sourceBuffers);
    const feedbackBuffers = Object.assign({}, opts.feedbackBuffers);

    for (const srcName in this.feedbackMap) {
      const dstName = this.feedbackMap[srcName];
      sourceBuffers[srcName] = opts.feedbackBuffers[dstName];
      feedbackBuffers[dstName] = opts.sourceBuffers[srcName];
      (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_2__.assert)(feedbackBuffers[dstName] instanceof _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_1__["default"]);
    }

    return {
      sourceBuffers,
      feedbackBuffers
    };
  }

  _createNewBuffer(name, opts) {
    const buffer = new _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_1__["default"](this.gl, opts);

    if (this.resources[name]) {
      this.resources[name].delete();
    }

    this.resources[name] = buffer;
    return buffer;
  }

  _getNextIndex() {
    return (this.currentIndex + 1) % 2;
  }

}
//# sourceMappingURL=buffer-transform.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/engine/dist/esm/transform/texture-transform.js":
/*!******************************************************************************!*\
  !*** ./node_modules/@luma.gl/engine/dist/esm/transform/texture-transform.js ***!
  \******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ TextureTransform)
/* harmony export */ });
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/classes/copy-and-blit.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture-2d.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/classes/buffer.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/classes/framebuffer.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/texture-utils.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/glsl-utils/get-shader-version.js");
/* harmony import */ var _luma_gl_shadertools__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @luma.gl/shadertools */ "./node_modules/@luma.gl/shadertools/dist/esm/utils/shader-utils.js");
/* harmony import */ var _luma_gl_shadertools__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @luma.gl/shadertools */ "./node_modules/@luma.gl/shadertools/dist/esm/lib/inject-shader.js");
/* harmony import */ var _luma_gl_shadertools__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @luma.gl/shadertools */ "./node_modules/@luma.gl/shadertools/dist/esm/modules/transform/transform.js");
/* harmony import */ var _transform_shader_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./transform-shader-utils */ "./node_modules/@luma.gl/engine/dist/esm/transform/transform-shader-utils.js");



const SRC_TEX_PARAMETER_OVERRIDES = {
  [10241]: 9728,
  [10240]: 9728,
  [10242]: 33071,
  [10243]: 33071
};
const FS_OUTPUT_VARIABLE = 'transform_output';
class TextureTransform {
  constructor(gl, props = {}) {
    this.gl = gl;
    this.id = this.currentIndex = 0;
    this._swapTexture = null;
    this.targetTextureVarying = null;
    this.targetTextureType = null;
    this.samplerTextureMap = null;
    this.bindings = [];
    this.resources = {};

    this._initialize(props);

    Object.seal(this);
  }

  updateModelProps(props = {}) {
    const updatedModelProps = this._processVertexShader(props);

    return Object.assign({}, props, updatedModelProps);
  }

  getDrawOptions(opts = {}) {
    const {
      sourceBuffers,
      sourceTextures,
      framebuffer,
      targetTexture
    } = this.bindings[this.currentIndex];
    const attributes = Object.assign({}, sourceBuffers, opts.attributes);
    const uniforms = Object.assign({}, opts.uniforms);
    const parameters = Object.assign({}, opts.parameters);
    let discard = opts.discard;

    if (this.hasSourceTextures || this.hasTargetTexture) {
      attributes.transform_elementID = this.elementIDBuffer;

      for (const sampler in this.samplerTextureMap) {
        const textureName = this.samplerTextureMap[sampler];
        uniforms[sampler] = sourceTextures[textureName];
      }

      this._setSourceTextureParameters();

      const sizeUniforms = (0,_transform_shader_utils__WEBPACK_IMPORTED_MODULE_0__.getSizeUniforms)({
        sourceTextureMap: sourceTextures,
        targetTextureVarying: this.targetTextureVarying,
        targetTexture
      });
      Object.assign(uniforms, sizeUniforms);
    }

    if (this.hasTargetTexture) {
      discard = false;
      parameters.viewport = [0, 0, framebuffer.width, framebuffer.height];
    }

    return {
      attributes,
      framebuffer,
      uniforms,
      discard,
      parameters
    };
  }

  swap() {
    if (this._swapTexture) {
      this.currentIndex = this._getNextIndex();
      return true;
    }

    return false;
  }

  update(opts = {}) {
    this._setupTextures(opts);
  }

  getTargetTexture() {
    const {
      targetTexture
    } = this.bindings[this.currentIndex];
    return targetTexture;
  }

  getData({
    packed = false
  } = {}) {
    const {
      framebuffer
    } = this.bindings[this.currentIndex];
    const pixels = (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_1__.readPixelsToArray)(framebuffer);

    if (!packed) {
      return pixels;
    }

    const ArrayType = pixels.constructor;
    const channelCount = (0,_luma_gl_shadertools__WEBPACK_IMPORTED_MODULE_2__.typeToChannelCount)(this.targetTextureType);
    const packedPixels = new ArrayType(pixels.length * channelCount / 4);
    let packCount = 0;

    for (let i = 0; i < pixels.length; i += 4) {
      for (let j = 0; j < channelCount; j++) {
        packedPixels[packCount++] = pixels[i + j];
      }
    }

    return packedPixels;
  }

  getFramebuffer() {
    const currentResources = this.bindings[this.currentIndex];
    return currentResources.framebuffer;
  }

  delete() {
    if (this.ownTexture) {
      this.ownTexture.delete();
    }

    if (this.elementIDBuffer) {
      this.elementIDBuffer.delete();
    }
  }

  _initialize(props = {}) {
    const {
      _targetTextureVarying,
      _swapTexture
    } = props;
    this._swapTexture = _swapTexture;
    this.targetTextureVarying = _targetTextureVarying;
    this.hasTargetTexture = _targetTextureVarying;

    this._setupTextures(props);
  }

  _createTargetTexture(props) {
    const {
      sourceTextures,
      textureOrReference
    } = props;

    if (textureOrReference instanceof _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_3__["default"]) {
      return textureOrReference;
    }

    const refTexture = sourceTextures[textureOrReference];

    if (!refTexture) {
      return null;
    }

    this._targetRefTexName = textureOrReference;
    return this._createNewTexture(refTexture);
  }

  _setupTextures(props = {}) {
    const {
      sourceBuffers,
      _sourceTextures = {},
      _targetTexture
    } = props;

    const targetTexture = this._createTargetTexture({
      sourceTextures: _sourceTextures,
      textureOrReference: _targetTexture
    });

    this.hasSourceTextures = this.hasSourceTextures || _sourceTextures && Object.keys(_sourceTextures).length > 0;

    this._updateBindings({
      sourceBuffers,
      sourceTextures: _sourceTextures,
      targetTexture
    });

    if ('elementCount' in props) {
      this._updateElementIDBuffer(props.elementCount);
    }
  }

  _updateElementIDBuffer(elementCount) {
    if (typeof elementCount !== 'number' || this.elementCount >= elementCount) {
      return;
    }

    const elementIds = new Float32Array(elementCount);
    elementIds.forEach((_, index, array) => {
      array[index] = index;
    });

    if (!this.elementIDBuffer) {
      this.elementIDBuffer = new _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_4__["default"](this.gl, {
        data: elementIds,
        accessor: {
          size: 1
        }
      });
    } else {
      this.elementIDBuffer.setData({
        data: elementIds
      });
    }

    this.elementCount = elementCount;
  }

  _updateBindings(opts) {
    this.bindings[this.currentIndex] = this._updateBinding(this.bindings[this.currentIndex], opts);

    if (this._swapTexture) {
      const {
        sourceTextures,
        targetTexture
      } = this._swapTextures(this.bindings[this.currentIndex]);

      const nextIndex = this._getNextIndex();

      this.bindings[nextIndex] = this._updateBinding(this.bindings[nextIndex], {
        sourceTextures,
        targetTexture
      });
    }
  }

  _updateBinding(binding, opts) {
    const {
      sourceBuffers,
      sourceTextures,
      targetTexture
    } = opts;

    if (!binding) {
      binding = {
        sourceBuffers: {},
        sourceTextures: {},
        targetTexture: null
      };
    }

    Object.assign(binding.sourceTextures, sourceTextures);
    Object.assign(binding.sourceBuffers, sourceBuffers);

    if (targetTexture) {
      binding.targetTexture = targetTexture;
      const {
        width,
        height
      } = targetTexture;
      const {
        framebuffer
      } = binding;

      if (framebuffer) {
        framebuffer.update({
          attachments: {
            [36064]: targetTexture
          },
          resizeAttachments: false
        });
        framebuffer.resize({
          width,
          height
        });
      } else {
        binding.framebuffer = new _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_5__["default"](this.gl, {
          id: `transform-framebuffer`,
          width,
          height,
          attachments: {
            [36064]: targetTexture
          }
        });
      }
    }

    return binding;
  }

  _setSourceTextureParameters() {
    const index = this.currentIndex;
    const {
      sourceTextures
    } = this.bindings[index];

    for (const name in sourceTextures) {
      sourceTextures[name].setParameters(SRC_TEX_PARAMETER_OVERRIDES);
    }
  }

  _swapTextures(opts) {
    if (!this._swapTexture) {
      return null;
    }

    const sourceTextures = Object.assign({}, opts.sourceTextures);
    sourceTextures[this._swapTexture] = opts.targetTexture;
    const targetTexture = opts.sourceTextures[this._swapTexture];
    return {
      sourceTextures,
      targetTexture
    };
  }

  _createNewTexture(refTexture) {
    const texture = (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_6__.cloneTextureFrom)(refTexture, {
      parameters: {
        [10241]: 9728,
        [10240]: 9728,
        [10242]: 33071,
        [10243]: 33071
      },
      pixelStore: {
        [37440]: false
      }
    });

    if (this.ownTexture) {
      this.ownTexture.delete();
    }

    this.ownTexture = texture;
    return texture;
  }

  _getNextIndex() {
    return (this.currentIndex + 1) % 2;
  }

  _processVertexShader(props = {}) {
    const {
      sourceTextures,
      targetTexture
    } = this.bindings[this.currentIndex];
    const {
      vs,
      uniforms,
      targetTextureType,
      inject,
      samplerTextureMap
    } = (0,_transform_shader_utils__WEBPACK_IMPORTED_MODULE_0__.updateForTextures)({
      vs: props.vs,
      sourceTextureMap: sourceTextures,
      targetTextureVarying: this.targetTextureVarying,
      targetTexture
    });
    const combinedInject = (0,_luma_gl_shadertools__WEBPACK_IMPORTED_MODULE_7__.combineInjects)([props.inject || {}, inject]);
    this.targetTextureType = targetTextureType;
    this.samplerTextureMap = samplerTextureMap;
    const fs = props._fs || (0,_luma_gl_shadertools__WEBPACK_IMPORTED_MODULE_2__.getPassthroughFS)({
      version: (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_8__["default"])(vs),
      input: this.targetTextureVarying,
      inputType: targetTextureType,
      output: FS_OUTPUT_VARIABLE
    });
    const modules = this.hasSourceTextures || this.targetTextureVarying ? [_luma_gl_shadertools__WEBPACK_IMPORTED_MODULE_9__.transform].concat(props.modules || []) : props.modules;
    return {
      vs,
      fs,
      modules,
      uniforms,
      inject: combinedInject
    };
  }

}
//# sourceMappingURL=texture-transform.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/engine/dist/esm/transform/transform-shader-utils.js":
/*!***********************************************************************************!*\
  !*** ./node_modules/@luma.gl/engine/dist/esm/transform/transform-shader-utils.js ***!
  \***********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "updateForTextures": () => (/* binding */ updateForTextures),
/* harmony export */   "getSizeUniforms": () => (/* binding */ getSizeUniforms),
/* harmony export */   "getVaryingType": () => (/* binding */ getVaryingType),
/* harmony export */   "processAttributeDefinition": () => (/* binding */ processAttributeDefinition)
/* harmony export */ });
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");
/* harmony import */ var _luma_gl_shadertools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/shadertools */ "./node_modules/@luma.gl/shadertools/dist/esm/lib/inject-shader.js");
/* harmony import */ var _luma_gl_shadertools__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @luma.gl/shadertools */ "./node_modules/@luma.gl/shadertools/dist/esm/utils/shader-utils.js");


const SAMPLER_UNIFORM_PREFIX = 'transform_uSampler_';
const SIZE_UNIFORM_PREFIX = 'transform_uSize_';
const VS_POS_VARIABLE = 'transform_position';
function updateForTextures({
  vs,
  sourceTextureMap,
  targetTextureVarying,
  targetTexture
}) {
  const texAttributeNames = Object.keys(sourceTextureMap);
  let sourceCount = texAttributeNames.length;
  let targetTextureType = null;
  const samplerTextureMap = {};
  let updatedVs = vs;
  let finalInject = {};

  if (sourceCount > 0 || targetTextureVarying) {
    const vsLines = updatedVs.split('\n');
    const updateVsLines = vsLines.slice();
    vsLines.forEach((line, index, lines) => {
      if (sourceCount > 0) {
        const updated = processAttributeDefinition(line, sourceTextureMap);

        if (updated) {
          const {
            updatedLine,
            inject
          } = updated;
          updateVsLines[index] = updatedLine;
          finalInject = (0,_luma_gl_shadertools__WEBPACK_IMPORTED_MODULE_0__.combineInjects)([finalInject, inject]);
          Object.assign(samplerTextureMap, updated.samplerTextureMap);
          sourceCount--;
        }
      }

      if (targetTextureVarying && !targetTextureType) {
        targetTextureType = getVaryingType(line, targetTextureVarying);
      }
    });

    if (targetTextureVarying) {
      (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_1__.assert)(targetTexture);
      const sizeName = `${SIZE_UNIFORM_PREFIX}${targetTextureVarying}`;
      const uniformDeclaration = `uniform vec2 ${sizeName};\n`;
      const posInstructions = `\
     vec2 ${VS_POS_VARIABLE} = transform_getPos(${sizeName});
     gl_Position = vec4(${VS_POS_VARIABLE}, 0, 1.);\n`;
      const inject = {
        'vs:#decl': uniformDeclaration,
        'vs:#main-start': posInstructions
      };
      finalInject = (0,_luma_gl_shadertools__WEBPACK_IMPORTED_MODULE_0__.combineInjects)([finalInject, inject]);
    }

    updatedVs = updateVsLines.join('\n');
  }

  return {
    vs: updatedVs,
    targetTextureType,
    inject: finalInject,
    samplerTextureMap
  };
}
function getSizeUniforms({
  sourceTextureMap,
  targetTextureVarying,
  targetTexture
}) {
  const uniforms = {};
  let width;
  let height;

  if (targetTextureVarying) {
    ({
      width,
      height
    } = targetTexture);
    uniforms[`${SIZE_UNIFORM_PREFIX}${targetTextureVarying}`] = [width, height];
  }

  for (const textureName in sourceTextureMap) {
    ({
      width,
      height
    } = sourceTextureMap[textureName]);
    uniforms[`${SIZE_UNIFORM_PREFIX}${textureName}`] = [width, height];
  }

  return uniforms;
}

function getAttributeDefinition(line) {
  return (0,_luma_gl_shadertools__WEBPACK_IMPORTED_MODULE_2__.getQualifierDetails)(line, ['attribute', 'in']);
}

function getSamplerDeclerations(textureName) {
  const samplerName = `${SAMPLER_UNIFORM_PREFIX}${textureName}`;
  const sizeName = `${SIZE_UNIFORM_PREFIX}${textureName}`;
  const uniformDeclerations = `\
  uniform sampler2D ${samplerName};
  uniform vec2 ${sizeName};`;
  return {
    samplerName,
    sizeName,
    uniformDeclerations
  };
}

function getVaryingType(line, varying) {
  const qualaiferDetails = (0,_luma_gl_shadertools__WEBPACK_IMPORTED_MODULE_2__.getQualifierDetails)(line, ['varying', 'out']);

  if (!qualaiferDetails) {
    return null;
  }

  return qualaiferDetails.name === varying ? qualaiferDetails.type : null;
}
function processAttributeDefinition(line, textureMap) {
  const samplerTextureMap = {};
  const attributeData = getAttributeDefinition(line);

  if (!attributeData) {
    return null;
  }

  const {
    type,
    name
  } = attributeData;

  if (name && textureMap[name]) {
    const updatedLine = `\// ${line} => Replaced by Transform with a sampler`;
    const {
      samplerName,
      sizeName,
      uniformDeclerations
    } = getSamplerDeclerations(name);
    const channels = (0,_luma_gl_shadertools__WEBPACK_IMPORTED_MODULE_2__.typeToChannelSuffix)(type);
    const sampleInstruction = `  ${type} ${name} = transform_getInput(${samplerName}, ${sizeName}).${channels};\n`;
    samplerTextureMap[samplerName] = name;
    const inject = {
      'vs:#decl': uniformDeclerations,
      'vs:#main-start': sampleInstruction
    };
    return {
      updatedLine,
      inject,
      samplerTextureMap
    };
  }

  return null;
}
//# sourceMappingURL=transform-shader-utils.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/engine/dist/esm/transform/transform.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@luma.gl/engine/dist/esm/transform/transform.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Transform)
/* harmony export */ });
/* harmony import */ var _luma_gl_shadertools__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @luma.gl/shadertools */ "./node_modules/@luma.gl/shadertools/dist/esm/utils/shader-utils.js");
/* harmony import */ var _buffer_transform__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./buffer-transform */ "./node_modules/@luma.gl/engine/dist/esm/transform/buffer-transform.js");
/* harmony import */ var _texture_transform__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./texture-transform */ "./node_modules/@luma.gl/engine/dist/esm/transform/texture-transform.js");
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/glsl-utils/get-shader-version.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/utils/utils.js");
/* harmony import */ var _lib_model__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../lib/model */ "./node_modules/@luma.gl/engine/dist/esm/lib/model.js");






class Transform {
  static isSupported(gl) {
    return (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl);
  }

  constructor(gl, props = {}) {
    this.gl = gl;
    this.model = null;
    this.elementCount = 0;
    this.bufferTransform = null;
    this.textureTransform = null;
    this.elementIDBuffer = null;

    this._initialize(props);

    Object.seal(this);
  }

  delete() {
    const {
      model,
      bufferTransform,
      textureTransform
    } = this;

    if (model) {
      model.delete();
    }

    if (bufferTransform) {
      bufferTransform.delete();
    }

    if (textureTransform) {
      textureTransform.delete();
    }
  }

  run(opts = {}) {
    const {
      clearRenderTarget = true
    } = opts;

    const updatedOpts = this._updateDrawOptions(opts);

    if (clearRenderTarget && updatedOpts.framebuffer) {
      updatedOpts.framebuffer.clear({
        color: true
      });
    }

    this.model.transform(updatedOpts);
  }

  swap() {
    let swapped = false;
    const resourceTransforms = [this.bufferTransform, this.textureTransform].filter(Boolean);

    for (const resourceTransform of resourceTransforms) {
      swapped = swapped || resourceTransform.swap();
    }

    (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_1__.assert)(swapped, 'Nothing to swap');
  }

  getBuffer(varyingName = null) {
    return this.bufferTransform && this.bufferTransform.getBuffer(varyingName);
  }

  getData(opts = {}) {
    const resourceTransforms = [this.bufferTransform, this.textureTransform].filter(Boolean);

    for (const resourceTransform of resourceTransforms) {
      const data = resourceTransform.getData(opts);

      if (data) {
        return data;
      }
    }

    return null;
  }

  getFramebuffer() {
    return this.textureTransform && this.textureTransform.getFramebuffer();
  }

  update(opts = {}) {
    if ('elementCount' in opts) {
      this.model.setVertexCount(opts.elementCount);
    }

    const resourceTransforms = [this.bufferTransform, this.textureTransform].filter(Boolean);

    for (const resourceTransform of resourceTransforms) {
      resourceTransform.update(opts);
    }
  }

  _initialize(props = {}) {
    const {
      gl
    } = this;

    this._buildResourceTransforms(gl, props);

    props = this._updateModelProps(props);
    this.model = new _lib_model__WEBPACK_IMPORTED_MODULE_2__["default"](gl, Object.assign({}, props, {
      fs: props.fs || (0,_luma_gl_shadertools__WEBPACK_IMPORTED_MODULE_3__.getPassthroughFS)({
        version: (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_4__["default"])(props.vs)
      }),
      id: props.id || 'transform-model',
      drawMode: props.drawMode || 0,
      vertexCount: props.elementCount
    }));
    this.bufferTransform && this.bufferTransform.setupResources({
      model: this.model
    });
  }

  _updateModelProps(props) {
    let updatedProps = Object.assign({}, props);
    const resourceTransforms = [this.bufferTransform, this.textureTransform].filter(Boolean);

    for (const resourceTransform of resourceTransforms) {
      updatedProps = resourceTransform.updateModelProps(updatedProps);
    }

    return updatedProps;
  }

  _buildResourceTransforms(gl, props) {
    if (canCreateBufferTransform(props)) {
      this.bufferTransform = new _buffer_transform__WEBPACK_IMPORTED_MODULE_5__["default"](gl, props);
    }

    if (canCreateTextureTransform(props)) {
      this.textureTransform = new _texture_transform__WEBPACK_IMPORTED_MODULE_6__["default"](gl, props);
    }

    (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_1__.assert)(this.bufferTransform || this.textureTransform, 'must provide source/feedback buffers or source/target textures');
  }

  _updateDrawOptions(opts) {
    let updatedOpts = Object.assign({}, opts);
    const resourceTransforms = [this.bufferTransform, this.textureTransform].filter(Boolean);

    for (const resourceTransform of resourceTransforms) {
      updatedOpts = Object.assign(updatedOpts, resourceTransform.getDrawOptions(updatedOpts));
    }

    return updatedOpts;
  }

}

function canCreateBufferTransform(props) {
  if (!(0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_7__.isObjectEmpty)(props.feedbackBuffers) || !(0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_7__.isObjectEmpty)(props.feedbackMap) || props.varyings && props.varyings.length > 0) {
    return true;
  }

  return false;
}

function canCreateTextureTransform(props) {
  if (!(0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_7__.isObjectEmpty)(props._sourceTextures) || props._targetTexture || props._targetTextureVarying) {
    return true;
  }

  return false;
}
//# sourceMappingURL=transform.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/gltools/dist/esm/context/context.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@luma.gl/gltools/dist/esm/context/context.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "createGLContext": () => (/* binding */ createGLContext),
/* harmony export */   "instrumentGLContext": () => (/* binding */ instrumentGLContext),
/* harmony export */   "getContextDebugInfo": () => (/* binding */ getContextDebugInfo),
/* harmony export */   "resizeGLContext": () => (/* binding */ resizeGLContext)
/* harmony export */ });
/* harmony import */ var probe_gl_env__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! probe.gl/env */ "./node_modules/probe.gl/dist/es5/env/index.js");
/* harmony import */ var _state_tracker_track_context_state__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../state-tracker/track-context-state */ "./node_modules/@luma.gl/gltools/dist/esm/state-tracker/track-context-state.js");
/* harmony import */ var _utils_log__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/log */ "./node_modules/@luma.gl/gltools/dist/esm/utils/log.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/gltools/dist/esm/utils/assert.js");
/* harmony import */ var _utils_device_pixels__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/device-pixels */ "./node_modules/@luma.gl/gltools/dist/esm/utils/device-pixels.js");
/* harmony import */ var _utils_webgl_checks__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/webgl-checks */ "./node_modules/@luma.gl/gltools/dist/esm/utils/webgl-checks.js");






const isBrowser = (0,probe_gl_env__WEBPACK_IMPORTED_MODULE_5__.isBrowser)();
const isPage = isBrowser && typeof document !== 'undefined';
const CONTEXT_DEFAULTS = {
  webgl2: true,
  webgl1: true,
  throwOnError: true,
  manageState: true,
  canvas: null,
  debug: false,
  width: 800,
  height: 600
};
function createGLContext(options = {}) {
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_2__.assert)(isBrowser, "createGLContext only available in the browser.\nCreate your own headless context or use 'createHeadlessContext' from @luma.gl/test-utils");
  options = Object.assign({}, CONTEXT_DEFAULTS, options);
  const {
    width,
    height
  } = options;

  function onError(message) {
    if (options.throwOnError) {
      throw new Error(message);
    }

    console.error(message);
    return null;
  }

  options.onError = onError;
  let gl;
  const {
    canvas
  } = options;
  const targetCanvas = getCanvas({
    canvas,
    width,
    height,
    onError
  });
  gl = createBrowserContext(targetCanvas, options);

  if (!gl) {
    return null;
  }

  gl = instrumentGLContext(gl, options);
  logInfo(gl);
  return gl;
}
function instrumentGLContext(gl, options = {}) {
  if (!gl || gl._instrumented) {
    return gl;
  }

  gl._version = gl._version || getVersion(gl);
  gl.luma = gl.luma || {};
  gl.luma.canvasSizeInfo = gl.luma.canvasSizeInfo || {};
  options = Object.assign({}, CONTEXT_DEFAULTS, options);
  const {
    manageState,
    debug
  } = options;

  if (manageState) {
    (0,_state_tracker_track_context_state__WEBPACK_IMPORTED_MODULE_0__.trackContextState)(gl, {
      copyState: false,
      log: (...args) => _utils_log__WEBPACK_IMPORTED_MODULE_1__.log.log(1, ...args)()
    });
  }

  if (isBrowser && debug) {
    if (!probe_gl_env__WEBPACK_IMPORTED_MODULE_5__.global.makeDebugContext) {
      _utils_log__WEBPACK_IMPORTED_MODULE_1__.log.warn('WebGL debug mode not activated. import "@luma.gl/debug" to enable.')();
    } else {
      gl = probe_gl_env__WEBPACK_IMPORTED_MODULE_5__.global.makeDebugContext(gl, options);
      _utils_log__WEBPACK_IMPORTED_MODULE_1__.log.level = Math.max(_utils_log__WEBPACK_IMPORTED_MODULE_1__.log.level, 1);
    }
  }

  gl._instrumented = true;
  return gl;
}
function getContextDebugInfo(gl) {
  const vendorMasked = gl.getParameter(7936);
  const rendererMasked = gl.getParameter(7937);
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  const vendorUnmasked = ext && gl.getParameter(ext.UNMASKED_VENDOR_WEBGL || 7936);
  const rendererUnmasked = ext && gl.getParameter(ext.UNMASKED_RENDERER_WEBGL || 7937);
  return {
    vendor: vendorUnmasked || vendorMasked,
    renderer: rendererUnmasked || rendererMasked,
    vendorMasked,
    rendererMasked,
    version: gl.getParameter(7938),
    shadingLanguageVersion: gl.getParameter(35724)
  };
}
function resizeGLContext(gl, options = {}) {
  if (gl.canvas) {
    const devicePixelRatio = (0,_utils_device_pixels__WEBPACK_IMPORTED_MODULE_3__.getDevicePixelRatio)(options.useDevicePixels);
    setDevicePixelRatio(gl, devicePixelRatio, options);
    return;
  }

  const ext = gl.getExtension('STACKGL_resize_drawingbuffer');

  if (ext && `width` in options && `height` in options) {
    ext.resize(options.width, options.height);
  }
}

function createBrowserContext(canvas, options) {
  const {
    onError
  } = options;
  let errorMessage = null;

  const onCreateError = error => errorMessage = error.statusMessage || errorMessage;

  canvas.addEventListener('webglcontextcreationerror', onCreateError, false);
  const {
    webgl1 = true,
    webgl2 = true
  } = options;
  let gl = null;

  if (webgl2) {
    gl = gl || canvas.getContext('webgl2', options);
    gl = gl || canvas.getContext('experimental-webgl2', options);
  }

  if (webgl1) {
    gl = gl || canvas.getContext('webgl', options);
    gl = gl || canvas.getContext('experimental-webgl', options);
  }

  canvas.removeEventListener('webglcontextcreationerror', onCreateError, false);

  if (!gl) {
    return onError(`Failed to create ${webgl2 && !webgl1 ? 'WebGL2' : 'WebGL'} context: ${errorMessage || 'Unknown error'}`);
  }

  if (options.onContextLost) {
    canvas.addEventListener('webglcontextlost', options.onContextLost, false);
  }

  if (options.onContextRestored) {
    canvas.addEventListener('webglcontextrestored', options.onContextRestored, false);
  }

  return gl;
}

function getCanvas({
  canvas,
  width = 800,
  height = 600,
  onError
}) {
  let targetCanvas;

  if (typeof canvas === 'string') {
    const isPageLoaded = isPage && document.readyState === 'complete';

    if (!isPageLoaded) {
      onError(`createGLContext called on canvas '${canvas}' before page was loaded`);
    }

    targetCanvas = document.getElementById(canvas);
  } else if (canvas) {
    targetCanvas = canvas;
  } else {
    targetCanvas = document.createElement('canvas');
    targetCanvas.id = 'lumagl-canvas';
    targetCanvas.style.width = Number.isFinite(width) ? `${width}px` : '100%';
    targetCanvas.style.height = Number.isFinite(height) ? `${height}px` : '100%';
    document.body.insertBefore(targetCanvas, document.body.firstChild);
  }

  return targetCanvas;
}

function logInfo(gl) {
  const webGL = (0,_utils_webgl_checks__WEBPACK_IMPORTED_MODULE_4__.isWebGL2)(gl) ? 'WebGL2' : 'WebGL1';
  const info = getContextDebugInfo(gl);
  const driver = info ? `(${info.vendor},${info.renderer})` : '';
  const debug = gl.debug ? ' debug' : '';
  _utils_log__WEBPACK_IMPORTED_MODULE_1__.log.info(1, `${webGL}${debug} context ${driver}`)();
}

function getVersion(gl) {
  if (typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext) {
    return 2;
  }

  return 1;
}

function setDevicePixelRatio(gl, devicePixelRatio, options) {
  let clientWidth = 'width' in options ? options.width : gl.canvas.clientWidth;
  let clientHeight = 'height' in options ? options.height : gl.canvas.clientHeight;

  if (!clientWidth || !clientHeight) {
    _utils_log__WEBPACK_IMPORTED_MODULE_1__.log.log(1, 'Canvas clientWidth/clientHeight is 0')();
    devicePixelRatio = 1;
    clientWidth = gl.canvas.width || 1;
    clientHeight = gl.canvas.height || 1;
  }

  gl.luma = gl.luma || {};
  gl.luma.canvasSizeInfo = gl.luma.canvasSizeInfo || {};
  const cachedSize = gl.luma.canvasSizeInfo;

  if (cachedSize.clientWidth !== clientWidth || cachedSize.clientHeight !== clientHeight || cachedSize.devicePixelRatio !== devicePixelRatio) {
    let clampedPixelRatio = devicePixelRatio;
    const canvasWidth = Math.floor(clientWidth * clampedPixelRatio);
    const canvasHeight = Math.floor(clientHeight * clampedPixelRatio);
    gl.canvas.width = canvasWidth;
    gl.canvas.height = canvasHeight;

    if (gl.drawingBufferWidth !== canvasWidth || gl.drawingBufferHeight !== canvasHeight) {
      _utils_log__WEBPACK_IMPORTED_MODULE_1__.log.warn(`Device pixel ratio clamped`)();
      clampedPixelRatio = Math.min(gl.drawingBufferWidth / clientWidth, gl.drawingBufferHeight / clientHeight);
      gl.canvas.width = Math.floor(clientWidth * clampedPixelRatio);
      gl.canvas.height = Math.floor(clientHeight * clampedPixelRatio);
    }

    Object.assign(gl.luma.canvasSizeInfo, {
      clientWidth,
      clientHeight,
      devicePixelRatio
    });
  }
}
//# sourceMappingURL=context.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/gltools/dist/esm/index.js":
/*!*********************************************************!*\
  !*** ./node_modules/@luma.gl/gltools/dist/esm/index.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "log": () => (/* reexport safe */ _utils_log__WEBPACK_IMPORTED_MODULE_0__.log),
/* harmony export */   "isWebGL": () => (/* reexport safe */ _utils_webgl_checks__WEBPACK_IMPORTED_MODULE_1__.isWebGL),
/* harmony export */   "isWebGL2": () => (/* reexport safe */ _utils_webgl_checks__WEBPACK_IMPORTED_MODULE_1__.isWebGL2),
/* harmony export */   "getWebGL2Context": () => (/* reexport safe */ _utils_webgl_checks__WEBPACK_IMPORTED_MODULE_1__.getWebGL2Context),
/* harmony export */   "assertWebGLContext": () => (/* reexport safe */ _utils_webgl_checks__WEBPACK_IMPORTED_MODULE_1__.assertWebGLContext),
/* harmony export */   "assertWebGL2Context": () => (/* reexport safe */ _utils_webgl_checks__WEBPACK_IMPORTED_MODULE_1__.assertWebGL2Context),
/* harmony export */   "polyfillContext": () => (/* reexport safe */ _polyfill_polyfill_context__WEBPACK_IMPORTED_MODULE_2__.polyfillContext),
/* harmony export */   "getParameters": () => (/* reexport safe */ _state_tracker_unified_parameter_api__WEBPACK_IMPORTED_MODULE_3__.getParameters),
/* harmony export */   "setParameters": () => (/* reexport safe */ _state_tracker_unified_parameter_api__WEBPACK_IMPORTED_MODULE_3__.setParameters),
/* harmony export */   "resetParameters": () => (/* reexport safe */ _state_tracker_unified_parameter_api__WEBPACK_IMPORTED_MODULE_3__.resetParameters),
/* harmony export */   "withParameters": () => (/* reexport safe */ _state_tracker_unified_parameter_api__WEBPACK_IMPORTED_MODULE_3__.withParameters),
/* harmony export */   "trackContextState": () => (/* reexport safe */ _state_tracker_track_context_state__WEBPACK_IMPORTED_MODULE_4__.trackContextState),
/* harmony export */   "pushContextState": () => (/* reexport safe */ _state_tracker_track_context_state__WEBPACK_IMPORTED_MODULE_4__.pushContextState),
/* harmony export */   "popContextState": () => (/* reexport safe */ _state_tracker_track_context_state__WEBPACK_IMPORTED_MODULE_4__.popContextState),
/* harmony export */   "createGLContext": () => (/* reexport safe */ _context_context__WEBPACK_IMPORTED_MODULE_5__.createGLContext),
/* harmony export */   "resizeGLContext": () => (/* reexport safe */ _context_context__WEBPACK_IMPORTED_MODULE_5__.resizeGLContext),
/* harmony export */   "instrumentGLContext": () => (/* reexport safe */ _context_context__WEBPACK_IMPORTED_MODULE_5__.instrumentGLContext),
/* harmony export */   "getContextDebugInfo": () => (/* reexport safe */ _context_context__WEBPACK_IMPORTED_MODULE_5__.getContextDebugInfo),
/* harmony export */   "cssToDeviceRatio": () => (/* reexport safe */ _utils_device_pixels__WEBPACK_IMPORTED_MODULE_6__.cssToDeviceRatio),
/* harmony export */   "cssToDevicePixels": () => (/* reexport safe */ _utils_device_pixels__WEBPACK_IMPORTED_MODULE_6__.cssToDevicePixels)
/* harmony export */ });
/* harmony import */ var _utils_log__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils/log */ "./node_modules/@luma.gl/gltools/dist/esm/utils/log.js");
/* harmony import */ var _utils_webgl_checks__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils/webgl-checks */ "./node_modules/@luma.gl/gltools/dist/esm/utils/webgl-checks.js");
/* harmony import */ var _polyfill_polyfill_context__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./polyfill/polyfill-context */ "./node_modules/@luma.gl/gltools/dist/esm/polyfill/polyfill-context.js");
/* harmony import */ var _state_tracker_unified_parameter_api__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./state-tracker/unified-parameter-api */ "./node_modules/@luma.gl/gltools/dist/esm/state-tracker/unified-parameter-api.js");
/* harmony import */ var _state_tracker_track_context_state__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./state-tracker/track-context-state */ "./node_modules/@luma.gl/gltools/dist/esm/state-tracker/track-context-state.js");
/* harmony import */ var _context_context__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./context/context */ "./node_modules/@luma.gl/gltools/dist/esm/context/context.js");
/* harmony import */ var _utils_device_pixels__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./utils/device-pixels */ "./node_modules/@luma.gl/gltools/dist/esm/utils/device-pixels.js");







//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/gltools/dist/esm/polyfill/get-parameter-polyfill.js":
/*!***********************************************************************************!*\
  !*** ./node_modules/@luma.gl/gltools/dist/esm/polyfill/get-parameter-polyfill.js ***!
  \***********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getParameterPolyfill": () => (/* binding */ getParameterPolyfill)
/* harmony export */ });
/* harmony import */ var _utils_webgl_checks__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/webgl-checks */ "./node_modules/@luma.gl/gltools/dist/esm/utils/webgl-checks.js");

const OES_element_index = 'OES_element_index';
const WEBGL_draw_buffers = 'WEBGL_draw_buffers';
const EXT_disjoint_timer_query = 'EXT_disjoint_timer_query';
const EXT_disjoint_timer_query_webgl2 = 'EXT_disjoint_timer_query_webgl2';
const EXT_texture_filter_anisotropic = 'EXT_texture_filter_anisotropic';
const WEBGL_debug_renderer_info = 'WEBGL_debug_renderer_info';
const GL_FRAGMENT_SHADER_DERIVATIVE_HINT = 0x8b8b;
const GL_DONT_CARE = 0x1100;
const GL_GPU_DISJOINT_EXT = 0x8fbb;
const GL_MAX_TEXTURE_MAX_ANISOTROPY_EXT = 0x84ff;
const GL_UNMASKED_VENDOR_WEBGL = 0x9245;
const GL_UNMASKED_RENDERER_WEBGL = 0x9246;

const getWebGL2ValueOrZero = gl => !(0,_utils_webgl_checks__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl) ? 0 : undefined;

const WEBGL_PARAMETERS = {
  [3074]: gl => !(0,_utils_webgl_checks__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl) ? 36064 : undefined,
  [GL_FRAGMENT_SHADER_DERIVATIVE_HINT]: gl => !(0,_utils_webgl_checks__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl) ? GL_DONT_CARE : undefined,
  [35977]: getWebGL2ValueOrZero,
  [32937]: getWebGL2ValueOrZero,
  [GL_GPU_DISJOINT_EXT]: (gl, getParameter) => {
    const ext = (0,_utils_webgl_checks__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl) ? gl.getExtension(EXT_disjoint_timer_query_webgl2) : gl.getExtension(EXT_disjoint_timer_query);
    return ext && ext.GPU_DISJOINT_EXT ? getParameter(ext.GPU_DISJOINT_EXT) : 0;
  },
  [GL_UNMASKED_VENDOR_WEBGL]: (gl, getParameter) => {
    const ext = gl.getExtension(WEBGL_debug_renderer_info);
    return getParameter(ext && ext.UNMASKED_VENDOR_WEBGL || 7936);
  },
  [GL_UNMASKED_RENDERER_WEBGL]: (gl, getParameter) => {
    const ext = gl.getExtension(WEBGL_debug_renderer_info);
    return getParameter(ext && ext.UNMASKED_RENDERER_WEBGL || 7937);
  },
  [GL_MAX_TEXTURE_MAX_ANISOTROPY_EXT]: (gl, getParameter) => {
    const ext = gl.luma.extensions[EXT_texture_filter_anisotropic];
    return ext ? getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT) : 1.0;
  },
  [32883]: getWebGL2ValueOrZero,
  [35071]: getWebGL2ValueOrZero,
  [37447]: getWebGL2ValueOrZero,
  [36063]: (gl, getParameter) => {
    if (!(0,_utils_webgl_checks__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl)) {
      const ext = gl.getExtension(WEBGL_draw_buffers);
      return ext ? getParameter(ext.MAX_COLOR_ATTACHMENTS_WEBGL) : 0;
    }

    return undefined;
  },
  [35379]: getWebGL2ValueOrZero,
  [35374]: getWebGL2ValueOrZero,
  [35377]: getWebGL2ValueOrZero,
  [34852]: gl => {
    if (!(0,_utils_webgl_checks__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl)) {
      const ext = gl.getExtension(WEBGL_draw_buffers);
      return ext ? ext.MAX_DRAW_BUFFERS_WEBGL : 0;
    }

    return undefined;
  },
  [36203]: gl => gl.getExtension(OES_element_index) ? 2147483647 : 65535,
  [33001]: gl => gl.getExtension(OES_element_index) ? 16777216 : 65535,
  [33000]: gl => 16777216,
  [37157]: getWebGL2ValueOrZero,
  [35373]: getWebGL2ValueOrZero,
  [35657]: getWebGL2ValueOrZero,
  [36183]: getWebGL2ValueOrZero,
  [37137]: getWebGL2ValueOrZero,
  [34045]: getWebGL2ValueOrZero,
  [35978]: getWebGL2ValueOrZero,
  [35979]: getWebGL2ValueOrZero,
  [35968]: getWebGL2ValueOrZero,
  [35376]: getWebGL2ValueOrZero,
  [35375]: getWebGL2ValueOrZero,
  [35659]: getWebGL2ValueOrZero,
  [37154]: getWebGL2ValueOrZero,
  [35371]: getWebGL2ValueOrZero,
  [35658]: getWebGL2ValueOrZero,
  [35076]: getWebGL2ValueOrZero,
  [35077]: getWebGL2ValueOrZero,
  [35380]: getWebGL2ValueOrZero
};
function getParameterPolyfill(gl, originalGetParameter, pname) {
  const limit = WEBGL_PARAMETERS[pname];
  const value = typeof limit === 'function' ? limit(gl, originalGetParameter, pname) : limit;
  const result = value !== undefined ? value : originalGetParameter(pname);
  return result;
}
//# sourceMappingURL=get-parameter-polyfill.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/gltools/dist/esm/polyfill/polyfill-context.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/@luma.gl/gltools/dist/esm/polyfill/polyfill-context.js ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "polyfillContext": () => (/* binding */ polyfillContext)
/* harmony export */ });
/* harmony import */ var _polyfill_vertex_array_object__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./polyfill-vertex-array-object */ "./node_modules/@luma.gl/gltools/dist/esm/polyfill/polyfill-vertex-array-object.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/gltools/dist/esm/utils/assert.js");
/* harmony import */ var _polyfill_table__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./polyfill-table */ "./node_modules/@luma.gl/gltools/dist/esm/polyfill/polyfill-table.js");



function polyfillContext(gl) {
  gl.luma = gl.luma || {};
  const {
    luma
  } = gl;

  if (!luma.polyfilled) {
    (0,_polyfill_vertex_array_object__WEBPACK_IMPORTED_MODULE_0__.polyfillVertexArrayObject)(gl);
    initializeExtensions(gl);
    installPolyfills(gl, _polyfill_table__WEBPACK_IMPORTED_MODULE_2__.WEBGL2_CONTEXT_POLYFILLS);
    installOverrides(gl, {
      target: luma,
      target2: gl
    });
    luma.polyfilled = true;
  }

  return gl;
}
const global_ = typeof __webpack_require__.g !== 'undefined' ? __webpack_require__.g : window;
global_.polyfillContext = polyfillContext;

function initializeExtensions(gl) {
  gl.luma.extensions = {};
  const EXTENSIONS = gl.getSupportedExtensions() || [];

  for (const extension of EXTENSIONS) {
    gl.luma[extension] = gl.getExtension(extension);
  }
}

function installOverrides(gl, {
  target,
  target2
}) {
  Object.keys(_polyfill_table__WEBPACK_IMPORTED_MODULE_2__.WEBGL2_CONTEXT_OVERRIDES).forEach(key => {
    if (typeof _polyfill_table__WEBPACK_IMPORTED_MODULE_2__.WEBGL2_CONTEXT_OVERRIDES[key] === 'function') {
      const originalFunc = gl[key] ? gl[key].bind(gl) : () => {};
      const polyfill = _polyfill_table__WEBPACK_IMPORTED_MODULE_2__.WEBGL2_CONTEXT_OVERRIDES[key].bind(null, gl, originalFunc);
      target[key] = polyfill;
      target2[key] = polyfill;
    }
  });
}

function installPolyfills(gl, polyfills) {
  for (const extension of Object.getOwnPropertyNames(polyfills)) {
    if (extension !== 'overrides') {
      polyfillExtension(gl, {
        extension,
        target: gl.luma,
        target2: gl
      });
    }
  }
}

function polyfillExtension(gl, {
  extension,
  target,
  target2
}) {
  const defaults = _polyfill_table__WEBPACK_IMPORTED_MODULE_2__.WEBGL2_CONTEXT_POLYFILLS[extension];
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_1__.assert)(defaults);
  const {
    meta = {}
  } = defaults;
  const {
    suffix = ''
  } = meta;
  const ext = gl.getExtension(extension);

  for (const key of Object.keys(defaults)) {
    const extKey = `${key}${suffix}`;
    let polyfill = null;

    if (key === 'meta') {} else if (typeof gl[key] === 'function') {} else if (ext && typeof ext[extKey] === 'function') {
      polyfill = (...args) => ext[extKey](...args);
    } else if (typeof defaults[key] === 'function') {
      polyfill = defaults[key].bind(target);
    }

    if (polyfill) {
      target[key] = polyfill;
      target2[key] = polyfill;
    }
  }
}
//# sourceMappingURL=polyfill-context.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/gltools/dist/esm/polyfill/polyfill-table.js":
/*!***************************************************************************!*\
  !*** ./node_modules/@luma.gl/gltools/dist/esm/polyfill/polyfill-table.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "WEBGL2_CONTEXT_POLYFILLS": () => (/* binding */ WEBGL2_CONTEXT_POLYFILLS),
/* harmony export */   "WEBGL2_CONTEXT_OVERRIDES": () => (/* binding */ WEBGL2_CONTEXT_OVERRIDES)
/* harmony export */ });
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/gltools/dist/esm/utils/assert.js");
/* harmony import */ var _utils_webgl_checks__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/webgl-checks */ "./node_modules/@luma.gl/gltools/dist/esm/utils/webgl-checks.js");
/* harmony import */ var _get_parameter_polyfill__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./get-parameter-polyfill */ "./node_modules/@luma.gl/gltools/dist/esm/polyfill/get-parameter-polyfill.js");



const OES_vertex_array_object = 'OES_vertex_array_object';
const ANGLE_instanced_arrays = 'ANGLE_instanced_arrays';
const WEBGL_draw_buffers = 'WEBGL_draw_buffers';
const EXT_disjoint_timer_query = 'EXT_disjoint_timer_query';
const EXT_texture_filter_anisotropic = 'EXT_texture_filter_anisotropic';
const ERR_VAO_NOT_SUPPORTED = 'VertexArray requires WebGL2 or OES_vertex_array_object extension';

function getExtensionData(gl, extension) {
  return {
    webgl2: (0,_utils_webgl_checks__WEBPACK_IMPORTED_MODULE_1__.isWebGL2)(gl),
    ext: gl.getExtension(extension)
  };
}

const WEBGL2_CONTEXT_POLYFILLS = {
  [OES_vertex_array_object]: {
    meta: {
      suffix: 'OES'
    },
    createVertexArray: () => {
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(false, ERR_VAO_NOT_SUPPORTED);
    },
    deleteVertexArray: () => {},
    bindVertexArray: () => {},
    isVertexArray: () => false
  },
  [ANGLE_instanced_arrays]: {
    meta: {
      suffix: 'ANGLE'
    },

    vertexAttribDivisor(location, divisor) {
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(divisor === 0, 'WebGL instanced rendering not supported');
    },

    drawElementsInstanced: () => {},
    drawArraysInstanced: () => {}
  },
  [WEBGL_draw_buffers]: {
    meta: {
      suffix: 'WEBGL'
    },
    drawBuffers: () => {
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(false);
    }
  },
  [EXT_disjoint_timer_query]: {
    meta: {
      suffix: 'EXT'
    },
    createQuery: () => {
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(false);
    },
    deleteQuery: () => {
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(false);
    },
    beginQuery: () => {
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(false);
    },
    endQuery: () => {},

    getQuery(handle, pname) {
      return this.getQueryObject(handle, pname);
    },

    getQueryParameter(handle, pname) {
      return this.getQueryObject(handle, pname);
    },

    getQueryObject: () => {}
  }
};
const WEBGL2_CONTEXT_OVERRIDES = {
  readBuffer: (gl, originalFunc, attachment) => {
    if ((0,_utils_webgl_checks__WEBPACK_IMPORTED_MODULE_1__.isWebGL2)(gl)) {
      originalFunc(attachment);
    } else {}
  },
  getVertexAttrib: (gl, originalFunc, location, pname) => {
    const {
      webgl2,
      ext
    } = getExtensionData(gl, ANGLE_instanced_arrays);
    let result;

    switch (pname) {
      case 35069:
        result = !webgl2 ? false : undefined;
        break;

      case 35070:
        result = !webgl2 && !ext ? 0 : undefined;
        break;

      default:
    }

    return result !== undefined ? result : originalFunc(location, pname);
  },
  getProgramParameter: (gl, originalFunc, program, pname) => {
    if (!(0,_utils_webgl_checks__WEBPACK_IMPORTED_MODULE_1__.isWebGL2)(gl)) {
      switch (pname) {
        case 35967:
          return 35981;

        case 35971:
          return 0;

        case 35382:
          return 0;

        default:
      }
    }

    return originalFunc(program, pname);
  },
  getInternalformatParameter: (gl, originalFunc, target, format, pname) => {
    if (!(0,_utils_webgl_checks__WEBPACK_IMPORTED_MODULE_1__.isWebGL2)(gl)) {
      switch (pname) {
        case 32937:
          return new Int32Array([0]);

        default:
      }
    }

    return gl.getInternalformatParameter(target, format, pname);
  },

  getTexParameter(gl, originalFunc, target, pname) {
    switch (pname) {
      case 34046:
        const {
          extensions
        } = gl.luma;
        const ext = extensions[EXT_texture_filter_anisotropic];
        pname = ext && ext.TEXTURE_MAX_ANISOTROPY_EXT || 34046;
        break;

      default:
    }

    return originalFunc(target, pname);
  },

  getParameter: _get_parameter_polyfill__WEBPACK_IMPORTED_MODULE_2__.getParameterPolyfill,

  hint(gl, originalFunc, pname, value) {
    return originalFunc(pname, value);
  }

};
//# sourceMappingURL=polyfill-table.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/gltools/dist/esm/polyfill/polyfill-vertex-array-object.js":
/*!*****************************************************************************************!*\
  !*** ./node_modules/@luma.gl/gltools/dist/esm/polyfill/polyfill-vertex-array-object.js ***!
  \*****************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "polyfillVertexArrayObject": () => (/* binding */ polyfillVertexArrayObject)
/* harmony export */ });
/* harmony import */ var probe_gl_env__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! probe.gl/env */ "./node_modules/probe.gl/dist/es5/env/index.js");

const glErrorShadow = {};

function error(msg) {
  if (probe_gl_env__WEBPACK_IMPORTED_MODULE_0__.global.console && probe_gl_env__WEBPACK_IMPORTED_MODULE_0__.global.console.error) {
    probe_gl_env__WEBPACK_IMPORTED_MODULE_0__.global.console.error(msg);
  }
}

function log(msg) {
  if (probe_gl_env__WEBPACK_IMPORTED_MODULE_0__.global.console && probe_gl_env__WEBPACK_IMPORTED_MODULE_0__.global.console.log) {
    probe_gl_env__WEBPACK_IMPORTED_MODULE_0__.global.console.log(msg);
  }
}

function synthesizeGLError(err, opt_msg) {
  glErrorShadow[err] = true;

  if (opt_msg !== undefined) {
    error(opt_msg);
  }
}

function wrapGLError(gl) {
  const f = gl.getError;

  gl.getError = function getError() {
    let err;

    do {
      err = f.apply(gl);

      if (err !== 0) {
        glErrorShadow[err] = true;
      }
    } while (err !== 0);

    for (err in glErrorShadow) {
      if (glErrorShadow[err]) {
        delete glErrorShadow[err];
        return parseInt(err, 10);
      }
    }

    return 0;
  };
}

const WebGLVertexArrayObjectOES = function WebGLVertexArrayObjectOES(ext) {
  const gl = ext.gl;
  this.ext = ext;
  this.isAlive = true;
  this.hasBeenBound = false;
  this.elementArrayBuffer = null;
  this.attribs = new Array(ext.maxVertexAttribs);

  for (let n = 0; n < this.attribs.length; n++) {
    const attrib = new WebGLVertexArrayObjectOES.VertexAttrib(gl);
    this.attribs[n] = attrib;
  }

  this.maxAttrib = 0;
};

WebGLVertexArrayObjectOES.VertexAttrib = function VertexAttrib(gl) {
  this.enabled = false;
  this.buffer = null;
  this.size = 4;
  this.type = 5126;
  this.normalized = false;
  this.stride = 16;
  this.offset = 0;
  this.cached = '';
  this.recache();
};

WebGLVertexArrayObjectOES.VertexAttrib.prototype.recache = function recache() {
  this.cached = [this.size, this.type, this.normalized, this.stride, this.offset].join(':');
};

const OESVertexArrayObject = function OESVertexArrayObject(gl) {
  const self = this;
  this.gl = gl;
  wrapGLError(gl);
  const original = this.original = {
    getParameter: gl.getParameter,
    enableVertexAttribArray: gl.enableVertexAttribArray,
    disableVertexAttribArray: gl.disableVertexAttribArray,
    bindBuffer: gl.bindBuffer,
    getVertexAttrib: gl.getVertexAttrib,
    vertexAttribPointer: gl.vertexAttribPointer
  };

  gl.getParameter = function getParameter(pname) {
    if (pname === self.VERTEX_ARRAY_BINDING_OES) {
      if (self.currentVertexArrayObject === self.defaultVertexArrayObject) {
        return null;
      }

      return self.currentVertexArrayObject;
    }

    return original.getParameter.apply(this, arguments);
  };

  gl.enableVertexAttribArray = function enableVertexAttribArray(index) {
    const vao = self.currentVertexArrayObject;
    vao.maxAttrib = Math.max(vao.maxAttrib, index);
    const attrib = vao.attribs[index];
    attrib.enabled = true;
    return original.enableVertexAttribArray.apply(this, arguments);
  };

  gl.disableVertexAttribArray = function disableVertexAttribArray(index) {
    const vao = self.currentVertexArrayObject;
    vao.maxAttrib = Math.max(vao.maxAttrib, index);
    const attrib = vao.attribs[index];
    attrib.enabled = false;
    return original.disableVertexAttribArray.apply(this, arguments);
  };

  gl.bindBuffer = function bindBuffer(target, buffer) {
    switch (target) {
      case 34962:
        self.currentArrayBuffer = buffer;
        break;

      case 34963:
        self.currentVertexArrayObject.elementArrayBuffer = buffer;
        break;

      default:
    }

    return original.bindBuffer.apply(this, arguments);
  };

  gl.getVertexAttrib = function getVertexAttrib(index, pname) {
    const vao = self.currentVertexArrayObject;
    const attrib = vao.attribs[index];

    switch (pname) {
      case 34975:
        return attrib.buffer;

      case 34338:
        return attrib.enabled;

      case 34339:
        return attrib.size;

      case 34340:
        return attrib.stride;

      case 34341:
        return attrib.type;

      case 34922:
        return attrib.normalized;

      default:
        return original.getVertexAttrib.apply(this, arguments);
    }
  };

  gl.vertexAttribPointer = function vertexAttribPointer(indx, size, type, normalized, stride, offset) {
    const vao = self.currentVertexArrayObject;
    vao.maxAttrib = Math.max(vao.maxAttrib, indx);
    const attrib = vao.attribs[indx];
    attrib.buffer = self.currentArrayBuffer;
    attrib.size = size;
    attrib.type = type;
    attrib.normalized = normalized;
    attrib.stride = stride;
    attrib.offset = offset;
    attrib.recache();
    return original.vertexAttribPointer.apply(this, arguments);
  };

  if (gl.instrumentExtension) {
    gl.instrumentExtension(this, 'OES_vertex_array_object');
  }

  if (gl.canvas) {
    gl.canvas.addEventListener('webglcontextrestored', () => {
      log('OESVertexArrayObject emulation library context restored');
      self.reset_();
    }, true);
  }

  this.reset_();
};

OESVertexArrayObject.prototype.VERTEX_ARRAY_BINDING_OES = 0x85b5;

OESVertexArrayObject.prototype.reset_ = function reset_() {
  const contextWasLost = this.vertexArrayObjects !== undefined;

  if (contextWasLost) {
    for (let ii = 0; ii < this.vertexArrayObjects.length; ++ii) {
      this.vertexArrayObjects.isAlive = false;
    }
  }

  const gl = this.gl;
  this.maxVertexAttribs = gl.getParameter(34921);
  this.defaultVertexArrayObject = new WebGLVertexArrayObjectOES(this);
  this.currentVertexArrayObject = null;
  this.currentArrayBuffer = null;
  this.vertexArrayObjects = [this.defaultVertexArrayObject];
  this.bindVertexArrayOES(null);
};

OESVertexArrayObject.prototype.createVertexArrayOES = function createVertexArrayOES() {
  const arrayObject = new WebGLVertexArrayObjectOES(this);
  this.vertexArrayObjects.push(arrayObject);
  return arrayObject;
};

OESVertexArrayObject.prototype.deleteVertexArrayOES = function deleteVertexArrayOES(arrayObject) {
  arrayObject.isAlive = false;
  this.vertexArrayObjects.splice(this.vertexArrayObjects.indexOf(arrayObject), 1);

  if (this.currentVertexArrayObject === arrayObject) {
    this.bindVertexArrayOES(null);
  }
};

OESVertexArrayObject.prototype.isVertexArrayOES = function isVertexArrayOES(arrayObject) {
  if (arrayObject && arrayObject instanceof WebGLVertexArrayObjectOES) {
    if (arrayObject.hasBeenBound && arrayObject.ext === this) {
      return true;
    }
  }

  return false;
};

OESVertexArrayObject.prototype.bindVertexArrayOES = function bindVertexArrayOES(arrayObject) {
  const gl = this.gl;

  if (arrayObject && !arrayObject.isAlive) {
    synthesizeGLError(1282, 'bindVertexArrayOES: attempt to bind deleted arrayObject');
    return;
  }

  const original = this.original;
  const oldVAO = this.currentVertexArrayObject;
  this.currentVertexArrayObject = arrayObject || this.defaultVertexArrayObject;
  this.currentVertexArrayObject.hasBeenBound = true;
  const newVAO = this.currentVertexArrayObject;

  if (oldVAO === newVAO) {
    return;
  }

  if (!oldVAO || newVAO.elementArrayBuffer !== oldVAO.elementArrayBuffer) {
    original.bindBuffer.call(gl, 34963, newVAO.elementArrayBuffer);
  }

  let currentBinding = this.currentArrayBuffer;
  const maxAttrib = Math.max(oldVAO ? oldVAO.maxAttrib : 0, newVAO.maxAttrib);

  for (let n = 0; n <= maxAttrib; n++) {
    const attrib = newVAO.attribs[n];
    const oldAttrib = oldVAO ? oldVAO.attribs[n] : null;

    if (!oldVAO || attrib.enabled !== oldAttrib.enabled) {
      if (attrib.enabled) {
        original.enableVertexAttribArray.call(gl, n);
      } else {
        original.disableVertexAttribArray.call(gl, n);
      }
    }

    if (attrib.enabled) {
      let bufferChanged = false;

      if (!oldVAO || attrib.buffer !== oldAttrib.buffer) {
        if (currentBinding !== attrib.buffer) {
          original.bindBuffer.call(gl, 34962, attrib.buffer);
          currentBinding = attrib.buffer;
        }

        bufferChanged = true;
      }

      if (bufferChanged || attrib.cached !== oldAttrib.cached) {
        original.vertexAttribPointer.call(gl, n, attrib.size, attrib.type, attrib.normalized, attrib.stride, attrib.offset);
      }
    }
  }

  if (this.currentArrayBuffer !== currentBinding) {
    original.bindBuffer.call(gl, 34962, this.currentArrayBuffer);
  }
};

function polyfillVertexArrayObject(gl) {
  if (typeof gl.createVertexArray === 'function') {
    return;
  }

  const original_getSupportedExtensions = gl.getSupportedExtensions;

  gl.getSupportedExtensions = function getSupportedExtensions() {
    const list = original_getSupportedExtensions.call(this) || [];

    if (list.indexOf('OES_vertex_array_object') < 0) {
      list.push('OES_vertex_array_object');
    }

    return list;
  };

  const original_getExtension = gl.getExtension;

  gl.getExtension = function getExtension(name) {
    const ext = original_getExtension.call(this, name);

    if (ext) {
      return ext;
    }

    if (name !== 'OES_vertex_array_object') {
      return null;
    }

    if (!gl.__OESVertexArrayObject) {
      this.__OESVertexArrayObject = new OESVertexArrayObject(this);
    }

    return this.__OESVertexArrayObject;
  };
}
//# sourceMappingURL=polyfill-vertex-array-object.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/gltools/dist/esm/state-tracker/track-context-state.js":
/*!*************************************************************************************!*\
  !*** ./node_modules/@luma.gl/gltools/dist/esm/state-tracker/track-context-state.js ***!
  \*************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "trackContextState": () => (/* binding */ trackContextState),
/* harmony export */   "pushContextState": () => (/* binding */ pushContextState),
/* harmony export */   "popContextState": () => (/* binding */ popContextState)
/* harmony export */ });
/* harmony import */ var _webgl_parameter_tables__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./webgl-parameter-tables */ "./node_modules/@luma.gl/gltools/dist/esm/state-tracker/webgl-parameter-tables.js");
/* harmony import */ var _unified_parameter_api__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./unified-parameter-api */ "./node_modules/@luma.gl/gltools/dist/esm/state-tracker/unified-parameter-api.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/gltools/dist/esm/utils/assert.js");
/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/utils */ "./node_modules/@luma.gl/gltools/dist/esm/utils/utils.js");





function installGetterOverride(gl, functionName) {
  const originalGetterFunc = gl[functionName].bind(gl);

  gl[functionName] = function get(...params) {
    const pname = params[0];

    if (!(pname in gl.state.cache)) {
      return originalGetterFunc(...params);
    }

    return gl.state.enable ? gl.state.cache[pname] : originalGetterFunc(...params);
  };

  Object.defineProperty(gl[functionName], 'name', {
    value: `${functionName}-from-cache`,
    configurable: false
  });
}

function installSetterSpy(gl, functionName, setter) {
  const originalSetterFunc = gl[functionName].bind(gl);

  gl[functionName] = function set(...params) {
    const {
      valueChanged,
      oldValue
    } = setter(gl.state._updateCache, ...params);

    if (valueChanged) {
      originalSetterFunc(...params);
    }

    return oldValue;
  };

  Object.defineProperty(gl[functionName], 'name', {
    value: `${functionName}-to-cache`,
    configurable: false
  });
}

function installProgramSpy(gl) {
  const originalUseProgram = gl.useProgram.bind(gl);

  gl.useProgram = function useProgramLuma(handle) {
    if (gl.state.program !== handle) {
      originalUseProgram(handle);
      gl.state.program = handle;
    }
  };
}

class GLState {
  constructor(gl, {
    copyState = false,
    log = () => {}
  } = {}) {
    this.gl = gl;
    this.program = null;
    this.stateStack = [];
    this.enable = true;
    this.cache = copyState ? (0,_unified_parameter_api__WEBPACK_IMPORTED_MODULE_1__.getParameters)(gl) : Object.assign({}, _webgl_parameter_tables__WEBPACK_IMPORTED_MODULE_0__.GL_PARAMETER_DEFAULTS);
    this.log = log;
    this._updateCache = this._updateCache.bind(this);
    Object.seal(this);
  }

  push(values = {}) {
    this.stateStack.push({});
  }

  pop() {
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_2__.assert)(this.stateStack.length > 0);
    const oldValues = this.stateStack[this.stateStack.length - 1];
    (0,_unified_parameter_api__WEBPACK_IMPORTED_MODULE_1__.setParameters)(this.gl, oldValues);
    this.stateStack.pop();
  }

  _updateCache(values) {
    let valueChanged = false;
    let oldValue;
    const oldValues = this.stateStack.length > 0 && this.stateStack[this.stateStack.length - 1];

    for (const key in values) {
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_2__.assert)(key !== undefined);
      const value = values[key];
      const cached = this.cache[key];

      if (!(0,_utils_utils__WEBPACK_IMPORTED_MODULE_3__.deepArrayEqual)(value, cached)) {
        valueChanged = true;
        oldValue = cached;

        if (oldValues && !(key in oldValues)) {
          oldValues[key] = cached;
        }

        this.cache[key] = value;
      }
    }

    return {
      valueChanged,
      oldValue
    };
  }

}

function trackContextState(gl, options = {}) {
  const {
    enable = true,
    copyState
  } = options;
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_2__.assert)(copyState !== undefined);

  if (!gl.state) {
    const global_ = typeof __webpack_require__.g !== 'undefined' ? __webpack_require__.g : window;
    const {
      polyfillContext
    } = global_;

    if (polyfillContext) {
      polyfillContext(gl);
    }

    gl.state = new GLState(gl, {
      copyState
    });
    installProgramSpy(gl);

    for (const key in _webgl_parameter_tables__WEBPACK_IMPORTED_MODULE_0__.GL_HOOKED_SETTERS) {
      const setter = _webgl_parameter_tables__WEBPACK_IMPORTED_MODULE_0__.GL_HOOKED_SETTERS[key];
      installSetterSpy(gl, key, setter);
    }

    installGetterOverride(gl, 'getParameter');
    installGetterOverride(gl, 'isEnabled');
  }

  gl.state.enable = enable;
  return gl;
}
function pushContextState(gl) {
  if (!gl.state) {
    trackContextState(gl, {
      copyState: false
    });
  }

  gl.state.push();
}
function popContextState(gl) {
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_2__.assert)(gl.state);
  gl.state.pop();
}
//# sourceMappingURL=track-context-state.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/gltools/dist/esm/state-tracker/unified-parameter-api.js":
/*!***************************************************************************************!*\
  !*** ./node_modules/@luma.gl/gltools/dist/esm/state-tracker/unified-parameter-api.js ***!
  \***************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "setParameters": () => (/* binding */ setParameters),
/* harmony export */   "getParameters": () => (/* binding */ getParameters),
/* harmony export */   "resetParameters": () => (/* binding */ resetParameters),
/* harmony export */   "withParameters": () => (/* binding */ withParameters)
/* harmony export */ });
/* harmony import */ var _webgl_parameter_tables__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./webgl-parameter-tables */ "./node_modules/@luma.gl/gltools/dist/esm/state-tracker/webgl-parameter-tables.js");
/* harmony import */ var _track_context_state__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./track-context-state */ "./node_modules/@luma.gl/gltools/dist/esm/state-tracker/track-context-state.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/gltools/dist/esm/utils/assert.js");
/* harmony import */ var _utils_webgl_checks__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/webgl-checks */ "./node_modules/@luma.gl/gltools/dist/esm/utils/webgl-checks.js");
/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/utils */ "./node_modules/@luma.gl/gltools/dist/esm/utils/utils.js");





function setParameters(gl, values) {
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_2__.assert)((0,_utils_webgl_checks__WEBPACK_IMPORTED_MODULE_3__.isWebGL)(gl), 'setParameters requires a WebGL context');

  if ((0,_utils_utils__WEBPACK_IMPORTED_MODULE_4__.isObjectEmpty)(values)) {
    return;
  }

  const compositeSetters = {};

  for (const key in values) {
    const glConstant = Number(key);
    const setter = _webgl_parameter_tables__WEBPACK_IMPORTED_MODULE_0__.GL_PARAMETER_SETTERS[key];

    if (setter) {
      if (typeof setter === 'string') {
        compositeSetters[setter] = true;
      } else {
        setter(gl, values[key], glConstant);
      }
    }
  }

  const cache = gl.state && gl.state.cache;

  if (cache) {
    for (const key in compositeSetters) {
      const compositeSetter = _webgl_parameter_tables__WEBPACK_IMPORTED_MODULE_0__.GL_COMPOSITE_PARAMETER_SETTERS[key];
      compositeSetter(gl, values, cache);
    }
  }
}
function getParameters(gl, parameters) {
  parameters = parameters || _webgl_parameter_tables__WEBPACK_IMPORTED_MODULE_0__.GL_PARAMETER_DEFAULTS;

  if (typeof parameters === 'number') {
    const key = parameters;
    const getter = _webgl_parameter_tables__WEBPACK_IMPORTED_MODULE_0__.GL_PARAMETER_GETTERS[key];
    return getter ? getter(gl, key) : gl.getParameter(key);
  }

  const parameterKeys = Array.isArray(parameters) ? parameters : Object.keys(parameters);
  const state = {};

  for (const key of parameterKeys) {
    const getter = _webgl_parameter_tables__WEBPACK_IMPORTED_MODULE_0__.GL_PARAMETER_GETTERS[key];
    state[key] = getter ? getter(gl, Number(key)) : gl.getParameter(Number(key));
  }

  return state;
}
function resetParameters(gl) {
  setParameters(gl, _webgl_parameter_tables__WEBPACK_IMPORTED_MODULE_0__.GL_PARAMETER_DEFAULTS);
}
function withParameters(gl, parameters, func) {
  if ((0,_utils_utils__WEBPACK_IMPORTED_MODULE_4__.isObjectEmpty)(parameters)) {
    return func(gl);
  }

  const {
    nocatch = true
  } = parameters;
  (0,_track_context_state__WEBPACK_IMPORTED_MODULE_1__.pushContextState)(gl);
  setParameters(gl, parameters);
  let value;

  if (nocatch) {
    value = func(gl);
    (0,_track_context_state__WEBPACK_IMPORTED_MODULE_1__.popContextState)(gl);
  } else {
    try {
      value = func(gl);
    } finally {
      (0,_track_context_state__WEBPACK_IMPORTED_MODULE_1__.popContextState)(gl);
    }
  }

  return value;
}
//# sourceMappingURL=unified-parameter-api.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/gltools/dist/esm/state-tracker/webgl-parameter-tables.js":
/*!****************************************************************************************!*\
  !*** ./node_modules/@luma.gl/gltools/dist/esm/state-tracker/webgl-parameter-tables.js ***!
  \****************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "GL_PARAMETER_DEFAULTS": () => (/* binding */ GL_PARAMETER_DEFAULTS),
/* harmony export */   "GL_PARAMETER_SETTERS": () => (/* binding */ GL_PARAMETER_SETTERS),
/* harmony export */   "GL_COMPOSITE_PARAMETER_SETTERS": () => (/* binding */ GL_COMPOSITE_PARAMETER_SETTERS),
/* harmony export */   "GL_HOOKED_SETTERS": () => (/* binding */ GL_HOOKED_SETTERS),
/* harmony export */   "GL_PARAMETER_GETTERS": () => (/* binding */ GL_PARAMETER_GETTERS)
/* harmony export */ });
/* harmony import */ var _utils_webgl_checks__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/webgl-checks */ "./node_modules/@luma.gl/gltools/dist/esm/utils/webgl-checks.js");

const GL_PARAMETER_DEFAULTS = {
  [3042]: false,
  [32773]: new Float32Array([0, 0, 0, 0]),
  [32777]: 32774,
  [34877]: 32774,
  [32969]: 1,
  [32968]: 0,
  [32971]: 1,
  [32970]: 0,
  [3106]: new Float32Array([0, 0, 0, 0]),
  [3107]: [true, true, true, true],
  [2884]: false,
  [2885]: 1029,
  [2929]: false,
  [2931]: 1,
  [2932]: 513,
  [2928]: new Float32Array([0, 1]),
  [2930]: true,
  [3024]: true,
  [36006]: null,
  [2886]: 2305,
  [33170]: 4352,
  [2849]: 1,
  [32823]: false,
  [32824]: 0,
  [10752]: 0,
  [32938]: 1.0,
  [32939]: false,
  [3089]: false,
  [3088]: new Int32Array([0, 0, 1024, 1024]),
  [2960]: false,
  [2961]: 0,
  [2968]: 0xffffffff,
  [36005]: 0xffffffff,
  [2962]: 519,
  [2967]: 0,
  [2963]: 0xffffffff,
  [34816]: 519,
  [36003]: 0,
  [36004]: 0xffffffff,
  [2964]: 7680,
  [2965]: 7680,
  [2966]: 7680,
  [34817]: 7680,
  [34818]: 7680,
  [34819]: 7680,
  [2978]: [0, 0, 1024, 1024],
  [3333]: 4,
  [3317]: 4,
  [37440]: false,
  [37441]: false,
  [37443]: 37444,
  [35723]: 4352,
  [36010]: null,
  [35977]: false,
  [3330]: 0,
  [3332]: 0,
  [3331]: 0,
  [3314]: 0,
  [32878]: 0,
  [3316]: 0,
  [3315]: 0,
  [32877]: 0
};

const enable = (gl, value, key) => value ? gl.enable(key) : gl.disable(key);

const hint = (gl, value, key) => gl.hint(key, value);

const pixelStorei = (gl, value, key) => gl.pixelStorei(key, value);

const drawFramebuffer = (gl, value) => {
  const target = (0,_utils_webgl_checks__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl) ? 36009 : 36160;
  return gl.bindFramebuffer(target, value);
};

const readFramebuffer = (gl, value) => {
  return gl.bindFramebuffer(36008, value);
};

function isArray(array) {
  return Array.isArray(array) || ArrayBuffer.isView(array);
}

const GL_PARAMETER_SETTERS = {
  [3042]: enable,
  [32773]: (gl, value) => gl.blendColor(...value),
  [32777]: 'blendEquation',
  [34877]: 'blendEquation',
  [32969]: 'blendFunc',
  [32968]: 'blendFunc',
  [32971]: 'blendFunc',
  [32970]: 'blendFunc',
  [3106]: (gl, value) => gl.clearColor(...value),
  [3107]: (gl, value) => gl.colorMask(...value),
  [2884]: enable,
  [2885]: (gl, value) => gl.cullFace(value),
  [2929]: enable,
  [2931]: (gl, value) => gl.clearDepth(value),
  [2932]: (gl, value) => gl.depthFunc(value),
  [2928]: (gl, value) => gl.depthRange(...value),
  [2930]: (gl, value) => gl.depthMask(value),
  [3024]: enable,
  [35723]: hint,
  [36006]: drawFramebuffer,
  [2886]: (gl, value) => gl.frontFace(value),
  [33170]: hint,
  [2849]: (gl, value) => gl.lineWidth(value),
  [32823]: enable,
  [32824]: 'polygonOffset',
  [10752]: 'polygonOffset',
  [35977]: enable,
  [32938]: 'sampleCoverage',
  [32939]: 'sampleCoverage',
  [3089]: enable,
  [3088]: (gl, value) => gl.scissor(...value),
  [2960]: enable,
  [2961]: (gl, value) => gl.clearStencil(value),
  [2968]: (gl, value) => gl.stencilMaskSeparate(1028, value),
  [36005]: (gl, value) => gl.stencilMaskSeparate(1029, value),
  [2962]: 'stencilFuncFront',
  [2967]: 'stencilFuncFront',
  [2963]: 'stencilFuncFront',
  [34816]: 'stencilFuncBack',
  [36003]: 'stencilFuncBack',
  [36004]: 'stencilFuncBack',
  [2964]: 'stencilOpFront',
  [2965]: 'stencilOpFront',
  [2966]: 'stencilOpFront',
  [34817]: 'stencilOpBack',
  [34818]: 'stencilOpBack',
  [34819]: 'stencilOpBack',
  [2978]: (gl, value) => gl.viewport(...value),
  [3333]: pixelStorei,
  [3317]: pixelStorei,
  [37440]: pixelStorei,
  [37441]: pixelStorei,
  [37443]: pixelStorei,
  [3330]: pixelStorei,
  [3332]: pixelStorei,
  [3331]: pixelStorei,
  [36010]: readFramebuffer,
  [3314]: pixelStorei,
  [32878]: pixelStorei,
  [3316]: pixelStorei,
  [3315]: pixelStorei,
  [32877]: pixelStorei,
  framebuffer: (gl, framebuffer) => {
    const handle = framebuffer && 'handle' in framebuffer ? framebuffer.handle : framebuffer;
    return gl.bindFramebuffer(36160, handle);
  },
  blend: (gl, value) => value ? gl.enable(3042) : gl.disable(3042),
  blendColor: (gl, value) => gl.blendColor(...value),
  blendEquation: (gl, args) => {
    args = isArray(args) ? args : [args, args];
    gl.blendEquationSeparate(...args);
  },
  blendFunc: (gl, args) => {
    args = isArray(args) && args.length === 2 ? [...args, ...args] : args;
    gl.blendFuncSeparate(...args);
  },
  clearColor: (gl, value) => gl.clearColor(...value),
  clearDepth: (gl, value) => gl.clearDepth(value),
  clearStencil: (gl, value) => gl.clearStencil(value),
  colorMask: (gl, value) => gl.colorMask(...value),
  cull: (gl, value) => value ? gl.enable(2884) : gl.disable(2884),
  cullFace: (gl, value) => gl.cullFace(value),
  depthTest: (gl, value) => value ? gl.enable(2929) : gl.disable(2929),
  depthFunc: (gl, value) => gl.depthFunc(value),
  depthMask: (gl, value) => gl.depthMask(value),
  depthRange: (gl, value) => gl.depthRange(...value),
  dither: (gl, value) => value ? gl.enable(3024) : gl.disable(3024),
  derivativeHint: (gl, value) => {
    gl.hint(35723, value);
  },
  frontFace: (gl, value) => gl.frontFace(value),
  mipmapHint: (gl, value) => gl.hint(33170, value),
  lineWidth: (gl, value) => gl.lineWidth(value),
  polygonOffsetFill: (gl, value) => value ? gl.enable(32823) : gl.disable(32823),
  polygonOffset: (gl, value) => gl.polygonOffset(...value),
  sampleCoverage: (gl, value) => gl.sampleCoverage(...value),
  scissorTest: (gl, value) => value ? gl.enable(3089) : gl.disable(3089),
  scissor: (gl, value) => gl.scissor(...value),
  stencilTest: (gl, value) => value ? gl.enable(2960) : gl.disable(2960),
  stencilMask: (gl, value) => {
    value = isArray(value) ? value : [value, value];
    const [mask, backMask] = value;
    gl.stencilMaskSeparate(1028, mask);
    gl.stencilMaskSeparate(1029, backMask);
  },
  stencilFunc: (gl, args) => {
    args = isArray(args) && args.length === 3 ? [...args, ...args] : args;
    const [func, ref, mask, backFunc, backRef, backMask] = args;
    gl.stencilFuncSeparate(1028, func, ref, mask);
    gl.stencilFuncSeparate(1029, backFunc, backRef, backMask);
  },
  stencilOp: (gl, args) => {
    args = isArray(args) && args.length === 3 ? [...args, ...args] : args;
    const [sfail, dpfail, dppass, backSfail, backDpfail, backDppass] = args;
    gl.stencilOpSeparate(1028, sfail, dpfail, dppass);
    gl.stencilOpSeparate(1029, backSfail, backDpfail, backDppass);
  },
  viewport: (gl, value) => gl.viewport(...value)
};

function getValue(glEnum, values, cache) {
  return values[glEnum] !== undefined ? values[glEnum] : cache[glEnum];
}

const GL_COMPOSITE_PARAMETER_SETTERS = {
  blendEquation: (gl, values, cache) => gl.blendEquationSeparate(getValue(32777, values, cache), getValue(34877, values, cache)),
  blendFunc: (gl, values, cache) => gl.blendFuncSeparate(getValue(32969, values, cache), getValue(32968, values, cache), getValue(32971, values, cache), getValue(32970, values, cache)),
  polygonOffset: (gl, values, cache) => gl.polygonOffset(getValue(32824, values, cache), getValue(10752, values, cache)),
  sampleCoverage: (gl, values, cache) => gl.sampleCoverage(getValue(32938, values, cache), getValue(32939, values, cache)),
  stencilFuncFront: (gl, values, cache) => gl.stencilFuncSeparate(1028, getValue(2962, values, cache), getValue(2967, values, cache), getValue(2963, values, cache)),
  stencilFuncBack: (gl, values, cache) => gl.stencilFuncSeparate(1029, getValue(34816, values, cache), getValue(36003, values, cache), getValue(36004, values, cache)),
  stencilOpFront: (gl, values, cache) => gl.stencilOpSeparate(1028, getValue(2964, values, cache), getValue(2965, values, cache), getValue(2966, values, cache)),
  stencilOpBack: (gl, values, cache) => gl.stencilOpSeparate(1029, getValue(34817, values, cache), getValue(34818, values, cache), getValue(34819, values, cache))
};
const GL_HOOKED_SETTERS = {
  enable: (update, capability) => update({
    [capability]: true
  }),
  disable: (update, capability) => update({
    [capability]: false
  }),
  pixelStorei: (update, pname, value) => update({
    [pname]: value
  }),
  hint: (update, pname, hint) => update({
    [pname]: hint
  }),
  bindFramebuffer: (update, target, framebuffer) => {
    switch (target) {
      case 36160:
        return update({
          [36006]: framebuffer,
          [36010]: framebuffer
        });

      case 36009:
        return update({
          [36006]: framebuffer
        });

      case 36008:
        return update({
          [36010]: framebuffer
        });

      default:
        return null;
    }
  },
  blendColor: (update, r, g, b, a) => update({
    [32773]: new Float32Array([r, g, b, a])
  }),
  blendEquation: (update, mode) => update({
    [32777]: mode,
    [34877]: mode
  }),
  blendEquationSeparate: (update, modeRGB, modeAlpha) => update({
    [32777]: modeRGB,
    [34877]: modeAlpha
  }),
  blendFunc: (update, src, dst) => update({
    [32969]: src,
    [32968]: dst,
    [32971]: src,
    [32970]: dst
  }),
  blendFuncSeparate: (update, srcRGB, dstRGB, srcAlpha, dstAlpha) => update({
    [32969]: srcRGB,
    [32968]: dstRGB,
    [32971]: srcAlpha,
    [32970]: dstAlpha
  }),
  clearColor: (update, r, g, b, a) => update({
    [3106]: new Float32Array([r, g, b, a])
  }),
  clearDepth: (update, depth) => update({
    [2931]: depth
  }),
  clearStencil: (update, s) => update({
    [2961]: s
  }),
  colorMask: (update, r, g, b, a) => update({
    [3107]: [r, g, b, a]
  }),
  cullFace: (update, mode) => update({
    [2885]: mode
  }),
  depthFunc: (update, func) => update({
    [2932]: func
  }),
  depthRange: (update, zNear, zFar) => update({
    [2928]: new Float32Array([zNear, zFar])
  }),
  depthMask: (update, mask) => update({
    [2930]: mask
  }),
  frontFace: (update, face) => update({
    [2886]: face
  }),
  lineWidth: (update, width) => update({
    [2849]: width
  }),
  polygonOffset: (update, factor, units) => update({
    [32824]: factor,
    [10752]: units
  }),
  sampleCoverage: (update, value, invert) => update({
    [32938]: value,
    [32939]: invert
  }),
  scissor: (update, x, y, width, height) => update({
    [3088]: new Int32Array([x, y, width, height])
  }),
  stencilMask: (update, mask) => update({
    [2968]: mask,
    [36005]: mask
  }),
  stencilMaskSeparate: (update, face, mask) => update({
    [face === 1028 ? 2968 : 36005]: mask
  }),
  stencilFunc: (update, func, ref, mask) => update({
    [2962]: func,
    [2967]: ref,
    [2963]: mask,
    [34816]: func,
    [36003]: ref,
    [36004]: mask
  }),
  stencilFuncSeparate: (update, face, func, ref, mask) => update({
    [face === 1028 ? 2962 : 34816]: func,
    [face === 1028 ? 2967 : 36003]: ref,
    [face === 1028 ? 2963 : 36004]: mask
  }),
  stencilOp: (update, fail, zfail, zpass) => update({
    [2964]: fail,
    [2965]: zfail,
    [2966]: zpass,
    [34817]: fail,
    [34818]: zfail,
    [34819]: zpass
  }),
  stencilOpSeparate: (update, face, fail, zfail, zpass) => update({
    [face === 1028 ? 2964 : 34817]: fail,
    [face === 1028 ? 2965 : 34818]: zfail,
    [face === 1028 ? 2966 : 34819]: zpass
  }),
  viewport: (update, x, y, width, height) => update({
    [2978]: [x, y, width, height]
  })
};

const isEnabled = (gl, key) => gl.isEnabled(key);

const GL_PARAMETER_GETTERS = {
  [3042]: isEnabled,
  [2884]: isEnabled,
  [2929]: isEnabled,
  [3024]: isEnabled,
  [32823]: isEnabled,
  [32926]: isEnabled,
  [32928]: isEnabled,
  [3089]: isEnabled,
  [2960]: isEnabled,
  [35977]: isEnabled
};
//# sourceMappingURL=webgl-parameter-tables.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/gltools/dist/esm/utils/assert.js":
/*!****************************************************************!*\
  !*** ./node_modules/@luma.gl/gltools/dist/esm/utils/assert.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "assert": () => (/* binding */ assert)
/* harmony export */ });
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'luma.gl: assertion failed.');
  }
}
//# sourceMappingURL=assert.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/gltools/dist/esm/utils/device-pixels.js":
/*!***********************************************************************!*\
  !*** ./node_modules/@luma.gl/gltools/dist/esm/utils/device-pixels.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "cssToDeviceRatio": () => (/* binding */ cssToDeviceRatio),
/* harmony export */   "cssToDevicePixels": () => (/* binding */ cssToDevicePixels),
/* harmony export */   "getDevicePixelRatio": () => (/* binding */ getDevicePixelRatio)
/* harmony export */ });
function cssToDeviceRatio(gl) {
  const {
    luma
  } = gl;

  if (gl.canvas && luma) {
    const {
      clientWidth
    } = luma.canvasSizeInfo;
    return clientWidth ? gl.drawingBufferWidth / clientWidth : 1;
  }

  return 1;
}
function cssToDevicePixels(gl, cssPixel, yInvert = true) {
  const ratio = cssToDeviceRatio(gl);
  const width = gl.drawingBufferWidth;
  const height = gl.drawingBufferHeight;
  return scalePixels(cssPixel, ratio, width, height, yInvert);
}
function getDevicePixelRatio(useDevicePixels) {
  const windowRatio = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1;

  if (Number.isFinite(useDevicePixels)) {
    return useDevicePixels <= 0 ? 1 : useDevicePixels;
  }

  return useDevicePixels ? windowRatio : 1;
}

function scalePixels(pixel, ratio, width, height, yInvert) {
  const x = scaleX(pixel[0], ratio, width);
  let y = scaleY(pixel[1], ratio, height, yInvert);
  let t = scaleX(pixel[0] + 1, ratio, width);
  const xHigh = t === width - 1 ? t : t - 1;
  t = scaleY(pixel[1] + 1, ratio, height, yInvert);
  let yHigh;

  if (yInvert) {
    t = t === 0 ? t : t + 1;
    yHigh = y;
    y = t;
  } else {
    yHigh = t === height - 1 ? t : t - 1;
  }

  return {
    x,
    y,
    width: Math.max(xHigh - x + 1, 1),
    height: Math.max(yHigh - y + 1, 1)
  };
}

function scaleX(x, ratio, width) {
  const r = Math.min(Math.round(x * ratio), width - 1);
  return r;
}

function scaleY(y, ratio, height, yInvert) {
  return yInvert ? Math.max(0, height - 1 - Math.round(y * ratio)) : Math.min(Math.round(y * ratio), height - 1);
}
//# sourceMappingURL=device-pixels.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/gltools/dist/esm/utils/log.js":
/*!*************************************************************!*\
  !*** ./node_modules/@luma.gl/gltools/dist/esm/utils/log.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "log": () => (/* binding */ log)
/* harmony export */ });
/* harmony import */ var probe_gl__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! probe.gl */ "./node_modules/probe.gl/dist/esm/lib/log.js");

const log = new probe_gl__WEBPACK_IMPORTED_MODULE_0__["default"]({
  id: 'luma.gl'
});
//# sourceMappingURL=log.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/gltools/dist/esm/utils/utils.js":
/*!***************************************************************!*\
  !*** ./node_modules/@luma.gl/gltools/dist/esm/utils/utils.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "isObjectEmpty": () => (/* binding */ isObjectEmpty),
/* harmony export */   "deepArrayEqual": () => (/* binding */ deepArrayEqual)
/* harmony export */ });
function isObjectEmpty(object) {
  for (const key in object) {
    return false;
  }

  return true;
}
function deepArrayEqual(x, y) {
  if (x === y) {
    return true;
  }

  const isArrayX = Array.isArray(x) || ArrayBuffer.isView(x);
  const isArrayY = Array.isArray(y) || ArrayBuffer.isView(y);

  if (isArrayX && isArrayY && x.length === y.length) {
    for (let i = 0; i < x.length; ++i) {
      if (x[i] !== y[i]) {
        return false;
      }
    }

    return true;
  }

  return false;
}
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/gltools/dist/esm/utils/webgl-checks.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@luma.gl/gltools/dist/esm/utils/webgl-checks.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ERR_WEBGL": () => (/* binding */ ERR_WEBGL),
/* harmony export */   "ERR_WEBGL2": () => (/* binding */ ERR_WEBGL2),
/* harmony export */   "isWebGL": () => (/* binding */ isWebGL),
/* harmony export */   "isWebGL2": () => (/* binding */ isWebGL2),
/* harmony export */   "getWebGL2Context": () => (/* binding */ getWebGL2Context),
/* harmony export */   "assertWebGLContext": () => (/* binding */ assertWebGLContext),
/* harmony export */   "assertWebGL2Context": () => (/* binding */ assertWebGL2Context)
/* harmony export */ });
/* harmony import */ var _assert__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./assert */ "./node_modules/@luma.gl/gltools/dist/esm/utils/assert.js");

const ERR_CONTEXT = 'Invalid WebGLRenderingContext';
const ERR_WEBGL = ERR_CONTEXT;
const ERR_WEBGL2 = 'Requires WebGL2';
function isWebGL(gl) {
  if (typeof WebGLRenderingContext !== 'undefined' && gl instanceof WebGLRenderingContext) {
    return true;
  }

  if (typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext) {
    return true;
  }

  return Boolean(gl && Number.isFinite(gl._version));
}
function isWebGL2(gl) {
  if (typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext) {
    return true;
  }

  return Boolean(gl && gl._version === 2);
}
function getWebGL2Context(gl) {
  return isWebGL2(gl) ? gl : null;
}
function assertWebGLContext(gl) {
  (0,_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(isWebGL(gl), ERR_CONTEXT);
  return gl;
}
function assertWebGL2Context(gl) {
  (0,_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(isWebGL2(gl), ERR_WEBGL2);
  return gl;
}
//# sourceMappingURL=webgl-checks.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/shadertools/dist/esm/lib/assemble-shaders.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@luma.gl/shadertools/dist/esm/lib/assemble-shaders.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "assembleShaders": () => (/* binding */ assembleShaders)
/* harmony export */ });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./constants */ "./node_modules/@luma.gl/shadertools/dist/esm/lib/constants.js");
/* harmony import */ var _resolve_modules__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./resolve-modules */ "./node_modules/@luma.gl/shadertools/dist/esm/lib/resolve-modules.js");
/* harmony import */ var _platform_defines__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./platform-defines */ "./node_modules/@luma.gl/shadertools/dist/esm/lib/platform-defines.js");
/* harmony import */ var _inject_shader__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./inject-shader */ "./node_modules/@luma.gl/shadertools/dist/esm/lib/inject-shader.js");
/* harmony import */ var _transpile_shader__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./transpile-shader */ "./node_modules/@luma.gl/shadertools/dist/esm/lib/transpile-shader.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils */ "./node_modules/@luma.gl/shadertools/dist/esm/utils/assert.js");






const INJECT_SHADER_DECLARATIONS = `\n\n${_inject_shader__WEBPACK_IMPORTED_MODULE_0__.DECLARATION_INJECT_MARKER}\n\n`;
const SHADER_TYPE = {
  [_constants__WEBPACK_IMPORTED_MODULE_1__.VERTEX_SHADER]: 'vertex',
  [_constants__WEBPACK_IMPORTED_MODULE_1__.FRAGMENT_SHADER]: 'fragment'
};
const FRAGMENT_SHADER_PROLOGUE = `\
precision highp float;

`;
function assembleShaders(gl, opts) {
  const {
    vs,
    fs
  } = opts;
  const modules = (0,_resolve_modules__WEBPACK_IMPORTED_MODULE_2__.resolveModules)(opts.modules || []);
  return {
    gl,
    vs: assembleShader(gl, Object.assign({}, opts, {
      source: vs,
      type: _constants__WEBPACK_IMPORTED_MODULE_1__.VERTEX_SHADER,
      modules
    })),
    fs: assembleShader(gl, Object.assign({}, opts, {
      source: fs,
      type: _constants__WEBPACK_IMPORTED_MODULE_1__.FRAGMENT_SHADER,
      modules
    })),
    getUniforms: assembleGetUniforms(modules)
  };
}

function assembleShader(gl, {
  id,
  source,
  type,
  modules,
  defines = {},
  hookFunctions = [],
  inject = {},
  transpileToGLSL100 = false,
  prologue = true,
  log
}) {
  (0,_utils__WEBPACK_IMPORTED_MODULE_3__["default"])(typeof source === 'string', 'shader source must be a string');
  const isVertex = type === _constants__WEBPACK_IMPORTED_MODULE_1__.VERTEX_SHADER;
  const sourceLines = source.split('\n');
  let glslVersion = 100;
  let versionLine = '';
  let coreSource = source;

  if (sourceLines[0].indexOf('#version ') === 0) {
    glslVersion = 300;
    versionLine = sourceLines[0];
    coreSource = sourceLines.slice(1).join('\n');
  } else {
    versionLine = `#version ${glslVersion}`;
  }

  const allDefines = {};
  modules.forEach(module => {
    Object.assign(allDefines, module.getDefines());
  });
  Object.assign(allDefines, defines);
  let assembledSource = prologue ? `\
${versionLine}
${getShaderName({
    id,
    source,
    type
  })}
${getShaderType({
    type
  })}
${(0,_platform_defines__WEBPACK_IMPORTED_MODULE_4__.getPlatformShaderDefines)(gl)}
${(0,_platform_defines__WEBPACK_IMPORTED_MODULE_4__.getVersionDefines)(gl, glslVersion, !isVertex)}
${getApplicationDefines(allDefines)}
${isVertex ? '' : FRAGMENT_SHADER_PROLOGUE}
` : `${versionLine}
`;
  const hookFunctionMap = normalizeHookFunctions(hookFunctions);
  const hookInjections = {};
  const declInjections = {};
  const mainInjections = {};

  for (const key in inject) {
    const injection = typeof inject[key] === 'string' ? {
      injection: inject[key],
      order: 0
    } : inject[key];
    const match = key.match(/^(v|f)s:(#)?([\w-]+)$/);

    if (match) {
      const hash = match[2];
      const name = match[3];

      if (hash) {
        if (name === 'decl') {
          declInjections[key] = [injection];
        } else {
          mainInjections[key] = [injection];
        }
      } else {
        hookInjections[key] = [injection];
      }
    } else {
      mainInjections[key] = [injection];
    }
  }

  for (const module of modules) {
    if (log) {
      module.checkDeprecations(coreSource, log);
    }

    const moduleSource = module.getModuleSource(type, glslVersion);
    assembledSource += moduleSource;
    const injections = module.injections[type];

    for (const key in injections) {
      const match = key.match(/^(v|f)s:#([\w-]+)$/);

      if (match) {
        const name = match[2];
        const injectionType = name === 'decl' ? declInjections : mainInjections;
        injectionType[key] = injectionType[key] || [];
        injectionType[key].push(injections[key]);
      } else {
        hookInjections[key] = hookInjections[key] || [];
        hookInjections[key].push(injections[key]);
      }
    }
  }

  assembledSource += INJECT_SHADER_DECLARATIONS;
  assembledSource = (0,_inject_shader__WEBPACK_IMPORTED_MODULE_0__["default"])(assembledSource, type, declInjections);
  assembledSource += getHookFunctions(hookFunctionMap[type], hookInjections);
  assembledSource += coreSource;
  assembledSource = (0,_inject_shader__WEBPACK_IMPORTED_MODULE_0__["default"])(assembledSource, type, mainInjections);
  assembledSource = (0,_transpile_shader__WEBPACK_IMPORTED_MODULE_5__["default"])(assembledSource, transpileToGLSL100 ? 100 : glslVersion, isVertex);
  return assembledSource;
}

function assembleGetUniforms(modules) {
  return function getUniforms(opts) {
    const uniforms = {};

    for (const module of modules) {
      const moduleUniforms = module.getUniforms(opts, uniforms);
      Object.assign(uniforms, moduleUniforms);
    }

    return uniforms;
  };
}

function getShaderType({
  type
}) {
  return `
#define SHADER_TYPE_${SHADER_TYPE[type].toUpperCase()}
`;
}

function getShaderName({
  id,
  source,
  type
}) {
  const injectShaderName = id && typeof id === 'string' && source.indexOf('SHADER_NAME') === -1;
  return injectShaderName ? `
#define SHADER_NAME ${id}_${SHADER_TYPE[type]}

` : '';
}

function getApplicationDefines(defines = {}) {
  let count = 0;
  let sourceText = '';

  for (const define in defines) {
    if (count === 0) {
      sourceText += '\n// APPLICATION DEFINES\n';
    }

    count++;
    const value = defines[define];

    if (value || Number.isFinite(value)) {
      sourceText += `#define ${define.toUpperCase()} ${defines[define]}\n`;
    }
  }

  if (count === 0) {
    sourceText += '\n';
  }

  return sourceText;
}

function getHookFunctions(hookFunctions, hookInjections) {
  let result = '';

  for (const hookName in hookFunctions) {
    const hookFunction = hookFunctions[hookName];
    result += `void ${hookFunction.signature} {\n`;

    if (hookFunction.header) {
      result += `  ${hookFunction.header}`;
    }

    if (hookInjections[hookName]) {
      const injections = hookInjections[hookName];
      injections.sort((a, b) => a.order - b.order);

      for (const injection of injections) {
        result += `  ${injection.injection}\n`;
      }
    }

    if (hookFunction.footer) {
      result += `  ${hookFunction.footer}`;
    }

    result += '}\n';
  }

  return result;
}

function normalizeHookFunctions(hookFunctions) {
  const result = {
    vs: {},
    fs: {}
  };
  hookFunctions.forEach(hook => {
    let opts;

    if (typeof hook !== 'string') {
      opts = hook;
      hook = opts.hook;
    } else {
      opts = {};
    }

    hook = hook.trim();
    const [stage, signature] = hook.split(':');
    const name = hook.replace(/\(.+/, '');
    result[stage][name] = Object.assign(opts, {
      signature
    });
  });
  return result;
}
//# sourceMappingURL=assemble-shaders.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/shadertools/dist/esm/lib/constants.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@luma.gl/shadertools/dist/esm/lib/constants.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "VERTEX_SHADER": () => (/* binding */ VERTEX_SHADER),
/* harmony export */   "FRAGMENT_SHADER": () => (/* binding */ FRAGMENT_SHADER)
/* harmony export */ });
const VERTEX_SHADER = 'vs';
const FRAGMENT_SHADER = 'fs';
//# sourceMappingURL=constants.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/shadertools/dist/esm/lib/filters/prop-types.js":
/*!******************************************************************************!*\
  !*** ./node_modules/@luma.gl/shadertools/dist/esm/lib/filters/prop-types.js ***!
  \******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "parsePropTypes": () => (/* binding */ parsePropTypes)
/* harmony export */ });
const TYPE_DEFINITIONS = {
  number: {
    validate(value, propType) {
      return Number.isFinite(value) && (!('max' in propType) || value <= propType.max) && (!('min' in propType) || value >= propType.min);
    }

  },
  array: {
    validate(value, propType) {
      return Array.isArray(value) || ArrayBuffer.isView(value);
    }

  }
};
function parsePropTypes(propDefs) {
  const propTypes = {};

  for (const propName in propDefs) {
    const propDef = propDefs[propName];
    const propType = parsePropType(propDef);
    propTypes[propName] = propType;
  }

  return propTypes;
}

function parsePropType(propDef) {
  let type = getTypeOf(propDef);

  if (type === 'object') {
    if (!propDef) {
      return {
        type: 'object',
        value: null
      };
    }

    if ('type' in propDef) {
      return Object.assign({}, propDef, TYPE_DEFINITIONS[propDef.type]);
    }

    if (!('value' in propDef)) {
      return {
        type: 'object',
        value: propDef
      };
    }

    type = getTypeOf(propDef.value);
    return Object.assign({
      type
    }, propDef, TYPE_DEFINITIONS[type]);
  }

  return Object.assign({
    type,
    value: propDef
  }, TYPE_DEFINITIONS[type]);
}

function getTypeOf(value) {
  if (Array.isArray(value) || ArrayBuffer.isView(value)) {
    return 'array';
  }

  return typeof value;
}
//# sourceMappingURL=prop-types.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/shadertools/dist/esm/lib/inject-shader.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@luma.gl/shadertools/dist/esm/lib/inject-shader.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DECLARATION_INJECT_MARKER": () => (/* binding */ DECLARATION_INJECT_MARKER),
/* harmony export */   "default": () => (/* binding */ injectShader),
/* harmony export */   "combineInjects": () => (/* binding */ combineInjects)
/* harmony export */ });
/* harmony import */ var _modules_module_injectors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../modules/module-injectors */ "./node_modules/@luma.gl/shadertools/dist/esm/modules/module-injectors.js");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants */ "./node_modules/@luma.gl/shadertools/dist/esm/lib/constants.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils */ "./node_modules/@luma.gl/shadertools/dist/esm/utils/assert.js");



const MODULE_INJECTORS = {
  [_constants__WEBPACK_IMPORTED_MODULE_0__.VERTEX_SHADER]: _modules_module_injectors__WEBPACK_IMPORTED_MODULE_1__.MODULE_INJECTORS_VS,
  [_constants__WEBPACK_IMPORTED_MODULE_0__.FRAGMENT_SHADER]: _modules_module_injectors__WEBPACK_IMPORTED_MODULE_1__.MODULE_INJECTORS_FS
};
const DECLARATION_INJECT_MARKER = '__LUMA_INJECT_DECLARATIONS__';
const REGEX_START_OF_MAIN = /void\s+main\s*\([^)]*\)\s*\{\n?/;
const REGEX_END_OF_MAIN = /}\n?[^{}]*$/;
const fragments = [];
function injectShader(source, type, inject, injectStandardStubs = false) {
  const isVertex = type === _constants__WEBPACK_IMPORTED_MODULE_0__.VERTEX_SHADER;

  for (const key in inject) {
    const fragmentData = inject[key];
    fragmentData.sort((a, b) => a.order - b.order);
    fragments.length = fragmentData.length;

    for (let i = 0, len = fragmentData.length; i < len; ++i) {
      fragments[i] = fragmentData[i].injection;
    }

    const fragmentString = `${fragments.join('\n')}\n`;

    switch (key) {
      case 'vs:#decl':
        if (isVertex) {
          source = source.replace(DECLARATION_INJECT_MARKER, fragmentString);
        }

        break;

      case 'vs:#main-start':
        if (isVertex) {
          source = source.replace(REGEX_START_OF_MAIN, match => match + fragmentString);
        }

        break;

      case 'vs:#main-end':
        if (isVertex) {
          source = source.replace(REGEX_END_OF_MAIN, match => fragmentString + match);
        }

        break;

      case 'fs:#decl':
        if (!isVertex) {
          source = source.replace(DECLARATION_INJECT_MARKER, fragmentString);
        }

        break;

      case 'fs:#main-start':
        if (!isVertex) {
          source = source.replace(REGEX_START_OF_MAIN, match => match + fragmentString);
        }

        break;

      case 'fs:#main-end':
        if (!isVertex) {
          source = source.replace(REGEX_END_OF_MAIN, match => fragmentString + match);
        }

        break;

      default:
        source = source.replace(key, match => match + fragmentString);
    }
  }

  source = source.replace(DECLARATION_INJECT_MARKER, '');

  if (injectStandardStubs) {
    source = source.replace(/\}\s*$/, match => match + MODULE_INJECTORS[type]);
  }

  return source;
}
function combineInjects(injects) {
  const result = {};
  (0,_utils__WEBPACK_IMPORTED_MODULE_2__["default"])(Array.isArray(injects) && injects.length > 1);
  injects.forEach(inject => {
    for (const key in inject) {
      result[key] = result[key] ? `${result[key]}\n${inject[key]}` : inject[key];
    }
  });
  return result;
}
//# sourceMappingURL=inject-shader.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/shadertools/dist/esm/lib/platform-defines.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@luma.gl/shadertools/dist/esm/lib/platform-defines.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getPlatformShaderDefines": () => (/* binding */ getPlatformShaderDefines),
/* harmony export */   "getVersionDefines": () => (/* binding */ getVersionDefines)
/* harmony export */ });
/* harmony import */ var _utils_webgl_info__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/webgl-info */ "./node_modules/@luma.gl/shadertools/dist/esm/utils/webgl-info.js");

function getPlatformShaderDefines(gl) {
  const debugInfo = (0,_utils_webgl_info__WEBPACK_IMPORTED_MODULE_0__.getContextInfo)(gl);

  switch (debugInfo.gpuVendor.toLowerCase()) {
    case 'nvidia':
      return `\
#define NVIDIA_GPU
// Nvidia optimizes away the calculation necessary for emulated fp64
#define LUMA_FP64_CODE_ELIMINATION_WORKAROUND 1
`;

    case 'intel':
      return `\
#define INTEL_GPU
// Intel optimizes away the calculation necessary for emulated fp64
#define LUMA_FP64_CODE_ELIMINATION_WORKAROUND 1
// Intel's built-in 'tan' function doesn't have acceptable precision
#define LUMA_FP32_TAN_PRECISION_WORKAROUND 1
// Intel GPU doesn't have full 32 bits precision in same cases, causes overflow
#define LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND 1
`;

    case 'amd':
      return `\
#define AMD_GPU
`;

    default:
      return `\
#define DEFAULT_GPU
// Prevent driver from optimizing away the calculation necessary for emulated fp64
#define LUMA_FP64_CODE_ELIMINATION_WORKAROUND 1
// Intel's built-in 'tan' function doesn't have acceptable precision
#define LUMA_FP32_TAN_PRECISION_WORKAROUND 1
// Intel GPU doesn't have full 32 bits precision in same cases, causes overflow
#define LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND 1
`;
  }
}
function getVersionDefines(gl, glslVersion, isFragment) {
  let versionDefines = `\
#if (__VERSION__ > 120)

# define FEATURE_GLSL_DERIVATIVES
# define FEATURE_GLSL_DRAW_BUFFERS
# define FEATURE_GLSL_FRAG_DEPTH
# define FEATURE_GLSL_TEXTURE_LOD

// DEPRECATED FLAGS, remove in v9
# define FRAG_DEPTH
# define DERIVATIVES
# define DRAW_BUFFERS
# define TEXTURE_LOD

#endif // __VERSION
`;

  if ((0,_utils_webgl_info__WEBPACK_IMPORTED_MODULE_0__.hasFeatures)(gl, _utils_webgl_info__WEBPACK_IMPORTED_MODULE_0__.FEATURES.GLSL_FRAG_DEPTH)) {
    versionDefines += `\

// FRAG_DEPTH => gl_FragDepth is available
#ifdef GL_EXT_frag_depth
#extension GL_EXT_frag_depth : enable
# define FEATURE_GLSL_FRAG_DEPTH
# define FRAG_DEPTH
# define gl_FragDepth gl_FragDepthEXT
#endif
`;
  }

  if ((0,_utils_webgl_info__WEBPACK_IMPORTED_MODULE_0__.hasFeatures)(gl, _utils_webgl_info__WEBPACK_IMPORTED_MODULE_0__.FEATURES.GLSL_DERIVATIVES) && (0,_utils_webgl_info__WEBPACK_IMPORTED_MODULE_0__.canCompileGLGSExtension)(gl, _utils_webgl_info__WEBPACK_IMPORTED_MODULE_0__.FEATURES.GLSL_DERIVATIVES)) {
    versionDefines += `\

// DERIVATIVES => dxdF, dxdY and fwidth are available
#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
# define FEATURE_GLSL_DERIVATIVES
# define DERIVATIVES
#endif
`;
  }

  if ((0,_utils_webgl_info__WEBPACK_IMPORTED_MODULE_0__.hasFeatures)(gl, _utils_webgl_info__WEBPACK_IMPORTED_MODULE_0__.FEATURES.GLSL_FRAG_DATA) && (0,_utils_webgl_info__WEBPACK_IMPORTED_MODULE_0__.canCompileGLGSExtension)(gl, _utils_webgl_info__WEBPACK_IMPORTED_MODULE_0__.FEATURES.GLSL_FRAG_DATA, {
    behavior: 'require'
  })) {
    versionDefines += `\

// DRAW_BUFFERS => gl_FragData[] is available
#ifdef GL_EXT_draw_buffers
#extension GL_EXT_draw_buffers : require
#define FEATURE_GLSL_DRAW_BUFFERS
#define DRAW_BUFFERS
#endif
`;
  }

  if ((0,_utils_webgl_info__WEBPACK_IMPORTED_MODULE_0__.hasFeatures)(gl, _utils_webgl_info__WEBPACK_IMPORTED_MODULE_0__.FEATURES.GLSL_TEXTURE_LOD)) {
    versionDefines += `\
// TEXTURE_LOD => texture2DLod etc are available
#ifdef GL_EXT_shader_texture_lod
#extension GL_EXT_shader_texture_lod : enable

# define FEATURE_GLSL_TEXTURE_LOD
# define TEXTURE_LOD

#endif
`;
  }

  return versionDefines;
}
//# sourceMappingURL=platform-defines.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/shadertools/dist/esm/lib/resolve-modules.js":
/*!***************************************************************************!*\
  !*** ./node_modules/@luma.gl/shadertools/dist/esm/lib/resolve-modules.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "resolveModules": () => (/* binding */ resolveModules),
/* harmony export */   "TEST_EXPORTS": () => (/* binding */ TEST_EXPORTS)
/* harmony export */ });
/* harmony import */ var _shader_module__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./shader-module */ "./node_modules/@luma.gl/shadertools/dist/esm/lib/shader-module.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils */ "./node_modules/@luma.gl/shadertools/dist/esm/utils/assert.js");


function resolveModules(modules) {
  return getShaderDependencies(instantiateModules(modules));
}

function getShaderDependencies(modules) {
  const moduleMap = {};
  const moduleDepth = {};
  getDependencyGraph({
    modules,
    level: 0,
    moduleMap,
    moduleDepth
  });
  return Object.keys(moduleDepth).sort((a, b) => moduleDepth[b] - moduleDepth[a]).map(name => moduleMap[name]);
}

function getDependencyGraph({
  modules,
  level,
  moduleMap,
  moduleDepth
}) {
  if (level >= 5) {
    throw new Error('Possible loop in shader dependency graph');
  }

  for (const module of modules) {
    moduleMap[module.name] = module;

    if (moduleDepth[module.name] === undefined || moduleDepth[module.name] < level) {
      moduleDepth[module.name] = level;
    }
  }

  for (const module of modules) {
    if (module.dependencies) {
      getDependencyGraph({
        modules: module.dependencies,
        level: level + 1,
        moduleMap,
        moduleDepth
      });
    }
  }
}

function instantiateModules(modules, seen) {
  return modules.map(module => {
    if (module instanceof _shader_module__WEBPACK_IMPORTED_MODULE_0__["default"]) {
      return module;
    }

    (0,_utils__WEBPACK_IMPORTED_MODULE_1__["default"])(typeof module !== 'string', `Shader module use by name is deprecated. Import shader module '${module}' and use it directly.`);
    (0,_utils__WEBPACK_IMPORTED_MODULE_1__["default"])(module.name, 'shader module has no name');
    module = new _shader_module__WEBPACK_IMPORTED_MODULE_0__["default"](module);
    module.dependencies = instantiateModules(module.dependencies);
    return module;
  });
}

const TEST_EXPORTS = {
  getShaderDependencies,
  getDependencyGraph
};
//# sourceMappingURL=resolve-modules.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/shadertools/dist/esm/lib/shader-module.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@luma.gl/shadertools/dist/esm/lib/shader-module.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ShaderModule),
/* harmony export */   "normalizeShaderModule": () => (/* binding */ normalizeShaderModule)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils */ "./node_modules/@luma.gl/shadertools/dist/esm/utils/assert.js");
/* harmony import */ var _filters_prop_types__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./filters/prop-types */ "./node_modules/@luma.gl/shadertools/dist/esm/lib/filters/prop-types.js");


const VERTEX_SHADER = 'vs';
const FRAGMENT_SHADER = 'fs';
class ShaderModule {
  constructor({
    name,
    vs,
    fs,
    dependencies = [],
    uniforms,
    getUniforms,
    deprecations = [],
    defines = {},
    inject = {},
    vertexShader,
    fragmentShader
  }) {
    (0,_utils__WEBPACK_IMPORTED_MODULE_0__["default"])(typeof name === 'string');
    this.name = name;
    this.vs = vs || vertexShader;
    this.fs = fs || fragmentShader;
    this.getModuleUniforms = getUniforms;
    this.dependencies = dependencies;
    this.deprecations = this._parseDeprecationDefinitions(deprecations);
    this.defines = defines;
    this.injections = normalizeInjections(inject);

    if (uniforms) {
      this.uniforms = (0,_filters_prop_types__WEBPACK_IMPORTED_MODULE_1__.parsePropTypes)(uniforms);
    }
  }

  getModuleSource(type) {
    let moduleSource;

    switch (type) {
      case VERTEX_SHADER:
        moduleSource = this.vs || '';
        break;

      case FRAGMENT_SHADER:
        moduleSource = this.fs || '';
        break;

      default:
        (0,_utils__WEBPACK_IMPORTED_MODULE_0__["default"])(false);
    }

    return `\
#define MODULE_${this.name.toUpperCase().replace(/[^0-9a-z]/gi, '_')}
${moduleSource}\
// END MODULE_${this.name}

`;
  }

  getUniforms(opts, uniforms) {
    if (this.getModuleUniforms) {
      return this.getModuleUniforms(opts, uniforms);
    }

    if (this.uniforms) {
      return this._defaultGetUniforms(opts);
    }

    return {};
  }

  getDefines() {
    return this.defines;
  }

  checkDeprecations(shaderSource, log) {
    this.deprecations.forEach(def => {
      if (def.regex.test(shaderSource)) {
        if (def.deprecated) {
          log.deprecated(def.old, def.new)();
        } else {
          log.removed(def.old, def.new)();
        }
      }
    });
  }

  _parseDeprecationDefinitions(deprecations) {
    deprecations.forEach(def => {
      switch (def.type) {
        case 'function':
          def.regex = new RegExp(`\\b${def.old}\\(`);
          break;

        default:
          def.regex = new RegExp(`${def.type} ${def.old};`);
      }
    });
    return deprecations;
  }

  _defaultGetUniforms(opts = {}) {
    const uniforms = {};
    const propTypes = this.uniforms;

    for (const key in propTypes) {
      const propDef = propTypes[key];

      if (key in opts && !propDef.private) {
        if (propDef.validate) {
          (0,_utils__WEBPACK_IMPORTED_MODULE_0__["default"])(propDef.validate(opts[key], propDef), `${this.name}: invalid ${key}`);
        }

        uniforms[key] = opts[key];
      } else {
        uniforms[key] = propDef.value;
      }
    }

    return uniforms;
  }

}
function normalizeShaderModule(module) {
  if (!module.normalized) {
    module.normalized = true;

    if (module.uniforms && !module.getUniforms) {
      const shaderModule = new ShaderModule(module);
      module.getUniforms = shaderModule.getUniforms.bind(shaderModule);
    }
  }

  return module;
}

function normalizeInjections(injections) {
  const result = {
    vs: {},
    fs: {}
  };

  for (const hook in injections) {
    let injection = injections[hook];
    const stage = hook.slice(0, 2);

    if (typeof injection === 'string') {
      injection = {
        order: 0,
        injection
      };
    }

    result[stage][hook] = injection;
  }

  return result;
}
//# sourceMappingURL=shader-module.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/shadertools/dist/esm/lib/transpile-shader.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@luma.gl/shadertools/dist/esm/lib/transpile-shader.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ transpileShader)
/* harmony export */ });
function testVariable(qualifier) {
  return new RegExp(`\\b${qualifier}[ \\t]+(\\w+[ \\t]+\\w+(\\[\\w+\\])?;)`, 'g');
}

const ES300_REPLACEMENTS = [[/^(#version[ \t]+(100|300[ \t]+es))?[ \t]*\n/, '#version 300 es\n'], [/\btexture(2D|2DProj|Cube)Lod(EXT)?\(/g, 'textureLod('], [/\btexture(2D|2DProj|Cube)(EXT)?\(/g, 'texture(']];
const ES300_VERTEX_REPLACEMENTS = [...ES300_REPLACEMENTS, [testVariable('attribute'), 'in $1'], [testVariable('varying'), 'out $1']];
const ES300_FRAGMENT_REPLACEMENTS = [...ES300_REPLACEMENTS, [testVariable('varying'), 'in $1']];
const ES100_REPLACEMENTS = [[/^#version[ \t]+300[ \t]+es/, '#version 100'], [/\btexture(2D|2DProj|Cube)Lod\(/g, 'texture$1LodEXT('], [/\btexture\(/g, 'texture2D('], [/\btextureLod\(/g, 'texture2DLodEXT(']];
const ES100_VERTEX_REPLACEMENTS = [...ES100_REPLACEMENTS, [testVariable('in'), 'attribute $1'], [testVariable('out'), 'varying $1']];
const ES100_FRAGMENT_REPLACEMENTS = [...ES100_REPLACEMENTS, [testVariable('in'), 'varying $1']];
const ES100_FRAGMENT_OUTPUT_NAME = 'gl_FragColor';
const ES300_FRAGMENT_OUTPUT_REGEX = /\bout[ \t]+vec4[ \t]+(\w+)[ \t]*;\n?/;
const REGEX_START_OF_MAIN = /void\s+main\s*\([^)]*\)\s*\{\n?/;
function transpileShader(source, targetGLSLVersion, isVertex) {
  switch (targetGLSLVersion) {
    case 300:
      return isVertex ? convertShader(source, ES300_VERTEX_REPLACEMENTS) : convertFragmentShaderTo300(source);

    case 100:
      return isVertex ? convertShader(source, ES100_VERTEX_REPLACEMENTS) : convertFragmentShaderTo100(source);

    default:
      throw new Error(`unknown GLSL version ${targetGLSLVersion}`);
  }
}

function convertShader(source, replacements) {
  for (const [pattern, replacement] of replacements) {
    source = source.replace(pattern, replacement);
  }

  return source;
}

function convertFragmentShaderTo300(source) {
  source = convertShader(source, ES300_FRAGMENT_REPLACEMENTS);
  const outputMatch = source.match(ES300_FRAGMENT_OUTPUT_REGEX);

  if (outputMatch) {
    const outputName = outputMatch[1];
    source = source.replace(new RegExp(`\\b${ES100_FRAGMENT_OUTPUT_NAME}\\b`, 'g'), outputName);
  } else {
    const outputName = 'fragmentColor';
    source = source.replace(REGEX_START_OF_MAIN, match => `out vec4 ${outputName};\n${match}`).replace(new RegExp(`\\b${ES100_FRAGMENT_OUTPUT_NAME}\\b`, 'g'), outputName);
  }

  return source;
}

function convertFragmentShaderTo100(source) {
  source = convertShader(source, ES100_FRAGMENT_REPLACEMENTS);
  const outputMatch = source.match(ES300_FRAGMENT_OUTPUT_REGEX);

  if (outputMatch) {
    const outputName = outputMatch[1];
    source = source.replace(ES300_FRAGMENT_OUTPUT_REGEX, '').replace(new RegExp(`\\b${outputName}\\b`, 'g'), ES100_FRAGMENT_OUTPUT_NAME);
  }

  return source;
}
//# sourceMappingURL=transpile-shader.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/shadertools/dist/esm/modules/module-injectors.js":
/*!********************************************************************************!*\
  !*** ./node_modules/@luma.gl/shadertools/dist/esm/modules/module-injectors.js ***!
  \********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "MODULE_INJECTORS_VS": () => (/* binding */ MODULE_INJECTORS_VS),
/* harmony export */   "MODULE_INJECTORS_FS": () => (/* binding */ MODULE_INJECTORS_FS)
/* harmony export */ });
const MODULE_INJECTORS_VS = `\
#ifdef MODULE_LOGDEPTH
  logdepth_adjustPosition(gl_Position);
#endif
`;
const MODULE_INJECTORS_FS = `\
#ifdef MODULE_MATERIAL
  gl_FragColor = material_filterColor(gl_FragColor);
#endif

#ifdef MODULE_LIGHTING
  gl_FragColor = lighting_filterColor(gl_FragColor);
#endif

#ifdef MODULE_FOG
  gl_FragColor = fog_filterColor(gl_FragColor);
#endif

#ifdef MODULE_PICKING
  gl_FragColor = picking_filterHighlightColor(gl_FragColor);
  gl_FragColor = picking_filterPickingColor(gl_FragColor);
#endif

#ifdef MODULE_LOGDEPTH
  logdepth_setFragDepth();
#endif
`;
//# sourceMappingURL=module-injectors.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/shadertools/dist/esm/modules/transform/transform.js":
/*!***********************************************************************************!*\
  !*** ./node_modules/@luma.gl/shadertools/dist/esm/modules/transform/transform.js ***!
  \***********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "transform": () => (/* binding */ transform)
/* harmony export */ });
const vs = `\
attribute float transform_elementID;
vec2 transform_getPixelSizeHalf(vec2 size) {
  return vec2(1.) / (2. * size);
}

vec2 transform_getPixelIndices(vec2 texSize, vec2 pixelSizeHalf) {
  float yIndex = floor((transform_elementID / texSize[0]) + pixelSizeHalf[1]);
  float xIndex = transform_elementID - (yIndex * texSize[0]);
  return vec2(xIndex, yIndex);
}
vec2 transform_getTexCoord(vec2 size) {
  vec2 pixelSizeHalf = transform_getPixelSizeHalf(size);
  vec2 indices = transform_getPixelIndices(size, pixelSizeHalf);
  vec2 coord = indices / size + pixelSizeHalf;
  return coord;
}
vec2 transform_getPos(vec2 size) {
  vec2 texCoord = transform_getTexCoord(size);
  vec2 pos = (texCoord * (2.0, 2.0)) - (1., 1.);
  return pos;
}
vec4 transform_getInput(sampler2D texSampler, vec2 size) {
  vec2 texCoord = transform_getTexCoord(size);
  vec4 textureColor = texture2D(texSampler, texCoord);
  return textureColor;
}
`;
const transform = {
  name: 'transform',
  vs,
  fs: null
};
//# sourceMappingURL=transform.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/shadertools/dist/esm/utils/assert.js":
/*!********************************************************************!*\
  !*** ./node_modules/@luma.gl/shadertools/dist/esm/utils/assert.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ assert)
/* harmony export */ });
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'shadertools: assertion failed.');
  }
}
//# sourceMappingURL=assert.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/shadertools/dist/esm/utils/is-old-ie.js":
/*!***********************************************************************!*\
  !*** ./node_modules/@luma.gl/shadertools/dist/esm/utils/is-old-ie.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ isOldIE)
/* harmony export */ });
function isOldIE(opts = {}) {
  const navigator = typeof window !== 'undefined' ? window.navigator || {} : {};
  const userAgent = opts.userAgent || navigator.userAgent || '';
  const isMSIE = userAgent.indexOf('MSIE ') !== -1;
  const isTrident = userAgent.indexOf('Trident/') !== -1;
  return isMSIE || isTrident;
}
//# sourceMappingURL=is-old-ie.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/shadertools/dist/esm/utils/shader-utils.js":
/*!**************************************************************************!*\
  !*** ./node_modules/@luma.gl/shadertools/dist/esm/utils/shader-utils.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getQualifierDetails": () => (/* binding */ getQualifierDetails),
/* harmony export */   "getPassthroughFS": () => (/* binding */ getPassthroughFS),
/* harmony export */   "typeToChannelSuffix": () => (/* binding */ typeToChannelSuffix),
/* harmony export */   "typeToChannelCount": () => (/* binding */ typeToChannelCount),
/* harmony export */   "convertToVec4": () => (/* binding */ convertToVec4)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils */ "./node_modules/@luma.gl/shadertools/dist/esm/utils/assert.js");

const FS100 = `void main() {gl_FragColor = vec4(0);}`;
const FS_GLES = `\
out vec4 transform_output;
void main() {
  transform_output = vec4(0);
}`;
const FS300 = `#version 300 es\n${FS_GLES}`;
function getQualifierDetails(line, qualifiers) {
  qualifiers = Array.isArray(qualifiers) ? qualifiers : [qualifiers];
  const words = line.replace(/^\s+/, '').split(/\s+/);
  const [qualifier, type, definition] = words;

  if (!qualifiers.includes(qualifier) || !type || !definition) {
    return null;
  }

  const name = definition.split(';')[0];
  return {
    qualifier,
    type,
    name
  };
}
function getPassthroughFS(options = {}) {
  const {
    version = 100,
    input,
    inputType,
    output
  } = options;

  if (!input) {
    if (version === 300) {
      return FS300;
    } else if (version > 300) {
      return `#version ${version}\n${FS_GLES}`;
    }

    return FS100;
  }

  const outputValue = convertToVec4(input, inputType);

  if (version >= 300) {
    return `\
#version ${version} ${version === 300 ? 'es' : ''}
in ${inputType} ${input};
out vec4 ${output};
void main() {
  ${output} = ${outputValue};
}`;
  }

  return `\
varying ${inputType} ${input};
void main() {
  gl_FragColor = ${outputValue};
}`;
}
function typeToChannelSuffix(type) {
  switch (type) {
    case 'float':
      return 'x';

    case 'vec2':
      return 'xy';

    case 'vec3':
      return 'xyz';

    case 'vec4':
      return 'xyzw';

    default:
      (0,_utils__WEBPACK_IMPORTED_MODULE_0__["default"])(false);
      return null;
  }
}
function typeToChannelCount(type) {
  switch (type) {
    case 'float':
      return 1;

    case 'vec2':
      return 2;

    case 'vec3':
      return 3;

    case 'vec4':
      return 4;

    default:
      (0,_utils__WEBPACK_IMPORTED_MODULE_0__["default"])(false);
      return null;
  }
}
function convertToVec4(variable, type) {
  switch (type) {
    case 'float':
      return `vec4(${variable}, 0.0, 0.0, 1.0)`;

    case 'vec2':
      return `vec4(${variable}, 0.0, 1.0)`;

    case 'vec3':
      return `vec4(${variable}, 1.0)`;

    case 'vec4':
      return variable;

    default:
      (0,_utils__WEBPACK_IMPORTED_MODULE_0__["default"])(false);
      return null;
  }
}
//# sourceMappingURL=shader-utils.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/shadertools/dist/esm/utils/webgl-info.js":
/*!************************************************************************!*\
  !*** ./node_modules/@luma.gl/shadertools/dist/esm/utils/webgl-info.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "FEATURES": () => (/* binding */ FEATURES),
/* harmony export */   "getContextInfo": () => (/* binding */ getContextInfo),
/* harmony export */   "canCompileGLGSExtension": () => (/* binding */ canCompileGLGSExtension),
/* harmony export */   "hasFeatures": () => (/* binding */ hasFeatures)
/* harmony export */ });
/* harmony import */ var _is_old_ie__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./is-old-ie */ "./node_modules/@luma.gl/shadertools/dist/esm/utils/is-old-ie.js");
/* harmony import */ var _assert__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./assert */ "./node_modules/@luma.gl/shadertools/dist/esm/utils/assert.js");


const GL_VENDOR = 0x1f00;
const GL_RENDERER = 0x1f01;
const GL_VERSION = 0x1f02;
const GL_SHADING_LANGUAGE_VERSION = 0x8b8c;
const WEBGL_FEATURES = {
  GLSL_FRAG_DATA: ['WEBGL_draw_buffers', true],
  GLSL_FRAG_DEPTH: ['EXT_frag_depth', true],
  GLSL_DERIVATIVES: ['OES_standard_derivatives', true],
  GLSL_TEXTURE_LOD: ['EXT_shader_texture_lod', true]
};
const FEATURES = {};
Object.keys(WEBGL_FEATURES).forEach(key => {
  FEATURES[key] = key;
});


function isWebGL2(gl) {
  if (typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext) {
    return true;
  }

  return Boolean(gl && gl._version === 2);
}

function getContextInfo(gl) {
  const info = gl.getExtension('WEBGL_debug_renderer_info');
  const vendor = gl.getParameter(info && info.UNMASKED_VENDOR_WEBGL || GL_VENDOR);
  const renderer = gl.getParameter(info && info.UNMASKED_RENDERER_WEBGL || GL_RENDERER);
  const gpuVendor = identifyGPUVendor(vendor, renderer);
  const gpuInfo = {
    gpuVendor,
    vendor,
    renderer,
    version: gl.getParameter(GL_VERSION),
    shadingLanguageVersion: gl.getParameter(GL_SHADING_LANGUAGE_VERSION)
  };
  return gpuInfo;
}

function identifyGPUVendor(vendor, renderer) {
  if (vendor.match(/NVIDIA/i) || renderer.match(/NVIDIA/i)) {
    return 'NVIDIA';
  }

  if (vendor.match(/INTEL/i) || renderer.match(/INTEL/i)) {
    return 'INTEL';
  }

  if (vendor.match(/AMD/i) || renderer.match(/AMD/i) || vendor.match(/ATI/i) || renderer.match(/ATI/i)) {
    return 'AMD';
  }

  return 'UNKNOWN GPU';
}

const compiledGlslExtensions = {};
function canCompileGLGSExtension(gl, cap, opts = {}) {
  const feature = WEBGL_FEATURES[cap];
  (0,_assert__WEBPACK_IMPORTED_MODULE_0__["default"])(feature, cap);

  if (!(0,_is_old_ie__WEBPACK_IMPORTED_MODULE_1__["default"])(opts)) {
    return true;
  }

  if (cap in compiledGlslExtensions) {
    return compiledGlslExtensions[cap];
  }

  const extensionName = feature[0];
  const behavior = opts.behavior || 'enable';
  const source = `#extension GL_${extensionName} : ${behavior}\nvoid main(void) {}`;
  const shader = gl.createShader(35633);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const canCompile = gl.getShaderParameter(shader, 35713);
  gl.deleteShader(shader);
  compiledGlslExtensions[cap] = canCompile;
  return canCompile;
}

function getFeature(gl, cap) {
  const feature = WEBGL_FEATURES[cap];
  (0,_assert__WEBPACK_IMPORTED_MODULE_0__["default"])(feature, cap);
  const extensionName = isWebGL2(gl) ? feature[1] || feature[0] : feature[0];
  const value = typeof extensionName === 'string' ? Boolean(gl.getExtension(extensionName)) : extensionName;
  (0,_assert__WEBPACK_IMPORTED_MODULE_0__["default"])(value === false || value === true);
  return value;
}

function hasFeatures(gl, features) {
  features = Array.isArray(features) ? features : [features];
  return features.every(feature => getFeature(gl, feature));
}
//# sourceMappingURL=webgl-info.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/accessor.js":
/*!******************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/accessor.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Accessor),
/* harmony export */   "DEFAULT_ACCESSOR_VALUES": () => (/* binding */ DEFAULT_ACCESSOR_VALUES)
/* harmony export */ });
/* harmony import */ var _webgl_utils_typed_array_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../webgl-utils/typed-array-utils */ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/typed-array-utils.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");
/* harmony import */ var _utils_check_props__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/check-props */ "./node_modules/@luma.gl/webgl/dist/esm/utils/check-props.js");



const DEFAULT_ACCESSOR_VALUES = {
  offset: 0,
  stride: 0,
  type: 5126,
  size: 1,
  divisor: 0,
  normalized: false,
  integer: false
};
const PROP_CHECKS = {
  deprecatedProps: {
    instanced: 'divisor',
    isInstanced: 'divisor'
  }
};
class Accessor {
  static getBytesPerElement(accessor) {
    const ArrayType = (0,_webgl_utils_typed_array_utils__WEBPACK_IMPORTED_MODULE_0__.getTypedArrayFromGLType)(accessor.type || 5126);
    return ArrayType.BYTES_PER_ELEMENT;
  }

  static getBytesPerVertex(accessor) {
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_1__.assert)(accessor.size);
    const ArrayType = (0,_webgl_utils_typed_array_utils__WEBPACK_IMPORTED_MODULE_0__.getTypedArrayFromGLType)(accessor.type || 5126);
    return ArrayType.BYTES_PER_ELEMENT * accessor.size;
  }

  static resolve(...accessors) {
    return new Accessor(...[DEFAULT_ACCESSOR_VALUES, ...accessors]);
  }

  constructor(...accessors) {
    accessors.forEach(accessor => this._assign(accessor));
    Object.freeze(this);
  }

  toString() {
    return JSON.stringify(this);
  }

  get BYTES_PER_ELEMENT() {
    return Accessor.getBytesPerElement(this);
  }

  get BYTES_PER_VERTEX() {
    return Accessor.getBytesPerVertex(this);
  }

  _assign(props = {}) {
    props = (0,_utils_check_props__WEBPACK_IMPORTED_MODULE_2__.checkProps)('Accessor', props, PROP_CHECKS);

    if (props.type !== undefined) {
      this.type = props.type;

      if (props.type === 5124 || props.type === 5125) {
        this.integer = true;
      }
    }

    if (props.size !== undefined) {
      this.size = props.size;
    }

    if (props.offset !== undefined) {
      this.offset = props.offset;
    }

    if (props.stride !== undefined) {
      this.stride = props.stride;
    }

    if (props.normalized !== undefined) {
      this.normalized = props.normalized;
    }

    if (props.integer !== undefined) {
      this.integer = props.integer;
    }

    if (props.divisor !== undefined) {
      this.divisor = props.divisor;
    }

    if (props.buffer !== undefined) {
      this.buffer = props.buffer;
    }

    if (props.index !== undefined) {
      if (typeof props.index === 'boolean') {
        this.index = props.index ? 1 : 0;
      } else {
        this.index = props.index;
      }
    }

    if (props.instanced !== undefined) {
      this.divisor = props.instanced ? 1 : 0;
    }

    if (props.isInstanced !== undefined) {
      this.divisor = props.isInstanced ? 1 : 0;
    }

    return this;
  }

}

//# sourceMappingURL=accessor.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/buffer.js":
/*!****************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/buffer.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Buffer)
/* harmony export */ });
/* harmony import */ var _resource__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./resource */ "./node_modules/@luma.gl/webgl/dist/esm/classes/resource.js");
/* harmony import */ var _accessor__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./accessor */ "./node_modules/@luma.gl/webgl/dist/esm/classes/accessor.js");
/* harmony import */ var _webgl_utils_typed_array_utils__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../webgl-utils/typed-array-utils */ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/typed-array-utils.js");
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");
/* harmony import */ var _utils_check_props__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/check-props */ "./node_modules/@luma.gl/webgl/dist/esm/utils/check-props.js");






const DEBUG_DATA_LENGTH = 10;
const DEPRECATED_PROPS = {
  offset: 'accessor.offset',
  stride: 'accessor.stride',
  type: 'accessor.type',
  size: 'accessor.size',
  divisor: 'accessor.divisor',
  normalized: 'accessor.normalized',
  integer: 'accessor.integer',
  instanced: 'accessor.divisor',
  isInstanced: 'accessor.divisor'
};
const PROP_CHECKS_INITIALIZE = {
  removedProps: {},
  replacedProps: {
    bytes: 'byteLength'
  },
  deprecatedProps: DEPRECATED_PROPS
};
const PROP_CHECKS_SET_PROPS = {
  removedProps: DEPRECATED_PROPS
};
class Buffer extends _resource__WEBPACK_IMPORTED_MODULE_1__["default"] {
  constructor(gl, props = {}) {
    super(gl, props);
    this.stubRemovedMethods('Buffer', 'v6.0', ['layout', 'setLayout', 'getIndexedParameter']);
    this.target = props.target || (this.gl.webgl2 ? 36662 : 34962);
    this.initialize(props);
    Object.seal(this);
  }

  getElementCount(accessor = this.accessor) {
    return Math.round(this.byteLength / _accessor__WEBPACK_IMPORTED_MODULE_2__["default"].getBytesPerElement(accessor));
  }

  getVertexCount(accessor = this.accessor) {
    return Math.round(this.byteLength / _accessor__WEBPACK_IMPORTED_MODULE_2__["default"].getBytesPerVertex(accessor));
  }

  initialize(props = {}) {
    if (ArrayBuffer.isView(props)) {
      props = {
        data: props
      };
    }

    if (Number.isFinite(props)) {
      props = {
        byteLength: props
      };
    }

    props = (0,_utils_check_props__WEBPACK_IMPORTED_MODULE_3__.checkProps)('Buffer', props, PROP_CHECKS_INITIALIZE);
    this.usage = props.usage || 35044;
    this.debugData = null;
    this.setAccessor(Object.assign({}, props, props.accessor));

    if (props.data) {
      this._setData(props.data, props.offset, props.byteLength);
    } else {
      this._setByteLength(props.byteLength || 0);
    }

    return this;
  }

  setProps(props) {
    props = (0,_utils_check_props__WEBPACK_IMPORTED_MODULE_3__.checkProps)('Buffer', props, PROP_CHECKS_SET_PROPS);

    if ('accessor' in props) {
      this.setAccessor(props.accessor);
    }

    return this;
  }

  setAccessor(accessor) {
    accessor = Object.assign({}, accessor);
    delete accessor.buffer;
    this.accessor = new _accessor__WEBPACK_IMPORTED_MODULE_2__["default"](accessor);
    return this;
  }

  reallocate(byteLength) {
    if (byteLength > this.byteLength) {
      this._setByteLength(byteLength);

      return true;
    }

    this.bytesUsed = byteLength;
    return false;
  }

  setData(props) {
    return this.initialize(props);
  }

  subData(props) {
    if (ArrayBuffer.isView(props)) {
      props = {
        data: props
      };
    }

    const {
      data,
      offset = 0,
      srcOffset = 0
    } = props;
    const byteLength = props.byteLength || props.length;
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_4__.assert)(data);
    const target = this.gl.webgl2 ? 36663 : this.target;
    this.gl.bindBuffer(target, this.handle);

    if (srcOffset !== 0 || byteLength !== undefined) {
      (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(this.gl);
      this.gl.bufferSubData(this.target, offset, data, srcOffset, byteLength);
    } else {
      this.gl.bufferSubData(target, offset, data);
    }

    this.gl.bindBuffer(target, null);
    this.debugData = null;

    this._inferType(data);

    return this;
  }

  copyData({
    sourceBuffer,
    readOffset = 0,
    writeOffset = 0,
    size
  }) {
    const {
      gl
    } = this;
    (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(gl);
    gl.bindBuffer(36662, sourceBuffer.handle);
    gl.bindBuffer(36663, this.handle);
    gl.copyBufferSubData(36662, 36663, readOffset, writeOffset, size);
    gl.bindBuffer(36662, null);
    gl.bindBuffer(36663, null);
    this.debugData = null;
    return this;
  }

  getData({
    dstData = null,
    srcByteOffset = 0,
    dstOffset = 0,
    length = 0
  } = {}) {
    (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(this.gl);
    const ArrayType = (0,_webgl_utils_typed_array_utils__WEBPACK_IMPORTED_MODULE_5__.getTypedArrayFromGLType)(this.accessor.type || 5126, {
      clamped: false
    });

    const sourceAvailableElementCount = this._getAvailableElementCount(srcByteOffset);

    const dstElementOffset = dstOffset;
    let dstAvailableElementCount;
    let dstElementCount;

    if (dstData) {
      dstElementCount = dstData.length;
      dstAvailableElementCount = dstElementCount - dstElementOffset;
    } else {
      dstAvailableElementCount = Math.min(sourceAvailableElementCount, length || sourceAvailableElementCount);
      dstElementCount = dstElementOffset + dstAvailableElementCount;
    }

    const copyElementCount = Math.min(sourceAvailableElementCount, dstAvailableElementCount);
    length = length || copyElementCount;
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_4__.assert)(length <= copyElementCount);
    dstData = dstData || new ArrayType(dstElementCount);
    this.gl.bindBuffer(36662, this.handle);
    this.gl.getBufferSubData(36662, srcByteOffset, dstData, dstOffset, length);
    this.gl.bindBuffer(36662, null);
    return dstData;
  }

  bind({
    target = this.target,
    index = this.accessor && this.accessor.index,
    offset = 0,
    size
  } = {}) {
    if (target === 35345 || target === 35982) {
      if (size !== undefined) {
        this.gl.bindBufferRange(target, index, this.handle, offset, size);
      } else {
        (0,_utils_assert__WEBPACK_IMPORTED_MODULE_4__.assert)(offset === 0);
        this.gl.bindBufferBase(target, index, this.handle);
      }
    } else {
      this.gl.bindBuffer(target, this.handle);
    }

    return this;
  }

  unbind({
    target = this.target,
    index = this.accessor && this.accessor.index
  } = {}) {
    const isIndexedBuffer = target === 35345 || target === 35982;

    if (isIndexedBuffer) {
      this.gl.bindBufferBase(target, index, null);
    } else {
      this.gl.bindBuffer(target, null);
    }

    return this;
  }

  getDebugData() {
    if (!this.debugData) {
      this.debugData = this.getData({
        length: Math.min(DEBUG_DATA_LENGTH, this.byteLength)
      });
      return {
        data: this.debugData,
        changed: true
      };
    }

    return {
      data: this.debugData,
      changed: false
    };
  }

  invalidateDebugData() {
    this.debugData = null;
  }

  _setData(data, offset = 0, byteLength = data.byteLength + offset) {
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_4__.assert)(ArrayBuffer.isView(data));

    this._trackDeallocatedMemory();

    const target = this._getTarget();

    this.gl.bindBuffer(target, this.handle);
    this.gl.bufferData(target, byteLength, this.usage);
    this.gl.bufferSubData(target, offset, data);
    this.gl.bindBuffer(target, null);
    this.debugData = data.slice(0, DEBUG_DATA_LENGTH);
    this.bytesUsed = byteLength;

    this._trackAllocatedMemory(byteLength);

    const type = (0,_webgl_utils_typed_array_utils__WEBPACK_IMPORTED_MODULE_5__.getGLTypeFromTypedArray)(data);
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_4__.assert)(type);
    this.setAccessor(new _accessor__WEBPACK_IMPORTED_MODULE_2__["default"](this.accessor, {
      type
    }));
    return this;
  }

  _setByteLength(byteLength, usage = this.usage) {
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_4__.assert)(byteLength >= 0);

    this._trackDeallocatedMemory();

    let data = byteLength;

    if (byteLength === 0) {
      data = new Float32Array(0);
    }

    const target = this._getTarget();

    this.gl.bindBuffer(target, this.handle);
    this.gl.bufferData(target, data, usage);
    this.gl.bindBuffer(target, null);
    this.usage = usage;
    this.debugData = null;
    this.bytesUsed = byteLength;

    this._trackAllocatedMemory(byteLength);

    return this;
  }

  _getTarget() {
    return this.gl.webgl2 ? 36663 : this.target;
  }

  _getAvailableElementCount(srcByteOffset) {
    const ArrayType = (0,_webgl_utils_typed_array_utils__WEBPACK_IMPORTED_MODULE_5__.getTypedArrayFromGLType)(this.accessor.type || 5126, {
      clamped: false
    });
    const sourceElementOffset = srcByteOffset / ArrayType.BYTES_PER_ELEMENT;
    return this.getElementCount() - sourceElementOffset;
  }

  _inferType(data) {
    if (!this.accessor.type) {
      this.setAccessor(new _accessor__WEBPACK_IMPORTED_MODULE_2__["default"](this.accessor, {
        type: (0,_webgl_utils_typed_array_utils__WEBPACK_IMPORTED_MODULE_5__.getGLTypeFromTypedArray)(data)
      }));
    }
  }

  _createHandle() {
    return this.gl.createBuffer();
  }

  _deleteHandle() {
    this.gl.deleteBuffer(this.handle);

    this._trackDeallocatedMemory();
  }

  _getParameter(pname) {
    this.gl.bindBuffer(this.target, this.handle);
    const value = this.gl.getBufferParameter(this.target, pname);
    this.gl.bindBuffer(this.target, null);
    return value;
  }

  get type() {
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.deprecated('Buffer.type', 'Buffer.accessor.type')();
    return this.accessor.type;
  }

  get bytes() {
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.deprecated('Buffer.bytes', 'Buffer.byteLength')();
    return this.byteLength;
  }

  setByteLength(byteLength) {
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.deprecated('setByteLength', 'reallocate')();
    return this.reallocate(byteLength);
  }

  updateAccessor(opts) {
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.deprecated('updateAccessor(...)', 'setAccessor(new Accessor(buffer.accessor, ...)')();
    this.accessor = new _accessor__WEBPACK_IMPORTED_MODULE_2__["default"](this.accessor, opts);
    return this;
  }

}
//# sourceMappingURL=buffer.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/clear.js":
/*!***************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/clear.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "clear": () => (/* binding */ clear),
/* harmony export */   "clearBuffer": () => (/* binding */ clearBuffer)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");


const GL_DEPTH_BUFFER_BIT = 0x00000100;
const GL_STENCIL_BUFFER_BIT = 0x00000400;
const GL_COLOR_BUFFER_BIT = 0x00004000;
const GL_COLOR = 0x1800;
const GL_DEPTH = 0x1801;
const GL_STENCIL = 0x1802;
const GL_DEPTH_STENCIL = 0x84f9;
const ERR_ARGUMENTS = 'clear: bad arguments';
function clear(gl, {
  framebuffer = null,
  color = null,
  depth = null,
  stencil = null
} = {}) {
  const parameters = {};

  if (framebuffer) {
    parameters.framebuffer = framebuffer;
  }

  let clearFlags = 0;

  if (color) {
    clearFlags |= GL_COLOR_BUFFER_BIT;

    if (color !== true) {
      parameters.clearColor = color;
    }
  }

  if (depth) {
    clearFlags |= GL_DEPTH_BUFFER_BIT;

    if (depth !== true) {
      parameters.clearDepth = depth;
    }
  }

  if (stencil) {
    clearFlags |= GL_STENCIL_BUFFER_BIT;

    if (depth !== true) {
      parameters.clearStencil = depth;
    }
  }

  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_1__.assert)(clearFlags !== 0, ERR_ARGUMENTS);
  (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.withParameters)(gl, parameters, () => {
    gl.clear(clearFlags);
  });
}
function clearBuffer(gl, {
  framebuffer = null,
  buffer = GL_COLOR,
  drawBuffer = 0,
  value = [0, 0, 0, 0]
} = {}) {
  (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(gl);
  (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.withParameters)(gl, {
    framebuffer
  }, () => {
    switch (buffer) {
      case GL_COLOR:
        switch (value.constructor) {
          case Int32Array:
            gl.clearBufferiv(buffer, drawBuffer, value);
            break;

          case Uint32Array:
            gl.clearBufferuiv(buffer, drawBuffer, value);
            break;

          case Float32Array:
          default:
            gl.clearBufferfv(buffer, drawBuffer, value);
        }

        break;

      case GL_DEPTH:
        gl.clearBufferfv(GL_DEPTH, 0, [value]);
        break;

      case GL_STENCIL:
        gl.clearBufferiv(GL_STENCIL, 0, [value]);
        break;

      case GL_DEPTH_STENCIL:
        const [depth, stencil] = value;
        gl.clearBufferfi(GL_DEPTH_STENCIL, 0, depth, stencil);
        break;

      default:
        (0,_utils_assert__WEBPACK_IMPORTED_MODULE_1__.assert)(false, ERR_ARGUMENTS);
    }
  });
}
//# sourceMappingURL=clear.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/copy-and-blit.js":
/*!***********************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/copy-and-blit.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "readPixelsToArray": () => (/* binding */ readPixelsToArray),
/* harmony export */   "readPixelsToBuffer": () => (/* binding */ readPixelsToBuffer),
/* harmony export */   "copyToDataUrl": () => (/* binding */ copyToDataUrl),
/* harmony export */   "copyToImage": () => (/* binding */ copyToImage),
/* harmony export */   "copyToTexture": () => (/* binding */ copyToTexture),
/* harmony export */   "blit": () => (/* binding */ blit)
/* harmony export */ });
/* harmony import */ var _buffer__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./buffer */ "./node_modules/@luma.gl/webgl/dist/esm/classes/buffer.js");
/* harmony import */ var _framebuffer__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./framebuffer */ "./node_modules/@luma.gl/webgl/dist/esm/classes/framebuffer.js");
/* harmony import */ var _texture__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./texture */ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture.js");
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _webgl_utils_typed_array_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../webgl-utils/typed-array-utils */ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/typed-array-utils.js");
/* harmony import */ var _webgl_utils_format_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../webgl-utils/format-utils */ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/format-utils.js");
/* harmony import */ var _webgl_utils_texture_utils__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../webgl-utils/texture-utils */ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/texture-utils.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");









function readPixelsToArray(source, options = {}) {
  const {
    sourceX = 0,
    sourceY = 0,
    sourceFormat = 6408
  } = options;
  let {
    sourceAttachment = 36064,
    target = null,
    sourceWidth,
    sourceHeight,
    sourceType
  } = options;
  const {
    framebuffer,
    deleteFramebuffer
  } = getFramebuffer(source);
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_1__.assert)(framebuffer);
  const {
    gl,
    handle,
    attachments
  } = framebuffer;
  sourceWidth = sourceWidth || framebuffer.width;
  sourceHeight = sourceHeight || framebuffer.height;

  if (sourceAttachment === 36064 && handle === null) {
    sourceAttachment = 1028;
  }

  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_1__.assert)(attachments[sourceAttachment]);
  sourceType = sourceType || attachments[sourceAttachment].type;
  target = getPixelArray(target, sourceType, sourceFormat, sourceWidth, sourceHeight);
  sourceType = sourceType || (0,_webgl_utils_typed_array_utils__WEBPACK_IMPORTED_MODULE_2__.getGLTypeFromTypedArray)(target);
  const prevHandle = gl.bindFramebuffer(36160, handle);
  gl.readPixels(sourceX, sourceY, sourceWidth, sourceHeight, sourceFormat, sourceType, target);
  gl.bindFramebuffer(36160, prevHandle || null);

  if (deleteFramebuffer) {
    framebuffer.delete();
  }

  return target;
}
function readPixelsToBuffer(source, {
  sourceX = 0,
  sourceY = 0,
  sourceFormat = 6408,
  target = null,
  targetByteOffset = 0,
  sourceWidth,
  sourceHeight,
  sourceType
}) {
  const {
    framebuffer,
    deleteFramebuffer
  } = getFramebuffer(source);
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_1__.assert)(framebuffer);
  sourceWidth = sourceWidth || framebuffer.width;
  sourceHeight = sourceHeight || framebuffer.height;
  const gl2 = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(framebuffer.gl);
  sourceType = sourceType || (target ? target.type : 5121);

  if (!target) {
    const components = (0,_webgl_utils_format_utils__WEBPACK_IMPORTED_MODULE_3__.glFormatToComponents)(sourceFormat);
    const byteCount = (0,_webgl_utils_format_utils__WEBPACK_IMPORTED_MODULE_3__.glTypeToBytes)(sourceType);
    const byteLength = targetByteOffset + sourceWidth * sourceHeight * components * byteCount;
    target = new _buffer__WEBPACK_IMPORTED_MODULE_4__["default"](gl2, {
      byteLength,
      accessor: {
        type: sourceType,
        size: components
      }
    });
  }

  target.bind({
    target: 35051
  });
  (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.withParameters)(gl2, {
    framebuffer
  }, () => {
    gl2.readPixels(sourceX, sourceY, sourceWidth, sourceHeight, sourceFormat, sourceType, targetByteOffset);
  });
  target.unbind({
    target: 35051
  });

  if (deleteFramebuffer) {
    framebuffer.delete();
  }

  return target;
}
function copyToDataUrl(source, {
  sourceAttachment = 36064,
  targetMaxHeight = Number.MAX_SAFE_INTEGER
} = {}) {
  let data = readPixelsToArray(source, {
    sourceAttachment
  });
  let {
    width,
    height
  } = source;

  while (height > targetMaxHeight) {
    ({
      data,
      width,
      height
    } = (0,_webgl_utils_typed_array_utils__WEBPACK_IMPORTED_MODULE_2__.scalePixels)({
      data,
      width,
      height
    }));
  }

  (0,_webgl_utils_typed_array_utils__WEBPACK_IMPORTED_MODULE_2__.flipRows)({
    data,
    width,
    height
  });
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  const imageData = context.createImageData(width, height);
  imageData.data.set(data);
  context.putImageData(imageData, 0, 0);
  return canvas.toDataURL();
}
function copyToImage(source, {
  sourceAttachment = 36064,
  targetImage = null
} = {}) {
  const dataUrl = copyToDataUrl(source, {
    sourceAttachment
  });
  targetImage = targetImage || new Image();
  targetImage.src = dataUrl;
  return targetImage;
}
function copyToTexture(source, target, options = {}) {
  const {
    sourceX = 0,
    sourceY = 0,
    targetMipmaplevel = 0,
    targetInternalFormat = 6408
  } = options;
  let {
    targetX,
    targetY,
    targetZ,
    width,
    height
  } = options;
  const {
    framebuffer,
    deleteFramebuffer
  } = getFramebuffer(source);
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_1__.assert)(framebuffer);
  const {
    gl,
    handle
  } = framebuffer;
  const isSubCopy = typeof targetX !== 'undefined' || typeof targetY !== 'undefined' || typeof targetZ !== 'undefined';
  targetX = targetX || 0;
  targetY = targetY || 0;
  targetZ = targetZ || 0;
  const prevHandle = gl.bindFramebuffer(36160, handle);
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_1__.assert)(target);
  let texture = null;

  if (target instanceof _texture__WEBPACK_IMPORTED_MODULE_5__["default"]) {
    texture = target;
    width = Number.isFinite(width) ? width : texture.width;
    height = Number.isFinite(height) ? height : texture.height;
    texture.bind(0);
    target = texture.target;
  }

  if (!isSubCopy) {
    gl.copyTexImage2D(target, targetMipmaplevel, targetInternalFormat, sourceX, sourceY, width, height, 0);
  } else {
    switch (target) {
      case 3553:
      case 34067:
        gl.copyTexSubImage2D(target, targetMipmaplevel, targetX, targetY, sourceX, sourceY, width, height);
        break;

      case 35866:
      case 32879:
        const gl2 = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(gl);
        gl2.copyTexSubImage3D(target, targetMipmaplevel, targetX, targetY, targetZ, sourceX, sourceY, width, height);
        break;

      default:
    }
  }

  if (texture) {
    texture.unbind();
  }

  gl.bindFramebuffer(36160, prevHandle || null);

  if (deleteFramebuffer) {
    framebuffer.delete();
  }

  return texture;
}
function blit(source, target, options = {}) {
  const {
    sourceX0 = 0,
    sourceY0 = 0,
    targetX0 = 0,
    targetY0 = 0,
    color = true,
    depth = false,
    stencil = false,
    filter = 9728
  } = options;
  let {
    sourceX1,
    sourceY1,
    targetX1,
    targetY1,
    sourceAttachment = 36064,
    mask = 0
  } = options;
  const {
    framebuffer: srcFramebuffer,
    deleteFramebuffer: deleteSrcFramebuffer
  } = getFramebuffer(source);
  const {
    framebuffer: dstFramebuffer,
    deleteFramebuffer: deleteDstFramebuffer
  } = getFramebuffer(target);
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_1__.assert)(srcFramebuffer);
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_1__.assert)(dstFramebuffer);
  const {
    gl,
    handle,
    width,
    height,
    readBuffer
  } = dstFramebuffer;
  const gl2 = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(gl);

  if (!srcFramebuffer.handle && sourceAttachment === 36064) {
    sourceAttachment = 1028;
  }

  if (color) {
    mask |= 16384;
  }

  if (depth) {
    mask |= 256;
  }

  if (stencil) {
    mask |= 1024;
  }

  if (deleteSrcFramebuffer || deleteDstFramebuffer) {
    if (mask & (256 | 1024)) {
      mask = 16384;
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.warn('Blitting from or into a Texture object, forcing mask to GL.COLOR_BUFFER_BIT')();
    }
  }

  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_1__.assert)(mask);
  sourceX1 = sourceX1 === undefined ? srcFramebuffer.width : sourceX1;
  sourceY1 = sourceY1 === undefined ? srcFramebuffer.height : sourceY1;
  targetX1 = targetX1 === undefined ? width : targetX1;
  targetY1 = targetY1 === undefined ? height : targetY1;
  const prevDrawHandle = gl.bindFramebuffer(36009, handle);
  const prevReadHandle = gl.bindFramebuffer(36008, srcFramebuffer.handle);
  gl2.readBuffer(sourceAttachment);
  gl2.blitFramebuffer(sourceX0, sourceY0, sourceX1, sourceY1, targetX0, targetY0, targetX1, targetY1, mask, filter);
  gl2.readBuffer(readBuffer);
  gl2.bindFramebuffer(36008, prevReadHandle || null);
  gl2.bindFramebuffer(36009, prevDrawHandle || null);

  if (deleteSrcFramebuffer) {
    srcFramebuffer.delete();
  }

  if (deleteDstFramebuffer) {
    dstFramebuffer.delete();
  }

  return dstFramebuffer;
}

function getFramebuffer(source) {
  if (!(source instanceof _framebuffer__WEBPACK_IMPORTED_MODULE_6__["default"])) {
    return {
      framebuffer: (0,_webgl_utils_texture_utils__WEBPACK_IMPORTED_MODULE_7__.toFramebuffer)(source),
      deleteFramebuffer: true
    };
  }

  return {
    framebuffer: source,
    deleteFramebuffer: false
  };
}

function getPixelArray(pixelArray, type, format, width, height) {
  if (pixelArray) {
    return pixelArray;
  }

  type = type || 5121;
  const ArrayType = (0,_webgl_utils_typed_array_utils__WEBPACK_IMPORTED_MODULE_2__.getTypedArrayFromGLType)(type, {
    clamped: false
  });
  const components = (0,_webgl_utils_format_utils__WEBPACK_IMPORTED_MODULE_3__.glFormatToComponents)(format);
  return new ArrayType(width * height * components);
}
//# sourceMappingURL=copy-and-blit.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/framebuffer.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/framebuffer.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Framebuffer),
/* harmony export */   "FRAMEBUFFER_ATTACHMENT_PARAMETERS": () => (/* binding */ FRAMEBUFFER_ATTACHMENT_PARAMETERS)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _resource__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./resource */ "./node_modules/@luma.gl/webgl/dist/esm/classes/resource.js");
/* harmony import */ var _texture_2d__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./texture-2d */ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture-2d.js");
/* harmony import */ var _renderbuffer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./renderbuffer */ "./node_modules/@luma.gl/webgl/dist/esm/classes/renderbuffer.js");
/* harmony import */ var _clear__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./clear */ "./node_modules/@luma.gl/webgl/dist/esm/classes/clear.js");
/* harmony import */ var _copy_and_blit_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./copy-and-blit.js */ "./node_modules/@luma.gl/webgl/dist/esm/classes/copy-and-blit.js");
/* harmony import */ var _features__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../features */ "./node_modules/@luma.gl/webgl/dist/esm/features/features.js");
/* harmony import */ var _webgl_utils_constants_to_keys__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../webgl-utils/constants-to-keys */ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/constants-to-keys.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");









const ERR_MULTIPLE_RENDERTARGETS = 'Multiple render targets not supported';
class Framebuffer extends _resource__WEBPACK_IMPORTED_MODULE_1__["default"] {
  static isSupported(gl, options = {}) {
    const {
      colorBufferFloat,
      colorBufferHalfFloat
    } = options;
    let supported = true;

    if (colorBufferFloat) {
      supported = Boolean(gl.getExtension('EXT_color_buffer_float') || gl.getExtension('WEBGL_color_buffer_float') || gl.getExtension('OES_texture_float'));
    }

    if (colorBufferHalfFloat) {
      supported = supported && Boolean(gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float'));
    }

    return supported;
  }

  static getDefaultFramebuffer(gl) {
    gl.luma = gl.luma || {};
    gl.luma.defaultFramebuffer = gl.luma.defaultFramebuffer || new Framebuffer(gl, {
      id: 'default-framebuffer',
      handle: null,
      attachments: {}
    });
    return gl.luma.defaultFramebuffer;
  }

  get MAX_COLOR_ATTACHMENTS() {
    const gl2 = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(this.gl);
    return gl2.getParameter(gl2.MAX_COLOR_ATTACHMENTS);
  }

  get MAX_DRAW_BUFFERS() {
    const gl2 = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(this.gl);
    return gl2.getParameter(gl2.MAX_DRAW_BUFFERS);
  }

  constructor(gl, opts = {}) {
    super(gl, opts);
    this.width = null;
    this.height = null;
    this.attachments = {};
    this.readBuffer = 36064;
    this.drawBuffers = [36064];
    this.ownResources = [];
    this.initialize(opts);
    Object.seal(this);
  }

  get color() {
    return this.attachments[36064] || null;
  }

  get texture() {
    return this.attachments[36064] || null;
  }

  get depth() {
    return this.attachments[36096] || this.attachments[33306] || null;
  }

  get stencil() {
    return this.attachments[36128] || this.attachments[33306] || null;
  }

  initialize({
    width = 1,
    height = 1,
    attachments = null,
    color = true,
    depth = true,
    stencil = false,
    check = true,
    readBuffer = undefined,
    drawBuffers = undefined
  }) {
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_2__.assert)(width >= 0 && height >= 0, 'Width and height need to be integers');
    this.width = width;
    this.height = height;

    if (attachments) {
      for (const attachment in attachments) {
        const target = attachments[attachment];
        const object = Array.isArray(target) ? target[0] : target;
        object.resize({
          width,
          height
        });
      }
    } else {
      attachments = this._createDefaultAttachments(color, depth, stencil, width, height);
    }

    this.update({
      clearAttachments: true,
      attachments,
      readBuffer,
      drawBuffers
    });

    if (attachments && check) {
      this.checkStatus();
    }
  }

  delete() {
    for (const resource of this.ownResources) {
      resource.delete();
    }

    super.delete();
    return this;
  }

  update({
    attachments = {},
    readBuffer,
    drawBuffers,
    clearAttachments = false,
    resizeAttachments = true
  }) {
    this.attach(attachments, {
      clearAttachments,
      resizeAttachments
    });
    const {
      gl
    } = this;
    const prevHandle = gl.bindFramebuffer(36160, this.handle);

    if (readBuffer) {
      this._setReadBuffer(readBuffer);
    }

    if (drawBuffers) {
      this._setDrawBuffers(drawBuffers);
    }

    gl.bindFramebuffer(36160, prevHandle || null);
    return this;
  }

  resize(options = {}) {
    let {
      width,
      height
    } = options;

    if (this.handle === null) {
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_2__.assert)(width === undefined && height === undefined);
      this.width = this.gl.drawingBufferWidth;
      this.height = this.gl.drawingBufferHeight;
      return this;
    }

    if (width === undefined) {
      width = this.gl.drawingBufferWidth;
    }

    if (height === undefined) {
      height = this.gl.drawingBufferHeight;
    }

    if (width !== this.width && height !== this.height) {
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.log(2, `Resizing framebuffer ${this.id} to ${width}x${height}`)();
    }

    for (const attachmentPoint in this.attachments) {
      this.attachments[attachmentPoint].resize({
        width,
        height
      });
    }

    this.width = width;
    this.height = height;
    return this;
  }

  attach(attachments, {
    clearAttachments = false,
    resizeAttachments = true
  } = {}) {
    const newAttachments = {};

    if (clearAttachments) {
      Object.keys(this.attachments).forEach(key => {
        newAttachments[key] = null;
      });
    }

    Object.assign(newAttachments, attachments);
    const prevHandle = this.gl.bindFramebuffer(36160, this.handle);

    for (const key in newAttachments) {
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_2__.assert)(key !== undefined, 'Misspelled framebuffer binding point?');
      const attachment = Number(key);
      const descriptor = newAttachments[attachment];
      let object = descriptor;

      if (!object) {
        this._unattach(attachment);
      } else if (object instanceof _renderbuffer__WEBPACK_IMPORTED_MODULE_3__["default"]) {
        this._attachRenderbuffer({
          attachment,
          renderbuffer: object
        });
      } else if (Array.isArray(descriptor)) {
        const [texture, layer = 0, level = 0] = descriptor;
        object = texture;

        this._attachTexture({
          attachment,
          texture,
          layer,
          level
        });
      } else {
        this._attachTexture({
          attachment,
          texture: object,
          layer: 0,
          level: 0
        });
      }

      if (resizeAttachments && object) {
        object.resize({
          width: this.width,
          height: this.height
        });
      }
    }

    this.gl.bindFramebuffer(36160, prevHandle || null);
    Object.assign(this.attachments, attachments);
    Object.keys(this.attachments).filter(key => !this.attachments[key]).forEach(key => {
      delete this.attachments[key];
    });
  }

  checkStatus() {
    const {
      gl
    } = this;
    const status = this.getStatus();

    if (status !== 36053) {
      throw new Error(_getFrameBufferStatus(status));
    }

    return this;
  }

  getStatus() {
    const {
      gl
    } = this;
    const prevHandle = gl.bindFramebuffer(36160, this.handle);
    const status = gl.checkFramebufferStatus(36160);
    gl.bindFramebuffer(36160, prevHandle || null);
    return status;
  }

  clear(options = {}) {
    const {
      color,
      depth,
      stencil,
      drawBuffers = []
    } = options;
    const prevHandle = this.gl.bindFramebuffer(36160, this.handle);

    if (color || depth || stencil) {
      (0,_clear__WEBPACK_IMPORTED_MODULE_4__.clear)(this.gl, {
        color,
        depth,
        stencil
      });
    }

    drawBuffers.forEach((value, drawBuffer) => {
      (0,_clear__WEBPACK_IMPORTED_MODULE_4__.clearBuffer)(this.gl, {
        drawBuffer,
        value
      });
    });
    this.gl.bindFramebuffer(36160, prevHandle || null);
    return this;
  }

  readPixels(opts = {}) {
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.error('Framebuffer.readPixels() is no logner supported, use readPixelsToArray(framebuffer)')();
    return null;
  }

  readPixelsToBuffer(opts = {}) {
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.error('Framebuffer.readPixelsToBuffer()is no logner supported, use readPixelsToBuffer(framebuffer)')();
    return null;
  }

  copyToDataUrl(opts = {}) {
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.error('Framebuffer.copyToDataUrl() is no logner supported, use copyToDataUrl(framebuffer)')();
    return null;
  }

  copyToImage(opts = {}) {
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.error('Framebuffer.copyToImage() is no logner supported, use copyToImage(framebuffer)')();
    return null;
  }

  copyToTexture(opts = {}) {
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.error('Framebuffer.copyToTexture({...}) is no logner supported, use copyToTexture(source, target, opts})')();
    return null;
  }

  blit(opts = {}) {
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.error('Framebuffer.blit({...}) is no logner supported, use blit(source, target, opts)')();
    return null;
  }

  invalidate({
    attachments = [],
    x = 0,
    y = 0,
    width,
    height
  }) {
    const gl2 = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(this.gl);
    const prevHandle = gl2.bindFramebuffer(36008, this.handle);
    const invalidateAll = x === 0 && y === 0 && width === undefined && height === undefined;

    if (invalidateAll) {
      gl2.invalidateFramebuffer(36008, attachments);
    } else {
      gl2.invalidateFramebuffer(36008, attachments, x, y, width, height);
    }

    gl2.bindFramebuffer(36008, prevHandle);
    return this;
  }

  getAttachmentParameter(attachment, pname, keys) {
    let value = this._getAttachmentParameterFallback(pname);

    if (value === null) {
      this.gl.bindFramebuffer(36160, this.handle);
      value = this.gl.getFramebufferAttachmentParameter(36160, attachment, pname);
      this.gl.bindFramebuffer(36160, null);
    }

    if (keys && value > 1000) {
      value = (0,_webgl_utils_constants_to_keys__WEBPACK_IMPORTED_MODULE_5__.getKey)(this.gl, value);
    }

    return value;
  }

  getAttachmentParameters(attachment = 36064, keys, parameters = this.constructor.ATTACHMENT_PARAMETERS || []) {
    const values = {};

    for (const pname of parameters) {
      const key = keys ? (0,_webgl_utils_constants_to_keys__WEBPACK_IMPORTED_MODULE_5__.getKey)(this.gl, pname) : pname;
      values[key] = this.getAttachmentParameter(attachment, pname, keys);
    }

    return values;
  }

  getParameters(keys = true) {
    const attachments = Object.keys(this.attachments);
    const parameters = {};

    for (const attachmentName of attachments) {
      const attachment = Number(attachmentName);
      const key = keys ? (0,_webgl_utils_constants_to_keys__WEBPACK_IMPORTED_MODULE_5__.getKey)(this.gl, attachment) : attachment;
      parameters[key] = this.getAttachmentParameters(attachment, keys);
    }

    return parameters;
  }

  show() {
    if (typeof window !== 'undefined') {
      window.open((0,_copy_and_blit_js__WEBPACK_IMPORTED_MODULE_6__.copyToDataUrl)(this), 'luma-debug-texture');
    }

    return this;
  }

  log(logLevel = 0, message = '') {
    if (logLevel > _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.level || typeof window === 'undefined') {
      return this;
    }

    message = message || `Framebuffer ${this.id}`;
    const image = (0,_copy_and_blit_js__WEBPACK_IMPORTED_MODULE_6__.copyToDataUrl)(this, {
      targetMaxHeight: 100
    });
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.image({
      logLevel,
      message,
      image
    }, message)();
    return this;
  }

  bind({
    target = 36160
  } = {}) {
    this.gl.bindFramebuffer(target, this.handle);
    return this;
  }

  unbind({
    target = 36160
  } = {}) {
    this.gl.bindFramebuffer(target, null);
    return this;
  }

  _createDefaultAttachments(color, depth, stencil, width, height) {
    let defaultAttachments = null;

    if (color) {
      defaultAttachments = defaultAttachments || {};
      defaultAttachments[36064] = new _texture_2d__WEBPACK_IMPORTED_MODULE_7__["default"](this.gl, {
        id: `${this.id}-color0`,
        pixels: null,
        format: 6408,
        type: 5121,
        width,
        height,
        mipmaps: false,
        parameters: {
          [10241]: 9729,
          [10240]: 9729,
          [10242]: 33071,
          [10243]: 33071
        }
      });
      this.ownResources.push(defaultAttachments[36064]);
    }

    if (depth && stencil) {
      defaultAttachments = defaultAttachments || {};
      defaultAttachments[33306] = new _renderbuffer__WEBPACK_IMPORTED_MODULE_3__["default"](this.gl, {
        id: `${this.id}-depth-stencil`,
        format: 35056,
        width,
        height: 111
      });
      this.ownResources.push(defaultAttachments[33306]);
    } else if (depth) {
      defaultAttachments = defaultAttachments || {};
      defaultAttachments[36096] = new _renderbuffer__WEBPACK_IMPORTED_MODULE_3__["default"](this.gl, {
        id: `${this.id}-depth`,
        format: 33189,
        width,
        height
      });
      this.ownResources.push(defaultAttachments[36096]);
    } else if (stencil) {
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_2__.assert)(false);
    }

    return defaultAttachments;
  }

  _unattach(attachment) {
    const oldAttachment = this.attachments[attachment];

    if (!oldAttachment) {
      return;
    }

    if (oldAttachment instanceof _renderbuffer__WEBPACK_IMPORTED_MODULE_3__["default"]) {
      this.gl.framebufferRenderbuffer(36160, attachment, 36161, null);
    } else {
      this.gl.framebufferTexture2D(36160, attachment, 3553, null, 0);
    }

    delete this.attachments[attachment];
  }

  _attachRenderbuffer({
    attachment = 36064,
    renderbuffer
  }) {
    const {
      gl
    } = this;
    gl.framebufferRenderbuffer(36160, attachment, 36161, renderbuffer.handle);
    this.attachments[attachment] = renderbuffer;
  }

  _attachTexture({
    attachment = 36064,
    texture,
    layer,
    level
  }) {
    const {
      gl
    } = this;
    gl.bindTexture(texture.target, texture.handle);

    switch (texture.target) {
      case 35866:
      case 32879:
        const gl2 = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(gl);
        gl2.framebufferTextureLayer(36160, attachment, texture.target, level, layer);
        break;

      case 34067:
        const face = mapIndexToCubeMapFace(layer);
        gl.framebufferTexture2D(36160, attachment, face, texture.handle, level);
        break;

      case 3553:
        gl.framebufferTexture2D(36160, attachment, 3553, texture.handle, level);
        break;

      default:
        (0,_utils_assert__WEBPACK_IMPORTED_MODULE_2__.assert)(false, 'Illegal texture type');
    }

    gl.bindTexture(texture.target, null);
    this.attachments[attachment] = texture;
  }

  _setReadBuffer(readBuffer) {
    const gl2 = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.getWebGL2Context)(this.gl);

    if (gl2) {
      gl2.readBuffer(readBuffer);
    } else {
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_2__.assert)(readBuffer === 36064 || readBuffer === 1029, ERR_MULTIPLE_RENDERTARGETS);
    }

    this.readBuffer = readBuffer;
  }

  _setDrawBuffers(drawBuffers) {
    const {
      gl
    } = this;
    const gl2 = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(gl);

    if (gl2) {
      gl2.drawBuffers(drawBuffers);
    } else {
      const ext = gl.getExtension('WEBGL_draw_buffers');

      if (ext) {
        ext.drawBuffersWEBGL(drawBuffers);
      } else {
        (0,_utils_assert__WEBPACK_IMPORTED_MODULE_2__.assert)(drawBuffers.length === 1 && (drawBuffers[0] === 36064 || drawBuffers[0] === 1029), ERR_MULTIPLE_RENDERTARGETS);
      }
    }

    this.drawBuffers = drawBuffers;
  }

  _getAttachmentParameterFallback(pname) {
    const caps = (0,_features__WEBPACK_IMPORTED_MODULE_8__.getFeatures)(this.gl);

    switch (pname) {
      case 36052:
        return !caps.WEBGL2 ? 0 : null;

      case 33298:
      case 33299:
      case 33300:
      case 33301:
      case 33302:
      case 33303:
        return !caps.WEBGL2 ? 8 : null;

      case 33297:
        return !caps.WEBGL2 ? 5125 : null;

      case 33296:
        return !caps.WEBGL2 && !caps.EXT_sRGB ? 9729 : null;

      default:
        return null;
    }
  }

  _createHandle() {
    return this.gl.createFramebuffer();
  }

  _deleteHandle() {
    this.gl.deleteFramebuffer(this.handle);
  }

  _bindHandle(handle) {
    return this.gl.bindFramebuffer(36160, handle);
  }

}

function mapIndexToCubeMapFace(layer) {
  return layer < 34069 ? layer + 34069 : layer;
}

function _getFrameBufferStatus(status) {
  const STATUS = Framebuffer.STATUS || {};
  return STATUS[status] || `Framebuffer error ${status}`;
}

const FRAMEBUFFER_ATTACHMENT_PARAMETERS = [36049, 36048, 33296, 33298, 33299, 33300, 33301, 33302, 33303];
Framebuffer.ATTACHMENT_PARAMETERS = FRAMEBUFFER_ATTACHMENT_PARAMETERS;
//# sourceMappingURL=framebuffer.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/program-configuration.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/program-configuration.js ***!
  \*******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ProgramConfiguration)
/* harmony export */ });
/* harmony import */ var _accessor__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./accessor */ "./node_modules/@luma.gl/webgl/dist/esm/classes/accessor.js");
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _webgl_utils_attribute_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../webgl-utils/attribute-utils */ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/attribute-utils.js");



class ProgramConfiguration {
  constructor(program) {
    this.id = program.id;
    this.attributeInfos = [];
    this.attributeInfosByName = {};
    this.attributeInfosByLocation = [];
    this.varyingInfos = [];
    this.varyingInfosByName = {};
    Object.seal(this);

    this._readAttributesFromProgram(program);

    this._readVaryingsFromProgram(program);
  }

  getAttributeInfo(locationOrName) {
    const location = Number(locationOrName);

    if (Number.isFinite(location)) {
      return this.attributeInfosByLocation[location];
    }

    return this.attributeInfosByName[locationOrName] || null;
  }

  getAttributeLocation(locationOrName) {
    const attributeInfo = this.getAttributeInfo(locationOrName);
    return attributeInfo ? attributeInfo.location : -1;
  }

  getAttributeAccessor(locationOrName) {
    const attributeInfo = this.getAttributeInfo(locationOrName);
    return attributeInfo ? attributeInfo.accessor : null;
  }

  getVaryingInfo(locationOrName) {
    const location = Number(locationOrName);

    if (Number.isFinite(location)) {
      return this.varyingInfos[location];
    }

    return this.varyingInfosByName[locationOrName] || null;
  }

  getVaryingIndex(locationOrName) {
    const varying = this.getVaryingInfo();
    return varying ? varying.location : -1;
  }

  getVaryingAccessor(locationOrName) {
    const varying = this.getVaryingInfo();
    return varying ? varying.accessor : null;
  }

  _readAttributesFromProgram(program) {
    const {
      gl
    } = program;
    const count = gl.getProgramParameter(program.handle, 35721);

    for (let index = 0; index < count; index++) {
      const {
        name,
        type,
        size
      } = gl.getActiveAttrib(program.handle, index);
      const location = gl.getAttribLocation(program.handle, name);

      if (location >= 0) {
        this._addAttribute(location, name, type, size);
      }
    }

    this.attributeInfos.sort((a, b) => a.location - b.location);
  }

  _readVaryingsFromProgram(program) {
    const {
      gl
    } = program;

    if (!(0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl)) {
      return;
    }

    const count = gl.getProgramParameter(program.handle, 35971);

    for (let location = 0; location < count; location++) {
      const {
        name,
        type,
        size
      } = gl.getTransformFeedbackVarying(program.handle, location);

      this._addVarying(location, name, type, size);
    }

    this.varyingInfos.sort((a, b) => a.location - b.location);
  }

  _addAttribute(location, name, compositeType, size) {
    const {
      type,
      components
    } = (0,_webgl_utils_attribute_utils__WEBPACK_IMPORTED_MODULE_1__.decomposeCompositeGLType)(compositeType);
    const accessor = {
      type,
      size: size * components
    };

    this._inferProperties(location, name, accessor);

    const attributeInfo = {
      location,
      name,
      accessor: new _accessor__WEBPACK_IMPORTED_MODULE_2__["default"](accessor)
    };
    this.attributeInfos.push(attributeInfo);
    this.attributeInfosByLocation[location] = attributeInfo;
    this.attributeInfosByName[attributeInfo.name] = attributeInfo;
  }

  _inferProperties(location, name, accessor) {
    if (/instance/i.test(name)) {
      accessor.divisor = 1;
    }
  }

  _addVarying(location, name, compositeType, size) {
    const {
      type,
      components
    } = (0,_webgl_utils_attribute_utils__WEBPACK_IMPORTED_MODULE_1__.decomposeCompositeGLType)(compositeType);
    const accessor = new _accessor__WEBPACK_IMPORTED_MODULE_2__["default"]({
      type,
      size: size * components
    });
    const varying = {
      location,
      name,
      accessor
    };
    this.varyingInfos.push(varying);
    this.varyingInfosByName[varying.name] = varying;
  }

}
//# sourceMappingURL=program-configuration.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/program.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/program.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Program)
/* harmony export */ });
/* harmony import */ var _resource__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./resource */ "./node_modules/@luma.gl/webgl/dist/esm/classes/resource.js");
/* harmony import */ var _texture__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./texture */ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture.js");
/* harmony import */ var _framebuffer__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./framebuffer */ "./node_modules/@luma.gl/webgl/dist/esm/classes/framebuffer.js");
/* harmony import */ var _uniforms__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./uniforms */ "./node_modules/@luma.gl/webgl/dist/esm/classes/uniforms.js");
/* harmony import */ var _shader__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./shader */ "./node_modules/@luma.gl/webgl/dist/esm/classes/shader.js");
/* harmony import */ var _program_configuration__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./program-configuration */ "./node_modules/@luma.gl/webgl/dist/esm/classes/program-configuration.js");
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _webgl_utils_constants_to_keys__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../webgl-utils/constants-to-keys */ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/constants-to-keys.js");
/* harmony import */ var _webgl_utils_attribute_utils__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../webgl-utils/attribute-utils */ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/attribute-utils.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");
/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../utils/utils */ "./node_modules/@luma.gl/webgl/dist/esm/utils/utils.js");












const LOG_PROGRAM_PERF_PRIORITY = 4;
const GL_SEPARATE_ATTRIBS = 0x8c8d;
const V6_DEPRECATED_METHODS = ['setVertexArray', 'setAttributes', 'setBuffers', 'unsetBuffers', 'use', 'getUniformCount', 'getUniformInfo', 'getUniformLocation', 'getUniformValue', 'getVarying', 'getFragDataLocation', 'getAttachedShaders', 'getAttributeCount', 'getAttributeLocation', 'getAttributeInfo'];
class Program extends _resource__WEBPACK_IMPORTED_MODULE_1__["default"] {
  constructor(gl, props = {}) {
    super(gl, props);
    this.stubRemovedMethods('Program', 'v6.0', V6_DEPRECATED_METHODS);
    this._isCached = false;
    this.initialize(props);
    Object.seal(this);

    this._setId(props.id);
  }

  initialize(props = {}) {
    const {
      hash,
      vs,
      fs,
      varyings,
      bufferMode = GL_SEPARATE_ATTRIBS
    } = props;
    this.hash = hash || '';
    this.vs = typeof vs === 'string' ? new _shader__WEBPACK_IMPORTED_MODULE_2__.VertexShader(this.gl, {
      id: `${props.id}-vs`,
      source: vs
    }) : vs;
    this.fs = typeof fs === 'string' ? new _shader__WEBPACK_IMPORTED_MODULE_2__.FragmentShader(this.gl, {
      id: `${props.id}-fs`,
      source: fs
    }) : fs;
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_3__.assert)(this.vs instanceof _shader__WEBPACK_IMPORTED_MODULE_2__.VertexShader);
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_3__.assert)(this.fs instanceof _shader__WEBPACK_IMPORTED_MODULE_2__.FragmentShader);
    this.uniforms = {};
    this._textureUniforms = {};

    if (varyings && varyings.length > 0) {
      (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(this.gl);
      this.varyings = varyings;
      this.gl2.transformFeedbackVaryings(this.handle, varyings, bufferMode);
    }

    this._compileAndLink();

    this._readUniformLocationsFromLinkedProgram();

    this.configuration = new _program_configuration__WEBPACK_IMPORTED_MODULE_4__["default"](this);
    return this.setProps(props);
  }

  delete(options = {}) {
    if (this._isCached) {
      return this;
    }

    return super.delete(options);
  }

  setProps(props) {
    if ('uniforms' in props) {
      this.setUniforms(props.uniforms);
    }

    return this;
  }

  draw({
    logPriority,
    drawMode = 4,
    vertexCount,
    offset = 0,
    start,
    end,
    isIndexed = false,
    indexType = 5123,
    instanceCount = 0,
    isInstanced = instanceCount > 0,
    vertexArray = null,
    transformFeedback,
    framebuffer,
    parameters = {},
    uniforms,
    samplers
  }) {
    if (uniforms || samplers) {
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.deprecated('Program.draw({uniforms})', 'Program.setUniforms(uniforms)')();
      this.setUniforms(uniforms || {});
    }

    if (_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.priority >= logPriority) {
      const fb = framebuffer ? framebuffer.id : 'default';
      const message = `mode=${(0,_webgl_utils_constants_to_keys__WEBPACK_IMPORTED_MODULE_5__.getKey)(this.gl, drawMode)} verts=${vertexCount} ` + `instances=${instanceCount} indexType=${(0,_webgl_utils_constants_to_keys__WEBPACK_IMPORTED_MODULE_5__.getKey)(this.gl, indexType)} ` + `isInstanced=${isInstanced} isIndexed=${isIndexed} ` + `Framebuffer=${fb}`;
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.log(logPriority, message)();
    }

    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_3__.assert)(vertexArray);
    this.gl.useProgram(this.handle);

    if (!this._areTexturesRenderable() || vertexCount === 0 || isInstanced && instanceCount === 0) {
      return false;
    }

    vertexArray.bindForDraw(vertexCount, instanceCount, () => {
      if (framebuffer !== undefined) {
        parameters = Object.assign({}, parameters, {
          framebuffer
        });
      }

      if (transformFeedback) {
        const primitiveMode = (0,_webgl_utils_attribute_utils__WEBPACK_IMPORTED_MODULE_6__.getPrimitiveDrawMode)(drawMode);
        transformFeedback.begin(primitiveMode);
      }

      this._bindTextures();

      (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.withParameters)(this.gl, parameters, () => {
        if (isIndexed && isInstanced) {
          this.gl2.drawElementsInstanced(drawMode, vertexCount, indexType, offset, instanceCount);
        } else if (isIndexed && (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(this.gl) && !isNaN(start) && !isNaN(end)) {
          this.gl2.drawRangeElements(drawMode, start, end, vertexCount, indexType, offset);
        } else if (isIndexed) {
          this.gl.drawElements(drawMode, vertexCount, indexType, offset);
        } else if (isInstanced) {
          this.gl2.drawArraysInstanced(drawMode, offset, vertexCount, instanceCount);
        } else {
          this.gl.drawArrays(drawMode, offset, vertexCount);
        }
      });

      if (transformFeedback) {
        transformFeedback.end();
      }
    });
    return true;
  }

  setUniforms(uniforms = {}) {
    if (_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.priority >= 2) {
      (0,_uniforms__WEBPACK_IMPORTED_MODULE_7__.checkUniformValues)(uniforms, this.id, this._uniformSetters);
    }

    this.gl.useProgram(this.handle);

    for (const uniformName in uniforms) {
      const uniform = uniforms[uniformName];
      const uniformSetter = this._uniformSetters[uniformName];

      if (uniformSetter) {
        let value = uniform;
        let textureUpdate = false;

        if (value instanceof _framebuffer__WEBPACK_IMPORTED_MODULE_8__["default"]) {
          value = value.texture;
        }

        if (value instanceof _texture__WEBPACK_IMPORTED_MODULE_9__["default"]) {
          textureUpdate = this.uniforms[uniformName] !== uniform;

          if (textureUpdate) {
            if (uniformSetter.textureIndex === undefined) {
              uniformSetter.textureIndex = this._textureIndexCounter++;
            }

            const texture = value;
            const {
              textureIndex
            } = uniformSetter;
            texture.bind(textureIndex);
            value = textureIndex;
            this._textureUniforms[uniformName] = texture;
          } else {
            value = uniformSetter.textureIndex;
          }
        } else if (this._textureUniforms[uniformName]) {
          delete this._textureUniforms[uniformName];
        }

        if (uniformSetter(value) || textureUpdate) {
          (0,_uniforms__WEBPACK_IMPORTED_MODULE_7__.copyUniform)(this.uniforms, uniformName, uniform);
        }
      }
    }

    return this;
  }

  _areTexturesRenderable() {
    let texturesRenderable = true;

    for (const uniformName in this._textureUniforms) {
      const texture = this._textureUniforms[uniformName];
      texture.update();
      texturesRenderable = texturesRenderable && texture.loaded;
    }

    return texturesRenderable;
  }

  _bindTextures() {
    for (const uniformName in this._textureUniforms) {
      const textureIndex = this._uniformSetters[uniformName].textureIndex;

      this._textureUniforms[uniformName].bind(textureIndex);
    }
  }

  _createHandle() {
    return this.gl.createProgram();
  }

  _deleteHandle() {
    this.gl.deleteProgram(this.handle);
  }

  _getOptionsFromHandle(handle) {
    const shaderHandles = this.gl.getAttachedShaders(handle);
    const opts = {};

    for (const shaderHandle of shaderHandles) {
      const type = this.gl.getShaderParameter(this.handle, 35663);

      switch (type) {
        case 35633:
          opts.vs = new _shader__WEBPACK_IMPORTED_MODULE_2__.VertexShader({
            handle: shaderHandle
          });
          break;

        case 35632:
          opts.fs = new _shader__WEBPACK_IMPORTED_MODULE_2__.FragmentShader({
            handle: shaderHandle
          });
          break;

        default:
      }
    }

    return opts;
  }

  _getParameter(pname) {
    return this.gl.getProgramParameter(this.handle, pname);
  }

  _setId(id) {
    if (!id) {
      const programName = this._getName();

      this.id = (0,_utils_utils__WEBPACK_IMPORTED_MODULE_10__.uid)(programName);
    }
  }

  _getName() {
    let programName = this.vs.getName() || this.fs.getName();
    programName = programName.replace(/shader/i, '');
    programName = programName ? `${programName}-program` : 'program';
    return programName;
  }

  _compileAndLink() {
    const {
      gl
    } = this;
    gl.attachShader(this.handle, this.vs.handle);
    gl.attachShader(this.handle, this.fs.handle);
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.time(LOG_PROGRAM_PERF_PRIORITY, `linkProgram for ${this._getName()}`)();
    gl.linkProgram(this.handle);
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.timeEnd(LOG_PROGRAM_PERF_PRIORITY, `linkProgram for ${this._getName()}`)();

    if (gl.debug || _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.level > 0) {
      const linked = gl.getProgramParameter(this.handle, 35714);

      if (!linked) {
        throw new Error(`Error linking: ${gl.getProgramInfoLog(this.handle)}`);
      }

      gl.validateProgram(this.handle);
      const validated = gl.getProgramParameter(this.handle, 35715);

      if (!validated) {
        throw new Error(`Error validating: ${gl.getProgramInfoLog(this.handle)}`);
      }
    }
  }

  _readUniformLocationsFromLinkedProgram() {
    const {
      gl
    } = this;
    this._uniformSetters = {};
    this._uniformCount = this._getParameter(35718);

    for (let i = 0; i < this._uniformCount; i++) {
      const info = this.gl.getActiveUniform(this.handle, i);
      const {
        name
      } = (0,_uniforms__WEBPACK_IMPORTED_MODULE_7__.parseUniformName)(info.name);
      let location = gl.getUniformLocation(this.handle, name);
      this._uniformSetters[name] = (0,_uniforms__WEBPACK_IMPORTED_MODULE_7__.getUniformSetter)(gl, location, info);

      if (info.size > 1) {
        for (let l = 0; l < info.size; l++) {
          location = gl.getUniformLocation(this.handle, `${name}[${l}]`);
          this._uniformSetters[`${name}[${l}]`] = (0,_uniforms__WEBPACK_IMPORTED_MODULE_7__.getUniformSetter)(gl, location, info);
        }
      }
    }

    this._textureIndexCounter = 0;
  }

  getActiveUniforms(uniformIndices, pname) {
    return this.gl2.getActiveUniforms(this.handle, uniformIndices, pname);
  }

  getUniformBlockIndex(blockName) {
    return this.gl2.getUniformBlockIndex(this.handle, blockName);
  }

  getActiveUniformBlockParameter(blockIndex, pname) {
    return this.gl2.getActiveUniformBlockParameter(this.handle, blockIndex, pname);
  }

  uniformBlockBinding(blockIndex, blockBinding) {
    this.gl2.uniformBlockBinding(this.handle, blockIndex, blockBinding);
  }

}
//# sourceMappingURL=program.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/query.js":
/*!***************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/query.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Query)
/* harmony export */ });
/* harmony import */ var _resource__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./resource */ "./node_modules/@luma.gl/webgl/dist/esm/classes/resource.js");
/* harmony import */ var _features__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../features */ "./node_modules/@luma.gl/webgl/dist/esm/features/features.js");
/* harmony import */ var _features__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../features */ "./node_modules/@luma.gl/webgl/dist/esm/features/webgl-features-table.js");
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");
/* provided dependency */ var Promise = __webpack_require__(/*! es6-promise */ "./node_modules/es6-promise/dist/es6-promise.js");




const GL_QUERY_RESULT = 0x8866;
const GL_QUERY_RESULT_AVAILABLE = 0x8867;
const GL_TIME_ELAPSED_EXT = 0x88bf;
const GL_GPU_DISJOINT_EXT = 0x8fbb;
const GL_TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN = 0x8c88;
const GL_ANY_SAMPLES_PASSED = 0x8c2f;
const GL_ANY_SAMPLES_PASSED_CONSERVATIVE = 0x8d6a;
class Query extends _resource__WEBPACK_IMPORTED_MODULE_1__["default"] {
  static isSupported(gl, opts = []) {
    const webgl2 = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl);
    const hasTimerQuery = (0,_features__WEBPACK_IMPORTED_MODULE_2__.hasFeatures)(gl, _features__WEBPACK_IMPORTED_MODULE_3__.FEATURES.TIMER_QUERY);
    let supported = webgl2 || hasTimerQuery;

    for (const key of opts) {
      switch (key) {
        case 'queries':
          supported = supported && webgl2;
          break;

        case 'timers':
          supported = supported && hasTimerQuery;
          break;

        default:
          (0,_utils_assert__WEBPACK_IMPORTED_MODULE_4__.assert)(false);
      }
    }

    return supported;
  }

  constructor(gl, opts = {}) {
    super(gl, opts);
    this.target = null;
    this._queryPending = false;
    this._pollingPromise = null;
    Object.seal(this);
  }

  beginTimeElapsedQuery() {
    return this.begin(GL_TIME_ELAPSED_EXT);
  }

  beginOcclusionQuery({
    conservative = false
  } = {}) {
    return this.begin(conservative ? GL_ANY_SAMPLES_PASSED_CONSERVATIVE : GL_ANY_SAMPLES_PASSED);
  }

  beginTransformFeedbackQuery() {
    return this.begin(GL_TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN);
  }

  begin(target) {
    if (this._queryPending) {
      return this;
    }

    this.target = target;
    this.gl2.beginQuery(this.target, this.handle);
    return this;
  }

  end() {
    if (this._queryPending) {
      return this;
    }

    if (this.target) {
      this.gl2.endQuery(this.target);
      this.target = null;
      this._queryPending = true;
    }

    return this;
  }

  isResultAvailable() {
    if (!this._queryPending) {
      return false;
    }

    const resultAvailable = this.gl2.getQueryParameter(this.handle, GL_QUERY_RESULT_AVAILABLE);

    if (resultAvailable) {
      this._queryPending = false;
    }

    return resultAvailable;
  }

  isTimerDisjoint() {
    return this.gl2.getParameter(GL_GPU_DISJOINT_EXT);
  }

  getResult() {
    return this.gl2.getQueryParameter(this.handle, GL_QUERY_RESULT);
  }

  getTimerMilliseconds() {
    return this.getResult() / 1e6;
  }

  createPoll(limit = Number.POSITIVE_INFINITY) {
    if (this._pollingPromise) {
      return this._pollingPromise;
    }

    let counter = 0;
    this._pollingPromise = new Promise((resolve, reject) => {
      const poll = () => {
        if (this.isResultAvailable()) {
          resolve(this.getResult());
          this._pollingPromise = null;
        } else if (counter++ > limit) {
          reject('Timed out');
          this._pollingPromise = null;
        } else {
          requestAnimationFrame(poll);
        }
      };

      requestAnimationFrame(poll);
    });
    return this._pollingPromise;
  }

  _createHandle() {
    return Query.isSupported(this.gl) ? this.gl2.createQuery() : null;
  }

  _deleteHandle() {
    this.gl2.deleteQuery(this.handle);
  }

}
//# sourceMappingURL=query.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/renderbuffer-formats.js":
/*!******************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/renderbuffer-formats.js ***!
  \******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const EXT_FLOAT_WEBGL2 = 'EXT_color_buffer_float';
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  [33189]: {
    bpp: 2
  },
  [33190]: {
    gl2: true,
    bpp: 3
  },
  [36012]: {
    gl2: true,
    bpp: 4
  },
  [36168]: {
    bpp: 1
  },
  [34041]: {
    bpp: 4
  },
  [35056]: {
    gl2: true,
    bpp: 4
  },
  [36013]: {
    gl2: true,
    bpp: 5
  },
  [32854]: {
    bpp: 2
  },
  [36194]: {
    bpp: 2
  },
  [32855]: {
    bpp: 2
  },
  [33321]: {
    gl2: true,
    bpp: 1
  },
  [33330]: {
    gl2: true,
    bpp: 1
  },
  [33329]: {
    gl2: true,
    bpp: 1
  },
  [33332]: {
    gl2: true,
    bpp: 2
  },
  [33331]: {
    gl2: true,
    bpp: 2
  },
  [33334]: {
    gl2: true,
    bpp: 4
  },
  [33333]: {
    gl2: true,
    bpp: 4
  },
  [33323]: {
    gl2: true,
    bpp: 2
  },
  [33336]: {
    gl2: true,
    bpp: 2
  },
  [33335]: {
    gl2: true,
    bpp: 2
  },
  [33338]: {
    gl2: true,
    bpp: 4
  },
  [33337]: {
    gl2: true,
    bpp: 4
  },
  [33340]: {
    gl2: true,
    bpp: 8
  },
  [33339]: {
    gl2: true,
    bpp: 8
  },
  [32849]: {
    gl2: true,
    bpp: 3
  },
  [32856]: {
    gl2: true,
    bpp: 4
  },
  [32857]: {
    gl2: true,
    bpp: 4
  },
  [36220]: {
    gl2: true,
    bpp: 4
  },
  [36238]: {
    gl2: true,
    bpp: 4
  },
  [36975]: {
    gl2: true,
    bpp: 4
  },
  [36214]: {
    gl2: true,
    bpp: 8
  },
  [36232]: {
    gl2: true,
    bpp: 8
  },
  [36226]: {
    gl2: true,
    bpp: 16
  },
  [36208]: {
    gl2: true,
    bpp: 16
  },
  [33325]: {
    gl2: EXT_FLOAT_WEBGL2,
    bpp: 2
  },
  [33327]: {
    gl2: EXT_FLOAT_WEBGL2,
    bpp: 4
  },
  [34842]: {
    gl2: EXT_FLOAT_WEBGL2,
    bpp: 8
  },
  [33326]: {
    gl2: EXT_FLOAT_WEBGL2,
    bpp: 4
  },
  [33328]: {
    gl2: EXT_FLOAT_WEBGL2,
    bpp: 8
  },
  [34836]: {
    gl2: EXT_FLOAT_WEBGL2,
    bpp: 16
  },
  [35898]: {
    gl2: EXT_FLOAT_WEBGL2,
    bpp: 4
  }
});
//# sourceMappingURL=renderbuffer-formats.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/renderbuffer.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/renderbuffer.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Renderbuffer)
/* harmony export */ });
/* harmony import */ var _resource__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./resource */ "./node_modules/@luma.gl/webgl/dist/esm/classes/resource.js");
/* harmony import */ var _renderbuffer_formats__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./renderbuffer-formats */ "./node_modules/@luma.gl/webgl/dist/esm/classes/renderbuffer-formats.js");
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");





function isFormatSupported(gl, format, formats) {
  const info = formats[format];

  if (!info) {
    return false;
  }

  const value = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl) ? info.gl2 || info.gl1 : info.gl1;

  if (typeof value === 'string') {
    return gl.getExtension(value);
  }

  return value;
}

class Renderbuffer extends _resource__WEBPACK_IMPORTED_MODULE_1__["default"] {
  static isSupported(gl, {
    format
  } = {
    format: null
  }) {
    return !format || isFormatSupported(gl, format, _renderbuffer_formats__WEBPACK_IMPORTED_MODULE_2__["default"]);
  }

  static getSamplesForFormat(gl, {
    format
  }) {
    return gl.getInternalformatParameter(36161, format, 32937);
  }

  constructor(gl, opts = {}) {
    super(gl, opts);
    this.initialize(opts);
    Object.seal(this);
  }

  initialize({
    format,
    width = 1,
    height = 1,
    samples = 0
  }) {
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_3__.assert)(format, 'Needs format');

    this._trackDeallocatedMemory();

    this.gl.bindRenderbuffer(36161, this.handle);

    if (samples !== 0 && (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(this.gl)) {
      this.gl.renderbufferStorageMultisample(36161, samples, format, width, height);
    } else {
      this.gl.renderbufferStorage(36161, format, width, height);
    }

    this.format = format;
    this.width = width;
    this.height = height;
    this.samples = samples;

    this._trackAllocatedMemory(this.width * this.height * (this.samples || 1) * _renderbuffer_formats__WEBPACK_IMPORTED_MODULE_2__["default"][this.format].bpp);

    return this;
  }

  resize({
    width,
    height
  }) {
    if (width !== this.width || height !== this.height) {
      return this.initialize({
        width,
        height,
        format: this.format,
        samples: this.samples
      });
    }

    return this;
  }

  _createHandle() {
    return this.gl.createRenderbuffer();
  }

  _deleteHandle() {
    this.gl.deleteRenderbuffer(this.handle);

    this._trackDeallocatedMemory();
  }

  _bindHandle(handle) {
    this.gl.bindRenderbuffer(36161, handle);
  }

  _syncHandle(handle) {
    this.format = this.getParameter(36164);
    this.width = this.getParameter(36162);
    this.height = this.getParameter(36163);
    this.samples = this.getParameter(36011);
  }

  _getParameter(pname) {
    this.gl.bindRenderbuffer(36161, this.handle);
    const value = this.gl.getRenderbufferParameter(36161, pname);
    return value;
  }

}
//# sourceMappingURL=renderbuffer.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/resource.js":
/*!******************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/resource.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Resource)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _init__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../init */ "./node_modules/@luma.gl/webgl/dist/esm/init.js");
/* harmony import */ var _webgl_utils_constants_to_keys__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../webgl-utils/constants-to-keys */ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/constants-to-keys.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");
/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/utils */ "./node_modules/@luma.gl/webgl/dist/esm/utils/utils.js");
/* harmony import */ var _utils_stub_methods__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/stub-methods */ "./node_modules/@luma.gl/webgl/dist/esm/utils/stub-methods.js");






const ERR_RESOURCE_METHOD_UNDEFINED = 'Resource subclass must define virtual methods';
class Resource {
  constructor(gl, opts = {}) {
    (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGLContext)(gl);
    const {
      id,
      userData = {}
    } = opts;
    this.gl = gl;
    this.gl2 = gl;
    this.id = id || (0,_utils_utils__WEBPACK_IMPORTED_MODULE_1__.uid)(this.constructor.name);
    this.userData = userData;
    this._bound = false;
    this._handle = opts.handle;

    if (this._handle === undefined) {
      this._handle = this._createHandle();
    }

    this.byteLength = 0;

    this._addStats();
  }

  toString() {
    return `${this.constructor.name}(${this.id})`;
  }

  get handle() {
    return this._handle;
  }

  delete({
    deleteChildren = false
  } = {}) {
    const children = this._handle && this._deleteHandle(this._handle);

    if (this._handle) {
      this._removeStats();
    }

    this._handle = null;

    if (children && deleteChildren) {
      children.filter(Boolean).forEach(child => child.delete());
    }

    return this;
  }

  bind(funcOrHandle = this.handle) {
    if (typeof funcOrHandle !== 'function') {
      this._bindHandle(funcOrHandle);

      return this;
    }

    let value;

    if (!this._bound) {
      this._bindHandle(this.handle);

      this._bound = true;
      value = funcOrHandle();
      this._bound = false;

      this._bindHandle(null);
    } else {
      value = funcOrHandle();
    }

    return value;
  }

  unbind() {
    this.bind(null);
  }

  getParameter(pname, opts = {}) {
    pname = (0,_webgl_utils_constants_to_keys__WEBPACK_IMPORTED_MODULE_2__.getKeyValue)(this.gl, pname);
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_3__.assert)(pname);
    const parameters = this.constructor.PARAMETERS || {};
    const parameter = parameters[pname];

    if (parameter) {
      const isWebgl2 = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(this.gl);
      const parameterAvailable = (!('webgl2' in parameter) || isWebgl2) && (!('extension' in parameter) || this.gl.getExtension(parameter.extension));

      if (!parameterAvailable) {
        const webgl1Default = parameter.webgl1;
        const webgl2Default = 'webgl2' in parameter ? parameter.webgl2 : parameter.webgl1;
        const defaultValue = isWebgl2 ? webgl2Default : webgl1Default;
        return defaultValue;
      }
    }

    return this._getParameter(pname, opts);
  }

  getParameters(options = {}) {
    const {
      parameters,
      keys
    } = options;
    const PARAMETERS = this.constructor.PARAMETERS || {};
    const isWebgl2 = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(this.gl);
    const values = {};
    const parameterKeys = parameters || Object.keys(PARAMETERS);

    for (const pname of parameterKeys) {
      const parameter = PARAMETERS[pname];
      const parameterAvailable = parameter && (!('webgl2' in parameter) || isWebgl2) && (!('extension' in parameter) || this.gl.getExtension(parameter.extension));

      if (parameterAvailable) {
        const key = keys ? (0,_webgl_utils_constants_to_keys__WEBPACK_IMPORTED_MODULE_2__.getKey)(this.gl, pname) : pname;
        values[key] = this.getParameter(pname, options);

        if (keys && parameter.type === 'GLenum') {
          values[key] = (0,_webgl_utils_constants_to_keys__WEBPACK_IMPORTED_MODULE_2__.getKey)(this.gl, values[key]);
        }
      }
    }

    return values;
  }

  setParameter(pname, value) {
    pname = (0,_webgl_utils_constants_to_keys__WEBPACK_IMPORTED_MODULE_2__.getKeyValue)(this.gl, pname);
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_3__.assert)(pname);
    const parameters = this.constructor.PARAMETERS || {};
    const parameter = parameters[pname];

    if (parameter) {
      const isWebgl2 = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(this.gl);
      const parameterAvailable = (!('webgl2' in parameter) || isWebgl2) && (!('extension' in parameter) || this.gl.getExtension(parameter.extension));

      if (!parameterAvailable) {
        throw new Error('Parameter not available on this platform');
      }

      if (parameter.type === 'GLenum') {
        value = (0,_webgl_utils_constants_to_keys__WEBPACK_IMPORTED_MODULE_2__.getKeyValue)(value);
      }
    }

    this._setParameter(pname, value);

    return this;
  }

  setParameters(parameters) {
    for (const pname in parameters) {
      this.setParameter(pname, parameters[pname]);
    }

    return this;
  }

  stubRemovedMethods(className, version, methodNames) {
    return (0,_utils_stub_methods__WEBPACK_IMPORTED_MODULE_4__.stubRemovedMethods)(this, className, version, methodNames);
  }

  initialize(opts) {}

  _createHandle() {
    throw new Error(ERR_RESOURCE_METHOD_UNDEFINED);
  }

  _deleteHandle() {
    throw new Error(ERR_RESOURCE_METHOD_UNDEFINED);
  }

  _bindHandle(handle) {
    throw new Error(ERR_RESOURCE_METHOD_UNDEFINED);
  }

  _getOptsFromHandle() {
    throw new Error(ERR_RESOURCE_METHOD_UNDEFINED);
  }

  _getParameter(pname, opts) {
    throw new Error(ERR_RESOURCE_METHOD_UNDEFINED);
  }

  _setParameter(pname, value) {
    throw new Error(ERR_RESOURCE_METHOD_UNDEFINED);
  }

  _context() {
    this.gl.luma = this.gl.luma || {};
    return this.gl.luma;
  }

  _addStats() {
    const name = this.constructor.name;
    const stats = _init__WEBPACK_IMPORTED_MODULE_5__.lumaStats.get('Resource Counts');
    stats.get('Resources Created').incrementCount();
    stats.get(`${name}s Created`).incrementCount();
    stats.get(`${name}s Active`).incrementCount();
  }

  _removeStats() {
    const name = this.constructor.name;
    const stats = _init__WEBPACK_IMPORTED_MODULE_5__.lumaStats.get('Resource Counts');
    stats.get(`${name}s Active`).decrementCount();
  }

  _trackAllocatedMemory(bytes, name = this.constructor.name) {
    const stats = _init__WEBPACK_IMPORTED_MODULE_5__.lumaStats.get('Memory Usage');
    stats.get('GPU Memory').addCount(bytes);
    stats.get(`${name} Memory`).addCount(bytes);
    this.byteLength = bytes;
  }

  _trackDeallocatedMemory(name = this.constructor.name) {
    const stats = _init__WEBPACK_IMPORTED_MODULE_5__.lumaStats.get('Memory Usage');
    stats.get('GPU Memory').subtractCount(this.byteLength);
    stats.get(`${name} Memory`).subtractCount(this.byteLength);
    this.byteLength = 0;
  }

}
//# sourceMappingURL=resource.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/shader.js":
/*!****************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/shader.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Shader": () => (/* binding */ Shader),
/* harmony export */   "VertexShader": () => (/* binding */ VertexShader),
/* harmony export */   "FragmentShader": () => (/* binding */ FragmentShader)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _glsl_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../glsl-utils */ "./node_modules/@luma.gl/webgl/dist/esm/glsl-utils/get-shader-name.js");
/* harmony import */ var _glsl_utils__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../glsl-utils */ "./node_modules/@luma.gl/webgl/dist/esm/glsl-utils/format-glsl-error.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");
/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/utils */ "./node_modules/@luma.gl/webgl/dist/esm/utils/utils.js");
/* harmony import */ var _resource__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./resource */ "./node_modules/@luma.gl/webgl/dist/esm/classes/resource.js");





const ERR_SOURCE = 'Shader: GLSL source code must be a JavaScript string';
class Shader extends _resource__WEBPACK_IMPORTED_MODULE_1__["default"] {
  static getTypeName(shaderType) {
    switch (shaderType) {
      case 35633:
        return 'vertex-shader';

      case 35632:
        return 'fragment-shader';

      default:
        (0,_utils_assert__WEBPACK_IMPORTED_MODULE_2__.assert)(false);
        return 'unknown';
    }
  }

  constructor(gl, props) {
    (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGLContext)(gl);
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_2__.assert)(typeof props.source === 'string', ERR_SOURCE);
    const id = (0,_glsl_utils__WEBPACK_IMPORTED_MODULE_3__["default"])(props.source, null) || props.id || (0,_utils_utils__WEBPACK_IMPORTED_MODULE_4__.uid)(`unnamed ${Shader.getTypeName(props.shaderType)}`);
    super(gl, {
      id
    });
    this.shaderType = props.shaderType;
    this.source = props.source;
    this.initialize(props);
  }

  initialize({
    source
  }) {
    const shaderName = (0,_glsl_utils__WEBPACK_IMPORTED_MODULE_3__["default"])(source, null);

    if (shaderName) {
      this.id = (0,_utils_utils__WEBPACK_IMPORTED_MODULE_4__.uid)(shaderName);
    }

    this._compile(source);
  }

  getParameter(pname) {
    return this.gl.getShaderParameter(this.handle, pname);
  }

  toString() {
    return `${Shader.getTypeName(this.shaderType)}:${this.id}`;
  }

  getName() {
    return (0,_glsl_utils__WEBPACK_IMPORTED_MODULE_3__["default"])(this.source) || 'unnamed-shader';
  }

  getSource() {
    return this.gl.getShaderSource(this.handle);
  }

  getTranslatedSource() {
    const extension = this.gl.getExtension('WEBGL_debug_shaders');
    return extension ? extension.getTranslatedShaderSource(this.handle) : 'No translated source available. WEBGL_debug_shaders not implemented';
  }

  _compile(source = this.source) {
    if (!source.startsWith('#version ')) {
      source = `#version 100\n${source}`;
    }

    this.source = source;
    this.gl.shaderSource(this.handle, this.source);
    this.gl.compileShader(this.handle);
    const compileStatus = this.getParameter(35713);

    if (!compileStatus) {
      const infoLog = this.gl.getShaderInfoLog(this.handle);
      const {
        shaderName,
        errors,
        warnings
      } = (0,_glsl_utils__WEBPACK_IMPORTED_MODULE_5__.parseGLSLCompilerError)(infoLog, this.source, this.shaderType, this.id);
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.error(`GLSL compilation errors in ${shaderName}\n${errors}`)();
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.warn(`GLSL compilation warnings in ${shaderName}\n${warnings}`)();
      throw new Error(`GLSL compilation errors in ${shaderName}`);
    }
  }

  _deleteHandle() {
    this.gl.deleteShader(this.handle);
  }

  _getOptsFromHandle() {
    return {
      type: this.getParameter(35663),
      source: this.getSource()
    };
  }

}
class VertexShader extends Shader {
  constructor(gl, props) {
    if (typeof props === 'string') {
      props = {
        source: props
      };
    }

    super(gl, Object.assign({}, props, {
      shaderType: 35633
    }));
  }

  _createHandle() {
    return this.gl.createShader(35633);
  }

}
class FragmentShader extends Shader {
  constructor(gl, props) {
    if (typeof props === 'string') {
      props = {
        source: props
      };
    }

    super(gl, Object.assign({}, props, {
      shaderType: 35632
    }));
  }

  _createHandle() {
    return this.gl.createShader(35632);
  }

}
//# sourceMappingURL=shader.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture-2d.js":
/*!********************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/texture-2d.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Texture2D)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _texture__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./texture */ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture.js");
/* harmony import */ var _utils_load_file__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/load-file */ "./node_modules/@luma.gl/webgl/dist/esm/utils/load-file.js");
/* provided dependency */ var Promise = __webpack_require__(/*! es6-promise */ "./node_modules/es6-promise/dist/es6-promise.js");



class Texture2D extends _texture__WEBPACK_IMPORTED_MODULE_1__["default"] {
  static isSupported(gl, opts) {
    return _texture__WEBPACK_IMPORTED_MODULE_1__["default"].isSupported(gl, opts);
  }

  constructor(gl, props = {}) {
    (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGLContext)(gl);

    if (props instanceof Promise || typeof props === 'string') {
      props = {
        data: props
      };
    }

    if (typeof props.data === 'string') {
      props = Object.assign({}, props, {
        data: (0,_utils_load_file__WEBPACK_IMPORTED_MODULE_2__.loadImage)(props.data)
      });
    }

    super(gl, Object.assign({}, props, {
      target: 3553
    }));
    this.initialize(props);
    Object.seal(this);
  }

}
//# sourceMappingURL=texture-2d.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture-3d.js":
/*!********************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/texture-3d.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Texture3D)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _texture__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./texture */ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture.js");
/* harmony import */ var _texture_formats__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./texture-formats */ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture-formats.js");
/* harmony import */ var _buffer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./buffer */ "./node_modules/@luma.gl/webgl/dist/esm/classes/buffer.js");




class Texture3D extends _texture__WEBPACK_IMPORTED_MODULE_1__["default"] {
  static isSupported(gl) {
    return (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl);
  }

  constructor(gl, props = {}) {
    (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(gl);
    props = Object.assign({
      depth: 1
    }, props, {
      target: 32879,
      unpackFlipY: false
    });
    super(gl, props);
    this.initialize(props);
    Object.seal(this);
  }

  setImageData({
    level = 0,
    dataFormat = 6408,
    width,
    height,
    depth = 1,
    border = 0,
    format,
    type = 5121,
    offset = 0,
    data,
    parameters = {}
  }) {
    this._trackDeallocatedMemory('Texture');

    this.gl.bindTexture(this.target, this.handle);
    (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.withParameters)(this.gl, parameters, () => {
      if (ArrayBuffer.isView(data)) {
        this.gl.texImage3D(this.target, level, dataFormat, width, height, depth, border, format, type, data);
      }

      if (data instanceof _buffer__WEBPACK_IMPORTED_MODULE_2__["default"]) {
        this.gl.bindBuffer(35052, data.handle);
        this.gl.texImage3D(this.target, level, dataFormat, width, height, depth, border, format, type, offset);
      }
    });

    if (data && data.byteLength) {
      this._trackAllocatedMemory(data.byteLength, 'Texture');
    } else {
      const channels = _texture_formats__WEBPACK_IMPORTED_MODULE_3__.DATA_FORMAT_CHANNELS[this.dataFormat] || 4;
      const channelSize = _texture_formats__WEBPACK_IMPORTED_MODULE_3__.TYPE_SIZES[this.type] || 1;

      this._trackAllocatedMemory(this.width * this.height * this.depth * channels * channelSize, 'Texture');
    }

    this.loaded = true;
    return this;
  }

}
//# sourceMappingURL=texture-3d.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture-cube.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/texture-cube.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ TextureCube)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _texture__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./texture */ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture.js");
/* provided dependency */ var Promise = __webpack_require__(/*! es6-promise */ "./node_modules/es6-promise/dist/es6-promise.js");


const FACES = [34069, 34070, 34071, 34072, 34073, 34074];
class TextureCube extends _texture__WEBPACK_IMPORTED_MODULE_1__["default"] {
  constructor(gl, props = {}) {
    (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGLContext)(gl);
    super(gl, Object.assign({}, props, {
      target: 34067
    }));
    this.initialize(props);
    Object.seal(this);
  }

  initialize(props = {}) {
    const {
      mipmaps = true,
      parameters = {}
    } = props;
    this.opts = props;
    this.setCubeMapImageData(props).then(() => {
      this.loaded = true;

      if (mipmaps) {
        this.generateMipmap(props);
      }

      this.setParameters(parameters);
    });
    return this;
  }

  subImage({
    face,
    data,
    x = 0,
    y = 0,
    mipmapLevel = 0
  }) {
    return this._subImage({
      target: face,
      data,
      x,
      y,
      mipmapLevel
    });
  }

  async setCubeMapImageData({
    width,
    height,
    pixels,
    data,
    border = 0,
    format = 6408,
    type = 5121
  }) {
    const {
      gl
    } = this;
    const imageDataMap = pixels || data;
    const resolvedFaces = await Promise.all(FACES.map(face => {
      const facePixels = imageDataMap[face];
      return Promise.all(Array.isArray(facePixels) ? facePixels : [facePixels]);
    }));
    this.bind();
    FACES.forEach((face, index) => {
      if (resolvedFaces[index].length > 1 && this.opts.mipmaps !== false) {
        _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.warn(`${this.id} has mipmap and multiple LODs.`)();
      }

      resolvedFaces[index].forEach((image, lodLevel) => {
        if (width && height) {
          gl.texImage2D(face, lodLevel, format, width, height, border, format, type, image);
        } else {
          gl.texImage2D(face, lodLevel, format, format, type, image);
        }
      });
    });
    this.unbind();
  }

  setImageDataForFace(options) {
    const {
      face,
      width,
      height,
      pixels,
      data,
      border = 0,
      format = 6408,
      type = 5121
    } = options;
    const {
      gl
    } = this;
    const imageData = pixels || data;
    this.bind();

    if (imageData instanceof Promise) {
      imageData.then(resolvedImageData => this.setImageDataForFace(Object.assign({}, options, {
        face,
        data: resolvedImageData,
        pixels: resolvedImageData
      })));
    } else if (this.width || this.height) {
      gl.texImage2D(face, 0, format, width, height, border, format, type, imageData);
    } else {
      gl.texImage2D(face, 0, format, format, type, imageData);
    }

    return this;
  }

}
TextureCube.FACES = FACES;
//# sourceMappingURL=texture-cube.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture-formats.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/texture-formats.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "TEXTURE_FORMATS": () => (/* binding */ TEXTURE_FORMATS),
/* harmony export */   "DATA_FORMAT_CHANNELS": () => (/* binding */ DATA_FORMAT_CHANNELS),
/* harmony export */   "TYPE_SIZES": () => (/* binding */ TYPE_SIZES),
/* harmony export */   "isFormatSupported": () => (/* binding */ isFormatSupported),
/* harmony export */   "isLinearFilteringSupported": () => (/* binding */ isLinearFilteringSupported)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");

const TEXTURE_FORMATS = {
  [6407]: {
    dataFormat: 6407,
    types: [5121, 33635]
  },
  [6408]: {
    dataFormat: 6408,
    types: [5121, 32819, 32820]
  },
  [6406]: {
    dataFormat: 6406,
    types: [5121]
  },
  [6409]: {
    dataFormat: 6409,
    types: [5121]
  },
  [6410]: {
    dataFormat: 6410,
    types: [5121]
  },
  [33326]: {
    dataFormat: 6403,
    types: [5126],
    gl2: true
  },
  [33328]: {
    dataFormat: 33319,
    types: [5126],
    gl2: true
  },
  [34837]: {
    dataFormat: 6407,
    types: [5126],
    gl2: true
  },
  [34836]: {
    dataFormat: 6408,
    types: [5126],
    gl2: true
  }
};
const DATA_FORMAT_CHANNELS = {
  [6403]: 1,
  [36244]: 1,
  [33319]: 2,
  [33320]: 2,
  [6407]: 3,
  [36248]: 3,
  [6408]: 4,
  [36249]: 4,
  [6402]: 1,
  [34041]: 1,
  [6406]: 1,
  [6409]: 1,
  [6410]: 2
};
const TYPE_SIZES = {
  [5126]: 4,
  [5125]: 4,
  [5124]: 4,
  [5123]: 2,
  [5122]: 2,
  [5131]: 2,
  [5120]: 1,
  [5121]: 1
};
function isFormatSupported(gl, format) {
  const info = TEXTURE_FORMATS[format];

  if (!info) {
    return false;
  }

  if (info.gl1 === undefined && info.gl2 === undefined) {
    return true;
  }

  const value = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl) ? info.gl2 || info.gl1 : info.gl1;
  return typeof value === 'string' ? gl.getExtension(value) : value;
}
function isLinearFilteringSupported(gl, format) {
  const info = TEXTURE_FORMATS[format];

  switch (info && info.types[0]) {
    case 5126:
      return gl.getExtension('OES_texture_float_linear');

    case 5131:
      return gl.getExtension('OES_texture_half_float_linear');

    default:
      return true;
  }
}
//# sourceMappingURL=texture-formats.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/texture.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Texture)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var probe_gl_env__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! probe.gl/env */ "./node_modules/probe.gl/dist/es5/env/index.js");
/* harmony import */ var _resource__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./resource */ "./node_modules/@luma.gl/webgl/dist/esm/classes/resource.js");
/* harmony import */ var _buffer__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./buffer */ "./node_modules/@luma.gl/webgl/dist/esm/classes/buffer.js");
/* harmony import */ var _texture_formats__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./texture-formats */ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture-formats.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");
/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/utils */ "./node_modules/@luma.gl/webgl/dist/esm/utils/utils.js");
/* provided dependency */ var Promise = __webpack_require__(/*! es6-promise */ "./node_modules/es6-promise/dist/es6-promise.js");







const NPOT_MIN_FILTERS = [9729, 9728];

const WebGLBuffer = probe_gl_env__WEBPACK_IMPORTED_MODULE_1__.global.WebGLBuffer || function WebGLBuffer() {};

class Texture extends _resource__WEBPACK_IMPORTED_MODULE_2__["default"] {
  static isSupported(gl, opts = {}) {
    const {
      format,
      linearFiltering
    } = opts;
    let supported = true;

    if (format) {
      supported = supported && (0,_texture_formats__WEBPACK_IMPORTED_MODULE_3__.isFormatSupported)(gl, format);
      supported = supported && (!linearFiltering || (0,_texture_formats__WEBPACK_IMPORTED_MODULE_3__.isLinearFilteringSupported)(gl, format));
    }

    return supported;
  }

  constructor(gl, props) {
    const {
      id = (0,_utils_utils__WEBPACK_IMPORTED_MODULE_4__.uid)('texture'),
      handle,
      target
    } = props;
    super(gl, {
      id,
      handle
    });
    this.target = target;
    this.textureUnit = undefined;
    this.loaded = false;
    this.width = undefined;
    this.height = undefined;
    this.depth = undefined;
    this.format = undefined;
    this.type = undefined;
    this.dataFormat = undefined;
    this.border = undefined;
    this.textureUnit = undefined;
    this.mipmaps = undefined;
  }

  toString() {
    return `Texture(${this.id},${this.width}x${this.height})`;
  }

  initialize(props = {}) {
    let data = props.data;

    if (data instanceof Promise) {
      data.then(resolvedImageData => this.initialize(Object.assign({}, props, {
        pixels: resolvedImageData,
        data: resolvedImageData
      })));
      return this;
    }

    const isVideo = typeof HTMLVideoElement !== 'undefined' && data instanceof HTMLVideoElement;

    if (isVideo && data.readyState < HTMLVideoElement.HAVE_METADATA) {
      this._video = null;
      data.addEventListener('loadeddata', () => this.initialize(props));
      return this;
    }

    const {
      pixels = null,
      format = 6408,
      border = 0,
      recreate = false,
      parameters = {},
      pixelStore = {},
      textureUnit = undefined
    } = props;

    if (!data) {
      data = pixels;
    }

    let {
      width,
      height,
      dataFormat,
      type,
      compressed = false,
      mipmaps = true
    } = props;
    const {
      depth = 0
    } = props;
    ({
      width,
      height,
      compressed,
      dataFormat,
      type
    } = this._deduceParameters({
      format,
      type,
      dataFormat,
      compressed,
      data,
      width,
      height
    }));
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.format = format;
    this.type = type;
    this.dataFormat = dataFormat;
    this.border = border;
    this.textureUnit = textureUnit;

    if (Number.isFinite(this.textureUnit)) {
      this.gl.activeTexture(33984 + this.textureUnit);
      this.gl.bindTexture(this.target, this.handle);
    }

    if (mipmaps && this._isNPOT()) {
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.warn(`texture: ${this} is Non-Power-Of-Two, disabling mipmaping`)();
      mipmaps = false;

      this._updateForNPOT(parameters);
    }

    this.mipmaps = mipmaps;
    this.setImageData({
      data,
      width,
      height,
      depth,
      format,
      type,
      dataFormat,
      border,
      mipmaps,
      parameters: pixelStore,
      compressed
    });

    if (mipmaps) {
      this.generateMipmap();
    }

    this.setParameters(parameters);

    if (recreate) {
      this.data = data;
    }

    if (isVideo) {
      this._video = {
        video: data,
        parameters,
        lastTime: data.readyState >= HTMLVideoElement.HAVE_CURRENT_DATA ? data.currentTime : -1
      };
    }

    return this;
  }

  update() {
    if (this._video) {
      const {
        video,
        parameters,
        lastTime
      } = this._video;

      if (lastTime === video.currentTime || video.readyState < HTMLVideoElement.HAVE_CURRENT_DATA) {
        return;
      }

      this.setSubImageData({
        data: video,
        parameters
      });

      if (this.mipmaps) {
        this.generateMipmap();
      }

      this._video.lastTime = video.currentTime;
    }
  }

  resize({
    height,
    width,
    mipmaps = false
  }) {
    if (width !== this.width || height !== this.height) {
      return this.initialize({
        width,
        height,
        format: this.format,
        type: this.type,
        dataFormat: this.dataFormat,
        border: this.border,
        mipmaps
      });
    }

    return this;
  }

  generateMipmap(params = {}) {
    if (this._isNPOT()) {
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.warn(`texture: ${this} is Non-Power-Of-Two, disabling mipmaping`)();
      return this;
    }

    this.mipmaps = true;
    this.gl.bindTexture(this.target, this.handle);
    (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.withParameters)(this.gl, params, () => {
      this.gl.generateMipmap(this.target);
    });
    this.gl.bindTexture(this.target, null);
    return this;
  }

  setImageData(options) {
    this._trackDeallocatedMemory('Texture');

    const {
      target = this.target,
      pixels = null,
      level = 0,
      format = this.format,
      border = this.border,
      offset = 0,
      parameters = {}
    } = options;
    let {
      data = null,
      type = this.type,
      width = this.width,
      height = this.height,
      dataFormat = this.dataFormat,
      compressed = false
    } = options;

    if (!data) {
      data = pixels;
    }

    ({
      type,
      dataFormat,
      compressed,
      width,
      height
    } = this._deduceParameters({
      format,
      type,
      dataFormat,
      compressed,
      data,
      width,
      height
    }));
    const {
      gl
    } = this;
    gl.bindTexture(this.target, this.handle);
    let dataType = null;
    ({
      data,
      dataType
    } = this._getDataType({
      data,
      compressed
    }));
    let gl2;
    (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.withParameters)(this.gl, parameters, () => {
      switch (dataType) {
        case 'null':
          gl.texImage2D(target, level, format, width, height, border, dataFormat, type, data);
          break;

        case 'typed-array':
          gl.texImage2D(target, level, format, width, height, border, dataFormat, type, data, offset);
          break;

        case 'buffer':
          gl2 = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(gl);
          gl2.bindBuffer(35052, data.handle || data);
          gl2.texImage2D(target, level, format, width, height, border, dataFormat, type, offset);
          gl2.bindBuffer(35052, null);
          break;

        case 'browser-object':
          if ((0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl)) {
            gl.texImage2D(target, level, format, width, height, border, dataFormat, type, data);
          } else {
            gl.texImage2D(target, level, format, dataFormat, type, data);
          }

          break;

        case 'compressed':
          for (const [levelIndex, levelData] of data.entries()) {
            gl.compressedTexImage2D(target, levelIndex, levelData.format, levelData.width, levelData.height, border, levelData.data);
          }

          break;

        default:
          (0,_utils_assert__WEBPACK_IMPORTED_MODULE_5__.assert)(false, 'Unknown image data type');
      }
    });

    if (data && data.byteLength) {
      this._trackAllocatedMemory(data.byteLength, 'Texture');
    } else {
      const channels = _texture_formats__WEBPACK_IMPORTED_MODULE_3__.DATA_FORMAT_CHANNELS[this.dataFormat] || 4;
      const channelSize = _texture_formats__WEBPACK_IMPORTED_MODULE_3__.TYPE_SIZES[this.type] || 1;

      this._trackAllocatedMemory(this.width * this.height * channels * channelSize, 'Texture');
    }

    this.loaded = true;
    return this;
  }

  setSubImageData({
    target = this.target,
    pixels = null,
    data = null,
    x = 0,
    y = 0,
    width = this.width,
    height = this.height,
    level = 0,
    format = this.format,
    type = this.type,
    dataFormat = this.dataFormat,
    compressed = false,
    offset = 0,
    border = this.border,
    parameters = {}
  }) {
    ({
      type,
      dataFormat,
      compressed,
      width,
      height
    } = this._deduceParameters({
      format,
      type,
      dataFormat,
      compressed,
      data,
      width,
      height
    }));
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_5__.assert)(this.depth === 0, 'texSubImage not supported for 3D textures');

    if (!data) {
      data = pixels;
    }

    if (data && data.data) {
      const ndarray = data;
      data = ndarray.data;
      width = ndarray.shape[0];
      height = ndarray.shape[1];
    }

    if (data instanceof _buffer__WEBPACK_IMPORTED_MODULE_6__["default"]) {
      data = data.handle;
    }

    this.gl.bindTexture(this.target, this.handle);
    (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.withParameters)(this.gl, parameters, () => {
      if (compressed) {
        this.gl.compressedTexSubImage2D(target, level, x, y, width, height, format, data);
      } else if (data === null) {
        this.gl.texSubImage2D(target, level, x, y, width, height, dataFormat, type, null);
      } else if (ArrayBuffer.isView(data)) {
        this.gl.texSubImage2D(target, level, x, y, width, height, dataFormat, type, data, offset);
      } else if (data instanceof WebGLBuffer) {
        const gl2 = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(this.gl);
        gl2.bindBuffer(35052, data);
        gl2.texSubImage2D(target, level, x, y, width, height, dataFormat, type, offset);
        gl2.bindBuffer(35052, null);
      } else if ((0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(this.gl)) {
        const gl2 = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(this.gl);
        gl2.texSubImage2D(target, level, x, y, width, height, dataFormat, type, data);
      } else {
        this.gl.texSubImage2D(target, level, x, y, dataFormat, type, data);
      }
    });
    this.gl.bindTexture(this.target, null);
  }

  copyFramebuffer(opts = {}) {
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.error('Texture.copyFramebuffer({...}) is no logner supported, use copyToTexture(source, target, opts})')();
    return null;
  }

  getActiveUnit() {
    return this.gl.getParameter(34016) - 33984;
  }

  bind(textureUnit = this.textureUnit) {
    const {
      gl
    } = this;

    if (textureUnit !== undefined) {
      this.textureUnit = textureUnit;
      gl.activeTexture(33984 + textureUnit);
    }

    gl.bindTexture(this.target, this.handle);
    return textureUnit;
  }

  unbind(textureUnit = this.textureUnit) {
    const {
      gl
    } = this;

    if (textureUnit !== undefined) {
      this.textureUnit = textureUnit;
      gl.activeTexture(33984 + textureUnit);
    }

    gl.bindTexture(this.target, null);
    return textureUnit;
  }

  _getDataType({
    data,
    compressed = false
  }) {
    if (compressed) {
      return {
        data,
        dataType: 'compressed'
      };
    }

    if (data === null) {
      return {
        data,
        dataType: 'null'
      };
    }

    if (ArrayBuffer.isView(data)) {
      return {
        data,
        dataType: 'typed-array'
      };
    }

    if (data instanceof _buffer__WEBPACK_IMPORTED_MODULE_6__["default"]) {
      return {
        data: data.handle,
        dataType: 'buffer'
      };
    }

    if (data instanceof WebGLBuffer) {
      return {
        data,
        dataType: 'buffer'
      };
    }

    return {
      data,
      dataType: 'browser-object'
    };
  }

  _deduceParameters(opts) {
    const {
      format,
      data
    } = opts;
    let {
      width,
      height,
      dataFormat,
      type,
      compressed
    } = opts;
    const textureFormat = _texture_formats__WEBPACK_IMPORTED_MODULE_3__.TEXTURE_FORMATS[format];
    dataFormat = dataFormat || textureFormat && textureFormat.dataFormat;
    type = type || textureFormat && textureFormat.types[0];
    compressed = compressed || textureFormat && textureFormat.compressed;
    ({
      width,
      height
    } = this._deduceImageSize(data, width, height));
    return {
      dataFormat,
      type,
      compressed,
      width,
      height,
      format,
      data
    };
  }

  _deduceImageSize(data, width, height) {
    let size;

    if (typeof ImageData !== 'undefined' && data instanceof ImageData) {
      size = {
        width: data.width,
        height: data.height
      };
    } else if (typeof HTMLImageElement !== 'undefined' && data instanceof HTMLImageElement) {
      size = {
        width: data.naturalWidth,
        height: data.naturalHeight
      };
    } else if (typeof HTMLCanvasElement !== 'undefined' && data instanceof HTMLCanvasElement) {
      size = {
        width: data.width,
        height: data.height
      };
    } else if (typeof ImageBitmap !== 'undefined' && data instanceof ImageBitmap) {
      size = {
        width: data.width,
        height: data.height
      };
    } else if (typeof HTMLVideoElement !== 'undefined' && data instanceof HTMLVideoElement) {
      size = {
        width: data.videoWidth,
        height: data.videoHeight
      };
    } else if (!data) {
      size = {
        width: width >= 0 ? width : 1,
        height: height >= 0 ? height : 1
      };
    } else {
      size = {
        width,
        height
      };
    }

    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_5__.assert)(size, 'Could not deduced texture size');
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_5__.assert)(width === undefined || size.width === width, 'Deduced texture width does not match supplied width');
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_5__.assert)(height === undefined || size.height === height, 'Deduced texture height does not match supplied height');
    return size;
  }

  _createHandle() {
    return this.gl.createTexture();
  }

  _deleteHandle() {
    this.gl.deleteTexture(this.handle);

    this._trackDeallocatedMemory('Texture');
  }

  _getParameter(pname) {
    switch (pname) {
      case 4096:
        return this.width;

      case 4097:
        return this.height;

      default:
        this.gl.bindTexture(this.target, this.handle);
        const value = this.gl.getTexParameter(this.target, pname);
        this.gl.bindTexture(this.target, null);
        return value;
    }
  }

  _setParameter(pname, param) {
    this.gl.bindTexture(this.target, this.handle);
    param = this._getNPOTParam(pname, param);

    switch (pname) {
      case 33082:
      case 33083:
        this.gl.texParameterf(this.handle, pname, param);
        break;

      case 4096:
      case 4097:
        (0,_utils_assert__WEBPACK_IMPORTED_MODULE_5__.assert)(false);
        break;

      default:
        this.gl.texParameteri(this.target, pname, param);
        break;
    }

    this.gl.bindTexture(this.target, null);
    return this;
  }

  _isNPOT() {
    if ((0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(this.gl)) {
      return false;
    }

    if (!this.width || !this.height) {
      return false;
    }

    return !(0,_utils_utils__WEBPACK_IMPORTED_MODULE_4__.isPowerOfTwo)(this.width) || !(0,_utils_utils__WEBPACK_IMPORTED_MODULE_4__.isPowerOfTwo)(this.height);
  }

  _updateForNPOT(parameters) {
    if (parameters[this.gl.TEXTURE_MIN_FILTER] === undefined) {
      parameters[this.gl.TEXTURE_MIN_FILTER] = this.gl.LINEAR;
    }

    if (parameters[this.gl.TEXTURE_WRAP_S] === undefined) {
      parameters[this.gl.TEXTURE_WRAP_S] = this.gl.CLAMP_TO_EDGE;
    }

    if (parameters[this.gl.TEXTURE_WRAP_T] === undefined) {
      parameters[this.gl.TEXTURE_WRAP_T] = this.gl.CLAMP_TO_EDGE;
    }
  }

  _getNPOTParam(pname, param) {
    if (this._isNPOT()) {
      switch (pname) {
        case 10241:
          if (NPOT_MIN_FILTERS.indexOf(param) === -1) {
            param = 9729;
          }

          break;

        case 10242:
        case 10243:
          if (param !== 33071) {
            param = 33071;
          }

          break;

        default:
          break;
      }
    }

    return param;
  }

}
//# sourceMappingURL=texture.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/transform-feedback.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/transform-feedback.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ TransformFeedback)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _resource__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./resource */ "./node_modules/@luma.gl/webgl/dist/esm/classes/resource.js");
/* harmony import */ var _buffer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./buffer */ "./node_modules/@luma.gl/webgl/dist/esm/classes/buffer.js");
/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/utils */ "./node_modules/@luma.gl/webgl/dist/esm/utils/utils.js");




class TransformFeedback extends _resource__WEBPACK_IMPORTED_MODULE_1__["default"] {
  static isSupported(gl) {
    return (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl);
  }

  constructor(gl, props = {}) {
    (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(gl);
    super(gl, props);
    this.initialize(props);
    this.stubRemovedMethods('TransformFeedback', 'v6.0', ['pause', 'resume']);
    Object.seal(this);
  }

  initialize(props = {}) {
    this.buffers = {};
    this.unused = {};
    this.configuration = null;
    this.bindOnUse = true;

    if (!(0,_utils_utils__WEBPACK_IMPORTED_MODULE_2__.isObjectEmpty)(this.buffers)) {
      this.bind(() => this._unbindBuffers());
    }

    this.setProps(props);
    return this;
  }

  setProps(props) {
    if ('program' in props) {
      this.configuration = props.program && props.program.configuration;
    }

    if ('configuration' in props) {
      this.configuration = props.configuration;
    }

    if ('bindOnUse' in props) {
      props = props.bindOnUse;
    }

    if ('buffers' in props) {
      this.setBuffers(props.buffers);
    }
  }

  setBuffers(buffers = {}) {
    this.bind(() => {
      for (const bufferName in buffers) {
        this.setBuffer(bufferName, buffers[bufferName]);
      }
    });
    return this;
  }

  setBuffer(locationOrName, bufferOrParams) {
    const location = this._getVaryingIndex(locationOrName);

    const {
      buffer,
      byteSize,
      byteOffset
    } = this._getBufferParams(bufferOrParams);

    if (location < 0) {
      this.unused[locationOrName] = buffer;
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.warn(() => `${this.id} unused varying buffer ${locationOrName}`)();
      return this;
    }

    this.buffers[location] = bufferOrParams;

    if (!this.bindOnUse) {
      this._bindBuffer(location, buffer, byteOffset, byteSize);
    }

    return this;
  }

  begin(primitiveMode = 0) {
    this.gl.bindTransformFeedback(36386, this.handle);

    this._bindBuffers();

    this.gl.beginTransformFeedback(primitiveMode);
    return this;
  }

  end() {
    this.gl.endTransformFeedback();

    this._unbindBuffers();

    this.gl.bindTransformFeedback(36386, null);
    return this;
  }

  _getBufferParams(bufferOrParams) {
    let byteOffset;
    let byteSize;
    let buffer;

    if (bufferOrParams instanceof _buffer__WEBPACK_IMPORTED_MODULE_3__["default"] === false) {
      buffer = bufferOrParams.buffer;
      byteSize = bufferOrParams.byteSize;
      byteOffset = bufferOrParams.byteOffset;
    } else {
      buffer = bufferOrParams;
    }

    if (byteOffset !== undefined || byteSize !== undefined) {
      byteOffset = byteOffset || 0;
      byteSize = byteSize || buffer.byteLength - byteOffset;
    }

    return {
      buffer,
      byteOffset,
      byteSize
    };
  }

  _getVaryingInfo(locationOrName) {
    return this.configuration && this.configuration.getVaryingInfo(locationOrName);
  }

  _getVaryingIndex(locationOrName) {
    if (this.configuration) {
      return this.configuration.getVaryingInfo(locationOrName).location;
    }

    const location = Number(locationOrName);
    return Number.isFinite(location) ? location : -1;
  }

  _bindBuffers() {
    if (this.bindOnUse) {
      for (const bufferIndex in this.buffers) {
        const {
          buffer,
          byteSize,
          byteOffset
        } = this._getBufferParams(this.buffers[bufferIndex]);

        this._bindBuffer(bufferIndex, buffer, byteOffset, byteSize);
      }
    }
  }

  _unbindBuffers() {
    if (this.bindOnUse) {
      for (const bufferIndex in this.buffers) {
        this._bindBuffer(bufferIndex, null);
      }
    }
  }

  _bindBuffer(index, buffer, byteOffset = 0, byteSize) {
    const handle = buffer && buffer.handle;

    if (!handle || byteSize === undefined) {
      this.gl.bindBufferBase(35982, index, handle);
    } else {
      this.gl.bindBufferRange(35982, index, handle, byteOffset, byteSize);
    }

    return this;
  }

  _createHandle() {
    return this.gl.createTransformFeedback();
  }

  _deleteHandle() {
    this.gl.deleteTransformFeedback(this.handle);
  }

  _bindHandle(handle) {
    this.gl.bindTransformFeedback(36386, this.handle);
  }

}
//# sourceMappingURL=transform-feedback.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/uniforms.js":
/*!******************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/uniforms.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getUniformSetter": () => (/* binding */ getUniformSetter),
/* harmony export */   "parseUniformName": () => (/* binding */ parseUniformName),
/* harmony export */   "checkUniformValues": () => (/* binding */ checkUniformValues),
/* harmony export */   "copyUniform": () => (/* binding */ copyUniform)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _framebuffer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./framebuffer */ "./node_modules/@luma.gl/webgl/dist/esm/classes/framebuffer.js");
/* harmony import */ var _renderbuffer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./renderbuffer */ "./node_modules/@luma.gl/webgl/dist/esm/classes/renderbuffer.js");
/* harmony import */ var _texture__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./texture */ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");





const UNIFORM_SETTERS = {
  [5126]: getArraySetter.bind(null, 'uniform1fv', toFloatArray, 1, setVectorUniform),
  [35664]: getArraySetter.bind(null, 'uniform2fv', toFloatArray, 2, setVectorUniform),
  [35665]: getArraySetter.bind(null, 'uniform3fv', toFloatArray, 3, setVectorUniform),
  [35666]: getArraySetter.bind(null, 'uniform4fv', toFloatArray, 4, setVectorUniform),
  [5124]: getArraySetter.bind(null, 'uniform1iv', toIntArray, 1, setVectorUniform),
  [35667]: getArraySetter.bind(null, 'uniform2iv', toIntArray, 2, setVectorUniform),
  [35668]: getArraySetter.bind(null, 'uniform3iv', toIntArray, 3, setVectorUniform),
  [35669]: getArraySetter.bind(null, 'uniform4iv', toIntArray, 4, setVectorUniform),
  [35670]: getArraySetter.bind(null, 'uniform1iv', toIntArray, 1, setVectorUniform),
  [35671]: getArraySetter.bind(null, 'uniform2iv', toIntArray, 2, setVectorUniform),
  [35672]: getArraySetter.bind(null, 'uniform3iv', toIntArray, 3, setVectorUniform),
  [35673]: getArraySetter.bind(null, 'uniform4iv', toIntArray, 4, setVectorUniform),
  [35674]: getArraySetter.bind(null, 'uniformMatrix2fv', toFloatArray, 4, setMatrixUniform),
  [35675]: getArraySetter.bind(null, 'uniformMatrix3fv', toFloatArray, 9, setMatrixUniform),
  [35676]: getArraySetter.bind(null, 'uniformMatrix4fv', toFloatArray, 16, setMatrixUniform),
  [35678]: getSamplerSetter,
  [35680]: getSamplerSetter,
  [5125]: getArraySetter.bind(null, 'uniform1uiv', toUIntArray, 1, setVectorUniform),
  [36294]: getArraySetter.bind(null, 'uniform2uiv', toUIntArray, 2, setVectorUniform),
  [36295]: getArraySetter.bind(null, 'uniform3uiv', toUIntArray, 3, setVectorUniform),
  [36296]: getArraySetter.bind(null, 'uniform4uiv', toUIntArray, 4, setVectorUniform),
  [35685]: getArraySetter.bind(null, 'uniformMatrix2x3fv', toFloatArray, 6, setMatrixUniform),
  [35686]: getArraySetter.bind(null, 'uniformMatrix2x4fv', toFloatArray, 8, setMatrixUniform),
  [35687]: getArraySetter.bind(null, 'uniformMatrix3x2fv', toFloatArray, 6, setMatrixUniform),
  [35688]: getArraySetter.bind(null, 'uniformMatrix3x4fv', toFloatArray, 12, setMatrixUniform),
  [35689]: getArraySetter.bind(null, 'uniformMatrix4x2fv', toFloatArray, 8, setMatrixUniform),
  [35690]: getArraySetter.bind(null, 'uniformMatrix4x3fv', toFloatArray, 12, setMatrixUniform),
  [35678]: getSamplerSetter,
  [35680]: getSamplerSetter,
  [35679]: getSamplerSetter,
  [35682]: getSamplerSetter,
  [36289]: getSamplerSetter,
  [36292]: getSamplerSetter,
  [36293]: getSamplerSetter,
  [36298]: getSamplerSetter,
  [36299]: getSamplerSetter,
  [36300]: getSamplerSetter,
  [36303]: getSamplerSetter,
  [36306]: getSamplerSetter,
  [36307]: getSamplerSetter,
  [36308]: getSamplerSetter,
  [36311]: getSamplerSetter
};
const FLOAT_ARRAY = {};
const INT_ARRAY = {};
const UINT_ARRAY = {};
const array1 = [0];

function toTypedArray(value, uniformLength, Type, cache) {
  if (uniformLength === 1 && typeof value === 'boolean') {
    value = value ? 1 : 0;
  }

  if (Number.isFinite(value)) {
    array1[0] = value;
    value = array1;
  }

  const length = value.length;

  if (length % uniformLength) {
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.warn(`Uniform size should be multiples of ${uniformLength}`, value)();
  }

  if (value instanceof Type) {
    return value;
  }

  let result = cache[length];

  if (!result) {
    result = new Type(length);
    cache[length] = result;
  }

  for (let i = 0; i < length; i++) {
    result[i] = value[i];
  }

  return result;
}

function toFloatArray(value, uniformLength) {
  return toTypedArray(value, uniformLength, Float32Array, FLOAT_ARRAY);
}

function toIntArray(value, uniformLength) {
  return toTypedArray(value, uniformLength, Int32Array, INT_ARRAY);
}

function toUIntArray(value, uniformLength) {
  return toTypedArray(value, uniformLength, Uint32Array, UINT_ARRAY);
}

function getUniformSetter(gl, location, info) {
  const setter = UNIFORM_SETTERS[info.type];

  if (!setter) {
    throw new Error(`Unknown GLSL uniform type ${info.type}`);
  }

  return setter().bind(null, gl, location);
}
function parseUniformName(name) {
  if (name[name.length - 1] !== ']') {
    return {
      name,
      length: 1,
      isArray: false
    };
  }

  const UNIFORM_NAME_REGEXP = /([^[]*)(\[[0-9]+\])?/;
  const matches = name.match(UNIFORM_NAME_REGEXP);

  if (!matches || matches.length < 2) {
    throw new Error(`Failed to parse GLSL uniform name ${name}`);
  }

  return {
    name: matches[1],
    length: matches[2] || 1,
    isArray: Boolean(matches[2])
  };
}
function checkUniformValues(uniforms, source, uniformMap) {
  for (const uniformName in uniforms) {
    const value = uniforms[uniformName];
    const shouldCheck = !uniformMap || Boolean(uniformMap[uniformName]);

    if (shouldCheck && !checkUniformValue(value)) {
      source = source ? `${source} ` : '';
      console.error(`${source} Bad uniform ${uniformName}`, value);
      throw new Error(`${source} Bad uniform ${uniformName}`);
    }
  }

  return true;
}

function checkUniformValue(value) {
  if (Array.isArray(value) || ArrayBuffer.isView(value)) {
    return checkUniformArray(value);
  }

  if (isFinite(value)) {
    return true;
  } else if (value === true || value === false) {
    return true;
  } else if (value instanceof _texture__WEBPACK_IMPORTED_MODULE_1__["default"]) {
    return true;
  } else if (value instanceof _renderbuffer__WEBPACK_IMPORTED_MODULE_2__["default"]) {
    return true;
  } else if (value instanceof _framebuffer__WEBPACK_IMPORTED_MODULE_3__["default"]) {
    return Boolean(value.texture);
  }

  return false;
}

function copyUniform(uniforms, key, value) {
  if (Array.isArray(value) || ArrayBuffer.isView(value)) {
    if (uniforms[key]) {
      const dest = uniforms[key];

      for (let i = 0, len = value.length; i < len; ++i) {
        dest[i] = value[i];
      }
    } else {
      uniforms[key] = value.slice();
    }
  } else {
    uniforms[key] = value;
  }
}

function checkUniformArray(value) {
  if (value.length === 0) {
    return false;
  }

  const checkLength = Math.min(value.length, 16);

  for (let i = 0; i < checkLength; ++i) {
    if (!Number.isFinite(value[i])) {
      return false;
    }
  }

  return true;
}

function getSamplerSetter() {
  let cache = null;
  return (gl, location, value) => {
    const update = cache !== value;

    if (update) {
      gl.uniform1i(location, value);
      cache = value;
    }

    return update;
  };
}

function getArraySetter(functionName, toArray, size, uniformSetter) {
  let cache = null;
  let cacheLength = null;
  return (gl, location, value) => {
    const arrayValue = toArray(value, size);
    const length = arrayValue.length;
    let update = false;

    if (cache === null) {
      cache = new Float32Array(length);
      cacheLength = length;
      update = true;
    } else {
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_4__.assert)(cacheLength === length, 'Uniform length cannot change.');

      for (let i = 0; i < length; ++i) {
        if (arrayValue[i] !== cache[i]) {
          update = true;
          break;
        }
      }
    }

    if (update) {
      uniformSetter(gl, functionName, location, arrayValue);
      cache.set(arrayValue);
    }

    return update;
  };
}

function setVectorUniform(gl, functionName, location, value) {
  gl[functionName](location, value);
}

function setMatrixUniform(gl, functionName, location, value) {
  gl[functionName](location, false, value);
}
//# sourceMappingURL=uniforms.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/vertex-array-object.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/vertex-array-object.js ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ VertexArrayObject)
/* harmony export */ });
/* harmony import */ var _resource__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./resource */ "./node_modules/@luma.gl/webgl/dist/esm/classes/resource.js");
/* harmony import */ var _buffer__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./buffer */ "./node_modules/@luma.gl/webgl/dist/esm/classes/buffer.js");
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _utils_array_utils_flat__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils/array-utils-flat */ "./node_modules/@luma.gl/webgl/dist/esm/utils/array-utils-flat.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");
/* harmony import */ var probe_gl__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! probe.gl */ "./node_modules/probe.gl/dist/esm/env/get-browser.js");






const ERR_ELEMENTS = 'elements must be GL.ELEMENT_ARRAY_BUFFER';
class VertexArrayObject extends _resource__WEBPACK_IMPORTED_MODULE_1__["default"] {
  static isSupported(gl, options = {}) {
    if (options.constantAttributeZero) {
      return (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl) || (0,probe_gl__WEBPACK_IMPORTED_MODULE_2__["default"])() === 'Chrome';
    }

    return true;
  }

  static getDefaultArray(gl) {
    gl.luma = gl.luma || {};

    if (!gl.luma.defaultVertexArray) {
      gl.luma.defaultVertexArray = new VertexArrayObject(gl, {
        handle: null,
        isDefaultArray: true
      });
    }

    return gl.luma.defaultVertexArray;
  }

  static getMaxAttributes(gl) {
    VertexArrayObject.MAX_ATTRIBUTES = VertexArrayObject.MAX_ATTRIBUTES || gl.getParameter(34921);
    return VertexArrayObject.MAX_ATTRIBUTES;
  }

  static setConstant(gl, location, array) {
    switch (array.constructor) {
      case Float32Array:
        VertexArrayObject._setConstantFloatArray(gl, location, array);

        break;

      case Int32Array:
        VertexArrayObject._setConstantIntArray(gl, location, array);

        break;

      case Uint32Array:
        VertexArrayObject._setConstantUintArray(gl, location, array);

        break;

      default:
        (0,_utils_assert__WEBPACK_IMPORTED_MODULE_3__.assert)(false);
    }
  }

  constructor(gl, opts = {}) {
    const id = opts.id || opts.program && opts.program.id;
    super(gl, Object.assign({}, opts, {
      id
    }));
    this.buffer = null;
    this.bufferValue = null;
    this.isDefaultArray = opts.isDefaultArray || false;
    this.gl2 = gl;
    this.initialize(opts);
    Object.seal(this);
  }

  delete() {
    super.delete();

    if (this.buffer) {
      this.buffer.delete();
    }

    return this;
  }

  get MAX_ATTRIBUTES() {
    return VertexArrayObject.getMaxAttributes(this.gl);
  }

  initialize(props = {}) {
    return this.setProps(props);
  }

  setProps(props) {
    return this;
  }

  setElementBuffer(elementBuffer = null, opts = {}) {
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_3__.assert)(!elementBuffer || elementBuffer.target === 34963, ERR_ELEMENTS);
    this.bind(() => {
      this.gl.bindBuffer(34963, elementBuffer ? elementBuffer.handle : null);
    });
    return this;
  }

  setBuffer(location, buffer, accessor) {
    if (buffer.target === 34963) {
      return this.setElementBuffer(buffer, accessor);
    }

    const {
      size,
      type,
      stride,
      offset,
      normalized,
      integer,
      divisor
    } = accessor;
    const {
      gl,
      gl2
    } = this;
    location = Number(location);
    this.bind(() => {
      gl.bindBuffer(34962, buffer.handle);

      if (integer) {
        (0,_utils_assert__WEBPACK_IMPORTED_MODULE_3__.assert)((0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl));
        gl2.vertexAttribIPointer(location, size, type, stride, offset);
      } else {
        gl.vertexAttribPointer(location, size, type, normalized, stride, offset);
      }

      gl.enableVertexAttribArray(location);
      gl2.vertexAttribDivisor(location, divisor || 0);
    });
    return this;
  }

  enable(location, enable = true) {
    const disablingAttributeZero = !enable && location === 0 && !VertexArrayObject.isSupported(this.gl, {
      constantAttributeZero: true
    });

    if (!disablingAttributeZero) {
      location = Number(location);
      this.bind(() => enable ? this.gl.enableVertexAttribArray(location) : this.gl.disableVertexAttribArray(location));
    }

    return this;
  }

  getConstantBuffer(elementCount, value) {
    const constantValue = this._normalizeConstantArrayValue(value);

    const byteLength = constantValue.byteLength * elementCount;
    const length = constantValue.length * elementCount;
    let updateNeeded = !this.buffer;
    this.buffer = this.buffer || new _buffer__WEBPACK_IMPORTED_MODULE_4__["default"](this.gl, byteLength);
    updateNeeded = updateNeeded || this.buffer.reallocate(byteLength);
    updateNeeded = updateNeeded || !this._compareConstantArrayValues(constantValue, this.bufferValue);

    if (updateNeeded) {
      const typedArray = (0,_utils_array_utils_flat__WEBPACK_IMPORTED_MODULE_5__.getScratchArray)(value.constructor, length);
      (0,_utils_array_utils_flat__WEBPACK_IMPORTED_MODULE_5__.fillArray)({
        target: typedArray,
        source: constantValue,
        start: 0,
        count: length
      });
      this.buffer.subData(typedArray);
      this.bufferValue = value;
    }

    return this.buffer;
  }

  _normalizeConstantArrayValue(arrayValue) {
    if (Array.isArray(arrayValue)) {
      return new Float32Array(arrayValue);
    }

    return arrayValue;
  }

  _compareConstantArrayValues(v1, v2) {
    if (!v1 || !v2 || v1.length !== v2.length || v1.constructor !== v2.constructor) {
      return false;
    }

    for (let i = 0; i < v1.length; ++i) {
      if (v1[i] !== v2[i]) {
        return false;
      }
    }

    return true;
  }

  static _setConstantFloatArray(gl, location, array) {
    switch (array.length) {
      case 1:
        gl.vertexAttrib1fv(location, array);
        break;

      case 2:
        gl.vertexAttrib2fv(location, array);
        break;

      case 3:
        gl.vertexAttrib3fv(location, array);
        break;

      case 4:
        gl.vertexAttrib4fv(location, array);
        break;

      default:
        (0,_utils_assert__WEBPACK_IMPORTED_MODULE_3__.assert)(false);
    }
  }

  static _setConstantIntArray(gl, location, array) {
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_3__.assert)((0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl));

    switch (array.length) {
      case 1:
        gl.vertexAttribI1iv(location, array);
        break;

      case 2:
        gl.vertexAttribI2iv(location, array);
        break;

      case 3:
        gl.vertexAttribI3iv(location, array);
        break;

      case 4:
        gl.vertexAttribI4iv(location, array);
        break;

      default:
        (0,_utils_assert__WEBPACK_IMPORTED_MODULE_3__.assert)(false);
    }
  }

  static _setConstantUintArray(gl, location, array) {
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_3__.assert)((0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl));

    switch (array.length) {
      case 1:
        gl.vertexAttribI1uiv(location, array);
        break;

      case 2:
        gl.vertexAttribI2uiv(location, array);
        break;

      case 3:
        gl.vertexAttribI3uiv(location, array);
        break;

      case 4:
        gl.vertexAttribI4uiv(location, array);
        break;

      default:
        (0,_utils_assert__WEBPACK_IMPORTED_MODULE_3__.assert)(false);
    }
  }

  _createHandle() {
    const gl2 = this.gl;
    return gl2.createVertexArray();
  }

  _deleteHandle(handle) {
    this.gl2.deleteVertexArray(handle);
    return [this.elements];
  }

  _bindHandle(handle) {
    this.gl2.bindVertexArray(handle);
  }

  _getParameter(pname, {
    location
  }) {
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_3__.assert)(Number.isFinite(location));
    return this.bind(() => {
      switch (pname) {
        case 34373:
          return this.gl.getVertexAttribOffset(location, pname);

        default:
          return this.gl.getVertexAttrib(location, pname);
      }
    });
  }

}
//# sourceMappingURL=vertex-array-object.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/vertex-array.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/vertex-array.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ VertexArray)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _accessor__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./accessor */ "./node_modules/@luma.gl/webgl/dist/esm/classes/accessor.js");
/* harmony import */ var _buffer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./buffer */ "./node_modules/@luma.gl/webgl/dist/esm/classes/buffer.js");
/* harmony import */ var _vertex_array_object__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./vertex-array-object */ "./node_modules/@luma.gl/webgl/dist/esm/classes/vertex-array-object.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");
/* harmony import */ var _utils_stub_methods__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/stub-methods */ "./node_modules/@luma.gl/webgl/dist/esm/utils/stub-methods.js");






const ERR_ATTRIBUTE_TYPE = 'VertexArray: attributes must be Buffers or constants (i.e. typed array)';
const MULTI_LOCATION_ATTRIBUTE_REGEXP = /^(.+)__LOCATION_([0-9]+)$/;
const DEPRECATIONS_V6 = ['setBuffers', 'setGeneric', 'clearBindings', 'setLocations', 'setGenericValues', 'setDivisor', 'enable', 'disable'];
class VertexArray {
  constructor(gl, opts = {}) {
    const id = opts.id || opts.program && opts.program.id;
    this.id = id;
    this.gl = gl;
    this.configuration = null;
    this.elements = null;
    this.elementsAccessor = null;
    this.values = null;
    this.accessors = null;
    this.unused = null;
    this.drawParams = null;
    this.buffer = null;
    this.attributes = {};
    this.vertexArrayObject = new _vertex_array_object__WEBPACK_IMPORTED_MODULE_1__["default"](gl);
    (0,_utils_stub_methods__WEBPACK_IMPORTED_MODULE_2__.stubRemovedMethods)(this, 'VertexArray', 'v6.0', DEPRECATIONS_V6);
    this.initialize(opts);
    Object.seal(this);
  }

  delete() {
    if (this.buffer) {
      this.buffer.delete();
    }

    this.vertexArrayObject.delete();
  }

  initialize(props = {}) {
    this.reset();
    this.configuration = null;
    this.bindOnUse = false;
    return this.setProps(props);
  }

  reset() {
    this.elements = null;
    this.elementsAccessor = null;
    const {
      MAX_ATTRIBUTES
    } = this.vertexArrayObject;
    this.values = new Array(MAX_ATTRIBUTES).fill(null);
    this.accessors = new Array(MAX_ATTRIBUTES).fill(null);
    this.unused = {};
    this.drawParams = null;
    return this;
  }

  setProps(props) {
    if ('program' in props) {
      this.configuration = props.program && props.program.configuration;
    }

    if ('configuration' in props) {
      this.configuration = props.configuration;
    }

    if ('attributes' in props) {
      this.setAttributes(props.attributes);
    }

    if ('elements' in props) {
      this.setElementBuffer(props.elements);
    }

    if ('bindOnUse' in props) {
      props = props.bindOnUse;
    }

    return this;
  }

  clearDrawParams() {
    this.drawParams = null;
  }

  getDrawParams() {
    this.drawParams = this.drawParams || this._updateDrawParams();
    return this.drawParams;
  }

  setAttributes(attributes) {
    Object.assign(this.attributes, attributes);
    this.vertexArrayObject.bind(() => {
      for (const locationOrName in attributes) {
        const value = attributes[locationOrName];

        this._setAttribute(locationOrName, value);
      }

      this.gl.bindBuffer(34962, null);
    });
    return this;
  }

  setElementBuffer(elementBuffer = null, accessor = {}) {
    this.elements = elementBuffer;
    this.elementsAccessor = accessor;
    this.clearDrawParams();
    this.vertexArrayObject.setElementBuffer(elementBuffer, accessor);
    return this;
  }

  setBuffer(locationOrName, buffer, appAccessor = {}) {
    if (buffer.target === 34963) {
      return this.setElementBuffer(buffer, appAccessor);
    }

    const {
      location,
      accessor
    } = this._resolveLocationAndAccessor(locationOrName, buffer, buffer.accessor, appAccessor);

    if (location >= 0) {
      this.values[location] = buffer;
      this.accessors[location] = accessor;
      this.clearDrawParams();
      this.vertexArrayObject.setBuffer(location, buffer, accessor);
    }

    return this;
  }

  setConstant(locationOrName, arrayValue, appAccessor = {}) {
    const {
      location,
      accessor
    } = this._resolveLocationAndAccessor(locationOrName, arrayValue, Object.assign({
      size: arrayValue.length
    }, appAccessor));

    if (location >= 0) {
      arrayValue = this.vertexArrayObject._normalizeConstantArrayValue(arrayValue);
      this.values[location] = arrayValue;
      this.accessors[location] = accessor;
      this.clearDrawParams();
      this.vertexArrayObject.enable(location, false);
    }

    return this;
  }

  unbindBuffers() {
    this.vertexArrayObject.bind(() => {
      if (this.elements) {
        this.vertexArrayObject.setElementBuffer(null);
      }

      this.buffer = this.buffer || new _buffer__WEBPACK_IMPORTED_MODULE_3__["default"](this.gl, {
        accessor: {
          size: 4
        }
      });

      for (let location = 0; location < this.vertexArrayObject.MAX_ATTRIBUTES; location++) {
        if (this.values[location] instanceof _buffer__WEBPACK_IMPORTED_MODULE_3__["default"]) {
          this.gl.disableVertexAttribArray(location);
          this.gl.bindBuffer(34962, this.buffer.handle);
          this.gl.vertexAttribPointer(location, 1, 5126, false, 0, 0);
        }
      }
    });
    return this;
  }

  bindBuffers() {
    this.vertexArrayObject.bind(() => {
      if (this.elements) {
        this.setElementBuffer(this.elements);
      }

      for (let location = 0; location < this.vertexArrayObject.MAX_ATTRIBUTES; location++) {
        const buffer = this.values[location];

        if (buffer instanceof _buffer__WEBPACK_IMPORTED_MODULE_3__["default"]) {
          this.setBuffer(location, buffer);
        }
      }
    });
    return this;
  }

  bindForDraw(vertexCount, instanceCount, func) {
    let value;
    this.vertexArrayObject.bind(() => {
      this._setConstantAttributes(vertexCount, instanceCount);

      value = func();
    });
    return value;
  }

  _resolveLocationAndAccessor(locationOrName, value, valueAccessor, appAccessor) {
    const INVALID_RESULT = {
      location: -1,
      accessor: null
    };

    const {
      location,
      name
    } = this._getAttributeIndex(locationOrName);

    if (!Number.isFinite(location) || location < 0) {
      this.unused[locationOrName] = value;
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.once(3, () => `unused value ${locationOrName} in ${this.id}`)();
      return INVALID_RESULT;
    }

    const accessInfo = this._getAttributeInfo(name || location);

    if (!accessInfo) {
      return INVALID_RESULT;
    }

    const currentAccessor = this.accessors[location] || {};
    const accessor = _accessor__WEBPACK_IMPORTED_MODULE_4__["default"].resolve(accessInfo.accessor, currentAccessor, valueAccessor, appAccessor);
    const {
      size,
      type
    } = accessor;
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_5__.assert)(Number.isFinite(size) && Number.isFinite(type));
    return {
      location,
      accessor
    };
  }

  _getAttributeInfo(attributeName) {
    return this.configuration && this.configuration.getAttributeInfo(attributeName);
  }

  _getAttributeIndex(locationOrName) {
    const location = Number(locationOrName);

    if (Number.isFinite(location)) {
      return {
        location
      };
    }

    const multiLocation = MULTI_LOCATION_ATTRIBUTE_REGEXP.exec(locationOrName);
    const name = multiLocation ? multiLocation[1] : locationOrName;
    const locationOffset = multiLocation ? Number(multiLocation[2]) : 0;

    if (this.configuration) {
      return {
        location: this.configuration.getAttributeLocation(name) + locationOffset,
        name
      };
    }

    return {
      location: -1
    };
  }

  _setAttribute(locationOrName, value) {
    if (value instanceof _buffer__WEBPACK_IMPORTED_MODULE_3__["default"]) {
      this.setBuffer(locationOrName, value);
    } else if (Array.isArray(value) && value.length && value[0] instanceof _buffer__WEBPACK_IMPORTED_MODULE_3__["default"]) {
      const buffer = value[0];
      const accessor = value[1];
      this.setBuffer(locationOrName, buffer, accessor);
    } else if (ArrayBuffer.isView(value) || Array.isArray(value)) {
      const constant = value;
      this.setConstant(locationOrName, constant);
    } else if (value.buffer instanceof _buffer__WEBPACK_IMPORTED_MODULE_3__["default"]) {
      const accessor = value;
      this.setBuffer(locationOrName, accessor.buffer, accessor);
    } else {
      throw new Error(ERR_ATTRIBUTE_TYPE);
    }
  }

  _setConstantAttributes(vertexCount, instanceCount) {
    const elementCount = Math.max(vertexCount | 0, instanceCount | 0);
    let constant = this.values[0];

    if (ArrayBuffer.isView(constant)) {
      this._setConstantAttributeZero(constant, elementCount);
    }

    for (let location = 1; location < this.vertexArrayObject.MAX_ATTRIBUTES; location++) {
      constant = this.values[location];

      if (ArrayBuffer.isView(constant)) {
        this._setConstantAttribute(location, constant);
      }
    }
  }

  _setConstantAttributeZero(constant, elementCount) {
    if (_vertex_array_object__WEBPACK_IMPORTED_MODULE_1__["default"].isSupported(this.gl, {
      constantAttributeZero: true
    })) {
      this._setConstantAttribute(0, constant);

      return;
    }

    const buffer = this.vertexArrayObject.getConstantBuffer(elementCount, constant);
    this.vertexArrayObject.setBuffer(0, buffer, this.accessors[0]);
  }

  _setConstantAttribute(location, constant) {
    _vertex_array_object__WEBPACK_IMPORTED_MODULE_1__["default"].setConstant(this.gl, location, constant);
  }

  _updateDrawParams() {
    const drawParams = {
      isIndexed: false,
      isInstanced: false,
      indexCount: Infinity,
      vertexCount: Infinity,
      instanceCount: Infinity
    };

    for (let location = 0; location < this.vertexArrayObject.MAX_ATTRIBUTES; location++) {
      this._updateDrawParamsForLocation(drawParams, location);
    }

    if (this.elements) {
      drawParams.elementCount = this.elements.getElementCount(this.elements.accessor);
      drawParams.isIndexed = true;
      drawParams.indexType = this.elementsAccessor.type || this.elements.accessor.type;
      drawParams.indexOffset = this.elementsAccessor.offset || 0;
    }

    if (drawParams.indexCount === Infinity) {
      drawParams.indexCount = 0;
    }

    if (drawParams.vertexCount === Infinity) {
      drawParams.vertexCount = 0;
    }

    if (drawParams.instanceCount === Infinity) {
      drawParams.instanceCount = 0;
    }

    return drawParams;
  }

  _updateDrawParamsForLocation(drawParams, location) {
    const value = this.values[location];
    const accessor = this.accessors[location];

    if (!value) {
      return;
    }

    const {
      divisor
    } = accessor;
    const isInstanced = divisor > 0;
    drawParams.isInstanced = drawParams.isInstanced || isInstanced;

    if (value instanceof _buffer__WEBPACK_IMPORTED_MODULE_3__["default"]) {
      const buffer = value;

      if (isInstanced) {
        const instanceCount = buffer.getVertexCount(accessor);
        drawParams.instanceCount = Math.min(drawParams.instanceCount, instanceCount);
      } else {
        const vertexCount = buffer.getVertexCount(accessor);
        drawParams.vertexCount = Math.min(drawParams.vertexCount, vertexCount);
      }
    }
  }

  setElements(elementBuffer = null, accessor = {}) {
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.deprecated('setElements', 'setElementBuffer')();
    return this.setElementBuffer(elementBuffer, accessor);
  }

}
//# sourceMappingURL=vertex-array.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/debug/debug-program-configuration.js":
/*!***********************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/debug/debug-program-configuration.js ***!
  \***********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getDebugTableForProgramConfiguration": () => (/* binding */ getDebugTableForProgramConfiguration)
/* harmony export */ });
/* harmony import */ var _webgl_utils_attribute_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../webgl-utils/attribute-utils */ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/attribute-utils.js");

function getDebugTableForProgramConfiguration(config) {
  const table = {};
  const header = `Accessors for ${config.id}`;

  for (const attributeInfo of config.attributeInfos) {
    if (attributeInfo) {
      const glslDeclaration = getGLSLDeclaration(attributeInfo);
      table[`in ${glslDeclaration}`] = {
        [header]: JSON.stringify(attributeInfo.accessor)
      };
    }
  }

  for (const varyingInfo of config.varyingInfos) {
    if (varyingInfo) {
      const glslDeclaration = getGLSLDeclaration(varyingInfo);
      table[`out ${glslDeclaration}`] = {
        [header]: JSON.stringify(varyingInfo.accessor)
      };
    }
  }

  return table;
}

function getGLSLDeclaration(attributeInfo) {
  const {
    type,
    size
  } = attributeInfo.accessor;
  const typeAndName = (0,_webgl_utils_attribute_utils__WEBPACK_IMPORTED_MODULE_0__.getCompositeGLType)(type, size);

  if (typeAndName) {
    return `${typeAndName.name} ${attributeInfo.name}`;
  }

  return attributeInfo.name;
}
//# sourceMappingURL=debug-program-configuration.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/debug/debug-uniforms.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/debug/debug-uniforms.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getDebugTableForUniforms": () => (/* binding */ getDebugTableForUniforms)
/* harmony export */ });
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");
/* harmony import */ var _utils_format_value__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/format-value */ "./node_modules/@luma.gl/webgl/dist/esm/utils/format-value.js");


function getDebugTableForUniforms({
  header = 'Uniforms',
  program,
  uniforms,
  undefinedOnly = false
}) {
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(program);
  const SHADER_MODULE_UNIFORM_REGEXP = '.*_.*';
  const PROJECT_MODULE_UNIFORM_REGEXP = '.*Matrix';
  const uniformLocations = program._uniformSetters;
  const table = {};
  const uniformNames = Object.keys(uniformLocations).sort();
  let count = 0;

  for (const uniformName of uniformNames) {
    if (!uniformName.match(SHADER_MODULE_UNIFORM_REGEXP) && !uniformName.match(PROJECT_MODULE_UNIFORM_REGEXP)) {
      if (addUniformToTable({
        table,
        header,
        uniforms,
        uniformName,
        undefinedOnly
      })) {
        count++;
      }
    }
  }

  for (const uniformName of uniformNames) {
    if (uniformName.match(PROJECT_MODULE_UNIFORM_REGEXP)) {
      if (addUniformToTable({
        table,
        header,
        uniforms,
        uniformName,
        undefinedOnly
      })) {
        count++;
      }
    }
  }

  for (const uniformName of uniformNames) {
    if (!table[uniformName]) {
      if (addUniformToTable({
        table,
        header,
        uniforms,
        uniformName,
        undefinedOnly
      })) {
        count++;
      }
    }
  }

  let unusedCount = 0;
  const unusedTable = {};

  if (!undefinedOnly) {
    for (const uniformName in uniforms) {
      const uniform = uniforms[uniformName];

      if (!table[uniformName]) {
        unusedCount++;
        unusedTable[uniformName] = {
          Type: `NOT USED: ${uniform}`,
          [header]: (0,_utils_format_value__WEBPACK_IMPORTED_MODULE_1__.formatValue)(uniform)
        };
      }
    }
  }

  return {
    table,
    count,
    unusedTable,
    unusedCount
  };
}

function addUniformToTable({
  table,
  header,
  uniforms,
  uniformName,
  undefinedOnly
}) {
  const value = uniforms[uniformName];
  const isDefined = isUniformDefined(value);

  if (!undefinedOnly || !isDefined) {
    table[uniformName] = {
      [header]: isDefined ? (0,_utils_format_value__WEBPACK_IMPORTED_MODULE_1__.formatValue)(value) : 'N/A',
      'Uniform Type': isDefined ? value : 'NOT PROVIDED'
    };
    return true;
  }

  return false;
}

function isUniformDefined(value) {
  return value !== undefined && value !== null;
}
//# sourceMappingURL=debug-uniforms.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/debug/debug-vertex-array.js":
/*!**************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/debug/debug-vertex-array.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getDebugTableForVertexArray": () => (/* binding */ getDebugTableForVertexArray)
/* harmony export */ });
/* harmony import */ var _classes_buffer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../classes/buffer */ "./node_modules/@luma.gl/webgl/dist/esm/classes/buffer.js");
/* harmony import */ var _webgl_utils_constants_to_keys__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../webgl-utils/constants-to-keys */ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/constants-to-keys.js");
/* harmony import */ var _webgl_utils_attribute_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../webgl-utils/attribute-utils */ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/attribute-utils.js");
/* harmony import */ var _utils_format_value__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/format-value */ "./node_modules/@luma.gl/webgl/dist/esm/utils/format-value.js");




function getDebugTableForVertexArray({
  vertexArray,
  header = 'Attributes'
}) {
  if (!vertexArray.configuration) {
    return {};
  }

  const table = {};

  if (vertexArray.elements) {
    table.ELEMENT_ARRAY_BUFFER = getDebugTableRow(vertexArray, vertexArray.elements, null, header);
  }

  const attributes = vertexArray.values;

  for (const attributeLocation in attributes) {
    const info = vertexArray._getAttributeInfo(attributeLocation);

    if (info) {
      let rowHeader = `${attributeLocation}: ${info.name}`;
      const accessor = vertexArray.accessors[info.location];

      if (accessor) {
        rowHeader = `${attributeLocation}: ${getGLSLDeclaration(info.name, accessor)}`;
      }

      table[rowHeader] = getDebugTableRow(vertexArray, attributes[attributeLocation], accessor, header);
    }
  }

  return table;
}

function getDebugTableRow(vertexArray, attribute, accessor, header) {
  const {
    gl
  } = vertexArray;

  if (!attribute) {
    return {
      [header]: 'null',
      'Format ': 'N/A'
    };
  }

  let type = 'NOT PROVIDED';
  let size = 1;
  let verts = 0;
  let bytes = 0;
  let isInteger;
  let marker;
  let value;

  if (accessor) {
    type = accessor.type;
    size = accessor.size;
    type = String(type).replace('Array', '');
    isInteger = type.indexOf('nt') !== -1;
  }

  if (attribute instanceof _classes_buffer__WEBPACK_IMPORTED_MODULE_0__["default"]) {
    const buffer = attribute;
    const {
      data,
      changed
    } = buffer.getDebugData();
    marker = changed ? '*' : '';
    value = data;
    bytes = buffer.byteLength;
    verts = bytes / data.BYTES_PER_ELEMENT / size;
    let format;

    if (accessor) {
      const instanced = accessor.divisor > 0;
      format = `${instanced ? 'I ' : 'P '} ${verts} (x${size}=${bytes} bytes ${(0,_webgl_utils_constants_to_keys__WEBPACK_IMPORTED_MODULE_1__.getKey)(gl, type)})`;
    } else {
      isInteger = true;
      format = `${bytes} bytes`;
    }

    return {
      [header]: `${marker}${(0,_utils_format_value__WEBPACK_IMPORTED_MODULE_2__.formatValue)(value, {
        size,
        isInteger
      })}`,
      'Format ': format
    };
  }

  value = attribute;
  size = attribute.length;
  type = String(attribute.constructor.name).replace('Array', '');
  isInteger = type.indexOf('nt') !== -1;
  return {
    [header]: `${(0,_utils_format_value__WEBPACK_IMPORTED_MODULE_2__.formatValue)(value, {
      size,
      isInteger
    })} (constant)`,
    'Format ': `${size}x${type} (constant)`
  };
}

function getGLSLDeclaration(name, accessor) {
  const {
    type,
    size
  } = accessor;
  const typeAndName = (0,_webgl_utils_attribute_utils__WEBPACK_IMPORTED_MODULE_3__.getCompositeGLType)(type, size);
  return typeAndName ? `${name} (${typeAndName.name})` : name;
}
//# sourceMappingURL=debug-vertex-array.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/features/features.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/features/features.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "hasFeature": () => (/* binding */ hasFeature),
/* harmony export */   "hasFeatures": () => (/* binding */ hasFeatures),
/* harmony export */   "getFeatures": () => (/* binding */ getFeatures)
/* harmony export */ });
/* harmony import */ var _webgl_features_table__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./webgl-features-table */ "./node_modules/@luma.gl/webgl/dist/esm/features/webgl-features-table.js");
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");



const LOG_UNSUPPORTED_FEATURE = 2;
function hasFeature(gl, feature) {
  return hasFeatures(gl, feature);
}
function hasFeatures(gl, features) {
  features = Array.isArray(features) ? features : [features];
  return features.every(feature => {
    return isFeatureSupported(gl, feature);
  });
}
function getFeatures(gl) {
  gl.luma = gl.luma || {};
  gl.luma.caps = gl.luma.caps || {};

  for (const cap in _webgl_features_table__WEBPACK_IMPORTED_MODULE_1__["default"]) {
    if (gl.luma.caps[cap] === undefined) {
      gl.luma.caps[cap] = isFeatureSupported(gl, cap);
    }
  }

  return gl.luma.caps;
}

function isFeatureSupported(gl, cap) {
  gl.luma = gl.luma || {};
  gl.luma.caps = gl.luma.caps || {};

  if (gl.luma.caps[cap] === undefined) {
    gl.luma.caps[cap] = queryFeature(gl, cap);
  }

  if (!gl.luma.caps[cap]) {
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.log(LOG_UNSUPPORTED_FEATURE, `Feature: ${cap} not supported`)();
  }

  return gl.luma.caps[cap];
}

function queryFeature(gl, cap) {
  const feature = _webgl_features_table__WEBPACK_IMPORTED_MODULE_1__["default"][cap];
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_2__.assert)(feature, cap);
  let isSupported;
  const featureDefinition = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl) ? feature[1] || feature[0] : feature[0];

  if (typeof featureDefinition === 'function') {
    isSupported = featureDefinition(gl);
  } else if (Array.isArray(featureDefinition)) {
    isSupported = true;

    for (const extension of featureDefinition) {
      isSupported = isSupported && Boolean(gl.getExtension(extension));
    }
  } else if (typeof featureDefinition === 'string') {
    isSupported = Boolean(gl.getExtension(featureDefinition));
  } else if (typeof featureDefinition === 'boolean') {
    isSupported = featureDefinition;
  } else {
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_2__.assert)(false);
  }

  return isSupported;
}
//# sourceMappingURL=features.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/features/webgl-features-table.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/features/webgl-features-table.js ***!
  \*******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "FEATURES": () => (/* binding */ FEATURES),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _classes_framebuffer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../classes/framebuffer */ "./node_modules/@luma.gl/webgl/dist/esm/classes/framebuffer.js");
/* harmony import */ var _classes_texture_2d__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../classes/texture-2d */ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture-2d.js");


const FEATURES = {
  WEBGL2: 'WEBGL2',
  VERTEX_ARRAY_OBJECT: 'VERTEX_ARRAY_OBJECT',
  TIMER_QUERY: 'TIMER_QUERY',
  INSTANCED_RENDERING: 'INSTANCED_RENDERING',
  MULTIPLE_RENDER_TARGETS: 'MULTIPLE_RENDER_TARGETS',
  ELEMENT_INDEX_UINT32: 'ELEMENT_INDEX_UINT32',
  BLEND_EQUATION_MINMAX: 'BLEND_EQUATION_MINMAX',
  FLOAT_BLEND: 'FLOAT_BLEND',
  COLOR_ENCODING_SRGB: 'COLOR_ENCODING_SRGB',
  TEXTURE_DEPTH: 'TEXTURE_DEPTH',
  TEXTURE_FLOAT: 'TEXTURE_FLOAT',
  TEXTURE_HALF_FLOAT: 'TEXTURE_HALF_FLOAT',
  TEXTURE_FILTER_LINEAR_FLOAT: 'TEXTURE_FILTER_LINEAR_FLOAT',
  TEXTURE_FILTER_LINEAR_HALF_FLOAT: 'TEXTURE_FILTER_LINEAR_HALF_FLOAT',
  TEXTURE_FILTER_ANISOTROPIC: 'TEXTURE_FILTER_ANISOTROPIC',
  COLOR_ATTACHMENT_RGBA32F: 'COLOR_ATTACHMENT_RGBA32F',
  COLOR_ATTACHMENT_FLOAT: 'COLOR_ATTACHMENT_FLOAT',
  COLOR_ATTACHMENT_HALF_FLOAT: 'COLOR_ATTACHMENT_HALF_FLOAT',
  GLSL_FRAG_DATA: 'GLSL_FRAG_DATA',
  GLSL_FRAG_DEPTH: 'GLSL_FRAG_DEPTH',
  GLSL_DERIVATIVES: 'GLSL_DERIVATIVES',
  GLSL_TEXTURE_LOD: 'GLSL_TEXTURE_LOD'
};

function checkFloat32ColorAttachment(gl) {
  const testTexture = new _classes_texture_2d__WEBPACK_IMPORTED_MODULE_0__["default"](gl, {
    format: 6408,
    type: 5126,
    dataFormat: 6408
  });
  const testFb = new _classes_framebuffer__WEBPACK_IMPORTED_MODULE_1__["default"](gl, {
    id: `test-framebuffer`,
    check: false,
    attachments: {
      [36064]: testTexture
    }
  });
  const status = testFb.getStatus();
  testTexture.delete();
  testFb.delete();
  return status === 36053;
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  [FEATURES.WEBGL2]: [false, true],
  [FEATURES.VERTEX_ARRAY_OBJECT]: ['OES_vertex_array_object', true],
  [FEATURES.TIMER_QUERY]: ['EXT_disjoint_timer_query', 'EXT_disjoint_timer_query_webgl2'],
  [FEATURES.INSTANCED_RENDERING]: ['ANGLE_instanced_arrays', true],
  [FEATURES.MULTIPLE_RENDER_TARGETS]: ['WEBGL_draw_buffers', true],
  [FEATURES.ELEMENT_INDEX_UINT32]: ['OES_element_index_uint', true],
  [FEATURES.BLEND_EQUATION_MINMAX]: ['EXT_blend_minmax', true],
  [FEATURES.FLOAT_BLEND]: ['EXT_float_blend'],
  [FEATURES.COLOR_ENCODING_SRGB]: ['EXT_sRGB', true],
  [FEATURES.TEXTURE_DEPTH]: ['WEBGL_depth_texture', true],
  [FEATURES.TEXTURE_FLOAT]: ['OES_texture_float', true],
  [FEATURES.TEXTURE_HALF_FLOAT]: ['OES_texture_half_float', true],
  [FEATURES.TEXTURE_FILTER_LINEAR_FLOAT]: ['OES_texture_float_linear'],
  [FEATURES.TEXTURE_FILTER_LINEAR_HALF_FLOAT]: ['OES_texture_half_float_linear'],
  [FEATURES.TEXTURE_FILTER_ANISOTROPIC]: ['EXT_texture_filter_anisotropic'],
  [FEATURES.COLOR_ATTACHMENT_RGBA32F]: [checkFloat32ColorAttachment, 'EXT_color_buffer_float'],
  [FEATURES.COLOR_ATTACHMENT_FLOAT]: [false, 'EXT_color_buffer_float'],
  [FEATURES.COLOR_ATTACHMENT_HALF_FLOAT]: ['EXT_color_buffer_half_float'],
  [FEATURES.GLSL_FRAG_DATA]: ['WEBGL_draw_buffers', true],
  [FEATURES.GLSL_FRAG_DEPTH]: ['EXT_frag_depth', true],
  [FEATURES.GLSL_DERIVATIVES]: ['OES_standard_derivatives', true],
  [FEATURES.GLSL_TEXTURE_LOD]: ['EXT_shader_texture_lod', true]
});
//# sourceMappingURL=webgl-features-table.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/glsl-utils/format-glsl-error.js":
/*!******************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/glsl-utils/format-glsl-error.js ***!
  \******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ formatGLSLCompilerError),
/* harmony export */   "parseGLSLCompilerError": () => (/* binding */ parseGLSLCompilerError)
/* harmony export */ });
/* harmony import */ var _get_shader_name__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./get-shader-name */ "./node_modules/@luma.gl/webgl/dist/esm/glsl-utils/get-shader-name.js");
/* harmony import */ var _get_shader_type_name__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./get-shader-type-name */ "./node_modules/@luma.gl/webgl/dist/esm/glsl-utils/get-shader-type-name.js");


function formatGLSLCompilerError(errLog, src, shaderType) {
  const {
    shaderName,
    errors,
    warnings
  } = parseGLSLCompilerError(errLog, src, shaderType);
  return `GLSL compilation error in ${shaderName}\n\n${errors}\n${warnings}`;
}
function parseGLSLCompilerError(errLog, src, shaderType, shaderName) {
  const errorStrings = errLog.split(/\r?\n/);
  const errors = {};
  const warnings = {};
  const name = shaderName || (0,_get_shader_name__WEBPACK_IMPORTED_MODULE_0__["default"])(src) || '(unnamed)';
  const shaderDescription = `${(0,_get_shader_type_name__WEBPACK_IMPORTED_MODULE_1__["default"])(shaderType)} shader ${name}`;

  for (let i = 0; i < errorStrings.length; i++) {
    const errorString = errorStrings[i];

    if (errorString.length <= 1) {
      continue;
    }

    const segments = errorString.split(':');
    const type = segments[0];
    const line = parseInt(segments[2], 10);

    if (isNaN(line)) {
      throw new Error(`GLSL compilation error in ${shaderDescription}: ${errLog}`);
    }

    if (type !== 'WARNING') {
      errors[line] = errorString;
    } else {
      warnings[line] = errorString;
    }
  }

  const lines = addLineNumbers(src);
  return {
    shaderName: shaderDescription,
    errors: formatErrors(errors, lines),
    warnings: formatErrors(warnings, lines)
  };
}

function formatErrors(errors, lines) {
  let message = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!errors[i + 3] && !errors[i + 2] && !errors[i + 1]) {
      continue;
    }

    message += `${line}\n`;

    if (errors[i + 1]) {
      const error = errors[i + 1];
      const segments = error.split(':', 3);
      const type = segments[0];
      const column = parseInt(segments[1], 10) || 0;
      const err = error.substring(segments.join(':').length + 1).trim();
      message += padLeft(`^^^ ${type}: ${err}\n\n`, column);
    }
  }

  return message;
}

function addLineNumbers(string, start = 1, delim = ': ') {
  const lines = string.split(/\r?\n/);
  const maxDigits = String(lines.length + start - 1).length;
  return lines.map((line, i) => {
    const lineNumber = String(i + start);
    const digits = lineNumber.length;
    const prefix = padLeft(lineNumber, maxDigits - digits);
    return prefix + delim + line;
  });
}

function padLeft(string, digits) {
  let result = '';

  for (let i = 0; i < digits; ++i) {
    result += ' ';
  }

  return `${result}${string}`;
}
//# sourceMappingURL=format-glsl-error.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/glsl-utils/get-shader-name.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/glsl-utils/get-shader-name.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ getShaderName)
/* harmony export */ });
function getShaderName(shader, defaultName = 'unnamed') {
  const SHADER_NAME_REGEXP = /#define[\s*]SHADER_NAME[\s*]([A-Za-z0-9_-]+)[\s*]/;
  const match = shader.match(SHADER_NAME_REGEXP);
  return match ? match[1] : defaultName;
}
//# sourceMappingURL=get-shader-name.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/glsl-utils/get-shader-type-name.js":
/*!*********************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/glsl-utils/get-shader-type-name.js ***!
  \*********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ getShaderTypeName)
/* harmony export */ });
const GL_FRAGMENT_SHADER = 0x8b30;
const GL_VERTEX_SHADER = 0x8b31;
function getShaderTypeName(type) {
  switch (type) {
    case GL_FRAGMENT_SHADER:
      return 'fragment';

    case GL_VERTEX_SHADER:
      return 'vertex';

    default:
      return 'unknown type';
  }
}
//# sourceMappingURL=get-shader-type-name.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/glsl-utils/get-shader-version.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/glsl-utils/get-shader-version.js ***!
  \*******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ getShaderVersion)
/* harmony export */ });
function getShaderVersion(source) {
  let version = 100;
  const words = source.match(/[^\s]+/g);

  if (words.length >= 2 && words[0] === '#version') {
    const v = parseInt(words[1], 10);

    if (Number.isFinite(v)) {
      version = v;
    }
  }

  return version;
}
//# sourceMappingURL=get-shader-version.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/init.js":
/*!******************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/init.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "lumaStats": () => (/* binding */ lumaStats),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var probe_gl__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! probe.gl */ "./node_modules/@probe.gl/stats/dist/esm/index.js");
/* harmony import */ var probe_gl_env__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! probe.gl/env */ "./node_modules/probe.gl/dist/es5/env/index.js");



const VERSION =  true ? "8.5.10" : 0;
const STARTUP_MESSAGE = 'set luma.log.level=1 (or higher) to trace rendering';

class StatsManager {
  constructor() {
    this.stats = new Map();
  }

  get(name) {
    if (!this.stats.has(name)) {
      this.stats.set(name, new probe_gl__WEBPACK_IMPORTED_MODULE_1__.Stats({
        id: name
      }));
    }

    return this.stats.get(name);
  }

}

const lumaStats = new StatsManager();

if (probe_gl_env__WEBPACK_IMPORTED_MODULE_2__.global.luma && probe_gl_env__WEBPACK_IMPORTED_MODULE_2__.global.luma.VERSION !== VERSION) {
  throw new Error(`luma.gl - multiple VERSIONs detected: ${probe_gl_env__WEBPACK_IMPORTED_MODULE_2__.global.luma.VERSION} vs ${VERSION}`);
}

if (!probe_gl_env__WEBPACK_IMPORTED_MODULE_2__.global.luma) {
  if ((0,probe_gl_env__WEBPACK_IMPORTED_MODULE_2__.isBrowser)()) {
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.log(1, `luma.gl ${VERSION} - ${STARTUP_MESSAGE}`)();
  }

  probe_gl_env__WEBPACK_IMPORTED_MODULE_2__.global.luma = probe_gl_env__WEBPACK_IMPORTED_MODULE_2__.global.luma || {
    VERSION,
    version: VERSION,
    log: _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log,
    stats: lumaStats,
    globals: {
      modules: {},
      nodeIO: {}
    }
  };
}


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (probe_gl_env__WEBPACK_IMPORTED_MODULE_2__.global.luma);
//# sourceMappingURL=init.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/utils/array-utils-flat.js":
/*!************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/utils/array-utils-flat.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getScratchArrayBuffer": () => (/* binding */ getScratchArrayBuffer),
/* harmony export */   "getScratchArray": () => (/* binding */ getScratchArray),
/* harmony export */   "fillArray": () => (/* binding */ fillArray)
/* harmony export */ });
let arrayBuffer = null;
function getScratchArrayBuffer(byteLength) {
  if (!arrayBuffer || arrayBuffer.byteLength < byteLength) {
    arrayBuffer = new ArrayBuffer(byteLength);
  }

  return arrayBuffer;
}
function getScratchArray(Type, length) {
  const scratchArrayBuffer = getScratchArrayBuffer(Type.BYTES_PER_ELEMENT * length);
  return new Type(scratchArrayBuffer, 0, length);
}
function fillArray({
  target,
  source,
  start = 0,
  count = 1
}) {
  const length = source.length;
  const total = count * length;
  let copied = 0;

  for (let i = start; copied < length; copied++) {
    target[i++] = source[copied];
  }

  while (copied < total) {
    if (copied < total - copied) {
      target.copyWithin(start + copied, start, start + copied);
      copied *= 2;
    } else {
      target.copyWithin(start + copied, start, start + total - copied);
      copied = total;
    }
  }

  return target;
}
//# sourceMappingURL=array-utils-flat.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js":
/*!**************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "assert": () => (/* binding */ assert)
/* harmony export */ });
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'luma.gl: assertion failed.');
  }
}
//# sourceMappingURL=assert.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/utils/check-props.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/utils/check-props.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "checkProps": () => (/* binding */ checkProps)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");

function checkProps(className, props, propChecks) {
  const {
    removedProps = {},
    deprecatedProps = {},
    replacedProps = {}
  } = propChecks;

  for (const propName in removedProps) {
    if (propName in props) {
      const replacementProp = removedProps[propName];
      const replacement = replacementProp ? `${className}.${removedProps[propName]}` : 'N/A';
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.removed(`${className}.${propName}`, replacement)();
    }
  }

  for (const propName in deprecatedProps) {
    if (propName in props) {
      const replacementProp = deprecatedProps[propName];
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.deprecated(`${className}.${propName}`, `${className}.${replacementProp}`)();
    }
  }

  let newProps = null;

  for (const propName in replacedProps) {
    if (propName in props) {
      const replacementProp = replacedProps[propName];
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.deprecated(`${className}.${propName}`, `${className}.${replacementProp}`)();
      newProps = newProps || Object.assign({}, props);
      newProps[replacementProp] = props[propName];
      delete newProps[propName];
    }
  }

  return newProps || props;
}
//# sourceMappingURL=check-props.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/utils/format-value.js":
/*!********************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/utils/format-value.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "formatValue": () => (/* binding */ formatValue)
/* harmony export */ });
function formatArrayValue(v, opts) {
  const {
    maxElts = 16,
    size = 1
  } = opts;
  let string = '[';

  for (let i = 0; i < v.length && i < maxElts; ++i) {
    if (i > 0) {
      string += `,${i % size === 0 ? ' ' : ''}`;
    }

    string += formatValue(v[i], opts);
  }

  const terminator = v.length > maxElts ? '...' : ']';
  return `${string}${terminator}`;
}

function formatValue(v, opts = {}) {
  const EPSILON = 1e-16;
  const {
    isInteger = false
  } = opts;

  if (Array.isArray(v) || ArrayBuffer.isView(v)) {
    return formatArrayValue(v, opts);
  }

  if (!Number.isFinite(v)) {
    return String(v);
  }

  if (Math.abs(v) < EPSILON) {
    return isInteger ? '0' : '0.';
  }

  if (isInteger) {
    return v.toFixed(0);
  }

  if (Math.abs(v) > 100 && Math.abs(v) < 10000) {
    return v.toFixed(0);
  }

  const string = v.toPrecision(2);
  const decimal = string.indexOf('.0');
  return decimal === string.length - 2 ? string.slice(0, -1) : string;
}
//# sourceMappingURL=format-value.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/utils/load-file.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/utils/load-file.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "setPathPrefix": () => (/* binding */ setPathPrefix),
/* harmony export */   "loadFile": () => (/* binding */ loadFile),
/* harmony export */   "loadImage": () => (/* binding */ loadImage)
/* harmony export */ });
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");
/* provided dependency */ var Promise = __webpack_require__(/*! es6-promise */ "./node_modules/es6-promise/dist/es6-promise.js");

let pathPrefix = '';
function setPathPrefix(prefix) {
  pathPrefix = prefix;
}
function loadFile(url, options = {}) {
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(typeof url === 'string');
  url = pathPrefix + url;
  const dataType = options.dataType || 'text';
  return fetch(url, options).then(res => res[dataType]());
}
function loadImage(url, opts) {
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(typeof url === 'string');
  url = pathPrefix + url;
  return new Promise((resolve, reject) => {
    try {
      const image = new Image();

      image.onload = () => resolve(image);

      image.onerror = () => reject(new Error(`Could not load image ${url}.`));

      image.crossOrigin = opts && opts.crossOrigin || 'anonymous';
      image.src = url;
    } catch (error) {
      reject(error);
    }
  });
}
//# sourceMappingURL=load-file.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/utils/stub-methods.js":
/*!********************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/utils/stub-methods.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "stubRemovedMethods": () => (/* binding */ stubRemovedMethods)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");

function stubRemovedMethods(instance, className, version, methodNames) {
  const upgradeMessage = `See luma.gl ${version} Upgrade Guide at \
https://luma.gl/docs/upgrade-guide`;
  const prototype = Object.getPrototypeOf(instance);
  methodNames.forEach(methodName => {
    if (prototype.methodName) {
      return;
    }

    prototype[methodName] = () => {
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.removed(`Calling removed method ${className}.${methodName}: `, upgradeMessage)();
      throw new Error(methodName);
    };
  });
}
//# sourceMappingURL=stub-methods.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/utils/utils.js":
/*!*************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/utils/utils.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "uid": () => (/* binding */ uid),
/* harmony export */   "isPowerOfTwo": () => (/* binding */ isPowerOfTwo),
/* harmony export */   "isObjectEmpty": () => (/* binding */ isObjectEmpty)
/* harmony export */ });
/* harmony import */ var _assert__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");

const uidCounters = {};
function uid(id = 'id') {
  uidCounters[id] = uidCounters[id] || 1;
  const count = uidCounters[id]++;
  return `${id}-${count}`;
}
function isPowerOfTwo(n) {
  (0,_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(typeof n === 'number', 'Input must be a number');
  return n && (n & n - 1) === 0;
}
function isObjectEmpty(obj) {
  let isEmpty = true;

  for (const key in obj) {
    isEmpty = false;
    break;
  }

  return isEmpty;
}
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/attribute-utils.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/attribute-utils.js ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getPrimitiveDrawMode": () => (/* binding */ getPrimitiveDrawMode),
/* harmony export */   "getPrimitiveCount": () => (/* binding */ getPrimitiveCount),
/* harmony export */   "getVertexCount": () => (/* binding */ getVertexCount),
/* harmony export */   "decomposeCompositeGLType": () => (/* binding */ decomposeCompositeGLType),
/* harmony export */   "getCompositeGLType": () => (/* binding */ getCompositeGLType)
/* harmony export */ });
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");

const GL_BYTE = 0x1400;
const GL_UNSIGNED_BYTE = 0x1401;
const GL_SHORT = 0x1402;
const GL_UNSIGNED_SHORT = 0x1403;
const GL_POINTS = 0x0;
const GL_LINES = 0x1;
const GL_LINE_LOOP = 0x2;
const GL_LINE_STRIP = 0x3;
const GL_TRIANGLES = 0x4;
const GL_TRIANGLE_STRIP = 0x5;
const GL_TRIANGLE_FAN = 0x6;
const GL_FLOAT = 0x1406;
const GL_FLOAT_VEC2 = 0x8b50;
const GL_FLOAT_VEC3 = 0x8b51;
const GL_FLOAT_VEC4 = 0x8b52;
const GL_INT = 0x1404;
const GL_INT_VEC2 = 0x8b53;
const GL_INT_VEC3 = 0x8b54;
const GL_INT_VEC4 = 0x8b55;
const GL_UNSIGNED_INT = 0x1405;
const GL_UNSIGNED_INT_VEC2 = 0x8dc6;
const GL_UNSIGNED_INT_VEC3 = 0x8dc7;
const GL_UNSIGNED_INT_VEC4 = 0x8dc8;
const GL_BOOL = 0x8b56;
const GL_BOOL_VEC2 = 0x8b57;
const GL_BOOL_VEC3 = 0x8b58;
const GL_BOOL_VEC4 = 0x8b59;
const GL_FLOAT_MAT2 = 0x8b5a;
const GL_FLOAT_MAT3 = 0x8b5b;
const GL_FLOAT_MAT4 = 0x8b5c;
const GL_FLOAT_MAT2x3 = 0x8b65;
const GL_FLOAT_MAT2x4 = 0x8b66;
const GL_FLOAT_MAT3x2 = 0x8b67;
const GL_FLOAT_MAT3x4 = 0x8b68;
const GL_FLOAT_MAT4x2 = 0x8b69;
const GL_FLOAT_MAT4x3 = 0x8b6a;
const COMPOSITE_GL_TYPES = {
  [GL_FLOAT]: [GL_FLOAT, 1, 'float'],
  [GL_FLOAT_VEC2]: [GL_FLOAT, 2, 'vec2'],
  [GL_FLOAT_VEC3]: [GL_FLOAT, 3, 'vec3'],
  [GL_FLOAT_VEC4]: [GL_FLOAT, 4, 'vec4'],
  [GL_INT]: [GL_INT, 1, 'int'],
  [GL_INT_VEC2]: [GL_INT, 2, 'ivec2'],
  [GL_INT_VEC3]: [GL_INT, 3, 'ivec3'],
  [GL_INT_VEC4]: [GL_INT, 4, 'ivec4'],
  [GL_UNSIGNED_INT]: [GL_UNSIGNED_INT, 1, 'uint'],
  [GL_UNSIGNED_INT_VEC2]: [GL_UNSIGNED_INT, 2, 'uvec2'],
  [GL_UNSIGNED_INT_VEC3]: [GL_UNSIGNED_INT, 3, 'uvec3'],
  [GL_UNSIGNED_INT_VEC4]: [GL_UNSIGNED_INT, 4, 'uvec4'],
  [GL_BOOL]: [GL_FLOAT, 1, 'bool'],
  [GL_BOOL_VEC2]: [GL_FLOAT, 2, 'bvec2'],
  [GL_BOOL_VEC3]: [GL_FLOAT, 3, 'bvec3'],
  [GL_BOOL_VEC4]: [GL_FLOAT, 4, 'bvec4'],
  [GL_FLOAT_MAT2]: [GL_FLOAT, 8, 'mat2'],
  [GL_FLOAT_MAT2x3]: [GL_FLOAT, 8, 'mat2x3'],
  [GL_FLOAT_MAT2x4]: [GL_FLOAT, 8, 'mat2x4'],
  [GL_FLOAT_MAT3]: [GL_FLOAT, 12, 'mat3'],
  [GL_FLOAT_MAT3x2]: [GL_FLOAT, 12, 'mat3x2'],
  [GL_FLOAT_MAT3x4]: [GL_FLOAT, 12, 'mat3x4'],
  [GL_FLOAT_MAT4]: [GL_FLOAT, 16, 'mat4'],
  [GL_FLOAT_MAT4x2]: [GL_FLOAT, 16, 'mat4x2'],
  [GL_FLOAT_MAT4x3]: [GL_FLOAT, 16, 'mat4x3']
};
function getPrimitiveDrawMode(drawMode) {
  switch (drawMode) {
    case GL_POINTS:
      return GL_POINTS;

    case GL_LINES:
      return GL_LINES;

    case GL_LINE_STRIP:
      return GL_LINES;

    case GL_LINE_LOOP:
      return GL_LINES;

    case GL_TRIANGLES:
      return GL_TRIANGLES;

    case GL_TRIANGLE_STRIP:
      return GL_TRIANGLES;

    case GL_TRIANGLE_FAN:
      return GL_TRIANGLES;

    default:
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(false);
      return 0;
  }
}
function getPrimitiveCount({
  drawMode,
  vertexCount
}) {
  switch (drawMode) {
    case GL_POINTS:
    case GL_LINE_LOOP:
      return vertexCount;

    case GL_LINES:
      return vertexCount / 2;

    case GL_LINE_STRIP:
      return vertexCount - 1;

    case GL_TRIANGLES:
      return vertexCount / 3;

    case GL_TRIANGLE_STRIP:
    case GL_TRIANGLE_FAN:
      return vertexCount - 2;

    default:
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(false);
      return 0;
  }
}
function getVertexCount({
  drawMode,
  vertexCount
}) {
  const primitiveCount = getPrimitiveCount({
    drawMode,
    vertexCount
  });

  switch (getPrimitiveDrawMode(drawMode)) {
    case GL_POINTS:
      return primitiveCount;

    case GL_LINES:
      return primitiveCount * 2;

    case GL_TRIANGLES:
      return primitiveCount * 3;

    default:
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(false);
      return 0;
  }
}
function decomposeCompositeGLType(compositeGLType) {
  const typeAndSize = COMPOSITE_GL_TYPES[compositeGLType];

  if (!typeAndSize) {
    return null;
  }

  const [type, components] = typeAndSize;
  return {
    type,
    components
  };
}
function getCompositeGLType(type, components) {
  switch (type) {
    case GL_BYTE:
    case GL_UNSIGNED_BYTE:
    case GL_SHORT:
    case GL_UNSIGNED_SHORT:
      type = GL_FLOAT;
      break;

    default:
  }

  for (const glType in COMPOSITE_GL_TYPES) {
    const [compType, compComponents, name] = COMPOSITE_GL_TYPES[glType];

    if (compType === type && compComponents === components) {
      return {
        glType,
        name
      };
    }
  }

  return null;
}
//# sourceMappingURL=attribute-utils.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/constants-to-keys.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/constants-to-keys.js ***!
  \*******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getKeyValue": () => (/* binding */ getKeyValue),
/* harmony export */   "getKey": () => (/* binding */ getKey),
/* harmony export */   "getKeyType": () => (/* binding */ getKeyType)
/* harmony export */ });
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");

function getKeyValue(gl, name) {
  if (typeof name !== 'string') {
    return name;
  }

  const number = Number(name);

  if (!isNaN(number)) {
    return number;
  }

  name = name.replace(/^.*\./, '');
  const value = gl[name];
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(value !== undefined, `Accessing undefined constant GL.${name}`);
  return value;
}
function getKey(gl, value) {
  value = Number(value);

  for (const key in gl) {
    if (gl[key] === value) {
      return `GL.${key}`;
    }
  }

  return String(value);
}
function getKeyType(gl, value) {
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(value !== undefined, 'undefined key');
  value = Number(value);

  for (const key in gl) {
    if (gl[key] === value) {
      return `GL.${key}`;
    }
  }

  return String(value);
}
//# sourceMappingURL=constants-to-keys.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/format-utils.js":
/*!**************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/format-utils.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "glFormatToComponents": () => (/* binding */ glFormatToComponents),
/* harmony export */   "glTypeToBytes": () => (/* binding */ glTypeToBytes)
/* harmony export */ });
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");

function glFormatToComponents(format) {
  switch (format) {
    case 6406:
    case 33326:
    case 6403:
      return 1;

    case 33328:
    case 33319:
      return 2;

    case 6407:
    case 34837:
      return 3;

    case 6408:
    case 34836:
      return 4;

    default:
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(false);
      return 0;
  }
}
function glTypeToBytes(type) {
  switch (type) {
    case 5121:
      return 1;

    case 33635:
    case 32819:
    case 32820:
      return 2;

    case 5126:
      return 4;

    default:
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(false);
      return 0;
  }
}
//# sourceMappingURL=format-utils.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/request-animation-frame.js":
/*!*************************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/request-animation-frame.js ***!
  \*************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "requestAnimationFrame": () => (/* binding */ requestAnimationFrame),
/* harmony export */   "cancelAnimationFrame": () => (/* binding */ cancelAnimationFrame)
/* harmony export */ });
function requestAnimationFrame(callback) {
  return typeof window !== 'undefined' && window.requestAnimationFrame ? window.requestAnimationFrame(callback) : setTimeout(callback, 1000 / 60);
}
function cancelAnimationFrame(timerId) {
  return typeof window !== 'undefined' && window.cancelAnimationFrame ? window.cancelAnimationFrame(timerId) : clearTimeout(timerId);
}
//# sourceMappingURL=request-animation-frame.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/texture-utils.js":
/*!***************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/texture-utils.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "cloneTextureFrom": () => (/* binding */ cloneTextureFrom),
/* harmony export */   "toFramebuffer": () => (/* binding */ toFramebuffer)
/* harmony export */ });
/* harmony import */ var _classes_texture_2d__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../classes/texture-2d */ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture-2d.js");
/* harmony import */ var _classes_texture_cube__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../classes/texture-cube */ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture-cube.js");
/* harmony import */ var _classes_texture_3d__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../classes/texture-3d */ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture-3d.js");
/* harmony import */ var _classes_framebuffer__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../classes/framebuffer */ "./node_modules/@luma.gl/webgl/dist/esm/classes/framebuffer.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");





function cloneTextureFrom(refTexture, overrides) {
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(refTexture instanceof _classes_texture_2d__WEBPACK_IMPORTED_MODULE_1__["default"] || refTexture instanceof _classes_texture_cube__WEBPACK_IMPORTED_MODULE_2__["default"] || refTexture instanceof _classes_texture_3d__WEBPACK_IMPORTED_MODULE_3__["default"]);
  const TextureType = refTexture.constructor;
  const {
    gl,
    width,
    height,
    format,
    type,
    dataFormat,
    border,
    mipmaps
  } = refTexture;
  const textureOptions = Object.assign({
    width,
    height,
    format,
    type,
    dataFormat,
    border,
    mipmaps
  }, overrides);
  return new TextureType(gl, textureOptions);
}
function toFramebuffer(texture, opts) {
  const {
    gl,
    width,
    height,
    id
  } = texture;
  const framebuffer = new _classes_framebuffer__WEBPACK_IMPORTED_MODULE_4__["default"](gl, Object.assign({}, opts, {
    id: `framebuffer-for-${id}`,
    width,
    height,
    attachments: {
      [36064]: texture
    }
  }));
  return framebuffer;
}
//# sourceMappingURL=texture-utils.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/typed-array-utils.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/typed-array-utils.js ***!
  \*******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getGLTypeFromTypedArray": () => (/* binding */ getGLTypeFromTypedArray),
/* harmony export */   "getTypedArrayFromGLType": () => (/* binding */ getTypedArrayFromGLType),
/* harmony export */   "flipRows": () => (/* binding */ flipRows),
/* harmony export */   "scalePixels": () => (/* binding */ scalePixels)
/* harmony export */ });
const ERR_TYPE_DEDUCTION = 'Failed to deduce GL constant from typed array';
function getGLTypeFromTypedArray(arrayOrType) {
  const type = ArrayBuffer.isView(arrayOrType) ? arrayOrType.constructor : arrayOrType;

  switch (type) {
    case Float32Array:
      return 5126;

    case Uint16Array:
      return 5123;

    case Uint32Array:
      return 5125;

    case Uint8Array:
      return 5121;

    case Uint8ClampedArray:
      return 5121;

    case Int8Array:
      return 5120;

    case Int16Array:
      return 5122;

    case Int32Array:
      return 5124;

    default:
      throw new Error(ERR_TYPE_DEDUCTION);
  }
}
function getTypedArrayFromGLType(glType, {
  clamped = true
} = {}) {
  switch (glType) {
    case 5126:
      return Float32Array;

    case 5123:
    case 33635:
    case 32819:
    case 32820:
      return Uint16Array;

    case 5125:
      return Uint32Array;

    case 5121:
      return clamped ? Uint8ClampedArray : Uint8Array;

    case 5120:
      return Int8Array;

    case 5122:
      return Int16Array;

    case 5124:
      return Int32Array;

    default:
      throw new Error('Failed to deduce typed array type from GL constant');
  }
}
function flipRows({
  data,
  width,
  height,
  bytesPerPixel = 4,
  temp
}) {
  const bytesPerRow = width * bytesPerPixel;
  temp = temp || new Uint8Array(bytesPerRow);

  for (let y = 0; y < height / 2; ++y) {
    const topOffset = y * bytesPerRow;
    const bottomOffset = (height - y - 1) * bytesPerRow;
    temp.set(data.subarray(topOffset, topOffset + bytesPerRow));
    data.copyWithin(topOffset, bottomOffset, bottomOffset + bytesPerRow);
    data.set(temp, bottomOffset);
  }
}
function scalePixels({
  data,
  width,
  height
}) {
  const newWidth = Math.round(width / 2);
  const newHeight = Math.round(height / 2);
  const newData = new Uint8Array(newWidth * newHeight * 4);

  for (let y = 0; y < newHeight; y++) {
    for (let x = 0; x < newWidth; x++) {
      for (let c = 0; c < 4; c++) {
        newData[(y * newWidth + x) * 4 + c] = data[(y * 2 * width + x * 2) * 4 + c];
      }
    }
  }

  return {
    data: newData,
    width: newWidth,
    height: newHeight
  };
}
//# sourceMappingURL=typed-array-utils.js.map

/***/ }),

/***/ "./node_modules/@probe.gl/stats/dist/esm/index.js":
/*!********************************************************!*\
  !*** ./node_modules/@probe.gl/stats/dist/esm/index.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Stats": () => (/* reexport safe */ _lib_stats__WEBPACK_IMPORTED_MODULE_0__["default"]),
/* harmony export */   "Stat": () => (/* reexport safe */ _lib_stat__WEBPACK_IMPORTED_MODULE_1__["default"]),
/* harmony export */   "_getHiResTimestamp": () => (/* reexport safe */ _utils_hi_res_timestamp__WEBPACK_IMPORTED_MODULE_2__["default"])
/* harmony export */ });
/* harmony import */ var _lib_stats__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./lib/stats */ "./node_modules/@probe.gl/stats/dist/esm/lib/stats.js");
/* harmony import */ var _lib_stat__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./lib/stat */ "./node_modules/@probe.gl/stats/dist/esm/lib/stat.js");
/* harmony import */ var _utils_hi_res_timestamp__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils/hi-res-timestamp */ "./node_modules/@probe.gl/stats/dist/esm/utils/hi-res-timestamp.js");



//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@probe.gl/stats/dist/esm/lib/stat.js":
/*!***********************************************************!*\
  !*** ./node_modules/@probe.gl/stats/dist/esm/lib/stat.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Stat)
/* harmony export */ });
/* harmony import */ var _utils_hi_res_timestamp__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/hi-res-timestamp */ "./node_modules/@probe.gl/stats/dist/esm/utils/hi-res-timestamp.js");

class Stat {
  constructor(name, type) {
    this.name = name;
    this.type = type;
    this.sampleSize = 1;
    this.reset();
  }

  setSampleSize(samples) {
    this.sampleSize = samples;
    return this;
  }

  incrementCount() {
    this.addCount(1);
    return this;
  }

  decrementCount() {
    this.subtractCount(1);
    return this;
  }

  addCount(value) {
    this._count += value;
    this._samples++;

    this._checkSampling();

    return this;
  }

  subtractCount(value) {
    this._count -= value;
    this._samples++;

    this._checkSampling();

    return this;
  }

  addTime(time) {
    this._time += time;
    this.lastTiming = time;
    this._samples++;

    this._checkSampling();

    return this;
  }

  timeStart() {
    this._startTime = (0,_utils_hi_res_timestamp__WEBPACK_IMPORTED_MODULE_0__["default"])();
    this._timerPending = true;
    return this;
  }

  timeEnd() {
    if (!this._timerPending) {
      return this;
    }

    this.addTime((0,_utils_hi_res_timestamp__WEBPACK_IMPORTED_MODULE_0__["default"])() - this._startTime);
    this._timerPending = false;

    this._checkSampling();

    return this;
  }

  getSampleAverageCount() {
    return this.sampleSize > 0 ? this.lastSampleCount / this.sampleSize : 0;
  }

  getSampleAverageTime() {
    return this.sampleSize > 0 ? this.lastSampleTime / this.sampleSize : 0;
  }

  getSampleHz() {
    return this.lastSampleTime > 0 ? this.sampleSize / (this.lastSampleTime / 1000) : 0;
  }

  getAverageCount() {
    return this.samples > 0 ? this.count / this.samples : 0;
  }

  getAverageTime() {
    return this.samples > 0 ? this.time / this.samples : 0;
  }

  getHz() {
    return this.time > 0 ? this.samples / (this.time / 1000) : 0;
  }

  reset() {
    this.time = 0;
    this.count = 0;
    this.samples = 0;
    this.lastTiming = 0;
    this.lastSampleTime = 0;
    this.lastSampleCount = 0;
    this._count = 0;
    this._time = 0;
    this._samples = 0;
    this._startTime = 0;
    this._timerPending = false;
    return this;
  }

  _checkSampling() {
    if (this._samples === this.sampleSize) {
      this.lastSampleTime = this._time;
      this.lastSampleCount = this._count;
      this.count += this._count;
      this.time += this._time;
      this.samples += this._samples;
      this._time = 0;
      this._count = 0;
      this._samples = 0;
    }
  }

}
//# sourceMappingURL=stat.js.map

/***/ }),

/***/ "./node_modules/@probe.gl/stats/dist/esm/lib/stats.js":
/*!************************************************************!*\
  !*** ./node_modules/@probe.gl/stats/dist/esm/lib/stats.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Stats)
/* harmony export */ });
/* harmony import */ var _stat__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./stat */ "./node_modules/@probe.gl/stats/dist/esm/lib/stat.js");

class Stats {
  constructor({
    id,
    stats
  }) {
    this.id = id;
    this.stats = {};

    this._initializeStats(stats);

    Object.seal(this);
  }

  get(name, type = 'count') {
    return this._getOrCreate({
      name,
      type
    });
  }

  get size() {
    return Object.keys(this.stats).length;
  }

  reset() {
    for (const key in this.stats) {
      this.stats[key].reset();
    }

    return this;
  }

  forEach(fn) {
    for (const key in this.stats) {
      fn(this.stats[key]);
    }
  }

  getTable() {
    const table = {};
    this.forEach(stat => {
      table[stat.name] = {
        time: stat.time || 0,
        count: stat.count || 0,
        average: stat.getAverageTime() || 0,
        hz: stat.getHz() || 0
      };
    });
    return table;
  }

  _initializeStats(stats = []) {
    stats.forEach(stat => this._getOrCreate(stat));
  }

  _getOrCreate(stat) {
    if (!stat || !stat.name) {
      return null;
    }

    const {
      name,
      type
    } = stat;

    if (!this.stats[name]) {
      if (stat instanceof _stat__WEBPACK_IMPORTED_MODULE_0__["default"]) {
        this.stats[name] = stat;
      } else {
        this.stats[name] = new _stat__WEBPACK_IMPORTED_MODULE_0__["default"](name, type);
      }
    }

    return this.stats[name];
  }

}
//# sourceMappingURL=stats.js.map

/***/ }),

/***/ "./node_modules/@probe.gl/stats/dist/esm/utils/hi-res-timestamp.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@probe.gl/stats/dist/esm/utils/hi-res-timestamp.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ getHiResTimestamp)
/* harmony export */ });
function getHiResTimestamp() {
  let timestamp;

  if (typeof window !== 'undefined' && window.performance) {
    timestamp = window.performance.now();
  } else if (typeof process !== 'undefined' && process.hrtime) {
    const timeParts = process.hrtime();
    timestamp = timeParts[0] * 1000 + timeParts[1] / 1e6;
  } else {
    timestamp = Date.now();
  }

  return timestamp;
}
//# sourceMappingURL=hi-res-timestamp.js.map

/***/ }),

/***/ "./node_modules/es6-promise/dist/es6-promise.js":
/*!******************************************************!*\
  !*** ./node_modules/es6-promise/dist/es6-promise.js ***!
  \******************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
 * @version   v4.2.8+1e68dce6
 */

(function (global, factory) {
	 true ? module.exports = factory() :
	0;
}(this, (function () { 'use strict';

function objectOrFunction(x) {
  var type = typeof x;
  return x !== null && (type === 'object' || type === 'function');
}

function isFunction(x) {
  return typeof x === 'function';
}



var _isArray = void 0;
if (Array.isArray) {
  _isArray = Array.isArray;
} else {
  _isArray = function (x) {
    return Object.prototype.toString.call(x) === '[object Array]';
  };
}

var isArray = _isArray;

var len = 0;
var vertxNext = void 0;
var customSchedulerFn = void 0;

var asap = function asap(callback, arg) {
  queue[len] = callback;
  queue[len + 1] = arg;
  len += 2;
  if (len === 2) {
    // If len is 2, that means that we need to schedule an async flush.
    // If additional callbacks are queued before the queue is flushed, they
    // will be processed by this flush that we are scheduling.
    if (customSchedulerFn) {
      customSchedulerFn(flush);
    } else {
      scheduleFlush();
    }
  }
};

function setScheduler(scheduleFn) {
  customSchedulerFn = scheduleFn;
}

function setAsap(asapFn) {
  asap = asapFn;
}

var browserWindow = typeof window !== 'undefined' ? window : undefined;
var browserGlobal = browserWindow || {};
var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

// test for web worker but not in IE10
var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

// node
function useNextTick() {
  // node version 0.10.x displays a deprecation warning when nextTick is used recursively
  // see https://github.com/cujojs/when/issues/410 for details
  return function () {
    return process.nextTick(flush);
  };
}

// vertx
function useVertxTimer() {
  if (typeof vertxNext !== 'undefined') {
    return function () {
      vertxNext(flush);
    };
  }

  return useSetTimeout();
}

function useMutationObserver() {
  var iterations = 0;
  var observer = new BrowserMutationObserver(flush);
  var node = document.createTextNode('');
  observer.observe(node, { characterData: true });

  return function () {
    node.data = iterations = ++iterations % 2;
  };
}

// web worker
function useMessageChannel() {
  var channel = new MessageChannel();
  channel.port1.onmessage = flush;
  return function () {
    return channel.port2.postMessage(0);
  };
}

function useSetTimeout() {
  // Store setTimeout reference so es6-promise will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var globalSetTimeout = setTimeout;
  return function () {
    return globalSetTimeout(flush, 1);
  };
}

var queue = new Array(1000);
function flush() {
  for (var i = 0; i < len; i += 2) {
    var callback = queue[i];
    var arg = queue[i + 1];

    callback(arg);

    queue[i] = undefined;
    queue[i + 1] = undefined;
  }

  len = 0;
}

function attemptVertx() {
  try {
    var vertx = Function('return this')().require('vertx');
    vertxNext = vertx.runOnLoop || vertx.runOnContext;
    return useVertxTimer();
  } catch (e) {
    return useSetTimeout();
  }
}

var scheduleFlush = void 0;
// Decide what async method to use to triggering processing of queued callbacks:
if (isNode) {
  scheduleFlush = useNextTick();
} else if (BrowserMutationObserver) {
  scheduleFlush = useMutationObserver();
} else if (isWorker) {
  scheduleFlush = useMessageChannel();
} else if (browserWindow === undefined && "function" === 'function') {
  scheduleFlush = attemptVertx();
} else {
  scheduleFlush = useSetTimeout();
}

function then(onFulfillment, onRejection) {
  var parent = this;

  var child = new this.constructor(noop);

  if (child[PROMISE_ID] === undefined) {
    makePromise(child);
  }

  var _state = parent._state;


  if (_state) {
    var callback = arguments[_state - 1];
    asap(function () {
      return invokeCallback(_state, child, callback, parent._result);
    });
  } else {
    subscribe(parent, child, onFulfillment, onRejection);
  }

  return child;
}

/**
  `Promise.resolve` returns a promise that will become resolved with the
  passed `value`. It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    resolve(1);
  });

  promise.then(function(value){
    // value === 1
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.resolve(1);

  promise.then(function(value){
    // value === 1
  });
  ```

  @method resolve
  @static
  @param {Any} value value that the returned promise will be resolved with
  Useful for tooling.
  @return {Promise} a promise that will become fulfilled with the given
  `value`
*/
function resolve$1(object) {
  /*jshint validthis:true */
  var Constructor = this;

  if (object && typeof object === 'object' && object.constructor === Constructor) {
    return object;
  }

  var promise = new Constructor(noop);
  resolve(promise, object);
  return promise;
}

var PROMISE_ID = Math.random().toString(36).substring(2);

function noop() {}

var PENDING = void 0;
var FULFILLED = 1;
var REJECTED = 2;

function selfFulfillment() {
  return new TypeError("You cannot resolve a promise with itself");
}

function cannotReturnOwn() {
  return new TypeError('A promises callback cannot return that same promise.');
}

function tryThen(then$$1, value, fulfillmentHandler, rejectionHandler) {
  try {
    then$$1.call(value, fulfillmentHandler, rejectionHandler);
  } catch (e) {
    return e;
  }
}

function handleForeignThenable(promise, thenable, then$$1) {
  asap(function (promise) {
    var sealed = false;
    var error = tryThen(then$$1, thenable, function (value) {
      if (sealed) {
        return;
      }
      sealed = true;
      if (thenable !== value) {
        resolve(promise, value);
      } else {
        fulfill(promise, value);
      }
    }, function (reason) {
      if (sealed) {
        return;
      }
      sealed = true;

      reject(promise, reason);
    }, 'Settle: ' + (promise._label || ' unknown promise'));

    if (!sealed && error) {
      sealed = true;
      reject(promise, error);
    }
  }, promise);
}

function handleOwnThenable(promise, thenable) {
  if (thenable._state === FULFILLED) {
    fulfill(promise, thenable._result);
  } else if (thenable._state === REJECTED) {
    reject(promise, thenable._result);
  } else {
    subscribe(thenable, undefined, function (value) {
      return resolve(promise, value);
    }, function (reason) {
      return reject(promise, reason);
    });
  }
}

function handleMaybeThenable(promise, maybeThenable, then$$1) {
  if (maybeThenable.constructor === promise.constructor && then$$1 === then && maybeThenable.constructor.resolve === resolve$1) {
    handleOwnThenable(promise, maybeThenable);
  } else {
    if (then$$1 === undefined) {
      fulfill(promise, maybeThenable);
    } else if (isFunction(then$$1)) {
      handleForeignThenable(promise, maybeThenable, then$$1);
    } else {
      fulfill(promise, maybeThenable);
    }
  }
}

function resolve(promise, value) {
  if (promise === value) {
    reject(promise, selfFulfillment());
  } else if (objectOrFunction(value)) {
    var then$$1 = void 0;
    try {
      then$$1 = value.then;
    } catch (error) {
      reject(promise, error);
      return;
    }
    handleMaybeThenable(promise, value, then$$1);
  } else {
    fulfill(promise, value);
  }
}

function publishRejection(promise) {
  if (promise._onerror) {
    promise._onerror(promise._result);
  }

  publish(promise);
}

function fulfill(promise, value) {
  if (promise._state !== PENDING) {
    return;
  }

  promise._result = value;
  promise._state = FULFILLED;

  if (promise._subscribers.length !== 0) {
    asap(publish, promise);
  }
}

function reject(promise, reason) {
  if (promise._state !== PENDING) {
    return;
  }
  promise._state = REJECTED;
  promise._result = reason;

  asap(publishRejection, promise);
}

function subscribe(parent, child, onFulfillment, onRejection) {
  var _subscribers = parent._subscribers;
  var length = _subscribers.length;


  parent._onerror = null;

  _subscribers[length] = child;
  _subscribers[length + FULFILLED] = onFulfillment;
  _subscribers[length + REJECTED] = onRejection;

  if (length === 0 && parent._state) {
    asap(publish, parent);
  }
}

function publish(promise) {
  var subscribers = promise._subscribers;
  var settled = promise._state;

  if (subscribers.length === 0) {
    return;
  }

  var child = void 0,
      callback = void 0,
      detail = promise._result;

  for (var i = 0; i < subscribers.length; i += 3) {
    child = subscribers[i];
    callback = subscribers[i + settled];

    if (child) {
      invokeCallback(settled, child, callback, detail);
    } else {
      callback(detail);
    }
  }

  promise._subscribers.length = 0;
}

function invokeCallback(settled, promise, callback, detail) {
  var hasCallback = isFunction(callback),
      value = void 0,
      error = void 0,
      succeeded = true;

  if (hasCallback) {
    try {
      value = callback(detail);
    } catch (e) {
      succeeded = false;
      error = e;
    }

    if (promise === value) {
      reject(promise, cannotReturnOwn());
      return;
    }
  } else {
    value = detail;
  }

  if (promise._state !== PENDING) {
    // noop
  } else if (hasCallback && succeeded) {
    resolve(promise, value);
  } else if (succeeded === false) {
    reject(promise, error);
  } else if (settled === FULFILLED) {
    fulfill(promise, value);
  } else if (settled === REJECTED) {
    reject(promise, value);
  }
}

function initializePromise(promise, resolver) {
  try {
    resolver(function resolvePromise(value) {
      resolve(promise, value);
    }, function rejectPromise(reason) {
      reject(promise, reason);
    });
  } catch (e) {
    reject(promise, e);
  }
}

var id = 0;
function nextId() {
  return id++;
}

function makePromise(promise) {
  promise[PROMISE_ID] = id++;
  promise._state = undefined;
  promise._result = undefined;
  promise._subscribers = [];
}

function validationError() {
  return new Error('Array Methods must be provided an Array');
}

var Enumerator = function () {
  function Enumerator(Constructor, input) {
    this._instanceConstructor = Constructor;
    this.promise = new Constructor(noop);

    if (!this.promise[PROMISE_ID]) {
      makePromise(this.promise);
    }

    if (isArray(input)) {
      this.length = input.length;
      this._remaining = input.length;

      this._result = new Array(this.length);

      if (this.length === 0) {
        fulfill(this.promise, this._result);
      } else {
        this.length = this.length || 0;
        this._enumerate(input);
        if (this._remaining === 0) {
          fulfill(this.promise, this._result);
        }
      }
    } else {
      reject(this.promise, validationError());
    }
  }

  Enumerator.prototype._enumerate = function _enumerate(input) {
    for (var i = 0; this._state === PENDING && i < input.length; i++) {
      this._eachEntry(input[i], i);
    }
  };

  Enumerator.prototype._eachEntry = function _eachEntry(entry, i) {
    var c = this._instanceConstructor;
    var resolve$$1 = c.resolve;


    if (resolve$$1 === resolve$1) {
      var _then = void 0;
      var error = void 0;
      var didError = false;
      try {
        _then = entry.then;
      } catch (e) {
        didError = true;
        error = e;
      }

      if (_then === then && entry._state !== PENDING) {
        this._settledAt(entry._state, i, entry._result);
      } else if (typeof _then !== 'function') {
        this._remaining--;
        this._result[i] = entry;
      } else if (c === Promise$1) {
        var promise = new c(noop);
        if (didError) {
          reject(promise, error);
        } else {
          handleMaybeThenable(promise, entry, _then);
        }
        this._willSettleAt(promise, i);
      } else {
        this._willSettleAt(new c(function (resolve$$1) {
          return resolve$$1(entry);
        }), i);
      }
    } else {
      this._willSettleAt(resolve$$1(entry), i);
    }
  };

  Enumerator.prototype._settledAt = function _settledAt(state, i, value) {
    var promise = this.promise;


    if (promise._state === PENDING) {
      this._remaining--;

      if (state === REJECTED) {
        reject(promise, value);
      } else {
        this._result[i] = value;
      }
    }

    if (this._remaining === 0) {
      fulfill(promise, this._result);
    }
  };

  Enumerator.prototype._willSettleAt = function _willSettleAt(promise, i) {
    var enumerator = this;

    subscribe(promise, undefined, function (value) {
      return enumerator._settledAt(FULFILLED, i, value);
    }, function (reason) {
      return enumerator._settledAt(REJECTED, i, reason);
    });
  };

  return Enumerator;
}();

/**
  `Promise.all` accepts an array of promises, and returns a new promise which
  is fulfilled with an array of fulfillment values for the passed promises, or
  rejected with the reason of the first passed promise to be rejected. It casts all
  elements of the passed iterable to promises as it runs this algorithm.

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = resolve(2);
  let promise3 = resolve(3);
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // The array here would be [ 1, 2, 3 ];
  });
  ```

  If any of the `promises` given to `all` are rejected, the first promise
  that is rejected will be given as an argument to the returned promises's
  rejection handler. For example:

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = reject(new Error("2"));
  let promise3 = reject(new Error("3"));
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // Code here never runs because there are rejected promises!
  }, function(error) {
    // error.message === "2"
  });
  ```

  @method all
  @static
  @param {Array} entries array of promises
  @param {String} label optional string for labeling the promise.
  Useful for tooling.
  @return {Promise} promise that is fulfilled when all `promises` have been
  fulfilled, or rejected if any of them become rejected.
  @static
*/
function all(entries) {
  return new Enumerator(this, entries).promise;
}

/**
  `Promise.race` returns a new promise which is settled in the same way as the
  first passed promise to settle.

  Example:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 2');
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // result === 'promise 2' because it was resolved before promise1
    // was resolved.
  });
  ```

  `Promise.race` is deterministic in that only the state of the first
  settled promise matters. For example, even if other promises given to the
  `promises` array argument are resolved, but the first settled promise has
  become rejected before the other promises became fulfilled, the returned
  promise will become rejected:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      reject(new Error('promise 2'));
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // Code here never runs
  }, function(reason){
    // reason.message === 'promise 2' because promise 2 became rejected before
    // promise 1 became fulfilled
  });
  ```

  An example real-world use case is implementing timeouts:

  ```javascript
  Promise.race([ajax('foo.json'), timeout(5000)])
  ```

  @method race
  @static
  @param {Array} promises array of promises to observe
  Useful for tooling.
  @return {Promise} a promise which settles in the same way as the first passed
  promise to settle.
*/
function race(entries) {
  /*jshint validthis:true */
  var Constructor = this;

  if (!isArray(entries)) {
    return new Constructor(function (_, reject) {
      return reject(new TypeError('You must pass an array to race.'));
    });
  } else {
    return new Constructor(function (resolve, reject) {
      var length = entries.length;
      for (var i = 0; i < length; i++) {
        Constructor.resolve(entries[i]).then(resolve, reject);
      }
    });
  }
}

/**
  `Promise.reject` returns a promise rejected with the passed `reason`.
  It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    reject(new Error('WHOOPS'));
  });

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.reject(new Error('WHOOPS'));

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  @method reject
  @static
  @param {Any} reason value that the returned promise will be rejected with.
  Useful for tooling.
  @return {Promise} a promise rejected with the given `reason`.
*/
function reject$1(reason) {
  /*jshint validthis:true */
  var Constructor = this;
  var promise = new Constructor(noop);
  reject(promise, reason);
  return promise;
}

function needsResolver() {
  throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
}

function needsNew() {
  throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
}

/**
  Promise objects represent the eventual result of an asynchronous operation. The
  primary way of interacting with a promise is through its `then` method, which
  registers callbacks to receive either a promise's eventual value or the reason
  why the promise cannot be fulfilled.

  Terminology
  -----------

  - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
  - `thenable` is an object or function that defines a `then` method.
  - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
  - `exception` is a value that is thrown using the throw statement.
  - `reason` is a value that indicates why a promise was rejected.
  - `settled` the final resting state of a promise, fulfilled or rejected.

  A promise can be in one of three states: pending, fulfilled, or rejected.

  Promises that are fulfilled have a fulfillment value and are in the fulfilled
  state.  Promises that are rejected have a rejection reason and are in the
  rejected state.  A fulfillment value is never a thenable.

  Promises can also be said to *resolve* a value.  If this value is also a
  promise, then the original promise's settled state will match the value's
  settled state.  So a promise that *resolves* a promise that rejects will
  itself reject, and a promise that *resolves* a promise that fulfills will
  itself fulfill.


  Basic Usage:
  ------------

  ```js
  let promise = new Promise(function(resolve, reject) {
    // on success
    resolve(value);

    // on failure
    reject(reason);
  });

  promise.then(function(value) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Advanced Usage:
  ---------------

  Promises shine when abstracting away asynchronous interactions such as
  `XMLHttpRequest`s.

  ```js
  function getJSON(url) {
    return new Promise(function(resolve, reject){
      let xhr = new XMLHttpRequest();

      xhr.open('GET', url);
      xhr.onreadystatechange = handler;
      xhr.responseType = 'json';
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send();

      function handler() {
        if (this.readyState === this.DONE) {
          if (this.status === 200) {
            resolve(this.response);
          } else {
            reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
          }
        }
      };
    });
  }

  getJSON('/posts.json').then(function(json) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Unlike callbacks, promises are great composable primitives.

  ```js
  Promise.all([
    getJSON('/posts'),
    getJSON('/comments')
  ]).then(function(values){
    values[0] // => postsJSON
    values[1] // => commentsJSON

    return values;
  });
  ```

  @class Promise
  @param {Function} resolver
  Useful for tooling.
  @constructor
*/

var Promise$1 = function () {
  function Promise(resolver) {
    this[PROMISE_ID] = nextId();
    this._result = this._state = undefined;
    this._subscribers = [];

    if (noop !== resolver) {
      typeof resolver !== 'function' && needsResolver();
      this instanceof Promise ? initializePromise(this, resolver) : needsNew();
    }
  }

  /**
  The primary way of interacting with a promise is through its `then` method,
  which registers callbacks to receive either a promise's eventual value or the
  reason why the promise cannot be fulfilled.
   ```js
  findUser().then(function(user){
    // user is available
  }, function(reason){
    // user is unavailable, and you are given the reason why
  });
  ```
   Chaining
  --------
   The return value of `then` is itself a promise.  This second, 'downstream'
  promise is resolved with the return value of the first promise's fulfillment
  or rejection handler, or rejected if the handler throws an exception.
   ```js
  findUser().then(function (user) {
    return user.name;
  }, function (reason) {
    return 'default name';
  }).then(function (userName) {
    // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
    // will be `'default name'`
  });
   findUser().then(function (user) {
    throw new Error('Found user, but still unhappy');
  }, function (reason) {
    throw new Error('`findUser` rejected and we're unhappy');
  }).then(function (value) {
    // never reached
  }, function (reason) {
    // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
    // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
  });
  ```
  If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
   ```js
  findUser().then(function (user) {
    throw new PedagogicalException('Upstream error');
  }).then(function (value) {
    // never reached
  }).then(function (value) {
    // never reached
  }, function (reason) {
    // The `PedgagocialException` is propagated all the way down to here
  });
  ```
   Assimilation
  ------------
   Sometimes the value you want to propagate to a downstream promise can only be
  retrieved asynchronously. This can be achieved by returning a promise in the
  fulfillment or rejection handler. The downstream promise will then be pending
  until the returned promise is settled. This is called *assimilation*.
   ```js
  findUser().then(function (user) {
    return findCommentsByAuthor(user);
  }).then(function (comments) {
    // The user's comments are now available
  });
  ```
   If the assimliated promise rejects, then the downstream promise will also reject.
   ```js
  findUser().then(function (user) {
    return findCommentsByAuthor(user);
  }).then(function (comments) {
    // If `findCommentsByAuthor` fulfills, we'll have the value here
  }, function (reason) {
    // If `findCommentsByAuthor` rejects, we'll have the reason here
  });
  ```
   Simple Example
  --------------
   Synchronous Example
   ```javascript
  let result;
   try {
    result = findResult();
    // success
  } catch(reason) {
    // failure
  }
  ```
   Errback Example
   ```js
  findResult(function(result, err){
    if (err) {
      // failure
    } else {
      // success
    }
  });
  ```
   Promise Example;
   ```javascript
  findResult().then(function(result){
    // success
  }, function(reason){
    // failure
  });
  ```
   Advanced Example
  --------------
   Synchronous Example
   ```javascript
  let author, books;
   try {
    author = findAuthor();
    books  = findBooksByAuthor(author);
    // success
  } catch(reason) {
    // failure
  }
  ```
   Errback Example
   ```js
   function foundBooks(books) {
   }
   function failure(reason) {
   }
   findAuthor(function(author, err){
    if (err) {
      failure(err);
      // failure
    } else {
      try {
        findBoooksByAuthor(author, function(books, err) {
          if (err) {
            failure(err);
          } else {
            try {
              foundBooks(books);
            } catch(reason) {
              failure(reason);
            }
          }
        });
      } catch(error) {
        failure(err);
      }
      // success
    }
  });
  ```
   Promise Example;
   ```javascript
  findAuthor().
    then(findBooksByAuthor).
    then(function(books){
      // found books
  }).catch(function(reason){
    // something went wrong
  });
  ```
   @method then
  @param {Function} onFulfilled
  @param {Function} onRejected
  Useful for tooling.
  @return {Promise}
  */

  /**
  `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
  as the catch block of a try/catch statement.
  ```js
  function findAuthor(){
  throw new Error('couldn't find that author');
  }
  // synchronous
  try {
  findAuthor();
  } catch(reason) {
  // something went wrong
  }
  // async with promises
  findAuthor().catch(function(reason){
  // something went wrong
  });
  ```
  @method catch
  @param {Function} onRejection
  Useful for tooling.
  @return {Promise}
  */


  Promise.prototype.catch = function _catch(onRejection) {
    return this.then(null, onRejection);
  };

  /**
    `finally` will be invoked regardless of the promise's fate just as native
    try/catch/finally behaves
  
    Synchronous example:
  
    ```js
    findAuthor() {
      if (Math.random() > 0.5) {
        throw new Error();
      }
      return new Author();
    }
  
    try {
      return findAuthor(); // succeed or fail
    } catch(error) {
      return findOtherAuther();
    } finally {
      // always runs
      // doesn't affect the return value
    }
    ```
  
    Asynchronous example:
  
    ```js
    findAuthor().catch(function(reason){
      return findOtherAuther();
    }).finally(function(){
      // author was either found, or not
    });
    ```
  
    @method finally
    @param {Function} callback
    @return {Promise}
  */


  Promise.prototype.finally = function _finally(callback) {
    var promise = this;
    var constructor = promise.constructor;

    if (isFunction(callback)) {
      return promise.then(function (value) {
        return constructor.resolve(callback()).then(function () {
          return value;
        });
      }, function (reason) {
        return constructor.resolve(callback()).then(function () {
          throw reason;
        });
      });
    }

    return promise.then(callback, callback);
  };

  return Promise;
}();

Promise$1.prototype.then = then;
Promise$1.all = all;
Promise$1.race = race;
Promise$1.resolve = resolve$1;
Promise$1.reject = reject$1;
Promise$1._setScheduler = setScheduler;
Promise$1._setAsap = setAsap;
Promise$1._asap = asap;

/*global self*/
function polyfill() {
  var local = void 0;

  if (typeof __webpack_require__.g !== 'undefined') {
    local = __webpack_require__.g;
  } else if (typeof self !== 'undefined') {
    local = self;
  } else {
    try {
      local = Function('return this')();
    } catch (e) {
      throw new Error('polyfill failed because global object is unavailable in this environment');
    }
  }

  var P = local.Promise;

  if (P) {
    var promiseToString = null;
    try {
      promiseToString = Object.prototype.toString.call(P.resolve());
    } catch (e) {
      // silently ignored
    }

    if (promiseToString === '[object Promise]' && !P.cast) {
      return;
    }
  }

  local.Promise = Promise$1;
}

// Strange compat..
Promise$1.polyfill = polyfill;
Promise$1.Promise = Promise$1;

return Promise$1;

})));



//# sourceMappingURL=es6-promise.map


/***/ }),

/***/ "./node_modules/probe.gl/dist/es5/env/get-browser.js":
/*!***********************************************************!*\
  !*** ./node_modules/probe.gl/dist/es5/env/get-browser.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "./node_modules/@babel/runtime/helpers/interopRequireDefault.js");

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.isMobile = isMobile;
exports["default"] = getBrowser;

var _globals = __webpack_require__(/*! ./globals */ "./node_modules/probe.gl/dist/es5/env/globals.js");

var _isBrowser = _interopRequireDefault(__webpack_require__(/*! ./is-browser */ "./node_modules/probe.gl/dist/es5/env/is-browser.js"));

var _isElectron = _interopRequireDefault(__webpack_require__(/*! ./is-electron */ "./node_modules/probe.gl/dist/es5/env/is-electron.js"));

function isMobile() {
  return typeof _globals.window.orientation !== 'undefined';
}

function getBrowser(mockUserAgent) {
  if (!mockUserAgent && !(0, _isBrowser.default)()) {
    return 'Node';
  }

  if ((0, _isElectron.default)(mockUserAgent)) {
    return 'Electron';
  }

  var navigator_ = typeof navigator !== 'undefined' ? navigator : {};
  var userAgent = mockUserAgent || navigator_.userAgent || '';

  if (userAgent.indexOf('Edge') > -1) {
    return 'Edge';
  }

  var isMSIE = userAgent.indexOf('MSIE ') !== -1;
  var isTrident = userAgent.indexOf('Trident/') !== -1;

  if (isMSIE || isTrident) {
    return 'IE';
  }

  if (_globals.window.chrome) {
    return 'Chrome';
  }

  if (_globals.window.safari) {
    return 'Safari';
  }

  if (_globals.window.mozInnerScreenX) {
    return 'Firefox';
  }

  return 'Unknown';
}
//# sourceMappingURL=get-browser.js.map

/***/ }),

/***/ "./node_modules/probe.gl/dist/es5/env/globals.js":
/*!*******************************************************!*\
  !*** ./node_modules/probe.gl/dist/es5/env/globals.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "./node_modules/@babel/runtime/helpers/interopRequireDefault.js");

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.console = exports.process = exports.document = exports.global = exports.window = exports.self = void 0;

var _typeof2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/typeof */ "./node_modules/@babel/runtime/helpers/typeof.js"));

var globals = {
  self: typeof self !== 'undefined' && self,
  window: typeof window !== 'undefined' && window,
  global: typeof __webpack_require__.g !== 'undefined' && __webpack_require__.g,
  document: typeof document !== 'undefined' && document,
  process: (typeof process === "undefined" ? "undefined" : (0, _typeof2.default)(process)) === 'object' && process
};
var self_ = globals.self || globals.window || globals.global;
exports.self = self_;
var window_ = globals.window || globals.self || globals.global;
exports.window = window_;
var global_ = globals.global || globals.self || globals.window;
exports.global = global_;
var document_ = globals.document || {};
exports.document = document_;
var process_ = globals.process || {};
exports.process = process_;
var console_ = console;
exports.console = console_;
//# sourceMappingURL=globals.js.map

/***/ }),

/***/ "./node_modules/probe.gl/dist/es5/env/index.js":
/*!*****************************************************!*\
  !*** ./node_modules/probe.gl/dist/es5/env/index.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "./node_modules/@babel/runtime/helpers/interopRequireDefault.js");

var _typeof = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "./node_modules/@babel/runtime/helpers/typeof.js");

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
Object.defineProperty(exports, "self", ({
  enumerable: true,
  get: function get() {
    return _globals.self;
  }
}));
Object.defineProperty(exports, "window", ({
  enumerable: true,
  get: function get() {
    return _globals.window;
  }
}));
Object.defineProperty(exports, "global", ({
  enumerable: true,
  get: function get() {
    return _globals.global;
  }
}));
Object.defineProperty(exports, "document", ({
  enumerable: true,
  get: function get() {
    return _globals.document;
  }
}));
Object.defineProperty(exports, "process", ({
  enumerable: true,
  get: function get() {
    return _globals.process;
  }
}));
Object.defineProperty(exports, "console", ({
  enumerable: true,
  get: function get() {
    return _globals.console;
  }
}));
Object.defineProperty(exports, "isBrowser", ({
  enumerable: true,
  get: function get() {
    return _isBrowser.default;
  }
}));
Object.defineProperty(exports, "isBrowserMainThread", ({
  enumerable: true,
  get: function get() {
    return _isBrowser.isBrowserMainThread;
  }
}));
Object.defineProperty(exports, "getBrowser", ({
  enumerable: true,
  get: function get() {
    return _getBrowser.default;
  }
}));
Object.defineProperty(exports, "isMobile", ({
  enumerable: true,
  get: function get() {
    return _getBrowser.isMobile;
  }
}));
Object.defineProperty(exports, "isElectron", ({
  enumerable: true,
  get: function get() {
    return _isElectron.default;
  }
}));

var _globals = __webpack_require__(/*! ./globals */ "./node_modules/probe.gl/dist/es5/env/globals.js");

var _isBrowser = _interopRequireWildcard(__webpack_require__(/*! ./is-browser */ "./node_modules/probe.gl/dist/es5/env/is-browser.js"));

var _getBrowser = _interopRequireWildcard(__webpack_require__(/*! ./get-browser */ "./node_modules/probe.gl/dist/es5/env/get-browser.js"));

var _isElectron = _interopRequireDefault(__webpack_require__(/*! ./is-electron */ "./node_modules/probe.gl/dist/es5/env/is-electron.js"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/probe.gl/dist/es5/env/is-browser.js":
/*!**********************************************************!*\
  !*** ./node_modules/probe.gl/dist/es5/env/is-browser.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "./node_modules/@babel/runtime/helpers/interopRequireDefault.js");

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isBrowser;
exports.isBrowserMainThread = isBrowserMainThread;

var _typeof2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/typeof */ "./node_modules/@babel/runtime/helpers/typeof.js"));

var _isElectron = _interopRequireDefault(__webpack_require__(/*! ./is-electron */ "./node_modules/probe.gl/dist/es5/env/is-electron.js"));

function isBrowser() {
  var isNode = (typeof process === "undefined" ? "undefined" : (0, _typeof2.default)(process)) === 'object' && String(process) === '[object process]' && !process.browser;
  return !isNode || (0, _isElectron.default)();
}

function isBrowserMainThread() {
  return isBrowser() && typeof document !== 'undefined';
}
//# sourceMappingURL=is-browser.js.map

/***/ }),

/***/ "./node_modules/probe.gl/dist/es5/env/is-electron.js":
/*!***********************************************************!*\
  !*** ./node_modules/probe.gl/dist/es5/env/is-electron.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "./node_modules/@babel/runtime/helpers/interopRequireDefault.js");

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isElectron;

var _typeof2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/typeof */ "./node_modules/@babel/runtime/helpers/typeof.js"));

function isElectron(mockUserAgent) {
  if (typeof window !== 'undefined' && (0, _typeof2.default)(window.process) === 'object' && window.process.type === 'renderer') {
    return true;
  }

  if (typeof process !== 'undefined' && (0, _typeof2.default)(process.versions) === 'object' && Boolean(process.versions.electron)) {
    return true;
  }

  var realUserAgent = (typeof navigator === "undefined" ? "undefined" : (0, _typeof2.default)(navigator)) === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent;
  var userAgent = mockUserAgent || realUserAgent;

  if (userAgent && userAgent.indexOf('Electron') >= 0) {
    return true;
  }

  return false;
}
//# sourceMappingURL=is-electron.js.map

/***/ }),

/***/ "./node_modules/probe.gl/dist/esm/env/get-browser.js":
/*!***********************************************************!*\
  !*** ./node_modules/probe.gl/dist/esm/env/get-browser.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "isMobile": () => (/* binding */ isMobile),
/* harmony export */   "default": () => (/* binding */ getBrowser)
/* harmony export */ });
/* harmony import */ var _globals__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./globals */ "./node_modules/probe.gl/dist/esm/env/globals.js");
/* harmony import */ var _is_browser__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./is-browser */ "./node_modules/probe.gl/dist/esm/env/is-browser.js");
/* harmony import */ var _is_electron__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./is-electron */ "./node_modules/probe.gl/dist/esm/env/is-electron.js");



function isMobile() {
  return typeof _globals__WEBPACK_IMPORTED_MODULE_0__.window.orientation !== 'undefined';
}
function getBrowser(mockUserAgent) {
  if (!mockUserAgent && !(0,_is_browser__WEBPACK_IMPORTED_MODULE_1__["default"])()) {
    return 'Node';
  }

  if ((0,_is_electron__WEBPACK_IMPORTED_MODULE_2__["default"])(mockUserAgent)) {
    return 'Electron';
  }

  const navigator_ = typeof navigator !== 'undefined' ? navigator : {};
  const userAgent = mockUserAgent || navigator_.userAgent || '';

  if (userAgent.indexOf('Edge') > -1) {
    return 'Edge';
  }

  const isMSIE = userAgent.indexOf('MSIE ') !== -1;
  const isTrident = userAgent.indexOf('Trident/') !== -1;

  if (isMSIE || isTrident) {
    return 'IE';
  }

  if (_globals__WEBPACK_IMPORTED_MODULE_0__.window.chrome) {
    return 'Chrome';
  }

  if (_globals__WEBPACK_IMPORTED_MODULE_0__.window.safari) {
    return 'Safari';
  }

  if (_globals__WEBPACK_IMPORTED_MODULE_0__.window.mozInnerScreenX) {
    return 'Firefox';
  }

  return 'Unknown';
}
//# sourceMappingURL=get-browser.js.map

/***/ }),

/***/ "./node_modules/probe.gl/dist/esm/env/globals.js":
/*!*******************************************************!*\
  !*** ./node_modules/probe.gl/dist/esm/env/globals.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "self": () => (/* binding */ self_),
/* harmony export */   "window": () => (/* binding */ window_),
/* harmony export */   "global": () => (/* binding */ global_),
/* harmony export */   "document": () => (/* binding */ document_),
/* harmony export */   "process": () => (/* binding */ process_),
/* harmony export */   "console": () => (/* binding */ console_)
/* harmony export */ });
const globals = {
  self: typeof self !== 'undefined' && self,
  window: typeof window !== 'undefined' && window,
  global: typeof __webpack_require__.g !== 'undefined' && __webpack_require__.g,
  document: typeof document !== 'undefined' && document,
  process: typeof process === 'object' && process
};
const self_ = globals.self || globals.window || globals.global;
const window_ = globals.window || globals.self || globals.global;
const global_ = globals.global || globals.self || globals.window;
const document_ = globals.document || {};
const process_ = globals.process || {};
const console_ = console;

//# sourceMappingURL=globals.js.map

/***/ }),

/***/ "./node_modules/probe.gl/dist/esm/env/is-browser.js":
/*!**********************************************************!*\
  !*** ./node_modules/probe.gl/dist/esm/env/is-browser.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ isBrowser),
/* harmony export */   "isBrowserMainThread": () => (/* binding */ isBrowserMainThread)
/* harmony export */ });
/* harmony import */ var _is_electron__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./is-electron */ "./node_modules/probe.gl/dist/esm/env/is-electron.js");

function isBrowser() {
  const isNode = typeof process === 'object' && String(process) === '[object process]' && !process.browser;
  return !isNode || (0,_is_electron__WEBPACK_IMPORTED_MODULE_0__["default"])();
}
function isBrowserMainThread() {
  return isBrowser() && typeof document !== 'undefined';
}
//# sourceMappingURL=is-browser.js.map

/***/ }),

/***/ "./node_modules/probe.gl/dist/esm/env/is-electron.js":
/*!***********************************************************!*\
  !*** ./node_modules/probe.gl/dist/esm/env/is-electron.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ isElectron)
/* harmony export */ });
function isElectron(mockUserAgent) {
  if (typeof window !== 'undefined' && typeof window.process === 'object' && window.process.type === 'renderer') {
    return true;
  }

  if (typeof process !== 'undefined' && typeof process.versions === 'object' && Boolean(process.versions.electron)) {
    return true;
  }

  const realUserAgent = typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent;
  const userAgent = mockUserAgent || realUserAgent;

  if (userAgent && userAgent.indexOf('Electron') >= 0) {
    return true;
  }

  return false;
}
//# sourceMappingURL=is-electron.js.map

/***/ }),

/***/ "./node_modules/probe.gl/dist/esm/lib/log.js":
/*!***************************************************!*\
  !*** ./node_modules/probe.gl/dist/esm/lib/log.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Log),
/* harmony export */   "normalizeArguments": () => (/* binding */ normalizeArguments)
/* harmony export */ });
/* harmony import */ var _utils_globals__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/globals */ "./node_modules/probe.gl/dist/esm/utils/globals.js");
/* harmony import */ var _utils_local_storage__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/local-storage */ "./node_modules/probe.gl/dist/esm/utils/local-storage.js");
/* harmony import */ var _utils_formatters__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils/formatters */ "./node_modules/probe.gl/dist/esm/utils/formatters.js");
/* harmony import */ var _utils_color__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../utils/color */ "./node_modules/probe.gl/dist/esm/utils/color.js");
/* harmony import */ var _utils_autobind__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/autobind */ "./node_modules/probe.gl/dist/esm/utils/autobind.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/probe.gl/dist/esm/utils/assert.js");
/* harmony import */ var _utils_hi_res_timestamp__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/hi-res-timestamp */ "./node_modules/probe.gl/dist/esm/utils/hi-res-timestamp.js");







const originalConsole = {
  debug: _utils_globals__WEBPACK_IMPORTED_MODULE_0__.isBrowser ? console.debug || console.log : console.log,
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error
};
const DEFAULT_SETTINGS = {
  enabled: true,
  level: 0
};

function noop() {}

const cache = {};
const ONCE = {
  once: true
};

function getTableHeader(table) {
  for (const key in table) {
    for (const title in table[key]) {
      return title || 'untitled';
    }
  }

  return 'empty';
}

class Log {
  constructor({
    id
  } = {
    id: ''
  }) {
    this.id = id;
    this.VERSION = _utils_globals__WEBPACK_IMPORTED_MODULE_0__.VERSION;
    this._startTs = (0,_utils_hi_res_timestamp__WEBPACK_IMPORTED_MODULE_1__["default"])();
    this._deltaTs = (0,_utils_hi_res_timestamp__WEBPACK_IMPORTED_MODULE_1__["default"])();
    this.LOG_THROTTLE_TIMEOUT = 0;
    this._storage = new _utils_local_storage__WEBPACK_IMPORTED_MODULE_2__["default"]("__probe-".concat(this.id, "__"), DEFAULT_SETTINGS);
    this.userData = {};
    this.timeStamp("".concat(this.id, " started"));
    (0,_utils_autobind__WEBPACK_IMPORTED_MODULE_3__.autobind)(this);
    Object.seal(this);
  }

  set level(newLevel) {
    this.setLevel(newLevel);
  }

  get level() {
    return this.getLevel();
  }

  isEnabled() {
    return this._storage.config.enabled;
  }

  getLevel() {
    return this._storage.config.level;
  }

  getTotal() {
    return Number(((0,_utils_hi_res_timestamp__WEBPACK_IMPORTED_MODULE_1__["default"])() - this._startTs).toPrecision(10));
  }

  getDelta() {
    return Number(((0,_utils_hi_res_timestamp__WEBPACK_IMPORTED_MODULE_1__["default"])() - this._deltaTs).toPrecision(10));
  }

  set priority(newPriority) {
    this.level = newPriority;
  }

  get priority() {
    return this.level;
  }

  getPriority() {
    return this.level;
  }

  enable(enabled = true) {
    this._storage.updateConfiguration({
      enabled
    });

    return this;
  }

  setLevel(level) {
    this._storage.updateConfiguration({
      level
    });

    return this;
  }

  assert(condition, message) {
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_4__["default"])(condition, message);
  }

  warn(message) {
    return this._getLogFunction(0, message, originalConsole.warn, arguments, ONCE);
  }

  error(message) {
    return this._getLogFunction(0, message, originalConsole.error, arguments);
  }

  deprecated(oldUsage, newUsage) {
    return this.warn("`".concat(oldUsage, "` is deprecated and will be removed in a later version. Use `").concat(newUsage, "` instead"));
  }

  removed(oldUsage, newUsage) {
    return this.error("`".concat(oldUsage, "` has been removed. Use `").concat(newUsage, "` instead"));
  }

  probe(logLevel, message) {
    return this._getLogFunction(logLevel, message, originalConsole.log, arguments, {
      time: true,
      once: true
    });
  }

  log(logLevel, message) {
    return this._getLogFunction(logLevel, message, originalConsole.debug, arguments);
  }

  info(logLevel, message) {
    return this._getLogFunction(logLevel, message, console.info, arguments);
  }

  once(logLevel, message) {
    return this._getLogFunction(logLevel, message, originalConsole.debug || originalConsole.info, arguments, ONCE);
  }

  table(logLevel, table, columns) {
    if (table) {
      return this._getLogFunction(logLevel, table, console.table || noop, columns && [columns], {
        tag: getTableHeader(table)
      });
    }

    return noop;
  }

  image({
    logLevel,
    priority,
    image,
    message = '',
    scale = 1
  }) {
    if (!this._shouldLog(logLevel || priority)) {
      return noop;
    }

    return _utils_globals__WEBPACK_IMPORTED_MODULE_0__.isBrowser ? logImageInBrowser({
      image,
      message,
      scale
    }) : logImageInNode({
      image,
      message,
      scale
    });
  }

  settings() {
    if (console.table) {
      console.table(this._storage.config);
    } else {
      console.log(this._storage.config);
    }
  }

  get(setting) {
    return this._storage.config[setting];
  }

  set(setting, value) {
    this._storage.updateConfiguration({
      [setting]: value
    });
  }

  time(logLevel, message) {
    return this._getLogFunction(logLevel, message, console.time ? console.time : console.info);
  }

  timeEnd(logLevel, message) {
    return this._getLogFunction(logLevel, message, console.timeEnd ? console.timeEnd : console.info);
  }

  timeStamp(logLevel, message) {
    return this._getLogFunction(logLevel, message, console.timeStamp || noop);
  }

  group(logLevel, message, opts = {
    collapsed: false
  }) {
    opts = normalizeArguments({
      logLevel,
      message,
      opts
    });
    const {
      collapsed
    } = opts;
    opts.method = (collapsed ? console.groupCollapsed : console.group) || console.info;
    return this._getLogFunction(opts);
  }

  groupCollapsed(logLevel, message, opts = {}) {
    return this.group(logLevel, message, Object.assign({}, opts, {
      collapsed: true
    }));
  }

  groupEnd(logLevel) {
    return this._getLogFunction(logLevel, '', console.groupEnd || noop);
  }

  withGroup(logLevel, message, func) {
    this.group(logLevel, message)();

    try {
      func();
    } finally {
      this.groupEnd(logLevel)();
    }
  }

  trace() {
    if (console.trace) {
      console.trace();
    }
  }

  _shouldLog(logLevel) {
    return this.isEnabled() && this.getLevel() >= normalizeLogLevel(logLevel);
  }

  _getLogFunction(logLevel, message, method, args = [], opts) {
    if (this._shouldLog(logLevel)) {
      opts = normalizeArguments({
        logLevel,
        message,
        args,
        opts
      });
      method = method || opts.method;
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_4__["default"])(method);
      opts.total = this.getTotal();
      opts.delta = this.getDelta();
      this._deltaTs = (0,_utils_hi_res_timestamp__WEBPACK_IMPORTED_MODULE_1__["default"])();
      const tag = opts.tag || opts.message;

      if (opts.once) {
        if (!cache[tag]) {
          cache[tag] = (0,_utils_hi_res_timestamp__WEBPACK_IMPORTED_MODULE_1__["default"])();
        } else {
          return noop;
        }
      }

      message = decorateMessage(this.id, opts.message, opts);
      return method.bind(console, message, ...opts.args);
    }

    return noop;
  }

}
Log.VERSION = _utils_globals__WEBPACK_IMPORTED_MODULE_0__.VERSION;

function normalizeLogLevel(logLevel) {
  if (!logLevel) {
    return 0;
  }

  let resolvedLevel;

  switch (typeof logLevel) {
    case 'number':
      resolvedLevel = logLevel;
      break;

    case 'object':
      resolvedLevel = logLevel.logLevel || logLevel.priority || 0;
      break;

    default:
      return 0;
  }

  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_4__["default"])(Number.isFinite(resolvedLevel) && resolvedLevel >= 0);
  return resolvedLevel;
}

function normalizeArguments(opts) {
  const {
    logLevel,
    message
  } = opts;
  opts.logLevel = normalizeLogLevel(logLevel);
  const args = opts.args ? Array.from(opts.args) : [];

  while (args.length && args.shift() !== message) {}

  opts.args = args;

  switch (typeof logLevel) {
    case 'string':
    case 'function':
      if (message !== undefined) {
        args.unshift(message);
      }

      opts.message = logLevel;
      break;

    case 'object':
      Object.assign(opts, logLevel);
      break;

    default:
  }

  if (typeof opts.message === 'function') {
    opts.message = opts.message();
  }

  const messageType = typeof opts.message;
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_4__["default"])(messageType === 'string' || messageType === 'object');
  return Object.assign(opts, opts.opts);
}

function decorateMessage(id, message, opts) {
  if (typeof message === 'string') {
    const time = opts.time ? (0,_utils_formatters__WEBPACK_IMPORTED_MODULE_5__.leftPad)((0,_utils_formatters__WEBPACK_IMPORTED_MODULE_5__.formatTime)(opts.total)) : '';
    message = opts.time ? "".concat(id, ": ").concat(time, "  ").concat(message) : "".concat(id, ": ").concat(message);
    message = (0,_utils_color__WEBPACK_IMPORTED_MODULE_6__.addColor)(message, opts.color, opts.background);
  }

  return message;
}

function logImageInNode({
  image,
  message = '',
  scale = 1
}) {
  let asciify = null;

  try {
    asciify = __webpack_require__(/*! asciify-image */ "?4aee");
  } catch (error) {}

  if (asciify) {
    return () => asciify(image, {
      fit: 'box',
      width: "".concat(Math.round(80 * scale), "%")
    }).then(data => console.log(data));
  }

  return noop;
}

function logImageInBrowser({
  image,
  message = '',
  scale = 1
}) {
  if (typeof image === 'string') {
    const img = new Image();

    img.onload = () => {
      const args = (0,_utils_formatters__WEBPACK_IMPORTED_MODULE_5__.formatImage)(img, message, scale);
      console.log(...args);
    };

    img.src = image;
    return noop;
  }

  const element = image.nodeName || '';

  if (element.toLowerCase() === 'img') {
    console.log(...(0,_utils_formatters__WEBPACK_IMPORTED_MODULE_5__.formatImage)(image, message, scale));
    return noop;
  }

  if (element.toLowerCase() === 'canvas') {
    const img = new Image();

    img.onload = () => console.log(...(0,_utils_formatters__WEBPACK_IMPORTED_MODULE_5__.formatImage)(img, message, scale));

    img.src = image.toDataURL();
    return noop;
  }

  return noop;
}
//# sourceMappingURL=log.js.map

/***/ }),

/***/ "./node_modules/probe.gl/dist/esm/utils/assert.js":
/*!********************************************************!*\
  !*** ./node_modules/probe.gl/dist/esm/utils/assert.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ assert)
/* harmony export */ });
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}
//# sourceMappingURL=assert.js.map

/***/ }),

/***/ "./node_modules/probe.gl/dist/esm/utils/autobind.js":
/*!**********************************************************!*\
  !*** ./node_modules/probe.gl/dist/esm/utils/autobind.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "autobind": () => (/* binding */ autobind)
/* harmony export */ });
function autobind(obj, predefined = ['constructor']) {
  const proto = Object.getPrototypeOf(obj);
  const propNames = Object.getOwnPropertyNames(proto);

  for (const key of propNames) {
    if (typeof obj[key] === 'function') {
      if (!predefined.find(name => key === name)) {
        obj[key] = obj[key].bind(obj);
      }
    }
  }
}
//# sourceMappingURL=autobind.js.map

/***/ }),

/***/ "./node_modules/probe.gl/dist/esm/utils/color.js":
/*!*******************************************************!*\
  !*** ./node_modules/probe.gl/dist/esm/utils/color.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "COLOR": () => (/* binding */ COLOR),
/* harmony export */   "addColor": () => (/* binding */ addColor)
/* harmony export */ });
/* harmony import */ var _globals__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./globals */ "./node_modules/probe.gl/dist/esm/utils/globals.js");

const COLOR = {
  BLACK: 30,
  RED: 31,
  GREEN: 32,
  YELLOW: 33,
  BLUE: 34,
  MAGENTA: 35,
  CYAN: 36,
  WHITE: 37,
  BRIGHT_BLACK: 90,
  BRIGHT_RED: 91,
  BRIGHT_GREEN: 92,
  BRIGHT_YELLOW: 93,
  BRIGHT_BLUE: 94,
  BRIGHT_MAGENTA: 95,
  BRIGHT_CYAN: 96,
  BRIGHT_WHITE: 97
};

function getColor(color) {
  return typeof color === 'string' ? COLOR[color.toUpperCase()] || COLOR.WHITE : color;
}

function addColor(string, color, background) {
  if (!_globals__WEBPACK_IMPORTED_MODULE_0__.isBrowser && typeof string === 'string') {
    if (color) {
      color = getColor(color);
      string = "\x1B[".concat(color, "m").concat(string, "\x1B[39m");
    }

    if (background) {
      color = getColor(background);
      string = "\x1B[".concat(background + 10, "m").concat(string, "\x1B[49m");
    }
  }

  return string;
}
//# sourceMappingURL=color.js.map

/***/ }),

/***/ "./node_modules/probe.gl/dist/esm/utils/formatters.js":
/*!************************************************************!*\
  !*** ./node_modules/probe.gl/dist/esm/utils/formatters.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "formatTime": () => (/* binding */ formatTime),
/* harmony export */   "leftPad": () => (/* binding */ leftPad),
/* harmony export */   "rightPad": () => (/* binding */ rightPad),
/* harmony export */   "formatValue": () => (/* binding */ formatValue),
/* harmony export */   "formatImage": () => (/* binding */ formatImage)
/* harmony export */ });
function formatTime(ms) {
  let formatted;

  if (ms < 10) {
    formatted = "".concat(ms.toFixed(2), "ms");
  } else if (ms < 100) {
    formatted = "".concat(ms.toFixed(1), "ms");
  } else if (ms < 1000) {
    formatted = "".concat(ms.toFixed(0), "ms");
  } else {
    formatted = "".concat((ms / 1000).toFixed(2), "s");
  }

  return formatted;
}
function leftPad(string, length = 8) {
  const padLength = Math.max(length - string.length, 0);
  return "".concat(' '.repeat(padLength)).concat(string);
}
function rightPad(string, length = 8) {
  const padLength = Math.max(length - string.length, 0);
  return "".concat(string).concat(' '.repeat(padLength));
}
function formatValue(v, opts = {}) {
  const EPSILON = 1e-16;
  const {
    isInteger = false
  } = opts;

  if (Array.isArray(v) || ArrayBuffer.isView(v)) {
    return formatArrayValue(v, opts);
  }

  if (!Number.isFinite(v)) {
    return String(v);
  }

  if (Math.abs(v) < EPSILON) {
    return isInteger ? '0' : '0.';
  }

  if (isInteger) {
    return v.toFixed(0);
  }

  if (Math.abs(v) > 100 && Math.abs(v) < 10000) {
    return v.toFixed(0);
  }

  const string = v.toPrecision(2);
  const decimal = string.indexOf('.0');
  return decimal === string.length - 2 ? string.slice(0, -1) : string;
}

function formatArrayValue(v, opts) {
  const {
    maxElts = 16,
    size = 1
  } = opts;
  let string = '[';

  for (let i = 0; i < v.length && i < maxElts; ++i) {
    if (i > 0) {
      string += ",".concat(i % size === 0 ? ' ' : '');
    }

    string += formatValue(v[i], opts);
  }

  const terminator = v.length > maxElts ? '...' : ']';
  return "".concat(string).concat(terminator);
}

function formatImage(image, message, scale, maxWidth = 600) {
  const imageUrl = image.src.replace(/\(/g, '%28').replace(/\)/g, '%29');

  if (image.width > maxWidth) {
    scale = Math.min(scale, maxWidth / image.width);
  }

  const width = image.width * scale;
  const height = image.height * scale;
  const style = ['font-size:1px;', "padding:".concat(Math.floor(height / 2), "px ").concat(Math.floor(width / 2), "px;"), "line-height:".concat(height, "px;"), "background:url(".concat(imageUrl, ");"), "background-size:".concat(width, "px ").concat(height, "px;"), 'color:transparent;'].join('');
  return ["".concat(message, " %c+"), style];
}
//# sourceMappingURL=formatters.js.map

/***/ }),

/***/ "./node_modules/probe.gl/dist/esm/utils/globals.js":
/*!*********************************************************!*\
  !*** ./node_modules/probe.gl/dist/esm/utils/globals.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "self": () => (/* reexport safe */ _env_globals__WEBPACK_IMPORTED_MODULE_0__.self),
/* harmony export */   "window": () => (/* reexport safe */ _env_globals__WEBPACK_IMPORTED_MODULE_0__.window),
/* harmony export */   "global": () => (/* reexport safe */ _env_globals__WEBPACK_IMPORTED_MODULE_0__.global),
/* harmony export */   "document": () => (/* reexport safe */ _env_globals__WEBPACK_IMPORTED_MODULE_0__.document),
/* harmony export */   "process": () => (/* reexport safe */ _env_globals__WEBPACK_IMPORTED_MODULE_0__.process),
/* harmony export */   "console": () => (/* reexport safe */ _env_globals__WEBPACK_IMPORTED_MODULE_0__.console),
/* harmony export */   "VERSION": () => (/* binding */ VERSION),
/* harmony export */   "isBrowser": () => (/* binding */ isBrowser)
/* harmony export */ });
/* harmony import */ var _env_is_browser__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../env/is-browser */ "./node_modules/probe.gl/dist/esm/env/is-browser.js");
/* harmony import */ var _env_globals__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../env/globals */ "./node_modules/probe.gl/dist/esm/env/globals.js");


const VERSION = typeof __VERSION__ !== 'undefined' ? __VERSION__ : 'untranspiled source';
const isBrowser = (0,_env_is_browser__WEBPACK_IMPORTED_MODULE_1__["default"])();
//# sourceMappingURL=globals.js.map

/***/ }),

/***/ "./node_modules/probe.gl/dist/esm/utils/hi-res-timestamp.js":
/*!******************************************************************!*\
  !*** ./node_modules/probe.gl/dist/esm/utils/hi-res-timestamp.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ getHiResTimestamp)
/* harmony export */ });
/* harmony import */ var _globals__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./globals */ "./node_modules/probe.gl/dist/esm/utils/globals.js");
/* harmony import */ var _globals__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./globals */ "./node_modules/probe.gl/dist/esm/env/globals.js");

function getHiResTimestamp() {
  let timestamp;

  if (_globals__WEBPACK_IMPORTED_MODULE_0__.isBrowser && _globals__WEBPACK_IMPORTED_MODULE_1__.window.performance) {
    timestamp = _globals__WEBPACK_IMPORTED_MODULE_1__.window.performance.now();
  } else if (_globals__WEBPACK_IMPORTED_MODULE_1__.process.hrtime) {
    const timeParts = _globals__WEBPACK_IMPORTED_MODULE_1__.process.hrtime();
    timestamp = timeParts[0] * 1000 + timeParts[1] / 1e6;
  } else {
    timestamp = Date.now();
  }

  return timestamp;
}
//# sourceMappingURL=hi-res-timestamp.js.map

/***/ }),

/***/ "./node_modules/probe.gl/dist/esm/utils/local-storage.js":
/*!***************************************************************!*\
  !*** ./node_modules/probe.gl/dist/esm/utils/local-storage.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ LocalStorage)
/* harmony export */ });
function getStorage(type) {
  try {
    const storage = window[type];
    const x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return storage;
  } catch (e) {
    return null;
  }
}

class LocalStorage {
  constructor(id, defaultSettings, type = 'sessionStorage') {
    this.storage = getStorage(type);
    this.id = id;
    this.config = {};
    Object.assign(this.config, defaultSettings);

    this._loadConfiguration();
  }

  getConfiguration() {
    return this.config;
  }

  setConfiguration(configuration) {
    this.config = {};
    return this.updateConfiguration(configuration);
  }

  updateConfiguration(configuration) {
    Object.assign(this.config, configuration);

    if (this.storage) {
      const serialized = JSON.stringify(this.config);
      this.storage.setItem(this.id, serialized);
    }

    return this;
  }

  _loadConfiguration() {
    let configuration = {};

    if (this.storage) {
      const serializedConfiguration = this.storage.getItem(this.id);
      configuration = serializedConfiguration ? JSON.parse(serializedConfiguration) : {};
    }

    Object.assign(this.config, configuration);
    return this;
  }

}
//# sourceMappingURL=local-storage.js.map

/***/ }),

/***/ "?4aee":
/*!*******************************!*\
  !*** asciify-image (ignored) ***!
  \*******************************/
/***/ (() => {

/* (ignored) */

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!***********************!*\
  !*** ./demo/index.ts ***!
  \***********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _luma_gl_engine__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/engine */ "./node_modules/@luma.gl/engine/dist/esm/lib/animation-loop.js");
/* harmony import */ var _luma_gl_engine__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @luma.gl/engine */ "./node_modules/@luma.gl/engine/dist/esm/lib/model.js");
/* harmony import */ var _luma_gl_engine__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @luma.gl/engine */ "./node_modules/@luma.gl/engine/dist/esm/transform/transform.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/classes/buffer.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture-2d.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/classes/clear.js");


const numOfParticle = 100000;
const loop = new _luma_gl_engine__WEBPACK_IMPORTED_MODULE_0__["default"]({
    //@ts-ignore
    onInitialize({ gl }) {
        const sourcePositionBuffer = new _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_1__["default"](gl, new Float32Array(numOfParticle * 3).map(() => (Math.random() - 0.5) * 2));
        const targetPositionBuffer = new _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_1__["default"](gl, new Float32Array(numOfParticle * 3).map(() => (Math.random() - 0.5) * 2));
        const texture = new _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_2__["default"](gl, {
            data: 'wind_data.png',
        });
        const model = new _luma_gl_engine__WEBPACK_IMPORTED_MODULE_3__["default"](gl, {
            vs: `
                attribute vec3 position;
                varying vec4 texValue;
                uniform sampler2D texture;

                void main() {
                    vec2 uv = vec2(position.x - 1.0, 1.0 - position.y) * 0.5;
                    texValue = texture2D(texture, uv);
                    gl_Position = vec4(position.xy, 0.0, 1.0);
                    gl_PointSize = 2.0;
                }
            `,
            fs: `
                varying vec4 texValue;

                void main() {
                    float velocity = length(vec2(texValue.r, texValue.g) - vec2(0.49803922));
                    gl_FragColor = vec4(1.0, vec2(1.0 - velocity * 10.0), 1.0);
                }
            `,
            uniforms: {
                texture,
            },
            drawMode: gl.POINTS,
            vertexCount: numOfParticle,
        });
        const transform = new _luma_gl_engine__WEBPACK_IMPORTED_MODULE_4__["default"](gl, {
            vs: `\
        in vec3 sourcePosition;
        out vec3 targetPosition;

        uniform sampler2D texture;
        uniform float time;
        
        mat2 rotation(float rad) {
            return mat2(
                cos(rad), sin(rad),
                -sin(rad), cos(rad)
            );
        }

        vec2 rand(vec2 co){
            vec2 rco = rotation(time) * co;
            return vec2(
                fract(sin(dot(rco.xy ,vec2(12.9898,78.233))) * 43758.5453),
                fract(cos(dot(rco.yx ,vec2(8.64947,45.097))) * 43758.5453)
            )*2.0-1.0;
        }

        float randf(vec2 co){
            return fract(sin(dot(co.xy * rotation(time) ,vec2(12.9898,78.233))) * 43758.5453);
        }

        void main() {
            vec2 uv = vec2(sourcePosition.x - 1.0, 1.0 - sourcePosition.y) * 0.5;
            vec4 texValue = texture2D(texture, uv);

            float age = floor(sourcePosition.z);

            float speedFactor = 0.05;
            vec2 distVec = (vec2(texValue.r, texValue.g) * 2.0 - vec2(1.0)) * speedFactor;

            if (
                (abs(sourcePosition.x) > 1.0 || abs(sourcePosition.y) > 1.0) ||
                (age > 10.0) || 
                (length(distVec) < 0.000001)
                ) {
                targetPosition = vec3(vec2(rand(sourcePosition.xy)), 0.0);
            } else {
                float noiseFactor = speedFactor * 0.01;
                vec2 noise = rand(sourcePosition.xy) * sin(time) * noiseFactor;
                targetPosition = vec3(sourcePosition.xy + distVec + noise, age + 1.05 * randf(sourcePosition.xy));
            }

        }
        `,
            sourceBuffers: {
                sourcePosition: sourcePositionBuffer,
            },
            feedbackBuffers: {
                targetPosition: targetPositionBuffer,
            },
            feedbackMap: {
                sourcePosition: 'targetPosition',
            },
            elementCount: numOfParticle,
        });
        return { model, transform, texture };
    },
    //@ts-ignore
    onRender({ gl, model, transform, texture }) {
        const time = performance.now();
        transform.run({
            uniforms: {
                texture,
                time,
            },
        });
        (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_5__.clear)(gl, { color: [0, 0, 0, 1] });
        model
            .setUniforms({ time })
            .setAttributes({
            position: transform.getBuffer('targetPosition'),
        })
            .draw();
        transform.swap();
    },
});
loop.start({ canvas: 'canvas' });

})();

/******/ })()
;