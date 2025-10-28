/* Copyright 2012 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  createPromiseCapability,
  getDocument,
  getPdfFilenameFromUrl,
  GlobalWorkerOptions,
  isPdfFile,
  shadow,
} from 'pdfjs-dist/legacy/build/pdf.js'
import PDFWorker from 'pdfjs-dist/legacy/build/pdf.worker.min.js'
import {
  animationStarted,
  apiPageLayoutToViewerModes,
  apiPageModeToSidebarView,
  DEFAULT_SCALE_VALUE,
  isValidRotation,
  isValidScrollMode,
  isValidSpreadMode,
  RendererType,
  RenderingStates,
  ScrollMode,
  SidebarView,
  SpreadMode,
} from './ui_utils.js'
import { AppOptions, OptionKind } from './app_options.js'
import { AutomationEventBus, EventBus } from './event_utils.js'
import { PDFCursorTools } from './pdf_cursor_tools.js'
import { PDFRenderingQueue } from './pdf_rendering_queue.js'
import { LinkTarget, PDFLinkService } from './pdf_link_service.js'
import { PDFSidebar } from './pdf_sidebar.js'
import { PDFDrawer } from './pdf_drawer.js'
import { PDFThumbnailViewer } from './pdf_thumbnail_viewer.js'
import { PDFSelectionViewer } from './pdf_selection_viewer.js'
import { PDFViewer } from './pdf_viewer.js'
import { Toolbar } from './toolbar.js'
import { PDFScriptingManager } from './pdf_scripting_manager.js'

const DISABLE_AUTO_FETCH_LOADING_BAR_TIMEOUT = 5000 // ms
const FORCE_PAGES_LOADED_TIMEOUT = 10000 // ms
const WHEEL_ZOOM_DISABLED_TIMEOUT = 1000 // ms

class DefaultExternalServices {
  constructor() {
    throw new Error('Cannot initialize DefaultExternalServices.')
  }

  static updateFindControlState(data) {}

  static updateFindMatchesCount(data) {}

  static initPassiveLoading(callbacks) {}

  static async fallback(data) {}

  static reportTelemetry(data) {}

  static createPreferences() {
    throw new Error('Not implemented: createPreferences')
  }

  static createScripting(options) {
    throw new Error('Not implemented: createScripting')
  }

  static get supportsIntegratedFind() {
    return shadow(this, 'supportsIntegratedFind', false)
  }

  static get supportsDocumentFonts() {
    return shadow(this, 'supportsDocumentFonts', true)
  }

  static get supportedMouseWheelZoomModifierKeys() {
    return shadow(this, 'supportedMouseWheelZoomModifierKeys', {
      ctrlKey: true,
      metaKey: true,
    })
  }

  static get isInAutomation() {
    return shadow(this, 'isInAutomation', false)
  }
}

const PDFViewerApplication = {
  initialBookmark: document.location.hash.substring(1),
  _initializedCapability: createPromiseCapability(),
  appConfig: null,
  pdfDocument: null,
  pdfLoadingTask: null,
  printService: null,
  /** @type {PDFViewer} */
  pdfViewer: null,
  /** @type {PDFThumbnailViewer} */
  pdfThumbnailViewer: null,
  /** @type {PDFSelectionViewer} */
  pdfSelectionViewer: null,
  /** @type {PDFRenderingQueue} */
  pdfRenderingQueue: null,
  /** @type {PDFPresentationMode} */
  pdfPresentationMode: null,
  /** @type {PDFDocumentProperties} */
  pdfDocumentProperties: null,
  /** @type {PDFLinkService} */
  pdfLinkService: null,
  /** @type {PDFHistory} */
  pdfHistory: null,
  /** @type {PDFSidebar} */
  pdfSidebar: null,
  /** @type {PDFDrawer} */
  pdfDrawer: null,
  /** @type {PDFSidebarResizer} */
  pdfSidebarResizer: null,
  /** @type {PDFOutlineViewer} */
  pdfOutlineViewer: null,
  /** @type {PDFAttachmentViewer} */
  pdfAttachmentViewer: null,
  /** @type {PDFLayerViewer} */
  pdfLayerViewer: null,
  /** @type {PDFCursorTools} */
  pdfCursorTools: null,
  /** @type {PDFScriptingManager} */
  pdfScriptingManager: null,
  /** @type {ViewHistory} */
  store: null,
  /** @type {DownloadManager} */
  downloadManager: null,
  /** @type {OverlayManager} */
  overlayManager: null,
  /** @type {Preferences} */
  preferences: null,
  /** @type {Toolbar} */
  toolbar: null,
  /** @type {SecondaryToolbar} */
  secondaryToolbar: null,
  /** @type {EventBus} */
  eventBus: null,
  /** @type {IL10n} */
  l10n: null,
  /** @type {AnnotationEditorParams} */
  annotationEditorParams: null,
  isInitialViewSet: false,
  downloadComplete: false,
  isViewerEmbedded: window.parent !== window,
  url: '',
  baseUrl: '',
  _downloadUrl: '',
  externalServices: DefaultExternalServices,
  _boundEvents: Object.create(null),
  documentInfo: null,
  metadata: null,
  _contentDispositionFilename: null,
  _contentLength: null,
  _saveInProgress: false,
  _docStats: null,
  _wheelUnusedTicks: 0,
  _idleCallbacks: new Set(),
  _PDFBug: null,
  _printAnnotationStoragePromise: null,

  vuePdf: null,
  selectedFileIndex: { page: 1 },
  annotate: [],
  commentList: [],
  commentMode: { on: false },
  mode: 0,
  peopleNames: [],
  selectId: 1,
  colorList: [],
  state: 0,
  annotateSignature: null,
  keepAnnotationId: null,

  selection: null,
  clipboard: null,
  historyUndo: [],
  historyRedo: [],
  historyNext: [],
  fabricParams: {
    allowTouchScrolling: true,
    eraserTool: false,
    drawTool: false,
    pointerTool: false,
  },
  drawColor: {
    brush: [],
    geometry: null,
    line: null,
    text: null,
  },
  drawWidth: {
    brush: [],
    geometry: null,
    line: null,
    text: null, // font size
  },
  role: null,
  activeType: {
    pointer: 0,
    brush: 0,
    geometry: 0,
    text: 0, // 0: off, 1: on
  },
  geometryMode: {
    geometry: false,
    line: false,
    arrow: false,
  },
  geometryShape: {
    id: 1,
  },
  drawBGC: {
    text: { r: 0, g: 0, b: 0, a: 0 },
  },
  control: null,
  selectedCanvas: {
    source: {},
  },
  showDrawTool: {
    on: false,
  },

  loadingScreen: null,

  // Called once when the document is loaded.
  async initialize(appConfig) {
    this.preferences = this.externalServices.createPreferences()
    this.appConfig = appConfig

    if (
      this.isViewerEmbedded &&
      AppOptions.get('externalLinkTarget') === LinkTarget.NONE
    ) {
      // Prevent external links from "replacing" the viewer,
      // when it's embedded in e.g. an <iframe> or an <object>.
      AppOptions.set('externalLinkTarget', LinkTarget.TOP)
    }
    await this._initializeViewerComponents()
    // Bind the various event handlers *after* the viewer has been
    // initialized, to prevent errors if an event arrives too soon.
    this.bindEvents()
    this.bindWindowEvents()

    this.enablePinchZoom()

    // We can start UI localization now.
    // const appContainer = appConfig.appContainer || document.documentElement

    this._initializedCapability.resolve()
  },

  /**
   * @private
   */
  _initializeViewerComponents() {
    const { appConfig, externalServices } = this

    const eventBus = externalServices.isInAutomation
      ? new AutomationEventBus()
      : new EventBus()
    this.eventBus = eventBus

    const pdfRenderingQueue = new PDFRenderingQueue()
    pdfRenderingQueue.onIdle = this._cleanup.bind(this)
    this.pdfRenderingQueue = pdfRenderingQueue

    const pdfLinkService = new PDFLinkService({
      eventBus,
      externalLinkTarget: AppOptions.get('externalLinkTarget'),
      externalLinkRel: AppOptions.get('externalLinkRel'),
      ignoreDestinationZoom: AppOptions.get('ignoreDestinationZoom'),
    })
    this.pdfLinkService = pdfLinkService

    const downloadManager = externalServices.createDownloadManager()
    this.downloadManager = downloadManager

    const state = 0
    this.state = state

    const pdfScriptingManager = new PDFScriptingManager({
      eventBus,
      sandboxBundleSrc: AppOptions.get('sandboxBundleSrc'),
      scriptingFactory: externalServices,
      docPropertiesLookup: this._scriptingDocProperties.bind(this),
    })
    this.pdfScriptingManager = pdfScriptingManager

    const container = appConfig.mainContainer
    const viewer = appConfig.viewerContainer
    this.selectedFileIndex = appConfig.selectedFileIndex
    this.annotate = appConfig.fileList[0].annotate
    this.commentList = appConfig.commentList
    this.commentMode = appConfig.commentMode
    this.selectId = appConfig.selectId
    this.colorList = appConfig.colorList
    this.mode = appConfig.mode
    this.vuePdf = appConfig.vuePdf
    this.keepAnnotationId = appConfig.keepAnnotationId
    this.loadingScreen = appConfig.loadingScreen
    if (appConfig.selectedColor) {
      this.drawColor.brush[0] = this.hex2rgb(
        appConfig.selectedColor.brush[0],
        1
      )
      this.drawColor.brush[1] = this.hex2rgb(
        appConfig.selectedColor.brush[1],
        1
      )
      this.drawColor.geometry = appConfig.selectedColor.geometry
      this.drawColor.line = appConfig.selectedColor.line
      this.drawColor.text = appConfig.selectedColor.text
    }
    this.drawWidth = appConfig.selectedWidth
    this.role = appConfig.role
    this.control = appConfig.control

    this.pdfViewer = new PDFViewer({
      container,
      viewer,
      eventBus,
      renderingQueue: pdfRenderingQueue,
      linkService: pdfLinkService,
      downloadManager,
      findController: null,
      scriptingManager:
        AppOptions.get('enableScripting') && pdfScriptingManager,
      renderer: AppOptions.get('renderer'),
      enableWebGL: AppOptions.get('enableWebGL'),
      textLayerMode: AppOptions.get('textLayerMode'),
      imageResourcesPath: AppOptions.get('imageResourcesPath'),
      renderInteractiveForms: AppOptions.get('renderInteractiveForms'),
      enablePrintAutoRotate: AppOptions.get('enablePrintAutoRotate'),
      useOnlyCssZoom: AppOptions.get('useOnlyCssZoom'),
      maxCanvasPixels: AppOptions.get('maxCanvasPixels'),
      enableScripting: AppOptions.get('enableScripting'),
      state,
      selectedFileIndex: this.selectedFileIndex,
      annotate: this.annotate,
      commentList: this.commentList,
      commentMode: this.commentMode,
      selectId: this.selectId,
      colorList: this.colorList,
      mode: this.mode,
      keepAnnotationId: this.keepAnnotationId,
      clipboard: this.clipboard,
      fabricParams: this.fabricParams,
      drawColor: this.drawColor,
      drawWidth: this.drawWidth,
      role: this.role,
      activeType: this.activeType,
      geometryMode: this.geometryMode,
      geometryShape: this.geometryShape,
      drawBGC: this.drawBGC,
      control: this.control,
      selectedCanvas: this.selectedCanvas,
      showDrawTool: this.showDrawTool,
      i18n: this.appConfig.i18n,
      watermark: this.appConfig.watermark,
    })
    pdfRenderingQueue.setViewer(this.pdfViewer)
    pdfLinkService.setViewer(this.pdfViewer)
    pdfScriptingManager.setViewer(this.pdfViewer)

    this.pdfThumbnailViewer = new PDFThumbnailViewer({
      container: appConfig.sidebar.thumbnailView,
      eventBus,
      renderingQueue: pdfRenderingQueue,
      linkService: pdfLinkService,
      watermark: this.appConfig.watermark,
    })
    pdfRenderingQueue.setThumbnailViewer(this.pdfThumbnailViewer)

    this.pdfSelectionViewer = new PDFSelectionViewer({
      container: appConfig.selectionView,
      eventBus,
      i18n: appConfig.i18n,
    })

    this.pdfCursorTools = new PDFCursorTools({
      container,
      eventBus,
      cursorToolOnLoad: AppOptions.get('cursorToolOnLoad'),
    })

    this.toolbar = new Toolbar(
      appConfig.toolbar,
      eventBus,
      this.selection,
      this.clipboard,
      this.historyUndo,
      this.historyRedo,
      this.mode
    )

    this.pdfSidebar = new PDFSidebar({
      elements: appConfig.sidebar,
      pdfViewer: this.pdfViewer,
      pdfThumbnailViewer: this.pdfThumbnailViewer,
      eventBus,
    })
    this.pdfSidebar.onToggled = this.forceRendering.bind(this)

    if (this.mode === 0 || this.mode === 5) {
      this.pdfDrawer = new PDFDrawer({
        elements: appConfig.drawer,
        pdfViewer: this.pdfViewer,
        eventBus,
      })
      this.pdfDrawer.onToggled = this.forceRendering.bind(this)
    }
  },

  run(config) {
    this.initialize(config).then(webViewerInitialized)
  },

  get initialized() {
    return this._initializedCapability.settled
  },

  get initializedPromise() {
    return this._initializedCapability.promise
  },

  zoomIn(steps) {
    if (this.pdfViewer.isInPresentationMode) {
      return
    }
    this.pdfViewer.increaseScale(steps)
  },

  zoomOut(steps) {
    if (this.pdfViewer.isInPresentationMode) {
      return
    }
    this.pdfViewer.decreaseScale(steps)
  },

  zoomReset() {
    if (this.pdfViewer.isInPresentationMode) {
      return
    }
    this.pdfViewer.currentScaleValue = DEFAULT_SCALE_VALUE
  },

  get pagesCount() {
    return this.pdfDocument ? this.pdfDocument.numPages : 0
  },

  get page() {
    return this.pdfViewer.currentPageNumber
  },

  set page(val) {
    this.pdfViewer.currentPageNumber = val
  },

  get supportsPrinting() {
    return PDFPrintServiceFactory.instance.supportsPrinting
  },

  get supportsFullscreen() {
    return shadow(this, 'supportsFullscreen', document.fullscreenEnabled)
  },

  get supportsIntegratedFind() {
    return this.externalServices.supportsIntegratedFind
  },

  get supportsDocumentFonts() {
    return this.externalServices.supportsDocumentFonts
  },

  get loadingBar() {
    // const bar = new ProgressBar('loadingBar')
    // return shadow(this, 'loadingBar', bar)
  },

  get supportedMouseWheelZoomModifierKeys() {
    return this.externalServices.supportedMouseWheelZoomModifierKeys
  },

  get firstPageOverview() {
    return this.pdfViewer ? this.pdfViewer.getFirstPageOverview() : null
  },

  setSelectId(selectId) {
    this.selectId = selectId
    this.pdfViewer.selectId = selectId
  },

  setAnnotateSelectId(annotateSelectId) {
    this.pdfViewer.setAnnotateSelectId(annotateSelectId)
  },

  addSignature(signature) {
    this.pdfViewer.addSignature(signature)
  },

  addStamp(stamp) {
    this.pdfViewer.addStamp(stamp)
  },

  addAttachment(attachment) {
    this.pdfViewer.addAttachment(attachment)
  },

  addImage(uploadImage) {
    this.pdfViewer.addImage(uploadImage)
  },

  checkNotComplete(showOutline) {
    return this.pdfViewer.checkNotComplete(showOutline)
  },

  scrollToNotComplete(pageNumber, annotate) {
    const rect = this.pdfViewer.container.getBoundingClientRect()
    const pageView = this.pdfViewer.getPageView(pageNumber - 1)
    const CSS_UNITS = 96.0 / 72.0
    const changeOrientation = pageView.rotation % 180 !== 0
    const pageHeight =
      (changeOrientation ? pageView.width : pageView.height) /
      pageView.scale /
      CSS_UNITS
    let destArray = null
    const offsetX =
      (annotate.x + annotate.width / 2 - rect.width / 2) /
        annotate.scale /
        CSS_UNITS >
      0
        ? (annotate.x + annotate.width / 2 - rect.width / 2) /
          annotate.scale /
          CSS_UNITS
        : 0
    const offsetY =
      pageHeight -
        (annotate.y + annotate.height / 2 - rect.height / 2) /
          annotate.scale /
          CSS_UNITS >
      0
        ? pageHeight -
          (annotate.y + annotate.height / 2 - rect.height / 2) /
            annotate.scale /
            CSS_UNITS
        : 0
    destArray = [null, { name: 'XYZ' }, offsetX, offsetY, annotate.scale]
    this.pdfViewer.scrollPageIntoView({
      pageNumber,
      destArray,
    })
  },

  bindToolbarEvent(buttons) {
    this.toolbar.bindToolbarEvent(buttons)
  },

  initPassiveLoading() {
    this.externalServices.initPassiveLoading({
      onOpenWithTransport: (url, length, transport) => {
        this.open(url, { length, range: transport })
      },
      onOpenWithData: (data, contentDispositionFilename) => {
        if (isPdfFile(contentDispositionFilename)) {
          this._contentDispositionFilename = contentDispositionFilename
        }
        this.open(data)
      },
      onOpenWithURL: (url, length, originalUrl) => {
        const file = originalUrl !== undefined ? { url, originalUrl } : url
        const args = length !== undefined ? { length } : null

        this.open(file, args)
      },
      onError: (err) => {
        this.l10n.get('loading_error').then((msg) => {
          this._documentError(msg, err)
        })
      },
      onProgress: (loaded, total) => {
        this.progress(loaded / total)
      },
    })
  },

  get _docFilename() {
    // Use `this.url` instead of `this.baseUrl` to perform filename detection
    // based on the reference fragment as ultimate fallback if needed.
    return this._contentDispositionFilename || getPdfFilenameFromUrl(this.url)
  },

  /**
   * @private
   */
  _cancelIdleCallbacks() {
    if (!this._idleCallbacks.size) {
      return
    }
    for (const callback of this._idleCallbacks) {
      window.cancelIdleCallback(callback)
    }
    this._idleCallbacks.clear()
  },

  /**
   * Closes opened PDF document.
   * @returns {Promise} - Returns the promise, which is resolved when all
   *                      destruction is completed.
   */
  async close(changeId = null) {
    this._unblockDocumentLoadEvent()
    if (!this.pdfLoadingTask) {
      return
    }
    const promises = []

    this.pdfViewer.resetFabricLayer()
    promises.push(this.pdfLoadingTask.destroy())
    this.pdfLoadingTask = null

    if (this.pdfDocument) {
      this.pdfDocument = null

      this.pdfThumbnailViewer.setDocument(null)
      this.pdfViewer.setDocument(null)
      this.pdfLinkService.setDocument(null)
    }
    this.pdfLinkService.externalLinkEnabled = true
    this.store = null
    this.isInitialViewSet = false
    this.downloadComplete = false
    this.url = ''
    this.baseUrl = ''
    this._downloadUrl = ''
    this.documentInfo = null
    this.metadata = null
    this._contentDispositionFilename = null
    this._contentLength = null
    this._saveInProgress = false
    this._docStats = null

    this._cancelIdleCallbacks()
    promises.push(this.pdfScriptingManager.destroyPromise)

    this.pdfSidebar.reset()
    this.pdfSelectionViewer.reset()
    if (this.pdfDrawer) {
      this.pdfDrawer.reset()
    }

    // if (this.pdfHistory) {
    //   this.pdfHistory.reset()
    // }
    this.toolbar.reset()
    if (!changeId) {
      this.vuePdf = null
      this.selectedFileIndex = { page: 1 }
      this.annotate = null
      this.commentList = []
      this.commentMode = { on: false }
      this.mode = null
      this.peopleNames = null
      this.selectId = null
      this.peopleNames = null
      this.selectId = null
      this.colorList = null
      this.state = null
      this.annotateSignature = null
      this.keepAnnotationId = null

      this.selection = null
      this.clipboard = null
      this.historyUndo = []
      this.historyRedo = []
      this.historyNext = []
      this.fabricParams = {
        allowTouchScrolling: true,
        eraserTool: false,
        drawTool: false,
        pointerTool: false,
      }
      this.drawColor = {
        brush: [],
        geometry: null,
        line: null,
        text: null,
      }
      this.drawWidth = {
        brush: [],
        geometry: null,
        line: null,
        text: null,
      }
      this.role = null
      this.activeType = {
        pointer: 0,
        brush: 0,
        geometry: 0,
        text: 0, // 0: off, 1: on
      }
      this.geometryMode = {
        geometry: false,
        line: false,
        arrow: false,
      }
      this.geometryShape = { id: 1 }
      this.drawBGC = {
        text: { r: 0, g: 0, b: 0, a: 0 },
      }
      this.control = null
      this.selectedCanvas = {
        source: {},
      }
      this.showDrawTool = {
        on: false,
      }

      this.unbindEvents()
      this.unbindWindowEvents()
      this.appConfig = null
      this.pdfDocument = null
      this.pdfLoadingTask = null
      this.pdfViewer = null
      this.pdfThumbnailViewer = null
      this.pdfSelectionViewer = null
      this.pdfRenderingQueue = null
      this.pdfLinkService = null
      this.pdfSidebar = null
      this.pdfDrawer = null
      this.pdfCursorTools = null
      this.pdfScriptingManager = null
      this.store = null
      this.downloadManager = null
      this.preferences = null
      this.toolbar = null
      this.eventBus = null
    } else {
      this.selectedFileIndex = { page: 1 }
      this.annotate = this.appConfig.fileList[changeId - 1].annotate
      this.commentList = []
      this.commentMode = { on: false }
      this.pdfViewer.setAnnotate(this.annotate)
      this.state = null
      this.annotateSignature = null
      this.keepAnnotationId = null
      this.selection = null
      this.clipboard = null
      this.historyUndo = []
      this.historyRedo = []
      this.historyNext = []
      this.fabricParams = {
        allowTouchScrolling: true,
        eraserTool: false,
        drawTool: false,
        pointerTool: false,
      }
      this.drawColor = {
        brush: [],
        geometry: null,
        line: null,
        text: null,
      }
      this.drawWidth = {
        brush: [],
        geometry: null,
        line: null,
        text: null,
      }
      this.role = null
      this.activeType = {
        pointer: 0,
        brush: 0,
        geometry: 0,
        text: 0, // 0: off, 1: on
      }
      this.geometryMode = {
        geometry: false,
        line: false,
        arrow: false,
      }
      this.geometryShape = { id: 1 }
      this.drawBGC = {
        text: { r: 0, g: 0, b: 0, a: 0 },
      }
      this.control = null
      this.selectedCanvas = {
        source: {},
      }
      this.toolbar.initialHistory()
    }

    await Promise.all(promises)
  },

  async changePdfFile(id) {
    PDFViewerApplication.appConfig.selectedFileIndex.page = id
    if (this.pdfLoadingTask) {
      await this.close(id)
    }
    let loadingTask = null
    const file = this.appConfig.fileList[id - 1].src
    if (file && file.constructor.name === 'PDFDocumentLoadingTask') {
      loadingTask = file
      this.pdfLoadingTask = loadingTask
    } else {
      const parameters = Object.create(null)
      if (typeof file === 'string') {
        parameters.url = file
      } else if (file && 'byteLength' in file) {
        // ArrayBuffer
        parameters.data = file
      } else if (file.url && file.originalUrl) {
        parameters.url = file.url
      }
      // Set the necessary API parameters, using the available options.
      const apiParameters = AppOptions.getAll(OptionKind.API)
      for (const key in apiParameters) {
        const value = apiParameters[key]
        parameters[key] = value
      }

      loadingTask = getDocument(parameters)
      this.pdfLoadingTask = loadingTask
    }

    loadingTask.onProgress = ({ loaded, total }) => {
      this.progress(loaded / total)
    }

    // Listen for unsupported features to trigger the fallback UI.
    loadingTask.onUnsupportedFeature = this.fallback.bind(this)
    return loadingTask.promise.then(
      (pdfDocument) => {
        this.load(pdfDocument)
        this.getAllPdfAnnotation(pdfDocument)
      },
      (exception) => {
        if (loadingTask !== this.pdfLoadingTask) {
          return undefined // Ignore errors for previously opened PDF files.
        }
        throw exception
      }
    )
  },

  /**
   * Opens PDF document specified by URL or array with additional arguments.
   * @param {string|TypedArray|ArrayBuffer} file - PDF location or binary data.
   * @param {Object} [args] - Additional arguments for the getDocument call,
   *                          e.g. HTTP headers ('httpHeaders') or alternative
   *                          data transport ('range').
   * @returns {Promise} - Returns the promise, which is resolved when document
   *                      is opened.
   */
  async open(file, args) {
    if (this.pdfLoadingTask) {
      // We need to destroy already opened document.
      await this.close()
    }

    GlobalWorkerOptions.workerSrc = PDFWorker
    let loadingTask = null
    if (file && file.constructor.name === 'PDFDocumentLoadingTask') {
      loadingTask = file
      this.pdfLoadingTask = loadingTask
    } else {
      const parameters = Object.create(null)
      if (typeof file === 'string') {
        parameters.url = file
      } else if (file && 'byteLength' in file) {
        // ArrayBuffer
        parameters.data = file
      } else if (file.url && file.originalUrl) {
        parameters.url = file.url
      }
      // Set the necessary API parameters, using the available options.
      const apiParameters = AppOptions.getAll(OptionKind.API)
      for (const key in apiParameters) {
        const value = apiParameters[key]
        parameters[key] = value
      }
      // Finally, update the API parameters with the arguments (if they exist).
      if (args) {
        for (const key in args) {
          parameters[key] = args[key]
        }
      }

      loadingTask = getDocument(parameters)
      this.pdfLoadingTask = loadingTask
    }

    loadingTask.onProgress = ({ loaded, total }) => {
      this.progress(loaded / total)
    }

    // Listen for unsupported features to trigger the fallback UI.
    loadingTask.onUnsupportedFeature = this.fallback.bind(this)

    return loadingTask.promise.then(
      (pdfDocument) => {
        this.load(pdfDocument)
        this.getAllPdfAnnotation(pdfDocument)
      },
      (exception) => {
        if (loadingTask !== this.pdfLoadingTask) {
          return undefined // Ignore errors for previously opened PDF files.
        }
        throw exception
      }
    )
  },

  async getLoadingTask(file) {
    if (this.pdfLoadingTask) {
      // We need to destroy already opened document.
      await this.close()
    }
    GlobalWorkerOptions.workerSrc = PDFWorker
    const parameters = Object.create(null)
    if (typeof file === 'string') {
      parameters.url = file
    } else if (file && 'byteLength' in file) {
      // ArrayBuffer
      parameters.data = file
    } else if (file.url && file.originalUrl) {
      parameters.url = file.url
    }
    // Set the necessary API parameters, using the available options.
    const apiParameters = AppOptions.getAll(OptionKind.API)
    for (const key in apiParameters) {
      const value = apiParameters[key]
      parameters[key] = value
    }

    const loadingTask = getDocument(parameters)
    return loadingTask
  },

  async getAllPdfAnnotation(doc) {
    if (PDFViewerApplication.mode === 1 || PDFViewerApplication.mode === 3) {
      const annotations = []
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i)
        const annotates = await page.getAnnotations()
        annotates.forEach((anno) => {
          if (anno.annotationType === 1 || anno.annotationType === 17) {
            anno.page = i
            annotations.push(anno)
          }
        })
      }
      this.eventBus.dispatch('getPdfAnnotations', { annotations, viewport: 1 })
    }
  },

  fallback(featureId) {
    this.externalServices.reportTelemetry({
      type: 'unsupportedFeature',
      featureId,
    })

    // Only trigger the fallback once so we don't spam the user with messages
    // for one PDF.
    if (this._fellback) {
      return
    }
    this._fellback = true

    this.externalServices
      .fallback({
        featureId,
        url: this.baseUrl,
      })
      .then((download) => {
        if (!download) {
          return
        }
        this.download({ sourceEventType: 'download' })
      })
  },

  /**
   * Show the error box; used for errors affecting loading and/or parsing of
   * the entire PDF document.
   */
  _documentError(message, moreInfo = null) {
    this._unblockDocumentLoadEvent()

    this._otherError(message, moreInfo)
  },

  /**
   * Show the error box; used for errors affecting e.g. only a single page.
   *
   * @param {string} message - A message that is human readable.
   * @param {Object} [moreInfo] - Further information about the error that is
   *                              more technical.  Should have a 'message' and
   *                              optionally a 'stack' property.
   */
  _otherError(message, moreInfo = null) {
    const moreInfoText = ['error_version_info']
    if (moreInfo) {
      moreInfoText.push(moreInfo.message)
      if (moreInfo.stack) {
        moreInfoText.push(moreInfo.stack)
      } else {
        if (moreInfo.filename) {
          moreInfoText.push(moreInfo.filename)
        }
        if (moreInfo.lineNumber) {
          moreInfoText.push(moreInfo.lineNumber)
        }
      }
    }

    // if (typeof PDFJSDev === 'undefined' || !PDFJSDev.test('MOZCENTRAL')) {
    //   const errorWrapperConfig = this.appConfig.errorWrapper
    //   const errorWrapper = errorWrapperConfig.container
    //   errorWrapper.hidden = false

    //   const errorMessage = errorWrapperConfig.errorMessage
    //   errorMessage.textContent = message

    //   const closeButton = errorWrapperConfig.closeButton
    //   closeButton.onclick = function () {
    //     errorWrapper.hidden = true
    //   }

    //   const errorMoreInfo = errorWrapperConfig.errorMoreInfo
    //   const moreInfoButton = errorWrapperConfig.moreInfoButton
    //   const lessInfoButton = errorWrapperConfig.lessInfoButton
    //   moreInfoButton.onclick = function () {
    //     errorMoreInfo.hidden = false
    //     moreInfoButton.hidden = true
    //     lessInfoButton.hidden = false
    //     errorMoreInfo.style.height = errorMoreInfo.scrollHeight + 'px'
    //   }
    //   lessInfoButton.onclick = function () {
    //     errorMoreInfo.hidden = true
    //     moreInfoButton.hidden = false
    //     lessInfoButton.hidden = true
    //   }
    //   moreInfoButton.oncontextmenu = noContextMenuHandler
    //   lessInfoButton.oncontextmenu = noContextMenuHandler
    //   closeButton.oncontextmenu = noContextMenuHandler
    //   moreInfoButton.hidden = false
    //   lessInfoButton.hidden = true
    //   Promise.all(moreInfoText).then((parts) => {
    //     errorMoreInfo.value = parts.join('\n')
    //   })
    // } else {
    //   Promise.all(moreInfoText).then((parts) => {
    //     console.error(message + '\n' + parts.join('\n'))
    //   })
    //   this.fallback()
    // }
  },

  progress(level) {
    if (this.downloadComplete) {
      // Don't accidentally show the loading bar again when the entire file has
      // already been fetched (only an issue when disableAutoFetch is enabled).
      return
    }
    const percent = Math.round(level * 100)
    // When we transition from full request to range requests, it's possible
    // that we discard some of the loaded data. This can cause the loading
    // bar to move backwards. So prevent this by only updating the bar if it
    // increases.
    // if (percent <= this.loadingBar.percent) {
    //   return
    // }
    // this.loadingBar.percent = percent

    // When disableAutoFetch is enabled, it's not uncommon for the entire file
    // to never be fetched (depends on e.g. the file structure). In this case
    // the loading bar will not be completely filled, nor will it be hidden.
    // To prevent displaying a partially filled loading bar permanently, we
    // hide it when no data has been loaded during a certain amount of time.
    const disableAutoFetch =
      this.pdfDocument?.loadingParams.disableAutoFetch ??
      AppOptions.get('disableAutoFetch')

    if (!disableAutoFetch || isNaN(percent)) {
      return
    }
    if (this.disableAutoFetchLoadingBarTimeout) {
      clearTimeout(this.disableAutoFetchLoadingBarTimeout)
      this.disableAutoFetchLoadingBarTimeout = null
    }
    this.loadingScreen.style.removeProperty('display')
    // this.loadingBar.show()

    this.disableAutoFetchLoadingBarTimeout = setTimeout(() => {
      // this.loadingBar.hide()
      this.loadingScreen.style.setProperty('display', 'none')
      this.disableAutoFetchLoadingBarTimeout = null
    }, DISABLE_AUTO_FETCH_LOADING_BAR_TIMEOUT)
  },

  load(pdfDocument) {
    this.pdfDocument = pdfDocument

    pdfDocument.getDownloadInfo().then(({ length }) => {
      this._contentLength = length // Ensure that the correct length is used.
      this.downloadComplete = true
      // this.loadingBar.hide()

      firstPagePromise.then(() => {
        setTimeout(() => {
          this.loadingScreen.style.setProperty('display', 'none')
        }, 500)
        this.eventBus.dispatch('documentloaded', { source: this })
        this.eventBus.dispatch('setDocumentLoaded', {
          source: this,
          documentLoaded: true,
        })
      })
    })

    // Since the `setInitialView` call below depends on this being resolved,
    // fetch it early to avoid delaying initial rendering of the PDF document.
    const pageLayoutPromise = pdfDocument.getPageLayout().catch(function () {
      /* Avoid breaking initial rendering; ignoring errors. */
    })
    const pageModePromise = pdfDocument.getPageMode().catch(function () {
      /* Avoid breaking initial rendering; ignoring errors. */
    })
    const openActionPromise = pdfDocument.getOpenAction().catch(function () {
      /* Avoid breaking initial rendering; ignoring errors. */
    })

    this.toolbar.setPagesCount(pdfDocument.numPages, false)

    this.pdfLinkService.setDocument(pdfDocument)

    const pdfViewer = this.pdfViewer
    pdfViewer.setDocument(pdfDocument)
    const { firstPagePromise, onePageRendered, pagesPromise } = pdfViewer

    const pdfThumbnailViewer = this.pdfThumbnailViewer
    pdfThumbnailViewer.setDocument(pdfDocument)

    firstPagePromise.then((pdfPage) => {
      // this.loadingBar.setWidth(this.appConfig.viewerContainer)
      this._initializeAnnotationStorageCallbacks(pdfDocument)

      Promise.all([
        animationStarted,
        pageLayoutPromise,
        pageModePromise,
        openActionPromise,
      ])
        .then(async ([timeStamp, stored, pageLayout, pageMode, openAction]) => {
          const initialBookmark = this.initialBookmark

          // Initialize the default values, from user preferences.
          const zoom = AppOptions.get('defaultZoomValue')
          const hash = zoom ? `zoom=${zoom}` : null

          const rotation = null
          let sidebarView = AppOptions.get('sidebarViewOnLoad')
          const scrollMode = AppOptions.get('scrollModeOnLoad')
          let spreadMode = AppOptions.get('spreadModeOnLoad')

          // Always let the user preference/view history take precedence.
          if (pageMode && sidebarView === SidebarView.UNKNOWN) {
            sidebarView = apiPageModeToSidebarView(pageMode)
          }
          if (
            pageLayout &&
            scrollMode === ScrollMode.UNKNOWN &&
            spreadMode === SpreadMode.UNKNOWN
          ) {
            const modes = apiPageLayoutToViewerModes(pageLayout)
            // TODO: Try to improve page-switching when using the mouse-wheel
            // and/or arrow-keys before allowing the document to control this.
            // scrollMode = modes.scrollMode;
            spreadMode = modes.spreadMode
          }

          this.setInitialView(hash, {
            rotation,
            sidebarView,
            scrollMode,
            spreadMode,
          })
          this.eventBus.dispatch('documentinit', { source: this })
          // Make all navigation keys work on document load,
          // unless the viewer is embedded in a web page.
          if (!this.isViewerEmbedded) {
            pdfViewer.focus()
          }

          // For documents with different page sizes, once all pages are
          // resolved, ensure that the correct location becomes visible on load.
          // (To reduce the risk, in very large and/or slow loading documents,
          //  that the location changes *after* the user has started interacting
          //  with the viewer, wait for either `pagesPromise` or a timeout.)
          await Promise.race([
            pagesPromise,
            new Promise((resolve) => {
              setTimeout(resolve, FORCE_PAGES_LOADED_TIMEOUT)
            }),
          ])
          if (!initialBookmark && !hash) {
            return
          }
          if (pdfViewer.hasEqualPageSizes) {
            return
          }
          this.initialBookmark = initialBookmark

          // eslint-disable-next-line no-self-assign
          pdfViewer.currentScaleValue = pdfViewer.currentScaleValue
          // Re-apply the initial document location.
          this.setInitialView(hash)
        })
        .catch(() => {
          // Ensure that the document is always completely initialized,
          // even if there are any errors thrown above.
          this.setInitialView()
        })
        .then(function () {
          // At this point, rendering of the initial page(s) should always have
          // started (and may even have completed).
          // To prevent any future issues, e.g. the document being completely
          // blank on load, always trigger rendering here.
          pdfViewer.update()
        })
    })

    pagesPromise.then(
      () => {
        this._unblockDocumentLoadEvent()
      },
      (reason) => {
        this.l10n.get('loading_error').then((msg) => {
          this._documentError(msg, { message: reason?.message })
        })
      }
    )

    onePageRendered.then((data) => {
      this.externalServices.reportTelemetry({
        type: 'pageInfo',
        timestamp: data.timestamp,
      })

      if ('requestIdleCallback' in window) {
        const callback = window.requestIdleCallback(
          () => {
            this._collectTelemetry(pdfDocument)
            this._idleCallbacks.delete(callback)
          },
          { timeout: 1000 }
        )
        this._idleCallbacks.add(callback)
      }
    })

    this._initializePageLabels(pdfDocument)
  },

  /**
   * @private
   */
  async _scriptingDocProperties(pdfDocument) {
    if (!this.documentInfo) {
      // It should be *extremely* rare for metadata to not have been resolved
      // when this code runs, but ensure that we handle that case here.
      await new Promise((resolve) => {
        this.eventBus._on('metadataloaded', resolve, { once: true })
      })
      if (pdfDocument !== this.pdfDocument) {
        return null // The document was closed while the metadata resolved.
      }
    }
    if (!this._contentLength) {
      // Always waiting for the entire PDF document to be loaded will, most
      // likely, delay sandbox-creation too much in the general case for all
      // PDF documents which are not provided as binary data to the API.
      // Hence we'll simply have to trust that the `contentLength` (as provided
      // by the server), when it exists, is accurate enough here.
      await new Promise((resolve) => {
        this.eventBus._on('documentloaded', resolve, { once: true })
      })
      if (pdfDocument !== this.pdfDocument) {
        return null // The document was closed while the downloadInfo resolved.
      }
    }

    return {
      ...this.documentInfo,
      baseURL: this.baseUrl,
      filesize: this._contentLength,
      filename: this._docFilename,
      metadata: this.metadata?.getRaw(),
      authors: this.metadata?.get('dc:creator'),
      numPages: this.pagesCount,
      URL: this.url,
    }
  },

  /**
   * A place to fetch data for telemetry after one page is rendered and the
   * viewer is idle.
   * @private
   */
  async _collectTelemetry(pdfDocument) {
    const markInfo = await this.pdfDocument.getMarkInfo()
    if (pdfDocument !== this.pdfDocument) {
      return // Document was closed while waiting for mark info.
    }
    const tagged = markInfo?.Marked || false
    this.externalServices.reportTelemetry({
      type: 'tagged',
      tagged,
    })
  },

  /**
   * @private
   */
  async _initializePageLabels(pdfDocument) {
    const labels = await pdfDocument.getPageLabels()

    if (pdfDocument !== this.pdfDocument) {
      return // The document was closed while the page labels resolved.
    }
    if (!labels || AppOptions.get('disablePageLabels')) {
      return
    }
    const numLabels = labels.length
    // Ignore page labels that correspond to standard page numbering,
    // or page labels that are all empty.
    let standardLabels = 0
    let emptyLabels = 0
    for (let i = 0; i < numLabels; i++) {
      const label = labels[i]
      if (label === (i + 1).toString()) {
        standardLabels++
      } else if (label === '') {
        emptyLabels++
      } else {
        break
      }
    }
    if (standardLabels >= numLabels || emptyLabels >= numLabels) {
      return
    }
    const { pdfViewer, pdfThumbnailViewer, toolbar } = this

    pdfViewer.setPageLabels(labels)
    pdfThumbnailViewer.setPageLabels(labels)

    // Changing toolbar page display to use labels and we need to set
    // the label of the current page.
    toolbar.setPagesCount(numLabels, true)
    toolbar.setPageNumber(
      pdfViewer.currentPageNumber,
      pdfViewer.currentPageLabel
    )
  },

  /**
   * @private
   */
  _initializeAnnotationStorageCallbacks(pdfDocument) {
    if (pdfDocument !== this.pdfDocument) {
      return
    }
    const { annotationStorage } = pdfDocument

    annotationStorage.onSetModified = () => {
      window.addEventListener('beforeunload', beforeUnload)
      this._annotationStorageModified = true
    }
    annotationStorage.onResetModified = () => {
      window.removeEventListener('beforeunload', beforeUnload)
      delete this._annotationStorageModified
    }
  },

  setInitialView(
    storedHash,
    { rotation, sidebarView, scrollMode, spreadMode } = {}
  ) {
    const setRotation = (angle) => {
      if (isValidRotation(angle)) {
        this.pdfViewer.pagesRotation = angle
      }
    }
    const setViewerModes = (scroll, spread) => {
      if (isValidScrollMode(scroll)) {
        this.pdfViewer.scrollMode = scroll
      }
      if (isValidSpreadMode(spread)) {
        this.pdfViewer.spreadMode = spread
      }
    }
    this.isInitialViewSet = true
    this.pdfSidebar.setInitialView(sidebarView)

    setViewerModes(scrollMode, spreadMode)

    if (this.initialBookmark) {
      setRotation(this.initialRotation)
      delete this.initialRotation

      this.pdfLinkService.setHash(this.initialBookmark)
      this.initialBookmark = null
    } else if (storedHash) {
      setRotation(rotation)

      this.pdfLinkService.setHash(storedHash)
    }

    // Ensure that the correct page number is displayed in the UI,
    // even if the active page didn't change during document load.
    this.toolbar.setPageNumber(
      this.pdfViewer.currentPageNumber,
      this.pdfViewer.currentPageLabel
    )

    if (!this.pdfViewer.currentScaleValue) {
      // Scale was not initialized: invalid bookmark or scale was not specified.
      // Setting the default one.
      this.pdfViewer.currentScaleValue = DEFAULT_SCALE_VALUE
    }
  },

  /**
   * @private
   */
  _cleanup() {
    if (!this.pdfDocument) {
      return // run cleanup when document is loaded
    }
    try {
      this.pdfViewer.cleanup()
      this.pdfThumbnailViewer.cleanup()

      // We don't want to remove fonts used by active page SVGs.
      this.pdfDocument
        .cleanup(
          /* keepLoadedFonts = */ this.pdfViewer.renderer === RendererType.SVG
        )
        .catch((e1) => {})
    } catch (e) {}
  },

  forceRendering() {
    this.pdfRenderingQueue.printing = !!this.printService
    this.pdfRenderingQueue.isThumbnailViewEnabled =
      this.pdfSidebar.visibleView === SidebarView.THUMBS
    this.pdfRenderingQueue.renderHighestPriority()
  },

  rotatePages(delta) {
    this.pdfViewer.pagesRotation += delta
    // Note that the thumbnail viewer is updated, and rendering is triggered,
    // in the 'rotationchanging' event handler.
  },

  enablePinchZoom() {
    let startX = 0
    let startY = 0
    let initialPinchDistance = 0
    let pinchScale = 1
    const MIN_SCALE = 0.1
    const isMobile =
      /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(navigator.userAgent) ||
      /\b(Android|Windows Phone|iPod)\b/i.test(navigator.userAgent)
    const MAX_SCALE = isMobile === true ? 2.0 : 4.0
    const viewer = this.appConfig.viewerContainer
    const container = this.appConfig.mainContainer
    const self = this
    const reset = () => {
      startX = startY = initialPinchDistance = 0
      pinchScale = 1
    }
    // Prevent native iOS page zoom
    // document.addEventListener("touchmove", (e) => { if (e.scale !== 1) { e.preventDefault(); } }, { passive: false });
    const touchStartEvent = (e) => {
      if (e.touches.length > 1) {
        startX = (e.touches[0].pageX + e.touches[1].pageX) / 2
        startY = (e.touches[0].pageY + e.touches[1].pageY) / 2
        initialPinchDistance = Math.hypot(
          e.touches[1].pageX - e.touches[0].pageX,
          e.touches[1].pageY - e.touches[0].pageY
        )
      } else {
        initialPinchDistance = 0
      }
    }
    const touchMoveEvent = (e) => {
      if (initialPinchDistance <= 0 || e.touches.length < 2) {
        return
      }
      if (e.scale !== 1) {
        e.preventDefault()
      }
      e.stopPropagation()
      const pinchDistance = Math.hypot(
        e.touches[1].pageX - e.touches[0].pageX,
        e.touches[1].pageY - e.touches[0].pageY
      )
      const originX = startX + container.scrollLeft
      const originY = startY + container.scrollTop
      pinchScale = pinchDistance / initialPinchDistance
      viewer.style.transform = `scale(${pinchScale})`
      viewer.style.transformOrigin = `${originX}px ${originY}px`
    }
    const touchEndEvent = (e) => {
      if (initialPinchDistance <= 0) {
        return
      }
      viewer.style.transform = `none`
      viewer.style.transformOrigin = `unset`
      let newPinchScale = self.pdfViewer.currentScale * pinchScale
      newPinchScale =
        newPinchScale >= MAX_SCALE
          ? MAX_SCALE
          : newPinchScale <= MIN_SCALE
          ? MIN_SCALE
          : newPinchScale
      if (newPinchScale < MAX_SCALE && newPinchScale > MIN_SCALE) {
        self.pdfViewer.currentScale = newPinchScale
        const rect = container.getBoundingClientRect()
        const dx = startX - rect.left
        const dy = startY - rect.top
        container.scrollLeft += dx * (pinchScale - 1)
        container.scrollTop += dy * (pinchScale - 1)
      }
      reset()
    }
    container.addEventListener('touchstart', touchStartEvent)
    container.addEventListener('touchmove', touchMoveEvent, {
      passive: false,
    })
    container.addEventListener('touchend', touchEndEvent)
  },

  changeLocation(location) {
    const destArray = [null, { name: 'XYZ' }, location.left, location.top, null]
    this.pdfViewer.scrollPageIntoView({
      pageNumber: location.pageNumber,
      destArray,
    })
  },

  changeScale(scale) {
    this.pdfViewer.currentScale = scale
  },

  getScaleInfo(compareScale) {
    return {
      isSame: this.pdfViewer.currentScale === compareScale,
      currentScale: this.pdfViewer.currentScale,
      compareScale,
    }
  },

  changeAnnotate(fileList, selectedFile, history) {
    this.annotate = fileList[selectedFile - 1].annotate
    PDFViewerApplication.historyUndo = history.historyUndo
    PDFViewerApplication.toolbar.setHistoryUndo(
      PDFViewerApplication.historyUndo
    )
    PDFViewerApplication.historyRedo = history.historyRedo
    PDFViewerApplication.toolbar.setHistoryRedo(
      PDFViewerApplication.historyRedo
    )
    PDFViewerApplication.historyNext = history.historyNext
    this.pdfViewer.changeAnnotate(this.annotate, history)
  },

  addDoneAnnotate(evt) {
    if (PDFViewerApplication.mode === 5) {
      PDFViewerApplication.pdfViewer.addDoneAnnotate(evt.state, evt.data)
    }
  },

  editDoneAnnotate(evt) {
    if (PDFViewerApplication.mode === 5) {
      PDFViewerApplication.pdfViewer.editDoneAnnotate(
        evt.state,
        evt.data,
        evt.page
      )
    }
  },

  hex2rgb(hex, opacity) {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return { r, g, b, a: opacity }
  },

  bindEvents() {
    const { eventBus } = this
    eventBus._on('resize', webViewerResize)
    eventBus._on('pagerendered', webViewerPageRendered)
    eventBus._on('updateviewarea', webViewerUpdateViewarea)
    eventBus._on('pagechanging', webViewerPageChanging)
    eventBus._on('scalechanging', webViewerScaleChanging)
    eventBus._on('rotationchanging', webViewerRotationChanging)
    eventBus._on('sidebarviewchanged', webViewerSidebarViewChanged)
    eventBus._on('pagemode', webViewerPageMode)
    eventBus._on('namedaction', webViewerNamedAction)
    eventBus._on('firstpage', webViewerFirstPage)
    eventBus._on('lastpage', webViewerLastPage)
    eventBus._on('nextpage', webViewerNextPage)
    eventBus._on('previouspage', webViewerPreviousPage)
    eventBus._on('zoomin', webViewerZoomIn)
    eventBus._on('zoomout', webViewerZoomOut)
    eventBus._on('zoomreset', webViewerZoomReset)
    eventBus._on('pagenumberchanged', webViewerPageNumberChanged)
    eventBus._on('scalechanged', webViewerScaleChanged)
    eventBus._on('rotatecw', webViewerRotateCw)
    eventBus._on('rotateccw', webViewerRotateCcw)
    eventBus._on('optionalcontentconfig', webViewerOptionalContentConfig)
    eventBus._on('switchscrollmode', webViewerSwitchScrollMode)
    eventBus._on('scrollmodechanged', webViewerScrollModeChanged)
    eventBus._on('clearSelectAnnotate', webViewerClearSelectAnnotate)
    eventBus._on('addAnnotate', webViewerAddAnnotate)
    eventBus._on('changeBrushColor', webViewerChangeBrushColor)
    eventBus._on('changeBrushOpacity', webViewerChangeBrushOpacity)
    eventBus._on('changeBrushType', webViewerChangeBrushType)
    eventBus._on('changeGeometryShape', webViewerChangeGeometryShape)
    eventBus._on('changeGeometryColor', webViewerChangeGeometryColor)
    eventBus._on('changeTextColor', webViewerChangeTextColor)
    eventBus._on('changeLineColor', webViewerChangeLineColor)
    eventBus._on('changeBrushWidth', webViewerChangeBrushWidth)
    eventBus._on('changeGeometryWidth', webViewerChangeGeometryWidth)
    eventBus._on('changeTextSize', webViewerChangeTextSize)
    eventBus._on('changeLineWidth', webViewerChangeLineWidth)
    eventBus._on('changeTextBGC', webViewerChangeTextBGC)
    eventBus._on('changeTextBGOpacity', webViewerChangeTextBGOpacity)
    eventBus._on('switchControl', webViewerSwitchControl)
    eventBus._on('removeAnnotateToggled', webViewerRemoveAnnotateToggled)
    eventBus._on('setAnnotateSignature', webViewerSetAnnotateSignature)
    eventBus._on('setAnnotateStamp', webViewerSetAnnotateStamp)
    eventBus._on(
      'setAnnotateSignatureAndStamp',
      webViewerSetAnnotateSignatureAndStamp
    )
    eventBus._on('setAnnotateAttachment', webViewerSetAnnotateAttachment)
    eventBus._on('setAnnotateImage', webViewerSetAnnotateImage)
    eventBus._on('selectAnnotate', webViewerSelectAnnotate)
    eventBus._on('deselectAnnotate', webViewerDeselectAnnotate)
    eventBus._on(
      'setSelectionViewSelection',
      webViewerSetSelectionViewSelection
    )
    eventBus._on(
      'setSelectionViewCheckboxOption',
      webViewerSetSelectionViewCheckboxOption
    )
    eventBus._on(
      'setSelectionViewRadioOption',
      webViewerSetSelectionViewRadioOption
    )
    eventBus._on('deselectCanvas', webViewerDeselectCanvas)
    eventBus._on('toggleSidebar', webViewerToggleSidebar)
    eventBus._on('toggleDrawer', webViewerToggleDrawer)
    eventBus._on('toggleDrawTool', webViewerToggleDrawTool)
    eventBus._on('setSelectedCanvas', webViewerSelectedCanvas)
    eventBus._on('setShowDrawTool', webViewerSetShowDrawTool)
    eventBus._on('setIsAllowTouchScrolling', webViewerSetIsAllowTouchScrolling)
    eventBus._on('initActiveType', webViewerInitActiveType)
    eventBus._on(
      'setIsAllowTouchScrollingPC',
      webViewerSetIsAllowTouchScrollingPC
    )
    eventBus._on('updateAnnotateTool', webViewerUpdateAnnotateTool)
    eventBus._on('checkAnnotateChanged', webViewerCheckAnnotateChanged)
    eventBus._on('setDocumentLoaded', webViewerSetDocumentLoaded)
    eventBus._on('setPageScrolling', webViewerSetPageScrolling)
    eventBus._on('undo', webViewerUndo)
    eventBus._on('redo', webViewerRedo)
    eventBus._on('copy', webViewerCopy)
    eventBus._on('paste', webViewerPaste)
    eventBus._on('eraser', webViewerEraser)
    eventBus._on('draw', webViewerDraw)
    eventBus._on('pointer', webViewerPointer)
    eventBus._on('initDrawTool', webViewerInitDrawTool)
    eventBus._on('disableBrush', webViewerDisableBrush)
    eventBus._on('setHistoryUndo', webViewerSetHistoryUndo)
    eventBus._on('setHistoryRedo', webViewerSetHistoryRedo)
    eventBus._on('initHistoryRedo', webViewerInitHistoryRedo)
    eventBus._on('setHistoryNext', webViewerSetHistoryNext)
    eventBus._on('initHistory', webViewerInitHistory)
    eventBus._on('createDatePicker', webViewerCreateDatePicker)
    eventBus._on('notifyAnnotateChanged', webViewerNotifyAnnotateChanged)
    eventBus._on('initDoneAnnotate', webViewerInitDoneAnnotate)
    eventBus._on('editDoneAnnotate', webViewerEditDoneAnnotate)
    eventBus._on('render', webViewerRender)
    eventBus._on('getPdfAnnotations', getPdfAnnotations)
    eventBus._on('addPdfAnnotation', addPdfAnnotation)
    eventBus._on('changeCommentMode', changeCommentMode)
    eventBus._on('removePdfAnnotation', removePdfAnnotation)
    eventBus._on('focusPdfAnnotation', focusPdfAnnotation)
  },

  bindWindowEvents() {
    const { eventBus, _boundEvents } = this

    _boundEvents.windowResize = () => {
      eventBus.dispatch('resize', { source: window })
    }
    _boundEvents.windowHashChange = () => {
      eventBus.dispatch('hashchange', {
        source: window,
        hash: document.location.hash.substring(1),
      })
    }
    _boundEvents.windowUpdateFromSandbox = (event) => {
      eventBus.dispatch('updatefromsandbox', {
        source: window,
        detail: event.detail,
      })
    }

    window.addEventListener('visibilitychange', webViewerVisibilityChange)
    window.addEventListener('wheel', webViewerWheel, { passive: false })
    // window.addEventListener('touchstart', webViewerTouchStart, {
    //   passive: false,
    // })
    window.addEventListener('keydown', webViewerKeyDown)
    window.addEventListener('resize', _boundEvents.windowResize)
    window.addEventListener('hashchange', _boundEvents.windowHashChange)
    window.addEventListener(
      'updatefromsandbox',
      _boundEvents.windowUpdateFromSandbox
    )
  },

  unbindEvents() {
    const { eventBus } = this

    eventBus._off('resize', webViewerResize)
    eventBus._off('pagerendered', webViewerPageRendered)
    eventBus._off('updateviewarea', webViewerUpdateViewarea)
    eventBus._off('pagechanging', webViewerPageChanging)
    eventBus._off('scalechanging', webViewerScaleChanging)
    eventBus._off('rotationchanging', webViewerRotationChanging)
    eventBus._off('sidebarviewchanged', webViewerSidebarViewChanged)
    eventBus._off('pagemode', webViewerPageMode)
    eventBus._off('namedaction', webViewerNamedAction)
    eventBus._off('firstpage', webViewerFirstPage)
    eventBus._off('lastpage', webViewerLastPage)
    eventBus._off('nextpage', webViewerNextPage)
    eventBus._off('previouspage', webViewerPreviousPage)
    eventBus._off('zoomin', webViewerZoomIn)
    eventBus._off('zoomout', webViewerZoomOut)
    eventBus._off('zoomreset', webViewerZoomReset)
    eventBus._off('pagenumberchanged', webViewerPageNumberChanged)
    eventBus._off('scalechanged', webViewerScaleChanged)
    eventBus._off('rotatecw', webViewerRotateCw)
    eventBus._off('rotateccw', webViewerRotateCcw)
    eventBus._off('optionalcontentconfig', webViewerOptionalContentConfig)
    eventBus._off('switchscrollmode', webViewerSwitchScrollMode)
    eventBus._off('scrollmodechanged', webViewerScrollModeChanged)
    eventBus._off('updatefindmatchescount', webViewerUpdateFindMatchesCount)
    eventBus._off('updatefindcontrolstate', webViewerUpdateFindControlState)
    eventBus._off('clearSelectAnnotate', webViewerClearSelectAnnotate)
    eventBus._off('addAnnotate', webViewerAddAnnotate)
    eventBus._off('changeBrushColor', webViewerChangeBrushColor)
    eventBus._off('changeBrushOpacity', webViewerChangeBrushOpacity)
    eventBus._off('changeBrushType', webViewerChangeBrushType)
    eventBus._off('changeGeometryShape', webViewerChangeGeometryShape)
    eventBus._off('changeGeometryColor', webViewerChangeGeometryColor)
    eventBus._off('changeTextColor', webViewerChangeTextColor)
    eventBus._off('changeLineColor', webViewerChangeLineColor)
    eventBus._off('changeBrushWidth', webViewerChangeBrushWidth)
    eventBus._off('changeGeometryWidth', webViewerChangeGeometryWidth)
    eventBus._off('changeTextSize', webViewerChangeTextSize)
    eventBus._off('changeLineWidth', webViewerChangeLineWidth)
    eventBus._off('changeTextBGC', webViewerChangeTextBGC)
    eventBus._off('changeTextBGOpacity', webViewerChangeTextBGOpacity)
    eventBus._off('switchControl', webViewerSwitchControl)
    eventBus._off('removeAnnotateToggled', webViewerRemoveAnnotateToggled)
    eventBus._off('setAnnotateSignature', webViewerSetAnnotateSignature)
    eventBus._off('setAnnotateStamp', webViewerSetAnnotateStamp)
    eventBus._off(
      'setAnnotateSignatureAndStamp',
      webViewerSetAnnotateSignatureAndStamp
    )
    eventBus._off('setAnnotateAttachment', webViewerSetAnnotateAttachment)
    eventBus._off('setAnnotateImage', webViewerSetAnnotateImage)
    eventBus._off('selectAnnotate', webViewerSelectAnnotate)
    eventBus._off('deselectAnnotate', webViewerDeselectAnnotate)
    eventBus._off(
      'setSelectionViewSelection',
      webViewerSetSelectionViewSelection
    )
    eventBus._off(
      'setSelectionViewCheckboxOption',
      webViewerSetSelectionViewCheckboxOption
    )
    eventBus._off(
      'setSelectionViewRadioOption',
      webViewerSetSelectionViewRadioOption
    )
    eventBus._off('deselectCanvas', webViewerDeselectCanvas)
    eventBus._off('toggleSidebar', webViewerToggleSidebar)
    eventBus._off('toggleDrawer', webViewerToggleDrawer)
    eventBus._off('toggleDrawTool', webViewerToggleDrawTool)
    eventBus._off('setSelectedCanvas', webViewerSelectedCanvas)
    eventBus._off('setShowDrawTool', webViewerSetShowDrawTool)
    eventBus._off('setIsAllowTouchScrolling', webViewerSetIsAllowTouchScrolling)
    eventBus._off('initActiveType', webViewerInitActiveType)
    eventBus._off(
      'setIsAllowTouchScrollingPC',
      webViewerSetIsAllowTouchScrollingPC
    )
    eventBus._off('updateAnnotateTool', webViewerUpdateAnnotateTool)
    eventBus._off('checkAnnotateChanged', webViewerCheckAnnotateChanged)
    eventBus._off('setDocumentLoaded', webViewerSetDocumentLoaded)
    eventBus._off('setPageScrolling', webViewerSetPageScrolling)
    eventBus._off('undo', webViewerUndo)
    eventBus._off('redo', webViewerRedo)
    eventBus._off('copy', webViewerCopy)
    eventBus._off('paste', webViewerPaste)
    eventBus._off('eraser', webViewerEraser)
    eventBus._off('draw', webViewerDraw)
    eventBus._off('pointer', webViewerPointer)
    eventBus._off('initDrawTool', webViewerInitDrawTool)
    eventBus._off('disableBrush', webViewerDisableBrush)
    eventBus._off('setHistoryUndo', webViewerSetHistoryUndo)
    eventBus._off('setHistoryRedo', webViewerSetHistoryRedo)
    eventBus._off('initHistoryRedo', webViewerInitHistoryRedo)
    eventBus._off('setHistoryNext', webViewerSetHistoryNext)
    eventBus._off('initHistory', webViewerInitHistory)
    eventBus._off('createDatePicker', webViewerCreateDatePicker)
    eventBus._off('notifyAnnotateChanged', webViewerNotifyAnnotateChanged)
    eventBus._off('initDoneAnnotate', webViewerInitDoneAnnotate)
    eventBus._off('editDoneAnnotate', webViewerEditDoneAnnotate)
    eventBus._off('render', webViewerRender)
    eventBus._off('getPdfAnnotations', getPdfAnnotations)
    eventBus._off('addPdfAnnotation', addPdfAnnotation)
    eventBus._off('changeCommentMode', changeCommentMode)
    eventBus._off('removePdfAnnotation', removePdfAnnotation)
    eventBus._off('focusPdfAnnotation', focusPdfAnnotation)
  },

  unbindWindowEvents() {
    const { _boundEvents } = this

    window.removeEventListener('visibilitychange', webViewerVisibilityChange)
    window.removeEventListener('wheel', webViewerWheel, { passive: false })
    // window.removeEventListener('touchstart', webViewerTouchStart, {
    //   passive: false,
    // })
    window.removeEventListener('keydown', webViewerKeyDown)
    window.removeEventListener('resize', _boundEvents.windowResize)
    window.removeEventListener('hashchange', _boundEvents.windowHashChange)
    window.removeEventListener(
      'updatefromsandbox',
      _boundEvents.windowUpdateFromSandbox
    )

    _boundEvents.windowResize = null
    _boundEvents.windowHashChange = null
    _boundEvents.windowUpdateFromSandbox = null
  },

  accumulateWheelTicks(ticks) {
    // If the scroll direction changed, reset the accumulated wheel ticks.
    if (
      (this._wheelUnusedTicks > 0 && ticks < 0) ||
      (this._wheelUnusedTicks < 0 && ticks > 0)
    ) {
      this._wheelUnusedTicks = 0
    }
    this._wheelUnusedTicks += ticks
    const wholeTicks =
      Math.sign(this._wheelUnusedTicks) *
      Math.floor(Math.abs(this._wheelUnusedTicks))
    this._wheelUnusedTicks -= wholeTicks
    return wholeTicks
  },

  /**
   * Should be called *after* all pages have loaded, or if an error occurred,
   * to unblock the "load" event; see https://bugzilla.mozilla.org/show_bug.cgi?id=1618553
   * @private
   */
  _unblockDocumentLoadEvent() {
    document.blockUnblockOnload?.(false)

    // Ensure that this method is only ever run once.
    this._unblockDocumentLoadEvent = () => {}
  },

  /**
   * @ignore
   */
  _reportDocumentStatsTelemetry() {
    const { stats } = this.pdfDocument
    if (stats !== this._docStats) {
      this._docStats = stats

      this.externalServices.reportTelemetry({
        type: 'documentStats',
        stats,
      })
    }
  },

  /**
   * Used together with the integration-tests, to enable awaiting full
   * initialization of the scripting/sandbox.
   */
  get scriptingReady() {
    return this.pdfScriptingManager.ready
  },
}

