<template>
  <div class="taskContainer">
    <v-app-bar
      :clipped-left="true"
      color="primary"
      dark
      fixed
      flat
      :extended="mdAndDown"
      height="50"
    >
      <div v-if="model.taskName" class="d-flex align-center">
        <img
          v-if="isB2b2c"
          width="20"
          height="20"
          src="/images/tasks/taskCloud.svg"
        />
        <img
          v-else
          width="20"
          height="20"
          src="/images/tasks/taskStandard.svg"
        />
        <div class="ml-2 taskName" style="font-size: 13px">
          {{ model.taskName }}
        </div>
      </div>
      <template v-if="!mdAndDown">
        <v-stepper
          v-model="step"
          class="align-center justify-center text-center elevation-0"
          style="
            position: absolute;
            left: 28%;
            right: 28%;
            background: transparent !important;
          "
        >
          <v-stepper-header>
            <v-stepper-step step="1">
              {{ getTitle(1) }}
            </v-stepper-step>

            <v-divider></v-divider>

            <v-stepper-step step="2">
              {{ getTitle(2) }}
            </v-stepper-step>

            <v-divider></v-divider>

            <v-stepper-step step="3">
              {{ getTitle(3) }}
            </v-stepper-step>

            <v-divider></v-divider>
          </v-stepper-header>
        </v-stepper>
      </template>
      <template v-if="mdAndDown" v-slot:extension>
        <v-row no-gutters justify="center" align="center">
          <v-col cols="2">
            <v-btn
              v-if="step !== 1"
              block
              depressed
              text
              color="white"
              @click="step--"
            >
              {{ $t('button.previous') }}
            </v-btn>
          </v-col>
          <v-col cols="8">
            <div class="text-center text-subtitle-1" style="width: 100%">
              {{
                $t('heading.stepTitle', {
                  step,
                  totalStep,
                  stepTitle: getTitle(step),
                })
              }}
            </div>
          </v-col>
          <v-col cols="2">
            <v-btn
              v-if="step === 1"
              class="tour-create-task-3"
              block
              depressed
              text
              color="white"
              :disabled="!fileReady"
              @click="finishPersonPrepare()"
            >
              {{ $t('button.next') }}
            </v-btn>
            <v-btn
              v-if="step === 2"
              block
              depressed
              text
              color="white"
              @click="checkAnnotate"
            >
              {{ $t('button.next') }}
            </v-btn>
            <div
              v-if="step === 3"
              class="d-flex flex-row align-center justify-center"
            >
              <v-btn small outlined @click="startPdfTask()">
                {{ $t('button.send') }}
              </v-btn>
              <v-menu offset-y bottom max-width="150px">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn class="ml-1" icon small v-bind="attrs" v-on="on">
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>
                <v-list dense>
                  <v-list-item dense>
                    <v-list-item-title>
                      <v-btn depressed text @click="previewPdfDialog = true">
                        {{ $t('button.preview') }}
                      </v-btn>
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </v-col>
        </v-row>
      </template>
      <v-spacer></v-spacer>
      <v-btn outlined dark small class="mr-md-2 mr-n2" @click="leaveCreateTask">
        {{ $t('button.giveUp') }}
      </v-btn>
    </v-app-bar>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'empty',
})
import { useDisplay } from 'vuetify'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import '@/assets/onboarding.css'
import { validateTaiwanIdCard } from '~/composables/taiwanIdCardValidation'

const { t, locale, locales, setLocale } = useI18n()
const { mdAndDown } = useDisplay()

