/* Copyright 2016 Mozilla Foundation
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

class PDFDrawer {
  /**
   * @param {PDFDrawerOptions} options
   */
  constructor({ elements, pdfViewer, eventBus }) {
    this.isOpen = true
    /**
     * Callback used when the sidebar has been opened/closed, to ensure that
     * the viewers (PDFViewer/PDFThumbnailViewer) are updated correctly.
     */
    this.onToggled = null

    this.pdfViewer = pdfViewer

    this.leftDrawerContainer = elements.leftDrawerContainer
    this.viewerContainer = elements.viewerContainer

    this.buttons = [
      { element: elements.signButton, state: 1 },
      { element: elements.textButton, state: 2 },
      { element: elements.checkboxButton, state: 3 },
      { element: elements.stampButton, state: 4 },
      { element: elements.signDateButton, state: 5 },
      { element: elements.radioButton, state: 6 },
      { element: elements.dropdownButton, state: 7 },
      { element: elements.attachmentButton, state: 8 },
      { element: elements.imageButton, state: 9 },
      { element: elements.signatureBPButton, state: 10 },
      { element: elements.signatureBOButton, state: 11 },
      { element: elements.stampBPButton, state: 12 },
      { element: elements.stampBOButton, state: 13 },
      { element: elements.signatureAndStampButton, state: 14 },
      { element: elements.drawCanvasButton, state: 15 },
      { element: elements.prefillTextButton, state: 2, prefill: true },
      { element: elements.prefillCheckboxButton, state: 3, prefill: true },
      { element: elements.prefillRadioButton, state: 6, prefill: true },
      { element: elements.prefillAttachment, state: 8, prefill: true },
    ]
    this.buttonToggled = null

    this.eventBus = eventBus
    this.state = 0
    this._addEventListeners()
  }

  reset() {}

  open() {
    this.isOpen = this.leftDrawerContainer.classList.contains(
      'v-navigation-drawer--open'
    )
    if (this.isOpen) {
      return
    }
    if (
      screen.width <= 1024 &&
      this.leftDrawerContainer.classList.contains('v-navigation-drawer--open')
    ) {
      this.eventBus.dispatch('closeSidebar', { source: self })
    }
    this.isOpen = true
    this.eventBus.dispatch('toggleDrawer', {
      source: this,
      on: true,
    })

    this._forceRendering()
    this._dispatchEvent()
  }

  close() {
    this.isOpen = this.leftDrawerContainer.classList.contains(
      'v-navigation-drawer--open'
    )
    if (!this.isOpen) {
      return
    }
    this.isOpen = false
    this.eventBus.dispatch('toggleDrawer', {
      source: this,
      on: false,
    })

    this._forceRendering()
    this._dispatchEvent()
  }

  toggle() {
    this.isOpen = this.leftDrawerContainer.classList.contains(
      'v-navigation-drawer--open'
    )
    if (this.isOpen) {
      this.close()
    } else {
      this.open()
    }
  }

  /**
   * @private
   */
  _dispatchEvent() {
    this.eventBus.dispatch('sidebarviewchanged', {
      source: this,
      view: this.visibleView,
    })
  }

  /**
   * @private
   */
  _forceRendering() {
    if (this.onToggled) {
      this.onToggled()
    } else {
      // Fallback
      this.pdfViewer.forceRendering()
    }
  }

  /**
   * @private
   */
  _addEventListeners() {
    for (const { element, state, prefill } of this.buttons) {
      element.addEventListener('click', () => {
        if (screen.width <= 1024) {
          this.close()
        }
        if (this.buttonToggled === state) {
          if (this.buttonToggled === null) {
            return
          }
          this.buttonToggled = null
          this.eventBus.dispatch('clearSelectAnnotate', {
            source: this,
          })
        } else {
          this.buttonToggled = state
          this.eventBus.dispatch('addAnnotate', {
            source: this,
            state,
            prefill,
          })
          const self = this
          const mouseup = function (e) {
            const obj = e.target
            if (obj === element) {
              const cursor = document.getElementById('cursor')
              if (cursor && cursor.style.opacity === '0') {
                self.eventBus.dispatch('removeAnnotateToggled', {
                  source: self,
                })
              }
              document.removeEventListener('mouseup', mouseup)
            } else {
              self.buttonToggled = null
              self.eventBus.dispatch('clearSelectAnnotate', {
                source: self,
              })
              const cursor = document.getElementById('cursor')
              if (cursor && cursor.style.opacity === '0') {
                self.eventBus.dispatch('removeAnnotateToggled', {
                  source: self,
                })
              }
              document.removeEventListener('mouseup', mouseup)
            }
          }
          document.addEventListener('mouseup', mouseup)
        }
      })
    }
  }
}

export { PDFDrawer }