function webViewerInitialized() {
  const { appConfig, eventBus } = PDFViewerApplication
  const file = appConfig.fileList[0].src

  appConfig.mainContainer.addEventListener(
    'transitionend',
    function (evt) {
      if (evt.target === /* mainContainer */ this) {
        eventBus.dispatch('resize', { source: this })
      }
    },
    true
  )

  try {
    PDFViewerApplication.open(file)
  } catch (reason) {
    PDFViewerApplication.l10n.get('loading_error').then((msg) => {
      PDFViewerApplication._documentError(msg, reason)
    })
  }
}

function webViewerPageRendered({ pageNumber, error }) {
  // If the page is still visible when it has finished rendering,
  // ensure that the page number input loading indicator is hidden.
  if (pageNumber === PDFViewerApplication.page) {
    PDFViewerApplication.toolbar.updateLoadingIndicatorState(false)
  }
  // new render listener
  if (
    PDFViewerApplication.pdfViewer.mode === 4 ||
    PDFViewerApplication.pdfViewer.mode === 1
  ) {
    PDFViewerApplication.vuePdf.newRender(
      pageNumber,
      PDFViewerApplication.geometryMode,
      PDFViewerApplication.activeType
    )
  }

  // Use the rendered page to set the corresponding thumbnail image.
  if (PDFViewerApplication.pdfSidebar.visibleView === SidebarView.THUMBS) {
    const pageView = PDFViewerApplication.pdfViewer.getPageView(
      /* index = */ pageNumber - 1
    )
    const thumbnailView = PDFViewerApplication.pdfThumbnailViewer.getThumbnail(
      /* index = */ pageNumber - 1
    )
    if (pageView && thumbnailView) {
      thumbnailView.setImage(pageView)
    }
  }

  if (error) {
    PDFViewerApplication.l10n.get('rendering_error').then((msg) => {
      PDFViewerApplication._otherError(msg, error)
    })
  }

  // It is a good time to report stream and font types.
  PDFViewerApplication._reportDocumentStatsTelemetry()
}