const userInfo = ref(null)
const step = ref(1)
const totalStep = ref(4)
const isEditTaskName = ref(false)
const fileSrcList = ref([])
const annotateForPerson = ref([])
const dragging = ref(false)
const warningDialog = ref(false)
const deletePeopleDialog = ref(false)
const notFinishList = ref([])
const numPages = ref(undefined)
const mode = ref(0)
const singDone = ref(false)
const resultId = ref('')
const userId = ref(1)
const colorList = ref(this.$colors.getColorList())
const loaded = ref(false)
const pdfTaskDialog = ref(false)
const contactCompanyOnly = ref(false)
const contactDialog = ref(false)
const contactFromGoogleDialog = ref(false)
const previewPdfDialog = ref(false)
const drag = ref(false)
const editIndex = ref(null)
const editType = ref(null)
const editSource = ref(null)
const model = ref({
  taskName: '',
  taskPerson: [
    {
      id: 1,
      email: '',
      name: '',
      phone: '',
      setNewHost: false,
      hostName: '',
      hostEmail: '',
      culture: locale.value,
      signRole: 'SIGNER',
      signMode: 'NORMAL_SIGN',
      isAuditor: false,
      isNeedOtp: false,
      face: false,
      needVideo: false,
      sendMethod: 'EMAIL',
      collaborateSignDate: '',
      noSMS: false,
    },
  ],
  ccPerson: [],
  account: '',
  notUseOnce: false,
  isOverlay: true,
  isNotParallel: true,
  isFinalAatl: false,
  isNeedOtp: false,
  otpTimingType: 'READ',
  otpMethodType: 'EMAIL',
  keepFindAnnotation: null,
  keepFindAnnotationPersonId: null,
  setExpiredDate: false,
  expiredDate: null,
  emailSubject: '',
  emailMessage: '',
  siBlockChain: false,
})
const startTaskId = ref('')
const startTaskPhone = ref(null)
const startTaskNowDialog = ref(false)
const findAnnotationDialog = ref(false)
const changeAuditorDialog = ref(false)
const signSettingDialog = ref(false)
const changeRoleId = ref('')
const isFindAnnotation = ref(false)
const firstKeepFindAnnotation = ref(true)
const maxSignaturePerPdf = ref(8)
const from = ref(null)
const fileId = ref(null)
const creditRules = ref([])
const watermark = ref(null)
const collaborateNotSetDialog = ref(false)
const confirmSmsSubjectLength = ref(false)
const checkSmsSubjectLengthDialog = ref(false)
const pointPerSms = ref(1)
const startTime = ref(null)
const successStarted = ref(false)
const ctEvent = ref({
  TaskName: '',
  DurationSecs: 0,
  SignatoryCount: 0,
  Template: '',
  LeaveOn: '',
})
const isEditing = ref(false)
const isB2b2c = ref(false)
const dialogB2b2cNotSet = ref(false)
const dialogLeaveTour = ref(false)
const dialogSignerGroupApply = ref(false)
const confirmLeaveTour = ref(false)
const tourLeaveProgress = ref(-1)
const driverObj = ref(null)
const leaveTo = ref(null)
const tourSteps = ref({
  1: [
    {
      popover: {
        title: '',
        description: '',
        side: 'bottom',
      },
    },
    {
      element: '.tour-create-task-0',
      popover: {
        title: t('heading.tourCreateTask0'),
        description: t('text.tourCreateTask0Descr'),
        side: 'bottom',
      },
    },
    {
      element: '.tour-create-task-1',
      popover: {
        title: t('heading.tourCreateTask1'),
        description: t('text.tourCreateTask1Descr'),
        side: 'bottom',
        onNextClick: tourNextFillSigner,
      },
    },
    {
      element: '.tour-create-task-2',
      popover: {
        title: t('heading.tourCreateTask2'),
        description: t('text.tourCreateTask2Descr'),
        side: 'top',
      },
    },
    {
      element: '.tour-create-task-3',
      popover: {
        title: t('heading.tourCreateTask3'),
        description: t('text.tourCreateTask3Descr'),
        showButtons: ['next'],
        onNextClick: showConfirmLeaveTour,
      },
    },
  ],
  2: [
    {
      popover: {
        title: '',
        description: '',
        side: 'bottom',
      },
    },
    {
      element: '.tour-create-task-4',
      popover: {
        title: t('heading.tourCreateTask4'),
        description: t('text.tourCreateTask4Descr'),
        onNextClick: tourNextChangeTextSize,
      },
    },
    {
      element: '.tour-create-task-5',
      popover: {
        title: t('heading.tourCreateTask5'),
        description: t('text.tourCreateTask5Descr'),
        onNextClick: tourNextHideSidebar,
      },
    },
    {
      element: '.tour-create-task-8',
      popover: {
        title: t('heading.tourCreateTask8'),
        description: t('text.tourCreateTask8Descr'),
      },
    },
    {
      element: '.tour-create-task-10',
      popover: {
        title: t('heading.tourCreateTask10'),
        description: t('text.tourCreateTask10Descr'),
        showButtons: ['next'],
        onNextClick: showConfirmLeaveTour,
      },
    },
  ],
  3: [
    {
      popover: {
        title: '',
        description: '',
        side: 'bottom',
      },
    },
    {
      element: '.tour-create-task-11',
      popover: {
        title: t('heading.tourCreateTask11'),
        description: t('text.tourCreateTask11Descr'),
        showButtons: ['next'],
        onNextClick: showConfirmLeaveTour,
      },
    },
  ],
})
const dialogTourNotFinish = ref(false)
const showLinkDialog = ref(false)
const shareLink = ref('')
</script>

