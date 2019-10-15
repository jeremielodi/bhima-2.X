angular.module('bhima.controllers')
  .controller('dataKitController', DataKitConfigController);

DataKitConfigController.$inject = [
  '$sce', 'NotifyService', 'BaseReportService', 'AppCache', 'reportData', '$state', 'SurveyFormService',
  'ChoicesListManagementService',
];


function DataKitConfigController($sce, Notify, SavedReports, AppCache, reportData, $state, SurveyForm,
  ChoicesList) {
  const vm = this;
  const cache = new AppCache('data_kit');
  const reportUrl = '/data_kit/report';
  vm.reportDetails = {};
  vm.reportDetails.searchDateFrom = {};
  vm.reportDetails.searchDateTo = {};
  vm.reportDetails.multipleChoice = {};
  vm.reportDetails.loggedChanges = {};
  vm.onSelectList = onSelectList;
  vm.onSelectMultiple = onSelectMultiple;
  vm.onClear = onClear;

  vm.previewGenerated = false;
  vm.onSelectSurveyForm = onSelectSurveyForm;
  checkCachedConfiguration();

  function onSelectSurveyForm(collector) {
    vm.reportDetails = {};
    vm.reportDetails.searchDateFrom = {};
    vm.reportDetails.searchDateTo = {};
    vm.reportDetails.multipleChoice = {};
    vm.reportDetails.loggedChanges = {};

    vm.reportDetails.data_collector_id = collector.id;
    delete cache.reportDetails;

    SurveyForm.read(null, { data_collector_management_id : collector.id })
      .then(surveyElements => {
        vm.formItems = surveyElements;
        return ChoicesList.read();
      })
      .then(choicesLists => {
        vm.choicesLists = choicesLists;
      })
      .catch(Notify.handleError);
  }

  function onSelectList(list, value) {
    vm.reportDetails[value] = list.id;
    vm.reportDetails.loggedChanges[value] = list.label;
  }

  function onSelectMultiple(lists, value) {
    vm.reportDetails.multipleChoice[value] = lists;
  }

  function onClear(value) {
    delete vm.reportDetails[value];
    delete vm.reportDetails.loggedChanges[value];
  }

  vm.preview = function preview(form) {
    if (form.$invalid) { return; }
    cache.reportDetails = angular.copy(vm.reportDetails);

    if (vm.reportDetails.multipleChoice) {
      const multipleChoiceLength = Object.keys(vm.reportDetails.multipleChoice).length;

      if (multipleChoiceLength) {
        Object.keys(vm.reportDetails.multipleChoice).forEach((key) => {
          if (vm.reportDetails.multipleChoice[key].length) {
            for (let i = 0; i < vm.reportDetails.multipleChoice[key].length; i++) {
              vm.choicesLists.forEach(list => {
                if (list.id === vm.reportDetails.multipleChoice[key][i]) {
                  vm.reportDetails.multipleChoice[key][i] = list.label;
                }
              });
            }
          } else {
            delete vm.reportDetails.multipleChoice[key];
          }
        });
      }
    }

    SavedReports.requestPreview(reportUrl, reportData.id, angular.copy(vm.reportDetails))
      .then((result) => {
        vm.previewGenerated = true;
        vm.previewResult = $sce.trustAsHtml(result);
      })
      .catch(Notify.handleError);
  };

  vm.clearPreview = function clearPreview() {
    vm.previewGenerated = false;
    vm.previewResult = null;
  };

  vm.requestSaveAs = function requestSaveAs() {

    const options = {
      url : reportUrl,
      report : reportData,
      reportOptions : angular.copy(vm.reportDetails),
    };

    return SavedReports.saveAsModal(options)
      .then(() => {
        $state.go('reportsBase.reportsArchive', { key : options.report.report_key });
      })
      .catch(Notify.handleError);
  };

  function checkCachedConfiguration() {
    if (cache.reportDetails) {
      vm.reportDetails = angular.copy(cache.reportDetails);

      if (vm.reportDetails.data_collector_id) {
        SurveyForm.read(null, { data_collector_management_id : vm.reportDetails.data_collector_id })
          .then(surveyElements => {
            vm.formItems = surveyElements;
            return ChoicesList.read();
          })
          .then(choicesLists => {
            vm.choicesLists = choicesLists;
          })
          .catch(Notify.handleError);
      }
    }
    vm.reportDetails.type = 1;
  }
}