function webViewerPageMode({ mode }) {
  // Handle the 'pagemode' hash parameter, see also `PDFLinkService_setHash`.
  let view
  switch (mode) {
    case 'thumbs':
      view = SidebarView.THUMBS
      break
    case 'selection':
      view = SidebarView.SELECTION
      break
    case 'none':
      view = SidebarView.NONE
      break
    default:
      console.error('Invalid "pagemode" hash parameter: ' + mode)
      return
  }
  PDFViewerApplication.pdfSidebar.switchView(view, /* forceOpen = */ true)
}

function webViewerNamedAction(evt) {
  // Processing a couple of named actions that might be useful, see also
  // `PDFLinkService.executeNamedAction`.
  switch (evt.action) {
    case 'GoToPage':
      PDFViewerApplication.appConfig.toolbar.pageNumber.select()
      break
  }
}

function webViewerSidebarViewChanged({ view }) {
  PDFViewerApplication.pdfRenderingQueue.isThumbnailViewEnabled =
    view === SidebarView.THUMBS

  if (PDFViewerApplication.isInitialViewSet) {
    // Only update the storage when the document has been loaded *and* rendered.
    PDFViewerApplication.store?.set('sidebarView', view).catch(() => {
      // Unable to write to storage.
    })
  }
}

function webViewerUpdateViewarea({ location }) {
  PDFViewerApplication.vuePdf.getLocation(location)
  if (PDFViewerApplication.isInitialViewSet) {
    // Only update the storage when the document has been loaded *and* rendered.
    PDFViewerApplication.store
      ?.setMultiple({
        page: location.pageNumber,
        zoom: location.scale,
        scrollLeft: location.left,
        scrollTop: location.top,
        rotation: location.rotation,
      })
      .catch(() => {
        // Unable to write to storage.
      })
  }

  // Show/hide the loading indicator in the page number input element.
  const currentPage = PDFViewerApplication.pdfViewer.getPageView(
    /* index = */ PDFViewerApplication.page - 1
  )
  const loading = currentPage?.renderingState !== RenderingStates.FINISHED
  PDFViewerApplication.toolbar.updateLoadingIndicatorState(loading)
  PDFViewerApplication.vuePdf.setPageScrolling(false)
}