<style lang="scss" scoped>
::v-deep .v-stepper__step > span {
  background-color: #009138 !important;
  color: white;
  border: 1px solid white;
}

::v-deep .v-stepper__step--active > span {
  background-color: white !important;
  color: #009138 !important;
}

.v-stepper__header .v-divider {
  width: 100px;
}

.grey-zone {
  background-color: #f7f7f7;
}

.pdf-icon-area {
  position: absolute;
  top: 0px;
  left: 0px;
  background-color: #00653e;
  width: 60px;
  height: 100%;
  border-radius: 4px 0 0 4px;
}

.taskContainer {
  width: 100%;
  height: 100%;
  align-items: center;
  padding-top: 50px;
}

::v-deep .v-stepper__step__step {
  width: 15px !important;
  min-width: 15px !important;
  height: 15px;
}

::v-deep .v-stepper__step {
  font-size: 13px;
}

@media screen and (max-width: 1264px) {
  .taskContainer {
    padding-top: 112px;
  }
}

@media screen and (max-width: 960px) {
  .taskContainer {
    padding-top: 104px;
  }
}

.handle {
  cursor: grab;
}

.splitButton {
  display: flex;
  flex-direction: row;
}
.mainButton {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
.actionsButton {
  border-left: 0px !important;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  padding: 0 !important;
  min-width: 35px !important;
  margin-left: -3.5px;
  padding-left: 10px !important;
}
.pdfViewer {
  height: calc(100% - 73px);
}
.pdfViewer-sm {
  height: 100%;
}
.taskName {
  max-width: 300px;
  font-size: 13px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.annotationPeopleTitle {
  margin: 0 2rem;
  color: rgba(0, 0, 0, 0.6);
}

.annotationPeopleSelect {
  max-width: 300px !important;
  border: 1px solid #dfe1e6;
  overflow: hidden;
  margin: 1rem 2rem;
}

.annotationPeopleSelect.v-input--is-disabled {
  border: 1px solid #e7e9ee;
}

::v-deep .v-input__slot > .v-input__append-inner {
  margin-top: 2px !important;
}

.chip-label {
  flex: 0 0 55px;
  font-size: calc(15 / 16 * 1rem);
  font-weight: normal;
}

.confirm-file-name {
  font-size: calc(14 / 16 * 1rem);
  font-weight: bold;
}

.chip-label > span {
  display: inline-block;
  margin-top: 3px;
}

.confirm-otp-block {
  flex: 0 0 200px;
}

.chip-name-wrap {
  overflow: hidden;
  text-overflow: ellipsis;
}

.chip-text-mobile {
  max-width: 250px;
}

.chip-text-desktop {
  max-width: 360px;
}

.sign-setting-title {
  background-color: #f8fafa;
  padding: 20px 40px !important;
}

.sign-setting-heading {
  font-size: calc(14 / 16 * 1rem);
  font-weight: bold;
  color: black;
}

.text--button {
  cursor: pointer;
  color: #00653e;
  padding: 2px 4px;
}

div.qrcode {
  margin-top: 15px;
  display: grid;
  grid-template-columns: 50% auto 50%;
  justify-content: space-around;
  align-items: center;
}

div.qrcode > div.qrcode-spacing {
  flex: 1 1;
  justify-self: center;
}

.dialog-header {
  font-size: 20px;
  font-weight: 700;
  border-bottom: 1px solid #009138;
}

::v-deep .hide-scrollbar textarea {
  overflow-y: hidden;
}
</style>
