<template>
  <v-app id="appContainer">
    <v-app-bar id="appToolbar" :clipped-left="true" :clipped-right="true" absolute app dense elevation="0"
      color="#f8f9fa" :extended="(mode === 0 || mode === 5) && $vuetify.breakpoint.mdAndDown" extension-height="72"
      outlined style="border: 0; border-bottom: 1px solid #e0e0e0; z-index: 50" :style="{
        'box-shadow': mode === 4 ? '0px 3px 6px #00000029 !important' : 'none',
        'z-index': mode === 4 ? '200' : '50',
      }">
      <v-slide-group class="d-flex align-center" style="width: 100%">
        <!-- show-arrows -->
        <v-select v-if="mode === 0" v-model="selectId" :items="peopleNames" item-text="name" item-value="id" height="32"
          background-color="white" solo flat single-line hide-details class="peopleSelect tour-create-task-7"
          :menu-props="{
            auto: true,
            bottom: true,
            offsetY: true,
            zIndex: 200,
            maxHeight: '100%',
          }">
          <template v-slot:[`selection`]="{ item }">
            <v-icon :color="getPersonColor(item)" class="mr-2">mdi-circle-medium</v-icon>
            <div class="text-body-2 text-truncate" style="max-width: 240px; overflow: hidden">
              {{ item.name }}
            </div>
          </template>
          <template v-slot:[`item`]="{ item }">
            <v-icon :color="getPersonColor(item)" class="mr-2">mdi-circle-medium</v-icon>
            <div class="text-body-2 text-truncate" style="max-width: 240px; overflow: hidden">
              {{ item.name }}
            </div>
          </template>
        </v-select>
        <!-- mode 4 outline -->
        <v-btn-toggle v-if="mode === 4" v-model="rightDrawerToggle" dense group multiple>
          <tippy>
            <template v-slot:trigger>
              <v-btn :value="1" text class="toolbarButton collaborate-outline-icon" @click="toggleRightDrawer()">
                <v-icon size="22"></v-icon>
              </v-btn>
            </template>
            <span>
              <span style="font-size: 12px; color: white">{{
                $t('tooltip.pdfOutline')
              }}</span>
            </span>
          </tippy>
        </v-btn-toggle>
        <v-spacer></v-spacer>
        <tippy>
          <template v-slot:trigger>
            <v-btn id="previous" text class="toolbarButton d-none d-lg-flex" :class="{
              'd-flex': mode === 4,
              'mode4-prev-page': mode === 4,
            }" :style="mode === 4 ? mode4AppBar : ''">
              <v-icon v-if="mode !== 4" size="22">mdi-arrow-up-circle-outline</v-icon>
            </v-btn>
          </template>
          <span>
            <span style="font-size: 12px; color: white">{{ $t('tooltip.prevPage') }}
            </span>
            <span style="font-size: 12px; color: #9f9f9f">(Left Arrow)</span>
          </span>
        </tippy>
        <tippy>
          <template v-slot:trigger>
            <v-btn id="next" text class="toolbarButton d-none d-lg-flex" :class="{
              'd-flex': mode === 4,
              'mode4-next-page': mode === 4,
            }" :style="mode === 4 ? mode4AppBar : ''">
              <v-icon v-if="mode !== 4" size="22">mdi-arrow-down-circle-outline</v-icon>
            </v-btn>
          </template>
          <span>
            <span style="font-size: 12px; color: white">{{
              $t('tooltip.nextPage')
            }}</span>
            <span style="font-size: 12px; color: #9f9f9f">(Right Arrow)</span>
          </span>
        </tippy>
        <input id="pageNumber" type="number" class="toolbarField pageNumber d-none d-lg-flex ml-1" :class="{
          'd-flex': mode === 4,
        }" value="1" size="4" min="1" autocomplete="off" :style="{
            width: mode === 4 ? 'auto' : '40px',
          }" />
        <span id="numPages" class="toolbarLabel d-none d-lg-flex" :class="{
          'd-flex': mode === 4,
        }"></span>
        <v-divider v-if="(mode === 0 && $vuetify.breakpoint.lgAndUp) || mode === 4" inset vertical
          class="mx-1"></v-divider>
        <tippy v-if="
          (mode === 0 && $vuetify.breakpoint.lgAndUp) ||
          mode === 4 ||
          mode === 1
        ">
          <template v-slot:trigger>
            <v-btn id="undo" text disabled class="toolbarButton rounded-lg mr-1" :class="{
              'd-none':
                (mode !== 0 && mode !== 4) || $vuetify.breakpoint.mdAndDown,
              'd-flex':
                (mode === 0 && $vuetify.breakpoint.lgAndUp) ||
                mode === 4 ||
                (mode === 1 && showDrawTool),
              'mode4-undo': mode === 4,
            }" :style="mode === 4 ? mode4AppBar : ''">
              <v-icon v-if="mode !== 4" size="22">mdi-undo</v-icon>
            </v-btn>
          </template>
          <span>
            <span style="font-size: 12px; color: white">{{
              $t('tooltip.undo')
            }}</span>
            <span style="font-size: 12px; color: #9f9f9f">(Ctrl Z)</span>
          </span>
        </tippy>
        <tippy v-if="
          (mode === 0 && $vuetify.breakpoint.lgAndUp) ||
          mode === 4 ||
          mode === 1
        ">
          <template v-slot:trigger>
            <v-btn id="redo" text disabled class="toolbarButton rounded-lg mr-1" :class="{
              'd-none':
                (mode !== 0 && mode !== 4) || $vuetify.breakpoint.mdAndDown,
              'd-flex':
                (mode === 0 && $vuetify.breakpoint.lgAndUp) ||
                mode === 4 ||
                (mode === 1 && showDrawTool),
              'mode4-redo': mode === 4,
            }" :style="mode === 4 ? mode4AppBar : ''">
              <v-icon v-if="mode !== 4" size="22">mdi-redo</v-icon>
            </v-btn>
          </template>
          <span>
            <span style="font-size: 12px; color: white">{{
              $t('tooltip.redo')
            }}</span>
            <span style="font-size: 12px; color: #9f9f9f">(Ctrl Shift Z)</span>
          </span>
        </tippy>
        <v-divider v-if="mode === 4" inset vertical class="mx-1"></v-divider>
        <v-btn-toggle v-model="eraserToggle" dense group>
          <tippy>
            <template v-slot:trigger>
              <v-btn id="eraser" text :value="1" class="toolbarButton rounded-lg mr-1 d-none" :class="{
                'd-flex': mode === 0 && $vuetify.breakpoint.lgAndUp,
              }">
                <v-icon size="22">mdi-eraser</v-icon>
              </v-btn>
            </template>
            <span>
              <span style="font-size: 12px; color: white">{{
                $t('tooltip.deleteTool')
              }}</span>
              <span style="font-size: 12px; color: #9f9f9f">(E)</span>
            </span>
          </tippy>
        </v-btn-toggle>
        <v-divider v-if="(mode === 0 || mode === 5) && $vuetify.breakpoint.lgAndUp" inset vertical
          class="mx-1"></v-divider>
        <tippy>
          <template v-slot:trigger>
            <v-btn id="copy" text disabled class="toolbarButton rounded-lg mr-1 d-none" :class="{
              'd-flex': mode === 0 || mode === 5,
            }">
              <v-icon size="22">mdi-content-copy</v-icon>
            </v-btn>
          </template>
          <span>
            <span style="font-size: 12px; color: white">{{
              $t('tooltip.copy')
            }}</span>
            <span style="font-size: 12px; color: #9f9f9f">(Ctrl C)</span>
          </span>
        </tippy>
        <tippy>
          <template v-slot:trigger>
            <v-btn id="paste" text disabled class="toolbarButton rounded-lg mr-1 d-none" :class="{
              'd-flex': mode === 0 || mode === 5,
            }">
              <v-icon size="22">mdi-content-paste</v-icon>
            </v-btn>
          </template>
          <span>
            <span style="font-size: 12px; color: white">{{
              $t('tooltip.paste')
            }}</span>
            <span style="font-size: 12px; color: #9f9f9f">(Ctrl V)</span>
          </span>
        </tippy>
        <v-divider v-if="(mode === 0 || mode === 5) && $vuetify.breakpoint.lgAndUp" inset vertical
          class="mx-1"></v-divider>
        <tippy>
          <template v-slot:trigger>
            <v-btn id="zoomOut" text class="toolbarButton d-none d-md-block" :class="{
              'mode4-zoomOut': mode === 4,
            }" :style="mode === 4 ? mode4AppBar : ''">
              <v-icon v-if="mode !== 4" size="22">mdi-minus-circle-outline</v-icon>
            </v-btn>
          </template>
          <span>
            <span style="font-size: 12px; color: white">{{
              $t('tooltip.zoomOut')
            }}</span>
            <span style="font-size: 12px; color: #9f9f9f">(Ctrl -)</span>
          </span>
        </tippy>
        <tippy>
          <template v-slot:trigger>
            <v-btn id="zoomIn" text class="toolbarButton d-none d-md-block" :class="{
              'mode4-zoomIn': mode === 4,
            }" :style="mode === 4 ? mode4AppBar : ''">
              <v-icon v-if="mode !== 4" size="22">mdi-plus-circle-outline</v-icon>
            </v-btn>
          </template>
          <span>
            <span style="font-size: 12px; color: white">{{
              $t('tooltip.zoomIn')
            }}</span>
            <span style="font-size: 12px; color: #9f9f9f">(Ctrl +)</span>
          </span>
        </tippy>
        <span id="scaleSelectContainer" class="dropdownToolbarButton ml-1" :class="{
          'd-none': mode === 0 && $vuetify.breakpoint.xsOnly,
          'd-flex': mode !== 0 || $vuetify.breakpoint.smAndUp,
        }">
          <select id="scaleSelect" :style="mode4ScaleSelect">
            <template>
              <!-- pc maximum scale to 400% -->
              <!-- mobile maximum scale to 200% -->
              <option v-for="(item, index) in scaleOptions.slice(
                0,
                $vuetify.breakpoint.mdAndDown ? -2 : scaleOptions.length
              )" :key="`scaleOptions-` + index" :value="item.value">
                <div class="text-body-2 text-truncate" style="max-width: 100px; overflow: hidden">
                  {{ item.text }}
                </div>
              </option>
            </template>
            <option id="customScaleOption" value="custom" disabled="disabled" hidden="true"></option>
          </select>
        </span>
        <v-spacer v-if="mode !== 4"></v-spacer>
        <tippy v-show="mode === 3 && canDownload === true">
          <template v-slot:trigger>
            <v-btn id="download" text class="toolbarButton" @click="downloadFiles()">
              <v-icon size="22">mdi-download</v-icon>
            </v-btn>
          </template>
          <span>
            <span style="font-size: 12px; color: white">{{
              $t('tooltip.download')
            }}</span>
          </span>
        </tippy>
        <v-btn v-if="(mode === 0 || mode === 5) && $vuetify.breakpoint.lgAndUp" text
          class="toolbarButton rounded-lg mr-1 d-none">
          <v-icon size="22">mdi-keyboard-outline</v-icon>
        </v-btn>
        <v-spacer v-if="mode === 4"></v-spacer>
        <v-btn-toggle v-if="(mode === 1 || mode === 3) && !hideAttachment" v-model="attachmentDrawerToggle" dense group
          multiple>
          <v-btn :value="1" text class="toolbarButton rounded-lg" @click="toggleAttachmentDrawer()">
            <img src="/images/tasks/paperclip.png" />
          </v-btn>
          <div v-show="attachmentTotalCount" class="d-flex align-center justify-center" :style="{
            'font-size': attachmentTotalCount > 99 ? '11px' : '12px',
          }" style="
              position: absolute;
              right: 0px;
              top: 0px;
              background-color: #e7b000;
              color: white;
              width: 20px;
              height: 20px;
              border-radius: 50px;
              cursor: pointer;
              user-select: none; /* standard syntax */
              -webkit-user-select: none; /* for Chrome、Safari */
              -moz-user-select: none; /* for Mozilla、Firefox */
            " @click="toggleAttachmentDrawer()">
            {{ attachmentTotalCount > 99 ? '99+' : attachmentTotalCount }}
          </div>
        </v-btn-toggle>
        <v-btn-toggle v-if="(mode === 1 || mode === 3) && !hideComment" v-model="commentDrawerToggle" dense group
          multiple>
          <v-btn :value="1" text class="toolbarButton rounded-lg" @click="toggleCommentDrawer()">
            <img width="22" height="22" src="/icon/comment.svg" />
          </v-btn>
          <div v-show="commentTotalCount" class="d-flex align-center justify-center"
            :style="{ 'font-size': commentTotalCount > 99 ? '11px' : '12px' }" style="
              position: absolute;
              right: 0px;
              top: 0px;
              background-color: #e7b000;
              color: white;
              width: 20px;
              height: 20px;
              border-radius: 50px;
              cursor: pointer;
              user-select: none; /* standard syntax */
              -webkit-user-select: none; /* for Chrome、Safari */
              -moz-user-select: none; /* for Mozilla、Firefox */
            " @click="toggleCommentDrawer()">
            {{ commentTotalCount > 99 ? '99+' : commentTotalCount }}
          </div>
        </v-btn-toggle>
        <v-divider v-if="mode === 0 || mode === 5" inset vertical class="mx-1"></v-divider>
        <!-- streaming panel button -->
        <v-btn-toggle v-if="mode === 4" v-model="streamingDrawerToggle" dense group multiple
          style="pointer-events: all; cursor: pointer; display: none">
          <v-btn :value="1" text class="toolbarButton rounded-sm streaming-icon"
            style="min-width: auto !important; width: 36px; height: 36px" @click="toggleStreamingDrawer()">
          </v-btn>
        </v-btn-toggle>
        <!-- outline panel button -->
        <span v-if="mode !== 4 && fileList.length > 1" :class="{ 'small-text': $vuetify.breakpoint.mdAndDown }">
          {{ $t('text.pdfFile', { countText: currentFileIndexText }) }}
        </span>
        <v-btn-toggle v-if="mode !== 4" v-model="rightDrawerToggle" dense group multiple>
          <v-btn :value="1" text class="toolbarButton rounded-lg" @click="toggleRightDrawer()">
            <v-icon size="22">mdi-book-open-outline</v-icon>
          </v-btn>
        </v-btn-toggle>
        <!-- mode 4 control switcher -->
        <div v-if="mode === 4 && role === 'HOST'" class="d-flex flex-row align-center">
          <div class="text-subtitle-1 mr-2">
            {{ $t('text.controlby') }}
          </div>
          <v-select v-model="control" :items="controlOptions" item-text="text" item-value="id" background-color="white"
            solo flat single-line hide-details height="26" :menu-props="{
              auto: true,
              bottom: true,
              offsetY: true,
              zIndex: 200,
            }" style="
              pointer-events: all;
              cursor: pointer;
              border: 1px solid #e3e3e3;
              max-width: 108px;
              width: 108px;
            " @change="$emit('changeControl', control)">
          </v-select>
        </div>
      </v-slide-group>
      <template v-if="(mode === 0 || mode === 5) && $vuetify.breakpoint.mdAndDown" v-slot:extension>
        <div style="max-width: calc(100% - 85px); height: 64px">
          <v-slide-group v-model="activeMobileButton" show-arrows style="height: 100%">
            <v-slide-item :key="0">
              <v-btn id="annotateBtn1" text class="toolbarButton mobile-toolbar-button rounded-lg mr-2"
                @click="addAnnotateMB(1)">
                <div class="d-flex flex-column align-center">
                  <v-icon size="22">mdi-signature</v-icon>
                  <div class="mobile-toolbar-button-text">
                    {{ $t('button.signature') }}
                  </div>
                </div>
              </v-btn>
            </v-slide-item>
            <v-slide-item :key="1">
              <v-btn id="annotateBtn4" text class="toolbarButton mobile-toolbar-button rounded-lg mr-2"
                @click="addAnnotateMB(4)">
                <div class="d-flex flex-column align-center">
                  <v-icon size="22">mdi-stamper</v-icon>
                  <div class="mobile-toolbar-button-text">
                    {{ $t('button.stamp') }}
                  </div>
                </div>
              </v-btn>
            </v-slide-item>
            <v-slide-item v-show="mode === 0" :key="13">
              <v-btn id="annotateBtn14" text class="toolbarButton mobile-toolbar-button rounded-lg mr-2"
                @click="addAnnotateMB(14)">
                <div class="d-flex flex-column align-center">
                  <i class="custom-icon icon-signatureAndStamp"></i>
                  <div class="mobile-toolbar-button-text">
                    {{ $t('button.signatureAndStamp') }}
                  </div>
                </div>
              </v-btn>
            </v-slide-item>
            <v-slide-item :key="2">
              <v-btn id="annotateBtn9" text class="toolbarButton mobile-toolbar-button rounded-lg mr-2"
                @click="addAnnotateMB(9)">
                <div class="d-flex flex-column align-center">
                  <v-icon size="22">mdi-image</v-icon>
                  <div class="mobile-toolbar-button-text">
                    {{ $t('button.image') }}
                  </div>
                </div>
              </v-btn>
            </v-slide-item>
            <v-slide-item :key="3">
              <v-btn id="annotateBtn5" text class="toolbarButton mobile-toolbar-button rounded-lg mr-2"
                @click="addAnnotateMB(5)">
                <div class="d-flex flex-column align-center">
                  <v-icon size="22">mdi-calendar-month</v-icon>
                  <div class="mobile-toolbar-button-text">
                    {{ $t('button.date') }}
                  </div>
                </div>
              </v-btn>
            </v-slide-item>
            <v-slide-item :key="4">
              <v-btn id="annotateBtn2" text class="toolbarButton mobile-toolbar-button rounded-lg mr-2"
                @click="addAnnotateMB(2)">
                <div class="d-flex flex-column align-center">
                  <v-icon size="22">mdi-format-text</v-icon>
                  <div class="mobile-toolbar-button-text">
                    {{ $t('button.text') }}
                  </div>
                </div>
              </v-btn>
            </v-slide-item>
            <v-slide-item :key="5">
              <v-btn id="annotateBtn3" text class="toolbarButton mobile-toolbar-button rounded-lg mr-2"
                @click="addAnnotateMB(3)">
                <div class="d-flex flex-column align-center">
                  <v-icon size="22">mdi-checkbox-marked</v-icon>
                  <div class="mobile-toolbar-button-text">
                    {{ $t('button.checkbox') }}
                  </div>
                </div>
              </v-btn>
            </v-slide-item>
            <v-slide-item :key="6">
              <v-btn id="annotateBtn6" text class="toolbarButton mobile-toolbar-button rounded-lg mr-2"
                @click="addAnnotateMB(6)">
                <div class="d-flex flex-column align-center">
                  <v-icon size="22">mdi-radiobox-marked</v-icon>
                  <div class="mobile-toolbar-button-text">
                    {{ $t('button.radioButton') }}
                  </div>
                </div>
              </v-btn>
            </v-slide-item>
            <v-slide-item v-show="mode === 0" :key="7">
              <v-btn id="annotateBtn7" text class="toolbarButton mobile-toolbar-button rounded-lg mr-2"
                @click="addAnnotateMB(7)">
                <div class="d-flex flex-column align-center">
                  <v-icon size="22">mdi-form-dropdown</v-icon>
                  <div class="mobile-toolbar-button-text">
                    {{ $t('button.dropdown') }}
                  </div>
                </div>
              </v-btn>
            </v-slide-item>
            <v-slide-item :key="8">
              <v-btn id="annotateBtn8" text class="toolbarButton mobile-toolbar-button rounded-lg mr-2"
                @click="addAnnotateMB(8)">
                <div class="d-flex flex-column align-center">
                  <v-icon size="22">mdi-paperclip</v-icon>
                  <div class="mobile-toolbar-button-text">
                    {{ $t('button.attachment') }}
                  </div>
                </div>
              </v-btn>
            </v-slide-item>
            <v-slide-item v-if="!hideB2b2c()" :key="9">
              <v-btn id="annotateBtn10" text class="toolbarButton mobile-toolbar-button rounded-lg mr-2"
                @click="addAnnotateMB(10)">
                <div class="d-flex flex-column align-center">
                  <i class="custom-icon icon-signatureBP"></i>
                  <div class="mobile-toolbar-button-text">
                    {{ $t('button.signatureBP') }}
                  </div>
                </div>
              </v-btn>
            </v-slide-item>
            <v-slide-item v-if="!hideB2b2c()" :key="10">
              <v-btn id="annotateBtn11" text class="toolbarButton mobile-toolbar-button rounded-lg mr-2"
                @click="addAnnotateMB(11)">
                <div class="d-flex flex-column align-center">
                  <i class="custom-icon icon-signatureBO"></i>
                  <div class="mobile-toolbar-button-text">
                    {{ $t('button.signatureBO') }}
                  </div>
                </div>
              </v-btn>
            </v-slide-item>
            <v-slide-item v-if="!hideB2b2c()" :key="11">
              <v-btn id="annotateBtn12" text class="toolbarButton mobile-toolbar-button rounded-lg mr-2"
                @click="addAnnotateMB(12)">
                <div class="d-flex flex-column align-center">
                  <i class="custom-icon icon-stampBP"></i>
                  <div class="mobile-toolbar-button-text">
                    {{ $t('button.stampBP') }}
                  </div>
                </div>
              </v-btn>
            </v-slide-item>
            <v-slide-item v-if="!hideB2b2c()" :key="12">
              <v-btn id="annotateBtn13" text class="toolbarButton mobile-toolbar-button rounded-lg mr-2"
                @click="addAnnotateMB(13)">
                <div class="d-flex flex-column align-center">
                  <i class="custom-icon icon-stampBO"></i>
                  <div class="mobile-toolbar-button-text">
                    {{ $t('button.stampBO') }}
                  </div>
                </div>
              </v-btn>
            </v-slide-item>
            <v-slide-item v-show="mode === 0" :key="15">
              <v-btn id="annotateBtn15" text class="toolbarButton mobile-toolbar-button rounded-lg mr-2"
                @click="addAnnotateMB(15)">
                <div class="d-flex flex-column align-center">
                  <v-icon size="22">mdi-message-draw</v-icon>
                  <div class="mobile-toolbar-button-text">
                    {{ $t('button.canvas') }}
                  </div>
                </div>
              </v-btn>
            </v-slide-item>
          </v-slide-group>
        </div>
        <v-divider v-show="mode !== 5" inset vertical class="mx-1"></v-divider>
        <v-btn v-show="mode !== 5" id="undo-mobile" text disabled class="toolbarButton rounded-lg mr-1">
          <v-icon size="22">mdi-undo</v-icon>
        </v-btn>
        <v-btn v-show="mode !== 5" id="redo-mobile" text disabled class="toolbarButton rounded-lg mr-1">
          <v-icon size="22">mdi-redo</v-icon>
        </v-btn>
      </template>
    </v-app-bar>

    <!-- mode 0 left -->
    <v-navigation-drawer v-if="mode === 0 || mode === 5" id="leftDrawerContainer" v-model="leftDrawer" :clipped="true"
      absolute app color="#f8f9fa" touchless floating
      style="height: 100%; border-right: 1px solid #e0e0e0; z-index: 200">
      <v-tabs v-model="toolSet" background-color="rgb(248, 249, 250)" vertical style="height: 100%">
        <tippy placement="right">
          <template v-slot:trigger>
            <v-tab style="padding: 0 8px; min-width: 48px; max-width: 48px">
              <v-icon> mdi-vector-square </v-icon>
            </v-tab>
          </template>
          <span>
            <span style="font-size: 12px; color: white">{{
              $t('heading.standardFields')
            }}</span>
          </span>
        </tippy>
        <v-divider class="mx-2"></v-divider>
        <tippy placement="right">
          <template v-slot:trigger>
            <v-tab :hidden="hideB2b2c()" style="padding: 0 8px; min-width: 48px; max-width: 48px">
              <SvgIconCloudCertificate :active="toolSet === 1" />
            </v-tab>
          </template>
          <span>
            <span style="font-size: 12px; color: white">{{
              $t('heading.digitalSignature')
            }}</span>
          </span>
        </tippy>
        <v-divider v-if="mode === 0" class="mx-2"></v-divider>
        <tippy placement="right">
          <template v-slot:trigger>
            <v-tab :hidden="mode !== 0" style="padding: 0 8px; min-width: 48px; max-width: 48px">
              <v-icon> mdi-square-edit-outline </v-icon>
            </v-tab>
          </template>
          <span>
            <span style="font-size: 12px; color: white">{{
              $t('heading.prefillTools')
            }}</span>
          </span>
        </tippy>
        <v-divider v-if="mode === 0" class="mx-2"></v-divider>
        <v-tab-item eager>
          <v-list nav height="100%" class="pa-0">
            <v-subheader class="text-subtitle-2" style="color: #00653e">
              {{ $t('heading.signatureFields') }}
            </v-subheader>
            <v-list-item-group v-model="selectedAnnotate">
              <v-list-item id="signButton" class="mx-2 tour-create-task-8">
                <v-list-item-action class="mr-6">
                  <v-icon>mdi-signature</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title class="drawerListItem">{{
                    $t('button.signature')
                  }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item id="stampButton" class="mx-2">
                <v-list-item-action class="mr-6">
                  <v-icon>mdi-stamper</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title class="drawerListItem">{{
                    $t('button.stamp')
                  }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item v-show="mode === 0" id="signatureAndStampButton" class="mx-2">
                <v-list-item-action class="mr-6">
                  <i class="custom-icon icon-signatureAndStamp"></i>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title class="drawerListItem">{{
                    $t('button.signatureAndStamp')
                  }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-divider class="my-4"></v-divider>
              <v-subheader class="text-subtitle-2" style="color: #00653e">
                {{ $t('heading.otherFields') }}
              </v-subheader>
              <v-list-item id="imageButton" class="mx-2">
                <v-list-item-action class="mr-6">
                  <v-icon>mdi-image</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title class="drawerListItem">{{
                    $t('button.image')
                  }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item id="signDateButton" class="mx-2">
                <v-list-item-action class="mr-6">
                  <v-icon>mdi-calendar-month</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title class="drawerListItem">{{
                    $t('button.date')
                  }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item id="textButton" class="mx-2 tour-create-task-4">
                <v-list-item-action class="mr-6">
                  <v-icon>mdi-format-text</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title class="drawerListItem">{{
                    $t('button.text')
                  }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item id="attachmentButton" class="mx-2">
                <v-list-item-action class="mr-6">
                  <v-icon>mdi-paperclip</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title class="drawerListItem">{{
                    $t('button.attachment')
                  }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-divider class="my-4"></v-divider>
              <v-subheader class="text-subtitle-2" style="color: #00653e">
                {{ $t('heading.selectFields') }}
              </v-subheader>
              <v-list-item id="checkboxButton" class="mx-2">
                <v-list-item-action class="mr-6">
                  <v-icon>mdi-checkbox-marked</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title class="drawerListItem">{{
                    $t('button.checkbox')
                  }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item id="radioButton" class="mx-2">
                <v-list-item-action class="mr-6">
                  <v-icon>mdi-radiobox-marked</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title class="drawerListItem">{{
                    $t('button.radioButton')
                  }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item v-show="mode === 0" id="dropdownButton" class="mx-2">
                <v-list-item-action class="mr-6">
                  <v-icon>mdi-form-dropdown</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title class="drawerListItem">{{
                    $t('button.dropdown')
                  }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <div v-show="mode === 0">
                <v-divider class="my-4"></v-divider>
                <v-subheader class="text-subtitle-2" style="color: #00653e">
                  {{ $t('heading.explainFields') }}
                </v-subheader>
                <v-list-item id="drawCanvasButton" class="mx-2">
                  <v-list-item-action class="mr-6">
                    <v-icon>mdi-message-draw</v-icon>
                  </v-list-item-action>
                  <v-list-item-content>
                    <v-list-item-title class="drawerListItem">{{
                      $t('button.canvas')
                    }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </div>
            </v-list-item-group>
          </v-list>
        </v-tab-item>
        <v-tab-item eager>
          <v-list nav height="100%" class="pa-0">
            <v-subheader class="text-subtitle-2" style="color: #00653e">
              {{ $t('heading.digitalSignature') }}
              <tippy placement="bottom" :max-width="200">
                <template v-slot:trigger>
                  <v-icon small class="ml-2 pb-1"> mdi-help-circle </v-icon>
                </template>
                <span>
                  <div style="font-size: 12px">
                    {{ $t('tooltip.b2b2cInfo') }}
                  </div>
                  <div style="font-size: 12px">
                    {{ $t('tooltip.b2b2cPInfo') }}
                  </div>
                  <div style="font-size: 12px">
                    {{ $t('tooltip.b2b2cOInfo') }}
                  </div>
                </span>
              </tippy>
            </v-subheader>
            <v-list-item-group v-model="selectedAnnotate">
              <v-list-item id="signatureBPButton" class="mx-2">
                <v-list-item-action class="mr-4">
                  <i class="custom-icon icon-signatureBP"></i>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title class="drawerListItem" :class="{ 'small-text': isEn }">{{ $t('button.signatureBP')
                    }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item id="signatureBOButton" class="mx-2">
                <v-list-item-action class="mr-4">
                  <i class="custom-icon icon-signatureBO"></i>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title class="drawerListItem" :class="{ 'small-text': isEn }">{{ $t('button.signatureBO')
                    }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item id="stampBPButton" class="mx-2">
                <v-list-item-action class="mr-4">
                  <i class="custom-icon icon-stampBP"></i>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title class="drawerListItem" :class="{ 'small-text': isEn }">{{ $t('button.stampBP')
                    }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item id="stampBOButton" class="mx-2">
                <v-list-item-action class="mr-4">
                  <i class="custom-icon icon-stampBO"></i>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title class="drawerListItem" :class="{ 'small-text': isEn }">{{ $t('button.stampBO')
                    }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-tab-item>
        <v-tab-item eager>
          <v-list nav height="100%" class="pa-0">
            <v-subheader class="text-subtitle-2" style="color: #00653e">
              {{ $t('heading.prefillTools') }}
              <tippy placement="bottom" :max-width="200">
                <template v-slot:trigger>
                  <v-icon small class="ml-2 pb-1"> mdi-help-circle </v-icon>
                </template>
                <span>
                  <div style="font-size: 12px">
                    {{ $t('tooltip.prefillInfo') }}
                  </div>
                </span>
              </tippy>
            </v-subheader>
            <v-list-item-group v-model="selectedAnnotate">
              <v-list-item id="prefillTextButton" class="mx-2">
                <v-list-item-action class="mr-4">
                  <v-icon>mdi-format-text</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title class="drawerListItem">{{
                    $t('button.prefillText')
                  }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item id="prefillCheckboxButton" class="mx-2">
                <v-list-item-action class="mr-4">
                  <v-icon>mdi-checkbox-marked</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title class="drawerListItem">{{
                    $t('button.prefillCheckbox')
                  }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item id="prefillRadioButton" class="mx-2">
                <v-list-item-action class="mr-4">
                  <v-icon>mdi-radiobox-marked</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title class="drawerListItem">{{
                    $t('button.prefillRadio')
                  }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item id="prefillAttachment" class="mx-2">
                <v-list-item-action class="mr-4">
                  <v-icon>mdi-paperclip</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title class="drawerListItem">{{
                    $t('button.prefillAttachment')
                  }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-tab-item>
      </v-tabs>
    </v-navigation-drawer>

    <!-- mode 0-3 right -->
    <v-navigation-drawer v-if="mode !== 4" id="rightDrawerContainer" v-model="rightDrawer" :clipped="true"
      :absolute="!$vuetify.breakpoint.mdAndDown" :fixed="$vuetify.breakpoint.mdAndDown" app right width="240"
      color="#f8f9fa" touchless floating hide-overlay
      style="height: 100%; border-left: 1px solid #e0e0e0; z-index: 200">
      <div style="display: flex; flex-direction: column; width: 100%; height: 100%">
        <div v-if="fileList !== null && fileList.length > 1" id="multifileView">
          <v-list-item>
            <v-list-item-content>
              <v-subheader class="text-subtitle-2">
                {{ $t('heading.document') }}
              </v-subheader>
              <v-select v-model="selectedFile" :items="fileList" item-text="name" item-value="id" height="32"
                background-color="white" solo flat single-line hide-details class="peopleSelect" :menu-props="{
                  auto: true,
                  bottom: true,
                  offsetY: true,
                  zIndex: '203 !important',
                  maxHeight: '100%',
                }" @change="changeFile">
              </v-select>
            </v-list-item-content>
          </v-list-item>
        </div>
        <v-divider></v-divider>
        <div style="position: relative; width: 100%; height: 100%">
          <div id="thumbnailView"></div>
          <div id="selectionView" class="hidden tour-create-task-5">
            <v-list height="100%" width="100%">
              <v-list-item dense>
                <v-list-item-content style="flex: none">
                  <div id="selectionViewTitle" class="text-subtitle-1 align-center d-flex"></div>
                </v-list-item-content>
                <v-spacer></v-spacer>
                <tippy>
                  <template v-slot:trigger>
                    <v-btn id="deleteButton" text style="padding: 0 8px; min-width: 48px">
                      <v-icon size="18">mdi-delete</v-icon>
                    </v-btn>
                  </template>
                  <span>
                    <span style="font-size: 12px; color: white">{{
                      $t('tooltip.deleteFields')
                    }}</span>
                    <span style="font-size: 12px; color: #9f9f9f">(Delete)</span>
                  </span>
                </tippy>
              </v-list-item>
              <v-divider></v-divider>
              <v-expansion-panels :value="[
                0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
              ]" accordion multiple>
                <v-expansion-panel id="assgineeContainer" :key="0" class="elevation-0">
                  <v-expansion-panel-header color="#f8f9fa" class="text-subtitle-2">{{ $t('heading.signers')
                    }}</v-expansion-panel-header>
                  <v-expansion-panel-content color="#f8f9fa">
                    <v-select v-model="annotateSelectId" :items="peopleNames" item-text="name" item-value="id"
                      height="32" background-color="white" solo flat single-line hide-details
                      style="max-width: 240px; border: 1px solid #dfe1e6" :menu-props="{
                        auto: true,
                        bottom: true,
                        offsetY: true,
                        zIndex: 200,
                        maxHeight: '100%',
                      }" :disabled="!!selection.prefill" @change="onAnnotateSelectIdChange">
                      <template v-slot:[`selection`]="{ item }">
                        <v-icon :color="getPersonColor(item)" class="mr-2">mdi-circle-medium</v-icon>
                        <div class="text-body-2 text-truncate" style="max-width: 240px; overflow: hidden">
                          {{ item.name }}
                        </div>
                      </template>
                      <template v-slot:[`item`]="{ item }">
                        <v-icon :color="getPersonColor(item)" class="mr-2">mdi-circle-medium</v-icon>
                        <div class="text-body-2 text-truncate" style="max-width: 240px; overflow: hidden">
                          {{ item.name }}
                        </div>
                      </template>
                    </v-select>
                    <v-checkbox v-model="selection.required" hide-details dense class="requiredButton text-body-2 mt-4"
                      :disabled="[9, 10, 11, 12, 14].includes(selection.type)" @change="changeRequired()">
                      <template v-slot:label>
                        <div class="text-subtitle-2 black--text">
                          {{ $t('label.requiredField') }}
                        </div>
                      </template>
                    </v-checkbox>
                    <v-checkbox v-model="selection.readonly" class="readonlyButton text-body-2 mt-2" hide-details dense
                      :disabled="selection.type === 4 &&
                        selection.dateRange === 'signDay'
                        " @change="changeReadOnly()">
                      <template v-slot:label>
                        <div class="text-subtitle-2 black--text">
                          {{ $t('label.readOnly') }}
                        </div>
                      </template>
                    </v-checkbox>
                  </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel id="formatContainer" :key="1" class="elevation-0">
                  <v-expansion-panel-header color="#f8f9fa" class="text-subtitle-2">{{ $t('heading.format')
                    }}</v-expansion-panel-header>
                  <v-expansion-panel-content color="#f8f9fa">
                    <v-select id="fontFamilySelect" v-model="selection.fontFamily" :items="fontFamilyList"
                      item-text="name" item-value="value" height="32" background-color="white" solo flat single-line
                      hide-details style="max-width: 100%; border: 1px solid #dfe1e6" :menu-props="{
                        auto: true,
                        bottom: true,
                        offsetY: true,
                        zIndex: 200,
                        maxHeight: '100%',
                      }" @change="changeSelectionFont">
                      <template v-slot:[`selection`]="{ item }">
                        <div class="text-body-2 text-truncate" style="max-width: 140px; overflow: hidden">
                          {{ item.name }}
                        </div>
                      </template>
                      <template v-slot:[`item`]="{ item }">
                        <div class="text-body-2 text-truncate" style="max-width: 140px; overflow: hidden">
                          {{ item.name }}
                        </div>
                      </template>
                    </v-select>
                    <v-row class="mt-2" no-gutters>
                      <v-col cols="5" class="d-flex">
                        <v-select id="fontSizeSelect" v-model="selection.fontSize" :items="fontSizeList"
                          item-text="name" item-value="value" height="36" background-color="white" solo flat single-line
                          hide-details style="max-width: 100px; border: 1px solid #dfe1e6" :menu-props="{
                            auto: true,
                            bottom: true,
                            offsetY: true,
                            zIndex: 200,
                            maxHeight: '100%',
                          }" @change="changeSelectionFont">
                          <template v-slot:[`selection`]="{ item }">
                            <div class="text-body-2 text-truncate" style="max-width: 100px; overflow: hidden">
                              {{ item.name }}
                            </div>
                          </template>
                          <template v-slot:[`item`]="{ item }">
                            <div class="text-body-2 text-truncate" style="max-width: 100px; overflow: hidden">
                              {{ item.name }}
                            </div>
                          </template>
                        </v-select>
                      </v-col>
                      <v-col cols="7" class="d-flex px-1">
                        <v-btn-toggle id="fontWeightToggle" v-model="selection.fontWeight" dense group
                          @change="changeSelectionFont">
                          <v-btn value="bold" text small>
                            <v-icon>mdi-format-bold</v-icon>
                          </v-btn>
                        </v-btn-toggle>
                        <v-btn-toggle id="fontStyleToggle" v-model="selection.fontStyle" dense group
                          @change="changeSelectionFont">
                          <v-btn value="italic" text small>
                            <v-icon>mdi-format-italic</v-icon>
                          </v-btn>
                        </v-btn-toggle>
                      </v-col>
                    </v-row>
                    <v-row class="mt-2" no-gutters>
                      <v-col cols="12" class="d-flex">
                        <!-- text align -->
                        <v-btn-toggle id="textAlignToggle" v-model="selection.textAlign" mandatory dense
                          class="textAlignButton text-body-2" @change="changeTextAlign()">
                          <v-btn value="left" :disabled="selection?.textDirection">
                            <v-icon>mdi-format-align-left</v-icon>
                          </v-btn>
                          <v-btn value="center" :disabled="selection?.textDirection">
                            <v-icon>mdi-format-align-center</v-icon>
                          </v-btn>
                          <v-btn value="right" :disabled="selection?.textDirection">
                            <v-icon>mdi-format-align-right</v-icon>
                          </v-btn>
                        </v-btn-toggle>
                      </v-col>
                    </v-row>
                    <v-menu offset-y min-width="auto" z-index="201">
                      <template v-slot:activator="{ on, attrs }">
                        <v-btn height="36" text class="mt-2" style="
                            max-width: 100%;
                            border: 1px solid #dfe1e6;
                            background: white;
                          " v-bind="attrs" v-on="on">
                          <v-row align="center" class="flex-column pa-2" justify="center">
                            <v-icon class="cols 12">
                              mdi-format-color-text
                            </v-icon>
                            <v-sheet tile style="margin-top: -4px" height="4" width="26"
                              :color="selection.textColor"></v-sheet>
                          </v-row>
                          <div class="text-body-2 ml-4">
                            {{ $t('text.textColor') }}
                          </div>
                          <v-spacer></v-spacer>
                          <v-icon class="ml-2"> mdi-menu-down </v-icon>
                        </v-btn>
                      </template>
                      <div id="textColorPanel" class="d-flex flex-column justify-center align-center" style="
                          padding: 9px;
                          background-color: white;
                          box-shadow: 0px 3px 6px #00000029;
                        ">
                        <p class="text-body-2">{{ $t('text.textColor') }}</p>
                        <div class="color" style="margin: unset">
                          <div v-for="(row, index) in colorArr" :key="'row' + index" class="d-flex">
                            <v-btn v-for="(color, idx) in row" :key="'color' + idx" style="
                                width: 40px;
                                height: 35px;
                                cursor: pointer;
                                border-radius: 0px;
                              " :style="{ 'background-color': color }" @click="changeTextColor(color)"></v-btn>
                          </div>
                        </div>
                      </div>
                    </v-menu>
                    <!-- select text input direction , default false as horizontal , true as vertical -->
                    <!-- text direction -->
                    <v-row v-show="selection.type === 1 ||
                      (selection.type === 4 && selection.dateEra === 'roc')
                      " class="mt-2" no-gutters>
                      <v-col cols="12" class="d-flex">
                        <v-btn-toggle v-model="selection.textDirection" mandatory dense
                          class="textDirectionButton text-body-2" @change="changeTextDirection()">
                          <v-btn v-for="item in directionList" :key="item.name" :value="item.value">
                            <v-icon>{{ item.icon }}</v-icon>
                          </v-btn>
                        </v-btn-toggle>
                      </v-col>
                    </v-row>
                    <!-- select text input single line or multiple, not for prefill and text input only -->
                    <v-checkbox v-show="selection.type === 1" v-model="selection.singleLine" hide-details dense
                      class="singleLineButton text-body-2 mt-4" :disabled="[9, 10, 11, 12].includes(selection.type) ||
                        selection.textDirection
                        " @change="changeSingleLine()">
                      <template v-slot:label>
                        <div class="text-subtitle-2 black--text">
                          {{ $t('label.singleLine') }}
                        </div>
                      </template>
                    </v-checkbox>
                  </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel id="dateFormatContainer" :key="2" class="elevation-0">
                  <v-expansion-panel-header color="#f8f9fa" class="text-subtitle-2">{{ $t('heading.dateFormat')
                    }}</v-expansion-panel-header>
                  <v-expansion-panel-content color="#f8f9fa">
                    <v-tooltip bottom z-index="200">
                      <template v-slot:activator="{ on, attrs }">
                        <v-select id="dateFormatSelect" v-model="selection.dateFormat" :items="dateFormatListFilter"
                          item-text="name" item-value="name" height="32" background-color="white" solo flat single-line
                          hide-details style="max-width: 100%; border: 1px solid #dfe1e6" :menu-props="{
                            auto: true,
                            bottom: true,
                            offsetY: true,
                            zIndex: 200,
                            maxHeight: '100%',
                          }" v-bind="attrs" v-on="on" @change="changeDateFormat">
                          <template v-slot:[`selection`]="{ item }">
                            <div class="text-body-2 text-truncate" style="max-width: 100px; overflow: hidden"
                              v-bind="attrs" v-on="on">
                              {{ item.name }}
                            </div>
                          </template>
                          <template v-slot:[`item`]="{ item }">
                            <div class="text-body-2 text-truncate" style="max-width: 100px; overflow: hidden">
                              {{ item.name }}
                            </div>
                          </template>
                        </v-select>
                      </template>
                      <span>{{
                        dateFormatListFilter.find(
                          (x) => x.name === selection.dateFormat
                        )?.hoverView ?? selection.dateFormat
                      }}</span>
                    </v-tooltip>
                  </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel id="textContainer" :key="3" class="elevation-0">
                  <v-expansion-panel-header color="#f8f9fa" class="text-subtitle-2">{{ $t('heading.textDefault')
                    }}</v-expansion-panel-header>
                  <v-expansion-panel-content color="#f8f9fa">
                    <v-textarea v-if="!selection.singleLine" v-model="selection.text" min-height="80" label=""
                      background-color="white" solo flat hide-details :placeholder="$t('placeholder.addText')"
                      class="text-subtitle-2 text-input" style="max-width: 100%; border: 1px solid #dfe1e6"
                      @input="changeTextarea"></v-textarea>
                    <v-textarea v-else v-model="selection.text" min-height="80" label="" background-color="white" solo
                      flat hide-details :placeholder="$t('placeholder.addText')" class="text-subtitle-2 text-input"
                      style="max-width: 100%; border: 1px solid #dfe1e6" @input="changeTextarea"
                      @keydown.enter.prevent></v-textarea>
                    <div class="d-flex flex-row align-center mt-2">
                      <v-text-field v-model.number="selection.maxlength" type="number" label="" background-color="white"
                        solo flat hide-details class="text-subtitle-2 mr-2"
                        style="max-width: 100px; border: 1px solid #dfe1e6" @keydown.stop
                        @change="changeMaxlength"></v-text-field>
                      <div class="text-subtitle-2">
                        {{ $t('label.charLimit') }}
                      </div>
                    </div>
                  </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel id="checkboxSizeContainer" key="15" class="elevation-0">
                  <v-expansion-panel-header color="#f8f9fa" class="text-subtitle-2">{{ $t('heading.checkboxSize')
                    }}</v-expansion-panel-header>
                  <v-expansion-panel-content color="#f8f9fa">
                    <template>
                      <div class="d-flex flex-row align-center">
                        <v-select id="checkboxSizeSelect" v-model="selection.originFontSize" :items="boxSizeList"
                          item-text="name" item-value="value" height="32" background-color="white" solo flat single-line
                          hide-details style="max-width: 120px; border: 1px solid #dfe1e6" :menu-props="{
                            auto: true,
                            bottom: true,
                            offsetY: true,
                            zIndex: 200,
                            maxHeight: '100%',
                          }" @change="changeSelectionFont">
                          <template v-slot:[`selection`]="{ item }">
                            <div class="text-body-2 text-truncate" style="max-width: 100px; overflow: hidden">
                              {{ item.name }}
                            </div>
                          </template>
                          <template v-slot:[`item`]="{ item }">
                            <div class="text-body-2 text-truncate" style="max-width: 100px; overflow: hidden">
                              {{ item.name }}
                            </div>
                          </template>
                        </v-select>
                      </div>
                    </template>
                  </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel id="checkboxContainer" :key="4" class="elevation-0">
                  <v-expansion-panel-header color="#f8f9fa" class="text-subtitle-2">{{ $t('heading.checkboxValue')
                    }}</v-expansion-panel-header>
                  <v-expansion-panel-content color="#f8f9fa">
                    <template>
                      <div v-for="(item, index) in checkboxGroup" :key="index"
                        class="d-flex flex-row align-center mt-2">
                        <v-checkbox v-model="item.selected" hide-details dense class="mr-2 mt-0"
                          @change="changeCheckboxSelected"></v-checkbox>
                        <v-text-field v-model="item.label" label="" background-color="white" solo flat hide-details
                          maxlength="40" :placeholder="$t('placeholder.addText')" class="text-subtitle-2"
                          style="max-width: 100%; border: 1px solid #dfe1e6" @keydown.stop
                          @focus="focusCheckboxLabel(index)" @blur="blurCheckboxLabel(index)"></v-text-field>
                      </div>
                    </template>
                  </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel id="checkboxRuleContainer" :key="5" class="elevation-0">
                  <v-expansion-panel-header color="#f8f9fa" class="text-subtitle-2">{{
                    $t('heading.checkboxGrpRules')
                  }}</v-expansion-panel-header>
                  <v-expansion-panel-content color="#f8f9fa">
                    <v-select v-model="ruleId" :items="ruleList" item-text="name" item-value="id" height="32"
                      background-color="white" solo flat single-line hide-details
                      style="max-width: 100%; border: 1px solid #dfe1e6" :menu-props="{
                        auto: true,
                        bottom: true,
                        offsetY: true,
                        zIndex: 200,
                        maxHeight: '100%',
                      }" class="mt-2" @change="changeRule">
                      <template v-slot:[`selection`]="{ item }">
                        <div class="text-body-2 text-truncate" style="max-width: 110px; overflow: hidden">
                          {{ item.name }}
                        </div>
                      </template>
                      <template v-slot:[`item`]="{ item }">
                        <div class="text-body-2 text-truncate" style="max-width: 110px; overflow: hidden">
                          {{ item.name }}
                        </div>
                      </template>
                    </v-select>
                    <div v-if="ruleId === 0">
                      <v-select v-model="minimum" :items="Array(checkboxGroup.length + 1)
                          .fill()
                          .map((x, index) => index)
                        " height="32" background-color="white" solo flat single-line hide-details
                        style="max-width: 100%; border: 1px solid #dfe1e6" :menu-props="{
                          auto: true,
                          bottom: true,
                          offsetY: true,
                          zIndex: 200,
                          maxHeight: '100%',
                        }" class="mt-2" @change="setAtLeastRule">
                        <template v-slot:[`selection`]="{ item }">
                          <div class="text-body-2 text-truncate" style="max-width: 100px; overflow: hidden">
                            {{ item }}
                          </div>
                        </template>
                        <template v-slot:[`item`]="{ item }">
                          <div class="text-body-2 text-truncate" style="max-width: 100px; overflow: hidden">
                            {{ item }}
                          </div>
                        </template>
                      </v-select>
                    </div>
                    <div v-else-if="ruleId === 1">
                      <v-select v-model="maximum" :items="Array(checkboxGroup.length)
                          .fill()
                          .map((x, index) => index + 1)
                        " height="32" background-color="white" solo flat single-line hide-details
                        style="max-width: 100%; border: 1px solid #dfe1e6" :menu-props="{
                          auto: true,
                          bottom: true,
                          offsetY: true,
                          zIndex: 200,
                          maxHeight: '100%',
                        }" class="mt-2" @change="setAtMostRule">
                        <template v-slot:[`selection`]="{ item }">
                          <div class="text-body-2 text-truncate" style="max-width: 100px; overflow: hidden">
                            {{ item }}
                          </div>
                        </template>
                        <template v-slot:[`item`]="{ item }">
                          <div class="text-body-2 text-truncate" style="max-width: 100px; overflow: hidden">
                            {{ item }}
                          </div>
                        </template>
                      </v-select>
                    </div>
                    <div v-else-if="ruleId === 2">
                      <v-select v-model="maximum" :items="Array(checkboxGroup.length)
                          .fill()
                          .map((x, index) => index + 1)
                        " height="32" background-color="white" solo flat single-line hide-details
                        style="max-width: 100%; border: 1px solid #dfe1e6" :menu-props="{
                          auto: true,
                          bottom: true,
                          offsetY: true,
                          zIndex: 200,
                          maxHeight: '100%',
                        }" class="mt-2" @change="setExactlyRule">
                        <template v-slot:[`selection`]="{ item }">
                          <div class="text-body-2 text-truncate" style="max-width: 100px; overflow: hidden">
                            {{ item }}
                          </div>
                        </template>
                        <template v-slot:[`item`]="{ item }">
                          <div class="text-body-2 text-truncate" style="max-width: 100px; overflow: hidden">
                            {{ item }}
                          </div>
                        </template>
                      </v-select>
                    </div>
                    <div v-else>
                      <div class="d-flex flex-row align-center mt-2">
                        <div class="text-subtitle-2" style="min-width: 100px">
                          {{ $t('label.minimum') }}
                        </div>
                        <v-select v-model="minimum" :items="Array(checkboxGroup.length + 1)
                            .fill()
                            .map((x, index) => index)
                          " height="32" background-color="white" solo flat single-line hide-details
                          style="max-width: 100%; border: 1px solid #dfe1e6" :menu-props="{
                            auto: true,
                            bottom: true,
                            offsetY: true,
                            zIndex: 200,
                            maxHeight: '100%',
                          }" @change="setRangeRule">
                          <template v-slot:[`selection`]="{ item }">
                            <div class="text-body-2 text-truncate" style="max-width: 100px; overflow: hidden">
                              {{ item }}
                            </div>
                          </template>
                          <template v-slot:[`item`]="{ item }">
                            <div class="text-body-2 text-truncate" style="max-width: 100px; overflow: hidden">
                              {{ item }}
                            </div>
                          </template>
                        </v-select>
                      </div>
                      <div class="d-flex flex-row align-center mt-2">
                        <div class="text-subtitle-2" style="min-width: 100px">
                          {{ $t('label.maximum') }}
                        </div>
                        <v-select v-model="maximum" :items="Array(checkboxGroup.length - minimum + 1)
                            .fill()
                            .map((x, index) => index + minimum)
                          " height="32" background-color="white" solo flat single-line hide-details
                          style="max-width: 100%; border: 1px solid #dfe1e6" :menu-props="{
                            auto: true,
                            bottom: true,
                            offsetY: true,
                            zIndex: 200,
                            maxHeight: '100%',
                          }" @change="setRangeRule">
                          <template v-slot:[`selection`]="{ item }">
                            <div class="text-body-2 text-truncate" style="max-width: 100px; overflow: hidden">
                              {{ item }}
                            </div>
                          </template>
                          <template v-slot:[`item`]="{ item }">
                            <div class="text-body-2 text-truncate" style="max-width: 100px; overflow: hidden">
                              {{ item }}
                            </div>
                          </template>
                        </v-select>
                      </div>
                    </div>
                  </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel id="radioSizeContainer" key="16" class="elevation-0">
                  <v-expansion-panel-header color="#f8f9fa" class="text-subtitle-2">{{ $t('heading.radioBtnSize')
                    }}</v-expansion-panel-header>
                  <v-expansion-panel-content color="#f8f9fa">
                    <template>
                      <div class="d-flex flex-row align-center">
                        <v-select id="radioSizeSelect" v-model="selection.originFontSize" :items="boxSizeList"
                          item-text="name" item-value="value" height="32" background-color="white" solo flat single-line
                          hide-details style="max-width: 120px; border: 1px solid #dfe1e6" :menu-props="{
                            auto: true,
                            bottom: true,
                            offsetY: true,
                            zIndex: 200,
                            maxHeight: '100%',
                          }" @change="changeSelectionFont">
                          <template v-slot:[`selection`]="{ item }">
                            <div class="text-body-2 text-truncate" style="max-width: 100px; overflow: hidden">
                              {{ item.name }}
                            </div>
                          </template>
                          <template v-slot:[`item`]="{ item }">
                            <div class="text-body-2 text-truncate" style="max-width: 100px; overflow: hidden">
                              {{ item.name }}
                            </div>
                          </template>
                        </v-select>
                      </div>
                    </template>
                  </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel id="radioContainer" :key="6" class="elevation-0">
                  <v-expansion-panel-header color="#f8f9fa" class="text-subtitle-2">{{ $t('heading.radioBtnValue')
                    }}</v-expansion-panel-header>
                  <v-expansion-panel-content color="#f8f9fa">
                    <template>
                      <div v-for="(item, index) in radioGroup" :key="index" class="d-flex flex-row align-center mt-2">
                        <v-checkbox v-model="item.selected" hide-details dense class="mr-2 mt-0"
                          @change="changeRadioSelected(item)"></v-checkbox>
                        <v-text-field v-model="item.label" label="" background-color="white" solo flat hide-details
                          maxlength="40" :placeholder="$t('placeholder.addText')" class="text-subtitle-2"
                          style="max-width: 100%; border: 1px solid #dfe1e6" @keydown.stop
                          @focus="focusRadioLabel(index)" @blur="blurRadioLabel(index)"></v-text-field>
                      </div>
                    </template>
                  </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel id="dropdownContainer" :key="7" class="elevation-0">
                  <v-expansion-panel-header color="#f8f9fa" class="text-subtitle-2">{{ $t('heading.options')
                    }}</v-expansion-panel-header>
                  <v-expansion-panel-content color="#f8f9fa">
                    <template v-for="(item, index) in selection.options">
                      <div :key="index" class="d-flex flex-row align-center mt-2">
                        <v-text-field v-model="item.name" label="" background-color="white" solo flat hide-details
                          maxlength="40" :placeholder="$t('placeholder.addText')" class="text-subtitle-2"
                          style="max-width: 100%; border: 1px solid #dfe1e6" @keydown.stop @input="checkOptionWidth"
                          @change="changeSelectOption"></v-text-field>
                        <v-icon v-if="item.id !== null" medium class="ml-4" @click="deleteSelectionOption(item.id)">
                          mdi-close
                        </v-icon>
                      </div>
                    </template>
                    <v-btn color="black" text class="mt-2" @click="addSelectionOption()">
                      <v-icon left> mdi-plus </v-icon>
                      {{ $t('button.addOption') }}
                    </v-btn>
                    <v-subheader class="text-body-2 mt-2">{{
                      $t('heading.defaultValue')
                    }}</v-subheader>
                    <v-select v-model="selection.selectOptionId" :items="selectionOptions" item-text="name"
                      item-value="id" height="32" background-color="white" solo flat single-line hide-details
                      style="max-width: 100%; border: 1px solid #dfe1e6" :menu-props="{
                        auto: true,
                        bottom: true,
                        offsetY: true,
                        zIndex: 200,
                        maxHeight: '100%',
                      }" @change="changeSelectOptionId">
                      <template v-slot:[`selection`]="{ item }">
                        <div class="text-body-2 text-truncate">
                          {{ item.name }}
                        </div>
                      </template>
                      <template v-slot:[`item`]="{ item }">
                        <div class="text-body-2 text-truncate" style="max-width: 160px">
                          {{ item.name }}
                        </div>
                      </template>
                    </v-select>
                  </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel id="validationContainer" :key="8" class="elevation-0">
                  <v-expansion-panel-header color="#f8f9fa" class="text-subtitle-2">{{ $t('heading.verification')
                    }}</v-expansion-panel-header>
                  <v-expansion-panel-content v-if="selection.validation" color="#f8f9fa">
                    <v-select id="validationSelect" v-model="selection.validation.type" :items="validationList"
                      item-text="name" item-value="value" height="32" background-color="white" solo flat single-line
                      hide-details style="max-width: 100%; border: 1px solid #dfe1e6" :menu-props="{
                        auto: true,
                        bottom: true,
                        offsetY: true,
                        zIndex: 200,
                        maxHeight: '100%',
                      }" @change="changeValidation">
                      <template v-slot:[`selection`]="{ item }">
                        <div class="text-body-2 text-truncate" style="max-width: 100px; overflow: hidden">
                          {{ item.name }}
                        </div>
                      </template>
                      <template v-slot:[`item`]="{ item }">
                        <div class="text-body-2 text-truncate" style="max-width: 100px; overflow: hidden">
                          {{ item.name }}
                        </div>
                      </template>
                    </v-select>
                    <div v-if="
                      selection.validation.type &&
                      selection.validation.type === 'custom'
                    " class="d-flex flex-column mt-4">
                      <div class="text-subtitle-2 mb-2" style="min-width: 100px">
                        {{ $t('label.regex') }}
                      </div>
                      <v-text-field v-model="selection.validation.regex" autocapitalize="none" label=""
                        background-color="white" solo flat hide-details class="text-subtitle-2"
                        style="max-width: 100%; border: 1px solid #dfe1e6" :placeholder="$t('placeholder.regexExample')"
                        @keydown.stop @change="changeValidation"></v-text-field>
                      <div class="text-subtitle-2 my-2" style="min-width: 100px">
                        {{ $t('label.errorMessage') }}
                      </div>
                      <v-text-field v-model="selection.validation.errorMessage" label="" background-color="white" solo
                        flat hide-details maxlength="40" class="text-subtitle-2"
                        style="max-width: 100%; border: 1px solid #dfe1e6"
                        :placeholder="$t('placeholder.errorMsgExample')" @keydown.stop
                        @change="changeValidation"></v-text-field>
                    </div>
                  </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel id="dateEraContainer" :key="9" class="elevation-0">
                  <v-expansion-panel-header color="#f8f9fa" class="text-subtitle-2">{{ $t('heading.dateEra')
                    }}</v-expansion-panel-header>
                  <v-expansion-panel-content color="#f8f9fa">
                    <v-select id="dateEraSelect" v-model="selection.dateEra" :items="dateEraList" item-text="name"
                      item-value="value" height="32" background-color="white" solo flat single-line hide-details
                      style="max-width: 100%; border: 1px solid #dfe1e6" :menu-props="{
                        auto: true,
                        bottom: true,
                        offsetY: true,
                        zIndex: 200,
                        maxHeight: '100%',
                      }" @change="changeDateEra">
                      <template v-slot:[`selection`]="{ item }">
                        <div class="text-body-2 text-truncate" style="max-width: 100px; overflow: hidden">
                          {{ item.name }}
                        </div>
                      </template>
                      <template v-slot:[`item`]="{ item }">
                        <div class="text-body-2 text-truncate" style="max-width: 100px; overflow: hidden">
                          {{ item.name }}
                        </div>
                      </template>
                    </v-select>
                  </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel id="dateRangeContainer" :key="10" class="elevation-0">
                  <v-expansion-panel-header color="#f8f9fa" class="text-subtitle-2">{{ $t('heading.dateRange')
                    }}</v-expansion-panel-header>
                  <v-expansion-panel-content color="#f8f9fa">
                    <v-radio-group id="dateRangeSelect" v-model="selection.dateRange" column class="mt-0"
                      @change="changeDateRange">
                      <v-radio v-for="(item, index) in dateRangeList" :key="index" class="mt-1" :label="item.name"
                        :value="item.value"></v-radio>
                    </v-radio-group>
                  </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel id="dateTextContainer" :key="11" class="elevation-0">
                  <v-expansion-panel-header color="#f8f9fa" class="text-subtitle-2">{{ $t('heading.dateDeflt')
                    }}</v-expansion-panel-header>
                  <v-expansion-panel-content color="#f8f9fa">
                    <v-dialog ref="dateDialog" v-model="dateDialog" :close-on-content-click="false"
                      :return-value.sync="selection.text" max-width="290px" min-width="auto">
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field id="dateText" v-model="formatDateValue" :label="$t('label.date')" v-bind="attrs"
                          readonly background-color="white" solo flat hide-details maxlength="40"
                          class="text-subtitle-2 date-text-field" style="max-width: 100%; border: 1px solid #dfe1e6"
                          :disabled="selection.dateRange === 'signDay'" v-on="on">
                          <template v-slot:prepend>
                            <v-icon size="22"> mdi-calendar </v-icon>
                          </template>
                        </v-text-field>
                      </template>
                      <v-date-picker v-if="selection.type === 4" v-model="selection.text" color="primaryCustom"
                        :locale="$i18n.locale" scrollable :allowed-dates="getAllowedDates"
                        :disabled="selection.dateRange === 'signDay'" style="z-index: 70">
                        <v-spacer></v-spacer>
                        <v-btn text color="primaryCustom" @click="clearDateValue">
                          {{ $t('button.clear') }}
                        </v-btn>
                        <v-btn text color="primaryCustom" @click="changeDateValue">
                          {{ $t('button.confirm') }}
                        </v-btn>
                      </v-date-picker>
                    </v-dialog>
                  </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel id="uploadAttachmentContainer" :key="12" class="elevation-0">
                  <v-expansion-panel-header color="#f8f9fa" class="text-subtitle-2">{{ $t('heading.uploadAttach')
                    }}</v-expansion-panel-header>
                  <v-expansion-panel-content color="#f8f9fa">
                    <v-btn outlined color="#D8D8D8" width="190" height="44" @click="prefillAttachment(selection)"><span
                        style="color: black">{{
                          $t('button.uploadFile')
                        }}</span></v-btn>
                  </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel id="labelContainer" :key="13" class="elevation-0">
                  <v-expansion-panel-header color="#f8f9fa" class="text-subtitle-2">{{ $t('heading.label')
                    }}</v-expansion-panel-header>
                  <v-expansion-panel-content color="#f8f9fa">
                    <v-text-field v-model="selection.label" label="" background-color="white" solo flat hide-details
                      maxlength="40" class="text-subtitle-2" style="max-width: 100%; border: 1px solid #dfe1e6"
                      @keydown.stop @change="changeLabel"></v-text-field>
                  </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel id="groupLabelContainer" :key="14" class="elevation-0">
                  <v-expansion-panel-header color="#f8f9fa" class="text-subtitle-2">{{ $t('heading.groupLabel')
                    }}</v-expansion-panel-header>
                  <v-expansion-panel-content color="#f8f9fa">
                    <v-text-field v-model="selection.groupLabel" label="" background-color="white" solo flat
                      hide-details maxlength="40" class="text-subtitle-2"
                      style="max-width: 100%; border: 1px solid #dfe1e6" @keydown.stop
                      @change="changeGroupLabel"></v-text-field>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-list>
          </div>
        </div>
      </div>
    </v-navigation-drawer>

    <!-- mode 4 left outline -->
    <v-navigation-drawer v-if="mode === 4" id="leftDrawerContainer" v-model="rightDrawer" :clipped="true" absolute app
      left width="200" color="#f8f9fa" touchless floating hide-overlay style="
        height: 100%;
        border-left: 1px solid #e0e0e0;
        z-index: 199;
        left: 65px;
        top: 48px;
        max-height: calc(100% - 48px);
      " :style="mode4Outline">
      <div style="display: flex; flex-direction: column; width: 100%; height: 100%">
        <div v-if="fileList !== null && fileList.length > 1" id="multifileView">
          <v-list-item>
            <v-list-item-content>
              <v-subheader class="text-subtitle-2">
                {{ $t('heading.document') }}
              </v-subheader>
              <v-select v-model="selectedFile" :items="fileList" item-text="name" item-value="id" height="32"
                background-color="white" solo flat single-line hide-details class="peopleSelect" :menu-props="{
                  auto: true,
                  bottom: true,
                  offsetY: true,
                  zIndex: '203 !important',
                  maxHeight: '100%',
                }" @change="changeFile">
              </v-select>
            </v-list-item-content>
          </v-list-item>
        </div>
        <v-divider></v-divider>
        <div style="position: relative; width: 100%; height: 100%">
          <div id="thumbnailView"></div>
          <div id="selectionView" class="hidden">
            <v-list height="100%" width="100%">
              <v-list-item dense>
                <v-list-item-content style="flex: none">
                  <div id="selectionViewTitle" class="text-subtitle-1 align-center d-flex"></div>
                </v-list-item-content>
                <v-spacer></v-spacer>
                <tippy>
                  <template v-slot:trigger>
                    <v-btn id="deleteButton" text style="padding: 0 8px; min-width: 48px">
                      <v-icon size="18">mdi-delete</v-icon>
                    </v-btn>
                  </template>
                  <span>
                    <span style="font-size: 12px; color: white">{{
                      $t('tooltip.deleteFields')
                    }}</span>
                    <span style="font-size: 12px; color: #9f9f9f">(Delete)</span>
                  </span>
                </tippy>
              </v-list-item>
              <v-divider></v-divider>
              <v-expansion-panels :value="[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]" accordion multiple>
                <v-expansion-panel id="assgineeContainer" :key="0" class="elevation-0">
                  <v-expansion-panel-header color="#f8f9fa" class="text-subtitle-2">{{ $t('heading.signers')
                    }}</v-expansion-panel-header>
                  <v-expansion-panel-content color="#f8f9fa">
                    <v-select v-model="annotateSelectId" :items="peopleNames" item-text="name" item-value="id"
                      height="32" background-color="white" solo flat single-line hide-details
                      style="max-width: 240px; border: 1px solid #dfe1e6" :menu-props="{
                        auto: true,
                        bottom: true,
                        offsetY: true,
                        zIndex: 200,
                        maxHeight: '100%',
                      }" :disabled="!!selection.prefill" @change="onAnnotateSelectIdChange">
                      <template v-slot:[`selection`]="{ item }">
                        <v-icon :color="getPersonColor(item)" class="mr-2">mdi-circle-medium</v-icon>
                        <div class="text-body-2 text-truncate" style="max-width: 240px; overflow: hidden">
                          {{ item.name }}
                        </div>
                      </template>
                      <template v-slot:[`item`]="{ item }">
                        <v-icon :color="getPersonColor(item)" class="mr-2">mdi-circle-medium</v-icon>
                        <div class="text-body-2 text-truncate" style="max-width: 240px; overflow: hidden">
                          {{ item.name }}
                        </div>
                      </template>
                    </v-select>
                    <v-checkbox v-model="selection.required" hide-details dense class="requiredButton text-body-2 mt-4"
                      :disabled="[9, 10, 11, 12].includes(selection.type)" @change="changeRequired()">
                      <template v-slot:label>
                        <div class="text-subtitle-2 black--text">
                          {{ $t('label.requiredField') }}
                        </div>
                      </template>
                    </v-checkbox>
                    <v-checkbox v-model="selection.readonly" class="readonlyButton text-body-2 mt-2" hide-details dense
                      :disabled="selection.type === 4 &&
                        selection.dateRange === 'signDay'
                        " @change="changeReadOnly()">
                      <template v-slot:label>
                        <div class="text-subtitle-2 black--text">
                          {{ $t('label.readOnly') }}
                        </div>
                      </template>
                    </v-checkbox>
                  </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel id="formatContainer" :key="1" class="elevation-0">
                  <v-expansion-panel-header color="#f8f9fa" class="text-subtitle-2">{{ $t('heading.format')
                    }}</v-expansion-panel-header>
                  <v-expansion-panel-content color="#f8f9fa">
                    <v-select id="fontFamilySelect" v-model="selection.fontFamily" :items="fontFamilyList"
                      item-text="name" item-value="value" height="32" background-color="white" solo flat single-line
                      hide-details style="max-width: 100%; border: 1px solid #dfe1e6" :menu-props="{
                        auto: true,
                        bottom: true,
                        offsetY: true,
                        zIndex: 200,
                        maxHeight: '100%',
                      }" @change="changeSelectionFont">
                      <template v-slot:[`selection`]="{ item }">
                        <div class="text-body-2 text-truncate" style="max-width: 140px; overflow: hidden">
                          {{ item.name }}
                        </div>
                      </template>
                      <template v-slot:[`item`]="{ item }">
                        <div class="text-body-2 text-truncate" style="max-width: 140px; overflow: hidden">
                          {{ item.name }}
                        </div>
                      </template>
                    </v-select>
                    <v-select id="fontSizeSelect" v-model="selection.fontSize" :items="fontSizeList" item-text="name"
                      item-value="value" height="32" background-color="white" solo flat single-line hide-details
                      style="max-width: 120px; border: 1px solid #dfe1e6" :menu-props="{
                        auto: true,
                        bottom: true,
                        offsetY: true,
                        zIndex: 200,
                        maxHeight: '100%',
                      }" class="mt-2" @change="changeSelectionFont">
                      <template v-slot:[`selection`]="{ item }">
                        <div class="text-body-2 text-truncate" style="max-width: 100px; overflow: hidden">
                          {{ item.name }}
                        </div>
                      </template>
                      <template v-slot:[`item`]="{ item }">
                        <div class="text-body-2 text-truncate" style="max-width: 100px; overflow: hidden">
                          {{ item.name }}
                        </div>
                      </template>
                    </v-select>
                  </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel id="dateFormatContainer" :key="2" class="elevation-0">
                  <v-expansion-panel-header color="#f8f9fa" class="text-subtitle-2">{{ $t('heading.dateFormat')
                    }}</v-expansion-panel-header>
                  <v-expansion-panel-content color="#f8f9fa">
                    <v-select id="dateFormatSelect" v-model="selection.dateFormat" :items="dateFormatListFilter"
                      item-text="name" item-value="name" height="32" background-color="white" solo flat single-line
                      hide-details style="max-width: 100%; border: 1px solid #dfe1e6" :menu-props="{
                        auto: true,
                        bottom: true,
                        offsetY: true,
                        zIndex: 200,
                        maxHeight: '100%',
                      }" @change="changeDateFormat">
                      <template v-slot:[`selection`]="{ item }">
                        <div class="text-body-2 text-truncate" style="max-width: 100px; overflow: hidden">
                          {{ item.name }}
                        </div>
                      </template>
                      <template v-slot:[`item`]="{ item }">
                        <div class="text-body-2 text-truncate" style="max-width: 100px; overflow: hidden">
                          {{ item.name }}
                        </div>
                      </template>
                    </v-select>
                  </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel id="textContainer" :key="3" class="elevation-0">
                  <v-expansion-panel-header color="#f8f9fa" class="text-subtitle-2">{{ $t('heading.textDefault')
                    }}</v-expansion-panel-header>
                  <v-expansion-panel-content color="#f8f9fa">
                    <v-textarea v-if="!selection.singleLine" v-model="selection.text" min-height="80" label=""
                      background-color="white" solo flat hide-details :placeholder="$t('placeholder.addText')"
                      class="text-subtitle-2 text-input" style="max-width: 100%; border: 1px solid #dfe1e6"
                      @input="changeTextarea"></v-textarea>
                    <v-textarea v-else v-model="selection.text" min-height="80" label="" background-color="white" solo
                      flat hide-details :placeholder="$t('placeholder.addText')" class="text-subtitle-2 text-input"
                      style="max-width: 100%; border: 1px solid #dfe1e6" @input="changeTextarea"
                      @keydown.enter.prevent></v-textarea>
                    <div class="d-flex flex-row align-center mt-2">
                      <v-text-field v-model.number="selection.maxlength" type="number" label="" background-color="white"
                        solo flat hide-details class="text-subtitle-2 mr-2"
                        style="max-width: 100px; border: 1px solid #dfe1e6" @keydown.stop
                        @change="changeMaxlength"></v-text-field>
                      <div class="text-subtitle-2">
                        {{ $t('label.charLimit') }}
                      </div>
                    </div>
                  </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel id="checkboxContainer" :key="4" class="elevation-0">
                  <v-expansion-panel-header color="#f8f9fa" class="text-subtitle-2">{{ $t('heading.checkboxValue')
                    }}</v-expansion-panel-header>
                  <v-expansion-panel-content color="#f8f9fa">
                    <template>
                      <div v-for="(item, index) in checkboxGroup" :key="index"
                        class="d-flex flex-row align-center mt-2">
                        <v-checkbox v-model="item.selected" hide-details dense class="mr-2 mt-0"
                          @change="changeCheckboxSelected"></v-checkbox>
                        <v-text-field v-model="item.label" label="" background-color="white" solo flat hide-details
                          maxlength="40" :placeholder="$t('placeholder.addText')" class="text-subtitle-2"
                          style="max-width: 100%; border: 1px solid #dfe1e6" @keydown.stop
                          @focus="focusCheckboxLabel(index)" @blur="blurCheckboxLabel(index)"></v-text-field>
                      </div>
                    </template>
                  </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel id="checkboxRuleContainer" :key="5" class="elevation-0">
                  <v-expansion-panel-header color="#f8f9fa" class="text-subtitle-2">{{
                    $t('heading.checkboxGrpRules')
                  }}</v-expansion-panel-header>
                  <v-expansion-panel-content color="#f8f9fa">
                    <v-select v-model="ruleId" :items="ruleList" item-text="name" item-value="id" height="32"
                      background-color="white" solo flat single-line hide-details
                      style="max-width: 100%; border: 1px solid #dfe1e6" :menu-props="{
                        auto: true,
                        bottom: true,
                        offsetY: true,
                        zIndex: 200,
                        maxHeight: '100%',
                      }" class="mt-2" @change="changeRule">
                      <template v-slot:[`selection`]="{ item }">
                        <div class="text-body-2 text-truncate" style="max-width: 110px; overflow: hidden">
                          {{ item.name }}
                        </div>
                      </template>
                      <template v-slot:[`item`]="{ item }">
                        <div class="text-body-2 text-truncate" style="max-width: 110px; overflow: hidden">
                          {{ item.name }}
                        </div>
                      </template>
                    </v-select>
                    <div v-if="ruleId === 0">
                      <v-select v-model="minimum" :items="Array(checkboxGroup.length + 1)
                          .fill()
                          .map((x, index) => index)
                        " height="32" background-color="white" solo flat single-line hide-details
                        style="max-width: 100%; border: 1px solid #dfe1e6" :menu-props="{
                          auto: true,
                          bottom: true,
                          offsetY: true,
                          zIndex: 200,
                          maxHeight: '100%',
                        }" class="mt-2" @change="setAtLeastRule">
                        <template v-slot:[`selection`]="{ item }">
                          <div class="text-body-2 text-truncate" style="max-width: 100px; overflow: hidden">
                            {{ item }}
                          </div>
                        </template>
                        <template v-slot:[`item`]="{ item }">
                          <div class="text-body-2 text-truncate" style="max-width: 100px; overflow: hidden">
                            {{ item }}
                          </div>
                        </template>
                      </v-select>
                    </div>
                    <div v-else-if="ruleId === 1">
                      <v-select v-model="maximum" :items="Array(checkboxGroup.length)
                          .fill()
                          .map((x, index) => index + 1)
                        " height="32" background-color="white" solo flat single-line hide-details
                        style="max-width: 100%; border: 1px solid #dfe1e6" :menu-props="{
                          auto: true,
                          bottom: true,
                          offsetY: true,
                          zIndex: 200,
                          maxHeight: '100%',
                        }" class="mt-2" @change="setAtMostRule">
                        <template v-slot:[`selection`]="{ item }">
                          <div class="text-body-2 text-truncate" style="max-width: 100px; overflow: hidden">
                            {{ item }}
                          </div>
                        </template>
                        <template v-slot:[`item`]="{ item }">
                          <div class="text-body-2 text-truncate" style="max-width: 100px; overflow: hidden">
                            {{ item }}
                          </div>
                        </template>
                      </v-select>
                    </div>
                    <div v-else-if="ruleId === 2">
                      <v-select v-model="maximum" :items="Array(checkboxGroup.length)
                          .fill()
                          .map((x, index) => index + 1)
                        " height="32" background-color="white" solo flat single-line hide-details
                        style="max-width: 100%; border: 1px solid #dfe1e6" :menu-props="{
                          auto: true,
                          bottom: true,
                          offsetY: true,
                          zIndex: 200,
                          maxHeight: '100%',
                        }" class="mt-2" @change="setExactlyRule">
                        <template v-slot:[`selection`]="{ item }">
                          <div class="text-body-2 text-truncate" style="max-width: 100px; overflow: hidden">
                            {{ item }}
                          </div>
                        </template>
                        <template v-slot:[`item`]="{ item }">
                          <div class="text-body-2 text-truncate" style="max-width: 100px; overflow: hidden">
                            {{ item }}
                          </div>
                        </template>
                      </v-select>
                    </div>
                    <div v-else>
                      <div class="d-flex flex-row align-center mt-2">
                        <div class="text-subtitle-2" style="min-width: 100px">
                          {{ $t('label.minimum') }}
                        </div>
                        <v-select v-model="minimum" :items="Array(checkboxGroup.length + 1)
                            .fill()
                            .map((x, index) => index)
                          " height="32" background-color="white" solo flat single-line hide-details
                          style="max-width: 100%; border: 1px solid #dfe1e6" :menu-props="{
                            auto: true,
                            bottom: true,
                            offsetY: true,
                            zIndex: 200,
                            maxHeight: '100%',
                          }" @change="setRangeRule">
                          <template v-slot:[`selection`]="{ item }">
                            <div class="text-body-2 text-truncate" style="max-width: 100px; overflow: hidden">
                              {{ item }}
                            </div>
                          </template>
                          <template v-slot:[`item`]="{ item }">
                            <div class="text-body-2 text-truncate" style="max-width: 100px; overflow: hidden">
                              {{ item }}
                            </div>
                          </template>
                        </v-select>
                      </div>
                      <div class="d-flex flex-row align-center mt-2">
                        <div class="text-subtitle-2" style="min-width: 100px">
                          {{ $t('label.maximum') }}
                        </div>
                        <v-select v-model="maximum" :items="Array(checkboxGroup.length - minimum + 1)
                            .fill()
                            .map((x, index) => index + minimum)
                          " height="32" background-color="white" solo flat single-line hide-details
                          style="max-width: 100%; border: 1px solid #dfe1e6" :menu-props="{
                            auto: true,
                            bottom: true,
                            offsetY: true,
                            zIndex: 200,
                            maxHeight: '100%',
                          }" @change="setRangeRule">
                          <template v-slot:[`selection`]="{ item }">
                            <div class="text-body-2 text-truncate" style="max-width: 100px; overflow: hidden">
                              {{ item }}
                            </div>
                          </template>
                          <template v-slot:[`item`]="{ item }">
                            <div class="text-body-2 text-truncate" style="max-width: 100px; overflow: hidden">
                              {{ item }}
                            </div>
                          </template>
                        </v-select>
                      </div>
                    </div>
                  </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel id="radioContainer" :key="6" class="elevation-0">
                  <v-expansion-panel-header color="#f8f9fa" class="text-subtitle-2">{{ $t('heading.radioBtnValue')
                    }}</v-expansion-panel-header>
                  <v-expansion-panel-content color="#f8f9fa">
                    <template>
                      <div v-for="(item, index) in radioGroup" :key="index" class="d-flex flex-row align-center mt-2">
                        <v-checkbox v-model="item.selected" hide-details dense class="mr-2 mt-0"
                          @change="changeRadioSelected(item)"></v-checkbox>
                        <v-text-field v-model="item.label" label="" background-color="white" solo flat hide-details
                          maxlength="40" :placeholder="$t('placeholder.addText')" class="text-subtitle-2"
                          style="max-width: 100%; border: 1px solid #dfe1e6" @keydown.stop
                          @focus="focusRadioLabel(index)" @blur="blurRadioLabel(index)"></v-text-field>
                      </div>
                    </template>
                  </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel id="dropdownContainer" :key="7" class="elevation-0">
                  <v-expansion-panel-header color="#f8f9fa" class="text-subtitle-2">{{ $t('heading.options')
                    }}</v-expansion-panel-header>
                  <v-expansion-panel-content color="#f8f9fa">
                    <template v-for="(item, index) in selection.options">
                      <div :key="index" class="d-flex flex-row align-center mt-2">
                        <v-text-field v-model="item.name" label="" background-color="white" solo flat hide-details
                          maxlength="40" :placeholder="$t('placeholder.addText')" class="text-subtitle-2"
                          style="max-width: 100%; border: 1px solid #dfe1e6" @keydown.stop @input="checkOptionWidth"
                          @change="changeSelectOption"></v-text-field>
                        <v-icon medium class="ml-4" @click="deleteSelectionOption(item.id)">
                          mdi-close
                        </v-icon>
                      </div>
                    </template>
                    <v-btn color="black" text class="mt-2" @click="addSelectionOption()">
                      <v-icon left> mdi-plus </v-icon>
                      {{ $t('button.addOption') }}
                    </v-btn>
                    <v-subheader class="text-body-2 mt-2">{{
                      $t('heading.defaultValue')
                    }}</v-subheader>
                    <v-select v-model="selection.selectOptionId" :items="selectionOptions" item-text="name"
                      item-value="id" height="32" background-color="white" solo flat single-line hide-details
                      style="max-width: 100%; border: 1px solid #dfe1e6" :menu-props="{
                        auto: true,
                        bottom: true,
                        offsetY: true,
                        zIndex: 200,
                        maxHeight: '100%',
                      }" @change="changeSelectOptionId">
                      <template v-slot:[`selection`]="{ item }">
                        <div class="text-body-2 text-truncate">
                          {{ item.name }}
                        </div>
                      </template>
                      <template v-slot:[`item`]="{ item }">
                        <div class="text-body-2 text-truncate" style="max-width: 160px">
                          {{ item.name }}
                        </div>
                      </template>
                    </v-select>
                  </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel id="validationContainer" :key="8" class="elevation-0">
                  <v-expansion-panel-header color="#f8f9fa" class="text-subtitle-2">{{ $t('heading.verification')
                    }}</v-expansion-panel-header>
                  <v-expansion-panel-content v-if="selection.validation" color="#f8f9fa">
                    <v-select id="validationSelect" v-model="selection.validation.type" :items="validationList"
                      item-text="name" item-value="value" height="32" background-color="white" solo flat single-line
                      hide-details style="max-width: 100%; border: 1px solid #dfe1e6" :menu-props="{
                        auto: true,
                        bottom: true,
                        offsetY: true,
                        zIndex: 200,
                        maxHeight: '100%',
                      }" @change="changeValidation">
                      <template v-slot:[`selection`]="{ item }">
                        <div class="text-body-2 text-truncate" style="max-width: 100px; overflow: hidden">
                          {{ item.name }}
                        </div>
                      </template>
                      <template v-slot:[`item`]="{ item }">
                        <div class="text-body-2 text-truncate" style="max-width: 100px; overflow: hidden">
                          {{ item.name }}
                        </div>
                      </template>
                    </v-select>
                    <div v-if="
                      selection.validation.type &&
                      selection.validation.type === 'custom'
                    " class="d-flex flex-column mt-4">
                      <div class="text-subtitle-2 mb-2" style="min-width: 100px">
                        {{ $t('label.regex') }}
                      </div>
                      <v-text-field v-model="selection.validation.regex" autocapitalize="none" label=""
                        background-color="white" solo flat hide-details class="text-subtitle-2"
                        style="max-width: 100%; border: 1px solid #dfe1e6" :placeholder="$t('placeholder.regexExample')"
                        @keydown.stop @change="changeValidation"></v-text-field>
                      <div class="text-subtitle-2 my-2" style="min-width: 100px">
                        {{ $t('label.errorMessage') }}
                      </div>
                      <v-text-field v-model="selection.validation.errorMessage" label="" background-color="white" solo
                        flat hide-details maxlength="40" class="text-subtitle-2"
                        style="max-width: 100%; border: 1px solid #dfe1e6"
                        :placeholder="$t('placeholder.errorMsgExample')" @keydown.stop
                        @change="changeValidation"></v-text-field>
                    </div>
                  </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel id="dateEraContainer" :key="9" class="elevation-0">
                  <v-expansion-panel-header color="#f8f9fa" class="text-subtitle-2">{{ $t('heading.dateEra')
                    }}</v-expansion-panel-header>
                  <v-expansion-panel-content color="#f8f9fa">
                    <v-select id="dateEraSelect" v-model="selection.dateEra" :items="dateEraList" item-text="name"
                      item-value="value" height="32" background-color="white" solo flat single-line hide-details
                      style="max-width: 100%; border: 1px solid #dfe1e6" :menu-props="{
                        auto: true,
                        bottom: true,
                        offsetY: true,
                        zIndex: 200,
                        maxHeight: '100%',
                      }" @change="changeDateEra">
                      <template v-slot:[`selection`]="{ item }">
                        <div class="text-body-2 text-truncate" style="max-width: 100px; overflow: hidden">
                          {{ item.name }}
                        </div>
                      </template>
                      <template v-slot:[`item`]="{ item }">
                        <div class="text-body-2 text-truncate" style="max-width: 100px; overflow: hidden">
                          {{ item.name }}
                        </div>
                      </template>
                    </v-select>
                  </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel id="dateRangeContainer" :key="10" class="elevation-0">
                  <v-expansion-panel-header color="#f8f9fa" class="text-subtitle-2">{{ $t('heading.dateRange')
                    }}</v-expansion-panel-header>
                  <v-expansion-panel-content color="#f8f9fa">
                    <v-radio-group id="dateRangeSelect" v-model="selection.dateRange" column class="mt-0"
                      @change="changeDateRange">
                      <v-radio v-for="(item, index) in dateRangeList" :key="index" class="mt-1" :label="item.name"
                        :value="item.value"></v-radio>
                    </v-radio-group>
                  </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel id="dateTextContainer" :key="11" class="elevation-0">
                  <v-expansion-panel-header color="#f8f9fa" class="text-subtitle-2">{{ $t('heading.dateDeflt')
                    }}</v-expansion-panel-header>
                  <v-expansion-panel-content color="#f8f9fa">
                    <v-dialog ref="dateDialog" v-model="dateDialog" :close-on-content-click="false"
                      :return-value.sync="selection.text" max-width="290px" min-width="auto">
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field id="dateText" v-model="formatDateValue" :label="$t('label.date')" v-bind="attrs"
                          readonly background-color="white" solo flat hide-details maxlength="40"
                          class="text-subtitle-2" style="max-width: 100%; border: 1px solid #dfe1e6"
                          :disabled="selection.dateRange === 'signDay'" v-on="on">
                          <template v-slot:prepend>
                            <v-icon size="22"> mdi-calendar </v-icon>
                          </template>
                        </v-text-field>
                      </template>
                      <v-date-picker v-if="selection.type === 4" v-model="selection.text" color="primaryCustom"
                        :locale="$i18n.locale" scrollable :allowed-dates="getAllowedDates"
                        :disabled="selection.dateRange === 'signDay'" style="z-index: 70">
                        <v-spacer></v-spacer>
                        <v-btn text color="primaryCustom" @click="clearDateValue">
                          {{ $t('button.clear') }}
                        </v-btn>
                        <v-btn text color="primaryCustom" @click="changeDateValue">
                          {{ $t('button.confirm') }}
                        </v-btn>
                      </v-date-picker>
                    </v-dialog>
                  </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel id="uploadAttachmentContainer" :key="12" class="elevation-0">
                  <v-expansion-panel-header color="#f8f9fa" class="text-subtitle-2">{{ $t('heading.uploadAttach')
                    }}</v-expansion-panel-header>
                  <v-expansion-panel-content color="#f8f9fa">
                    <v-btn outlined color="#D8D8D8" width="190" height="44" @click="prefillAttachment(selection)"><span
                        style="color: black">{{
                          $t('button.uploadFile')
                        }}</span></v-btn>
                  </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel id="labelContainer" :key="13" class="elevation-0">
                  <v-expansion-panel-header color="#f8f9fa" class="text-subtitle-2">{{ $t('heading.label')
                    }}</v-expansion-panel-header>
                  <v-expansion-panel-content color="#f8f9fa">
                    <v-text-field v-model="selection.label" label="" background-color="white" solo flat hide-details
                      maxlength="40" class="text-subtitle-2" style="max-width: 100%; border: 1px solid #dfe1e6"
                      @keydown.stop @change="changeLabel"></v-text-field>
                  </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel id="groupLabelContainer" :key="14" class="elevation-0">
                  <v-expansion-panel-header color="#f8f9fa" class="text-subtitle-2">{{ $t('heading.groupLabel')
                    }}</v-expansion-panel-header>
                  <v-expansion-panel-content color="#f8f9fa">
                    <v-text-field v-model="selection.groupLabel" label="" background-color="white" solo flat
                      hide-details maxlength="40" class="text-subtitle-2"
                      style="max-width: 100%; border: 1px solid #dfe1e6" @keydown.stop
                      @change="changeGroupLabel"></v-text-field>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-list>
          </div>
        </div>
      </div>
    </v-navigation-drawer>

    <!-- mode 4 right streaming -->
    <v-navigation-drawer v-if="mode === 4" id="rightDrawerContainer" v-model="streamingDrawer" :clipped="true" absolute
      :mobile-breakpoint="$vuetify.breakpoint.thresholds.xs" app right width="200" color="#f8f9fa" touchless floating
      hide-overlay class="streamingDrawer">
      <div id="streamContainer" class="streamContainer">
        <div style="
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
          ">
          <div class="d-flex flex-column">
            <div class="videoContainer mt-6">
              <video v-show="videoParams.isRemoteVideoEnabled" id="remote-video" ref="remoteVideo" class="videoContent"
                autoplay playsinline></video>
              <div v-show="!videoParams.isRemoteVideoEnabled" id="remote-video-cover" ref="remoteVideoCover"
                class="videoCover">
                <v-icon color="white">mdi-video-off</v-icon>
              </div>
              <div v-if="videoParams.remoteName" class="videoNameChip">
                {{ videoParams.remoteName }}
              </div>
            </div>
          </div>
          <v-spacer></v-spacer>
          <div class="d-flex flex-column">
            <div class="videoContainer">
              <video v-show="videoParams.isEnabledVideo &&
                videoParams.isUseCamera &&
                !videoParams.isNoCamera
                " id="local-video" ref="localVideo" class="videoContent" autoplay playsinline muted />
              <div v-show="!videoParams.isEnabledVideo ||
                !videoParams.isUseCamera ||
                videoParams.isNoCamera
                " id="local-video-cover" ref="localVideoCover" class="videoCover">
                <v-icon color="white">mdi-video-off</v-icon>
              </div>
              <div v-if="videoParams.localName" class="videoNameChip">
                {{ videoParams.localName }}
              </div>
            </div>
            <div class="streamSettingContainer mt-6 mb-4">
              <v-btn v-if="videoParams.isEnabledAudio" color="#009149" class="streamSettingBtn"
                @click="onEnabledAudio(false)">
                <div class="stream-microphone-on"></div>
              </v-btn>
              <v-btn v-else-if="!videoParams.isEnabledAudio" color="#D9E1DE" class="streamSettingBtn"
                @click="onEnabledAudio(true)">
                <div class="stream-microphone-off"></div>
              </v-btn>
              <v-btn v-if="videoParams.isEnabledVideo" color="#009149" class="streamSettingBtn d-none" :disabled="true"
                @click="onEnabledVideo(false)">
                <div class="stream-camera-on"></div>
              </v-btn>
              <v-btn v-else-if="!videoParams.isEnabledVideo" color="#D9E1DE" class="streamSettingBtn d-none"
                :disabled="videoParams.isNoCamera" @click="onEnabledVideo(true)">
                <v-icon size="22">mdi-video-off</v-icon>
              </v-btn>
              <v-btn outlined color="#D9E1DE" class="streamSettingBtn" @click="setStreamSettingDialog">
                <div class="stream-setting"></div>
              </v-btn>
              <v-btn color="#F56B4E" class="streamSettingBtn d-none" @click="onHangup">
                <div class="stream-hang-up"></div>
              </v-btn>
            </div>
          </div>
        </div>
      </div>
    </v-navigation-drawer>

    <!-- mode 4 left drawing tool bar  -->
    <div v-if="mode === 4" id="drawingToolBarContainer" class="d-flex flex-column" style="
        height: 100%;
        top: 48px;
        width: 65px;
        max-height: calc(100% - 48px);
        background-color: rgb(255, 255, 255);
        position: absolute;
        box-shadow: 0px 3px 6px #00000029;
      " :style="{
        'z-index': $vuetify.breakpoint.mdAndDown ? 198 : 200,
        visibility:
          (mode === 4 && control === 0 && role === 'HOST') ||
            (mode === 4 && control === 1 && role === 'SIGNER')
            ? 'visible'
            : 'hidden',
      }" @click="listenDrawToolToggle">
      <v-btn-toggle v-model="drawToolToggle" mandatory style="display: flex; flex-direction: column">
        <!-- pointer -->
        <tippy>
          <template v-slot:trigger>
            <v-btn id="pointer" text :value="1" color="primaryCustom" class="toolbarButton draw-tool1">
            </v-btn>
          </template>
          <span>
            <span style="font-size: 12px; color: white">{{
              $t('tooltip.pointer')
            }}</span>
          </span>
        </tippy>
        <!-- pointer option  -->
        <v-btn-toggle v-show="drawToolToggle === 1 && showPanel" id="optionPanel1" v-model="pointerOptionToggle"
          class="option-panel" mandatory>
          <tippy>
            <template v-slot:trigger>
              <v-btn id="pointer1" text :value="1" color="primaryCustom" class="toolbarButton draw-tool1-1"
                @click="setIsAllowTouchScrolling(false)">
              </v-btn>
            </template>
            <span>
              <span style="font-size: 12px; color: white">{{
                $t('tooltip.pointerSelector')
              }}</span>
            </span>
          </tippy>
          <tippy>
            <template v-slot:trigger>
              <v-btn id="pointer2" text :value="2" color="primaryCustom" class="toolbarButton draw-tool1-2"
                @click="setIsAllowTouchScrolling(true)">
              </v-btn>
            </template>
            <span>
              <span style="font-size: 12px; color: white">{{
                $t('tooltip.pointerGrab')
              }}</span>
            </span>
          </tippy>
        </v-btn-toggle>
        <!-- pen -->
        <tippy>
          <template v-slot:trigger>
            <v-btn id="draw" text :value="2" color="primaryCustom" class="toolbarButton draw-tool2">
            </v-btn>
          </template>
          <span>
            <span style="font-size: 12px; color: white">{{
              $t('tooltip.drawingTool')
            }}</span>
          </span>
        </tippy>
        <!-- pen option  -->
        <v-btn-toggle v-show="drawToolToggle === 2 && showPanel" id="optionPanel2" v-model="penOptionToggle"
          class="option-panel" mandatory>
          <tippy>
            <template v-slot:trigger>
              <v-btn id="pen1" text :value="1" color="primaryCustom" class="toolbarButton draw-tool2-1">
              </v-btn>
            </template>
            <span>
              <span style="font-size: 12px; color: white">{{
                $t('tooltip.pen')
              }}</span>
            </span>
          </tippy>
          <tippy>
            <template v-slot:trigger>
              <v-btn id="pen2" text :value="2" color="primaryCustom" class="toolbarButton draw-tool2-2">
              </v-btn>
            </template>
            <span>
              <span style="font-size: 12px; color: white">{{
                $t('tooltip.highlighter')
              }}</span>
            </span>
          </tippy>
        </v-btn-toggle>
        <!-- text box -->
        <tippy>
          <template v-slot:trigger>
            <v-btn id="annotateBtn92" text :value="3" class="toolbarButton draw-tool3" color="primaryCustom"
              @click="addAnnotateMB(92)">
            </v-btn>
          </template>
          <span>
            <span style="font-size: 12px; color: white">{{
              $t('tooltip.textDrawing')
            }}</span>
          </span>
        </tippy>
        <!-- eraser -->
        <tippy>
          <template v-slot:trigger>
            <v-btn id="eraser-draw" text :value="4" color="primaryCustom" class="toolbarButton draw-tool4">
            </v-btn>
          </template>
          <span>
            <span style="font-size: 12px; color: white">{{
              $t('tooltip.deleteTool')
            }}</span>
          </span>
        </tippy>
        <!-- geometry -->
        <tippy>
          <template v-slot:trigger>
            <v-btn id="annotateBtn91" text :value="5" class="toolbarButton draw-tool5" color="primaryCustom">
            </v-btn>
          </template>
          <span>
            <span style="font-size: 12px; color: white">{{
              $t('tooltip.geometricDrawing')
            }}</span>
          </span>
        </tippy>
        <!-- geometry option  -->
        <v-btn-toggle v-show="drawToolToggle === 5 && showPanel" id="optionPanel5" v-model="geometryOptionToggle"
          class="option-panel" mandatory>
          <tippy>
            <template v-slot:trigger>
              <v-btn id="geometry1" text :value="1" color="primaryCustom" class="toolbarButton draw-tool5-1">
              </v-btn>
            </template>
            <span>
              <span style="font-size: 12px; color: white">{{
                $t('tooltip.rectangle')
              }}</span>
            </span>
          </tippy>
          <tippy>
            <template v-slot:trigger>
              <v-btn id="geometry2" text :value="2" color="primaryCustom" class="toolbarButton draw-tool5-2">
              </v-btn>
            </template>
            <span>
              <span style="font-size: 12px; color: white">{{
                $t('tooltip.circle')
              }}</span>
            </span>
          </tippy>
        </v-btn-toggle>
        <!-- line -->
        <tippy>
          <template v-slot:trigger>
            <v-btn id="annotateBtn94" text :value="6" class="toolbarButton draw-tool6" color="primaryCustom">
            </v-btn>
          </template>
          <span>
            <span style="font-size: 12px; color: white">{{
              $t('tooltip.lineDrawing')
            }}</span>
          </span>
        </tippy>
      </v-btn-toggle>
      <v-btn-toggle v-model="drawOptionToggle" style="display: flex; flex-direction: column">
        <!-- color picker  -->
        <tippy v-show="!disableSelectColor">
          <template v-slot:trigger>
            <v-btn text :value="7" class="toolbarButton draw-tool7" color="primaryCustom"
              :disabled="disableSelectColor">
            </v-btn>
            <div class="draw-tool7-inner" :value="7" :style="{
              'background-color': disableSelectColor
                ? '#777777'
                : drawToolBarColor,
              cursor: disableSelectColor ? 'auto' : 'pointer',
            }" :disabled="disableSelectColor"></div>
          </template>
          <span>
            <span style="font-size: 12px; color: white">{{
              $t('tooltip.colorPicker')
            }}</span>
          </span>
        </tippy>
        <div v-show="drawOptionToggle === 7 && showOptionPanel" id="optionPanel7" class="option-panel"
          style="padding: 9px">
          <p class="option-panel-title">{{ $t('text.color') }}</p>
          <div class="color" style="margin: unset">
            <div v-for="(row, index) in colorArr" :key="'row' + index" class="d-flex">
              <div v-for="(color, idx) in row" :key="'color' + idx" style="width: 25px; height: 25px; cursor: pointer"
                :style="{ 'background-color': color }"></div>
            </div>
          </div>
        </div>
        <!-- thickness select -->
        <tippy v-show="!disableSelectWidth">
          <template v-slot:trigger>
            <v-btn text :value="8" class="toolbarButton draw-tool8" color="primaryCustom"
              :disabled="disableSelectWidth">
            </v-btn>
          </template>
          <span>
            <span style="font-size: 12px; color: white">{{
              $t('tooltip.thickness')
            }}</span>
          </span>
        </tippy>
        <div v-show="drawOptionToggle === 8 && showOptionPanel" id="optionPanel8" class="option-panel"
          style="padding: 9px">
          <p class="option-panel-title" style="margin: 0">
            {{ $t('text.thickness') }}
          </p>
          <v-slider v-model="drawToolBarWidth" class="thickness-bar" :label="drawToolBarWidth + $t('text.point')"
            inverse-label dense hide-details :step="drawToolToggle !== 6 && drawToolToggle !== 5 ? 2 : 1"
            :max="drawToolToggle === 6 || drawToolToggle === 5 ? 10 : 60"
            :min="drawToolToggle === 6 || drawToolToggle === 5 ? 1 : 2" track-color="#eeeeee"
            style="width: 100%; margin-top: -5px" @change="showDrawOptionPanel"></v-slider>
        </div>
        <!-- text size select -->
        <tippy v-show="!disableSelectSize">
          <template v-slot:trigger>
            <v-btn text :value="9" class="toolbarButton draw-tool9" color="primaryCustom" :disabled="disableSelectSize">
            </v-btn>
          </template>
          <span>
            <span style="font-size: 12px; color: white">{{
              $t('tooltip.fontSize')
            }}</span>
          </span>
        </tippy>
        <v-btn-toggle v-show="drawOptionToggle === 9 && showOptionPanel" id="optionPanel9" v-model="selectedWidth.text"
          mandatory class="option-panel">
          <v-btn v-for="(item, index) in textSizeOptions" :key="item.label" text :value="item.value"
            color="primaryCustom" class="toolbarButton" :style="{
              'font-size':
                index === 0
                  ? '50px'
                  : index === 1
                    ? '40px'
                    : index === 2
                      ? '30px'
                      : index === 3
                        ? '20px'
                        : '14px',
              height:
                index === 0
                  ? '28%'
                  : index === 1
                    ? '24%'
                    : index === 2
                      ? '20%'
                      : index === 3
                        ? '16%'
                        : '12%',
            }">{{ item.label }}
          </v-btn>
        </v-btn-toggle>
      </v-btn-toggle>
      <v-spacer></v-spacer>
    </div>

    <!-- mode 1 top drawing tool bar  -->
    <v-slide-y-transition v-if="mode === 1">
      <div v-show="showDrawTool" id="drawingToolBarContainerRow" class="align-center white" style="
          display: flex;
          top: 48px;
          width: 100%;
          height: 50px;
          position: absolute;
          box-shadow: 0px 3px 6px #00000029;
          z-index: 41;
        " @click="listenDrawToolToggle">
        <v-spacer></v-spacer>
        <v-btn-toggle v-model="drawToolToggle" mandatory class="d-flex">
          <!-- pointer -->
          <tippy>
            <template v-slot:trigger>
              <v-btn id="pointer" text :value="1" color="primaryCustom" class="toolbarButton draw-tool1-1 draw-tool1"
                @click="setIsAllowTouchScrolling(false)">
              </v-btn>
            </template>
            <span>
              <span style="font-size: 12px; color: white">{{
                $t('tooltip.pointer')
              }}</span>
            </span>
          </tippy>
          <!-- pointer option  -->
          <!-- <v-btn-toggle
            v-show="drawToolToggle === 1 && showPanel"
            id="optionPanel1"
            v-model="pointerOptionToggle"
            class="option-panel-row"
            mandatory
          >
            <tippy>
              <template v-slot:trigger>
                <v-btn
                  id="pointer1"
                  text
                  :value="1"
                  color="primaryCustom"
                  class="toolbarButton draw-tool1-1"
                  @click="setIsAllowTouchScrolling(false)"
                >
                </v-btn>
              </template>
              <span>
                <span style="font-size: 12px; color: white">{{
                  $t('tooltip.pointerSelector')
                }}</span>
              </span>
            </tippy>
            <tippy>
              <template v-slot:trigger>
                <v-btn
                  id="pointer2"
                  text
                  :value="2"
                  color="primaryCustom"
                  class="toolbarButton draw-tool1-2"
                  @click="setIsAllowTouchScrolling(true)"
                >
                </v-btn>
              </template>
              <span>
                <span style="font-size: 12px; color: white">{{
                  $t('tooltip.pointerGrab')
                }}</span>
              </span>
            </tippy>
          </v-btn-toggle> -->
          <!-- pen -->
          <tippy>
            <template v-slot:trigger>
              <v-btn id="draw" text :value="2" color="primaryCustom" class="toolbarButton draw-tool2">
              </v-btn>
            </template>
            <span>
              <span style="font-size: 12px; color: white">{{
                $t('tooltip.drawingTool')
              }}</span>
            </span>
          </tippy>
          <!-- pen option  -->
          <v-btn-toggle v-show="drawToolToggle === 2 && showPanel" id="optionPanel2" v-model="penOptionToggle"
            class="option-panel-row" mandatory>
            <tippy>
              <template v-slot:trigger>
                <v-btn id="pen1" text :value="1" color="primaryCustom" class="toolbarButton draw-tool2-1">
                </v-btn>
              </template>
              <span>
                <span style="font-size: 12px; color: white">{{
                  $t('tooltip.pen')
                }}</span>
              </span>
            </tippy>
            <tippy>
              <template v-slot:trigger>
                <v-btn id="pen2" text :value="2" color="primaryCustom" class="toolbarButton draw-tool2-2">
                </v-btn>
              </template>
              <span>
                <span style="font-size: 12px; color: white">{{
                  $t('tooltip.highlighter')
                }}</span>
              </span>
            </tippy>
          </v-btn-toggle>
          <!-- text box -->
          <tippy>
            <template v-slot:trigger>
              <v-btn id="annotateBtn92" text :value="3" class="toolbarButton draw-tool3" color="primaryCustom"
                @click="addAnnotateMB(92)">
              </v-btn>
            </template>
            <span>
              <span style="font-size: 12px; color: white">{{
                $t('tooltip.textDrawing')
              }}</span>
            </span>
          </tippy>
          <!-- eraser -->
          <tippy>
            <template v-slot:trigger>
              <v-btn id="eraser-draw" text :value="4" color="primaryCustom" class="toolbarButton draw-tool4">
              </v-btn>
            </template>
            <span>
              <span style="font-size: 12px; color: white">{{
                $t('tooltip.deleteTool')
              }}</span>
            </span>
          </tippy>
          <!-- geometry -->
          <tippy>
            <template v-slot:trigger>
              <v-btn id="annotateBtn91" text :value="5" class="toolbarButton draw-tool5" color="primaryCustom">
              </v-btn>
            </template>
            <span>
              <span style="font-size: 12px; color: white">{{
                $t('tooltip.geometricDrawing')
              }}</span>
            </span>
          </tippy>
          <!-- geometry option  -->
          <v-btn-toggle v-show="drawToolToggle === 5 && showPanel" id="optionPanel5" v-model="geometryOptionToggle"
            class="option-panel-row" mandatory>
            <tippy>
              <template v-slot:trigger>
                <v-btn id="geometry1" text :value="1" color="primaryCustom" class="toolbarButton draw-tool5-1">
                </v-btn>
              </template>
              <span>
                <span style="font-size: 12px; color: white">{{
                  $t('tooltip.rectangle')
                }}</span>
              </span>
            </tippy>
            <tippy>
              <template v-slot:trigger>
                <v-btn id="geometry2" text :value="2" color="primaryCustom" class="toolbarButton draw-tool5-2">
                </v-btn>
              </template>
              <span>
                <span style="font-size: 12px; color: white">{{
                  $t('tooltip.circle')
                }}</span>
              </span>
            </tippy>
          </v-btn-toggle>
          <!-- line -->
          <tippy>
            <template v-slot:trigger>
              <v-btn id="annotateBtn94" text :value="6" class="toolbarButton draw-tool6" color="primaryCustom">
              </v-btn>
            </template>
            <span>
              <span style="font-size: 12px; color: white">{{
                $t('tooltip.lineDrawing')
              }}</span>
            </span>
          </tippy>
        </v-btn-toggle>
        <v-btn-toggle v-model="drawOptionToggle" class="drawTool-optionPanel" style="display: flex">
          <!-- color picker  -->
          <tippy v-show="!disableSelectColor">
            <template v-slot:trigger>
              <v-btn text :value="7" class="toolbarButton draw-tool7" color="primaryCustom"
                :disabled="disableSelectColor">
                <div class="draw-tool7-inner draw-tool7" :style="{
                  'background-color': disableSelectColor
                    ? '#777777'
                    : drawToolBarColor,
                  cursor: disableSelectColor ? 'auto' : 'pointer',
                }" :value="7" :disabled="disableSelectColor"
                  @click="; (showOptionPanel = true), (drawOptionToggle = 7)"></div>
              </v-btn>
            </template>
            <span>
              <span style="font-size: 12px; color: white">{{
                $t('tooltip.colorPicker')
              }}</span>
            </span>
          </tippy>
          <div v-show="drawOptionToggle === 7 && showOptionPanel" id="optionPanel7" class="option-panel-row"
            style="padding: 9px">
            <p class="option-panel-title">{{ $t('text.color') }}</p>
            <div class="color" style="margin: unset">
              <div v-for="(row, index) in colorArr" :key="'row' + index" class="d-flex">
                <div v-for="(color, idx) in row" :key="'color' + idx" style="width: 25px; height: 25px; cursor: pointer"
                  :style="{ 'background-color': color }"></div>
              </div>
            </div>
          </div>
          <!-- thickness select -->
          <tippy v-show="!disableSelectWidth">
            <template v-slot:trigger>
              <v-btn text :value="8" class="toolbarButton draw-tool8" color="primaryCustom"
                :disabled="disableSelectWidth">
              </v-btn>
            </template>
            <span>
              <span style="font-size: 12px; color: white">{{
                $t('tooltip.thickness')
              }}</span>
            </span>
          </tippy>
          <div v-show="drawOptionToggle === 8 && showOptionPanel" id="optionPanel8" class="option-panel-row">
            <p class="option-panel-title" style="margin: 0">
              {{ $t('text.thickness') }}
            </p>
            <v-slider v-model="drawToolBarWidth" class="thickness-bar" :label="drawToolBarWidth + $t('text.point')"
              inverse-label dense hide-details :step="drawToolToggle !== 6 && drawToolToggle !== 5 ? 2 : 1"
              :max="drawToolToggle === 6 || drawToolToggle === 5 ? 10 : 60"
              :min="drawToolToggle === 6 || drawToolToggle === 5 ? 1 : 2" track-color="#eeeeee"
              style="width: 100%; margin-top: -5px" @change="showDrawOptionPanel"></v-slider>
          </div>
          <!-- text size select -->
          <tippy v-show="!disableSelectSize">
            <template v-slot:trigger>
              <v-btn text :value="9" class="toolbarButton draw-tool9" color="primaryCustom"
                :disabled="disableSelectSize">
              </v-btn>
            </template>
            <span>
              <span style="font-size: 12px; color: white">{{
                $t('tooltip.fontSize')
              }}</span>
            </span>
          </tippy>
          <v-btn-toggle v-show="drawOptionToggle === 9 && showOptionPanel" id="optionPanel9"
            v-model="selectedWidth.text" mandatory class="option-panel-row">
            <v-btn v-for="(item, index) in textSizeOptions" :key="item.label" text :value="item.value"
              color="primaryCustom" class="toolbarButton" :style="{
                'font-size':
                  index === 0
                    ? '50px'
                    : index === 1
                      ? '40px'
                      : index === 2
                        ? '30px'
                        : index === 3
                          ? '20px'
                          : '14px',
                height:
                  index === 0
                    ? '28%'
                    : index === 1
                      ? '24%'
                      : index === 2
                        ? '20%'
                        : index === 3
                          ? '16%'
                          : '12%',
              }">{{ item.label }}
            </v-btn>
          </v-btn-toggle>
        </v-btn-toggle>
        <v-spacer></v-spacer>
      </div>
    </v-slide-y-transition>

    <!-- mode 1 right commnet  -->
    <v-navigation-drawer v-if="mode === 1 || mode === 3" id="rightDrawerContainer" v-model="commentDrawer"
      :clipped="true" :absolute="!$vuetify.breakpoint.mdAndDown" :fixed="$vuetify.breakpoint.mdAndDown" app right
      width="240" color="#f8f9fa" touchless floating hide-overlay class="commentDrawer"
      style="height: 100%; border-left: 1px solid #e0e0e0; z-index: 200">
      <v-card v-if="mode === 1" class="ma-2">
        <v-textarea v-model="newComment" name="input-7-1" solo :label="$t('label.createComment')" auto-grow
          background-color="white" class="mt-7 comment-input" :counter="400"></v-textarea>
        <v-slide-y-transition>
          <v-card-actions v-show="newComment && newComment.length > 0" style="background-color: #f8f9fa">
            <v-spacer></v-spacer>
            <v-btn color="gray" small text class="mr-2" @click="newComment = ''">
              {{ $t('button.cancel') }}
            </v-btn>
            <v-btn color="primary" depressed small :disabled="newComment.length > 400" @click="addComment">
              {{ $t('button.add') }}
            </v-btn>
          </v-card-actions>
        </v-slide-y-transition>
      </v-card>
      <v-expansion-panels multiple class="pdfAnnotation-panel" tile>
        <v-expansion-panel v-for="(page, index) in commentAnnotations[selectedFile - 1]" v-show="page.length > 0"
          :key="index">
          <v-expansion-panel-header>
            <div>{{ $t('message.pageX').replace('{page}', index + 1) }}</div>
            <!-- <v-spacer></v-spacer>
            <div
              class="flex-grow-0 mr-2 white--text"
              style="
                background-color: #009149;
                padding: 5px;
                width: 25px;
                border-radius: 50%;
                height: 25px;
                text-align: center;
              "
            >
              {{ page.length }}
            </div> -->
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <template v-for="(anno, i) in page">
              <!-- predecessors add -->
              <v-card v-if="anno.annotationType" :key="'pdfAnnotations_' + i" class="pdfAnnotation"
                @click="jumpPdfAnnotation(anno)">
                <v-card-subtitle class="font-weight-bold d-flex">
                  <v-avatar :color="anno.color
                      ? `rgba(${anno.color[0]},
                    ${anno.color[1]},
                    ${anno.color[2]},
                    0.3)`
                      : `rgba(0,0,0,0.3)`
                    " width="40" min-width="40" height="40" class="my-auto ml-0 mr-2">
                    <img src="/icon/comment.svg" alt="comment-person" style="object-fit: none" />
                  </v-avatar>
                  <div class="text-caption" style="line-break: anywhere">
                    <span>{{ anno.titleObj.str }}</span>
                    <br />
                    <span>
                      {{ anno.modificationDateString }}
                    </span>
                  </div>
                </v-card-subtitle>
                <v-card-text class="pb-7">
                  {{ anno.contentsObj.str }}
                </v-card-text>
              </v-card>
              <!-- self add -->
              <v-card v-else :key="'pdfAnnotations_self_' + i" class="pdfAnnotation" @click="jumpPdfAnnotation(anno)">
                <v-card-subtitle class="font-weight-bold d-flex">
                  <v-avatar :color="anno.color || `rgba(0,0,0,0.3)`" width="40" min-width="40" height="40"
                    class="my-auto ml-0 mr-2 overflow-visible">
                    <img src="/icon/comment.svg" alt="comment-person" style="object-fit: none" />
                    <div style="
                        position: absolute;
                        bottom: -5px;
                        right: -5px;
                        background-color: #009149;
                        color: white;
                        width: 20px;
                        height: 20px;
                        border-radius: 50px;
                        text-align: center;
                      ">
                      {{ anno.id + 1 }}
                    </div>
                  </v-avatar>
                  <div class="text-caption" style="line-break: anywhere">
                    <span>{{ anno.user }}</span>
                    <br />
                    <span>
                      {{ anno.createDate }}
                    </span>
                  </div>
                  <v-menu offset-y z-index="200">
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn class="my-auto" icon v-bind="attrs" v-on="on"><v-icon>mdi-dots-horizontal</v-icon></v-btn>
                    </template>
                    <v-list style="cursor: pointer">
                      <v-list-item v-for="(action, j) in commentOptionMenu" :key="'commentOptionMenu_' + j"
                        @click="commentAction(action.func, anno.id)">
                        <v-list-item-title>{{
                          action.title
                        }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </v-card-subtitle>
                <v-card-text class="pb-7">
                  <v-textarea v-model="anno.content" name="input-7-1" outlined solo auto-grow hide-details dense
                    class="mt-7 comment-input" @click.stop></v-textarea>
                </v-card-text>

                <!-- <div
                  class="d-flex"
                  style="position: absolute; bottom: 0; right: 5px"
                >
                  <v-icon> mdi-note-text-outline </v-icon
                  ><span class="pt-1">{{ anno.id + 1 }}</span>
                </div> -->
              </v-card>
            </template>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-navigation-drawer>

    <v-navigation-drawer v-if="mode === 1 || mode === 3" id="rightDrawerContainer" v-model="attachmentDrawer"
      :clipped="true" :absolute="!$vuetify.breakpoint.mdAndDown" :fixed="$vuetify.breakpoint.mdAndDown" app right
      width="240" color="#f8f9fa" touchless floating hide-overlay class="attachmentDrawer"
      style="height: 100%; border-left: 1px solid #e0e0e0; z-index: 200">
      <v-expansion-panels multiple class="pdfAnnotation-panel" tile>
        <v-expansion-panel v-for="(page, index) in attachmentAnnotations[selectedFile - 1]" v-show="page.length > 0"
          :key="index">
          <v-expansion-panel-header>
            <div>{{ $t('message.pageX').replace('{page}', index + 1) }}</div>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <template v-for="(anno, i) in page">
              <!-- predecessors add -->
              <v-card v-if="anno.annotationType" :key="'pdfAnnotations_' + i" class="pdfAnnotation"
                @click="jumpPdfAnnotation(anno)">
                <v-card-subtitle class="font-weight-bold d-flex">
                  <v-avatar :color="`rgba(0,0,0,0.3)`" width="40" min-width="40" height="40" class="my-auto ml-0 mr-2">
                    <img width="22" height="22" src="/images/tasks/paperclip.png" />
                  </v-avatar>
                  <div class="text-subtitle-1" style="line-break: anywhere">
                    <span>{{ anno.file.filename }}</span>
                  </div>
                  <v-spacer></v-spacer>
                  <v-menu offset-y z-index="200">
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn class="my-auto" icon v-bind="attrs" v-on="on"><v-icon>mdi-dots-horizontal</v-icon></v-btn>
                    </template>
                    <v-list style="cursor: pointer">
                      <v-list-item @click="downloadAttachment(anno)">
                        <v-list-item-title>{{
                          $t('button.download')
                        }}</v-list-item-title>
                      </v-list-item>
                      <v-list-item v-if="
                        checkAttachmentContentType(anno, [
                          'jpg',
                          'jpeg',
                          'png',
                          'txt',
                        ])
                      " @click="openPreviewAttachment(anno)">
                        <v-list-item-title>{{
                          $t('button.preview')
                        }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </v-card-subtitle>
              </v-card>
            </template>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-navigation-drawer>

    <v-main class="tour-create-task-6" :style="{
      'margin-left':
        (mode === 4 && control === 0 && role === 'HOST') ||
          (mode === 4 && control === 1 && role === 'SIGNER')
          ? '65px'
          : 0,
      'margin-top': mode === 1 && showDrawTool ? '50px' : 0,
    }">
      <div id="viewerContainer" ref="listContainer">
        <div id="viewer" class="pdfViewer"></div>
      </div>
    </v-main>
    <div id="loadingScreen" class="loadingScreen">
      <div class="loadingWrapper">
        <div class="sk-circle">
          <div class="sk-circle1 sk-child"></div>
          <div class="sk-circle2 sk-child"></div>
          <div class="sk-circle3 sk-child"></div>
          <div class="sk-circle4 sk-child"></div>
          <div class="sk-circle5 sk-child"></div>
          <div class="sk-circle6 sk-child"></div>
          <div class="sk-circle7 sk-child"></div>
          <div class="sk-circle8 sk-child"></div>
          <div class="sk-circle9 sk-child"></div>
          <div class="sk-circle10 sk-child"></div>
          <div class="sk-circle11 sk-child"></div>
          <div class="sk-circle12 sk-child"></div>
        </div>
        Loading...
      </div>
    </div>
    <v-dialog v-model="signatureDialog" overlay-opacity="0.9" :fullscreen="$utils.isMobile(false)"
      :persistent="$utils.isMobile(false)" max-width="600" :no-click-animation="$utils.isMobile(false)"
      style="max-height: 100%" @input="cancelSignature()">
      <!-- select signature -->
      <template v-if="
        isLogin === true &&
        isAddSignature === false &&
        signatureCount > 0 &&
        isInPersonSign === false
      ">
        <v-card class="rounded-lg">
          <v-app-bar dark flat color="primaryCustom">
            <v-toolbar-title class="ml-5 mx-auto text-h6">
              {{ $t('heading.existingSigs') }}
            </v-toolbar-title>
          </v-app-bar>
          <v-divider></v-divider>
          <div v-if="annotateSignature && annotateSignature.type === 9" class="text-subtitle-1 px-8 pt-2"
            style="color: rgba(0, 0, 0, 0.6)">
            {{ $t('text.b2b2cPInfo') }}
          </div>
          <div v-else-if="annotateSignature && annotateSignature.type === 10" class="text-subtitle-1 px-8 pt-2"
            style="color: rgba(0, 0, 0, 0.6)">
            {{ $t('text.b2b2cOInfo') }}
          </div>
          <div v-if="
            annotateSignature &&
            (annotateSignature.type === 9 || annotateSignature.type === 10)
          " class="px-8">
            <a style="text-decoration: underline" @click="$emit('goApplyB2b2c', annotateSignature.type)">{{
              $t('link.goApplyB2b2c') }}
              <svg-icon-gotolink />
            </a>
          </div>
          <v-card-text class="d-flex flex-column align-center pa-5">
            <div class="dialog-scroll-list" :class="{ 'mobile-dialog-scroll-list': $utils.isMobile(false) }">
              <v-item-group v-if="signatureList && signatureList.length > 0" v-model="selectedSignature">
                <v-container>
                  <v-row>
                    <v-col v-for="(sig, idx) in signatureList" :key="idx" cols="12">
                      <v-item v-slot="{ active, toggle }">
                        <v-card outlined elevation="0" style="cursor: pointer" :class="{
                          toggledItem: active,
                        }" @click.native="toggle">
                          <v-card-title class="pt-2 px-2 pb-0">
                            <v-chip v-if="sig.label !== null && sig.label !== ''" label><span class="labelTextWrap">{{
                              sig.label
                            }}</span></v-chip>
                            <!-- empty div for same height title -->
                            <div v-else text-color="white">&nbsp;</div>
                            <v-spacer />
                            <v-icon v-if="selectedSignature === idx" color="#333">mdi-check-circle-outline</v-icon>
                            <v-icon v-else color="#333">mdi-circle-outline</v-icon>
                          </v-card-title>
                          <v-card-text class="my-4">
                            <v-row justify="center" align="center">
                              <v-img contain :src="sig.content" max-height="100" />
                            </v-row>
                          </v-card-text>
                          <v-card-actions>
                            <v-spacer></v-spacer>
                          </v-card-actions>
                        </v-card>
                      </v-item>
                    </v-col>
                  </v-row>
                </v-container>
              </v-item-group>
            </div>
            <v-btn color="primaryCustom" large outlined class="mt-2 tour-sign-task-start"
              style="width: calc(100% - 60px)" @click="openAddSignatureDialog">
              <v-icon left>mdi-signature</v-icon>
              {{ $t('button.addSignatureNow') }}
            </v-btn>
          </v-card-text>
          <v-card-actions class="px-5 py-5 grey lighten-3">
            <v-spacer></v-spacer>
            <v-btn large outlined color="primaryCustom" class="text-subtitle-2 mr-2" @click="cancelSignature()">
              {{ $t('button.cancel') }}
            </v-btn>
            <v-btn large color="primaryCustom" class="text-subtitle-2" :disabled="selectedSignature === null || selectedSignature === undefined
              " @click="chooseSignature">
              {{ $t('button.complete') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </template>
      <!-- sign canvas -->
      <template v-else>
        <v-card class="signatureCanvasDialog align-center" :class="{
          'rounded-lg': !isLandscape || !$utils.isMobile(false),
          'rounded-0': isLandscape && $utils.isMobile(false),
          'd-flex': isLandscape && $utils.isMobile(false),
        }">
          <v-app-bar v-if="!isLandscape || !$utils.isMobile(false)" dark flat color="primaryCustom">
            <v-toolbar-title class="ml-5 mx-auto text-h6">
              {{ $t('heading.createSignature') }}
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-switch v-if="mode !== 1" v-model="textDirection" :prepend-icon="textDirection
                ? 'mdi-format-text-rotation-vertical'
                : 'mdi-format-text-rotation-none'
              " inset dense hide-details :label="`${textDirection
                  ? $t('options.vertical')
                  : $t('options.horizontal')
                }`"></v-switch>
            <v-spacer v-if="mode !== 1 && $utils.isMobile(false)"></v-spacer>
            <v-btn v-if="$utils.isMobile(false)" icon dark @click="cancelSignature()">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-app-bar>
          <div v-if="annotateSignature && annotateSignature.type === 9" class="text-subtitle-1 px-8 pt-2"
            style="color: rgba(0, 0, 0, 0.6)">
            {{ $t('text.b2b2cPInfo') }}
          </div>
          <div v-else-if="annotateSignature && annotateSignature.type === 10" class="text-subtitle-1 px-8 pt-2"
            style="color: rgba(0, 0, 0, 0.6)">
            {{ $t('text.b2b2cOInfo') }}
          </div>
          <div v-if="
            annotateSignature &&
            (annotateSignature.type === 9 || annotateSignature.type === 10)
          " class="px-8">
            <a style="text-decoration: underline" @click="$emit('goApplyB2b2c', annotateSignature.type)">{{
              $t('link.goApplyB2b2c') }}
              <svg-icon-gotolink />
            </a>
          </div>
          <v-card-text class="pa-5 justify-center align-center" :class="{
            'd-flex': $vuetify.breakpoint.mdAndDown && isOnlyMobile,
          }">
            <v-btn-toggle v-if="useHandWriting === true" v-model="signatureDialogToggle" mandatory color="primaryCustom"
              class="mb-2" style="width: 100%">
              <v-btn large class="text-subtitle-2" style="width: 50%">
                {{ $t('button.handwritingPad') }}
              </v-btn>
              <v-btn large class="text-subtitle-2" style="width: 50%">
                {{ $t('button.draw') }}
              </v-btn>
            </v-btn-toggle>
            <!-- 簽名板 -->
            <template v-if="signatureDialogToggle === 0 && useHandWriting === true">
              <div id="signatureBoard" class="signatureBoard">
                <canvas id="ppCanvas" width="560" height="300"></canvas>
              </div>
              <v-row justify="center" align="center">
                <v-col cols="12" sm="6">
                  <v-select v-model="ppSignId" outlined dense hide-details :items="ppSignList" item-text="name"
                    item-value="id" :label="$t('label.handwritingDevices')" class="mt-2" style="max-width: 100%"
                    :menu-props="{ auto: true }"></v-select>
                </v-col>
                <v-col cols="6" sm="3">
                  <v-btn block color="primaryCustom" class="text-subtitle-2 mt-2" :disabled="isPolling"
                    @click="initialDevice">
                    {{ $t('button.initialize') }}
                  </v-btn>
                </v-col>
                <v-col cols="6" sm="3">
                  <v-btn block outlined color="primaryCustom" class="text-subtitle-2 mt-2" :disabled="!isPolling"
                    @click="uninitDevice">
                    {{ $t('button.deinitialize') }}
                  </v-btn>
                </v-col>
              </v-row>
            </template>
            <!-- virtual 簽名板 -->
            <template v-else>
              <div id="signatureBoard" class="signatureBoard ma-auto">
                <vueSignature ref="signature" :sig-option="option" @notFinishSignatureChange="
                  (value) => (notFinishSignature = value)
                "></vueSignature>
              </div>
              <div class="flex-column ml-4" :class="{
                'd-flex': isLandscape && $utils.isMobile(false),
                'd-none': !(isLandscape && $utils.isMobile(false)),
              }">
                <v-btn large outlined color="primaryCustom" class="text-subtitle-2" @click="clear">
                  {{ $t('button.clear') }}
                </v-btn>
                <v-btn large color="primaryCustom" class="text-subtitle-2 mt-4 tour-sign-task-finish-mobile"
                  :disabled="notFinishSignature" :loading="addSignatureLoading" @click="addSignature">
                  {{ $t('button.complete') }}
                </v-btn>
                <v-switch v-if="mode !== 1" v-model="textDirection" :prepend-icon="textDirection
                    ? 'mdi-format-text-rotation-vertical'
                    : 'mdi-format-text-rotation-none'
                  " inset dense hide-details></v-switch>
                <p v-if="mode !== 1">
                  {{
                    `${textDirection
                      ? $t('options.vertical')
                      : $t('options.horizontal')
                    }`
                  }}
                </p>
                <v-spacer></v-spacer>
                <v-btn v-if="$utils.isMobile(false)" text color="primaryCustom" class="text-subtitle-2 mr-2"
                  @click="cancelSignature()">
                  {{ $t('button.cancel') }}
                </v-btn>
              </div>
            </template>
          </v-card-text>
          <v-card-actions class="px-5 py-5 grey lighten-3" :class="{
            'd-none': isLandscape && $utils.isMobile(false),
          }">
            <v-btn large text color="primaryCustom" class="text-subtitle-2 mr-2" @click="clear">
              {{ $t('button.clear') }}
            </v-btn>
            <v-btn v-if="$vuetify.breakpoint.mdAndUp && !$utils.isMobile(true)" large text color="primaryCustom"
              class="text-subtitle-2 mr-2 text-capitalize tour-sign-task-qrcode" @click="openGoToMobileSignpadDialog">
              {{ $t('button.qrCodeSign') }}
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn large color="primaryCustom" class="text-subtitle-2 tour-sign-task-finish"
              :disabled="notFinishSignature" :loading="addSignatureLoading" @click="addSignature">
              {{ $t('button.complete') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </template>
    </v-dialog>
    <v-dialog v-model="addStampDialog" content-class="no-scroll-dialog" overlay-opacity="0.9" max-width="550"
      @input="cancelStamp()">
      <template v-if="
        isLogin === true &&
        isAddStamp === false &&
        stampCount > 0 &&
        isInPersonSign === false
      ">
        <v-card class="rounded-lg">
          <v-app-bar dark flat color="primaryCustom">
            <v-toolbar-title class="ml-5 mx-auto text-h6">
              {{ $t('heading.existingStmp') }}
            </v-toolbar-title>
          </v-app-bar>
          <v-divider></v-divider>
          <div v-if="annotateStamp && annotateStamp.type === 11" class="text-subtitle-1 px-8 pt-2"
            style="color: rgba(0, 0, 0, 0.6)">
            {{ $t('text.b2b2cPInfo') }}
          </div>
          <div v-else-if="annotateStamp && annotateStamp.type === 12" class="text-subtitle-1 px-8 pt-2"
            style="color: rgba(0, 0, 0, 0.6)">
            {{ $t('text.b2b2cOInfo') }}
          </div>
          <div v-if="
            annotateStamp &&
            (annotateStamp.type === 11 || annotateStamp.type === 12)
          " class="px-8">
            <a style="text-decoration: underline" @click="$emit('goApplyB2b2c', annotateStamp.type)">{{
              $t('link.goApplyB2b2c') }}
              <svg-icon-gotolink />
            </a>
          </div>
          <v-card-text class="d-flex flex-column pa-5">
            <div class="dialog-scroll-list">
              <v-item-group v-if="stampList && stampList.length > 0" v-model="selectedStamp">
                <v-container>
                  <v-row>
                    <v-col v-for="(stamp, idx) in stampList" :key="idx" cols="12" lg="6" xl="6" md="6">
                      <v-item v-slot="{ active, toggle }">
                        <v-card outlined elevation="0" style="cursor: pointer" :class="{
                          toggledItem: active,
                        }" @click.native="toggle">
                          <v-card-title class="pt-2 px-2 pb-0">
                            <v-chip v-if="stamp.label !== null && stamp.label !== ''" :title="stamp.label" label><span
                                class="labelTextWrap">
                                {{ stamp.label }}</span></v-chip>
                            <!-- empty div for same height title -->
                            <div v-else text-color="white">&nbsp;</div>
                            <v-spacer />
                            <v-icon v-if="selectedStamp === idx" color="#333">mdi-check-circle-outline</v-icon>
                            <v-icon v-else color="#333">mdi-circle-outline</v-icon>
                          </v-card-title>
                          <v-card-text class="my-4">
                            <v-row justify="center" align="center">
                              <v-img contain :src="stamp.content" max-width="100" />
                            </v-row>
                          </v-card-text>
                          <v-card-actions>
                            <v-spacer></v-spacer>
                          </v-card-actions>
                        </v-card>
                      </v-item>
                    </v-col>
                  </v-row>
                </v-container>
              </v-item-group>
            </div>
            <v-btn color="primaryCustom" large outlined class="mt-2"
              style="width: calc(100% - 60px); align-self: center" @click="openAddStampDialog">
              <v-icon left>mdi-stamper</v-icon>
              {{ $t('button.addStamp') }}</v-btn>
          </v-card-text>
          <v-card-actions class="px-5 py-5 grey lighten-3">
            <v-spacer></v-spacer>
            <v-btn large outlined color="primaryCustom" class="text-subtitle-2 mr-2" @click="cancelStamp()">
              {{ $t('button.cancel') }}
            </v-btn>
            <v-btn large color="primaryCustom" class="text-subtitle-2" :disabled="selectedStamp === null"
              @click="chooseStamp">
              {{ $t('button.complete') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </template>
      <template v-else>
        <v-card>
          <v-app-bar dark flat color="primaryCustom">
            <v-toolbar-title class="ml-5 mx-auto text-h6">
              {{ $t('heading.uploadStmpImg') }}
            </v-toolbar-title>
          </v-app-bar>
          <div v-if="annotateStamp && annotateStamp.type === 11" class="text-subtitle-1 px-8 pt-2"
            style="color: rgba(0, 0, 0, 0.6)">
            {{ $t('text.b2b2cPInfo') }}
          </div>
          <div v-else-if="annotateStamp && annotateStamp.type === 12" class="text-subtitle-1 px-8 pt-2"
            style="color: rgba(0, 0, 0, 0.6)">
            {{ $t('text.b2b2cOInfo') }}
          </div>
          <div v-if="
            annotateStamp &&
            (annotateStamp.type === 11 || annotateStamp.type === 12)
          " class="px-8">
            <a style="text-decoration: underline" @click="$emit('goApplyB2b2c', annotateStamp.type)">{{
              $t('link.goApplyB2b2c') }}
              <svg-icon-gotolink />
            </a>
          </div>
          <v-card-text class="px-10 pt-10 pb-5">
            <div class="d-flex flex-column justify-center align-center"
              :class="['dropZone', dragging ? 'dropZone-over' : '']" @dragover="dragging = true"
              @dragleave="dragging = false">
              <template v-if="!dragging && stampFile === null">
                <div class="d-flex flex-column justify-center align-center" @drag="onFileChange">
                  <img width="50" height="50" src="/images/index/ic_index_upload.svg" />
                  <template v-if="$vuetify.breakpoint.lgAndUp">
                    <div id="dropZone-title" class="
                        text-subtitle-1 text-sm-h6
                        grey--text
                        text--darken-2
                        mt-4
                      ">
                      {{ $t('text.clickOrDragImg') }}
                    </div>
                  </template>
                  <template v-else>
                    <div id="dropZone-title" class="
                        text-subtitle-1 text-sm-h6
                        grey--text
                        text--darken-2
                        mt-4
                      ">
                      {{ $t('text.clickToUploadImg') }}
                    </div>
                  </template>
                  <div class="text-subtitle-2 grey--text">
                    extension support: png, jpg, jpeg, gif, bmp
                  </div>
                </div>
              </template>
              <template v-if="dragging">
                <div class="d-flex flex-column justify-center align-center">
                  <v-icon size="64" color="#1975a0">mdi-file-upload-outline</v-icon>
                  <div class="text-h6 mt-4" style="color: #1975a0 !important">
                    {{ $t('text.dragImgHere') }}
                  </div>
                </div>
              </template>
              <v-img v-if="stampFile !== null && !dragging" class="stampImage" :src="stampFile" alt="stamp" contain />
              <input type="file" accept=".png,.jpg,.jpeg,.gif,.bmp" @change="onFileChange" />
            </div>
            <v-btn large outlined color="primaryCustom" class="mt-4" style="width: 100%"
              @click="removeStampBgDialog = true">{{
                $t('button.removeStampBg') }}</v-btn>
          </v-card-text>
        </v-card>
        <v-card-actions class="px-10 py-5 grey lighten-3">
          <v-spacer></v-spacer>
          <v-btn large outlined color="primaryCustom" content-class="text-subtitle-2 mr-2" @click="cancelStamp()">
            {{ $t('button.cancel') }}
          </v-btn>
          <v-btn large color="primaryCustom" class="text-subtitle-2" :loading="addStampLoading" @click="addStamp">
            {{ $t('button.ok') }}
          </v-btn>
        </v-card-actions>
      </template>
    </v-dialog>
    <v-dialog v-model="addAttachmentDialog" overlay-opacity="0.9" max-width="600" @input="cancelAttachment()">
      <v-card>
        <v-app-bar dark flat color="primaryCustom">
          <v-toolbar-title class="ml-5 mx-auto text-h6">
            {{ $t('heading.uploadAttach') }}
          </v-toolbar-title>
        </v-app-bar>
        <v-card-text class="px-10 pt-10 pb-5">
          <div v-if="!exceedUploadLimit" class="d-flex flex-column justify-center align-center"
            :class="['dropZone', dragging ? 'dropZone-over' : '']" @dragover="dragging = true"
            @dragleave="dragging = false">
            <template v-if="!dragging">
              <div class="d-flex flex-column justify-center align-center" @drag="onAttachmentFileChange">
                <img width="50" height="50" src="/images/index/ic_index_upload.svg" />
                <template v-if="$vuetify.breakpoint.lgAndUp">
                  <div id="dropZone-title" class="
                      text-subtitle-1 text-sm-h6
                      grey--text
                      text--darken-2
                      mt-4
                    ">
                    {{ $t('text.clickOrDragAttach') }}
                  </div>
                </template>
                <template v-else>
                  <div id="dropZone-title" class="
                      text-subtitle-1 text-sm-h6
                      grey--text
                      text--darken-2
                      mt-4
                    ">
                    {{ $t('text.clickToUploadAttach') }}
                  </div>
                </template>
              </div>
            </template>
            <template v-if="dragging">
              <div class="d-flex flex-column justify-center align-center">
                <v-icon size="64" color="#1975a0">mdi-file-upload-outline</v-icon>
                <div class="text-h6 mt-4" style="color: #1975a0 !important">
                  {{ $t('text.dragAttachHere') }}
                </div>
              </div>
            </template>
            <input ref="attachmentInput" type="file" :disabled="attachmentFiles.length > 4"
              @change="onAttachmentFileChange" />
          </div>

          <v-chip-group column class="mt-2">
            <v-chip v-for="(f, i) in attachmentFiles" :key="`attachment-${i}`" close @click:close="deleteAttachment(i)">
              <span style="max-width: 300px" class="text-truncate">
                {{ f.name }}
              </span>
            </v-chip>
          </v-chip-group>
          <div class="mt-2">
            <v-chip outlined>
              {{
                $t('text.attachTotalLimit', {
                  total: formatBytes(totalSize),
                  limit: formatBytes(totalSizeLimit),
                })
              }}
            </v-chip>
          </div>
        </v-card-text>
      </v-card>
      <v-card-actions class="px-10 py-5 grey lighten-3">
        <v-spacer></v-spacer>
        <v-btn v-if="mode !== 5 || annotateAttachment != null" large outlined color="primaryCustom"
          content-class="text-subtitle-2 mr-2" @click="cancelAttachment()">
          {{ $t('button.close') }}
        </v-btn>
        <v-btn v-if="mode === 5 && annotateAttachment == null" large outlined color="primaryCustom"
          content-class="text-subtitle-2 mr-2" @click="cancelAttachment()">
          {{ $t('button.cancel') }}
        </v-btn>
        <v-btn v-if="mode === 5 && annotateAttachment == null" :disabled="attachmentFiles.length <= 0" large
          color="primaryCustom" class="text-subtitle-2" :loading="addAttachmentLoading" @click="addAttachment">
          {{ $t('button.ok') }}
        </v-btn>
      </v-card-actions>
    </v-dialog>
    <v-dialog v-model="removeStampBgDialog" hide-overlay fullscreen>
      <v-card style="background-color: #f1f5f8">
        <remove-stamp-bg v-if="removeStampBgDialog" @add="addRemoveBgStamp"
          @cancel="cancelRemoveBgProcess"></remove-stamp-bg>
      </v-card>
    </v-dialog>
    <v-dialog v-model="addImageDialog" overlay-opacity="0.9" max-width="450" @input="cancelImage()">
      <v-card>
        <v-app-bar dark flat color="primaryCustom">
          <v-toolbar-title class="ml-5 mx-auto text-h6">
            {{ $t('heading.uploadImg') }}
          </v-toolbar-title>
        </v-app-bar>
        <v-card-text class="px-10 pt-10 pb-5">
          <div class="d-flex flex-column justify-center align-center"
            :class="['dropZone', dragging ? 'dropZone-over' : '']" @dragover="dragging = true"
            @dragleave="dragging = false">
            <template v-if="!dragging && imageFile === null">
              <div class="d-flex flex-column justify-center align-center" @drag="onImageFileChange">
                <img width="50" height="50" src="/images/tasks/uploadPhoto.svg" />
                <template v-if="$vuetify.breakpoint.lgAndUp">
                  <div id="dropZone-title" class="
                      text-subtitle-1 text-sm-h6
                      grey--text
                      text--darken-2
                      mt-4
                    ">
                    {{ $t('text.clickOrDragImg') }}
                  </div>
                </template>
                <template v-else>
                  <div id="dropZone-title" class="
                      text-subtitle-1 text-sm-h6
                      grey--text
                      text--darken-2
                      mt-4
                    ">
                    {{ $t('text.clickToUploadImg') }}
                  </div>
                </template>
                <div class="text-subtitle-2 grey--text">
                  extension support: png, jpg, jpeg, gif, bmp
                </div>
              </div>
            </template>
            <template v-if="dragging">
              <div class="d-flex flex-column justify-center align-center">
                <v-icon size="64" color="#1975a0">mdi-file-upload-outline</v-icon>
                <div class="text-h6 mt-4" style="color: #1975a0 !important">
                  {{ $t('text.dragImgHere') }}
                </div>
              </div>
            </template>
            <v-img v-if="imageFile !== null && !dragging" class="imageFieldImage" :src="imageFile" max-height="100%"
              alt="imageField" style="height: 95%" contain />
            <input type="file" accept=".png,.jpg,.jpeg,.gif,.bmp" @change="onImageFileChange" />
          </div>
        </v-card-text>
      </v-card>
      <v-card-actions class="px-10 py-5 grey lighten-3">
        <v-btn v-if="$vuetify.breakpoint.mdAndUp && !$utils.isMobile(true)" large text color="primaryCustom"
          class="text-subtitle-2 mr-2 text-capitalize" @click="openGoToMobileUploadImageDialog">
          {{ $t('button.qrCodeUploadImage') }}
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn large outlined color="primaryCustom" content-class="text-subtitle-2 mr-2" @click="cancelImage()">
          {{ $t('button.cancel') }}
        </v-btn>
        <v-btn large color="primaryCustom" class="text-subtitle-2" :loading="addImageLoading" @click="addImage">
          {{ $t('button.ok') }}
        </v-btn>
      </v-card-actions>
    </v-dialog>
    <v-dialog v-model="addTextDialog" overlay-opacity="0.9" max-width="600" @input="cancelText()">
      <v-card>
        <v-app-bar dark flat color="primaryCustom">
          <v-toolbar-title class="ml-5 mx-auto text-h6">
            {{ $t('heading.addText') }}
          </v-toolbar-title>
        </v-app-bar>
        <v-card-text class="px-10 pt-10 pb-5">
          <span color="#f8f9fa" class="text-subtitle-2">{{
            $t('heading.format')
          }}</span>
          <v-row>
            <v-col cols="12" lg="9" sm="7" xs="6">
              <v-select id="fontFamilySelect" v-model="doneTextStyle.fontFamily" :items="fontFamilyList"
                item-text="name" item-value="value" height="32" background-color="white" solo flat single-line
                hide-details style="max-width: 100%; border: 1px solid #dfe1e6" @change="changeDoneTextStyle">
                <template v-slot:[`selection`]="{ item }">
                  <div class="text-body-2 text-truncate" style="max-width: 140px; overflow: hidden">
                    {{ item.name }}
                  </div>
                </template>
                <template v-slot:[`item`]="{ item }">
                  <div class="text-body-2 text-truncate" style="max-width: 140px; overflow: hidden">
                    {{ item.name }}
                  </div>
                </template>
              </v-select>
            </v-col>
            <v-col cols="12" lg="3" sm="5" xs="6">
              <v-select id="fontSizeSelect" v-model="doneTextStyle.fontSize" :items="fontSizeList" item-text="name"
                item-value="value" height="32" background-color="white" solo flat single-line hide-details
                style="max-width: 120px; border: 1px solid #dfe1e6" @change="changeDoneTextStyle">
                <template v-slot:[`selection`]="{ item }">
                  <div class="text-body-2 text-truncate" style="max-width: 100px; overflow: hidden">
                    {{ item.name }}
                  </div>
                </template>
                <template v-slot:[`item`]="{ item }">
                  <div class="text-body-2 text-truncate" style="max-width: 100px; overflow: hidden">
                    {{ item.name }}
                  </div>
                </template>
              </v-select>
            </v-col>
          </v-row>
          <v-textarea id="doneTextArea" v-model="doneText" height="120" label="" background-color="white" solo flat
            hide-details :placeholder="$t('placeholder.addText')" class="text-subtitle-2 mt-2"
            style="max-width: 100%; border: 1px solid #dfe1e6" @keydown.stop></v-textarea>
        </v-card-text>
      </v-card>
      <v-card-actions class="px-10 py-5 grey lighten-3">
        <v-spacer></v-spacer>
        <v-btn large outlined color="primaryCustom" content-class="text-subtitle-2 mr-2" @click="cancelText()">
          {{ $t('button.cancel') }}
        </v-btn>
        <v-btn :disabled="!doneText" large color="primaryCustom" class="text-subtitle-2" @click="addText">
          {{ $t('button.ok') }}
        </v-btn>
      </v-card-actions>
    </v-dialog>
    <v-dialog v-model="addDateDialog" overlay-opacity="0.9" max-width="450" @input="cancelDate()">
      <v-card>
        <v-app-bar dark flat color="primaryCustom">
          <v-toolbar-title class="ml-5 mx-auto text-h6">
            {{ $t('heading.addDate') }}
          </v-toolbar-title>
        </v-app-bar>
        <v-card-text class="px-10 pt-10 pb-5">
          <span color="#f8f9fa" class="text-subtitle-2">{{
            $t('heading.format')
          }}</span>
          <v-row class="mb-1">
            <v-col cols="12" lg="9" sm="7" xs="6">
              <v-select id="fontFamilySelect" v-model="doneDateStyle.fontFamily" :items="fontFamilyList"
                item-text="name" item-value="value" height="32" background-color="white" solo flat single-line
                hide-details style="max-width: 100%; border: 1px solid #dfe1e6">
                <template v-slot:[`selection`]="{ item }">
                  <div class="text-body-2 text-truncate" style="max-width: 140px; overflow: hidden">
                    {{ item.name }}
                  </div>
                </template>
                <template v-slot:[`item`]="{ item }">
                  <div class="text-body-2 text-truncate" style="max-width: 140px; overflow: hidden">
                    {{ item.name }}
                  </div>
                </template>
              </v-select>
            </v-col>
            <v-col cols="12" lg="3" sm="5" xs="6">
              <v-select id="fontSizeSelect" v-model="doneDateStyle.fontSize" :items="fontSizeList" item-text="name"
                item-value="value" height="32" background-color="white" solo flat single-line hide-details
                style="max-width: 120px; border: 1px solid #dfe1e6">
                <template v-slot:[`selection`]="{ item }">
                  <div class="text-body-2 text-truncate" style="max-width: 100px; overflow: hidden">
                    {{ item.name }}
                  </div>
                </template>
                <template v-slot:[`item`]="{ item }">
                  <div class="text-body-2 text-truncate" style="max-width: 100px; overflow: hidden">
                    {{ item.name }}
                  </div>
                </template>
              </v-select>
            </v-col>
          </v-row>
          <span color="#f8f9fa" class="text-subtitle-2">{{
            $t('heading.dateFormat')
          }}</span>
          <v-row>
            <v-col cols="6">
              <v-select id="dateFormatSelect" v-model="doneDateStyle.dateFormat" :items="dateFormatListFilter"
                item-text="name" item-value="name" height="32" background-color="white" solo flat single-line
                hide-details style="max-width: 100%; border: 1px solid #dfe1e6">
                <template v-slot:[`selection`]="{ item }">
                  <div class="text-body-2 text-truncate" style="max-width: 100px; overflow: hidden">
                    {{ item.name }}
                  </div>
                </template>
                <template v-slot:[`item`]="{ item }">
                  <div class="text-body-2 text-truncate" style="max-width: 100px; overflow: hidden">
                    {{ item.name }}
                  </div>
                </template>
              </v-select>
            </v-col>
            <v-col cols="6">
              <v-select id="dateEraSelect" v-model="doneDateStyle.dateEra" :items="dateEraList" item-text="name"
                item-value="value" height="32" background-color="white" solo flat single-line hide-details
                style="max-width: 100%; border: 1px solid #dfe1e6">
                <template v-slot:[`selection`]="{ item }">
                  <div class="text-body-2 text-truncate" style="max-width: 100px; overflow: hidden">
                    {{ item.name }}
                  </div>
                </template>
                <template v-slot:[`item`]="{ item }">
                  <div class="text-body-2 text-truncate" style="max-width: 100px; overflow: hidden">
                    {{ item.name }}
                  </div>
                </template>
              </v-select>
            </v-col>
          </v-row>
          <v-menu ref="doneDateMenu" v-model="doneDateMenu" :close-on-content-click="false"
            :return-value.sync="doneDate" transition="scale-transition" offset-y min-width="auto">
            <template v-slot:activator="{ on, attrs }">
              <v-text-field id="doneDateTextField" v-model="formatDoneDate" :label="$t('button.date')" v-bind="attrs"
                readonly height="32" background-color="white" solo flat single-line hide-details class="mt-2"
                style="max-width: 100%; border: 1px solid #dfe1e6" v-on="on"></v-text-field>
            </template>
            <v-date-picker v-model="doneDate" color="primaryCustom" :locale="$i18n.locale" scrollable>
              <v-spacer></v-spacer>
              <v-btn text color="primaryCustom" @click="$refs.doneDateMenu.save('')">
                {{ $t('button.clear') }}
              </v-btn>
              <v-btn text color="primaryCustom" @click="$refs.doneDateMenu.save(doneDate)">
                {{ $t('button.ok') }}
              </v-btn>
            </v-date-picker>
          </v-menu>
        </v-card-text>
      </v-card>
      <v-card-actions class="px-10 py-5 grey lighten-3">
        <v-spacer></v-spacer>
        <v-btn large outlined color="primaryCustom" content-class="text-subtitle-2 mr-2" @click="cancelDate()">
          {{ $t('button.cancel') }}
        </v-btn>
        <v-btn :disabled="!doneDate" large color="primaryCustom" class="text-subtitle-2" @click="addDate">
          {{ $t('button.ok') }}
        </v-btn>
      </v-card-actions>
    </v-dialog>
    <v-dialog v-model="addSignatureAndStampDialog" overlay-opacity="0.9" max-width="450"
      @input="cancelSignatureAndStamp()">
      <v-card>
        <v-app-bar dark flat color="primaryCustom">
          <v-toolbar-title class="ml-5 mx-auto text-h6">
            {{ $t('heading.chooseSignatureOrStamp') }}
          </v-toolbar-title>
        </v-app-bar>
        <v-card-text class="px-10 pt-10 pb-5 text-center">
          <v-row>
            <v-col cols="6" class="d-flex">
              <v-btn width="auto" height="160" outlined class="text-subtitle-1 d-flex flex-grow-1"
                @click="chooseSignatureAndStamp('signature')">
                <v-icon class="mr-1" size="22">mdi-signature</v-icon>
                {{ $t('button.signature') }}
              </v-btn>
            </v-col>
            <v-col cols="6" class="d-flex">
              <v-btn width="auto" height="160" outlined class="text-subtitle-1 d-flex flex-grow-1"
                @click="chooseSignatureAndStamp('stamp')">
                <v-icon class="mr-1" size="22">mdi-stamper</v-icon>
                {{ $t('button.stamp') }}
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
      <v-card-actions class="px-10 py-5 grey lighten-3">
        <v-spacer></v-spacer>
        <v-btn large outlined color="primaryCustom" content-class="text-subtitle-2 mr-2"
          @click="cancelSignatureAndStamp()">
          {{ $t('button.cancel') }}
        </v-btn>
      </v-card-actions>
    </v-dialog>
    <v-card v-if="mode === 0 && $vuetify.breakpoint.mdAndDown" class="rounded-lg cursorToolContainer" color="#f1f3f5">
      <v-btn-toggle v-model="cursorToolToggle" dense group>
        <v-btn :value="1" text class="rounded-lg" @click="setIsAllowTouchScrolling(true)">
          <v-icon size="22">mdi-cursor-default</v-icon>
        </v-btn>
        <v-btn :value="2" text class="rounded-lg" @click="setIsAllowTouchScrolling(false)">
          <v-icon size="22">mdi-selection-drag</v-icon>
        </v-btn>
      </v-btn-toggle>
    </v-card>
    <v-card v-if="mode === 0 && $vuetify.breakpoint.mdAndDown" id="annotateTool"
      class="rounded-lg annotateToolContainer">
      <v-btn text min-width="48" class="rounded-lg px-2 ma-1" @click="toggleRightDrawer(true)">
        <v-icon size="22">mdi-cog-outline</v-icon>
      </v-btn>
      <v-btn text min-width="48" class="rounded-lg px-2 ma-1" @click="deleteSelection()">
        <v-icon size="22">mdi-trash-can-outline</v-icon>
      </v-btn>
    </v-card>
    <v-btn v-if="mode === 1 && isAuditor === false" id="autoNavBtn" dense color="primaryCustom" :ripple="false"
      class="text-subtitle-2" @click="checkAnnotate(false, true)">
      {{ $t('button.beginSign') }}
    </v-btn>
    <!-- QRCode 簽名 -->
    <dialog-go-to-mobile ref="mobileSignpadDialog" :open-dialog="goToMobileSignpadDialog" :task-id="taskId"
      :text-direction="option.textDirection" @close="closeGoToMobileSignpadDialog"
      @addSignature="addSignatureFromMobileSignpad">
    </dialog-go-to-mobile>
    <!-- QRCode 印章去背 -->
    <dialog-go-to-mobile ref="mobileRemoveBgDialog" :open-dialog="goToMobileRemoveBgDialog" :task-id="taskId"
      target-path="tasks/mobile-remove-stamp-bg" :content="mobileRemoveBgDialogContent"
      @close="closeGoToMobileRemoveBgDialog" @addStamp="addStampFromMobileRemoveBg">
    </dialog-go-to-mobile>
    <!-- QRCode 上傳圖片 -->
    <dialog-go-to-mobile ref="mobileUploadImageDialog" :open-dialog="goToMobileUploadImageDialog" :task-id="taskId"
      target-path="tasks/mobile-upload-image" :content="mobileUploadImageDialogContent"
      @close="closeGoToMobileUploadImageDialog" @addImage="addImage">
    </dialog-go-to-mobile>
    <v-dialog v-model="previewAttachmentDialog" max-width="600" overlay-opacity="0.9"
      :fullscreen="$utils.isMobile(false)" :persistent="$utils.isMobile(false)"
      :no-click-animation="$utils.isMobile(false)" style="max-height: 100%" @input="cancelPreviewAttachment()">
      <v-card>
        <v-app-bar dark flat color="primaryCustom">
          <v-toolbar-title class="ml-5 text-h6 d-flex align-center"
            style="max-width: calc(100% - 80px); overflow: hidden">
            <span class="text-truncate">
              {{
                `${$t('heading.preview')}: ${getAttachmentFilename(
                  previewAttachment
                )}`
              }}
            </span>
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="cancelPreviewAttachment()">
            <v-icon size="22">mdi-close</v-icon>
          </v-btn>
        </v-app-bar>
        <v-card-text v-if="previewAttachment" class="px-10 pt-2 pb-5">
          <img v-if="
            checkAttachmentContentType(previewAttachment, [
              'jpg',
              'jpeg',
              'png',
            ])
          " :id="`attachmentImage_${previewAttachment.id}`" :src="getAttachmentImage(previewAttachment)"
            style="max-width: 100%; height: auto" />
          <div v-else-if="checkAttachmentContentType(previewAttachment, ['txt'])" style="
              max-width: 100%;
              max-height: 500px;
              overflow-y: auto;
              white-space: pre-line;
            ">
            {{ showTextAttachmentContent(previewAttachment) }}
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<style lang="scss" scoped>
:v-deep .v-application--wrap {
  min-height: 100%;
}

:v-deep .v-list-item {
  min-height: 36px;
}

:v-deep .v-text-field.v-text-field--solo .v-input__prepend-outer {
  margin: auto 5px;
}

#autoNavBtn {
  position: absolute;
  left: 0;
  top: 20%;
  border-radius: 0;
  z-index: 60;
}

#autoNavBtn.autoNav::after {
  border-left-color: var(--primaryCustom) !important;
  content: '';
  position: absolute;
  top: 50%;
  margin-top: -18px;
  border-top: 18px solid transparent;
  border-bottom: 18px solid transparent;
  border-left: 1em solid;
  right: -1em;
  box-shadow: none !important;
}

.labelTextWrap {
  overflow: hidden;
  text-overflow: ellipsis;
}

.drawerListItem {
  font-size: 15px;
  word-break: keep-all;
  white-space: break-spaces;
}

.drawerListItem.small-text {
  font-size: 13px;
}

.brushWidthOptions {
  height: 32px;
}

.disable-screen {
  pointer-events: none;
}

.streamSettingContainer {
  max-width: 100px;
  width: 100px;
  margin: auto;
  height: 50px;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
}

.streamSettingBtn {
  height: 40px !important;
  width: 40px;
  min-width: 40px !important;
  border-radius: 50%;
}

.stream-setting {
  background-image: url('/icon/collaborate/setting.svg');
  background-position: center;
  width: 25px;
  height: 25px;
}

.stream-hang-up {
  background-image: url('/icon/collaborate/hang-up.svg');
  background-position: center;
  width: 25px;
  height: 25px;
}

.stream-camera-on {
  background-image: url('/icon/collaborate/camera-on.png');
  background-position: center;
  width: 25px;
  height: 25px;
  background-size: 25px 25px;
}

.stream-microphone-off {
  background-image: url('/icon/collaborate/microphone-off.png');
  background-position: center;
  width: 28px;
  height: 28px;
  background-size: 28px 28px;
}

.stream-microphone-on {
  background-image: url('/icon/collaborate/microphone-on.png');
  background-position: center;
  width: 28px;
  height: 28px;
  background-size: 28px 28px;
}

.streamingDrawer {
  height: 100% !important;
  border-left: 1px solid #e0e0e0;
  z-index: 200 !important;
  top: 48px !important;
  max-height: calc(100% - 48px) !important;
}

.streamContainer {
  width: 200px;
  height: 100%;
  border-left: 1px solid #e0e0e0;
  z-index: 199;
}

.videoContainer {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  position: relative;
}

.videoContent {
  width: 180px;
  height: 130px;
}

.videoCover {
  width: 180px;
  height: 130px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: black;
}

.videoNameChip {
  position: absolute;
  bottom: 6px;
  left: 30px;
  padding: 2px 7px;
  background: rgba(#3a4743, 0.5);
  border-radius: 15px;
  display: flex;
  font-size: 13px;
  font-family: 'Noto Sans TC';
  color: white;
  max-width: 140px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}

.mode4-prev-page {
  background-image: url('/icon/collaborate/prev-page.svg');
  background-position: center;
}

.mode4-next-page {
  background-image: url('/icon/collaborate/next-page.svg');
  background-position: center;
}

.mode4-undo {
  background-image: url('/icon/collaborate/undo.svg');
  background-position: center;
}

.mode4-undo.v-btn--disabled {
  background-image: url('/icon/collaborate/undo-disabled.svg');
}

.mode4-redo {
  background-image: url('/icon/collaborate/redo.svg');
  background-position: center;
}

.mode4-redo.v-btn--disabled {
  background-image: url('/icon/collaborate/redo-disabled.svg');
}

.mode4-zoomOut {
  background-image: url('/icon/collaborate/zoomOut.svg');
  background-position: center;
}

.mode4-zoomIn {
  background-image: url('/icon/collaborate/zoomIn.svg');
  background-position: center;
}

#scaleSelect .v-input__slot {
  height: 26px;
}

#drawingToolBarContainer>*>div>div>button {
  border-radius: 3px;
  min-width: auto !important;
  width: 40px;
  height: 40px;
  margin-top: 12.5px;
}

#drawingToolBarContainerRow>*>div>div>button {
  border-radius: 3px;
  margin-right: 5px;
  min-width: 36px;
  width: 40px;
  height: 40px;
}

.option-panel-row {
  background-color: white;
  box-shadow: 0px 3px 6px #00000029;
  display: flex;
  position: absolute;
  min-height: 51px;
  min-width: 102px;
  top: 50px;
  left: 0px;
}

.option-panel>div>div>button,
.option-panel-row>div>div>button {
  border-radius: 3px !important;
  min-width: auto !important;
  width: 40px !important;
  height: 40px !important;
  margin: auto !important;
}

.option-panel>div,
.option-panel-row>div {
  margin: auto;
}

.option-panel>div:nth-child(n + 2) {
  margin-top: 0;
}

#drawingToolBarContainer>* {
  margin: auto;
}

// set drawing tool bar container button active
#drawingToolBarContainer>*>div>div>button.theme--light.v-btn--active:hover::before,
#drawingToolBarContainer>*>div>div>button.theme--light.v-btn--active::before,
#drawingToolBarContainer>*>div>div>div>button.theme--light.v-btn--active:hover::before,
#drawingToolBarContainer>*>div>div>div>button.theme--light.v-btn--active::before {
  opacity: 1;
}

#drawingToolBarContainer .collaborate-outline-icon.theme--light.v-btn--active:hover::before,
#drawingToolBarContainer .collaborate-outline-icon.theme--light.v-btn--active::before {
  opacity: 0.18;
}

.collaborate-outline-icon {
  background-image: url('/icon/collaborate/outline.svg');
  background-position: center;
}

.option-panel {
  width: 56px;
  height: 102px;
  background-color: white;
  box-shadow: 0px 3px 6px #00000029;
  display: flex;
  flex-direction: column;
  position: absolute;
  min-width: 56px;
  left: 60px;
}

.option-panel-row#optionPanel1 {
  left: -25px;
}

#optionPanel2 {
  top: calc(40px * 1);
}

.option-panel-row#optionPanel2 {
  top: 50px;
  left: 15px;
}

#optionPanel5 {
  top: calc(40px * 4 + 12.5px * 3);
}

.option-panel-row#optionPanel5 {
  top: 50px;
  left: 150px;
}

.color-select {
  width: 40px;
  height: 40px;
  margin-top: 12.5px !important;
  display: flex;
  justify-content: center;
  align-items: center;
}

#optionPanel7 {
  width: 160px;
  height: 260px;
  top: calc(-40px * 2);
}

.option-panel-row#optionPanel7 {
  display: flex;
  flex-direction: column;
  width: auto;
  height: auto;
  top: 50px;
}

.option-panel-row#optionPanel7>p {
  margin: 0;
}

#optionPanel8 {
  width: 180px;
  height: 53px;
  top: calc(40px * 1 + 18.5px);
}

.option-panel-row#optionPanel8 {
  right: 10px;
  left: unset;
  white-space: nowrap;
  align-items: center;
  padding: 0 9px;
  min-height: 40px;
  height: 40px;

  >div {
    margin: 0;
  }
}

#optionPanel9 {
  width: 147px;
  height: 195px;
  min-width: unset;
  max-width: unset;
  top: calc(40px * 1);
}

.option-panel-row#optionPanel9 {
  display: flex;
  flex-direction: column;
  right: 5px;
  top: 55px;
  left: unset;
}

#optionPanel9>button {
  min-height: unset;
  height: calc(195px / 5);
  border: none;
}

.option-panel-title {
  font-size: 12px;
}

.draw-tool1 {
  background-image: url('/icon/collaborate/pointer.svg'),
    url('/icon/collaborate/tool-options.svg');
  background-position: center, 90% 90%;
}

.draw-tool1.theme--light.v-btn--active:hover::before,
.draw-tool1.theme--light.v-btn--active::before {
  background-image: url('/icon/collaborate/pointer-active.svg'),
    url('/icon/collaborate/tool-options-active.svg');
  background-position: center, 90% 90%;
}

.draw-tool1-1 {
  background-image: url('/icon/collaborate/pointer.svg');
  background-position: center;
}

.draw-tool1-1.theme--light.v-btn--active:hover::before,
.draw-tool1-1.theme--light.v-btn--active::before {
  background-image: url('/icon/collaborate/pointer-active.svg');
  background-position: center;
}

.draw-tool1-2 {
  background-image: url('/icon/collaborate/grab.svg');
  background-position: center;
}

.draw-tool1-2.theme--light.v-btn--active:hover::before,
.draw-tool1-2.theme--light.v-btn--active::before {
  background-image: url('/icon/collaborate/grab-active.svg');
  background-position: center;
}

.draw-tool2 {
  background-image: url('/icon/collaborate/draw.svg'),
    url('/icon/collaborate/tool-options.svg');
  background-position: center, 90% 90%;
}

.draw-tool2.theme--light.v-btn--active:hover::before,
.draw-tool2.theme--light.v-btn--active::before {
  background-image: url('/icon/collaborate/draw-active.svg'),
    url('/icon/collaborate/tool-options-active.svg');
  background-position: center, 90% 90%;
}

.draw-tool2-1 {
  background-image: url('/icon/collaborate/draw.svg');
  background-position: center;
}

.draw-tool2-1.theme--light.v-btn--active:hover::before,
.draw-tool2-1.theme--light.v-btn--active::before {
  background-image: url('/icon/collaborate/draw-active.svg');
  background-position: center;
}

.draw-tool2-2 {
  background-image: url('/icon/collaborate/highlight.svg');
  background-position: center;
}

.draw-tool2-2.theme--light.v-btn--active:hover::before,
.draw-tool2-2.theme--light.v-btn--active::before {
  background-image: url('/icon/collaborate/highlight-active.svg');
  background-position: center;
}

.draw-tool3 {
  background-image: url('/icon/collaborate/text.svg');
  background-position: center;
}

.draw-tool3.theme--light.v-btn--active:hover::before,
.draw-tool3.theme--light.v-btn--active::before {
  background-image: url('/icon/collaborate/text-active.svg');
  background-position: center;
}

.draw-tool4 {
  background-image: url('/icon/collaborate/eraser.svg');
  background-position: center;
}

.draw-tool4.theme--light.v-btn--active:hover::before,
.draw-tool4.theme--light.v-btn--active::before {
  background-image: url('/icon/collaborate/eraser-active.svg');
  background-position: center;
}

.draw-tool5 {
  background-image: url('/icon/collaborate/geometry.svg'),
    url('/icon/collaborate/tool-options.svg');
  background-position: center, 90% 90%;
}

.draw-tool5.theme--light.v-btn--active:hover::before,
.draw-tool5.theme--light.v-btn--active::before {
  background-image: url('/icon/collaborate/geometry-active.svg'),
    url('/icon/collaborate/tool-options-active.svg');
  background-position: center, 90% 90%;
}

.draw-tool5-1 {
  background-image: url('/icon/collaborate/rect.svg');
  background-position: center;
}

.draw-tool5-1.theme--light.v-btn--active:hover::before,
.draw-tool5-1.theme--light.v-btn--active::before {
  background-image: url('/icon/collaborate/rect-active.svg');
  background-position: center;
}

.draw-tool5-2 {
  background-image: url('/icon/collaborate/circle.svg');
  background-position: center;
}

.draw-tool5-2.theme--light.v-btn--active:hover::before,
.draw-tool5-2.theme--light.v-btn--active::before {
  background-image: url('/icon/collaborate/circle-active.svg');
  background-position: center;
}

.draw-tool6 {
  background-image: url('/icon/collaborate/line.svg');
  background-position: center;
}

.draw-tool6.theme--light.v-btn--active:hover::before,
.draw-tool6.theme--light.v-btn--active::before {
  background-image: url('/icon/collaborate/line-active.svg');
  background-position: center;
}

.draw-tool7-inner {
  position: absolute;
  width: 25px;
  height: 25px;
  left: 7.5px;
  top: 20px;
}

#drawingToolBarContainerRow .draw-tool7-inner {
  position: initial;
  width: 25px;
  height: 25px;
}

.draw-tool8 {
  background-image: url('/icon/collaborate/thickness.svg');
  background-position: center;
}

.draw-tool8.theme--light.v-btn--active:hover::before,
.draw-tool8.theme--light.v-btn--active::before {
  background-image: url('/icon/collaborate/thickness-active.svg');
  background-position: center;
}

.draw-tool8:disabled {
  background-image: url('/icon/collaborate/thickness-disabled.svg');
}

.draw-tool9 {
  background-image: url('/icon/collaborate/text-size.svg'),
    url('/icon/collaborate/tool-options.svg');
  background-position: center, 90% 90%;
}

.draw-tool9.theme--light.v-btn--active:hover::before,
.draw-tool9.theme--light.v-btn--active::before {
  background-image: url('/icon/collaborate/text-size-active.svg'),
    url('/icon/collaborate/tool-options-active.svg');
  background-position: center, 90% 90%;
}

.draw-tool9:disabled {
  background-image: url('/icon/collaborate/text-size-disabled.svg'),
    url('/icon/collaborate/tool-options-disabled.svg');
  background-position: center, 90% 90%;
}

.streaming-icon {
  background-image: url('/icon/collaborate/streaming.svg');
  background-position: center;
}

.collaborate-window #thumbnailView {
  padding: 0;
}

.dialog-scroll-list {
  width: 100%;
  min-height: 80px;
  max-height: calc(100vh - 335px);
  padding-right: 18px;
  padding-left: 18px;
  overflow-y: auto;
  overflow-x: hidden;
}

.mobile-dialog-scroll-list {
  max-height: calc(100vh - 235px);
}

:v-deep .no-scroll-dialog {
  overflow-y: hidden;
}

.mobile-toolbar-button {
  height: 60px !important;
  margin-top: 4px;
  margin-bottom: 4px;
}

.mobile-toolbar-button-text {
  font-size: 10px;
  margin-top: 2px;
  height: 24px;
  width: 60px;
  text-wrap: balance;
  word-break: keep-all;
}

.commentDrawer,
.attachmentDrawer {
  .v-card {
    box-shadow: none;
  }

  .comment-input {
    border: 1px solid hsl(0, 0%, 90%);
    box-shadow: none;

    :v-deep>.v-input__control>.v-input__slot:before,
    :v-deep>.v-input__control>.v-input__slot:after {
      border: none;
    }
  }

  .pdfAnnotation-panel {
    .v-expansion-panel {
      background-color: #f8f9fa;
    }

    :v-deep .v-expansion-panel-content__wrap {
      padding: 0;
    }

    :v-deep .v-expansion-panel--active:not(:first-child),
    .v-expansion-panel--active+.v-expansion-panel {
      margin-top: 0;
    }
  }

  .pdfAnnotation {
    background-color: #f8f9fa;
    box-shadow: none;
    transform: translate(0px, 0px);
    transition: all 0.3s linear;
    border-radius: 0px;
  }

  .pdfAnnotation:hover {
    border-radius: 0px;
    background-color: #e6e6e6;
    //   transform: translate(-4px, -4px);
    //   box-shadow: 5px 5px;
  }
}
</style>
<style lang="scss">
#appToolbar {
  .v-slide-group__content {
    align-items: center;
  }
}

// if scroll bar x appear, make pdf's left side and right side gap
//.collaborate-window .pdfViewer {
//  overflow: auto;
//
//  .page {
//    margin: 10px;
//  }
//}

@media screen and (max-width: 1263px) {
  #appToolbar {
    .v-slide-group:not(.v-slide-group--has-affixes)>.v-slide-group__prev {
      display: none;
    }

    .v-slide-group.v-slide-group--has-affixes>.v-slide-group__prev {
      align-items: center;
      display: flex !important;
      flex: 0 1 52px;
      justify-content: center;
      min-width: 52px;
      cursor: pointer;
    }
  }
}

.small-text {
  font-size: 12px;
}
</style>
<style src="./viewer.css"></style>

<script>
import Vue from 'vue'
import compressBase64Image from '@/composables/compressBase64Image'
import moment from 'moment'
import { PDFViewerApplication } from './app.js'
import vueSignature from '~/components/vueSignature.vue'
import datePicker from '~/components/vuetify/datePicker.vue'
import SvgIconCloudCertificate from '~/components/svg/icon/tabCloudCertificate.vue'

export default {
  components: {
    vueSignature,
    SvgIconCloudCertificate,
  },
  props: {
    userInfo: {
      type: Object,
      default: () => {
        return null
      },
    },
    fileList: {
      type: Array,
      default: () => [],
    },
    comment: {
      type: Array,
      default: () => [],
    },
    mode: {
      type: Number,
      default: 0,
    },
    role: {
      type: String,
      default: 'SIGNER',
    },
    peopleNames: {
      type: Array,
      default: () => [],
    },
    signPeopleName: {
      type: String,
      default: '',
    },
    colorList: {
      type: Array,
      default: () => ['#42A5F5', '#EF5350', '#66BB6A'],
    },
    useHandWriting: {
      type: Boolean,
      default: false,
    },
    isInPersonSign: {
      type: Boolean,
      default: false,
    },
    keepAnnotationId: {
      type: Number,
      default: null,
    },
    taskId: {
      type: String,
      default: '',
    },
    canDownload: {
      type: Boolean,
      default: false,
    },
    useB2b2c: {
      type: Boolean,
      default: false,
    },
    watermark: {
      type: Object,
      default: () => {
        return null
      },
    },
    videoParams: {
      type: Object,
      default: () => {
        return {
          isUseCamera: false,
          isEnabledVideo: true,
          isEnabledAudio: true,
          isRemoteVideoEnabled: false,
          isRemoteAudioEnabled: false,
          isNoCamera: false,
          localName: '',
          remoteName: '',
        }
      },
    },
    hideComment: {
      type: Boolean,
      default: false,
    },
    hideAttachment: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isLogin: this.$store.getters.getIsLogin,
      selectId: this.peopleNames[0]?.id,
      selectedFile: this.fileList[0]?.id,
      signatureCount: 0,
      signatureList: [],
      stampCount: 0,
      stampList: [],
      selectedSignature: 0,
      isAddSignature: false,
      annotateSignature: null,
      signatureMode: 0,
      dragging: false,
      selectedStamp: 0,
      isAddStamp: false,
      annotateStamp: null,
      addStampDialog: false,
      addStampLoading: false,
      stampFile: null,
      stampMode: 0,
      addSignatureAndStampDialog: false,
      annotateSignatureAndStamp: null,
      annotateImage: null,
      addImageDialog: false,
      addImageLoading: false,
      imageFile: null,
      addSignatureLoading: false,
      addAttachmentDialog: false,
      addAttachmentLoading: false,
      attachmentFiles: [],
      annotateAttachment: null,
      uploadFileLimit: 1,
      totalSizeLimit: 5242880, // 5 MB
      addTextDialog: false,
      doneText: '',
      doneTextStyle: {
        fontSize: 16,
        fontFamily: 'Microsoft JhengHei',
      },
      doneObjMode: 0, // 0: new, 1: edit
      doneObjPage: 0,
      addDateDialog: false,
      doneDate: '',
      doneDateStyle: {
        fontSize: 16,
        fontFamily: 'Microsoft JhengHei',
        dateEra: 'common',
        dateFormat: 'YYYY/MM/DD',
      },
      doneDateMenu: false,
      leftDrawer: !this.$vuetify.breakpoint.mdAndDown,
      selectedAnnotate: null,
      rightDrawer:
        this.mode === 0 || this.mode === 1
          ? !this.$vuetify.breakpoint.mdAndDown
          : false,
      streamingDrawer: this.mode === 4,
      commentDrawer: false,
      attachmentDrawer: false,
      selectScale: 'page-width',
      scaleOptions: [
        { value: 'page-width', text: this.$t('options.pageWidth') },
        { value: 0.5, text: '50%' },
        { value: 0.75, text: '75%' },
        { value: 1, text: '100%' },
        { value: 1.25, text: '125%' },
        { value: 1.5, text: '150%' },
        { value: 2, text: '200%' },
        { value: 3, text: '300%' },
        { value: 4, text: '400%' },
      ],
      paintColor: '#000000',
      option: {
        penColor: 'rgb(0, 0, 0)',
        backgroundColor: 'rgba(0,0,0,0)',
        minWidth: 2,
        maxWidth: 2,
        textDirection: false,
      },
      textDirection: false,
      isPolling: false,
      signatureDialog: false,
      signatureDialogToggle: 1,
      cursorToolToggle: 1,
      buttonToggled: null,
      ppSignList: [
        { id: 0, ppId: 2, name: 'L370/L398/E560' },
        // { id: 1, ppId: 1, name: 'nature' },
        { id: 1, ppId: 5, name: 'L500' },
        // { id: 3, ppId: 0, name: 'E580' },
        // { id: 4, ppId: 7, name: 'L501F/L501G' },
        // { id: 5, ppId: 8, name: 'W300' },
      ],
      ppSignId: 0,
      isLandscape: false,
      notFinishSignature: true,
      signatureTemp: null,
      pointContent: [],
      svgContent: [],
      ppSignWidth: 0,
      ppSignHeight: 0,
      ppSignPressure: 0,
      ppSignName: '',
      annotateSelectId: 0,
      selection: {
        required: true,
        readonly: false,
        validation: {
          type: null,
          regex: null,
          errorMessage: null,
        },
      },
      selectionSource: null,
      ruleId: 0,
      ruleList: [
        { id: 0, name: this.$t('options.selectAtLeast') }, // 選取至少
        { id: 1, name: this.$t('options.selectAtMost') }, // 選取至多
        { id: 2, name: this.$t('options.selectExactly') }, // 選取剛好
        { id: 3, name: this.$t('options.selectRange') }, // 選取範圍
      ],
      minimum: 0,
      maximum: 1,
      checkboxGroup: [],
      checkboxSource: null,
      radioGroup: [],
      radioSource: null,
      fontFamilyList: [
        { id: 0, name: 'Arial', value: 'Arial' },
        { id: 1, name: 'Arial Narrow', value: 'Arial Narrow' },
        { id: 2, name: 'Calibri', value: 'Calibri' },
        { id: 3, name: 'Courier New', value: 'Courier New' },
        { id: 4, name: 'Georgia', value: 'Georgia' },
        { id: 5, name: 'Helvetica', value: 'Helvetica' },
        { id: 10, name: 'Times New Roman', value: 'Times New Roman' },
        { id: 6, name: '新細明體', value: 'PMingLiU' },
        { id: 7, name: '標楷體', value: 'DFKai-sb' },
        { id: 8, name: '微軟正黑體', value: 'Microsoft JhengHei' },
      ],
      fontSizeList: [
        { id: 0, name: '7', value: 7 },
        { id: 1, name: '8', value: 8 },
        { id: 2, name: '9', value: 9 },
        { id: 3, name: '10', value: 10 },
        { id: 4, name: '11', value: 11 },
        { id: 5, name: '12', value: 12 },
        { id: 6, name: '14', value: 14 },
        { id: 7, name: '16', value: 16 },
        { id: 8, name: '18', value: 18 },
        { id: 9, name: '20', value: 20 },
        { id: 10, name: '22', value: 22 },
        { id: 11, name: '24', value: 24 },
        { id: 12, name: '26', value: 26 },
        { id: 13, name: '28', value: 28 },
        { id: 14, name: '36', value: 36 },
        { id: 15, name: '48', value: 48 },
        { id: 16, name: '72', value: 72 },
      ],
      boxSizeList: [
        { id: 1, name: '12', value: 12 },
        { id: 2, name: '14', value: 14 },
        { id: 3, name: '16', value: 16 },
        { id: 4, name: '18', value: 18 },
        { id: 5, name: '20', value: 20 },
        { id: 6, name: '22', value: 22 },
        { id: 7, name: '24', value: 24 },
        { id: 8, name: '26', value: 26 },
        { id: 9, name: '28', value: 28 },
        { id: 10, name: '36', value: 36 },
      ],
      dateFormatList: [
        { id: 0, era: 'common', name: 'YYYY/MM/DD' },
        { id: 1, era: 'common', name: 'DD/MM/YYYY' },
        { id: 2, era: 'common', name: 'MM/DD/YYYY' },
        { id: 3, era: 'roc', name: '年月日', hoverView: 'YYY年MM月DD日' },
        {
          id: 4,
          era: 'roc',
          name: '中華民國年月日',
          hoverView: '中華民國YYY年MM月DD日',
        },
      ],
      removeStampBgDialog: false,
      ppSignRealData: [
        { name: 'L370', width: [167, 2536], height: [223, 1653] },
        { name: 'L500', width: [197, 2540], height: [222, 1520] },
        { name: 'E560', width: [157, 2547], height: [309, 1580] },
        { name: 'L398', width: [163, 2543], height: [222, 1665] },
      ],
      validationList: [
        { id: 0, name: this.$t('options.none'), value: null },
        { id: 1, name: this.$t('options.idCard'), value: 'idcard' },
        { id: 2, name: this.$t('options.email'), value: 'email' },
        { id: 3, name: this.$t('options.phone'), value: 'phone' },
        { id: 4, name: this.$t('options.postalCode'), value: 'zip' },
        { id: 5, name: this.$t('options.numbers'), value: 'number' },
        { id: 6, name: this.$t('options.custom'), value: 'custom' },
      ],
      dateRangeList: [
        { id: 0, name: this.$t('options.unrestricted'), value: 'none' },
        { id: 1, name: this.$t('options.signingDay'), value: 'signDay' },
        {
          id: 2,
          name: this.$t('options.beforeSigning'),
          value: 'beforeSignDay',
        },
        { id: 2, name: this.$t('options.afterSigning'), value: 'afterSignDay' },
      ],
      dateEraList: [
        { id: 0, name: this.$t('options.commonEra'), value: 'common' },
        { id: 1, name: this.$t('options.rocEra'), value: 'roc' },
      ],
      directionList: [
        {
          id: 0,
          name: this.$t('options.horizontal'),
          value: false,
          icon: 'mdi-swap-horizontal',
        },
        {
          id: 1,
          name: this.$t('options.vertical'),
          value: true,
          icon: 'mdi-swap-vertical',
        },
      ],
      controller: null,
      documentLoaded: false,
      pageScrolling: false,
      goToMobileSignpadDialog: false,
      goToMobileRemoveBgDialog: false,
      mobileRemoveBgDialogContent: {
        title: this.$t('heading.qrCodeStmpRmBg'),
        description: this.$t('text.qrCodeStmp'),
        connected: '',
        timedOut: this.$t('text.retrieveStmpQRCodeLink'),
      },
      goToMobileUploadImageDialog: false,
      mobileUploadImageDialogContent: {
        title: this.$t('heading.qrCodeUploadImage'),
        description: this.$t('text.qrCodeUploadImage'),
        connected: '',
        timedOut: this.$t('text.retrieveUploadImageLink'),
      },
      signatureIsAdding: false,
      eraserToggle: null,
      tab: null,
      dateDialog: false,
      resizeListener: null,
      orientationListener: null,
      drawToolToggle: 1,
      drawOptionToggle: undefined,
      pointerOptionToggle: this.$vuetify.breakpoint.mdAndDown ? 2 : 1,
      penOptionToggle: 1,
      geometryOptionToggle: 1,
      showPanel: false,
      showOptionPanel: false,
      selectedColor: {
        brush: [
          this.role === 'HOST' ? '#1C6A9D' : '#000000',
          this.role === 'HOST' ? '#1C6A9D' : '#000000',
        ],
        geometry: this.role === 'HOST' ? '#1C6A9D' : '#000000',
        line: this.role === 'HOST' ? '#1C6A9D' : '#000000',
        text: this.role === 'HOST' ? '#1C6A9D' : '#000000',
      },
      drawToolBarColor: '#777777',
      disableSelectColor: true,
      drawToolBarWidth: null,
      disableSelectWidth: true,
      disableSelectSize: true,
      drawToolBarTextSize: null,
      selectedWidth: {
        brush: [6, 48],
        geometry: 1,
        line: 1,
        text: 26,
      },
      brushOpacityOptions: [
        { id: 1, name: '不透明', value: 1 },
        { id: 2, name: '中', value: 0.5 },
      ],
      selectedBrushOpacity: 1,
      brushWidthOptions: [4, 8, 9, 10, 11, 12, 14, 18],
      geometryWidthOptions: [3, 4, 5, 6, 7, 8, 9],
      textSizeOptions: [
        { label: '顯示', value: 82 },
        { label: '標題', value: 52 },
        { label: '副標題', value: 36 },
        { label: '一般', value: 26 },
        { label: '說明文字', value: 16 },
      ],
      textBGCOptions: ['#42A5F5', '#EF5350', '#66BB6A'],
      textBGOpacityOptions: [
        { name: '透明', value: 0 },
        { name: '淺', value: 0.3 },
        { name: '深', value: 0.6 },
        { name: '不透明', value: 1 },
      ],
      selectedTextBGOpacity: 0,
      selectedTextBGC: '#42A5F5',
      geometryShapeOptions: [
        { id: 1, icon: 'rectangle-outline' },
        { id: 2, icon: 'circle-outline' },
      ],
      selectedGeometryShape: 1,
      controlOptions: [
        { id: 0, text: this.$t('options.host') },
        { id: 1, text: this.$t('options.signer') },
      ],
      control: 0,
      colorArr: [
        ['#27ae60', '#1fd430', '#02f919'],
        ['#1b6a9d', '#00adef', '#00f0ff'],
        ['#bf2110', '#e74c3c', '#ff2500'],
        ['#911253', '#dc0c76', '#f55196'],
        ['#f1c40e', '#fef202', '#fff369'],
        ['#d35400', '#e67f22', '#ff7800'],
        ['#ffffff', '#5a5b5c', '#402b56'],
        ['#bdc3c7', '#000000', '#502d1d'],
      ],
      pdfViewerApplicationErrorCount: 0,
      toolSet: 0,
      activeMobileButton: 0,
      showDrawTool: false,
      selectedCanvas: null,
      canvasBorder: null,
      pdfAnnotations: [],
      commentAnnotations: [],
      attachmentAnnotations: [],
      newComment: '',
      commentTotalCount: 0,
      commentOptionMenu: [
        {
          title: this.$t('button.delete'),
          func: 'delete',
        },
      ],
      attachmentTotalCount: 0,
      previewAttachmentDialog: false,
      previewAttachment: null,
    }
  },
  computed: {
    currentFileIndexText() {
      if (this.fileList.length === 0) {
        return '0/0'
      }
      const fileLength = this.fileList.length
      return `${this.selectedFile}/${fileLength}`
    },
    isOnlyMobile() {
      return !process.client ? false : this.$utils.isMobile(false)
    },
    newSignatureAvailable() {
      return this.signatureCount > this.signatureList.length
    },
    newStampAvailable() {
      return this.stampCount > this.stampList.length
    },
    leftDrawerToggle: {
      get() {
        return this.leftDrawer ? [1] : []
      },
      set(value) { },
    },
    rightDrawerToggle: {
      get() {
        return this.rightDrawer ? [1] : []
      },
      set(value) { },
    },
    streamingDrawerToggle: {
      get() {
        return this.streamingDrawer ? [1] : []
      },
      set(value) { },
    },
    commentDrawerToggle: {
      get() {
        return this.commentDrawer ? [1] : []
      },
      set(value) { },
    },
    attachmentDrawerToggle: {
      get() {
        return this.attachmentDrawer ? [1] : []
      },
      set(value) { },
    },
    totalSize() {
      return this.attachmentFiles.reduce((prev, curr) => {
        return prev + curr.size
      }, 0)
    },
    exceedUploadLimit() {
      return this.uploadFileLimit <= this.attachmentFiles.length
    },
    isAuditor() {
      let isEmpty = true
      this.fileList.forEach((file) => {
        file.annotate.forEach((element) => {
          if (element.data && element.data.length > 0) {
            isEmpty = false
          }
        })
      })
      if (isEmpty) {
        return true
      } else {
        return false
      }
    },
    formatDateValue() {
      if (this.selection.text && this.selection.type === 4) {
        switch (this.selection.dateEra) {
          case 'common':
          default:
            return moment(this.selection.text).format(
              this.selection.dateFormat ?? 'YYYY/MM/DD'
            )
          case 'roc': {
            let date =
              this.$t('options.rocEra') +
              (+moment(this.selection.text).format('YYYY') - 1911) +
              moment(this.selection.text).format('年MM月DD日')
            date = this.selection.dateFormat.includes('中華民國')
              ? date
              : date.replace(this.$t('options.rocEra'), '')
            return date
          }
        }
      } else {
        return ''
      }
    },
    formatDoneDate() {
      if (this.doneDate) {
        switch (this.doneDateStyle.dateEra) {
          case 'common':
          default:
            return moment(this.doneDate).format(
              this.doneDateStyle.dateFormat ?? 'YYYY/MM/DD'
            )
          case 'roc': {
            let y = ''
            let m = ''
            let d = ''
            const rocNumber = [
              '零',
              '壹',
              '貳',
              '參',
              '肆',
              '伍',
              '陸',
              '柒',
              '捌',
              '玖',
            ]
            y = (moment(this.doneDate).format('YYYY') - 1911).toString()
            m = moment(this.doneDate).format('MM')
            d = moment(this.doneDate).format('DD')
            y = Number(y)
              .toString()
              .split('')
              .map((char) => rocNumber[char])
            m = Number(m)
              .toString()
              .split('')
              .map((char) => rocNumber[char])
            d = Number(d)
              .toString()
              .split('')
              .map((char) => rocNumber[char])

            // 橫式
            let date = `${this.$t('options.rocEra')}${y.join('')}年${m.join(
              ''
            )}月${d.join('')}日`
            date = this.doneDateStyle.dateFormat.includes('中華民國')
              ? date
              : date.replace(this.$t('options.rocEra'), '')
            return date
          }
        }
      } else {
        return ''
      }
    },
    mode4Outline() {
      return {
        left:
          (!this.$vuetify.breakpoint.mdAndDown &&
            this.control === 0 &&
            this.role === 'HOST') ||
            (!this.$vuetify.breakpoint.mdAndDown &&
              this.control === 1 &&
              this.role === 'SIGNER')
            ? '65px'
            : '0',
      }
    },
    dateFormatListFilter() {
      return this.dateFormatList.filter(
        (item) =>
          item.era ===
          (this.mode === 5
            ? this.doneDateStyle.dateEra
            : this.selection.dateEra)
      )
    },
    mode4AppBar() {
      return {
        height: '25px',
        width: '25px',
        margin: '5px',
        padding: '0 !important',
        'min-width': 'auto !important',
      }
    },
    mode4ScaleSelect() {
      return {
        width: '108px',
        height: '26px',
      }
    },
    isEn() {
      return this.$i18n.locale === 'en'
    },
    noLoginUseHandWriting() {
      return localStorage.getItem('noLoginUseHandWriting') === 'true'
    },
    selectionOptions() {
      const base = [
        {
          id: null,
          name: this.$t('options.none'),
        },
      ]
      return this.selection.options && this.selection.options.length > 0
        ? base.concat(this.selection.options.filter((x) => x.name.length > 0))
        : base
    },
  },
  watch: {
    selectId: {
      handler() {
        PDFViewerApplication.setSelectId(this.selectId)
      },
      deep: true,
    },
    signatureDialogToggle: {
      handler() {
        if (
          this.signatureDialog === true &&
          (this.isAddSignature === true ||
            this.isLogin === false ||
            this.signatureCount <= 0 ||
            this.isInPersonSign === true)
        ) {
          this.notFinishSignature = true
          this.signatureTemp = null
          const canvasContainer = document.getElementById('signatureBoard')
          if (this.signatureDialogToggle === 0) {
            this.$nextTick(() => {
              canvasContainer.style.width = '560px'
              canvasContainer.style.height = '300px'
              this.$nuxt.$loading.start()
              this.autoinitialDevice()
            })
          } else {
            setTimeout(() => {
              const ratio = Math.max(window.devicePixelRatio || 1, 1)
              const aspectRatio = this.textDirection ? 1 / 2 : 2 / 1
              if (canvasContainer) {
                let height =
                  document.documentElement.clientHeight -
                  (this.getIsLandscape() && this.$utils.isMobile(false)
                    ? 40
                    : 180)
                let width =
                  document.querySelector('.signatureCanvasDialog').clientWidth -
                  (this.getIsLandscape() && this.$utils.isMobile(false)
                    ? 145
                    : 40)
                const maxWidth = 600
                height = Math.min(height, maxWidth)
                width = Math.min(width, maxWidth)
                if (this.textDirection) {
                  canvasContainer.style.width = height * aspectRatio + 'px'
                  canvasContainer.style.height = height + 'px'
                } else {
                  canvasContainer.style.width = width + 'px'
                  canvasContainer.style.height = width / aspectRatio + 'px'
                }
                setTimeout(() => {
                  const canvas = document.getElementById(
                    `canvas${this.$refs.signature._uid}`
                  )
                  const tempWidth = canvasContainer.offsetWidth
                  const tempHeight = canvasContainer.offsetHeight
                  const offsetWidth = this.textDirection
                    ? Math.min(tempWidth, tempHeight)
                    : Math.max(tempWidth, tempHeight)
                  const offsetHeight = this.textDirection
                    ? Math.max(tempWidth, tempHeight)
                    : Math.min(tempWidth, tempHeight)
                  canvas.width = offsetWidth * ratio
                  canvas.height = offsetHeight * ratio
                  canvas.getContext('2d').scale(ratio, ratio)
                  this.$refs.signature.clearTemp()
                  this.$refs.signature.fromData(this.signatureTemp)
                }, 500)
              }
            }, 10)
          }
        }
      },
      deep: true,
    },
    '$vuetify.breakpoint.mdAndDown': {
      handler() {
        if (this.$vuetify.breakpoint.mdAndDown) {
          this.rightDrawerToggle = []
          this.leftDrawerToggle = []
        } else {
          this.rightDrawerToggle = [1]
          this.leftDrawerToggle = [1]
        }
        if (this.mode !== 4) {
          setTimeout(() => {
            const buttons = [
              {
                element: document.getElementById('undo-mobile'),
                eventName: 'undo',
              },
              {
                element: document.getElementById('redo-mobile'),
                eventName: 'redo',
              },
            ]
            PDFViewerApplication.bindToolbarEvent(buttons)
          }, 0)
        }
      },
      deep: true,
    },
    textDirection: {
      handler(newValue, oldValue) {
        this.option.textDirection = newValue
        this.clear()
        this.resizeCanvas()
      },
    },
    selectScale: {
      handler() {
        if (this.mode === 1 && this.isAuditor === false) {
          const mainContainer = document.getElementById('viewerContainer')
          const autoNavBtn = document.getElementById('autoNavBtn')
          autoNavBtn.classList.remove('autoNav')
          autoNavBtn.innerHTML = this.$t('button.beginSign')
          mainContainer.removeEventListener('scroll', scroll)
        }
      },
      deep: true,
    },
    addStampDialog(open) {
      this.openDialog(open)
    },
    signatureDialog(open) {
      this.openDialog(open)
    },
    selectedGeometryShape(newValue, oldValue) {
      PDFViewerApplication.eventBus.dispatch('changeGeometryShape', newValue)
    },
    control: {
      handler(newValue, oldValue) {
        if (newValue !== null && this.mode === 4) {
          PDFViewerApplication.eventBus.dispatch('switchControl', newValue)
          if (
            this.mode === 4 &&
            !(newValue === 0 && this.role === 'HOST') &&
            !(newValue === 1 && this.role === 'SIGNER')
          ) {
            const self = this
            PDFViewerApplication.eventBus.dispatch('removeAnnotateToggled', {
              source: self,
            })
            PDFViewerApplication.eventBus.dispatch('disableBrush')

            const evt = { source: { pageNumber: null } }
            PDFViewerApplication.eventBus.dispatch('deselectCanvas', evt)

            document
              .querySelector('#appContainer')
              .classList.add('disable-screen')
            document.getElementById('viewerContainer').style.overflow = 'hidden'
            document
              .getElementById('thumbnailView')
              .classList.add('disable-screen')
            document.getElementById('thumbnailView').style.overflow = 'hidden'
          } else {
            document
              .querySelector('#appContainer')
              .classList.remove('disable-screen')
            document.getElementById('viewerContainer').style.overflow = 'auto'
            document
              .getElementById('thumbnailView')
              .classList.remove('disable-screen')
            document.getElementById('thumbnailView').style.overflow = 'auto'
          }
        }
      },
      immediate: false,
    },
    rightDrawerToggle: {
      handler() {
        if (this.mode === 4) {
          this.$emit('rightDrawerChanged', {
            rightDrawerToggle: this.rightDrawerToggle,
            rightDrawer: this.rightDrawer,
          })
        }
      },
      deep: true,
    },
    rightDrawer: {
      handler(newValue) {
        if (this.mode === 0 || this.mode === 1 || this.mode === 3) {
          if (newValue) {
            this.commentDrawer = false
            this.attachmentDrawer = false
          }
        }
      },
    },
    commentDrawer: {
      handler(newValue) {
        if (this.mode === 0 || this.mode === 1 || this.mode === 3) {
          PDFViewerApplication.eventBus.dispatch('changeCommentMode', {
            on: newValue,
          })
          if (this.mode === 0) {
            const leftTool = document.getElementById('leftDrawerContainer')
            leftTool.disabled = newValue
            leftTool.style.cursor = newValue ? 'none' : 'pointer'
            leftTool.style.pointerEvents = newValue ? 'none' : 'all'
          }
          if (newValue) {
            this.rightDrawer = false
            this.attachmentDrawer = false
          }
        }
      },
    },
    attachmentDrawer: {
      handler(newValue) {
        if (this.mode === 0 || this.mode === 1 || this.mode === 3) {
          if (this.mode === 0) {
            const leftTool = document.getElementById('leftDrawerContainer')
            leftTool.disabled = newValue
            leftTool.style.cursor = newValue ? 'none' : 'pointer'
            leftTool.style.pointerEvents = newValue ? 'none' : 'all'
          }
          if (newValue) {
            this.rightDrawer = false
            this.commentDrawer = false
          }
        }
      },
    },
    'selection.dateEra': {
      handler(newValue, oldValue) {
        const dateTextField = document.querySelector(
          '.date-text-field > .v-input__control > .v-input__slot'
        )
        if (dateTextField) {
          switch (newValue) {
            case 'common':
            default:
              dateTextField.style.padding = `0 12px`
              dateTextField.querySelector(
                '.v-text-field__slot > input'
              ).style.fontSize = `16px`
              break
            case 'roc':
              dateTextField.style.padding = 0
              dateTextField.querySelector(
                '.v-text-field__slot > input'
              ).style.fontSize = `12px`
              break
          }
        }
      },
      deep: true,
    },
    'doneDateStyle.dateEra': {
      handler(newValue, oldValue) {
        if (this.mode === 5) {
          if (newValue !== oldValue) {
            this.doneDateStyle.dateFormat = this.dateFormatList.find(
              (item) => item.era === newValue
            ).name
          }
        }
      },
      immediate: false,
    },
  },
  created() {
    // 有開啟簽名板，且已登入，則使用簽名板
    // 未登入但使用過簽名板(localStorage紀錄)，則使用簽名板
    this.signatureDialogToggle =
      this.useHandWriting === true &&
        (this.isLogin || this.noLoginUseHandWriting)
        ? 0
        : 1
  },
  mounted() {
    this.clearAllCanvas()
    this.webViewerLoad()
    this.orientationListener = new AbortController()
    this.$nextTick(() => {
      if (this.signatureDialog === true && this.signatureDialogToggle === 1) {
        this.$nextTick(() => {
          this.resizeCanvas()
        })
      }
      this.isLandscape = !!window.matchMedia('(orientation: landscape)').matches
      const checkOrientation = () => {
        if (this.isLandscape !== this.getIsLandscape()) {
          this.isLandscape = this.getIsLandscape()
          if (
            this.signatureDialog === true &&
            this.signatureDialogToggle === 1
          ) {
            this.$nextTick(() => {
              this.resizeCanvas()
            })
          }
        }
      }
      if (
        window.screen &&
        window.screen.orientation != null &&
        window.screen.orientation !== undefined
      ) {
        window.screen.orientation.addEventListener(
          'change',
          checkOrientation,
          this.orientationListener.signal
        )
      }
      window.addEventListener(
        'orientationchange',
        checkOrientation,
        this.orientationListener.signal
      )
      window.addEventListener(
        'resize',
        () => {
          if (
            this.signatureDialog === true &&
            this.signatureDialogToggle === 1
          ) {
            this.$nextTick(() => {
              this.resizeCanvas()
            })
          }
        },
        this.orientationListener.signal
      )
      setInterval(checkOrientation, 2000, {
        signal: this.orientationListener.signal,
      })
      if (
        this.mode === 4 &&
        !(this.control === 0 && this.role === 'HOST') &&
        !(this.control === 1 && this.role === 'SIGNER')
      ) {
        document.querySelector('#appContainer').classList.add('disable-screen')
        document.getElementById('viewerContainer').style.overflow = 'hidden'
        document.getElementById('thumbnailView').classList.add('disable-screen')
        document.getElementById('thumbnailView').style.overflow = 'hidden'
      } else {
        document
          .querySelector('#appContainer')
          .classList.remove('disable-screen')
        document.getElementById('viewerContainer').style.overflow = 'auto'
        document
          .getElementById('thumbnailView')
          .classList.remove('disable-screen')
        document.getElementById('thumbnailView').style.overflow = 'auto'
      }
      if (this.mode === 1 || this.mode === 3) {
        if (this.mode === 1) {
          window.addEventListener('click', this.hideDrawTool)
        }
        this.fileList.forEach((x) => {
          this.commentAnnotations.push([])
          this.attachmentAnnotations.push([])
          this.pdfAnnotations.push([])
        })
      }
      if (this.mode === 4) {
        this.setIsAllowTouchScrolling(this.$vuetify.breakpoint.mdAndDown)
      }
      if (this.mode === 4 || this.mode === 1) {
        this.drawToolBarColor = this.selectedColor.brush[0]
        this.drawToolBarWidth = this.selectedWidth.brush[0]
        this.changeType('brush', 0)
      }
    })
  },

  beforeDestroy() {
    if (this.mode === 1) {
      window.removeEventListener('click', this.hideDrawTool)
    }
    this.orientationListener.abort()
    // this.$nuxt.$loading.start()
    PDFViewerApplication.close().then(() => {
      // if (this.mode === 1 || this.mode === 2 || this.mode === 3) {
      //   window.location.reload(true)
      // }
      this.clearAllCanvas()
    })
    // this.$nuxt.$loading.finish()
  },

  methods: {
    listenDrawToolToggle(e) {
      let toolIndex, clickTool
      if (!e.target.getAttribute('disabled')) {
        toolIndex = parseInt(e.target.getAttribute('value'))
        clickTool = e.target.classList.contains(`draw-tool${toolIndex}`)
      }
      // allow show panel
      if (clickTool) {
        // set pdf.js grab disable when using other tool
        this.setIsAllowTouchScrolling(false)
        if (toolIndex < 7) {
          if (toolIndex === 1 || toolIndex === 2 || toolIndex === 5) {
            this.showPanel = true
            document.addEventListener('mouseup', this.showDrawTypePanel)
          }
          this.showOptionPanel = false
          this.drawOptionToggle = undefined
          document.removeEventListener('mouseup', this.showDrawOptionPanel)
        }
        if (toolIndex > 6) {
          this.showPanel = false
          document.removeEventListener('mouseup', this.showDrawTypePanel)
          if (toolIndex === 7 || toolIndex === 8 || toolIndex === 9) {
            this.showOptionPanel = true
            if (this.showOptionPanel) {
              document.addEventListener('mouseup', this.showDrawOptionPanel)
            }
          }
        }
        switch (toolIndex) {
          case 1:
            this.setIsAllowTouchScrolling(this.pointerOptionToggle === 2)
            this.disableSelectColor = true
            this.disableSelectWidth = true
            this.disableSelectSize = true
            break
          case 2: {
            this.disableSelectColor = false
            this.disableSelectWidth = false
            this.disableSelectSize = true
            let index = this.penOptionToggle
            this.drawToolBarColor = this.selectedColor.brush[--index]
            this.changeColor(
              'brush',
              this.rgb2Hex(this.drawToolBarColor),
              index
            )
            break
          }
          case 3:
            this.disableSelectColor = false
            this.disableSelectWidth = true
            this.disableSelectSize = false
            this.drawToolBarColor = this.selectedColor.text
            this.changeColor('text', this.rgb2Hex(this.drawToolBarColor))
            break
          case 4:
            this.disableSelectColor = true
            this.disableSelectWidth = true
            this.disableSelectSize = true
            break
          case 5:
            this.disableSelectColor = false
            this.disableSelectWidth = false
            this.disableSelectSize = true
            this.drawToolBarColor = this.selectedColor.geometry
            this.changeColor('geometry', this.rgb2Hex(this.drawToolBarColor))
            this.changeWidth('geometry', this.selectedWidth.geometry)
            this.drawToolBarWidth = this.selectedWidth.geometry
            this.addAnnotateMB(91)
            break
          case 6:
            this.disableSelectColor = false
            this.disableSelectWidth = false
            this.disableSelectSize = true
            this.drawToolBarColor = this.selectedColor.line
            this.changeColor('line', this.rgb2Hex(this.drawToolBarColor))
            this.changeWidth('line', this.selectedWidth.line)
            this.drawToolBarWidth = this.selectedWidth.line
            this.addAnnotateMB(94)
            break
          case 7:
            this.drawOptionToggle = 7
            this.drawToolBarTextSize = this.selectedWidth.text
            break
          case 8:
            break
          case 9:
            break
        }
      }
    },
    showDrawTypePanel(e) {
      const obj = e.target
      let panel
      try {
        panel = document.querySelector(`#optionPanel${this.drawToolToggle}`)
      } catch (e) { } // get panel element
      switch (this.drawToolToggle) {
        case 1: {
          if (this.mode === 4) {
            const pointer1 = document.querySelector('#pointer1')
            const pointer2 = document.querySelector('#pointer2')
            if (pointer1.contains(obj) || pointer2.contains(obj)) {
              this.showPanel = false
              document.removeEventListener('mouseup', this.showDrawTypePanel)
            } else if (!panel.contains(obj)) {
              this.showPanel = false
              document.removeEventListener('mouseup', this.showDrawTypePanel)
            }
          }
          break
        }
        case 2: {
          const pen1 = document.querySelector('#pen1')
          const pen2 = document.querySelector('#pen2')
          if (pen1.contains(obj) || pen2.contains(obj)) {
            if (pen1.contains(obj)) {
              this.changeBrushOpacity(
                this.brushOpacityOptions.filter(
                  (opacity) => opacity.id === parseInt(pen1.value)
                )[0].value,
                0
              )
              this.drawToolBarColor = this.selectedColor.brush[0]
              this.drawToolBarWidth = this.selectedWidth.brush[0]
              this.changeType('brush', 0)
            } else if (pen2.contains(obj)) {
              this.changeBrushOpacity(
                this.brushOpacityOptions.filter(
                  (opacity) => opacity.id === parseInt(pen2.value)
                )[0].value,
                1
              )
              this.drawToolBarColor = this.selectedColor.brush[1]
              this.drawToolBarWidth = this.selectedWidth.brush[1]
              this.changeType('brush', 1)
            }
            this.showPanel = false
            document.removeEventListener('mouseup', this.showDrawTypePanel)
          } else if (!panel.contains(obj)) {
            this.showPanel = false
            document.removeEventListener('mouseup', this.showDrawTypePanel)
          }
          break
        }
        case 5: {
          const geometry1 = document.querySelector('#geometry1')
          const geometry2 = document.querySelector('#geometry2')
          if (geometry1.contains(obj) || geometry2.contains(obj)) {
            if (geometry1.contains(obj)) {
              this.selectedGeometryShape = this.geometryShapeOptions[0].id
            } else if (geometry2.contains(obj)) {
              this.selectedGeometryShape = this.geometryShapeOptions[1].id
            }
            this.showPanel = false
            document.removeEventListener('mouseup', this.showDrawTypePanel)
          } else if (!panel.contains(obj)) {
            this.showPanel = false
            document.removeEventListener('mouseup', this.showDrawTypePanel)
          }
          break
        }
      }
    },
    showDrawOptionPanel(e) {
      const obj = e.target
      let panel
      try {
        panel = document.querySelector(`#optionPanel${this.drawOptionToggle}`)
      } catch (e) { } // get panel element
      switch (this.drawOptionToggle) {
        case 7: {
          // selectedColor
          const colorPicker = document.querySelector('.color')
          if (colorPicker.contains(obj)) {
            switch (this.drawToolToggle) {
              case 2: {
                let index = this.penOptionToggle
                this.changeColor(
                  'brush',
                  this.rgb2Hex(e.target.style.backgroundColor),
                  --index
                )
                this.selectedColor.brush[index] = e.target.style.backgroundColor
                this.drawToolBarColor = e.target.style.backgroundColor
                break
              }
              case 3: {
                this.changeColor(
                  'text',
                  this.rgb2Hex(e.target.style.backgroundColor)
                )
                this.selectedColor.text = e.target.style.backgroundColor
                this.drawToolBarColor = e.target.style.backgroundColor
                break
              }
              case 5: {
                this.changeColor(
                  'geometry',
                  this.rgb2Hex(e.target.style.backgroundColor)
                )
                this.selectedColor.geometry = e.target.style.backgroundColor
                this.drawToolBarColor = e.target.style.backgroundColor
                break
              }
              case 6: {
                this.changeColor(
                  'line',
                  this.rgb2Hex(e.target.style.backgroundColor)
                )
                this.selectedColor.line = e.target.style.backgroundColor
                this.drawToolBarColor = e.target.style.backgroundColor
                break
              }
            }
            this.showOptionPanel = false
            this.drawOptionToggle = undefined
            document.removeEventListener('mouseup', this.showDrawOptionPanel)
          } else if (!panel.contains(obj)) {
            this.drawOptionToggle = undefined
            this.showOptionPanel = false
            document.removeEventListener('mouseup', this.showDrawOptionPanel)
          }
          break
        }
        case 8: {
          // selectedWidth
          if (Number.isInteger(e)) {
            switch (this.drawToolToggle) {
              case 2: {
                let index = this.penOptionToggle
                this.changeWidth('brush', e, --index)
                this.selectedWidth.brush[index] = e
                this.drawToolBarWidth = e
                break
              }
              case 5: {
                this.changeWidth('geometry', e)
                this.selectedWidth.geometry = e
                this.drawToolBarWidth = e
                break
              }
              case 6: {
                this.changeWidth('line', e)
                this.selectedWidth.line = e
                this.drawToolBarWidth = e
                break
              }
            }
          } else {
            // if (!panel.contains(obj))
            this.showOptionPanel = false
            this.drawOptionToggle = undefined
            document.removeEventListener('mouseup', this.showDrawOptionPanel)
          }
          break
        }
        case 9: {
          // selectedWidth.text
          if (panel.contains(obj) && Number.isInteger(obj.value)) {
            switch (this.drawToolToggle) {
              case 3:
                this.changeSize('text', obj.value)
                this.selectedWidth.text = obj.value
                this.drawToolBarTextSize = obj.value
                break
            }
          } else {
            this.showOptionPanel = false
            this.drawOptionToggle = undefined
            document.removeEventListener('mouseup', this.showDrawOptionPanel)
          }
          break
        }
      }
    },
    changeBrushOpacity(opacity, id) {
      PDFViewerApplication.eventBus.dispatch('changeBrushOpacity', {
        selectedOpacity: parseFloat(opacity),
        id,
      })
    },
    changeColor(type, value, id) {
      switch (type) {
        case 'brush':
          PDFViewerApplication.eventBus.dispatch('changeBrushColor', {
            selectedColor: value,
            id,
          })
          break
        case 'geometry':
          PDFViewerApplication.eventBus.dispatch('changeGeometryColor', value)
          break
        case 'text':
          PDFViewerApplication.eventBus.dispatch('changeTextColor', value)
          break
        case 'line':
          PDFViewerApplication.eventBus.dispatch('changeLineColor', value)
          break
      }
    },
    changeWidth(type, value, id) {
      switch (type) {
        case 'brush':
          PDFViewerApplication.eventBus.dispatch('changeBrushWidth', {
            selectedWidth: value,
            id,
          })
          break
        case 'geometry':
          PDFViewerApplication.eventBus.dispatch('changeGeometryWidth', value)
          break
        case 'line':
          PDFViewerApplication.eventBus.dispatch('changeLineWidth', value)
          break
      }
    },
    changeSize(type, value) {
      switch (type) {
        case 'text':
          PDFViewerApplication.eventBus.dispatch('changeTextSize', value)
          break
      }
    },
    changeType(type, id) {
      if (PDFViewerApplication.eventBus) {
        if (type === 'brush') {
          PDFViewerApplication.eventBus.dispatch('changeBrushType', id)
        }
      }
    },
    rgb2Hex(rgb) {
      if (rgb.charAt(0) === '#') {
        return rgb
      }
      return `#${rgb
        .match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)
        .slice(1)
        .map((n) => parseInt(n, 10).toString(16).padStart(2, '0'))
        .join('')}`
    },
    newRender(pageNumber, geometryMode, activeType) {
      if (geometryMode.geometry) {
        this.addAnnotateMB(91)
      } else if (geometryMode.arrow) {
        this.addAnnotateMB(93)
      } else if (geometryMode.line) {
        this.addAnnotateMB(94)
      } else if (activeType.text) {
        this.addAnnotateMB(92)
      } else if (activeType.pointer === 1) {
        this.setIsAllowTouchScrolling(false)
      } else if (activeType.pointer === 2) {
        this.setIsAllowTouchScrolling(true)
      }
    },
    openDialog(open) {
      const el = this.$refs.listContainer
      if (open) {
        el.style.top = `-${window.scrollY}px`
        el.style.position = 'fixed'
      } else {
        const scrollY = el.style.top
        el.style.position = ''
        el.style.top = ''
        window.scrollTo({ top: parseInt(scrollY || '0') * -1 })
      }
    },
    clearAllCanvas() {
      const elements = document.querySelectorAll('canvas')
      elements.forEach((element) => {
        if (element) {
          element.width = 0
          element.height = 0
          let ctx = element.getContext('2d')
          ctx && ctx.clearRect(0, 0, 1, 1)
          element.parentNode.removeChild(element)
          element = ctx = null
        }
      })
    },
    clearSelectedAnnotate() {
      this.selectedAnnotate = null
    },
    getPersonColor(person) {
      const index = person.id - 1
      return this.colorList[index] ?? '000000'
    },
    getViewerConfiguration() {
      return {
        vuePdf: this,
        appContainer: document.getElementById('appContainer'),
        mainContainer: document.getElementById('viewerContainer'),
        viewerContainer: document.getElementById('viewer'),
        eventBus: null,
        toolbar: {
          container: document.getElementById('toolbarViewer'),
          numPages: document.getElementById('numPages'),
          pageNumber: document.getElementById('pageNumber'),
          scaleSelectContainer: document.getElementById('scaleSelectContainer'),
          scaleSelect: document.getElementById('scaleSelect'),
          customScaleOption: document.getElementById('customScaleOption'),
          previous: document.getElementById('previous'),
          next: document.getElementById('next'),
          zoomIn: document.getElementById('zoomIn'),
          zoomOut: document.getElementById('zoomOut'),
          undo:
            document.getElementById('undo-mobile') ||
            document.getElementById('undo-draw') ||
            document.getElementById('undo'),
          redo:
            document.getElementById('redo-mobile') ||
            document.getElementById('redo-draw') ||
            document.getElementById('redo'),
          copy: document.getElementById('copy'),
          paste: document.getElementById('paste'),
          eraser: document.getElementById('eraser'),
          eraserDraw: document.getElementById('eraser-draw'),
          draw: document.getElementById('draw'),
          pointer: document.getElementById('pointer'),
        },
        drawer: {
          leftDrawerContainer: document.getElementById('leftDrawerContainer'),
          viewerContainer: document.getElementById('viewerContainer'),
          signButton: document.getElementById('signButton'),
          textButton: document.getElementById('textButton'),
          checkboxButton: document.getElementById('checkboxButton'),
          stampButton: document.getElementById('stampButton'),
          signDateButton: document.getElementById('signDateButton'),
          radioButton: document.getElementById('radioButton'),
          dropdownButton: document.getElementById('dropdownButton'),
          drawCanvasButton: document.getElementById('drawCanvasButton'),
          attachmentButton: document.getElementById('attachmentButton'),
          imageButton: document.getElementById('imageButton'),

          signatureBPButton: document.getElementById('signatureBPButton'),
          signatureBOButton: document.getElementById('signatureBOButton'),
          stampBPButton: document.getElementById('stampBPButton'),
          stampBOButton: document.getElementById('stampBOButton'),
          signatureAndStampButton: document.getElementById(
            'signatureAndStampButton'
          ),
          prefillTextButton: document.getElementById('prefillTextButton'),
          prefillCheckboxButton: document.getElementById(
            'prefillCheckboxButton'
          ),
          prefillRadioButton: document.getElementById('prefillRadioButton'),
          prefillAttachment: document.getElementById('prefillAttachment'),
        },
        sidebar: {
          // Divs (and sidebar button)
          rightDrawerContainer: document.getElementById('rightDrawerContainer'),
          viewerContainer: document.getElementById('viewerContainer'),
          // Views
          thumbnailView: document.getElementById('thumbnailView'),
          selectionView: document.getElementById('selectionView'),
          multifileView: document.getElementById('multifileView'),
        },
        selectionView: {
          title: document.getElementById('selectionViewTitle'),
          deleteButton: document.getElementById('deleteButton'),
          requiredButton: document.querySelector('.requiredButton'),
          readonlyButton: document.querySelector('.readonlyButton'),
          assgineeContainer: document.getElementById('assgineeContainer'),
          formatContainer: document.getElementById('formatContainer'),
          dateFormatContainer: document.getElementById('dateFormatContainer'),
          textContainer: document.getElementById('textContainer'),
          checkboxSizeContainer: document.getElementById(
            'checkboxSizeContainer'
          ),
          checkboxContainer: document.getElementById('checkboxContainer'),
          checkboxRuleContainer: document.getElementById(
            'checkboxRuleContainer'
          ),
          radioSizeContainer: document.getElementById('radioSizeContainer'),
          radioContainer: document.getElementById('radioContainer'),
          dropdownContainer: document.getElementById('dropdownContainer'),
          labelContainer: document.getElementById('labelContainer'),
          groupLabelContainer: document.getElementById('groupLabelContainer'),
          validationContainer: document.getElementById('validationContainer'),
          dateRangeContainer: document.getElementById('dateRangeContainer'),
          dateTextContainer: document.getElementById('dateTextContainer'),
          dateEraContainer: document.getElementById('dateEraContainer'),
          uploadAttachmentContainer: document.getElementById(
            'uploadAttachmentContainer'
          ),
          textAlignToggle: document.getElementById('textAlignToggle'),
        },
        loadingScreen: document.getElementById('loadingScreen'),
        selectedFileIndex: { page: this.selectedFile },
        fileList: this.fileList,
        commentList: this.comment,
        commentMode: { on: this.commentDrawer },
        mode: this.mode,
        peopleNames: this.peopleNames,
        selectId: this.selectId,
        colorList: this.colorList,
        annotateSignature: this.annotateSignature,
        keepAnnotationId: this.keepAnnotationId,
        i18n: {
          locale: this.$i18n.locale,
          attachAdded: this.$t('tooltip.attachAdded'),
          attachment: this.$t('button.attachment'),
          btnDelete: this.$t('button.delete'),
          change: this.$t('button.change'),
          checkbox: this.$t('button.checkbox'),
          checkboxGrp: this.$t('text.checkboxGrp'),
          clear: this.$t('button.clear'),
          date: this.$t('button.date'),
          dropdown: this.$t('button.dropdown'),
          email: this.$t('options.email'),
          fieldsSelected: this.$t('text.fieldsSelected'),
          idCard: this.$t('options.idCard'),
          image: this.$t('button.image'),
          invalidEmail: this.$t('message.invalidEmail'),
          invalidIdNumber: this.$t('message.invalidIdNumber'),
          invalidNumbers: this.$t('message.invalidNumbers'),
          invalidPhone: this.$t('message.invalidPhone2'),
          invalidPostalCode: this.$t('message.invalidPostalCode'),
          numbers: this.$t('options.numbers'),
          optional: this.$t('tooltip.optional'),
          phone: this.$t('options.phone'),
          postalCode: this.$t('options.postalCode'),
          radioBtn: this.$t('button.radioButton'),
          radioBtnGrp: this.$t('text.radioBtnGrp'),
          required: this.$t('tooltip.required'),
          select: this.$t('text.select'),
          selectAtLeast: this.$t('tooltip.selectAtLeast'),
          selectAtMost: this.$t('tooltip.selectAtMost'),
          selectExactly: this.$t('tooltip.selectExactly'),
          selectRange: this.$t('tooltip.selectRange'),
          sign: this.$t('button.sign2'),
          signature: this.$t('button.signature'),
          vertical: this.$t('button.vertical'),
          stamp: this.$t('button.stamp'),
          text: this.$t('button.text'),
          signatureBP: this.$t('button.signatureBP'),
          signatureBO: this.$t('button.signatureBO'),
          stampBP: this.$t('button.stampBP'),
          stampBO: this.$t('button.stampBO'),
          signatureAndStamp: this.$t('button.signatureAndStamp'),
          canvas: this.$t('button.canvas'),
          prefillText: this.$t('button.prefillText'),
          prefillCheckbox: this.$t('button.prefillCheckbox'),
          prefillRadio: this.$t('button.prefillRadio'),
          prefillAttachment: this.$t('button.prefillAttachment'),
          rocEra: this.$t('options.rocEra'),
          cancel: this.$t('button.cancel'),
          ok: this.$t('button.ok'),
        },
        watermark: this.watermark,
        role: this.role,
        control: this.control,
        selectedColor: this.selectedColor,
        selectedWidth: this.selectedWidth,
      }
    },
    webViewerLoad() {
      const config = this.getViewerConfiguration()
      Promise.all([import('./genericcom.js')]).then(() => {
        PDFViewerApplication.run(config)
      })
    },
    setPdfAnnotations(annotations) {
      if (this.pdfAnnotations[this.selectedFile - 1].length === 0) {
        this.pdfAnnotations[this.selectedFile - 1] = annotations
      } else {
        annotations.forEach((anno) => {
          if (
            !this.pdfAnnotations[this.selectedFile - 1].some(
              (a) => a.id === anno.id
            )
          ) {
            this.pdfAnnotations[this.selectedFile - 1].push(anno)
          }
        })
      }
      const totalPages = Number(
        document.querySelector('#numPages').textContent.split('/')[1]
      )
      // decalre room for commentAnnotations
      this.commentAnnotations[this.selectedFile - 1] = Array.from(
        {
          length: totalPages,
        },
        () => []
      )
      this.attachmentAnnotations[this.selectedFile - 1] = Array.from(
        {
          length: totalPages,
        },
        () => []
      )

      this.pdfAnnotations[this.selectedFile - 1].forEach((anno) => {
        if (anno.annotationType === 1) {
          this.commentAnnotations[this.selectedFile - 1][anno.page - 1].push(
            anno
          )
        } else if (anno.annotationType === 17) {
          this.attachmentAnnotations[this.selectedFile - 1][anno.page - 1].push(
            anno
          )
        }
      })
      if (this.comment.length > 0) {
        this.comment[this.selectedFile - 1].comment.forEach((anno) => {
          this.commentAnnotations[this.selectedFile - 1][anno.page - 1].push(
            anno
          )
        })
      }
      this.commentTotalCount = this.commentAnnotations[
        this.selectedFile - 1
      ].reduce((total, pageAnnotations) => total + pageAnnotations.length, 0)
      this.attachmentTotalCount = this.attachmentAnnotations[
        this.selectedFile - 1
      ].reduce((total, pageAnnotations) => total + pageAnnotations.length, 0)
    },
    jumpPdfAnnotation(anno) {
      try {
        // predecessors add
        if (anno.annotationType) {
          const height =
            anno.page * 10 +
            (anno.page - 1) *
            (document.querySelectorAll('.canvasWrapper')[0].clientHeight + 20)
          const annotateY = anno.viewRect ? anno.viewRect[1] : anno.rect[1] / 2
          document
            .querySelector('#viewerContainer')
            .scrollTo(0, height + annotateY - 200)
        }
        // self add
        else {
          const height =
            anno.page * 10 +
            (anno.page - 1) *
            (document.querySelectorAll('.canvasWrapper')[0].clientHeight +
              20) +
            anno.y
          document.querySelector('#viewerContainer').scrollTo(0, height - 100)
        }
        this.commentAction('focus', anno.id)
      } catch (e) {
        console.warn('jumpPdfAnnotation failed, pdf not rendered')
      }
    },
    addComment() {
      const page = parseInt(document.getElementById('pageNumber').value)
      const id =
        this.comment[this.selectedFile - 1].comment.length === 0
          ? 0
          : Math.max(
            ...this.comment[this.selectedFile - 1].comment.map(
              (obj) => obj.id
            )
          ) + 1
      let color
      if (this.commentAnnotations[this.selectedFile - 1].length === 0) {
        this.commentAnnotations[this.selectedFile - 1] = Array.from(
          {
            length: Number(
              document.querySelector('#numPages').textContent.split('/')[1]
            ),
          },
          () => []
        )
      }
      // get color
      if (this.mode === 1) {
        this.fileList.forEach((file) => {
          file.annotate.forEach((anno) => {
            anno.data.forEach((ele) => {
              if (ele.color) color = ele.color
            })
          })
        })
      }

      const now = new Date()
      let x = 0
      let y = 0

      const window = document.querySelector('#viewerContainer')
      const scrollTop = document.querySelector('#viewerContainer').scrollTop
      const totalPage = Number(
        document.querySelector('#numPages').textContent.split('/')[1]
      )
      let pagesHeight = 0
      let lastPagesHeight = 0
      for (let i = 0; i < totalPage; i++) {
        const currentPageWidth =
          document.querySelectorAll('.page')[i].clientWidth

        // 若ＰＤＦ縮小，至ＰＤＦ比畫面小
        if (currentPageWidth < window.clientWidth) {
          x = currentPageWidth * 0.8
        } else {
          x = (window.clientWidth + window.scrollLeft) * 0.8
        }
        pagesHeight += document.querySelectorAll('.page')[i].clientHeight

        // 第一頁
        if (scrollTop <= pagesHeight && page === 0) {
          y = scrollTop + 80
          break
        }

        // 換頁之間，上頁還沒跑完，頁數已是下頁
        if (scrollTop < pagesHeight && page - 2 === i) {
          y = 80
          break
        }

        // 其他頁
        if (scrollTop < pagesHeight && page - 1 === i) {
          y = scrollTop - lastPagesHeight + 80
          break
        }

        lastPagesHeight = pagesHeight
      }

      const newComment = {
        id,
        content: this.newComment,
        page,
        x,
        y,
        color,
        createDate: `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(
          2,
          '0'
        )}/${String(now.getDate()).padStart(2, '0')} ${String(
          now.getHours()
        ).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
        user: this.mode === 1 ? this.signPeopleName : this.userInfo.account,
      }
      PDFViewerApplication.eventBus.dispatch('addPdfAnnotation', {
        selectedFile: this.selectedFile,
        newComment,
      })
      this.commentAnnotations[this.selectedFile - 1][page - 1].push(newComment)
      this.newComment = ''
      this.commentTotalCount =
        this.commentAnnotations[this.selectedFile - 1].flat(Infinity).length
      this.commentAction('focus', id)
    },
    commentAction(act, id) {
      if (act === 'focus') {
        PDFViewerApplication.eventBus.dispatch('focusPdfAnnotation', id)
      }
      if (act === 'delete') {
        // delete in this.comment
        this.comment[this.selectedFile - 1].comment = this.comment[
          this.selectedFile - 1
        ].comment.filter((x) => x.id !== id)

        // delete in this.commentAnnotations
        this.commentAnnotations[this.selectedFile - 1].forEach((page) => {
          const index = page.findIndex((obj) => obj.id === id)
          if (index !== -1) {
            page.splice(index, 1)
          }
        })

        // delete in fabric
        PDFViewerApplication.eventBus.dispatch('removePdfAnnotation', id)

        // minus commentTotalCount
        --this.commentTotalCount
      }
      this.$forceUpdate()
    },
    async fetchSignature() {
      if (this.isLogin === true && this.isInPersonSign === false) {
        await this.$apiRepository(this.$i18n.locale)
          .user.myInfo.get()
          .then((result) => {
            if (
              result !== null &&
              result.errorCode === 200 &&
              result.body !== null
            ) {
              this.signatureCount = result.body.signatureCount
              this.stampCount = result.body.stampCount
            }
          })

        const result = await this.$apiRepository(
          this.$i18n.locale
        ).signature.signatureList.get()
        if (
          result !== null &&
          result.errorCode === 200 &&
          result.body !== null
        ) {
          this.signatureList = result.body.signatureList
        }
      }
    },

    async fetchStamp() {
      if (this.isLogin === true && this.isInPersonSign === false) {
        await this.$apiRepository(this.$i18n.locale)
          .user.myInfo.get()
          .then((result) => {
            if (
              result !== null &&
              result.errorCode === 200 &&
              result.body !== null
            ) {
              this.signatureCount = result.body.signatureCount
              this.stampCount = result.body.stampCount
            }
          })

        const result = await this.$apiRepository(
          this.$i18n.locale
        ).signature.stampList.get()
        if (
          result !== null &&
          result.errorCode === 200 &&
          result.body !== null
        ) {
          this.stampList = result.body.stampList
        }
      }
    },
    addSignature() {
      if (this.signatureDialogToggle === 0) {
        const canvas = document.getElementById('ppCanvas')
        if (this.mode !== 5) {
          PDFViewerApplication.addSignature({
            page: this.annotateSignature.page,
            base64: canvas.toDataURL(),
            width: this.annotateSignature.width,
            height: this.annotateSignature.height,
            top: this.annotateSignature.top,
            left: this.annotateSignature.left,
            id: this.annotateSignature.id,
            scale: this.annotateSignature.scale,
            type: this.annotateSignature.type,
            textDirection: this.annotateSignature.textDirection,
          })
        } else {
          PDFViewerApplication.addDoneAnnotate({
            state: 1,
            data: { base64: canvas.toDataURL() },
          })
        }
      } else if (this.mode !== 5) {
        PDFViewerApplication.addSignature({
          page: this.annotateSignature.page,
          base64: this.$refs.signature.save(),
          width: this.annotateSignature.width,
          height: this.annotateSignature.height,
          top: this.annotateSignature.top,
          left: this.annotateSignature.left,
          id: this.annotateSignature.id,
          scale: this.annotateSignature.scale,
          type: this.annotateSignature.type,
          textDirection: this.annotateSignature.textDirection,
        })
      } else {
        PDFViewerApplication.addDoneAnnotate({
          state: 1,
          data: { base64: this.$refs.signature.save() },
        })
      }
      this.$emit('showSignDialogTour', 'submit')
      this.cancelSignature()
    },

    chooseSignature() {
      if (this.signatureMode === 0) {
        if (this.mode !== 5) {
          PDFViewerApplication.addSignature({
            page: this.annotateSignature.page,
            base64: this.signatureList[this.selectedSignature].content,
            width: this.annotateSignature.width,
            height: this.annotateSignature.height,
            top: this.annotateSignature.top,
            left: this.annotateSignature.left,
            id: this.annotateSignature.id,
            scale: this.annotateSignature.scale,
            type: this.annotateSignature.type,
            textDirection: this.annotateSignature.textDirection,
          })
        } else {
          PDFViewerApplication.addDoneAnnotate({
            state: 1,
            data: {
              base64: this.signatureList[this.selectedSignature].content,
            },
          })
        }
      }
      this.cancelSignature()
    },
    async doSignature(on, annotate = null, signatureMode = 0) {
      await this.fetchSignature()
      this.option.penColor = this.paintColor
      this.annotateSignature = on ? annotate : null
      this.textDirection = this.option.textDirection =
        annotate?.textDirection || false
      this.signatureDialog = !!on
      if (on) {
        this.$emit('showSignDialogTour', 'start')
      }
      if (this.signatureDialog === true && this.$utils.isMobile(false)) {
        const self = this
        this.resizeListener = annotate?.textDirection
          ? this.$pleaserotatePortrait().start()
          : this.$pleaserotateLandscape().start()
        this.$once('hook:beforeDestroy', () => {
          self.$pleaserotatePortrait().destroy()
          self.$pleaserotateLandscape().destroy()
          self.resizeListener.abort()
        })
      }
      this.signatureMode = on ? signatureMode : 0
      this.signatureDialogToggle = this.$vuetify.breakpoint.mdAndDown
        ? 1
        : this.signatureDialogToggle
      this.notFinishSignature = true
      this.signatureTemp = null
      this.selectedSignature = 0
      this.isAddSignature = false
      if (
        this.isLogin === false ||
        this.signatureCount <= 0 ||
        this.isInPersonSign === true
      ) {
        this.$nextTick(() => {
          this.$nuxt.$loading.start()
          if (this.signatureDialogToggle === 0) {
            const canvas = document.getElementById('ppCanvas')
            if (canvas) {
              const context = canvas.getContext('2d')
              context.clearRect(0, 0, canvas.width, canvas.height)
            }
          } else if (this.$refs.signature) {
            const canvas = document.getElementById(
              `canvas${this.$refs.signature._uid}`
            )
            setTimeout(() => {
              const canvasContainer = document.getElementById('signatureBoard')
              const ratio = Math.max(window.devicePixelRatio || 1, 1)
              const aspectRatio = this.textDirection ? 1 / 2 : 2 / 1
              if (canvasContainer) {
                let height =
                  document.documentElement.clientHeight -
                  (this.getIsLandscape() && this.$utils.isMobile(false)
                    ? 40
                    : 180)
                let width =
                  document.querySelector('.signatureCanvasDialog').clientWidth -
                  (this.getIsLandscape() && this.$utils.isMobile(false)
                    ? 145
                    : 40)
                const maxWidth = 600
                height = Math.min(height, maxWidth)
                width = Math.min(width, maxWidth)
                if (this.textDirection) {
                  canvasContainer.style.width = height * aspectRatio + 'px'
                  canvasContainer.style.height = height + 'px'
                } else {
                  canvasContainer.style.width = width + 'px'
                  canvasContainer.style.height = width / aspectRatio + 'px'
                }
                setTimeout(() => {
                  const tempWidth = canvasContainer.offsetWidth
                  const tempHeight = canvasContainer.offsetHeight
                  const offsetWidth = this.textDirection
                    ? Math.min(tempWidth, tempHeight)
                    : Math.max(tempWidth, tempHeight)
                  const offsetHeight = this.textDirection
                    ? Math.max(tempWidth, tempHeight)
                    : Math.min(tempWidth, tempHeight)
                  canvas.width = offsetWidth * ratio
                  canvas.height = offsetHeight * ratio
                  canvas.getContext('2d').scale(ratio, ratio)
                  this.$refs.signature.clearTemp()
                  this.$refs.signature.fromData(this.signatureTemp)
                }, 500)
              }
            }, 10)
          }
        })
        if (this.signatureDialogToggle === 0) {
          this.$nextTick(async () => {
            const result = await this.autoinitialDevice()
            if (!result) {
              this.signatureDialogToggle = 1
            }
          })
        } else {
          this.$nextTick(() => {
            this.$nuxt.$loading.finish()
          })
        }
      }
    },

    cancelSignature() {
      this.$pleaserotateLandscape().destroy()
      if (this.resizeListener) {
        this.resizeListener.abort()
      }
      this.isAddSignature = false
      this.signatureDialog = false
      this.selectedSignature = 0
      this.uninitDevice()
      if (this.$refs.signature) {
        this.$refs.signature.clearTemp()
      }
      this.signatureTemp = null
    },

    openAddSignatureDialog() {
      this.isAddSignature = true
      this.signatureTemp = null
      if (this.mode !== 1) {
        this.textDirection = this.option.textDirection = false
      }
      this.$nextTick(() => {
        this.$nuxt.$loading.start()
        if (this.signatureDialogToggle === 0) {
          const canvas = document.getElementById('ppCanvas')
          if (canvas) {
            const context = canvas.getContext('2d')
            context.clearRect(0, 0, canvas.width, canvas.height)
          }
        } else if (this.$refs.signature) {
          const canvas = document.getElementById(
            `canvas${this.$refs.signature._uid}`
          )
          setTimeout(() => {
            const canvasContainer = document.getElementById('signatureBoard')
            const ratio = Math.max(window.devicePixelRatio || 1, 1)
            const aspectRatio = this.textDirection ? 1 / 2 : 2 / 1
            if (canvasContainer) {
              let height =
                document.documentElement.clientHeight -
                (this.getIsLandscape() && this.$utils.isMobile(false)
                  ? 40
                  : 180)
              let width =
                document.querySelector('.signatureCanvasDialog').clientWidth -
                (this.getIsLandscape() && this.$utils.isMobile(false)
                  ? 145
                  : 40)
              const maxWidth = 600
              height = Math.min(height, maxWidth)
              width = Math.min(width, maxWidth)
              if (this.textDirection) {
                canvasContainer.style.width = height * aspectRatio + 'px'
                canvasContainer.style.height = height + 'px'
              } else {
                canvasContainer.style.width = width + 'px'
                canvasContainer.style.height = width / aspectRatio + 'px'
              }
              setTimeout(() => {
                const tempWidth = canvasContainer.offsetWidth
                const tempHeight = canvasContainer.offsetHeight
                const offsetWidth = this.textDirection
                  ? Math.min(tempWidth, tempHeight)
                  : Math.max(tempWidth, tempHeight)
                const offsetHeight = this.textDirection
                  ? Math.max(tempWidth, tempHeight)
                  : Math.min(tempWidth, tempHeight)
                canvas.width = offsetWidth * ratio
                canvas.height = offsetHeight * ratio
                canvas.getContext('2d').scale(ratio, ratio)
                this.$refs.signature.clearTemp()
                this.$refs.signature.fromData(this.signatureTemp)
              }, 500)
            }
          }, 10)
        }
        if (this.getIsLandscape() && this.$utils.isMobile(false)) {
          this.$emit('showSignDialogTour', 'finishMobile')
        } else if (this.$utils.isMobile(true)) {
          this.$emit('showSignDialogTour', 'finish')
        } else {
          this.$emit('showSignDialogTour', 'qrcode')
        }
      })
      if (this.signatureDialogToggle === 0) {
        this.$nextTick(async () => {
          const result = await this.autoinitialDevice()
          if (!result) {
            this.signatureDialogToggle = 1
          }
        })
      } else {
        this.$nextTick(() => {
          this.$nuxt.$loading.finish()
        })
      }
    },
    addStamp() {
      if (this.stampFile === null) {
        this.$notifier.showMessage({
          message: this.$t('message.noImg'),
          color: 'red',
        })
        return
      }
      if (this.mode !== 5) {
        PDFViewerApplication.addStamp({
          page: this.annotateStamp.page,
          base64: this.stampFile,
          width: this.annotateStamp.width,
          height: this.annotateStamp.height,
          top: this.annotateStamp.top,
          left: this.annotateStamp.left,
          id: this.annotateStamp.id,
          scale: this.annotateStamp.scale,
          type: this.annotateStamp.type,
          textDirection: this.annotateStamp.textDirection,
        })
      } else {
        PDFViewerApplication.addDoneAnnotate({
          state: 4,
          data: { base64: this.stampFile },
        })
      }
      this.cancelStamp()
    },

    chooseStamp() {
      if (this.stampMode === 0) {
        if (this.mode !== 5) {
          PDFViewerApplication.addStamp({
            page: this.annotateStamp.page,
            base64: this.stampList[this.selectedStamp].content,
            width: this.annotateStamp.width,
            height: this.annotateStamp.height,
            top: this.annotateStamp.top,
            left: this.annotateStamp.left,
            id: this.annotateStamp.id,
            scale: this.annotateStamp.scale,
            type: this.annotateStamp.type,
            textDirection: this.annotateStamp.textDirection,
          })
        } else {
          PDFViewerApplication.addDoneAnnotate({
            state: 4,
            data: { base64: this.stampList[this.selectedStamp].content },
          })
        }
      }
      this.cancelStamp()
    },

    async doStamp(on, annotate = null, stampMode = 0) {
      await this.fetchStamp()
      this.annotateStamp = on ? annotate : null
      this.stampFile = null
      this.addStampDialog = !!on
      this.stampMode = on ? stampMode : 0
      this.selectedStamp = 0
      this.isAddStamp = false
    },

    openAddStampDialog() {
      this.isAddStamp = true
      this.stampFile = null
    },

    cancelStamp() {
      this.stampFile = null
      this.isAddStamp = false
      this.addStampDialog = false
      this.selectedStamp = 0
    },

    doSignatureAndStamp(on, annotate = null) {
      this.addSignatureAndStampDialog = !!on
      this.annotateSignatureAndStamp = on ? annotate : null
    },

    cancelSignatureAndStamp() {
      this.addSignatureAndStampDialog = false
    },

    chooseSignatureAndStamp(type) {
      this.addSignatureAndStampDialog = false
      if (type === 'signature') {
        this.doSignature(true, this.annotateSignatureAndStamp)
      } else if (type === 'stamp') {
        this.doStamp(true, this.annotateSignatureAndStamp)
      }
    },

    clear() {
      if (this.signatureDialogToggle === 0) {
        if (this.isPolling === true) {
          this.clearInk()
        }
      } else {
        this.signatureTemp = null
        this.notFinishSignature = true
        if (this.$refs.signature) {
          this.$refs.signature.clear()
        }
      }
    },
    resizeCanvas() {
      if (!this.$refs.signature) {
        return
      }
      const canvas = document.getElementById(
        `canvas${this.$refs.signature._uid}`
      )
      if (canvas) {
        let temp = null
        if (this.$refs.signature.isEmpty() === false) {
          temp = this.$refs.signature.getTrack()
          if (temp != null && temp.length > 0) {
            this.signatureTemp = temp
          }
        }
        setTimeout(() => {
          const canvasContainer = document.getElementById('signatureBoard')
          const ratio = Math.max(window.devicePixelRatio || 1, 1)
          const aspectRatio = this.textDirection ? 1 / 2 : 2 / 1
          if (canvasContainer) {
            let height =
              document.documentElement.clientHeight -
              (this.getIsLandscape() && this.$utils.isMobile(false) ? 40 : 180)
            let width =
              document.querySelector('.signatureCanvasDialog').clientWidth -
              (this.getIsLandscape() && this.$utils.isMobile(false) ? 145 : 40)
            const maxWidth = 600
            height = Math.min(height, maxWidth)
            width = Math.min(width, maxWidth)
            if (this.textDirection) {
              canvasContainer.style.width = height * aspectRatio + 'px'
              canvasContainer.style.height = height + 'px'
            } else {
              canvasContainer.style.width = width + 'px'
              canvasContainer.style.height = width / aspectRatio + 'px'
            }
            setTimeout(() => {
              const tempWidth = canvasContainer.offsetWidth
              const tempHeight = canvasContainer.offsetHeight
              const offsetWidth = this.textDirection
                ? Math.min(tempWidth, tempHeight)
                : Math.max(tempWidth, tempHeight)
              const offsetHeight = this.textDirection
                ? Math.max(tempWidth, tempHeight)
                : Math.min(tempWidth, tempHeight)
              canvas.width = offsetWidth * ratio
              canvas.height = offsetHeight * ratio
              canvas.getContext('2d').scale(ratio, ratio)
              this.$refs.signature.clearTemp()
              this.$refs.signature.fromData(this.signatureTemp)
            }, 500)
          }
        }, 10)
      }
    },
    async autoinitialDevice() {
      for (let i = 0; i < this.ppSignList.length; i++) {
        const id = this.ppSignList[i].ppId
        const canvas = document.getElementById('ppCanvas')
        if (canvas) {
          const apiUrl = 'http://localhost:8089/PPSignSDK/'
          const initUrl =
            apiUrl +
            `InitialDevice?id=${id}&width=${canvas.width}&height=${canvas.height}`
          if (this.isPolling === false) {
            this.controller = new AbortController()
            const abortId = setTimeout(() => this.controller.abort(), 2000)
            await fetch(initUrl, { signal: this.controller.signal })
              .then(async (response) => {
                clearTimeout(abortId)
                const result = await response.json()
                if (result === true) {
                  this.$nuxt.$loading.finish()
                  this.ppSignId = i
                  this.isPolling = true
                  this.getInk()
                  this.getStatus()
                  this.getDeviceWidth()
                  this.getDeviceHeight()
                  this.getDevicePressure()
                  this.getDeviceName()
                  this.$notifier.showMessage({
                    message: this.$t('message.handwritingPadInitialized'),
                    color: 'red',
                  })
                  if (!this.isLogin) {
                    localStorage.setItem('noLoginUseHandWriting', 'true')
                  }
                  return true
                }
              })
              .catch((e) => {
                if (!this.isLogin) {
                  localStorage.setItem('noLoginUseHandWriting', 'false')
                }
                return false
              })
          }
        }
      }

      if (this.isPolling === false) {
        this.$nuxt.$loading.finish()
        this.isPolling = false
        this.$notifier.showMessage({
          message: this.$t('message.handwritingPadNotDetected'),
          color: 'red',
        })
        if (!this.isLogin) {
          localStorage.setItem('noLoginUseHandWriting', 'false')
        }
        return false
      } else {
        this.$nuxt.$loading.finish()
        return true
      }
    },
    async initialDevice() {
      const id = this.ppSignList[this.ppSignId].ppId
      const canvas = document.getElementById('ppCanvas')
      const apiUrl = 'http://localhost:8089/PPSignSDK/'
      const initUrl =
        apiUrl +
        `InitialDevice?id=${id}&width=${canvas.width}&height=${canvas.height}`
      if (this.isPolling === false) {
        this.controller = new AbortController()
        const abortId = setTimeout(() => this.controller.abort(), 2000)
        await fetch(initUrl, { signal: this.controller.signal })
          .then(async (response) => {
            clearTimeout(abortId)
            const result = await response.json()
            if (result === true) {
              this.isPolling = true
              this.getInk()
              this.getStatus()
              this.getDeviceWidth()
              this.getDeviceHeight()
              this.getDevicePressure()
              this.getDeviceName()
              this.$notifier.showMessage({
                message: this.$t('message.handwritingPadInitialized'),
                color: 'red',
              })
              if (!this.isLogin) {
                localStorage.setItem('noLoginUseHandWriting', 'true')
              }
              return true
            } else {
              this.isPolling = false
              if (!this.isLogin) {
                localStorage.setItem('noLoginUseHandWriting', 'false')
              }
              this.$notifier.showMessage({
                message: this.$t('message.handwritingPadNotDetected'),
                color: 'red',
              })
            }
          })
          .catch((e) => {
            this.isPolling = false
            if (!this.isLogin) {
              localStorage.setItem('noLoginUseHandWriting', 'false')
            }
            this.$notifier.showMessage({
              message: this.$t('message.handwritingPadNotDetected'),
              color: 'red',
            })
          })
      }
    },
    async uninitDevice() {
      this.notFinishSignature = true
      if (this.isPolling) {
        this.isPolling = false
        const id = this.ppSignList[this.ppSignId].ppId
        const apiUrl = 'http://localhost:8089/PPSignSDK/'
        const uninitUrl = apiUrl + `UninitialDevice?id=${id}`
        this.controller = new AbortController()
        const abortId = setTimeout(() => this.controller.abort(), 2000)
        await fetch(uninitUrl, { signal: this.controller.signal }).then(
          async (response) => {
            clearTimeout(abortId)
            const result = await response.json()
            if (result === true) {
              const canvas = document.getElementById('ppCanvas')
              if (canvas) {
                const context = canvas.getContext('2d')
                context.clearRect(0, 0, canvas.width, canvas.height)
              }
            }
          }
        )
      }
    },
    getInk() {
      const apiUrl = 'http://localhost:8089/PPSignSDK/'
      const getInkUrl = apiUrl + 'GetInks'
      const timeId = setTimeout(async () => {
        clearTimeout(timeId)
        if (this.isPolling) {
          this.controller = new AbortController()
          const abortId = setTimeout(() => this.controller.abort(), 2000)
          await fetch(getInkUrl, { signal: this.controller.signal })
            .then(async (response) => {
              clearTimeout(abortId)
              const data = await response.json()
              const dataInfos = JSON.parse(data)
              dataInfos.forEach((value) => {
                if (value.EventType === 0) {
                  this.drawImage(value.Image)
                  this.LastSignatureBase64Data = value.Image
                }
              })
            })
            .then(() => {
              if (this.isPolling) {
                this.getInk()
              }
            })
        }
      }, 50)
    },
    getStatus() {
      const apiUrl = 'http://localhost:8089/PPSignSDK/'
      const confirmStatusUrl = apiUrl + 'GetDeviceConfirmOrCancelKeyStatus'
      const timeId = setTimeout(async () => {
        clearTimeout(timeId)
        if (this.isPolling) {
          this.controller = new AbortController()
          const abortId = setTimeout(() => this.controller.abort(), 2000)
          await fetch(confirmStatusUrl, { signal: this.controller.signal })
            .then(async (response) => {
              clearTimeout(abortId)
              const result = await response.json()
              if (result === '1') {
                this.addSignature()
              } else if (result === '0') {
                this.clearInk()
              }
            })
            .then(() => {
              if (this.isPolling) {
                this.getStatus()
              }
            })
        }
      }, 500)
    },
    async getDeviceWidth() {
      const apiUrl = 'http://localhost:8089/PPSignSDK/'
      const getDeviceInfoUrl = apiUrl + 'GetDeviceInfo?type=2'
      this.controller = new AbortController()
      const abortId = setTimeout(() => this.controller.abort(), 2000)
      await fetch(getDeviceInfoUrl, { signal: this.controller.signal }).then(
        async (response) => {
          clearTimeout(abortId)
          const result = await response.json()
          const data = result.split(',')
          if (data && data.length > 1) {
            this.ppSignWidth = data[1]
          }
        }
      )
    },
    async getDeviceHeight() {
      const apiUrl = 'http://localhost:8089/PPSignSDK/'
      const getDeviceInfoUrl = apiUrl + 'GetDeviceInfo?type=3'
      this.controller = new AbortController()
      const abortId = setTimeout(() => this.controller.abort(), 2000)
      await fetch(getDeviceInfoUrl, { signal: this.controller.signal }).then(
        async (response) => {
          clearTimeout(abortId)
          const result = await response.json()
          const data = result.split(',')
          if (data && data.length > 1) {
            this.ppSignHeight = data[1]
          }
        }
      )
    },
    async getDevicePressure() {
      const apiUrl = 'http://localhost:8089/PPSignSDK/'
      const getDeviceInfoUrl = apiUrl + 'GetDeviceInfo?type=4'
      this.controller = new AbortController()
      const abortId = setTimeout(() => this.controller.abort(), 2000)
      await fetch(getDeviceInfoUrl, { signal: this.controller.signal }).then(
        async (response) => {
          clearTimeout(abortId)
          const result = await response.json()
          const data = result.split(',')
          if (data && data.length > 1) {
            this.ppSignPressure = data[1]
          }
        }
      )
    },
    async getDeviceName() {
      const apiUrl = 'http://localhost:8089/PPSignSDK/'
      const getDeviceInfoUrl = apiUrl + 'GetDeviceInfo?type=6'
      this.controller = new AbortController()
      const abortId = setTimeout(() => this.controller.abort(), 2000)
      await fetch(getDeviceInfoUrl, { signal: this.controller.signal }).then(
        async (response) => {
          clearTimeout(abortId)
          const result = await response.json()
          const data = result
          if (data) {
            this.ppSignName = data
          }
        }
      )
    },
    drawImage(base64) {
      let dataUrl = 'data:image/png;base64,'

      dataUrl = dataUrl + base64

      const img = new Image()

      const initImage =
        'iVBORw0KGgoAAAANSUhEUgAAAjAAAAEsCAYAAADdDYkSAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAATzSURBVHhe7cgxDcBAEASx50/6QmABTCQXbvzuDgDgV2YCAJTNBAAomwkAUDYTAKBsJgBA2UwAgLKZAABlMwEAymYCAJTNBAAomwkAUDYTAKBsJgBA2UwAgLKZAABlMwEAymYCAJTNBAAomwkAUDYTAKBsJgBA2UwAgLKZAABlMwEAymYCAJTNBAAomwkAUDYTAKBsJgBA2UwAgLKZAABlMwEAymYCAJTNBAAomwkAUDYTAKBsJgBA2UwAgLKZAABlMwEAymYCAJTNBAAomwkAUDYTAKBsJgBA2UwAgLKZAABlMwEAymYCAJTNBAAomwkAUDYTAKBsJgBA2UwAgLKZAABlMwEAymYCAJTNBAAomwkAUDYTAKBsJgBA2UwAgLKZAABlMwEAymYCAJTNBAAomwkAUDYTAKBsJgBA2UwAgLKZAABlMwEAymYCAJTNBAAomwkAUDYTAKBsJgBA2UwAgLKZAABlMwEAymYCAJTNBAAomwkAUDYTAKBsJgBA2UwAgLKZAABlMwEAymYCAJTNBAAomwkAUDYTAKBsJgBA2UwAgLKZAABlMwEAymYCAJTNBAAomwkAUDYTAKBsJgBA2UwAgLKZAABlMwEAymYCAJTNBAAomwkAUDYTAKBsJgBA2UwAgLKZAABlMwEAymYCAJTNBAAomwkAUDYTAKBsJgBA2UwAgLKZAABlMwEAymYCAJTNBAAomwkAUDYTAKBsJgBA2UwAgLKZAABlMwEAymYCAJTNBAAomwkAUDYTAKBsJgBA2UwAgLKZAABlMwEAymYCAJTNBAAomwkAUDYTAKBsJgBA2UwAgLKZAABlMwEAymYCAJTNBAAomwkAUDYTAKBsJgBA2UwAgLKZAABlMwEAymYCAJTNBAAomwkAUDYTAKBsJgBA2UwAgLKZAABlMwEAymYCAJTNBAAomwkAUDYTAKBsJgBA2UwAgLKZAABlMwEAymYCAJTNBAAomwkAUDYTAKBsJgBA2UwAgLKZAABlMwEAymYCAJTNBAAomwkAUDYTAKBsJgBA2UwAgLKZAABlMwEAymYCAJTNBAAomwkAUDYTAKBsJgBA2UwAgLKZAABlMwEAymYCAJTNBAAomwkAUDYTAKBsJgBA2UwAgLKZAABlMwEAymYCAJTNBAAomwkAUDYTAKBsJgBA2UwAgLKZAABlMwEAymYCAJTNBAAomwkAUDYTAKBsJgBA2UwAgLKZAABlMwEAymYCAJTNBAAomwkAUDYTAKBsJgBA2UwAgLKZAABlMwEAymYCAJTNBAAomwkAUDYTAKBsJgBA2UwAgLKZAABlMwEAymYCAJTNBAAomwkAUDYTAKBsJgBA2UwAgLKZAABlMwEAymYCAJTNBAAomwkAUDYTAKBsJgBA2UwAgLKZAABlMwEAymYCAJTNBAAomwkAUDYTAKBsJgBA2UwAgLKZAABlMwEAymYCAJTNBAAomwkAUDYTAKBsJgBA2UwAgLKZAABlMwEAymYCAJTNBAAomwkAUDYTAKBsJgBA2UwAgLKZAABlMwEAymYCAJTNBAAomwkAUDYTAKBsJgBA2UwAgLKZAABlMwEAymYCAJTNBAAomwkAUDYTAKBsJgBA2UwAgLKZAABlMwEAymYCAJTNBAAomwkAUDYTAKBsJgBA2UwAgLKZAABlMwEAymYCAJTNBAAomwkA0HXvA1o7giiPT6HeAAAAAElFTkSuQmCC'
      if (base64 !== initImage) {
        this.notFinishSignature = false
      }

      img.addEventListener(
        'load',
        () => {
          const canvas = document.getElementById('ppCanvas')
          if (canvas) {
            const context = canvas.getContext('2d')
            context.drawImage(img, 0, 0, canvas.width, canvas.height)
          }
        },
        false
      )

      img.src = dataUrl
    },
    async clearInk() {
      const apiUrl = 'http://localhost:8089/PPSignSDK/'
      const clrInkUrl = apiUrl + 'Clear'
      this.controller = new AbortController()
      const abortId = setTimeout(() => this.controller.abort(), 2000)
      await fetch(clrInkUrl, { signal: this.controller.signal }).then(
        (response) => {
          clearTimeout(abortId)
          const canvas = document.getElementById('ppCanvas')
          const context = canvas.getContext('2d')
          context.clearRect(0, 0, canvas.width, canvas.height)
          this.notFinishSignature = true
        }
      )
    },
    async getPointer() {
      const apiUrl = 'http://localhost:8089/PPSignSDK/'
      this.pointContent = []
      const getpointUrl = apiUrl + 'GetPointer'
      this.controller = new AbortController()
      const abortId = setTimeout(() => this.controller.abort(), 2000)
      await fetch(getpointUrl, { signal: this.controller.signal }).then(
        async (response) => {
          clearTimeout(abortId)
          const result = await response.json()
          this.pointContent = JSON.parse(result)
        }
      )
    },
    async getEncodeSVG() {
      const apiUrl = 'http://localhost:8089/PPSignSDK/'
      this.svgContent = []
      const getEncodeUrl = apiUrl + 'Encode?type=8'
      this.controller = new AbortController()
      const abortId = setTimeout(() => this.controller.abort(), 2000)
      await fetch(getEncodeUrl, { signal: this.controller.signal })
        .then(async (response) => {
          clearTimeout(abortId)
          const result = await response.json()
          this.svgContent = atob(result)
        })
        .catch((e) => {
          console.log(e)
          this.svgContent = []
        })
    },
    setSelection(evt) {
      if (evt) {
        this.selection = evt.selection
        this.selectionSource = evt.source
        if (this.mode === 0 && this.$vuetify.breakpoint.mdAndDown) {
          const appRect = document
            .getElementById('appContainer')
            .getBoundingClientRect()
          const annotateTool = document.getElementById('annotateTool')
          annotateTool.style.setProperty('display', 'flex')
          if (
            (!evt.checkboxGroup || evt.checkboxGroup.length <= 0) &&
            (!evt.radioGroup || evt.radioGroup.length <= 0)
          ) {
            annotateTool.style.setProperty(
              'left',
              evt.position.left -
              appRect.left +
              evt.selection.width / 2 -
              annotateTool.clientWidth / 2 +
              'px'
            )
            annotateTool.style.setProperty(
              'top',
              evt.position.top - appRect.top + evt.selection.height + 20 + 'px'
            )
          } else if (evt.checkboxGroup && evt.checkboxGroup.length > 0) {
            const top =
              evt.rect.top +
              Math.min.apply(
                Math,
                evt.checkboxGroup.map(function (child) {
                  return child.y
                })
              )
            const left =
              evt.rect.left +
              Math.min.apply(
                Math,
                evt.checkboxGroup.map(function (child) {
                  return child.x
                })
              )
            const width =
              Math.max.apply(
                Math,
                evt.checkboxGroup.map(function (child) {
                  return child.x
                })
              ) +
              evt.checkboxGroup[0].width -
              Math.min.apply(
                Math,
                evt.checkboxGroup.map(function (child) {
                  return child.x
                })
              )
            const height =
              Math.max.apply(
                Math,
                evt.checkboxGroup.map(function (child) {
                  return child.y
                })
              ) +
              evt.checkboxGroup[0].height -
              Math.min.apply(
                Math,
                evt.checkboxGroup.map(function (child) {
                  return child.y
                })
              )
            annotateTool.style.setProperty(
              'left',
              left -
              appRect.left +
              width / 2 -
              annotateTool.clientWidth / 2 +
              'px'
            )
            annotateTool.style.setProperty(
              'top',
              top - appRect.top + height + 30 + 'px'
            )
          } else if (evt.radioGroup && evt.radioGroup.length > 0) {
            const top =
              evt.rect.top +
              Math.min.apply(
                Math,
                evt.radioGroup.map(function (child) {
                  return child.y
                })
              )
            const left =
              evt.rect.left +
              Math.min.apply(
                Math,
                evt.radioGroup.map(function (child) {
                  return child.x
                })
              )
            const width =
              Math.max.apply(
                Math,
                evt.radioGroup.map(function (child) {
                  return child.x
                })
              ) +
              evt.radioGroup[0].width -
              Math.min.apply(
                Math,
                evt.radioGroup.map(function (child) {
                  return child.x
                })
              )
            const height =
              Math.max.apply(
                Math,
                evt.radioGroup.map(function (child) {
                  return child.y
                })
              ) +
              evt.radioGroup[0].height -
              Math.min.apply(
                Math,
                evt.radioGroup.map(function (child) {
                  return child.y
                })
              )
            annotateTool.style.setProperty(
              'left',
              left -
              appRect.left +
              width / 2 -
              annotateTool.clientWidth / 2 +
              'px'
            )
            annotateTool.style.setProperty(
              'top',
              top - appRect.top + height + 30 + 'px'
            )
          }
          const mainContainer = document.getElementById('viewerContainer')
          const scroll = function (e) {
            annotateTool.style.setProperty('left', 0)
            annotateTool.style.setProperty('top', 0)
            annotateTool.style.setProperty('display', 'none')
            mainContainer.removeEventListener('scroll', scroll)
          }
          mainContainer.addEventListener('scroll', scroll)
        }
      } else if (this.mode === 0 && this.$vuetify.breakpoint.mdAndDown) {
        const annotateTool = document.getElementById('annotateTool')
        annotateTool.style.setProperty('left', 0)
        annotateTool.style.setProperty('top', 0)
        annotateTool.style.setProperty('display', 'none')
      }
    },

    updateAnnotateTool(
      on,
      selection,
      position,
      checkboxGroup,
      radioGroup,
      rect
    ) {
      if (this.mode === 0 && this.$vuetify.breakpoint.mdAndDown) {
        if (on) {
          const appRect = document
            .getElementById('appContainer')
            .getBoundingClientRect()
          const annotateTool = document.getElementById('annotateTool')
          annotateTool.style.setProperty('display', 'flex')
          if (
            (!checkboxGroup || checkboxGroup.length <= 0) &&
            (!radioGroup || radioGroup.length <= 0)
          ) {
            annotateTool.style.setProperty(
              'left',
              position.left -
              appRect.left +
              selection.width / 2 -
              annotateTool.clientWidth / 2 +
              'px'
            )
            annotateTool.style.setProperty(
              'top',
              position.top - appRect.top + selection.height + 20 + 'px'
            )
          } else if (checkboxGroup && checkboxGroup.length > 0) {
            const top =
              rect.top +
              Math.min.apply(
                Math,
                checkboxGroup.map(function (child) {
                  return child.y
                })
              )
            const left =
              rect.left +
              Math.min.apply(
                Math,
                checkboxGroup.map(function (child) {
                  return child.x
                })
              )
            const width =
              Math.max.apply(
                Math,
                checkboxGroup.map(function (child) {
                  return child.x
                })
              ) +
              checkboxGroup[0].width -
              Math.min.apply(
                Math,
                checkboxGroup.map(function (child) {
                  return child.x
                })
              )
            const height =
              Math.max.apply(
                Math,
                checkboxGroup.map(function (child) {
                  return child.y
                })
              ) +
              checkboxGroup[0].height -
              Math.min.apply(
                Math,
                checkboxGroup.map(function (child) {
                  return child.y
                })
              )
            annotateTool.style.setProperty(
              'left',
              left -
              appRect.left +
              width / 2 -
              annotateTool.clientWidth / 2 +
              'px'
            )
            annotateTool.style.setProperty(
              'top',
              top - appRect.top + height + 30 + 'px'
            )
          } else if (radioGroup && radioGroup.length > 0) {
            const top =
              rect.top +
              Math.min.apply(
                Math,
                radioGroup.map(function (child) {
                  return child.y
                })
              )
            const left =
              rect.left +
              Math.min.apply(
                Math,
                radioGroup.map(function (child) {
                  return child.x
                })
              )
            const width =
              Math.max.apply(
                Math,
                radioGroup.map(function (child) {
                  return child.x
                })
              ) +
              radioGroup[0].width -
              Math.min.apply(
                Math,
                radioGroup.map(function (child) {
                  return child.x
                })
              )
            const height =
              Math.max.apply(
                Math,
                radioGroup.map(function (child) {
                  return child.y
                })
              ) +
              radioGroup[0].height -
              Math.min.apply(
                Math,
                radioGroup.map(function (child) {
                  return child.y
                })
              )
            annotateTool.style.setProperty(
              'left',
              left -
              appRect.left +
              width / 2 -
              annotateTool.clientWidth / 2 +
              'px'
            )
            annotateTool.style.setProperty(
              'top',
              top - appRect.top + height + 30 + 'px'
            )
          }
          const mainContainer = document.getElementById('viewerContainer')
          const scroll = function (e) {
            annotateTool.style.setProperty('left', 0)
            annotateTool.style.setProperty('top', 0)
            annotateTool.style.setProperty('display', 'none')
            mainContainer.removeEventListener('scroll', scroll)
          }
          mainContainer.addEventListener('scroll', scroll)
        } else {
          const annotateTool = document.getElementById('annotateTool')
          annotateTool.style.setProperty('left', 0)
          annotateTool.style.setProperty('top', 0)
          annotateTool.style.setProperty('display', 'none')
        }
      }
    },

    deleteSelection() {
      if (PDFViewerApplication.pdfViewer) {
        PDFViewerApplication.pdfViewer.keyEvent('delete')
      }
    },

    changeReadOnly() {
      if (this.selectionSource && this.selectionSource.fabricLayer) {
        this.selectionSource.fabricLayer.setReadOnly(this.selection)
        this.selectionSource.fabricLayer.save()
      }
    },

    changeRequired() {
      if (this.selectionSource && this.selectionSource.fabricLayer) {
        this.selectionSource.fabricLayer.setRequired(this.selection)
        this.selectionSource.fabricLayer.save()
      }
    },
    changeSingleLine() {
      // for text direction horizontal
      if (this.selectionSource && this.selectionSource.fabricLayer) {
        this.selectionSource.fabricLayer.setSingleLine(this.selection)
        this.selectionSource.fabricLayer.save()
      }
    },
    changeTextDirection() {
      // auto single line when direction vertical
      if (this.selectionSource && this.selectionSource.fabricLayer) {
        this.selectionSource.fabricLayer.setTextDirection(this.selection)
        if (this.selection.type === 1) {
          this.selectionSource.fabricLayer.save()
        }
      }
    },
    changeTextAlign() {
      if (this.selectionSource && this.selectionSource.fabricLayer) {
        if (this.selection.type === 1) {
          this.selectionSource.fabricLayer.setTextAlign(this.selection)
          this.selectionSource.fabricLayer.save()
        }
      }
    },
    changeSelectionFont(e) {
      this.selection.fontStyle = this.selection.fontStyle || ''
      this.selection.fontWeight = this.selection.fontWeight || ''
      this.selectionSource.fabricLayer.setFont(this.selection)
      this.selectionSource.fabricLayer.save()
    },
    changeTextColor(color) {
      if (this.selectionSource && this.selectionSource.fabricLayer) {
        const r = parseInt(color.slice(1, 3), 16)
        const g = parseInt(color.slice(3, 5), 16)
        const b = parseInt(color.slice(5, 7), 16)
        this.selection.textColor = `rgba(${r},${g},${b},1)`
        this.selection.fill = `rgba(${r},${g},${b},1)`
        this.selectionSource.fabricLayer.setTextColor(this.selection)
        this.selectionSource.fabricLayer.save()
      }
    },
    changeTextarea(e) {
      this.selectionSource.fabricLayer.setTextarea(this.selection)
      this.selectionSource.fabricLayer.save()
    },
    checkOptionWidth(e) {
      this.selectionSource.fabricLayer.checkOptionWidth(this.selection)
      // this.selectionSource.fabricLayer.save()
    },
    changeSelectOption(e) {
      this.selectionSource.fabricLayer.changeSelectOption(this.selection)
      this.selectionSource.fabricLayer.save()
    },
    changeSelectOptionId(e) {
      this.selectionSource.fabricLayer.changeSelectOptionId(this.selection)
      this.selectionSource.fabricLayer.save()
    },
    changeLabel(e) {
      this.selectionSource.fabricLayer.changeLabel(this.selection)
      this.selectionSource.fabricLayer.save()
    },
    changeGroupLabel(e) {
      if (this.selection.type === 2) {
        this.checkboxGroup.forEach((element) => {
          if (element.objectId !== this.selection.objectId) {
            element.groupLabel = e
          }
        })
        this.selectionSource.fabricLayer.changeGroupLabel(this.checkboxGroup, e)
      } else if (this.selection.type === 5) {
        this.radioGroup.forEach((element) => {
          if (element.objectId !== this.selection.objectId) {
            element.groupLabel = e
          }
        })
        this.selectionSource.fabricLayer.changeGroupLabel(this.radioGroup, e)
      }
      this.selectionSource.fabricLayer.save()
    },
    changeMaxlength(e) {
      this.selection.maxlength =
        this.selection.maxlength < 1
          ? 1
          : this.selection.maxlength > 10000
            ? 10000
            : Math.floor(this.selection.maxlength)
      this.selectionSource.fabricLayer.changeMaxlength(this.selection)
    },
    changeValidation(e) {
      this.selectionSource.fabricLayer.changeValidation(this.selection)
      this.selectionSource.fabricLayer.save()
    },
    changeDateFormat(e) {
      this.selectionSource.fabricLayer.changeDateFormat(this.selection)
      this.selectionSource.fabricLayer.save()
    },
    changeDateRange(e) {
      this.selectionSource.fabricLayer.changeDateRange(this.selection)
      this.selection.text = ''
      this.selectionSource.fabricLayer.changeDateValue(this.selection)
      this.selection.readonly = false
      this.selectionSource.fabricLayer.setReadOnly(this.selection)
      this.selectionSource.fabricLayer.save()
    },
    clearDateValue() {
      this.$refs.dateDialog.save('')
      this.selectionSource.fabricLayer.changeDateValue(this.selection)
      this.selectionSource.fabricLayer.save()
    },
    changeDateValue(e) {
      this.$refs.dateDialog.save(this.selection.text)
      this.selectionSource.fabricLayer.changeDateValue(this.selection)
      this.selectionSource.fabricLayer.save()
    },
    changeDateEra(e) {
      this.selection.dateFormat = this.dateFormatListFilter[0].name
      this.selectionSource.fabricLayer.changeDateEra(this.selection)
      this.selectionSource.fabricLayer.changeDateFormat(this.selection)
      this.selectionSource.fabricLayer.save()
    },
    setCheckboxOption(evt) {
      this.ruleId = evt.ruleId
      this.minimum = evt.minimum
      this.maximum = evt.maximum
      this.checkboxGroup = evt.checkboxGroup
      this.checkboxSource = evt.source
    },
    changeRule(e) {
      if (e === 0) {
        this.maximum = this.checkboxGroup.length
      } else if (e === 1) {
        this.minimum = 0
      } else if (e === 2) {
        this.minimum = this.maximum
      }
      this.checkboxSource.fabricLayer.setRule(
        this.checkboxGroup,
        e,
        this.minimum,
        this.maximum
      )
    },
    setAtLeastRule(e) {
      this.checkRuleValid()
      this.checkboxSource.fabricLayer.setRuleRange(
        this.checkboxGroup,
        this.minimum,
        this.maximum
      )
    },
    setAtMostRule(e) {
      this.checkRuleValid()
      this.checkboxSource.fabricLayer.setRuleRange(
        this.checkboxGroup,
        this.minimum,
        this.maximum
      )
    },
    setExactlyRule(e) {
      this.minimum = e
      this.maximum = e
      this.checkRuleValid()
      this.checkboxSource.fabricLayer.setRuleRange(
        this.checkboxGroup,
        this.minimum,
        this.maximum
      )
    },
    setRangeRule(e) {
      this.checkRuleValid()
      this.checkboxSource.fabricLayer.setRuleRange(
        this.checkboxGroup,
        this.minimum,
        this.maximum
      )
    },
    // 防呆
    checkRuleValid() {
      this.maximum = this.minimum > this.maximum ? this.minimum : this.maximum
    },
    changeCheckboxSelected(e) {
      this.checkboxSource.fabricLayer.setCheckboxSelected(this.checkboxGroup)
    },
    focusCheckboxLabel(index) {
      this.checkboxSource.fabricLayer.addBadge(
        this.checkboxGroup[index],
        index + 1
      )
    },
    blurCheckboxLabel(index) {
      this.checkboxSource.fabricLayer.removeBadge(this.checkboxGroup[index])
    },
    focusRadioLabel(index) {
      this.radioSource.fabricLayer.addBadge(this.radioGroup[index], index + 1)
    },
    blurRadioLabel(index) {
      this.radioSource.fabricLayer.removeBadge(this.radioGroup[index])
    },
    onAnnotateSelectIdChange() {
      if (this.annotateSelectId !== null) {
        PDFViewerApplication.setAnnotateSelectId(this.annotateSelectId)
      }
    },
    setRadioOption(evt) {
      this.radioGroup = evt.radioGroup
      this.radioSource = evt.source
    },
    changeRadioSelected(item) {
      if (item.selected === true) {
        this.radioGroup.forEach((element) => {
          if (element.objectId !== item.objectId) {
            element.selected = false
          }
        })
      }
      this.radioSource.fabricLayer.setRadioSelected(this.radioGroup)
    },
    addSelectionOption() {
      if (this.selection.options) {
        const id =
          this.selection.options.length > 0
            ? Math.max(...this.selection.options.map((x) => x.id)) + 1
            : 0
        this.selection.options.push({
          id,
          name: '',
        })
      }
    },
    changeControl(control) {
      this.control = control
    },
    deleteSelectionOption(id) {
      if (
        this.selection.options &&
        this.selection.options.find((x) => x.id === id)
      ) {
        this.selection.options.splice(
          this.selection.options.findIndex((x) => x.id === id),
          1
        )
      }
    },
    onChangeScale(event) {
      if (PDFViewerApplication.eventBus) {
        PDFViewerApplication.eventBus.dispatch('scalechanged', {
          source: this,
          value: event,
        })
      }
    },
    isMobile() {
      this.$emit('isMobile')
    },
    toggleLeftDrawer(on = null) {
      if (on !== null && on !== undefined) {
        this.leftDrawer = on
      } else {
        this.leftDrawer = !this.leftDrawer
      }
    },
    toggleRightDrawer(on = null) {
      if (on !== null && on !== undefined) {
        this.rightDrawer = on
      } else {
        this.rightDrawer = !this.rightDrawer
      }
    },
    toggleCommentDrawer(on = null) {
      if (on !== null && on !== undefined) {
        this.commentDrawer = on
      } else {
        this.commentDrawer = !this.commentDrawer
      }
    },
    toggleAttachmentDrawer(on = null) {
      if (on !== null && on !== undefined) {
        this.attachmentDrawer = on
      } else {
        this.attachmentDrawer = !this.attachmentDrawer
      }
    },
    toggleDrawTool(on = null) {
      if (!this.showDrawTool) {
        PDFViewerApplication.eventBus.dispatch('initDrawTool')
      }
      if (on !== null && on !== undefined) {
        this.showDrawTool = on
      } else {
        this.showDrawTool = !this.showDrawTool
      }
      PDFViewerApplication.eventBus.dispatch(
        'setShowDrawTool',
        this.showDrawTool
      )
    },
    setSelectedCanvas(evt) {
      this.selectedCanvas = evt.nextElementSibling
      this.canvasBorder = evt.style.border
    },
    hideDrawTool(evt) {
      const canvasArea = [
        ['id', 'drawingToolBarContainerRow'],
        ['id', 'appToolbar'],
        ['class', 'canvasDraw'],
      ]
      let target = evt.target
      let inCanvas = false
      // search all click element's parents, if in allowed element, then allow to show tool bar
      while (true) {
        if (
          canvasArea
            .filter((x) => x[0] === 'id')
            .some((x) => x[1] === target.id) ||
          canvasArea.filter((e) => {
            return (
              e[0] === 'class' && Array.from(target.classList).includes(e[1])
            )
          }).length
        ) {
          inCanvas = true
          break
        }
        if (target.parentElement) {
          target = target.parentElement
        } else {
          inCanvas = false
          break
        }
      }
      // if click tool bar still show the bar
      if (this.canvasBorder) {
        document
          .querySelectorAll('.canvasDraw > .upper-canvas')
          .forEach((ele) => {
            ele.style.border = this.canvasBorder
          })
      }
      if (inCanvas && this.showDrawTool) {
        this.showDrawTool = true
        this.selectedCanvas.style.border = 'orange 3px solid'
      } else {
        PDFViewerApplication.eventBus.dispatch('initActiveType')
        PDFViewerApplication.eventBus.dispatch('removeAnnotateToggled')
        this.showDrawTool = false
      }
      PDFViewerApplication.eventBus.dispatch(
        'setShowDrawTool',
        this.showDrawTool
      )
    },
    toggleStreamingDrawer(on = null) {
      if (on !== null && on !== undefined) {
        this.streamingDrawer = on
      } else {
        this.streamingDrawer = !this.streamingDrawer
      }
    },
    async onFileChange(e) {
      const files = e.target.files || e.dataTransfer.files

      this.dragging = false
      if (!files.length) {
        return
      }

      if (files.length > 1) {
        this.$notifier.showMessage({
          message: this.$t('message.atMostOneFile'),
          color: 'red',
        })
        return
      }
      if (!files[0].type.match('image/(png|jpg|jpeg|gif|bmp)')) {
        this.$notifier.showMessage({
          message: this.$t('message.fileFmtNotSupported'),
          color: 'red',
        })
        return
      }

      let compressedFile = null
      if (files[0].size > 10000000) {
        this.$notifier.showMessage({
          message: this.$t('message.fileSizeExceed', { sizeLimit: '10 MB' }),
          color: 'red',
        })
        return
      } else if (files[0].size > 500000) {
        const compressRate = 0.5
        this.$nuxt.$loading.start()
        compressedFile = await compressBase64Image(
          await this.toBase64(files[0]),
          compressRate
        )
        this.$nuxt.$loading.finish()
      }

      this.$nuxt.$loading.start()
      this.stampFile = compressedFile ?? (await this.toBase64(files[0]))
      this.$nuxt.$loading.finish()

      e.target.value = ''
    },
    toBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result)
        reader.onerror = (error) => reject(error)
      })
    },
    onAttachmentFileChange(e) {
      const files = e.target.files || e.dataTransfer.files
      this.dragging = false
      const validation = this.attachmentFilesValidation([...files], {
        limit: this.uploadFileLimit - this.attachmentFiles.length,
        size: this.totalSizeLimit - this.totalSize,
      })
      if (!validation.success) {
        if (validation.message !== '') {
          this.$alert.showMessage({
            message: validation.message,
            type: 'error',
          })
        }
        this.$refs.attachmentInput.value = ''
        return
      }
      this.attachmentFiles.push(...files)
      this.$refs.attachmentInput.value = ''
      if (this.mode !== 5) {
        this.addAttachment()
      }
    },
    formatBytes(bytes, decimals = 2) {
      if (bytes === 0) return '0 Bytes'

      const k = 1024
      const dm = decimals < 0 ? 0 : decimals
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

      const i = Math.floor(Math.log(bytes) / Math.log(k))

      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
    },
    attachmentFilesValidation(
      files,
      options = { limit: 1, pattern: '*', size: 5000000 }
    ) {
      const result = { success: false, message: '' }
      if (!files.length) {
        return result
      }

      if (files.length > options.limit) {
        result.message = this.$t('message.exceedAttachLimit')
        return result
      }

      if (!files.every((file) => file.type.match(options.pattern))) {
        result.message = this.$t('message.attachFmtNotSupport')
        return result
      }

      if (files.reduce((prev, curr) => prev + curr.size, 0) > options.size) {
        result.message = this.$t('message.attachExceedSize')
        return result
      }
      result.success = true
      return result
    },

    async uploadAttachment(file) {
      const formData = new FormData()
      let attachmentId = ''
      formData.append('file', file, file.name)

      this.$nuxt.$loading.start()
      const result = await this.$apiRepository(
        this.$i18n.locale
      ).file.upload.post(formData)
      this.$nuxt.$loading.finish()

      if (result !== null && result.errorCode === 200) {
        this.$notifier.showMessage({
          message: this.$t('message.uploadAttach'),
          color: 'red',
        })
        attachmentId = result.body.id
      } else {
        this.$alert.showMessage({
          message: this.$t('message.uploadAttachFail'),
          type: 'error',
        })
      }
      return attachmentId
    },

    async addAttachment() {
      if (this.stampMode !== 0) {
        return
      }
      if (this.attachmentFiles[0]) {
        const attachmentId = await this.uploadAttachment(
          this.attachmentFiles[0]
        )
        this.addAttachmentLoading = true
        // 只存檔案名稱與大小、attachmentId
        this.attachmentFiles = this.attachmentFiles.map((file) => {
          return { name: file.name, size: file.size, attachmentId }
        })
        this.addAttachmentLoading = false
      }
      if (this.mode !== 5 || this.annotateAttachment != null) {
        PDFViewerApplication.addAttachment({
          page: this.annotateAttachment.page,
          data: this.attachmentFiles,
          width: this.annotateAttachment.width,
          height: this.annotateAttachment.height,
          top: this.annotateAttachment.top,
          left: this.annotateAttachment.left,
          id: this.annotateAttachment.id,
        })
      } else {
        PDFViewerApplication.addDoneAnnotate({
          state: 8,
          data: { base64: this.attachmentFiles },
        })
        this.cancelAttachment()
      }
    },

    doAttachment(annotate = null) {
      this.annotateAttachment = annotate
      this.attachmentFiles = annotate != null ? annotate.data : []
      this.addAttachmentDialog = true
    },

    cancelAttachment() {
      this.attachmentFiles = []
      this.addAttachmentDialog = false
      this.addAttachmentLoading = false
    },

    deleteAttachment(idx) {
      this.attachmentFiles.splice(idx, 1)
      if (this.annotateAttachment) {
        this.annotateAttachment.attachmentId = null
      }
      // 刪除已經上傳的附件之後重新繪製
      if (this.mode !== 5) {
        this.addAttachment()
      }
    },

    prefillAttachment(selection) {
      this.doAttachment({
        page: this.selectionSource.fabricLayer.pageNumber,
        width: selection.width,
        height: selection.height,
        top: selection.y,
        left: selection.x,
        id: selection.objectId,
        data: selection.attachments ? selection.attachments : [],
      })
    },

    addAnnotateMB(state) {
      if (state === 91 || state === 92 || state === 93 || state === 94) {
        if (state === 91 || state === 93 || state === 94) {
          this.setIsAllowTouchScrolling(false)
        }
        PDFViewerApplication.eventBus.dispatch('addAnnotate', {
          source: this,
          state,
        })
        const currentBtn = document.getElementById(`annotateBtn${state}`)
        const self = this
        const mouseup = function (e) {
          const obj = e.target
          if (!currentBtn.contains(obj)) {
            self.buttonToggled = null
            document.removeEventListener('mouseup', mouseup)
          }
        }
        document.addEventListener('mouseup', mouseup)
      } else if (this.buttonToggled !== state) {
        if (this.buttonToggled !== null) {
          const prevBtn = document.getElementById(
            `annotateBtn${this.buttonToggled}`
          )
          prevBtn.classList.remove('v-item--active')
          prevBtn.classList.remove('v-btn--active')
        }
        const currentBtn = document.getElementById(`annotateBtn${state}`)
        currentBtn.classList.add('v-item--active')
        currentBtn.classList.add('v-btn--active')
        this.buttonToggled = state
        PDFViewerApplication.eventBus.dispatch('addAnnotate', {
          source: this,
          state,
        })
        const self = this
        const mouseup = function (e) {
          const obj = e.target
          if (obj === currentBtn) {
            const cursor = document.getElementById('cursor')
            if (cursor && cursor.style.opacity === '0') {
              PDFViewerApplication.eventBus.dispatch('removeAnnotateToggled', {
                source: self,
              })
            }
            document.removeEventListener('mouseup', mouseup)
          } else {
            self.buttonToggled = null
            currentBtn.classList.remove('v-item--active')
            currentBtn.classList.remove('v-btn--active')
            const cursor = document.getElementById('cursor')
            if (cursor && cursor.style.opacity === '0') {
              PDFViewerApplication.eventBus.dispatch('removeAnnotateToggled', {
                source: self,
              })
            }
            document.removeEventListener('mouseup', mouseup)
          }
        }
        document.addEventListener('mouseup', mouseup)
      }
    },

    createDatePicker(parent, props, changeEvent) {
      const DatePickerClass = Vue.extend(datePicker)
      const instance = new DatePickerClass({
        vuetify: this.$vuetify.theme,
        propsData: props,
      })
      instance.$on('changeEvent', changeEvent)
      instance.$mount()
      parent.appendChild(instance.$el)
    },

    async setIsAllowTouchScrolling(allowed) {
      if (PDFViewerApplication.eventBus) {
        if (this.mode === 1 || this.mode === 4) {
          if (Array.isArray(this.$utils.isMobile(true))) {
            PDFViewerApplication.eventBus.dispatch(
              'setIsAllowTouchScrollingPC',
              {
                source: this,
                value:
                  this.$utils.isMobile(true)[0] === 'Mac'
                    ? allowed
                      ? 1
                      : 0
                    : 0,
              }
            )
          } else {
            PDFViewerApplication.eventBus.dispatch(
              'setIsAllowTouchScrollingPC',
              {
                source: this,
                value: this.$utils.isMobile(true) ? 0 : allowed ? 1 : 0,
              }
            )
          }
          PDFViewerApplication.eventBus.dispatch('setIsAllowTouchScrolling', {
            source: this,
            value: allowed,
          })
        } else {
          PDFViewerApplication.eventBus.dispatch('setIsAllowTouchScrolling', {
            source: this,
            value: allowed,
          })
        }
      } else {
        if (this.pdfViewerApplicationErrorCount > 10) {
          return
        }
        ++this.pdfViewerApplicationErrorCount
        await this.$utils.sleep(1000)
        this.setIsAllowTouchScrolling(allowed)
      }
    },
    checkAnnotateByFile(fileId) {
      const file = this.fileList.find((f) => f.id === fileId)
      let isNotComplete = false
      file.annotate.sort(function (a, b) {
        return a.page - b.page
      })
      file.annotate.forEach((anno) => {
        let minimum = 0
        let maximum = 0
        let checkboxSelectedLength = 0
        let radioSelectedLength = 0
        let regex = null
        anno.data
          .sort((a, b) => {
            return a.objectId - b.objectId
          })
          .forEach((shape) => {
            switch (shape.type) {
              case 0:
                if (
                  shape.required === true &&
                  (shape.done === undefined || !shape.done)
                ) {
                  isNotComplete = true
                }
                break
              case 1:
                if (
                  shape.required === true &&
                  (shape.text === '' || shape.text === null)
                ) {
                  isNotComplete = true
                }
                if (shape.text !== null && shape.isTextExceeded) {
                  isNotComplete = true
                }
                if (shape.text !== null && shape.isTextOverflow) {
                  isNotComplete = true
                }
                // 文字驗證 regular expression
                regex = null
                if (
                  shape.validation &&
                  (shape.required || (shape.text !== null && shape.text !== ''))
                ) {
                  switch (shape.validation.type) {
                    case 'idcard':
                      regex = '^[A-Z]{1}[1-2]{1}[0-9]{8}$'
                      break
                    case 'email':
                      regex = '^[^\\s@]+@[^\\s@]+.[^\\s@]+$'
                      break
                    case 'phone':
                      regex =
                        '(\\d{2,3}-?|(\\d{2,3}))\\d{3,4}-?\\d{4}|09\\d{2}(\\d{6}|-\\d{3}-\\d{3})'
                      break
                    case 'zip':
                      regex = '^\\d{6}$|^\\d{3}$'
                      break
                    case 'number':
                      regex = '^[0-9]+$'
                      break
                    case 'custom':
                      regex = shape.validation.regex
                      break
                  }
                }
                if (regex !== null) {
                  if (shape.text.match(new RegExp(regex)) === null) {
                    shape.isValidationFailed = true
                  } else {
                    shape.isValidationFailed = false
                  }
                } else {
                  shape.isValidationFailed = false
                }
                if (shape.validation !== null && shape.isValidationFailed) {
                  isNotComplete = true
                }
                break
              case 2:
                minimum = shape.minimum
                maximum = shape.maximum
                checkboxSelectedLength = anno.data.filter(
                  (x) =>
                    x.selected === true &&
                    x.groupId === shape.groupId &&
                    x.type === 2
                ).length
                switch (shape.ruleId) {
                  case 0:
                    if (checkboxSelectedLength < minimum) {
                      isNotComplete = true
                    }
                    break
                  case 1:
                    if (checkboxSelectedLength > maximum) {
                      isNotComplete = true
                    }
                    break
                  case 2:
                    if (
                      checkboxSelectedLength > maximum ||
                      checkboxSelectedLength < minimum
                    ) {
                      isNotComplete = true
                    }
                    break
                  case 3:
                    if (
                      checkboxSelectedLength > maximum ||
                      checkboxSelectedLength < minimum
                    ) {
                      isNotComplete = true
                    }
                    break
                }
                break
              case 3:
                if (
                  shape.required === true &&
                  (shape.done === undefined || !shape.done)
                ) {
                  isNotComplete = true
                }
                break
              case 4:
                if (
                  shape.required === true &&
                  (shape.done === undefined || !shape.done) &&
                  (shape.data === '' || !shape.data)
                ) {
                  isNotComplete = true
                }
                break
              case 5:
                radioSelectedLength = anno.data.filter(
                  (x) =>
                    x.selected === true &&
                    x.groupId === shape.groupId &&
                    x.type === 5
                ).length
                if (radioSelectedLength !== 1) {
                  isNotComplete = true
                }
                break
              case 6:
                if (
                  shape.required === true &&
                  (shape.selectOptionId === undefined ||
                    shape.selectOptionId === null ||
                    !shape.options ||
                    !shape.options.find((x) => x.id === shape.selectOptionId))
                ) {
                  isNotComplete = true
                }
                break
              case 7:
                if (
                  shape.required === true &&
                  (shape.done === undefined || !shape.done)
                ) {
                  isNotComplete = true
                }
                break
              case 8:
                if (
                  shape.required === true &&
                  (shape.done === undefined || !shape.done)
                ) {
                  isNotComplete = true
                }
                break
              case 9:
                if (
                  shape.required === true &&
                  (shape.done === undefined || !shape.done)
                ) {
                  isNotComplete = true
                }
                break
              case 10:
                if (
                  shape.required === true &&
                  (shape.done === undefined || !shape.done)
                ) {
                  isNotComplete = true
                }
                break
              case 11:
                if (
                  shape.required === true &&
                  (shape.done === undefined || !shape.done)
                ) {
                  isNotComplete = true
                }
                break
              case 12:
                if (
                  shape.required === true &&
                  (shape.done === undefined || !shape.done)
                ) {
                  isNotComplete = true
                }
                break
              case 13:
                if (
                  shape.required === true &&
                  (shape.done === undefined || !shape.done)
                ) {
                  isNotComplete = true
                }
                break
            }
          })
      })
      return isNotComplete
    },

    async checkAnnotate(showOutline, scrolling) {
      let isNotComplete = false
      let message = ''
      const breakException = {}
      let breakPage = 0
      let breakAnnotate = null
      let breakFileId = 0
      let regex = null
      let autoNavStr = this.$t('button.sign2')
      let needB2b2cType = null
      const isMultipleFile = this.fileList.length > 1

      try {
        this.fileList.forEach((file) => {
          breakFileId = file.id
          file.annotate.sort(function (a, b) {
            return a.page - b.page
          })
          file.annotate.forEach((anno) => {
            const page = anno.page
            breakPage = anno.page
            let minimum = 0
            let maximum = 0
            let checkboxSelectedLength = 0
            let radioSelectedLength = 0
            anno.data
              .sort((a, b) => {
                return a.objectId - b.objectId
              })
              .forEach((shape) => {
                switch (shape.type) {
                  case 0:
                    if (
                      shape.required === true &&
                      (shape.done === undefined || !shape.done)
                    ) {
                      message = this.$t('message.pageXNotSign', { page })
                      isNotComplete = true
                      breakAnnotate = shape
                      autoNavStr = this.$t('button.sign2')
                      throw breakException
                    }
                    break
                  case 1:
                    if (
                      shape.required === true &&
                      (shape.text === '' || shape.text === null)
                    ) {
                      message = this.$t('message.pageXBlankText', { page })
                      isNotComplete = true
                      breakAnnotate = shape
                      autoNavStr = this.$t('button.enterText')
                      throw breakException
                    }
                    if (shape.text !== null && shape.isTextExceeded) {
                      message = this.$t('message.pageXTextExceeds', { page })
                      isNotComplete = true
                      breakAnnotate = shape
                      autoNavStr = this.$t('button.enterText')
                      throw breakException
                    }
                    if (shape.text !== null && shape.isTextOverflow) {
                      message = this.$t('message.pageXTextOverflow', { page })
                      isNotComplete = true
                      breakAnnotate = shape
                      autoNavStr = this.$t('button.enterText')
                      throw breakException
                    }

                    // 文字驗證 regular expression
                    regex = null
                    if (
                      shape.validation &&
                      (shape.required ||
                        (shape.text !== null && shape.text !== ''))
                    ) {
                      switch (shape.validation.type) {
                        case 'idcard':
                          regex = '^[A-Z]{1}[1-2]{1}[0-9]{8}$'
                          break
                        case 'email':
                          regex = '^[^\\s@]+@[^\\s@]+.[^\\s@]+$'
                          break
                        case 'phone':
                          regex =
                            '(\\d{2,3}-?|(\\d{2,3}))\\d{3,4}-?\\d{4}|09\\d{2}(\\d{6}|-\\d{3}-\\d{3})'
                          break
                        case 'zip':
                          regex = '^\\d{6}$|^\\d{3}$'
                          break
                        case 'number':
                          regex = '^[0-9]+$'
                          break
                        case 'custom':
                          regex = shape.validation.regex
                          break
                      }
                    }
                    if (regex !== null) {
                      if (shape.text.match(new RegExp(regex)) === null) {
                        shape.isValidationFailed = true
                      } else {
                        shape.isValidationFailed = false
                      }
                    } else {
                      shape.isValidationFailed = false
                    }
                    if (shape.validation !== null && shape.isValidationFailed) {
                      message = this.$t('message.pageXTextNotValid', { page })
                      isNotComplete = true
                      breakAnnotate = shape
                      autoNavStr = this.$t('button.enterText')
                      throw breakException
                    }
                    break
                  case 2:
                    minimum = shape.minimum
                    maximum = shape.maximum
                    checkboxSelectedLength = anno.data.filter(
                      (x) =>
                        x.selected === true &&
                        x.groupId === shape.groupId &&
                        x.type === 2
                    ).length
                    switch (shape.ruleId) {
                      case 0:
                        if (checkboxSelectedLength < minimum) {
                          message = this.$t('message.pageXCBSelect0', {
                            page,
                            minimum,
                          })
                          isNotComplete = true
                          breakAnnotate = shape
                          autoNavStr = this.$t('button.check')
                          throw breakException
                        }
                        break
                      case 1:
                        if (checkboxSelectedLength > maximum) {
                          message = this.$t('message.pageXCBSelect1', {
                            page,
                            maximum,
                          })
                          isNotComplete = true
                          breakAnnotate = shape
                          autoNavStr = this.$t('button.check')
                          throw breakException
                        }
                        break
                      case 2:
                        if (
                          checkboxSelectedLength > maximum ||
                          checkboxSelectedLength < minimum
                        ) {
                          message = this.$t('message.pageXCBSelect2', {
                            page,
                            maximum,
                          })
                          isNotComplete = true
                          breakAnnotate = shape
                          autoNavStr = this.$t('button.check')
                          throw breakException
                        }
                        break
                      case 3:
                        if (
                          checkboxSelectedLength > maximum ||
                          checkboxSelectedLength < minimum
                        ) {
                          message = this.$t('message.pageXCBSelect3', {
                            page,
                            minimum,
                            maximum,
                          })
                          isNotComplete = true
                          breakAnnotate = shape
                          autoNavStr = this.$t('button.check')
                          throw breakException
                        }
                        break
                    }
                    break
                  case 3:
                    if (
                      shape.required === true &&
                      (shape.done === undefined || !shape.done)
                    ) {
                      message = this.$t('message.pageXNoStmp', { page })
                      isNotComplete = true
                      breakAnnotate = shape
                      autoNavStr = this.$t('button.addStamp')
                      throw breakException
                    }
                    break
                  case 4:
                    if (
                      shape.required === true &&
                      (shape.done === undefined || !shape.done) &&
                      (shape.data === '' || !shape.data)
                    ) {
                      message = this.$t('message.pageXNoDate', { page })
                      isNotComplete = true
                      breakAnnotate = shape
                      autoNavStr = this.$t('button.selectDate')
                      throw breakException
                    }
                    break
                  case 5:
                    radioSelectedLength = anno.data.filter(
                      (x) =>
                        x.selected === true &&
                        x.groupId === shape.groupId &&
                        x.type === 5
                    ).length
                    if (radioSelectedLength !== 1) {
                      message = this.$t('message.pageXRBAtMost1', { page })
                      isNotComplete = true
                      breakAnnotate = shape
                      autoNavStr = this.$t('button.check')
                      throw breakException
                    }
                    break
                  case 6:
                    if (
                      shape.required === true &&
                      (shape.selectOptionId === undefined ||
                        shape.selectOptionId === null ||
                        !shape.options ||
                        !shape.options.find(
                          (x) => x.id === shape.selectOptionId
                        ))
                    ) {
                      message = this.$t('message.pageXDropdownBlank', { page })
                      isNotComplete = true
                      breakAnnotate = shape
                      autoNavStr = this.$t('button.select')
                      throw breakException
                    }
                    break
                  case 7:
                    if (
                      shape.required === true &&
                      (shape.done === undefined || !shape.done)
                    ) {
                      message = this.$t('message.pageXNoAttach', { page })
                      isNotComplete = true
                      breakAnnotate = shape
                      autoNavStr = this.$t('heading.uploadAttach')
                      throw breakException
                    }
                    break
                  case 8:
                    if (
                      shape.required === true &&
                      (shape.done === undefined || !shape.done)
                    ) {
                      message = this.$t('message.pageXNoPic', { page })
                      isNotComplete = true
                      breakAnnotate = shape
                      autoNavStr = this.$t('button.image')
                      throw breakException
                    }
                    break
                  case 9:
                    needB2b2cType = 'P'
                    if (
                      shape.required === true &&
                      (shape.done === undefined || !shape.done)
                    ) {
                      message = this.$t('message.pageXNotSign', { page })
                      isNotComplete = true
                      breakAnnotate = shape
                      autoNavStr = this.$t('button.sign2')
                      throw breakException
                    }
                    break
                  case 10:
                    needB2b2cType = 'O'
                    if (
                      shape.required === true &&
                      (shape.done === undefined || !shape.done)
                    ) {
                      message = this.$t('message.pageXNotSign', { page })
                      isNotComplete = true
                      breakAnnotate = shape
                      autoNavStr = this.$t('button.sign2')
                      throw breakException
                    }
                    break
                  case 11:
                    needB2b2cType = 'P'
                    if (
                      shape.required === true &&
                      (shape.done === undefined || !shape.done)
                    ) {
                      message = this.$t('message.pageXNotSign', { page })
                      isNotComplete = true
                      breakAnnotate = shape
                      autoNavStr = this.$t('button.sign2')
                      throw breakException
                    }
                    break
                  case 12:
                    needB2b2cType = 'O'
                    if (
                      shape.required === true &&
                      (shape.done === undefined || !shape.done)
                    ) {
                      message = this.$t('message.pageXNotSign', { page })
                      isNotComplete = true
                      breakAnnotate = shape
                      autoNavStr = this.$t('button.sign2')
                      throw breakException
                    }
                    break
                  case 13:
                    if (
                      shape.required === true &&
                      (shape.done === undefined || !shape.done)
                    ) {
                      message = this.$t('message.pageXNotSignatureAndStamp', {
                        page,
                      })
                      isNotComplete = true
                      breakAnnotate = shape
                      autoNavStr = this.$t('button.sign2')
                      throw breakException
                    }
                    break
                }
              })
          })
        })
      } catch (e) {
        if (e !== breakException) {
          throw e
        } else {
          message = isMultipleFile
            ? this.$t('message.fileX', { breakFileId }) + message
            : message
        }
      }

      if (isNotComplete) {
        if (scrolling) {
          if (this.selectedFile !== breakFileId) {
            this.selectedFile = breakFileId
            this.documentLoaded = false
            this.$nuxt.$loading.start()
            PDFViewerApplication.changePdfFile(breakFileId)
            this.$emit('notifyFileChanged', breakFileId)
            await this.waitUntilDocumentLoaded().then(() => {
              setTimeout(async () => {
                this.pageScrolling = true
                PDFViewerApplication.scrollToNotComplete(
                  +breakPage,
                  breakAnnotate
                )
                await this.waitUntilPageScroll().then(() => {
                  setTimeout(() => {
                    this.$nuxt.$loading.finish()
                    const firstNotComplete =
                      PDFViewerApplication.checkNotComplete(showOutline)
                    if (firstNotComplete) {
                      const rect = firstNotComplete.getBoundingClientRect()
                      if (this.isAuditor === false) {
                        const autoNavBtn = document.getElementById('autoNavBtn')
                        if (autoNavBtn) {
                          autoNavBtn.style.setProperty(
                            'top',
                            rect.top - 48 + 'px'
                          )
                          autoNavBtn.style.removeProperty('display')
                          autoNavBtn.classList.add('autoNav')
                          autoNavBtn.innerHTML = autoNavStr
                          const mainContainer =
                            document.getElementById('viewerContainer')
                          const scroll = function (e) {
                            const autoNavBtn =
                              document.getElementById('autoNavBtn')
                            autoNavBtn.classList.remove('autoNav')
                            autoNavBtn.innerHTML = this.$t('button.beginSign')
                            mainContainer.removeEventListener('scroll', scroll)
                          }
                          mainContainer.addEventListener('scroll', scroll)
                        }
                      }
                    }
                  }, 500)
                })
              }, 500)
            })
          } else {
            this.$nuxt.$loading.start()
            this.pageScrolling = true
            PDFViewerApplication.scrollToNotComplete(+breakPage, breakAnnotate)
            await this.waitUntilPageScroll().then(() => {
              setTimeout(() => {
                this.$nuxt.$loading.finish()
                const firstNotComplete =
                  PDFViewerApplication.checkNotComplete(showOutline)
                if (firstNotComplete) {
                  const rect = firstNotComplete.getBoundingClientRect()
                  if (this.isAuditor === false) {
                    const autoNavBtn = document.getElementById('autoNavBtn')
                    if (autoNavBtn) {
                      autoNavBtn.style.setProperty('top', rect.top - 48 + 'px')
                      autoNavBtn.style.removeProperty('display')
                      autoNavBtn.classList.add('autoNav')
                      autoNavBtn.innerHTML = autoNavStr
                      const mainContainer =
                        document.getElementById('viewerContainer')
                      const that = this
                      const scroll = function (e) {
                        const autoNavBtn = document.getElementById('autoNavBtn')
                        autoNavBtn.classList.remove('autoNav')
                        autoNavBtn.innerHTML = that.$t('button.beginSign')
                        mainContainer.removeEventListener('scroll', scroll)
                      }
                      mainContainer.addEventListener('scroll', scroll)
                    }
                  }
                }
              }, 500)
            })
          }
        } else {
          this.pageScrolling = false
          if (this.isAuditor === false) {
            const autoNavBtn = document.getElementById('autoNavBtn')
            autoNavBtn.classList.remove('autoNav')
            autoNavBtn.innerHTML = this.$t('button.nextOne')
          }
        }
      } else if (this.isAuditor === false) {
        const autoNavBtn = document.getElementById('autoNavBtn')
        if (autoNavBtn) {
          autoNavBtn.style.setProperty('top', '20%')
          autoNavBtn.style.setProperty('display', 'none')
          autoNavBtn.classList.remove('autoNav')
          autoNavBtn.innerHTML = this.$t('button.beginSign')
        }
      }

      return {
        message,
        isNotComplete,
        needB2b2cType,
      }
    },

    setDocumentLoaded(documentloaded) {
      this.documentLoaded = documentloaded
    },

    waitUntilDocumentLoaded() {
      return new Promise((resolve) => {
        const interval = setInterval(() => {
          if (!this.documentLoaded === true) {
            return
          }

          clearInterval(interval)
          resolve()
        }, 100)
      })
    },

    setPageScrolling(pageScrolling) {
      this.pageScrolling = pageScrolling
    },

    waitUntilPageScroll() {
      return new Promise((resolve) => {
        const interval = setInterval(() => {
          if (!this.pageScrolling === false) {
            return
          }

          clearInterval(interval)
          resolve()
        }, 100)
      })
    },

    setSelectScale(scale) {
      this.selectScale = scale
    },

    setEraserTool(eraserTool) {
      if (this.mode === 0) {
        this.eraserToggle = eraserTool ? 1 : null
      } else if (this.mode === 1 || this.mode === 4) {
        if (eraserTool) {
          this.drawToolToggle = 4
        }
      }
    },

    setDrawTool(drawTool) {
      if (this.mode === 1 || this.mode === 4) {
        if (drawTool) {
          this.drawToolToggle = 2
        }
      }
    },

    setPointerTool(pointerTool) {
      if (this.mode === 1 || this.mode === 4) {
        this.showPanel = false
        this.disableSelectColor = true
        this.disableSelectWidth = true
        this.disableSelectSize = true
        if (pointerTool) {
          this.drawToolToggle = 1
        }
      }
    },

    // 印章去背傳入圖片(Base64)，關閉dialog
    addRemoveBgStamp(imageBase64) {
      this.stampFile = imageBase64
      this.removeStampBgDialog = false
    },
    // 離開印章去背流程，關閉dialog
    cancelRemoveBgProcess() {
      this.removeStampBgDialog = false
    },
    openGoToMobileSignpadDialog() {
      // 打開手機連線簽名dialog
      this.goToMobileSignpadDialog = true
      this.$refs.mobileSignpadDialog.setupConnection()
      setTimeout(() => {
        this.$emit('showSignDialogTour', 'scan')
      }, 300)
    },
    closeGoToMobileSignpadDialog() {
      // 關閉手機連線簽名dialog
      this.goToMobileSignpadDialog = false
      this.$emit('destroyTour')
    },
    addSignatureFromMobileSignpad(payload) {
      if (this.signatureIsAdding) {
        // 避免重複送出
        return
      }
      this.signatureIsAdding = true
      if (this.mode !== 5) {
        PDFViewerApplication.addSignature({
          page: this.annotateSignature.page,
          base64: payload.content,
          width: this.annotateSignature.width,
          height: this.annotateSignature.height,
          top: this.annotateSignature.top,
          left: this.annotateSignature.left,
          id: this.annotateSignature.id,
          scale: this.annotateSignature.scale,
          type: this.annotateSignature.type,
          textDirection: this.annotateSignature.textDirection,
        })
      } else {
        PDFViewerApplication.addDoneAnnotate({
          state: 1,
          data: {
            base64: payload.content,
          },
        })
      }
      this.cancelSignature()
      this.signatureIsAdding = false
      this.$emit('showSignDialogTour', 'submit')
    },
    openGoToMobileRemoveBgDialog() {
      // 打開手機連線印章去背dialog
      this.goToMobileRemoveBgDialog = true
      this.$refs.mobileRemoveBgDialog.setupConnection()
    },
    closeGoToMobileRemoveBgDialog() {
      // 關閉手機連線印章去背dialog
      this.goToMobileRemoveBgDialog = false
    },
    openGoToMobileUploadImageDialog() {
      // 打開手機連線圖片上傳dialog
      this.goToMobileUploadImageDialog = true
      this.$refs.mobileUploadImageDialog.setupConnection()
    },
    closeGoToMobileUploadImageDialog() {
      // 關閉手機連線圖片上傳dialog
      this.goToMobileUploadImageDialog = false
      this.imageFile = null
      this.addImageDialog = false
    },
    addStampFromMobileRemoveBg(payload) {
      this.stampFile = payload
      this.goToMobileRemoveBgDialog = false
    },
    changeFile() {
      PDFViewerApplication.changePdfFile(this.selectedFile)
      this.$emit('notifyFileChanged', this.selectedFile, true)
    },
    changeFileByController(selectedFile) {
      this.selectedFile = selectedFile
      PDFViewerApplication.changePdfFile(selectedFile)
    },
    changeFileToNext() {
      if (this.selectedFile === this.fileList.length) {
        this.selectedFile = 1
      } else {
        this.selectedFile = this.selectedFile + 1
      }
      // show right drawer
      PDFViewerApplication.changePdfFile(this.selectedFile)
      this.$emit('notifyFileChanged', this.selectedFile)
      this.rightDrawer = true
      return this.selectedFile
    },
    changeFileToPrevious() {
      if (this.selectedFile === 1) {
        this.selectedFile = this.fileList.length
      } else {
        this.selectedFile = this.selectedFile - 1
      }
      // show right drawer
      PDFViewerApplication.changePdfFile(this.selectedFile)
      this.$emit('notifyFileChanged', this.selectedFile)
      this.rightDrawer = true
      return this.selectedFile
    },
    downloadFiles() {
      this.$emit('downloadResult')
    },
    async onImageFileChange(e) {
      const files = e.target.files || e.dataTransfer.files

      this.dragging = false
      if (!files.length) {
        return
      }

      if (files.length > 1) {
        this.$notifier.showMessage({
          message: this.$t('message.atMostOneFile'),
          color: 'red',
        })
        return
      }
      if (!files[0].type.match('image/(png|jpg|jpeg|gif|bmp)')) {
        this.$notifier.showMessage({
          message: this.$t('message.fileFmtNotSupported'),
          color: 'red',
        })
        return
      }
      let compressedFile = null
      if (files[0].size > 10000000) {
        this.$notifier.showMessage({
          message: this.$t('message.fileSizeExceed', { sizeLimit: '10 MB' }),
          color: 'red',
        })
        return
      } else if (files[0].size > 500000) {
        const compressRate = 0.5
        this.$nuxt.$loading.start()
        compressedFile = await compressBase64Image(
          await this.toBase64(files[0]),
          compressRate
        )
        this.$nuxt.$loading.finish()
      }

      this.$nuxt.$loading.start()
      this.imageFile = compressedFile ?? (await this.toBase64(files[0]))
      this.$nuxt.$loading.finish()

      e.target.value = ''
    },
    addImage(payload) {
      const file = payload.imageFile ?? this.imageFile
      if (file === null) {
        this.$notifier.showMessage({
          message: this.$t('message.noImg'),
          color: 'red',
        })
        return
      }
      if (this.mode !== 5) {
        PDFViewerApplication.addImage({
          page: this.annotateImage.page,
          base64: file,
          width: this.annotateImage.width,
          height: this.annotateImage.height,
          top: this.annotateImage.top,
          left: this.annotateImage.left,
          id: this.annotateImage.id,
          scale: this.annotateImage.scale,
        })
      } else {
        PDFViewerApplication.addDoneAnnotate({
          state: 9,
          data: { base64: file },
        })
      }
      this.cancelImage()
    },
    doImage(on, annotate = null) {
      this.annotateImage = on ? annotate : null
      this.imageFile = null
      this.addImageDialog = !!on
    },
    cancelImage() {
      this.imageFile = null
      this.addImageDialog = false
    },
    getAllowedDates(val) {
      if (this.selection && this.selection.type === 4) {
        switch (this.selection.dateRange) {
          case 'none':
            return val
          case 'signDay':
            return val === moment().format('YYYY-MM-DD')
          case 'beforeSignDay':
            return val < moment().format('YYYY-MM-DD')
          case 'afterSignDay':
            return val > moment().format('YYYY-MM-DD')
        }
      }
      return val
    },
    getIsLandscape() {
      let isLandscape = !!window.matchMedia('(orientation: landscape)').matches
      if (
        window.screen &&
        window.screen.orientation != null &&
        window.screen.orientation !== undefined
      ) {
        isLandscape = window.screen.orientation.type.startsWith('landscape')
      } else {
        isLandscape = window.innerWidth > window.innerHeight
      }
      return isLandscape
    },
    getLocation(location) {
      this.$emit('getLocation', location)
    },
    getScale(scale) {
      this.$emit('getScale', scale)
    },
    setScale(scale) {
      this.$emit('setScaleText', scale)
    },
    changeLocation(location) {
      PDFViewerApplication.changeLocation(location)
    },
    changeScale(scale) {
      PDFViewerApplication.changeScale(scale)
    },
    getScaleInfo(compareScale) {
      return PDFViewerApplication.getScaleInfo(compareScale)
    },
    changeAnnotate(fileSrcList, history) {
      PDFViewerApplication.changeAnnotate(
        fileSrcList,
        this.selectedFile,
        history
      )
    },
    onEnabledAudio(isEnabled) {
      this.$emit('onEnabledAudio', isEnabled)
    },
    onEnabledVideo(isEnabled) {
      this.$emit('onEnabledVideo', isEnabled)
    },
    setStreamSettingDialog() {
      this.$emit('setStreamSettingDialog')
    },
    onHangup() {
      this.$emit('onHangup')
    },
    notifyAnnotateChanged(history) {
      this.$emit('notifyAnnotateChanged', history)
    },
    setRightDrawer(rightDrawerInfo) {
      this.rightDrawerToggle = rightDrawerInfo.rightDrawerToggle
      this.rightDrawer = rightDrawerInfo.rightDrawer
    },
    initDoneAnnotate(state) {
      this.doneObjMode = 0
      switch (state) {
        case 1:
          this.doSignature(true)
          break
        case 2:
          this.doText()
          break
        case 4:
          this.doStamp(true)
          break
        case 5:
          this.doDate()
          break
        case 8:
          this.doAttachment()
          break
        case 9:
          this.doImage(true)
          break
      }
    },
    editDoneAnnotate(payload) {
      this.doneObjMode = 1
      this.doneObjPage = payload.page
      switch (payload.state) {
        case 1: // text
          this.doneText = payload.text
          this.doneTextStyle.fontSize = payload.fontSize
          this.doneTextStyle.fontFamily = payload.fontFamily
          this.doText()
          break
        case 4: // date
          this.doneDate = payload.doneDate
          this.doneDateStyle.fontSize = payload.fontSize
          this.doneDateStyle.fontFamily = payload.fontFamily
          this.doneDateStyle.dateEra = payload.dateEra
          this.doneDateStyle.dateFormat = payload.dateFormat
          this.doDate()
          break
      }
    },
    addText() {
      if (this.mode === 5) {
        if (this.doneObjMode === 1) {
          PDFViewerApplication.editDoneAnnotate({
            state: 1,
            data: {
              text: this.doneText,
              style: this.doneTextStyle,
            },
            page: this.doneObjPage,
          })
          this.doneObjMode = 0
        } else {
          PDFViewerApplication.addDoneAnnotate({
            state: 2,
            data: {
              text: this.doneText,
              style: this.doneTextStyle,
              width: document.getElementById('doneTextArea').offsetWidth,
            },
          })
        }
      }
      this.cancelText()
    },
    doText() {
      this.addTextDialog = true
      this.$nextTick(() => {
        const textArea = document.getElementById('doneTextArea')
        if (textArea) {
          textArea.style.setProperty(
            'font-size',
            this.doneTextStyle.fontSize + 'px'
          )
          textArea.style.setProperty('line-height', 'normal')
          textArea.style.setProperty(
            'font-family',
            this.doneTextStyle.fontFamily
          )
        }
      })
    },
    cancelText() {
      this.doneText = ''
      this.doneTextStyle = {
        fontSize: 16,
        fontFamily: 'Microsoft JhengHei',
      }
      const textArea = document.getElementById('doneTextArea')
      if (textArea) {
        textArea.style.setProperty(
          'font-size',
          this.doneTextStyle.fontSize + 'px'
        )
        textArea.style.setProperty('line-height', 'normal')
        textArea.style.setProperty('font-family', this.doneTextStyle.fontFamily)
      }
      this.addTextDialog = false
    },
    changeDoneTextStyle() {
      const textArea = document.getElementById('doneTextArea')
      if (textArea) {
        textArea.style.setProperty(
          'font-size',
          this.doneTextStyle.fontSize + 'px'
        )
        textArea.style.setProperty('line-height', 'normal')
        textArea.style.setProperty('font-family', this.doneTextStyle.fontFamily)
      }
    },
    addDate() {
      if (this.mode === 5) {
        if (this.doneObjMode === 1) {
          PDFViewerApplication.editDoneAnnotate({
            state: 4,
            data: {
              date: this.doneDate,
              text: this.formatDoneDate,
              style: this.doneDateStyle,
            },
            page: this.doneObjPage,
          })
          this.doneObjMode = 0
        } else {
          PDFViewerApplication.addDoneAnnotate({
            state: 5,
            data: {
              date: this.doneDate,
              text: this.formatDoneDate,
              style: this.doneDateStyle,
              width: document.getElementById('doneDateTextField').offsetWidth,
            },
          })
        }
        this.cancelDate()
      }
    },
    doDate() {
      this.addDateDialog = true
    },
    cancelDate() {
      this.addDateDialog = false
      if (this.mode === 5) return
      this.doneDate = ''
      this.doneDateStyle = {
        fontSize: 16,
        fontFamily: 'Microsoft JhengHei',
        dateEra: 'common',
        dateFormat: 'YYYY/MM/DD',
      }
    },
    hideB2b2c() {
      if (this.mode !== 0 || this.peopleNames.length <= 0 || !this.useB2b2c) {
        return true
      }
      if (this.peopleNames[0].placeholder) {
        if (
          this.peopleNames.some(
            (x) =>
              x.placeholder &&
              (x.placeholder.face === true ||
                (x.placeholder.signMode &&
                  x.placeholder.signMode !== 'NORMAL_SIGN') ||
                (x.placeholder.sendMethod &&
                  x.placeholder.sendMethod !== 'EMAIL'))
          )
        ) {
          return true
        }
      } else if (
        this.peopleNames.some(
          (x) =>
            x.face === true ||
            (x.signMode && x.signMode !== 'NORMAL_SIGN') ||
            (x.sendMethod && x.sendMethod !== 'EMAIL') ||
            !x.email
        )
      ) {
        return true
      }
      return false
    },
    switchB2b2cSetting() {
      // desktop介面切到雲端憑證的tab
      this.toolSet = 1

      // mobile介面切到最後面雲端憑證的按鈕
      this.activeMobileButton = 12
      const b2b2cType = [9, 10, 11, 12]

      // 切換到沒有設定雲端憑證欄位的簽署人
      const b2b2cCheckList = Array.from(
        new Set(
          this.fileList.flatMap((file) =>
            file.annotate.flatMap((a) =>
              a.data.filter((d) => b2b2cType.includes(d.type)).map((d) => d.id)
            )
          )
        )
      )

      if (b2b2cCheckList.length > 0) {
        const result = this.peopleNames.find(
          (p) => !b2b2cCheckList.includes(p.id)
        )
        if (result) this.selectId = result.id
      }
    },
    showSidebar() {
      const forceOpen = !(screen.width < 1024)
      PDFViewerApplication.pdfSidebar.switchView(2, forceOpen)
    },
    hideSidebar() {
      PDFViewerApplication.pdfSidebar.switchView(1, false)
    },
    scrollToBottom() {
      const viewerContainer = document.getElementById('viewerContainer')
      viewerContainer.scrollTop = viewerContainer.scrollHeight
    },
    scrollToTop() {
      const viewerContainer = document.getElementById('viewerContainer')
      viewerContainer.scrollTop = 0
    },
    checkAttachmentContentType(anno, types) {
      if (anno.file) {
        const ext = anno.file.filename.split('.').pop().toLowerCase()
        if (types.includes(ext)) {
          return true
        }
      }
      return false
    },
    getAttachmentImage(anno) {
      if (anno.file && anno.file.content) {
        const uint8Array = new Uint8Array(anno.file.content)
        let binaryString = ''

        // Process in chunks to avoid stack overflow
        const chunkSize = 8192 // 8KB chunks
        for (let i = 0; i < uint8Array.length; i += chunkSize) {
          const chunk = uint8Array.slice(i, i + chunkSize)
          binaryString += String.fromCharCode(...chunk)
        }

        const base64String = btoa(binaryString)
        // jpeg, jpg, png
        const fileExtension = anno.file.filename.split('.').pop().toLowerCase()
        return `data:image/${fileExtension};base64,${base64String}`
      }
      return ''
    },
    showTextAttachmentContent(anno) {
      const content = anno.file.content
      if (!content) return ''

      try {
        // If content is already a string, return it directly
        if (typeof content === 'string') {
          return content
        }

        // If it's an ArrayBuffer or similar, convert it to string
        const decoder = new TextDecoder('utf-8')
        return decoder.decode(new Uint8Array(content))
      } catch (error) {
        console.error('Error decoding text content:', error)
        return 'Error: Could not display file content'
      }
    },
    openPreviewAttachment(anno) {
      this.previewAttachment = anno
      this.previewAttachmentDialog = true
    },
    cancelPreviewAttachment() {
      this.previewAttachment = null
      this.previewAttachmentDialog = false
    },
    getAttachmentFilename(anno) {
      if (anno && anno.file) {
        return anno.file.filename
      }
      return ''
    },
    downloadAttachment(anno) {
      const content = anno.file.content
      if (!content) return

      const blob = new Blob([content], { type: 'application/octet-stream' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = anno.file.filename
      a.click()
      URL.revokeObjectURL(url)
    },
  },
}
</script>