function webViewerScrollModeChanged(evt) {
  const store = PDFViewerApplication.store
  if (store && PDFViewerApplication.isInitialViewSet) {
    // Only update the storage when the document has been loaded *and* rendered.
    store.set('scrollMode', evt.mode).catch(function () {})
  }
}

function webViewerResize() {
  PDFViewerApplication.vuePdf.isMobile()
  const { pdfDocument, pdfViewer } = PDFViewerApplication
  pdfViewer.updateContainerHeightCss()

  if (!pdfDocument) {
    return
  }
  const currentScaleValue = pdfViewer.currentScaleValue
  if (
    currentScaleValue === 'auto' ||
    currentScaleValue === 'page-fit' ||
    currentScaleValue === 'page-width'
  ) {
    // Note: the scale is constant for 'page-actual'.
    pdfViewer.currentScaleValue = currentScaleValue
  }
  pdfViewer.update()
}

function webViewerFirstPage() {
  if (PDFViewerApplication.pdfDocument) {
    PDFViewerApplication.page = 1
  }
}
function webViewerLastPage() {
  if (PDFViewerApplication.pdfDocument) {
    PDFViewerApplication.page = PDFViewerApplication.pagesCount
  }
}
function webViewerNextPage() {
  PDFViewerApplication.pdfViewer.nextPage()
}
function webViewerPreviousPage() {
  PDFViewerApplication.pdfViewer.previousPage()
}
function webViewerZoomIn() {
  PDFViewerApplication.zoomIn()
}
function webViewerZoomOut() {
  PDFViewerApplication.zoomOut()
}
function webViewerZoomReset() {
  PDFViewerApplication.zoomReset()
}
function webViewerPageNumberChanged(evt) {
  const pdfViewer = PDFViewerApplication.pdfViewer
  // Note that for `<input type="number">` HTML elements, an empty string will
  // be returned for non-number inputs; hence we simply do nothing in that case.
  if (evt.value !== '') {
    PDFViewerApplication.pdfLinkService.goToPage(evt.value)
  }

  // Ensure that the page number input displays the correct value, even if the
  // value entered by the user was invalid (e.g. a floating point number).
  if (
    evt.value !== pdfViewer.currentPageNumber.toString() &&
    evt.value !== pdfViewer.currentPageLabel
  ) {
    PDFViewerApplication.toolbar.setPageNumber(
      pdfViewer.currentPageNumber,
      pdfViewer.currentPageLabel
    )
  }
}
function webViewerScaleChanged(evt) {
  PDFViewerApplication.vuePdf.setScale(evt.value)
  PDFViewerApplication.pdfViewer.currentScaleValue = evt.value
}
function webViewerRotateCw() {
  PDFViewerApplication.rotatePages(90)
}
function webViewerRotateCcw() {
  PDFViewerApplication.rotatePages(-90)
}
function webViewerOptionalContentConfig(evt) {
  PDFViewerApplication.pdfViewer.optionalContentConfigPromise = evt.promise
}
function webViewerSwitchScrollMode(evt) {
  PDFViewerApplication.pdfViewer.scrollMode = evt.mode
}

function webViewerUpdateFindMatchesCount({ matchesCount }) {
  if (PDFViewerApplication.supportsIntegratedFind) {
    PDFViewerApplication.externalServices.updateFindMatchesCount(matchesCount)
  }
}

function webViewerUpdateFindControlState({
  state,
  previous,
  matchesCount,
  rawQuery,
}) {
  if (PDFViewerApplication.supportsIntegratedFind) {
    PDFViewerApplication.externalServices.updateFindControlState({
      result: state,
      findPrevious: previous,
      matchesCount,
      rawQuery,
    })
  }
}

function webViewerScaleChanging(evt) {
  PDFViewerApplication.toolbar.setPageScale(evt.presetValue, evt.scale)
  PDFViewerApplication.pdfViewer.update()
  PDFViewerApplication.vuePdf.setSelectScale(evt.scale)
  PDFViewerApplication.vuePdf.getScale(evt.scale)
}

function webViewerRotationChanging(evt) {
  PDFViewerApplication.pdfThumbnailViewer.pagesRotation = evt.pagesRotation

  PDFViewerApplication.forceRendering()
  // Ensure that the active page doesn't change during rotation.
  PDFViewerApplication.pdfViewer.currentPageNumber = evt.pageNumber
}

function webViewerPageChanging({ pageNumber, pageLabel }) {
  PDFViewerApplication.toolbar.setPageNumber(pageNumber, pageLabel)

  if (PDFViewerApplication.pdfSidebar.visibleView === SidebarView.THUMBS) {
    PDFViewerApplication.pdfThumbnailViewer.scrollThumbnailIntoView(pageNumber)
  }
}

function webViewerClearSelectAnnotate() {
  PDFViewerApplication.vuePdf.clearSelectedAnnotate()
}

function webViewerAddAnnotate(evt) {
  PDFViewerApplication.pdfViewer.setState(evt.state, evt.prefill)
  if (PDFViewerApplication.fabricParams.eraserTool === true) {
    PDFViewerApplication.fabricParams.eraserTool = false
    PDFViewerApplication.pdfViewer.eraseObjects(
      PDFViewerApplication.fabricParams.eraserTool
    )
    PDFViewerApplication.vuePdf.setEraserTool(
      PDFViewerApplication.fabricParams.eraserTool
    )
  }
  if (PDFViewerApplication.fabricParams.drawTool === true) {
    PDFViewerApplication.fabricParams.drawTool = false
    PDFViewerApplication.pdfViewer.drawObjects(
      PDFViewerApplication.fabricParams.drawTool
    )
    PDFViewerApplication.vuePdf.setDrawTool(
      PDFViewerApplication.fabricParams.drawTool
    )
  }
  if (PDFViewerApplication.fabricParams.pointerTool === true) {
    PDFViewerApplication.fabricParams.pointerTool = false
    PDFViewerApplication.pdfViewer.pointerObjects(
      PDFViewerApplication.fabricParams.pointerTool
    )
    PDFViewerApplication.vuePdf.setPointerTool(
      PDFViewerApplication.fabricParams.pointerTool
    )
  }
}

function webViewerChangeBrushColor(evt) {
  PDFViewerApplication.pdfViewer.changeBrushColor(evt)
}

function webViewerChangeBrushOpacity(evt) {
  PDFViewerApplication.pdfViewer.changeBrushOpacity(evt)
}

function webViewerChangeBrushType(evt) {
  PDFViewerApplication.pdfViewer.changeBrushType(evt)
}

function webViewerChangeGeometryShape(evt) {
  PDFViewerApplication.pdfViewer.changeGeometryShape(evt)
}

function webViewerChangeGeometryColor(evt) {
  PDFViewerApplication.pdfViewer.changeGeometryColor(evt)
}

function webViewerChangeTextColor(evt) {
  PDFViewerApplication.pdfViewer.changeTextColor(evt)
}

function webViewerChangeLineColor(evt) {
  PDFViewerApplication.pdfViewer.changeLineColor(evt)
}

function webViewerChangeBrushWidth(evt) {
  PDFViewerApplication.pdfViewer.changeBrushWidth(evt)
}

function webViewerChangeGeometryWidth(evt) {
  PDFViewerApplication.pdfViewer.changeGeometryWidth(evt)
}

function webViewerChangeTextSize(evt) {
  PDFViewerApplication.pdfViewer.changeTextSize(evt)
}

function webViewerChangeLineWidth(evt) {
  PDFViewerApplication.pdfViewer.changeLineWidth(evt)
}

function webViewerChangeTextBGC(evt) {
  PDFViewerApplication.pdfViewer.changeTextBGC(evt)
}

function webViewerChangeTextBGOpacity(evt) {
  PDFViewerApplication.pdfViewer.changeTextBGOpacity(evt)
}

function webViewerSwitchControl(evt) {
  PDFViewerApplication.control = evt
  PDFViewerApplication.pdfViewer.control = evt
}

function webViewerRemoveAnnotateToggled() {
  PDFViewerApplication.pdfViewer.setState(0)
}

function webViewerSetAnnotateSignature(evt) {
  PDFViewerApplication.vuePdf.doSignature(true, evt.annotateSignature)
}

function webViewerSetAnnotateStamp(evt) {
  PDFViewerApplication.vuePdf.doStamp(true, evt.annotateStamp)
}

function webViewerSetAnnotateSignatureAndStamp(evt) {
  PDFViewerApplication.vuePdf.doSignatureAndStamp(
    true,
    evt.annotateSignatureAndStamp
  )
}

function webViewerSetAnnotateAttachment(evt) {
  PDFViewerApplication.vuePdf.doAttachment(evt.annotateAttachment)
}

function webViewerSetAnnotateImage(evt) {
  PDFViewerApplication.vuePdf.doImage(true, evt.annotateImage)
}

function webViewerSelectAnnotate(evt) {
  PDFViewerApplication.pdfViewer.deselectCanvas(evt.source.pageNumber)
  const forceOpen = !(screen.width < 1024)
  if (PDFViewerApplication.mode !== 5) {
    PDFViewerApplication.pdfSidebar.switchView(SidebarView.SELECTION, forceOpen)
  }
  PDFViewerApplication.pdfSelectionViewer.render(
    evt.source,
    evt.selection,
    evt.checkboxGroup,
    evt.radioGroup,
    evt.position,
    evt.rect,
    PDFViewerApplication.mode
  )
  const id = evt.selection.every((x, i, arr) => x.id === arr[0].id)
    ? evt.selection[0].id
    : null
  PDFViewerApplication.vuePdf.annotateSelectId = id
}

function webViewerDeselectAnnotate() {
  const forceOpen = !(screen.width < 1024)
  PDFViewerApplication.pdfSidebar.switchView(SidebarView.THUMBS)
  PDFViewerApplication.selection = null
  PDFViewerApplication.toolbar.setSelection(null)
  PDFViewerApplication.vuePdf.setSelection(null)
  if (!forceOpen) {
    PDFViewerApplication.pdfSidebar.close()
  }
}

function webViewerSetSelectionViewSelection(evt) {
  PDFViewerApplication.selection = evt.selection
  PDFViewerApplication.toolbar.setSelection(evt.selection)
  if (PDFViewerApplication.mode !== 5) {
    PDFViewerApplication.vuePdf.setSelection(evt)
  }
}

function webViewerSetSelectionViewCheckboxOption(evt) {
  PDFViewerApplication.vuePdf.setCheckboxOption(evt)
}

function webViewerSetSelectionViewRadioOption(evt) {
  PDFViewerApplication.vuePdf.setRadioOption(evt)
}

function webViewerDeselectCanvas(evt) {
  if (PDFViewerApplication.mode === 4 || PDFViewerApplication.mode === 1) {
    PDFViewerApplication.pdfViewer.deselectCanvas(
      evt ? evt.source.pageNumber : null
    )
  } else {
    PDFViewerApplication.pdfViewer.deselectCanvas(evt.source.pageNumber)
  }
}

function webViewerToggleSidebar(evt) {
  PDFViewerApplication.vuePdf.toggleRightDrawer(evt.on)
}

function webViewerToggleDrawer(evt) {
  PDFViewerApplication.vuePdf.toggleLeftDrawer(evt.on)
}

function webViewerToggleDrawTool(evt) {
  PDFViewerApplication.vuePdf.toggleDrawTool(evt.on)
}

function webViewerSelectedCanvas(evt) {
  PDFViewerApplication.selectedCanvas.source = evt.source
  PDFViewerApplication.vuePdf.setSelectedCanvas(evt.source)
  // set toolbar undo & redo disabled
  if (PDFViewerApplication.selectedCanvas.source) {
    const currentPage = parseInt(
      PDFViewerApplication.selectedCanvas.source.id.split('_')[2]
    )
    PDFViewerApplication.toolbar.setHistoryRedo(
      PDFViewerApplication.historyRedo.findIndex(
        (stack) => stack.page === currentPage
      ) === -1
        ? []
        : [0]
    )
    PDFViewerApplication.toolbar.setHistoryUndo(
      PDFViewerApplication.historyUndo.findIndex(
        (stack) => stack.page === currentPage
      ) === -1
        ? []
        : [0]
    )
  }
}

function webViewerSetShowDrawTool(evt) {
  PDFViewerApplication.showDrawTool.on = evt
}

function webViewerInitActiveType() {
  PDFViewerApplication.activeType.pointer = 1
  PDFViewerApplication.activeType.brush = 0
  PDFViewerApplication.activeType.geometry = 0
  PDFViewerApplication.activeType.text = 0
}

function webViewerSetIsAllowTouchScrolling(evt) {
  if (evt.value) {
    PDFViewerApplication.activeType.pointer = 2
    PDFViewerApplication.pdfViewer.changeCursorAppearance(
      'grab',
      'grab',
      'grab'
    )
  } else {
    PDFViewerApplication.activeType.pointer = 1
    PDFViewerApplication.pdfViewer.changeCursorAppearance()
  }
  PDFViewerApplication.fabricParams.allowTouchScrolling = evt.value
  PDFViewerApplication.pdfViewer.setIsAllowTouchScrolling(evt.value)
}

function webViewerSetIsAllowTouchScrollingPC(evt) {
  if (evt.value) {
    PDFViewerApplication.pdfViewer.changeCursorAppearance(
      'grab',
      'grab',
      'grab'
    )
  } else {
    PDFViewerApplication.pdfViewer.changeCursorAppearance()
  }
  PDFViewerApplication.pdfCursorTools.switchTool(evt.value)
}

function webViewerUpdateAnnotateTool(evt) {
  PDFViewerApplication.vuePdf.updateAnnotateTool(
    evt.on,
    evt.selection,
    evt.position,
    evt.checkboxGroup,
    evt.radioGroup,
    evt.rect
  )
}

function webViewerCheckAnnotateChanged(evt) {
  PDFViewerApplication.vuePdf.checkAnnotate(evt.showOutline, false)
}

function webViewerSetDocumentLoaded(evt) {
  PDFViewerApplication.vuePdf.setDocumentLoaded(evt.documentLoaded)
}

function webViewerSetPageScrolling(evt) {
  PDFViewerApplication.vuePdf.setPageScrolling(evt.needScroll)
}

function webViewerUndo(evt) {
  if (PDFViewerApplication.historyUndo) {
    let history = null
    let popIndex = -1
    let undoCount = 0
    if (
      PDFViewerApplication.mode === 1 &&
      PDFViewerApplication.selectedCanvas.source
    ) {
      const currentPage = parseInt(
        PDFViewerApplication.selectedCanvas.source.id.split('_')[2]
      )
      PDFViewerApplication.historyUndo.forEach((stack, index) => {
        if (stack.page === currentPage) {
          ++undoCount
          popIndex = index
        }
      })
      if (popIndex > -1) {
        history = PDFViewerApplication.historyUndo.splice(popIndex, 1)[0]
      }
    } else {
      history = PDFViewerApplication.historyUndo.pop()
    }
    if (history) {
      const historyNext = PDFViewerApplication.historyNext.find(
        (x) => x.page === history.page
      ).data
      PDFViewerApplication.pdfViewer.keyEvent('undo', {
        history,
        historyNext,
      })
      // mode 1 when current drawing canvas is out of undo, disabled undo button
      if (PDFViewerApplication.mode === 1 && popIndex > -1 && undoCount === 1) {
        PDFViewerApplication.toolbar.setHistoryUndo([])
      }
    }
  }
}

function webViewerRedo(evt) {
  if (PDFViewerApplication.historyRedo) {
    let history = null
    let popIndex = -1
    let redoCount = 0
    if (
      PDFViewerApplication.mode === 1 &&
      PDFViewerApplication.selectedCanvas.source
    ) {
      const currentPage = parseInt(
        PDFViewerApplication.selectedCanvas.source.id.split('_')[2]
      )
      PDFViewerApplication.historyRedo.forEach((stack, index) => {
        if (stack.page === currentPage) {
          ++redoCount
          popIndex = index
        }
      })
      if (popIndex > -1) {
        history = PDFViewerApplication.historyRedo.splice(popIndex, 1)[0]
      }
    } else {
      history = PDFViewerApplication.historyRedo.pop()
    }
    if (history) {
      const historyNext = PDFViewerApplication.historyNext.find(
        (x) => x.page === history.page
      ).data
      PDFViewerApplication.pdfViewer.keyEvent('redo', {
        history,
        historyNext,
      })
      // mode 1 when current drawing canvas is out of redo, disabled redo button
      if (PDFViewerApplication.mode === 1 && popIndex > -1 && redoCount === 1) {
        PDFViewerApplication.toolbar.setHistoryRedo([])
      }
    }
  }
}

function webViewerCopy(evt) {
  if (PDFViewerApplication.selection) {
    PDFViewerApplication.clipboard = JSON.parse(
      JSON.stringify(PDFViewerApplication.selection)
    )
    PDFViewerApplication.toolbar.setClipboard(PDFViewerApplication.clipboard)
  }
}

function webViewerPaste(evt) {
  if (PDFViewerApplication.clipboard) {
    PDFViewerApplication.pdfViewer.keyEvent('paste', {
      clipboard: PDFViewerApplication.clipboard,
    })
  }
}

function webViewerEraser(evt) {
  // set brush clear first
  if (PDFViewerApplication.fabricParams.drawTool === true) {
    PDFViewerApplication.fabricParams.drawTool = false
    PDFViewerApplication.pdfViewer.drawObjects(
      PDFViewerApplication.fabricParams.drawTool
    )
  }
  if (PDFViewerApplication.fabricParams.pointerTool === true) {
    PDFViewerApplication.fabricParams.pointerTool = false
    PDFViewerApplication.pdfViewer.pointerObjects(
      PDFViewerApplication.fabricParams.pointerTool
    )
  }
  if (PDFViewerApplication.mode === 4 || PDFViewerApplication.mode === 1) {
    PDFViewerApplication.fabricParams.eraserTool = true
    PDFViewerApplication.pdfViewer.eraseObjects(
      PDFViewerApplication.fabricParams.eraserTool
    )
  } else if (
    PDFViewerApplication.mode === 0 ||
    PDFViewerApplication.mode === 5
  ) {
    PDFViewerApplication.fabricParams.eraserTool =
      !PDFViewerApplication.fabricParams.eraserTool
    PDFViewerApplication.pdfViewer.eraseObjects(
      PDFViewerApplication.fabricParams.eraserTool
    )
  }
}

function webViewerDraw(evt) {
  webViewerRemoveAnnotateToggled()
  // set brush clear first
  if (PDFViewerApplication.fabricParams.eraserTool === true) {
    PDFViewerApplication.fabricParams.eraserTool = false
    PDFViewerApplication.pdfViewer.eraseObjects(
      PDFViewerApplication.fabricParams.eraserTool
    )
  }
  if (PDFViewerApplication.fabricParams.pointerTool === true) {
    PDFViewerApplication.fabricParams.pointerTool = false
    PDFViewerApplication.pdfViewer.pointerObjects(
      PDFViewerApplication.fabricParams.pointerTool
    )
  }
  if (!PDFViewerApplication.fabricParams.drawTool) {
    PDFViewerApplication.fabricParams.drawTool = true
    PDFViewerApplication.pdfViewer.drawObjects(
      PDFViewerApplication.fabricParams.drawTool
    )
  }
}

function webViewerPointer(evt) {
  webViewerDisableBrush()
  PDFViewerApplication.pdfViewer.pointerObjects(
    PDFViewerApplication.fabricParams.pointerTool
  )
}

function webViewerInitDrawTool(evt) {
  webViewerDisableBrush()
  PDFViewerApplication.vuePdf.setPointerTool(true)
}

function webViewerDisableBrush(evt) {
  // set brush clear first
  if (PDFViewerApplication.fabricParams.eraserTool) {
    PDFViewerApplication.fabricParams.eraserTool = false
    PDFViewerApplication.pdfViewer.eraseObjects(
      PDFViewerApplication.fabricParams.eraserTool
    )
    PDFViewerApplication.vuePdf.setEraserTool(
      PDFViewerApplication.fabricParams.eraserTool
    )
  }
  if (PDFViewerApplication.fabricParams.drawTool) {
    PDFViewerApplication.fabricParams.drawTool = false
    PDFViewerApplication.pdfViewer.drawObjects(
      PDFViewerApplication.fabricParams.drawTool
    )
    PDFViewerApplication.vuePdf.setDrawTool(
      PDFViewerApplication.fabricParams.drawTool
    )
  }
}

function webViewerSetHistoryUndo(evt) {
  if (evt.history && PDFViewerApplication.historyUndo) {
    PDFViewerApplication.historyUndo.push(evt.history)
    PDFViewerApplication.toolbar.setHistoryUndo(
      PDFViewerApplication.historyUndo
    )
  }
}

function webViewerSetHistoryRedo(evt) {
  if (evt.history && PDFViewerApplication.historyRedo) {
    PDFViewerApplication.historyRedo.push(evt.history)
    PDFViewerApplication.toolbar.setHistoryRedo(
      PDFViewerApplication.historyRedo
    )
  }
}

function webViewerInitHistoryRedo() {
  if (PDFViewerApplication.historyRedo) {
    PDFViewerApplication.historyRedo = []
    PDFViewerApplication.toolbar.setHistoryRedo(
      PDFViewerApplication.historyRedo
    )
  }
}

function webViewerSetHistoryNext(evt) {
  if (evt.historyNext && PDFViewerApplication.historyNext) {
    if (PDFViewerApplication.historyNext.find((x) => x.page === evt.page)) {
      PDFViewerApplication.historyNext.find((x) => x.page === evt.page).data =
        evt.historyNext
    } else {
      PDFViewerApplication.historyNext.push({
        page: evt.page,
        data: evt.historyNext,
      })
    }
  }
}

function webViewerInitHistory(evt) {
  const page = evt.page
  const historyUndo = PDFViewerApplication.historyUndo
    .filter((x) => x.page === page)
    .map((y) => y.data)
  const historyRedo = PDFViewerApplication.historyRedo
    .filter((x) => x.page === page)
    .map((y) => y.data)
  const historyNext =
    PDFViewerApplication.historyNext.find((x) => x.page === page)?.data ?? null
  PDFViewerApplication.pdfViewer.initHistoryParams({
    page,
    historyUndo,
    historyRedo,
    historyNext,
  })
}

function webViewerNotifyAnnotateChanged(evt) {
  if (PDFViewerApplication.mode === 4) {
    PDFViewerApplication.vuePdf.notifyAnnotateChanged({
      ...evt,
      historyUndo: PDFViewerApplication.historyUndo,
      historyRedo: PDFViewerApplication.historyRedo,
      historyNext: PDFViewerApplication.historyNext,
    })
  }
}

function webViewerInitDoneAnnotate(evt) {
  if (PDFViewerApplication.mode === 5) {
    PDFViewerApplication.vuePdf.initDoneAnnotate(evt.state)
  }
}

function webViewerEditDoneAnnotate(evt) {
  if (PDFViewerApplication.mode === 5) {
    PDFViewerApplication.vuePdf.editDoneAnnotate(evt)
  }
}

function webViewerRender() {
  if (PDFViewerApplication.mode === 0) {
    PDFViewerApplication.pdfViewer.render()
  }
}

function getPdfAnnotations(evt) {
  if (
    PDFViewerApplication.mode === 0 ||
    PDFViewerApplication.mode === 1 ||
    PDFViewerApplication.mode === 3
  ) {
    PDFViewerApplication.vuePdf.setPdfAnnotations(evt.annotations)
  }
}

function addPdfAnnotation(evt) {
  if (PDFViewerApplication.mode === 0 || PDFViewerApplication.mode === 1) {
    if (PDFViewerApplication.mode === 0) {
      const hex = PDFViewerApplication.colorList[0]
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      evt.newComment.color = `rgba(${r},${g},${b}, 0.6)`
    }
    PDFViewerApplication.appConfig.commentList[
      evt.selectedFile - 1
    ].comment.push(evt.newComment)
    PDFViewerApplication.pdfViewer.addPdfAnnotation(evt.newComment)
  }
}

function changeCommentMode(evt) {
  if (PDFViewerApplication.mode === 0 || PDFViewerApplication.mode === 1) {
    PDFViewerApplication.commentMode.on = evt.on
    PDFViewerApplication.pdfViewer.hideCanvasDraw(evt)
  }
}

function removePdfAnnotation(id) {
  if (PDFViewerApplication.mode === 0 || PDFViewerApplication.mode === 1) {
    PDFViewerApplication.pdfViewer.removePdfAnnotation(id)
  }
}

function focusPdfAnnotation(id) {
  if (
    PDFViewerApplication.mode === 0 ||
    PDFViewerApplication.mode === 1 ||
    PDFViewerApplication.mode === 3
  ) {
    PDFViewerApplication.pdfViewer.focusPdfAnnotation(id)
  }
}

function webViewerCreateDatePicker(evt) {
  PDFViewerApplication.vuePdf.createDatePicker(
    evt.parent,
    evt.props,
    evt.changeEvent
  )
}

function webViewerVisibilityChange(evt) {
  if (document.visibilityState === 'visible') {
    // Ignore mouse wheel zooming during tab switches (bug 1503412).
    setZoomDisabledTimeout()
  }
}

let zoomDisabledTimeout = null
function setZoomDisabledTimeout() {
  if (zoomDisabledTimeout) {
    clearTimeout(zoomDisabledTimeout)
  }
  zoomDisabledTimeout = setTimeout(function () {
    zoomDisabledTimeout = null
  }, WHEEL_ZOOM_DISABLED_TIMEOUT)
}

function webViewerWheel(evt) {
  // const { pdfViewer, supportedMouseWheelZoomModifierKeys } =
  //   PDFViewerApplication
  // if (pdfViewer.isInPresentationMode) {
  // }
  // if (
  //   (evt.ctrlKey && supportedMouseWheelZoomModifierKeys.ctrlKey) ||
  //   (evt.metaKey && supportedMouseWheelZoomModifierKeys.metaKey)
  // ) {
  //   // Only zoom the pages, not the entire viewer.
  //   evt.preventDefault()
  //   // NOTE: this check must be placed *after* preventDefault.
  //   if (zoomDisabledTimeout || document.visibilityState === 'hidden') {
  //     return
  //   }
  //   const previousScale = pdfViewer.currentScale
  //   const delta = normalizeWheelEventDirection(evt)
  //   let ticks = 0
  //   if (
  //     evt.deltaMode === WheelEvent.DOM_DELTA_LINE ||
  //     evt.deltaMode === WheelEvent.DOM_DELTA_PAGE
  //   ) {
  //     // For line-based devices, use one tick per event, because different
  //     // OSs have different defaults for the number lines. But we generally
  //     // want one "clicky" roll of the wheel (which produces one event) to
  //     // adjust the zoom by one step.
  //     if (Math.abs(delta) >= 1) {
  //       ticks = Math.sign(delta)
  //     } else {
  //       // If we're getting fractional lines (I can't think of a scenario
  //       // this might actually happen), be safe and use the accumulator.
  //       ticks = PDFViewerApplication.accumulateWheelTicks(delta)
  //     }
  //   } else {
  //     // pixel-based devices
  //     const PIXELS_PER_LINE_SCALE = 30
  //     ticks = PDFViewerApplication.accumulateWheelTicks(
  //       delta / PIXELS_PER_LINE_SCALE
  //     )
  //   }
  //   if (ticks < 0) {
  //     PDFViewerApplication.zoomOut(-ticks)
  //   } else if (ticks > 0) {
  //     PDFViewerApplication.zoomIn(ticks)
  //   }
  //   const currentScale = pdfViewer.currentScale
  //   if (previousScale !== currentScale) {
  //     // After scaling the page via zoomIn/zoomOut, the position of the upper-
  //     // left corner is restored. When the mouse wheel is used, the position
  //     // under the cursor should be restored instead.
  //     const scaleCorrectionFactor = currentScale / previousScale - 1
  //     const rect = pdfViewer.container.getBoundingClientRect()
  //     const dx = evt.clientX - rect.left
  //     const dy = evt.clientY - rect.top
  //     pdfViewer.container.scrollLeft += dx * scaleCorrectionFactor
  //     pdfViewer.container.scrollTop += dy * scaleCorrectionFactor
  //   }
  // } else {
  //   setZoomDisabledTimeout()
  // }
}

// function webViewerTouchStart(evt) {
//   // if (evt.touches.length > 1) {
//   //   // Disable touch-based zooming, because the entire UI bits gets zoomed and
//   //   // that doesn't look great. If we do want to have a good touch-based
//   //   // zooming experience, we need to implement smooth zoom capability (probably
//   //   // using a CSS transform for faster visual response, followed by async
//   //   // re-rendering at the final zoom level) and do gesture detection on the
//   //   // touchmove events to drive it. Or if we want to settle for a less good
//   //   // experience we can make the touchmove events drive the existing step-zoom
//   //   // behaviour that the ctrl+mousewheel path takes.
//   //   evt.preventDefault()
//   // }
// }

function webViewerKeyDown(evt) {
  const { pdfViewer } = PDFViewerApplication
  let handled = false
  const cmd =
    (evt.ctrlKey ? 1 : 0) |
    (evt.altKey ? 2 : 0) |
    (evt.shiftKey ? 4 : 0) |
    (evt.metaKey ? 8 : 0)

  if (evt.target.matches('input') || evt.target.matches('textarea')) {
    return
  }
  if (cmd === 1 || cmd === 8) {
    switch (evt.keyCode) {
      case 61: // FF/Mac '='
      case 107: // FF '+' and '='
      case 187: // Chrome '+'
      case 171: // FF with German keyboard
        PDFViewerApplication.zoomIn()
        handled = true
        break
      case 173: // FF/Mac '-'
      case 109: // FF '-'
      case 189: // Chrome '-'
        PDFViewerApplication.zoomOut()
        handled = true
        break
      // case 48: // '0'
      // case 96: // '0' on Numpad of Swedish keyboard
      //   if (!isViewerInPresentationMode) {
      //     // keeping it unhandled (to restore page zoom to 100%)
      //     setTimeout(function () {
      //       // ... and resetting the scale after browser adjusts its scale
      //       PDFViewerApplication.zoomReset()
      //     })
      //     handled = false
      //   }
      //   break
      case 67:
        if (PDFViewerApplication.selection) {
          PDFViewerApplication.clipboard = JSON.parse(
            JSON.stringify(PDFViewerApplication.selection)
          )
          PDFViewerApplication.toolbar.setClipboard(
            PDFViewerApplication.clipboard
          )
          handled = true
        }
        break
      case 86:
        if (PDFViewerApplication.clipboard) {
          PDFViewerApplication.pdfViewer.keyEvent('paste', {
            clipboard: PDFViewerApplication.clipboard,
          })
          handled = true
        }
        break
      case 90:
        if (PDFViewerApplication.historyUndo) {
          const history = PDFViewerApplication.historyUndo.pop()
          if (history) {
            const historyNext = PDFViewerApplication.historyNext.find(
              (x) => x.page === history.page
            ).data
            PDFViewerApplication.pdfViewer.keyEvent('undo', {
              history,
              historyNext,
            })
            handled = true
          }
        }
        break
    }
  }

  if (cmd === 5) {
    switch (evt.keyCode) {
      case 90:
        if (PDFViewerApplication.historyRedo) {
          const history = PDFViewerApplication.historyRedo.pop()
          if (history) {
            const historyNext = PDFViewerApplication.historyNext.find(
              (x) => x.page === history.page
            ).data
            PDFViewerApplication.pdfViewer.keyEvent('redo', {
              history,
              historyNext,
            })
            handled = true
          }
        }
        break
    }
  }

  if (cmd === 0) {
    let turnPage = 0
    let turnOnlyIfPageFit = false
    switch (evt.keyCode) {
      case 37: // left arrow
        // horizontal scrolling using arrow keys
        if (pdfViewer.isHorizontalScrollbarEnabled) {
          turnOnlyIfPageFit = true
        }
        turnPage = -1
        break
      case 40: // down arrow
      case 34: // pg down
        // vertical scrolling using arrow/pg keys
        if (pdfViewer.isVerticalScrollbarEnabled) {
          turnOnlyIfPageFit = true
        }
        turnPage = 1
        break
      case 13: // enter key
      case 32: // spacebar
        turnPage = 1
        break
      case 39: // right arrow
        // horizontal scrolling using arrow keys
        if (pdfViewer.isHorizontalScrollbarEnabled) {
          turnOnlyIfPageFit = true
        }
        turnPage = 1
        break
      case 36: // home
        if (PDFViewerApplication.page > 1) {
          PDFViewerApplication.page = 1
        }
        break
      case 35: // end
        if (PDFViewerApplication.page < PDFViewerApplication.pagesCount) {
          PDFViewerApplication.page = PDFViewerApplication.pagesCount
        }
        break
      case 115: // F4
        PDFViewerApplication.pdfSidebar.toggle()
        break
      case 46: // delete
        PDFViewerApplication.pdfViewer.keyEvent('delete')
        break
      case 69:
        PDFViewerApplication.fabricParams.eraserTool =
          !PDFViewerApplication.fabricParams.eraserTool
        PDFViewerApplication.pdfViewer.eraseObjects(
          PDFViewerApplication.fabricParams.eraserTool
        )
        PDFViewerApplication.vuePdf.setEraserTool(
          PDFViewerApplication.fabricParams.eraserTool
        )
        break
    }

    if (
      turnPage !== 0 &&
      (!turnOnlyIfPageFit || pdfViewer.currentScaleValue === 'page-fit')
    ) {
      if (turnPage > 0) {
        pdfViewer.nextPage()
      } else {
        pdfViewer.previousPage()
      }
      handled = true
    }
  }

  // if (!handled && !isViewerInPresentationMode) {
  //   // 33=Page Up  34=Page Down  35=End    36=Home
  //   // 37=Left     38=Up         39=Right  40=Down
  //   // 32=Spacebar
  //   if (
  //     (evt.keyCode >= 33 && evt.keyCode <= 40) ||
  //     (evt.keyCode === 32 && curElementTagName !== 'BUTTON')
  //   ) {
  //     ensureViewerFocused = true
  //   }
  // }

  // if (ensureViewerFocused && !pdfViewer.containsElement(curElement)) {
  //   // The page container is not focused, but a page navigation key has been
  //   // pressed. Change the focus to the viewer container to make sure that
  //   // navigation by keyboard works as expected.
  //   pdfViewer.focus()
  // }

  if (handled) {
    evt.preventDefault()
  }
}

function beforeUnload(evt) {
  evt.preventDefault()
  evt.returnValue = ''
  return false
}

/* Abstract factory for the print service. */
const PDFPrintServiceFactory = {
  instance: {
    supportsPrinting: false,
    createPrintService() {
      throw new Error('Not implemented: createPrintService')
    },
  },
}

export { DefaultExternalServices, PDFPrintServiceFactory, PDFViewerApplication }
